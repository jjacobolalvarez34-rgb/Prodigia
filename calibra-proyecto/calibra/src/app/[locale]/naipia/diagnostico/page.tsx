import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoNaipiaClient from "./DiagnosticoNaipiaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Naipia.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function NaipiaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/naipia/diagnostico");

  if (profile.onboarding_naipia_completado) {
    redirect(next ?? "/naipia");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoNaipiaClient destino={next ?? "/naipia"} />
    </>
  );
}
