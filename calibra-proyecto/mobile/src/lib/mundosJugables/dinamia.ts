// Dinamia (Física): los 6 modos de la web. Las cuentas se responden con el
// teclado (coma y signo); las gráficas y los vectores se dibujan arriba.
import { claveDinamia, DESCRIPCION_MODO_DINAMIA, generarProblemaDinamia, NOMBRE_MODO_DINAMIA, SIMBOLO_MODO_DINAMIA, type ModoDinamia } from "@/lib/practica/dinamia";
import { conRngSembrado } from "@/lib/estadistica/util";
import { generarSinRepetir } from "@/lib/practica/generarUnico";
import type { MundoJugable } from "./tipos";

export const DINAMIA: MundoJugable = {
  slug: "dinamia",
  modos: [
    { id: "cinematica", nombre: NOMBRE_MODO_DINAMIA.cinematica, simbolo: SIMBOLO_MODO_DINAMIA.cinematica, descripcion: DESCRIPCION_MODO_DINAMIA.cinematica },
    { id: "vectores", nombre: NOMBRE_MODO_DINAMIA.vectores, simbolo: SIMBOLO_MODO_DINAMIA.vectores, descripcion: DESCRIPCION_MODO_DINAMIA.vectores },
    { id: "newton", nombre: NOMBRE_MODO_DINAMIA.newton, simbolo: SIMBOLO_MODO_DINAMIA.newton, descripcion: DESCRIPCION_MODO_DINAMIA.newton },
    { id: "energia", nombre: NOMBRE_MODO_DINAMIA.energia, simbolo: SIMBOLO_MODO_DINAMIA.energia, descripcion: DESCRIPCION_MODO_DINAMIA.energia },
    { id: "termo", nombre: NOMBRE_MODO_DINAMIA.termo, simbolo: SIMBOLO_MODO_DINAMIA.termo, descripcion: DESCRIPCION_MODO_DINAMIA.termo },
    { id: "fluidos", nombre: NOMBRE_MODO_DINAMIA.fluidos, simbolo: SIMBOLO_MODO_DINAMIA.fluidos, descripcion: DESCRIPCION_MODO_DINAMIA.fluidos },
  ],
  generar: (modo, nivel, usados, _contexto, rng) => {
    const generar = () => generarSinRepetir(() => generarProblemaDinamia(modo as ModoDinamia, nivel), claveDinamia, usados);
    const p = rng ? conRngSembrado(rng, generar) : generar();
    return {
      enunciado: p.enunciado,
      entrada:
        p.entrada === "numero"
          ? { tipo: "numero", respuesta: p.respuesta, tolerancia: p.tolerancia, decimales: true, negativos: true }
          : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      visuales: p.diagrama ? [{ tipo: "dinamia", diagrama: p.diagrama }] : undefined,
      clave: claveDinamia(p),
      solucion: p.entrada === "numero" ? String(p.respuesta).replace(".", ",") : undefined,
    };
  },
};
