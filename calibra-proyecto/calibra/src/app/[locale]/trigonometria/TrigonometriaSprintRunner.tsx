"use client";

import { useEffect, useRef, useState } from "react";
import { generarProblemaTrigonometria, type ModoTrigonometria, type ProblemaTrigonometria } from "@/lib/practica/trigonometria";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import TrianguloSVG from "@/components/trigonometria/TrianguloSVG";
import { useProgresoEnVivo } from "@/lib/duelos/useProgresoEnVivo";
import ProgresoRivalEnVivo from "@/components/duelos/ProgresoRivalEnVivo";
import { useRachaCombo } from "@/lib/practica/useRachaCombo";
import { COLOR_TRIGONOMETRIA } from "./colores";

const TOTAL_PREGUNTAS = 10;
const DURACION_MS = 60_000;
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

function claveTrigonometria(p: ProblemaTrigonometria): string {
  return `${p.enunciado}|${p.respuesta}`;
}

interface Props {
  modo: ModoTrigonometria;
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  nivelForzado?: number;
  duelId?: string | null;
  miUserId?: string | null;
  rivalNombre?: string | null;
  totalPreguntas?: number;
  duracionMs?: number;
  onFinish: (errores: ProblemaTrigonometria[], correctos: number) => void;
}

// Mismo patrón que MelodiaSprintRunner (timer/escudos/racha/duelo en
// vivo, sin semilla) combinado con el branching de FraccionSprintRunner
// (entrada numérica con tolerancia para razones/leyes, grilla de
// opciones para círculo/identidades) — Trigonometría es el único mundo
// que necesita los dos estilos de respuesta dentro del mismo runner.
export default function TrigonometriaSprintRunner({
  modo,
  startedAt,
  nivelInicial,
  escudosExtra,
  nivelForzado,
  duelId,
  miUserId,
  rivalNombre,
  totalPreguntas = TOTAL_PREGUNTAS,
  duracionMs = DURACION_MS,
  onFinish,
}: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const { rival: rivalEnVivo, emitirProgreso } = useProgresoEnVivo({ duelId, miUserId });
  const correctosRef = useRef(0);
  const [problema, setProblema] = useState<ProblemaTrigonometria | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [miRespuestaTexto, setMiRespuestaTexto] = useState("");
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [xpSprint, setXpSprint] = useState(0);
  const [respondidos, setRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(duracionMs);
  const [nivel, setNivel] = useState(nivelForzado ?? nivelInicial);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const { racha, registrarResultado } = useRachaCombo();

  const { duracionTotalMs, bonusTiempo, bonusAcumuladoRef, evaluarBonus, limpiarBonus } = useBonusTiempo(duracionMs);

  const nivelRef = useRef(nivelForzado ?? nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<ProblemaTrigonometria[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    const p = generarSinRepetir(() => generarProblemaTrigonometria(modo, nivelRef.current), claveTrigonometria, usadosRef.current);
    setProblema(p);
    setCardKey((k) => k + 1);
    setRespuestaTexto("");
    setSeleccion(null);
    setRespondido(false);
    setFeedback("idle");
    setMiRespuestaTexto("");
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
    onFinish(erroresRef.current, correctosRef.current);
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

  async function registrar(correct: boolean, timeMs: number, respuestaMostrada: string) {
    if (!correct) {
      setMiRespuestaTexto(respuestaMostrada);
    }
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    const rachaActual = registrarResultado(correct);

    if (correct) {
      evaluarBonus(nivelRef.current, timeMs);
      correctosRef.current += 1;
    }

    let protegido = false;
    if (!correct) {
      if (problema) erroresRef.current.push(problema);
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
          problem_type: `trigonometria_${modo}`,
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
      if (data.skillLevel && !nivelForzado) {
        nivelSubio = data.skillLevel.nivel > nivelRef.current;
        nivelRef.current = data.skillLevel.nivel;
        setNivel(data.skillLevel.nivel);
      }
      if (data.skillLevel) {
        emitirProgreso({ respondidos: respondidos + 1, correctos: correctosRef.current, racha: rachaActual });
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

  function handleSubmitNumero(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !problema || problema.entrada !== "numero" || respuestaTexto === "") return;
    submittingRef.current = true;
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const valor = Number(respuestaTexto);
    const correct = Math.abs(valor - problema.respuesta) <= problema.tolerancia + 1e-9;
    registrar(correct, timeMs, respuestaTexto);
  }

  function handleElegir(opcion: string) {
    if (submittingRef.current || !problema || problema.entrada !== "opciones" || respondido) return;
    submittingRef.current = true;
    setSeleccion(opcion);
    setRespondido(true);
    // eslint-disable-next-line react-hooks/purity
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === problema.respuesta;
    registrar(correct, timeMs, opcion);
  }

  if (!problema) return null;
  const segundos = Math.ceil(remainingMs / 1000);
  const respuestaCorrectaTexto = String(problema.respuesta);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={72} colorHex={COLOR_TRIGONOMETRIA} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: totalPreguntas }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i < respondidos ? COLOR_TRIGONOMETRIA : "var(--foreground)", opacity: i < respondidos ? 1 : 0.15 }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} colorActivo={COLOR_TRIGONOMETRIA} />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">{xpSprint} Exp</span>
            <span className="font-mono font-medium">{segundos}s</span>
          </div>
        </div>

        {rivalEnVivo && rivalNombre && (
          <ProgresoRivalEnVivo
            total={totalPreguntas}
            miRespondidos={respondidos}
            rivalRespondidos={rivalEnVivo.respondidos}
            rivalRacha={rivalEnVivo.racha}
            rivalNombre={rivalNombre}
            colorHex={COLOR_TRIGONOMETRIA}
          />
        )}

        <BarraTiempo remainingMs={remainingMs} duracionTotalMs={duracionTotalMs} bonusTiempo={bonusTiempo} cardKey={cardKey} />
      </div>

      <TarjetaSprint
        cardKey={cardKey}
        feedback={feedback}
        puntaje={puntaje}
        miRespuesta={miRespuestaTexto}
        respuestaCorrecta={respuestaCorrectaTexto}
        padding="px-6 py-10"
      >
        {problema.triangulo && (
          <div className="w-full overflow-x-auto">
            <TrianguloSVG triangulo={problema.triangulo} colorHex={COLOR_TRIGONOMETRIA} />
          </div>
        )}
        <p className="text-center font-display text-base font-bold text-foreground">{problema.enunciado}</p>

        {problema.entrada === "numero" ? (
          <form onSubmit={handleSubmitNumero} className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              disabled={feedback !== "idle"}
              autoFocus
              className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={feedback !== "idle"}
              className="rounded-xl px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
              style={{ background: COLOR_TRIGONOMETRIA }}
            >
              Ok
            </button>
          </form>
        ) : (
          <div className="grid w-full max-w-sm grid-cols-2 gap-2">
            {problema.opciones.map((op) => {
              const esElegida = seleccion === op;
              const esCorrecta = respondido && op === problema.respuesta;
              return (
                <button
                  key={op}
                  onClick={() => handleElegir(op)}
                  disabled={respondido}
                  className={`rounded-xl border-2 px-4 py-3 font-mono text-sm font-medium transition-colors disabled:opacity-100 ${
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
        )}
      </TarjetaSprint>
    </div>
  );
}
