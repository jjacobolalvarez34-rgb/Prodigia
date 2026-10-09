// Estadística: los 5 modos de la web (EstadisticaSprintRunner.tsx). Lectura de
// gráficos dibuja el gráfico (barras, líneas, histograma o caja); las respuestas
// numéricas pueden llevar decimales y signo (puntaje z, correlación).
import { claveEstadistica, generarProblemaEstadistica, NOMBRE_MODO_ESTADISTICA, type ModoEstadistica } from "@/lib/practica/estadistica";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable } from "./tipos";

export const ESTADISTICA: MundoJugable = {
  slug: "estadistica",
  modos: [
    { id: "central", nombre: NOMBRE_MODO_ESTADISTICA.central, simbolo: "x̄", descripcion: "Media, mediana y moda." },
    { id: "dispersion", nombre: NOMBRE_MODO_ESTADISTICA.dispersion, simbolo: "σ", descripcion: "Varianza, desvío y cuartiles." },
    { id: "probabilidad", nombre: NOMBRE_MODO_ESTADISTICA.probabilidad, simbolo: "%", descripcion: "Azar y combinatoria." },
    { id: "datos", nombre: NOMBRE_MODO_ESTADISTICA.datos, simbolo: "z", descripcion: "Percentiles, atípicos y correlación." },
    { id: "graficos", nombre: NOMBRE_MODO_ESTADISTICA.graficos, simbolo: "▥", descripcion: "Leer lo que dice un gráfico." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarSinRepetir(() => generarProblemaEstadistica(modo as ModoEstadistica, nivel), claveEstadistica, usados);
    return {
      enunciado: p.enunciado,
      formato: "formulas",
      entrada:
        p.entrada === "numero"
          ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true, negativos: true }
          : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.grafico ? [{ tipo: "grafico", grafico: p.grafico }] : undefined,
      clave: claveEstadistica(p),
    };
  },
};
