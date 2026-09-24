import { CERO, UNO, divF, frac, igualF, mcm, mulF, negF, restaF, sumaF, esCeroF, type Frac } from "./fracciones";

// Valores exactos de sen/cos/tan/cosec/sec/cot para los ángulos múltiplos de
// 15°. Todos viven en el cuerpo Q(√2, √3): números de la forma
// a + b·√2 + c·√3 + d·√6 con a, b, c, d racionales. Es un anillo cerrado bajo
// suma y producto (√2·√3 = √6, √2·√6 = 2√3, √3·√6 = 3√2), y un cuerpo (todo
// elemento no nulo tiene inverso), así que sen 75° = sen 45° cos 30° + cos 45°
// sen 30° = (√6 + √2)/4 sale de multiplicar y sumar, sin escribir a mano
// ningún valor "difícil". Solo los cinco valores base del primer cuadrante
// (0°, 30°, 45°, 60°, 90°) están escritos; los tests los contrastan con
// Math.sin/Math.cos y con una tabla curada aparte.
//
// Los decimales solo aparecen en valor() (para comparar en los tests y para
// dibujar): la igualdad entre valores exactos es exacta (igual()).

export type Exacto = readonly [Frac, Frac, Frac, Frac]; // coeficientes de 1, √2, √3, √6

const RAIZ_DE_BASE = [1, Math.SQRT2, Math.sqrt(3), Math.sqrt(6)] as const;

export function exacto(a: number, b = 0, c = 0, d = 0, den = 1): Exacto {
  return [frac(a, den), frac(b, den), frac(c, den), frac(d, den)];
}

export const EXACTO_CERO: Exacto = exacto(0);
export const EXACTO_UNO: Exacto = exacto(1);

export const sumaE = (x: Exacto, y: Exacto): Exacto => [sumaF(x[0], y[0]), sumaF(x[1], y[1]), sumaF(x[2], y[2]), sumaF(x[3], y[3])];
export const restaE = (x: Exacto, y: Exacto): Exacto => [restaF(x[0], y[0]), restaF(x[1], y[1]), restaF(x[2], y[2]), restaF(x[3], y[3])];
export const negE = (x: Exacto): Exacto => [negF(x[0]), negF(x[1]), negF(x[2]), negF(x[3])];
export const igualE = (x: Exacto, y: Exacto): boolean => x.every((c, i) => igualF(c, y[i]));
export const esCeroE = (x: Exacto): boolean => x.every(esCeroF);
export const valorE = (x: Exacto): number => x.reduce((s, c, i) => s + (c.n / c.d) * RAIZ_DE_BASE[i], 0);

// Producto de los elementos de la base: [coeficiente, índice] de (√i · √j).
const PRODUCTO_BASE: [number, number][][] = [
  [[1, 0], [1, 1], [1, 2], [1, 3]],
  [[1, 1], [2, 0], [1, 3], [2, 2]],
  [[1, 2], [1, 3], [3, 0], [3, 1]],
  [[1, 3], [2, 2], [3, 1], [6, 0]],
];

export function mulE(x: Exacto, y: Exacto): Exacto {
  const r: Frac[] = [CERO, CERO, CERO, CERO];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const [k, idx] = PRODUCTO_BASE[i][j];
      r[idx] = sumaF(r[idx], mulF(mulF(x[i], y[j]), frac(k)));
    }
  }
  return [r[0], r[1], r[2], r[3]];
}

// Inverso multiplicativo: se resuelve x·y = 1 como sistema lineal 4x4 con
// fracciones (eliminación de Gauss-Jordan), sin decimales.
export function invE(y: Exacto): Exacto {
  if (esCeroE(y)) throw new Error("Inverso de cero");
  // columna j de la matriz = y · e_j
  const columnas = [0, 1, 2, 3].map((j) => {
    const ej: Exacto = [j === 0 ? UNO : CERO, j === 1 ? UNO : CERO, j === 2 ? UNO : CERO, j === 3 ? UNO : CERO];
    return mulE(y, ej);
  });
  const M: Frac[][] = [0, 1, 2, 3].map((i) => [...columnas.map((c) => c[i]), i === 0 ? UNO : CERO]);
  for (let col = 0; col < 4; col++) {
    let piv = col;
    while (piv < 4 && esCeroF(M[piv][col])) piv++;
    if (piv === 4) throw new Error("Matriz singular");
    [M[col], M[piv]] = [M[piv], M[col]];
    const p = M[col][col];
    M[col] = M[col].map((v) => divF(v, p));
    for (let r = 0; r < 4; r++) {
      if (r === col || esCeroF(M[r][col])) continue;
      const f = M[r][col];
      M[r] = M[r].map((v, k) => restaF(v, mulF(f, M[col][k])));
    }
  }
  return [M[0][4], M[1][4], M[2][4], M[3][4]];
}

