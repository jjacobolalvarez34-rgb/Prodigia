// Aprender en la app: Técnicas (gratis) y Clases (Pro, la primera es preview gratis)
// de los 13 mundos. El camino (qué lecciones hay, en qué orden, cuál está
// completada, activa o bloqueada y por qué) lo calcula el MISMO código de la web
// (`lib/<mundo>/path.ts`, `lib/aprender/*`): la app no recalcula ningún estado, así
// que web y app muestran exactamente lo mismo (docs/PARIDAD_APP_WEB.md).
import { agruparNodos } from "@/lib/aprender/grupos";
import { partirCaminoPorClases } from "@/lib/aprender/clases";
import { obtenerCaminoConClasesNumeria } from "@/lib/aprender/pathClases";
import type { VisualLeccion } from "@/lib/aprender/visuales";
import { obtenerCaminoAnatomia } from "@/lib/anatomia/path";
import { obtenerCaminoCalculia } from "@/lib/calculia/path";
import { obtenerCaminoCircuitia } from "@/lib/circuitia/path";
import { obtenerCaminoCodia } from "@/lib/codia/path";
import { obtenerCaminoDinamia, obtenerCaminoVitalia } from "@/lib/aprender/caminoPorTema";
import { obtenerCaminoConClasesEnigmia } from "@/lib/enigmia/pathClases";
import { obtenerCaminoEstadistica } from "@/lib/estadistica/path";
import { obtenerCaminoGeografia } from "@/lib/geografia/path";
import { obtenerCaminoHistoria } from "@/lib/historia/path";
import { obtenerCaminoMelodia } from "@/lib/melodia/path";
import { obtenerCaminoNaipia } from "@/lib/naipia/path";
import { obtenerCaminoQuimia } from "@/lib/quimia/path";
import { obtenerCaminoTrigonometria } from "@/lib/trigonometria/path";
import { verificarLogros } from "@/lib/logros/verificar";
import { verificarTitulos } from "@/lib/titulos/verificar";
import type { TechniqueQuizPregunta } from "@/types/database";
import type { MundoSlug } from "~/tema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { conCopia, encolar, esErrorDeRed } from "./sinConexion";
import { supabase } from "./supabase";

type ClienteWeb = Parameters<typeof verificarLogros>[0];

export type EstadoLeccion = "completado" | "activo" | "bloqueado";

export interface NodoLeccion {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; visuales?: VisualLeccion[]; quiz?: TechniqueQuizPregunta[] };
  estado: EstadoLeccion;
  requierePro: boolean;
  bloqueadoPorPlan: boolean;
}

export interface GrupoLecciones {
  id: string;
  nombre: string;
  nodos: NodoLeccion[];
}

export interface CaminoMundo {
  tecnicas: GrupoLecciones[];
  clases: GrupoLecciones[] | null;
  nodos: NodoLeccion[];
  dominadas: number;
}

type Cargador = (sb: ClienteWeb, userId: string, esPro: boolean) => Promise<NodoLeccion[]>;
const comoNodos = <T>(p: Promise<T[]>) => p as unknown as Promise<NodoLeccion[]>;

