// Evento "doble experiencia": cada día UN mundo da el doble de Exp en todas sus
// partidas (en la app cae un paquete en paracaídas sobre su ciudad; en la web, un
// cartel en la portada y en el mundo). Rota sola, sin configuración: la misma
// fórmula vive en la base (mundo_doble_experiencia, 0247), que es la que de verdad
// duplica la Exp al guardar cada intento. Si se cambia acá, se cambia allá.
export const ORDEN_MUNDOS_EVENTO = [
  "numeria",
  "enigmia",
  "geografia",
  "quimia",
  "anatomia",
  "melodia",
  "trigonometria",
  "historia",
  "calculia",
  "circuitia",
  "estadistica",
  "naipia",
  "codia",
  "dinamia",
  "vitalia",
] as const;

export type MundoEvento = (typeof ORDEN_MUNDOS_EVENTO)[number];

export const MULTIPLICADOR_DOBLE_EXPERIENCIA = 2;

// Día en UTC (la base usa current_date, que en Supabase es UTC).
export function hoyUtcIso(ahora: Date = new Date()): string {
  return ahora.toISOString().slice(0, 10);
}

export function mundoDobleExperiencia(fechaIso: string = hoyUtcIso()): MundoEvento {
  const dia = Math.floor(Date.parse(`${fechaIso}T00:00:00Z`) / 86_400_000);
  const i = (((dia * 7 + 3) % 15) + 15) % 15;
  return ORDEN_MUNDOS_EVENTO[i];
}

// Milisegundos hasta que termina el evento de hoy (medianoche UTC).
export function msHastaFinDelEvento(ahora: Date = new Date()): number {
  const fin = Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate() + 1);
  return Math.max(0, fin - ahora.getTime());
}
