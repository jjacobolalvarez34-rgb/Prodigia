import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoAnatomiaClient from "./DiagnosticoAnatomiaClient";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function DiagnosticoAnatomiaPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/anatomia";

  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, `/anatomia/diagnostico?next=${destino}`);

  if (profile.onboarding_anatomia_completado) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoAnatomiaClient destino={destino} />
    </>
  );
}
