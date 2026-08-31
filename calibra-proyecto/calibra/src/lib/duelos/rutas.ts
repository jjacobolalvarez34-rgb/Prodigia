import type { ArithmeticProblemType } from "@/types/database";

export type MundoDuelo = "numeria" | "geografia" | "enigmia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia";

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
  // La operación real (asignada por buscar_rival_duelo, ver Rankeds) se
  // lee siempre del duelo en sí (obtener_duelo) apenas se carga
  // /practica?duelo=... — operationType acá es solo para no perder la
  // elección manual de un reto de amigos (Fase T2), donde sí se sigue
  // eligiendo a mano.
  return operationType ? `/practica?operacion=${operationType}&duelo=${duelId}` : `/practica?duelo=${duelId}`;
}
