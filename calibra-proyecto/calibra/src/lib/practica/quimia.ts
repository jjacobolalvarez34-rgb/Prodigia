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
  dificultad: number;
}

interface ElementoCrudo {
  simbolo: string;
  nombre: string;
  numeroAtomico: number;
  periodo: number;
  grupo: number;
}

// Orden: de más comunes/fáciles a menos, tal como los dio el pedido.
const ELEMENTOS_CRUDOS: ElementoCrudo[] = [
  { simbolo: "H", nombre: "Hidrógeno", numeroAtomico: 1, periodo: 1, grupo: 1 },
  { simbolo: "He", nombre: "Helio", numeroAtomico: 2, periodo: 1, grupo: 18 },
  { simbolo: "Li", nombre: "Litio", numeroAtomico: 3, periodo: 2, grupo: 1 },
  { simbolo: "C", nombre: "Carbono", numeroAtomico: 6, periodo: 2, grupo: 14 },
  { simbolo: "N", nombre: "Nitrógeno", numeroAtomico: 7, periodo: 2, grupo: 15 },
  { simbolo: "O", nombre: "Oxígeno", numeroAtomico: 8, periodo: 2, grupo: 16 },
  { simbolo: "Na", nombre: "Sodio", numeroAtomico: 11, periodo: 3, grupo: 1 },
  { simbolo: "Mg", nombre: "Magnesio", numeroAtomico: 12, periodo: 3, grupo: 2 },
  { simbolo: "Al", nombre: "Aluminio", numeroAtomico: 13, periodo: 3, grupo: 13 },
  { simbolo: "Si", nombre: "Silicio", numeroAtomico: 14, periodo: 3, grupo: 14 },
  { simbolo: "P", nombre: "Fósforo", numeroAtomico: 15, periodo: 3, grupo: 15 },
  { simbolo: "S", nombre: "Azufre", numeroAtomico: 16, periodo: 3, grupo: 16 },
  { simbolo: "Cl", nombre: "Cloro", numeroAtomico: 17, periodo: 3, grupo: 17 },
  { simbolo: "K", nombre: "Potasio", numeroAtomico: 19, periodo: 4, grupo: 1 },
  { simbolo: "Ca", nombre: "Calcio", numeroAtomico: 20, periodo: 4, grupo: 2 },
  { simbolo: "Fe", nombre: "Hierro", numeroAtomico: 26, periodo: 4, grupo: 8 },
  { simbolo: "Cu", nombre: "Cobre", numeroAtomico: 29, periodo: 4, grupo: 11 },
  { simbolo: "Zn", nombre: "Zinc", numeroAtomico: 30, periodo: 4, grupo: 12 },
  { simbolo: "Ag", nombre: "Plata", numeroAtomico: 47, periodo: 5, grupo: 11 },
  { simbolo: "Au", nombre: "Oro", numeroAtomico: 79, periodo: 6, grupo: 11 },
  { simbolo: "Pb", nombre: "Plomo", numeroAtomico: 82, periodo: 6, grupo: 14 },
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

export type ModoQuimia = "simbolos" | "formulas" | "tabla";

export const NOMBRE_MODO_QUIMIA: Record<ModoQuimia, string> = {
  simbolos: "Símbolos y elementos",
  formulas: "Fórmulas y compuestos",
  tabla: "Tabla periódica",
};

export interface PreguntaQuimia {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string; // para generarSinRepetir — no repetir el mismo elemento/compuesto seguido
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
  const distractores = resto.filter((x) => x !== correcta);
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

function generarPreguntaTabla(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  const el = elegirAlAzar(ELEMENTOS, nivel, usados, (e) => e.simbolo, rng);
  const preguntarPeriodo = rng() < 0.5;
  if (preguntarPeriodo) {
    return {
      enunciado: `¿En qué período de la tabla periódica está ${el.nombre} (${el.simbolo})?`,
      opciones: opcionesConDistractores(String(el.periodo), ["1", "2", "3", "4", "5", "6"], rng),
      respuesta: String(el.periodo),
      clave: el.simbolo,
    };
  }
  return {
    enunciado: `¿En qué grupo de la tabla periódica está ${el.nombre} (${el.simbolo})?`,
    opciones: opcionesConDistractores(String(el.grupo), ["1", "2", "8", "11", "12", "13", "14", "15", "16", "17", "18"], rng),
    respuesta: String(el.grupo),
    clave: el.simbolo,
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
  return generarPreguntaSimbolos(nivel, usados, rng);
}
