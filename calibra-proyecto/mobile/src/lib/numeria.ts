// Numeria en la app: las 6 secciones de la web (Aritmética, Geometría, Fracciones,
// Decimales, Potencias y Álgebra) con sus 20 temas. Los problemas los genera
// EXACTAMENTE el mismo código que la web (../calibra/src/lib/practica, vía el alias
// @/), cada tema calibra su propio nivel (skill_levels.problem_type) y el guardado
// usa las mismas RPC que /api/attempts y /api/practica/finish: el XP, el anti-apuro y
// la calibración se deciden en la base, nunca en el teléfono.
import { generarProblemaAlgebra, type TipoAlgebra } from "@/lib/practica/algebra";
import { generarProblemaDecimal, type TipoDecimal } from "@/lib/practica/decimales";
import { generarProblemaFraccion, type ProblemaFraccion, type TipoFraccion } from "@/lib/practica/fracciones";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { generarProblemaGeometria, type TipoGeometria } from "@/lib/practica/geometria";
import { generarProblemaPotencia, type TipoPotencia } from "@/lib/practica/potencias";
import { generarProblema, type Problem } from "@/lib/practica/problems";
import { operacionPermitidaInvitado, temaAvanzadoBloqueadoParaInvitado } from "@/lib/auth/accesoInvitado";
import { textoConFormulas } from "~/ui/TextoMate";
import { guardarIntentoTipo } from "./partida";
import { supabase } from "./supabase";

export type Operacion = "suma" | "resta" | "multiplicacion" | "division";
export type { Problem };
export type SeccionId = "aritmetica" | "geometria" | "fracciones" | "decimales" | "potencias" | "algebra";

export interface TemaNumeria {
  id: string; // sub-tema dentro de la sección (p. ej. "simplificar")
  problemType: string; // skill_levels / attempts
  nombre: string;
  simbolo: string;
}

export interface SeccionNumeria {
  id: SeccionId;
  nombre: string;
  simbolo: string;
  descripcion: string;
  temas: TemaNumeria[];
}

const tema = (seccion: SeccionId, id: string, nombre: string, simbolo: string): TemaNumeria => ({
  id,
  problemType: seccion === "aritmetica" ? id : `${seccion}_${id}`,
  nombre,
  simbolo,
});

export const SECCIONES: SeccionNumeria[] = [
  {
    id: "aritmetica",
    nombre: "Aritmética",
    simbolo: "±",
    descripcion: "Cálculo mental: las 4 operaciones.",
    temas: [tema("aritmetica", "suma", "Suma", "+"), tema("aritmetica", "resta", "Resta", "−"), tema("aritmetica", "multiplicacion", "Multiplicación", "×"), tema("aritmetica", "division", "División", "÷")],
  },
  {
    id: "geometria",
    nombre: "Geometría",
    simbolo: "△",
    descripcion: "Perímetros, áreas, ángulos y ternas, de cabeza.",
    temas: [tema("geometria", "perimetro", "Perímetro", "▭"), tema("geometria", "area", "Área", "▦"), tema("geometria", "angulos", "Ángulos", "∠"), tema("geometria", "ternas", "Ternas", "◺")],
  },
  {
    id: "fracciones",
    nombre: "Fracciones",
    simbolo: "½",
    descripcion: "Simplificar, comparar y sumar fracciones.",
    temas: [tema("fracciones", "simplificar", "Simplificar", "⁶⁄₈"), tema("fracciones", "comparar", "Comparar", "<"), tema("fracciones", "sumar", "Sumar", "+")],
  },
  {
    id: "decimales",
    nombre: "Decimales",
    simbolo: "0,5",
    descripcion: "Convertir, porcentajes y redondeo.",
    temas: [tema("decimales", "convertir", "Convertir", "→"), tema("decimales", "porcentaje", "Porcentaje", "%"), tema("decimales", "redondear", "Redondear", "≈")],
  },
  {
    id: "potencias",
    nombre: "Potencias",
    simbolo: "x²",
    descripcion: "Potencias, raíces y notación científica.",
    temas: [tema("potencias", "potencia", "Potencias", "x²"), tema("potencias", "raiz", "Raíces", "√"), tema("potencias", "notacion", "Notación", "10ⁿ")],
  },
  {
    id: "algebra",
    nombre: "Álgebra",
    simbolo: "x",
    descripcion: "Evaluar y despejar ecuaciones simples.",
    temas: [tema("algebra", "evaluar", "Evaluar", "x="), tema("algebra", "un-paso", "Un paso", "x"), tema("algebra", "dos-pasos", "Dos pasos", "2x")],
  },
];

