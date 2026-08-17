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
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Esta capa (Fase W) es solo nombre + interés declarado, una única vez
  // por cuenta — no mide nivel. El diagnóstico de cada mundo es aparte y
  // se dispara recién cuando el usuario entra a ESE mundo por primera vez.
  if (profile?.display_name) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <OnboardingForm userId={user.id} next={destino} />
        </div>
      </div>
    </>
  );
}
