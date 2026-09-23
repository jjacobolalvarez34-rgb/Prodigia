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

  // Mismo criterio que Estadística/Naipia/Codia (ver docs/PARIDAD_MUNDOS.md,
  // sección "Enigmia: niveles por categoría"): el diagnóstico calibra a
  // fondo UNA categoría representativa — "patrones" (secuencia + patron
  // en logic_puzzles.tipo, el banco con más contenido y la categoría que
  // ya se usa como fallback general en el resto del código de Enigmia) —
  // en vez de mezclar las 4 categorías en 8 preguntas (ni siquiera
  // alcanzaría para calibrar ninguna con precisión). Las otras 3
  // categorías arrancan en nivel 1 y suben solas jugando (ver guardar()
  // en DiagnosticoEnigmiaClient.tsx).
  const { data: puzzles } = await supabase
    .from("logic_puzzles")
    .select("id, tipo, dificultad, contenido, respuesta")
    .in("tipo", ["secuencia", "patron"]);

  return (
    <>
      <Header autenticado />
      <DiagnosticoEnigmiaClient puzzles={(puzzles ?? []) as LogicPuzzle[]} destino={destino} />
    </>
  );
}
