// Registro de los mundos que la app juega con el sprint genérico. Numeria y
// Geografía tienen pantallas propias (teclado de fracciones, mapa), el resto vive acá.
import type { MundoSlug } from "~/tema";
import { conCopia } from "../sinConexion";
import { supabase } from "../supabase";
import { ANATOMIA } from "./anatomia";
import { CALCULIA } from "./calculia";
import { CIRCUITIA } from "./circuitia";
import { CODIA } from "./codia";
import { ENIGMIA } from "./enigmia";
import { ESTADISTICA } from "./estadistica";
import { HISTORIA } from "./historia";
import { MELODIA } from "./melodia";
import { NAIPIA } from "./naipia";
import { QUIMIA } from "./quimia";
import { TRIGONOMETRIA } from "./trigonometria";
import type { MundoJugable } from "./tipos";

export const MUNDOS_JUGABLES: Partial<Record<MundoSlug, MundoJugable>> = {
  enigmia: ENIGMIA,
  quimia: QUIMIA,
  anatomia: ANATOMIA,
  melodia: MELODIA,
  trigonometria: TRIGONOMETRIA,
  historia: HISTORIA,
  calculia: CALCULIA,
  circuitia: CIRCUITIA,
  estadistica: ESTADISTICA,
  naipia: NAIPIA,
  codia: CODIA,
};

export function mundoJugable(slug: string | undefined): MundoJugable | null {
  return slug ? MUNDOS_JUGABLES[slug as MundoSlug] ?? null : null;
}

export function problemTypeDe(m: MundoJugable, modo: string): string {
  return m.problemType ? m.problemType(modo) : `${m.slug}_${modo}`;
}

// Nivel de cada modo (skill_levels, o el propio del mundo). Sin conexión, la
// última copia guardada en el teléfono.
export async function cargarNivelesMundo(def: MundoJugable, userId: string): Promise<Record<string, number>> {
  if (def.cargarNiveles) return def.cargarNiveles(userId);
  const filas =
    (await conCopia(`niveles:${def.slug}:${userId}`, async () => {
      const { data, error } = await supabase.from("skill_levels").select("problem_type, nivel").eq("user_id", userId).like("problem_type", `${def.slug}_%`);
      return error ? null : ((data ?? []) as { problem_type: string; nivel: number }[]);
    })) ?? [];
  const r: Record<string, number> = {};
  for (const m of def.modos) r[m.id] = filas.find((f) => f.problem_type === problemTypeDe(def, m.id))?.nivel ?? 1;
  return r;
}

export type { MundoJugable, PreguntaMundo, ModoMundo, Visual, Entrada } from "./tipos";
