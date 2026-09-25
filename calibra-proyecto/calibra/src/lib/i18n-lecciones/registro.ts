// Registro de las traducciones al inglés de las lecciones de Aprender y de la migración
// que las lleva a la base. Para sumar un mundo: crear `en/<mundo>.ts`, agregarlo acá y
// regenerar su migración (I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones).
import type { MundoTraducible } from "./fuentes";
import type { TraduccionLeccion } from "./traducir";
import { NAIPIA_EN } from "./en/naipia";
import { NUMERIA_EN } from "./en/numeria";
import { CALCULIA_EN } from "./en/calculia";
import { ESTADISTICA_EN } from "./en/estadistica";
import { CIRCUITIA_EN } from "./en/circuitia";

export interface EntradaTraduccion {
  // Traducciones por slug.
  traducciones: Record<string, TraduccionLeccion>;
  // Archivo de migración (en supabase/migrations) que las aplica.
  migracion: string;
  // true = el mundo está traducido COMPLETO (todas sus lecciones); el test lo exige.
  completo: boolean;
}

export const REGISTRO_TRADUCCIONES: Partial<Record<MundoTraducible, EntradaTraduccion>> = {
  numeria: { traducciones: NUMERIA_EN, migracion: "0227_numeria_lecciones_en.sql", completo: true },
  calculia: { traducciones: CALCULIA_EN, migracion: "0228_calculia_lecciones_en.sql", completo: true },
  estadistica: { traducciones: ESTADISTICA_EN, migracion: "0229_estadistica_lecciones_en.sql", completo: true },
  circuitia: { traducciones: CIRCUITIA_EN, migracion: "0230_circuitia_lecciones_en.sql", completo: true },
  naipia: { traducciones: NAIPIA_EN, migracion: "0226_naipia_lecciones_en.sql", completo: true },
};

export function encabezadoMigracion(mundo: MundoTraducible, cantidad: number, numero: string): string {
  return `-- ============================================================
-- Prodigia — ${mundo}: lecciones de Aprender en inglés (${cantidad} lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con \`pasos\`, \`quiz\` y \`visuales\` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/${mundo}.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (${numero})
-- ============================================================`;
}
