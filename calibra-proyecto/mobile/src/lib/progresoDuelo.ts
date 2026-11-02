import AsyncStorage from "@react-native-async-storage/async-storage";

// Reconexión en un duelo, como chess.com (pedido 2026-11-02): si te sales a mitad de
// la ronda (se cae la conexión, cierras la app), al volver sigues en la pregunta donde
// ibas, con las mismas respuestas y el reloj que siguió corriendo mientras no estabas.
// Si vuelves con el tiempo ya agotado, la ronda se cierra con lo que alcanzaste a
// responder. Las preguntas salen de la semilla del duelo: para volver a la misma se
// regeneran las ya respondidas (ver los sprints).

export interface ProgresoDuelo {
  respuestas: { correct: boolean; timeMs: number }[];
  resultados: boolean[];
  xp: number;
  combo: number;
  // Lo que le quedaba al reloj al guardar (con los segundos ganados) y cuándo.
  restanteMs: number;
  guardadoEn: number;
  // Datos propios de cada sprint (fallos para el repaso, operación de Numeria…).
  extra?: unknown;
}

const PREFIJO = "prodigia:duelo:progreso:";
// Pasado esto ya no hay ronda que retomar (los duelos se cierran por ausencia a los
// pocos minutos: cerrar_duelo_por_ausencia, 0312).
const VIGENCIA_MS = 30 * 60_000;

export async function leerProgresoDuelo(duelId: string): Promise<ProgresoDuelo | null> {
  try {
    const p = JSON.parse((await AsyncStorage.getItem(PREFIJO + duelId)) ?? "null") as ProgresoDuelo | null;
    if (!p || Date.now() - p.guardadoEn > VIGENCIA_MS || !Array.isArray(p.respuestas)) return null;
    return p;
  } catch {
    return null;
  }
}

export function guardarProgresoDuelo(duelId: string, p: Omit<ProgresoDuelo, "guardadoEn">): void {
  AsyncStorage.setItem(PREFIJO + duelId, JSON.stringify({ ...p, guardadoEn: Date.now() })).catch(() => undefined);
}

export function borrarProgresoDuelo(duelId: string): void {
  AsyncStorage.removeItem(PREFIJO + duelId).catch(() => undefined);
}

// Lo que le queda al reloj ahora, contando el tiempo que pasó fuera.
export function restanteAhora(p: ProgresoDuelo): number {
  return Math.max(0, p.restanteMs - (Date.now() - p.guardadoEn));
}
