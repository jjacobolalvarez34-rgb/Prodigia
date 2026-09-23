import { ELEMENTOS } from "@/lib/practica/quimia";

// Datos de referencia de Quimia para las lecciones (masa atómica,
// electronegatividad, estado de agregación, estados de oxidación,
// configuración electrónica). ELEMENTOS (src/lib/practica/quimia.ts)
// sigue siendo la fuente de verdad de número atómico / símbolo / nombre /
// período / grupo; acá solo se agrega lo que ese banco no tiene, para el
// subconjunto de elementos que las lecciones usan de ejemplo.
//
// Fuentes de los valores (verificados, no "de memoria"): masas atómicas
// relativas convencionales IUPAC redondeadas a 2 decimales (a este nivel
// se usan 2 decimales: H 1,01; C 12,01; O 16,00); electronegatividad en la
// escala de Pauling; estado de agregación a 25 °C y 1 atm. Los valores
// se contrastaron contra un conjunto de datos abierto independiente
// (PeriodicTableJSON) al escribirlos, y datos.test.ts fija las
// propiedades que se pueden calcular sin ninguna tabla (suma de electrones
// = Z, cierres de capa en los gases nobles, monotonía de la masa con las
// inversiones históricas Ar/K y Co/Ni). El plomo no se carga a propósito: su
// electronegatividad de Pauling tiene dos valores según la fuente (1,87 para
// Pb(II) y 2,33 para Pb(IV)) y no vale la pena enseñar un número ambiguo.

export type EstadoAgregacion = "solido" | "liquido" | "gas";

export interface DatosElemento {
  simbolo: string;
  // Masa atómica relativa (u), 2 decimales.
  masa: number;
  // Electronegatividad de Pauling; null si no está definida (He, Ne, Ar).
  electronegatividad: number | null;
  // A 25 °C y 1 atm.
  estado: EstadoAgregacion;
  // Estados de oxidación que se ven en el colegio, de menor a mayor. NO es
  // la lista completa de la química avanzada (hay elementos con más
  // estados, p. ej. Mn de −3 a +7).
  estadosOxidacion: number[];
}

export const DATOS_ELEMENTOS: DatosElemento[] = [
  { simbolo: "H", masa: 1.01, electronegatividad: 2.2, estado: "gas", estadosOxidacion: [-1, 1] },
  { simbolo: "He", masa: 4.0, electronegatividad: null, estado: "gas", estadosOxidacion: [0] },
  { simbolo: "Li", masa: 6.94, electronegatividad: 0.98, estado: "solido", estadosOxidacion: [1] },
  { simbolo: "Be", masa: 9.01, electronegatividad: 1.57, estado: "solido", estadosOxidacion: [2] },
  { simbolo: "B", masa: 10.81, electronegatividad: 2.04, estado: "solido", estadosOxidacion: [3] },
  { simbolo: "C", masa: 12.01, electronegatividad: 2.55, estado: "solido", estadosOxidacion: [-4, 2, 4] },
  { simbolo: "N", masa: 14.01, electronegatividad: 3.04, estado: "gas", estadosOxidacion: [-3, 1, 2, 3, 4, 5] },
  { simbolo: "O", masa: 16.0, electronegatividad: 3.44, estado: "gas", estadosOxidacion: [-2, -1] },
  { simbolo: "F", masa: 19.0, electronegatividad: 3.98, estado: "gas", estadosOxidacion: [-1] },
  { simbolo: "Ne", masa: 20.18, electronegatividad: null, estado: "gas", estadosOxidacion: [0] },
  { simbolo: "Na", masa: 22.99, electronegatividad: 0.93, estado: "solido", estadosOxidacion: [1] },
  { simbolo: "Mg", masa: 24.31, electronegatividad: 1.31, estado: "solido", estadosOxidacion: [2] },
  { simbolo: "Al", masa: 26.98, electronegatividad: 1.61, estado: "solido", estadosOxidacion: [3] },
  { simbolo: "Si", masa: 28.09, electronegatividad: 1.9, estado: "solido", estadosOxidacion: [-4, 4] },
  { simbolo: "P", masa: 30.97, electronegatividad: 2.19, estado: "solido", estadosOxidacion: [-3, 3, 5] },
  { simbolo: "S", masa: 32.06, electronegatividad: 2.58, estado: "solido", estadosOxidacion: [-2, 4, 6] },
  { simbolo: "Cl", masa: 35.45, electronegatividad: 3.16, estado: "gas", estadosOxidacion: [-1, 1, 3, 5, 7] },
  { simbolo: "Ar", masa: 39.95, electronegatividad: null, estado: "gas", estadosOxidacion: [0] },
  { simbolo: "K", masa: 39.1, electronegatividad: 0.82, estado: "solido", estadosOxidacion: [1] },
  { simbolo: "Ca", masa: 40.08, electronegatividad: 1.0, estado: "solido", estadosOxidacion: [2] },
  { simbolo: "Cr", masa: 52.0, electronegatividad: 1.66, estado: "solido", estadosOxidacion: [2, 3, 6] },
  { simbolo: "Mn", masa: 54.94, electronegatividad: 1.55, estado: "solido", estadosOxidacion: [2, 4, 6, 7] },
  { simbolo: "Fe", masa: 55.85, electronegatividad: 1.83, estado: "solido", estadosOxidacion: [2, 3] },
  { simbolo: "Co", masa: 58.93, electronegatividad: 1.88, estado: "solido", estadosOxidacion: [2, 3] },
  { simbolo: "Ni", masa: 58.69, electronegatividad: 1.91, estado: "solido", estadosOxidacion: [2, 3] },
  { simbolo: "Cu", masa: 63.55, electronegatividad: 1.9, estado: "solido", estadosOxidacion: [1, 2] },
  { simbolo: "Zn", masa: 65.38, electronegatividad: 1.65, estado: "solido", estadosOxidacion: [2] },
  { simbolo: "Br", masa: 79.9, electronegatividad: 2.96, estado: "liquido", estadosOxidacion: [-1, 1, 3, 5, 7] },
  { simbolo: "Ag", masa: 107.87, electronegatividad: 1.93, estado: "solido", estadosOxidacion: [1] },
  { simbolo: "Sn", masa: 118.71, electronegatividad: 1.96, estado: "solido", estadosOxidacion: [2, 4] },
  { simbolo: "I", masa: 126.9, electronegatividad: 2.66, estado: "solido", estadosOxidacion: [-1, 1, 3, 5, 7] },
  { simbolo: "Ba", masa: 137.33, electronegatividad: 0.89, estado: "solido", estadosOxidacion: [2] },
  { simbolo: "Au", masa: 196.97, electronegatividad: 2.54, estado: "solido", estadosOxidacion: [1, 3] },
  { simbolo: "Hg", masa: 200.59, electronegatividad: 2.0, estado: "liquido", estadosOxidacion: [1, 2] },
];

