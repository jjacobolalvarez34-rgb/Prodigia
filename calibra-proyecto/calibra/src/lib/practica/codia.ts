// Mundo Codia — leer y razonar sobre código en 4 lenguajes (Python, Java,
// JavaScript, TypeScript). 4 modos con bandas de nivel autorales (cada
// generador recorta el nivel 1-10 a su banda, mismo patrón que Calculia,
// sin cambios de esquema): sintaxis 1-3, salida 3-6, error 5-8,
// estructuras 7-10.
//
// RIGOR (mismo espíritu que el bug de Enigmia: una respuesta "correcta"
// incorrecta es inaceptable): ningún problema se escribe a mano con su
// respuesta. Cada uno se construye desde un programa en un IR chico
// (src/lib/codia/tipos.ts), se RENDERIZA a los 4 lenguajes y la
// respuesta sale de un intérprete mínimo con la semántica real de cada
// lenguaje. Además src/lib/practica/codia.test.ts EJECUTA de verdad los
// fragmentos (Python 3, Node, TypeScript real con chequeo de tipos,
// javac + JVM) y compara la salida/causa de fallo reales contra lo
// predicho. Los "quirks" (// de Python, coerción de JS, división entera
// de Java) son casos curados y ejecutados, no rarezas oscuras.

import { ACCIONES_HUECO, ACCIONES_SINTAXIS, MARCA } from "@/lib/codia/catalogoSintaxis";
import { conRngSembrado as conRngSembradoBase, elegir, mezclar, randomInt, azar } from "@/lib/codia/rng";
import { ensamblar } from "@/lib/codia/render";
import { generarSalida } from "@/lib/codia/plantillasSalida";
import { generarError } from "@/lib/codia/plantillasError";
import { generarEstructuras } from "@/lib/codia/plantillasEstructuras";
import { armarOpciones } from "@/lib/codia/util";
import { LENGUAJES, NOMBRE_LENGUAJE, type Lenguaje } from "@/lib/codia/tipos";
import type { ModoCodia, ProblemaCodia, Verificacion } from "@/lib/codia/problema";
import type { PreguntaRetoDiario } from "@/lib/retoDiario";

export type { ModoCodia, ProblemaCodia, ProblemaCodiaOpciones, Verificacion, ClaseComplejidad } from "@/lib/codia/problema";
export type { Lenguaje as LenguajeCodia } from "@/lib/codia/tipos";
export { LENGUAJES as LENGUAJES_CODIA, NOMBRE_LENGUAJE as NOMBRE_LENGUAJE_CODIA };

export const MODOS_CODIA: ModoCodia[] = ["sintaxis", "salida", "error", "estructuras"];

// Mismos nombres de modo que src/lib/duelos/(borrado) (que lo
// reemplaza este módulo en SelectorMundoDuelo).
export const NOMBRE_MODO_CODIA: Record<ModoCodia, string> = {
  sintaxis: "Sintaxis",
  salida: "Salida del código",
  error: "Encontrá el error",
  estructuras: "Estructuras y complejidad",
};

// Mismo patrón que calculia.ts: la referencia mutable vive en rng.ts.
export const conRngSembrado = conRngSembradoBase;

// ---------- Bandas de dificultad ----------
export function bandaSintaxisNivel(nivel: number): number {
  return Math.min(3, Math.max(1, nivel));
}
export function bandaSalidaNivel(nivel: number): number {
  return Math.min(6, Math.max(3, nivel));
}
export function bandaErrorNivel(nivel: number): number {
  return Math.min(8, Math.max(5, nivel));
}
export function bandaEstructurasNivel(nivel: number): number {
  return Math.min(10, Math.max(7, nivel));
}

