// Vitalia (Biología): los 6 modos de la web. La célula y la mitosis se dibujan
// arriba del enunciado; la genética trae cuentas con el teclado.
import { claveVitalia, DESCRIPCION_MODO_VITALIA, generarProblemaVitalia, NOMBRE_MODO_VITALIA, SIMBOLO_MODO_VITALIA, type ModoVitalia } from "@/lib/practica/vitalia";
import { conRngSembrado } from "@/lib/estadistica/util";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable } from "./tipos";

export const VITALIA: MundoJugable = {
  slug: "vitalia",
  modos: [
    { id: "celula", nombre: NOMBRE_MODO_VITALIA.celula, simbolo: SIMBOLO_MODO_VITALIA.celula, descripcion: DESCRIPCION_MODO_VITALIA.celula },
    { id: "procesos", nombre: NOMBRE_MODO_VITALIA.procesos, simbolo: SIMBOLO_MODO_VITALIA.procesos, descripcion: DESCRIPCION_MODO_VITALIA.procesos },
    { id: "genetica", nombre: NOMBRE_MODO_VITALIA.genetica, simbolo: SIMBOLO_MODO_VITALIA.genetica, descripcion: DESCRIPCION_MODO_VITALIA.genetica },
    { id: "sistemas", nombre: NOMBRE_MODO_VITALIA.sistemas, simbolo: SIMBOLO_MODO_VITALIA.sistemas, descripcion: DESCRIPCION_MODO_VITALIA.sistemas },
    { id: "reinos", nombre: NOMBRE_MODO_VITALIA.reinos, simbolo: SIMBOLO_MODO_VITALIA.reinos, descripcion: DESCRIPCION_MODO_VITALIA.reinos },
    { id: "ecologia", nombre: NOMBRE_MODO_VITALIA.ecologia, simbolo: SIMBOLO_MODO_VITALIA.ecologia, descripcion: DESCRIPCION_MODO_VITALIA.ecologia },
  ],
  generar: (modo, nivel, usados, _contexto, rng) => {
    const generar = () => generarSinRepetir(() => generarProblemaVitalia(modo as ModoVitalia, nivel), claveVitalia, usados);
    const p = rng ? conRngSembrado(rng, generar) : generar();
    return {
      enunciado: p.enunciado,
      entrada: p.entrada === "numero" ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true } : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.diagrama ? [{ tipo: "vitalia", diagrama: p.diagrama }] : undefined,
      clave: claveVitalia(p),
    };
  },
};
