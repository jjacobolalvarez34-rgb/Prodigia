import type { ArithmeticProblemType } from "@/types/database";

export type MundoDuelo = "numeria" | "geografia" | "enigmia" | "quimia";

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
    return `/quimia/practica?duelo=${duelId}`;
  }
  // La operación real (asignada por buscar_rival_duelo, ver Rankeds) se
  // lee siempre del duelo en sí (obtener_duelo) apenas se carga
  // /practica?duelo=... — operationType acá es solo para no perder la
  // elección manual de un reto de amigos (Fase T2), donde sí se sigue
  // eligiendo a mano.
  return operationType ? `/practica?operacion=${operationType}&duelo=${duelId}` : `/practica?duelo=${duelId}`;
}
