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

const SUPERINDICES: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };

function generarPotencia(nivel: number): ProblemaPotencia {
  const bases = [2, 3, 4, 5, 6];
  const exponentes = [2, 2, 3, 3, 4];
  const base = randomInt(2, bases[banda(nivel)]);
  const exp = exponentes[banda(nivel)];
  return {
    problemType: "potencias",
    tipo: "potencia",
    enunciado: `${base}${SUPERINDICES[exp] ?? `^${exp}`}`,
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
    enunciado: `√${raiz * raiz}`,
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

export function generarProblemaPotencia(nivel: number, tipos: TipoPotencia[] = ["potencia", "raiz", "notacion"]): ProblemaPotencia {
  const disponibles = tipos.length > 0 ? tipos : (["potencia", "raiz", "notacion"] as TipoPotencia[]);
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivel);
}
