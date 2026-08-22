import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import DemoQuimiaClient from "./DemoQuimiaClient";

// Ver nota de /demo/numeria/page.tsx: mismo criterio, sin
// requireMundoQuimia. Modo fijo en "simbolos" — el default de siempre
// (mismo que /quimia/practica), no hace falta ninguna consulta.
export default async function DemoQuimiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <Header autenticado invitado />
      <DemoQuimiaClient />
    </>
  );
}
