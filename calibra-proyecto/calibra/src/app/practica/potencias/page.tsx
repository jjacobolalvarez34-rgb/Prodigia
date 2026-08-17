import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import PotenciaPracticaClient from "./PotenciaPracticaClient";

export const metadata: Metadata = {
  title: "Potencias y raíces",
  description: "Potencias, raíces cuadradas y notación científica — dificultad adaptativa.",
};

export default async function PotenciasPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/potencias");

  const [{ data: skillRow }, { data: profile }] = await Promise.all([
    supabase.from("skill_levels").select("nivel").eq("user_id", user.id).eq("problem_type", "potencias").maybeSingle(),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente")
      .eq("id", user.id)
      .single(),
  ]);

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <PotenciaPracticaClient nivelInicial={skillRow?.nivel ?? 1} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
