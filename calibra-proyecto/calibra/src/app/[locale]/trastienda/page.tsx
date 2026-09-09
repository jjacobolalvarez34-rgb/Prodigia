import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import TrastiendaClient from "@/components/trastienda/TrastiendaClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Tienda.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function TrastiendaPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/trastienda");

  const { data: profile } = await supabase
    .from("profiles")
    .select("puntos_total, apuesta_monto, ocultar_doble_o_nada")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <TrastiendaClient
        puntosIniciales={profile?.puntos_total ?? 0}
        apuestaActivaInicial={(profile?.apuesta_monto ?? 0) > 0}
        ocultarDobleONada={profile?.ocultar_doble_o_nada ?? false}
      />
    </>
  );
}