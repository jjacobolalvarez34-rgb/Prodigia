// Quimia: los 5 modos de la web (QuimiaSprintRunner.tsx). Orgánica dibuja la fórmula
// estructural del compuesto; todo el texto lleva los subíndices de las fórmulas.
import { generarPreguntaQuimia, NOMBRE_MODO_QUIMIA, type ModoQuimia } from "@/lib/practica/quimia";
import { generarPreguntaOrganica } from "@/lib/practica/quimicaOrganica";
import type { MundoJugable } from "./tipos";

export const QUIMIA: MundoJugable = {
  slug: "quimia",
  modos: [
    { id: "simbolos", nombre: NOMBRE_MODO_QUIMIA.simbolos, simbolo: "H", descripcion: "Elemento y su símbolo." },
    { id: "formulas", nombre: NOMBRE_MODO_QUIMIA.formulas, simbolo: "H₂O", descripcion: "Compuestos y sus fórmulas." },
    { id: "tabla", nombre: NOMBRE_MODO_QUIMIA.tabla, simbolo: "▦", descripcion: "Grupos, períodos y propiedades." },
    { id: "nomenclatura", nombre: NOMBRE_MODO_QUIMIA.nomenclatura, simbolo: "Aa", descripcion: "Cómo se nombran." },
    { id: "organica", nombre: NOMBRE_MODO_QUIMIA.organica, simbolo: "⬡", descripcion: "Moléculas del carbono." },
  ],
  generar: (modo, nivel, usados, _ctx, rng) => {
    const p = modo === "organica" ? generarPreguntaOrganica(nivel, usados, rng) : generarPreguntaQuimia(modo as ModoQuimia, nivel, usados, rng);
    return {
      enunciado: p.enunciado,
      formato: "quimica",
      entrada: { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.diagramaId ? [{ tipo: "molecula", id: p.diagramaId }] : undefined,
      clave: p.clave,
    };
  },
};
