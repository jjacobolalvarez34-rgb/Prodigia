import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoEstadisticaClient from "./DiagnosticoEstadisticaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Estadistica.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function EstadisticaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/estadistica/diagnostico");

  if (profile.onboarding_estadistica_completado) {
    redirect(next ?? "/estadistica");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoEstadisticaClient destino={next ?? "/estadistica"} />
    </>
  );
}
