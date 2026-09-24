// Resolución de triángulos con funciones puras (sin azar, sin redondear salvo
// donde se pide). La práctica (src/lib/practica/trigonometria*.ts) y los
// visuales dibujan SIEMPRE a partir de estas funciones, y los tests las
// contrastan con un cálculo independiente (Pitágoras, suma de ángulos = 180°,
// la fórmula de Herón para el área).
//
// Convención de todo el mundo: el lado a es opuesto al ángulo A, b a B y c a C.
// En los triángulos rectángulos el ángulo recto está en C (c es la hipotenusa).

export const aRad = (g: number): number => (g * Math.PI) / 180;
export const aGrados = (r: number): number => (r * 180) / Math.PI;

export function redondear(x: number, decimales: number): number {
  const f = 10 ** decimales;
  // toPrecision(12) quita el ruido de coma flotante antes de redondear (1,005 · 100 = 100,49999...).
  return Math.round(Number((x * f).toPrecision(12))) / f;
}

// ---------- Triángulo rectángulo (ángulo recto en C) ----------
export interface Rectangulo {
  a: number; // cateto opuesto a A
  b: number; // cateto opuesto a B (adyacente a A)
  c: number; // hipotenusa
  A: number; // grados
  B: number; // grados
}

export function rectanguloDeCatetos(a: number, b: number): Rectangulo {
  const A = aGrados(Math.atan2(a, b));
  return { a, b, c: Math.hypot(a, b), A, B: 90 - A };
}

// Se conoce el ángulo A (grados) y un lado: "a" (opuesto), "b" (adyacente) o "c" (hipotenusa).
export function rectanguloDeAnguloYLado(A: number, lado: "a" | "b" | "c", valor: number): Rectangulo {
  const s = Math.sin(aRad(A));
  const co = Math.cos(aRad(A));
  const t = Math.tan(aRad(A));
  let a: number;
  let b: number;
  let c: number;
  if (lado === "c") {
    c = valor;
    a = c * s;
    b = c * co;
  } else if (lado === "a") {
    a = valor;
    c = a / s;
    b = a / t;
  } else {
    b = valor;
    c = b / co;
    a = b * t;
  }
  return { a, b, c, A, B: 90 - A };
}

// Ángulo agudo (grados) con el seno / coseno / tangente dados.
const entreMenos1y1 = (x: number): number => Math.max(-1, Math.min(1, x));
export const arcoSeno = (x: number): number => aGrados(Math.asin(entreMenos1y1(x)));
export const arcoCoseno = (x: number): number => aGrados(Math.acos(entreMenos1y1(x)));
export const arcoTangente = (x: number): number => aGrados(Math.atan(x));

// ---------- Triángulo oblicuo ----------
export interface Oblicuo {
  a: number;
  b: number;
  c: number;
  A: number; // grados
  B: number;
  C: number;
}

// SAS: dos lados y el ángulo entre ellos (ley del coseno).
export function oblicuoSAS(a: number, b: number, C: number): Oblicuo {
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(aRad(C)));
  // Los ángulos salen de la ley del coseno también (no de asin, que confunde un ángulo obtuso con su suplementario).
  const A = arcoCoseno((b * b + c * c - a * a) / (2 * b * c));
  return { a, b, c, A, B: 180 - A - C, C };
}

// SSS: los tres lados (ley del coseno para cada ángulo).
export function oblicuoSSS(a: number, b: number, c: number): Oblicuo {
  if (!(a + b > c && a + c > b && b + c > a)) throw new Error(`No es un triángulo: ${a}, ${b}, ${c}`);
  const A = arcoCoseno((b * b + c * c - a * a) / (2 * b * c));
  const B = arcoCoseno((a * a + c * c - b * b) / (2 * a * c));
  return { a, b, c, A, B, C: 180 - A - B };
}

// ASA / AAS: dos ángulos y el lado a (opuesto a A). Ley del seno.
export function oblicuoAAS(A: number, B: number, a: number): Oblicuo {
  const C = 180 - A - B;
  if (C <= 0) throw new Error(`Ángulos que suman ${A + B}° o más`);
  const k = a / Math.sin(aRad(A));
  return { a, b: k * Math.sin(aRad(B)), c: k * Math.sin(aRad(C)), A, B, C };
}

// Área = ½ · a · b · sen C.
export const areaSAS = (a: number, b: number, C: number): number => 0.5 * a * b * Math.sin(aRad(C));

// Fórmula de Herón (cálculo independiente para contrastar el área).
export function areaHeron(a: number, b: number, c: number): number {
  const s = (a + b + c) / 2;
  return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}

// ---------- Caso ambiguo (SSA): se conocen a, b y el ángulo A (opuesto a a) ----------
export function solucionesSSA(a: number, b: number, A: number): Oblicuo[] {
  const senB = (b * Math.sin(aRad(A))) / a;
  if (senB > 1 + 1e-12) return [];
  const B1 = Math.abs(senB - 1) < 1e-9 ? 90 : arcoSeno(senB);
  const candidatos = Math.abs(B1 - 90) < 1e-9 ? [B1] : [B1, 180 - B1];
  const r: Oblicuo[] = [];
  for (const B of candidatos) {
    const C = 180 - A - B;
    if (C > 1e-9) r.push({ a, b, c: (a * Math.sin(aRad(C))) / Math.sin(aRad(A)), A, B, C });
  }
  return r;
}

// Cuántos triángulos hay con esos datos, por la regla geométrica de la altura
// h = b·sen A (cálculo independiente de solucionesSSA).
export function cantidadSSA(a: number, b: number, A: number): 0 | 1 | 2 {
  const h = b * Math.sin(aRad(A));
  const eps = 1e-9;
  if (A >= 90 - eps) return a > b + eps ? 1 : 0;
  if (a < h - eps) return 0;
  if (Math.abs(a - h) <= eps) return 1;
  if (a >= b - eps) return 1;
  return 2;
}
