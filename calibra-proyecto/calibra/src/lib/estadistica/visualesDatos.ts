// Cálculos puros de los visuales de Estadística (sin React): así se
// testean contra un cálculo independiente y los componentes solo dibujan.
// Reusa las mismas funciones de estadística descriptiva que
// src/lib/practica/estadistica.ts (vía util.ts) para que un visual nunca
// pueda mostrar un número distinto del que la práctica considera correcto.
import { cuartilesMitades, medianaOrdenada, ordenar, redondear2, suma } from "./util";
import type { GraficoEstadistica } from "./tipos";

// ---------- Ordenar + mediana ----------

export interface OrdenMediana {
  ordenados: number[];
  mediana: number;
  // Índices (en `ordenados`) del valor central (n impar: uno solo; n par:
  // los dos centrales, cuyo promedio es la mediana).
  indicesMediana: number[];
}

export function ordenarYMediana(datos: readonly number[]): OrdenMediana {
  const ordenados = ordenar(datos);
  const n = ordenados.length;
  const mediana = medianaOrdenada(ordenados);
  const m = Math.floor(n / 2);
  const indicesMediana = n % 2 === 1 ? [m] : [m - 1, m];
  return { ordenados, mediana, indicesMediana };
}

// ---------- Ordenar + cuartiles (método de las mitades, igual que la práctica) ----------

export interface OrdenCuartiles {
  ordenados: number[];
  q1: number;
  mediana: number;
  q3: number;
  iqr: number; // q3 - q1
  indicesQ1: number[];
  // Vacío si n es par (la mediana no es un dato: cae entre dos centrales
  // que ya son parte de las mitades). Con n impar, el único índice del
  // dato central que queda afuera de ambas mitades.
  indicesMedianaExcluida: number[];
  indicesQ3: number[];
}

function indicesCentro(largo: number, offset: number): number[] {
  const mm = Math.floor(largo / 2);
  return largo % 2 === 1 ? [offset + mm] : [offset + mm - 1, offset + mm];
}

export function ordenarYCuartiles(datos: readonly number[]): OrdenCuartiles {
  const ordenados = ordenar(datos);
  const { q1, mediana, q3 } = cuartilesMitades(ordenados);
  const n = ordenados.length;
  const m = Math.floor(n / 2);
  const superiorInicio = n % 2 === 1 ? m + 1 : m;
  const inferiorLargo = m;
  const superiorLargo = ordenados.length - superiorInicio;
  return {
    ordenados,
    q1,
    mediana,
    q3,
    iqr: redondear2(q3 - q1),
    indicesQ1: indicesCentro(inferiorLargo, 0),
    indicesMedianaExcluida: n % 2 === 1 ? [m] : [],
    indicesQ3: indicesCentro(superiorLargo, superiorInicio),
  };
}

// ---------- Media ----------

export function media(datos: readonly number[]): number {
  return redondear2(suma(datos) / datos.length);
}

// ---------- Tabla de frecuencias + moda ----------

export interface Frecuencias {
  valores: number[]; // ascendente, sin repetir
  frecuencias: number[]; // frecuencias[i] = veces que aparece valores[i]
  maxFrecuencia: number;
  // Índices (en `valores`) de la moda: solo cuenta si se repite (>1 vez).
  indicesModa: number[];
}

export function tablaFrecuencias(datos: readonly number[]): Frecuencias {
  const conteo = new Map<number, number>();
  for (const d of datos) conteo.set(d, (conteo.get(d) ?? 0) + 1);
  const valores = [...conteo.keys()].sort((a, b) => a - b);
  const frecuencias = valores.map((v) => conteo.get(v)!);
  const maxFrecuencia = frecuencias.length > 0 ? Math.max(...frecuencias) : 0;
  const indicesModa = maxFrecuencia > 1 ? valores.map((_, i) => i).filter((i) => frecuencias[i] === maxFrecuencia) : [];
  return { valores, frecuencias, maxFrecuencia, indicesModa };
}

