import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import DiagnosticoCircuitiaClient from "./DiagnosticoCircuitiaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Circuitia.diagnostico.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function CircuitiaDiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const { profile } = await requireUsuario(supabase, "/circuitia/diagnostico");

  if (profile.onboarding_circuitia_completado) {
    redirect(next ?? "/circuitia");
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoCircuitiaClient destino={next ?? "/circuitia"} />
    </>
  );
}
