import type { ArithmeticProblemType, ModifierSlug } from "@/types/database";

export interface Problem {
  problemType: ArithmeticProblemType;
  nivel: number;
  a: number;
  b: number;
  symbol: "+" | "−" | "×" | "÷";
  answer: number;
  modifier?: ModifierSlug;
  // Modificador "inverso": se muestra "a × ? = b" y hay que hallar la
  // incógnita (que en ese caso es lo que se guarda en `answer`).
  incognitaB?: boolean;
}

// rng es inyectable para los duelos en tiempo real (Fase T3): ambos
// rivales generan la MISMA secuencia de problemas a partir de la misma
// semilla (duels.semilla_problemas + mulberry32, ver SprintRunner.tsx),
// nunca vía Math.random. Sin duelo de por medio, rng se omite y esto
// sigue siendo random de verdad, como siempre.
function randomInt(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Nivel 1-10 se agrupa en 5 bandas de dificultad ([1-2], [3-4], ..., [9-10]).
function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

const SUMA_RESTA_MAX = [9, 50, 99, 500, 999];
const FACTOR_1 = [5, 9, 12, 20, 30];
const FACTOR_2 = [5, 9, 12, 12, 15];

function bandaConModifier(nivel: number, modifier?: ModifierSlug): number {
  // "numeros_grandes" empuja una banda de dificultad más arriba de la que
  // te tocaría por nivel — por eso hace falta haberlo desbloqueado.
  const base = banda(nivel);
  return modifier === "numeros_grandes" ? Math.min(4, base + 1) : base;
}

function generarSuma(nivel: number, modifier?: ModifierSlug, rng?: () => number): Problem {
  const max = SUMA_RESTA_MAX[bandaConModifier(nivel, modifier)];
  const a = randomInt(1, max, rng);
  const b = randomInt(1, max, rng);
  return { problemType: "suma", nivel, a, b, symbol: "+", answer: a + b, modifier };
}

function generarResta(nivel: number, modifier?: ModifierSlug, rng?: () => number): Problem {
  const max = SUMA_RESTA_MAX[banda(nivel)];
  let a = randomInt(1, max, rng);
  let b = randomInt(1, max, rng);
  if (modifier !== "negativos" && b > a) {
    [a, b] = [b, a]; // sin el modificador, nunca da negativo
  }
  return { problemType: "resta", nivel, a, b, symbol: "−", answer: a - b, modifier };
}

function generarMultiplicacion(nivel: number, modifier?: ModifierSlug, rng?: () => number): Problem {
  const i = bandaConModifier(nivel, modifier);
  const a = randomInt(2, FACTOR_1[i], rng);
  const b = randomInt(2, FACTOR_2[i], rng);

  if (modifier === "inverso") {
    // Se muestra "a × ? = resultado": el campo `b` pasa a ser el
    // resultado visible, y lo que hay que tipear (el factor faltante)
    // queda en `answer`.
    return {
      problemType: "multiplicacion",
      nivel,
      a,
      b: a * b,
      symbol: "×",
      answer: b,
      modifier,
      incognitaB: true,
    };
  }

  return { problemType: "multiplicacion", nivel, a, b, symbol: "×", answer: a * b, modifier };
}

function generarDivision(nivel: number, rng?: () => number): Problem {
  const i = banda(nivel);
  const divisor = randomInt(2, FACTOR_2[i], rng);
  const cociente = randomInt(2, FACTOR_1[i], rng);
  const dividendo = divisor * cociente;
  return {
    problemType: "division",
    nivel,
    a: dividendo,
    b: divisor,
    symbol: "÷",
    answer: cociente,
  };
}

export function formatearProblema(p: Problem): string {
  if (p.incognitaB) {
    return `${p.a} ${p.symbol} ? = ${p.b}`;
  }
  return `${p.a} ${p.symbol} ${p.b}`;
}

export function generarProblema(
  problemType: ArithmeticProblemType,
  nivel: number,
  modifier?: ModifierSlug,
  rng?: () => number
): Problem {
  switch (problemType) {
    case "suma":
      return generarSuma(nivel, modifier, rng);
    case "resta":
      return generarResta(nivel, modifier, rng);
    case "multiplicacion":
      return generarMultiplicacion(nivel, modifier, rng);
    case "division":
      return generarDivision(nivel, rng);
  }
}

// Práctica guiada de /aprender: cada técnica necesita problemas con la
// FORMA exacta que enseña (no cualquier problema al azar de esa
// operación), si no la práctica no refuerza el truco que se acaba de ver.
export function generarProblemaTecnica(slug: string): Problem {
  switch (slug) {
    case "complemento-a-10": {
      const a = randomInt(6, 9); // cerca de la decena, para que valga la pena completarla
      const b = randomInt(2, 9);
      return { problemType: "suma", nivel: 1, a, b, symbol: "+", answer: a + b };
    }
    case "redondear-decena": {
      const a = randomInt(20, 90);
      const b = randomInt(20, 90);
      return { problemType: "suma", nivel: 1, a, b, symbol: "+", answer: a + b };
    }
    case "resta-compensacion": {
      const a = randomInt(50, 99);
      const b = randomInt(20, a - 1);
      return { problemType: "resta", nivel: 1, a, b, symbol: "−", answer: a - b };
    }
    case "x11-segundo": {
      const a = randomInt(11, 88);
      return { problemType: "multiplicacion", nivel: 1, a, b: 11, symbol: "×", answer: a * 11 };
    }
    case "x5-mitad-de-x10": {
      const a = randomInt(4, 60);
      return { problemType: "multiplicacion", nivel: 1, a, b: 5, symbol: "×", answer: a * 5 };
    }
    case "cuadrado-terminado-en-5": {
      const decena = randomInt(1, 9);
      const n = decena * 10 + 5;
      return { problemType: "multiplicacion", nivel: 1, a: n, b: n, symbol: "×", answer: n * n };
    }
    case "sumar-por-la-izquierda": {
      const a = randomInt(100, 899);
      const b = randomInt(100, 899);
      return { problemType: "suma", nivel: 1, a, b, symbol: "+", answer: a + b };
    }
    case "duplicar-y-ajustar": {
      const a = randomInt(20, 90);
      const b = a + randomInt(-5, 5);
      return { problemType: "suma", nivel: 1, a, b: Math.max(1, b), symbol: "+", answer: a + Math.max(1, b) };
    }
    case "complemento-a-100": {
      const b = randomInt(1, 98);
      return { problemType: "resta", nivel: 1, a: 100, b, symbol: "−", answer: 100 - b };
    }
    case "x9-es-x10-menos-el-numero": {
      const a = randomInt(11, 99);
      return { problemType: "multiplicacion", nivel: 1, a, b: 9, symbol: "×", answer: a * 9 };
    }
    case "numeros-cercanos-a-100": {
      const a = randomInt(90, 99);
      const b = randomInt(90, 99);
      return { problemType: "multiplicacion", nivel: 1, a, b, symbol: "×", answer: a * b };
    }
    case "x4-duplicar-dos-veces": {
      const a = randomInt(10, 99);
      return { problemType: "multiplicacion", nivel: 1, a, b: 4, symbol: "×", answer: a * 4 };
    }
    case "divisibilidad-por-3": {
      // El enunciado ya viene con la suma de dígitos hecha (la técnica),
      // así que la práctica refuerza el paso final: dividir con
      // confianza sabiendo de antemano que da exacto.
      const cociente = randomInt(20, 300);
      const a = cociente * 3;
      return { problemType: "division", nivel: 1, a, b: 3, symbol: "÷", answer: cociente };
    }
    case "dividir-por-5": {
      const a = randomInt(4, 79) * 5; // múltiplo de 5 para un resultado exacto
      return { problemType: "division", nivel: 1, a, b: 5, symbol: "÷", answer: a / 5 };
    }
    // Las 3 técnicas de acá abajo son de Decimales/Potencias (Fase ZZ) —
    // no tienen su propio problemType en Problem (solo cubre las 4
    // operaciones), así que reusan "division"/"multiplicacion" como
    // etiqueta interna sin efecto real: esta práctica guiada nunca
    // manda problem_type a /api/attempts, solo compara la respuesta acá.
    case "convertir-fraccion-decimal": {
      const denominadores = [2, 4, 5, 10];
      const den = denominadores[randomInt(0, 3)];
      const num = randomInt(1, den - 1);
      return { problemType: "division", nivel: 1, a: num, b: den, symbol: "÷", answer: Math.round((num / den) * 100) / 100 };
    }
    case "porcentaje-como-decimal": {
      const base = randomInt(2, 10) * 20;
      const porcentaje = randomInt(1, 10) * 10;
      return { problemType: "multiplicacion", nivel: 1, a: base, b: porcentaje, symbol: "×", answer: Math.round((porcentaje / 100) * base) };
    }
    case "potencia-como-multiplicacion-repetida": {
      const base = randomInt(2, 6);
      return { problemType: "multiplicacion", nivel: 1, a: base, b: 3, symbol: "×", answer: base ** 3 };
    }
    default:
      return generarSuma(1);
  }
}
