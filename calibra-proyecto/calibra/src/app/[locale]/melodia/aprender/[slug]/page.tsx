import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoMelodia } from "@/lib/melodia/path";
import Header from "@/components/Header";
import LeccionMelodiaClient from "./LeccionMelodiaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionMelodiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/melodia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoMelodia(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/melodia/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionMelodiaClient nodo={nodo} />
    </>
  );
}
