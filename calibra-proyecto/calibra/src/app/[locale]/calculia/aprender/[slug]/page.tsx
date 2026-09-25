import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCalculia, puedeAbrirNodoCalculia } from "@/lib/calculia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionCalculiaClient from "./LeccionCalculiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionCalculiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/calculia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoCalculia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal dentro de un
  // tema, o Clase sin Pro): no lo dejamos entrar, pero tampoco es un error: lo
  // mandamos de vuelta a la pestaña de la que viene.
  if (!puedeAbrirNodoCalculia(nodo)) {
    redirect(hrefVolverAAprender("/calculia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionCalculiaClient nodo={nodo} />
    </>
  );
}