export function datosDe(simbolo: string): DatosElemento | undefined {
  return DATOS_ELEMENTOS.find((d) => d.simbolo === simbolo);
}

// ---------- Configuración electrónica ----------

export type LetraOrbital = "s" | "p" | "d" | "f";

export interface SubcapaOcupada {
  // "1s", "2p", "3d"...
  nombre: string;
  n: number;
  l: LetraOrbital;
  // Cantidad máxima de electrones de la subcapa (2, 6, 10, 14).
  capacidad: number;
  electrones: number;
}

const CAPACIDAD: Record<LetraOrbital, number> = { s: 2, p: 6, d: 10, f: 14 };

// Orden de llenado (regla de Aufbau / diagrama de Moeller: se llenan primero
// las subcapas con menor n + l, y a igual n + l la de menor n).
export const ORDEN_MOELLER: { n: number; l: LetraOrbital }[] = [
  [1, "s"], [2, "s"], [2, "p"], [3, "s"], [3, "p"], [4, "s"], [3, "d"], [4, "p"], [5, "s"], [4, "d"],
  [5, "p"], [6, "s"], [4, "f"], [5, "d"], [6, "p"], [7, "s"], [5, "f"], [6, "d"], [7, "p"],
].map(([n, l]) => ({ n: n as number, l: l as LetraOrbital }));

// Excepciones al orden de Aufbau (config real medida). Cada entrada
// sobrescribe la ocupación de las subcapas nombradas; el resto queda como
// dice Aufbau. Contrastado con los datos de PeriodicTableJSON para los 118
// elementos: estos 20 son los únicos que difieren de la regla.
const EXCEPCIONES: Record<number, Record<string, number>> = {
  24: { "4s": 1, "3d": 5 }, // Cr
  29: { "4s": 1, "3d": 10 }, // Cu
  41: { "5s": 1, "4d": 4 }, // Nb
  42: { "5s": 1, "4d": 5 }, // Mo
  44: { "5s": 1, "4d": 7 }, // Ru
  45: { "5s": 1, "4d": 8 }, // Rh
  46: { "5s": 0, "4d": 10 }, // Pd
  47: { "5s": 1, "4d": 10 }, // Ag
  57: { "4f": 0, "5d": 1 }, // La
  58: { "4f": 1, "5d": 1 }, // Ce
  64: { "4f": 7, "5d": 1 }, // Gd
  78: { "6s": 1, "5d": 9 }, // Pt
  79: { "6s": 1, "5d": 10 }, // Au
  89: { "5f": 0, "6d": 1 }, // Ac
  90: { "5f": 0, "6d": 2 }, // Th
  91: { "5f": 2, "6d": 1 }, // Pa
  92: { "5f": 3, "6d": 1 }, // U
  93: { "5f": 4, "6d": 1 }, // Np
  96: { "5f": 7, "6d": 1 }, // Cm
  103: { "5f": 14, "6d": 0, "7p": 1 }, // Lr
};

