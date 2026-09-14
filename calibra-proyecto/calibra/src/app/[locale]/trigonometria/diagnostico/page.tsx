import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoTrigonometriaClient from "./DiagnosticoTrigonometriaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trigonometria.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

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
