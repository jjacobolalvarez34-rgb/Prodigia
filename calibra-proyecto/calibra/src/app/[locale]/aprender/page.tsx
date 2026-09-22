import { createClient } from "@/lib/supabase/server";
import { requireUsuarioOnboarded, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoConClasesNumeria } from "@/lib/aprender/pathClases";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import { agruparNodos } from "@/lib/aprender/grupos";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderTabs from "@/components/AprenderTabs";
import { getTranslations, getLocale } from "next-intl/server";

const COLOR = "#6C4CF1";

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Numeria retrofit a Técnicas | Clases (docs/PARIDAD_MUNDOS.md fila 22 +
// fila 23, 2026-09-22): a diferencia de los otros 12 mundos, Numeria tiene
// 9 temas (TemaAprendible) en un solo camino, así que usa su propia
// obtenerCaminoConClasesNumeria (cruza los 9 problem_type de una) en vez de
// obtenerCaminoConClases (un solo problem_type). AprenderShell.tsx (la
// implementación original) queda sin uso a propósito — no se borra por si
// se necesita de referencia, pero esta página ya no la usa.
export default async function AprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { user, profile } = await requireUsuarioOnboarded(supabase, "/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const t = await getTranslations("Aprender");
  const tNumeria = await getTranslations("Numeria");
  const locale = await getLocale();
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoConClasesNumeria(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Faprender%3Ftab%3Dclases";

  const unidadesTecnicas: UnidadCaminoGenerico[] = agruparNodos(tecnicas, "numeria", "tecnicas", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));
  const unidadesClases: UnidadCaminoGenerico[] = agruparNodos(clases, "numeria", "clases", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({
      id: n.id,
      slug: n.slug,
      nombre: n.nombre,
      estado: n.estado,
      ctaPro: n.bloqueadoPorPlan ? { label: tNumeria("aprenderClases.desbloqueaConPro"), href: proHref } : undefined,
    })),
  }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("titulo")}
          subtitulo={t("subtitulo")}
          progresoLabel={t("progreso")}
          progresoTexto={t("tecnicas", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR}
          basePath="/aprender"
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
