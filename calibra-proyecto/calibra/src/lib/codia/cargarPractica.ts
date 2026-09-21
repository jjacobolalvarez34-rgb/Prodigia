import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModoCodia } from "@/lib/practica/codia";

export interface DueloCodiaInfo {
  duelId: string;
  rivalId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  miTituloNombre: string | null;
  rivalTituloNombre: string | null;
  rivalEsBot: boolean;
  serieId: string | null;
  rondaNumero: number;
  rondaTotal: number;
  nivel: number;
}

export interface DatosPracticaCodia {
  modo: ModoCodia;
  nivelInicial: number;
  escudosExtra: number;
  hielosDisponibles: number;
  tiemposExtraDisponibles: number;
  boostActivo: boolean;
  dueloInfo: DueloCodiaInfo | null;
}

const MODOS_VALIDOS: ModoCodia[] = ["sintaxis", "salida", "error", "estructuras"];

// Mismo patrón que cargarDatosPracticaTrigonometria — sin semilla, cada
// rival resuelve su propio contenido al azar a la misma dificultad.
export async function cargarDatosPracticaCodia(
  supabase: SupabaseClient,
  userId: string,
  modoDeLaRuta: ModoCodia,
  duelo?: string
): Promise<DatosPracticaCodia> {
  let dueloInfo: DueloCodiaInfo | null = null;
  let modo = modoDeLaRuta;

  if (duelo) {
    const { data } = await supabase.rpc("obtener_duelo", { p_duel_id: duelo });
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente" && fila.mundo === "codia") {
      const subTipo = fila.sub_tipo as string | null;
      if (subTipo && (MODOS_VALIDOS as string[]).includes(subTipo)) {
        modo = subTipo as ModoCodia;
      }
      dueloInfo = {
        duelId: duelo,
        rivalId: fila.retador_id === userId ? (fila.retado_id as string) : (fila.retador_id as string),
        rivalNombre: (fila.rival_nombre as string | null) ?? "Rival",
        miElo: fila.mi_elo as number,
        rivalElo: fila.rival_elo as number,
        miTituloNombre: (fila.mi_titulo_nombre as string | null) ?? null,
        rivalTituloNombre: (fila.rival_titulo_nombre as string | null) ?? null,
        rivalEsBot: fila.rival_es_bot === true,
        serieId: (fila.serie_id as string | null) ?? null,
        rondaNumero: fila.ronda_numero as number,
        rondaTotal: fila.ronda_total as number,
        nivel: (fila.nivel as number | null) ?? 5,
      };
    }
  }

  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", `codia_${modo}`).maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles").eq("id", userId).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const hielosDisponibles = profile?.hielos_disponibles ?? 0;
  const tiemposExtraDisponibles = profile?.tiempos_extra_disponibles ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return {
    modo,
    nivelInicial: nivelRow?.nivel ?? 1,
    escudosExtra,
    hielosDisponibles,
    tiemposExtraDisponibles,
    boostActivo,
    dueloInfo,
  };
}
