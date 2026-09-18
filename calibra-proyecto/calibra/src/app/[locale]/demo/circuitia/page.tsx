import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoCircuitiaClient from "./DemoCircuitiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoCircuitia. Modo fijo en "serie" — el más básico de los 4
// modos, no hace falta ninguna consulta.
export default async function DemoCircuitiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoCircuitiaClient />
    </>
  );
}
