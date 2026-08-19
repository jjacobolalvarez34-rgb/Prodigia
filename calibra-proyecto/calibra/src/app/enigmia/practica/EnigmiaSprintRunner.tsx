"use client";

import { useEffect, useRef, useState } from "react";
import type { CategoriaEnigmia, LogicPuzzle } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";
import { useBonusTiempo } from "@/lib/practica/useBonusTiempo";
import SonidoToggle from "@/components/SonidoToggle";
import EscudoIcon from "@/components/EscudoIcon";
import RachaFuego from "@/components/RachaFuego";
import LevelDial from "@/app/practica/LevelDial";
import TarjetaSprint, { type PuntajeTarjeta } from "@/components/practica/TarjetaSprint";
import BarraTiempo from "@/components/practica/BarraTiempo";
import AcertijoMemoria from "@/components/AcertijoMemoria";
import { generarAcertijoProcedural, type CategoriaGenerada } from "@/lib/enigmia/generadores";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { useProgresoEnVivo } from "@/lib/duelos/useProgresoEnVivo";
import ProgresoRivalEnVivo from "@/components/duelos/ProgresoRivalEnVivo";

const TOTAL_PREGUNTAS = 10;
// Fase V2: 60s se sentía corto para acertijos de lógica (no es lo mismo
// que leer "7+8"). 90s da margen real para pensar sin que se sienta
// apretado.
const DURACION_MS = 90_000;
// Mismo ritmo que Aritmética/Fracciones (Fase VV): nada de feedback
// viejo en ningún mundo.
const FEEDBACK_MS_OK = 550;
const FEEDBACK_MS_ERROR = 900;
const ESCUDOS_BASE = 2;
const COLOR = "#0E9F6E";
// Fase A2: Memoria/Patrones/Computacional se generan por código,
// infinitos — solo Deducción sigue viniendo del banco fijo sembrado en
// la base (un generador de deducción de verdad es un proyecto aparte).
const CATEGORIAS_PROCEDURALES: CategoriaGenerada[] = ["memoria", "patrones", "computacional"];
const PROBABILIDAD_PROCEDURAL = 0.75;

// Clave canónica de contenido — los ids de los acertijos procedurales
// son siempre únicos (idFalso lleva timestamp+random), así que por sí
// solos no sirven para detectar contenido repetido. Acá se compara lo
// que realmente ve el usuario: enunciado + secuencia (Memoria).
function claveAcertijo(p: LogicPuzzle): string {
  return `${p.contenido.enunciado}|${(p.contenido.secuencia ?? []).join(",")}`;
}

