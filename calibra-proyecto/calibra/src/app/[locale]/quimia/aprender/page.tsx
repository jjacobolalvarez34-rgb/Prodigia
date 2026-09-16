import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoQuimia } from "@/lib/quimia/path";
import Header from "@/components/Header";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { COLOR_QUIMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.aprenderPagina.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function QuimiaAprenderPage() {
  const t = await getTranslations("Quimia.aprenderPagina");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/quimia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  const tMundos = await getTranslations("Mundos.nombres");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoQuimia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "quimia",
      nombre: tMundos("quimia"),
      descripcion: t("descripcionUnidad"),
      nodos: nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <ProgressDial value={totalDominadas} max={Math.max(1, nodos.length)} size={44} colorDesde={COLOR_QUIMIA}>
            <span className="font-mono text-xs font-bold text-foreground">
              {nodos.length > 0 ? Math.round((totalDominadas / nodos.length) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("progreso")}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {t("progresoTecnicas", { completadas: totalDominadas, total: nodos.length })}
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_QUIMIA }}>
            Quimia
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            {t("subtitulo")}
          </p>
        </div>

        <CaminoContinuo unidades={unidadesGenericas} basePath="/quimia/aprender" colorHex={COLOR_QUIMIA} />
      </div>
    </>
  );
}
