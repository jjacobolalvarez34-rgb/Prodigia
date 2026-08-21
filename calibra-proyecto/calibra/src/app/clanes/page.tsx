import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ClanesClient, { type MiClan, type ClanRanking, type Miembro, type Mision } from "./ClanesClient";

export const metadata: Metadata = {
  title: "Clanes",
  description: "Creá o unite a un clan, cumplí misiones semanales en equipo y competí en la guerra de clanes.",
};

export default async function ClanesPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/clanes");
  bloquearInvitado(user, "Clanes");

  const { data: miClanRows } = await supabase.rpc("mi_clan");
  const miClan = (miClanRows as MiClan[] | null)?.[0] ?? null;

  let miembros: Miembro[] = [];
  let mision: Mision | null = null;
  if (miClan) {
    await supabase.rpc("asegurar_mision_semanal", { p_clan_id: miClan.clan_id });
    const [{ data: miembrosRows }, { data: misionRows }] = await Promise.all([
      supabase.rpc("miembros_de_clan", { p_clan_id: miClan.clan_id }),
      supabase.rpc("mision_actual_de_clan", { p_clan_id: miClan.clan_id }),
    ]);
    miembros = (miembrosRows as Miembro[] | null) ?? [];
    mision = (misionRows as Mision[] | null)?.[0] ?? null;
  }

  const { data: rankingRows } = await supabase.rpc("ranking_clanes_semanal");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <ClanesClient
        miClanInicial={miClan}
        miembrosIniciales={miembros}
        misionInicial={mision}
        rankingInicial={(rankingRows as ClanRanking[] | null) ?? []}
      />
    </>
  );
}
