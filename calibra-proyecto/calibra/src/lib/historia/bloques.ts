import type { ModoHistoria } from "@/lib/practica/historiaComun";
import { EPOCAS } from "./epocas";
import type { EpocaId } from "./tipos";

// Los 5 BLOQUES de Aprender de Historia son las 5 ÉPOCAS de la periodización
// escolar (Prehistoria, Antigüedad, Edad Media, Edad Moderna y Edad
// Contemporánea). Son la fuente única de los grupos de Aprender (Técnicas |
// Clases) y salen de src/lib/historia/epocas.ts, donde cada frontera (la
// escritura hacia 3500 a. C., la caída de Roma de Occidente en 476, la llegada de
// Colón en 1492 y la Revolución francesa en 1789) está documentada como CONVENCIÓN:
// otros textos usan 1453, 1776, 1815 o 1914, y en la historia de África, China o
// América precolombina los cortes no coinciden.
//
// RELACIÓN CON LA PRÁCTICA: los bloques NO se mapean uno a uno con los modos. Los
// modos (cronología, personajes, causa y efecto, fechas) son TIPOS DE PREGUNTA;
// cada uno pregunta por hechos y personajes de TODAS las épocas (la tabla
// canónica src/lib/historia/hechos.ts y personajes.ts es la fuente común). Por eso
// cada bloque declara que lo ejercitan los cuatro modos, y lo que garantiza que
// nada se pregunte sin enseñarse es el test de cobertura de lecciones.test.ts:
// todo hecho y todo personaje de la tabla aparece en al menos una Clase y una
// Técnica de SU época.
//
// Es presentación: no hay columna nueva en la base. Vive en su propio módulo
// (como src/lib/trigonometria/bloques.ts) para que el contenido tipado
// (lecciones/) y el camino (path.ts) puedan importarlo sin ciclos.

export type GrupoHistoria = EpocaId;

export interface BloqueHistoria {
  id: GrupoHistoria;
  // 1..5: el orden cronológico (y el recomendado en el menú lateral).
  numero: number;
  nombre: { es: string; en: string };
  descripcion: { es: string; en: string };
  // Primer y último año de la época (convención escolar).
  desde: number;
  hasta: number;
  // Modos de práctica que ejercitan el bloque: los cuatro.
  modosPractica: ModoHistoria[];
}

const TODOS_LOS_MODOS: ModoHistoria[] = ["cronologia", "personajes", "causaefecto", "fechas"];

export const BLOQUES_HISTORIA: BloqueHistoria[] = EPOCAS.map((e) => ({
  id: e.id,
  numero: e.numero,
  nombre: e.nombre,
  descripcion: e.descripcion,
  desde: e.desde,
  hasta: e.hasta,
  modosPractica: TODOS_LOS_MODOS,
}));

// Orden cronológico (menú lateral y orden RECOMENDADO de las Clases; no bloquea nada).
export const ORDEN_GRUPOS_HISTORIA: GrupoHistoria[] = BLOQUES_HISTORIA.map((b) => b.id);

export const NOMBRES_GRUPOS_HISTORIA: Record<GrupoHistoria, { es: string; en: string }> = Object.fromEntries(
  BLOQUES_HISTORIA.map((b) => [b.id, b.nombre])
) as Record<GrupoHistoria, { es: string; en: string }>;

export function esGrupoHistoria(valor: unknown): valor is GrupoHistoria {
  return typeof valor === "string" && (ORDEN_GRUPOS_HISTORIA as string[]).includes(valor);
}
