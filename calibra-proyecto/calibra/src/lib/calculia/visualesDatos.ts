// Cálculos puros de los visuales de Calculia (sin React): así se testean
// contra un cálculo independiente y los componentes solo dibujan. Mismo
// patrón que src/lib/naipia/visualesDatos.ts y
// src/lib/trigonometria/visualesDatos.ts.
import type { TerminoFuncionCalculia, VisualCalculiaArea, VisualCalculiaEdo, VisualCalculiaSerie, VisualCalculiaTangente } from "./visuales";

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

function redondear4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function esTerminoFuncionCalculia(v: unknown): v is TerminoFuncionCalculia {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.tipo === "potencia") return typeof o.c === "number" && typeof o.n === "number" && Number.isFinite(o.c) && Number.isFinite(o.n);
  if (o.tipo === "factorLineal") {
    return [o.c, o.a, o.b, o.n].every((x) => typeof x === "number" && Number.isFinite(x)) && (o.a as number) !== 0;
  }
  return false;
}

export function esFuncionCalculia(v: unknown): v is TerminoFuncionCalculia[] {
  return Array.isArray(v) && v.length > 0 && v.every(esTerminoFuncionCalculia);
}

// ---------- Evaluación, derivada y antiderivada (fórmula, nunca parseo) ----------

export function evaluarTermino(t: TerminoFuncionCalculia, x: number): number {
  if (t.tipo === "potencia") return t.c * Math.pow(x, t.n);
  return t.c * Math.pow(t.a * x + t.b, t.n);
}

export function evaluarFuncion(fn: TerminoFuncionCalculia[], x: number): number {
  return fn.reduce((s, t) => s + evaluarTermino(t, x), 0);
}

// Regla de la potencia (c·x^n -> c·n·x^(n-1)) y regla de la cadena
// (c·(ax+b)^n -> c·n·a·(ax+b)^(n-1)) — exactamente las mismas fórmulas que
// derivadaPotencia/derivadaCadena de src/lib/practica/calculia.ts.
export function derivarTermino(t: TerminoFuncionCalculia): TerminoFuncionCalculia {
  if (t.tipo === "potencia") return { tipo: "potencia", c: t.c * t.n, n: t.n - 1 };
  return { tipo: "factorLineal", c: t.c * t.n * t.a, a: t.a, b: t.b, n: t.n - 1 };
}

export function derivarFuncion(fn: TerminoFuncionCalculia[]): TerminoFuncionCalculia[] {
  return fn.map(derivarTermino);
}

// Regla de la potencia al revés (c·x^n -> c/(n+1)·x^(n+1)) y su versión con
// sustitución simple (c·(ax+b)^n -> c/(a(n+1))·(ax+b)^(n+1)) — mismas
// fórmulas que integralPotencia/integralSustitucionSimple. n=-1 no está
// soportado (no se usa en ningún visual real: ningún término de Calculia
// integra 1/x con este primitivo).
export function antiderivadaTermino(t: TerminoFuncionCalculia): TerminoFuncionCalculia {
  if (t.n === -1) throw new Error("antiderivadaTermino: n=-1 no soportado");
  if (t.tipo === "potencia") return { tipo: "potencia", c: t.c / (t.n + 1), n: t.n + 1 };
  return { tipo: "factorLineal", c: t.c / (t.a * (t.n + 1)), a: t.a, b: t.b, n: t.n + 1 };
}

export function antiderivadaFuncion(fn: TerminoFuncionCalculia[]): TerminoFuncionCalculia[] {
  return fn.map(antiderivadaTermino);
}

// Área definida exacta = F(hasta) - F(desde), con F la antiderivada simbólica.
export function areaExacta(fn: TerminoFuncionCalculia[], desde: number, hasta: number): number {
  const F = antiderivadaFuncion(fn);
  return evaluarFuncion(F, hasta) - evaluarFuncion(F, desde);
}

// ---------- Geometría del visual "tangente" ----------

