import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { construirUnidadesCircuitia, obtenerCaminoCircuitia } from "@/lib/circuitia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_CIRCUITIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Circuitia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function CircuitiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Circuitia");
  const locale = await getLocale();
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/circuitia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoCircuitia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Aprender con pestañas "Técnicas | Clases" (fila 22 de PARIDAD_MUNDOS.md)
  // sobre el layout compartido de Aprender (fila 3: panel de temas a la
  // izquierda + camino a la derecha, como Melodía). Cada pestaña es un camino
  // con sus propios temas (ver src/lib/aprender/grupos.ts). Misma lógica de
  // obtenerCaminoCircuitia: un "activo" por tema en las dos pestañas; la clase 1
  // (preview gratis) viene "activo" y las 2+ para quien no es Pro vienen
  // "bloqueado" con bloqueadoPorPlan=true, así que se les agrega el CTA a /pro
  // en vez del bloqueo mudo normal.
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fcircuitia%2Faprender%3Ftab%3Dclases";

  // Unidades del sidebar: salen del `grupo` y el `estado` de la FUENTE (path.ts,
  // desbloqueo por tema en las dos pestañas), no se recalculan acá.
  const cta = { label: t("aprender.clases.desbloqueaConPro"), href: proHref };
  const unidadesTecnicas = construirUnidadesCircuitia(tecnicas, "tecnicas", locale, cta);
  const unidadesClases = construirUnidadesCircuitia(clases, "clases", locale, cta);

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          progresoTexto={t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={COLOR_CIRCUITIA}
          basePath="/circuitia/aprender"
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
