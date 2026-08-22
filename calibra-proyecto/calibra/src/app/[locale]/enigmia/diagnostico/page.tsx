import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import type { LogicPuzzle } from "@/types/database";
import DiagnosticoEnigmiaClient from "./DiagnosticoEnigmiaClient";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function DiagnosticoEnigmiaPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/enigmia";

  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, `/enigmia/diagnostico?next=${destino}`);

  if (profile.onboarding_enigmia_completado) {
    redirect(destino);
  }

  const { data: puzzles } = await supabase
    .from("logic_puzzles")
    .select("id, tipo, dificultad, contenido, respuesta");

  return (
    <>
      <Header autenticado />
      <DiagnosticoEnigmiaClient puzzles={(puzzles ?? []) as LogicPuzzle[]} destino={destino} />
    </>
  );
}
