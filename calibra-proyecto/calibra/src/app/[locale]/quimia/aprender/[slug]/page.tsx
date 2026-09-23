import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoQuimia, puedeAbrirNodoQuimia } from "@/lib/quimia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionQuimiaClient from "./LeccionQuimiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionQuimiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/quimia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  // Mismo camino (y mismo estado calculado en la fuente) que arma el sidebar
  // de /quimia/aprender: si el sidebar muestra un nodo abierto, acá también.
  const nodos = await obtenerCaminoQuimia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal, o Clase
  // sin plan Pro): no lo dejamos entrar, pero tampoco es un error: lo
  // mandamos de vuelta a la pestaña de la que viene.
  if (!puedeAbrirNodoQuimia(nodo)) {
    redirect(hrefVolverAAprender("/quimia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionQuimiaClient nodo={nodo} />
    </>
  );
}
