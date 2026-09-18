import { useTranslations } from "next-intl";
import type { TemaAprendible } from "@/lib/aprender/path";
import type { UnidadCamino } from "@/lib/aprender/path";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import AprenderLayout from "@/components/AprenderLayout";

const COLOR = "#6C4CF1";

interface Props {
  unidades: UnidadCamino[];
}

export default function AprenderShell({ unidades }: Props) {
  const t = useTranslations("Aprender");
  const DESCRIPCION_UNIDAD: Record<TemaAprendible, string> = {
    suma: t("descripcionUnidad.suma"),
    resta: t("descripcionUnidad.resta"),
    multiplicacion: t("descripcionUnidad.multiplicacion"),
    division: t("descripcionUnidad.division"),
    fracciones: t("descripcionUnidad.fracciones"),
    decimales: t("descripcionUnidad.decimales"),
    potencias: t("descripcionUnidad.potencias"),
    algebra: t("descripcionUnidad.algebra"),
    geometria: t("descripcionUnidad.geometria"),
  };
  const totalDominadas = unidades.reduce(
    (acc, u) => acc + u.nodos.filter((n) => n.estado === "completado").length,
    0
  );
  const totalTecnicas = unidades.reduce((acc, u) => acc + u.nodos.length, 0);

  const unidadesGenericas: UnidadCaminoGenerico[] = unidades.map((u) => ({
    id: u.problemType,
    nombre: u.nombre,
    descripcion: DESCRIPCION_UNIDAD[u.problemType],
    nodos: u.nodos.map((n) => ({ id: n.id, slug: n.slug, nombre: n.nombre, estado: n.estado })),
  }));

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
      <AprenderLayout
        titulo={t("titulo")}
        subtitulo={t("subtitulo")}
        progresoLabel={t("progreso")}
        tecnicasTexto={t("tecnicas", { dominadas: totalDominadas, total: totalTecnicas })}
        colorHex={COLOR}
        totalDominadas={totalDominadas}
        totalTecnicas={totalTecnicas}
        unidadesSidebar={unidades.map((u) => ({
          id: u.problemType,
          nombre: u.nombre,
          dominadas: u.nodos.filter((n) => n.estado === "completado").length,
          total: u.nodos.length,
        }))}
      >
        <CaminoContinuo unidades={unidadesGenericas} basePath="/aprender" colorHex={COLOR} />
      </AprenderLayout>
    </div>
  );
}
