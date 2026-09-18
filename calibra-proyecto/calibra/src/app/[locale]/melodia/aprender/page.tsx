import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoMelodia, ORDEN_GRUPOS_MELODIA, type GrupoMelodia } from "@/lib/melodia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_MELODIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Melodia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function MelodiaAprenderPage() {
  const t = await getTranslations("Melodia.aprender");
  // Nombres de los grupos — reutiliza Melodia.home.modos.* (ya existe
  // para la pantalla de práctica) para nombrar los mismos grupos en el
  // sidebar de Aprender (Fase paridad-sidebar, ver
  // docs/PARIDAD_MUNDOS.md footnote ⁹), sin duplicar strings nuevos.
  const tModos = await getTranslations("Melodia.home.modos");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/melodia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoMelodia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const NOMBRE_GRUPO: Record<GrupoMelodia, string> = {
    lectura: tModos("lectura"),
    alteraciones: tModos("alteraciones"),
    acordes: tModos("acordes"),
  };

  const unidadesGenericas: UnidadCaminoGenerico[] = ORDEN_GRUPOS_MELODIA.map((grupo) => ({
    grupo,
    nodos: nodos.filter((n) => n.grupo === grupo),
  }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `melodia-${g.grupo}`,
      nombre: NOMBRE_GRUPO[g.grupo],
      nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("titulo")}
          subtitulo={t("descripcion")}
          progresoLabel={t("progresoLabel")}
          tecnicasTexto={t("progresoContador", { completadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_MELODIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/melodia/aprender" colorHex={COLOR_MELODIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
