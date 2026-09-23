import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoGeografia } from "@/lib/geografia/path";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionGeografiaClient from "./LeccionGeografiaClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionGeografiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireMundoGeografia(supabase, `/geografia/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoGeografia(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal, o
  // Clase 2+ sin Pro): no lo dejamos entrar, pero tampoco es un error —
  // lo mandamos de vuelta a la pestaña de la que viene.
  if (nodo.estado === "bloqueado") {
    redirect(hrefVolverAAprender("/geografia/aprender", nodo.requierePro));
  }

  return (
    <>
      <Header autenticado />
      <LeccionGeografiaClient nodo={nodo} />
    </>
  );
}
