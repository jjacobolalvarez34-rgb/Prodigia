"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  generarProblemaNaipia,
  claveNaipia,
  bandaNaipia,
  BANDA_NAIPIA,
  type ModoNaipia,
  type ProblemaNaipia,
  type SistemaConteo,
} from "@/lib/practica/naipia";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/[locale]/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import { useProgresoEnVivo } from "@/lib/duelos/useProgresoEnVivo";
import ProgresoRivalEnVivo from "@/components/duelos/ProgresoRivalEnVivo";
import { useRachaCombo } from "@/lib/practica/useRachaCombo";
import ConsumiblesPartida, { type TipoUso } from "@/components/ConsumiblesPartida";
import { usarConsumible } from "@/lib/practica/consumibles";
import FilaCartas from "@/components/naipia/FilaCartas";
import TablaSistema from "@/components/naipia/TablaSistema";
import { COLOR_NAIPIA } from "./colores";

const TOTAL_PREGUNTAS = 10;
const DURACION_MS = 60_000;
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

interface Props {
  modo: ModoNaipia;
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  hielosIniciales?: number;
  tiemposExtraIniciales?: number;
  nivelForzado?: number;
  duelId?: string | null;
  miUserId?: string | null;
  rivalNombre?: string | null;
  totalPreguntas?: number;
  duracionMs?: number;
  onFinish: (errores: ProblemaNaipia[], correctos: number) => void;
}

// Mismo patrón que CalculiaSprintRunner (timer/escudos/racha/duelo en
// vivo, sin semilla). Toda la entrada de Naipia es numérica exacta
// (tolerancia 0): el conteo corriente puede ser negativo, así que junto al
// campo hay un botón "±" (los teclados numéricos de celular no siempre
// traen el signo menos). Las cartas se dibujan en SVG (FilaCartas).
export default function NaipiaSprintRunner({
  modo,
  startedAt,
  nivelInicial,
  escudosExtra,
  hielosIniciales = 0,
  tiemposExtraIniciales = 0,
  nivelForzado,
  duelId,
  miUserId,
  rivalNombre,
  totalPreguntas = TOTAL_PREGUNTAS,
  duracionMs = DURACION_MS,
  onFinish,
}: Props) {
  const t = useTranslations("Naipia.sprintRunner");
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const [hielosDisp, setHielosDisp] = useState(hielosIniciales);
  const [tiemposExtraDisp, setTiemposExtraDisp] = useState(tiemposExtraIniciales);
  const [usandoConsumible, setUsandoConsumible] = useState<TipoUso>(null);
  const { rival: rivalEnVivo, emitirProgreso } = useProgresoEnVivo({ duelId, miUserId });
  const correctosRef = useRef(0);
  const [problema, setProblema] = useState<ProblemaNaipia | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [miRespuestaTexto, setMiRespuestaTexto] = useState("");
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [xpSprint, setXpSprint] = useState(0);
  const [respondidos, setRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(duracionMs);
  const [nivel, setNivel] = useState(nivelForzado ?? nivelInicial);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const { racha, registrarResultado } = useRachaCombo();

  const { duracionTotalMs, bonusTiempo, evaluarBonus, agregarBonusExtra, limpiarBonus, pausarPorHielo, calcularRestante } =
    useBonusTiempo(duracionMs);

  const nivelRef = useRef(nivelForzado ?? nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<ProblemaNaipia[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    const p = generarSinRepetir(() => generarProblemaNaipia(modo, nivelRef.current), claveNaipia, usadosRef.current);
    setProblema(p);
    setCardKey((k) => k + 1);
    setRespuestaTexto("");
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

  async function usarHielo() {
    if (usandoConsumible !== null || hielosDisp <= 0) return;
    setUsandoConsumible("hielo");
    const r = await usarConsumible("hielo");
    if (r) {
      setHielosDisp(r.hielos_disponibles);
      pausarPorHielo();
    }
    setUsandoConsumible(null);
  }

  async function usarTiempoExtra() {
    if (usandoConsumible !== null || tiemposExtraDisp <= 0) return;
    setUsandoConsumible("tiempo_extra");
    const r = await usarConsumible("tiempo_extra");
    if (r) {
      setTiemposExtraDisp(r.tiempos_extra_disponibles);
      agregarBonusExtra();
    }
    setUsandoConsumible(null);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const restante = calcularRestante(startedAt);
      setRemainingMs(restante);
      if (restante <= 0 && !submittingRef.current) {
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
          problem_type: `naipia_${modo}`,
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
    if (submittingRef.current || !problema || respuestaTexto === "" || respuestaTexto === "-") return;
    submittingRef.current = true;
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const valor = Number(respuestaTexto);
    const correct = Number.isFinite(valor) && Math.abs(valor - problema.respuesta) <= problema.tolerancia + 1e-9;
    registrar(correct, timeMs, respuestaTexto);
  }

  function alternarSigno() {
    setRespuestaTexto((actual) => {
      if (actual === "" || actual === "0") return "-";
      return actual.startsWith("-") ? actual.slice(1) : `-${actual}`;
    });
  }

  if (!problema) return null;
  const segundos = Math.ceil(remainingMs / 1000);
  const respuestaCorrectaTexto = String(problema.respuesta);
  // La tabla de valores se ofrece solo al empezar la banda del sistema (nivel de aprendizaje).
  const mostrarTabla = modo !== "verdadero" && bandaNaipia(modo, nivel) === BANDA_NAIPIA[modo].min;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={72} colorHex={COLOR_NAIPIA} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: totalPreguntas }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i < respondidos ? COLOR_NAIPIA : "var(--foreground)", opacity: i < respondidos ? 1 : 0.15 }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!duelId && (
              <ConsumiblesPartida
                hielos={hielosDisp}
                tiemposExtra={tiemposExtraDisp}
                usando={usandoConsumible}
                onUsarHielo={usarHielo}
                onUsarTiempoExtra={usarTiempoExtra}
              />
            )}
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={t("escudosDisponibles", { n: escudos })}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} colorActivo={COLOR_NAIPIA} />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">{t("exp", { n: xpSprint })}</span>
            <span className="font-mono font-medium">{t("segundos", { n: segundos })}</span>
          </div>
        </div>

        {rivalEnVivo && rivalNombre && (
          <ProgresoRivalEnVivo
            total={totalPreguntas}
            miRespondidos={respondidos}
            rivalRespondidos={rivalEnVivo.respondidos}
            rivalRacha={rivalEnVivo.racha}
            rivalNombre={rivalNombre}
            colorHex={COLOR_NAIPIA}
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
        <p className="text-center font-display text-base font-bold text-foreground">{problema.enunciado}</p>

        {problema.cartas.length > 0 && <FilaCartas cartas={problema.cartas} />}

        {mostrarTabla && (
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-texto-secundario">{t("tablaTitulo")}</p>
            <TablaSistema sistema={modo as SistemaConteo} colorHex={COLOR_NAIPIA} />
          </div>
        )}

        <form onSubmit={handleSubmitNumero} className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternarSigno}
            disabled={feedback !== "idle"}
            aria-label={t("cambiarSigno")}
            className="rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-lg font-semibold text-foreground disabled:opacity-60"
          >
            ±
          </button>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={respuestaTexto}
            onChange={(e) => setRespuestaTexto(e.target.value)}
            disabled={feedback !== "idle"}
            autoFocus
            aria-label={t("tuRespuesta")}
            className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={feedback !== "idle"}
            className="rounded-xl px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
            style={{ background: COLOR_NAIPIA }}
          >
            {t("ok")}
          </button>
        </form>
      </TarjetaSprint>
    </div>
  );
}
