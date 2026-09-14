import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import ProfesorClient from "./ProfesorClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profesor.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

// Fase 3 del rediseño de Social: Grupos vuelve a ser una sección propia
// (antes vivía como pestaña dentro de /social — con Social reducido a
// "Feed"/"Amigos", ya no entraba ahí). Vuelve a tener su propio link en
// el nav (ver Header.tsx).
export default async function ProfesorPage() {
  const t = await getTranslations("Profesor");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/profesor");
  bloquearInvitado(user, t("guardLabel"));

  const { data: grupos } = await supabase
    .from("groups")
    .select("id, nombre, codigo_invitacion")
    .eq("profesor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header autenticado />
      <ProfesorClient grupos={grupos ?? []} />
    </>
  );
}
