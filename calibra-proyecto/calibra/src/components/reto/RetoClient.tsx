"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PreguntaRetoDiario, MundoRetoDiario } from "@/lib/retoDiario";
import type { Achievement } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";
import LogroBanner from "@/components/LogroBanner";
import Boton from "@/components/Boton";
import Avatar from "@/components/Avatar";
import Pentagrama from "@/components/melodia/Pentagrama";
import FiguraRitmicaIcono from "@/components/melodia/FiguraRitmicaIcono";

type Fase = "intro" | "jugando" | "resumen";
export type TipoReto = "diario" | "semanal";

export interface FilaRankingReto {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  correctos: number;
  completado_at: string;
}

interface Props {
  tipo: TipoReto;
  // Fecha ("YYYY-MM-DD") para el diario, lunes de la semana para el
  // semanal — clave del período actual, usada para el endpoint y para
  // la clave de localStorage del progreso en curso.
  clave: string;
  problemas: PreguntaRetoDiario[];
  yaCompletado: { correctos: number; puntosBonus: number } | null;
  racha: number;
  miUserId: string;
  rankingInicial: FilaRankingReto[];
}

const COLOR_MUNDO: Record<MundoRetoDiario, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  quimia: "#C026D3",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  trigonometria: "#84CC16",
  historia: "#A0522D",
};
const NOMBRE_MUNDO: Record<MundoRetoDiario, string> = {
  numeria: "Numeria",
  enigmia: "Enigmia",
  geografia: "Geografía",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
  trigonometria: "Trigonometría",
  historia: "Historia",
};

const TEXTO_TIPO: Record<TipoReto, { etiqueta: string; periodo: string; endpoint: string; volver: string }> = {
  diario: { etiqueta: "Reto diario", periodo: "hoy", endpoint: "/api/reto-diario/completar", volver: "mañana" },
  semanal: { etiqueta: "Reto semanal", periodo: "esta semana", endpoint: "/api/reto-semanal/completar", volver: "la semana que viene" },
};

// Rediseño 2026-08-31: componente único para reto diario (5 preguntas)
// y reto semanal (45 preguntas) — antes existían por separado y hubiera
// sido la 2da vez que este proyecto duplica un componente casi idéntico
// entre 2 variantes (ver el historial de bugs de "una lista que se
// desincroniza" en docs/PARIDAD_MUNDOS.md). Progreso resumible: cada
// respuesta se guarda en localStorage bajo una clave por tipo+período,
// así que cerrar la pestaña a mitad de las 45 preguntas del semanal no
// hace perder el avance — la recompensa real sigue viniendo 100% del
// server (completar_reto_diario/completar_reto_semanal), localStorage
// solo afecta la continuidad visual, nunca el puntaje que se paga.
function leerProgresoGuardado(claveStorage: string, total: number): { indice: number; correctos: number } | null {
  try {
    const guardado = localStorage.getItem(claveStorage);
    if (!guardado) return null;
    const datos = JSON.parse(guardado) as { indice?: number; correctos?: number };
    if (typeof datos.indice === "number" && datos.indice > 0 && datos.indice < total) {
      return { indice: datos.indice, correctos: datos.correctos ?? 0 };
    }
    return null;
  } catch {
    return null; // localStorage no disponible (modo privado) — simplemente arranca de cero.
  }
}

function subscribeNoop() {
  return () => {};
}

