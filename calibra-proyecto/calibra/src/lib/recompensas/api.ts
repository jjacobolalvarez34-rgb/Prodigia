// Llamadas a la base de las recompensas (0249) y de la tienda ampliada (0248).
// Reciben el cliente de Supabase para servir igual en la web (cliente del
// navegador) y en la app. Todas las reglas (azar, precios, garantía, misiones)
// viven en la base: acá solo se piden y se devuelven los datos.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipoCapsula } from "./catalogo";

export interface Capsula {
  id: string;
  tipo: TipoCapsula;
  mundo: string | null;
  detalle: { nivel?: number; dias?: number; puesto?: number; dominio?: boolean } | null;
  creada_at: string;
}

export interface ContenidoCapsula {
  premio: string;
  peso: number;
  minimo: number;
  maximo: number;
}

export interface PremioCapsula {
  premio: string;
  slug: string | null;
  nombre: string | null;
  rareza: string | null;
  cantidad: number;
  convertido: boolean;
  puntos_total: number;
}

export interface Mision {
  tipo: string;
  mundo: string | null;
  meta: number;
  progreso: number;
  recompensa: number;
  reclamada: boolean;
}

export interface EstadoCalendario {
  dia: number;
  reclamado_hoy: boolean;
  puede_reclamar: boolean;
}

export interface PiezaColeccion {
  mundo: string;
  slug: string;
  categoria: string;
  nombre: string;
  rareza: string;
  vendible: boolean;
  tengo: boolean;
}

export interface Regalo {
  id: string;
  de: string;
  nombre: string | null;
  avatar_url: string | null;
  tipo: "hielo" | "escudo";
  creado_at: string;
}

export interface Pendientes {
  capsulas: number;
  misiones: number;
  calendario: boolean;
  regalos: number;
}

function filas<T>(data: unknown): T[] {
  return (data as T[] | null) ?? [];
}

// Mensaje de error de una RPC sin el prefijo técnico.
export function mensajeError(e: unknown): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/faltan Chispas/i.test(m)) return "Te faltan Chispas.";
  if (/ya tienes/i.test(m)) return "Ya lo tienes.";
  if (/temporada/i.test(m)) return "Ese marco ya no está a la venta este mes.";
  if (/ya mandaste/i.test(m)) return "Ya mandaste tu regalo de hoy.";
  if (/juega una partida/i.test(m)) return "Juega una partida hoy para reclamarlo.";
  if (/ya reclamaste/i.test(m)) return "Ya lo reclamaste.";
  if (/todavia no completaste/i.test(m)) return "Todavía no completaste esa misión.";
  return "No se pudo. Inténtalo de nuevo.";
}

export async function revisarRecompensas(sb: SupabaseClient): Promise<{ nuevas: number; pendientes: number }> {
  const { data } = await sb.rpc("revisar_recompensas");
  return filas<{ nuevas: number; pendientes: number }>(data)[0] ?? { nuevas: 0, pendientes: 0 };
}

export async function recompensasPendientes(sb: SupabaseClient): Promise<Pendientes> {
  const { data } = await sb.rpc("recompensas_pendientes");
  return filas<Pendientes>(data)[0] ?? { capsulas: 0, misiones: 0, calendario: false, regalos: 0 };
}

export function totalPendientes(p: Pendientes): number {
  return p.capsulas + p.misiones + (p.calendario ? 1 : 0) + p.regalos;
}

export async function misCapsulas(sb: SupabaseClient): Promise<Capsula[]> {
  const { data } = await sb.rpc("mis_capsulas");
  return filas<Capsula>(data);
}

export async function contenidoCapsula(sb: SupabaseClient, tipo: TipoCapsula): Promise<ContenidoCapsula[]> {
  const { data } = await sb.rpc("contenido_capsula", { p_tipo: tipo });
  return filas<ContenidoCapsula>(data);
}

export async function abrirCapsula(sb: SupabaseClient, id: string): Promise<PremioCapsula> {
  const { data, error } = await sb.rpc("abrir_capsula", { p_id: id });
  if (error) throw error;
  return filas<PremioCapsula>(data)[0];
}

export async function misMisiones(sb: SupabaseClient): Promise<Mision[]> {
  const { data } = await sb.rpc("mis_misiones");
  return filas<Mision>(data);
}

export async function reclamarMision(sb: SupabaseClient, tipo: string): Promise<{ puntos_total: number; completas: boolean; capsula: boolean }> {
  const { data, error } = await sb.rpc("reclamar_mision", { p_tipo: tipo });
  if (error) throw error;
  return filas<{ puntos_total: number; completas: boolean; capsula: boolean }>(data)[0];
}

