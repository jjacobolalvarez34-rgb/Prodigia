"use client";

import { useEffect, useRef, useState } from "react";
import { generarPreguntaAnatomia, type ModoAnatomia, type PreguntaAnatomia } from "@/lib/practica/anatomia";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import { COLOR_ANATOMIA } from "./colores";

const TOTAL_PREGUNTAS = 10;
const DURACION_MS = 60_000;
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

interface Props {
  modo: ModoAnatomia;
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  // Modo demo (landing pública, Fase 2): ver mismo prop en SprintRunner.tsx.
  totalPreguntas?: number;
  duracionMs?: number;
  onFinish: (errores: PreguntaAnatomia[]) => void;
}

export default function AnatomiaSprintRunner({
  modo,
  startedAt,
  nivelInicial,
  escudosExtra,
  totalPreguntas = TOTAL_PREGUNTAS,
  duracionMs = DURACION_MS,
  onFinish,
}: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const [pregunta, setPregunta] = useState<PreguntaAnatomia | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [xpSprint, setXpSprint] = useState(0);
  const [respondidos, setRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(duracionMs);
  const [nivel, setNivel] = useState(nivelInicial);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [racha, setRacha] = useState(0);

  const { duracionTotalMs, bonusTiempo, bonusAcumuladoRef, evaluarBonus, limpiarBonus } = useBonusTiempo(duracionMs);

  const nivelRef = useRef(nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<PreguntaAnatomia[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    const p = generarPreguntaAnatomia(modo, nivelRef.current, usadosRef.current);
    usadosRef.current.add(p.clave);
    setPregunta(p);
    setCardKey((k) => k + 1);
    setSeleccion(null);
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
      const restante = Math.max(0, duracionMs + bonusAcumuladoRef.current - (performance.now() - startedAt));
      setRemainingMs(restante);
      if (restante <= 0) {
        clearInterval(interval);
        terminar();
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, duracionMs]);

  async function handleElegir(opcion: string) {
    if (submittingRef.current || !pregunta || respondido) return;
    submittingRef.current = true;
    setSeleccion(opcion);
    setRespondido(true);

    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === pregunta.respuesta;
    reproducirTono(correct ? "correcto" : "error");

    if (correct) {
      evaluarBonus(nivelRef.current, timeMs);
    }

    let protegido = false;
    if (!correct) {
      erroresRef.current.push(pregunta);
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
          problem_type: `anatomia_${modo}`,
          level: nivelRef.current,
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
      if (data.skillLevel) {
        nivelSubio = data.skillLevel.nivel > nivelRef.current;
        nivelRef.current = data.skillLevel.nivel;
        setNivel(data.skillLevel.nivel);
        setRacha(data.skillLevel.racha_actual);
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
      if (sig >= totalPreguntas) terminar();
      else siguiente();
    }, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  if (!pregunta) return null;
  const segundos = Math.ceil(remainingMs / 1000);
  const feedback: "idle" | "correcto" | "incorrecto" = !respondido ? "idle" : seleccion === pregunta.respuesta ? "correcto" : "incorrecto";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={72} colorHex={COLOR_ANATOMIA} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: totalPreguntas }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i < respondidos ? COLOR_ANATOMIA : "var(--foreground)", opacity: i < respondidos ? 1 : 0.15 }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} colorActivo={COLOR_ANATOMIA} />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">{xpSprint} Exp</span>
            <span className="font-mono font-medium">{segundos}s</span>
          </div>
        </div>

        <BarraTiempo remainingMs={remainingMs} duracionTotalMs={duracionTotalMs} bonusTiempo={bonusTiempo} cardKey={cardKey} />
      </div>

      <TarjetaSprint
        cardKey={cardKey}
        feedback={feedback}
        puntaje={puntaje}
        miRespuesta={seleccion ?? ""}
        respuestaCorrecta={pregunta.respuesta}
        padding="px-6 py-10"
      >
        <p className="text-center font-display text-lg font-bold text-foreground">{pregunta.enunciado}</p>
        <div className="grid w-full max-w-sm grid-cols-2 gap-2">
          {pregunta.opciones.map((op) => {
            const esElegida = seleccion === op;
            const esCorrecta = respondido && op === pregunta.respuesta;
            return (
              <button
                key={op}
                onClick={() => handleElegir(op)}
                disabled={respondido}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-100 ${
                  esCorrecta
                    ? "border-correcto bg-correcto/10 text-correcto"
                    : esElegida
                      ? "border-error bg-error/10 text-error"
                      : "border-border bg-background text-foreground"
                }`}
              >
                {op}
              </button>
            );
          })}
        </div>
      </TarjetaSprint>
    </div>
  );
}