export const divE = (x: Exacto, y: Exacto): Exacto => mulE(x, invE(y));

// ---------- Formato ----------
// Orden de los términos: entero, √6, √3, √2 (así sale "2+\sqrt{3}" y
// "\frac{\sqrt{6}+\sqrt{2}}{4}", que es como los escriben los libros).
const ORDEN_TERMINOS = [0, 3, 2, 1] as const;
const RAIZ_TEXTO = ["", "2", "3", "6"];
const RAIZ_POR_INDICE = [1, 2, 3, 6];

interface Terminos {
  enteros: number[]; // por ORDEN_TERMINOS
  den: number;
}

function terminosDe(x: Exacto): Terminos {
  const den = x.reduce((m, c) => (c.n === 0 ? m : mcm(m, c.d)), 1);
  return { enteros: ORDEN_TERMINOS.map((i) => (x[i].n * den) / x[i].d), den };
}

function unir(enteros: number[], tex: boolean): string {
  let s = "";
  enteros.forEach((k, pos) => {
    if (k === 0) return;
    const idx = ORDEN_TERMINOS[pos];
    const abs = Math.abs(k);
    const raiz = idx === 0 ? "" : tex ? `\\sqrt{${RAIZ_POR_INDICE[idx]}}` : `√${RAIZ_TEXTO[idx]}`;
    const cuerpo = idx === 0 ? String(abs) : abs === 1 ? raiz : tex ? `${abs}${raiz}` : `${abs}${raiz}`;
    s += k < 0 ? `-${cuerpo}` : s === "" ? cuerpo : `+${cuerpo}`;
  });
  return s === "" ? "0" : s;
}

function formato(x: Exacto, tex: boolean): string {
  if (esCeroE(x)) return "0";
  const { enteros: originales, den } = terminosDe(x);
  let enteros = originales;
  const primero = enteros.find((k) => k !== 0)!;
  const cantidad = enteros.filter((k) => k !== 0).length;
  if (den === 1) return unir(enteros, tex);
  let signo = "";
  if (primero < 0) {
    enteros = enteros.map((k) => -k);
    signo = "-";
  }
  const num = unir(enteros, tex);
  if (tex) return `${signo}\\frac{${num}}{${den}}`;
  return cantidad > 1 ? `${signo}(${num})/${den}` : `${signo}${num}/${den}`;
}

// LaTeX sin los signos de dólar: \frac{\sqrt{3}}{2}, -\frac{1}{2}, 2+\sqrt{3}.
export const texE = (x: Exacto): string => formato(x, true);
// Texto plano para lectores de pantalla y para comparar: "√3/2", "-1/2", "(√6+√2)/4".
export const planoE = (x: Exacto): string => formato(x, false);

// ---------- Funciones trigonométricas exactas (ángulos múltiplos de 15°) ----------
// Los cinco valores base del primer cuadrante (sen, cos).
const BASE_PRIMER_CUADRANTE: Record<number, [Exacto, Exacto]> = {
  0: [exacto(0), exacto(1)],
  30: [exacto(1, 0, 0, 0, 2), exacto(0, 0, 1, 0, 2)],
  45: [exacto(0, 1, 0, 0, 2), exacto(0, 1, 0, 0, 2)],
  60: [exacto(0, 0, 1, 0, 2), exacto(1, 0, 0, 0, 2)],
  90: [exacto(1), exacto(0)],
};

