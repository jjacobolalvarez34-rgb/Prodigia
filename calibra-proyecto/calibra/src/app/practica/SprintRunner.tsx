"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ArithmeticProblemType, ModifierSlug } from "@/types/database";
import { generarProblema, type Problem } from "@/lib/practica/problems";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import type { RespuestaDuelo } from "./page";
import { reproducirTono } from "@/lib/sonido";
import SonidoToggle from "@/components/SonidoToggle";
import RevelarRespuesta from "@/components/practica/RevelarRespuesta";
import PuntajeCorner, { type IntensidadPuntaje } from "@/components/PuntajeCorner";
import BonusTiempo from "@/components/BonusTiempo";
import RachaFuego from "@/components/RachaFuego";
import EscudoIcon from "@/components/EscudoIcon";
import GestoLogo from "@/components/GestoLogo";
import LevelDial from "./LevelDial";

const TOTAL_PROBLEMAS = 10;
const DURACION_MS = 60_000;
// Más rápido que antes: ya no hay que esperar una secuencia de desglose
// paso a paso, el puntaje aparece combinado de una — el ritmo entre
// problemas es lo que más importa acá (Fase VV).
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900; // levemente más lento a propósito: el error se registra un instante más
const ESCUDOS_BASE = 2;
const PROBABILIDAD_MODIFIER = 0.3;
const NIVEL_MIN_BONUS_TIEMPO = 5;
const BONUS_TIEMPO_MAX_ACUMULADO_MS = 20_000;

interface Fantasma {
  rivalNombre: string;
  respuestas: RespuestaDuelo[];
}

interface Props {
  seleccion: ArithmeticProblemType[];
  startedAt: number; // performance.now() de cuando arrancó el sprint
  nivelPorOperacion: Record<ArithmeticProblemType, number>;
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>;
  escudosExtra: number;
  colorDial?: string;
  fantasma?: Fantasma | null;
  onNivelChange: (tipo: ArithmeticProblemType, nivel: number) => void;
  onFinish: (errores: Problem[], respuestas: RespuestaDuelo[]) => void;
}

function elegirTipo(seleccion: ArithmeticProblemType[]): ArithmeticProblemType {
  return seleccion[Math.floor(Math.random() * seleccion.length)];
}

// Clave canónica para deduplicar dentro de una misma partida — nunca el
// mismo problema (mismos números, mismo signo) dos veces.
function claveProblema(p: Problem): string {
  return `${p.problemType}:${p.a}${p.symbol}${p.b}${p.incognitaB ? "?" : ""}`;
}

