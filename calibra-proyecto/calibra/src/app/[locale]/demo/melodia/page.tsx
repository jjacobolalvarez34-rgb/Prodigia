import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoMelodiaClient from "./DemoMelodiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoMelodia. Modo fijo en "fundamentos" — el más básico de
// los 6 modos (mismo primer paso que /melodia/practica), no hace falta
// ninguna consulta.
export default async function DemoMelodiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoMelodiaClient />
    </>
  );
}
