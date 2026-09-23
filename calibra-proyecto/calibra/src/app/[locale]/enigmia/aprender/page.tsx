import { createClient } from "@/lib/supabase/server";
import { requireMundoEnigmia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoConClasesEnigmia } from "@/lib/enigmia/pathClases";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import { agruparNodos } from "@/lib/aprender/grupos";
import Header from "@/components/Header";
import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderTabs from "@/components/AprenderTabs";
import { getTranslations, getLocale } from "next-intl/server";

const COLOR = "#0E9F6E";

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Enigmia retrofit a Técnicas | Clases (docs/PARIDAD_MUNDOS.md fila 22 +
// fila 23, 2026-09-22): igual que Numeria, Enigmia tiene varias
// categorías (4, no problem_type) en un solo camino, así que usa su
// propia obtenerCaminoConClasesEnigmia (cruza las 4 categorías, con
// desbloqueo POR CATEGORÍA independiente en las DOS pestañas — ver el
// comentario de src/lib/enigmia/pathClases.ts) en vez de
// obtenerCaminoConClases (un solo problem_type sobre `techniques`, no
// aplica: Enigmia usa `logic_techniques`).
export default async function EnigmiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { user, profile } = await requireMundoEnigmia(supabase, "/enigmia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const t = await getTranslations("Enigmia.aprenderPagina");
  const tEnigmia = await getTranslations("Enigmia");
  const locale = await getLocale();
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoConClasesEnigmia(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fenigmia%2Faprender%3Ftab%3Dclases";

  const unidadesTecnicas: UnidadCaminoGenerico[] = agruparNodos(tecnicas, "enigmia", "tecnicas", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));
  const unidadesClases: UnidadCaminoGenerico[] = agruparNodos(clases, "enigmia", "clases", locale).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nodos: g.nodos.map((n) => ({
      id: n.id,
      slug: n.slug,
      nombre: n.nombre,
      estado: n.estado,
      ctaPro: n.bloqueadoPorPlan ? { label: tEnigmia("aprenderClases.desbloqueaConPro"), href: proHref } : undefined,
    })),
  }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("titulo")}
          subtitulo=""
          progresoLabel={t("progreso")}
          progresoTexto={t("progresoTecnicas", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR}
          basePath="/enigmia/aprender"
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
