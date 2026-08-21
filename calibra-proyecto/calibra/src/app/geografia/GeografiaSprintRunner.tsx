"use client";

import { useEffect, useRef, useState } from "react";
import { elegirPaisAleatorio, PAISES_POR_CONTINENTE, type Continente, type PaisAmerica } from "@/lib/practica/geografia";
import {
  elegirPreguntaAvanzada,
  NIVEL_MINIMO_AVANZADO,
  PROBABILIDAD_AVANZADO,
  type PreguntaAvanzada,
} from "@/lib/practica/geografiaAvanzada";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import { useProgresoEnVivo } from "@/lib/duelos/useProgresoEnVivo";
import ProgresoRivalEnVivo from "@/components/duelos/ProgresoRivalEnVivo";
import GeografiaMapa, { COLOR_GEOGRAFIA } from "./GeografiaMapa";

// Extraído a un helper de módulo (mismo criterio que elegirPaisAleatorio/
// elegirPreguntaAvanzada, ninguno de los dos vive dentro del componente)
// — mantiene el cuerpo de siguiente() más simple.
function elegirSiguientePais(
  continente: Continente,
  paises: PaisAmerica[],
  nivel: number,
  usados: Set<string>
): PaisAmerica | PreguntaAvanzada | null {
  if (nivel >= NIVEL_MINIMO_AVANZADO && Math.random() < PROBABILIDAD_AVANZADO) {
    return elegirPreguntaAvanzada(continente, usados);
  }
  return elegirPaisAleatorio(paises, nivel, usados);
}

function esPreguntaAvanzada(p: PaisAmerica | PreguntaAvanzada): p is PreguntaAvanzada {
  return "pregunta" in p;
}

const TOTAL_PREGUNTAS = 10;
const DURACION_MS = 60_000;
// Mismo ritmo que el resto de los mundos (Fase VV): nada de feedback
// viejo en ningún modo de práctica.
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

interface Props {
  continente: Continente;
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  // Fase 6: progreso del rival en vivo — Geografía no tiene fantasma
  // (ver GeografiaPracticaClient.tsx, decisión de alcance), así que acá
  // es la única señal del rival durante la partida.
  duelId?: string | null;
  miUserId?: string | null;
  rivalNombre?: string | null;
  onFinish: (errores: (PaisAmerica | PreguntaAvanzada)[]) => void;
}

