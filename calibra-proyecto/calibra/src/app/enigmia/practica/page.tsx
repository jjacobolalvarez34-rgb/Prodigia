import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { LogicPuzzle } from "@/types/database";
import EnigmiaPracticaClient from "./EnigmiaPracticaClient";

export default async function EnigmiaPracticaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, "/enigmia/practica");

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
      />
    </>
  );
}
