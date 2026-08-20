// Sección 7: ~50 títulos en total contando los 6 de rango (Bronce a
// Prodigio, ya existentes — auto-otorgados por SQL en cada suba de
// rango, ver 0043_rankeds_rangos_titulos_multimundo.sql, no
// duplicados acá). Estos son los nuevos: se GANAN por criterio real,
// nunca se compran con Chispas — reforzando que representan mérito de
// juego. Mismo mecanismo que ya existía para rango (`desbloquear_titulo`,
// idempotente, el primero que se desbloquea se activa solo), solo que
// disparado desde acá (verificar.ts) en vez de desde SQL.
export type CriterioTitulo =
  | { tipo: "mundo_completado"; mundo: "numeria" | "geografia" | "enigmia" | "quimia" }
  | { tipo: "aprender_completo"; mundo: "numeria" | "geografia" | "enigmia" | "quimia" }
  | { tipo: "partidas_totales"; valor: number }
  | { tipo: "precision_semana"; valor: number }
  | { tipo: "duelos_ganados"; valor: number }
  | { tipo: "racha_duelos_ganados"; valor: number }
  | { tipo: "duelos_jugados"; valor: number }
  | { tipo: "racha_dias"; valor: number }
  | { tipo: "racha_retos_diarios"; valor: number }
  | { tipo: "mundos_explorados"; valor: number }
  | { tipo: "embajador" }
  | { tipo: "chispas_balance"; valor: number };

export interface TituloCatalogo {
  slug: string;
  nombre: string;
  categoria: "mundo" | "volumen" | "precision" | "duelos" | "constancia" | "curiosidad";
  criterio: CriterioTitulo;
}

export const CATALOGO_TITULOS: TituloCatalogo[] = [
  // ---------- por completar un mundo ----------
  { slug: "maestro-numeria", nombre: "Maestro de Numeria", categoria: "mundo", criterio: { tipo: "mundo_completado", mundo: "numeria" } },
  { slug: "maestro-geografia", nombre: "Maestro de Geografía", categoria: "mundo", criterio: { tipo: "mundo_completado", mundo: "geografia" } },
  { slug: "maestro-enigmia", nombre: "Maestro de Enigmia", categoria: "mundo", criterio: { tipo: "mundo_completado", mundo: "enigmia" } },
  { slug: "maestro-quimia", nombre: "Maestro de Quimia", categoria: "mundo", criterio: { tipo: "mundo_completado", mundo: "quimia" } },

  // ---------- por volumen de juego (partidas ≈ problemas resueltos / 10) ----------
  { slug: "partidas-10", nombre: "Recién Empezás", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 10 } },
  { slug: "partidas-50", nombre: "Agarrando la Mano", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 50 } },
  { slug: "partidas-100", nombre: "De la Casa", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 100 } },
  { slug: "partidas-500", nombre: "Ya Sos de Acá", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 500 } },
  { slug: "partidas-1000", nombre: "Vicio Sano", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 1000 } },
  { slug: "partidas-5000", nombre: "Leyenda Viviente", categoria: "volumen", criterio: { tipo: "partidas_totales", valor: 5000 } },

  // ---------- por precisión sostenida (semana con volumen real, min. 20 intentos) ----------
  { slug: "precision-70", nombre: "Vas Agarrando la Onda", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.7 } },
  { slug: "precision-80", nombre: "Puntería Fina", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.8 } },
  { slug: "precision-85", nombre: "Mano Firme", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.85 } },
  { slug: "precision-90", nombre: "Casi Perfecto", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.9 } },
  { slug: "precision-95", nombre: "Francotirador", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.95 } },
  { slug: "precision-99", nombre: "Sin Margen de Error", categoria: "precision", criterio: { tipo: "precision_semana", valor: 0.99 } },

  // ---------- por duelos ----------
  { slug: "primer-duelo", nombre: "Bautismo de Fuego", categoria: "duelos", criterio: { tipo: "duelos_jugados", valor: 1 } },
  { slug: "duelos-5", nombre: "Primera Sangre", categoria: "duelos", criterio: { tipo: "duelos_ganados", valor: 5 } },
  { slug: "duelos-20", nombre: "Duelista", categoria: "duelos", criterio: { tipo: "duelos_ganados", valor: 20 } },
  { slug: "duelos-50", nombre: "Verdugo", categoria: "duelos", criterio: { tipo: "duelos_ganados", valor: 50 } },
  { slug: "duelos-100", nombre: "Centurión de los Duelos", categoria: "duelos", criterio: { tipo: "duelos_ganados", valor: 100 } },
  { slug: "duelos-250", nombre: "Emperador del Ring", categoria: "duelos", criterio: { tipo: "duelos_ganados", valor: 250 } },
  { slug: "racha-duelos-3", nombre: "En Racha", categoria: "duelos", criterio: { tipo: "racha_duelos_ganados", valor: 3 } },
  { slug: "racha-duelos-5", nombre: "Imparable", categoria: "duelos", criterio: { tipo: "racha_duelos_ganados", valor: 5 } },
  { slug: "racha-duelos-10", nombre: "Nadie Te Para", categoria: "duelos", criterio: { tipo: "racha_duelos_ganados", valor: 10 } },

  // ---------- por constancia (racha diaria) ----------
  { slug: "racha-7", nombre: "Semana Completa", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 7 } },
  { slug: "racha-14", nombre: "Dos Semanas Seguidas", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 14 } },
  { slug: "racha-30", nombre: "Mes de Hierro", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 30 } },
  { slug: "racha-100", nombre: "Cien Días Sin Faltar", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 100 } },
  { slug: "racha-200", nombre: "Obsesión Sana", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 200 } },
  { slug: "racha-365", nombre: "Un Año Entero", categoria: "constancia", criterio: { tipo: "racha_dias", valor: 365 } },
  { slug: "retos-7", nombre: "Rutina de Hierro", categoria: "constancia", criterio: { tipo: "racha_retos_diarios", valor: 7 } },
  { slug: "retos-30", nombre: "Ritual Diario", categoria: "constancia", criterio: { tipo: "racha_retos_diarios", valor: 30 } },

  // ---------- por curiosidad / exploración ----------
  { slug: "explorador-total", nombre: "Explorador Total", categoria: "curiosidad", criterio: { tipo: "mundos_explorados", valor: 4 } },
  { slug: "embajador", nombre: "Embajador", categoria: "curiosidad", criterio: { tipo: "embajador" } },
  { slug: "chispas-de-sobra", nombre: "Chispas de Sobra", categoria: "curiosidad", criterio: { tipo: "chispas_balance", valor: 5000 } },
  { slug: "estudioso-numeria", nombre: "Estudioso de Numeria", categoria: "curiosidad", criterio: { tipo: "aprender_completo", mundo: "numeria" } },
  { slug: "estudioso-geografia", nombre: "Estudioso de Geografía", categoria: "curiosidad", criterio: { tipo: "aprender_completo", mundo: "geografia" } },
  { slug: "estudioso-enigmia", nombre: "Estudioso de Enigmia", categoria: "curiosidad", criterio: { tipo: "aprender_completo", mundo: "enigmia" } },
  { slug: "estudioso-quimia", nombre: "Estudioso de Quimia", categoria: "curiosidad", criterio: { tipo: "aprender_completo", mundo: "quimia" } },
];
