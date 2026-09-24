import type { Hecho, Personaje } from "@/lib/historia/tipos";
import { HECHOS, PERSONAJES, PERSONAJE_POR_ID, hechosDePersonaje, textoRevela, vidaTexto, ventanaDeVida } from "@/lib/historia/tabla";
import {
  armarOpciones,
  dificultadDe,
  elegir,
  elegirDistractores,
  elegirPorProminencia,
  sinUsados,
  tDif,
  type Contexto,
  type Generada,
  type Generador,
} from "./historiaComun";

// Modo PERSONAJES. Dos familias:
//  - identificar a un personaje por PISTAS (rol, años de vida, un dato). Un
//    distractor es válido solo si FALLA alguna de las pistas que se muestran
//    (cumplePistas): nunca hay dos respuestas posibles entre las opciones;
//  - relacionar personajes y hechos. Los distractores son cronológicamente
//    imposibles (el personaje no vivía en el año del hecho), así que el error no
//    depende de un dato discutible.

const INTENTOS = 60;

type Pista = "rol" | "vida" | "dato";

const PISTAS_POR_TIPO: Record<string, Pista[]> = {
  "pistas-completas": ["rol", "vida", "dato"],
  "rol-y-dato": ["rol", "dato"],
  "solo-dato": ["dato"],
  "rol-y-vida": ["rol", "vida"],
};

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// ¿El candidato `d` es compatible con la pista `pista` del personaje `p`?
function cumplePista(d: Personaje, p: Personaje, pista: Pista): boolean {
  if (pista === "rol") return d.categoria === p.categoria && d.pueblo === p.pueblo;
  if (pista === "vida") return vidaTexto(d) === vidaTexto(p);
  return d.logro === p.logro;
}

export function cumplePistas(d: Personaje, p: Personaje, pistas: Pista[]): boolean {
  return pistas.every((k) => cumplePista(d, p, k));
}

export function textoPistas(p: Personaje, pistas: Pista[]): string {
  const partes: string[] = [];
  if (pistas.includes("rol")) partes.push(`Rol: ${minuscula(p.rol)}.`);
  if (pistas.includes("vida")) partes.push(`Vida: ${vidaTexto(p)}.`);
  if (pistas.includes("dato")) partes.push(`Dato: ${p.logro}`);
  return `¿Quién es este personaje? ${partes.join(" ")}`;
}

const promP = (p: Personaje) => p.prominencia;

function parecidoPersonaje(base: Personaje) {
  return (d: Personaje) => (d.categoria === base.categoria ? 2 : 0) + (d.epoca === base.epoca ? 1 : 0) + (d.region === base.region ? 1 : 0) + (d.pueblo === base.pueblo ? 1 : 0);
}

function generada(ctx: Contexto, tipo: string, hs: Hecho[], ps: Personaje[], radio: number, enunciado: string, correcta: string, distractores: string[], clave: string, meta: Record<string, unknown>): Generada | null {
  const opciones = armarOpciones(correcta, distractores, ctx.rng);
  if (!opciones) return null;
  const prominencia = [...hs.map((h) => h.prominencia), ...ps.map((p) => p.prominencia)].reduce((a, b) => a + b, 0) / (hs.length + ps.length);
  return {
    pregunta: { enunciado, opciones, respuesta: correcta, clave, dificultad: dificultadDe(prominencia) },
    tipo,
    hechos: hs.map((h) => h.id),
    personajes: ps.map((p) => p.id),
    prominencia,
    radio,
    meta,
  };
}

function porPistas(tipo: string): Generador {
  const pistas = PISTAS_POR_TIPO[tipo];
  return (ctx) => {
    const pool = sinUsados(PERSONAJES, (p) => `pers|${p.id}`, ctx);
    for (let intento = 0; intento < INTENTOS; intento++) {
      const e = elegirPorProminencia(pool, promP, ctx.nivel, ctx.rng);
      if (!e) return null;
      const p = e.item;
      const validos = PERSONAJES.filter((d) => d.id !== p.id && !cumplePistas(d, p, pistas));
      const dist = elegirDistractores(validos, parecidoPersonaje(p), tDif(ctx.dif), 3, ctx.rng);
      if (dist.length < 3) continue;
      const g = generada(ctx, tipo, [], [p], e.radio, textoPistas(p, pistas), p.nombre, dist.map((d) => d.nombre), `pers|${p.id}`, { correcta: p.id, distractores: dist.map((d) => d.id), pistas });
      if (g) return g;
    }
    return null;
  };
}

