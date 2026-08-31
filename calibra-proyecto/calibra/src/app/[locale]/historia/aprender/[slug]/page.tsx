import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoHistoria } from "@/lib/historia/path";
import Header from "@/components/Header";
import LeccionHistoriaClient from "./LeccionHistoriaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionHistoriaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/historia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoHistoria(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/historia/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionHistoriaClient nodo={nodo} />
    </>
  );
}
