import { ELEMENTOS, Z_MAX_CON_ESTADO_OXIDACION } from "@/lib/practica/quimia";
import { contarAtomos, formulaLatex, ionLatex } from "./formulas";
import { REGLAS_BASICAS, resolverOxidacion } from "./valencia";

// Datos y cálculos de REDOX de nivel colegio para las lecciones de la tanda 2
// de Quimia (grupo "redox") y para los visuales "quimia.redox",
// "quimia.oxidacion", "quimia.balanceo" y "quimia.pila". NINGÚN número
// químico de esas lecciones se escribe a mano: los números de oxidación se
// calculan con resolverOxidacion (valencia.ts), las semirreacciones se
// balancean con el algoritmo ion-electrón de acá (O con H₂O, H con H⁺, carga
// con e⁻, y OH⁻ en medio básico) y redox.test.ts comprueba que en cada
// ecuación se conserven los átomos y la carga.
//
// Simplificaciones de nivel colegio (se avisan en las lecciones):
//  - los números de oxidación son enteros (no se usan los "promedios"
//    fraccionarios como el +8/3 del hierro en Fe₃O₄);
//  - las tablas de potenciales son valores estándar (25 °C, 1 mol/L, 1 atm)
//    redondeados a 2 decimales, sin ecuación de Nernst;
//  - los iones se escriben sin la capa de hidratación (Cu²⁺ y no
//    [Cu(H₂O)₆]²⁺).

// ---------- Especies y ecuaciones ----------

export interface Especie {
  formula: string;
  carga: number;
}
export interface TerminoRedox {
  coef: number;
  especie: Especie;
}
export const sp = (formula: string, carga = 0): Especie => ({ formula, carga });
export const t = (coef: number, formula: string, carga = 0): TerminoRedox => ({ coef, especie: sp(formula, carga) });

const clave = (e: Especie) => `${e.formula}|${e.carga}`;

// Suma de coeficientes de la misma especie en una lista de términos.
function unir(terminos: TerminoRedox[]): TerminoRedox[] {
  const mapa = new Map<string, TerminoRedox>();
  for (const x of terminos) {
    if (x.coef === 0) continue;
    const k = clave(x.especie);
    const previo = mapa.get(k);
    mapa.set(k, previo ? { ...previo, coef: previo.coef + x.coef } : { ...x });
  }
  return [...mapa.values()].filter((x) => x.coef !== 0);
}

export function atomosDeLado(lado: TerminoRedox[]): Record<string, number> {
  const total: Record<string, number> = {};
  for (const x of lado) for (const [s, n] of Object.entries(contarAtomos(x.especie.formula))) total[s] = (total[s] ?? 0) + x.coef * n;
  return total;
}
export function cargaDeLado(lado: TerminoRedox[], electrones = 0): number {
  return lado.reduce((a, x) => a + x.coef * x.especie.carga, 0) - electrones;
}

// ---------- LaTeX ----------

export const ELECTRON_LATEX = "\\mathrm{e^{-}}";

export function especieLatex(e: Especie): string {
  return e.carga === 0 ? formulaLatex(e.formula) : ionLatex(e.formula, e.carga);
}
export function terminoLatex(x: TerminoRedox): string {
  return `${x.coef > 1 ? x.coef : ""}${x.coef > 1 ? "\\," : ""}${especieLatex(x.especie)}`;
}
// Lado de una ecuación en LaTeX (sin $), con `electrones` e⁻ al final.
export function ladoLatex(lado: TerminoRedox[], electrones = 0): string {
  const partes = lado.map(terminoLatex);
  if (electrones > 0) partes.push(`${electrones > 1 ? `${electrones}\\,` : ""}${ELECTRON_LATEX}`);
  return partes.join(" + ") || "\\varnothing";
}
export function ecuacionLatex(reactivos: TerminoRedox[], productos: TerminoRedox[], eR = 0, eP = 0): string {
  return `${ladoLatex(reactivos, eR)} \\rightarrow ${ladoLatex(productos, eP)}`;
}

// Lado de una ecuación en LaTeX donde los términos que cambiaron respecto de
// `previo` (una especie nueva o con otro coeficiente) van en color.
export function ladoLatexResaltado(lado: TerminoRedox[], previo: TerminoRedox[], electrones = 0, electronesPrevios = 0, color = "#C026D3"): string {
  const partes = lado.map((x) => {
    const antes = previo.find((y) => clave(y.especie) === clave(x.especie));
    const cambio = !antes || antes.coef !== x.coef;
    return cambio ? `\\textcolor{${color}}{${terminoLatex(x)}}` : terminoLatex(x);
  });
  if (electrones > 0) {
    const e = `${electrones > 1 ? `${electrones}\\,` : ""}${ELECTRON_LATEX}`;
    partes.push(electrones !== electronesPrevios ? `\\textcolor{${color}}{${e}}` : e);
  }
  return partes.join(" + ") || "\\varnothing";
}

