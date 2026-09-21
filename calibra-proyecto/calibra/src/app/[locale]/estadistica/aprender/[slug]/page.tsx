import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoEstadistica } from "@/lib/estadistica/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionEstadisticaClient from "./LeccionEstadisticaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionEstadisticaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/estadistica/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoEstadistica(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect(hrefVolverAAprender("/estadistica/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionEstadisticaClient nodo={nodo} />
    </>
  );
}
