import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoHistoriaClient from "./DiagnosticoHistoriaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Historia.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

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
