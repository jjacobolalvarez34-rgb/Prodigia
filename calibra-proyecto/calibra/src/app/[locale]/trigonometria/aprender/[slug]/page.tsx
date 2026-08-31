import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoTrigonometria } from "@/lib/trigonometria/path";
import Header from "@/components/Header";
import LeccionTrigonometriaClient from "./LeccionTrigonometriaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionTrigonometriaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/trigonometria/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const nodos = await obtenerCaminoTrigonometria(supabase, user.id);
  const nodo = nodos.find((n) => n.slug === slug);

  if (!nodo) {
    notFound();
  }
  if (nodo.estado === "bloqueado") {
    redirect("/trigonometria/aprender");
  }

  return (
    <>
      <Header autenticado />
      <LeccionTrigonometriaClient nodo={nodo} />
    </>
  );
}
