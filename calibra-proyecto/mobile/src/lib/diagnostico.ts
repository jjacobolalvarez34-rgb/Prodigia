// Diagnóstico inicial de cada mundo (los Diagnostico*Client.tsx de la web): unas
// preguntas sin reloj que arrancan en nivel 3 y suben si aciertas rápido (menos
// del 80 % del tiempo esperado) o bajan si fallas. Al terminar (o al saltarlo) se
// guarda ese nivel de arranque y la marca onboarding_<mundo>_completado, igual que
// la web: después de esto no vuelve a aparecer en ningún lado.
import { generarAcertijoProcedural } from "@/lib/enigmia/generadores";
import { filasDiagnostico } from "@/lib/enigmia/diagnostico";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { claveNaipia, generarProblemaNaipia } from "@/lib/practica/naipia";
import type { LogicPuzzle } from "@/types/database";
import type { MundoSlug } from "~/tema";
import { mundoJugable, problemTypeDe, type PreguntaMundo } from "./mundosJugables";
import { ENIGMIA } from "./mundosJugables/enigmia";
import { nuevoProblemaNumeria } from "./numeria";
import { supabase } from "./supabase";

export const NIVEL_INICIAL_DIAGNOSTICO = 3;

export interface Diagnostico {
  total: number;
  // Qué se mide (para el texto de la intro).
  tema: string;
  // Niveles que mide (Numeria: las 4 operaciones; el resto, uno solo).
  claves: string[];
  preparar?: () => Promise<unknown>;
  generar: (indice: number, niveles: Record<string, number>, usados: Set<string>, contexto: unknown) => { pregunta: PreguntaMundo; clave: string };
  guardar: (niveles: Record<string, number>, userId: string) => Promise<void>;
}

// Columna de profiles que dice si ya lo hizo (Numeria: el onboarding general).
export function columnaDiagnostico(slug: MundoSlug): string {
  return slug === "numeria" ? "onboarding_completado" : `onboarding_${slug}_completado`;
}

// Regla de la web para mover el nivel después de cada respuesta.
export function ajustarNivel(nivel: number, correcto: boolean, timeMs: number): number {
  if (correcto && timeMs < tiempoEsperadoMs(nivel) * 0.8) return Math.min(10, nivel + 1);
  if (!correcto) return Math.max(1, nivel - 1);
  return nivel;
}

async function marcarHecho(slug: MundoSlug, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ [columnaDiagnostico(slug)]: true })
    .eq("id", userId);
  if (error) throw error;
}

// ¿Le falta el diagnóstico de este mundo? Sin conexión (o si no se puede leer)
// responde false: nunca se bloquea el juego por esto.
export async function faltaDiagnostico(slug: MundoSlug, userId: string): Promise<boolean> {
  if (slug === "geografia") return false;
  const columna = columnaDiagnostico(slug);
  const { data, error } = await supabase.from("profiles").select(columna).eq("id", userId).maybeSingle();
  if (error || !data) return false;
  return (data as unknown as Record<string, boolean | null>)[columna] === false;
}

// Modo de entrada de cada mundo (el mismo que diagnostica la web).
const MODO_DIAGNOSTICO: Partial<Record<MundoSlug, string>> = {
  quimia: "simbolos",
  anatomia: "oseo",
  melodia: "fundamentos",
  trigonometria: "razones",
  historia: "cronologia",
  calculia: "derivadas",
  circuitia: "serie",
  estadistica: "central",
  naipia: "hilo",
  codia: "salida",
};

const OPERACIONES = ["suma", "resta", "multiplicacion", "division"];

function diagnosticoNumeria(): Diagnostico {
  return {
    total: 12,
    tema: "suma, resta, multiplicación y división (3 de cada una)",
    claves: OPERACIONES,
    generar: (i, niveles, usados) => {
      const tipo = OPERACIONES[i % OPERACIONES.length];
      const p = nuevoProblemaNumeria("aritmetica", [tipo], niveles, usados);
      const r = p.respuesta;
      return {
        clave: tipo,
        pregunta: {
          enunciado: p.texto,
          entrada: r.tipo === "numero" ? { tipo: "numero", respuesta: r.valor, tolerancia: r.tolerancia, negativos: tipo === "resta" } : { tipo: "numero", respuesta: 0, tolerancia: 0 },
          solucion: p.solucion.replace(/^Era\s+/, ""),
          clave: p.clave,
        },
      };
    },
    guardar: async (n) => {
      const { error } = await supabase.rpc("guardar_diagnostico_numeria", { p_suma: n.suma, p_resta: n.resta, p_multiplicacion: n.multiplicacion, p_division: n.division });
      if (error) throw error;
    },
  };
}

