"use client";

import { useEffect, useRef, useState } from "react";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";

const TOTAL_PROBLEMAS = 10;
const DURACION_MS = 60_000;
// Fase de auditoría GRUPO 2: mismo ritmo que el resto de los runners
// (Fase VV) — antes este motor tenía su propio timing (700/1400) y
// ningún componente del sistema de feedback compartido.
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

export interface ProblemaGenerico {
  enunciado: string;
  respuesta: number;
  tolerancia: number;
}

interface Props<T extends ProblemaGenerico> {
  generar: (nivel: number) => T;
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  colorDial?: string;
  apiPath: string; // /api/attempts, con problem_type fijo abajo
  problemType: string;
  onFinish: (errores: T[]) => void;
}

// Motor genérico compartido por Decimales, Potencias y Álgebra — mismo
// patrón de partida que Fracciones/Enigmia/Geografía (escudos, sonido,
// racha de tiempo, tarjeta compartida, PuntajeCorner, racha de fuego)
// para problemas de "un enunciado, una respuesta numérica" en vez de
// tener que armar una UI particular para cada tipo de pregunta.
export default function EnunciadoSprintRunner<T extends ProblemaGenerico>({
  generar,
  startedAt,
  nivelInicial,
  escudosExtra,
  colorDial,
  apiPath,
  problemType,
  onFinish,
}: Props<T>) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const [problema, setProblema] = useState<T | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [miRespuesta, setMiRespuesta] = useState("");
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
  const erroresRef = useRef<T[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    // El enunciado ya es texto único por combinación de números al azar
    // (Decimales/Potencias/Álgebra) — sirve como clave canónica sin
    // necesitar una función de clave por tipo.
    setProblema(generarSinRepetir(() => generar(nivelRef.current), (p) => p.enunciado, usadosRef.current));
    setCardKey((k) => k + 1);
    setRespuesta("");
    setFeedback("idle");
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
      const restante = Math.max(0, DURACION_MS + bonusAcumuladoRef.current - (performance.now() - startedAt));
      setRemainingMs(restante);
      if (restante <= 0) {
        clearInterval(interval);
        terminar();
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !problema || respuesta === "") return;
    submittingRef.current = true;

    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = Math.abs(Number(respuesta) - problema.respuesta) <= problema.tolerancia + 1e-9;
    setFeedback(correct ? "correcto" : "incorrecto");
    if (!correct) {
      setMiRespuesta(respuesta);
    }
    reproducirTono(correct ? "correcto" : "error");

    if (correct) {
      evaluarBonus(nivelRef.current, timeMs);
    }

    let protegido = false;
    if (!correct) {
      erroresRef.current.push(problema);
      if (escudosRef.current > 0) {
        protegido = true;
        escudosRef.current -= 1;
        setEscudos(escudosRef.current);
      }
    }

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_type: problemType,
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
      if (sig >= TOTAL_PROBLEMAS) terminar();
      else siguiente();
    }, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  if (!problema) return null;
  const segundos = Math.ceil(remainingMs / 1000);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={80} colorHex={colorDial} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_PROBLEMAS }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i < respondidos ? "bg-primario" : "bg-foreground/15"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} claseActivo="text-primario/70" />
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
        miRespuesta={miRespuesta}
        respuestaCorrecta={String(problema.respuesta)}
        padding="px-8 py-14"
      >
        <span className="text-center font-mono text-3xl font-bold text-foreground sm:text-4xl">
          {problema.enunciado}
        </span>

        <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            disabled={feedback !== "idle"}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
            autoFocus
          />
          <button
            type="submit"
            disabled={feedback !== "idle"}
            className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white disabled:opacity-60"
          >
            Ok
          </button>
        </form>
      </TarjetaSprint>
    </div>
  );
}
