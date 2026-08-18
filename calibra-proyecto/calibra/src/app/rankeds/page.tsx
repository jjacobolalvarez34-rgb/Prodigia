import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import RankedsClient from "./RankedsClient";

export const metadata: Metadata = {
  title: "Rankeds",
  description: "Tu competitivo en Prodigia: ELO, historial y matchmaking de duelos.",
};

export default async function RankedsPage() {
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/rankeds");
  bloquearInvitado(user, "rankeds");

  const [{ data: historial }, { data: pendientes }] = await Promise.all([
    supabase.rpc("mi_historial_duelos", { p_limite: 20 }),
    supabase.rpc("mis_duelos_pendientes"),
  ]);

  return (
    <>
      <Header autenticado />
      <RankedsClient
        miElo={profile.elo_rating ?? 1200}
        miUserId={user.id}
        historialInicial={historial ?? []}
        duelosPendientesIniciales={pendientes ?? []}
      />
    </>
  );
}
