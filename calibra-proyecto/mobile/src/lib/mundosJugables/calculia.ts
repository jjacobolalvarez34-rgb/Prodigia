// Calculia: los 4 modos de la web (CalculiaSprintRunner.tsx). Las fórmulas vienen en
// LaTeX ($…$) y se pasan a Unicode; series mezcla respuesta numérica (puede ser
// negativa y con decimales) y de opciones.
import { generarProblemaCalculia, NOMBRE_MODO_CALCULIA, type ModoCalculia, type ProblemaCalculia } from "@/lib/practica/calculia";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable } from "./tipos";

const clave = (p: ProblemaCalculia) => `${p.enunciado}|${p.respuesta}`;

export const CALCULIA: MundoJugable = {
  slug: "calculia",
  modos: [
    { id: "derivadas", nombre: NOMBRE_MODO_CALCULIA.derivadas, simbolo: "d/dx", descripcion: "Potencia, producto, cociente y cadena." },
    { id: "integrales", nombre: NOMBRE_MODO_CALCULIA.integrales, simbolo: "∫", descripcion: "Primitivas y sustitución." },
    { id: "series", nombre: NOMBRE_MODO_CALCULIA.series, simbolo: "Σ", descripcion: "Sumas y convergencia." },
    { id: "multivariable", nombre: NOMBRE_MODO_CALCULIA.multivariable, simbolo: "∂", descripcion: "Parciales y ecuaciones diferenciales." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarSinRepetir(() => generarProblemaCalculia(modo as ModoCalculia, nivel), clave, usados);
    return {
      enunciado: p.enunciado,
      formato: "formulas",
      entrada:
        p.entrada === "numero"
          ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true, negativos: true }
          : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      clave: clave(p),
    };
  },
};
