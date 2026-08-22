import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import SerieDueloClient, { type FilaRondaSerie } from "./SerieDueloClient";

interface Props {
  params: Promise<{ serieId: string }>;
}

// Fase 5 de Rankeds: pantalla del duelo "todas las ciudades" — mejor de
// 3, una ciudad por ronda. Cada ronda se juega en la página normal de
// esa ciudad (/practica, /geografia/practica, /enigmia/practica con
// ?duelo=<id de esa ronda>), que al terminar redirige de vuelta acá.
// Esta pantalla es la única que sabe mostrar "ronda por ronda" y el
// resultado final de la serie completa.
export default async function SerieDueloPage({ params }: Props) {
  const { serieId } = await params;
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, `/rankeds/serie/${serieId}`);
  bloquearInvitado(user, "Rankeds");

  const { data, error } = await supabase.rpc("estado_serie_duelo", { p_serie_id: serieId });
  const rondas = (data as FilaRondaSerie[] | null) ?? [];

  if (error || rondas.length === 0) {
    notFound();
  }

  return (
    <>
      <Header autenticado />
      <SerieDueloClient serieId={serieId} rondasIniciales={rondas} />
    </>
  );
}
