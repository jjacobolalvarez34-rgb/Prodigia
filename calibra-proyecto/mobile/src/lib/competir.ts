// Competir: Rankeds, duelos casuales, liga semanal y duelos de amigos. Las mismas
// RPC que RankedsClient.tsx, /practica?duelo= y /api/duelos/resultado de la web: el
// ELO, el matchmaking y quién ganó se deciden en la base, nunca en el teléfono.
import type { MundoSlug } from "~/tema";
import { placaBasica, placaDesdeFila, type PlacaDatos } from "./placa";
import { supabase } from "./supabase";

export interface FilaHistorial {
  duel_id: string;
  operation_type: string | null;
  mundo: MundoSlug;
  sub_tipo: string | null;
  modo: string;
  clasificatorio: boolean;
  creado_at: string;
  rival_nombre: string | null;
  rival_titulo_nombre: string | null;
  mi_puntaje: number;
  rival_puntaje: number;
  gane: boolean;
  empate: boolean;
  rival_es_bot: boolean;
}

export interface DueloPendiente {
  duel_id: string;
  operation_type: string | null;
  mundo: MundoSlug;
  creado_at: string;
  retador_nombre: string | null;
  retador_elo: number;
  retador_titulo_nombre: string | null;
}

export interface StatsCasual {
  victorias: number;
  derrotas: number;
  empates: number;
}

// Mundos que se pueden jugar en un duelo DENTRO de la app. El resto de las ciudades
// se juega en la web hasta que lleguen a la app.
export const MUNDOS_DUELO_APP: MundoSlug[] = ["numeria", "geografia"];
export const ELO_SOLO_TODAS = 1300; // Platino+: solo "todas las ciudades" (buscar_rival_duelo, 0078)
export const NIVEL_MINIMO_RANKEDS = 5;

export async function cargarCompetitivo() {
  const [{ data: hist }, { data: pend }, { data: stats }] = await Promise.all([
    supabase.rpc("mi_historial_duelos", { p_limite: 20 }),
    supabase.rpc("mis_duelos_pendientes"),
    supabase.rpc("mis_stats_casual"),
  ]);
  return {
    historial: (hist as FilaHistorial[] | null) ?? [],
    pendientes: (pend as DueloPendiente[] | null) ?? [],
    casual: (stats as StatsCasual[] | null)?.[0] ?? { victorias: 0, derrotas: 0, empates: 0 },
  };
}

export async function rechazarDuelo(duelId: string) {
  await supabase.rpc("rechazar_duelo", { p_duel_id: duelId });
}

export interface PasoBusqueda {
  encontrado: boolean;
  duelId: string | null;
  mundo: MundoSlug | null;
  rango: number;
  segundos: number;
}

// Un paso del matchmaking (se llama cada ~2 s). Antes de pedir rival se revisa si ya
// nos encontró alguien a nosotros (el que encuentra es el único que recibe el id).
export async function pasoBusqueda(userId: string, mundo: string, ranked: boolean, inicioIso: string): Promise<PasoBusqueda> {
  const { data: ya } = await supabase
    .from("duels")
    .select("id, mundo")
    .eq("retado_id", userId)
    .eq("estado", "pendiente")
    .eq("clasificatorio", ranked)
    .or("ronda_numero.is.null,ronda_numero.eq.1")
    .gte("creado_at", inicioIso)
    .limit(1);
  const fila0 = (ya as { id: string; mundo: MundoSlug }[] | null)?.[0];
  if (fila0) return { encontrado: true, duelId: fila0.id, mundo: fila0.mundo, rango: 0, segundos: 0 };

  const { data, error } = await supabase.rpc("buscar_rival_duelo", { p_mundo: mundo, p_operation_type: null, p_ranked: ranked });
  if (error) throw error;
  const fila = (data as { duel_id: string | null; encontrado: boolean; rango_actual: number; segundos_esperando: number; mundo_encontrado: MundoSlug | null }[] | null)?.[0];
  return {
    encontrado: !!(fila?.encontrado && fila.duel_id),
    duelId: fila?.duel_id ?? null,
    mundo: fila?.mundo_encontrado ?? null,
    rango: fila?.rango_actual ?? 30,
    segundos: fila?.segundos_esperando ?? 0,
  };
}

