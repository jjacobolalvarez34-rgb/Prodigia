import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoGeografiaClient from "./DemoGeografiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireUsuario. Continente fijo en "america" — el default de siempre
// (mismo que /geografia/practica), no hace falta ninguna consulta.
export default async function DemoGeografiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <HeaderFlujo />
      <DemoGeografiaClient />
    </>
  );
}
