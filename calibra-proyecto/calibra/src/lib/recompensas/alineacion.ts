import { alineacionEnCurso, DURACION_EVENTO_MS, PRIMERA_ALINEACION_MS, proximaAlineacion } from "@/lib/ciudades/cicloDia";

// Tipo mínimo del cliente: así sirve el de la web y el de la app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

// La Gran Alineación (decisiones del 2026-10-18, PENDIENTES 66; base en 0290): cada 28
// días, 3 horas. Exp ×2, Chispas ×2, constelaciones ×2; un sello numerado por jugar
// una partida, la Cápsula de la Alineación por 3, y la meta de comunidad (300 Chispas
// a cada uno que jugó, si entre todos se llega).

export const PARTIDAS_PARA_CAPSULA = 3;
export const CHISPAS_COMUNIDAD = 300;
// El cartel aparece en Inicio desde 3 días antes.
export const AVISO_PREVIO_MS = 3 * 86_400_000;

export interface EstadoAlineacionServidor {
  numero: number;
  en_curso: boolean;
  inicio: string;
  fin: string;
  partidas: number;
  respuestas: number;
  xp: number;
  chispas: number;
  sello: boolean;
  capsula: boolean;
  comunidad_respuestas: number;
  comunidad_meta: number;
  comunidad_lograda: boolean;
  premio_comunidad: boolean;
  sellos: number[];
}

// Si la base todavía no tiene 0290, devuelve null (la interfaz muestra solo el reloj).
export async function estadoAlineacionServidor(sb: SupabaseClient): Promise<EstadoAlineacionServidor | null> {
  const { data, error } = await sb.rpc("estado_alineacion");
  if (error) return null;
  const fila = (data as EstadoAlineacionServidor[] | null)?.[0];
  return fila ? { ...fila, comunidad_respuestas: Number(fila.comunidad_respuestas), sellos: fila.sellos ?? [] } : null;
}

export async function reclamarPremioComunidad(sb: SupabaseClient): Promise<{ chispas: number; puntos_total: number }> {
  const { data, error } = await sb.rpc("reclamar_premio_comunidad_alineacion");
  if (error) throw error;
  return (data as { chispas: number; puntos_total: number }[])[0];
}

export async function sellosAlineacionDe(sb: SupabaseClient, userId: string): Promise<number[]> {
  const { data, error } = await sb.rpc("sellos_alineacion_de", { p_user: userId });
  return error || !Array.isArray(data) ? [] : (data as number[]);
}

// En qué momento del ciclo estamos, solo con el reloj (igual en todos los dispositivos):
// «antes» (3 días antes), «durante» (las 3 horas), «despues» (hasta 3 días después, para
// el resumen y el premio de comunidad) o «nada».
export type MomentoAlineacion = "antes" | "durante" | "despues" | "nada";

export function momentoAlineacion(ahoraMs: number): { momento: MomentoAlineacion; numero: number; inicio: number; fin: number } {
  const actual = alineacionEnCurso(ahoraMs);
  if (actual) return { momento: "durante", numero: numeroDe(actual.inicio), inicio: actual.inicio, fin: actual.fin };
  const proxima = proximaAlineacion(ahoraMs);
  const anterior = proxima - 28 * 86_400_000;
  if (anterior >= PRIMERA_ALINEACION_MS && ahoraMs - (anterior + DURACION_EVENTO_MS) < AVISO_PREVIO_MS) {
    return { momento: "despues", numero: numeroDe(anterior), inicio: anterior, fin: anterior + DURACION_EVENTO_MS };
  }
  if (proxima - ahoraMs <= AVISO_PREVIO_MS) return { momento: "antes", numero: numeroDe(proxima), inicio: proxima, fin: proxima + DURACION_EVENTO_MS };
  return { momento: "nada", numero: numeroDe(proxima), inicio: proxima, fin: proxima + DURACION_EVENTO_MS };
}

function numeroDe(inicioMs: number): number {
  return Math.round((inicioMs - PRIMERA_ALINEACION_MS) / (28 * 86_400_000)) + 1;
}

export function mensajeErrorAlineacion(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/no se cumplio/i.test(m)) return "La meta de comunidad no se cumplió esta vez.";
  if (/juega una partida/i.test(m)) return "Para este premio había que jugar una partida durante la Alineación.";
  if (/ya reclamaste/i.test(m)) return "Ya reclamaste este premio.";
  return "No se pudo. Inténtalo de nuevo.";
}
