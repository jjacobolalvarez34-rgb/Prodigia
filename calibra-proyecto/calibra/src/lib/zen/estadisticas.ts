// Estadísticas del final de una partida Zen (pedido 2026-10-23), web y app: cuánto
// tardaste en cada respuesta, la más rápida y la más lenta, la precisión, cuántas
// salieron al primer intento y la mejor racha de aciertos seguidos.

export interface RegistroZen {
  correcto: boolean;
  // Desde que la pregunta quedó a la vista (después de memorizar) hasta cerrarla.
  ms: number;
  // Lo que respondió en cada intento (1 o 2; vacío si fue directo a «Ver respuesta»).
  intentos: string[];
  pista: boolean;
  nivel: number;
}

export interface EstadisticasZen {
  total: number;
  aciertos: number;
  // 0-100, redondeado.
  precision: number;
  alPrimero: number;
  alSegundo: number;
  pistas: number;
  totalMs: number;
  promedioMs: number;
  // Índices (0…) de la respuesta más rápida y más lenta; null si no hay respuestas.
  masRapida: number | null;
  masLenta: number | null;
  rachaMax: number;
}

export function estadisticasZen(registros: RegistroZen[]): EstadisticasZen {
  const total = registros.length;
  const aciertos = registros.filter((r) => r.correcto).length;
  const alPrimero = registros.filter((r) => r.correcto && r.intentos.length <= 1).length;
  let masRapida: number | null = null;
  let masLenta: number | null = null;
  let racha = 0;
  let rachaMax = 0;
  let totalMs = 0;
  registros.forEach((r, i) => {
    totalMs += r.ms;
    if (masRapida == null || r.ms < registros[masRapida].ms) masRapida = i;
    if (masLenta == null || r.ms > registros[masLenta].ms) masLenta = i;
    racha = r.correcto ? racha + 1 : 0;
    rachaMax = Math.max(rachaMax, racha);
  });
  return {
    total,
    aciertos,
    precision: total ? Math.round((aciertos / total) * 100) : 0,
    alPrimero,
    alSegundo: aciertos - alPrimero,
    pistas: registros.filter((r) => r.pista).length,
    totalMs,
    promedioMs: total ? Math.round(totalMs / total) : 0,
    masRapida,
    masLenta,
    rachaMax,
  };
}

// «4,2 s», «12 s», «1 min 05 s». `decimal`: separador decimal del idioma.
export function formatearDuracion(ms: number, decimal = ","): string {
  const s = Math.max(0, ms) / 1000;
  if (s < 10) return `${s.toFixed(1).replace(".", decimal)} s`;
  if (s < 60) return `${Math.round(s)} s`;
  const total = Math.round(s);
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, "0")} s`;
}

// Cómo salió cada pregunta, para colorear la barra del «ritmo».
export type ResultadoBarra = "primero" | "segundo" | "fallada";

export function resultadoDe(r: RegistroZen): ResultadoBarra {
  return !r.correcto ? "fallada" : r.intentos.length <= 1 ? "primero" : "segundo";
}
