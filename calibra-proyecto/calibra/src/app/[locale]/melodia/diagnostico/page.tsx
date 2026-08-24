import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoMelodiaClient from "./DiagnosticoMelodiaClient";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function DiagnosticoMelodiaPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/melodia";

  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, `/melodia/diagnostico?next=${destino}`);

  if (profile.onboarding_melodia_completado) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoMelodiaClient destino={destino} />
    </>
  );
}
