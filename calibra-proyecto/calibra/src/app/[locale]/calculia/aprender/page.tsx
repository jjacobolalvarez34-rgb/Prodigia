import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario, bloquearInvitado } from "@/lib/auth/guard";
import { obtenerCaminoCalculia } from "@/lib/calculia/path";
import Header from "@/components/Header";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";
import { COLOR_CALCULIA } from "../colores";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculia.aprender.metadata");
  return { title: t("title"), description: t("description") };
}

export default async function CalculiaAprenderPage() {
  const t = await getTranslations("Calculia");
  const supabase = await createClient();
  const { user, profile } = await requireUsuario(supabase, "/calculia/aprender");
  const tBloqueos = await getTranslations("Bloqueos.invitado.secciones");
  bloquearInvitado(user, tBloqueos("aprender"));
  const esPro = profile.plan === "pro";
  const nodos = await obtenerCaminoCalculia(supabase, user.id, esPro);

  const totalDominadas = nodos.filter((n) => n.estado === "completado").length;

  const tecnicasRapidas = nodos.filter((n) => !n.requierePro);
  const cursoPro = nodos.filter((n) => n.requierePro);

  const unidadesGenericas: UnidadCaminoGenerico[] = [
    {
      id: "calculia-tecnicas-rapidas",
      nombre: t("aprender.tecnicasRapidas.titulo"),
      descripcion: t("aprender.descripcionUnidad"),
      nodos: tecnicasRapidas.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
    },
  ];

  // Curso estructurado (Pro) — piloto único en Calculia, ver el plan de
  // Fase C. Módulo 1 (orden más bajo) siempre viene "activo" (preview
  // gratis) desde obtenerCaminoCalculia; los módulos 2+ para quien no
  // es Pro vienen "bloqueado" con bloqueadoPorPlan=true, así que acá se
  // les agrega el CTA a /pro en vez del bloqueo mudo normal.
  if (cursoPro.length > 0) {
    unidadesGenericas.push({
      id: "calculia-curso-pro",
      nombre: t("aprender.cursoPro.titulo"),
      descripcion: t("aprender.cursoPro.descripcion"),
      nodos: cursoPro.map((n) => ({
        id: n.id,
        slug: n.slug,
        nombre: n.nombre,
        estado: n.estado,
        ctaPro: n.bloqueadoPorPlan
          ? { label: t("aprender.cursoPro.desbloqueaConPro"), href: "/pro?next=/calculia/aprender" }
          : undefined,
      })),
    });
  }

  return (
    <>
      <Header autenticado />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <AprenderLayout
          titulo={t("aprender.titulo")}
          subtitulo={t("aprender.subtitulo")}
          progresoLabel={t("aprender.progreso")}
          tecnicasTexto={t("aprender.tecnicas", { n: totalDominadas, total: nodos.length })}
          colorHex={COLOR_CALCULIA}
          totalDominadas={totalDominadas}
          totalTecnicas={nodos.length}
          unidadesSidebar={unidadesGenericas.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            dominadas: u.nodos.filter((n) => n.estado === "completado").length,
            total: u.nodos.length,
          }))}
        >
          <CaminoContinuo unidades={unidadesGenericas} basePath="/calculia/aprender" colorHex={COLOR_CALCULIA} />
        </AprenderLayout>
      </div>
    </>
  );
}
