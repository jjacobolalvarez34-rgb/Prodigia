import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";

interface Props {
  params: Promise<{ inviteId: string }>;
}

// GET /duelo/invitacion/[inviteId] — a donde lleva el link compartible
// que genera un usuario desde Social → Amigos ("Invitar por link", Fase
// T3, movida a Amigos en la tanda de pulido de Rankeds). No hace falta
// ser amigo de quien lo generó: cualquier cuenta real que abra el link
// se une al mismo duelo. unirse_invitacion_duelo (security definer)
// hace la validación real — acá solo se maneja el resultado.
export default async function InvitacionDueloPage({ params }: Props) {
  const { inviteId } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuarioOnboarded(supabase, `/duelo/invitacion/${inviteId}`);
  bloquearInvitado(user, "Amigos");

  const { data, error } = await supabase.rpc("unirse_invitacion_duelo", { p_invite_id: inviteId });
  const fila = (data as Array<{ duel_id: string; operation_type: string }> | null)?.[0];

  if (error || !fila) {
    return (
      <>
        <Header autenticado />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Este link de duelo ya no sirve
          </h1>
          <p className="text-sm text-texto-secundario">
            {error?.message.includes("propia invitacion")
              ? "Es tu propio link — compartiselo a otra persona."
              : "Puede que ya se haya usado, se haya cancelado, o el link esté mal copiado."}
          </p>
        </div>
      </>
    );
  }

  redirect(`/practica?operacion=${fila.operation_type}&duelo=${fila.duel_id}`);
}
