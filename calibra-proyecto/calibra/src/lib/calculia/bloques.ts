import type { ModoCalculia } from "@/lib/practica/calculia";

// Los 4 TEMAS (bloques) del currículo de Calculia. Son la fuente única de los
// grupos de Aprender (Técnicas | Clases): cada Técnica y cada Clase pertenece a
// uno, y cada tema se ejercita con el modo de práctica del mismo nombre
// (src/lib/practica/calculia.ts). Es presentación: no hay columna nueva en la
// base; el mapeo slug -> tema vive en el contenido tipado
// (src/lib/calculia/lecciones/).
//
// Desbloqueo por TEMA (pedido del usuario para todos los mundos): cada tema
// tiene su propio puntero "activo", tanto en Técnicas como en Clases; ver
// src/lib/calculia/path.ts.

export type GrupoCalculia = "derivadas" | "integrales" | "series" | "multivariable";

export interface BloqueCalculia {
  id: GrupoCalculia;
  // 1..4: el orden recomendado del currículo.
  numero: number;
  nombre: { es: string; en: string };
  // Modo de práctica que ejercita el tema.
  modoPractica: ModoCalculia;
}

export const BLOQUES_CALCULIA: BloqueCalculia[] = [
  { id: "derivadas", numero: 1, nombre: { es: "Derivadas", en: "Derivatives" }, modoPractica: "derivadas" },
  { id: "integrales", numero: 2, nombre: { es: "Integrales", en: "Integrals" }, modoPractica: "integrales" },
  { id: "series", numero: 3, nombre: { es: "Series", en: "Series" }, modoPractica: "series" },
  { id: "multivariable", numero: 4, nombre: { es: "Multivariable y EDOs", en: "Multivariable and ODEs" }, modoPractica: "multivariable" },
];

export const ORDEN_GRUPOS_CALCULIA: GrupoCalculia[] = BLOQUES_CALCULIA.map((b) => b.id);

export const NOMBRES_GRUPOS_CALCULIA: Record<GrupoCalculia, { es: string; en: string }> = Object.fromEntries(
  BLOQUES_CALCULIA.map((b) => [b.id, b.nombre])
) as Record<GrupoCalculia, { es: string; en: string }>;