// Distancia en años de un año fuera del intervalo de vida (0 si está dentro).
function distanciaAVida(p: Personaje, anio: number, margen: number): number {
  const [a, b] = ventanaDeVida(p);
  if (anio + margen < a) return a - (anio + margen);
  if (anio - margen > b) return anio - margen - b;
  return 0;
}

const personajeDeHecho: Generador = (ctx) => {
  const aptos = HECHOS.filter((h) => h.margen <= 5 && h.personajes.some((id) => !textoRevela(h.nombre, PERSONAJE_POR_ID.get(id)!)));
  const pool = sinUsados(aptos, (h) => `pershecho|${h.id}`, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, (h) => h.prominencia, ctx.nivel, ctx.rng);
    if (!e) return null;
    const h = e.item;
    const p = PERSONAJE_POR_ID.get(elegir(ctx.rng, h.personajes.filter((id) => !textoRevela(h.nombre, PERSONAJE_POR_ID.get(id)!))))!;
    const imposibles = PERSONAJES.filter((d) => !h.personajes.includes(d.id) && distanciaAVida(d, h.anio, h.margen) > 0);
    const parecido = (d: Personaje) => (d.categoria === p.categoria ? 1 : 0) + (d.region === p.region ? 1 : 0) + Math.max(0, 3 - distanciaAVida(d, h.anio, h.margen) / 150);
    const dist = elegirDistractores(imposibles, parecido, tDif(ctx.dif), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "personaje-de-hecho", [h], [p], e.radio, `¿Qué personaje está relacionado con «${h.nombre}»?`, p.nombre, dist.map((d) => d.nombre), `pershecho|${h.id}`, {
      correcta: p.id,
      distractores: dist.map((d) => d.id),
      hecho: h.id,
    });
    if (g) return g;
  }
  return null;
};

const hechoDePersonaje: Generador = (ctx) => {
  const aptos = PERSONAJES.filter((p) => hechosDePersonaje(p.id).some((h) => !textoRevela(h.nombre, p)));
  const pool = sinUsados(aptos, (p) => `hechopers|${p.id}`, ctx);
  for (let intento = 0; intento < INTENTOS; intento++) {
    const e = elegirPorProminencia(pool, promP, ctx.nivel, ctx.rng);
    if (!e) return null;
    const p = e.item;
    const h = elegir(ctx.rng, hechosDePersonaje(p.id).filter((x) => !textoRevela(x.nombre, p)));
    const imposibles = HECHOS.filter((d) => !d.personajes.includes(p.id) && distanciaAVida(p, d.anio, d.margen) > 0);
    const parecido = (d: Hecho) => (d.epoca === p.epoca ? 2 : 0) + (d.region === p.region ? 1 : 0) + Math.max(0, 3 - distanciaAVida(p, d.anio, d.margen) / 150);
    const dist = elegirDistractores(imposibles, parecido, tDif(ctx.dif), 3, ctx.rng);
    if (dist.length < 3) continue;
    const g = generada(ctx, "hecho-de-personaje", [h], [p], e.radio, `¿Con cuál de estos hechos se relaciona ${p.nombre}?`, h.nombre, dist.map((d) => d.nombre), `hechopers|${p.id}`, {
      correcta: h.id,
      distractores: dist.map((d) => d.id),
      personaje: p.id,
    });
    if (g) return g;
  }
  return null;
};

export const GENERADORES_PERSONAJES: Record<string, Generador> = {
  "pistas-completas": porPistas("pistas-completas"),
  "rol-y-dato": porPistas("rol-y-dato"),
  "solo-dato": porPistas("solo-dato"),
  "rol-y-vida": porPistas("rol-y-vida"),
  "personaje-de-hecho": personajeDeHecho,
  "hecho-de-personaje": hechoDePersonaje,
};