// La fórmula con un número de oxidación sobre UN elemento: para
// "K MnO4" y "Mn" con +7 da \mathrm{K}\overset{+7}{\mathrm{Mn}}\mathrm{O}_{4}.
export function oxidacionLatex(n: number | string): string {
  if (typeof n === "string") return n;
  return n > 0 ? `+${n}` : n < 0 ? `-${Math.abs(n)}` : "0";
}
// `numeros` admite un texto (por ejemplo "x" para una incógnita).
export function formulaConNumeros(formula: string, numeros: Record<string, number | string>, carga = 0): string {
  contarAtomos(formula);
  let out = "";
  let i = 0;
  while (i < formula.length) {
    const c = formula[i];
    if (/[A-Z]/.test(c)) {
      let s = c;
      i++;
      while (i < formula.length && /[a-z]/.test(formula[i])) s += formula[i++];
      let n = "";
      while (i < formula.length && /\d/.test(formula[i])) n += formula[i++];
      const base = s in numeros ? `\\overset{${oxidacionLatex(numeros[s])}}{\\mathrm{${s}}}` : `\\mathrm{${s}}`;
      out += n ? `${base}_{${n}}` : base;
    } else if (/\d/.test(c)) {
      let n = "";
      while (i < formula.length && /\d/.test(formula[i])) n += formula[i++];
      out += `_{${n}}`;
    } else {
      out += `\\mathrm{${c}}`;
      i++;
    }
  }
  if (carga !== 0) {
    const n = Math.abs(carga);
    out = `{${out}}^{${n === 1 ? "" : n}${carga > 0 ? "+" : "-"}}`;
  }
  return out;
}

// ---------- Números de oxidación ----------

// Números de oxidación de TODOS los elementos de una especie, por las reglas
// básicas (REGLAS_BASICAS) más los `fijos` que se aclaren (H −1 en hidruros,
// O −1 en peróxidos, Cl −1 en MnCl₂...). Un elemento queda como incógnita y
// se resuelve con resolverOxidacion; si hay más de una incógnita se lanza
// (habría que aclarar cuál es cuál). Un elemento solo (O₂, Cu, Cl⁻) es su
// carga por átomo.
export function numerosDeOxidacion(e: Especie, fijos: Record<string, number> = {}): Record<string, number> {
  const cont = contarAtomos(e.formula);
  const simbolos = Object.keys(cont);
  if (simbolos.length === 1) {
    const x = e.carga / cont[simbolos[0]];
    if (!Number.isInteger(x)) throw new Error(`Número de oxidación no entero en ${e.formula}`);
    return { [simbolos[0]]: x };
  }
  const conocidos: Record<string, number> = {};
  for (const s of simbolos) {
    if (s in fijos) conocidos[s] = fijos[s];
    else if (s in REGLAS_BASICAS) conocidos[s] = REGLAS_BASICAS[s];
  }
  const incognitas = simbolos.filter((s) => !(s in conocidos));
  if (incognitas.length > 1) throw new Error(`Hay más de una incógnita en ${e.formula}: ${incognitas.join(", ")} (aclarar con fijos)`);
  if (incognitas.length === 1) {
    conocidos[incognitas[0]] = resolverOxidacion(e.formula, incognitas[0], e.carga, conocidos);
    return conocidos;
  }
  const suma = simbolos.reduce((a, s) => a + cont[s] * conocidos[s], 0);
  if (suma !== e.carga) throw new Error(`Los números de oxidación de ${e.formula} no suman ${e.carga}`);
  return conocidos;
}

// Plan para calcular UN número de oxidación paso a paso (visual
// "quimia.oxidacion"): números conocidos, ecuación y resultado.
export interface PlanOxidacion {
  especie: Especie;
  incognita: string;
  // Número de oxidación de cada elemento (el de la incógnita ya resuelto).
  numeros: Record<string, number>;
  // Cantidad de átomos de cada elemento.
  cantidades: Record<string, number>;
  // Elementos cuyo número se conoce por las reglas, en el orden de la fórmula.
  conocidos: string[];
}

export function planOxidacion(formula: string, carga: number, incognita: string, fijos: Record<string, number> = {}): PlanOxidacion {
  const especie = sp(formula, carga);
  const cantidades = contarAtomos(formula);
  const numeros = numerosDeOxidacion(especie, fijos);
  const conocidos = Object.keys(cantidades).filter((s) => s !== incognita);
  if (!(incognita in cantidades)) throw new Error(`${incognita} no está en ${formula}`);
  for (const s of conocidos) if (!(s in fijos) && !(s in REGLAS_BASICAS)) throw new Error(`Falta la regla para ${s} en ${formula}`);
  return { especie, incognita, numeros, cantidades, conocidos };
}

// Ecuación "1·(+1) + x + 4·(−2) = 0" en LaTeX (sin $).
export function ecuacionOxidacionLatex(p: PlanOxidacion): string {
  const partes = Object.keys(p.cantidades).map((s) => {
    const n = p.cantidades[s];
    const valor = s === p.incognita ? "x" : `(${oxidacionLatex(p.numeros[s])})`;
    return n === 1 ? valor : `${n}\\cdot ${valor}`;
  });
  return `${partes.join(" + ")} = ${p.especie.carga > 0 ? `+${p.especie.carga}` : p.especie.carga}`;
}

