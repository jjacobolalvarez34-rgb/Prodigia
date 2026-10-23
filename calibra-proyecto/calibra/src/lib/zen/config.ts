// Personalización del Modo Zen (pedido 2026-10-23), compartida por la web y la app:
// qué temas (uno o varios), la dificultad (un nivel o un rango que sube poco a poco),
// cuántas preguntas y las opciones propias de cada mundo. Todo sale de parámetros que
// los generadores YA aceptan (los modificadores de aritmética, el tipo de pregunta de
// Geografía, el lenguaje de Codia): no se inventa contenido.
//
// La configuración se guarda en el dispositivo (localStorage / AsyncStorage) y se
// vuelve a leer con `normalizarConfigZen`, que tolera configuraciones viejas o rotas.
import { ADAPTADORES, type MundoSlug } from "@/lib/mundosJugables";
import { TIPOS_ALGEBRA } from "@/lib/practica/algebra";
import { TIPOS_DECIMAL } from "@/lib/practica/decimales";
import { TIPOS_FRACCION } from "@/lib/practica/fracciones";
import { TIPOS_GEOMETRIA } from "@/lib/practica/geometria";
import { TIPOS_POTENCIA } from "@/lib/practica/potencias";
import { rangoOperandos } from "@/lib/practica/problems";
import type { ModifierSlug } from "@/types/database";

export const LARGOS_ZEN = [10, 15, 20] as const;
export const NIVEL_MIN = 1;
export const NIVEL_MAX = 10;

export interface TemaZen {
  id: string;
  nombre: string;
  simbolo: string;
  // Numeria: la sección a la que pertenece el subtema (para agruparlos).
  grupo?: string;
}

export interface GrupoZen {
  id: string;
  nombre: string;
  simbolo: string;
}

export type OpcionZen =
  // Sí/no. `temas`: solo se muestra (y solo cuenta) si hay alguno de esos temas elegido.
  | { tipo: "interruptor"; id: string; nombre: string; detalle: string; temas?: string[] }
  // Una entre varias; la primera es la de por defecto.
  | { tipo: "eleccion"; id: string; nombre: string; valores: { id: string; nombre: string }[] };

export interface ConfigZen {
  temas: string[];
  nivelMin: number;
  nivelMax: number;
  preguntas: number;
  opciones: Record<string, string | boolean>;
}

// ---------- Temas ----------

export const GRUPOS_NUMERIA: GrupoZen[] = [
  { id: "aritmetica", nombre: "Aritmética", simbolo: "±" },
  { id: "geometria", nombre: "Geometría", simbolo: "△" },
  { id: "fracciones", nombre: "Fracciones", simbolo: "½" },
  { id: "decimales", nombre: "Decimales", simbolo: "0,5" },
  { id: "potencias", nombre: "Potencias", simbolo: "x²" },
  { id: "algebra", nombre: "Álgebra", simbolo: "x" },
];

// Nombre y símbolo de cada subtema (los mismos de la pantalla de Numeria de la app).
// Si un generador suma un tipo nuevo, aparece igual con su id como nombre.
const SUBTEMAS_NUMERIA: Record<string, { nombre: string; simbolo: string }> = {
  suma: { nombre: "Suma", simbolo: "+" },
  resta: { nombre: "Resta", simbolo: "−" },
  multiplicacion: { nombre: "Multiplicación", simbolo: "×" },
  division: { nombre: "División", simbolo: "÷" },
  perimetro: { nombre: "Perímetro", simbolo: "▭" },
  area: { nombre: "Área", simbolo: "▦" },
  angulos: { nombre: "Ángulos", simbolo: "∠" },
  ternas: { nombre: "Ternas", simbolo: "◺" },
  simplificar: { nombre: "Simplificar", simbolo: "⁶⁄₈" },
  comparar: { nombre: "Comparar", simbolo: "<" },
  sumar: { nombre: "Sumar", simbolo: "+" },
  convertir: { nombre: "Convertir", simbolo: "→" },
  porcentaje: { nombre: "Porcentaje", simbolo: "%" },
  redondear: { nombre: "Redondear", simbolo: "≈" },
  potencia: { nombre: "Potencias", simbolo: "x²" },
  raiz: { nombre: "Raíces", simbolo: "√" },
  notacion: { nombre: "Notación", simbolo: "10ⁿ" },
  evaluar: { nombre: "Evaluar", simbolo: "x=" },
  "un-paso": { nombre: "Un paso", simbolo: "x" },
  "dos-pasos": { nombre: "Dos pasos", simbolo: "2x" },
};

export const ARITMETICA = ["suma", "resta", "multiplicacion", "division"] as const;
export type OperacionZen = (typeof ARITMETICA)[number];

const TIPOS_POR_GRUPO: Record<string, readonly string[]> = {
  aritmetica: ARITMETICA,
  geometria: TIPOS_GEOMETRIA,
  fracciones: TIPOS_FRACCION,
  decimales: TIPOS_DECIMAL,
  potencias: TIPOS_POTENCIA,
  algebra: TIPOS_ALGEBRA,
};

