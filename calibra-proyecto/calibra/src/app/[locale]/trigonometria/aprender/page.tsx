import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoTrigonometria, ORDEN_GRUPOS_TRIGONOMETRIA, type GrupoTrigonometria } from "@/lib/trigonometria/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_TRIGONOMETRIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trigonometria.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function TrigonometriaAprenderPage() {
  const t = await getTranslations("Trigonometria");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/trigonometria/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoTrigonometria(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  // Nombres/descripciones de grupo — reutiliza Trigonometria.modos.* y
  // Trigonometria.elegir.descripciones.* (ya existen para la pantalla
  // de práctica) para los mismos grupos en el sidebar de Aprender (Fase
  // paridad-sidebar, ver docs/PARIDAD_MUNDOS.md footnote ⁹), sin
  // duplicar strings nuevos.
  const NOMBRE_GRUPO: Record<GrupoTrigonometria, string> = {
    razones: t("modos.razones"),
    circulo: t("modos.circulo"),
    leyes: t("modos.leyes"),
  };
  const DESCRIPCION_GRUPO: Record<GrupoTrigonometria, string> = {
    razones: t("elegir.descripciones.razones"),
    circulo: t("elegir.descripciones.circulo"),
    leyes: t("elegir.descripciones.leyes"),
  };

  const unidadesGenericas: UnidadCaminoGenerico[] = ORDEN_GRUPOS_TRIGONOMETRIA.map((grupo) => ({
    grupo,
    nodos: nodos.filter((n) => n.grupo === grupo),
  }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `trigonometria-${g.grupo}`,
      nombre: NOMBRE_GRUPO[g.grupo],
      descripcion: DESCRIPCION_GRUPO[g.grupo],
      nodos: g.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    }));

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          tecnicasTexto={t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={COLOR_TRIGONOMETRIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/trigonometria/aprender" colorHex={COLOR_TRIGONOMETRIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
