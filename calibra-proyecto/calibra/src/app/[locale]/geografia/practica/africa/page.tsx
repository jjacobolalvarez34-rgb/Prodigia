import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import GeografiaPracticaClient from "../../GeografiaPracticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Geografia.metadata.practicaAfrica");
  return { title: t("title"), description: t("description") };
}

export default async function GeografiaPracticaAfricaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoGeografia(supabase, "/geografia/practica/africa");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("geografiaAfrica"));

  // Calibración por continente (2026-09-23, ver
  // 0207_geografia_niveles_por_continente.sql).
  const [{ data: nivelRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", user.id).eq("problem_type", "geografia_africa").maybeSingle(),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles").eq("id", user.id).single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const hielosDisponibles = profile?.hielos_disponibles ?? 0;
  const tiemposExtraDisponibles = profile?.tiempos_extra_disponibles ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <GeografiaPracticaClient
        continente="africa"
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        hielosDisponibles={hielosDisponibles}
        tiemposExtraDisponibles={tiemposExtraDisponibles}
        boostActivo={boostActivo}
        miUserId={user.id}
      />
    </>
  );
}
