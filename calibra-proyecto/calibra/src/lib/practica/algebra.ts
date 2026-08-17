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

// Fase EE2: escala la dificultad por tipo de problema, no solo por
// números más grandes — nivel bajo es evaluar una expresión, nivel
// medio es despejar en un paso, nivel alto ya es de dos pasos.
export function generarProblemaAlgebra(nivel: number): ProblemaAlgebra {
  if (nivel <= 3) return generarEvaluar(nivel);
  if (nivel <= 6) return generarUnPaso(nivel);
  return generarDosPasos(nivel);
}
