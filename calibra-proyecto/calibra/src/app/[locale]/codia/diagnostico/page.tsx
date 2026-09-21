import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoCodiaClient from "./DiagnosticoCodiaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Codia.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function CodiaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/codia/diagnostico");

  if (profile.onboarding_codia_completado) {
    redirect(next ?? "/codia");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoCodiaClient destino={next ?? "/codia"} />
    </>
  );
}
