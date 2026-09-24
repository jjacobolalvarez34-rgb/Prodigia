import { frac, mcd, type Frac } from "./fracciones";

// Números de la forma signo · (n/d) · √m con m libre de cuadrados, para los
// valores exactos que NO viven en Q(√2, √3): por ejemplo, si sen θ = 1/3 en el
// primer cuadrante, cos θ = 2√2/3 y tan θ = √2/4. Sirven para los problemas
// "dado sen θ y el cuadrante, halla cos θ o tan θ" (círculo, nivel alto).

export interface Radical {
  signo: 1 | -1;
  coef: Frac; // coeficiente positivo (o 0)
  m: number; // libre de cuadrados; m = 1 significa que es racional
}

// √n = k·√m con m libre de cuadrados.
export function raizSimplificada(n: number): { k: number; m: number } {
  if (!Number.isInteger(n) || n < 0) throw new Error(`Raíz de ${n}`);
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return { k, m };
}

// signo · √n / den, simplificado.
export function radicalDe(n: number, den: number, signo: 1 | -1 = 1): Radical {
  const { k, m } = raizSimplificada(n);
  return { signo, coef: frac(k, den), m };
}

export const valorRadical = (r: Radical): number => r.signo * (r.coef.n / r.coef.d) * Math.sqrt(r.m);

export const negRadical = (r: Radical): Radical => ({ ...r, signo: (r.signo * -1) as 1 | -1 });

export function texRadical(r: Radical): string {
  if (r.coef.n === 0) return "0";
  const signo = r.signo < 0 ? "-" : "";
  const { n, d } = r.coef;
  const cuerpo = r.m === 1 ? String(n) : `${n === 1 ? "" : n}\\sqrt{${r.m}}`;
  return d === 1 ? `${signo}${cuerpo}` : `${signo}\\frac{${cuerpo}}{${d}}`;
}

export function planoRadical(r: Radical): string {
  if (r.coef.n === 0) return "0";
  const signo = r.signo < 0 ? "-" : "";
  const { n, d } = r.coef;
  const cuerpo = r.m === 1 ? String(n) : `${n === 1 ? "" : n}√${r.m}`;
  return d === 1 ? `${signo}${cuerpo}` : `${signo}${cuerpo}/${d}`;
}

// Valor absoluto de cos θ y de tan θ cuando |sen θ| = p/q (0 < p < q): el resto
// (el signo) lo decide el cuadrante.
export function cosYTanDesdeSeno(p: number, q: number): { cos: Radical; tan: Radical } {
  if (!(p > 0 && p < q)) throw new Error(`sen = ${p}/${q} fuera de (0, 1)`);
  const g = mcd(p, q);
  const pp = p / g;
  const qq = q / g;
  const N = qq * qq - pp * pp;
  // cos = √N / q ; tan = p / √N = p·√N / N
  const cos = radicalDe(N, qq);
  const tan = { signo: 1 as const, coef: frac(pp * raizSimplificada(N).k, N), m: raizSimplificada(N).m };
  return { cos, tan: simplificar(tan) };
}

function simplificar(r: Radical): Radical {
  return { ...r, coef: frac(r.coef.n, r.coef.d) };
}
