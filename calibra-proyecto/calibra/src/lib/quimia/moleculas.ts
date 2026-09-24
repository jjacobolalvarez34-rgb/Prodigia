import {
  desdeSmiles,
  dibujarMolecula,
  formulaCondensada,
  formulaHill,
  gruposFuncionales,
  nombreIUPAC,
  type Dibujo,
  type GrupoDetectado,
  type IdGrupo,
  type Molecula,
} from "./organica";

// Catálogo de moléculas orgánicas de las lecciones (visuales "quimia.cadena",
// "quimia.grupos", "quimia.isomeria" y "quimia.hibridacion"). Cada entrada
// guarda SOLO la conectividad (SMILES) y una aclaración de nombre común o de
// isomería cis/trans; el nombre IUPAC, la fórmula molecular, la condensada,
// los grupos funcionales y el dibujo se CALCULAN en organica.ts.
// moleculas.test.ts contrasta cada nombre y cada fórmula con una tabla
// curada aparte y con el banco de la práctica (quimicaOrganica.ts).

export interface EntradaMolecula {
  id: string;
  smiles: string;
  // Nombre usado en la práctica o en los libros que NO es el IUPAC ("ácido acético").
  comun?: string;
  // Isómero geométrico (solo alquenos con dos carbonos sustituidos).
  geometria?: "cis" | "trans";
  // Id del banco de práctica (src/lib/practica/quimicaOrganica.ts) si lo hay.
  practica?: string;
}

