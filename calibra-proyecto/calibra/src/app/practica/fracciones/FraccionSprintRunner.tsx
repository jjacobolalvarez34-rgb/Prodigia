"use client";

import { useEffect, useRef, useState } from "react";
import { generarProblemaFraccion, type ProblemaFraccion } from "@/lib/practica/fracciones";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import LevelDial from "../LevelDial";

const TOTAL_PROBLEMAS = 10;
const DURACION_MS = 60_000;
// Mismo ritmo que Aritmética (Fase VV): el puntaje aparece combinado de
// una, sin desglose paso a paso — nada de feedback viejo en ningún mundo.
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;

interface Props {
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  colorDial?: string;
  onFinish: (errores: ProblemaFraccion[]) => void;
}

// Clave canónica para deduplicar dentro de una misma partida.
function claveFraccion(p: ProblemaFraccion): string {
  if (p.tipo === "simplificar") return `simplificar:${p.frac?.[0]}/${p.frac?.[1]}`;
  if (p.tipo === "comparar") return `comparar:${p.frac1?.[0]}/${p.frac1?.[1]}:${p.frac2?.[0]}/${p.frac2?.[1]}`;
  return `sumar:${p.frac1?.[0]}/${p.frac1?.[1]}+${p.frac2?.[0]}/${p.frac2?.[1]}`;
}

function FraccionVisual({ num, den }: { num: number; den: number }) {
  return (
    <span className="inline-flex flex-col items-center text-2xl font-bold leading-none text-foreground">
      <span>{num}</span>
      <span className="my-0.5 h-[2px] w-6 bg-foreground" />
      <span>{den}</span>
    </span>
  );
}

export default function FraccionSprintRunner({ startedAt, nivelInicial, escudosExtra, colorDial, onFinish }: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const [problema, setProblema] = useState<ProblemaFraccion | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [num, setNum] = useState("");
  const [den, setDen] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [miRespuesta, setMiRespuesta] = useState("");
  const [respuestaCorrecta, setRespuestaCorrecta] = useState("");
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
  const erroresRef = useRef<ProblemaFraccion[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);
  const respondidosRef = useRef(0);

  function siguiente() {
    setProblema(generarSinRepetir(() => generarProblemaFraccion(nivelRef.current), claveFraccion, usadosRef.current));
    setCardKey((k) => k + 1);
    setNum("");
    setDen("");
    setFeedback("idle");
    setPuntaje(null);
    limpiarBonus();
    shownAtRef.current = performance.now();
  }

  useEffect(() => {
    siguiente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function terminar(motivo: "tiempo" | "preguntas") {
    if (finishedRef.current) return;
    if (motivo === "tiempo" && respondidosRef.current < TOTAL_PROBLEMAS - 1) {
      // El timer no debería cortar la partida con casi ninguna pregunta
      // respondida — si pasa, dejamos rastro en la consola para no tener
      // que adivinar la próxima vez.
      console.warn(
        `[fracciones] partida cortada por tiempo con solo ${respondidosRef.current} preguntas respondidas`
      );
    }
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
        terminar("tiempo");
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  async function registrar(correct: boolean, timeMs: number) {
    if (correct) {
      evaluarBonus(nivelRef.current, timeMs);
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
          problem_type: "fracciones",
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
      const sig = respondidosRef.current + 1;
      respondidosRef.current = sig;
      setRespondidos(sig);
      if (finishedRef.current) return;
      if (sig >= TOTAL_PROBLEMAS) {
        terminar("preguntas");
      } else {
        siguiente();
      }
    }, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  function handleComparar(e: React.MouseEvent<HTMLButtonElement>) {
    const opcion = e.currentTarget.dataset.op as "<" | "=" | ">" | undefined;
    if (!opcion || submittingRef.current || !problema) return;
    submittingRef.current = true;
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === problema.respuestaComparacion;
    setFeedback(correct ? "correcto" : "incorrecto");
    if (!correct) {
      setMiRespuesta(opcion);
      setRespuestaCorrecta(problema.respuestaComparacion ?? "");
    }
    reproducirTono(correct ? "correcto" : "error");
    registrar(correct, timeMs);
  }

  function handleSubmitFraccion(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !problema || num === "" || den === "") return;
    submittingRef.current = true;
    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const [respNum, respDen] = problema.respuestaFraccion ?? [0, 0];
    const correct = Number(num) === respNum && Number(den) === respDen;
    if (!correct) {
      setMiRespuesta(`${num}/${den}`);
      setRespuestaCorrecta(`${respNum}/${respDen}`);
    }
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    registrar(correct, timeMs);
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
        respuestaCorrecta={respuestaCorrecta}
        padding="px-8 py-12"
      >
        {problema.tipo === "simplificar" && problema.frac && (
          <>
            <p className="text-sm text-texto-secundario">Simplificá esta fracción</p>
            <FraccionVisual num={problema.frac[0]} den={problema.frac[1]} />
            <form onSubmit={handleSubmitFraccion} className="flex items-center gap-2">
              <input
                type="number"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                disabled={feedback !== "idle"}
                autoFocus
                className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
              />
              <span className="text-xl text-texto-secundario">/</span>
              <input
                type="number"
                value={den}
                onChange={(e) => setDen(e.target.value)}
                disabled={feedback !== "idle"}
                className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={feedback !== "idle"}
                className="rounded-xl bg-primario px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
              >
                Ok
              </button>
            </form>
          </>
        )}

        {problema.tipo === "sumar" && problema.frac1 && problema.frac2 && (
          <>
            <p className="text-sm text-texto-secundario">Sumá y simplificá el resultado</p>
            <div className="flex items-center gap-4">
              <FraccionVisual num={problema.frac1[0]} den={problema.frac1[1]} />
              <span className="text-2xl text-primario">+</span>
              <FraccionVisual num={problema.frac2[0]} den={problema.frac2[1]} />
            </div>
            <form onSubmit={handleSubmitFraccion} className="flex items-center gap-2">
              <input
                type="number"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                disabled={feedback !== "idle"}
                autoFocus
                className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
              />
              <span className="text-xl text-texto-secundario">/</span>
              <input
                type="number"
                value={den}
                onChange={(e) => setDen(e.target.value)}
                disabled={feedback !== "idle"}
                className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center font-mono text-lg font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={feedback !== "idle"}
                className="rounded-xl bg-primario px-4 py-2.5 font-display font-semibold text-white disabled:opacity-60"
              >
                Ok
              </button>
            </form>
          </>
        )}

        {problema.tipo === "comparar" && problema.frac1 && problema.frac2 && (
          <>
            <p className="text-sm text-texto-secundario">¿Cuál es mayor?</p>
            <div className="flex items-center gap-4">
              <FraccionVisual num={problema.frac1[0]} den={problema.frac1[1]} />
              <span className="text-xl text-texto-secundario">?</span>
              <FraccionVisual num={problema.frac2[0]} den={problema.frac2[1]} />
            </div>
            <div className="flex gap-2">
              {(["<", "=", ">"] as const).map((op) => (
                <button
                  key={op}
                  data-op={op}
                  onClick={handleComparar}
                  disabled={feedback !== "idle"}
                  className="w-14 rounded-xl border-2 border-border bg-background py-2.5 font-mono text-xl font-bold text-foreground transition-colors hover:border-primario/40 disabled:opacity-60"
                >
                  {op}
                </button>
              ))}
            </div>
          </>
        )}
      </TarjetaSprint>
    </div>
  );
}