// ---------- Desviaciones respecto de un centro (media o media provisoria) ----------

export interface Desvios {
  datos: number[];
  centro: number;
  desviaciones: number[]; // datos[i] - centro
  cuadrados: number[]; // desviaciones[i]^2
  sumaDesviaciones: number;
  sumaCuadrados: number;
}

export function calcularDesvios(datos: readonly number[], centro: number): Desvios {
  const desviaciones = datos.map((d) => redondear2(d - centro));
  const cuadrados = desviaciones.map((d) => redondear2(d * d));
  return {
    datos: [...datos],
    centro,
    desviaciones,
    cuadrados,
    sumaDesviaciones: redondear2(suma(desviaciones)),
    sumaCuadrados: redondear2(suma(cuadrados)),
  };
}

export function zScore(x: number, mu: number, sigma: number): number {
  return redondear2((x - mu) / sigma);
}

// ---------- Regresión lineal simple (mínimos cuadrados) ----------

export interface Regresion {
  xMedia: number;
  yMedia: number;
  sxy: number;
  sxx: number;
  syy: number;
  r: number;
  pendiente: number;
  intercepto: number;
}

export function regresionLineal(x: readonly number[], y: readonly number[]): Regresion {
  const n = x.length;
  const xMedia = suma(x) / n;
  const yMedia = suma(y) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMedia;
    const dy = y[i] - yMedia;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const r = sxy / Math.sqrt(sxx * syy);
  const pendiente = sxy / sxx;
  const intercepto = yMedia - pendiente * xMedia;
  return {
    xMedia: redondear2(xMedia),
    yMedia: redondear2(yMedia),
    sxy: redondear2(sxy),
    sxx: redondear2(sxx),
    syy: redondear2(syy),
    r: redondear2(r),
    pendiente: redondear2(pendiente),
    intercepto: redondear2(intercepto),
  };
}

// ---------- Árbol de probabilidad ----------

export interface NodoArbol {
  etiqueta: string;
  // Probabilidad de esta rama CONDICIONAL a que ya se llegó al nodo padre
  // (no acumulada); el producto a lo largo del camino es la probabilidad
  // conjunta. Entre 0 y 1.
  probabilidad: number;
  hijos?: NodoArbol[];
}

export function esNodoArbol(valor: unknown): valor is NodoArbol {
  if (typeof valor !== "object" || valor === null) return false;
  const o = valor as Record<string, unknown>;
  if (typeof o.etiqueta !== "string" || o.etiqueta.length === 0) return false;
  if (typeof o.probabilidad !== "number" || !Number.isFinite(o.probabilidad) || o.probabilidad < 0 || o.probabilidad > 1) return false;
  if (o.hijos !== undefined) {
    if (!Array.isArray(o.hijos) || o.hijos.length === 0) return false;
    if (!o.hijos.every(esNodoArbol)) return false;
  }
  return true;
}

export function esRamas(valor: unknown): valor is NodoArbol[] {
  return Array.isArray(valor) && valor.length > 0 && valor.every(esNodoArbol);
}

// Todos los caminos raíz->hoja con su probabilidad conjunta (producto de
// las probabilidades del camino) y las etiquetas concatenadas.
export interface CaminoArbol {
  etiquetas: string[];
  // Probabilidades de cada rama del camino (en orden) y su producto.
  factores: number[];
  probabilidad: number;
}

export function caminosArbol(ramas: readonly NodoArbol[]): CaminoArbol[] {
  const salida: CaminoArbol[] = [];
  function recorrer(nodo: NodoArbol, prefijoEtiquetas: string[], prefijoFactores: number[], prefijoProb: number) {
    const etiquetas = [...prefijoEtiquetas, nodo.etiqueta];
    const factores = [...prefijoFactores, nodo.probabilidad];
    const prob = redondear2(prefijoProb * nodo.probabilidad);
    if (!nodo.hijos || nodo.hijos.length === 0) {
      salida.push({ etiquetas, factores, probabilidad: prob });
    } else {
      for (const hijo of nodo.hijos) recorrer(hijo, etiquetas, factores, prob);
    }
  }
  for (const rama of ramas) recorrer(rama, [], [], 1);
  return salida;
}