export const CATALOGO_MOLECULAS: EntradaMolecula[] = [
  // Alcanos
  { id: "metano", smiles: "C", practica: "metano" },
  { id: "etano", smiles: "CC", practica: "etano" },
  { id: "propano", smiles: "CCC", practica: "propano" },
  { id: "butano", smiles: "CCCC" },
  { id: "pentano", smiles: "CCCCC" },
  { id: "hexano", smiles: "CCCCCC" },
  { id: "heptano", smiles: "CCCCCCC" },
  { id: "octano", smiles: "CCCCCCCC" },
  { id: "nonano", smiles: "CCCCCCCCC" },
  { id: "decano", smiles: "CCCCCCCCCC" },
  // Alcanos ramificados
  { id: "2-metilpropano", smiles: "CC(C)C", comun: "isobutano" },
  { id: "2-metilbutano", smiles: "CC(C)CC", comun: "isopentano" },
  { id: "2,2-dimetilpropano", smiles: "CC(C)(C)C", comun: "neopentano" },
  { id: "2-metilpentano", smiles: "CC(C)CCC" },
  { id: "3-metilpentano", smiles: "CCC(C)CC" },
  { id: "2,3-dimetilbutano", smiles: "CC(C)C(C)C" },
  { id: "2,2-dimetilbutano", smiles: "CC(C)(C)CC" },
  { id: "2,4-dimetilhexano", smiles: "CC(C)CC(C)CC" },
  { id: "3-etil-5-metilheptano", smiles: "CCC(CC)CC(C)CC" },
  { id: "3-etil-2-metilpentano", smiles: "CC(C)C(CC)CC" },
  { id: "2,2,4-trimetilpentano", smiles: "CC(C)CC(C)(C)C", comun: "isooctano" },
  // Alquenos y alquinos
  { id: "eteno", smiles: "C=C", comun: "etileno", practica: "eteno" },
  { id: "propeno", smiles: "C=CC", comun: "propileno" },
  { id: "but-1-eno", smiles: "C=CCC" },
  { id: "cis-but-2-eno", smiles: "CC=CC", geometria: "cis" },
  { id: "trans-but-2-eno", smiles: "CC=CC", geometria: "trans" },
  { id: "2-metilpropeno", smiles: "C=C(C)C", comun: "isobutileno" },
  { id: "pent-1-eno", smiles: "C=CCCC" },
  { id: "pent-2-eno", smiles: "CC=CCC" },
  { id: "2-metilbut-2-eno", smiles: "CC=C(C)C" },
  { id: "3-metilbut-1-eno", smiles: "C=CC(C)C" },
  { id: "buta-1,3-dieno", smiles: "C=CC=C", comun: "butadieno" },
  { id: "etino", smiles: "C#C", comun: "acetileno" },
  { id: "propino", smiles: "C#CC" },
  { id: "but-1-ino", smiles: "C#CCC" },
  { id: "but-2-ino", smiles: "CC#CC" },
  // Cíclicos y aromáticos
  { id: "ciclopropano", smiles: "C1CC1" },
  { id: "ciclobutano", smiles: "C1CCC1" },
  { id: "ciclopentano", smiles: "C1CCCC1" },
  { id: "ciclohexano", smiles: "C1CCCCC1" },
  { id: "ciclohexeno", smiles: "C1=CCCCC1" },
  { id: "benceno", smiles: "C1=CC=CC=C1", practica: "benceno" },
  { id: "metilbenceno", smiles: "CC1=CC=CC=C1", comun: "tolueno" },
  { id: "1,2-dimetilbenceno", smiles: "CC1=CC=CC=C1C", comun: "o-xileno" },
  { id: "1,3-dimetilbenceno", smiles: "CC1=CC=CC(C)=C1", comun: "m-xileno" },
  { id: "1,4-dimetilbenceno", smiles: "CC1=CC=C(C)C=C1", comun: "p-xileno" },
  { id: "clorobenceno", smiles: "ClC1=CC=CC=C1" },
  { id: "fenol", smiles: "OC1=CC=CC=C1" },
  { id: "metilciclohexano", smiles: "CC1CCCCC1" },
  // Alcoholes
  { id: "metanol", smiles: "CO", comun: "alcohol metílico", practica: "metanol" },
  { id: "etanol", smiles: "CCO", comun: "alcohol etílico", practica: "etanol" },
  { id: "propan-1-ol", smiles: "CCCO" },
  { id: "propan-2-ol", smiles: "CC(O)C", comun: "alcohol isopropílico" },
  { id: "butan-1-ol", smiles: "CCCCO" },
  { id: "butan-2-ol", smiles: "CCC(C)O" },
  { id: "2-metilpropan-2-ol", smiles: "CC(C)(C)O" },
  { id: "etano-1,2-diol", smiles: "OCCO", comun: "etilenglicol" },
  { id: "propano-1,2,3-triol", smiles: "OCC(O)CO", comun: "glicerina" },
  // Éteres
  { id: "metoximetano", smiles: "COC", comun: "éter dimetílico" },
  { id: "metoxietano", smiles: "COCC" },
  { id: "etoxietano", smiles: "CCOCC", comun: "éter etílico" },
  // Aldehídos y cetonas
  { id: "metanal", smiles: "C=O", comun: "formaldehído" },
  { id: "etanal", smiles: "CC=O", comun: "acetaldehído" },
  { id: "propanal", smiles: "CCC=O" },
  { id: "butanal", smiles: "CCCC=O" },
  { id: "propanona", smiles: "CC(=O)C", comun: "acetona" },
  { id: "butanona", smiles: "CCC(=O)C" },
  { id: "pentan-2-ona", smiles: "CCCC(=O)C" },
  { id: "pentan-3-ona", smiles: "CCC(=O)CC" },
  // Ácidos carboxílicos y ésteres
  { id: "acido-metanoico", smiles: "OC=O", comun: "ácido fórmico", practica: "acido-formico" },
  { id: "acido-etanoico", smiles: "CC(=O)O", comun: "ácido acético", practica: "acido-acetico" },
  { id: "acido-propanoico", smiles: "CCC(=O)O" },
  { id: "acido-butanoico", smiles: "CCCC(=O)O" },
  { id: "acido-2-metilpropanoico", smiles: "CC(C)C(=O)O" },
  { id: "metanoato-de-metilo", smiles: "COC=O" },
  { id: "metanoato-de-etilo", smiles: "CCOC=O" },
  { id: "etanoato-de-metilo", smiles: "COC(C)=O", comun: "acetato de metilo" },
  { id: "etanoato-de-etilo", smiles: "CCOC(C)=O", comun: "acetato de etilo" },
  { id: "propanoato-de-metilo", smiles: "COC(=O)CC" },
  // Aminas y amidas
  { id: "metanamina", smiles: "CN", comun: "metilamina" },
  { id: "etanamina", smiles: "CCN", comun: "etilamina" },
  { id: "propan-1-amina", smiles: "CCCN" },
  { id: "propan-2-amina", smiles: "CC(C)N" },
  { id: "metanamida", smiles: "NC=O", comun: "formamida" },
  { id: "etanamida", smiles: "CC(N)=O", comun: "acetamida" },
  { id: "propanamida", smiles: "CCC(N)=O" },
  // Haluros de alquilo
  { id: "clorometano", smiles: "CCl" },
  { id: "diclorometano", smiles: "ClCCl" },
  { id: "triclorometano", smiles: "ClC(Cl)Cl", comun: "cloroformo" },
  { id: "cloroetano", smiles: "CCCl" },
  { id: "1,2-dicloroetano", smiles: "ClCCCl" },
  { id: "bromoetano", smiles: "CCBr" },
  { id: "1-cloropropano", smiles: "CCCCl" },
  { id: "2-cloropropano", smiles: "CC(Cl)C" },
  { id: "1,2-dibromoetano", smiles: "BrCCBr" },
  { id: "2-cloro-2-metilpropano", smiles: "CC(C)(C)Cl" },
  // Con varios grupos
  { id: "2-hidroxipropanal", smiles: "CC(O)C=O" },
  { id: "1-hidroxipropan-2-ona", smiles: "OCC(=O)C" },
  { id: "acido-3-oxobutanoico", smiles: "CC(=O)CC(=O)O" },
  { id: "glucosa-abierta", smiles: "OCC(O)C(O)C(O)C(O)C=O", comun: "glucosa (cadena abierta)", practica: "glucosa" },
  { id: "acido-2-hidroxipropanoico", smiles: "CC(O)C(=O)O", comun: "ácido láctico" },
  { id: "acido-2-aminoetanoico", smiles: "NCC(=O)O", comun: "glicina" },
];

