import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import GeografiaPracticaClient, { type DueloGenericoInfo } from "../GeografiaPracticaClient";
import type { Continente } from "@/lib/practica/geografia";

export const metadata: Metadata = {
  title: "Practicar Geografía",
  description: "Identificá países de América en el mapa.",
};

interface Props {
  searchParams: Promise<{ duelo?: string }>;
}

export default async function GeografiaPracticaPage({ searchParams }: Props) {
  const { duelo } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/geografia/practica");

  // Fase 3 de Rankeds: si vengo de matchmaking para Geografía, el
  // continente lo decide el rango de los dos duelistas (sub_tipo,
  // elegido server-side en buscar_rival_duelo) — no siempre América.
  let continente: Continente = "america";
  let dueloInfo: DueloGenericoInfo | null = null;
  if (duelo) {
    const { data } = await supabase.rpc("obtener_duelo", { p_duel_id: duelo });
    const fila = (data as Array<Record<string, unknown>> | null)?.[0];
    if (fila && fila.estado === "pendiente" && fila.mundo === "geografia") {
      continente = (fila.sub_tipo as Continente | null) ?? "america";
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
      };
    }
  }

  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", user.id).eq("problem_type", "geografia").maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente").eq("id", user.id).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <GeografiaPracticaClient
        continente={continente}
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        duelo={dueloInfo}
      />
    </>
  );
}
