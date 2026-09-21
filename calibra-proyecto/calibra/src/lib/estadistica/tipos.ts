// Tipos públicos del mundo Estadística (mundo 11). Viven acá (y no en
// src/lib/practica/estadistica.ts) para que el generador de gráficos y
// los componentes SVG puedan importarlos sin dependencias circulares;
// estadistica.ts los re-exporta.

export type ModoEstadistica = "central" | "dispersion" | "probabilidad" | "datos" | "graficos";

export const NOMBRE_MODO_ESTADISTICA: Record<ModoEstadistica, string> = {
  central: "Tendencia central",
  dispersion: "Dispersión",
  probabilidad: "Probabilidad y combinatoria",
  datos: "Análisis de datos",
  graficos: "Lectura de gráficos",
};

export const MODOS_ESTADISTICA: readonly ModoEstadistica[] = ["central", "dispersion", "probabilidad", "datos", "graficos"];

// ---------- Gráficos (modo 5) ----------

export interface EjeValores {
  min: number;
  max: number;
  // Separación de las líneas guía con etiqueta. Los valores del gráfico
  // son múltiplos de `tick` (nivel bajo) o de `tick / 2` (niveles
  // altos, se dibuja una guía secundaria en la mitad).
  tick: number;
  etiqueta: string;
}

export type GraficoEstadistica =
  | { tipo: "barras"; titulo: string; categorias: string[]; valores: number[]; eje: EjeValores }
  | { tipo: "lineas"; titulo: string; etiquetas: string[]; valores: number[]; eje: EjeValores }
  | {
      tipo: "histograma";
      titulo: string;
      // limites.length === frecuencias.length + 1. Cada clase incluye su
      // límite inferior y NO el superior: [a, b).
      limites: number[];
      frecuencias: number[];
      eje: EjeValores;
      etiquetaX: string;
    }
  | {
      tipo: "boxplot";
      titulo: string;
      // Extremos de los bigotes (último dato NO atípico de cada lado).
      min: number;
      q1: number;
      mediana: number;
      q3: number;
      max: number;
      // Puntos aislados fuera de 1.5·IQR (regla de Tukey).
      atipicos: number[];
      // Eje horizontal (mismo tipo, distinta orientación).
      eje: EjeValores;
    };

// ---------- Problemas ----------

export type TipoProblemaEstadistica =
  // central
  | "media"
  | "mediana"
  | "moda"
  | "rango"
  | "media_frecuencias"
  | "dato_faltante"
  // dispersión
  | "iqr"
  | "varianza_poblacional"
  | "desvio_poblacional"
  | "varianza_muestral"
  | "desvio_muestral"
  | "transformacion_varianza"
  | "transformacion_desvio"
  // probabilidad
  | "prob_simple"
  | "prob_dado"
  | "prob_complemento"
  | "prob_independientes"
  | "prob_condicional_tabla"
  | "prob_sin_reposicion"
  | "prob_combinatoria"
  | "factorial"
  | "permutaciones"
  | "combinaciones"
  // datos
  | "percentil"
  | "rango_percentil"
  | "z_score"
  | "z_inverso"
  | "z_comparar"
  | "regla_empirica"
  | "atipicos_cantidad"
  | "atipicos_valor"
  | "atipicos_cerca"
  | "correlacion_signo"
  | "regresion_pendiente"
  | "regresion_intercepto"
  | "regresion_prediccion"
  | "correlacion_r"
  // gráficos
  | "grafico_valor"
  | "grafico_mayor"
  | "grafico_menor"
  | "grafico_diferencia"
  | "grafico_total"
  | "grafico_tendencia"
  | "grafico_mayor_aumento"
  | "histograma_total"
  | "histograma_clase_modal"
  | "histograma_acumulado"
  | "boxplot_valor"
  | "boxplot_iqr"
  | "boxplot_atipicos"
  | "boxplot_porcentaje"
  | "engano_escala"
  | "engano_porcentaje"
  | "engano_aparente";

// Metadatos para los tests (y para nadie más): qué tipo de pregunta es y
// los parámetros escalares que no se recuperan del enunciado.
export interface DetalleEstadistica {
  tipo: TipoProblemaEstadistica;
  params?: Record<string, number | string>;
}

interface ProblemaEstadisticaBase {
  modo: ModoEstadistica;
  enunciado: string;
  detalle: DetalleEstadistica;
  // Solo modo "graficos": el gráfico a dibujar sobre el enunciado.
  grafico?: GraficoEstadistica;
}

export interface ProblemaEstadisticaOpciones extends ProblemaEstadisticaBase {
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export interface ProblemaEstadisticaNumero extends ProblemaEstadisticaBase {
  entrada: "numero";
  // Siempre normalizada a 2 decimales (o entera); se compara
  // NUMÉRICAMENTE (nunca como string: "5.20" y "5.2" son lo mismo).
  respuesta: number;
  tolerancia: number;
}

export type ProblemaEstadistica = ProblemaEstadisticaOpciones | ProblemaEstadisticaNumero;
