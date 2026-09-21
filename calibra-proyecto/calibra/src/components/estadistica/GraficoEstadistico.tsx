import type { GraficoEstadistica } from "@/lib/estadistica/tipos";
import GraficoBarras from "./GraficoBarras";
import GraficoLineas from "./GraficoLineas";
import GraficoHistograma from "./GraficoHistograma";
import GraficoBoxplot from "./GraficoBoxplot";

interface Props {
  grafico: GraficoEstadistica;
  colorHex?: string;
}

// Despacha al SVG que corresponde a cada tipo de gráfico del modo 5.
export default function GraficoEstadistico({ grafico, colorHex = "#0D9488" }: Props) {
  return (
    <div className="flex w-full justify-center">
      {grafico.tipo === "barras" && <GraficoBarras titulo={grafico.titulo} categorias={grafico.categorias} valores={grafico.valores} eje={grafico.eje} colorHex={colorHex} />}
      {grafico.tipo === "lineas" && <GraficoLineas titulo={grafico.titulo} etiquetas={grafico.etiquetas} valores={grafico.valores} eje={grafico.eje} colorHex={colorHex} />}
      {grafico.tipo === "histograma" && (
        <GraficoHistograma titulo={grafico.titulo} limites={grafico.limites} frecuencias={grafico.frecuencias} eje={grafico.eje} etiquetaX={grafico.etiquetaX} colorHex={colorHex} />
      )}
      {grafico.tipo === "boxplot" && (
        <GraficoBoxplot
          titulo={grafico.titulo}
          min={grafico.min}
          q1={grafico.q1}
          mediana={grafico.mediana}
          q3={grafico.q3}
          max={grafico.max}
          atipicos={grafico.atipicos}
          eje={grafico.eje}
          colorHex={colorHex}
        />
      )}
    </div>
  );
}
