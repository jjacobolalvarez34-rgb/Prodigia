import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoHistoriaClient from "./DemoHistoriaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoHistoria. Modo fijo en "personajes" — opción múltiple,
// buen gancho de demo (adivinar la figura histórica), no hace falta
// ninguna consulta.
export default async function DemoHistoriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoHistoriaClient />
    </>
  );
}
