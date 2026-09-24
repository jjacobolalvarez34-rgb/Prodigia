import type { Hecho } from "@/lib/historia/tipos";
import { HECHOS, distinguibles } from "@/lib/historia/tabla";
import { formatoAnio, mismoSigloConMargen, siglo, sigloEtiquetaDe } from "@/lib/historia/tiempo";
import {
  armarOpciones,
  barajar,
  dificultadDe,
  elegir,
  elegirDistractores,
  elegirPorProminencia,
  elegirVariosPorProminencia,
  promedio,
  sinUsados,
  tDif,
  type Contexto,
  type Generada,
  type Generador,
} from "./historiaComun";

// Modo CRONOLOGÍA: todo se deriva de la tabla canónica. Ninguna pregunta afirma
// un orden que la tabla no pueda garantizar: dos hechos solo se comparan si sus
// años difieren en más que la suma de sus márgenes (distinguibles).

const INTENTOS = 80;

// Último siglo que puede aparecer como opción (el XXI, el actual): nunca un siglo futuro.
const SIGLO_ACTUAL = 21;

function todosDistinguibles(hs: Hecho[]): boolean {
  for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) if (!distinguibles(hs[i], hs[j])) return false;
  return true;
}

const promH = (h: Hecho) => h.prominencia;

function armar(ctx: Contexto, tipo: string, hs: Hecho[], radio: number, enunciado: string, correcta: string, distractores: string[], clave: string, meta: Record<string, unknown>): Generada | null {
  const opciones = armarOpciones(correcta, distractores, ctx.rng);
  if (!opciones) return null;
  const prominencia = promedio(hs.map(promH));
  return {
    pregunta: { enunciado, opciones, respuesta: correcta, clave, dificultad: dificultadDe(prominencia) },
    tipo,
    hechos: hs.map((h) => h.id),
    personajes: [],
    prominencia,
    radio,
    meta,
  };
}

// ---------- ordenar 3 hechos ----------
const texto = (hs: Hecho[]) => hs.map((h) => h.nombre).join(" → ");

// Cantidad de pares invertidos de una permutación respecto del orden correcto.
function inversiones(orden: number[]): number {
  let n = 0;
  for (let i = 0; i < orden.length; i++) for (let j = i + 1; j < orden.length; j++) if (orden[i] > orden[j]) n++;
  return n;
}

