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
function generarPreguntaTabla(nivel: number, usados: Set<string>, rng: Rng): PreguntaQuimia {
  const el = elegirAlAzar(ELEMENTOS, nivel, usados, (e) => e.simbolo, rng);

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
    const otros = ELEMENTOS.map((e) => formatearOxidacion(e.estadoOxidacionComun));
    return {
      enunciado: `¿Cuál es el estado de oxidación más común de ${el.nombre} (${el.simbolo})?`,
      opciones: opcionesConDistractores(formatearOxidacion(el.estadoOxidacionComun), otros, rng),
      respuesta: formatearOxidacion(el.estadoOxidacionComun),
      clave: el.simbolo,
    };
  }

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
