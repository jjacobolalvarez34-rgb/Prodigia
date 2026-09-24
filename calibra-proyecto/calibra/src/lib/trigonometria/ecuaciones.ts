import { aNumero, frac, type Frac } from "./fracciones";
import { multiploPiTex } from "./ondas";

// Catálogo de ecuaciones trigonométricas con sus soluciones en [0, 2π) y una
// función f(x) que vale 0 exactamente en las soluciones (lado izquierdo menos
// lado derecho). Las lecciones y sus quiz toman el LaTeX y las soluciones de acá;
// ecuaciones.test.ts comprueba cada solución por SUSTITUCIÓN y que en todo el
// intervalo no exista ningún otro punto donde f se anule (barrido fino), así que
// ni una solución de más ni una de menos llega a una lección sin que un test lo note.
//
// Simplificación de nivel colegio: solo se piden las soluciones en [0, 2π); si se
// pidieran todas, cada una se acompaña de + 2πk (y en la tangente de + πk).

export interface EcuacionTrig {
  id: string;
  tex: string; // sin $
  f: (x: number) => number;
  // Soluciones exactas, en múltiplos de π, en orden creciente.
  soluciones: Frac[];
}

const S = Math.sin;
const C = Math.cos;
const T = Math.tan;
const SEN = "\\operatorname{sen}";
const p = (n: number, d = 1): Frac => frac(n, d);

export const ECUACIONES: EcuacionTrig[] = [
  { id: "sen-un-medio", tex: `${SEN}(x)=\\dfrac{1}{2}`, f: (x) => S(x) - 0.5, soluciones: [p(1, 6), p(5, 6)] },
  { id: "cos-menos-raiz2-medio", tex: `2\\cos(x)+\\sqrt{2}=0`, f: (x) => 2 * C(x) + Math.SQRT2, soluciones: [p(3, 4), p(5, 4)] },
  { id: "tan-menos-uno", tex: `\\tan(x)=-1`, f: (x) => (Math.abs(C(x)) < 1e-9 ? NaN : T(x) + 1), soluciones: [p(3, 4), p(7, 4)] },
  { id: "sen-menos-raiz3-medio", tex: `${SEN}(x)=-\\dfrac{\\sqrt{3}}{2}`, f: (x) => S(x) + Math.sqrt(3) / 2, soluciones: [p(4, 3), p(5, 3)] },
  { id: "cos-cero", tex: `\\cos(x)=0`, f: (x) => C(x), soluciones: [p(1, 2), p(3, 2)] },
  { id: "sen-uno", tex: `${SEN}(x)=1`, f: (x) => S(x) - 1, soluciones: [p(1, 2)] },
  { id: "cos-un-medio", tex: `\\cos(x)=\\dfrac{1}{2}`, f: (x) => C(x) - 0.5, soluciones: [p(1, 3), p(5, 3)] },
  { id: "sen2-un-cuarto", tex: `${SEN}^{2}(x)=\\dfrac{1}{4}`, f: (x) => S(x) ** 2 - 0.25, soluciones: [p(1, 6), p(5, 6), p(7, 6), p(11, 6)] },
  { id: "tan-raiz3", tex: `\\tan(x)=\\sqrt{3}`, f: (x) => (Math.abs(C(x)) < 1e-9 ? NaN : T(x) - Math.sqrt(3)), soluciones: [p(1, 3), p(4, 3)] },
  // con factorización
  { id: "fact-sen-cos", tex: `${SEN}(x)\\cos(x)=0`, f: (x) => S(x) * C(x), soluciones: [p(0), p(1, 2), p(1), p(3, 2)] },
  { id: "fact-cuadratica-sen", tex: `2\\,${SEN}^{2}(x)+${SEN}(x)-1=0`, f: (x) => 2 * S(x) ** 2 + S(x) - 1, soluciones: [p(1, 6), p(5, 6), p(3, 2)] },
  { id: "fact-cuadratica-cos", tex: `2\\cos^{2}(x)-\\cos(x)-1=0`, f: (x) => 2 * C(x) ** 2 - C(x) - 1, soluciones: [p(0), p(2, 3), p(4, 3)] },
  { id: "fact-sen-x-menos-tres", tex: `${SEN}^{2}(x)-\\dfrac{3}{4}=0`, f: (x) => S(x) ** 2 - 0.75, soluciones: [p(1, 3), p(2, 3), p(4, 3), p(5, 3)] },
  // con identidades
  { id: "id-doble-sen", tex: `${SEN}(2x)=${SEN}(x)`, f: (x) => S(2 * x) - S(x), soluciones: [p(0), p(1, 3), p(1), p(5, 3)] },
  { id: "id-doble-cos", tex: `\\cos(2x)=\\cos(x)`, f: (x) => C(2 * x) - C(x), soluciones: [p(0), p(2, 3), p(4, 3)] },
  { id: "id-pitagorica", tex: `2\\cos^{2}(x)+3\\,${SEN}(x)=3`, f: (x) => 2 * C(x) ** 2 + 3 * S(x) - 3, soluciones: [p(1, 6), p(1, 2), p(5, 6)] },
  { id: "id-tan-sen", tex: `\\tan(x)\\cos(x)=\\dfrac{1}{2}`, f: (x) => T(x) * C(x) - 0.5, soluciones: [p(1, 6), p(5, 6)] },
];

export function ecuacion(id: string): EcuacionTrig {
  const e = ECUACIONES.find((x) => x.id === id);
  if (!e) throw new Error(`Ecuación ${id} inexistente`);
  return e;
}

export const solucionesTex = (e: EcuacionTrig): string => e.soluciones.map(multiploPiTex).join(",\\ ");
export const solucionesRad = (e: EcuacionTrig): number[] => e.soluciones.map((s) => aNumero(s) * Math.PI);

// Soluciones de fn(x) = k para k numérico (resolución con la función inversa), en [0, 2π).
export function solucionesConInversa(fn: "sen" | "cos" | "tan", k: number): number[] {
  if (fn === "sen") {
    if (Math.abs(k) > 1) return [];
    const a = Math.asin(k);
    const r = [a < 0 ? a + 2 * Math.PI : a, Math.PI - a];
    return [...new Set(r.map((x) => Math.round(((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 1e9) / 1e9))].sort((x, y) => x - y);
  }
  if (fn === "cos") {
    if (Math.abs(k) > 1) return [];
    const a = Math.acos(k);
    return [...new Set([a, 2 * Math.PI - a].map((x) => Math.round(x * 1e9) / 1e9))].sort((x, y) => x - y);
  }
  const a = Math.atan(k);
  const p1 = a < 0 ? a + Math.PI : a;
  return [p1, p1 + Math.PI];
}
