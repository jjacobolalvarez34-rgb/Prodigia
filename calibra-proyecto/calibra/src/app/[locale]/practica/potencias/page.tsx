import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { TIPOS_POTENCIA, type TipoPotencia } from "@/lib/practica/potencias";
import PotenciaPracticaClient from "./PotenciaPracticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const [tNumeria, tPotencias] = await Promise.all([
    getTranslations("Numeria.temas"),
    getTranslations("Potencias.metadata"),
  ]);
  return { title: tNumeria("potencias"), description: tPotencias("description") };
}

export default async function PotenciasPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/potencias");
  const tNumeria = await getTranslations("Numeria.temas");
  bloquearInvitado(user, tNumeria("potencias"));

  const [{ data: skillRows }, { data: profile }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in(
        "problem_type",
        TIPOS_POTENCIA.map((t) => `potencias_${t}`)
      ),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles")
      .eq("id", user.id)
      .single(),
  ]);

  const nivelPorTipo = Object.fromEntries(
    TIPOS_POTENCIA.map((t) => [t, skillRows?.find((r) => r.problem_type === `potencias_${t}`)?.nivel ?? 1])
  ) as Record<TipoPotencia, number>;

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
      <PotenciaPracticaClient nivelPorTipo={nivelPorTipo} escudosExtra={escudosExtra} hielosDisponibles={hielosDisponibles} tiemposExtraDisponibles={tiemposExtraDisponibles} boostActivo={boostActivo} />
    </>
  );
}
