// Opciones de las preguntas de opción múltiple (círculo e identidades): cada
// opción lleva su texto ($...$) y una CLAVE de igualdad matemática. Dos
// opciones con la misma clave son el mismo número escrito igual, así que
// armarOpciones() nunca deja dos respuestas equivalentes en la misma pregunta.

import type { Frac } from "@/lib/trigonometria/fracciones";
import { planoE, texE, type Exacto } from "@/lib/trigonometria/exactos";
import { planoRadical, texRadical, type Radical } from "@/lib/trigonometria/radicales";
import { multiploPiTex } from "@/lib/trigonometria/ondas";
import { armarOpciones, m, numTex } from "./trigonometriaBase";
import type { ProblemaTrigonometriaOpciones } from "./trigonometriaTipos";

export interface Opcion {
  texto: string;
  clave: string;
}

export const INDEFINIDO = "indefinido";

export function opcionDeExacto(x: Exacto | null): Opcion {
  return x === null ? { texto: INDEFINIDO, clave: INDEFINIDO } : { texto: m(texE(x)), clave: planoE(x) };
}

export const opcionDeRadical = (r: Radical): Opcion => ({ texto: m(texRadical(r)), clave: planoRadical(r) });
export const opcionDeGrados = (g: number): Opcion => ({ texto: m(`${numTex(g, 2)}^{\\circ}`), clave: `${g}°` });
export const opcionDePi = (f: Frac): Opcion => ({ texto: m(multiploPiTex(f)), clave: `${f.n}/${f.d}π` });
export const opcionDeTex = (tex: string): Opcion => ({ texto: m(tex), clave: tex });

export function resultadoOpciones(
  modo: "circulo" | "identidades",
  enunciado: string,
  correcta: Opcion,
  preferidos: Opcion[],
  pool: Opcion[]
): ProblemaTrigonometriaOpciones {
  const opciones = armarOpciones(correcta, preferidos, pool, (o) => o.clave);
  return { modo, entrada: "opciones", enunciado, opciones: opciones.map((o) => o.texto), respuesta: correcta.texto };
}