function elegirModifier(
  tipo: ArithmeticProblemType,
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>
): ModifierSlug | undefined {
  const disponibles = modificadoresPorOperacion[tipo];
  if (!disponibles || disponibles.length === 0) return undefined;
  if (Math.random() > PROBABILIDAD_MODIFIER) return undefined;
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

async function consultarPosicionRanking(): Promise<number | null> {
  try {
    const res = await fetch("/api/leaderboard/posicion");
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.posicion === "number" ? data.posicion : null;
  } catch {
    return null;
  }
}

export default function SprintRunner({
  seleccion,
  startedAt,
  nivelPorOperacion,
  modificadoresPorOperacion,
  escudosExtra,
  colorDial,
  fantasma,
  onNivelChange,
  onFinish,
}: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;

  // Fase J2 (cierre): el fantasma avanza al ritmo EXACTO de las
  // respuestas ya guardadas del rival — acumulado[i] es el instante
  // (ms desde el arranque) en el que el rival terminó su problema i.
  const acumuladoFantasma = useMemo(() => {
    if (!fantasma) return null;
    let acc = 0;
    return fantasma.respuestas.map((r) => (acc += r.timeMs));
  }, [fantasma]);

  const nivelesRef = useRef(nivelPorOperacion);
  const modificadoresRef = useRef(modificadoresPorOperacion);
  const usadosRef = useRef<Set<string>>(new Set());
  const escudosRef = useRef(escudosIniciales);
  const erroresRef = useRef<Problem[]>([]);
  const respuestasRef = useRef<RespuestaDuelo[]>([]);
  const posicionRankingRef = useRef<number | null>(null);
  const problemShownAtRef = useRef(0);
  const siguienteRef = useRef<Problem | null>(null);
  const bonusAcumuladoRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function generarNuevo(): Problem {
    return generarSinRepetir(
      () => {
        const tipo = elegirTipo(seleccion);
        const modifier = elegirModifier(tipo, modificadoresRef.current);
        return generarProblema(tipo, nivelesRef.current[tipo], modifier);
      },
      claveProblema,
      usadosRef.current
    );
  }

  // Arranca directo con un problema real (lazy initializer, no efecto) —
  // así no hace falta un ciclo extra de render para tener algo que mostrar.
  // Usa las props directo (no los refs) porque un lazy initializer todavía
  // cuenta como "durante el render" para el linter. Tampoco toca
  // usadosRef acá (el compilador no deja leer refs durante el render) —
  // no hace falta: el primer problema no tiene nada contra qué chocar
  // todavía, se registra recién en el efecto de montaje de abajo.
  const [problema, setProblema] = useState<Problem | null>(() => {
    const tipo = elegirTipo(seleccion);
    const modifier = elegirModifier(tipo, modificadoresPorOperacion);
    return generarProblema(tipo, nivelPorOperacion[tipo], modifier);
  });
  const [cardKey, setCardKey] = useState(0);
  const [respuesta, setRespuesta] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [puntaje, setPuntaje] = useState<{ total: number; intensidad: IntensidadPuntaje } | null>(null);
  const [bonusTiempo, setBonusTiempo] = useState<number | null>(null);
  const [duracionTotalMs, setDuracionTotalMs] = useState(DURACION_MS);
  const [miRespuesta, setMiRespuesta] = useState("");
  const [xpSprint, setXpSprint] = useState(0);
  const [problemasRespondidos, setProblemasRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(DURACION_MS);
  const [racha, setRacha] = useState(0);
  const [nivelSubioAnim, setNivelSubioAnim] = useState(false);
  const [logro, setLogro] = useState<string | null>(null);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [escudoUsado, setEscudoUsado] = useState(false);
  const [nudgeRanking, setNudgeRanking] = useState<string | null>(null);
  const [fantasmaRespondidos, setFantasmaRespondidos] = useState(0);

  useEffect(() => {
    nivelesRef.current = nivelPorOperacion;
  }, [nivelPorOperacion]);

  useEffect(() => {
    modificadoresRef.current = modificadoresPorOperacion;
  }, [modificadoresPorOperacion]);

  useEffect(() => {
    consultarPosicionRanking().then((p) => {
      posicionRankingRef.current = p;
    });
  }, []);

  // Activa un problema YA generado y, en el mismo paso, deja el
  // SIGUIENTE listo en memoria — así el próximo avance nunca tiene que
  // esperar a generar nada, cero percepción de carga entre problemas
  // (Fase VV, crítico para el ritmo).
  function activarProblema(p: Problem) {
    setProblema(p);
    setCardKey((k) => k + 1);
    setRespuesta("");
    setFeedback("idle");
    setPuntaje(null);
    setBonusTiempo(null);
    setEscudoUsado(false);
    problemShownAtRef.current = performance.now();
    siguienteRef.current = generarNuevo();
  }

  // Solo setea refs (nunca estado) — el problema inicial ya salió del
  // lazy initializer de arriba, esto solo lo registra en el set de
  // deduplicación, prepara el siguiente y marca el instante de arranque
  // para medir el tiempo de respuesta.
  useEffect(() => {
    if (problema) usadosRef.current.add(claveProblema(problema));
    siguienteRef.current = generarNuevo();
    problemShownAtRef.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [problema]);

  function terminarSprint() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish(erroresRef.current, respuestasRef.current);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const transcurrido = performance.now() - startedAt;
      const restante = Math.max(0, DURACION_MS + bonusAcumuladoRef.current - transcurrido);
      setRemainingMs(restante);
      if (acumuladoFantasma) {
        setFantasmaRespondidos(acumuladoFantasma.filter((t) => t <= transcurrido).length);
      }
      if (restante <= 0) {
        clearInterval(interval);
        terminarSprint();
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  function avanzar() {
    setLogro(null);
    submittingRef.current = false;
    const siguienteIdx = problemasRespondidos + 1;
    setProblemasRespondidos(siguienteIdx);
    if (finishedRef.current) return;
    if (siguienteIdx >= TOTAL_PROBLEMAS) {
      terminarSprint();
    } else {
      activarProblema(siguienteRef.current!);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !problema || respuesta === "") return;
    submittingRef.current = true;

    const timeMs = Math.round(performance.now() - problemShownAtRef.current);
    const correct = Number(respuesta) === problema.answer;
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    respuestasRef.current.push({ correct, timeMs });

    // Bonus de tiempo (Fase C2): responder muy rápido en nivel alto suma
    // segundos al reloj de la partida, con un tope acumulado razonable.
    if (
      correct &&
      problema.nivel >= NIVEL_MIN_BONUS_TIEMPO &&
      bonusAcumuladoRef.current < BONUS_TIEMPO_MAX_ACUMULADO_MS
    ) {
      const esperado = tiempoEsperadoMs(problema.nivel);
      if (timeMs < esperado * 0.5) {
        const factor = 1 - timeMs / esperado;
        const segundosBonus = Math.min(3, Math.max(1, Math.round(1 + factor * 2)));
        const msBonus = Math.min(segundosBonus * 1000, BONUS_TIEMPO_MAX_ACUMULADO_MS - bonusAcumuladoRef.current);
        if (msBonus > 0) {
          bonusAcumuladoRef.current += msBonus;
          setDuracionTotalMs(DURACION_MS + bonusAcumuladoRef.current);
          setBonusTiempo(Math.round(msBonus / 1000));
        }
      }
    }

    // Escudo de calibración: un error con al menos 1 escudo disponible no
    // baja el nivel (pero sí resetea la racha — sigue siendo honesto).
    let protegido = false;
    if (!correct) {
      setMiRespuesta(respuesta);
      erroresRef.current.push(problema);
      if (escudosRef.current > 0) {
        protegido = true;
        escudosRef.current -= 1;
        setEscudos(escudosRef.current);
        setEscudoUsado(true);
      }
    }

    let xpGanado = 0;
    let nivelSubioEsteIntento = false;
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_type: problema.problemType,
          level: problema.nivel,
          correct,
          time_ms: timeMs,
          protegido,
        }),
      });
      const data = await res.json();
      if (typeof data.xp === "number" && data.xp > 0) {
        xpGanado = data.xp;
        setXpSprint((prev) => prev + data.xp);
      }
      if (data.skillLevel) {
        setRacha(data.skillLevel.racha_actual);
        if (data.skillLevel.nivel > problema.nivel) {
          nivelSubioEsteIntento = true;
          setLogro(`Superaste tu techo — nivel ${data.skillLevel.nivel}.`);
          setNivelSubioAnim(true);
          reproducirTono("nivel");
          setTimeout(() => setNivelSubioAnim(false), 900);
        }
        onNivelChange(problema.problemType, data.skillLevel.nivel);
      }
    } catch {
      // Si falla el guardado, igual dejamos que el sprint siga: la
      // práctica no se traba por un error de red puntual.
    }

    if (correct && xpGanado > 0) {
      const intensidad: IntensidadPuntaje = nivelSubioEsteIntento ? "grande" : xpGanado >= 20 ? "medio" : "chico";
      setPuntaje({ total: xpGanado, intensidad });
    }

    if (correct) {
      consultarPosicionRanking().then((nueva) => {
        if (nueva !== null && (posicionRankingRef.current === null || nueva < posicionRankingRef.current)) {
          setNudgeRanking(`↑ subiste al puesto ${nueva}`);
          setTimeout(() => setNudgeRanking(null), 2500);
        }
        posicionRankingRef.current = nueva;
      });
    }

    setTimeout(avanzar, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  if (!problema) return null;

  const segundos = Math.ceil(remainingMs / 1000);
  const nivelActual = nivelPorOperacion[problema.problemType];
  const pctTiempo = Math.min(100, Math.max(0, (remainingMs / duracionTotalMs) * 100));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="relative">
        <motion.div
          animate={nivelSubioAnim ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <LevelDial nivel={nivelActual} size={96} colorHex={colorDial} />
        </motion.div>
        {nivelSubioAnim && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <GestoLogo size={170} colorHex={colorDial ?? "#6C4CF1"} />
          </div>
        )}
        <AnimatePresence>
          {nudgeRanking && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="absolute -right-3 -top-2 whitespace-nowrap rounded-full bg-logro/90 px-3 py-1 text-xs font-semibold text-foreground shadow-md"
            >
              {nudgeRanking}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_PROBLEMAS }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < problemasRespondidos ? "bg-primario" : "bg-foreground/15"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos de calibración disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} claseActivo="text-primario/70" />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">
              {xpSprint} Exp
            </span>
            <span className="font-mono font-medium">{segundos}s</span>
          </div>
        </div>

        {/* Fase J2 (cierre): fantasma del rival — avanza al ritmo exacto de
            sus respuestas ya guardadas del duelo, en paralelo a la partida
            en vivo. Solo aparece si el rival ya jugó su lado antes. */}
        {fantasma && acumuladoFantasma && (
          <div className="flex items-center justify-between text-xs text-texto-secundario">
            <div className="flex items-center gap-1.5">
              <span>👻</span>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_PROBLEMAS }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i < fantasmaRespondidos ? "bg-foreground/40" : "bg-foreground/10"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span>
              {problemasRespondidos > fantasmaRespondidos
                ? `Vas adelante de ${fantasma.rivalNombre}`
                : problemasRespondidos < fantasmaRespondidos
                  ? `${fantasma.rivalNombre} te lleva ventaja`
                  : `Van parejo con ${fantasma.rivalNombre}`}
            </span>
          </div>
        )}

        <div className="relative h-1.5 w-full">
          <div className="h-full w-full overflow-hidden rounded-full bg-foreground/10">
            <motion.div
              animate={{ width: `${pctTiempo}%`, background: bonusTiempo ? "#FFC53D" : "var(--primario)" }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full"
            />
          </div>
          {/* Fase M2: punta tipo cometa en la cabeza de la barra, afuera
              del contenedor recortado para que el brillo no se corte. */}
          <motion.div
            animate={{ left: `${pctTiempo}%`, background: bonusTiempo ? "#FFC53D" : "var(--primario)" }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ boxShadow: `0 0 7px ${bonusTiempo ? "#FFC53D" : "var(--primario)"}` }}
          />
          <AnimatePresence>{bonusTiempo && <BonusTiempo key={cardKey} segundos={bonusTiempo} />}</AnimatePresence>
        </div>
      </div>

      {logro && (
        <div className="rounded-full bg-logro/20 px-4 py-1.5 font-display text-sm font-black tracking-tight text-foreground">
          {logro}
        </div>
      )}
      {!logro && escudoUsado && (
        <div className="rounded-full bg-primario/10 px-4 py-1.5 text-sm font-medium text-primario">
          🛡️ Escudo usado — tu nivel está a salvo
        </div>
      )}

      <div className="relative w-full max-w-lg" style={{ minHeight: 300 }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={cardKey}
            initial={{ opacity: 0, x: 220, rotate: 5 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: 0,
              scale: feedback === "correcto" ? [1, 1.02, 1] : 1,
              filter: feedback === "incorrecto" ? "brightness(0.88)" : "brightness(1)",
            }}
            exit={{
              opacity: 0,
              x: -220,
              rotate: -6,
              transition: { duration: feedback === "incorrecto" ? 0.45 : 0.32, ease: "easeIn" },
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <div
              className={`relative flex h-full w-full flex-col items-center gap-6 rounded-3xl border-2 bg-surface px-10 py-14 shadow-lg shadow-foreground/[0.03] transition-colors ${
                feedback === "correcto"
                  ? "border-correcto"
                  : feedback === "incorrecto"
                    ? "border-error"
                    : "border-border"
              }`}
            >
              {feedback === "correcto" && puntaje && (
                <PuntajeCorner total={puntaje.total} intensidad={puntaje.intensidad} />
              )}

              <span className="font-mono text-5xl font-bold text-foreground sm:text-6xl">
                {problema.incognitaB ? (
                  <>
                    {problema.a} <span className="text-primario">{problema.symbol}</span> ? = {problema.b}
                  </>
                ) : (
                  <>
                    {problema.a} <span className="text-primario">{problema.symbol}</span> {problema.b}
                  </>
                )}
              </span>

              <div className="relative flex h-6 items-center">
                <RevelarRespuesta
                  activo={feedback === "incorrecto"}
                  miRespuesta={miRespuesta}
                  respuestaCorrecta={String(problema.answer)}
                />
              </div>

              <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  value={feedback === "incorrecto" ? "" : respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  disabled={feedback !== "idle"}
                  placeholder={feedback === "incorrecto" ? "—" : undefined}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl font-semibold text-foreground outline-none focus:border-primario disabled:opacity-60"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={feedback !== "idle"}
                  className="rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] transition-opacity disabled:opacity-60"
                >
                  Ok
                </button>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