// Una función por mundo: la misma que usa la página /<mundo>/aprender de la web.
const CAMINOS: Record<MundoSlug, Cargador> = {
  numeria: (sb, u, p) => comoNodos(obtenerCaminoConClasesNumeria(sb as never, u, p)),
  enigmia: (sb, u, p) => comoNodos(obtenerCaminoConClasesEnigmia(sb as never, u, p)),
  geografia: (sb, u, p) => comoNodos(obtenerCaminoGeografia(sb as never, u, p)),
  quimia: (sb, u, p) => comoNodos(obtenerCaminoQuimia(sb as never, u, p)),
  anatomia: (sb, u, p) => comoNodos(obtenerCaminoAnatomia(sb as never, u, p)),
  melodia: (sb, u, p) => comoNodos(obtenerCaminoMelodia(sb as never, u, p)),
  trigonometria: (sb, u, p) => comoNodos(obtenerCaminoTrigonometria(sb as never, u, p)),
  historia: (sb, u, p) => comoNodos(obtenerCaminoHistoria(sb as never, u, p)),
  calculia: (sb, u, p) => comoNodos(obtenerCaminoCalculia(sb as never, u, p)),
  circuitia: (sb, u, p) => comoNodos(obtenerCaminoCircuitia(sb as never, u, p)),
  estadistica: (sb, u, p) => comoNodos(obtenerCaminoEstadistica(sb as never, u, p)),
  naipia: (sb, u, p) => comoNodos(obtenerCaminoNaipia(sb as never, u, p)),
  codia: (sb, u, p) => comoNodos(obtenerCaminoCodia(sb as never, u, p)),
  dinamia: (sb, u, p) => comoNodos(obtenerCaminoDinamia(sb as never, u, p)),
  vitalia: (sb, u, p) => comoNodos(obtenerCaminoVitalia(sb as never, u, p)),
};

// Enigmia guarda sus lecciones aparte (logic_techniques); el resto en techniques.
export function tablaLecciones(mundo: MundoSlug): "techniques" | "logic_techniques" {
  return mundo === "enigmia" ? "logic_techniques" : "techniques";
}

function agrupar(nodos: NodoLeccion[], mundo: MundoSlug, pestana: "tecnicas" | "clases"): GrupoLecciones[] {
  return agruparNodos(nodos, mundo, pestana, "es").map((g) => ({ id: g.id, nombre: g.nombre, nodos: g.nodos }));
}

// ---------- Sin conexión ----------
// Las lecciones se guardan en el teléfono (contenido completo: pasos, visuales y
// quiz) y se pueden hacer sin internet. Una lección completada sin conexión queda
// marcada acá y en la cola de sinConexion.ts hasta que la base la confirma.
const CLAVE_LOCALES = "prodigia:lecciones-completadas";
let locales: Set<string> | null = null;

async function leccionesLocales(): Promise<Set<string>> {
  if (locales) return locales;
  try {
    locales = new Set(JSON.parse((await AsyncStorage.getItem(CLAVE_LOCALES)) ?? "[]") as string[]);
  } catch {
    locales = new Set();
  }
  return locales;
}

async function guardarLocales() {
  if (!locales) return;
  await AsyncStorage.setItem(CLAVE_LOCALES, JSON.stringify([...locales])).catch(() => undefined);
}

export function quitarLeccionLocal(id: string) {
  if (!locales?.delete(id)) return;
  guardarLocales();
}

// Recalcula los estados con las completadas sin conexión: la completada pasa a
// "completado" y la siguiente bloqueada de su mismo grupo se abre (la misma regla
// de la web: una activa por tema; las Clases bloqueadas por plan no se tocan).
function aplicarLocales(grupos: GrupoLecciones[], hechas: Set<string>): GrupoLecciones[] {
  if (hechas.size === 0) return grupos;
  return grupos.map((g) => {
    let abrir = false;
    const nodos = g.nodos.map((n) => {
      if (hechas.has(n.id) && n.estado !== "completado") {
        abrir = true;
        return { ...n, estado: "completado" as const };
      }
      if (abrir && n.estado === "bloqueado" && !n.bloqueadoPorPlan) {
        abrir = false;
        return { ...n, estado: "activo" as const };
      }
      if (n.estado === "activo") abrir = false;
      return n;
    });
    return { ...g, nodos };
  });
}