export function buscarMolecula(id: string): EntradaMolecula | undefined {
  return CATALOGO_MOLECULAS.find((m) => m.id === id);
}

export interface FichaMolecula {
  entrada: EntradaMolecula;
  molecula: Molecula;
  // Nombre IUPAC calculado (con "cis-"/"trans-" delante si corresponde).
  nombre: string;
  // Fórmula molecular en orden de Hill ("C2H6O").
  formula: string;
  // Fórmula condensada (solo cadenas abiertas).
  condensada: string | null;
  grupos: GrupoDetectado[];
  dibujo: Dibujo;
}

const cache = new Map<string, FichaMolecula>();

// Todo lo calculable de una molécula del catálogo (con caché).
export function fichaDe(id: string): FichaMolecula {
  const previa = cache.get(id);
  if (previa) return previa;
  const entrada = buscarMolecula(id);
  if (!entrada) throw new Error(`Molécula inexistente: ${id}`);
  const molecula = desdeSmiles(entrada.smiles);
  const anillo = molecula.enlaces.length >= molecula.atomos.length;
  const base = nombreIUPAC(molecula);
  const ficha: FichaMolecula = {
    entrada,
    molecula,
    nombre: entrada.geometria ? `${entrada.geometria}-${base}` : base,
    formula: formulaHill(molecula),
    condensada: anillo ? null : formulaCondensada(molecula),
    grupos: gruposFuncionales(molecula),
    dibujo: dibujarMolecula(molecula, { cis: entrada.geometria === "cis" }),
  };
  cache.set(id, ficha);
  return ficha;
}

// ---------- Grupos funcionales: datos que no dependen del idioma ----------

export interface InfoGrupo {
  // Fórmula general en LaTeX (sin $): R es el resto de la cadena.
  general: string;
  // Terminación o prefijo del nombre.
  nombre: string;
}

export const INFO_GRUPO: Record<IdGrupo, InfoGrupo> = {
  alqueno: { general: "\\mathrm{C{=}C}", nombre: "-eno" },
  alquino: { general: "\\mathrm{C{\\equiv}C}", nombre: "-ino" },
  aromatico: { general: "\\mathrm{C_6H_5{-}}", nombre: "benceno" },
  alcohol: { general: "\\mathrm{R{-}OH}", nombre: "-ol" },
  eter: { general: "\\mathrm{R{-}O{-}R'}", nombre: "alcoxi-" },
  aldehido: { general: "\\mathrm{R{-}CHO}", nombre: "-al" },
  cetona: { general: "\\mathrm{R{-}CO{-}R'}", nombre: "-ona" },
  acido: { general: "\\mathrm{R{-}COOH}", nombre: "-oico" },
  ester: { general: "\\mathrm{R{-}COO{-}R'}", nombre: "-oato de -ilo" },
  amina: { general: "\\mathrm{R{-}NH_2}", nombre: "-amina" },
  amida: { general: "\\mathrm{R{-}CONH_2}", nombre: "-amida" },
  haluro: { general: "\\mathrm{R{-}X}", nombre: "halo-" },
};

// Grupo que se muestra de una molécula: el de mayor prioridad de nombre.
const PRIORIDAD_VISIBLE: IdGrupo[] = ["acido", "ester", "amida", "aldehido", "cetona", "alcohol", "eter", "amina", "haluro", "aromatico", "alquino", "alqueno"];

export function grupoVisible(grupos: GrupoDetectado[]): GrupoDetectado | undefined {
  for (const id of PRIORIDAD_VISIBLE) {
    const g = grupos.find((x) => x.id === id);
    if (g) return g;
  }
  return undefined;
}

// ---------- Datos de referencia (valores de tabla, redondeados) ----------

// Puntos de ebullición a 1 atm, en °C, de los compuestos que las Clases
// comparan (CRC Handbook, redondeados al grado). moleculas.test.ts los
// contrasta con una tabla curada aparte. Los usan las Clases de isomería y
// de alcoholes para mostrar que los isómeros tienen propiedades distintas.
export const PUNTO_EBULLICION_C: Record<string, number> = {
  propano: -42,
  metoximetano: -25,
  etanol: 78,
  butano: -1,
  "2-metilpropano": -12,
};

// Longitudes de enlace carbono-carbono típicas, en picómetros (1 pm = 10⁻¹² m).
export const LONGITUD_ENLACE_PM = { simple: 154, doble: 134, triple: 120 } as const;

// Cantidad de isómeros de cadena de los alcanos CnH2n+2 (OEIS A000602,
// desde n = 1): 1, 1, 1, 2, 3, 5, 9, 18, 35, 75.
export const ISOMEROS_ALCANOS = [1, 1, 1, 2, 3, 5, 9, 18, 35, 75];
