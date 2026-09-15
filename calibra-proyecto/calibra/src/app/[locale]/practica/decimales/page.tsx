import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { TIPOS_DECIMAL, type TipoDecimal } from "@/lib/practica/decimales";
import DecimalPracticaClient from "./DecimalPracticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const [tNumeria, tDecimales] = await Promise.all([
    getTranslations("Numeria.temas"),
    getTranslations("Decimales.metadata"),
  ]);
  return { title: tNumeria("decimales"), description: tDecimales("description") };
}

export default async function DecimalesPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/decimales");
  const tNumeria = await getTranslations("Numeria.temas");
  bloquearInvitado(user, tNumeria("decimales"));

  const [{ data: skillRows }, { data: profile }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in(
        "problem_type",
        TIPOS_DECIMAL.map((t) => `decimales_${t}`)
      ),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente, hielos_disponibles, tiempos_extra_disponibles")
      .eq("id", user.id)
      .single(),
  ]);

  const nivelPorTipo = Object.fromEntries(
    TIPOS_DECIMAL.map((t) => [t, skillRows?.find((r) => r.problem_type === `decimales_${t}`)?.nivel ?? 1])
  ) as Record<TipoDecimal, number>;

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
      <DecimalPracticaClient nivelPorTipo={nivelPorTipo} escudosExtra={escudosExtra} hielosDisponibles={hielosDisponibles} tiemposExtraDisponibles={tiemposExtraDisponibles} boostActivo={boostActivo} />
    </>
  );
}
