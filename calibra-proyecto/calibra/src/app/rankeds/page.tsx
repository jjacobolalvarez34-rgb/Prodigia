import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import RankedsClient from "./RankedsClient";

export const metadata: Metadata = {
  title: "Rankeds",
  description: "Tu competitivo en Prodigia: ELO, historial y matchmaking de duelos.",
};

export default async function RankedsPage() {
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/rankeds");

  const { data: historial } = await supabase.rpc("mi_historial_duelos", { p_limite: 20 });

  return (
    <>
      <Header autenticado />
      <RankedsClient
        miElo={profile.elo_rating ?? 1200}
        historialInicial={historial ?? []}
      />
    </>
  );
}