export interface DatosTangente {
  funcion: TerminoFuncionCalculia[];
  derivada: TerminoFuncionCalculia[];
  x0: number;
  y0: number;
  pendiente: number;
  rango: [number, number];
  // Puntos de la curva, ya redondeados a 2 decimales (evita diferencias de
  // punto flotante entre Node y el navegador en el `path` del SVG).
  curva: { x: number; y: number }[];
  // Dos puntos de la secante intermedia (h más grande) y otra más cerca
  // (h más chico), en orden de animación hacia la tangente.
  secante1: { x1: number; y1: number; x2: number; y2: number };
  secante2: { x1: number; y1: number; x2: number; y2: number };
}

const MUESTRAS_CURVA = 40;

export function datosTangente(v: VisualCalculiaTangente): DatosTangente {
  const funcion = v.funcion;
  const derivada = derivarFuncion(funcion);
  const x0 = v.x0;
  const y0 = redondear2(evaluarFuncion(funcion, x0));
  const pendiente = redondear2(evaluarFuncion(derivada, x0));

  let rango: [number, number];
  if (v.rango && v.rango.length === 2 && v.rango[0] < v.rango[1]) {
    rango = v.rango;
  } else {
    const ancho = Math.max(2, Math.abs(x0) * 0.6 + 1.5);
    rango = [x0 - ancho, x0 + ancho];
  }
  const [xMin, xMax] = rango;
  const paso = (xMax - xMin) / MUESTRAS_CURVA;
  const curva: { x: number; y: number }[] = [];
  for (let i = 0; i <= MUESTRAS_CURVA; i++) {
    const x = redondear2(xMin + paso * i);
    curva.push({ x, y: redondear2(evaluarFuncion(funcion, x)) });
  }

  const anchoDominio = xMax - xMin;
  const h1 = anchoDominio * 0.22;
  const h2 = anchoDominio * 0.08;
  const puntoSecante = (h: number) => {
    // El punto secante se mantiene dentro del dominio dibujado.
    const signo = x0 + h <= xMax ? 1 : -1;
    const x2 = x0 + signo * h;
    return { x1: x0, y1: y0, x2: redondear2(x2), y2: redondear2(evaluarFuncion(funcion, x2)) };
  };

  return { funcion, derivada, x0, y0, pendiente, rango, curva, secante1: puntoSecante(h1), secante2: puntoSecante(h2) };
}

// ---------- Geometría del visual "área" ----------

export interface DatosArea {
  funcion: TerminoFuncionCalculia[];
  desde: number;
  hasta: number;
  area: number;
  rango: [number, number];
  curva: { x: number; y: number }[];
  // Borde superior de la región rellena: muestreo de f desde EXACTAMENTE
  // `desde` hasta EXACTAMENTE `hasta` (la `curva` de arriba tiene margen y
  // sus puntos no caen justo en los extremos).
  relleno: { x: number; y: number }[];
  // Rectángulos de Riemann (regla del punto medio) en dos resoluciones,
  // que se afinan de una a la otra antes del relleno exacto.
  rectangulos4: { x: number; ancho: number; alto: number }[];
  rectangulos12: { x: number; ancho: number; alto: number }[];
}

export function rectangulosPuntoMedio(fn: TerminoFuncionCalculia[], desde: number, hasta: number, cantidad: number): { x: number; ancho: number; alto: number }[] {
  const ancho = (hasta - desde) / cantidad;
  const rects: { x: number; ancho: number; alto: number }[] = [];
  for (let i = 0; i < cantidad; i++) {
    const x = desde + ancho * i;
    const medio = x + ancho / 2;
    // 4 decimales (no 2): con 12 rectángulos, redondear el ancho a 2 decimales
    // los desalinearía entre sí y con el eje (2/12 ≈ 0.17).
    rects.push({ x: redondear4(x), ancho: redondear4(ancho), alto: redondear4(evaluarFuncion(fn, medio)) });
  }
  return rects;
}

