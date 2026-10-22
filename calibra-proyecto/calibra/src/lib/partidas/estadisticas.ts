// Estadísticas de una partida a partir de lo que ya se guarda de cada respuesta:
// acierto + tiempo, en orden (duel_results.respuestas, la foto de
// partidas_compartidas). No depende de la pantalla de combate: solo de esa lista.
// Lo usan la web y la app (la app lo importa con `@/`).

export interface RespuestaPartida {
  correct: boolean;
  timeMs: number;
}

export interface EstadisticasPartida {
  aciertos: number;
  errores: number;
  total: number;
  precision: number | null;
  rachaMax: number;
  tiempoPromedioMs: number | null;
  masRapidaMs: number | null;
  masLentaMs: number | null;
  tiempoTotalMs: number;
}

const TIEMPO_MAX_MS = 10 * 60_000;

// Lo que viene de la base es jsonb: se valida cada elemento y se descarta lo raro.
export function normalizarRespuestas(valor: unknown): RespuestaPartida[] | null {
  if (!Array.isArray(valor)) return null;
  const out: RespuestaPartida[] = [];
  for (const item of valor) {
    if (!item || typeof item !== "object") continue;
    const r = item as { correct?: unknown; timeMs?: unknown };
    const t = typeof r.timeMs === "number" && Number.isFinite(r.timeMs) ? Math.min(TIEMPO_MAX_MS, Math.max(0, Math.round(r.timeMs))) : 0;
    out.push({ correct: r.correct === true, timeMs: t });
  }
  return out.length > 0 ? out : null;
}

export function rachaMaxima(respuestas: readonly RespuestaPartida[]): number {
  let actual = 0;
  let max = 0;
  for (const r of respuestas) {
    actual = r.correct ? actual + 1 : 0;
    if (actual > max) max = actual;
  }
  return max;
}

export function estadisticasDe(respuestas: readonly RespuestaPartida[]): EstadisticasPartida {
  const total = respuestas.length;
  const aciertos = respuestas.filter((r) => r.correct).length;
  const tiempos = respuestas.map((r) => r.timeMs);
  const tiempoTotalMs = tiempos.reduce((a, b) => a + b, 0);
  return {
    aciertos,
    errores: total - aciertos,
    total,
    precision: total > 0 ? aciertos / total : null,
    rachaMax: rachaMaxima(respuestas),
    tiempoPromedioMs: total > 0 ? tiempoTotalMs / total : null,
    masRapidaMs: total > 0 ? Math.min(...tiempos) : null,
    masLentaMs: total > 0 ? Math.max(...tiempos) : null,
    tiempoTotalMs,
  };
}

// Repetición: cuántas respuestas había dado el jugador a los `ms` de empezar
// (las respuestas se suceden una tras otra, cada una con su tiempo).
export function estadoEnElInstante(respuestas: readonly RespuestaPartida[], ms: number): { respondidas: number; correctas: number } {
  let acumulado = 0;
  let respondidas = 0;
  let correctas = 0;
  for (const r of respuestas) {
    acumulado += r.timeMs;
    if (acumulado > ms) break;
    respondidas++;
    if (r.correct) correctas++;
  }
  return { respondidas, correctas };
}

// Duración de la repetición: la del que más tardó.
export function duracionRepeticion(...lados: (readonly RespuestaPartida[] | null | undefined)[]): number {
  return Math.max(0, ...lados.map((l) => (l ?? []).reduce((a, r) => a + r.timeMs, 0)));
}

// «4,2 s» / «4.2 s» — una cifra decimal.
export function segundosTexto(ms: number | null | undefined, locale = "es"): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  return `${(ms / 1000).toLocaleString(locale === "en" ? "en-US" : "es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}
