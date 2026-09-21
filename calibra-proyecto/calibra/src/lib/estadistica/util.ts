// Utilidades compartidas por los generadores de Estadística
// (src/lib/practica/estadistica.ts y src/lib/estadistica/graficos.ts).
// Mismo patrón que calculia.ts: una referencia mutable a nivel de módulo
// que conRngSembrado() reemplaza temporalmente (así no se pasa un `rng`
// explícito por parámetro a cada función interna).

let rngActual: () => number = Math.random;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

export function azar(): number {
  return rngActual();
}

export function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

export function elegir<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function mezclar<T>(arr: readonly T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Saturación de un nivel 1-10 a la banda autoral de un modo (mismo
// criterio que bandaDerivadasNivel() & co. de calculia.ts).
export function clamp(nivel: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, nivel));
}

// Elige entre variantes con peso: las que se "estrenan" en el nivel
// efectivo actual (o el anterior) pesan el doble, para que en el techo de
// la banda no dominen las variantes fáciles.
export function elegirPonderado<T extends string>(entradas: ReadonlyArray<readonly [T, number]>, nivel: number): T {
  const disponibles = entradas.filter(([, minNivel]) => nivel >= minNivel);
  const pesos = disponibles.map(([, minNivel]) => (minNivel >= nivel - 1 ? 2 : 1));
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = rngActual() * total;
  for (let i = 0; i < disponibles.length; i++) {
    r -= pesos[i];
    if (r < 0) return disponibles[i][0];
  }
  return disponibles[disponibles.length - 1][0];
}

// ---------- Formato numérico ----------

export function redondear2(n: number): number {
  return Math.round(n * 100 + (n >= 0 ? 1e-9 : -1e-9)) / 100;
}

// true si n tiene a lo sumo 2 decimales exactos (tolerando ruido de coma
// flotante). Los generadores solo emiten respuestas numéricas "limpias":
// o exactas con <= 2 decimales, o redondeadas a 2 decimales con el
// enunciado diciéndolo explícitamente.
export function tieneHasta2Decimales(n: number): boolean {
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-7;
}

// Formato canónico de un número en enunciados/opciones: punto decimal, a
// lo sumo 2 decimales, sin ceros a la derecha ("5.2", nunca "5.20"),
// sin "-0". Único formateador del mundo: dos opciones que se vean
// distintas nunca son el mismo número y viceversa.
export function fmt(n: number): string {
  const r = redondear2(n);
  if (Object.is(r, -0) || r === 0) return "0";
  return String(r);
}

export function fmtLista(datos: readonly number[]): string {
  return datos.map(fmt).join(", ");
}

// ---------- Fracciones ----------

export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export interface Fraccion {
  num: number;
  den: number;
}

export function fraccion(num: number, den: number): Fraccion {
  const g = mcd(num, den);
  return { num: num / g, den: den / g };
}

export function fmtFraccion(f: Fraccion): string {
  if (f.num === 0) return "0";
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`;
}

export function valorFraccion(f: Fraccion): number {
  return f.num / f.den;
}

// ---------- Opciones ----------

// La correcta + distractores brutos, sin duplicados de TEXTO ni de VALOR
// (`clave` mapea la opción a lo que las hace "la misma respuesta": por
// defecto el propio texto; para fracciones/números se pasa el valor).
export function armarOpciones(correcta: string, distractoresBrutos: readonly string[], clave: (op: string) => string = (s) => s): string[] {
  const vistos = new Set<string>([clave(correcta)]);
  const distractores: string[] = [];
  for (const d of distractoresBrutos) {
    const k = clave(d);
    if (!vistos.has(k)) {
      vistos.add(k);
      distractores.push(d);
    }
  }
  return mezclar([correcta, ...distractores]);
}

// ---------- Estadística descriptiva (usada por los generadores) ----------

export function ordenar(datos: readonly number[]): number[] {
  return [...datos].sort((a, b) => a - b);
}

export function suma(datos: readonly number[]): number {
  return datos.reduce((a, b) => a + b, 0);
}

export function medianaOrdenada(s: readonly number[]): number {
  const n = s.length;
  const m = Math.floor(n / 2);
  return n % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Cuartiles por el "método de las mitades": Q1/Q3 son las medianas de la
// mitad inferior/superior; con n impar la mediana no entra en ninguna
// mitad. Es el método que declaran los enunciados.
export function cuartilesMitades(datos: readonly number[]): { q1: number; mediana: number; q3: number } {
  const s = ordenar(datos);
  const n = s.length;
  const m = Math.floor(n / 2);
  const inferior = s.slice(0, m);
  const superior = n % 2 === 1 ? s.slice(m + 1) : s.slice(m);
  return { q1: medianaOrdenada(inferior), mediana: medianaOrdenada(s), q3: medianaOrdenada(superior) };
}

export function esCuadradoPerfecto(n: number): boolean {
  if (n < 0 || !Number.isInteger(n)) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}
