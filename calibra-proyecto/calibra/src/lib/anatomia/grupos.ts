// Los 4 grupos de Aprender de Anatomía: coinciden 1 a 1 con los 4
// sistemas/modos reales de práctica (mismos slugs que usa
// modo_anatomia_aleatorio_por_rango en 0090_duelos_anatomia_melodia.sql y
// las claves Anatomia.elegir.modos.* de i18n). Vive en su propio módulo
// (como src/lib/quimia/grupos.ts) para que el contenido tipado
// (lecciones/) y el camino (path.ts) puedan importarlo sin ciclos.
export type GrupoAnatomia = "oseo" | "muscular" | "organos" | "nervioso";

// Orden de dificultad con que se desbloquean en duelos y, aquí, orden del
// sidebar: el óseo va primero porque el vocabulario de posición y de
// huesos lo usan después el muscular (origen/inserción) y el nervioso.
export const ORDEN_GRUPOS_ANATOMIA: GrupoAnatomia[] = ["oseo", "muscular", "organos", "nervioso"];

// Nombres para el sidebar en las dos pestañas. Repiten los de
// messages/*.json (Anatomia.elegir.modos): path.test.ts comprueba que
// coincidan para que no se desincronicen.
export const NOMBRES_GRUPOS_ANATOMIA: Record<GrupoAnatomia, { es: string; en: string }> = {
  oseo: { es: "Huesos del cuerpo", en: "Bones of the body" },
  muscular: { es: "Músculos del cuerpo", en: "Muscles of the body" },
  organos: { es: "Órganos principales", en: "Main organs" },
  nervioso: { es: "Sistema nervioso y pares craneales", en: "Nervous system and cranial nerves" },
};
