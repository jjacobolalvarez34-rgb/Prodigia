import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import AjustesClient from "./AjustesClient";

export const metadata: Metadata = {
  title: "Ajustes",
  description: "Sonido, efectos y tema de Prodigia.",
};

export default async function AjustesPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/ajustes");

  const { data: profileFull } = await supabase
    .from("profiles")
    .select("ocultar_doble_o_nada")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>
        <AjustesClient
          userId={user.id}
          ocultarDobleONadaInicial={profileFull?.ocultar_doble_o_nada ?? false}
        />
        <div className="flex flex-col gap-1 border-t border-border pt-6 text-sm">
          <Link href="/terminos" className="text-texto-secundario hover:text-foreground hover:underline">
            Términos de uso
          </Link>
          <Link href="/privacidad" className="text-texto-secundario hover:text-foreground hover:underline">
            Privacidad
          </Link>
        </div>
      </div>
    </>
  );
}