export const SECCION_POR_ID = Object.fromEntries(SECCIONES.map((s) => [s.id, s])) as Record<SeccionId, SeccionNumeria>;
export const OPERACIONES = SECCION_POR_ID.aritmetica.temas.map((t) => ({ tipo: t.id as Operacion, nombre: t.nombre, simbolo: t.simbolo }));
export const TODOS_LOS_TIPOS = SECCIONES.flatMap((s) => s.temas.map((t) => t.problemType));

export const DURACION_SPRINT_MS = 60_000;

export function temaDisponible(problemType: string, esInvitado: boolean): boolean {
  if (!esInvitado) return true;
  if (temaAvanzadoBloqueadoParaInvitado(problemType)) return false;
  return operacionPermitidaInvitado(problemType as Operacion);
}

// Compatibilidad con el nombre anterior (solo aritmética).
export function operacionDisponible(tipo: Operacion, esInvitado: boolean): boolean {
  return temaDisponible(tipo, esInvitado);
}

export async function cargarNivelesNumeria(userId: string): Promise<Record<string, number>> {
  const niveles: Record<string, number> = Object.fromEntries(TODOS_LOS_TIPOS.map((t) => [t, 1]));
  const { data } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", userId).in("problem_type", TODOS_LOS_TIPOS);
  for (const fila of data ?? []) niveles[fila.problem_type as string] = fila.nivel as number;
  return niveles;
}

export async function cargarNiveles(userId: string): Promise<Record<Operacion, number>> {
  const n = await cargarNivelesNumeria(userId);
  return { suma: n.suma, resta: n.resta, multiplicacion: n.multiplicacion, division: n.division };
}

// ---------- Problema unificado para el sprint ----------

export type Respuesta = { tipo: "numero"; valor: number; tolerancia: number } | { tipo: "fraccion"; num: number; den: number } | { tipo: "comparar"; valor: "<" | "=" | ">" };

export interface ProblemaNumeria {
  problemType: string;
  nivel: number;
  texto: string; // listo para mostrar (fórmulas ya pasadas a Unicode)
  grande: boolean; // operación corta: se muestra con el número gigante
  respuesta: Respuesta;
  solucion: string; // "Era …"
  clave: string; // para no repetir en la misma partida
  original?: Problem; // aritmética: el problema de la web (semilla de duelos)
}

function textoFraccion(f: [number, number]) {
  return `${f[0]}/${f[1]}`;
}

function desdeAritmetica(p: Problem): ProblemaNumeria {
  return {
    problemType: p.problemType,
    nivel: p.nivel,
    texto: p.incognitaB ? `${p.a} ${p.symbol} ? = ${p.b}` : `${p.a} ${p.symbol} ${p.b}`,
    grande: true,
    respuesta: { tipo: "numero", valor: p.answer, tolerancia: 0 },
    solucion: String(p.answer),
    clave: `${p.problemType}:${p.a}${p.symbol}${p.b}${p.incognitaB ? "?" : ""}`,
    original: p,
  };
}

function desdeFraccion(p: ProblemaFraccion): ProblemaNumeria {
  const problemType = `fracciones_${p.tipo}`;
  if (p.tipo === "comparar" && p.frac1 && p.frac2 && p.respuestaComparacion) {
    return {
      problemType,
      nivel: p.nivel,
      texto: `${textoFraccion(p.frac1)}  ?  ${textoFraccion(p.frac2)}`,
      grande: true,
      respuesta: { tipo: "comparar", valor: p.respuestaComparacion },
      solucion: p.respuestaComparacion,
      clave: `comparar:${textoFraccion(p.frac1)}:${textoFraccion(p.frac2)}`,
    };
  }
  const [num, den] = p.respuestaFraccion ?? [0, 1];
  const texto = p.tipo === "simplificar" && p.frac ? `Simplifica ${textoFraccion(p.frac)}` : p.frac1 && p.frac2 ? `${textoFraccion(p.frac1)} + ${textoFraccion(p.frac2)}` : "";
  return {
    problemType,
    nivel: p.nivel,
    texto,
    grande: p.tipo === "sumar",
    respuesta: { tipo: "fraccion", num, den },
    solucion: `${num}/${den}`,
    clave: `${p.tipo}:${texto}`,
  };
}