export default function RetoClient({ tipo, clave, problemas, yaCompletado, racha, miUserId, rankingInicial }: Props) {
  const [fase, setFase] = useState<Fase>(yaCompletado ? "resumen" : "intro");
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [correctos, setCorrectos] = useState(0);
  const [resultado, setResultado] = useState<{ correctos: number; puntosBonus: number } | null>(yaCompletado);
  const [logrosNuevos, setLogrosNuevos] = useState<Achievement[]>([]);
  const [ranking, setRanking] = useState<FilaRankingReto[]>(rankingInicial);
  const [enviando, setEnviando] = useState(false);
  const [resumioProgreso, setResumioProgreso] = useState(false);

  const total = problemas.length;
  const texto = TEXTO_TIPO[tipo];
  const claveStorage = `prodigia-reto-${tipo}-progreso-${clave}`;

  // Snapshot de servidor siempre "sin progreso guardado" (localStorage no
  // existe en SSR) — mismo patrón que AvisoPrimeraVez.tsx/PrimeraVezTip.tsx,
  // así el HTML inicial nunca tiene mismatch de hidratación; el valor real
  // llega recién en el cliente, un tick después de montar.
  const progresoGuardado = useSyncExternalStore(
    subscribeNoop,
    () => leerProgresoGuardado(claveStorage, total),
    () => null
  );

  // Retoma un intento en curso (misma fecha/semana) si la pestaña se
  // cerró a mitad de camino — solo si el server no dice ya_completado
  // (esa fuente manda siempre). Ajuste de estado durante el render (no
  // un efecto): React re-renderiza al toque con estos valores antes de
  // pintar nada en pantalla, siguiendo el patrón oficial de React para
  // sincronizar state con una fuente externa sin useEffect.
  if (progresoGuardado && !resumioProgreso && !yaCompletado) {
    setResumioProgreso(true);
    setIndice(progresoGuardado.indice);
    setCorrectos(progresoGuardado.correctos);
    setFase("jugando");
  }

  const pregunta = problemas[indice];

  function guardarProgreso(siguienteIndice: number, correctosActuales: number) {
    try {
      localStorage.setItem(claveStorage, JSON.stringify({ indice: siguienteIndice, correctos: correctosActuales }));
    } catch {
      // Si falla, el peor caso es perder el resumen si cierran la pestaña — no bloquea nada.
    }
  }

  async function finalizar(correctosFinal: number) {
    setEnviando(true);
    try {
      const res = await fetch(texto.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave, correctos: correctosFinal }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado({ correctos: correctosFinal, puntosBonus: data.puntos_bonus });
        if (Array.isArray(data.logrosNuevos)) setLogrosNuevos(data.logrosNuevos);
        if (Array.isArray(data.ranking)) setRanking(data.ranking);
      } else {
        setResultado({ correctos: correctosFinal, puntosBonus: 0 });
      }
    } catch {
      setResultado({ correctos: correctosFinal, puntosBonus: 0 });
    }
    try {
      localStorage.removeItem(claveStorage);
    } catch {
      // No pasa nada si no se pudo limpiar — la próxima carga la pisa el chequeo de arriba.
    }
    setEnviando(false);
    setFase("resumen");
  }

  function handleElegir(opcion: string) {
    if (feedback !== "idle") return;
    const correct = opcion === pregunta.respuesta;
    setSeleccion(opcion);
    setFeedback(correct ? "correcto" : "incorrecto");
    reproducirTono(correct ? "correcto" : "error");
    const totalCorrectos = correct ? correctos + 1 : correctos;
    if (correct) setCorrectos(totalCorrectos);

    setTimeout(() => {
      const siguiente = indice + 1;
      if (siguiente >= total) {
        finalizar(totalCorrectos);
      } else {
        setIndice(siguiente);
        setSeleccion(null);
        setFeedback("idle");
        guardarProgreso(siguiente, totalCorrectos);
      }
    }, correct ? 450 : 800);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-4 py-16">
      <AnimatePresence mode="wait">
        {fase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 text-center">
            <div>
              <span className="rounded-full bg-logro/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-logro">
                {texto.etiqueta}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
                {total} preguntas, las mismas para todos {texto.periodo}
              </h1>
              <p className="mt-2 text-sm text-texto-secundario">
                Repartidas entre tus ciudades desbloqueadas, al azar. Completalo para sumar Chispas extra y
                estirar tu racha.
              </p>
              {racha > 0 && (
                <p className="mt-3 font-mono text-sm font-semibold text-racha">
                  🔥 {racha} {tipo === "diario" ? (racha === 1 ? "día" : "días") : racha === 1 ? "semana" : "semanas"} seguidas
                </p>
              )}
            </div>
            <Boton onClick={() => setFase("jugando")} className="py-4">
              Empezar
            </Boton>
          </motion.div>
        )}

        {fase === "jugando" && pregunta && (
          <motion.div
            key={`p-${indice}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-texto-secundario">
                <span className="font-medium" style={{ color: COLOR_MUNDO[pregunta.mundo] }}>
                  {NOMBRE_MUNDO[pregunta.mundo]}
                </span>
                <span className="font-mono">{indice + 1}/{total}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${((indice + 1) / total) * 100}%`, background: COLOR_MUNDO[pregunta.mundo] }}
                />
              </div>
            </div>

            <div
              className={`flex w-full flex-col items-center gap-5 rounded-3xl border-2 bg-surface px-6 py-8 transition-colors ${
                feedback === "correcto" ? "border-correcto" : feedback === "incorrecto" ? "border-error" : "border-border"
              }`}
            >
              {pregunta.notasMelodia && (
                <div className="w-full overflow-x-auto">
                  <Pentagrama notas={pregunta.notasMelodia} disposicion={pregunta.disposicionMelodia} colorHex={COLOR_MUNDO.melodia} />
                </div>
              )}
              {pregunta.figuraMelodia && <FiguraRitmicaIcono figura={pregunta.figuraMelodia} colorHex={COLOR_MUNDO.melodia} />}

              <p className="text-center font-medium text-foreground">{pregunta.enunciado}</p>

              <div className="grid w-full grid-cols-2 gap-2.5">
                {pregunta.opciones.map((op) => {
                  const esElegida = seleccion === op;
                  const esCorrecta = feedback !== "idle" && op === pregunta.respuesta;
                  return (
                    <button
                      key={op}
                      onClick={() => handleElegir(op)}
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
            </div>
          </motion.div>
        )}

        {fase === "resumen" && resultado && (
          <motion.div
            key="resumen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <LogroBanner logros={logrosNuevos} />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {yaCompletado || resultado.puntosBonus === 0
                ? `Ya completaste el reto ${tipo === "diario" ? "de hoy" : "de esta semana"}`
                : "Ahí quedó."}
            </h1>
            <p className="font-mono text-4xl font-bold text-logro">
              {resultado.correctos}/{total}
            </p>
            {resultado.puntosBonus > 0 && (
              <p className="text-sm text-texto-secundario">+{resultado.puntosBonus} Chispas de bonus</p>
            )}
            {racha > 0 && (
              <p className="font-mono text-sm font-semibold text-racha">
                🔥 {racha} {tipo === "diario" ? (racha === 1 ? "día" : "días") : racha === 1 ? "semana" : "semanas"} seguidas
              </p>
            )}

            {ranking.length > 0 && (
              <div className="w-full rounded-2xl border border-border bg-surface px-4 py-4 text-left">
                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-texto-secundario">
                  Quién más completó {texto.periodo}
                </p>
                <ol className="flex flex-col gap-2">
                  {ranking.map((fila, i) => (
                    <li
                      key={fila.user_id}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm ${
                        fila.user_id === miUserId ? "bg-primario/10" : ""
                      }`}
                    >
                      <span className="w-5 shrink-0 text-center font-mono text-xs text-texto-secundario">{i + 1}</span>
                      <Avatar url={fila.avatar_url} nombre={fila.display_name} size={24} />
                      <span className="flex-1 truncate font-medium text-foreground">{fila.display_name ?? "—"}</span>
                      <span className="shrink-0 font-mono text-xs text-texto-secundario">{fila.correctos}/{total}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-sm text-texto-secundario">Volvé {texto.volver} por el próximo.</p>
            <Link
              href="/"
              className="w-full rounded-2xl px-6 py-4 font-display font-semibold text-white"
              style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
            >
              Volver a Inicio
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      {enviando && <p className="text-center text-xs text-texto-secundario">Guardando...</p>}
    </div>
  );
}
