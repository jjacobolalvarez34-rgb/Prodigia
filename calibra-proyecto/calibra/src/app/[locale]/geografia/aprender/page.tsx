import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoGeografia } from "@/lib/geografia/path";
import Header from "@/components/Header";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { COLOR_GEOGRAFIA } from "../GeografiaMapa";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Geografia.metadata.aprender");
  return { title: t("title"), description: t("description") };
}

export default async function GeografiaAprenderPage() {
  const t = await getTranslations("Geografia");
  const supabase = await createClient();
  const { user } = await requireMundoGeografia(supabase, "/geografia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoGeografia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "geografia",
      nombre: t("nombreMundo"),
      descripcion: t("aprender.descripcionUnidad"),
      nodos: nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <ProgressDial value={totalDominadas} max={Math.max(1, nodos.length)} size={44} colorDesde={COLOR_GEOGRAFIA}>
            <span className="font-mono text-xs font-bold text-foreground">
              {nodos.length > 0 ? Math.round((totalDominadas / nodos.length) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("aprender.progreso")}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {t("aprender.tecnicas", { completadas: totalDominadas, total: nodos.length })}
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_GEOGRAFIA }}>
            {t("nombreMundo")}
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("aprender.titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            {t("aprender.subtitulo")}
          </p>
        </div>

        <CaminoContinuo unidades={unidadesGenericas} basePath="/geografia/aprender" colorHex={COLOR_GEOGRAFIA} />
      </div>
    </>
  );
}
