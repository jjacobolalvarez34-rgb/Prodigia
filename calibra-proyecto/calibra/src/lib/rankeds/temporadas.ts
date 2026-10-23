import { CAPSULAS, type TipoCapsula } from "@/lib/recompensas/catalogo";
import { fijarUmbralProdigio, rangoDeSlug } from "@/types/database";

// Tipo mínimo del cliente: así sirve el de la web y el de la app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

// Temporadas de rankeds (0296, pedido 2026-10-21): una por cada Gran Alineación.
// La temporada n termina al ACABAR la Alineación número n (0302: sus 3 horas, que
// valen doble, son el cierre). La primera: 25/10/2026 02:00 UTC; después cada 28 días.
// Mismas cuentas que temporada_ranked_de() de la base.
export const FIN_TEMPORADA_1_MS = Date.UTC(2026, 9, 25, 2, 0, 0);
export const DURACION_TEMPORADA_MS = 28 * 86_400_000;

export function temporadaRankedDe(ms: number): number {
  return Math.max(1, Math.floor((ms - (FIN_TEMPORADA_1_MS - DURACION_TEMPORADA_MS)) / DURACION_TEMPORADA_MS) + 1);
}

export function finTemporadaMs(temporada: number): number {
  return FIN_TEMPORADA_1_MS + (temporada - 1) * DURACION_TEMPORADA_MS;
}

export interface RecompensaTemporada {
  temporada: number;
  rango: string;
  veces: number;
  elo_max: number;
  partidas: number;
  capsulas: string[];
  titulo: string | null;
}

// «v2»: cuántas temporadas llegaste a ese rango (o más arriba).
export function tierTemporada(veces: number): string {
  return `v${Math.max(1, veces)}`;
}

export function nombreRango(slug: string): string {
  return rangoDeSlug(slug)?.nombre ?? slug;
}

export function nombreCapsula(tipo: string): string {
  return CAPSULAS[tipo as TipoCapsula]?.nombre ?? "Cápsula";
}

// Cápsulas repetidas juntas: «2 × Cápsula supernova».
export function capsulasAgrupadas(tipos: string[]): { tipo: string; nombre: string; cantidad: number }[] {
  const mapa = new Map<string, number>();
  for (const t of tipos) mapa.set(t, (mapa.get(t) ?? 0) + 1);
  return [...mapa.entries()].map(([tipo, cantidad]) => ({ tipo, nombre: nombreCapsula(tipo), cantidad }));
}

// Si la migración 0296 no se corrió todavía, no hay recompensa (sin errores en pantalla).
export async function recompensaTemporadaPendiente(sb: SupabaseClient): Promise<RecompensaTemporada | null> {
  const { data, error } = await sb.rpc("recompensa_temporada_pendiente");
  if (error) return null;
  const fila = (Array.isArray(data) ? data[0] : data) as RecompensaTemporada | undefined;
  return fila ?? null;
}

export async function reclamarTemporadaRanked(sb: SupabaseClient, temporada: number): Promise<void> {
  const { error } = await sb.rpc("reclamar_temporada_ranked", { p_temporada: temporada });
  if (error) throw error;
}

export async function mejorTemporadaRanked(sb: SupabaseClient, userId: string): Promise<{ rango: string; veces: number } | null> {
  const { data, error } = await sb.rpc("mejor_temporada_ranked", { p_user: userId });
  if (error) return null;
  const fila = (Array.isArray(data) ? data[0] : data) as { rango: string | null; veces: number } | undefined;
  return fila?.rango ? { rango: fila.rango, veces: fila.veces } : null;
}

// Reinicio suave de la temporada nueva (0302) para mí, por si pg_cron no lo hizo
// todavía; idempotente. Sin la migración, no hace nada.
export async function aplicarMiReinicioTemporada(sb: SupabaseClient): Promise<void> {
  await sb.rpc("aplicar_mi_reinicio_temporada");
}

// El corte de Prodigio (top 100) para que rangoDeElo lo sepa. Una vez por arranque.
let umbralPedido = false;
export async function cargarUmbralProdigio(sb: SupabaseClient): Promise<void> {
  if (umbralPedido) return;
  umbralPedido = true;
  const { data, error } = await sb.rpc("umbral_prodigio");
  if (!error && typeof data === "number") fijarUmbralProdigio(data);
}
