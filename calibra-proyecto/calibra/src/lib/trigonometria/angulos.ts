import { frac, type Frac } from "./fracciones";
import { normalizarGrados, referenciaGrados } from "./exactos";

export { normalizarGrados, referenciaGrados };

// Utilidades de ángulos: conversión grados <-> radianes como fracción de π,
// cuadrantes y ángulos coterminales. Todo con enteros: 150° = 5π/6 sale de
// reducir 150/180, no de multiplicar por 0,01745...

// Grados -> fracción de π (grados/180 reducida). 150° -> 5/6, 360° -> 2/1.
export function fraccionDePi(g: number): Frac {
  return frac(g, 180);
}

// Fracción de π -> grados. Devuelve un número exacto solo si 180·n/d es entero.
export function gradosDeFraccionPi(n: number, d: number): number {
  return (180 * n) / d;
}

// "\frac{5\pi}{6}", "\pi", "2\pi", "-\frac{\pi}{4}", "0" (sin los $).
export function radianesTex(g: number): string {
  const f = fraccionDePi(g);
  if (f.n === 0) return "0";
  const signo = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const num = n === 1 ? "\\pi" : `${n}\\pi`;
  return f.d === 1 ? `${signo}${num}` : `${signo}\\frac{${num}}{${f.d}}`;
}

// "5π/6", "π", "2π", "-π/4", "0" (texto plano).
export function radianesPlano(g: number): string {
  const f = fraccionDePi(g);
  if (f.n === 0) return "0";
  const signo = f.n < 0 ? "-" : "";
  const n = Math.abs(f.n);
  const num = n === 1 ? "π" : `${n}π`;
  return f.d === 1 ? `${signo}${num}` : `${signo}${num}/${f.d}`;
}

export const gradosTex = (g: number): string => `${g}^{\\circ}`;
export const gradosPlano = (g: number): string => `${g}°`;

// Cuadrante (1 a 4) de un ángulo en posición estándar; null si cae sobre un eje.
export function cuadranteDe(g: number): 1 | 2 | 3 | 4 | null {
  const m = normalizarGrados(g);
  if (m % 90 === 0) return null;
  if (m < 90) return 1;
  if (m < 180) return 2;
  if (m < 270) return 3;
  return 4;
}

// Todos los ángulos coterminales con `g` dentro de [min, max], en pasos de 360°.
export function coterminalesEn(g: number, min: number, max: number): number[] {
  const base = normalizarGrados(g);
  const r: number[] = [];
  for (let x = base + 360 * Math.ceil((min - base) / 360); x <= max; x += 360) r.push(x);
  return r;
}

// Ángulo positivo menor que 360° coterminal con g.
export const coterminalPrincipal = (g: number): number => normalizarGrados(g);
