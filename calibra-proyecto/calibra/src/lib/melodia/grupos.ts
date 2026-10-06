// Los 7 grupos de Aprender de Melodía coinciden 1 a 1 con los 7 modos reales
// de práctica (ModoMelodia en src/lib/practica/melodia.ts; mismos slugs que
// usa modo_melodia_aleatorio_por_rango en 0090/0096 y las claves
// Melodia.home.modos.* de i18n). Vive en su propio módulo (como
// src/lib/anatomia/grupos.ts) para que el contenido tipado (lecciones/) y el
// camino (path.ts) puedan importarlo sin ciclos.
export type GrupoMelodia = "fundamentos" | "lectura" | "alteraciones" | "escalas" | "acordes" | "oido_absoluto" | "tempo";

// Orden de dificultad con que se desbloquean los modos en duelos y, aquí,
// orden del sidebar. Es también el orden natural de estudio (fundamentos,
// pentagrama, alteraciones, escalas, acordes); el oído absoluto es
// transversal y va al final, y Tempo y compás (2026-10-06) se suma detrás. El desbloqueo NO impone este orden entre
// grupos (cada uno es un curso independiente, ver path.ts).
export const ORDEN_GRUPOS_MELODIA: GrupoMelodia[] = ["fundamentos", "lectura", "alteraciones", "escalas", "acordes", "oido_absoluto", "tempo"];

// Clave de messages/*.json (Melodia.home.modos.*) de cada grupo. Ojo con
// oido_absoluto -> oidoAbsoluto.
export const CLAVE_MODO_I18N: Record<GrupoMelodia, string> = {
  fundamentos: "fundamentos",
  lectura: "lectura",
  alteraciones: "alteraciones",
  escalas: "escalas",
  acordes: "acordes",
  oido_absoluto: "oidoAbsoluto",
  tempo: "tempo",
};

// Nombres para el sidebar. Repiten los de messages/*.json
// (Melodia.home.modos): path.test.ts comprueba que coincidan para que no se
// desincronicen.
export const NOMBRES_GRUPOS_MELODIA: Record<GrupoMelodia, { es: string; en: string }> = {
  fundamentos: { es: "Fundamentos", en: "Fundamentals" },
  lectura: { es: "Lectura en pentagrama", en: "Staff reading" },
  alteraciones: { es: "Alteraciones", en: "Accidentals" },
  escalas: { es: "Escalas", en: "Scales" },
  acordes: { es: "Acordes", en: "Chords" },
  oido_absoluto: { es: "Oído absoluto", en: "Absolute pitch" },
  tempo: { es: "Tempo y compás", en: "Tempo and meter" },
};
