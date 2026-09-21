import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCodia } from "@/lib/codia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionCodiaClient from "./LeccionCodiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionCodiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/codia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoCodia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect(hrefVolverAAprender("/codia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionCodiaClient nodo={nodo} />
    </>
  );
}
