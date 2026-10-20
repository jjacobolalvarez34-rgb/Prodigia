import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import JuegoPi from "./JuegoPi";

// Minievento del Día de π (0295): «Dígitos de π».
export default async function PiPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/pi");
  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <JuegoPi />
    </>
  );
}
