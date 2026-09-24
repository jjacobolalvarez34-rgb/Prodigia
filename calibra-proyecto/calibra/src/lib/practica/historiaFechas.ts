import type { Hecho } from "@/lib/historia/tipos";
import { HECHOS } from "@/lib/historia/tabla";
import { EPOCAS, distanciaAFrontera, epocaDeAnio } from "@/lib/historia/epocas";
import { decada, decadaTexto, formatoAnio, mismoSigloConMargen } from "@/lib/historia/tiempo";
import {
  armarOpciones,
  dificultadDe,
  elegirDistractores,
  elegirPorProminencia,
  barajar,
  sinUsados,
  tDif,
  type Contexto,
  type Generada,
  type Generador,
} from "./historiaComun";
import { opcionesDeSiglo } from "./historiaCronologia";

// Modo FECHAS. Cuatro grados de precisión, de menor a mayor: época, siglo, década
// y año exacto. El año exacto y la década solo se preguntan de hechos con
// `certeza: "exacta"` (los libros no discrepan); la época y el siglo, de hechos
// cuya incertidumbre (`margen`) no cruza el límite.

const INTENTOS = 60;

const promH = (h: Hecho) => h.prominencia;
const clave = (h: Hecho) => `fecha|${h.id}`;

function generada(ctx: Contexto, tipo: string, h: Hecho, radio: number, enunciado: string, correcta: string, distractores: string[], meta: Record<string, unknown>): Generada | null {
  const opciones = armarOpciones(correcta, distractores, ctx.rng);
  if (!opciones) return null;
  return {
    pregunta: { enunciado, opciones, respuesta: correcta, clave: clave(h), dificultad: dificultadDe(h.prominencia) },
    tipo,
    hechos: [h.id],
    personajes: [],
    prominencia: h.prominencia,
    radio,
    meta: { hecho: h.id, correcta, ...meta },
  };
}

// ¿Su época es la misma aun sumando o restando su margen, y lejos de una frontera de época?
export function esDeEpocaClara(h: Hecho): boolean {
  if (h.frontera) return false;
  if (epocaDeAnio(h.anio - h.margen) !== epocaDeAnio(h.anio + h.margen)) return false;
  return distanciaAFrontera(h.anio) >= 50;
}

const epoca: Generador = (ctx) => {
  const pool = sinUsados(HECHOS.filter(esDeEpocaClara), clave, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const correcta = EPOCAS.find((x) => x.id === e.item.epoca)!;
    const otras = EPOCAS.filter((x) => x.id !== correcta.id);
    const dist = elegirDistractores(otras, (x) => 4 - Math.abs(x.numero - correcta.numero), tDif(ctx.dif, 3), 3, ctx.rng);
    const g = generada(
      ctx,
      "epoca",
      e.item,
      e.radio,
      `Según la periodización escolar habitual, ¿en qué época ocurrió «${e.item.nombre}»?`,
      correcta.nombre.es,
      dist.map((x) => x.nombre.es),
      { epoca: correcta.id }
    );
    if (g) return g;
  }
  return null;
};

const siglo: Generador = (ctx) => {
  const aptos = HECHOS.filter((h) => mismoSigloConMargen(h.anio, h.margen) && Math.abs(h.anio) <= 3000);
  const pool = sinUsados(aptos, clave, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const op = opcionesDeSiglo(e.item, ctx);
    if (!op) continue;
    const g = generada(ctx, "siglo", e.item, e.radio, `¿En qué siglo ocurrió «${e.item.nombre}»?`, op.correcta, op.distractores, { siglo: op.correcta });
    if (g) return g;
  }
  return null;
};

export function esDeAnioExacto(h: Hecho): boolean {
  return h.certeza === "exacta" && h.margen === 0;
}

const decadaGen: Generador = (ctx) => {
  const aptos = HECHOS.filter((h) => esDeAnioExacto(h) && h.anio >= 1000);
  const pool = sinUsados(aptos, clave, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const d0 = decada(e.item.anio);
    // Décadas vecinas: a igual distancia, el jugador que sabe el siglo pero no la década duda entre varias.
    const candidatas: number[] = [];
    for (let k = -6; k <= 6; k++) {
      const d = d0 + k * 10;
      if (k !== 0 && d >= 1000 && d <= 2020) candidatas.push(d);
    }
    const dist = elegirDistractores(candidatas, (d) => 6 - Math.abs(d - d0) / 10, tDif(ctx.dif, 4), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "decada", e.item, e.radio, `¿En qué década ocurrió «${e.item.nombre}»?`, decadaTexto(e.item.anio), dist.map((d) => decadaTexto(d)), { decada: d0 });
    if (g) return g;
  }
  return null;
};

// Desplazamientos posibles del año, de menor a mayor.
const DESPLAZAMIENTOS = [3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100];
const MIN_DESPLAZAMIENTO = [20, 10, 6, 4, 3];
const MAX_DESPLAZAMIENTO = [100, 60, 30, 15, 10];

export function desplazamientosPermitidos(dif: number): number[] {
  const i = Math.min(dif, MIN_DESPLAZAMIENTO.length - 1);
  return DESPLAZAMIENTOS.filter((d) => d >= MIN_DESPLAZAMIENTO[i] && d <= MAX_DESPLAZAMIENTO[i]);
}

const anio: Generador = (ctx) => {
  const aptos = HECHOS.filter(esDeAnioExacto);
  const pool = sinUsados(aptos, clave, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promH, ctx.nivel, ctx.rng);
    if (!e) return null;
    const h = e.item;
    const candidatos: number[] = [];
    for (const d of desplazamientosPermitidos(ctx.dif)) {
      for (const signo of [-1, 1]) {
        const y = h.anio + signo * d;
        // Se mantiene la era: un año a. C. no salta a d. C. ni al revés.
        if (y !== 0 && Math.sign(y) === Math.sign(h.anio)) candidatos.push(y);
      }
    }
    const unicos = [...new Set(candidatos)];
    if (unicos.length < 3) continue;
    // Se toma el desplazamiento (no el más cercano) de forma pareja: barajar y elegir 3.
    const dist = barajar(ctx.rng, unicos).slice(0, 3);
    const g = generada(ctx, "anio", h, e.radio, `¿En qué año ocurrió «${h.nombre}»?`, formatoAnio(h.anio), dist.map(formatoAnio), { anio: h.anio, distractores: dist });
    if (g) return g;
  }
  return null;
};

export const GENERADORES_FECHAS: Record<string, Generador> = {
  epoca,
  siglo,
  decada: decadaGen,
  anio,
};