export default function GeografiaSprintRunner({
  continente,
  startedAt,
  nivelInicial,
  escudosExtra,
  duelId,
  miUserId,
  rivalNombre,
  onFinish,
}: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const paises = PAISES_POR_CONTINENTE[continente];
  const { rival: rivalEnVivo, emitirProgreso } = useProgresoEnVivo({ duelId, miUserId });
  const correctosRef = useRef(0);
  const [pais, setPais] = useState<PaisAmerica | PreguntaAvanzada | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [xpSprint, setXpSprint] = useState(0);
  const [respondidos, setRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(DURACION_MS);
  const [nivel, setNivel] = useState(nivelInicial);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [racha, setRacha] = useState(0);

  const { duracionTotalMs, bonusTiempo, bonusAcumuladoRef, evaluarBonus, limpiarBonus } = useBonusTiempo(DURACION_MS);

  const nivelRef = useRef(nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<(PaisAmerica | PreguntaAvanzada)[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    // Sección 4: calibración alta (8-10) mezcla, con probabilidad,
    // ciudades/ríos/puntos de referencia reales (texto, ver
    // geografiaAvanzada.ts) junto al mapa de países de siempre — en
    // niveles bajos esto nunca se sortea, sigue siendo solo el mapa.
    const p = elegirSiguientePais(continente, paises, nivelRef.current, usadosRef.current);
    if (p) usadosRef.current.add(p.id);
    setPais(p);
    setCardKey((k) => k + 1);
    setSeleccionId(null);
    setRespondido(false);
    setPuntaje(null);
    limpiarBonus();
    shownAtRef.current = performance.now();
  }

  useEffect(() => {
    siguiente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function terminar() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(erroresRef.current);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const restante = Math.max(
        0,
        DURACION_MS + bonusAcumuladoRef.current - (performance.now() - startedAt)
      );
      setRemainingMs(restante);
      if (restante <= 0) {
        clearInterval(interval);
        terminar();
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  async function handleClickPais(id: string) {
    if (submittingRef.current || !pais || respondido) return;
    submittingRef.current = true;
    setSeleccionId(id);
    setRespondido(true);

    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = id === pais.id;
    reproducirTono(correct ? "correcto" : "error");

    if (correct) {
      evaluarBonus(pais.dificultad, timeMs);
    }

    let protegido = false;
    if (!correct) {
      erroresRef.current.push(pais);
      if (escudosRef.current > 0) {
        protegido = true;
        escudosRef.current -= 1;
        setEscudos(escudosRef.current);
      }
    }

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_type: "geografia",
          level: pais.dificultad,
          correct,
          time_ms: timeMs,
          protegido,
        }),
      });
      const data = await res.json();
      let xpGanado = 0;
      let nivelSubio = false;
      if (typeof data.xp === "number" && data.xp > 0) {
        xpGanado = data.xp;
        setXpSprint((prev) => prev + data.xp);
      }
      if (correct) correctosRef.current += 1;
      if (data.skillLevel) {
        nivelSubio = data.skillLevel.nivel > nivelRef.current;
        nivelRef.current = data.skillLevel.nivel;
        setNivel(data.skillLevel.nivel);
        setRacha(data.skillLevel.racha_actual);
        emitirProgreso({ respondidos: respondidos + 1, correctos: correctosRef.current, racha: data.skillLevel.racha_actual });
      }
      if (correct && xpGanado > 0) {
        setPuntaje({ total: xpGanado, intensidad: nivelSubio ? "grande" : xpGanado >= 20 ? "medio" : "chico" });
      }
    } catch {
      // Si falla el guardado, la partida sigue igual.
    }

    setTimeout(() => {
      submittingRef.current = false;
      const sig = respondidos + 1;
      setRespondidos(sig);
      if (finishedRef.current) return;
      if (sig >= TOTAL_PREGUNTAS) terminar();
      else siguiente();
    }, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  // Referencia estable (no una arrow function nueva por opción dentro
  // del .map()) — con una arrow inline ahí, el compilador de React
  // marca en falso el performance.now() de handleClickPais como
  // "impuro durante el render" (mismo handleClickPais que ya se pasa
  // sin problema como referencia pelada a GeografiaMapa más abajo).
  function handleClickOpcion(e: React.MouseEvent<HTMLButtonElement>) {
    const id = e.currentTarget.dataset.id;
    if (id) handleClickPais(id);
  }

  if (!pais) return null;
  const esAvanzada = esPreguntaAvanzada(pais);
  const segundos = Math.ceil(remainingMs / 1000);
  const feedback: "idle" | "correcto" | "incorrecto" = !respondido ? "idle" : seleccionId === pais.id ? "correcto" : "incorrecto";
  const miRespuesta = esAvanzada
    ? (pais.opciones.find((o) => o.id === seleccionId)?.texto ?? "")
    : (paises.find((p) => p.id === seleccionId)?.nombre ?? "");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={72} colorHex={COLOR_GEOGRAFIA} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_PREGUNTAS }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i < respondidos ? "" : "bg-foreground/15"}`}
                style={i < respondidos ? { background: COLOR_GEOGRAFIA } : undefined}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} colorActivo={COLOR_GEOGRAFIA} />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">{xpSprint} Exp</span>
            <span className="font-mono font-medium">{segundos}s</span>
          </div>
        </div>

        {rivalEnVivo && rivalNombre && (
          <ProgresoRivalEnVivo
            total={TOTAL_PREGUNTAS}
            miRespondidos={respondidos}
            rivalRespondidos={rivalEnVivo.respondidos}
            rivalRacha={rivalEnVivo.racha}
            rivalNombre={rivalNombre}
            colorHex={COLOR_GEOGRAFIA}
          />
        )}

        <BarraTiempo remainingMs={remainingMs} duracionTotalMs={duracionTotalMs} bonusTiempo={bonusTiempo} cardKey={cardKey} />
      </div>

      <TarjetaSprint
        cardKey={cardKey}
        feedback={feedback}
        puntaje={puntaje}
        miRespuesta={miRespuesta}
        respuestaCorrecta={pais.nombre}
        padding="px-4 py-5"
        minHeight={460}
      >
        {esAvanzada ? (
          <>
            <p className="text-center font-display text-lg font-bold text-foreground">{pais.pregunta}</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {pais.opciones.map((o) => {
                const esCorrecta = respondido && o.id === pais.id;
                const esIncorrectaElegida = respondido && seleccionId === o.id && o.id !== pais.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={respondido}
                    data-id={o.id}
                    onClick={handleClickOpcion}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                      esCorrecta
                        ? "border-correcto bg-correcto/10 text-correcto"
                        : esIncorrectaElegida
                          ? "border-error bg-error/10 text-error"
                          : "border-border text-foreground"
                    }`}
                  >
                    {o.texto}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-center font-display text-lg font-bold text-foreground">
              ¿Dónde está <span style={{ color: COLOR_GEOGRAFIA }}>{pais.nombre}</span>?
            </p>
            <GeografiaMapa
              continente={continente}
              objetivoId={pais.id}
              seleccionId={seleccionId}
              respondido={respondido}
              onClickPais={handleClickPais}
            />
          </>
        )}
        {respondido && seleccionId === pais.id && (
          <p className="text-center text-sm font-medium text-texto-secundario">¡Correcto!</p>
        )}
      </TarjetaSprint>
    </div>
  );
}
