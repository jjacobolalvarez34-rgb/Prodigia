import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoMelodia, ORDEN_GRUPOS_MELODIA } from "@/lib/melodia/path";
import { CLAVE_MODO_I18N } from "@/lib/melodia/grupos";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_MELODIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Melodia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Melodía: Técnicas | Clases (2026-09-23, docs/PARIDAD_MUNDOS.md filas
// 22/23): mismo patrón que la página de Anatomía — el `grupo` (modo de
// práctica) y el estado de cada nodo ya vienen calculados desde
// src/lib/melodia/path.ts (con el Pro-gating de Clases incluido), así que
// esta página arma las unidades de cada pestaña leyendo ese campo
// directamente.
export default async function MelodiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Melodia.aprender");
  // Nombres de los grupos — reutiliza Melodia.home.modos.* (ya existe
  // para la pantalla de práctica), sin duplicar strings nuevos.
  const tModos = await getTranslations("Melodia.home.modos");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/melodia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoMelodia(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fmelodia%2Faprender%3Ftab%3Dclases";

  function construirUnidades(nodosPestana: typeof nodos): UnidadCaminoGenerico[] {
    return ORDEN_GRUPOS_MELODIA.map((grupo) => ({
      grupo,
      nodos: nodosPestana.filter((n) => n.grupo === grupo),
    }))
      .filter((g) => g.nodos.length > 0)
      .map((g) => ({
        id: `melodia-${g.grupo}`,
        nombre: tModos(CLAVE_MODO_I18N[g.grupo]),
        nodos: g.nodos.map((n) => ({
          id: n.id,
          slug: n.slug,
          nombre: n.nombre,
          estado: n.estado,
          ctaPro: n.bloqueadoPorPlan ? { label: t("desbloqueaConPro"), href: proHref } : undefined,
        })),
      }));
  }

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("titulo")}
          subtitulo={t("subtitulo")}
          progresoLabel={t("progresoLabel")}
          progresoTexto={t("leccionesContador", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_MELODIA}
          basePath="/melodia/aprender"
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
