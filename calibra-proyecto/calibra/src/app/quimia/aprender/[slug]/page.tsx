import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoQuimia } from "@/lib/quimia/path";
import Header from "@/components/Header";
import LeccionQuimiaClient from "./LeccionQuimiaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionQuimiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/quimia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoQuimia(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/quimia/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionQuimiaClient nodo={nodo} />
    </>
  );
}
