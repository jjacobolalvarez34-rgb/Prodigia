import { ELEMENTOS, type ElementoQuimico } from "@/lib/practica/quimia";

// Clasificación de la tabla periódica para las lecciones de Quimia. Todo se
// DERIVA de ELEMENTOS (src/lib/practica/quimia.ts, la fuente de verdad de
// número atómico / período / grupo), nunca se repite a mano en un visual.
//
// Convención de colegio que usa toda esta capa (y que las Clases enseñan):
//   - 18 grupos IUPAC, 7 períodos.
//   - Los lantánidos son La–Lu (Z 57–71) y los actínidos Ac–Lr (Z 89–103):
//     15 elementos cada uno, en las dos filas de abajo. En la tabla
//     principal, el grupo 3 de los períodos 6 y 7 lleva un marcador
//     "57–71" / "89–103". Es la convención de los libros de texto; en
//     ELEMENTOS estos elementos figuran con grupo 3 (ver el comentario de
//     `tieneGrupoDefinido`). IUPAC 2021 discute si el grupo 3 es Sc-Y-La-Ac
//     o Sc-Y-Lu-Lr; a este nivel no se distingue.
//   - Los elementos 104-118 son sintéticos y de vida muy corta: sus
//     propiedades químicas son en su mayoría predicciones.

export type FamiliaQuimica =
  | "alcalino"
  | "alcalinoterreo"
  | "transicion"
  | "otrosMetales"
  | "metaloide"
  | "noMetal"
  | "halogeno"
  | "gasNoble"
  | "lantanido"
  | "actinido";

export const ORDEN_FAMILIAS: FamiliaQuimica[] = [
  "alcalino",
  "alcalinoterreo",
  "transicion",
  "otrosMetales",
  "metaloide",
  "noMetal",
  "halogeno",
  "gasNoble",
  "lantanido",
  "actinido",
];

export type Bloque = "s" | "p" | "d" | "f";
export type TipoElemento = "metal" | "metaloide" | "nometal";

const METALOIDES = new Set(["B", "Si", "Ge", "As", "Sb", "Te"]);
// No metales "sueltos" (no halógenos ni gases nobles). El H es un no metal
// aunque esté en el grupo 1.
const NO_METALES = new Set(["H", "C", "N", "O", "P", "S", "Se"]);

export function esLantanido(z: number): boolean {
  return z >= 57 && z <= 71;
}
export function esActinido(z: number): boolean {
  return z >= 89 && z <= 103;
}
export function esBloqueF(z: number): boolean {
  return esLantanido(z) || esActinido(z);
}

// Los elementos del bloque f figuran con grupo 3 en ELEMENTOS por una
// convención práctica; en rigor su "grupo" depende de la convención
// (IUPAC no les asigna un número de grupo propio). Por eso ninguna
// pregunta ni lección afirma "el cerio está en el grupo 3".
export function tieneGrupoDefinido(el: ElementoQuimico): boolean {
  return !esBloqueF(el.numeroAtomico);
}

export function familiaDe(el: ElementoQuimico): FamiliaQuimica {
  const z = el.numeroAtomico;
  if (esLantanido(z)) return "lantanido";
  if (esActinido(z)) return "actinido";
  if (el.simbolo === "H") return "noMetal";
  if (el.grupo === 1) return "alcalino";
  if (el.grupo === 2) return "alcalinoterreo";
  if (el.grupo === 17) return "halogeno";
  if (el.grupo === 18) return "gasNoble";
  if (METALOIDES.has(el.simbolo)) return "metaloide";
  if (NO_METALES.has(el.simbolo)) return "noMetal";
  if (el.grupo >= 3 && el.grupo <= 12) return "transicion";
  return "otrosMetales";
}

export function tipoDe(el: ElementoQuimico): TipoElemento {
  const f = familiaDe(el);
  if (f === "metaloide") return "metaloide";
  if (f === "noMetal" || f === "halogeno" || f === "gasNoble") return "nometal";
  return "metal";
}

// s: grupos 1-2 y el helio; p: grupos 13-18 (salvo He); d: grupos 3-12; f: las
// dos filas de abajo.
export function bloqueDe(el: ElementoQuimico): Bloque {
  if (esBloqueF(el.numeroAtomico)) return "f";
  if (el.simbolo === "He") return "s";
  if (el.grupo <= 2) return "s";
  if (el.grupo >= 13) return "p";
  return "d";
}

export interface PosicionTabla {
  // Fila 1-7 = períodos; 9 = lantánidos; 10 = actínidos (8 queda vacía).
  fila: number;
  // Columna 1-18 (grupos); el bloque f ocupa las columnas 3-17.
  columna: number;
}

export function posicionEnTabla(el: ElementoQuimico): PosicionTabla {
  const z = el.numeroAtomico;
  if (esLantanido(z)) return { fila: 9, columna: z - 57 + 3 };
  if (esActinido(z)) return { fila: 10, columna: z - 89 + 3 };
  return { fila: el.periodo, columna: el.grupo };
}

export const FILAS_TABLA = 10;
export const COLUMNAS_TABLA = 18;

// Selector de un paso del visual "quimia.tabla": qué casilleros se resaltan.
export type SelectorTabla =
  | { por: "grupo"; n: number }
  | { por: "periodo"; n: number }
  | { por: "bloque"; bloque: Bloque }
  | { por: "familia"; familia: FamiliaQuimica }
  | { por: "tipo"; tipo: TipoElemento }
  | { por: "elementos"; simbolos: string[] };

// Símbolos que resalta un selector (siempre en el orden de ELEMENTOS por
// número atómico). Un selector "grupo"/"periodo" NO incluye el bloque f
// (no tienen grupo definido; los lantánidos y actínidos son de los
// períodos 6 y 7, pero se los resalta con el selector de su familia).
export function simbolosDeSelector(sel: SelectorTabla): string[] {
  const porZ = ELEMENTOS.slice().sort((a, b) => a.numeroAtomico - b.numeroAtomico);
  switch (sel.por) {
    case "grupo":
      return porZ.filter((e) => tieneGrupoDefinido(e) && e.grupo === sel.n).map((e) => e.simbolo);
    case "periodo":
      return porZ.filter((e) => !esBloqueF(e.numeroAtomico) && e.periodo === sel.n).map((e) => e.simbolo);
    case "bloque":
      return porZ.filter((e) => bloqueDe(e) === sel.bloque).map((e) => e.simbolo);
    case "familia":
      return porZ.filter((e) => familiaDe(e) === sel.familia).map((e) => e.simbolo);
    case "tipo":
      return porZ.filter((e) => tipoDe(e) === sel.tipo).map((e) => e.simbolo);
    case "elementos":
      return sel.simbolos.filter((s) => porZ.some((e) => e.simbolo === s));
  }
}

export function elementoPorSimbolo(simbolo: string): ElementoQuimico | undefined {
  return ELEMENTOS.find((e) => e.simbolo === simbolo);
}

export function elementoPorZ(z: number): ElementoQuimico | undefined {
  return ELEMENTOS.find((e) => e.numeroAtomico === z);
}

// Período de un elemento por su número atómico, SIN usar ELEMENTOS: los
// gases nobles (2, 10, 18, 36, 54, 86, 118) cierran cada período. Sirve de
// cálculo independiente en los tests y de "técnica" de las lecciones.
export const CIERRES_DE_PERIODO = [2, 10, 18, 36, 54, 86, 118];
export function periodoPorZ(z: number): number {
  return CIERRES_DE_PERIODO.findIndex((c) => z <= c) + 1;
}