// Id de un subtema de Numeria: «seccion:tipo» (p. ej. «fracciones:sumar»).
export function idSubtema(grupo: string, tipo: string): string {
  return `${grupo}:${tipo}`;
}

export function partirSubtema(id: string): { grupo: string; tipo: string } {
  const i = id.indexOf(":");
  return i < 0 ? { grupo: id, tipo: "" } : { grupo: id.slice(0, i), tipo: id.slice(i + 1) };
}

function temasNumeria(): TemaZen[] {
  return GRUPOS_NUMERIA.flatMap((g) =>
    TIPOS_POR_GRUPO[g.id].map((tipo) => ({
      id: idSubtema(g.id, tipo),
      nombre: SUBTEMAS_NUMERIA[tipo]?.nombre ?? tipo.charAt(0).toUpperCase() + tipo.slice(1),
      simbolo: SUBTEMAS_NUMERIA[tipo]?.simbolo ?? "·",
      grupo: g.id,
    }))
  );
}

export const CONTINENTES_ZEN: TemaZen[] = [
  { id: "america", nombre: "América", simbolo: "AM" },
  { id: "europa", nombre: "Europa", simbolo: "EU" },
  { id: "africa", nombre: "África", simbolo: "AF" },
  { id: "asia_oceania", nombre: "Asia y Oceanía", simbolo: "AS" },
];

export function temasZen(slug: string): TemaZen[] {
  if (slug === "numeria") return temasNumeria();
  if (slug === "geografia") return CONTINENTES_ZEN;
  const def = ADAPTADORES[slug as MundoSlug];
  // Enigmia trae su propia «mezcla»: en Zen la mezcla es elegir varias categorías.
  return def ? def.modos.filter((m) => m.id !== "mezcla").map((m) => ({ id: m.id, nombre: m.nombre, simbolo: m.simbolo })) : [];
}

// ---------- Opciones propias de cada mundo ----------

export const TIPOS_PREGUNTA_GEOGRAFIA = ["nivel", "mapa", "mixto", "lugares"] as const;
export type TipoPreguntaGeografia = (typeof TIPOS_PREGUNTA_GEOGRAFIA)[number];

export function opcionesZen(slug: string): OpcionZen[] {
  if (slug === "numeria") {
    return [
      { tipo: "interruptor", id: "negativos", nombre: "Restas con resultado negativo", detalle: "8 − 13 = −5", temas: ["aritmetica:resta"] },
      { tipo: "interruptor", id: "inverso", nombre: "El factor que falta", detalle: "7 × ? = 56", temas: ["aritmetica:multiplicacion"] },
      { tipo: "interruptor", id: "grandes", nombre: "Números más grandes", detalle: "Sumas y multiplicaciones un escalón más arriba", temas: ["aritmetica:suma", "aritmetica:multiplicacion"] },
    ];
  }
  if (slug === "geografia") {
    return [
      {
        tipo: "eleccion",
        id: "preguntas",
        nombre: "Tipo de pregunta",
        valores: [
          { id: "nivel", nombre: "Según el nivel" },
          { id: "mapa", nombre: "Solo el mapa" },
          { id: "mixto", nombre: "Mapa y lugares" },
          { id: "lugares", nombre: "Solo lugares" },
        ],
      },
    ];
  }
  const def = ADAPTADORES[slug as MundoSlug];
  // Codia (y cualquier mundo con `filtro`): el lenguaje que el generador ya acepta.
  if (def?.filtro) return [{ tipo: "eleccion", id: "filtro", nombre: def.filtro.titulo, valores: def.filtro.opciones }];
  return [];
}

// ¿La opción se muestra con estos temas?
export function opcionVisible(o: OpcionZen, temas: string[]): boolean {
  return o.tipo !== "interruptor" || !o.temas || o.temas.some((t) => temas.includes(t));
}

// ---------- Configuración ----------

const acotar = (n: unknown, def: number) => (typeof n === "number" && Number.isFinite(n) ? Math.max(NIVEL_MIN, Math.min(NIVEL_MAX, Math.round(n))) : def);

export function temasPorDefecto(slug: string): string[] {
  const temas = temasZen(slug);
  if (slug === "numeria") return temas.filter((t) => t.grupo === "aritmetica").map((t) => t.id);
  return temas.slice(0, 1).map((t) => t.id);
}

