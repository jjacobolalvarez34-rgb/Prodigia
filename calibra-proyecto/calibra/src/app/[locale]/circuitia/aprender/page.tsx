import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCircuitia } from "@/lib/circuitia/path";
import Header from "@/components/Header";
import ProgressDial from "@/components/ProgressDial";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { COLOR_CIRCUITIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Circuitia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function CircuitiaAprenderPage() {
  const t = await getTranslations("Circuitia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/circuitia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoCircuitia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const tecnicasRapidas = nodos.filter((n) => !n.requierePro);
  const cursoPro = nodos.filter((n) => n.requierePro);

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "circuitia-tecnicas-rapidas",
      nombre: t("aprender.tecnicasRapidas.titulo"),
      descripcion: t("aprender.descripcionUnidad"),
      nodos: tecnicasRapidas.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  // Curso estructurado (Pro) — mismo patrón que Calculia, ver el plan de
  // paridad en docs/PARIDAD_MUNDOS.md. Módulo 1 (orden más bajo) siempre
  // viene "activo" (preview gratis) desde obtenerCaminoCircuitia; los
  // módulos 2+ para quien no es Pro vienen "bloqueado" con
  // bloqueadoPorPlan=true, así que acá se les agrega el CTA a /pro en
  // vez del bloqueo mudo normal.
  if (cursoPro.length > 0) {
    unidadesGenericas.push({
      id: "circuitia-curso-pro",
      nombre: t("aprender.cursoPro.titulo"),
      descripcion: t("aprender.cursoPro.descripcion"),
      nodos: cursoPro.map((n) => ({
        id: n.id,
        slug: n.slug,
        nombre: n.nombre,
        estado: n.estado,
        ctaPro: n.bloqueadoPorPlan
          ? { label: t("aprender.cursoPro.desbloqueaConPro"), href: "/pro?next=/circuitia/aprender" }
          : undefined,
      })),
    });
  }

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <ProgressDial value={totalDominadas} max={Math.max(1, nodos.length)} size={44} colorDesde={COLOR_CIRCUITIA}>
            <span className="font-mono text-xs font-bold text-foreground">
              {nodos.length > 0 ? Math.round((totalDominadas / nodos.length) * 100) : 0}%
            </span>
          </ProgressDial>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-texto-secundario">{t("aprender.progreso")}</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLOR_CIRCUITIA }}>
            {t("nombreMundo")}
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("aprender.titulo")}</h1>
          <p className="mt-1 text-sm text-texto-secundario">{t("aprender.subtitulo")}</p>
        </div>

        <CaminoContinuo unidades={unidadesGenericas} basePath="/circuitia/aprender" colorHex={COLOR_CIRCUITIA} />
      </div>
    </>
  );
}