// ---------- Ejemplos de reacciones redox (visual "quimia.redox") ----------

export interface CambioAtomo {
  simbolo: string;
  // Número de oxidación antes y después.
  de: number;
  a: number;
  // Cantidad de átomos (en la ecuación balanceada) que cambian.
  n: number;
}

export interface EjemploRedox {
  id: string;
  tipo: "sintesis" | "desplazamiento" | "combustion" | "reduccion-oxido" | "oxidante-fuerte" | "dismutacion";
  reactivos: TerminoRedox[];
  productos: TerminoRedox[];
  // Aclaraciones para numerosDeOxidacion, por fórmula.
  fijos?: Record<string, Record<string, number>>;
  oxida: CambioAtomo;
  reduce: CambioAtomo;
  // Especie que se oxida (agente reductor) y que se reduce (agente oxidante).
  agenteReductor: string;
  agenteOxidante: string;
}

export const EJEMPLOS_REDOX: EjemploRedox[] = [
  {
    id: "zn-cu",
    tipo: "desplazamiento",
    reactivos: [t(1, "Zn"), t(1, "Cu", 2)],
    productos: [t(1, "Zn", 2), t(1, "Cu")],
    oxida: { simbolo: "Zn", de: 0, a: 2, n: 1 },
    reduce: { simbolo: "Cu", de: 2, a: 0, n: 1 },
    agenteReductor: "Zn",
    agenteOxidante: "Cu",
  },
  {
    id: "na-cl2",
    tipo: "sintesis",
    reactivos: [t(2, "Na"), t(1, "Cl2")],
    productos: [t(2, "NaCl")],
    oxida: { simbolo: "Na", de: 0, a: 1, n: 2 },
    reduce: { simbolo: "Cl", de: 0, a: -1, n: 2 },
    agenteReductor: "Na",
    agenteOxidante: "Cl2",
  },
  {
    id: "mg-o2",
    tipo: "sintesis",
    reactivos: [t(2, "Mg"), t(1, "O2")],
    productos: [t(2, "MgO")],
    oxida: { simbolo: "Mg", de: 0, a: 2, n: 2 },
    reduce: { simbolo: "O", de: 0, a: -2, n: 2 },
    agenteReductor: "Mg",
    agenteOxidante: "O2",
  },
  {
    id: "h2-o2",
    tipo: "sintesis",
    reactivos: [t(2, "H2"), t(1, "O2")],
    productos: [t(2, "H2O")],
    oxida: { simbolo: "H", de: 0, a: 1, n: 4 },
    reduce: { simbolo: "O", de: 0, a: -2, n: 2 },
    agenteReductor: "H2",
    agenteOxidante: "O2",
  },
  {
    id: "ch4-o2",
    tipo: "combustion",
    reactivos: [t(1, "CH4"), t(2, "O2")],
    productos: [t(1, "CO2"), t(2, "H2O")],
    oxida: { simbolo: "C", de: -4, a: 4, n: 1 },
    reduce: { simbolo: "O", de: 0, a: -2, n: 4 },
    agenteReductor: "CH4",
    agenteOxidante: "O2",
  },
  {
    id: "fe-o2",
    tipo: "sintesis",
    reactivos: [t(4, "Fe"), t(3, "O2")],
    productos: [t(2, "Fe2O3")],
    oxida: { simbolo: "Fe", de: 0, a: 3, n: 4 },
    reduce: { simbolo: "O", de: 0, a: -2, n: 6 },
    agenteReductor: "Fe",
    agenteOxidante: "O2",
  },
  {
    id: "fe2o3-co",
    tipo: "reduccion-oxido",
    reactivos: [t(1, "Fe2O3"), t(3, "CO")],
    productos: [t(2, "Fe"), t(3, "CO2")],
    oxida: { simbolo: "C", de: 2, a: 4, n: 3 },
    reduce: { simbolo: "Fe", de: 3, a: 0, n: 2 },
    agenteReductor: "CO",
    agenteOxidante: "Fe2O3",
  },
  {
    id: "cu-hno3",
    tipo: "oxidante-fuerte",
    reactivos: [t(3, "Cu"), t(8, "HNO3")],
    productos: [t(3, "Cu(NO3)2"), t(2, "NO"), t(4, "H2O")],
    fijos: { "Cu(NO3)2": { Cu: 2 } },
    oxida: { simbolo: "Cu", de: 0, a: 2, n: 3 },
    reduce: { simbolo: "N", de: 5, a: 2, n: 2 },
    agenteReductor: "Cu",
    agenteOxidante: "HNO3",
  },
  {
    id: "kmno4-hcl",
    tipo: "oxidante-fuerte",
    reactivos: [t(2, "KMnO4"), t(16, "HCl")],
    productos: [t(2, "KCl"), t(2, "MnCl2"), t(5, "Cl2"), t(8, "H2O")],
    fijos: { MnCl2: { Cl: -1 } },
    oxida: { simbolo: "Cl", de: -1, a: 0, n: 10 },
    reduce: { simbolo: "Mn", de: 7, a: 2, n: 2 },
    agenteReductor: "HCl",
    agenteOxidante: "KMnO4",
  },
  {
    id: "h2o2",
    tipo: "dismutacion",
    reactivos: [t(2, "H2O2")],
    productos: [t(2, "H2O"), t(1, "O2")],
    fijos: { H2O2: { O: -1 } },
    oxida: { simbolo: "O", de: -1, a: 0, n: 2 },
    reduce: { simbolo: "O", de: -1, a: -2, n: 2 },
    agenteReductor: "H2O2",
    agenteOxidante: "H2O2",
  },
];

