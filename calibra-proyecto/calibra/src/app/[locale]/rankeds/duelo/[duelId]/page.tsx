import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import Header from "@/components/Header";
import BotonEnlace from "@/components/BotonEnlace";
import DetalleDueloVista from "@/components/partidas/DetalleDueloVista";
import { esUuid } from "@/lib/partidas/compartir";
import {
  armarDetalleDuelo,
  COLUMNAS_DUELO_DETALLE,
  COLUMNAS_RESULTADO_DETALLE,
  type FilaDueloDetalle,
  type FilaResultadoDuelo,
} from "@/lib/partidas/detalleDuelo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partidas.detalle");
  return { title: t("titulo") };
}

interface Props {
  params: Promise<{ duelId: string }>;
}

// Detalle de un duelo del historial de Rankeds (2026-10-21). Solo lo ven los
// dos participantes: RLS de duels/duel_results y obtener_duelo ya lo exigen.
export default async function DetalleDueloPage({ params }: Props) {
  const { duelId } = await params;
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, `/rankeds/duelo/${duelId}`);
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("rankeds"));
  const t = await getTranslations("Partidas.detalle");

  let detalle = null;
  if (esUuid(duelId)) {
    const [{ data: duelo }, { data: resultados }, { data: info }] = await Promise.all([
      supabase.from("duels").select(COLUMNAS_DUELO_DETALLE).eq("id", duelId).maybeSingle(),
      supabase.from("duel_results").select(COLUMNAS_RESULTADO_DETALLE).eq("duel_id", duelId),
      supabase.rpc("obtener_duelo", { p_duel_id: duelId }),
    ]);
    const fila = (info as { rival_nombre: string | null; rival_es_bot: boolean | null }[] | null)?.[0];
    detalle = armarDetalleDuelo(
      duelo as FilaDueloDetalle | null,
      resultados as FilaResultadoDuelo[] | null,
      user.id,
      fila ? { nombre: fila.rival_nombre, esBot: fila.rival_es_bot === true } : null
    );
  }

  return (
    <>
      <Header autenticado />
      {detalle ? (
        <DetalleDueloVista detalle={detalle} miNombre={(profile?.display_name as string | null) ?? null} />
      ) : (
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
          <p className="text-sm text-texto-secundario">{t("noEncontrado")}</p>
          <BotonEnlace href="/rankeds" variante="secundario" atras>
            {t("volver")}
          </BotonEnlace>
        </div>
      )}
    </>
  );
}
