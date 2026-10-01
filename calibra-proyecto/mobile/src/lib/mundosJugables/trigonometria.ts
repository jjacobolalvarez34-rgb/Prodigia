// Trigonometría: los 4 modos de la web (TrigonometriaSprintRunner.tsx). Razones y
// leyes son numéricas (lados y ángulos, con decimales) y dibujan el triángulo;
// círculo unitario e identidades son de opciones con valores exactos en LaTeX.
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { generarProblemaTrigonometria, NOMBRE_MODO_TRIGONOMETRIA, type ModoTrigonometria, type ProblemaTrigonometria } from "@/lib/practica/trigonometria";
import type { MundoJugable } from "./tipos";

const clave = (p: ProblemaTrigonometria) => `${p.enunciado}|${p.respuesta}`;

export const TRIGONOMETRIA: MundoJugable = {
  slug: "trigonometria",
  modos: [
    { id: "razones", nombre: NOMBRE_MODO_TRIGONOMETRIA.razones, simbolo: "◺", descripcion: "Seno, coseno y tangente en el triángulo rectángulo." },
    { id: "circulo", nombre: NOMBRE_MODO_TRIGONOMETRIA.circulo, simbolo: "◯", descripcion: "Valores exactos y radianes." },
    { id: "identidades", nombre: NOMBRE_MODO_TRIGONOMETRIA.identidades, simbolo: "≡", descripcion: "Pitagórica, ángulo doble y más." },
    { id: "leyes", nombre: NOMBRE_MODO_TRIGONOMETRIA.leyes, simbolo: "△", descripcion: "Triángulos oblicuos." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarSinRepetir(() => generarProblemaTrigonometria(modo as ModoTrigonometria, nivel), clave, usados);
    return {
      enunciado: p.enunciado,
      formato: "formulas",
      entrada:
        p.entrada === "numero"
          ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true }
          : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.triangulo ? [{ tipo: "triangulo", triangulo: p.triangulo }] : undefined,
      clave: clave(p),
    };
  },
};
