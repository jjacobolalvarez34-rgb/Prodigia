import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoQuimiaClient from "./DiagnosticoQuimiaClient";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function DiagnosticoQuimiaPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/quimia";

  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, `/quimia/diagnostico?next=${destino}`);

  if (profile.onboarding_quimia_completado) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoQuimiaClient destino={destino} />
    </>
  );
}
