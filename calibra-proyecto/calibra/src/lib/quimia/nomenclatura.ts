import { contarAtomos } from "./formulas";

// Nomenclatura inorgánica de las Clases de Quimia: iones, cómo se ARMA una
// fórmula cruzando cargas, y una tabla de referencia curada de compuestos
// con sus nombres en los tres sistemas que se enseñan en el colegio
// (tradicional, Stock y sistemática/IUPAC con prefijos).
//
// Las lecciones no escriben nombres "de memoria": los piden a esta tabla
// con `nombreDe(formula, sistema)` (src/lib/quimia/lecciones/ayudas.ts), y
// nomenclatura.test.ts comprueba cada entrada contra reglas calculadas de
// forma independiente (fórmula por cruce de cargas, número romano = carga,
// -oso/-ico según la valencia, prefijos = subíndices).
//
// Convenciones de nivel colegio que se aplican y se aclaran en las Clases:
//   - Tradicional: -oso (valencia menor) / -ico (valencia mayor) para
//     metales con dos valencias ("óxido ferroso / férrico"); sin sufijo
//     para los de una sola ("óxido de sodio"). IUPAC 2005 ya no recomienda
//     este sistema, pero se sigue enseñando.
//   - Stock: el número de oxidación en romanos y entre paréntesis
//     ("óxido de hierro (III)"); se omite si el metal tiene una sola
//     valencia. En textos de la IUPAC se escribe sin espacio antes del
//     paréntesis; en el colegio suele verse con espacio (así lo usa
//     también la práctica de Quimia).
//   - Sistemática: prefijos mono-, di-, tri-... según el subíndice
//     ("trióxido de dihierro"). En el primer elemento "mono" se omite.

export interface IonDef {
  id: string; // "Fe3+"
  // Fórmula del ion en texto plano ("Fe", "SO4").
  formula: string;
  carga: number; // con signo
  nombre: string; // "hierro" | "sulfato"
  // Sufijo tradicional de un catión con dos valencias ("férrico").
  trad?: string;
  poliatomico?: boolean;
}

const cat = (id: string, formula: string, carga: number, nombre: string, trad?: string, poliatomico = false): IonDef => ({
  id,
  formula,
  carga,
  nombre,
  trad,
  poliatomico,
});
const an = (id: string, formula: string, carga: number, nombre: string, poliatomico = false): IonDef => ({
  id,
  formula,
  carga,
  nombre,
  poliatomico,
});

export const CATIONES: IonDef[] = [
  cat("Li+", "Li", 1, "litio"),
  cat("Na+", "Na", 1, "sodio"),
  cat("K+", "K", 1, "potasio"),
  cat("Ag+", "Ag", 1, "plata"),
  cat("Mg2+", "Mg", 2, "magnesio"),
  cat("Ca2+", "Ca", 2, "calcio"),
  cat("Ba2+", "Ba", 2, "bario"),
  cat("Zn2+", "Zn", 2, "zinc"),
  cat("Al3+", "Al", 3, "aluminio"),
  cat("NH4+", "NH4", 1, "amonio", undefined, true),
  cat("Fe2+", "Fe", 2, "hierro", "ferroso"),
  cat("Fe3+", "Fe", 3, "hierro", "férrico"),
  cat("Cu+", "Cu", 1, "cobre", "cuproso"),
  cat("Cu2+", "Cu", 2, "cobre", "cúprico"),
  cat("Sn2+", "Sn", 2, "estaño", "estannoso"),
  cat("Sn4+", "Sn", 4, "estaño", "estánnico"),
  cat("Pb2+", "Pb", 2, "plomo", "plumboso"),
  cat("Pb4+", "Pb", 4, "plomo", "plúmbico"),
  cat("Au+", "Au", 1, "oro", "auroso"),
  cat("Au3+", "Au", 3, "oro", "áurico"),
  cat("Co2+", "Co", 2, "cobalto", "cobaltoso"),
  cat("Co3+", "Co", 3, "cobalto", "cobáltico"),
];

