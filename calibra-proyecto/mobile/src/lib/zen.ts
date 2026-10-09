// Modo Zen (calibra/docs/PLAN_MODO_SIN_RELOJ.md): 10 preguntas sin reloj, con el
// tema y la dificultad que elige el jugador. No guarda intentos ni da Chispas, XP o
// nivel; al terminar solo marca la racha del día (registrar_partida_zen, 0266).
// Usa los MISMOS generadores que la partida normal: los adaptadores de
// mundosJugables y, para Numeria y Geografía (que tienen pantalla propia), sus
// propias funciones.
import type { Continente } from "@/lib/practica/geografia";
import { CONTINENTES, esPreguntaAvanzada, siguientePregunta } from "./geografia";
import { mundoJugable, type PreguntaMundo } from "./mundosJugables";
import { nuevoProblemaNumeria, SECCIONES, TODOS_LOS_TIPOS, type ProblemaNumeria, type SeccionId } from "./numeria";
import { supabase } from "./supabase";

export const PREGUNTAS_ZEN = 10;
export const MEZCLA = "mezcla";

export type PreguntaZen =
  | { tipo: "mundo"; p: PreguntaMundo }
  // Geografía: tocar el país en el mapa.
  | { tipo: "mapa"; continente: Continente; id: string; nombre: string; clave: string };

export interface TemaZen {
  id: string;
  nombre: string;
  simbolo: string;
}

export function temasZen(slug: string): TemaZen[] {
  if (slug === "numeria") return SECCIONES.map((s) => ({ id: s.id, nombre: s.nombre, simbolo: s.simbolo }));
  if (slug === "geografia") return CONTINENTES.map((c) => ({ id: c.id, nombre: c.nombre, simbolo: c.glifo }));
  const def = mundoJugable(slug);
  if (!def) return [];
  return def.modos.map((m) => ({ id: m.id, nombre: m.nombre, simbolo: m.simbolo }));
}

// Nombre de la dificultad para la barra (1-10).
export function nombreDificultad(n: number): string {
  return n <= 3 ? "Fácil" : n <= 6 ? "Media" : n <= 8 ? "Difícil" : "Experto";
}

export async function prepararZen(slug: string): Promise<unknown> {
  const def = mundoJugable(slug);
  return def?.preparar ? def.preparar() : null;
}

function azar<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

// Fracción incorrecta pero creíble para las opciones de Numeria.
function opcionesFraccion(num: number, den: number): string[] {
  const ok = `${num}/${den}`;
  const candidatas = [`${num + 1}/${den}`, `${num}/${den + 1}`, `${den}/${num}`, `${Math.max(1, num - 1)}/${den}`, `${num * 2}/${den}`];
  const malas = [...new Set(candidatas.filter((c) => c !== ok && !c.startsWith("0/")))].slice(0, 3);
  return [ok, ...malas].sort(() => Math.random() - 0.5);
}

function desdeNumeria(p: ProblemaNumeria): PreguntaMundo {
  const r = p.respuesta;
  if (r.tipo === "comparar") return { enunciado: p.texto, entrada: { tipo: "opciones", opciones: ["<", "=", ">"], respuesta: r.valor }, clave: p.clave, solucion: p.solucion };
  if (r.tipo === "fraccion") return { enunciado: p.texto, entrada: { tipo: "opciones", opciones: opcionesFraccion(r.num, r.den), respuesta: `${r.num}/${r.den}` }, clave: p.clave, solucion: p.solucion };
  return { enunciado: p.texto, entrada: { tipo: "numero", respuesta: r.valor, tolerancia: r.tolerancia, decimales: true, negativos: true }, clave: p.clave, solucion: p.solucion };
}

export function generarZen(slug: string, tema: string, nivel: number, usados: Set<string>, contexto: unknown): PreguntaZen | null {
  if (slug === "numeria") {
    const seccion = (tema === MEZCLA ? azar(SECCIONES).id : tema) as SeccionId;
    const sec = SECCIONES.find((s) => s.id === seccion);
    if (!sec) return null;
    const niveles = Object.fromEntries([...TODOS_LOS_TIPOS, ...sec.temas.map((t) => t.id)].map((k) => [k, nivel]));
    return { tipo: "mundo", p: desdeNumeria(nuevoProblemaNumeria(seccion, sec.temas.map((t) => t.id), niveles, usados)) };
  }
  if (slug === "geografia") {
    const continente = (tema === MEZCLA ? azar(CONTINENTES).id : tema) as Continente;
    const q = siguientePregunta(continente, nivel, usados);
    if (!q) return null;
    if (esPreguntaAvanzada(q)) {
      const ok = q.opciones.find((o) => o.id === q.id)?.texto ?? q.nombre;
      return { tipo: "mundo", p: { enunciado: q.pregunta, entrada: { tipo: "opciones", opciones: q.opciones.map((o) => o.texto), respuesta: ok }, clave: q.id } };
    }
    return { tipo: "mapa", continente, id: q.id, nombre: q.nombre, clave: q.id };
  }
  const def = mundoJugable(slug);
  if (!def) return null;
  const modo = tema === MEZCLA ? azar(def.modos).id : tema;
  const niveles = Object.fromEntries(def.modos.map((m) => [m.id, nivel]));
  return { tipo: "mundo", p: def.generar(modo, nivel, usados, contexto, undefined, undefined, niveles) };
}

export async function registrarPartidaZen(mundo: string, respondidas: number): Promise<number | null> {
  const { data, error } = await supabase.rpc("registrar_partida_zen", { p_mundo: mundo, p_respondidas: respondidas });
  if (error) return null;
  const fila = Array.isArray(data) ? data[0] : data;
  return (fila as { racha?: number } | null)?.racha ?? null;
}
