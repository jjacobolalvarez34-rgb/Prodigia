"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { claveEstadistica, generarProblemaEstadistica, type ModoEstadistica, type ProblemaEstadistica } from "@/lib/practica/estadistica";
import GraficoEstadistico from "@/components/estadistica/GraficoEstadistico";
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
import { COLOR_ESTADISTICA } from "./colores";

const TOTAL_PREGUNTAS = 10;
const DURACION_MS = 60_000;
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

interface Props {
  modo: ModoEstadistica;
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
  onFinish: (errores: ProblemaEstadistica[], correctos: number) => void;
}

// Mismo patrón que CalculiaSprintRunner.tsx (timer/escudos/racha/duelo en
// vivo, sin semilla, entrada numérica con tolerancia + grilla de opciones
// en el mismo runner). Extra de Estadística: el modo "graficos" dibuja un
// SVG por código (GraficoEstadistico) encima del enunciado. La respuesta
// numérica se compara NUMÉRICAMENTE (5.20 == 5.2), nunca como texto.
// `correctos` viaja en onFinish para que la demo/los duelos no lo
// re-deriven por resta.
export default function EstadisticaSprintRunner({
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
  const t = useTranslations("Estadistica.sprintRunner");
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const [hielosDisp, setHielosDisp] = useState(hielosIniciales);
  const [tiemposExtraDisp, setTiemposExtraDisp] = useState(tiemposExtraIniciales);
  const [usandoConsumible, setUsandoConsumible] = useState<TipoUso>(null);
  const { rival: rivalEnVivo, emitirProgreso } = useProgresoEnVivo({ duelId, miUserId });
  const correctosRef = useRef(0);
  const [problema, setProblema] = useState<ProblemaEstadistica | null>(null);
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

  const { duracionTotalMs, bonusTiempo, evaluarBonus, agregarBonusExtra, limpiarBonus, pausarPorHielo, calcularRestante } =
    useBonusTiempo(duracionMs);

  const nivelRef = useRef(nivelForzado ?? nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<ProblemaEstadistica[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    const p = generarSinRepetir(() => generarProblemaEstadistica(modo, nivelRef.current), claveEstadistica, usadosRef.current);
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
          problem_type: `estadistica_${modo}`,
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
      <LevelDial nivel={nivel} size={72} colorHex={COLOR_ESTADISTICA} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: totalPreguntas }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i < respondidos ? COLOR_ESTADISTICA : "var(--foreground)", opacity: i < respondidos ? 1 : 0.15 }}
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
                <EscudoIcon key={i} activo={i < escudos} colorActivo={COLOR_ESTADISTICA} />
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
            colorHex={COLOR_ESTADISTICA}
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
        {problema.grafico && <GraficoEstadistico grafico={problema.grafico} colorHex={COLOR_ESTADISTICA} />}
        <p className="text-center font-display text-sm font-bold leading-relaxed text-foreground sm:text-base">{problema.enunciado}</p>

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
              style={{ background: COLOR_ESTADISTICA }}
            >
              {t("ok")}
            </button>
          </form>
        ) : (
          <div className="grid w-full max-w-sm grid-cols-1 gap-2">
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
