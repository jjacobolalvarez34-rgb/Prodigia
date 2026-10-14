// Reto de fin de semana (pedido 2026-10-13): sábado y domingo, 10 preguntas de 3
// ciudades al azar, iguales para todos; dos intentos y cuenta el mejor (más
// aciertos y, si empatan, menos tiempo, medido por la base). Lo comparten la web
// y la app; la base (0281) decide intentos, tiempos y premios.
export { ciudadesRetoFinde, generarRetoFinde, TOTAL_PREGUNTAS_RETO_FINDE } from "@/lib/retoDiario";

export const INTENTOS_RETO_FINDE = 2;

// Terminar el primer intento: 30 Chispas + 3 por acierto (hasta 60, unas 3 partidas).
export function chispasRetoFinde(correctos: number): number {
  return 30 + 3 * Math.max(0, Math.min(10, correctos));
}

// Puesto final del fin de semana → Cometas (se cobran desde el lunes). Hace falta
// acertar al menos MINIMO_ACIERTOS_PREMIO.
export const PREMIOS_RETO_FINDE: { hasta: number; cometas: number }[] = [
  { hasta: 1, cometas: 50 },
  { hasta: 3, cometas: 30 },
  { hasta: 10, cometas: 15 },
  { hasta: 50, cometas: 5 },
];
export const MINIMO_ACIERTOS_PREMIO = 5;

export function cometasPorPuesto(puesto: number): number {
  return PREMIOS_RETO_FINDE.find((p) => puesto <= p.hasta)?.cometas ?? 0;
}

const DIA_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

// El sábado del fin de semana en curso (UTC, igual que current_date en la base), o
// null de lunes a viernes.
export function sabadoDelFinde(ahora: Date = new Date()): string | null {
  const dia = ahora.getUTCDay();
  if (dia === 6) return iso(ahora);
  if (dia === 0) return iso(new Date(ahora.getTime() - DIA_MS));
  return null;
}

// El próximo sábado (o el de hoy, si es fin de semana).
export function proximoSabado(ahora: Date = new Date()): string {
  const actual = sabadoDelFinde(ahora);
  if (actual) return actual;
  return iso(new Date(ahora.getTime() + ((6 - ahora.getUTCDay() + 7) % 7) * DIA_MS));
}

// El último fin de semana que ya terminó (el de los premios).
export function sabadoAnterior(ahora: Date = new Date()): string {
  const lunes = new Date(ahora.getTime() - ((ahora.getUTCDay() + 6) % 7) * DIA_MS);
  return iso(new Date(lunes.getTime() - 2 * DIA_MS));
}

// Cuánto falta para que empiece (lunes a viernes) o termine (fin de semana), en ms.
export function msHastaCambioFinde(ahora: Date = new Date()): number {
  const sab = sabadoDelFinde(ahora);
  const objetivo = sab ? Date.parse(`${sab}T00:00:00Z`) + 2 * DIA_MS : Date.parse(`${proximoSabado(ahora)}T00:00:00Z`);
  return Math.max(0, objetivo - ahora.getTime());
}

// Cuándo empieza el reto en la hora de quien lo mira (revisión 2026-10-14: el reto
// sigue el día UTC, así que en Latinoamérica arranca el viernes por la tarde y decir
// «el sábado» confundía). Ej.: «viernes 19:00».
export function inicioLocalFinde(sabadoIso: string, locale = "es"): string {
  return new Date(`${sabadoIso}T00:00:00Z`).toLocaleString(locale, { weekday: "long", hour: "2-digit", minute: "2-digit" });
}
