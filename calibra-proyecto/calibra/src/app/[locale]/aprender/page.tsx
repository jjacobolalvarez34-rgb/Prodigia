import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCamino } from "@/lib/aprender/path";
import Header from "@/components/Header";
import AprenderShell from "./AprenderShell";

export default async function AprenderPage() {
  const supabase = await createClient();
  const { user } = await requireUsuarioOnboarded(supabase, "/aprender");
  bloquearInvitado(user, "Aprender");

  const unidades = await obtenerCamino(supabase, user.id);

  return (
    <>
      <Header autenticado />
      <AprenderShell unidades={unidades} />
    </>
  );
}
