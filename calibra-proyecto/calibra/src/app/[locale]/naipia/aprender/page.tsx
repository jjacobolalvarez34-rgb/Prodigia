import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoNaipia } from "@/lib/naipia/path";
import { partirCaminoPorClases, resolverPestanaInicial } from "@/lib/aprender/clases";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import AprenderTabs from "@/components/AprenderTabs";
import { COLOR_NAIPIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Naipia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function NaipiaAprenderPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const t = await getTranslations("Naipia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/naipia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoNaipia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Pestañas "Técnicas | Clases" (fila 22 de PARIDAD_MUNDOS.md). Mismas
  // filas techniques y misma lógica de obtenerCaminoNaipia: solo cambia
  // el render. La clase 1 (orden más bajo de requiere_pro=true) viene
  // "activo" (preview gratis) y las 2+ para quien no es Pro vienen
  // "bloqueado" con bloqueadoPorPlan=true, así que acá se les agrega el
  // CTA a /pro en vez del bloqueo mudo normal.
  const { tecnicas, clases, hayClases } = partirCaminoPorClases(nodos);
  const dominadasDe = (lista: typeof nodos) => lista.filter((n) => n.estado === "completado").length;

  const unidadTecnicas: UnidadCaminoGenerico = {
    id: "naipia-tecnicas",
    nombre: t("aprender.tecnicasRapidas.titulo"),
    descripcion: t("aprender.descripcionUnidad"),
    nodos: tecnicas.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  };
  const unidadClases: UnidadCaminoGenerico = {
    id: "naipia-clases",
    nombre: t("aprender.clases.titulo"),
    descripcion: t("aprender.clases.descripcion"),
    nodos: clases.map((n) => ({
      id: n.id,
      slug: n.slug,
      nombre: n.nombre,
      estado: n.estado,
      ctaPro: n.bloqueadoPorPlan
        ? { label: t("aprender.clases.desbloqueaConPro"), href: "/pro?next=%2Fnaipia%2Faprender%3Ftab%3Dclases" }
        : undefined,
    })),
  };

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        {/* Sin panel de temas: cada pestaña tiene una sola unidad, así que
            unidadesSidebar va vacío (AprenderLayout lo oculta con < 2). */}
        <AprenderLayout
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          tecnicasTexto={t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={COLOR_NAIPIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={[]}
        >
          <AprenderTabs
            colorHex={COLOR_NAIPIA}
            esPro={esPro}
            proHref="/pro?next=%2Fnaipia%2Faprender%3Ftab%3Dclases"
            defaultTab={resolverPestanaInicial(tab, hayClases)}
            tecnicasBadge={`${dominadasDe(tecnicas)}/${tecnicas.length}`}
            clasesBadge={`${dominadasDe(clases)}/${clases.length}`}
            tecnicas={<CaminoContinuo unidades={[unidadTecnicas]} basePath="/naipia/aprender" colorHex={COLOR_NAIPIA} />}
            clases={
              hayClases ? (
                <CaminoContinuo unidades={[unidadClases]} basePath="/naipia/aprender" colorHex={COLOR_NAIPIA} />
              ) : null
            }
          />
        </AprenderLayout>
      </div>
    </>
  );
}
