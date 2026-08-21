import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModoQuimia } from "@/lib/practica/quimia";
import type { DueloQuimicoInfo } from "@/app/quimia/QuimiaPracticaClient";

const MODOS_VALIDOS: ModoQuimia[] = ["simbolos", "formulas", "tabla", "nomenclatura", "organica"];

export interface DatosPracticaQuimia {
  modo: ModoQuimia;
  nivelInicial: number;
  escudosExtra: number;
  boostActivo: boolean;
  dueloInfo: DueloQuimicoInfo | null;
}

// Compartido por los 3 page.tsx de /quimia/practica/* (símbolos, fórmulas,
// tabla) — evita triplicar la misma lógica de carga (nivel, escudos,
// boost, datos del duelo si viene de matchmaking) en cada route segment,
// mismo criterio que geografia/practica/page.tsx pero factorizado porque
// acá SÍ hay 3 páginas casi idénticas en vez de una sola.
export async function cargarDatosPracticaQuimia(
  supabase: SupabaseClient,
  userId: string,
  modoDeLaRuta: ModoQuimia,
  duelo: string | undefined
): Promise<DatosPracticaQuimia> {
  let dueloInfo: DueloQuimicoInfo | null = null;
  // El modo real de un duelo lo decide el rango de los dos rivales
  // (sub_tipo, asignado server-side en buscar_rival_duelo) — no la URL
  // que se haya visitado. Si alguien entra a /quimia/practica (símbolos)
  // con un duelo cuyo sub_tipo en realidad es "tabla", hay que jugar
  // "tabla" igual, o los dos rivales verían contenido distinto pese a
  // compartir semilla.
  let modo = modoDeLaRuta;
  if (duelo) {
    const [{ data }, { data: semillaRow }] = await Promise.all([
      supabase.rpc("obtener_duelo", { p_duel_id: duelo }),
      supabase.from("duels").select("semilla_problemas").eq("id", duelo).maybeSingle(),
    ]);
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente" && fila.mundo === "quimia") {
      const subTipo = fila.sub_tipo as string | null;
      if (subTipo && (MODOS_VALIDOS as string[]).includes(subTipo)) {
        modo = subTipo as ModoQuimia;
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
        semilla: Number(semillaRow?.semilla_problemas ?? 0),
        nivelForzado: (fila.nivel as number | null) ?? 5,
      };
    }
  }

  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", userId).eq("problem_type", `quimia_${modo}`).maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente").eq("id", userId).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return {
    modo,
    nivelInicial: nivelRow?.nivel ?? 1,
    escudosExtra,
    boostActivo,
    dueloInfo,
  };
}