export function buscarEjemploRedox(id: string): EjemploRedox | undefined {
  return EJEMPLOS_REDOX.find((e) => e.id === id);
}

// Números de oxidación de cada especie de una ecuación.
export function numerosDelEjemplo(ej: EjemploRedox): { especie: Especie; numeros: Record<string, number> }[] {
  return [...ej.reactivos, ...ej.productos].map((x) => ({ especie: x.especie, numeros: numerosDeOxidacion(x.especie, ej.fijos?.[x.especie.formula]) }));
}

// Electrones que pierde el elemento que se oxida y que gana el que se reduce
// (deben ser iguales: la conservación de la carga).
export function electronesDelEjemplo(ej: EjemploRedox): { perdidos: number; ganados: number } {
  return { perdidos: ej.oxida.n * (ej.oxida.a - ej.oxida.de), ganados: ej.reduce.n * (ej.reduce.de - ej.reduce.a) };
}

// Ecuación (LaTeX, sin $) con el número de oxidación sobre los dos elementos
// que cambian (los demás quedan sin número, para no saturar).
export function ecuacionConNumeros(ej: EjemploRedox): string {
  const cual = (e: Especie): Record<string, number> => {
    const nums = numerosDeOxidacion(e, ej.fijos?.[e.formula]);
    const r: Record<string, number> = {};
    for (const c of [ej.oxida, ej.reduce]) {
      if (c.simbolo in nums && (nums[c.simbolo] === c.de || nums[c.simbolo] === c.a)) r[c.simbolo] = nums[c.simbolo];
    }
    return r;
  };
  const termino = (x: TerminoRedox) => `${x.coef > 1 ? `${x.coef}\\,` : ""}${formulaConNumeros(x.especie.formula, cual(x.especie), x.especie.carga)}`;
  const lado = (l: TerminoRedox[]) => l.map(termino).join(" + ");
  return `${lado(ej.reactivos)} \\rightarrow ${lado(ej.productos)}`;
}

// ---------- Balanceo ion-electrón ----------

export type Medio = "acido" | "basico";

export interface SemirreaccionBalanceada {
  reactivos: TerminoRedox[];
  productos: TerminoRedox[];
  // Electrones: a la izquierda en una reducción, a la derecha en una oxidación.
  electrones: number;
  tipo: "oxidacion" | "reduccion";
}

export interface PasosSemirreaccion {
  // Esqueleto con el elemento principal ya igualado (lo que se da).
  esqueleto: { reactivos: TerminoRedox[]; productos: TerminoRedox[] };
  conAgua: { reactivos: TerminoRedox[]; productos: TerminoRedox[]; agregadas: number; lado: "reactivos" | "productos" | null };
  conProtones: { reactivos: TerminoRedox[]; productos: TerminoRedox[]; agregados: number; lado: "reactivos" | "productos" | null };
  conElectrones: SemirreaccionBalanceada;
  // Solo en medio básico.
  basico?: {
    conOH: { reactivos: TerminoRedox[]; productos: TerminoRedox[]; agregados: number };
    neutralizada: SemirreaccionBalanceada;
  };
  final: SemirreaccionBalanceada;
}

const AGUA = sp("H2O");
const PROTON = sp("H", 1);
const HIDROXILO = sp("OH", -1);

function agregar(lado: TerminoRedox[], e: Especie, n: number): TerminoRedox[] {
  return unir([...lado, { coef: n, especie: e }]);
}
function cuantos(lado: TerminoRedox[], e: Especie): number {
  return lado.find((x) => clave(x.especie) === clave(e))?.coef ?? 0;
}
function sinEspecie(lado: TerminoRedox[], e: Especie): TerminoRedox[] {
  return lado.filter((x) => clave(x.especie) !== clave(e));
}