// Pasa cualquier cosa guardada (o nada) a una configuración válida para este mundo.
// `nivelInicial`: el de la primera vez (el nivel del jugador en el tema).
export function normalizarConfigZen(slug: string, crudo: unknown, nivelInicial = 3): ConfigZen {
  const r = (crudo && typeof crudo === "object" ? crudo : {}) as Record<string, unknown>;
  const validos = new Set(temasZen(slug).map((t) => t.id));
  let temas = Array.isArray(r.temas) ? [...new Set(r.temas.filter((t): t is string => typeof t === "string" && validos.has(t)))] : [];
  // Configuración de antes (un solo `tema`, «mezcla» o, en Numeria, una sección entera).
  if (temas.length === 0 && typeof r.tema === "string") {
    if (r.tema === "mezcla") temas = [...validos];
    else if (validos.has(r.tema)) temas = [r.tema];
    else if (slug === "numeria") temas = temasZen(slug).filter((t) => t.grupo === r.tema).map((t) => t.id);
  }
  if (temas.length === 0) temas = temasPorDefecto(slug);

  const inicial = acotar(nivelInicial, 3);
  let nivelMin = acotar(r.nivelMin ?? r.nivel, inicial);
  let nivelMax = acotar(r.nivelMax ?? r.nivel, nivelMin);
  if (nivelMax < nivelMin) [nivelMin, nivelMax] = [nivelMax, nivelMin];

  const preguntas = (LARGOS_ZEN as readonly number[]).includes(r.preguntas as number) ? (r.preguntas as number) : LARGOS_ZEN[0];

  const guardadas = (r.opciones && typeof r.opciones === "object" ? r.opciones : {}) as Record<string, unknown>;
  const opciones: Record<string, string | boolean> = {};
  for (const o of opcionesZen(slug)) {
    const v = guardadas[o.id];
    if (o.tipo === "interruptor") opciones[o.id] = v === true;
    else opciones[o.id] = typeof v === "string" && o.valores.some((x) => x.id === v) ? v : o.valores[0].id;
  }
  return { temas, nivelMin, nivelMax, preguntas, opciones };
}

// Nivel de la pregunta `indice` (0…total−1): con un rango, sube parejo del mínimo al
// máximo (la primera en el mínimo, la última en el máximo).
export function nivelDePregunta(config: Pick<ConfigZen, "nivelMin" | "nivelMax" | "preguntas">, indice: number): number {
  const { nivelMin, nivelMax, preguntas } = config;
  if (nivelMax <= nivelMin || preguntas <= 1) return nivelMin;
  const t = Math.max(0, Math.min(1, indice / (preguntas - 1)));
  return Math.round(nivelMin + (nivelMax - nivelMin) * t);
}

// Modificador de aritmética para una operación según las opciones elegidas (si hay
// más de uno posible, uno al azar en cada pregunta).
export function modificadorAritmetica(op: OperacionZen, opciones: Record<string, string | boolean>, azar: () => number = Math.random): ModifierSlug | undefined {
  const posibles: ModifierSlug[] = [];
  if (op === "resta" && opciones.negativos) posibles.push("negativos");
  if (op === "multiplicacion" && opciones.inverso) posibles.push("inverso");
  if ((op === "suma" || op === "multiplicacion") && opciones.grandes) posibles.push("numeros_grandes");
  return posibles.length ? posibles[Math.floor(azar() * posibles.length)] : undefined;
}

// ---------- Rango de números (Numeria, aritmética) ----------

const miles = (x: number) => x.toLocaleString("es");

// «1–99» para sumas y restas; «12 × 12» (los factores más grandes) para multiplicar;
// «144 ÷ 12» (el dividendo y divisor más grandes) para dividir.
export function textoRango(op: OperacionZen, nivel: number, opciones: Record<string, string | boolean>): string {
  // Con «números grandes» la banda sube; se muestra el caso con el modificador
  // (es el que más se ve) si está activado.
  const mod = op === "suma" || op === "multiplicacion" ? (opciones.grandes ? "numeros_grandes" : undefined) : undefined;
  const r = rangoOperandos(op, nivel, mod);
  if (op === "suma" || op === "resta") return `${miles(r.a[0])}–${miles(r.a[1])}`;
  if (op === "multiplicacion") return `${miles(r.a[1])} × ${miles(r.b[1])}`;
  return `${miles(r.a[1] * r.b[1])} ÷ ${miles(r.a[1])}`;
}

export interface LineaRango {
  op: OperacionZen;
  desde: string;
  // Con un rango de niveles: cómo termina (si cambia).
  hasta: string | null;
}

export function rangosAritmetica(config: Pick<ConfigZen, "temas" | "nivelMin" | "nivelMax" | "opciones">): LineaRango[] {
  return ARITMETICA.filter((op) => config.temas.includes(idSubtema("aritmetica", op))).map((op) => {
    const desde = textoRango(op, config.nivelMin, config.opciones);
    const hasta = textoRango(op, config.nivelMax, config.opciones);
    return { op, desde, hasta: hasta === desde ? null : hasta };
  });
}

// ---------- Nivel del jugador ----------

// problem_type de skill_levels de un tema (para arrancar en el nivel del jugador).
export function problemTypeDeTema(slug: string, tema: string): string {
  if (slug !== "numeria") return `${slug}_${tema}`;
  const { grupo, tipo } = partirSubtema(tema);
  return grupo === "aritmetica" ? tipo : `${grupo}_${tipo}`;
}

// El nivel del jugador en los temas elegidos (promedio redondeado), o null si no se sabe.
export function nivelSugerido(temas: string[], niveles: Record<string, number>): number | null {
  const conocidos = temas.map((t) => niveles[t]).filter((n): n is number => typeof n === "number" && n >= NIVEL_MIN);
  if (conocidos.length === 0) return null;
  return Math.max(NIVEL_MIN, Math.min(NIVEL_MAX, Math.round(conocidos.reduce((a, b) => a + b, 0) / conocidos.length)));
}
