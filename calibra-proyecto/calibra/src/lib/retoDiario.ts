import { mulberry32 } from "@/lib/rng";
import { generarProblema } from "@/lib/practica/problems";
import { ARITHMETIC_PROBLEM_TYPES } from "@/types/database";
import { PAISES_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";
import { generarAcertijoProcedural, conRngSembrado as conRngSembradoEnigmia, type CategoriaGenerada } from "@/lib/enigmia/generadores";
import { generarPreguntaQuimia, type ModoQuimia } from "@/lib/practica/quimia";
import { generarPreguntaAnatomia, type ModoAnatomia } from "@/lib/practica/anatomia";
import { generarPreguntaMelodia, conRngSembrado as conRngSembradoMelodia, type ModoMelodia, type NotaMusical, type FiguraRitmica } from "@/lib/practica/melodia";

// Fase 3 (reto diario multi-ciudad, 2026-08-25): antes esto solo
// generaba 5 sumas/restas/multiplicaciones/divisiones — el reto pasa a
// 45 preguntas, cada una de una ciudad elegida al azar ENTRE LAS QUE
// el usuario ya desbloqueó (no todas las que existen). "Desbloqueado"
// hoy (antes de que exista el pago con Chispas de la Fase 12 de esta
// misma tanda) significa "ya hizo el diagnóstico de esa ciudad" —
// numeria y geografía no tienen diagnóstico propio (geografía nunca
// tuvo su propio guard, ver requireMundoNumeria/guard.ts) así que
// siempre cuentan como desbloqueadas. Cuando la Fase 12 exista, el
// llamador (reto-diario/page.tsx) puede empezar a mandar acá el set
// real de mundos pagados en vez de este proxy — la firma ya recibe la
// lista desde afuera, no la calcula internamente.
export type MundoRetoDiario = "numeria" | "geografia" | "enigmia" | "quimia" | "anatomia" | "melodia";

export const TOTAL_PREGUNTAS_RETO = 45;

export interface PreguntaRetoDiario {
  mundo: MundoRetoDiario;
  enunciado: string;
  opciones: string[];
  respuesta: string;
  // Payloads visuales opcionales — mismo shape que cada mundo ya usa
  // en su propio SprintRunner, para reusar Pentagrama.tsx/
  // FiguraRitmicaIcono.tsx tal cual en el reto diario.
  notasMelodia?: NotaMusical[];
  disposicionMelodia?: "secuencial" | "simultanea";
  figuraMelodia?: FiguraRitmica;
}

const NOMBRE_CONTINENTE: Record<Continente, string> = {
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
};

function hashFecha(fecha: string): number {
  let h = 0;
  for (let i = 0; i < fecha.length; i++) {
    h = (Math.imul(31, h) + fecha.charCodeAt(i)) | 0;
  }
  return h;
}

function randomIntRng(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function elegirRng<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function mezclarRng<T>(rng: () => number, arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Nivel medio fijo (3-7) para las 5 ciudades "de calibración propia" —
// el reto diario es un evento social/de constancia, no calibra
// dificultad personal (nunca llama a actualizarSkillLevel), así que no
// hace falta leer el nivel real del usuario para armarlo.
function nivelMedio(rng: () => number): number {
  return randomIntRng(rng, 3, 7);
}

function distractoresNumericos(rng: () => number, correcto: number, cantidad: number): number[] {
  const set = new Set<number>();
  const rango = Math.max(4, Math.round(Math.abs(correcto) * 0.25) + 3);
  while (set.size < cantidad) {
    const delta = randomIntRng(rng, 1, rango);
    const candidato = rng() < 0.5 ? correcto - delta : correcto + delta;
    if (candidato !== correcto) set.add(candidato);
  }
  return Array.from(set);
}

function preguntaNumeria(rng: () => number): PreguntaRetoDiario {
  const tipo = elegirRng(rng, ARITHMETIC_PROBLEM_TYPES);
  const p = generarProblema(tipo, nivelMedio(rng), undefined, rng);
  const opciones = mezclarRng(rng, [p.answer, ...distractoresNumericos(rng, p.answer, 3)]).map(String);
  return { mundo: "numeria", enunciado: `${p.a} ${p.symbol} ${p.b} = ?`, opciones, respuesta: String(p.answer) };
}

function preguntaGeografia(rng: () => number): PreguntaRetoDiario {
  const continentes: Continente[] = ["america", "europa", "africa", "asia_oceania"];
  const continente = elegirRng(rng, continentes);
  const pais = elegirRng(rng, PAISES_POR_CONTINENTE[continente]);
  const distractores = mezclarRng(rng, continentes.filter((c) => c !== continente)).slice(0, 3);
  const opciones = mezclarRng(rng, [continente, ...distractores]).map((c) => NOMBRE_CONTINENTE[c]);
  return {
    mundo: "geografia",
    enunciado: `¿En qué continente está ${pais.nombre}?`,
    opciones,
    respuesta: NOMBRE_CONTINENTE[continente],
  };
}

// Memoria queda afuera del reto diario a propósito: necesita su propia
// pantalla de memorización (ver AcertijoMemoria.tsx) antes de revelar
// la pregunta — encaja en un SprintRunner dedicado, no en un flujo
// genérico de 45 preguntas mixtas con las otras 5 ciudades.
const CATEGORIAS_ENIGMIA_RETO: CategoriaGenerada[] = ["patrones", "computacional"];

function preguntaEnigmia(rng: () => number): PreguntaRetoDiario {
  const categoria = elegirRng(rng, CATEGORIAS_ENIGMIA_RETO);
  const p = conRngSembradoEnigmia(rng, () => generarAcertijoProcedural(categoria, nivelMedio(rng)));
  return { mundo: "enigmia", enunciado: p.contenido.enunciado, opciones: p.contenido.opciones, respuesta: p.respuesta };
}

// "organica" queda afuera: su pregunta necesita MoleculaSVG (un
// diagrama aparte, con su propio banco de compuestos) — mismo criterio
// que "memoria" en Enigmia, no vale la pena forzarlo en un formato
// genérico de opción múltiple para esta primera versión.
const MODOS_QUIMIA_RETO: ModoQuimia[] = ["simbolos", "formulas", "tabla", "nomenclatura"];

function preguntaQuimia(rng: () => number): PreguntaRetoDiario {
  const modo = elegirRng(rng, MODOS_QUIMIA_RETO);
  const p = generarPreguntaQuimia(modo, nivelMedio(rng), new Set(), rng);
  return { mundo: "quimia", enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
}

// "oseo" queda afuera: es el único modo con preguntas de tipo "click"
// sobre el esqueleto (EsqueletoClickeable) — los otros 3 modos de
// Anatomía son 100% opción múltiple siempre, mismo criterio que
// organica/memoria arriba: sin forzar un click en un formato genérico.
const MODOS_ANATOMIA_RETO: ModoAnatomia[] = ["muscular", "organos", "nervioso"];

function preguntaAnatomia(rng: () => number): PreguntaRetoDiario {
  const modo = elegirRng(rng, MODOS_ANATOMIA_RETO);
  const p = generarPreguntaAnatomia(modo, nivelMedio(rng), new Set(), rng);
  if (p.tipo === "click") {
    // No debería pasar nunca para estos 3 modos (ver comentario
    // arriba) — guard defensivo, nunca un crash si algún día cambia.
    return { mundo: "anatomia", enunciado: p.enunciado, opciones: [p.respuesta], respuesta: p.respuesta };
  }
  return { mundo: "anatomia", enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
}

const MODOS_MELODIA_RETO: ModoMelodia[] = ["fundamentos", "lectura", "alteraciones", "escalas", "acordes"];

function preguntaMelodia(rng: () => number): PreguntaRetoDiario {
  const modo = elegirRng(rng, MODOS_MELODIA_RETO);
  const p = conRngSembradoMelodia(rng, () => generarPreguntaMelodia(modo, nivelMedio(rng)));
  const base: PreguntaRetoDiario = { mundo: "melodia", enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
  if (p.tipo === "pentagrama") return { ...base, notasMelodia: p.notas, disposicionMelodia: p.disposicion };
  if (p.tipo === "texto" && p.figuraId) return { ...base, figuraMelodia: p.figuraId };
  return base;
}

const GENERADORES: Record<MundoRetoDiario, (rng: () => number) => PreguntaRetoDiario> = {
  numeria: preguntaNumeria,
  geografia: preguntaGeografia,
  enigmia: preguntaEnigmia,
  quimia: preguntaQuimia,
  anatomia: preguntaAnatomia,
  melodia: preguntaMelodia,
};

function claveDePregunta(p: PreguntaRetoDiario): string {
  return `${p.mundo}|${p.enunciado}|${p.respuesta}`;
}

// fechaIso: "YYYY-MM-DD". Se puede llamar tanto en el servidor como en
// el cliente — determinístico, siempre da lo mismo para la misma
// fecha Y el mismo set de mundosDesbloqueados (dos usuarios con las
// mismas ciudades desbloqueadas ven exactamente las mismas 45
// preguntas ese día; si desbloquearon ciudades distintas, divergen a
// partir de ahí — es lo máximo de "semilla compartida" que tiene
// sentido una vez que el desbloqueo es por cuenta).
export function generarRetoDelDia(fechaIso: string, mundosDesbloqueados: MundoRetoDiario[]): PreguntaRetoDiario[] {
  const pool = mundosDesbloqueados.length > 0 ? mundosDesbloqueados : (["numeria"] as MundoRetoDiario[]);
  const rng = mulberry32(hashFecha(fechaIso));
  const usados = new Set<string>();
  const preguntas: PreguntaRetoDiario[] = [];
  const MAX_INTENTOS = 15;

  for (let i = 0; i < TOTAL_PREGUNTAS_RETO; i++) {
    const mundo = elegirRng(rng, pool);
    let intento: PreguntaRetoDiario | null = null;
    for (let intentos = 0; intentos < MAX_INTENTOS; intentos++) {
      intento = GENERADORES[mundo](rng);
      if (!usados.has(claveDePregunta(intento))) break;
    }
    usados.add(claveDePregunta(intento!));
    preguntas.push(intento!);
  }
  return preguntas;
}