// Balancea UNA semirreacción por el método ion-electrón. `reactivos` y
// `productos` traen el elemento principal (el que cambia de número de
// oxidación) ya igualado. Devuelve cada etapa, para el visual.
export function balancearSemirreaccion(reactivos: TerminoRedox[], productos: TerminoRedox[], medio: Medio): PasosSemirreaccion {
  const esqueleto = { reactivos: unir(reactivos), productos: unir(productos) };
  // 1) Oxígeno con H₂O.
  const dO = (atomosDeLado(esqueleto.reactivos).O ?? 0) - (atomosDeLado(esqueleto.productos).O ?? 0);
  let R = esqueleto.reactivos;
  let P = esqueleto.productos;
  if (dO > 0) P = agregar(P, AGUA, dO);
  else if (dO < 0) R = agregar(R, AGUA, -dO);
  const conAgua = { reactivos: R, productos: P, agregadas: Math.abs(dO), lado: dO === 0 ? null : dO > 0 ? ("productos" as const) : ("reactivos" as const) };
  // 2) Hidrógeno con H⁺.
  const dH = (atomosDeLado(R).H ?? 0) - (atomosDeLado(P).H ?? 0);
  if (dH > 0) P = agregar(P, PROTON, dH);
  else if (dH < 0) R = agregar(R, PROTON, -dH);
  const conProtones = { reactivos: R, productos: P, agregados: Math.abs(dH), lado: dH === 0 ? null : dH > 0 ? ("productos" as const) : ("reactivos" as const) };
  // 3) Carga con electrones (van del lado más positivo).
  const qR = cargaDeLado(R);
  const qP = cargaDeLado(P);
  const n = Math.abs(qR - qP);
  const tipo = qR > qP ? ("reduccion" as const) : ("oxidacion" as const);
  const conElectrones: SemirreaccionBalanceada = { reactivos: R, productos: P, electrones: n, tipo };

  if (medio === "acido") return { esqueleto, conAgua, conProtones, conElectrones, final: conElectrones };

  // Medio básico: se suman tantos OH⁻ como H⁺ hay, a los dos lados; H⁺ + OH⁻ → H₂O.
  const nH = cuantos(R, PROTON) + cuantos(P, PROTON);
  const conOH = { reactivos: agregar(R, HIDROXILO, nH), productos: agregar(P, HIDROXILO, nH), agregados: nH };
  let R2 = agregar(R, HIDROXILO, nH);
  let P2 = agregar(P, HIDROXILO, nH);
  // Del lado donde estaba el H⁺ se forman H₂O; el H⁺ desaparece, y el OH⁻ agregado también.
  if (cuantos(R, PROTON) > 0) {
    R2 = agregar(sinEspecie(R2, PROTON), AGUA, nH);
    R2 = agregar(R2, HIDROXILO, -nH);
  } else if (cuantos(P, PROTON) > 0) {
    P2 = agregar(sinEspecie(P2, PROTON), AGUA, nH);
    P2 = agregar(P2, HIDROXILO, -nH);
  }
  // Se simplifica el agua que quedó a los dos lados.
  const aguaComun = Math.min(cuantos(R2, AGUA), cuantos(P2, AGUA));
  if (aguaComun > 0) {
    R2 = agregar(R2, AGUA, -aguaComun);
    P2 = agregar(P2, AGUA, -aguaComun);
  }
  const neutralizada: SemirreaccionBalanceada = { reactivos: unir(R2), productos: unir(P2), electrones: n, tipo };
  return { esqueleto, conAgua, conProtones, conElectrones, basico: { conOH, neutralizada }, final: neutralizada };
}

function mcm(a: number, b: number): number {
  const mcd = (x: number, y: number): number => (y === 0 ? x : mcd(y, x % y));
  return (a / mcd(a, b)) * b;
}

export interface EcuacionIonica {
  reactivos: TerminoRedox[];
  productos: TerminoRedox[];
  // Multiplicadores que igualan los electrones.
  multOxidacion: number;
  multReduccion: number;
  electrones: number;
}

// Suma las dos semirreacciones (iguala los electrones y simplifica H₂O, H⁺ y
// OH⁻ que aparecen de los dos lados).
export function combinarSemirreacciones(ox: SemirreaccionBalanceada, red: SemirreaccionBalanceada): EcuacionIonica {
  if (ox.tipo !== "oxidacion" || red.tipo !== "reduccion") throw new Error("Hay que combinar una oxidación con una reducción");
  const e = mcm(ox.electrones, red.electrones);
  const mO = e / ox.electrones;
  const mR = e / red.electrones;
  const por = (l: TerminoRedox[], m: number) => l.map((x) => ({ ...x, coef: x.coef * m }));
  let R = unir([...por(ox.reactivos, mO), ...por(red.reactivos, mR)]);
  let P = unir([...por(ox.productos, mO), ...por(red.productos, mR)]);
  for (const c of [AGUA, PROTON, HIDROXILO]) {
    const comun = Math.min(cuantos(R, c), cuantos(P, c));
    if (comun > 0) {
      R = agregar(R, c, -comun);
      P = agregar(P, c, -comun);
    }
  }
  return { reactivos: R, productos: P, multOxidacion: mO, multReduccion: mR, electrones: e };
}

// Comprueba la conservación de átomos y de carga (lanza si falla).
export function verificarEcuacion(reactivos: TerminoRedox[], productos: TerminoRedox[], eR = 0, eP = 0): void {
  const a = atomosDeLado(reactivos);
  const b = atomosDeLado(productos);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if ((a[k] ?? 0) !== (b[k] ?? 0)) throw new Error(`Átomos sin balancear (${k}): ${ecuacionLatex(reactivos, productos)}`);
  }
  if (cargaDeLado(reactivos, eR) !== cargaDeLado(productos, eP)) throw new Error(`Carga sin balancear: ${ecuacionLatex(reactivos, productos)}`);
}

