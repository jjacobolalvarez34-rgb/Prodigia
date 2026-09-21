import type { ArithmeticProblemType } from "@/types/database";

export type MundoDuelo = "numeria" | "geografia" | "enigmia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia" | "calculia" | "circuitia" | "estadistica" | "naipia" | "codia";

// Paleta de acento por mundo — fuente única para todo lo relacionado a
// duelos (antes vivía duplicada, mismos 6 hex, en RankedsClient,
// SerieDueloClient, RetoDiarioClient, FondoCursorMundo y
// NivelMundoSubio). Coincide además con colorDelMundo de Header.tsx.
export const COLOR_MUNDO: Record<MundoDuelo, string> = {
  numeria: "#6C4CF1",
  enigmia: "#0E9F6E",
  geografia: "#1E7A8C",
  anatomia: "#8B2942",
  melodia: "#B8860B",
  quimia: "#C026D3",
  trigonometria: "#84CC16",
  historia: "#A0522D",
  calculia: "#4338CA",
  circuitia: "#F59E0B",
  estadistica: "#0D9488",
  naipia: "#B91C1C",
  codia: "#06B6D4",
};

// A dónde lleva jugar un duelo según en qué ciudad cayó — un solo lugar,
// usado por RankedsClient (matchmaking, duelos pendientes) y por la
// pantalla de la serie "todas las ciudades" (Fase 5). Quimia tiene 3
// modos (sub_tipo), pero las 3 rutas de práctica aceptan ?duelo= igual
// que las demás — el modo real ya viene resuelto server-side en el
// duelo (sub_tipo), la ruta exacta solo importa para que cargue la UI
// del modo correcto.
export function hrefDuelo(mundo: MundoDuelo, operationType: ArithmeticProblemType | null, duelId: string, subTipo?: string | null): string {
  if (mundo === "geografia") return `/geografia/practica?duelo=${duelId}`;
  if (mundo === "enigmia") return `/enigmia/practica?duelo=${duelId}`;
  if (mundo === "quimia") {
    if (subTipo === "formulas") return `/quimia/practica/formulas?duelo=${duelId}`;
    if (subTipo === "tabla") return `/quimia/practica/tabla?duelo=${duelId}`;
    if (subTipo === "nomenclatura") return `/quimia/practica/nomenclatura?duelo=${duelId}`;
    if (subTipo === "organica") return `/quimia/practica/organica?duelo=${duelId}`;
    return `/quimia/practica?duelo=${duelId}`;
  }
  if (mundo === "anatomia") {
    if (subTipo === "muscular") return `/anatomia/practica/muscular?duelo=${duelId}`;
    if (subTipo === "organos") return `/anatomia/practica/organos?duelo=${duelId}`;
    if (subTipo === "nervioso") return `/anatomia/practica/nervioso?duelo=${duelId}`;
    return `/anatomia/practica?duelo=${duelId}`;
  }
  if (mundo === "melodia") {
    if (subTipo === "lectura") return `/melodia/practica/lectura?duelo=${duelId}`;
    if (subTipo === "alteraciones") return `/melodia/practica/alteraciones?duelo=${duelId}`;
    if (subTipo === "escalas") return `/melodia/practica/escalas?duelo=${duelId}`;
    if (subTipo === "acordes") return `/melodia/practica/acordes?duelo=${duelId}`;
    if (subTipo === "oido_absoluto") return `/melodia/practica/oido-absoluto?duelo=${duelId}`;
    return `/melodia/practica?duelo=${duelId}`;
  }
  if (mundo === "trigonometria") {
    if (subTipo === "circulo") return `/trigonometria/practica/circulo?duelo=${duelId}`;
    if (subTipo === "identidades") return `/trigonometria/practica/identidades?duelo=${duelId}`;
    if (subTipo === "leyes") return `/trigonometria/practica/leyes?duelo=${duelId}`;
    return `/trigonometria/practica?duelo=${duelId}`;
  }
  if (mundo === "historia") {
    if (subTipo === "personajes") return `/historia/practica/personajes?duelo=${duelId}`;
    if (subTipo === "causaefecto") return `/historia/practica/causaefecto?duelo=${duelId}`;
    if (subTipo === "fechas") return `/historia/practica/fechas?duelo=${duelId}`;
    return `/historia/practica?duelo=${duelId}`;
  }
  if (mundo === "calculia") {
    if (subTipo === "integrales") return `/calculia/practica/integrales?duelo=${duelId}`;
    if (subTipo === "series") return `/calculia/practica/series?duelo=${duelId}`;
    if (subTipo === "multivariable") return `/calculia/practica/multivariable?duelo=${duelId}`;
    return `/calculia/practica?duelo=${duelId}`;
  }
  if (mundo === "circuitia") {
    if (subTipo === "paralelo") return `/circuitia/practica/paralelo?duelo=${duelId}`;
    if (subTipo === "mixto") return `/circuitia/practica/mixto?duelo=${duelId}`;
    if (subTipo === "cualitativo") return `/circuitia/practica/cualitativo?duelo=${duelId}`;
    return `/circuitia/practica?duelo=${duelId}`;
  }
  // Mundos 11-13: las páginas /<mundo>/practica/<modo> las crea la Fase 1
  // de cada mundo (el modo por defecto — el primero — vive en /practica).
  if (mundo === "estadistica") {
    if (subTipo === "dispersion") return `/estadistica/practica/dispersion?duelo=${duelId}`;
    if (subTipo === "probabilidad") return `/estadistica/practica/probabilidad?duelo=${duelId}`;
    if (subTipo === "datos") return `/estadistica/practica/datos?duelo=${duelId}`;
    if (subTipo === "graficos") return `/estadistica/practica/graficos?duelo=${duelId}`;
    return `/estadistica/practica?duelo=${duelId}`;
  }
  if (mundo === "naipia") {
    if (subTipo === "ko") return `/naipia/practica/ko?duelo=${duelId}`;
    if (subTipo === "hiopt2") return `/naipia/practica/hiopt2?duelo=${duelId}`;
    if (subTipo === "omega2") return `/naipia/practica/omega2?duelo=${duelId}`;
    if (subTipo === "verdadero") return `/naipia/practica/verdadero?duelo=${duelId}`;
    return `/naipia/practica?duelo=${duelId}`;
  }
  if (mundo === "codia") {
    if (subTipo === "salida") return `/codia/practica/salida?duelo=${duelId}`;
    if (subTipo === "error") return `/codia/practica/error?duelo=${duelId}`;
    if (subTipo === "estructuras") return `/codia/practica/estructuras?duelo=${duelId}`;
    return `/codia/practica?duelo=${duelId}`;
  }
  // La operación real (asignada por buscar_rival_duelo, ver Rankeds) se
  // lee siempre del duelo en sí (obtener_duelo) apenas se carga
  // /practica?duelo=... — operationType acá es solo para no perder la
  // elección manual de un reto de amigos (Fase T2), donde sí se sigue
  // eligiendo a mano.
  return operationType ? `/practica?operacion=${operationType}&duelo=${duelId}` : `/practica?duelo=${duelId}`;
}