export function datosArea(v: VisualCalculiaArea): DatosArea {
  const { funcion, desde, hasta } = v;
  const area = redondear2(areaExacta(funcion, desde, hasta));
  const margen = (hasta - desde) * 0.15;
  const rango: [number, number] = [desde - margen, hasta + margen];
  const paso = (rango[1] - rango[0]) / MUESTRAS_CURVA;
  const curva: { x: number; y: number }[] = [];
  for (let i = 0; i <= MUESTRAS_CURVA; i++) {
    const x = redondear2(rango[0] + paso * i);
    curva.push({ x, y: redondear2(evaluarFuncion(funcion, x)) });
  }
  const relleno: { x: number; y: number }[] = [];
  for (let i = 0; i <= MUESTRAS_CURVA; i++) {
    const x = desde + ((hasta - desde) * i) / MUESTRAS_CURVA;
    relleno.push({ x: redondear2(x), y: redondear2(evaluarFuncion(funcion, x)) });
  }
  return {
    funcion,
    desde,
    hasta,
    area,
    rango,
    curva,
    relleno,
    rectangulos4: rectangulosPuntoMedio(funcion, desde, hasta, 4),
    rectangulos12: rectangulosPuntoMedio(funcion, desde, hasta, 12),
  };
}

// ---------- Series: sumas parciales ----------

// Suma de los primeros n términos: a + ar + ar² + ... + ar^(n-1) (n>=0).
// Iterativa (no usa la fórmula cerrada) para que sea un cálculo
// independiente de la fórmula cerrada que también se expone abajo.
export function sumaParcial(a: number, r: number, n: number): number {
  let s = 0;
  let termino = a;
  for (let i = 0; i < n; i++) {
    s += termino;
    termino *= r;
  }
  return s;
}

// Fórmula cerrada S_n = a(1-r^n)/(1-r) (r != 1) — se expone para que el test
// la contraste contra la suma iterativa de arriba.
export function sumaParcialCerrada(a: number, r: number, n: number): number {
  if (r === 1) return a * n;
  return (a * (1 - Math.pow(r, n))) / (1 - r);
}

export function sumaInfinita(a: number, r: number): number {
  return a / (1 - r);
}

export interface DatosSerie {
  a: number;
  r: number;
  converge: boolean;
  sumaInfinita: number | null;
  // Suma parcial después de cada uno de los `terminos` términos.
  parciales: number[];
  terminoValores: number[];
}

export function datosSerie(v: VisualCalculiaSerie): DatosSerie {
  const { a, rNum, rDen, terminos } = v;
  const r = rNum / rDen;
  const converge = Math.abs(r) < 1;
  const n = Math.min(12, Math.max(2, Math.round(terminos)));
  const parciales: number[] = [];
  const terminoValores: number[] = [];
  let termino = a;
  let acumulado = 0;
  for (let i = 0; i < n; i++) {
    acumulado += termino;
    parciales.push(redondear2(acumulado));
    terminoValores.push(redondear2(termino));
    termino *= r;
  }
  return { a, r, converge, sumaInfinita: converge ? redondear2(sumaInfinita(a, r)) : null, parciales, terminoValores };
}

// ---------- Validadores de los tres visuales (defensa en los componentes) ----------

export function esVisualCalculiaTangente(v: unknown): v is VisualCalculiaTangente {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.tipo !== "calculia.tangente") return false;
  if (!esFuncionCalculia(o.funcion)) return false;
  if (typeof o.x0 !== "number" || !Number.isFinite(o.x0)) return false;
  if (o.rango !== undefined) {
    if (!Array.isArray(o.rango) || o.rango.length !== 2) return false;
    const [a, b] = o.rango as unknown[];
    if (typeof a !== "number" || typeof b !== "number" || !(a < b)) return false;
  }
  return true;
}

export function esVisualCalculiaArea(v: unknown): v is VisualCalculiaArea {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.tipo !== "calculia.area") return false;
  if (!esFuncionCalculia(o.funcion)) return false;
  if (typeof o.desde !== "number" || typeof o.hasta !== "number") return false;
  if (!(o.desde < o.hasta)) return false;
  if (o.funcion.some((t: TerminoFuncionCalculia) => t.n === -1)) return false;
  return true;
}

