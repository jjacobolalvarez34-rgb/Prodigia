"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import GraficoEstadistico from "@/components/estadistica/GraficoEstadistico";
import { useReproductor } from "@/components/aprender/useReproductor";
import { esGraficoEstadistica } from "@/lib/estadistica/visualesDatos";
import type { GraficoEstadistica } from "@/lib/estadistica/tipos";
import type { VisualEstadisticaGrafico } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaGrafico;
}

const CLAVE_TIPO = {
  barras: "graficoTipoBarras",
  lineas: "graficoTipoLineas",
  histograma: "graficoTipoHistograma",
  boxplot: "graficoTipoBoxplot",
} as const;

// Reusa el SVG existente del modo 5 de la práctica (barras, líneas,
// histograma, diagrama de caja) con datos FIJOS del ejemplo de la lección
// —nunca aleatorios— y una entrada animada (aparece al entrar en pantalla).
// El dibujo lo hace src/components/estadistica/*, que solo dibuja lo que le
// pasan y no calcula ninguna respuesta.
export default function GraficoLeccion({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok = esGraficoEstadistica(visual.grafico);
  // Un solo paso: el reproductor aporta el "entrar en pantalla" y respeta
  // prefers-reduced-motion; el gráfico aparece con el primer paso.
  const r = useReproductor({ total: 1, ms: 300, estatico: visual.estatico });
  if (!ok) return null;

  const g: GraficoEstadistica = visual.grafico;
  const tipo = t(CLAVE_TIPO[g.tipo]);
  const etiqueta = t("graficoEtiqueta", { tipo, titulo: g.titulo });
  const alternativa = (
    <>
      <p>{etiqueta}</p>
      <p>{datosGrafico(g, num, t)}</p>
    </>
  );
  const enVista = r.paso >= 1;

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa}>
      <motion.div
        initial={r.reducir ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: enVista ? 1 : 0, scale: enVista ? 1 : 0.94 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <GraficoEstadistico grafico={g} colorHex={COLOR_ESTADISTICA} />
      </motion.div>
    </MarcoVisual>
  );
}

// Los datos del gráfico como texto (alternativa para lectores de pantalla).
function datosGrafico(g: GraficoEstadistica, num: (n: number) => string, t: (clave: string, valores?: Record<string, string | number>) => string): string {
  if (g.tipo === "barras") return t("graficoDatosBarras", { datos: g.categorias.map((c, i) => `${c}: ${num(g.valores[i])}`).join("; "), inicio: num(g.eje.min) });
  if (g.tipo === "lineas") return t("graficoDatosLineas", { datos: g.etiquetas.map((e, i) => `${e}: ${num(g.valores[i])}`).join("; ") });
  if (g.tipo === "histograma") {
    const clases = g.frecuencias.map((f, i) => `[${num(g.limites[i])}, ${num(g.limites[i + 1])}): ${num(f)}`).join("; ");
    return t("graficoDatosHistograma", { datos: clases });
  }
  return t("graficoDatosBoxplot", {
    min: num(g.min),
    q1: num(g.q1),
    mediana: num(g.mediana),
    q3: num(g.q3),
    max: num(g.max),
    atipicos: g.atipicos.length > 0 ? g.atipicos.map(num).join(", ") : "—",
  });
}