export function esExcepcionAufbau(z: number): boolean {
  return z in EXCEPCIONES;
}

// Configuración electrónica de un elemento neutro con `z` electrones, en
// orden de llenado. Solo aparecen las subcapas con al menos 1 electrón.
export function configuracionElectronica(z: number): SubcapaOcupada[] {
  const ocupacion = new Map<string, number>();
  let restantes = z;
  for (const { n, l } of ORDEN_MOELLER) {
    const nombre = `${n}${l}`;
    const e = Math.max(0, Math.min(CAPACIDAD[l], restantes));
    ocupacion.set(nombre, e);
    restantes -= e;
  }
  const excep = EXCEPCIONES[z];
  if (excep) for (const [nombre, e] of Object.entries(excep)) ocupacion.set(nombre, e);
  return ORDEN_MOELLER.flatMap(({ n, l }) => {
    const nombre = `${n}${l}`;
    const electrones = ocupacion.get(nombre) ?? 0;
    return electrones > 0 ? [{ nombre, n, l, capacidad: CAPACIDAD[l], electrones }] : [];
  });
}

export function configuracionTexto(z: number): string {
  return configuracionElectronica(z)
    .map((s) => `${s.nombre}${s.electrones}`)
    .join(" ");
}

const SUPER: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

// "4s2 3d6" -> "4s² 3d⁶": los exponentes de una configuración como
// superíndices Unicode (para mostrarla como texto plano, sin KaTeX).
export function configuracionConSuperindices(texto: string): string {
  return texto.replace(/([spdf])(\d+)/g, (_m, l: string, n: string) => l + n.replace(/\d/g, (d) => SUPER[d]));
}

// Electrones de la capa más externa (n máximo entre las subcapas s y p
// ocupadas): lo que se llama "electrones de valencia" en los elementos de
// los grupos principales. En los metales de transición el concepto es más
// sutil y a este nivel no se usa el número.
export function electronesDeValencia(z: number): number {
  const sub = configuracionElectronica(z);
  const nMax = Math.max(...sub.map((s) => s.n));
  return sub.filter((s) => s.n === nMax).reduce((a, s) => a + s.electrones, 0);
}

// Cantidad de capas (niveles n) ocupadas = período del elemento.
export function capasOcupadas(z: number): number {
  return Math.max(...configuracionElectronica(z).map((s) => s.n));
}

export const GASES_NOBLES_Z = [2, 10, 18, 36, 54, 86, 118];

// Convenciones de nombre para el texto: gas noble anterior (para escribir
// la configuración abreviada, p. ej. Fe = [Ar] 4s2 3d6).
export function gasNobleAnterior(z: number): { simbolo: string; z: number } | null {
  const previos = GASES_NOBLES_Z.filter((g) => g < z);
  if (previos.length === 0) return null;
  const gz = previos[previos.length - 1];
  const el = ELEMENTOS.find((e) => e.numeroAtomico === gz);
  return el ? { simbolo: el.simbolo, z: gz } : null;
}

// Configuración abreviada con el gas noble anterior: "[Ar] 4s2 3d6". Para los
// gases nobles y H/He devuelve la completa.
export function configuracionAbreviada(z: number): string {
  const previo = gasNobleAnterior(z);
  if (!previo) return configuracionTexto(z);
  const base = configuracionElectronica(previo.z).map((s) => s.nombre);
  const resto = configuracionElectronica(z).filter((s) => {
    // Restar la parte del core: se compara por electrones acumulados.
    return !base.includes(s.nombre) || s.electrones !== configuracionElectronica(previo.z).find((c) => c.nombre === s.nombre)?.electrones;
  });
  if (resto.length === 0) return `[${previo.simbolo}]`;
  return `[${previo.simbolo}] ${resto.map((s) => `${s.nombre}${s.electrones}`).join(" ")}`;
}
