import { capitalizar } from "@/lib/quimia/nomenclatura";
import { fichaDe } from "@/lib/quimia/moleculas";
import { formulaLatex } from "@/lib/quimia/formulas";
import { condensadaLatex } from "@/lib/quimia/organica";
import { ecuacionLatex, numerosDeOxidacion, sp, t, textoOxidacion, verificarEcuacion, verificarSemirreaccion, type EcuacionIonica, type SemirreaccionBalanceada, type TerminoRedox } from "@/lib/quimia/redox";

// Ayudas para ESCRIBIR las lecciones de la tanda 2 (redox y orgánica) sin
// tipear a mano datos químicos: nombres y fórmulas de moléculas desde el
// catálogo calculado (moleculas.ts), números de oxidación desde
// numerosDeOxidacion y ecuaciones que lanzan un error si no están balanceadas
// en átomos y en carga.

// ---------- Orgánica ----------

export const nomM = (id: string): string => fichaDe(id).nombre;
export const NomM = (id: string): string => capitalizar(nomM(id));
// Fórmula molecular en LaTeX ($C_2H_6O$).
export const formM = (id: string): string => `$${formulaLatex(fichaDe(id).formula)}$`;
// Fórmula molecular en texto plano (C2H6O).
export const molM = (id: string): string => fichaDe(id).formula;
// Fórmula condensada en LaTeX ($CH_3{-}CH_2{-}OH$); un anillo usa la molecular.
export const condM = (id: string): string => {
  const c = fichaDe(id).condensada;
  return c === null ? formM(id) : `$\\mathrm{${condensadaLatex(c)}}$`;
};
// Nombre y fórmula molecular juntos: "etanol ($C_2H_6O$)".
export const nomFormM = (id: string): string => `${nomM(id)} (${formM(id)})`;
// Nombre común entre paréntesis cuando existe.
export const comunM = (id: string): string => fichaDe(id).entrada.comun ?? nomM(id);

// ---------- Redox ----------

// Número de oxidación de un elemento de una especie, en texto ("+7", "−2").
export function oxTexto(formula: string, carga: number, simbolo: string, fijos?: Record<string, number>): string {
  const n = numerosDeOxidacion(sp(formula, carga), fijos)[simbolo];
  if (n === undefined) throw new Error(`${simbolo} no está en ${formula}`);
  return textoOxidacion(n);
}
export function oxNum(formula: string, carga: number, simbolo: string, fijos?: Record<string, number>): number {
  return numerosDeOxidacion(sp(formula, carga), fijos)[simbolo];
}

// Término: [coeficiente, fórmula, carga opcional].
export type Termino3 = [number, string] | [number, string, number];
const aTerminos = (l: Termino3[]): TerminoRedox[] => l.map((x) => t(x[0], x[1], x[2] ?? 0));

// Ecuación balanceada en LaTeX ($...$); lanza si no conserva átomos y carga.
export function ecu(reactivos: Termino3[], productos: Termino3[], flecha: "->" | "<->" = "->"): string {
  const R = aTerminos(reactivos);
  const P = aTerminos(productos);
  verificarEcuacion(R, P);
  const tex = ecuacionLatex(R, P);
  return `$${flecha === "<->" ? tex.replace("\\rightarrow", "\\rightleftharpoons") : tex}$`;
}

// Fracción irreducible a/b en texto ("8/3").
export function fraccion(a: number, b: number): string {
  const mcd = (x: number, y: number): number => (y === 0 ? x : mcd(y, x % y));
  const g = mcd(Math.abs(a), Math.abs(b));
  return `${a / g}/${b / g}`;
}

// Semirreacción balanceada en LaTeX ($...$), verificada.
export function semiLatex(s: SemirreaccionBalanceada): string {
  verificarSemirreaccion(s);
  const eR = s.tipo === "reduccion" ? s.electrones : 0;
  const eP = s.tipo === "oxidacion" ? s.electrones : 0;
  return `$${ecuacionLatex(s.reactivos, s.productos, eR, eP)}$`;
}
// Ecuación iónica neta ya sumada, en LaTeX ($...$).
export function ecuacionIonicaLatex(e: EcuacionIonica): string {
  verificarEcuacion(e.reactivos, e.productos);
  return `$${ecuacionLatex(e.reactivos, e.productos)}$`;
}
