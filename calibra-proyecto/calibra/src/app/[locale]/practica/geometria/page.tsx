import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { TIPOS_GEOMETRIA, type TipoGeometria } from "@/lib/practica/geometria";
import GeometriaPracticaClient from "./GeometriaPracticaClient";

export const metadata: Metadata = {
  title: "Geometría básica",
  description: "Perímetro, área, ángulos y ternas pitagóricas — dificultad adaptativa.",
};

export default async function GeometriaPracticaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/geometria");
  bloquearInvitado(user, "Geometría");

  const [{ data: skillRows }, { data: profile }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in(
        "problem_type",
        TIPOS_GEOMETRIA.map((t) => `geometria_${t}`)
      ),
    supabase
      .from("profiles")
      .select("escudos_extra_pendientes, boost_multiplicador_pendiente")
      .eq("id", user.id)
      .single(),
  ]);

  const nivelPorTipo = Object.fromEntries(
    TIPOS_GEOMETRIA.map((t) => [t, skillRows?.find((r) => r.problem_type === `geometria_${t}`)?.nivel ?? 1])
  ) as Record<TipoGeometria, number>;

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <GeometriaPracticaClient nivelPorTipo={nivelPorTipo} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
