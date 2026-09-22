import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoConClasesNumeria } from "@/lib/aprender/pathClases";
import { hrefVolverAAprender } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import LeccionClient from "./LeccionClient";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuarioOnboarded(supabase, `/aprender/${slug}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));

  const nodos = await obtenerCaminoConClasesNumeria(supabase, user.id, profile.plan === "pro");
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado (progresión normal, o Clase
  // 2+ sin Pro): no lo dejamos entrar, pero tampoco es un error — lo
  // mandamos de vuelta a la pestaña de la que viene.
  if (nodo.estado === "bloqueado") {
    redirect(hrefVolverAAprender("/aprender", nodo.requierePro));
  }

  // Las Técnicas rápidas (requiere_pro=false) siguen desbloqueando
  // modificadores de /practica como siempre; las Clases nuevas (Pro) no
  // tienen esa relación (usan quiz + visuales, no práctica numérica).
  const { data: relaciones } = await supabase
    .from("technique_modifiers")
    .select("modifiers(nombre, descripcion)")
    .eq("technique_id", nodo.id);

  const desbloquea = (relaciones ?? [])
    .map((r) => r.modifiers as unknown as { nombre: string; descripcion: string | null } | null)
    .filter((m): m is { nombre: string; descripcion: string | null } => m !== null);

  return (
    <>
      <Header autenticado />
      <LeccionClient nodo={nodo} desbloquea={desbloquea} />
    </>
  );
}
