import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoQuimia, type GrupoQuimia } from "@/lib/quimia/path";
import { construirUnidadesQuimia } from "@/lib/quimia/unidades";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_QUIMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.aprenderPagina.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Aprender de Quimia con pestañas Técnicas | Clases (docs/PARIDAD_MUNDOS.md
// filas 22/23, tanda 1 del retrofit). El `grupo` y el `estado` de cada nodo
// ya vienen calculados desde src/lib/quimia/path.ts (con el Pro-gating de
// las Clases incluido): esta página solo los muestra (construirUnidadesQuimia)
// y nunca recalcula un estado, así que el sidebar y la validación de
// [slug]/page.tsx no pueden desincronizarse.
export default async function QuimiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Quimia.aprenderPagina");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/quimia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoQuimia(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Fquimia%2Faprender%3Ftab%3Dclases";

  const nombreGrupo: Record<GrupoQuimia, string> = {
    tabla: t("grupos.tabla"),
    simbolos: t("grupos.simbolos"),
    formulas: t("grupos.formulas"),
    nomenclatura: t("grupos.nomenclatura"),
    redox: t("grupos.redox"),
    organica: t("grupos.organica"),
  };
  const ctaPro = { label: t("desbloqueaConPro"), href: proHref };

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("titulo")}
          subtitulo={t("subtitulo")}
          progresoLabel={t("progreso")}
          progresoTexto={t("progresoTecnicas", { completadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_QUIMIA}
          basePath="/quimia/aprender"
          tecnicas={construirUnidadesQuimia(tecnicas, nombreGrupo, ctaPro)}
          clases={hayClases ? construirUnidadesQuimia(clases, nombreGrupo, ctaPro) : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}
