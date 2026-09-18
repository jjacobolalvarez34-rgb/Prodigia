import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoHistoria } from "@/lib/historia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_HISTORIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Historia.aprenderPage.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function HistoriaAprenderPage() {
  const t = await getTranslations("Historia.aprenderPage");
  const supabase = await createClient();
  const { user } = await requireUsuario(supabase, "/historia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  const tMundos = await getTranslations("Mundos.nombres");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoHistoria(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "historia",
      nombre: tMundos("historia"),
      descripcion: t("unidad.descripcion"),
      nodos: nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("titulo")}
          subtitulo={t("subtitulo")}
          progresoLabel={t("progreso")}
          tecnicasTexto={t("tecnicas", { dominadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_HISTORIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/historia/aprender" colorHex={COLOR_HISTORIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
