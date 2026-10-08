import type { SupabaseClient } from "@supabase/supabase-js";
import { CONFIG_MUNDOS_NUEVOS, type SlugMundoNuevo } from "./config";

export interface DueloMundoNuevoInfo {
  duelId: string;
  rivalId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  rivalEsBot: boolean;
  serieId: string | null;
  rondaNumero: number;
  rondaTotal: number;
  nivel: number;
  semilla: number | null;
}

export interface DatosPracticaMundoNuevo {
  modo: string;
  nivelInicial: number;
  escudosExtra: number;
  hielosDisponibles: number;
  tiemposExtraDisponibles: number;
  boostActivo: boolean;
  dueloInfo: DueloMundoNuevoInfo | null;
}

// Igual que cargarDatosPracticaEstadistica, más la semilla del duelo: así la web
// y la app reparten las mismas preguntas a los dos rivales.
export async function cargarPracticaMundoNuevo(supabase: SupabaseClient, slug: SlugMundoNuevo, userId: string, modoDeLaRuta: string, duelo?: string): Promise<DatosPracticaMundoNuevo> {
  const cfg = CONFIG_MUNDOS_NUEVOS[slug];
  let dueloInfo: DueloMundoNuevoInfo | null = null;
  let modo = cfg.modos.includes(modoDeLaRuta) ? modoDeLaRuta : cfg.modos[0];

  if (duelo) {
    const [{ data }, { data: filaDuel }] = await Promise.all([
      supabase.rpc("obtener_duelo", { p_duel_id: duelo }),
      supabase.from("duels").select("semilla_problemas").eq("id", duelo).maybeSingle(),
    ]);
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente" && fila.mundo === slug) {
      const subTipo = fila.sub_tipo as string | null;
      if (subTipo && cfg.modos.includes(subTipo)) modo = subTipo;
      dueloInfo = {
        duelId: duelo,
        rivalId: fila.retador_id === userId ? (fila.retado_id as string) : (fila.retador_id as string),
        rivalNombre: (fila.rival_nombre as string | null) ?? "Rival",
        miElo: fila.mi_elo as number,
        rivalElo: fila.rival_elo as number,
        rivalEsBot: fila.rival_es_bot === true,
        serieId: (fila.serie_id as string | null) ?? null,
        rondaNumero: fila.ronda_numero as number,
        rondaTotal: fila.ronda_total as number,
        nivel: (fila.nivel as number | null) ?? 5,
        semilla: (filaDuel as { semilla_problemas: number } | null)?.semilla_problemas ?? null,
      };
    }
  }

  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", `${slug}_${modo}`).maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles").eq("id", userId).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  if (escudosExtra > 0) await supabase.rpc("consumir_escudos_pendientes");

  return {
    modo,
    nivelInicial: nivelRow?.nivel ?? 1,
    escudosExtra,
    hielosDisponibles: profile?.hielos_disponibles ?? 0,
    tiemposExtraDisponibles: profile?.tiempos_extra_disponibles ?? 0,
    boostActivo: (profile?.boost_multiplicador_pendiente ?? 1) > 1,
    dueloInfo,
  };
}