export async function miCalendario(sb: SupabaseClient): Promise<EstadoCalendario | null> {
  const { data } = await sb.rpc("mi_calendario");
  return filas<EstadoCalendario>(data)[0] ?? null;
}

export async function reclamarCalendario(sb: SupabaseClient): Promise<{ dia: number; premio: string; cantidad: number; puntos_total: number }> {
  const { data, error } = await sb.rpc("reclamar_calendario");
  if (error) throw error;
  return filas<{ dia: number; premio: string; cantidad: number; puntos_total: number }>(data)[0];
}

export async function misColecciones(sb: SupabaseClient): Promise<PiezaColeccion[]> {
  const { data } = await sb.rpc("mis_colecciones");
  return filas<PiezaColeccion>(data);
}

export async function misRegalos(sb: SupabaseClient): Promise<Regalo[]> {
  const { data } = await sb.rpc("mis_regalos");
  return filas<Regalo>(data);
}

export async function aQuienRegaleHoy(sb: SupabaseClient): Promise<string | null> {
  const { data } = await sb.rpc("a_quien_regale_hoy");
  return (data as string | null) ?? null;
}

export async function regalarAAmigo(sb: SupabaseClient, amigo: string, tipo: "hielo" | "escudo"): Promise<void> {
  const { error } = await sb.rpc("regalar_a_amigo", { p_amigo: amigo, p_tipo: tipo });
  if (error) throw error;
}

export async function recibirRegalo(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.rpc("recibir_regalo", { p_id: id });
  if (error) throw error;
}

export type CategoriaEquipable = "estela" | "efecto" | "sonido" | "ciudad_placa";

export async function equiparCosmetico(sb: SupabaseClient, categoria: CategoriaEquipable, valor: string | null): Promise<void> {
  const { error } = await sb.rpc("equipar_cosmetico", { p_categoria: categoria, p_valor: valor });
  if (error) throw error;
}

export async function usarAyudaPartida(sb: SupabaseClient, item: "pista" | "segunda_oportunidad"): Promise<{ pistas_disponibles: number; segundas_oportunidades_disponibles: number } | null> {
  const { data, error } = await sb.rpc("usar_ayuda_partida", { p_item: item });
  if (error) return null;
  return filas<{ pistas_disponibles: number; segundas_oportunidades_disponibles: number }>(data)[0] ?? null;
}

// Lo equipado y lo desbloqueado de las categorías nuevas.
export interface CosmeticosNuevos {
  estela: string;
  estelas: string[];
  efecto: string;
  efectos: string[];
  sonido: string;
  sonidos: string[];
  emotes: string[];
  ciudadPlaca: string | null;
  ciudadesPlaca: string[];
  pistas: number;
  segundas: number;
}

export const COLUMNAS_COSMETICOS_NUEVOS =
  "estela_racha, estelas_desbloqueadas, efecto_acierto, efectos_desbloqueados, sonido_acierto, sonidos_desbloqueados, emotes_desbloqueados, ciudad_placa, ciudades_placa_desbloqueadas, pistas_disponibles, segundas_oportunidades_disponibles";

export function cosmeticosDesdeFila(f: Record<string, unknown> | null | undefined): CosmeticosNuevos {
  return {
    estela: (f?.estela_racha as string) ?? "clasica",
    estelas: (f?.estelas_desbloqueadas as string[]) ?? [],
    efecto: (f?.efecto_acierto as string) ?? "chispas",
    efectos: (f?.efectos_desbloqueados as string[]) ?? [],
    sonido: (f?.sonido_acierto as string) ?? "clasico",
    sonidos: (f?.sonidos_desbloqueados as string[]) ?? [],
    emotes: (f?.emotes_desbloqueados as string[]) ?? ["bien_jugado", "hola"],
    ciudadPlaca: (f?.ciudad_placa as string | null) ?? null,
    ciudadesPlaca: (f?.ciudades_placa_desbloqueadas as string[]) ?? [],
    pistas: (f?.pistas_disponibles as number) ?? 0,
    segundas: (f?.segundas_oportunidades_disponibles as number) ?? 0,
  };
}

export async function cargarCosmeticosNuevos(sb: SupabaseClient, userId: string): Promise<CosmeticosNuevos> {
  const { data } = await sb.from("profiles").select(COLUMNAS_COSMETICOS_NUEVOS).eq("id", userId).maybeSingle();
  return cosmeticosDesdeFila(data as Record<string, unknown> | null);
}
