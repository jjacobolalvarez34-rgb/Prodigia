import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoTrigonometria, construirUnidadesTrigonometria, ORDEN_GRUPOS_TRIGONOMETRIA, type GrupoTrigonometria } from "@/lib/trigonometria/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_TRIGONOMETRIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trigonometria.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

// Trigonometría: Técnicas | Clases (docs/PARIDAD_MUNDOS.md filas 22/23): el
// bloque del currículo (`grupo`) y el estado de cada nodo ya vienen calculados
// desde src/lib/trigonometria/path.ts (con el Pro-gating de Clases incluido),
// así que esta página arma las unidades de cada pestaña leyendo esos campos.
export default async function TrigonometriaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Trigonometria");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/trigonometria/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";

  const nodos = await obtenerCaminoTrigonometria(supabase, user.id, esPro);
  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const proHref = "/pro?next=%2Ftrigonometria%2Faprender%3Ftab%3Dclases";

  // Nombres de los 6 bloques del currículo (Trigonometria.aprender.grupos).
  const NOMBRE_GRUPO = Object.fromEntries(ORDEN_GRUPOS_TRIGONOMETRIA.map((g) => [g, t(`aprender.grupos.${g}`)])) as Record<GrupoTrigonometria, string>;
  const cta = { label: t("aprender.desbloqueaConPro"), href: proHref };

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderTabs
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          progresoTexto={t("aprender.leccionesContador", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_TRIGONOMETRIA}
          basePath="/trigonometria/aprender"
          tecnicas={construirUnidadesTrigonometria(tecnicas, NOMBRE_GRUPO, cta)}
          clases={hayClases ? construirUnidadesTrigonometria(clases, NOMBRE_GRUPO, cta) : null}
          esPro={esPro}
          proHref={proHref}
          defaultTab={resolverPestanaInicial(tab, hayClases)}
        />
      </div>
    </>
  );
}