// Fase 4 de Rankeds: en un duelo, `categoriaForzada` restringe TODOS los
// acertijos a esa única categoría (el contenido elegible según el rango
// de los dos duelistas) — nada de la mezcla normal 75/25.
function elegirSiguiente(
  puzzlesDB: LogicPuzzle[],
  nivel: number,
  usados: Set<string>,
  categoriaForzada?: CategoriaEnigmia
): LogicPuzzle {
  if (categoriaForzada) {
    if (categoriaForzada === "deduccion") {
      const soloDeduccion = puzzlesDB.filter((p) => p.tipo === "deduccion");
      const banco = soloDeduccion.length > 0 ? soloDeduccion : puzzlesDB;
      const candidatos = banco.filter((p) => !usados.has(p.id));
      const pool = candidatos.length > 0 ? candidatos : banco;
      return pool[Math.floor(Math.random() * pool.length)] ?? generarAcertijoProcedural("patrones", nivel);
    }
    return generarSinRepetir(() => generarAcertijoProcedural(categoriaForzada, nivel), claveAcertijo, usados);
  }

  if (Math.random() < PROBABILIDAD_PROCEDURAL) {
    const categoria = CATEGORIAS_PROCEDURALES[Math.floor(Math.random() * CATEGORIAS_PROCEDURALES.length)];
    return generarSinRepetir(() => generarAcertijoProcedural(categoria, nivel), claveAcertijo, usados);
  }

  const soloDeduccion = puzzlesDB.filter((p) => p.tipo === "deduccion");
  const banco = soloDeduccion.length > 0 ? soloDeduccion : puzzlesDB;
  const min = Math.max(1, nivel - 1);
  const max = Math.min(10, nivel + 1);
  const candidatos = banco.filter((p) => p.dificultad >= min && p.dificultad <= max && !usados.has(p.id));
  const pool = candidatos.length > 0 ? candidatos : banco.filter((p) => !usados.has(p.id));
  if (pool.length === 0) {
    return banco[Math.floor(Math.random() * banco.length)] ?? generarAcertijoProcedural("patrones", nivel);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Props {
  puzzles: LogicPuzzle[];
  startedAt: number;
  nivelInicial: number;
  escudosExtra: number;
  categoriaForzada?: CategoriaEnigmia;
  // Corrección: en un duelo, la complejidad la decide el rango de los
  // dos duelistas (nivel_enigmia_por_rango), no logic_skill_levels
  // (progresión de práctica solitaria) — mismo criterio que ya usaba
  // Numeria con nivel_numeria. Si viene seteado, el nivel queda FIJO
  // durante todo el duelo (no se recalibra con cada acierto, igual que
  // Numeria tampoco lo hace en duelos).
  nivelForzado?: number;
  // Fase 6: progreso del rival en vivo — mismo criterio que Geografía,
  // sin fantasma acá.
  duelId?: string | null;
  miUserId?: string | null;
  rivalNombre?: string | null;
  onFinish: (errores: LogicPuzzle[]) => void;
}

export default function EnigmiaSprintRunner({
  puzzles,
  startedAt,
  nivelInicial,
  escudosExtra,
  categoriaForzada,
  nivelForzado,
  duelId,
  miUserId,
  rivalNombre,
  onFinish,
}: Props) {
  const escudosIniciales = ESCUDOS_BASE + escudosExtra;
  const { rival: rivalEnVivo, emitirProgreso } = useProgresoEnVivo({ duelId, miUserId });
  const correctosRef = useRef(0);
  const [puzzle, setPuzzle] = useState<LogicPuzzle | null>(null);
  const [cardKey, setCardKey] = useState(0);
  // Fase W2: si el acertijo trae `secuencia` (Memoria), arranca oculto
  // detrás de la pantalla de memorización — la pregunta y las opciones
  // recién se revelan cuando esa pantalla termina, nunca antes.
  const [faseMemoria, setFaseMemoria] = useState<"memorizando" | "respondiendo">("respondiendo");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [puntaje, setPuntaje] = useState<PuntajeTarjeta | null>(null);
  const [xpSprint, setXpSprint] = useState(0);
  const [respondidos, setRespondidos] = useState(0);
  const [remainingMs, setRemainingMs] = useState(DURACION_MS);
  const [nivel, setNivel] = useState(nivelForzado ?? nivelInicial);
  const [escudos, setEscudos] = useState(escudosIniciales);
  const [racha, setRacha] = useState(0);

  const { duracionTotalMs, bonusTiempo, bonusAcumuladoRef, evaluarBonus, limpiarBonus } = useBonusTiempo(DURACION_MS);

  const nivelRef = useRef(nivelForzado ?? nivelInicial);
  const escudosRef = useRef(escudosIniciales);
  const usadosRef = useRef<Set<string>>(new Set());
  const erroresRef = useRef<LogicPuzzle[]>([]);
  const shownAtRef = useRef(0);
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  function siguiente() {
    const p = elegirSiguiente(puzzles, nivelRef.current, usadosRef.current, categoriaForzada);
    usadosRef.current.add(p.id);
    if (usadosRef.current.size > 200) usadosRef.current = new Set();
    setPuzzle(p);
    setCardKey((k) => k + 1);
    setSeleccion(null);
    setFeedback("idle");
    setPuntaje(null);
    limpiarBonus();
    if (p.contenido.secuencia) {
      // El cronómetro de respuesta arranca recién cuando termine la
      // memorización (ver onListo de AcertijoMemoria más abajo), no acá.
      setFaseMemoria("memorizando");
    } else {
      setFaseMemoria("respondiendo");
      shownAtRef.current = performance.now();
    }
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

  async function handleResponder(e: React.MouseEvent<HTMLButtonElement>) {
    const opcion = e.currentTarget.dataset.opcion;
    if (!opcion || submittingRef.current || !puzzle) return;
    submittingRef.current = true;
    setSeleccion(opcion);

    const timeMs = Math.round(performance.now() - shownAtRef.current);
    const correct = opcion === puzzle.respuesta;
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");

    if (correct) {
      evaluarBonus(puzzle.dificultad, timeMs);
    }

    let protegido = false;
    if (!correct) {
      erroresRef.current.push(puzzle);
      if (escudosRef.current > 0) {
        protegido = true;
        escudosRef.current -= 1;
        setEscudos(escudosRef.current);
      }
    }

    try {
      const res = await fetch("/api/logic-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzle_id: puzzle.id,
          dificultad: puzzle.dificultad,
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
        if (!nivelForzado) {
          nivelSubio = data.skillLevel.nivel > nivelRef.current;
          nivelRef.current = data.skillLevel.nivel;
          setNivel(data.skillLevel.nivel);
        }
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
      if (sig >= TOTAL_PREGUNTAS) {
        terminar();
      } else {
        siguiente();
      }
    }, correct ? FEEDBACK_MS_OK : FEEDBACK_MS_ERROR);
  }

  if (!puzzle) return null;
  const segundos = Math.ceil(remainingMs / 1000);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <LevelDial nivel={nivel} size={80} colorHex={COLOR} />

      <div className="flex w-full max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-texto-secundario">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_PREGUNTAS }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${i < respondidos ? "" : "bg-foreground/15"}`}
                style={i < respondidos ? { background: COLOR } : undefined}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SonidoToggle />
            <div className="flex items-center gap-1" aria-label={`${escudos} escudos disponibles`}>
              {Array.from({ length: escudosIniciales }).map((_, i) => (
                <EscudoIcon key={i} activo={i < escudos} colorActivo="#0E9F6E" />
              ))}
            </div>
            <RachaFuego racha={racha} />
            <span className="rounded-full bg-logro/15 px-2.5 py-1 font-mono font-medium text-foreground">
              {xpSprint} Exp
            </span>
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
            colorHex={COLOR}
          />
        )}

        <BarraTiempo remainingMs={remainingMs} duracionTotalMs={duracionTotalMs} bonusTiempo={bonusTiempo} cardKey={cardKey} />
      </div>

      <TarjetaSprint
        cardKey={cardKey}
        feedback={feedback}
        puntaje={puntaje}
        miRespuesta={seleccion ?? ""}
        respuestaCorrecta={puzzle.respuesta}
        padding="px-8 py-12"
      >
        {faseMemoria === "memorizando" && puzzle.contenido.secuencia ? (
          <AcertijoMemoria
            secuencia={puzzle.contenido.secuencia}
            colorHex={COLOR}
            onListo={() => {
              setFaseMemoria("respondiendo");
              shownAtRef.current = performance.now();
            }}
          />
        ) : (
          <>
            <p className="text-center font-medium text-foreground">{puzzle.contenido.enunciado}</p>

            <div className="grid w-full grid-cols-2 gap-2.5">
              {puzzle.contenido.opciones.map((op) => {
                const esElegida = seleccion === op;
                const esCorrecta = feedback !== "idle" && op === puzzle.respuesta;
                return (
                  <button
                    key={op}
                    data-opcion={op}
                    onClick={handleResponder}
                    disabled={feedback !== "idle"}
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
          </>
        )}
      </TarjetaSprint>
    </div>
  );
}