export function verificarSemirreaccion(s: SemirreaccionBalanceada): void {
  verificarEcuacion(s.reactivos, s.productos, s.tipo === "reduccion" ? s.electrones : 0, s.tipo === "oxidacion" ? s.electrones : 0);
}

// Casos de balanceo ion-electrón del visual "quimia.balanceo": dos esquemas
// (oxidación y reducción) con el elemento principal ya igualado.
export interface CasoBalanceo {
  id: string;
  medio: Medio;
  // Cada semirreacción: reactivos → productos (lo que se da).
  reduccion: { reactivos: TerminoRedox[]; productos: TerminoRedox[] };
  oxidacion: { reactivos: TerminoRedox[]; productos: TerminoRedox[] };
}

export const CASOS_BALANCEO: CasoBalanceo[] = [
  {
    id: "mno4-fe2",
    medio: "acido",
    reduccion: { reactivos: [t(1, "MnO4", -1)], productos: [t(1, "Mn", 2)] },
    oxidacion: { reactivos: [t(1, "Fe", 2)], productos: [t(1, "Fe", 3)] },
  },
  {
    id: "cr2o7-fe2",
    medio: "acido",
    reduccion: { reactivos: [t(1, "Cr2O7", -2)], productos: [t(2, "Cr", 3)] },
    oxidacion: { reactivos: [t(1, "Fe", 2)], productos: [t(1, "Fe", 3)] },
  },
  {
    id: "mno4-h2o2",
    medio: "acido",
    reduccion: { reactivos: [t(1, "MnO4", -1)], productos: [t(1, "Mn", 2)] },
    oxidacion: { reactivos: [t(1, "H2O2")], productos: [t(1, "O2")] },
  },
  {
    id: "mno4-cl",
    medio: "acido",
    reduccion: { reactivos: [t(1, "MnO4", -1)], productos: [t(1, "Mn", 2)] },
    oxidacion: { reactivos: [t(2, "Cl", -1)], productos: [t(1, "Cl2")] },
  },
  {
    id: "cu-no3",
    medio: "acido",
    reduccion: { reactivos: [t(1, "NO3", -1)], productos: [t(1, "NO")] },
    oxidacion: { reactivos: [t(1, "Cu")], productos: [t(1, "Cu", 2)] },
  },
  {
    id: "mno4-i",
    medio: "basico",
    reduccion: { reactivos: [t(1, "MnO4", -1)], productos: [t(1, "MnO2")] },
    oxidacion: { reactivos: [t(2, "I", -1)], productos: [t(1, "I2")] },
  },
  {
    id: "cr-oh3-clo",
    medio: "basico",
    reduccion: { reactivos: [t(1, "ClO", -1)], productos: [t(1, "Cl", -1)] },
    oxidacion: { reactivos: [t(1, "Cr(OH)3")], productos: [t(1, "CrO4", -2)] },
  },
];

export function buscarCasoBalanceo(id: string): CasoBalanceo | undefined {
  return CASOS_BALANCEO.find((c) => c.id === id);
}

export interface ResultadoCaso {
  caso: CasoBalanceo;
  reduccion: PasosSemirreaccion;
  oxidacion: PasosSemirreaccion;
  suma: EcuacionIonica;
}

export function resolverCaso(id: string): ResultadoCaso {
  const caso = buscarCasoBalanceo(id);
  if (!caso) throw new Error(`Caso de balanceo inexistente: ${id}`);
  const reduccion = balancearSemirreaccion(caso.reduccion.reactivos, caso.reduccion.productos, caso.medio);
  const oxidacion = balancearSemirreaccion(caso.oxidacion.reactivos, caso.oxidacion.productos, caso.medio);
  if (reduccion.final.tipo !== "reduccion" || oxidacion.final.tipo !== "oxidacion") throw new Error(`Caso ${id}: los tipos de las semirreacciones no coinciden`);
  return { caso, reduccion, oxidacion, suma: combinarSemirreacciones(oxidacion.final, reduccion.final) };
}

// ---------- Serie de actividad y pilas ----------

// Potenciales estándar de reducción (25 °C, 1 mol/L, 1 atm) en CENTIVOLTIOS
// (enteros: así no hay errores de coma flotante), de la tabla estándar de
// referencia (CRC Handbook), redondeados a 2 decimales. La semirreacción es
// M^(n+) + n e⁻ → M.
export interface ParRedox {
  simbolo: string;
  nombre: string;
  // Carga del catión (n).
  carga: number;
  cV: number;
}

export const POTENCIALES: ParRedox[] = [
  { simbolo: "K", nombre: "potasio", carga: 1, cV: -293 },
  { simbolo: "Ca", nombre: "calcio", carga: 2, cV: -287 },
  { simbolo: "Na", nombre: "sodio", carga: 1, cV: -271 },
  { simbolo: "Mg", nombre: "magnesio", carga: 2, cV: -237 },
  { simbolo: "Al", nombre: "aluminio", carga: 3, cV: -166 },
  { simbolo: "Zn", nombre: "zinc", carga: 2, cV: -76 },
  { simbolo: "Fe", nombre: "hierro", carga: 2, cV: -44 },
  { simbolo: "Sn", nombre: "estaño", carga: 2, cV: -14 },
  { simbolo: "Pb", nombre: "plomo", carga: 2, cV: -13 },
  { simbolo: "Cu", nombre: "cobre", carga: 2, cV: 34 },
  { simbolo: "Ag", nombre: "plata", carga: 1, cV: 80 },
  { simbolo: "Au", nombre: "oro", carga: 3, cV: 150 },
];

