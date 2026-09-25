export type TipoPotencia = "potencia" | "raiz" | "notacion";

export interface ProblemaPotencia {
  problemType: "potencias";
  tipo: TipoPotencia;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// Base máxima por exponente y por banda de nivel (0..4). 0 = ese exponente
// todavía no aparece. Antes los niveles bajos solo daban 2² y 3² (la base
// máxima de la banda era 2 o 3 y el exponente fijo en 2): dos problemas
// distintos en total. Ahora cada banda tiene un conjunto de pares (base,
// exponente) más amplio y cada banda incluye los de las anteriores.
export const BASE_MAXIMA_POTENCIA: Record<number, [number, number, number, number, number]> = {
  2: [6, 9, 12, 15, 20],
  3: [2, 4, 6, 8, 10],
  4: [0, 0, 3, 4, 5],
  5: [0, 0, 0, 3, 4],
};

// Todos los pares (base, exponente) que puede pedir una banda.
export function paresPotencia(nivel: number): { base: number; exp: number }[] {
  const b = banda(nivel);
  const pares: { base: number; exp: number }[] = [];
  for (const [exp, maximos] of Object.entries(BASE_MAXIMA_POTENCIA)) {
    for (let base = 2; base <= maximos[b]; base++) pares.push({ base, exp: Number(exp) });
  }
  return pares;
}

function generarPotencia(nivel: number): ProblemaPotencia {
  const pares = paresPotencia(nivel);
  const { base, exp } = pares[Math.floor(Math.random() * pares.length)];
  return {
    problemType: "potencias",
    tipo: "potencia",
    enunciado: `$${base}^{${exp}}$`,
    respuesta: base ** exp,
    tolerancia: 0,
  };
}

function generarRaiz(nivel: number): ProblemaPotencia {
  const maxRaiz = [5, 8, 10, 12, 15][banda(nivel)];
  const raiz = randomInt(2, maxRaiz);
  return {
    problemType: "potencias",
    tipo: "raiz",
    enunciado: `$\\sqrt{${raiz * raiz}}$`,
    respuesta: raiz,
    tolerancia: 0,
  };
}

function generarNotacion(nivel: number): ProblemaPotencia {
  const ceros = randomInt(2 + banda(nivel), 5 + banda(nivel));
  const numero = randomInt(1, 9) * 10 ** ceros;
  return {
    problemType: "potencias",
    tipo: "notacion",
    enunciado: `Escrito en notación científica, ¿cuál es el exponente de ${numero.toLocaleString("es-AR")}?`,
    respuesta: ceros,
    tolerancia: 0,
  };
}

const GENERADORES: Record<TipoPotencia, (nivel: number) => ProblemaPotencia> = {
  potencia: generarPotencia,
  raiz: generarRaiz,
  notacion: generarNotacion,
};

export const TIPOS_POTENCIA: TipoPotencia[] = ["potencia", "raiz", "notacion"];

// Fase 2 ("Practicar" estandarizado): calibración propia por sub-tema.
export function generarProblemaPotencia(
  nivelPorTipo: Record<TipoPotencia, number>,
  tipos: TipoPotencia[] = TIPOS_POTENCIA
): ProblemaPotencia {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_POTENCIA;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