const PERMUTACIONES: number[][] = [
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

function generarOrdenamiento(ctx: Contexto, tipo: string, candidatos: (ya: Hecho[]) => Hecho[]): Generada | null {
  for (let intento = 0; intento < INTENTOS; intento++) {
    const elegidos: Hecho[] = [];
    let radio = 0;
    for (let k = 0; k < 3; k++) {
      const pool = candidatos(elegidos).filter((h) => !elegidos.includes(h));
      const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
      if (!e) break;
      elegidos.push(e.item);
      radio = Math.max(radio, e.radio);
    }
    if (elegidos.length < 3 || !todosDistinguibles(elegidos)) continue;
    const ordenados = [...elegidos].sort((a, b) => a.anio - b.anio);
    const clave = `ord|${ordenados.map((h) => h.id).join("|")}`;
    if (!ctx.relajar && ctx.usados.has(clave)) continue;
    // Distractores: los cinco órdenes equivocados; en los niveles altos, los que
    // difieren del correcto en un solo cruce.
    const cercanos = ctx.dif >= 3 ? PERMUTACIONES.filter((p) => inversiones(p) === 1).concat(PERMUTACIONES.filter((p) => inversiones(p) === 2)) : barajar(ctx.rng, PERMUTACIONES);
    const distractores = cercanos.slice(0, 3).map((p) => texto(p.map((i) => ordenados[i])));
    return armar(ctx, tipo, ordenados, radio, "Ordena estos tres hechos del más antiguo al más reciente:", texto(ordenados), distractores, clave, { orden: ordenados.map((h) => h.id) });
  }
  return null;
}

const ordenarEpocas: Generador = (ctx) =>
  generarOrdenamiento(ctx, "ordenar-epocas", (ya) => HECHOS.filter((h) => !ya.some((x) => x.epoca === h.epoca)));

const MIN_SEPARACION_MISMA_EPOCA = [200, 160, 120, 90, 60, 45];

const ordenarMismaEpoca: Generador = (ctx) => {
  const gap = MIN_SEPARACION_MISMA_EPOCA[Math.min(ctx.dif, MIN_SEPARACION_MISMA_EPOCA.length - 1)];
  return generarOrdenamiento(
    ctx,
    "ordenar-misma-epoca",
    (ya) => {
      if (ya.length === 0) return HECHOS;
      return HECHOS.filter((h) => h.epoca === ya[0].epoca && ya.every((x) => Math.abs(x.anio - h.anio) >= gap));
    },
  );
};

const SPAN_CERCANOS = [120, 100, 80, 60, 45, 35];

const ordenarCercanos: Generador = (ctx) => {
  const span = SPAN_CERCANOS[Math.min(ctx.dif, SPAN_CERCANOS.length - 1)];
  return generarOrdenamiento(
    ctx,
    "ordenar-cercanos",
    (ya) => {
      if (ya.length === 0) return HECHOS.filter((h) => h.margen <= 5);
      return HECHOS.filter((h) => h.margen <= 5 && ya.every((x) => Math.abs(x.anio - h.anio) <= span && distinguibles(x, h)));
    },
  );
};

// ---------- entre ----------
const entre: Generador = (ctx) => {
  const anchors = sinUsados(HECHOS.filter((h) => h.margen <= 10), (h) => `entre|${h.id}`, ctx);
  const maxSpan = [420, 360, 300, 240, 180, 140][Math.min(ctx.dif, 5)];
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(anchors, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const x = e.item;
    const antes = HECHOS.filter((h) => h.id !== x.id && h.anio < x.anio && x.anio - h.anio <= maxSpan && distinguibles(h, x));
    const despues = HECHOS.filter((h) => h.id !== x.id && h.anio > x.anio && h.anio - x.anio <= maxSpan && distinguibles(h, x));
    if (antes.length === 0 || despues.length === 0) continue;
    const a = elegir(ctx.rng, antes);
    const b = elegir(ctx.rng, despues);
    if (!todosDistinguibles([a, x, b])) continue;
    const fuera = HECHOS.filter(
      (d) => d.id !== a.id && d.id !== b.id && d.id !== x.id && (d.anio + d.margen < a.anio - a.margen || d.anio - d.margen > b.anio + b.margen)
    );
    // Más parecidos = misma época y cercanos al intervalo.
    const parecido = (d: Hecho) => (d.epoca === x.epoca ? 2 : 0) + (d.region === x.region ? 1 : 0) - Math.min(3, Math.min(Math.abs(d.anio - a.anio), Math.abs(d.anio - b.anio)) / 300);
    const dist = elegirDistractores(fuera, parecido, tDif(ctx.dif), 3, ctx.rng);
    if (dist.length < 3) continue;
    const conAnios = ctx.dif < 2;
    const nombre = (h: Hecho) => (conAnios ? `«${h.nombre}» (${formatoAnio(h.anio)})` : `«${h.nombre}»`);
    const generada = armar(
      ctx,
      "entre",
      [x, a, b],
      e.radio,
      `¿Cuál de estos hechos ocurrió entre ${nombre(a)} y ${nombre(b)}?`,
      x.nombre,
      dist.map((d) => d.nombre),
      `entre|${x.id}`,
      { correcta: x.id, distractores: dist.map((d) => d.id), limites: [a.id, b.id] }
    );
    if (generada) return generada;
  }
  return null;
};

// ---------- siglo con trampas ----------
// Hechos a. C. o de años «redondos» (100, 1000, 1900...), donde el error típico
// es confundir el siglo o la era.
function esTrampaDeSiglo(h: Hecho): boolean {
  if (!mismoSigloConMargen(h.anio, h.margen) || Math.abs(h.anio) > 3000) return false;
  const resto = Math.abs(h.anio) % 100;
  return h.anio < 0 || resto === 0 || resto === 1;
}

export function opcionesDeSiglo(h: Hecho, ctx: Contexto): { correcta: string; distractores: string[] } | null {
  const s = siglo(h.anio);
  const correcta = sigloEtiquetaDe(s.n, s.aC);
  const vecinos: { n: number; aC: boolean; cerca: number }[] = [];
  for (const d of [-2, -1, 1, 2]) if (s.n + d >= 1 && (s.aC || s.n + d <= SIGLO_ACTUAL)) vecinos.push({ n: s.n + d, aC: s.aC, cerca: Math.abs(d) === 1 ? 2 : 1 });
  // La trampa clásica: el mismo número en la otra era.
  if (s.aC || s.n <= SIGLO_ACTUAL) vecinos.push({ n: s.n, aC: !s.aC, cerca: 3 });
  // Y el siglo que se obtiene por error cuando se ignora que el siglo empieza en el año 1 (1900 -> XX).
  const dist = elegirDistractores(vecinos, (v) => v.cerca, tDif(ctx.dif), 3, ctx.rng);
  if (dist.length < 3) return null;
  return { correcta, distractores: dist.map((v) => sigloEtiquetaDe(v.n, v.aC)) };
}

const sigloTrampa: Generador = (ctx) => {
  const pool = sinUsados(HECHOS.filter(esTrampaDeSiglo), (h) => `siglo|${h.id}`, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const op = opcionesDeSiglo(e.item, ctx);
    if (!op) continue;
    const generada = armar(ctx, "siglo", [e.item], e.radio, `¿En qué siglo ocurrió «${e.item.nombre}»?`, op.correcta, op.distractores, `siglo|${e.item.id}`, { correcta: e.item.id, siglo: op.correcta });
    if (generada) return generada;
  }
  return null;
};

// ---------- cuál ocurrió primero (sincronía entre regiones) ----------
const MIN_GAP_PRIMERO = [300, 220, 140, 90, 60, 40];

const masAntiguo: Generador = (ctx) => {
  const gap = MIN_GAP_PRIMERO[Math.min(ctx.dif, MIN_GAP_PRIMERO.length - 1)];
  const pool = sinUsados(HECHOS, (h) => `primero|${h.id}`, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const ancla = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!ancla) return null;
    const otros = elegirVariosPorProminencia(
      HECHOS.filter((h) => h.id !== ancla.item.id && h.region !== ancla.item.region && Math.abs(h.anio - ancla.item.anio) >= gap && Math.abs(h.anio - ancla.item.anio) <= 1200),
      promH,
      ctx.nivel,
      ctx.rng,
      3
    );
    if (!otros) continue;
    const cuatro = [ancla.item, ...otros.items];
    if (new Set(cuatro.map((h) => h.region)).size < 3) continue;
    if (!todosDistinguibles(cuatro)) continue;
    let separados = true;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (Math.abs(cuatro[i].anio - cuatro[j].anio) < gap / 2) separados = false;
    if (!separados) continue;
    const ordenados = [...cuatro].sort((a, b) => a.anio - b.anio);
    const generada = armar(
      ctx,
      "mas-antiguo",
      cuatro,
      Math.max(ancla.radio, otros.radio),
      "¿Cuál de estos hechos, ocurridos en distintas partes del mundo, sucedió primero?",
      ordenados[0].nombre,
      ordenados.slice(1).map((h) => h.nombre),
      `primero|${ancla.item.id}`,
      { correcta: ordenados[0].id, distractores: ordenados.slice(1).map((h) => h.id) }
    );
    if (generada) return generada;
  }
  return null;
};

