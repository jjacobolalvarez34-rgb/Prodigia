import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import MundoClanesMapa, { type ParcelaClan } from "@/components/clanes/MundoClanesMapa";

export const metadata: Metadata = {
  title: "Mundo de Clanes",
  description: "El mapa de todos los clanes de Prodigia — una parcela por clan, ordenadas por antigüedad.",
};

export default async function MundoClanesPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/clanes/mundo");
  bloquearInvitado(user, "Clanes");

  const { data } = await supabase.rpc("mapa_clanes");

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div>
          <Link href="/clanes" className="text-xs font-medium text-texto-secundario hover:text-foreground">
            ← Volver a Clanes
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">Mundo de Clanes</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Una parcela por clan, en el orden en que se fundaron. Hacé click para entrar a su ciudad.
          </p>
        </div>
        <MundoClanesMapa parcelas={(data as ParcelaClan[] | null) ?? []} />
      </div>
    </>
  );
}
