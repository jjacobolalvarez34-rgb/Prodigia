import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireMundoGeografia, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoGeografia } from "@/lib/geografia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_GEOGRAFIA } from "../GeografiaMapa";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Geografia.metadata.aprender");
  return { title: t("title"), description: t("description") };
}

export default async function GeografiaAprenderPage() {
  const t = await getTranslations("Geografia");
  const supabase = await createClient();
  const { user } = await requireMundoGeografia(supabase, "/geografia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const nodos = await obtenerCaminoGeografia(supabase, user.id);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "geografia",
      nombre: t("nombreMundo"),
      descripcion: t("aprender.descripcionUnidad"),
      nodos: nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          tecnicasTexto={t("aprender.tecnicas", { completadas: totalDominadas, total: nodos.length })}
          colorHex={COLOR_GEOGRAFIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/geografia/aprender" colorHex={COLOR_GEOGRAFIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
