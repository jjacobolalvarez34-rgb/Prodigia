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
