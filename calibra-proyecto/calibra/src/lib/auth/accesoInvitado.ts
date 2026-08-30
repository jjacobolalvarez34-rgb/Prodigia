import type { ArithmeticProblemType, CategoriaEnigmia } from "@/types/database";

// Fase 2 (invitados): matriz única de qué puede hacer un invitado
// (supabase.auth.signInAnonymously) dentro de cada mundo — un solo lugar
// de verdad para esta regla, importado tanto por las páginas de servidor
// (para filtrar datos y bloquear rutas) como por los componentes de
// cliente (para dibujar el candado en lo que no puede tocar). Nada de
// esto se copia a mano pantalla por pantalla.
export const OPERACIONES_INVITADO: readonly ArithmeticProblemType[] = ["suma", "resta"];

export const CONTINENTE_INVITADO = "america";

export const CATEGORIA_ENIGMIA_INVITADO: CategoriaEnigmia = "memoria";

export function operacionPermitidaInvitado(tipo: ArithmeticProblemType): boolean {
  return (OPERACIONES_INVITADO as string[]).includes(tipo);
}

// Deuda técnica invisible, Fase 1: esta matriz existía desde hace
// tiempo pero nunca se aplicaba en ningún lado — ni las páginas de
// Fracciones/Decimales/Potencias/Álgebra/Geometría llamaban a
// bloquearInvitado, ni /api/attempts validaba nada server-side. Un
// invitado real podía tipear la URL y jugar cualquier tema avanzado de
// Numeria sin restricción. Estos 5 son temas completos, no operaciones
// sueltas — a diferencia de Aritmética (donde solo se restringen 2 de
// las 4 operaciones), acá se bloquea el tema entero.
export const TEMAS_AVANZADOS_BLOQUEADOS_INVITADO = ["fracciones", "decimales", "potencias", "algebra", "geometria"] as const;

// problem_type real (ej. "fracciones_simplificar") siempre viene con el
// nombre del tema como prefijo (ver 0079_practicar_subtemas.sql) — basta
// con chequear el prefijo, no hace falta enumerar cada sub-tema.
export function temaAvanzadoBloqueadoParaInvitado(problemType: string): boolean {
  return TEMAS_AVANZADOS_BLOQUEADOS_INVITADO.some((tema) => problemType.startsWith(tema));
}

// Melodía (Fase 1, 2026-08-24) — decisión explícita, no un hueco: mismo
// criterio que Quimia y Anatomía, ninguna de las dos tiene entrada acá
// tampoco. Un invitado puede practicar cualquier modo sin restricción
// (Aprender sigue bloqueado aparte, vía bloquearInvitado() en las
// páginas de aprender/ — mismo patrón que Quimia/Anatomía).