export async function cancelarBusqueda() {
  await supabase.rpc("cancelar_busqueda_duelo");
}

export interface InfoDuelo {
  duelId: string;
  mundo: MundoSlug;
  subTipo: string | null;
  operacion: string | null;
  nivel: number;
  estado: string;
  rivalId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  miTitulo: string | null;
  rivalTitulo: string | null;
  rivalEsBot: boolean;
  rivalYaJugo: boolean;
  rivalRespuestas: { correct: boolean; timeMs: number }[] | null;
  semilla: number;
  serieId: string | null;
  rondaNumero: number;
  rondaTotal: number;
  clasificatorio: boolean;
}

export async function obtenerDuelo(duelId: string, userId: string): Promise<InfoDuelo | null> {
  const [{ data }, { data: filaDuel }] = await Promise.all([
    supabase.rpc("obtener_duelo", { p_duel_id: duelId }),
    supabase.from("duels").select("semilla_problemas, clasificatorio").eq("id", duelId).maybeSingle(),
  ]);
  const f = (data as Record<string, unknown>[] | null)?.[0];
  if (!f) return null;
  const rivalId = f.retador_id === userId ? (f.retado_id as string) : (f.retador_id as string);
  return {
    duelId,
    mundo: f.mundo as MundoSlug,
    subTipo: (f.sub_tipo as string | null) ?? null,
    operacion: (f.operation_type as string | null) ?? null,
    nivel: (f.nivel as number) ?? 1,
    estado: f.estado as string,
    rivalId,
    rivalNombre: (f.rival_nombre as string | null) ?? "Rival",
    miElo: (f.mi_elo as number) ?? 1000,
    rivalElo: (f.rival_elo as number) ?? 1000,
    miTitulo: (f.mi_titulo_nombre as string | null) ?? null,
    rivalTitulo: (f.rival_titulo_nombre as string | null) ?? null,
    rivalEsBot: f.rival_es_bot === true,
    rivalYaJugo: f.rival_ya_jugo === true,
    rivalRespuestas: f.rival_ya_jugo === true ? ((f.rival_respuestas as { correct: boolean; timeMs: number }[] | null) ?? null) : null,
    semilla: ((filaDuel as { semilla_problemas: number } | null)?.semilla_problemas as number | undefined) ?? 1,
    serieId: (f.serie_id as string | null) ?? null,
    rondaNumero: (f.ronda_numero as number) ?? 1,
    rondaTotal: (f.ronda_total as number) ?? 1,
    clasificatorio: (filaDuel as { clasificatorio: boolean } | null)?.clasificatorio ?? true,
  };
}

export interface ResultadoDuelo {
  resuelto: boolean;
  elo_nuevo: number | null;
  elo_anterior: number | null;
  gane: boolean | null;
  empate: boolean | null;
  oponente_nombre: string | null;
  mi_puntaje: number | null;
  rival_puntaje: number | null;
  clasificatorio: boolean | null;
  ronda_numero: number | null;
  ronda_total: number | null;
}

export async function registrarResultadoDuelo(duelId: string, precision: number, tiempoPromedio: number, puntaje: number, respuestas: { correct: boolean; timeMs: number }[]): Promise<ResultadoDuelo> {
  const { data, error } = await supabase.rpc("registrar_resultado_duelo", {
    p_duel_id: duelId,
    p_precision: precision,
    p_tiempo_promedio: tiempoPromedio,
    p_puntaje: puntaje,
    p_respuestas: respuestas,
  });
  if (error) throw error;
  return (data as ResultadoDuelo[])[0];
}

export async function rendirseDuelo(duelId: string) {
  const { data, error } = await supabase.rpc("rendirse_duelo", { p_duel_id: duelId });
  if (error) throw error;
  return (data as { elo_nuevo: number; elo_anterior: number }[] | null)?.[0] ?? null;
}

export interface RondaSerie {
  duel_id: string;
  ronda_numero: number;
  mundo: MundoSlug;
  sub_tipo: string | null;
  operation_type: string | null;
  estado: string;
  yo_jugue: boolean;
  rival_jugo: boolean;
  gane_ronda: boolean;
  empate_ronda: boolean;
  oponente_id: string;
  oponente_nombre: string | null;
  serie_finalizada: boolean;
  oponente_es_bot: boolean;
  mi_puntaje: number | null;
  rival_puntaje: number | null;
}

