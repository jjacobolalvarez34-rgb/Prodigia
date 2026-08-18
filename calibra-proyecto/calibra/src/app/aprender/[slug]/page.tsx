import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCamino } from "@/lib/aprender/path";
import Header from "@/components/Header";
import LeccionClient from "./LeccionClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuarioOnboarded(supabase, `/aprender/${slug}`);
  bloquearInvitado(user, "aprender");

  const unidades = await obtenerCamino(supabase, user.id);
  const nodo = unidades.flatMap((u) => u.nodos).find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  // Acceso directo por URL a un nodo bloqueado: no lo dejamos entrar, pero
  // tampoco es un error — simplemente lo mandamos de vuelta al camino.
  if (nodo.estado === "bloqueado") {
    redirect("/aprender");
  }

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