// ---------- mismo siglo, otra región ----------
const mismoSiglo: Generador = (ctx) => {
  const aptos = HECHOS.filter((h) => mismoSigloConMargen(h.anio, h.margen) && Math.abs(h.anio) <= 3000);
  const pool = sinUsados(aptos, (h) => `mismo|${h.id}`, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const x = e.item;
    const sx = siglo(x.anio);
    const pares = aptos.filter((h) => h.id !== x.id && h.region !== x.region && siglo(h.anio).n === sx.n && siglo(h.anio).aC === sx.aC);
    if (pares.length === 0) continue;
    const y = elegirPorProminencia(pares, promH, ctx.nivel, ctx.rng)!.item;
    const lejanos = HECHOS.filter((d) => d.id !== x.id && d.id !== y.id && Math.abs(d.anio - x.anio) > 200 + d.margen + x.margen);
    const parecido = (d: Hecho) => (d.region === y.region ? 1 : 0) + (d.epoca === x.epoca ? 2 : 0);
    const dist = elegirDistractores(lejanos, parecido, tDif(ctx.dif), 3, ctx.rng);
    if (dist.length < 3) continue;
    const generada = armar(
      ctx,
      "mismo-siglo",
      [x, y],
      e.radio,
      `¿Cuál de estos hechos ocurrió en el mismo siglo que «${x.nombre}»?`,
      y.nombre,
      dist.map((d) => d.nombre),
      `mismo|${x.id}`,
      { referencia: x.id, correcta: y.id, distractores: dist.map((d) => d.id), siglo: sigloEtiquetaDe(sx.n, sx.aC) }
    );
    if (generada) return generada;
  }
  return null;
};

export const GENERADORES_CRONOLOGIA: Record<string, Generador> = {
  "ordenar-epocas": ordenarEpocas,
  "ordenar-misma-epoca": ordenarMismaEpoca,
  entre,
  "ordenar-cercanos": ordenarCercanos,
  siglo: sigloTrampa,
  "mas-antiguo": masAntiguo,
  "mismo-siglo": mismoSiglo,
};

export { esTrampaDeSiglo };
