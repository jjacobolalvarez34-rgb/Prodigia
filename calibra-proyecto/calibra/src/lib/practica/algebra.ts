export type TipoAlgebra = "evaluar" | "un-paso" | "dos-pasos";

export interface ProblemaAlgebra {
  problemType: "algebra";
  tipo: TipoAlgebra;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Evaluar una expresión simple dado el valor de x — el paso previo a
// despejar, sirve para entender qué es "reemplazar la variable".
function generarEvaluar(nivel: number): ProblemaAlgebra {
  const x = randomInt(1, 4 + nivel);
  const a = randomInt(2, 3 + Math.floor(nivel / 2));
  const b = randomInt(1, 5 + nivel);
  const suma = Math.random() < 0.5;
  const respuesta = suma ? a * x + b : a * x - b;
  return {
    problemType: "algebra",
    tipo: "evaluar",
    enunciado: `Si x = ${x}, ¿cuánto vale ${a}x ${suma ? "+" : "−"} ${b}?`,
    respuesta,
    tolerancia: 0,
  };
}

// Ecuación de un paso: x + b = c, x − b = c, o ax = c.
function generarUnPaso(nivel: number): ProblemaAlgebra {
  const x = randomInt(1, 6 + nivel);
  const forma = randomInt(0, 2);
  if (forma === 0) {
    const b = randomInt(1, 10 + nivel);
    return {
      problemType: "algebra",
      tipo: "un-paso",
      enunciado: `x + ${b} = ${x + b}. ¿Cuánto vale x?`,
      respuesta: x,
      tolerancia: 0,
    };
  }
  if (forma === 1) {
    const b = randomInt(1, 10 + nivel);
    return {
      problemType: "algebra",
      tipo: "un-paso",
      enunciado: `x − ${b} = ${x - b}. ¿Cuánto vale x?`,
      respuesta: x,
      tolerancia: 0,
    };
  }
  const a = randomInt(2, 4 + Math.floor(nivel / 2));
  return {
    problemType: "algebra",
    tipo: "un-paso",
    enunciado: `${a}x = ${a * x}. ¿Cuánto vale x?`,
    respuesta: x,
    tolerancia: 0,
  };
}

// Ecuación de dos pasos: ax + b = c o ax − b = c (ej. 2x + 3 = 11).
function generarDosPasos(nivel: number): ProblemaAlgebra {
  const x = randomInt(1, 4 + Math.floor(nivel / 2));
  const a = randomInt(2, 3 + Math.floor(nivel / 3));
  const b = randomInt(1, 8 + nivel);
  const suma = Math.random() < 0.5;
  const resultado = suma ? a * x + b : a * x - b;
  return {
    problemType: "algebra",
    tipo: "dos-pasos",
    enunciado: `${a}x ${suma ? "+" : "−"} ${b} = ${resultado}. ¿Cuánto vale x?`,
    respuesta: x,
    tolerancia: 0,
  };
}

const GENERADORES: Record<TipoAlgebra, (nivel: number) => ProblemaAlgebra> = {
  evaluar: generarEvaluar,
  "un-paso": generarUnPaso,
  "dos-pasos": generarDosPasos,
};

export const TIPOS_ALGEBRA: TipoAlgebra[] = ["evaluar", "un-paso", "dos-pasos"];

// Fase 2 ("Practicar" estandarizado): pasa de una progresión fija por
// nivel único (evaluar -> un-paso -> dos-pasos, Fase EE2 original) a 3
// sub-temas independientemente elegibles y calibrados, mismo patrón
// que el resto de Numeria — cada uno escala su propia dificultad
// puertas adentro (ver generarEvaluar/generarUnPaso/generarDosPasos),
// así que elegir "dos-pasos" desde nivel 1 sigue siendo jugable, solo
// que empieza en su escalón más fácil en vez de heredar progreso de
// los otros dos.
export function generarProblemaAlgebra(
  nivelPorTipo: Record<TipoAlgebra, number>,
  tipos: TipoAlgebra[] = TIPOS_ALGEBRA
): ProblemaAlgebra {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_ALGEBRA;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
