import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoAnatomia, puedeAbrirNodoAnatomia } from "@/lib/anatomia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionAnatomiaClient from "./LeccionAnatomiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionAnatomiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/anatomia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoAnatomia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal, o Clase
  // sin Pro): no lo dejamos entrar, pero tampoco es un error — lo mandamos
  // de vuelta a la pestaña de la que viene.
  if (!puedeAbrirNodoAnatomia(nodo)) {
    redirect(hrefVolverAAprender("/anatomia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionAnatomiaClient nodo={nodo} />
    </>
  );
}
