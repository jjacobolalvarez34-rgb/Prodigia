import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCalculia, construirUnidadesCalculia, ORDEN_GRUPOS_CALCULIA, type GrupoCalculia } from "@/lib/calculia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_CALCULIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function CalculiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Calculia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/calculia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoCalculia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Aprender con pestañas "Técnicas | Clases" (fila 22 de PARIDAD_MUNDOS.md)
  // sobre el layout compartido de Aprender (fila 3: panel de temas a la
  // izquierda + camino a la derecha, como Melodía). El tema (`grupo`) y el
  // estado de cada nodo ya vienen calculados desde src/lib/calculia/path.ts
  // (un puntero "activo" por tema en las dos pestañas, con el Pro-gating de
  // Clases incluido), así que esta página solo arma las unidades leyendo esos
  // campos: lo que muestra el sidebar es exactamente lo que valida [slug]/page.tsx.
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fcalculia%2Faprender%3Ftab%3Dclases";
  const nombreGrupo = Object.fromEntries(ORDEN_GRUPOS_CALCULIA.map((g) => [g, t(`aprender.grupos.${g}`)])) as Record<GrupoCalculia, string>;
  const cta = { label: t("aprender.clases.desbloqueaConPro"), href: proHref };

  const unidadesTecnicas = construirUnidadesCalculia(tecnicas, nombreGrupo, cta);
  const unidadesClases = construirUnidadesCalculia(clases, nombreGrupo, cta);

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          progresoTexto={t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={COLOR_CALCULIA}
          basePath="/calculia/aprender"
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
