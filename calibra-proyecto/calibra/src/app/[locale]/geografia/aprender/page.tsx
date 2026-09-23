import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoGeografia, ORDEN_GRUPOS_GEOGRAFIA, type GrupoGeografia } from "@/lib/geografia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_GEOGRAFIA } from "../GeografiaMapa";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Geografia.metadata.aprender");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Geografía retrofit completo a Técnicas | Clases POR CONTINENTE
// (2026-09-23, docs/PARIDAD_MUNDOS.md fila 1 + fila 22/23): mismo patrón
// que src/app/[locale]/quimia/aprender/page.tsx — el `grupo` de cada nodo
// ya viene calculado desde src/lib/geografia/path.ts (con Pro-gating de
// Clases incluido, al estilo Enigmia), así que esta página arma
// unidadesTecnicas/unidadesClases leyendo ese campo directamente, SIN
// pasar por agruparNodos/GRUPOS_APRENDER (esa infra queda solo como
// documentación de presentación, ver el comentario de
// src/lib/aprender/grupos.ts).
export default async function GeografiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Geografia");
  const supabase = await createClient();
  const { user, profile } = await requireMundoGeografia(supabase, "/geografia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoGeografia(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fgeografia%2Faprender%3Ftab%3Dclases";

  const NOMBRE_GRUPO: Record<GrupoGeografia, string> = {
    general: t("aprender.grupos.general"),
    america: t("continentes.america"),
    europa: t("continentes.europa"),
    africa: t("continentes.africa"),
    asia_oceania: t("continentes.asia_oceania"),
  };

  function construirUnidades(nodosPestana: typeof nodos): UnidadCaminoGenerico[] {
    return ORDEN_GRUPOS_GEOGRAFIA.map((grupo) => ({
      grupo,
      nodos: nodosPestana.filter((n) => n.grupo === grupo),
    }))
      .filter((g) => g.nodos.length > 0)
      .map((g) => ({
        id: `geografia-${g.grupo}`,
        nombre: NOMBRE_GRUPO[g.grupo],
        nodos: g.nodos.map((n) => ({
          id: n.id,
          slug: n.slug,
          nombre: n.nombre,
          estado: n.estado,
          ctaPro: n.bloqueadoPorPlan ? { label: t("aprender.desbloqueaConPro"), href: proHref } : undefined,
        })),
      }));
  }

  const unidadesTecnicas = construirUnidades(tecnicas);
  const unidadesClases = construirUnidades(clases);

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          progresoTexto={t("aprender.tecnicas", { completadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_GEOGRAFIA}
          basePath="/geografia/aprender"
          tecnicas={unidadesTecnicas}
          clases={hayClases ? unidadesClases : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}
