import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoQuimia, ORDEN_GRUPOS_QUIMIA, type GrupoQuimia } from "@/lib/quimia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_QUIMIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Quimia.aprenderPagina.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function QuimiaAprenderPage() {
  const t = await getTranslations("Quimia.aprenderPagina");
  // Grupos (modos.simbolos/formulas/tabla y elegir.desc*) ya existen en
  // i18n para la pantalla de práctica — se reutilizan acá para nombrar
  // los mismos 3 grupos en el sidebar de Aprender (Fase paridad-sidebar,
  // ver docs/PARIDAD_MUNDOS.md footnote ⁹), sin duplicar strings nuevos.
  const tQuimia = await getTranslations("Quimia");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/quimia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoQuimia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const NOMBRE_GRUPO: Record<GrupoQuimia, string> = {
    simbolos: tQuimia("modos.simbolos"),
    formulas: tQuimia("modos.formulas"),
    tabla: tQuimia("modos.tabla"),
  };
  const DESCRIPCION_GRUPO: Record<GrupoQuimia, string> = {
    simbolos: tQuimia("elegir.descSimbolos"),
    formulas: tQuimia("elegir.descFormulas"),
    tabla: tQuimia("elegir.descTabla"),
  };

  const unidadesGenericas: UnidadCaminoGenerico[] = ORDEN_GRUPOS_QUIMIA.map((grupo) => ({
    grupo,
    nodos: nodos.filter((n) => n.grupo === grupo),
  }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `quimia-${g.grupo}`,
      nombre: NOMBRE_GRUPO[g.grupo],
      descripcion: DESCRIPCION_GRUPO[g.grupo],
      nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("titulo")}
          subtitulo={t("subtitulo")}
          progresoLabel={t("progreso")}
          tecnicasTexto={t("progresoTecnicas", { completadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_QUIMIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/quimia/aprender" colorHex={COLOR_QUIMIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
