import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import SocialClient from "./SocialClient";

export const metadata: Metadata = {
  title: "Social",
  description: "Amigos, duelos y grupos en Prodigia.",
};

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SocialPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/social");
  bloquearInvitado(user, "Social (Amigos y Grupos)");

  const [{ data: solicitudes }, { data: amigos }, { data: grupos }] = await Promise.all([
    supabase.rpc("mis_solicitudes_pendientes"),
    supabase.rpc("mis_amigos"),
    supabase
      .from("groups")
      .select("id, nombre, codigo_invitacion")
      .eq("profesor_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <Header autenticado />
      <SocialClient
        miUserId={user.id}
        tabInicial={tab === "grupos" ? "grupos" : "amigos"}
        solicitudesIniciales={solicitudes ?? []}
        amigosIniciales={amigos ?? []}
        gruposIniciales={grupos ?? []}
      />
    </>
  );
}
