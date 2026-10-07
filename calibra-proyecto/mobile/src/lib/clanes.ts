// Clanes: mismo flujo que clanes/page.tsx + ClanesClient.tsx de la web (cierre
// perezoso de la guerra, misión semanal de 3000 Exp con su botón de reclamar,
// miembros, rival de la semana, chat y mundo de clanes).
import { tierCiudadDeNivel } from "@/lib/clanes/tierCiudad";
import { urlAbsoluta } from "./entorno";
import { supabase } from "./supabase";

export type Rol = "fundador" | "guia" | "miembro";
export const COSTO_CREAR_CLAN = 5000;
export const COLORES_CLAN = ["#6C4CF1", "#0E9F6E", "#1E7A8C", "#C026D3", "#FF8A3D", "#3FB88B", "#FFC53D", "#FF6B6B"];

export interface MiClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  descripcion: string;
  rol: Rol;
  cantidad_miembros: number;
  nivel_clan: number;
  imagen_url: string | null;
  xp_acumulado_historico: number;
}

export interface Miembro {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  rol: Rol;
  chispas_semana: number;
  xp_aportado: number;
  unido_at: string;
}

export interface Mision {
  id: string;
  objetivo_cantidad: number;
  progreso_actual: number;
  recompensa_chispas: number;
  completada: boolean;
  semana_inicio: string;
  reclamada: boolean;
}

export interface RivalClan {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
  mi_xp_semana: number;
}

export interface ClanRanking {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  xp_semana: number;
  cantidad_miembros: number;
  nivel_clan: number;
}

export interface DatosClan {
  clan: MiClan | null;
  miembros: Miembro[];
  mision: Mision | null;
  rival: RivalClan | null;
  xpNivel: { desde: number; hasta: number } | null;
  ranking: ClanRanking[];
}

export async function cargarMiClan(): Promise<DatosClan> {
  await supabase.rpc("procesar_cierre_semana_clanes");
  const [{ data: filas }, { data: ranking }] = await Promise.all([supabase.rpc("mi_clan"), supabase.rpc("ranking_clanes_semanal")]);
  const clan = (filas as MiClan[] | null)?.[0] ?? null;
  const rankingLista = ((ranking as ClanRanking[] | null) ?? []).map((r) => ({ ...r, xp_semana: Number(r.xp_semana), cantidad_miembros: Number(r.cantidad_miembros) }));
  if (!clan) return { clan: null, miembros: [], mision: null, rival: null, xpNivel: null, ranking: rankingLista };

  await supabase.rpc("asegurar_mision_semanal", { p_clan_id: clan.clan_id });
  const [{ data: miembros }, { data: mision }, { data: rival }, { data: desde }, { data: hasta }] = await Promise.all([
    supabase.rpc("miembros_de_clan", { p_clan_id: clan.clan_id }),
    supabase.rpc("mision_actual_de_clan", { p_clan_id: clan.clan_id }),
    supabase.rpc("rival_de_clan", { p_clan_id: clan.clan_id }),
    supabase.rpc("xp_requerido_nivel_clan", { p_nivel: clan.nivel_clan }),
    supabase.rpc("xp_requerido_nivel_clan", { p_nivel: clan.nivel_clan + 1 }),
  ]);
  return {
    clan: { ...clan, cantidad_miembros: Number(clan.cantidad_miembros), xp_acumulado_historico: Number(clan.xp_acumulado_historico ?? 0) },
    miembros: ((miembros as Miembro[] | null) ?? []).map((m) => ({ ...m, xp_aportado: Number(m.xp_aportado ?? 0) })),
    mision: (mision as Mision[] | null)?.[0] ?? null,
    rival: (() => {
      const r = (rival as RivalClan[] | null)?.[0];
      return r ? { ...r, xp_semana: Number(r.xp_semana), mi_xp_semana: Number(r.mi_xp_semana) } : null;
    })(),
    xpNivel: desde != null && hasta != null ? { desde: Number(desde), hasta: Number(hasta) } : null,
    ranking: rankingLista,
  };
}

export async function reclamarMision(): Promise<{ chispas: number; total: number }> {
  const { data, error } = await supabase.rpc("reclamar_mision_clan");
  if (error) throw error;
  const f = (data as { out_chispas: number; out_puntos_total: number }[])[0];
  return { chispas: f.out_chispas, total: f.out_puntos_total };
}

