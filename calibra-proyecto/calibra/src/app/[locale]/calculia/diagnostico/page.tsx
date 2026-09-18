import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoCalculiaClient from "./DiagnosticoCalculiaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculia.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function CalculiaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/calculia/diagnostico");

  if (profile.onboarding_calculia_completado) {
    redirect(next ?? "/calculia");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoCalculiaClient destino={next ?? "/calculia"} />
    </>
  );
}
