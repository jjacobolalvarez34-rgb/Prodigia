import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeaderFlujo from "@/components/landing/HeaderFlujo";
import DemoMundoClient from "@/components/mundosNuevos/DemoMundoClient";

// Igual que /demo/estadistica: alcanza con cualquier sesión (la landing ya hizo
// signInAnonymously), sin diagnóstico ni compra del mundo.
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <>
      <HeaderFlujo />
      <DemoMundoClient slug="vitalia" />
    </>
  );
}
