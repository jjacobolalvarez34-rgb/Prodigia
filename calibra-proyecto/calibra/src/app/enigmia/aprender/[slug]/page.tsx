import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoEnigmia } from "@/lib/enigmia/path";
import Header from "@/components/Header";
import LeccionEnigmiaClient from "./LeccionEnigmiaClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeccionEnigmiaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { user } = await requireMundoEnigmia(supabase, `/enigmia/aprender/${slug}`);
  bloquearInvitado(user, "Aprender");

  const unidades = await obtenerCaminoEnigmia(supabase, user.id);
  const nodo = unidades.flatMap((u) => u.nodos).find((n) => n.slug === slug);

  if (!nodo) notFound();
  if (nodo.estado === "bloqueado") redirect("/enigmia/aprender");

  return (
    <>
      <Header autenticado />
      <LeccionEnigmiaClient nodo={nodo} />
    </>
  );
}
