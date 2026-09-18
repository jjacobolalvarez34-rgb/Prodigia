import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoAnatomia, ORDEN_GRUPOS_ANATOMIA, type GrupoAnatomia } from "@/lib/anatomia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_ANATOMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Anatomia.aprender.metadata");
  return { title: t("titulo"), description: t("description") };
}

export default async function AnatomiaAprenderPage() {
  const t = await getTranslations("Anatomia");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/anatomia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoAnatomia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Nombres de los 4 sistemas — reutiliza Anatomia.elegir.modos.* (ya
  // existe para la pantalla de práctica) para nombrar los mismos grupos
  // en el sidebar de Aprender (Fase paridad-sidebar, ver
  // docs/PARIDAD_MUNDOS.md footnote ⁹), sin duplicar strings nuevos.
  const NOMBRE_GRUPO: Record<GrupoAnatomia, string> = {
    oseo: t("elegir.modos.oseo"),
    muscular: t("elegir.modos.muscular"),
    organos: t("elegir.modos.organos"),
    nervioso: t("elegir.modos.nervioso"),
  };

  const unidadesGenericas: UnidadCaminoGenerico[] = ORDEN_GRUPOS_ANATOMIA.map((grupo) => ({
    grupo,
    nodos: nodos.filter((n) => n.grupo === grupo),
  }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `anatomia-${g.grupo}`,
      nombre: NOMBRE_GRUPO[g.grupo],
      nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progresoLabel")}
          tecnicasTexto={t("aprender.tecnicasContador", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_ANATOMIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/anatomia/aprender" colorHex={COLOR_ANATOMIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
