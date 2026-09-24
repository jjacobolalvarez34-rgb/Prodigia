// Banco de datos de Quimia — símbolos/nombres/números atómicos y
// posición real en la tabla periódica (grupo IUPAC 1-18, período 1-7),
// y fórmulas de compuestos cotidianos. Datos reales verificados, no
// generados — el pedido explícito fue "usalos tal cual, no inventes
// datos de química nuevos". El orden de cada lista ya viene de más
// común/fácil a menos, así que `dificultad` (1-10) se deriva de la
// posición en la lista, mismo criterio que ya usa geografia.ts con los
// países.

export interface ElementoQuimico {
  simbolo: string;
  nombre: string;
  numeroAtomico: number;
  periodo: number;
  grupo: number;
  // Sección 5: estado de oxidación más común/típico de cada elemento —
  // el más citado en tablas de referencia de nivel escolar (muchos
  // elementos tienen más de uno posible; se eligió siempre el que
  // aparece primero/más frecuente en ese tipo de tabla).
  estadoOxidacionComun: number;
  dificultad: number;
}

interface ElementoCrudo {
  simbolo: string;
  nombre: string;
  numeroAtomico: number;
  periodo: number;
  grupo: number;
  estadoOxidacionComun: number;
}

// Orden: de más comunes/fáciles a menos, tal como los dio el pedido.
const ELEMENTOS_CRUDOS: ElementoCrudo[] = [
  { simbolo: "H", nombre: "Hidrógeno", numeroAtomico: 1, periodo: 1, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "He", nombre: "Helio", numeroAtomico: 2, periodo: 1, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Li", nombre: "Litio", numeroAtomico: 3, periodo: 2, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "C", nombre: "Carbono", numeroAtomico: 6, periodo: 2, grupo: 14, estadoOxidacionComun: 4 },
  { simbolo: "N", nombre: "Nitrógeno", numeroAtomico: 7, periodo: 2, grupo: 15, estadoOxidacionComun: -3 },
  { simbolo: "O", nombre: "Oxígeno", numeroAtomico: 8, periodo: 2, grupo: 16, estadoOxidacionComun: -2 },
  { simbolo: "Na", nombre: "Sodio", numeroAtomico: 11, periodo: 3, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "Mg", nombre: "Magnesio", numeroAtomico: 12, periodo: 3, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "Al", nombre: "Aluminio", numeroAtomico: 13, periodo: 3, grupo: 13, estadoOxidacionComun: 3 },
  { simbolo: "Si", nombre: "Silicio", numeroAtomico: 14, periodo: 3, grupo: 14, estadoOxidacionComun: 4 },
  { simbolo: "P", nombre: "Fósforo", numeroAtomico: 15, periodo: 3, grupo: 15, estadoOxidacionComun: 5 },
  { simbolo: "S", nombre: "Azufre", numeroAtomico: 16, periodo: 3, grupo: 16, estadoOxidacionComun: -2 },
  { simbolo: "Cl", nombre: "Cloro", numeroAtomico: 17, periodo: 3, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "K", nombre: "Potasio", numeroAtomico: 19, periodo: 4, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "Ca", nombre: "Calcio", numeroAtomico: 20, periodo: 4, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "Fe", nombre: "Hierro", numeroAtomico: 26, periodo: 4, grupo: 8, estadoOxidacionComun: 3 },
  { simbolo: "Cu", nombre: "Cobre", numeroAtomico: 29, periodo: 4, grupo: 11, estadoOxidacionComun: 2 },
  { simbolo: "Zn", nombre: "Zinc", numeroAtomico: 30, periodo: 4, grupo: 12, estadoOxidacionComun: 2 },
  { simbolo: "Ag", nombre: "Plata", numeroAtomico: 47, periodo: 5, grupo: 11, estadoOxidacionComun: 1 },
  { simbolo: "Au", nombre: "Oro", numeroAtomico: 79, periodo: 6, grupo: 11, estadoOxidacionComun: 3 },
  { simbolo: "Pb", nombre: "Plomo", numeroAtomico: 82, periodo: 6, grupo: 14, estadoOxidacionComun: 2 },
  // Auditoría de estabilización (2026-08-30): el modo "tabla periódica"
  // repetía siempre los mismos ~15 elementos — no era un bug de lógica,
  // era el dataset chico (21 elementos) chocando con la ventana de
  // elegirAlAzar (±3 de dificultad, 10 niveles ≈ ~2 elementos por
  // nivel): con un nivel fijo, la ventana ±3 cubre ~7 niveles ≈ los
  // mismos 14-15 elementos de siempre, sin importar cuántas preguntas
  // se jueguen. El resto de la tabla periódica real (97 elementos más,
  // datos reales verificados: número atómico/período/grupo IUPAC/
  // estado de oxidación más común) se agrega ACÁ ABAJO, después de los
  // 21 originales — quedan en las posiciones más altas de la lista, así
  // que la fórmula de `dificultad` (derivada de la posición) los sigue
  // tratando como más difíciles/menos comunes que los 21 curados
  // arriba, sin tener que re-priorizar nada a mano.
  { simbolo: "Be", nombre: "Berilio", numeroAtomico: 4, periodo: 2, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "B", nombre: "Boro", numeroAtomico: 5, periodo: 2, grupo: 13, estadoOxidacionComun: 3 },
  { simbolo: "F", nombre: "Flúor", numeroAtomico: 9, periodo: 2, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "Ne", nombre: "Neón", numeroAtomico: 10, periodo: 2, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Ar", nombre: "Argón", numeroAtomico: 18, periodo: 3, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Sc", nombre: "Escandio", numeroAtomico: 21, periodo: 4, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Ti", nombre: "Titanio", numeroAtomico: 22, periodo: 4, grupo: 4, estadoOxidacionComun: 4 },
  { simbolo: "V", nombre: "Vanadio", numeroAtomico: 23, periodo: 4, grupo: 5, estadoOxidacionComun: 5 },
  { simbolo: "Cr", nombre: "Cromo", numeroAtomico: 24, periodo: 4, grupo: 6, estadoOxidacionComun: 3 },
  { simbolo: "Mn", nombre: "Manganeso", numeroAtomico: 25, periodo: 4, grupo: 7, estadoOxidacionComun: 2 },
  { simbolo: "Co", nombre: "Cobalto", numeroAtomico: 27, periodo: 4, grupo: 9, estadoOxidacionComun: 2 },
  { simbolo: "Ni", nombre: "Níquel", numeroAtomico: 28, periodo: 4, grupo: 10, estadoOxidacionComun: 2 },
  { simbolo: "Ga", nombre: "Galio", numeroAtomico: 31, periodo: 4, grupo: 13, estadoOxidacionComun: 3 },
  { simbolo: "Ge", nombre: "Germanio", numeroAtomico: 32, periodo: 4, grupo: 14, estadoOxidacionComun: 4 },
  { simbolo: "As", nombre: "Arsénico", numeroAtomico: 33, periodo: 4, grupo: 15, estadoOxidacionComun: 3 },
  { simbolo: "Se", nombre: "Selenio", numeroAtomico: 34, periodo: 4, grupo: 16, estadoOxidacionComun: -2 },
  { simbolo: "Br", nombre: "Bromo", numeroAtomico: 35, periodo: 4, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "Kr", nombre: "Kriptón", numeroAtomico: 36, periodo: 4, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Rb", nombre: "Rubidio", numeroAtomico: 37, periodo: 5, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "Sr", nombre: "Estroncio", numeroAtomico: 38, periodo: 5, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "Y", nombre: "Itrio", numeroAtomico: 39, periodo: 5, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Zr", nombre: "Zirconio", numeroAtomico: 40, periodo: 5, grupo: 4, estadoOxidacionComun: 4 },
  { simbolo: "Nb", nombre: "Niobio", numeroAtomico: 41, periodo: 5, grupo: 5, estadoOxidacionComun: 5 },
  { simbolo: "Mo", nombre: "Molibdeno", numeroAtomico: 42, periodo: 5, grupo: 6, estadoOxidacionComun: 6 },
  { simbolo: "Tc", nombre: "Tecnecio", numeroAtomico: 43, periodo: 5, grupo: 7, estadoOxidacionComun: 7 },
  { simbolo: "Ru", nombre: "Rutenio", numeroAtomico: 44, periodo: 5, grupo: 8, estadoOxidacionComun: 3 },
  { simbolo: "Rh", nombre: "Rodio", numeroAtomico: 45, periodo: 5, grupo: 9, estadoOxidacionComun: 3 },
  { simbolo: "Pd", nombre: "Paladio", numeroAtomico: 46, periodo: 5, grupo: 10, estadoOxidacionComun: 2 },
  { simbolo: "Cd", nombre: "Cadmio", numeroAtomico: 48, periodo: 5, grupo: 12, estadoOxidacionComun: 2 },
  { simbolo: "In", nombre: "Indio", numeroAtomico: 49, periodo: 5, grupo: 13, estadoOxidacionComun: 3 },
  { simbolo: "Sn", nombre: "Estaño", numeroAtomico: 50, periodo: 5, grupo: 14, estadoOxidacionComun: 4 },
  { simbolo: "Sb", nombre: "Antimonio", numeroAtomico: 51, periodo: 5, grupo: 15, estadoOxidacionComun: 3 },
  { simbolo: "Te", nombre: "Telurio", numeroAtomico: 52, periodo: 5, grupo: 16, estadoOxidacionComun: -2 },
  { simbolo: "I", nombre: "Yodo", numeroAtomico: 53, periodo: 5, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "Xe", nombre: "Xenón", numeroAtomico: 54, periodo: 5, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Cs", nombre: "Cesio", numeroAtomico: 55, periodo: 6, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "Ba", nombre: "Bario", numeroAtomico: 56, periodo: 6, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "La", nombre: "Lantano", numeroAtomico: 57, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Ce", nombre: "Cerio", numeroAtomico: 58, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Pr", nombre: "Praseodimio", numeroAtomico: 59, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Nd", nombre: "Neodimio", numeroAtomico: 60, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Pm", nombre: "Prometio", numeroAtomico: 61, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Sm", nombre: "Samario", numeroAtomico: 62, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Eu", nombre: "Europio", numeroAtomico: 63, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Gd", nombre: "Gadolinio", numeroAtomico: 64, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Tb", nombre: "Terbio", numeroAtomico: 65, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Dy", nombre: "Disprosio", numeroAtomico: 66, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Ho", nombre: "Holmio", numeroAtomico: 67, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Er", nombre: "Erbio", numeroAtomico: 68, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Tm", nombre: "Tulio", numeroAtomico: 69, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Yb", nombre: "Iterbio", numeroAtomico: 70, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Lu", nombre: "Lutecio", numeroAtomico: 71, periodo: 6, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Hf", nombre: "Hafnio", numeroAtomico: 72, periodo: 6, grupo: 4, estadoOxidacionComun: 4 },
  { simbolo: "Ta", nombre: "Tantalio", numeroAtomico: 73, periodo: 6, grupo: 5, estadoOxidacionComun: 5 },
  { simbolo: "W", nombre: "Wolframio", numeroAtomico: 74, periodo: 6, grupo: 6, estadoOxidacionComun: 6 },
  { simbolo: "Re", nombre: "Renio", numeroAtomico: 75, periodo: 6, grupo: 7, estadoOxidacionComun: 4 },
  { simbolo: "Os", nombre: "Osmio", numeroAtomico: 76, periodo: 6, grupo: 8, estadoOxidacionComun: 4 },
  { simbolo: "Ir", nombre: "Iridio", numeroAtomico: 77, periodo: 6, grupo: 9, estadoOxidacionComun: 3 },
  { simbolo: "Pt", nombre: "Platino", numeroAtomico: 78, periodo: 6, grupo: 10, estadoOxidacionComun: 2 },
  { simbolo: "Hg", nombre: "Mercurio", numeroAtomico: 80, periodo: 6, grupo: 12, estadoOxidacionComun: 2 },
  { simbolo: "Tl", nombre: "Talio", numeroAtomico: 81, periodo: 6, grupo: 13, estadoOxidacionComun: 1 },
  { simbolo: "Bi", nombre: "Bismuto", numeroAtomico: 83, periodo: 6, grupo: 15, estadoOxidacionComun: 3 },
  { simbolo: "Po", nombre: "Polonio", numeroAtomico: 84, periodo: 6, grupo: 16, estadoOxidacionComun: 4 },
  { simbolo: "At", nombre: "Astato", numeroAtomico: 85, periodo: 6, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "Rn", nombre: "Radón", numeroAtomico: 86, periodo: 6, grupo: 18, estadoOxidacionComun: 0 },
  { simbolo: "Fr", nombre: "Francio", numeroAtomico: 87, periodo: 7, grupo: 1, estadoOxidacionComun: 1 },
  { simbolo: "Ra", nombre: "Radio", numeroAtomico: 88, periodo: 7, grupo: 2, estadoOxidacionComun: 2 },
  { simbolo: "Ac", nombre: "Actinio", numeroAtomico: 89, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Th", nombre: "Torio", numeroAtomico: 90, periodo: 7, grupo: 3, estadoOxidacionComun: 4 },
  { simbolo: "Pa", nombre: "Protactinio", numeroAtomico: 91, periodo: 7, grupo: 3, estadoOxidacionComun: 5 },
  { simbolo: "U", nombre: "Uranio", numeroAtomico: 92, periodo: 7, grupo: 3, estadoOxidacionComun: 6 },
  { simbolo: "Np", nombre: "Neptunio", numeroAtomico: 93, periodo: 7, grupo: 3, estadoOxidacionComun: 5 },
  { simbolo: "Pu", nombre: "Plutonio", numeroAtomico: 94, periodo: 7, grupo: 3, estadoOxidacionComun: 4 },
  { simbolo: "Am", nombre: "Americio", numeroAtomico: 95, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Cm", nombre: "Curio", numeroAtomico: 96, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Bk", nombre: "Berkelio", numeroAtomico: 97, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Cf", nombre: "Californio", numeroAtomico: 98, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Es", nombre: "Einstenio", numeroAtomico: 99, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Fm", nombre: "Fermio", numeroAtomico: 100, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Md", nombre: "Mendelevio", numeroAtomico: 101, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "No", nombre: "Nobelio", numeroAtomico: 102, periodo: 7, grupo: 3, estadoOxidacionComun: 2 },
  { simbolo: "Lr", nombre: "Lawrencio", numeroAtomico: 103, periodo: 7, grupo: 3, estadoOxidacionComun: 3 },
  { simbolo: "Rf", nombre: "Rutherfordio", numeroAtomico: 104, periodo: 7, grupo: 4, estadoOxidacionComun: 4 },
  { simbolo: "Db", nombre: "Dubnio", numeroAtomico: 105, periodo: 7, grupo: 5, estadoOxidacionComun: 5 },
  { simbolo: "Sg", nombre: "Seaborgio", numeroAtomico: 106, periodo: 7, grupo: 6, estadoOxidacionComun: 6 },
  { simbolo: "Bh", nombre: "Bohrio", numeroAtomico: 107, periodo: 7, grupo: 7, estadoOxidacionComun: 7 },
  { simbolo: "Hs", nombre: "Hasio", numeroAtomico: 108, periodo: 7, grupo: 8, estadoOxidacionComun: 8 },
  { simbolo: "Mt", nombre: "Meitnerio", numeroAtomico: 109, periodo: 7, grupo: 9, estadoOxidacionComun: 0 },
  { simbolo: "Ds", nombre: "Darmstadtio", numeroAtomico: 110, periodo: 7, grupo: 10, estadoOxidacionComun: 0 },
  { simbolo: "Rg", nombre: "Roentgenio", numeroAtomico: 111, periodo: 7, grupo: 11, estadoOxidacionComun: 0 },
  { simbolo: "Cn", nombre: "Copernicio", numeroAtomico: 112, periodo: 7, grupo: 12, estadoOxidacionComun: 0 },
  { simbolo: "Nh", nombre: "Nihonio", numeroAtomico: 113, periodo: 7, grupo: 13, estadoOxidacionComun: 0 },
  { simbolo: "Fl", nombre: "Flerovio", numeroAtomico: 114, periodo: 7, grupo: 14, estadoOxidacionComun: 0 },
  { simbolo: "Mc", nombre: "Moscovio", numeroAtomico: 115, periodo: 7, grupo: 15, estadoOxidacionComun: 0 },
  { simbolo: "Lv", nombre: "Livermorio", numeroAtomico: 116, periodo: 7, grupo: 16, estadoOxidacionComun: 0 },
  { simbolo: "Ts", nombre: "Teneso", numeroAtomico: 117, periodo: 7, grupo: 17, estadoOxidacionComun: -1 },
  { simbolo: "Og", nombre: "Oganesón", numeroAtomico: 118, periodo: 7, grupo: 18, estadoOxidacionComun: 0 },
];

export const ELEMENTOS: ElementoQuimico[] = ELEMENTOS_CRUDOS.map((e, i) => ({
  ...e,
  dificultad: Math.min(10, Math.ceil(((i + 1) / ELEMENTOS_CRUDOS.length) * 10)),
}));

export interface CompuestoQuimico {
  formula: string;
  nombre: string;
  dificultad: number;
}

// Orden: los 5 más cotidianos primero, tal como los dio el pedido.
const COMPUESTOS_CRUDOS: { formula: string; nombre: string }[] = [
  { formula: "H2O", nombre: "Agua" },
  { formula: "CO2", nombre: "Dióxido de carbono" },
  { formula: "NaCl", nombre: "Cloruro de sodio" },
  { formula: "O2", nombre: "Oxígeno" },
  { formula: "CH4", nombre: "Metano" },
  { formula: "NH3", nombre: "Amoníaco" },
  { formula: "H2SO4", nombre: "Ácido sulfúrico" },
  { formula: "C6H12O6", nombre: "Glucosa" },
  { formula: "CaCO3", nombre: "Carbonato de calcio" },
  { formula: "HCl", nombre: "Ácido clorhídrico" },
];

export const COMPUESTOS: CompuestoQuimico[] = COMPUESTOS_CRUDOS.map((c, i) => ({
  ...c,
  dificultad: i + 1,
}));

export type ModoQuimia = "simbolos" | "formulas" | "tabla" | "nomenclatura" | "organica";

export const NOMBRE_MODO_QUIMIA: Record<ModoQuimia, string> = {
  simbolos: "Símbolos y elementos",
  formulas: "Fórmulas y compuestos",
  tabla: "Tabla periódica",
  nomenclatura: "Nomenclatura",
  organica: "Química orgánica",
};

export interface PreguntaQuimia {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string; // para generarSinRepetir — no repetir el mismo elemento/compuesto seguido
  // Sección 5, ítem 3 (modo "organica"): id del compuesto en
  // COMPUESTOS_ORGANICOS (quimicaOrganica.ts) cuya estructura hay que
  // dibujar arriba del enunciado. undefined en cualquier otro modo.
  diagramaId?: string;
}

export type Rng = () => number;

// Banda ancha (±3), mismo criterio que geografia.ts: el dataset es
// chico y con ±1 quedarían muy pocas opciones en los niveles extremos.
// `rng` es inyectable (default Math.random) para que un duelo pueda
// sembrarlo y los dos rivales vean exactamente las mismas preguntas —
// mismo patrón que src/lib/practica/problems.ts.
function elegirAlAzar<T extends { dificultad: number }>(
  banco: T[],
  nivel: number,
  usados: Set<string>,
  clave: (t: T) => string,
  rng: Rng
): T {
  const candidatos = banco.filter((x) => Math.abs(x.dificultad - nivel) <= 3 && !usados.has(clave(x)));
  const pool = candidatos.length > 0 ? candidatos : banco.filter((x) => !usados.has(clave(x)));
  const poolFinal = pool.length > 0 ? pool : banco;
  return poolFinal[Math.floor(rng() * poolFinal.length)];
}

function opcionesConDistractores(correcta: string, resto: string[], rng: Rng, cantidad = 4): string[] {
  // dedupe por valor: los pools de símbolo/fórmula ya eran únicos de
  // por sí, pero el estado de oxidación común (Sección 5) se repite
  // mucho entre elementos (varios comparten +1, +2, -2...) — sin este
  // dedupe podían salir 2 opciones con el mismo texto.
  const distractores = Array.from(new Set(resto.filter((x) => x !== correcta)));
  const elegidos: string[] = [];
  const disponibles = [...distractores];
  while (elegidos.length < cantidad - 1 && disponibles.length > 0) {
    const idx = Math.floor(rng() * disponibles.length);
    elegidos.push(disponibles.splice(idx, 1)[0]);
  }
  const opciones = [correcta, ...elegidos];
  // Fisher-Yates para no dejar siempre la correcta primera.
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

function generarPreguntaSimbolos(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  const el = elegirAlAzar(ELEMENTOS, nivel, usados, (e) => e.simbolo, rng);
  const simboloAPregunta = rng() < 0.5;
  if (simboloAPregunta) {
    return {
      enunciado: `¿Qué elemento es "${el.simbolo}"?`,
      opciones: opcionesConDistractores(el.nombre, ELEMENTOS.map((e) => e.nombre), rng),
      respuesta: el.nombre,
      clave: el.simbolo,
    };
  }
  return {
    enunciado: `¿Cuál es el símbolo de ${el.nombre}?`,
    opciones: opcionesConDistractores(el.simbolo, ELEMENTOS.map((e) => e.simbolo), rng),
    respuesta: el.simbolo,
    clave: el.simbolo,
  };
}

function generarPreguntaFormulas(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  const c = elegirAlAzar(COMPUESTOS, nivel, usados, (x) => x.formula, rng);
  const formulaAPregunta = rng() < 0.5;
  if (formulaAPregunta) {
    return {
      enunciado: `¿Qué es "${c.formula}"?`,
      opciones: opcionesConDistractores(c.nombre, COMPUESTOS.map((x) => x.nombre), rng),
      respuesta: c.nombre,
      clave: c.formula,
    };
  }
  return {
    enunciado: `¿Cuál es la fórmula de ${c.nombre.toLowerCase()}?`,
    opciones: opcionesConDistractores(c.formula, COMPUESTOS.map((x) => x.formula), rng),
    respuesta: c.formula,
    clave: c.formula,
  };
}

function formatearOxidacion(n: number): string {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : String(n);
}

// Sección 5, ítem 1 ("tabla periódica progresiva"): a período/grupo (ya
// existía) se le suman 2 escalones más — número atómico en niveles
// bajos (el dato más directo de leer) y estado de oxidación en niveles
// altos (el que más exige haber entendido la tabla, no solo leerla).
// Auditoría de datos (2026-09-23, tanda 1 del retrofit de Aprender de Quimia):
// tres errores reales de esta pregunta, corregidos sin rediseñar el banco.
//
// 1) Estado de oxidación de los elementos superpesados. Los elementos
//    109-118 (Mt, Ds, Rg, Cn, Nh, Fl, Mc, Lv, Ts, Og) figuran con `0` como
//    marcador de "dato desconocido" (y Ts con −1, una predicción): son los
//    últimos de la lista, o sea los de mayor `dificultad`, así que justo en
//    los niveles 8-10 (donde se pregunta el estado de oxidación) salía
//    "¿Cuál es el estado de oxidación más común de Meitnerio?" con respuesta
//    "0", una respuesta falsa. Del 104 al 108 el valor es una predicción por
//    grupo (con algo de química experimental). Se excluye de esta pregunta
//    todo elemento con Z > 103: no existe un "estado de oxidación más común"
//    establecido para ellos.
export const Z_MAX_CON_ESTADO_OXIDACION = 103;

// 2) Los lantánidos (Z 57-71) y actínidos (Z 89-103) figuran con `grupo: 3`
//    por una convención práctica (ver src/lib/quimia/tabla.ts), pero según la
//    convención de la tabla no tienen grupo propio: «¿en qué grupo está el
//    cerio?» con respuesta «3» presenta una convención discutible como un
//    hecho. Para ellos solo se pregunta el período.
export function tieneGrupoDefinido(el: ElementoQuimico): boolean {
  const z = el.numeroAtomico;
  return !((z >= 57 && z <= 71) || (z >= 89 && z <= 103));
}

// 4) Distractores que eran respuestas válidas. Muchos elementos tienen más de
//    un estado de oxidación habitual (Fe +2 y +3, Cu +1 y +2, Sn +2 y +4, S −2,
//    +4 y +6...), y «el más común» es un criterio de tabla escolar: en «¿cuál es
//    el estado de oxidación más común del hierro?» la opción «+2» (que era un
//    distractor, porque es el «común» de Mn, Co, Ni...) es un estado real del
//    hierro. Esta tabla lista, para los elementos con Z <= 103 que tienen otros
//    estados muy conocidos a nivel colegio, los estados DISTINTOS del «común»:
//    nunca se ofrecen como distractor. (quimiaAuditoria.test.ts la cruza con
//    los estados de src/lib/quimia/datos.ts cuando ese elemento está cargado.)
export const ESTADOS_ALTERNATIVOS: Record<string, number[]> = {
  H: [-1],
  C: [-4, 2],
  N: [1, 2, 3, 4, 5],
  O: [-1],
  Si: [-4],
  P: [-3, 3],
  S: [4, 6],
  Cl: [1, 3, 5, 7],
  Ti: [2, 3],
  V: [2, 3, 4],
  Cr: [2, 6],
  Mn: [4, 6, 7],
  Fe: [2],
  Co: [3],
  Ni: [3],
  Cu: [1],
  Ge: [2],
  As: [-3, 5],
  Se: [4, 6],
  Br: [1, 3, 5, 7],
  Mo: [4, 5],
  Sn: [2],
  Sb: [-3, 5],
  Te: [4, 6],
  I: [1, 3, 5, 7],
  Ce: [4],
  W: [4],
  Re: [7],
  Pt: [4],
  Au: [1],
  Hg: [1],
  Tl: [3],
  Pb: [4],
  Bi: [5],
  U: [4],
};

const PERIODOS_POSIBLES = ["1", "2", "3", "4", "5", "6", "7"];
const GRUPOS_POSIBLES = Array.from({ length: 18 }, (_, i) => String(i + 1));

function generarPreguntaTabla(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  // Niveles 8-10 (estado de oxidación): solo elementos con Z <= 103 (ver 1).
  const banco = nivel >= 8 ? ELEMENTOS.filter((e) => e.numeroAtomico <= Z_MAX_CON_ESTADO_OXIDACION) : ELEMENTOS;
  const el = elegirAlAzar(banco, nivel, usados, (e) => e.simbolo, rng);

  if (nivel <= 3) {
    const otros = ELEMENTOS.map((e) => String(e.numeroAtomico));
    return {
      enunciado: `¿Cuál es el número atómico de ${el.nombre} (${el.simbolo})?`,
      opciones: opcionesConDistractores(String(el.numeroAtomico), otros, rng),
      respuesta: String(el.numeroAtomico),
      clave: el.simbolo,
    };
  }

  if (nivel >= 8) {
    // Los distractores no pueden ser otro estado de oxidación válido del mismo
    // elemento (ver ESTADOS_ALTERNATIVOS): «+2» como opción incorrecta para el
    // hierro sería, en rigor, una respuesta correcta.
    const validos = new Set([el.estadoOxidacionComun, ...(ESTADOS_ALTERNATIVOS[el.simbolo] ?? [])].map(formatearOxidacion));
    const otros = banco.map((e) => formatearOxidacion(e.estadoOxidacionComun)).filter((o) => !validos.has(o));
    return {
      enunciado: `¿Cuál es el estado de oxidación más común de ${el.nombre} (${el.simbolo})?`,
      opciones: opcionesConDistractores(formatearOxidacion(el.estadoOxidacionComun), otros, rng),
      respuesta: formatearOxidacion(el.estadoOxidacionComun),
      clave: el.simbolo,
    };
  }

  // 3) Las opciones de período y de grupo eran listas parciales ("1"-"6" y
  //    "1, 2, 8, 11-18"): la respuesta 7, o un grupo 3-7, 9 o 10, era la
  //    ÚNICA opción fuera de la lista y se adivinaba por descarte. Ahora los
  //    distractores salen de todos los períodos (1-7) y todos los grupos (1-18).
  //    Los lantánidos y actínidos solo reciben la pregunta de período (ver 2).
  const preguntarPeriodo = rng() < 0.5 || !tieneGrupoDefinido(el);
  if (preguntarPeriodo) {
    return {
      enunciado: `¿En qué período de la tabla periódica está ${el.nombre} (${el.simbolo})?`,
      opciones: opcionesConDistractores(String(el.periodo), PERIODOS_POSIBLES, rng),
      respuesta: String(el.periodo),
      clave: el.simbolo,
    };
  }
  return {
    enunciado: `¿En qué grupo de la tabla periódica está ${el.nombre} (${el.simbolo})?`,
    opciones: opcionesConDistractores(String(el.grupo), GRUPOS_POSIBLES, rng),
    respuesta: String(el.grupo),
    clave: el.simbolo,
  };
}

export interface CompuestoNomenclatura {
  formula: string;
  nombre: string;
  dificultad: number;
}

// Sección 5, ítem 2: nomenclatura real (sales binarias, óxidos,
// hidróxidos, oxiácidos y algunas sales de ácidos oxigenados) — nombres
// tradicionales/IUPAC en español, dato real verificado, no inventado.
// Orden: de compuestos binarios simples a nomenclatura con números
// romanos y oxiácidos menos comunes, tal como pide la progresión.
const NOMENCLATURA_CRUDOS: { formula: string; nombre: string }[] = [
  { formula: "NaCl", nombre: "Cloruro de sodio" },
  { formula: "KBr", nombre: "Bromuro de potasio" },
  { formula: "MgO", nombre: "Óxido de magnesio" },
  { formula: "CaO", nombre: "Óxido de calcio" },
  { formula: "Al2O3", nombre: "Óxido de aluminio" },
  { formula: "NaOH", nombre: "Hidróxido de sodio" },
  { formula: "Ca(OH)2", nombre: "Hidróxido de calcio" },
  { formula: "H2CO3", nombre: "Ácido carbónico" },
  { formula: "FeO", nombre: "Óxido de hierro (II)" },
  { formula: "Fe2O3", nombre: "Óxido de hierro (III)" },
  { formula: "Na2CO3", nombre: "Carbonato de sodio" },
  { formula: "AgNO3", nombre: "Nitrato de plata" },
  { formula: "HNO3", nombre: "Ácido nítrico" },
  { formula: "CaSO4", nombre: "Sulfato de calcio" },
  { formula: "NaHCO3", nombre: "Bicarbonato de sodio" },
  { formula: "CuSO4", nombre: "Sulfato de cobre (II)" },
  { formula: "HClO", nombre: "Ácido hipocloroso" },
  { formula: "KMnO4", nombre: "Permanganato de potasio" },
  { formula: "HClO4", nombre: "Ácido perclórico" },
];

export const COMPUESTOS_NOMENCLATURA: CompuestoNomenclatura[] = NOMENCLATURA_CRUDOS.map((c, i) => ({
  ...c,
  dificultad: Math.min(10, Math.ceil(((i + 1) / NOMENCLATURA_CRUDOS.length) * 10)),
}));

function generarPreguntaNomenclatura(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  const c = elegirAlAzar(COMPUESTOS_NOMENCLATURA, nivel, usados, (x) => x.formula, rng);
  const formulaAPregunta = rng() < 0.5;
  if (formulaAPregunta) {
    return {
      enunciado: `¿Cómo se llama "${c.formula}"?`,
      opciones: opcionesConDistractores(c.nombre, COMPUESTOS_NOMENCLATURA.map((x) => x.nombre), rng),
      respuesta: c.nombre,
      clave: c.formula,
    };
  }
  return {
    enunciado: `¿Cuál es la fórmula de "${c.nombre}"?`,
    opciones: opcionesConDistractores(c.formula, COMPUESTOS_NOMENCLATURA.map((x) => x.formula), rng),
    respuesta: c.formula,
    clave: c.formula,
  };
}

export function generarPreguntaQuimia(
  modo: ModoQuimia,
  nivel: number,
  usados: Set<string>,
  rng: Rng = Math.random
): PreguntaQuimia {
  if (modo === "formulas") return generarPreguntaFormulas(nivel, usados, rng);
  if (modo === "tabla") return generarPreguntaTabla(nivel, usados, rng);
  if (modo === "nomenclatura") return generarPreguntaNomenclatura(nivel, usados, rng);
  // "organica" se resuelve en QuimiaSprintRunner.tsx llamando a
  // generarPreguntaOrganica (quimicaOrganica.ts) directo — no acá, para
  // no importar ese módulo desde este (evita el ciclo módulo↔módulo;
  // ese archivo ya importa el tipo PreguntaQuimia de acá).
  return generarPreguntaSimbolos(nivel, usados, rng);
}
