import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { CategoriaEnigmia, LogicPuzzle } from "@/types/database";
import EnigmiaPracticaClient, { type DueloGenericoInfo } from "./EnigmiaPracticaClient";

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function EnigmiaPracticaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/practica");

  // Fase 3 de Rankeds: si vengo de matchmaking, la categoría la decide
  // el rango de los dos duelistas (sub_tipo, elegido server-side).
  let dueloInfo: DueloGenericoInfo | null = null;
  if (duelo) {
    const { data } = await supabase.rpc("obtener_duelo", { p_duel_id: duelo });
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente" && fila.mundo === "enigmia") {
      dueloInfo = {
        duelId: duelo,
        rivalNombre: (fila.rival_nombre as string | null) ?? "Rival",
        miElo: fila.mi_elo as number,
        rivalElo: fila.rival_elo as number,
        miTituloNombre: (fila.mi_titulo_nombre as string | null) ?? null,
        rivalTituloNombre: (fila.rival_titulo_nombre as string | null) ?? null,
        serieId: (fila.serie_id as string | null) ?? null,
        rondaNumero: fila.ronda_numero as number,
        rondaTotal: fila.ronda_total as number,
        categoria: (fila.sub_tipo as CategoriaEnigmia | null) ?? "memoria",
        nivel: (fila.nivel as number | null) ?? 5,
      };
    }
  }

  const [{ data: puzzles }, { data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("logic_puzzles").select("id, tipo, dificultad, contenido, respuesta"),
    supabase.from("logic_skill_levels").select("nivel").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente")
      .eq("id", user.id)
      .single(),
  ]);

  // Ver nota en /practica/page.tsx: el boost se apaga recién al cerrar
  // la partida (/api/enigmia/finish), no acá.
  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <EnigmiaPracticaClient
        puzzles={(puzzles ?? []) as LogicPuzzle[]}
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        duelo={dueloInfo}
        miUserId={user.id}
      />
    </>
  );
}