// Enigmia: acertijos del banco cerca del nivel (de cualquier categoría) y el nivel
// resultante va a "patrones"; las demás categorías arrancan en 1 (filasDiagnostico).
function diagnosticoEnigmia(): Diagnostico {
  return {
    total: 8,
    tema: "acertijos de lógica",
    claves: ["nivel"],
    preparar: ENIGMIA.preparar,
    generar: (_i, niveles, usados, contexto) => {
      const banco = (contexto as LogicPuzzle[] | null) ?? [];
      const nivel = niveles.nivel;
      const cerca = banco.filter((p) => p.dificultad >= nivel - 1 && p.dificultad <= nivel + 1 && !usados.has(p.id));
      const pool = cerca.length > 0 ? cerca : banco.filter((p) => !usados.has(p.id));
      const p = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : generarAcertijoProcedural("patrones", nivel);
      const sec = p.contenido.secuencia;
      return {
        clave: "nivel",
        pregunta: {
          enunciado: p.contenido.enunciado,
          entrada: { tipo: "opciones", opciones: p.contenido.opciones, respuesta: p.respuesta },
          memoria: sec && sec.length > 0 ? { tipo: "lista", items: sec, ms: 1300 + 550 * sec.length } : undefined,
          clave: p.id,
        },
      };
    },
    guardar: async (n, userId) => {
      const { error } = await supabase.from("logic_skill_levels").upsert(filasDiagnostico(userId, "patrones", n.nivel), { onConflict: "user_id,categoria" });
      if (error) throw error;
    },
  };
}

export function diagnosticoDe(slug: MundoSlug): Diagnostico | null {
  if (slug === "numeria") return diagnosticoNumeria();
  if (slug === "enigmia") return diagnosticoEnigmia();
  const def = mundoJugable(slug);
  const modo = MODO_DIAGNOSTICO[slug];
  if (!def || !modo) return null;
  const nombreModo = def.modos.find((m) => m.id === modo)?.nombre ?? modo;
  return {
    total: 8,
    tema: nombreModo.toLowerCase(),
    claves: ["nivel"],
    generar: (_i, niveles, usados) => {
      // Naipia: en el diagnóstico las cartas siempre a la vista (sinMemoria, como la web).
      if (slug === "naipia") {
        const p = generarSinRepetir(() => generarProblemaNaipia("hilo", niveles.nivel, { sinMemoria: true }), claveNaipia, usados);
        return {
          clave: "nivel",
          pregunta: {
            enunciado: p.enunciado,
            entrada: { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, negativos: true },
            visuales: [{ tipo: "cartas", cartas: p.cartas.map((c) => ({ valor: c.valor, palo: c.palo })) }],
            clave: claveNaipia(p),
          },
        };
      }
      return { clave: "nivel", pregunta: def.generar(modo, niveles.nivel, usados, null) };
    },
    guardar: async (n, userId) => {
      const { error } = await supabase
        .from("skill_levels")
        .upsert({ user_id: userId, problem_type: problemTypeDe(def, modo), nivel: n.nivel, racha_actual: 0 }, { onConflict: "user_id,problem_type" });
      if (error) throw error;
    },
  };
}

// Guarda los niveles y la marca de "hecho".
export async function guardarDiagnostico(slug: MundoSlug, d: Diagnostico, niveles: Record<string, number>, userId: string) {
  await d.guardar(niveles, userId);
  // guardar_diagnostico_numeria ya marca onboarding_completado.
  if (slug !== "numeria") await marcarHecho(slug, userId);
}

export function nivelesIniciales(d: Diagnostico): Record<string, number> {
  return Object.fromEntries(d.claves.map((c) => [c, NIVEL_INICIAL_DIAGNOSTICO]));
}
