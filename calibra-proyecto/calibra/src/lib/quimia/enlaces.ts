import { ELEMENTOS } from "@/lib/practica/quimia";
import { datosDe, electronesDeValencia } from "./datos";

// Ejemplos de enlace del visual "quimia.enlace". Los números (electrones de
// valencia, electrones transferidos, pares compartidos) NO se escriben acá a
// mano para el dibujo: el componente los pide a estas funciones, y
// enlaces.test.ts comprueba con la regla del octeto y con la
// electronegatividad que cada ejemplo sea coherente.

export type TipoEnlace = "ionico" | "covalente" | "metalico";

export interface EjemploIonico {
  tipo: "ionico";
  cation: string; // símbolo
  anion: string;
  // Electrones que pasan del catión al anión.
  transferidos: number;
  formula: string;
}
export interface EjemploCovalente {
  tipo: "covalente";
  a: string;
  b: string;
  // Pares de electrones compartidos (1 simple, 2 doble, 3 triple).
  pares: number;
  formula: string;
}
export interface EjemploMetalico {
  tipo: "metalico";
  simbolo: string;
  // Electrones de valencia que cada átomo aporta al "mar" (= carga del catión).
  aportados: number;
}
export type EjemploEnlaceDatos = EjemploIonico | EjemploCovalente | EjemploMetalico;

export const EJEMPLOS_ENLACE: Record<string, EjemploEnlaceDatos> = {
  NaCl: { tipo: "ionico", cation: "Na", anion: "Cl", transferidos: 1, formula: "NaCl" },
  MgO: { tipo: "ionico", cation: "Mg", anion: "O", transferidos: 2, formula: "MgO" },
  H2: { tipo: "covalente", a: "H", b: "H", pares: 1, formula: "H2" },
  O2: { tipo: "covalente", a: "O", b: "O", pares: 2, formula: "O2" },
  N2: { tipo: "covalente", a: "N", b: "N", pares: 3, formula: "N2" },
  HCl: { tipo: "covalente", a: "H", b: "Cl", pares: 1, formula: "HCl" },
  Na: { tipo: "metalico", simbolo: "Na", aportados: 1 },
  Mg: { tipo: "metalico", simbolo: "Mg", aportados: 2 },
};

export function ejemploEnlace(id: string): EjemploEnlaceDatos | undefined {
  return Object.hasOwn(EJEMPLOS_ENLACE, id) ? EJEMPLOS_ENLACE[id] : undefined;
}

// Electrones de valencia de un símbolo (H = 1 ... Cl = 7), calculados de la
// configuración electrónica. undefined si el símbolo no existe.
export function valenciaDe(simbolo: string): number | undefined {
  const el = ELEMENTOS.find((e) => e.simbolo === simbolo);
  if (!el) return undefined;
  return electronesDeValencia(el.numeroAtomico);
}

// Capa que cada átomo quiere completar: 2 electrones el H (y el He), 8 los demás.
export function electronesParaCompletar(simbolo: string): number {
  return simbolo === "H" ? 2 : 8;
}

export type Polaridad = "apolar" | "polar";
// Convención de colegio: diferencia de electronegatividad 0 (o < 0,4) apolar;
// entre 0,4 y 1,7 polar; más de 1,7 se considera iónico.
export function polaridad(a: string, b: string): Polaridad {
  const ea = datosDe(a)?.electronegatividad;
  const eb = datosDe(b)?.electronegatividad;
  if (ea == null || eb == null) throw new Error(`Sin electronegatividad para ${a}/${b}`);
  return Math.abs(ea - eb) < 0.4 ? "apolar" : "polar";
}
