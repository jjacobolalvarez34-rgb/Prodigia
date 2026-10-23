// Modo Zen (docs/PLAN_MODO_SIN_RELOJ.md), web y app: las preguntas salen de los
// MISMOS adaptadores de la partida normal (src/lib/mundosJugables) y, para Numeria y
// Geografía (que tienen entradas propias), de sus generadores directos. La app
// (mobile/src/lib/zen.ts) usa este mismo archivo.
//
// Desde el 2026-10-23 la partida sigue una `ConfigZen` (config.ts): varios temas a la
// vez, un rango de niveles, el largo y las opciones de cada mundo.
import { pasosAvanzada, pasosMapa } from "@/lib/geografia/pasos";
import { ADAPTADORES, type MundoSlug, type PreguntaMundo } from "@/lib/mundosJugables";
import { generarProblemaAlgebra, type TipoAlgebra } from "@/lib/practica/algebra";
import { NOMBRE_POR_HUESO_CLICKEABLE } from "@/lib/practica/anatomia";
import { generarProblemaDecimal, type TipoDecimal } from "@/lib/practica/decimales";
import { generarProblemaFraccion, type TipoFraccion } from "@/lib/practica/fracciones";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { elegirPaisAleatorio, PAISES_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";
import { elegirPreguntaAvanzada, NIVEL_MINIMO_AVANZADO, PROBABILIDAD_AVANZADO } from "@/lib/practica/geografiaAvanzada";
import { generarProblemaGeometria, type TipoGeometria } from "@/lib/practica/geometria";
import { generarProblemaPotencia, type TipoPotencia } from "@/lib/practica/potencias";
import { generarProblema } from "@/lib/practica/problems";
import { enunciadoFraccion, pasosAritmetica, pasosFraccion, type FallaRepaso } from "@/lib/practica/repaso";
import { modificadorAritmetica, nivelDePregunta, partirSubtema, temasZen, type ConfigZen, type OperacionZen } from "./config";

export { CONTINENTES_ZEN, temasZen, type TemaZen } from "./config";

export const PREGUNTAS_ZEN = 10;

export type PreguntaZen =
  | { tipo: "mundo"; p: PreguntaMundo }
  // Geografía: tocar el país en el mapa.
  | { tipo: "mapa"; continente: Continente; id: string; nombre: string; clave: string };

export function nombreDificultad(n: number): string {
  return n <= 3 ? "facil" : n <= 6 ? "media" : n <= 8 ? "dificil" : "experto";
}

function azar<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function opcionesFraccion(num: number, den: number): string[] {
  const ok = `${num}/${den}`;
  const candidatas = [`${num + 1}/${den}`, `${num}/${den + 1}`, `${den}/${num}`, `${Math.max(1, num - 1)}/${den}`, `${num * 2}/${den}`];
  const malas = [...new Set(candidatas.filter((c) => c !== ok && !c.startsWith("0/")))].slice(0, 3);
  return [ok, ...malas].sort(() => Math.random() - 0.5);
}

function numeroZen(enunciado: string, respuesta: number, tolerancia: number, clave: string, pasos?: string[]): PreguntaMundo {
  return { enunciado, formato: "formulas", entrada: { tipo: "numero", respuesta, tolerancia, decimales: true, negativos: true }, clave, solucion: String(respuesta).replace(".", ","), pasos };
}

// Un subtema de Numeria («seccion:tipo») a una pregunta.
function preguntaNumeria(subtema: string, nivel: number, opciones: Record<string, string | boolean>): PreguntaMundo {
  const { grupo, tipo } = partirSubtema(subtema);
  const uno = <T extends string>() => ({ [tipo]: nivel }) as Record<T, number>;
  switch (grupo) {
    case "aritmetica": {
      const op = tipo as OperacionZen;
      const p = generarProblema(op, nivel, modificadorAritmetica(op, opciones));
      const enunciado = p.incognitaB ? `${p.a} ${p.symbol} ? = ${p.b}` : `${p.a} ${p.symbol} ${p.b}`;
      return numeroZen(enunciado, p.answer, 0, `${p.problemType}:${enunciado}`, pasosAritmetica(p));
    }
    case "fracciones": {
      const p = generarProblemaFraccion(uno<TipoFraccion>(), [tipo as TipoFraccion]);
      const enunciado = enunciadoFraccion(p);
      if (p.tipo === "comparar" && p.respuestaComparacion) {
        return { enunciado, entrada: { tipo: "opciones", opciones: ["<", "=", ">"], respuesta: p.respuestaComparacion }, clave: `comparar:${enunciado}`, pasos: pasosFraccion(p) };
      }
      const [num, den] = p.respuestaFraccion ?? [0, 1];
      return { enunciado, entrada: { tipo: "opciones", opciones: opcionesFraccion(num, den), respuesta: `${num}/${den}` }, clave: `${p.tipo}:${enunciado}`, pasos: pasosFraccion(p) };
    }
    case "geometria": {
      const p = generarProblemaGeometria(uno<TipoGeometria>(), [tipo as TipoGeometria]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`, p.pasos);
    }
    case "decimales": {
      const p = generarProblemaDecimal(uno<TipoDecimal>(), [tipo as TipoDecimal]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`, p.pasos);
    }
    case "potencias": {
      const p = generarProblemaPotencia(uno<TipoPotencia>(), [tipo as TipoPotencia]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`, p.pasos);
    }
    default: {
      const p = generarProblemaAlgebra(uno<TipoAlgebra>(), [tipo as TipoAlgebra]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`, p.pasos);
    }
  }
}

function preguntaGeografia(continente: Continente, nivel: number, tipo: string, usados: Set<string>): PreguntaZen | null {
  const lugares = tipo === "lugares" || (tipo === "mixto" && Math.random() < 0.5) || (tipo === "nivel" && nivel >= NIVEL_MINIMO_AVANZADO && Math.random() < PROBABILIDAD_AVANZADO);
  if (lugares) {
    const q = elegirPreguntaAvanzada(continente, usados);
    if (q) {
      const ok = q.opciones.find((o) => o.id === q.id)?.texto ?? q.nombre;
      return { tipo: "mundo", p: { enunciado: q.pregunta, entrada: { tipo: "opciones", opciones: q.opciones.map((o) => o.texto), respuesta: ok }, clave: q.id, pasos: pasosAvanzada(q.pregunta, ok) } };
    }
  }
  const pais = elegirPaisAleatorio(PAISES_POR_CONTINENTE[continente], nivel, usados);
  return pais ? { tipo: "mapa", continente, id: pais.id, nombre: pais.nombre, clave: pais.id } : null;
}

// La pregunta número `indice` (0…) de una partida con esta configuración. El tema
// sale al azar entre los elegidos; el nivel, del rango (nivelDePregunta).
export function generarZen(slug: string, config: ConfigZen, indice: number, usados: Set<string>, contexto: unknown): PreguntaZen | null {
  const temas = config.temas.length > 0 ? config.temas : temasZen(slug).map((t) => t.id);
  if (temas.length === 0) return null;
  const tema = azar(temas);
  const nivel = nivelDePregunta(config, indice);
  if (slug === "numeria") {
    return { tipo: "mundo", p: generarSinRepetir(() => preguntaNumeria(tema, nivel, config.opciones), (p) => p.clave, usados) };
  }
  if (slug === "geografia") return preguntaGeografia(tema as Continente, nivel, String(config.opciones.preguntas ?? "nivel"), usados);
  const def = ADAPTADORES[slug as MundoSlug];
  if (!def) return null;
  const niveles = Object.fromEntries(def.modos.map((m) => [m.id, nivel]));
  const filtro = typeof config.opciones.filtro === "string" && config.opciones.filtro ? config.opciones.filtro : undefined;
  return { tipo: "mundo", p: def.generar(tema, nivel, usados, contexto, undefined, filtro, niveles) };
}

export function claveZen(q: PreguntaZen): string {
  return q.tipo === "mundo" ? q.p.clave : q.clave;
}

export function esCorrectaZen(q: PreguntaZen, valor: string): boolean {
  if (q.tipo === "mapa") return valor === q.id;
  const e = q.p.entrada;
  if (e.tipo === "numero") {
    const n = Number(valor.replace(",", "."));
    return Number.isFinite(n) && Math.abs(n - e.respuesta) <= e.tolerancia + 1e-9;
  }
  if (e.tipo === "esqueleto") return valor === e.objetivo;
  return valor === e.respuesta;
}

export function solucionZen(q: PreguntaZen): string {
  if (q.tipo === "mapa") return q.nombre;
  const e = q.p.entrada;
  return q.p.solucion ?? (e.tipo === "numero" ? String(e.respuesta).replace(".", ",") : e.respuesta);
}

// Lo que el jugador respondió, como texto legible (el país tocado, el hueso, el número con coma).
export function textoRespuestaZen(q: PreguntaZen, valor: string): string {
  if (q.tipo === "mapa") return PAISES_POR_CONTINENTE[q.continente].find((p) => p.id === valor)?.nombre ?? valor;
  const e = q.p.entrada;
  if (e.tipo === "esqueleto") return NOMBRE_POR_HUESO_CLICKEABLE[valor] ?? valor;
  if (e.tipo === "numero") return valor.replace(".", ",");
  return valor;
}

// Una pregunta fallada, lista para el repaso del final (RepasoErrores en web y app):
// lo que respondiste (los dos intentos, si usaste el segundo), la correcta y cómo se
// resuelve. `enunciadoMapa`: el texto de «¿Dónde está …?» en el idioma de la pantalla.
export function fallaZen(q: PreguntaZen, intentos: string[], enunciadoMapa: (pais: string) => string): FallaRepaso {
  const dadas = intentos.map((v) => textoRespuestaZen(q, v));
  const tuRespuesta = dadas.length > 0 ? dadas.join("  ·  ") : null;
  if (q.tipo === "mapa") {
    const ultimo = intentos[intentos.length - 1];
    const tocado = ultimo ? { id: ultimo, nombre: textoRespuestaZen(q, ultimo) } : null;
    return { enunciado: enunciadoMapa(q.nombre), tuRespuesta, correcta: q.nombre, pasos: pasosMapa({ id: q.id, nombre: q.nombre }, tocado) };
  }
  return { enunciado: q.p.enunciado, formato: q.p.formato, tuRespuesta, correcta: solucionZen(q), pasos: q.p.pasos ?? [] };
}
