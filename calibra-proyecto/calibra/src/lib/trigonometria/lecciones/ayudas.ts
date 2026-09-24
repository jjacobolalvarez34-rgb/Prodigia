import { radianesTex } from "@/lib/trigonometria/angulos";
import { OPERADOR_TEX, funcionExacta, texE, type FuncionTrig } from "@/lib/trigonometria/exactos";
import { redondear } from "@/lib/trigonometria/triangulos";
import type { VisualCuadros, CuadroLeccion } from "@/lib/aprender/visuales";
import type { PreguntaLeccionTrigonometria } from "./tipos";

// Ayudas para ESCRIBIR el contenido de las lecciones sin repetir datos a mano:
// fórmulas siempre en LaTeX correcto (notación en español: sen, cos, tan,
// cosec, sec, cot), valores exactos tomados de exactos.ts (contrastado con
// Math.* y con una tabla curada en sus tests) y números decimales calculados por
// código, con coma decimal. Así un dato numérico incorrecto no llega a una
// lección sin que algún test lo note.

export const m = (tex: string): string => `$${tex}$`;

export const SEN = OPERADOR_TEX.sen;

// sen(30°), cos(x)... como LaTeX (sin $): f("sen", "30^{\\circ}").
export const f = (nombre: FuncionTrig, arg: string): string => `${OPERADOR_TEX[nombre]}(${arg})`;
// El mismo, entre $...$.
export const mf = (nombre: FuncionTrig, arg: string): string => m(f(nombre, arg));

export const gr = (g: number): string => `${g}^{\\circ}`;
export const mgr = (g: number): string => m(gr(g));
export const rd = (g: number): string => radianesTex(g);
export const mrd = (g: number): string => m(radianesTex(g));

// Valor exacto de fn(g°) en LaTeX (sin $); "\text{indefinida}" si no existe.
export function val(nombre: FuncionTrig, g: number): string {
  const x = funcionExacta(nombre, g);
  return x === null ? "\\text{indefinida}" : texE(x);
}
export const mval = (nombre: FuncionTrig, g: number): string => m(val(nombre, g));

// sen(g°) = valor exacto, entre $...$: "$\operatorname{sen}(150^{\circ})=\frac{1}{2}$".
export const igual = (nombre: FuncionTrig, g: number): string => m(`${f(nombre, gr(g))}=${val(nombre, g)}`);

// Decimales con coma (texto) y para fórmulas ({,}).
export const d = (x: number, dec = 2): string => String(redondear(x, dec)).replace(".", ",");
export const dt = (x: number, dec = 2): string => String(redondear(x, dec)).replace(".", "{,}");

// ---------- visuales ----------
export function cuadros(despuesDePaso: number, titulo: string | undefined, lista: CuadroLeccion[], msPorCuadro = 2800): VisualCuadros {
  return { tipo: "cuadros", despuesDePaso, ...(titulo ? { titulo } : {}), cuadros: lista, msPorCuadro };
}

// ---------- quiz ----------
// Posición de la respuesta correcta entre las opciones: determinista (depende
// solo del texto de la pregunta) para que la migración generada sea estable y la
// respuesta no esté siempre en el mismo lugar.
function posicionDe(texto: string, n: number): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % n;
}

export function preg(pregunta: string, correcta: string, incorrectas: string[], explicacion: string): PreguntaLeccionTrigonometria {
  const opciones = [...incorrectas];
  opciones.splice(posicionDe(pregunta, opciones.length + 1), 0, correcta);
  return { pregunta, opciones, respuesta: correcta, explicacion };
}
