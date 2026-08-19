import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import RankedsClient from "./RankedsClient";

export const metadata: Metadata = {
  title: "Rankeds",
  description: "Tu competitivo en Prodigia: ELO, historial y matchmaking de duelos.",
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function RankedsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/rankeds");
  bloquearInvitado(user, "Rankeds");

  const [{ data: historial }, { data: pendientes }, { data: miTituloNombre }] = await Promise.all([
    supabase.rpc("mi_historial_duelos", { p_limite: 20 }),
    supabase.rpc("mis_duelos_pendientes"),
    supabase.rpc("titulo_nombre_de", { p_user_id: user.id }),
  ]);

  return (
    <>
      <Header autenticado />
      <RankedsClient
        miElo={profile.elo_rating ?? 800}
        miTituloNombre={miTituloNombre ?? null}
        miUserId={user.id}
        historialInicial={historial ?? []}
        duelosPendientesIniciales={pendientes ?? []}
        tabInicial={tab === "buscar" ? "buscar" : tab === "invitar" ? "invitar" : "competitivo"}
      />
    </>
  );
}
