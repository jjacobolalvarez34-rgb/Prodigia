import { EPOCA_POR_ID } from "./epocas";
import { HECHO_POR_ID, PERSONAJE_POR_ID, vidaTexto } from "./tabla";
import { formatoAnio } from "./tiempo";
import type { Generada } from "@/lib/practica/historiaComun";

// «Cómo se resuelve» de Historia (pedido 2026-10-18): los hechos y personajes que
// entraron en la pregunta, con su año y su época, sacados de la misma tabla con la
// que se arma la pregunta. Así se ve el orden, el siglo o quién era quién.

function lineaHecho(id: string): string | null {
  const h = HECHO_POR_ID.get(id);
  if (!h) return null;
  const aprox = h.certeza === "exacta" ? "" : "hacia ";
  return `${h.nombre}: ${aprox}${formatoAnio(h.anio)} (${EPOCA_POR_ID[h.epoca].nombre.es})`;
}

function lineaPersonaje(id: string): string | null {
  const p = PERSONAJE_POR_ID.get(id);
  if (!p) return null;
  return `${p.nombre}: ${p.rol.charAt(0).toLowerCase()}${p.rol.slice(1)} (${vidaTexto(p)})`;
}

export function pasosHistoria(g: Generada): string[] {
  const hechos = [...g.hechos]
    .map((id) => HECHO_POR_ID.get(id))
    .filter((h): h is NonNullable<typeof h> => !!h)
    .sort((a, b) => a.anio - b.anio)
    .map((h) => lineaHecho(h.id))
    .filter((x): x is string => !!x);
  const personajes = g.personajes.map(lineaPersonaje).filter((x): x is string => !!x);
  const pasos: string[] = [];
  if (hechos.length > 1) pasos.push(`Ordenados en el tiempo: ${hechos.join(" → ")}`);
  else if (hechos.length === 1) pasos.push(hechos[0]);
  if (personajes.length) pasos.push(personajes.join(". "));
  pasos.push(`Respuesta: ${g.pregunta.respuesta}`);
  return pasos;
}
