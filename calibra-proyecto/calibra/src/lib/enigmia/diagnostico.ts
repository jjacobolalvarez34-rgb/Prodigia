import type { CategoriaEnigmia } from "@/types/database";

export const CATEGORIAS_ENIGMIA: CategoriaEnigmia[] = ["memoria", "patrones", "deduccion", "computacional"];

// El diagnóstico inicial de Enigmia (DiagnosticoEnigmiaClient.tsx) calibra
// a fondo UNA sola categoría representativa ("patrones" — ver el
// comentario completo en diagnostico/page.tsx) en vez de mezclar las 4 en
// 8 preguntas. Mismo criterio que Estadística/Naipia/Codia (docs/
// PARIDAD_MUNDOS.md): las otras 3 arrancan en nivel 1 y suben solas
// jugando, en vez de bloquear el onboarding con un diagnóstico 4 veces
// más largo.
//
// Extraída como función pura (antes vivía inline en guardar()) para poder
// testear la forma exacta del resultado sin mockear Supabase.
export function filasDiagnostico(
  userId: string,
  categoriaDiagnosticada: CategoriaEnigmia,
  nivelDiagnosticado: number
): { user_id: string; categoria: CategoriaEnigmia; nivel: number; racha_actual: number }[] {
  return CATEGORIAS_ENIGMIA.map((categoria) => ({
    user_id: userId,
    categoria,
    nivel: categoria === categoriaDiagnosticada ? nivelDiagnosticado : 1,
    racha_actual: 0,
  }));
}
