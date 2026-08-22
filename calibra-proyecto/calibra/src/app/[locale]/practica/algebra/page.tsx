import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireMundoNumeria } from "@/lib/auth/guard";
import Header from "@/components/Header";
import { TIPOS_ALGEBRA, type TipoAlgebra } from "@/lib/practica/algebra";
import AlgebraPracticaClient from "./AlgebraPracticaClient";

export const metadata: Metadata = {
  title: "Practicar Álgebra",
  description: "Evaluar expresiones y resolver ecuaciones lineales simples.",
};

export default async function AlgebraPracticaPage() {
  const supabase = await createClient();
  const { user } = await requireMundoNumeria(supabase, "/practica/algebra");

  const [{ data: skillRows }, { data: profile }] = await Promise.all([
    supabase
      .from("skill_levels")
      .select("problem_type, nivel")
      .eq("user_id", user.id)
      .in(
        "problem_type",
        TIPOS_ALGEBRA.map((t) => `algebra_${t}`)
      ),
    supabase.from("profiles").select("escudos_extra_pendientes, boost_multiplicador_pendiente").eq("id", user.id).single(),
  ]);

  const nivelPorTipo = Object.fromEntries(
    TIPOS_ALGEBRA.map((t) => [t, skillRows?.find((r) => r.problem_type === `algebra_${t}`)?.nivel ?? 1])
  ) as Record<TipoAlgebra, number>;

  const escudosExtra = profile?.escudos_extra_pendientes ?? 0;
  const boostActivo = (profile?.boost_multiplicador_pendiente ?? 1) > 1;
  if (escudosExtra > 0) {
    await supabase.rpc("consumir_escudos_pendientes");
  }

  return (
    <>
      <Header autenticado />
      <AlgebraPracticaClient nivelPorTipo={nivelPorTipo} escudosExtra={escudosExtra} boostActivo={boostActivo} />
    </>
  );
}