export function esVisualCalculiaSerie(v: unknown): v is VisualCalculiaSerie {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.tipo !== "calculia.serie") return false;
  if (typeof o.a !== "number" || o.a === 0) return false;
  if (typeof o.rNum !== "number" || typeof o.rDen !== "number" || o.rDen === 0) return false;
  if (typeof o.terminos !== "number" || !Number.isInteger(o.terminos) || o.terminos < 2) return false;
  return true;
}

// ---------- EDO separable: familia de soluciones ----------

// Solución de dy/dx = k·x^n·y por separación de variables:
//   dy/y = k·x^n dx  ->  ln|y| = k/(n+1)·x^(n+1) + C1  ->  y = A·e^{k/(n+1)·x^(n+1)}.
export function solucionEdo(k: number, n: number, A: number, x: number): number {
  return A * Math.exp((k / (n + 1)) * Math.pow(x, n + 1));
}

// Lo que dice la ecuación diferencial: la pendiente en (x, y) es k·x^n·y.
export function pendienteSegunEdo(k: number, n: number, x: number, y: number): number {
  return k * Math.pow(x, n) * y;
}

export const CONSTANTES_EDO = [0.5, 1, 2] as const;

export interface DatosEdo {
  k: number;
  n: number;
  x0: number;
  rango: [number, number];
  // Una curva por constante A de CONSTANTES_EDO.
  curvas: { A: number; puntos: { x: number; y: number }[] }[];
  // Punto y pendiente sobre la curva con A = 1.
  y0: number;
  pendiente: number;
  // Segmento de recta tangente (corto) en (x0, y0).
  tangente: { x1: number; y1: number; x2: number; y2: number };
}

export function datosEdo(v: VisualCalculiaEdo): DatosEdo {
  const { k, n, x0 } = v;
  const rango: [number, number] = v.rango && v.rango[0] < v.rango[1] ? v.rango : [-1.2, 1.2];
  const paso = (rango[1] - rango[0]) / MUESTRAS_CURVA;
  const curvas = CONSTANTES_EDO.map((A) => {
    const puntos: { x: number; y: number }[] = [];
    for (let i = 0; i <= MUESTRAS_CURVA; i++) {
      const x = redondear2(rango[0] + paso * i);
      puntos.push({ x, y: redondear2(solucionEdo(k, n, A, x)) });
    }
    return { A, puntos };
  });
  const yExacto = solucionEdo(k, n, 1, x0);
  const pendienteExacta = pendienteSegunEdo(k, n, x0, yExacto);
  const medio = (rango[1] - rango[0]) * 0.12;
  const yEn = (x: number) => yExacto + pendienteExacta * (x - x0);
  return {
    k,
    n,
    x0,
    rango,
    curvas,
    y0: redondear2(yExacto),
    pendiente: redondear2(pendienteExacta),
    tangente: { x1: redondear2(x0 - medio), y1: redondear2(yEn(x0 - medio)), x2: redondear2(x0 + medio), y2: redondear2(yEn(x0 + medio)) },
  };
}

export function esVisualCalculiaEdo(v: unknown): v is VisualCalculiaEdo {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.tipo !== "calculia.edo") return false;
  if (typeof o.k !== "number" || !Number.isInteger(o.k) || o.k === 0) return false;
  if (typeof o.n !== "number" || !Number.isInteger(o.n) || o.n < 0 || o.n > 4) return false;
  if (typeof o.x0 !== "number" || !Number.isFinite(o.x0)) return false;
  let rango: [number, number] = [-1.2, 1.2];
  if (o.rango !== undefined) {
    if (!Array.isArray(o.rango) || o.rango.length !== 2) return false;
    const [a, b] = o.rango as unknown[];
    if (typeof a !== "number" || typeof b !== "number" || !(a < b)) return false;
    rango = [a, b];
  }
  // Que exp() no se dispare (el visual se dibujaría plano/inservible).
  const tope = Math.max(Math.abs(rango[0]), Math.abs(rango[1]), Math.abs(o.x0));
  return Math.abs((o.k / (o.n + 1)) * Math.pow(tope, o.n + 1)) <= 6;
}
