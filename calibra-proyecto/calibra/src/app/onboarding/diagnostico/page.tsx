import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DiagnosticoClient from "./DiagnosticoClient";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function DiagnosticoPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destino = next ?? "/";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/onboarding/diagnostico?next=${destino}`)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, onboarding_completado")
    .eq("id", user.id)
    .single();

  if (!profile?.display_name) {
    redirect(`/onboarding?next=${encodeURIComponent(destino)}`);
  }
  if (profile.onboarding_completado) {
    redirect(destino);
  }

  return (
    <>
      <Header autenticado />
      <DiagnosticoClient destino={destino} />
    </>
  );
}
