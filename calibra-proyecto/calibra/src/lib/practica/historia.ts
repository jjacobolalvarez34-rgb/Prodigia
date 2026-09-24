// Mundo Historia — 4 modos, todos de opción múltiple: cronología, personajes,
// causa y efecto y fechas exactas. Desde el rediseño (docs/PARIDAD_MUNDOS.md,
// «Historia: rediseño del mundo») las preguntas NO están escritas a mano una por
// una: se DERIVAN de la tabla canónica de hechos y personajes
// (src/lib/historia/hechos.ts y personajes.ts), así que agregar contenido es
// agregar filas, y la consistencia (años, siglos, orden, anacronismos) queda
// garantizada por construcción y por los tests de la tabla.
//
// Alcance: SOLO historia universal (sin bloque ni banco nacional). Incluye el
// siglo XX y hasta hoy únicamente con hechos de amplio consenso, con fecha y
// protagonistas y sin interpretación política ni cifras discutidas.
//
// Dificultad: escala DECLARATIVA en historiaEscala.ts (tipos de pregunta y
// prominencia de lo que se pregunta, ambos crecientes de 1 a 10).
//
// API pública (sin cambios): generarPreguntaHistoria(modo, nivel, usados) y
// conRngSembrado(rng, fn) para el reto diario: misma semilla, mismas preguntas.

import { GENERADORES_CRONOLOGIA } from "./historiaCronologia";
import { GENERADORES_PERSONAJES } from "./historiaPersonajes";
import { GENERADORES_CAUSAS } from "./historiaCausas";
import { GENERADORES_FECHAS } from "./historiaFechas";
import { activosEnNivel } from "./historiaEscala";
import { barajar, type Contexto, type Generada, type Generador, type ModoHistoria, type PreguntaHistoria, type Rng } from "./historiaComun";

export { NOMBRE_MODO_HISTORIA } from "./historiaComun";
export type { ModoHistoria, PreguntaHistoria, Rng, Generada };

const GENERADORES: Record<ModoHistoria, Record<string, Generador>> = {
  cronologia: GENERADORES_CRONOLOGIA,
  personajes: GENERADORES_PERSONAJES,
  causaefecto: GENERADORES_CAUSAS,
  fechas: GENERADORES_FECHAS,
};

// Orden aleatorio de los tipos activos, ponderado por su peso (muestreo sin
// reposición): el primero es el más probable, pero ante un tipo agotado se prueba el siguiente.
function ordenPonderado(rng: Rng, activos: { tipo: string; peso: number; dif: number }[]): { tipo: string; peso: number; dif: number }[] {
  const restantes = [...activos];
  const salida: typeof restantes = [];
  while (restantes.length > 0) {
    const total = restantes.reduce((a, x) => a + x.peso, 0);
    let r = rng() * total;
    let i = 0;
    for (; i < restantes.length - 1; i++) {
      r -= restantes[i].peso;
      if (r < 0) break;
    }
    salida.push(restantes[i]);
    restantes.splice(i, 1);
  }
  return salida;
}

// Como generarPreguntaHistoria pero devuelve además el tipo, los ids y la
// prominencia (lo usan los tests para recalcular cada respuesta desde la tabla).
export function generarDetallado(modo: ModoHistoria, nivel: number, usados: Set<string>, rng: Rng): Generada {
  const activos = activosEnNivel(modo, nivel);
  const gens = GENERADORES[modo];
  for (const relajar of [false, true]) {
    for (const a of ordenPonderado(rng, activos)) {
      const contexto: Contexto = { nivel: Math.min(10, Math.max(1, Math.round(nivel))), dif: a.dif, usados, rng, relajar };
      const g = gens[a.tipo](contexto);
      if (g) return g;
    }
  }
  // Nunca debería llegar acá (los tests fijan que cada tipo produce preguntas).
  for (const tipo of barajar(rng, Object.keys(gens))) {
    const g = gens[tipo]({ nivel: 5, dif: 0, usados: new Set(), rng, relajar: true });
    if (g) return g;
  }
  throw new Error(`Historia: ningún generador pudo armar una pregunta (${modo}, nivel ${nivel})`);
}

// ---------- Sin semilla en la práctica normal (Math.random); con semilla en el
// Reto Diario, mismo patrón que trigonometria.ts. ----------
let rngActual: Rng = Math.random;

export function conRngSembrado<T>(rng: Rng, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

export function generarPreguntaHistoria(modo: ModoHistoria, nivel: number, usados: Set<string> = new Set()): PreguntaHistoria {
  return generarDetallado(modo, nivel, usados, rngActual).pregunta;
}