// Referencia del hidrógeno: 2 H⁺ + 2 e⁻ → H₂, 0,00 V por definición.
export const POTENCIAL_HIDROGENO_CV = 0;

export function parDe(simbolo: string): ParRedox {
  const p = POTENCIALES.find((x) => x.simbolo === simbolo);
  if (!p) throw new Error(`Sin potencial cargado para ${simbolo}`);
  return p;
}

// Serie de actividad: de más a menos reactivo (menor a mayor potencial de
// reducción), calculada de la tabla. El hidrógeno se ubica por su potencial.
export function serieDeActividad(): { simbolo: string; cV: number }[] {
  return [...POTENCIALES.map((p) => ({ simbolo: p.simbolo, cV: p.cV })), { simbolo: "H", cV: POTENCIAL_HIDROGENO_CV }].sort((a, b) => a.cV - b.cV);
}

// Voltios con coma decimal y 2 decimales ("−0,76", "1,10").
export function voltios(cV: number): string {
  const s = (Math.abs(cV) / 100).toFixed(2).replace(".", ",");
  return cV < 0 ? `−${s}` : s;
}

// ¿El metal desplaza al catión del otro (o al H⁺)? Espontáneo si el
// potencial de reducción del catión supera al del metal que se oxida.
export function desplaza(metal: string, otro: string): boolean {
  const cMetal = metal === "H" ? POTENCIAL_HIDROGENO_CV : parDe(metal).cV;
  const cOtro = otro === "H" ? POTENCIAL_HIDROGENO_CV : parDe(otro).cV;
  return cOtro > cMetal;
}

export interface PilaGalvanica {
  id: string;
  anodo: ParRedox;
  catodo: ParRedox;
  // Semirreacciones balanceadas (sin agua ni H⁺: son metales y sus iones).
  oxidacion: SemirreaccionBalanceada;
  reduccion: SemirreaccionBalanceada;
  global: EcuacionIonica;
  // Potencial estándar de la pila = E°cátodo − E°ánodo, en centivoltios.
  cV: number;
}

export function armarPila(simboloAnodo: string, simboloCatodo: string): PilaGalvanica {
  const a = parDe(simboloAnodo);
  const c = parDe(simboloCatodo);
  if (c.cV <= a.cV) throw new Error(`${simboloAnodo}/${simboloCatodo}: no es una pila espontánea (el cátodo debe tener mayor potencial)`);
  const oxidacion: SemirreaccionBalanceada = { reactivos: [t(1, a.simbolo)], productos: [t(1, a.simbolo, a.carga)], electrones: a.carga, tipo: "oxidacion" };
  const reduccion: SemirreaccionBalanceada = { reactivos: [t(1, c.simbolo, c.carga)], productos: [t(1, c.simbolo)], electrones: c.carga, tipo: "reduccion" };
  return { id: `${simboloAnodo}-${simboloCatodo}`, anodo: a, catodo: c, oxidacion, reduccion, global: combinarSemirreacciones(oxidacion, reduccion), cV: c.cV - a.cV };
}

// Pilas que muestra el visual "quimia.pila" (ánodo, cátodo).
export const PILAS: [string, string][] = [
  ["Zn", "Cu"],
  ["Zn", "Ag"],
  ["Fe", "Cu"],
  ["Mg", "Cu"],
  ["Al", "Cu"],
];

// Electrólisis de nivel introductorio (proceso NO espontáneo, con corriente
// externa): el cátodo es el negativo (se reduce) y el ánodo el positivo (se
// oxida), al revés que en la pila.
export interface Electrolisis {
  id: string;
  nombre: string;
  catodo: SemirreaccionBalanceada;
  anodo: SemirreaccionBalanceada;
  global: EcuacionIonica;
}

function armarElectrolisis(id: string, nombre: string, reduccion: SemirreaccionBalanceada, oxidacion: SemirreaccionBalanceada): Electrolisis {
  return { id, nombre, catodo: reduccion, anodo: oxidacion, global: combinarSemirreacciones(oxidacion, reduccion) };
}

export const ELECTROLISIS: Electrolisis[] = [
  armarElectrolisis(
    "agua",
    "agua acidulada",
    { reactivos: [t(4, "H", 1)], productos: [t(2, "H2")], electrones: 4, tipo: "reduccion" },
    { reactivos: [t(2, "H2O")], productos: [t(1, "O2"), t(4, "H", 1)], electrones: 4, tipo: "oxidacion" }
  ),
  armarElectrolisis(
    "nacl-fundido",
    "cloruro de sodio fundido",
    { reactivos: [t(1, "Na", 1)], productos: [t(1, "Na")], electrones: 1, tipo: "reduccion" },
    { reactivos: [t(2, "Cl", -1)], productos: [t(1, "Cl2")], electrones: 2, tipo: "oxidacion" }
  ),
];

