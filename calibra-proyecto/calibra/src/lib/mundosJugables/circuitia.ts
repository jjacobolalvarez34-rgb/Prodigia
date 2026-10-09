// Circuitia: los 4 modos de la web (CircuitiaSprintRunner.tsx). Cada pregunta dibuja
// su circuito (topología real, resuelta por el mismo kernel de la web); serie,
// paralelo y mixto son numéricas, cualitativo es de opciones.
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import { generarProblemaCircuitia, NOMBRE_MODO_CIRCUITIA, type ModoCircuitia, type ProblemaCircuitia } from "@/lib/practica/circuitia";
import type { MundoJugable } from "./tipos";

const clave = (p: ProblemaCircuitia) => `${p.enunciado}|${p.respuesta}`;

export const CIRCUITIA: MundoJugable = {
  slug: "circuitia",
  modos: [
    { id: "serie", nombre: NOMBRE_MODO_CIRCUITIA.serie, simbolo: "─Ω─", descripcion: "Resistencias una tras otra." },
    { id: "paralelo", nombre: NOMBRE_MODO_CIRCUITIA.paralelo, simbolo: "‖", descripcion: "Resistencias lado a lado." },
    { id: "mixto", nombre: NOMBRE_MODO_CIRCUITIA.mixto, simbolo: "⚡", descripcion: "Serie y paralelo juntos." },
    { id: "cualitativo", nombre: NOMBRE_MODO_CIRCUITIA.cualitativo, simbolo: "↕", descripcion: "Qué cambia si tocas una pieza." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarSinRepetir(() => generarProblemaCircuitia(modo as ModoCircuitia, nivel), clave, usados);
    return {
      enunciado: p.enunciado,
      formato: "formulas",
      entrada:
        p.entrada === "numero"
          ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true }
          : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: [{ tipo: "circuito", topologia: p.topologia, vFuente: p.vFuente, resaltarId: p.resaltarId }],
      clave: clave(p),
    };
  },
};
