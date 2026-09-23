import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoAnatomia, ORDEN_GRUPOS_ANATOMIA, type GrupoAnatomia } from "@/lib/anatomia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_ANATOMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Anatomia.aprender.metadata");
  return { title: t("titulo"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Anatomía: Técnicas | Clases (2026-09-23, docs/PARIDAD_MUNDOS.md filas
// 22/23): mismo patrón que la página de Geografía — el `grupo` (sistema) y
// el estado de cada nodo ya vienen calculados desde src/lib/anatomia/path.ts
// (con el Pro-gating de Clases incluido), así que esta página arma las
// unidades de cada pestaña leyendo ese campo directamente.
export default async function AnatomiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Anatomia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/anatomia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoAnatomia(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fanatomia%2Faprender%3Ftab%3Dclases";

  // Nombres de los 4 sistemas — reutiliza Anatomia.elegir.modos.* (ya
  // existe para la pantalla de práctica), sin duplicar strings nuevos.
  const NOMBRE_GRUPO: Record<GrupoAnatomia, string> = {
    oseo: t("elegir.modos.oseo"),
    muscular: t("elegir.modos.muscular"),
    organos: t("elegir.modos.organos"),
    nervioso: t("elegir.modos.nervioso"),
  };

  function construirUnidades(nodosPestana: typeof nodos): UnidadCaminoGenerico[] {
    return ORDEN_GRUPOS_ANATOMIA.map((grupo) => ({
      grupo,
      nodos: nodosPestana.filter((n) => n.grupo === grupo),
    }))
      .filter((g) => g.nodos.length > 0)
      .map((g) => ({
        id: `anatomia-${g.grupo}`,
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

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progresoLabel")}
          progresoTexto={t("aprender.leccionesContador", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_ANATOMIA}
          basePath="/anatomia/aprender"
          tecnicas={construirUnidades(tecnicas)}
          clases={hayClases ? construirUnidades(clases) : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}
