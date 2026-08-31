import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoAnatomiaClient from "./DemoAnatomiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoAnatomia. Modo fijo en "oseo" — el default de siempre
// (mismo que /anatomia/practica), no hace falta ninguna consulta.
export default async function DemoAnatomiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoAnatomiaClient />
    </>
  );
}
