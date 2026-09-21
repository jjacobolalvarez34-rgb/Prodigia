import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCalculia } from "@/lib/calculia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import { agruparNodos } from "@/lib/aprender/grupos";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
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
  const locale = await getLocale();
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/calculia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoCalculia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Aprender con pestañas "Técnicas | Clases" (fila 22 de PARIDAD_MUNDOS.md)
  // sobre el layout compartido de Aprender (fila 3: panel de temas a la
  // izquierda + camino a la derecha, como Melodía). Cada pestaña es un camino
  // con sus propios temas (ver src/lib/aprender/grupos.ts). Misma lógica de
  // obtenerCaminoCalculia: la clase 1 (orden más bajo de requiere_pro=true) viene
  // "activo" (preview gratis) y las 2+ para quien no es Pro vienen "bloqueado"
  // con bloqueadoPorPlan=true, así que acá se les agrega el CTA a /pro en vez
  // del bloqueo mudo normal.
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fcalculia%2Faprender%3Ftab%3Dclases";

  const unidadesTecnicas: UnidadCaminoGenerico[] = agruparNodos(tecnicas, "calculia", "tecnicas", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));
  const unidadesClases: UnidadCaminoGenerico[] = agruparNodos(clases, "calculia", "clases", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({
      id: n.id,
      slug: n.slug,
      nombre: n.nombre,
      estado: n.estado,
      ctaPro: n.bloqueadoPorPlan ? { label: t("aprender.clases.desbloqueaConPro"), href: proHref } : undefined,
    })),
  }));

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
