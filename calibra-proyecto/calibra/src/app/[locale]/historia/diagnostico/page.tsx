import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoHistoriaClient from "./DiagnosticoHistoriaClient";

export const metadata: Metadata = {
  title: "Diagnóstico de Historia",
  description: "Unas preguntas rápidas para calibrar tu nivel inicial.",
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function HistoriaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/historia/diagnostico");

  if (profile.onboarding_historia_completado) {
    redirect(next ?? "/historia");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoHistoriaClient destino={next ?? "/historia"} />
    </>
  );
}
