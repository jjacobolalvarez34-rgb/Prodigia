import { valenciaDe, electronesParaCompletar } from "./enlaces";

// Estructuras de Lewis básicas de las moléculas que usa la Clase de enlace
// químico. Cada estructura se describe con datos (átomos, enlaces con su
// orden y pares libres por átomo) y lewis.test.ts comprueba la regla del
// octeto y la conservación de los electrones de valencia: así el conteo
// que se muestra en la lección no se escribe a mano.

export interface AtomoLewis {
  simbolo: string;
  // Pares de electrones no compartidos.
  libres: number;
}

export interface EnlaceLewis {
  // Índices en `atomos`.
  entre: [number, number];
  // 1 simple, 2 doble, 3 triple.
  orden: 1 | 2 | 3;
}

export interface EstructuraLewis {
  formula: string;
  atomos: AtomoLewis[];
  enlaces: EnlaceLewis[];
}

const at = (simbolo: string, libres: number): AtomoLewis => ({ simbolo, libres });

export const ESTRUCTURAS_LEWIS: EstructuraLewis[] = [
  { formula: "H2", atomos: [at("H", 0), at("H", 0)], enlaces: [{ entre: [0, 1], orden: 1 }] },
  { formula: "HCl", atomos: [at("H", 0), at("Cl", 3)], enlaces: [{ entre: [0, 1], orden: 1 }] },
  {
    formula: "H2O",
    atomos: [at("O", 2), at("H", 0), at("H", 0)],
    enlaces: [
      { entre: [0, 1], orden: 1 },
      { entre: [0, 2], orden: 1 },
    ],
  },
  {
    formula: "NH3",
    atomos: [at("N", 1), at("H", 0), at("H", 0), at("H", 0)],
    enlaces: [
      { entre: [0, 1], orden: 1 },
      { entre: [0, 2], orden: 1 },
      { entre: [0, 3], orden: 1 },
    ],
  },
  {
    formula: "CH4",
    atomos: [at("C", 0), at("H", 0), at("H", 0), at("H", 0), at("H", 0)],
    enlaces: [
      { entre: [0, 1], orden: 1 },
      { entre: [0, 2], orden: 1 },
      { entre: [0, 3], orden: 1 },
      { entre: [0, 4], orden: 1 },
    ],
  },
  { formula: "O2", atomos: [at("O", 2), at("O", 2)], enlaces: [{ entre: [0, 1], orden: 2 }] },
  { formula: "N2", atomos: [at("N", 1), at("N", 1)], enlaces: [{ entre: [0, 1], orden: 3 }] },
  {
    formula: "CO2",
    atomos: [at("C", 0), at("O", 2), at("O", 2)],
    enlaces: [
      { entre: [0, 1], orden: 2 },
      { entre: [0, 2], orden: 2 },
    ],
  },
];

export function estructuraLewis(formula: string): EstructuraLewis {
  const e = ESTRUCTURAS_LEWIS.find((x) => x.formula === formula);
  if (!e) throw new Error(`Sin estructura de Lewis para ${formula}`);
  return e;
}

// Electrones de valencia totales de la molécula (suma de los de cada átomo).
export function electronesTotales(e: EstructuraLewis): number {
  return e.atomos.reduce((a, x) => a + (valenciaDe(x.simbolo) ?? 0), 0);
}

// Electrones que "rodean" a un átomo: 2 por cada enlace (contando el orden) y
// 2 por cada par libre. Debe ser 8 (2 para el H).
export function electronesAlrededor(e: EstructuraLewis, i: number): number {
  const enlazados = e.enlaces.filter((b) => b.entre.includes(i)).reduce((a, b) => a + b.orden, 0);
  return 2 * enlazados + 2 * e.atomos[i].libres;
}

// Electrones usados en la estructura: cada enlace de orden n son 2n electrones
// y cada par libre son 2.
export function electronesUsados(e: EstructuraLewis): number {
  return e.enlaces.reduce((a, b) => a + 2 * b.orden, 0) + e.atomos.reduce((a, x) => a + 2 * x.libres, 0);
}

export function capaCompleta(e: EstructuraLewis, i: number): boolean {
  return electronesAlrededor(e, i) === electronesParaCompletar(e.atomos[i].simbolo);
}

const ORDEN_TEXTO = ["", "simple", "doble", "triple"];
// "2 enlaces simples", "2 enlaces dobles", "1 enlace triple".
export function textoEnlaces(e: EstructuraLewis): string {
  const cuenta: Record<number, number> = {};
  for (const b of e.enlaces) cuenta[b.orden] = (cuenta[b.orden] ?? 0) + 1;
  return Object.entries(cuenta)
    .map(([orden, n]) => `${n} ${n === 1 ? "enlace" : "enlaces"} ${ORDEN_TEXTO[Number(orden)]}${n === 1 ? "" : "s"}`)
    .join(" y ");
}

// "2 en el O", "1 en cada N", "3 en el Cl", "ninguno".
export function textoLibres(e: EstructuraLewis): string {
  const con = e.atomos.filter((a) => a.libres > 0);
  if (con.length === 0) return "ninguno";
  const simbolos = Array.from(new Set(con.map((a) => a.simbolo)));
  return simbolos
    .map((s) => {
      const de = con.filter((a) => a.simbolo === s);
      const n = de[0].libres;
      return de.length > 1 ? `${n} en cada ${s}` : `${n} en el ${s}`;
    })
    .join(" y ");
}
