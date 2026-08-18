import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType } from "@/types/database";
import { mulberry32 } from "@/lib/rng";

export interface ProblemaReto {
  problemType: ArithmeticProblemType;
  a: number;
  b: number;
  symbol: "+" | "−" | "×" | "÷";
  answer: number;
}

function hashFecha(fecha: string): number {
  let h = 0;
  for (let i = 0; i < fecha.length; i++) {
    h = (Math.imul(31, h) + fecha.charCodeAt(i)) | 0;
  }
  return h;
}

function randomIntRng(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generarConRng(tipo: ArithmeticProblemType, rng: () => number): ProblemaReto {
  if (tipo === "suma") {
    const a = randomIntRng(rng, 20, 200);
    const b = randomIntRng(rng, 20, 200);
    return { problemType: tipo, a, b, symbol: "+", answer: a + b };
  }
  if (tipo === "resta") {
    let a = randomIntRng(rng, 20, 200);
    let b = randomIntRng(rng, 20, 200);
    if (b > a) [a, b] = [b, a];
    return { problemType: tipo, a, b, symbol: "−", answer: a - b };
  }
  if (tipo === "multiplicacion") {
    const a = randomIntRng(rng, 3, 15);
    const b = randomIntRng(rng, 3, 15);
    return { problemType: tipo, a, b, symbol: "×", answer: a * b };
  }
  const divisor = randomIntRng(rng, 2, 12);
  const cociente = randomIntRng(rng, 2, 15);
  return { problemType: tipo, a: divisor * cociente, b: divisor, symbol: "÷", answer: cociente };
}

function claveReto(p: ProblemaReto): string {
  return `${p.problemType}:${p.a}${p.symbol}${p.b}`;
}

// fechaIso: "YYYY-MM-DD". Se puede llamar tanto en el servidor como en
// el cliente — determinístico, siempre da lo mismo para la misma fecha.
// Los 5 problemas nunca se repiten entre sí: si el rng saca uno ya
// usado, se vuelve a tirar del MISMO stream determinístico (nunca
// Math.random) hasta 20 veces antes de permitir un repetido — sigue
// dando exactamente lo mismo para todos los que entran ese día.
export function generarRetoDelDia(fechaIso: string): ProblemaReto[] {
  const rng = mulberry32(hashFecha(fechaIso));
  const usados = new Set<string>();
  const problemas: ProblemaReto[] = [];
  const MAX_INTENTOS = 20;
  for (let i = 0; i < 5; i++) {
    let intento: ProblemaReto | null = null;
    for (let intentos = 0; intentos < MAX_INTENTOS; intentos++) {
      const tipo = ARITHMETIC_PROBLEM_TYPES[Math.floor(rng() * ARITHMETIC_PROBLEM_TYPES.length)];
      intento = generarConRng(tipo, rng);
      if (!usados.has(claveReto(intento))) break;
    }
    usados.add(claveReto(intento!));
    problemas.push(intento!);
  }
  return problemas;
}