function desdeEnunciado(seccion: SeccionId, p: { tipo: string; enunciado: string; respuesta: number; tolerancia: number }, nivel: number): ProblemaNumeria {
  const texto = textoConFormulas(p.enunciado);
  return {
    problemType: `${seccion}_${p.tipo}`,
    nivel,
    texto,
    grande: texto.length <= 14,
    respuesta: { tipo: "numero", valor: p.respuesta, tolerancia: p.tolerancia },
    solucion: String(p.respuesta).replace(".", ","),
    clave: `${p.tipo}:${p.enunciado}`,
  };
}

// Genera el próximo problema de los temas elegidos (todos de la misma sección).
// `rng` solo existe en duelos de aritmética: los dos rivales reciben la misma serie.
export function nuevoProblemaNumeria(seccion: SeccionId, temas: string[], niveles: Record<string, number>, usados: Set<string>, rng?: () => number): ProblemaNumeria {
  return generarSinRepetir(
    () => {
      switch (seccion) {
        case "aritmetica": {
          const tipo = temas[Math.floor((rng ?? Math.random)() * temas.length)] as Operacion;
          return desdeAritmetica(generarProblema(tipo, niveles[tipo] ?? 1, undefined, rng));
        }
        case "fracciones": {
          const n = Object.fromEntries(temas.map((t) => [t, niveles[`fracciones_${t}`] ?? 1])) as Record<TipoFraccion, number>;
          return desdeFraccion(generarProblemaFraccion(n, temas as TipoFraccion[]));
        }
        case "geometria": {
          const n = Object.fromEntries(temas.map((t) => [t, niveles[`geometria_${t}`] ?? 1])) as Record<TipoGeometria, number>;
          const p = generarProblemaGeometria(n, temas as TipoGeometria[]);
          return desdeEnunciado("geometria", p, n[p.tipo]);
        }
        case "decimales": {
          const n = Object.fromEntries(temas.map((t) => [t, niveles[`decimales_${t}`] ?? 1])) as Record<TipoDecimal, number>;
          const p = generarProblemaDecimal(n, temas as TipoDecimal[]);
          return desdeEnunciado("decimales", p, n[p.tipo]);
        }
        case "potencias": {
          const n = Object.fromEntries(temas.map((t) => [t, niveles[`potencias_${t}`] ?? 1])) as Record<TipoPotencia, number>;
          const p = generarProblemaPotencia(n, temas as TipoPotencia[]);
          return desdeEnunciado("potencias", p, n[p.tipo]);
        }
        case "algebra": {
          const n = Object.fromEntries(temas.map((t) => [t, niveles[`algebra_${t}`] ?? 1])) as Record<TipoAlgebra, number>;
          const p = generarProblemaAlgebra(n, temas as TipoAlgebra[]);
          return desdeEnunciado("algebra", p, n[p.tipo]);
        }
      }
    },
    (p) => p.clave,
    usados
  );
}

export function esCorrecta(p: ProblemaNumeria, entrada: { texto: string; num?: string; den?: string; comparacion?: string }): boolean {
  const r = p.respuesta;
  if (r.tipo === "comparar") return entrada.comparacion === r.valor;
  if (r.tipo === "fraccion") return Number(entrada.num) === r.num && Number(entrada.den) === r.den;
  const valor = Number(entrada.texto.replace(",", "."));
  return Number.isFinite(valor) && Math.abs(valor - r.valor) <= r.tolerancia + 1e-9;
}

export function guardarIntentoNumeria(p: ProblemaNumeria, correcto: boolean, timeMs: number, protegido = false) {
  return guardarIntentoTipo(p.problemType, p.nivel, correcto, timeMs, protegido);
}