export async function salirDelClan() {
  const { error } = await supabase.rpc("salir_del_clan");
  if (error) throw error;
}

export async function cambiarRol(userId: string, rol: "guia" | "miembro") {
  const { error } = await supabase.rpc("cambiar_rol_miembro", { p_user_id: userId, p_nuevo_rol: rol });
  if (error) throw error;
}

export async function buscarClanes(q: string) {
  const { data } = await supabase.rpc("buscar_clanes", { p_query: q });
  return ((data as { id: string; nombre: string; tag: string | null; color_estandarte: string; descripcion: string; cantidad_miembros: number }[] | null) ?? []).map((c) => ({
    ...c,
    cantidad_miembros: Number(c.cantidad_miembros),
  }));
}

export async function unirseAClan(id: string) {
  const { error } = await supabase.rpc("unirse_a_clan", { p_clan_id: id });
  if (error) throw error;
}

export async function crearClan(nombre: string, tag: string, colorHex: string, descripcion: string) {
  const { error } = await supabase.rpc("crear_clan", { p_nombre: nombre, p_tag: tag, p_color: colorHex, p_descripcion: descripcion });
  if (error) throw error;
}

export async function invitacionesClan() {
  const { data } = await supabase.rpc("mis_invitaciones_clan");
  return (data as { invitacion_id: string; clan_id: string; nombre: string; tag: string | null; color_estandarte: string; nivel_clan: number; invitador_nombre: string | null }[] | null) ?? [];
}

export async function responderInvitacionClan(id: string, aceptar: boolean) {
  const { error } = await supabase.rpc("responder_invitacion_clan", { p_invitacion_id: id, p_aceptar: aceptar });
  if (error) throw error;
}

export async function invitarAClan(userId: string) {
  const { error } = await supabase.rpc("invitar_a_clan", { p_user_id: userId });
  if (error) throw error;
}

export interface ClanMapa {
  clan_id: string;
  nombre: string;
  tag: string | null;
  color_estandarte: string;
  nivel_clan: number;
  cantidad_miembros: number;
  capacidad: number;
  creado_at: string;
  imagen_url: string | null;
}

export async function mapaClanes(): Promise<ClanMapa[]> {
  const { data } = await supabase.rpc("mapa_clanes");
  return (data as ClanMapa[] | null) ?? [];
}

export async function verClanPublico(id: string) {
  const { data } = await supabase.rpc("ver_clan_publico", { p_clan_id: id });
  return (
    (data as {
      clan_id: string;
      nombre: string;
      tag: string | null;
      color_estandarte: string;
      descripcion: string;
      nivel_clan: number;
      cantidad_miembros: number;
      capacidad: number;
      guerras_ganadas: number;
      creado_at: string;
      imagen_url: string | null;
    }[] | null)?.[0] ?? null
  );
}

export function tierDe(nivel: number) {
  const t = tierCiudadDeNivel(nivel);
  return { ...t, imagen: urlAbsoluta(t.imagen) ?? "" };
}

// ---------- Chat del clan ----------

export interface MensajeClan {
  id: string;
  autor_id: string;
  autor_nombre: string | null;
  autor_avatar_url: string | null;
  texto: string;
  created_at: string;
  autor_fuente_nombre?: string | null;
  autor_animacion_nombre?: string | null;
  responde_a: string | null;
  responde_a_texto: string | null;
  responde_a_autor_id: string | null;
  responde_a_autor_nombre: string | null;
  borrado?: boolean;
}

export async function mensajesDeClan(clanId: string): Promise<MensajeClan[]> {
  const { data } = await supabase.rpc("mensajes_de_clan", { p_clan_id: clanId, p_limite: 100 });
  supabase.rpc("marcar_chat_clan_leido");
  return ((data as MensajeClan[] | null) ?? []).slice().reverse();
}

export async function borrarMensajeClan(mensajeId: string) {
  const { error } = await supabase.rpc("borrar_mensaje_clan", { p_mensaje_id: mensajeId });
  if (error) throw error;
}

export async function enviarMensajeClan(texto: string, respondeA: string | null) {
  const { data, error } = await supabase.rpc("enviar_mensaje_clan", { p_texto: texto, p_responde_a: respondeA });
  if (error) throw error;
  return (data as { id: string; created_at: string }[])[0];
}