export async function estadoSerie(serieId: string) {
  const [{ data: rondas }, { data: fin }] = await Promise.all([
    supabase.rpc("estado_serie_duelo", { p_serie_id: serieId }),
    supabase.rpc("finalizar_serie_si_corresponde", { p_serie_id: serieId }),
  ]);
  return {
    rondas: (rondas as RondaSerie[] | null) ?? [],
    final: (fin as { finalizada: boolean; gane: boolean; empate: boolean; elo_nuevo: number; elo_anterior: number; victorias_propias: number; victorias_rival: number; oponente_nombre: string | null }[] | null)?.[0] ?? null,
  };
}

// Reto a un amigo (mismo insert que /api/amigos/retar).
export async function retarAmigo(userId: string, amigoId: string, mundo: MundoSlug, opcion: string): Promise<string> {
  const semilla = Math.floor(Math.random() * 1_000_000_000_000);
  const { data, error } = await supabase
    .from("duels")
    .insert({
      retador_id: userId,
      retado_id: amigoId,
      semilla_problemas: semilla,
      mundo,
      operation_type: mundo === "numeria" ? opcion : null,
      sub_tipo: mundo === "numeria" ? null : opcion,
      estado: "pendiente",
      // Retos entre amigos: siempre amistosos, nunca mueven el ELO (0244).
      clasificatorio: false,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

// ---------- Rankings ----------

type FilaRanking = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  elo_rating: number | null;
  titulo_nombre: string | null;
  fuente_nombre?: string | null;
  animacion_nombre?: string | null;
  xp_semana?: number;
};

function placaDeRanking(f: FilaRanking): PlacaDatos {
  return placaDesdeFila({
    id: f.user_id,
    display_name: f.display_name,
    avatar_url: f.avatar_url,
    marco_perfil: null,
    fuente_nombre: f.fuente_nombre ?? null,
    animacion_nombre: f.animacion_nombre ?? null,
    color_nombre: null,
    fondo_perfil: null,
    fondo_perfil_url: null,
    titulo_nombre: f.titulo_nombre,
    elo_rating: f.elo_rating,
    nivel_cuenta: null,
    puntos_total: null,
  });
}

export async function rankingSemanal(mundo: string | null, soloAmigos: boolean): Promise<{ placa: PlacaDatos; xp: number }[]> {
  const { data } = await supabase.rpc("ranking_semanal_filtrado", { p_mundo: mundo, p_solo_amigos: soloAmigos });
  return ((data as FilaRanking[] | null) ?? []).map((f) => ({ placa: placaDeRanking(f), xp: Number(f.xp_semana ?? 0) }));
}

export async function rankingElo(soloAmigos: boolean): Promise<PlacaDatos[]> {
  const { data } = await supabase.rpc("ranking_elo_global", { p_solo_amigos: soloAmigos });
  return ((data as FilaRanking[] | null) ?? []).map(placaDeRanking);
}

export async function rankingReto(tipo: "diario" | "semanal", clave: string): Promise<{ placa: PlacaDatos; correctos: number }[]> {
  const { data } =
    tipo === "diario" ? await supabase.rpc("ranking_reto_diario", { p_fecha: clave }) : await supabase.rpc("ranking_reto_semanal", { p_semana: clave });
  return ((data as { user_id: string; display_name: string | null; avatar_url: string | null; marco_perfil: string | null; correctos: number }[] | null) ?? []).map((f) => ({
    placa: placaBasica(f.user_id, f.display_name, { avatarUrl: f.avatar_url, marco: f.marco_perfil ?? "ninguno" }),
    correctos: f.correctos,
  }));
}

// Fin de la liga semanal: el lunes 00:00 UTC (mismo corte que ranking_semanal).
export function finDeSemanaUtc(ahora = new Date()): Date {
  const d = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
  const dia = d.getUTCDay(); // 0 domingo
  const faltan = (8 - (dia === 0 ? 7 : dia)) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + faltan);
  return d;
}

export function textoFaltan(fin: Date, ahora = new Date()): string {
  const ms = Math.max(0, fin.getTime() - ahora.getTime());
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  return d > 0 ? `${d}d ${h % 24}h` : `${h}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}
