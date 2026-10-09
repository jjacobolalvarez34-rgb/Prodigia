// Modo Zen en la web (docs/PLAN_MODO_SIN_RELOJ.md): las preguntas salen de los
// MISMOS adaptadores que la app (src/lib/mundosJugables) y, para Numeria y
// Geografía (que tienen entradas propias), de sus generadores directos.
import { ADAPTADORES, type MundoSlug, type PreguntaMundo } from "@/lib/mundosJugables";
import { generarProblemaAlgebra, type TipoAlgebra } from "@/lib/practica/algebra";
import { generarProblemaDecimal, type TipoDecimal } from "@/lib/practica/decimales";
import { generarProblemaFraccion, type TipoFraccion } from "@/lib/practica/fracciones";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { elegirPaisAleatorio, PAISES_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";
import { elegirPreguntaAvanzada, NIVEL_MINIMO_AVANZADO, PROBABILIDAD_AVANZADO } from "@/lib/practica/geografiaAvanzada";
import { generarProblemaGeometria, type TipoGeometria } from "@/lib/practica/geometria";
import { generarProblemaPotencia, type TipoPotencia } from "@/lib/practica/potencias";
import { generarProblema } from "@/lib/practica/problems";

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

const SECCIONES_NUMERIA: { id: string; nombre: string; simbolo: string; temas: string[] }[] = [
  { id: "aritmetica", nombre: "Aritmética", simbolo: "±", temas: ["suma", "resta", "multiplicacion", "division"] },
  { id: "geometria", nombre: "Geometría", simbolo: "△", temas: ["perimetro", "area", "angulos", "ternas"] },
  { id: "fracciones", nombre: "Fracciones", simbolo: "½", temas: ["simplificar", "comparar", "sumar"] },
  { id: "decimales", nombre: "Decimales", simbolo: "0,5", temas: ["convertir", "porcentaje", "redondear"] },
  { id: "potencias", nombre: "Potencias", simbolo: "x²", temas: ["potencia", "raiz", "notacion"] },
  { id: "algebra", nombre: "Álgebra", simbolo: "x", temas: ["evaluar", "un-paso", "dos-pasos"] },
];

export const CONTINENTES_ZEN: { id: Continente; nombre: string; simbolo: string }[] = [
  { id: "america", nombre: "América", simbolo: "🌎" },
  { id: "europa", nombre: "Europa", simbolo: "🏰" },
  { id: "africa", nombre: "África", simbolo: "🌍" },
  { id: "asia_oceania", nombre: "Asia y Oceanía", simbolo: "🌏" },
];

export function temasZen(slug: string): TemaZen[] {
  if (slug === "numeria") return SECCIONES_NUMERIA.map(({ id, nombre, simbolo }) => ({ id, nombre, simbolo }));
  if (slug === "geografia") return CONTINENTES_ZEN;
  const def = ADAPTADORES[slug as MundoSlug];
  return def ? def.modos.map((m) => ({ id: m.id, nombre: m.nombre, simbolo: m.simbolo })) : [];
}

export function nombreDificultad(n: number): string {
  return n <= 3 ? "facil" : n <= 6 ? "media" : n <= 8 ? "dificil" : "experto";
}

function azar<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function opcionesFraccion(num: number, den: number): string[] {
  const ok = `${num}/${den}`;
  const candidatas = [`${num + 1}/${den}`, `${num}/${den + 1}`, `${den}/${num}`, `${Math.max(1, num - 1)}/${den}`, `${num * 2}/${den}`];
  const malas = [...new Set(candidatas.filter((c) => c !== ok && !c.startsWith("0/")))].slice(0, 3);
  return [ok, ...malas].sort(() => Math.random() - 0.5);
}

function numeroZen(enunciado: string, respuesta: number, tolerancia: number, clave: string): PreguntaMundo {
  return { enunciado, formato: "formulas", entrada: { tipo: "numero", respuesta, tolerancia, decimales: true, negativos: true }, clave, solucion: String(respuesta).replace(".", ",") };
}

function preguntaNumeria(seccion: string, nivel: number): PreguntaMundo {
  const sec = SECCIONES_NUMERIA.find((s) => s.id === seccion) ?? SECCIONES_NUMERIA[0];
  const niveles = <T extends string>() => Object.fromEntries(sec.temas.map((t) => [t, nivel])) as Record<T, number>;
  switch (sec.id) {
    case "aritmetica": {
      const p = generarProblema(azar(sec.temas) as "suma", nivel);
      const enunciado = p.incognitaB ? `${p.a} ${p.symbol} ? = ${p.b}` : `${p.a} ${p.symbol} ${p.b}`;
      return numeroZen(enunciado, p.answer, 0, `${p.problemType}:${enunciado}`);
    }
    case "fracciones": {
      const p = generarProblemaFraccion(niveles<TipoFraccion>(), sec.temas as TipoFraccion[]);
      const t = (f: [number, number]) => `${f[0]}/${f[1]}`;
      if (p.tipo === "comparar" && p.frac1 && p.frac2 && p.respuestaComparacion) {
        const enunciado = `${t(p.frac1)}  ?  ${t(p.frac2)}`;
        return { enunciado, entrada: { tipo: "opciones", opciones: ["<", "=", ">"], respuesta: p.respuestaComparacion }, clave: `comparar:${enunciado}` };
      }
      const [num, den] = p.respuestaFraccion ?? [0, 1];
      const enunciado = p.tipo === "simplificar" && p.frac ? `Simplifica ${t(p.frac)}` : p.frac1 && p.frac2 ? `${t(p.frac1)} + ${t(p.frac2)}` : "";
      return { enunciado, entrada: { tipo: "opciones", opciones: opcionesFraccion(num, den), respuesta: `${num}/${den}` }, clave: `${p.tipo}:${enunciado}` };
    }
    case "geometria": {
      const p = generarProblemaGeometria(niveles<TipoGeometria>(), sec.temas as TipoGeometria[]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`);
    }
    case "decimales": {
      const p = generarProblemaDecimal(niveles<TipoDecimal>(), sec.temas as TipoDecimal[]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`);
    }
    case "potencias": {
      const p = generarProblemaPotencia(niveles<TipoPotencia>(), sec.temas as TipoPotencia[]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`);
    }
    default: {
      const p = generarProblemaAlgebra(niveles<TipoAlgebra>(), sec.temas as TipoAlgebra[]);
      return numeroZen(p.enunciado, p.respuesta, p.tolerancia, `${p.tipo}:${p.enunciado}`);
    }
  }
}

export function generarZen(slug: string, tema: string, nivel: number, usados: Set<string>, contexto: unknown): PreguntaZen | null {
  if (slug === "numeria") {
    const seccion = tema === MEZCLA ? azar(SECCIONES_NUMERIA).id : tema;
    return { tipo: "mundo", p: generarSinRepetir(() => preguntaNumeria(seccion, nivel), (p) => p.clave, usados) };
  }
  if (slug === "geografia") {
    const continente = (tema === MEZCLA ? azar(CONTINENTES_ZEN).id : tema) as Continente;
    if (nivel >= NIVEL_MINIMO_AVANZADO && Math.random() < PROBABILIDAD_AVANZADO) {
      const q = elegirPreguntaAvanzada(continente, usados);
      if (q) {
        const ok = q.opciones.find((o) => o.id === q.id)?.texto ?? q.nombre;
        return { tipo: "mundo", p: { enunciado: q.pregunta, entrada: { tipo: "opciones", opciones: q.opciones.map((o) => o.texto), respuesta: ok }, clave: q.id } };
      }
    }
    const pais = elegirPaisAleatorio(PAISES_POR_CONTINENTE[continente], nivel, usados);
    return pais ? { tipo: "mapa", continente, id: pais.id, nombre: pais.nombre, clave: pais.id } : null;
  }
  const def = ADAPTADORES[slug as MundoSlug];
  if (!def) return null;
  const modo = tema === MEZCLA ? azar(def.modos).id : tema;
  const niveles = Object.fromEntries(def.modos.map((m) => [m.id, nivel]));
  return { tipo: "mundo", p: def.generar(modo, nivel, usados, contexto, undefined, undefined, niveles) };
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
