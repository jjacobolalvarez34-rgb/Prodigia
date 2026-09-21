import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoEstadisticaClient from "./DemoEstadisticaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoEstadistica. Modo fijo en "central" — el más básico de
// los 5 modos, no hace falta ninguna consulta.
export default async function DemoEstadisticaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoEstadisticaClient />
    </>
  );
}