// ---------- Validadores genéricos ----------

export function esListaNumeros(valor: unknown, minimo = 2): valor is number[] {
  return Array.isArray(valor) && valor.length >= minimo && valor.every((n) => typeof n === "number" && Number.isFinite(n));
}

export function esNumeroFinito(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

const TIPOS_GRAFICO = new Set(["barras", "lineas", "histograma", "boxplot"]);

export function esGraficoEstadistica(valor: unknown): valor is GraficoEstadistica {
  if (typeof valor !== "object" || valor === null) return false;
  const o = valor as Record<string, unknown>;
  if (typeof o.tipo !== "string" || !TIPOS_GRAFICO.has(o.tipo)) return false;
  if (typeof o.titulo !== "string" || o.titulo.length === 0) return false;
  const eje = o.eje as Record<string, unknown> | undefined;
  if (typeof eje !== "object" || eje === null) return false;
  if (!esNumeroFinito(eje.min) || !esNumeroFinito(eje.max) || !esNumeroFinito(eje.tick) || typeof eje.etiqueta !== "string") return false;
  if (o.tipo === "barras") return typeof o.categorias === "object" && Array.isArray(o.categorias) && esListaNumeros(o.valores) && o.categorias.length === (o.valores as number[]).length;
  if (o.tipo === "lineas") return Array.isArray(o.etiquetas) && esListaNumeros(o.valores) && o.etiquetas.length === (o.valores as number[]).length;
  if (o.tipo === "histograma") return esListaNumeros(o.limites, 2) && esListaNumeros(o.frecuencias, 1) && (o.limites as number[]).length === (o.frecuencias as number[]).length + 1 && typeof o.etiquetaX === "string";
  // boxplot
  return esNumeroFinito(o.min) && esNumeroFinito(o.q1) && esNumeroFinito(o.mediana) && esNumeroFinito(o.q3) && esNumeroFinito(o.max) && Array.isArray(o.atipicos);
}

// ---------- Combinatoria (para armar las fórmulas de las lecciones) ----------

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// P(n, r): n · (n-1) ··· (n-r+1), sin dividir.
export function permutaciones(n: number, r: number): number {
  let p = 1;
  for (let i = 0; i < r; i++) p *= n - i;
  return p;
}

// C(n, r) = P(n, r) / r!
export function combinaciones(n: number, r: number): number {
  return permutaciones(n, r) / factorial(r);
}

// Los r factores de P(n, r) escritos como producto en LaTeX (10, 9, 8 para P(10, 3)).
export function productoDescendente(n: number, r: number): string {
  return Array.from({ length: r }, (_, i) => String(n - i)).join(" \\cdot ");
}

// ---------- Curva normal y regla empírica ----------

// Porcentajes NOMINALES de la regla empírica (68 - 95 - 99.7) para 1, 2 y 3
// desvíos. visualesDatos.test.ts los contrasta con el área exacta de la
// normal (función error) redondeada.
export const REGLA_EMPIRICA: ReadonlyArray<{ k: 1 | 2 | 3; porcentaje: number }> = [
  { k: 1, porcentaje: 68 },
  { k: 2, porcentaje: 95 },
  { k: 3, porcentaje: 99.7 },
];

export interface BandaNormal {
  k: 1 | 2 | 3;
  porcentaje: number;
  desde: number; // media - k·sigma
  hasta: number; // media + k·sigma
}

export function bandasNormal(media: number, sigma: number): BandaNormal[] {
  return REGLA_EMPIRICA.map(({ k, porcentaje }) => ({
    k,
    porcentaje,
    desde: redondear2(media - k * sigma),
    hasta: redondear2(media + k * sigma),
  }));
}

export function densidadNormal(x: number, media: number, sigma: number): number {
  const z = (x - media) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