export const ANIONES: IonDef[] = [
  an("H-", "H", -1, "hidruro"),
  an("F-", "F", -1, "fluoruro"),
  an("Cl-", "Cl", -1, "cloruro"),
  an("Br-", "Br", -1, "bromuro"),
  an("I-", "I", -1, "yoduro"),
  an("O2-", "O", -2, "óxido"),
  an("S2-", "S", -2, "sulfuro"),
  an("N3-", "N", -3, "nitruro"),
  an("O2^2-", "O2", -2, "peróxido", true),
  an("OH-", "OH", -1, "hidróxido", true),
  an("CN-", "CN", -1, "cianuro", true),
  an("NO3-", "NO3", -1, "nitrato", true),
  an("NO2-", "NO2", -1, "nitrito", true),
  an("SO4^2-", "SO4", -2, "sulfato", true),
  an("SO3^2-", "SO3", -2, "sulfito", true),
  an("CO3^2-", "CO3", -2, "carbonato", true),
  an("PO4^3-", "PO4", -3, "fosfato", true),
  an("ClO-", "ClO", -1, "hipoclorito", true),
  an("ClO2-", "ClO2", -1, "clorito", true),
  an("ClO3-", "ClO3", -1, "clorato", true),
  an("ClO4-", "ClO4", -1, "perclorato", true),
  an("MnO4-", "MnO4", -1, "permanganato", true),
  an("CrO4^2-", "CrO4", -2, "cromato", true),
  an("Cr2O7^2-", "Cr2O7", -2, "dicromato", true),
  an("HCO3-", "HCO3", -1, "hidrogenocarbonato", true),
  an("HSO4-", "HSO4", -1, "hidrogenosulfato", true),
  an("HSO3-", "HSO3", -1, "hidrogenosulfito", true),
  an("HS-", "HS", -1, "hidrogenosulfuro", true),
  an("H2PO4-", "H2PO4", -1, "dihidrogenofosfato", true),
  an("HPO4^2-", "HPO4", -2, "hidrogenofosfato", true),
];

