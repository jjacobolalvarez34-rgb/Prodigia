import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoHistoria, puedeAbrirNodoHistoria } from "@/lib/historia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionHistoriaClient from "./LeccionHistoriaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionHistoriaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/historia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoHistoria(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal dentro de la época,
  // o Clase sin Pro): no lo dejamos entrar, pero tampoco es un error: lo mandamos de
  // vuelta a la pestaña de la que viene.
  if (!puedeAbrirNodoHistoria(nodo)) {
    redirect(hrefVolverAAprender("/historia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionHistoriaClient nodo={nodo} />
    </>
  );
}
