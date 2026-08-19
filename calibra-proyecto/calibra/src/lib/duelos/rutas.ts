import type { ArithmeticProblemType } from "@/types/database";

export type MundoDuelo = "numeria" | "geografia" | "enigmia";

// A dónde lleva jugar un duelo según en qué ciudad cayó — un solo lugar,
// usado por RankedsClient (matchmaking, duelos pendientes) y por la
// pantalla de la serie "todas las ciudades" (Fase 5).
export function hrefDuelo(mundo: MundoDuelo, operationType: ArithmeticProblemType | null, duelId: string): string {
  if (mundo === "geografia") return `/geografia/practica?duelo=${duelId}`;
  if (mundo === "enigmia") return `/enigmia/practica?duelo=${duelId}`;
  return `/practica?operacion=${operationType}&duelo=${duelId}`;
}