export function buscarCation(id: string): IonDef {
  const x = CATIONES.find((c) => c.id === id);
  if (!x) throw new Error(`Catión desconocido: ${id}`);
  return x;
}
export function buscarAnion(id: string): IonDef {
  const x = ANIONES.find((c) => c.id === id);
  if (!x) throw new Error(`Anión desconocido: ${id}`);
  return x;
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

export interface FormulaArmada {
  formula: string;
  nCation: number;
  nAnion: number;
}

// "Cruzar las cargas": el valor absoluto de la carga de cada ion pasa a ser
// el subíndice del otro, y se simplifica dividiendo por el máximo común
// divisor (Ca2+ + O2- -> Ca2O2 -> CaO). Los iones poliatómicos llevan
// paréntesis cuando el subíndice es mayor que 1 (Ca(OH)2, Al2(SO4)3).
export function armarFormula(c: IonDef, a: IonDef): FormulaArmada {
  const qc = Math.abs(c.carga);
  const qa = Math.abs(a.carga);
  const g = mcd(qc, qa);
  const nCation = qa / g;
  const nAnion = qc / g;
  const parte = (ion: IonDef, n: number) => {
    if (n === 1) return ion.formula;
    return ion.poliatomico ? `(${ion.formula})${n}` : `${ion.formula}${n}`;
  };
  // Sin paréntesis si el ion poliatómico es un solo bloque de un átomo
  // (no ocurre acá) — la regla general alcanza para esta tabla.
  return { formula: parte(c, nCation) + parte(a, nAnion), nCation, nAnion };
}

// ---------- Prefijos numéricos ----------
export const PREFIJOS = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa"];
export function prefijo(n: number): string {
  if (n < 1 || n >= PREFIJOS.length) throw new Error(`Sin prefijo para ${n}`);
  return PREFIJOS[n];
}

// Unión prefijo + palabra: "mono" + "óxido" = "monóxido" (se pierde una "o");
// el resto se pega tal cual: "dióxido", "trióxido", "tetraóxido",
// "pentaóxido" (también se ve "tetróxido"/"pentóxido" en algunos textos).
function conPrefijo(n: number, palabra: string): string {
  const p = prefijo(n);
  if (palabra === "óxido" && p === "mono") return "monóxido";
  return p + palabra;
}

// Romano de 1 a 7 (las cargas/valencias que se ven en el colegio).
const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
export function romano(n: number): string {
  if (n < 1 || n >= ROMANOS.length) throw new Error(`Sin romano para ${n}`);
  return ROMANOS[n];
}

function esVariable(c: IonDef): boolean {
  return c.trad !== undefined;
}

export type SistemaNomenclatura = "tradicional" | "stock" | "sistematica";

// Nombre Stock: "óxido de hierro (III)", "cloruro de sodio".
export function nombreStock(c: IonDef, a: IonDef): string {
  return `${a.nombre} de ${c.nombre}${esVariable(c) ? ` (${romano(c.carga)})` : ""}`;
}

// Nombre tradicional: "óxido férrico" (metal de 2 valencias) o "óxido de
// sodio" (una sola valencia).
export function nombreTradicional(c: IonDef, a: IonDef): string {
  return esVariable(c) ? `${a.nombre} ${c.trad}` : `${a.nombre} de ${c.nombre}`;
}

// Nombre sistemático con prefijos, para compuestos BINARIOS y los
// hidróxidos ("trióxido de dihierro", "dihidróxido de calcio"). Para las
// oxisales (aniones poliatómicos con oxígeno) la nomenclatura sistemática
// es de otro estilo y no se aplica acá.
export function nombreSistematico(c: IonDef, a: IonDef): string {
  const { nCation, nAnion } = armarFormula(c, a);
  const parteAnion = conPrefijo(nAnion, a.nombre === "óxido" ? "óxido" : a.nombre);
  const parteCation = nCation === 1 ? c.nombre : prefijo(nCation) + c.nombre;
  return `${parteAnion} de ${parteCation}`;
}

// ---------- Tabla de referencia curada (escrita a mano) ----------

export interface CompuestoIonicoRef {
  formula: string;
  cation: string; // id de CATIONES
  anion: string; // id de ANIONES
  tradicional: string;
  stock: string;
  // undefined = la sistemática con prefijos no aplica (oxisales) o se
  // aclara aparte (peróxidos).
  sistematica?: string;
  // Nombre común/cotidiano, si lo tiene.
  comun?: string;
}

const r = (
  formula: string,
  cation: string,
  anion: string,
  tradicional: string,
  stock: string,
  sistematica?: string,
  comun?: string
): CompuestoIonicoRef => ({ formula, cation, anion, tradicional, stock, sistematica, comun });

export const COMPUESTOS_IONICOS: CompuestoIonicoRef[] = [
  // Óxidos básicos
  r("Li2O", "Li+", "O2-", "óxido de litio", "óxido de litio", "monóxido de dilitio"),
  r("Na2O", "Na+", "O2-", "óxido de sodio", "óxido de sodio", "monóxido de disodio"),
  r("K2O", "K+", "O2-", "óxido de potasio", "óxido de potasio", "monóxido de dipotasio"),
  r("Ag2O", "Ag+", "O2-", "óxido de plata", "óxido de plata", "monóxido de diplata"),
  r("MgO", "Mg2+", "O2-", "óxido de magnesio", "óxido de magnesio", "monóxido de magnesio"),
  r("CaO", "Ca2+", "O2-", "óxido de calcio", "óxido de calcio", "monóxido de calcio", "cal viva"),
  r("BaO", "Ba2+", "O2-", "óxido de bario", "óxido de bario", "monóxido de bario"),
  r("ZnO", "Zn2+", "O2-", "óxido de zinc", "óxido de zinc", "monóxido de zinc"),
  r("Al2O3", "Al3+", "O2-", "óxido de aluminio", "óxido de aluminio", "trióxido de dialuminio"),
  r("FeO", "Fe2+", "O2-", "óxido ferroso", "óxido de hierro (II)", "monóxido de hierro"),
  r("Fe2O3", "Fe3+", "O2-", "óxido férrico", "óxido de hierro (III)", "trióxido de dihierro"),
  r("Cu2O", "Cu+", "O2-", "óxido cuproso", "óxido de cobre (I)", "monóxido de dicobre"),
  r("CuO", "Cu2+", "O2-", "óxido cúprico", "óxido de cobre (II)", "monóxido de cobre"),
  r("SnO", "Sn2+", "O2-", "óxido estannoso", "óxido de estaño (II)", "monóxido de estaño"),
  r("SnO2", "Sn4+", "O2-", "óxido estánnico", "óxido de estaño (IV)", "dióxido de estaño"),
  r("PbO", "Pb2+", "O2-", "óxido plumboso", "óxido de plomo (II)", "monóxido de plomo"),
  r("PbO2", "Pb4+", "O2-", "óxido plúmbico", "óxido de plomo (IV)", "dióxido de plomo"),
  r("Au2O3", "Au3+", "O2-", "óxido áurico", "óxido de oro (III)", "trióxido de dioro"),
  // Hidruros metálicos
  r("NaH", "Na+", "H-", "hidruro de sodio", "hidruro de sodio", "monohidruro de sodio"),
  r("CaH2", "Ca2+", "H-", "hidruro de calcio", "hidruro de calcio", "dihidruro de calcio"),
  r("AlH3", "Al3+", "H-", "hidruro de aluminio", "hidruro de aluminio", "trihidruro de aluminio"),
  r("FeH2", "Fe2+", "H-", "hidruro ferroso", "hidruro de hierro (II)", "dihidruro de hierro"),
  r("FeH3", "Fe3+", "H-", "hidruro férrico", "hidruro de hierro (III)", "trihidruro de hierro"),
  // Peróxidos (ion O2 con carga 2-): la sistemática con prefijos no se
  // enseña a este nivel.
  r("Na2O2", "Na+", "O2^2-", "peróxido de sodio", "peróxido de sodio"),
  r("BaO2", "Ba2+", "O2^2-", "peróxido de bario", "peróxido de bario"),
  r("CaO2", "Ca2+", "O2^2-", "peróxido de calcio", "peróxido de calcio"),
  // Hidróxidos
  r("NaOH", "Na+", "OH-", "hidróxido de sodio", "hidróxido de sodio", "monohidróxido de sodio", "soda cáustica"),
  r("KOH", "K+", "OH-", "hidróxido de potasio", "hidróxido de potasio", "monohidróxido de potasio", "potasa cáustica"),
  r("Ca(OH)2", "Ca2+", "OH-", "hidróxido de calcio", "hidróxido de calcio", "dihidróxido de calcio", "cal apagada"),
  r("Mg(OH)2", "Mg2+", "OH-", "hidróxido de magnesio", "hidróxido de magnesio", "dihidróxido de magnesio", "leche de magnesia"),
  r("Ba(OH)2", "Ba2+", "OH-", "hidróxido de bario", "hidróxido de bario", "dihidróxido de bario"),
  r("Al(OH)3", "Al3+", "OH-", "hidróxido de aluminio", "hidróxido de aluminio", "trihidróxido de aluminio"),
  r("Zn(OH)2", "Zn2+", "OH-", "hidróxido de zinc", "hidróxido de zinc", "dihidróxido de zinc"),
  r("Fe(OH)2", "Fe2+", "OH-", "hidróxido ferroso", "hidróxido de hierro (II)", "dihidróxido de hierro"),
  r("Fe(OH)3", "Fe3+", "OH-", "hidróxido férrico", "hidróxido de hierro (III)", "trihidróxido de hierro"),
  r("CuOH", "Cu+", "OH-", "hidróxido cuproso", "hidróxido de cobre (I)", "monohidróxido de cobre"),
  r("Cu(OH)2", "Cu2+", "OH-", "hidróxido cúprico", "hidróxido de cobre (II)", "dihidróxido de cobre"),
  r("Pb(OH)2", "Pb2+", "OH-", "hidróxido plumboso", "hidróxido de plomo (II)", "dihidróxido de plomo"),
  r("Sn(OH)4", "Sn4+", "OH-", "hidróxido estánnico", "hidróxido de estaño (IV)", "tetrahidróxido de estaño"),
  r("Au(OH)3", "Au3+", "OH-", "hidróxido áurico", "hidróxido de oro (III)", "trihidróxido de oro"),
  r("NH4OH", "NH4+", "OH-", "hidróxido de amonio", "hidróxido de amonio"),
  // Sales binarias (haluros y sulfuros)
  r("NaCl", "Na+", "Cl-", "cloruro de sodio", "cloruro de sodio", "monocloruro de sodio", "sal común"),
  r("KBr", "K+", "Br-", "bromuro de potasio", "bromuro de potasio", "monobromuro de potasio"),
  r("KI", "K+", "I-", "yoduro de potasio", "yoduro de potasio", "monoyoduro de potasio"),
  r("AgCl", "Ag+", "Cl-", "cloruro de plata", "cloruro de plata", "monocloruro de plata"),
  r("CaF2", "Ca2+", "F-", "fluoruro de calcio", "fluoruro de calcio", "difluoruro de calcio"),
  r("MgCl2", "Mg2+", "Cl-", "cloruro de magnesio", "cloruro de magnesio", "dicloruro de magnesio"),
  r("AlCl3", "Al3+", "Cl-", "cloruro de aluminio", "cloruro de aluminio", "tricloruro de aluminio"),
  r("FeCl2", "Fe2+", "Cl-", "cloruro ferroso", "cloruro de hierro (II)", "dicloruro de hierro"),
  r("FeCl3", "Fe3+", "Cl-", "cloruro férrico", "cloruro de hierro (III)", "tricloruro de hierro"),
  r("CuCl", "Cu+", "Cl-", "cloruro cuproso", "cloruro de cobre (I)", "monocloruro de cobre"),
  r("CuCl2", "Cu2+", "Cl-", "cloruro cúprico", "cloruro de cobre (II)", "dicloruro de cobre"),
  r("SnCl2", "Sn2+", "Cl-", "cloruro estannoso", "cloruro de estaño (II)", "dicloruro de estaño"),
  r("SnCl4", "Sn4+", "Cl-", "cloruro estánnico", "cloruro de estaño (IV)", "tetracloruro de estaño"),
  r("Na2S", "Na+", "S2-", "sulfuro de sodio", "sulfuro de sodio", "monosulfuro de disodio"),
  r("ZnS", "Zn2+", "S2-", "sulfuro de zinc", "sulfuro de zinc", "monosulfuro de zinc"),
  r("Fe2S3", "Fe3+", "S2-", "sulfuro férrico", "sulfuro de hierro (III)", "trisulfuro de dihierro"),
  r("Mg3N2", "Mg2+", "N3-", "nitruro de magnesio", "nitruro de magnesio", "dinitruro de trimagnesio"),
  r("NH4Cl", "NH4+", "Cl-", "cloruro de amonio", "cloruro de amonio", undefined, "sal amoníaco"),
  // Oxisales (ternarias)
  r("Na2SO4", "Na+", "SO4^2-", "sulfato de sodio", "sulfato de sodio"),
  r("K2SO4", "K+", "SO4^2-", "sulfato de potasio", "sulfato de potasio"),
  r("CaSO4", "Ca2+", "SO4^2-", "sulfato de calcio", "sulfato de calcio"),
  r("Al2(SO4)3", "Al3+", "SO4^2-", "sulfato de aluminio", "sulfato de aluminio"),
  r("FeSO4", "Fe2+", "SO4^2-", "sulfato ferroso", "sulfato de hierro (II)"),
  r("Fe2(SO4)3", "Fe3+", "SO4^2-", "sulfato férrico", "sulfato de hierro (III)"),
  r("CuSO4", "Cu2+", "SO4^2-", "sulfato cúprico", "sulfato de cobre (II)"),
  r("(NH4)2SO4", "NH4+", "SO4^2-", "sulfato de amonio", "sulfato de amonio"),
  r("Na2SO3", "Na+", "SO3^2-", "sulfito de sodio", "sulfito de sodio"),
  r("CaCO3", "Ca2+", "CO3^2-", "carbonato de calcio", "carbonato de calcio", undefined, "piedra caliza / mármol"),
  r("Na2CO3", "Na+", "CO3^2-", "carbonato de sodio", "carbonato de sodio"),
  r("K2CO3", "K+", "CO3^2-", "carbonato de potasio", "carbonato de potasio"),
  r("MgCO3", "Mg2+", "CO3^2-", "carbonato de magnesio", "carbonato de magnesio"),
  r("KNO3", "K+", "NO3-", "nitrato de potasio", "nitrato de potasio"),
  r("NaNO3", "Na+", "NO3-", "nitrato de sodio", "nitrato de sodio"),
  r("AgNO3", "Ag+", "NO3-", "nitrato de plata", "nitrato de plata"),
  r("Ca(NO3)2", "Ca2+", "NO3-", "nitrato de calcio", "nitrato de calcio"),
  r("Fe(NO3)3", "Fe3+", "NO3-", "nitrato férrico", "nitrato de hierro (III)"),
  r("Cu(NO3)2", "Cu2+", "NO3-", "nitrato cúprico", "nitrato de cobre (II)"),
  r("Pb(NO3)2", "Pb2+", "NO3-", "nitrato plumboso", "nitrato de plomo (II)"),
  r("NH4NO3", "NH4+", "NO3-", "nitrato de amonio", "nitrato de amonio"),
  r("NaNO2", "Na+", "NO2-", "nitrito de sodio", "nitrito de sodio"),
  r("Na3PO4", "Na+", "PO4^3-", "fosfato de sodio", "fosfato de sodio"),
  r("K3PO4", "K+", "PO4^3-", "fosfato de potasio", "fosfato de potasio"),
  r("Ca3(PO4)2", "Ca2+", "PO4^3-", "fosfato de calcio", "fosfato de calcio"),
  r("AlPO4", "Al3+", "PO4^3-", "fosfato de aluminio", "fosfato de aluminio"),
  r("NaClO", "Na+", "ClO-", "hipoclorito de sodio", "hipoclorito de sodio", undefined, "lavandina / lejía"),
  r("Ca(ClO)2", "Ca2+", "ClO-", "hipoclorito de calcio", "hipoclorito de calcio"),
  r("NaClO2", "Na+", "ClO2-", "clorito de sodio", "clorito de sodio"),
  r("KClO3", "K+", "ClO3-", "clorato de potasio", "clorato de potasio"),
  r("KClO4", "K+", "ClO4-", "perclorato de potasio", "perclorato de potasio"),
  r("KMnO4", "K+", "MnO4-", "permanganato de potasio", "permanganato de potasio"),
  r("K2CrO4", "K+", "CrO4^2-", "cromato de potasio", "cromato de potasio"),
  r("K2Cr2O7", "K+", "Cr2O7^2-", "dicromato de potasio", "dicromato de potasio"),
  // Sales ácidas (en tradicional se dice "X ácido de M", en sistemática
  // "hidrogeno...").
  r("NaHCO3", "Na+", "HCO3-", "carbonato ácido de sodio", "hidrogenocarbonato de sodio", undefined, "bicarbonato de sodio"),
  r("Ca(HCO3)2", "Ca2+", "HCO3-", "carbonato ácido de calcio", "hidrogenocarbonato de calcio", undefined, "bicarbonato de calcio"),
  r("NaHSO4", "Na+", "HSO4-", "sulfato ácido de sodio", "hidrogenosulfato de sodio", undefined, "bisulfato de sodio"),
  r("NaHSO3", "Na+", "HSO3-", "sulfito ácido de sodio", "hidrogenosulfito de sodio", undefined, "bisulfito de sodio"),
  r("NaHS", "Na+", "HS-", "sulfuro ácido de sodio", "hidrogenosulfuro de sodio", undefined, "bisulfuro de sodio"),
  r("NaH2PO4", "Na+", "H2PO4-", "fosfato diácido de sodio", "dihidrogenofosfato de sodio"),
  r("Na2HPO4", "Na+", "HPO4^2-", "fosfato monoácido de sodio", "hidrogenofosfato de sodio"),
];

export function referencia(formula: string): CompuestoIonicoRef {
  const x = COMPUESTOS_IONICOS.find((c) => c.formula === formula);
  if (!x) throw new Error(`Compuesto iónico sin referencia: ${formula}`);
  return x;
}

// ---------- Compuestos NO iónicos: óxidos no metálicos (anhídridos) ----------

export interface OxidoNoMetalicoRef {
  formula: string;
  elemento: string;
  // Número de oxidación del elemento no metálico en el óxido.
  oxidacion: number;
  // undefined = no tiene nombre tradicional bien definido (CO, NO, NO2):
  // se usan la sistemática o el nombre de uso corriente.
  tradicional?: string; // "anhídrido sulfúrico"
  stock: string; // "óxido de azufre (VI)"
  sistematica: string; // "trióxido de azufre"
}

const o = (formula: string, elemento: string, oxidacion: number, tradicional: string | undefined, stock: string, sistematica: string): OxidoNoMetalicoRef => ({
  formula,
  elemento,
  oxidacion,
  tradicional,
  stock,
  sistematica,
});

export const OXIDOS_NO_METALICOS: OxidoNoMetalicoRef[] = [
  o("Cl2O", "Cl", 1, "anhídrido hipocloroso", "óxido de cloro (I)", "monóxido de dicloro"),
  o("Cl2O3", "Cl", 3, "anhídrido cloroso", "óxido de cloro (III)", "trióxido de dicloro"),
  o("Cl2O5", "Cl", 5, "anhídrido clórico", "óxido de cloro (V)", "pentaóxido de dicloro"),
  o("Cl2O7", "Cl", 7, "anhídrido perclórico", "óxido de cloro (VII)", "heptaóxido de dicloro"),
  o("Br2O5", "Br", 5, "anhídrido brómico", "óxido de bromo (V)", "pentaóxido de dibromo"),
  o("I2O5", "I", 5, "anhídrido yódico", "óxido de yodo (V)", "pentaóxido de diyodo"),
  o("SO2", "S", 4, "anhídrido sulfuroso", "óxido de azufre (IV)", "dióxido de azufre"),
  o("SO3", "S", 6, "anhídrido sulfúrico", "óxido de azufre (VI)", "trióxido de azufre"),
  o("SeO2", "Se", 4, "anhídrido selenioso", "óxido de selenio (IV)", "dióxido de selenio"),
  o("SeO3", "Se", 6, "anhídrido selénico", "óxido de selenio (VI)", "trióxido de selenio"),
  o("N2O3", "N", 3, "anhídrido nitroso", "óxido de nitrógeno (III)", "trióxido de dinitrógeno"),
  o("N2O5", "N", 5, "anhídrido nítrico", "óxido de nitrógeno (V)", "pentaóxido de dinitrógeno"),
  o("P2O3", "P", 3, "anhídrido fosforoso", "óxido de fósforo (III)", "trióxido de difósforo"),
  o("P2O5", "P", 5, "anhídrido fosfórico", "óxido de fósforo (V)", "pentaóxido de difósforo"),
  o("CO2", "C", 4, "anhídrido carbónico", "óxido de carbono (IV)", "dióxido de carbono"),
  o("CO", "C", 2, undefined, "óxido de carbono (II)", "monóxido de carbono"),
  o("SiO2", "Si", 4, "anhídrido silícico", "óxido de silicio (IV)", "dióxido de silicio"),
  o("B2O3", "B", 3, "anhídrido bórico", "óxido de boro (III)", "trióxido de diboro"),
  o("NO", "N", 2, undefined, "óxido de nitrógeno (II)", "monóxido de nitrógeno"),
  o("NO2", "N", 4, undefined, "óxido de nitrógeno (IV)", "dióxido de nitrógeno"),
];

export function oxidoNoMetalico(formula: string): OxidoNoMetalicoRef {
  const x = OXIDOS_NO_METALICOS.find((c) => c.formula === formula);
  if (!x) throw new Error(`Óxido no metálico sin referencia: ${formula}`);
  return x;
}

// ---------- Ácidos ----------

export interface HidracidoRef {
  formula: string;
  // Nombre del compuesto puro (gas) y de su solución acuosa (el ácido).
  puro: string;
  acido: string;
}

export const HIDRACIDOS: HidracidoRef[] = [
  { formula: "HF", puro: "fluoruro de hidrógeno", acido: "ácido fluorhídrico" },
  { formula: "HCl", puro: "cloruro de hidrógeno", acido: "ácido clorhídrico" },
  { formula: "HBr", puro: "bromuro de hidrógeno", acido: "ácido bromhídrico" },
  { formula: "HI", puro: "yoduro de hidrógeno", acido: "ácido yodhídrico" },
  { formula: "H2S", puro: "sulfuro de hidrógeno", acido: "ácido sulfhídrico" },
  { formula: "H2Se", puro: "seleniuro de hidrógeno", acido: "ácido selenhídrico" },
  { formula: "H2Te", puro: "telururo de hidrógeno", acido: "ácido telurhídrico" },
  { formula: "HCN", puro: "cianuro de hidrógeno", acido: "ácido cianhídrico" },
];

export interface OxoacidoRef {
  formula: string;
  tradicional: string; // "ácido sulfúrico"
  // Óxido (anhídrido) del que sale y cuántas moléculas de agua se le suman:
  // anhídrido + n H2O = k × ácido.
  anhidrido: string;
  agua: number;
  // Anión que resulta al perder todos los H+ (id de ANIONES), si está en la tabla.
  anion?: string;
}

export const OXOACIDOS: OxoacidoRef[] = [
  { formula: "HClO", tradicional: "ácido hipocloroso", anhidrido: "Cl2O", agua: 1, anion: "ClO-" },
  { formula: "HClO2", tradicional: "ácido cloroso", anhidrido: "Cl2O3", agua: 1, anion: "ClO2-" },
  { formula: "HClO3", tradicional: "ácido clórico", anhidrido: "Cl2O5", agua: 1, anion: "ClO3-" },
  { formula: "HClO4", tradicional: "ácido perclórico", anhidrido: "Cl2O7", agua: 1, anion: "ClO4-" },
  { formula: "H2SO3", tradicional: "ácido sulfuroso", anhidrido: "SO2", agua: 1, anion: "SO3^2-" },
  { formula: "H2SO4", tradicional: "ácido sulfúrico", anhidrido: "SO3", agua: 1, anion: "SO4^2-" },
  { formula: "HNO2", tradicional: "ácido nitroso", anhidrido: "N2O3", agua: 1, anion: "NO2-" },
  { formula: "HNO3", tradicional: "ácido nítrico", anhidrido: "N2O5", agua: 1, anion: "NO3-" },
  { formula: "H2CO3", tradicional: "ácido carbónico", anhidrido: "CO2", agua: 1, anion: "CO3^2-" },
  { formula: "H3PO4", tradicional: "ácido fosfórico", anhidrido: "P2O5", agua: 3, anion: "PO4^3-" },
  { formula: "H2SiO3", tradicional: "ácido silícico", anhidrido: "SiO2", agua: 1 },
  { formula: "H3BO3", tradicional: "ácido bórico", anhidrido: "B2O3", agua: 3 },
];

export function oxoacido(formula: string): OxoacidoRef {
  const x = OXOACIDOS.find((c) => c.formula === formula);
  if (!x) throw new Error(`Oxoácido sin referencia: ${formula}`);
  return x;
}

export function hidracido(formula: string): HidracidoRef {
  const x = HIDRACIDOS.find((c) => c.formula === formula);
  if (!x) throw new Error(`Hidrácido sin referencia: ${formula}`);
  return x;
}

// Número de oxidación del átomo central de un oxoácido HaXbOc, con H = +1 y
// O = −2: ox = (2c − a) / b.
export function oxidacionCentral(formula: string): number {
  const c = contarAtomos(formula);
  const h = c.H ?? 0;
  const oxigenos = c.O ?? 0;
  const centrales = Object.entries(c).filter(([s]) => s !== "H" && s !== "O");
  if (centrales.length !== 1) throw new Error(`Se esperaba un solo átomo central en ${formula}`);
  const b = centrales[0][1];
  return (2 * oxigenos - h) / b;
}

// ---------- Compuestos moleculares (no metal + no metal) y nombres comunes ----------

export interface OtroCompuestoRef {
  formula: string;
  nombre: string; // nombre que se enseña (IUPAC aceptado/uso corriente)
  otros?: string; // nombres alternativos válidos
}

export const OTROS_COMPUESTOS: OtroCompuestoRef[] = [
  { formula: "H2O", nombre: "agua", otros: "óxido de dihidrógeno (sistemático); oxidano (IUPAC, no se usa)" },
  { formula: "H2O2", nombre: "peróxido de hidrógeno", otros: "agua oxigenada (nombre común)" },
  { formula: "NH3", nombre: "amoníaco", otros: "azano (IUPAC, no se usa); trihidruro de nitrógeno" },
  { formula: "CH4", nombre: "metano" },
  { formula: "PH3", nombre: "fosfina", otros: "fosfano (IUPAC)" },
  { formula: "SiH4", nombre: "silano" },
  { formula: "B2H6", nombre: "diborano" },
  { formula: "CCl4", nombre: "tetracloruro de carbono" },
  { formula: "PCl3", nombre: "tricloruro de fósforo" },
  { formula: "PCl5", nombre: "pentacloruro de fósforo" },
  { formula: "CS2", nombre: "disulfuro de carbono" },
  { formula: "SF6", nombre: "hexafluoruro de azufre" },
  { formula: "N2O", nombre: "monóxido de dinitrógeno", otros: "óxido nitroso (nombre común); óxido de nitrógeno (I)" },
];

export function otroCompuesto(formula: string): OtroCompuestoRef {
  const x = OTROS_COMPUESTOS.find((c) => c.formula === formula);
  if (!x) throw new Error(`Compuesto sin referencia: ${formula}`);
  return x;
}

// Nombre de un compuesto en el sistema pedido, de CUALQUIER tabla de
// referencia. Lanza si no hay dato: las lecciones nunca inventan un nombre.
export function nombreDe(formula: string, sistema: SistemaNomenclatura): string {
  const iono = COMPUESTOS_IONICOS.find((c) => c.formula === formula);
  if (iono) {
    const n = sistema === "tradicional" ? iono.tradicional : sistema === "stock" ? iono.stock : iono.sistematica;
    if (!n) throw new Error(`${formula}: sin nombre ${sistema} en la tabla de referencia`);
    return n;
  }
  const ox = OXIDOS_NO_METALICOS.find((c) => c.formula === formula);
  if (ox) {
    if (sistema === "tradicional") {
      if (!ox.tradicional) throw new Error(`${formula}: no tiene nombre tradicional bien definido`);
      return ox.tradicional;
    }
    return sistema === "stock" ? ox.stock : ox.sistematica;
  }
  const hid = HIDRACIDOS.find((c) => c.formula === formula);
  if (hid) {
    if (sistema === "tradicional") return hid.acido;
    if (sistema === "stock") return hid.puro;
    throw new Error(`${formula}: sin nombre sistemático en la tabla`);
  }
  const oxo = OXOACIDOS.find((c) => c.formula === formula);
  if (oxo) {
    if (sistema === "tradicional") return oxo.tradicional;
    throw new Error(`${formula}: solo se enseña el nombre tradicional del oxoácido`);
  }
  const otro = OTROS_COMPUESTOS.find((c) => c.formula === formula);
  if (otro) return otro.nombre;
  throw new Error(`Compuesto sin referencia: ${formula}`);
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