// Camino de un mundo, partido en las dos pestañas y agrupado por tema (los mismos
// grupos que el menú lateral de la web). Sin conexión, la última copia guardada.
export async function cargarCamino(mundo: MundoSlug, userId: string, esPro: boolean): Promise<CaminoMundo | null> {
  const [nodosBase, hechas] = await Promise.all([
    conCopia(`aprender:${mundo}:${userId}:${esPro ? "pro" : "free"}`, async () => {
      const n = await CAMINOS[mundo](supabase as unknown as ClienteWeb, userId, esPro);
      return n.length > 0 ? n : null;
    }),
    leccionesLocales(),
  ]);
  if (!nodosBase) return null;
  const nodos = nodosBase.map((n) => (hechas.has(n.id) ? { ...n, estado: "completado" as const } : n));
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  return {
    tecnicas: aplicarLocales(agrupar(tecnicas, mundo, "tecnicas"), hechas),
    clases: hayClases ? aplicarLocales(agrupar(clases, mundo, "clases"), hechas) : null,
    nodos,
    dominadas: nodos.filter((n) => n.estado === "completado").length,
  };
}

// Las lecciones del camino ya agrupado, en el orden en que se ven (para que la
// pantalla de una lección sepa cuál sigue).
export function nodosEnOrden(grupos: GrupoLecciones[]): NodoLeccion[] {
  return grupos.flatMap((g) => g.nodos);
}

export interface ResultadoLeccion {
  aprobado: boolean;
  incorrectas: number[];
  logros: { nombre: string; descripcion: string }[];
}

// Completar una lección: la base valida el quiz y el plan (completar_leccion, 0246).
// Sin conexión: se valida acá con las respuestas de la lección y se encola.
export async function completarLeccion(mundo: MundoSlug, leccion: NodoLeccion, respuestas: string[] | null): Promise<ResultadoLeccion & { sinConexion?: boolean }> {
  const leccionId = leccion.id;
  const r = await supabase.rpc("completar_leccion", { p_tabla: tablaLecciones(mundo), p_technique_id: leccionId, p_respuestas: respuestas }).then(
    (x) => x,
    (e: unknown) => ({ data: null, error: e as { message: string; code?: string } })
  );
  const { data, error } = r;
  if (error && esErrorDeRed(error)) {
    const quiz = leccion.contenido.quiz ?? [];
    const incorrectas = quiz.map((q, i) => (respuestas?.[i] === q.respuesta ? -1 : i)).filter((i) => i >= 0);
    if (quiz.length > 0 && incorrectas.length > 0) return { aprobado: false, incorrectas, logros: [] };
    await encolar({ tipo: "leccion", tabla: tablaLecciones(mundo), leccionId, respuestas });
    (await leccionesLocales()).add(leccionId);
    await guardarLocales();
    return { aprobado: true, incorrectas: [], logros: [], sinConexion: true };
  }
  if (error) {
    if (error.code === "PGRST202") throw new Error("Falta aplicar la migración 0246 en la base para completar lecciones desde la app.");
    if (error.message.includes("plan Pro")) throw new Error("Esta clase es de Prodigia Pro.");
    throw error;
  }
  const fila = (data as { aprobado: boolean; incorrectas: number[] | null }[] | null)?.[0];
  if (!fila?.aprobado) return { aprobado: false, incorrectas: fila?.incorrectas ?? [], logros: [] };
  let logros: ResultadoLeccion["logros"] = [];
  const { data: sesion } = await supabase.auth.getSession();
  const uid = sesion.session?.user.id;
  if (uid) {
    logros = (await verificarLogros(supabase as unknown as ClienteWeb, uid).catch(() => [])).map((l) => ({ nombre: l.nombre, descripcion: l.descripcion }));
    await verificarTitulos(supabase as unknown as ClienteWeb, uid).catch(() => []);
  }
  return { aprobado: true, incorrectas: [], logros };
}

// Descarga en segundo plano el camino de los 13 mundos (con el contenido completo de
// cada lección) para que Aprender funcione sin internet aunque nunca se haya abierto
// ese mundo. Se llama al arrancar la app, de a un mundo por vez.
let precargado = false;
export async function precargarAprender(userId: string, esPro: boolean, mundos: MundoSlug[]) {
  if (precargado) return;
  precargado = true;
  for (const m of mundos) {
    await cargarCamino(m, userId, esPro).catch(() => null);
    await new Promise((r) => setTimeout(r, 400));
  }
}
