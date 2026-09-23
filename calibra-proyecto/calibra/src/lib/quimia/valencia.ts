import { contarAtomos } from "./formulas";

// Reglas básicas de valencia y número de oxidación de nivel colegio (Clase
// "Valencia, número de oxidación y cómo armar fórmulas"). La tanda 2 del
// curso (redox) las profundiza, así que acá están las reglas correctas y
// nada que la tanda 2 tenga que contradecir.

// Carga (número de oxidación) típica de un elemento de grupo principal según
// su grupo IUPAC: grupos 1, 2 y 13 -> +1, +2, +3; grupos 15, 16 y 17 -> −3,
// −2, −1. El grupo 14 (±4), el 18 (0) y los metales de transición (varios
// valores) no tienen una carga única: devuelven null.
export function cargaTipicaPorGrupo(grupo: number): number | null {
  if (grupo === 1 || grupo === 2) return grupo;
  if (grupo === 13) return 3;
  if (grupo >= 15 && grupo <= 17) return grupo - 18;
  return null;
}

// Números de oxidación que se asumen conocidos en las reglas básicas:
// H +1 (salvo hidruros metálicos), O −2 (salvo peróxidos), metales de los
// grupos 1 y 2 (+1, +2), F −1.
export const REGLAS_BASICAS: Record<string, number> = { H: 1, O: -2, F: -1, Li: 1, Na: 1, K: 1, Ag: 1, Mg: 2, Ca: 2, Ba: 2, Zn: 2, Al: 3 };

// Número de oxidación de UN elemento incógnita en una fórmula, dado el
// número de oxidación de todos los demás y la carga total (0 si es neutra).
// Resuelve n_incógnita × x + Σ (n_i × ox_i) = carga.
export function resolverOxidacion(formula: string, incognita: string, carga: number, conocidos: Record<string, number>): number {
  const cont = contarAtomos(formula);
  const n = cont[incognita];
  if (!n) throw new Error(`${incognita} no está en ${formula}`);
  let suma = 0;
  for (const [sim, cantidad] of Object.entries(cont)) {
    if (sim === incognita) continue;
    const ox = conocidos[sim];
    if (ox === undefined) throw new Error(`Falta el número de oxidación de ${sim} en ${formula}`);
    suma += cantidad * ox;
  }
  const x = (carga - suma) / n;
  if (!Number.isInteger(x)) throw new Error(`${incognita} en ${formula}: resultado no entero (${x})`);
  return x;
}