// ---------- Modo 1: sintaxis ----------
// Dos formas, ambas verificadas por ejecución: (a) "¿cuál de estas
// opciones hace X?" — la correcta corre, cada distractor falla al
// compilar/interpretar; (b) "completá el hueco" — solo el token correcto
// hace que el programa corra e imprima lo esperado.
function generarSintaxis(lang: Lenguaje, nivel: number): ProblemaCodia {
  const nombre = NOMBRE_LENGUAJE[lang];
  if (azar() < 0.35) {
    const acciones = ACCIONES_HUECO.filter((a) => a.nivel <= nivel);
    const a = elegir(acciones.flatMap((x) => (x.nivel === nivel ? [x, x] : [x])));
    const caso = a.casos[lang];
    const conMarca = caso.lineas.map((l) => l.replace("___", MARCA));
    const { codigo: plantilla } = ensamblar(lang, conMarca, 0, caso.nMiembros ?? 0);
    const opciones = armarOpciones(caso.correcta, caso.malas);
    return {
      modo: "sintaxis",
      entrada: "opciones",
      lenguaje: lang,
      enunciado: `¿Qué va en el hueco (___) ${a.objetivo}?`,
      codigo: caso.lineas.join("\n"),
      opciones,
      respuesta: caso.correcta,
      verificacion: { tipo: "hueco", plantilla, opciones, correcta: caso.correcta, stdout: caso.stdout },
    };
  }
  const candidatas = ACCIONES_SINTAXIS.filter((a) => a.nivel <= nivel);
  const maxNivel = Math.max(...candidatas.map((c) => c.nivel));
  const a = elegir(candidatas.flatMap((c) => (c.nivel === maxNivel ? [c, c] : [c])));
  const caso = a.casos[lang];
  const pre = caso.pre ?? [];
  const post = caso.post ?? [];
  const lineas = caso.miembro ? [MARCA, "", ...post] : [...pre, MARCA, ...post];
  const { codigo: plantilla } = ensamblar(lang, lineas, 0, caso.miembro ? 2 : 0);
  const malas = mezclar(caso.malas).slice(0, 3);
  const opciones = armarOpciones(caso.ok, malas);
  return {
    modo: "sintaxis",
    entrada: "opciones",
    lenguaje: lang,
    enunciado: `¿Cuál de estas opciones ${a.accion} en ${nombre}?`,
    codigo: pre.join("\n"),
    opciones,
    respuesta: caso.ok,
    verificacion: { tipo: "hueco", plantilla, opciones, correcta: caso.ok, stdout: caso.stdout },
  };
}

// Todo el catálogo de sintaxis con TODOS los distractores (no una muestra):
// lo recorre codia.test.ts para ejecutar cada opción de cada acción.
export function verificacionesCatalogoSintaxis(lang: Lenguaje): Verificacion[] {
  const salida: Verificacion[] = [];
  for (const a of ACCIONES_SINTAXIS) {
    const caso = a.casos[lang];
    const lineas = caso.miembro ? [MARCA, "", ...(caso.post ?? [])] : [...(caso.pre ?? []), MARCA, ...(caso.post ?? [])];
    const { codigo: plantilla } = ensamblar(lang, lineas, 0, caso.miembro ? 2 : 0);
    salida.push({ tipo: "hueco", plantilla, opciones: [caso.ok, ...caso.malas], correcta: caso.ok, stdout: caso.stdout });
  }
  for (const a of ACCIONES_HUECO) {
    const caso = a.casos[lang];
    const { codigo: plantilla } = ensamblar(lang, caso.lineas.map((l) => l.replace("___", MARCA)), 0, caso.nMiembros ?? 0);
    salida.push({ tipo: "hueco", plantilla, opciones: [caso.correcta, ...caso.malas], correcta: caso.correcta, stdout: caso.stdout });
  }
  return salida;
}

// ---------- API pública ----------
export function generarProblemaCodia(modo: ModoCodia, nivel: number, lenguaje?: Lenguaje): ProblemaCodia {
  const lang = lenguaje ?? elegir(LENGUAJES);
  if (modo === "sintaxis") return generarSintaxis(lang, bandaSintaxisNivel(nivel));
  if (modo === "salida") return generarSalida(lang, bandaSalidaNivel(nivel));
  if (modo === "error") return generarError(lang, bandaErrorNivel(nivel));
  return generarEstructuras(lang, bandaEstructurasNivel(nivel));
}

// Fragmento con número de línea a la izquierda (para las preguntas de
// "¿en qué línea?" cuando se muestra como texto plano, p. ej. el reto diario).
export function codigoConNumeros(codigo: string): string {
  const lineas = codigo.split("\n");
  const ancho = String(lineas.length).length;
  return lineas.map((l, i) => `${String(i + 1).padStart(ancho, " ")}  ${l}`).join("\n");
}

// Reto diario: solo opción múltiple (los 4 modos lo son), con la misma
// forma que preguntaCalculia. El código va dentro del enunciado, así que
// el renderizador del reto debe respetar saltos de línea y usar fuente
// monoespaciada (whitespace-pre-wrap font-mono) para ese bloque.
export function preguntaCodia(rng: () => number): PreguntaRetoDiario {
  return conRngSembrado(rng, () => {
    const modo = elegir(MODOS_CODIA);
    const nivel = randomInt(1, 10);
    const p = generarProblemaCodia(modo, nivel);
    const cuerpo = p.codigo ? `\n\n${p.modo === "error" ? codigoConNumeros(p.codigo) : p.codigo}` : "";
    return {
      mundo: "codia",
      enunciado: `[${NOMBRE_LENGUAJE[p.lenguaje]}] ${p.enunciado}${cuerpo}`,
      opciones: p.opciones,
      respuesta: p.respuesta,
    };
  });
}
