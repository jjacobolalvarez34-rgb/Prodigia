export type TipoPotencia = "potencia" | "raiz" | "notacion";

export interface ProblemaPotencia {
  problemType: "potencias";
  tipo: TipoPotencia;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
  // «Cómo se resuelve» para el repaso de errores (repaso.ts).
  pasos?: string[];
}

const sup = (x: number) => String(x).split("").map((c) => (c === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)])).join("");

function pasosPotencia(base: number, exp: number): string[] {
  const pasos = [`${base}${sup(exp)} es ${base} multiplicado por sí mismo ${exp} veces: ${Array(exp).fill(base).join(" × ")}`];
  let acumulado = base;
  for (let i = 1; i < exp; i++) {
    pasos.push(`${acumulado.toLocaleString("es")} × ${base} = ${(acumulado * base).toLocaleString("es")}`);
    acumulado *= base;
  }
  return pasos;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// Base mínima y máxima por exponente y por banda de nivel (0..4). Máximo 0 = ese
// exponente todavía no aparece. Historia: hasta el 2026-09-25 los niveles bajos solo
// daban 2² y 3²; después cada banda incluía todos los pares de las anteriores, así
// que en nivel 1-2 seguía habiendo 6 preguntas y en nivel 9-10 salían igual 2² o 3²
// (auditoría de variedad 2026-10-23, docs/AUDITORIA_PREGUNTAS.md). Ahora la banda
// 0 tiene 16 pares y las bandas altas dejan de preguntar las potencias más fáciles.
export const BASE_MINIMA_POTENCIA: Record<number, [number, number, number, number, number]> = {
  2: [2, 2, 4, 8, 11],
  3: [2, 2, 2, 3, 4],
  4: [2, 2, 2, 2, 3],
  5: [2, 2, 2, 2, 2],
  6: [2, 2, 2, 2, 2],
  7: [2, 2, 2, 2, 2],
  8: [2, 2, 2, 2, 2],
  9: [2, 2, 2, 2, 2],
  10: [2, 2, 2, 2, 2],
};
export const BASE_MAXIMA_POTENCIA: Record<number, [number, number, number, number, number]> = {
  2: [12, 15, 20, 25, 30],
  3: [4, 5, 6, 10, 12],
  4: [2, 3, 4, 5, 6],
  5: [2, 2, 3, 4, 5],
  6: [0, 2, 2, 3, 3],
  7: [0, 0, 2, 2, 2],
  8: [0, 0, 0, 2, 2],
  9: [0, 0, 0, 0, 2],
  10: [0, 0, 0, 2, 2],
};

// Todos los pares (base, exponente) que puede pedir una banda.
export function paresPotencia(nivel: number): { base: number; exp: number }[] {
  const b = banda(nivel);
  const pares: { base: number; exp: number }[] = [];
  for (const [exp, maximos] of Object.entries(BASE_MAXIMA_POTENCIA)) {
    for (let base = BASE_MINIMA_POTENCIA[Number(exp)][b]; base <= maximos[b]; base++) pares.push({ base, exp: Number(exp) });
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
    pasos: pasosPotencia(base, exp),
  };
}

// Raíces: cuadradas exactas y, según la banda, cúbicas, cuartas y quintas, y
// cuadradas de números redondos (√3600 = 60). Antes, en nivel 1-2 solo había 4
// raíces posibles (√4 … √25).
const RAICES: { indice: number; min: number[]; max: number[] }[] = [
  { indice: 2, min: [2, 4, 6, 8, 11], max: [12, 15, 18, 22, 30] },
  { indice: 3, min: [2, 2, 3, 3, 4], max: [4, 5, 6, 8, 10] },
  { indice: 4, min: [0, 0, 0, 2, 2], max: [0, 0, 0, 4, 5] },
  { indice: 5, min: [0, 0, 0, 0, 2], max: [0, 0, 0, 0, 3] },
];

function nombreRaiz(indice: number): string {
  return indice === 2 ? "√" : indice === 3 ? "∛" : `raíz ${indice}ª de `;
}

function generarRaiz(nivel: number): ProblemaPotencia {
  const b = banda(nivel);
  // √ de un cuadrado «redondo» (×100): desde la banda 2.
  if (b >= 2 && Math.random() < 0.2) {
    const a = randomInt(2, 9 + b);
    const raiz = a * 10;
    return {
      problemType: "potencias",
      tipo: "raiz",
      enunciado: `$\\sqrt{${raiz * raiz}}$`,
      respuesta: raiz,
      tolerancia: 0,
      pasos: [`${raiz * raiz} = ${a * a} × 100, y √100 = 10`, `√${a * a} = ${a}, así que √${raiz * raiz} = ${a} × 10 = ${raiz}`],
    };
  }
  const opciones: { indice: number; raiz: number }[] = [];
  for (const r of RAICES) for (let x = r.min[b]; r.max[b] > 0 && x <= r.max[b]; x++) opciones.push({ indice: r.indice, raiz: x });
  const { indice, raiz } = opciones[Math.floor(Math.random() * opciones.length)];
  const radicando = raiz ** indice;
  return {
    problemType: "potencias",
    tipo: "raiz",
    enunciado: indice === 2 ? `$\\sqrt{${radicando}}$` : `$\\sqrt[${indice}]{${radicando}}$`,
    respuesta: raiz,
    tolerancia: 0,
    pasos: [
      `Busca el número que multiplicado por sí mismo ${indice === 2 ? "" : `${indice} veces `}da ${radicando}`,
      `${Array(indice).fill(raiz).join(" × ")} = ${radicando}, así que ${nombreRaiz(indice)}${radicando} = ${raiz}`,
    ],
  };
}

// Notación científica. Antes: siempre «d × 10ⁿ» con una sola cifra, igual en todos
// los niveles. Ahora suben las cifras significativas, aparecen números chicos
// (exponente negativo: la app tiene tecla «−» en Potencias) y, arriba, productos y
// cocientes en notación científica.
function textoNumeroGrande(significativas: number[], exponente: number): string {
  const digitos = significativas.join("") + "0".repeat(exponente + 1 - significativas.length);
  return Number(digitos).toLocaleString("es-AR");
}

function textoNumeroChico(significativas: number[], exponente: number): string {
  // exponente < 0: 0,000 25 = 2,5 × 10⁻⁴ → «0,» + (−exponente − 1) ceros + cifras.
  return `0,${"0".repeat(-exponente - 1)}${significativas.join("")}`;
}

function cifrasSignificativas(cuantas: number): number[] {
  const c = [randomInt(1, 9)];
  for (let i = 1; i < cuantas; i++) c.push(randomInt(0, 9));
  if (cuantas > 1) c[cuantas - 1] = randomInt(1, 9); // la última no es 0
  return c;
}

function mantisa(significativas: number[]): string {
  return significativas.length === 1 ? String(significativas[0]) : `${significativas[0]},${significativas.slice(1).join("")}`;
}

function generarNotacion(nivel: number): ProblemaPotencia {
  const b = banda(nivel);
  if (b === 4 && Math.random() < 0.4) {
    // (a × 10ᵖ) × (c × 10ᵠ) o ÷, con a·c < 10 (o a/c entero) para que quede normalizado.
    const multiplica = Math.random() < 0.5;
    const p = randomInt(2, 12);
    const q = randomInt(2, 9);
    let a = randomInt(1, 9);
    let c = randomInt(1, 9);
    if (multiplica) while (a * c >= 10) [a, c] = [randomInt(1, 9), randomInt(1, 4)];
    else while (a % c !== 0) [a, c] = [randomInt(1, 9), randomInt(1, 9)];
    const m = multiplica ? a * c : a / c;
    const n = multiplica ? p + q : p - q;
    return {
      problemType: "potencias",
      tipo: "notacion",
      enunciado: `$(${a} \\times 10^{${p}}) ${multiplica ? "\\times" : "\\div"} (${c} \\times 10^{${q}}) = ${m} \\times 10^{n}$. ¿Cuánto vale $n$?`,
      respuesta: n,
      tolerancia: 0,
      pasos: [
        `${multiplica ? "Multiplica" : "Divide"} los números: ${a} ${multiplica ? "×" : "÷"} ${c} = ${m}`,
        `${multiplica ? "Suma" : "Resta"} los exponentes: ${p} ${multiplica ? "+" : "−"} ${q} = ${n}`,
      ],
    };
  }
  const significativas = cifrasSignificativas(randomInt(1, [1, 2, 3, 3, 4][b]));
  const chico = b >= 2 && Math.random() < 0.45;
  const exponente = chico ? -randomInt(1, [0, 0, 4, 6, 9][b]) : randomInt(Math.max(significativas.length, 2 + b), 5 + 2 * b);
  const texto = chico ? textoNumeroChico(significativas, exponente) : textoNumeroGrande(significativas, exponente);
  return {
    problemType: "potencias",
    tipo: "notacion",
    enunciado: `Escrito en notación científica, ¿cuál es el exponente de ${texto}?`,
    respuesta: exponente,
    tolerancia: 0,
    pasos: [
      `Corre la coma hasta que quede una sola cifra distinta de 0 adelante: ${texto} = ${mantisa(significativas)} × 10${sup(exponente)}`,
      chico ? `La corriste ${-exponente} lugares a la derecha: el exponente es ${exponente}` : `La corriste ${exponente} lugares: ese es el exponente`,
    ],
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
