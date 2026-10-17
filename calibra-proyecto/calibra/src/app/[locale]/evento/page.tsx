import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/guard";
import Header from "@/components/Header";
import EventoClient from "./EventoClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Evento");
  return { title: t("tituloPagina") };
}

// Página del evento de la festividad (0289): Fichas, colección y cierre.
export default async function EventoPage() {
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/evento");
  return (
    <>
      <Header autenticado invitado={user.is_anonymous} />
      <EventoClient invitado={!!user.is_anonymous} />
    </>
  );
}
