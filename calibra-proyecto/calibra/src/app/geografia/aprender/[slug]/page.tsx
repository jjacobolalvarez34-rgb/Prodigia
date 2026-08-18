import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoGeografia } from "@/lib/geografia/path";
import Header from "@/components/Header";
import LeccionGeografiaClient from "./LeccionGeografiaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionGeografiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/geografia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoGeografia(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/geografia/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionGeografiaClient nodo={nodo} />
    </>
  );
}