// sen y cos de un ángulo de referencia entre 0° y 90° (múltiplo de 15°).
function baseRef(r: number): [Exacto, Exacto] {
  if (BASE_PRIMER_CUADRANTE[r]) return BASE_PRIMER_CUADRANTE[r];
  const [s45, c45] = BASE_PRIMER_CUADRANTE[45];
  const [s30, c30] = BASE_PRIMER_CUADRANTE[30];
  // 15° = 45° − 30° y 75° = 45° + 30° (fórmulas de suma y diferencia).
  if (r === 15) return [restaE(mulE(s45, c30), mulE(c45, s30)), sumaE(mulE(c45, c30), mulE(s45, s30))];
  if (r === 75) return [sumaE(mulE(s45, c30), mulE(c45, s30)), restaE(mulE(c45, c30), mulE(s45, s30))];
  throw new Error(`Ángulo de referencia sin valor exacto: ${r}°`);
}

export function normalizarGrados(g: number): number {
  return ((g % 360) + 360) % 360;
}

// Ángulo de referencia (0°–90°) de un ángulo cualquiera en grados.
export function referenciaGrados(g: number): number {
  const m = normalizarGrados(g);
  if (m <= 90) return m;
  if (m <= 180) return 180 - m;
  if (m <= 270) return m - 180;
  return 360 - m;
}

function comprobarMultiplo15(g: number): void {
  if (!Number.isInteger(g) || g % 15 !== 0) throw new Error(`Solo múltiplos de 15°: ${g}`);
}

export function senExacto(g: number): Exacto {
  comprobarMultiplo15(g);
  const m = normalizarGrados(g);
  const s = baseRef(referenciaGrados(g))[0];
  return m <= 180 ? s : negE(s);
}

export function cosExacto(g: number): Exacto {
  comprobarMultiplo15(g);
  const m = normalizarGrados(g);
  const c = baseRef(referenciaGrados(g))[1];
  return m < 90 || m > 270 ? c : m === 90 || m === 270 ? EXACTO_CERO : negE(c);
}

// null = indefinida (coseno 0).
export function tanExacto(g: number): Exacto | null {
  const c = cosExacto(g);
  return esCeroE(c) ? null : divE(senExacto(g), c);
}
export function cosecExacto(g: number): Exacto | null {
  const s = senExacto(g);
  return esCeroE(s) ? null : invE(s);
}
export function secExacto(g: number): Exacto | null {
  const c = cosExacto(g);
  return esCeroE(c) ? null : invE(c);
}
export function cotExacto(g: number): Exacto | null {
  const s = senExacto(g);
  return esCeroE(s) ? null : divE(cosExacto(g), s);
}

export type FuncionTrig = "sen" | "cos" | "tan" | "cosec" | "sec" | "cot";

export function funcionExacta(fn: FuncionTrig, g: number): Exacto | null {
  switch (fn) {
    case "sen":
      return senExacto(g);
    case "cos":
      return cosExacto(g);
    case "tan":
      return tanExacto(g);
    case "cosec":
      return cosecExacto(g);
    case "sec":
      return secExacto(g);
    case "cot":
      return cotExacto(g);
  }
}

// Evaluación numérica independiente (para tests y dibujos): Math.*.
export function funcionNumerica(fn: FuncionTrig, g: number): number {
  const r = (g * Math.PI) / 180;
  switch (fn) {
    case "sen":
      return Math.sin(r);
    case "cos":
      return Math.cos(r);
    case "tan":
      return Math.tan(r);
    case "cosec":
      return 1 / Math.sin(r);
    case "sec":
      return 1 / Math.cos(r);
    case "cot":
      return 1 / Math.tan(r);
  }
}

// Nombre de la función como operador de KaTeX en español.
export const OPERADOR_TEX: Record<FuncionTrig, string> = {
  sen: "\\operatorname{sen}",
  cos: "\\cos",
  tan: "\\tan",
  cosec: "\\operatorname{cosec}",
  sec: "\\sec",
  cot: "\\cot",
};

export const NOMBRE_PLANO: Record<FuncionTrig, string> = { sen: "sen", cos: "cos", tan: "tan", cosec: "cosec", sec: "sec", cot: "cot" };
