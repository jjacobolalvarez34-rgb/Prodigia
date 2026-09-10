// La Ruleta del Trastiendista en versión casa de apuestas (0127).
//
// Este archivo espeja en el cliente el catálogo del server
// (supabase/migrations/0127_trastienda_ruleta_casino.sql, tabla
// trastienda_casino_elementos): los mismos 118 elementos, misma clasificación
// por tipo/grupo/periodo. El server es la autoridad y elige el ganador;
// acá solo se pinta la mesa y se calcula el multiplicador de cada zona.
//
// IMPORTANTE: si se toca el catálogo SQL, hay que tocar este archivo (y el
// test casino.test.ts) al mismo tiempo — el par de conteos debe coincidir.

export type TipoElemento =
  | "alcalino"
  | "alcalinoterreo"
  | "transicion"
  | "post_transicion"
  | "metaloides"
  | "no_metal"
  | "halogeno"
  | "gas_noble"
  | "lantanido"
  | "actinido";

export interface ElementoCasino {
  numero: number;
  simbolo: string;
  nombre: string;
  periodo: number;
  grupo: number | null;
  tipo: TipoElemento;
}

// [numero, simbolo, nombre, periodo, grupo|null, tipo]
type FilaElemento = [number, string, string, number, number | null, TipoElemento];

