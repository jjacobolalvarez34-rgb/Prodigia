// Anatomía: los 4 modos de la web (AnatomiaSprintRunner.tsx). En el modo óseo, desde
// el nivel 3, el hueso se toca en el esqueleto (el mismo dibujo de la web, con cada
// hueso como zona); el resto es de opción múltiple.
import { generarPreguntaAnatomia, NOMBRE_MODO_ANATOMIA, type ModoAnatomia } from "@/lib/practica/anatomia";
import type { MundoJugable } from "./tipos";

export const ANATOMIA: MundoJugable = {
  slug: "anatomia",
  modos: [
    { id: "oseo", nombre: NOMBRE_MODO_ANATOMIA.oseo, simbolo: "🦴", descripcion: "Huesos: nómbralos y encuéntralos." },
    { id: "muscular", nombre: NOMBRE_MODO_ANATOMIA.muscular, simbolo: "💪", descripcion: "Músculos del cuerpo y la cara." },
    { id: "organos", nombre: NOMBRE_MODO_ANATOMIA.organos, simbolo: "♥", descripcion: "Corazón, pulmones y más." },
    { id: "nervioso", nombre: NOMBRE_MODO_ANATOMIA.nervioso, simbolo: "✺", descripcion: "Cerebro, médula y pares craneales." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarPreguntaAnatomia(modo as ModoAnatomia, nivel, usados);
    return {
      enunciado: p.enunciado,
      entrada: p.tipo === "click" ? { tipo: "esqueleto", objetivo: p.objetivoHueso, respuesta: p.respuesta } : { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta },
      clave: p.clave,
    };
  },
};
