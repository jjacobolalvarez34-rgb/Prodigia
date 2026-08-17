import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import GeografiaPracticaClient from "../../GeografiaPracticaClient";

export const metadata: Metadata = {
  title: "Practicar Geografía — Asia y Oceanía",
  description: "Identificá países de Asia y Oceanía en el mapa.",
};

export default async function GeografiaPracticaAsiaOceaniaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/geografia/practica/asia-oceania");

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
        continente="asia_oceania"
        nivelInicial={nivelRow?.nivel ?? 1}
        escudosExtra={escudosExtra}
        boostActivo={boostActivo}
      />
    </>
  );
}