const FILAS_ELEMENTOS: FilaElemento[] = [
  [1, "H", "Hidrógeno", 1, 1, "no_metal"],
  [2, "He", "Helio", 1, 18, "gas_noble"],
  [3, "Li", "Litio", 2, 1, "alcalino"],
  [4, "Be", "Berilio", 2, 2, "alcalinoterreo"],
  [5, "B", "Boro", 2, 13, "metaloides"],
  [6, "C", "Carbono", 2, 14, "no_metal"],
  [7, "N", "Nitrógeno", 2, 15, "no_metal"],
  [8, "O", "Oxígeno", 2, 16, "no_metal"],
  [9, "F", "Flúor", 2, 17, "halogeno"],
  [10, "Ne", "Neón", 2, 18, "gas_noble"],
  [11, "Na", "Sodio", 3, 1, "alcalino"],
  [12, "Mg", "Magnesio", 3, 2, "alcalinoterreo"],
  [13, "Al", "Aluminio", 3, 13, "post_transicion"],
  [14, "Si", "Silicio", 3, 14, "metaloides"],
  [15, "P", "Fósforo", 3, 15, "no_metal"],
  [16, "S", "Azufre", 3, 16, "no_metal"],
  [17, "Cl", "Cloro", 3, 17, "halogeno"],
  [18, "Ar", "Argón", 3, 18, "gas_noble"],
  [19, "K", "Potasio", 4, 1, "alcalino"],
  [20, "Ca", "Calcio", 4, 2, "alcalinoterreo"],
  [21, "Sc", "Escandio", 4, 3, "transicion"],
  [22, "Ti", "Titanio", 4, 4, "transicion"],
  [23, "V", "Vanadio", 4, 5, "transicion"],
  [24, "Cr", "Cromo", 4, 6, "transicion"],
  [25, "Mn", "Manganeso", 4, 7, "transicion"],
  [26, "Fe", "Hierro", 4, 8, "transicion"],
  [27, "Co", "Cobalto", 4, 9, "transicion"],
  [28, "Ni", "Níquel", 4, 10, "transicion"],
  [29, "Cu", "Cobre", 4, 11, "transicion"],
  [30, "Zn", "Zinc", 4, 12, "transicion"],
  [31, "Ga", "Galio", 4, 13, "post_transicion"],
  [32, "Ge", "Germanio", 4, 14, "metaloides"],
  [33, "As", "Arsénico", 4, 15, "metaloides"],
  [34, "Se", "Selenio", 4, 16, "no_metal"],
  [35, "Br", "Bromo", 4, 17, "halogeno"],
  [36, "Kr", "Criptón", 4, 18, "gas_noble"],
  [37, "Rb", "Rubidio", 5, 1, "alcalino"],
  [38, "Sr", "Estroncio", 5, 2, "alcalinoterreo"],
  [39, "Y", "Itrio", 5, 3, "transicion"],
  [40, "Zr", "Circonio", 5, 4, "transicion"],
  [41, "Nb", "Niobio", 5, 5, "transicion"],
  [42, "Mo", "Molibdeno", 5, 6, "transicion"],
  [43, "Tc", "Tecnecio", 5, 7, "transicion"],
  [44, "Ru", "Rutenio", 5, 8, "transicion"],
  [45, "Rh", "Rodio", 5, 9, "transicion"],
  [46, "Pd", "Paladio", 5, 10, "transicion"],
  [47, "Ag", "Plata", 5, 11, "transicion"],
  [48, "Cd", "Cadmio", 5, 12, "transicion"],
  [49, "In", "Indio", 5, 13, "post_transicion"],
  [50, "Sn", "Estaño", 5, 14, "post_transicion"],
  [51, "Sb", "Antimonio", 5, 15, "metaloides"],
  [52, "Te", "Teluro", 5, 16, "metaloides"],
  [53, "I", "Yodo", 5, 17, "halogeno"],
  [54, "Xe", "Xenón", 5, 18, "gas_noble"],
  [55, "Cs", "Cesio", 6, 1, "alcalino"],
  [56, "Ba", "Bario", 6, 2, "alcalinoterreo"],
  [57, "La", "Lantano", 6, 3, "lantanido"],
  [58, "Ce", "Cerio", 6, null, "lantanido"],
  [59, "Pr", "Praseodimio", 6, null, "lantanido"],
  [60, "Nd", "Neodimio", 6, null, "lantanido"],
  [61, "Pm", "Prometio", 6, null, "lantanido"],
  [62, "Sm", "Samario", 6, null, "lantanido"],
  [63, "Eu", "Europio", 6, null, "lantanido"],
  [64, "Gd", "Gadolinio", 6, null, "lantanido"],
  [65, "Tb", "Terbio", 6, null, "lantanido"],
  [66, "Dy", "Disprosio", 6, null, "lantanido"],
  [67, "Ho", "Holmio", 6, null, "lantanido"],
  [68, "Er", "Erbio", 6, null, "lantanido"],
  [69, "Tm", "Tulio", 6, null, "lantanido"],
  [70, "Yb", "Iterbio", 6, null, "lantanido"],
  [71, "Lu", "Lutecio", 6, 3, "lantanido"],
  [72, "Hf", "Hafnio", 6, 4, "transicion"],
  [73, "Ta", "Tántalo", 6, 5, "transicion"],
  [74, "W", "Wolframio", 6, 6, "transicion"],
  [75, "Re", "Renio", 6, 7, "transicion"],
  [76, "Os", "Osmio", 6, 8, "transicion"],
  [77, "Ir", "Iridio", 6, 9, "transicion"],
  [78, "Pt", "Platino", 6, 10, "transicion"],
  [79, "Au", "Oro", 6, 11, "transicion"],
  [80, "Hg", "Mercurio", 6, 12, "transicion"],
  [81, "Tl", "Talio", 6, 13, "post_transicion"],
  [82, "Pb", "Plomo", 6, 14, "post_transicion"],
  [83, "Bi", "Bismuto", 6, 15, "post_transicion"],
  [84, "Po", "Polonio", 6, 16, "post_transicion"],
  [85, "At", "Ástato", 6, 17, "halogeno"],
  [86, "Rn", "Radón", 6, 18, "gas_noble"],
  [87, "Fr", "Francio", 7, 1, "alcalino"],
  [88, "Ra", "Radio", 7, 2, "alcalinoterreo"],
  [89, "Ac", "Actinio", 7, 3, "actinido"],
  [90, "Th", "Torio", 7, null, "actinido"],
  [91, "Pa", "Protactinio", 7, null, "actinido"],
  [92, "U", "Uranio", 7, null, "actinido"],
  [93, "Np", "Neptunio", 7, null, "actinido"],
  [94, "Pu", "Plutonio", 7, null, "actinido"],
  [95, "Am", "Americio", 7, null, "actinido"],
  [96, "Cm", "Curio", 7, null, "actinido"],
  [97, "Bk", "Berkelio", 7, null, "actinido"],
  [98, "Cf", "Californio", 7, null, "actinido"],
  [99, "Es", "Einstenio", 7, null, "actinido"],
  [100, "Fm", "Fermio", 7, null, "actinido"],
  [101, "Md", "Mendelevio", 7, null, "actinido"],
  [102, "No", "Nobelio", 7, null, "actinido"],
  [103, "Lr", "Laurencio", 7, 3, "actinido"],
  [104, "Rf", "Rutherfordio", 7, 4, "transicion"],
  [105, "Db", "Dubnio", 7, 5, "transicion"],
  [106, "Sg", "Seaborgio", 7, 6, "transicion"],
  [107, "Bh", "Bohrio", 7, 7, "transicion"],
  [108, "Hs", "Hassio", 7, 8, "transicion"],
  [109, "Mt", "Meitnerio", 7, 9, "transicion"],
  [110, "Ds", "Darmstadtio", 7, 10, "transicion"],
  [111, "Rg", "Roentgenio", 7, 11, "transicion"],
  [112, "Cn", "Copernicio", 7, 12, "transicion"],
  [113, "Nh", "Nihonio", 7, 13, "post_transicion"],
  [114, "Fl", "Flerovio", 7, 14, "post_transicion"],
  [115, "Mc", "Moscovio", 7, 15, "post_transicion"],
  [116, "Lv", "Livermorio", 7, 16, "post_transicion"],
  [117, "Ts", "Teneso", 7, 17, "halogeno"],
  [118, "Og", "Oganesón", 7, 18, "gas_noble"],
];

