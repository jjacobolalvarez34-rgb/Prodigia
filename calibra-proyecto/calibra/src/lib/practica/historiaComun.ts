// Piezas comunes de la práctica de Historia: tipos públicos, azar con semilla,
// selección por prominencia y armado de opciones. Ningún generador usa
// Math.random ni decide la dificultad con `if (nivel ...)`: la dificultad sale de
// la escala declarativa (historiaEscala.ts) y de la prominencia de la tabla
// canónica (src/lib/historia/hechos.ts y personajes.ts).

export type ModoHistoria = "cronologia" | "personajes" | "causaefecto" | "fechas";

export const NOMBRE_MODO_HISTORIA: Record<ModoHistoria, string> = {
  cronologia: "Cronología",
  personajes: "Personajes",
  causaefecto: "Causa y efecto",
  fechas: "Fechas exactas",
};

export interface PreguntaHistoria {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  // Identifica lo que se preguntó: el llamador lo agrega a `usados` para no repetirlo.
  clave: string;
  // 1 (muy conocido) a 10 (poco conocido): sale de la prominencia de los hechos y
  // personajes de la pregunta.
  dificultad: number;
}

export type Rng = () => number;

// Radios (en puntos de prominencia) alrededor del objetivo del nivel. Se usa el
// más chico que deja al menos `MIN_CANDIDATOS` opciones; el último cubre todo.
export const RADIOS_PROMINENCIA = [1.5, 2.5, 3.5, 5, 10] as const;
export const MIN_CANDIDATOS = 3;

// Prominencia objetivo de un nivel: 10 en el nivel 1 y 3,25 en el nivel 10. Un
// hecho es «del nivel» si su prominencia cae dentro del radio elegido.
export function objetivoProminencia(nivel: number): number {
  const n = Math.min(10, Math.max(1, Math.round(nivel)));
  return 10 - 0.75 * (n - 1);
}

// Todo lo que un generador devuelve, con lo necesario para verificarlo por
// código (los tests recalculan cada respuesta desde estos ids, sin confiar en el
// texto del enunciado).
export interface Generada {
  pregunta: PreguntaHistoria;
  // Tipo de la escala (historiaEscala.ts) que la generó.
  tipo: string;
  hechos: string[];
  personajes: string[];
  // Promedio de la prominencia de lo que se pregunta.
  prominencia: number;
  // Radio de prominencia con el que se eligió.
  radio: number;
  // Datos para la verificación: id correcto, ids distractores, año esperado...
  meta: Record<string, unknown>;
}

export interface Contexto {
  nivel: number;
  // Cuántos niveles lleva activo el tipo (0 en su primer nivel): endurece los
  // distractores y acorta las distancias.
  dif: number;
  usados: Set<string>;
  rng: Rng;
  // true en la segunda pasada: si no hay nada sin usar, se permite repetir.
  relajar: boolean;
}

export type Generador = (ctx: Contexto) => Generada | null;

// ---------- azar con semilla ----------
export function entero(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

export function elegir<T>(rng: Rng, lista: readonly T[]): T {
  return lista[entero(rng, lista.length)];
}

export function barajar<T>(rng: Rng, lista: readonly T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = entero(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Muestra `n` elementos distintos.
export function muestra<T>(rng: Rng, lista: readonly T[], n: number): T[] {
  return barajar(rng, lista).slice(0, n);
}

// ---------- selección por prominencia ----------
export interface Elegido<T> {
  item: T;
  radio: number;
}

function radioPara(prominencias: number[], nivel: number, minimo: number): number {
  const objetivo = objetivoProminencia(nivel);
  for (const r of RADIOS_PROMINENCIA) {
    if (prominencias.filter((p) => Math.abs(p - objetivo) <= r).length >= minimo) return r;
  }
  return RADIOS_PROMINENCIA[RADIOS_PROMINENCIA.length - 1];
}

// Elige UN elemento cuyo nivel de prominencia se acerque al objetivo del nivel.
export function elegirPorProminencia<T>(pool: readonly T[], prom: (t: T) => number, nivel: number, rng: Rng): Elegido<T> | null {
  if (pool.length === 0) return null;
  const objetivo = objetivoProminencia(nivel);
  const radio = radioPara(pool.map(prom), nivel, Math.min(MIN_CANDIDATOS, pool.length));
  const candidatos = pool.filter((t) => Math.abs(prom(t) - objetivo) <= radio);
  return { item: elegir(rng, candidatos), radio };
}

// Elige `n` elementos distintos con el mismo criterio.
export function elegirVariosPorProminencia<T>(pool: readonly T[], prom: (t: T) => number, nivel: number, rng: Rng, n: number): { items: T[]; radio: number } | null {
  if (pool.length < n) return null;
  const objetivo = objetivoProminencia(nivel);
  const radio = radioPara(pool.map(prom), nivel, Math.max(n, MIN_CANDIDATOS));
  const candidatos = pool.filter((t) => Math.abs(prom(t) - objetivo) <= radio);
  const base = candidatos.length >= n ? candidatos : pool;
  return { items: muestra(rng, base, n), radio };
}

// Quita del pool lo que el jugador ya vio (salvo en la pasada relajada).
export function sinUsados<T>(pool: readonly T[], clave: (t: T) => string, ctx: Contexto): T[] {
  return ctx.relajar ? [...pool] : pool.filter((t) => !ctx.usados.has(clave(t)));
}

export function promedio(valores: number[]): number {
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// dificultad del ítem (1 muy conocido ... 10 poco conocido).
export function dificultadDe(prominenciaMedia: number): number {
  return Math.min(10, Math.max(1, Math.round(11 - prominenciaMedia)));
}

// ---------- distractores ----------
// Ordena candidatos por «parecido» con la respuesta: con t = 0 (nivel bajo) se
// prefieren los muy distintos; con t = 1 (nivel alto), los más parecidos. El azar
// desempata y mezcla. Devuelve `n` distintos.
export function elegirDistractores<T>(cands: readonly T[], parecido: (t: T) => number, t: number, n: number, rng: Rng): T[] {
  const k = 2 * Math.min(1, Math.max(0, t)) - 1;
  return cands
    .map((c) => ({ c, s: k * parecido(c) + rng() * 1.2 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.c);
}

// Fuerza de la dificultad de un tipo para elegir distractores: 0 en su primer
// nivel y 1 cuando lleva `max` niveles activo.
export function tDif(dif: number, max = 4): number {
  return Math.min(1, Math.max(0, dif / max));
}

// Mezcla la correcta con los distractores. Devuelve null si hay repetidos (dos
// opciones iguales serían una pregunta rota).
export function armarOpciones(correcta: string, distractores: string[], rng: Rng): string[] | null {
  const todas = [correcta, ...distractores];
  if (new Set(todas).size !== todas.length) return null;
  return barajar(rng, todas);
}
