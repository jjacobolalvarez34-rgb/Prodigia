import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ClanesClient, { type MiClan, type ClanRanking, type Miembro, type Mision, type RivalClan } from "./ClanesClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Clanes.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function ClanesPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/clanes");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("clanes"));

  // Cierre perezoso de la guerra de la semana pasada (Fase 7) — sin
  // cron, se dispara acá; el insert con clave primaria por semana en
  // procesar_cierre_semana_clanes() evita procesarla dos veces.
  await supabase.rpc("procesar_cierre_semana_clanes");

  const [{ data: miClanRows }, { data: profileFull }] = await Promise.all([
    supabase.rpc("mi_clan"),
    supabase.from("profiles").select("puntos_total").eq("id", user.id).single(),
  ]);
  const miClan = (miClanRows as MiClan[] | null)?.[0] ?? null;

  let miembros: Miembro[] = [];
  let mision: Mision | null = null;
  let rival: RivalClan | null = null;
  if (miClan) {
    await supabase.rpc("asegurar_mision_semanal", { p_clan_id: miClan.clan_id });
    const [{ data: miembrosRows }, { data: misionRows }, { data: rivalRows }] = await Promise.all([
      supabase.rpc("miembros_de_clan", { p_clan_id: miClan.clan_id }),
      supabase.rpc("mision_actual_de_clan", { p_clan_id: miClan.clan_id }),
      supabase.rpc("rival_de_clan", { p_clan_id: miClan.clan_id }),
    ]);
    miembros = (miembrosRows as Miembro[] | null) ?? [];
    mision = (misionRows as Mision[] | null)?.[0] ?? null;
    rival = (rivalRows as RivalClan[] | null)?.[0] ?? null;
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
        rivalInicial={rival}
        miUserId={user.id}
        misChispas={profileFull?.puntos_total ?? 0}
      />
    </>
  );
}
