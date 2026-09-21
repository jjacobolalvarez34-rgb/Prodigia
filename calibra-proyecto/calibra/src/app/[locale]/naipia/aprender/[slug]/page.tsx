import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoNaipia } from "@/lib/naipia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionNaipiaClient from "./LeccionNaipiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionNaipiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/naipia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoNaipia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect(hrefVolverAAprender("/naipia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionNaipiaClient nodo={nodo} />
    </>
  );
}
