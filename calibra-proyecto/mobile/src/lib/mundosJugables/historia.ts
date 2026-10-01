// Historia: los 4 modos de la web son de opción múltiple (HistoriaSprintRunner.tsx).
import { generarPreguntaHistoria, NOMBRE_MODO_HISTORIA, type ModoHistoria } from "@/lib/practica/historia";
import type { MundoJugable } from "./tipos";

export const HISTORIA: MundoJugable = {
  slug: "historia",
  modos: [
    { id: "cronologia", nombre: NOMBRE_MODO_HISTORIA.cronologia, simbolo: "⌛", descripcion: "Qué pasó antes y qué después." },
    { id: "personajes", nombre: NOMBRE_MODO_HISTORIA.personajes, simbolo: "♔", descripcion: "Quién hizo qué." },
    { id: "causaefecto", nombre: NOMBRE_MODO_HISTORIA.causaefecto, simbolo: "⇒", descripcion: "Por qué pasaron las cosas." },
    { id: "fechas", nombre: NOMBRE_MODO_HISTORIA.fechas, simbolo: "📅", descripcion: "El año exacto." },
  ],
  generar: (modo, nivel, usados) => {
    const p = generarPreguntaHistoria(modo as ModoHistoria, nivel, usados);
    return { enunciado: p.enunciado, entrada: { tipo: "opciones", opciones: p.opciones, respuesta: p.respuesta }, clave: p.clave };
  },
};
