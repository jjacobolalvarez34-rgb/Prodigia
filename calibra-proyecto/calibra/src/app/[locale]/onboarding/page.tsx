import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import OnboardingForm from "./OnboardingForm";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function OnboardingPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, mundos_desbloqueados")
    .eq("id", user.id)
    .single();

  // Esta capa (Fase W) es nombre + interés declarado + (Fase 12) el
  // mundo gratis inicial — una única vez por cuenta, no mide nivel. El
  // diagnóstico de cada mundo es aparte y se dispara recién cuando el
  // usuario entra a ESE mundo por primera vez.
  const tieneNombre = Boolean(profile?.display_name);
  // 0116: 1 mundo (heredado de la fase vieja de 1 mundo gratis) NO es
  // suficiente para saltar el onboarding — hay que completar los 2.
  const tieneMundo = (profile?.mundos_desbloqueados?.length ?? 0) >= 2;
  if (tieneNombre && tieneMundo) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <OnboardingForm next={destino} saltarPasoNombre={tieneNombre} />
        </div>
      </div>
    </>
  );
}
