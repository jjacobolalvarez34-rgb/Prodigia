import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import GeografiaPracticaClient from "../../GeografiaPracticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Geografia.metadata.practicaEuropa");
  return { title: t("title"), description: t("description") };
}

export default async function GeografiaPracticaEuropaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoGeografia(supabase, "/geografia/practica/europa");
  bloquearInvitado(user, "Geografía — Europa");

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
        continente="europa"
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
        miUserId={user.id}
      />
    </>
  );
}
