// Localización de las lecciones de Aprender (Técnicas y Clases).
//
// Las lecciones viven en la base (`techniques`, `logic_techniques`) en español.
// La migración 0225 agrega `nombre_en`, `descripcion_en` y `contenido_en`; cuando
// el idioma es inglés y la lección tiene traducción, se usa esa. Si falta
// (lección todavía sin traducir), se cae al español, campo por campo: nunca una
// lección vacía. `contenido_en` tiene EXACTAMENTE la misma forma que `contenido`
// (mismos pasos, mismas preguntas y opciones en el mismo orden, mismos visuales),
// solo con los textos en inglés — así el resto de la app no distingue idiomas.

export const COLUMNAS_LECCION_EN = "nombre_en, descripcion_en, contenido_en";

interface FilaLocalizable {
  nombre: string;
  descripcion: string | null;
  contenido: unknown;
  nombre_en?: string | null;
  descripcion_en?: string | null;
  contenido_en?: unknown;
}

export function esIngles(locale: string | null | undefined): boolean {
  return (locale ?? "").toLowerCase().startsWith("en");
}

export function localizarFila<T extends FilaLocalizable>(fila: T, locale: string | null | undefined): T {
  if (!esIngles(locale)) return fila;
  return {
    ...fila,
    nombre: fila.nombre_en?.trim() ? fila.nombre_en : fila.nombre,
    descripcion: fila.descripcion_en?.trim() ? fila.descripcion_en : fila.descripcion,
    contenido: fila.contenido_en != null ? fila.contenido_en : fila.contenido,
  };
}

export function localizarFilas<T extends FilaLocalizable>(filas: T[] | null | undefined, locale: string | null | undefined): T[] {
  return (filas ?? []).map((f) => localizarFila(f, locale));
}

// Idioma de la petición en el servidor. Import dinámico para que los módulos que
// usan este archivo (y sus tests) no arrastren next-intl/server al importarlos.
// Fuera de una petición de Next (tests con un Supabase simulado) no hay idioma: se usa el español.
export async function localeServidor(): Promise<string> {
  try {
    const { getLocale } = await import("next-intl/server");
    return await getLocale();
  } catch {
    return "es";
  }
}

// Respuestas de un quiz: la persona responde con el texto que VIO, en su idioma.
// El servidor acepta la respuesta correcta en español o en inglés (misma posición
// en `contenido` y en `contenido_en`).
export function respuestaCorrecta(
  enviada: string | undefined,
  quizEs: { respuesta: string }[],
  quizEn: { respuesta: string }[] | null | undefined,
  i: number
): boolean {
  if (enviada === undefined) return false;
  if (enviada === quizEs[i]?.respuesta) return true;
  return quizEn != null && enviada === quizEn[i]?.respuesta;
}
