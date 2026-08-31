import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoTrigonometriaClient from "./DiagnosticoTrigonometriaClient";

export const metadata: Metadata = {
  title: "Diagnóstico de Trigonometría",
  description: "Unas preguntas rápidas para calibrar tu nivel inicial.",
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function TrigonometriaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/trigonometria/diagnostico");

  if (profile.onboarding_trigonometria_completado) {
    redirect(next ?? "/trigonometria");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoTrigonometriaClient destino={next ?? "/trigonometria"} />
    </>
  );
}