export const ELEMENTOS_CASINO: ElementoCasino[] = FILAS_ELEMENTOS.map(
  ([numero, simbolo, nombre, periodo, grupo, tipo]) => ({ numero, simbolo, nombre, periodo, grupo, tipo })
);

export const TOTAL_ELEMENTOS_CASINO = ELEMENTOS_CASINO.length; // 118

export const ELEMENTO_CASINO_POR_SIMBOLO: ReadonlyMap<string, ElementoCasino> = new Map(
  ELEMENTOS_CASINO.map((e) => [e.simbolo, e])
);

// Fichas con valor alto (decisión PO 2026-09-09: se ganan muchas Chispas jugando).
export const FICHAS_CASINO = [100, 250, 500, 1000] as const;
export type FichaCasino = (typeof FICHAS_CASINO)[number];

export const LIMITE_CASINO_DIARIO = 20;

// EV de casa: payout_total = monto × (118/n) × EV_CASA_CASINO.
export const EV_CASA_CASINO = 0.88;

// Color por familia (para pintar la mesa).
export const COLOR_CASINO_POR_TIPO: Record<TipoElemento, string> = {
  alcalino: "#ff8a3d",
  alcalinoterreo: "#f4c542",
  transicion: "#7c5cff",
  post_transicion: "#a794ff",
  metaloides: "#3fb88b",
  no_metal: "#3ec2e8",
  halogeno: "#e8b34d",
  gas_noble: "#66d9e8",
  lantanido: "#c56a5a",
  actinido: "#9d5a8a",
};

export function colorElementoCasino(tipo: TipoElemento): string {
  return COLOR_CASINO_POR_TIPO[tipo];
}

export function zonaElementoCasino(simbolo: string): string {
  return `elemento:${simbolo}`;
}

// ---- Zonas y conteo (misma lógica que casino_elementos_en_zona del server) ----

export interface MiembroZonaCasino {
  zona: string;
  simbolos: string[];
}

function elementoEnZona(e: ElementoCasino, zona: string): boolean {
  if (zona === "paridad:par") return e.numero % 2 === 0;
  if (zona === "paridad:impar") return e.numero % 2 === 1;

  const elem = /^elemento:(.+)$/.exec(zona);
  if (elem) return e.simbolo.toUpperCase() === elem[1].toUpperCase();

  const grupo = /^grupo:(\d+)$/.exec(zona);
  if (grupo) return e.grupo === Number(grupo[1]);

  if (zona === "grupo:transicion") return e.tipo === "transicion";

  const periodo = /^periodo:(\d+)$/.exec(zona);
  if (periodo) return e.periodo === Number(periodo[1]);

  const tipo = /^tipo:(.+)$/.exec(zona);
  if (tipo) return e.tipo === tipo[1];

  return false;
}

export function esZonaCasinoValida(zona: string): boolean {
  if (zona === "paridad:par" || zona === "paridad:impar" || zona === "grupo:transicion") return true;
  if (/^elemento:(.+)$/.test(zona)) {
    const sim = zona.replace("elemento:", "").toUpperCase();
    return ELEMENTOS_CASINO.some((e) => e.simbolo.toUpperCase() === sim);
  }
  if (/^grupo:(\d+)$/.test(zona)) {
    const n = Number(/(\d+)/.exec(zona)?.[1]);
    return n >= 1 && n <= 18;
  }
  if (/^periodo:(\d+)$/.test(zona)) {
    const n = Number(/(\d+)/.exec(zona)?.[1]);
    return n >= 1 && n <= 7;
  }
  if (/^tipo:(.+)$/.test(zona)) return zona.replace("tipo:", "") in COLOR_CASINO_POR_TIPO;
  return false;
}

export function simbolosZonaCasino(zona: string): string[] {
  return ELEMENTOS_CASINO.filter((e) => elementoEnZona(e, zona)).map((e) => e.simbolo);
}

export function conteoZonaCasino(zona: string): number {
  return simbolosZonaCasino(zona).length;
}

// Multiplicador total (lo que devuelve el server pagado por Chispas ganadas):
// round((118/n) × 0.88, 2). Descuento del monto aparte (la casa no lo devuelve).
export function multCasino(count: number): number {
  if (count <= 0 || count > TOTAL_ELEMENTOS_CASINO) return 0;
  return Math.round((TOTAL_ELEMENTOS_CASINO / count) * EV_CASA_CASINO * 100) / 100;
}

export function gananciaCasino(monto: number, count: number): number {
  return Math.max(Math.round(monto * multCasino(count)), 1);
}