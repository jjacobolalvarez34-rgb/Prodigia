import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoHistoria, construirUnidadesHistoria, ORDEN_GRUPOS_HISTORIA, type GrupoHistoria } from "@/lib/historia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_HISTORIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Historia.aprenderPage.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Historia: Técnicas | Clases (docs/PARIDAD_MUNDOS.md filas 22/23): la época
// (`grupo`) y el estado de cada nodo ya vienen calculados desde
// src/lib/historia/path.ts (con el Pro-gating de Clases incluido), así que esta página
// arma las unidades de cada pestaña leyendo esos campos. La primera Técnica y la
// primera Clase de CADA época están abiertas a la vez; el orden cronológico es solo
// el recomendado del menú lateral.
export default async function HistoriaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Historia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/historia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoHistoria(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fhistoria%2Faprender%3Ftab%3Dclases";

  // Nombres de las 5 épocas (Historia.aprenderPage.grupos).
  const NOMBRE_GRUPO = Object.fromEntries(ORDEN_GRUPOS_HISTORIA.map((g) => [g, t(`aprenderPage.grupos.${g}`)])) as Record<GrupoHistoria, string>;
  const cta = { label: t("aprenderPage.desbloqueaConPro"), href: proHref };

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprenderPage.titulo")}
          subtitulo={t("aprenderPage.subtitulo")}
          progresoLabel={t("aprenderPage.progreso")}
          progresoTexto={t("aprenderPage.leccionesContador", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_HISTORIA}
          basePath="/historia/aprender"
          tecnicas={construirUnidadesHistoria(tecnicas, NOMBRE_GRUPO, cta)}
          clases={hayClases ? construirUnidadesHistoria(clases, NOMBRE_GRUPO, cta) : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}
