import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { ARITHMETIC_PROBLEM_TYPES, type ArithmeticProblemType, type ModifierSlug } from "@/types/database";
import DemoNumeriaClient from "./DemoNumeriaClient";

// Ruta de la demo pre-cuenta (landing pública, Fase 2) — a propósito NO
// usa requireMundoNumeria/requireUsuarioOnboarded: esas guards exigen
// nombre + diagnóstico ya hechos, lo que le pondría fricción justo al
// visitante que todavía no tiene cuenta. Acá alcanza con que exista
// CUALQUIER sesión (la landing ya hizo signInAnonymously antes de
// mandar para acá) — sin eso, no hay con qué guardar el intento.
export default async function DemoNumeriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nivelPorOperacion = Object.fromEntries(
    ARITHMETIC_PROBLEM_TYPES.map((tipo) => [tipo, 1])
  ) as Record<ArithmeticProblemType, number>;
  const modificadoresPorOperacion = Object.fromEntries(
    ARITHMETIC_PROBLEM_TYPES.map((tipo) => [tipo, [] as ModifierSlug[]])
  ) as Record<ArithmeticProblemType, ModifierSlug[]>;

  return (
    <>
      <Header autenticado invitado />
      <DemoNumeriaClient nivelPorOperacion={nivelPorOperacion} modificadoresPorOperacion={modificadoresPorOperacion} />
    </>
  );
}
