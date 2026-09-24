import type { Hecho } from "@/lib/historia/tipos";
import { HECHOS, consecuenciasDe, hecho } from "@/lib/historia/tabla";
import { formatoAnio } from "@/lib/historia/tiempo";
import {
  armarOpciones,
  dificultadDe,
  elegirDistractores,
  elegirPorProminencia,
  promedio,
  sinUsados,
  tDif,
  type Contexto,
  type Generada,
  type Generador,
} from "./historiaComun";

// Modo CAUSA Y EFECTO. La relación causal sale de `Hecho.causas` (tabla canónica,
// solo relaciones de amplio consenso). Los distractores son SIEMPRE lógicamente
// imposibles, por cronología: una consecuencia no puede ser anterior a su causa
// y una causa no puede ser posterior a su efecto. Así ninguna opción equivocada
// puede defenderse como «también fue consecuencia» y el jugador razona sobre la
// dirección del tiempo, no sobre un dato discutible.

const INTENTOS = 60;

interface Arista {
  causa: Hecho;
  efecto: Hecho;
}

export const ARISTAS: Arista[] = HECHOS.flatMap((e) => e.causas.map((c) => ({ causa: hecho(c), efecto: e })));

export interface Cadena {
  a: Hecho;
  b: Hecho;
  c: Hecho;
}

// Cadenas de dos pasos: A causa de B y B causa de C.
export const CADENAS: Cadena[] = HECHOS.flatMap((b) => b.causas.flatMap((a) => consecuenciasDe(b.id).map((c) => ({ a: hecho(a), b, c }))));

const antes = (d: Hecho, x: Hecho) => d.anio + d.margen < x.anio - x.margen;
const despues = (d: Hecho, x: Hecho) => d.anio - d.margen > x.anio + x.margen;

function nombreConAnio(h: Hecho, con: boolean): string {
  return con ? `«${h.nombre}» (${formatoAnio(h.anio)})` : `«${h.nombre}»`;
}

function generada(ctx: Contexto, tipo: string, hs: Hecho[], radio: number, enunciado: string, correcta: Hecho, dist: Hecho[], clave: string, meta: Record<string, unknown>): Generada | null {
  const opciones = armarOpciones(correcta.nombre, dist.map((d) => d.nombre), ctx.rng);
  if (!opciones) return null;
  const prominencia = promedio(hs.map((h) => h.prominencia));
  return {
    pregunta: { enunciado, opciones, respuesta: correcta.nombre, clave, dificultad: dificultadDe(prominencia) },
    tipo,
    hechos: hs.map((h) => h.id),
    personajes: [],
    prominencia,
    radio,
    meta: { correcta: correcta.id, distractores: dist.map((d) => d.id), ...meta },
  };
}

// Parecido de un distractor con la respuesta: misma época, misma región y cercanía en el tiempo.
function parecidoCon(resp: Hecho, referencia: Hecho) {
  return (d: Hecho) => (d.epoca === resp.epoca ? 2 : 0) + (d.region === resp.region ? 1 : 0) + Math.max(0, 3 - Math.abs(d.anio - referencia.anio) / 150);
}

const claveArista = (a: Arista) => `rel|${a.causa.id}|${a.efecto.id}`;
const promArista = (a: Arista) => (a.causa.prominencia + a.efecto.prominencia) / 2;

const consecuencia: Generador = (ctx) => {
  const pool = sinUsados(ARISTAS, claveArista, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promArista, ctx.nivel, ctx.rng);
    if (!e) return null;
    const { causa, efecto } = e.item;
    const imposibles = HECHOS.filter((d) => d.id !== causa.id && d.id !== efecto.id && antes(d, causa));
    const dist = elegirDistractores(imposibles, parecidoCon(efecto, causa), tDif(ctx.dif, 5), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "consecuencia", [causa, efecto], e.radio, `¿Cuál de estos hechos fue consecuencia de ${nombreConAnio(causa, ctx.dif < 3)}?`, efecto, dist, claveArista(e.item), { causa: causa.id });
    if (g) return g;
  }
  return null;
};

const causa: Generador = (ctx) => {
  const pool = sinUsados(ARISTAS, claveArista, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promArista, ctx.nivel, ctx.rng);
    if (!e) return null;
    const { causa: c, efecto } = e.item;
    const imposibles = HECHOS.filter((d) => d.id !== c.id && d.id !== efecto.id && despues(d, efecto));
    const dist = elegirDistractores(imposibles, parecidoCon(c, efecto), tDif(ctx.dif, 5), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "causa", [c, efecto], e.radio, `¿Cuál de estos hechos contribuyó a provocar ${nombreConAnio(efecto, ctx.dif < 3)}?`, c, dist, claveArista(e.item), { efecto: efecto.id });
    if (g) return g;
  }
  return null;
};

const claveCadena = (c: Cadena) => `cad|${c.a.id}|${c.b.id}|${c.c.id}`;
const promCadena = (c: Cadena) => (c.a.prominencia + c.b.prominencia + c.c.prominencia) / 3;

const cadenaIntermedia: Generador = (ctx) => {
  const pool = sinUsados(CADENAS, claveCadena, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promCadena, ctx.nivel, ctx.rng);
    if (!e) return null;
    const { a, b, c } = e.item;
    const fuera = HECHOS.filter((d) => ![a.id, b.id, c.id].includes(d.id) && (antes(d, a) || despues(d, c)));
    const dist = elegirDistractores(fuera, parecidoCon(b, b), tDif(ctx.dif), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "cadena-intermedia", [a, b, c], e.radio, `${nombreConAnio(a, false)} llevó, a través de otro hecho, a ${nombreConAnio(c, false)}. ¿Cuál fue ese hecho intermedio?`, b, dist, claveCadena(e.item), { cadena: [a.id, b.id, c.id] });
    if (g) return g;
  }
  return null;
};

const cadenaRemota: Generador = (ctx) => {
  const pool = sinUsados(CADENAS, claveCadena, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promCadena, ctx.nivel, ctx.rng);
    if (!e) return null;
    const { a, b, c } = e.item;
    const imposibles = HECHOS.filter((d) => ![a.id, b.id, c.id].includes(d.id) && antes(d, a));
    const dist = elegirDistractores(imposibles, parecidoCon(c, a), tDif(ctx.dif, 3), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "cadena-remota", [a, b, c], e.radio, `¿Cuál de estos hechos fue consecuencia, pasando por otro hecho intermedio, de ${nombreConAnio(a, false)}?`, c, dist, claveCadena(e.item), { cadena: [a.id, b.id, c.id] });
    if (g) return g;
  }
  return null;
};

export const GENERADORES_CAUSAS: Record<string, Generador> = {
  consecuencia,
  causa,
  "cadena-intermedia": cadenaIntermedia,
  "cadena-remota": cadenaRemota,
};
