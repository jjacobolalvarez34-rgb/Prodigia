import type { PreguntaLeccionMelodia } from "./tipos";
import type {
  AcordeParametros,
  EscalaParametros,
  VisualMelodiaAcorde,
  VisualMelodiaEscala,
  VisualMelodiaFrecuencia,
  VisualMelodiaPentagrama,
  VisualMelodiaRitmo,
  VisualMelodiaTeclado,
} from "@/lib/melodia/visuales";
import type { FiguraRitmica } from "@/lib/practica/melodia";

// Constructores cortos para escribir el contenido sin repetir estructura.

// Pregunta con la respuesta correcta puesta en una posición que depende del
// texto de la pregunta (determinista: la migración generada no cambia entre
// corridas), para que no quede siempre en el mismo lugar.
export function q(pregunta: string, correcta: string, distractores: string[], explicacion: string): PreguntaLeccionMelodia {
  const opciones = [...distractores];
  let h = 0;
  for (const c of pregunta) h = (h * 31 + c.charCodeAt(0)) % 9973;
  opciones.splice(h % (distractores.length + 1), 0, correcta);
  return { pregunta, opciones, respuesta: correcta, explicacion };
}

type Extra = { despuesDePaso: number; titulo?: string };

export const vPentagrama = (notas: string[], e: Extra & Partial<Omit<VisualMelodiaPentagrama, "tipo" | "notas">>): VisualMelodiaPentagrama => ({ tipo: "melodia.pentagrama", ...e, notas });
export const vPentagramaEscala = (escala: EscalaParametros, e: Extra & Partial<Omit<VisualMelodiaPentagrama, "tipo" | "escala">>): VisualMelodiaPentagrama => ({ tipo: "melodia.pentagrama", ...e, escala });
export const vPentagramaAcorde = (acorde: AcordeParametros, e: Extra & Partial<Omit<VisualMelodiaPentagrama, "tipo" | "acorde">>): VisualMelodiaPentagrama => ({ tipo: "melodia.pentagrama", ...e, acorde });
export const vTeclado = (notas: string[], e: Extra & Partial<Omit<VisualMelodiaTeclado, "tipo" | "notas">>): VisualMelodiaTeclado => ({ tipo: "melodia.teclado", ...e, notas });
export const vEscala = (escala: EscalaParametros, e: Extra & { escuchar?: boolean }): VisualMelodiaEscala => ({ tipo: "melodia.escala", ...e, escala });
export const vAcorde = (acorde: AcordeParametros, e: Extra & { escuchar?: boolean }): VisualMelodiaAcorde => ({ tipo: "melodia.acorde", ...e, acorde });
export const vRitmo = (figuras: FiguraRitmica[], e: Extra): VisualMelodiaRitmo => ({ tipo: "melodia.ritmo", ...e, figuras });
export const vFrecuencia = (notas: string[], e: Extra & { escuchar?: boolean }): VisualMelodiaFrecuencia => ({ tipo: "melodia.frecuencia", ...e, notas });