// ---------- Estados de oxidación más citados (práctica) ----------

// Nombre corto de un signo: "+3", "−2", "0".
export function textoOxidacion(n: number): string {
  return n === 0 ? "0" : n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

// ---------- ¿Es redox? ----------

// Elementos cuyo número de oxidación cambia en una reacción: el conjunto de
// números que tiene en los reactivos no coincide con el de los productos.
// Una reacción es redox si y solo si esta lista no está vacía.
export function elementosQueCambian(reactivos: TerminoRedox[], productos: TerminoRedox[], fijos: Record<string, Record<string, number>> = {}): string[] {
  const juntar = (lado: TerminoRedox[]) => {
    const m: Record<string, Set<number>> = {};
    for (const x of lado) {
      const nums = numerosDeOxidacion(x.especie, fijos[x.especie.formula]);
      for (const [s, n] of Object.entries(nums)) (m[s] ??= new Set()).add(n);
    }
    return m;
  };
  const a = juntar(reactivos);
  const b = juntar(productos);
  return Object.keys(a).filter((s) => {
    const x = [...(a[s] ?? [])].sort().join(",");
    const y = [...(b[s] ?? [])].sort().join(",");
    return x !== y;
  });
}

// Combustión completa de un hidrocarburo CxHy: coeficientes enteros mínimos
// de CxHy, O2, CO2 y H2O (CO2 = x, H2O = y/2, O2 = (2x + y/2)/2; se duplica
// todo si O2 da un medio).
export function coeficientesCombustion(c: number, h: number): { hc: number; o2: number; co2: number; h2o: number } {
  // O2 = c + h/4: si h no es múltiplo de 4 se duplica (o cuadruplica) para tener enteros.
  const k = h % 4 === 0 ? 1 : h % 2 === 0 ? 2 : 4;
  const co2 = k * c;
  const h2o = (k * h) / 2;
  const o2 = k * (c + h / 4);
  const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
  const g = [k, o2, co2, h2o].reduce((a, b) => mcd(a, b));
  return { hc: k / g, o2: o2 / g, co2: co2 / g, h2o: h2o / g };
}

// ---------- Estados de oxidación más comunes (los de la práctica) ----------

export interface ItemEstadoComun {
  simbolos: string[];
  valor: number;
}
export interface FilaEstadoComun {
  titulo: string;
  items: ItemEstadoComun[];
}

// El estado de oxidación "más común" de cada elemento con Z <= 103 (el que
// pregunta la práctica de Quimia en "Tabla periódica", niveles 8-10), agrupado
// por grupo de la tabla para la Clase de número de oxidación: grupos
// principales, metales de transición y bloque f. Sale de ELEMENTOS, no se
// escribe a mano. Es un criterio de tabla escolar: casi todos los elementos
// de transición tienen varios estados.
export function estadosComunesPorGrupo(): { principales: FilaEstadoComun[]; transicion: FilaEstadoComun[]; interna: FilaEstadoComun[] } {
  const elegibles = ELEMENTOS.filter((e) => e.numeroAtomico <= Z_MAX_CON_ESTADO_OXIDACION);
  const esF = (z: number) => (z >= 57 && z <= 71) || (z >= 89 && z <= 103);
  const agrupar = (lista: typeof elegibles): ItemEstadoComun[] => {
    const items: ItemEstadoComun[] = [];
    for (const e of [...lista].sort((a, b) => a.numeroAtomico - b.numeroAtomico)) {
      const previo = items.find((x) => x.valor === e.estadoOxidacionComun);
      if (previo) previo.simbolos.push(e.simbolo);
      else items.push({ simbolos: [e.simbolo], valor: e.estadoOxidacionComun });
    }
    return items;
  };
  const porGrupo = (g: number) => elegibles.filter((e) => e.grupo === g && !esF(e.numeroAtomico));
  const grupos = (ns: number[]): FilaEstadoComun[] => ns.map((g) => ({ titulo: `Grupo ${g}`, items: agrupar(porGrupo(g)) }));
  const lantanidos = elegibles.filter((e) => e.numeroAtomico >= 57 && e.numeroAtomico <= 71);
  const actinidos = elegibles.filter((e) => e.numeroAtomico >= 89 && e.numeroAtomico <= 103);
  return {
    principales: grupos([1, 2, 13, 14, 15, 16, 17, 18]),
    transicion: grupos([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    interna: [
      { titulo: "Lantánidos (La a Lu)", items: agrupar(lantanidos) },
      { titulo: "Actínidos (Ac a Lr)", items: agrupar(actinidos) },
    ],
  };
}

// Texto de una fila: "N: −3; P: +5; As, Sb, Bi: +3".
export function textoFilaEstadoComun(f: FilaEstadoComun): string {
  return f.items.map((x) => `${x.simbolos.join(", ")}: ${textoOxidacion(x.valor)}`).join("; ");
}
