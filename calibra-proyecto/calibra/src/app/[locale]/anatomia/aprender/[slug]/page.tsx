import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoAnatomia } from "@/lib/anatomia/path";
import Header from "@/components/Header";
import LeccionAnatomiaClient from "./LeccionAnatomiaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionAnatomiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/anatomia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoAnatomia(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/anatomia/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionAnatomiaClient nodo={nodo} />
    </>
  );
}
