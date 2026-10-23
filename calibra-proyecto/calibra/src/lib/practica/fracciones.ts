export type TipoFraccion = "simplificar" | "comparar" | "sumar";

export interface ProblemaFraccion {
  tipo: TipoFraccion;
  nivel: number;
  // simplificar: una fracción a reducir
  frac?: [number, number];
  // comparar / sumar: dos fracciones
  frac1?: [number, number];
  frac2?: [number, number];
  // respuesta esperada, según tipo:
  // simplificar/sumar -> [numerador, denominador] ya reducidos
  // comparar -> "<" | "=" | ">"
  respuestaFraccion?: [number, number];
  respuestaComparacion?: "<" | "=" | ">";
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

function mcm(a: number, b: number): number {
  return (a * b) / mcd(a, b);
}

export function simplificar(num: number, den: number): [number, number] {
  const d = mcd(num, den);
  return [num / d, den / d];
}

// Nivel 1-10 en 5 bandas: sube el rango de denominadores y la cantidad
// de simplificación necesaria, igual criterio que las 4 operaciones.
function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// Auditoría de variedad 2026-10-23 (docs/AUDITORIA_PREGUNTAS.md): la banda 0
// usaba denominadores 2..4 (cinco fracciones: 1/2, 1/3, 2/3, 1/4, 3/4) y factor
// 2..3, así que «simplificar» tenía 10 preguntas posibles en nivel 1-2 y
// comparar/sumar unas 24. Ahora el denominador mínimo también sube con el nivel
// (en nivel alto ya no salen medios ni tercios) y el factor llega más lejos.
const DEN_MIN = [2, 2, 3, 4, 5];
const DEN_BASE = [6, 8, 10, 12, 15];
const FACTOR_MAX = [5, 6, 7, 9, 10];

function fraccionSimplificadaAleatoria(nivel: number): [number, number] {
  const i = banda(nivel);
  const den = randomInt(DEN_MIN[i], DEN_BASE[i]);
  const num = randomInt(1, den - 1);
  const d = mcd(num, den);
  return [num / d, den / d];
}

function generarSimplificar(nivel: number): ProblemaFraccion {
  const i = banda(nivel);
  const [n0, d0] = fraccionSimplificadaAleatoria(nivel);
  const factor = randomInt(2, FACTOR_MAX[i]);
  return {
    tipo: "simplificar",
    nivel,
    frac: [n0 * factor, d0 * factor],
    respuestaFraccion: [n0, d0],
  };
}

function generarComparar(nivel: number): ProblemaFraccion {
  const frac1 = fraccionSimplificadaAleatoria(nivel);
  let frac2 = fraccionSimplificadaAleatoria(nivel);
  // evitamos que salgan siempre iguales por casualidad, para que la
  // práctica no se vuelva "todo es =" — un empate real igual puede pasar.
  if (Math.random() > 0.15 && frac1[0] === frac2[0] && frac1[1] === frac2[1]) {
    frac2 = fraccionSimplificadaAleatoria(nivel);
  }
  const izq = frac1[0] / frac1[1];
  const der = frac2[0] / frac2[1];
  const respuestaComparacion: "<" | "=" | ">" = izq < der ? "<" : izq > der ? ">" : "=";
  return { tipo: "comparar", nivel, frac1, frac2, respuestaComparacion };
}

function generarSumar(nivel: number): ProblemaFraccion {
  const frac1 = fraccionSimplificadaAleatoria(nivel);
  const frac2 = fraccionSimplificadaAleatoria(nivel);
  const denComun = mcm(frac1[1], frac2[1]);
  const numComun = frac1[0] * (denComun / frac1[1]) + frac2[0] * (denComun / frac2[1]);
  return { tipo: "sumar", nivel, frac1, frac2, respuestaFraccion: simplificar(numComun, denComun) };
}

const GENERADORES: Record<TipoFraccion, (nivel: number) => ProblemaFraccion> = {
  simplificar: generarSimplificar,
  comparar: generarComparar,
  sumar: generarSumar,
};

export const TIPOS_FRACCION: TipoFraccion[] = ["simplificar", "comparar", "sumar"];

// Fase 2 ("Practicar" estandarizado): cada sub-tema tiene su propia
// calibración (nivelPorTipo), igual que las 4 operaciones de
// Aritmética — el tipo del problema se sortea entre los sub-temas
// elegidos, y ESE sub-tema es el que decide el nivel de dificultad.
export function generarProblemaFraccion(
  nivelPorTipo: Record<TipoFraccion, number>,
  tipos: TipoFraccion[] = TIPOS_FRACCION
): ProblemaFraccion {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_FRACCION;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
