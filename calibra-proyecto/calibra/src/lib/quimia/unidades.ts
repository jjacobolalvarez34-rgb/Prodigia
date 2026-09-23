import type { UnidadCaminoGenerico } from "@/components/CaminoContinuo";
import { ORDEN_GRUPOS_QUIMIA, type GrupoQuimia, type NodoCaminoQuimia } from "@/lib/quimia/path";

// Arma las "unidades" del sidebar y del camino de Aprender (una por grupo con
// lecciones) leyendo el campo `grupo` y el `estado` que ya calculó
// src/lib/quimia/path.ts: la página NO recalcula ningún estado, así que lo
// que muestra el sidebar es exactamente lo que después valida
// [slug]/page.tsx (puedeAbrirNodoQuimia). Un grupo sin lecciones (redox y
// orgánica hasta la tanda 2) no aparece.
export function construirUnidadesQuimia(
  nodos: NodoCaminoQuimia[],
  nombreGrupo: Record<GrupoQuimia, string>,
  ctaPro: { label: string; href: string }
): UnidadCaminoGenerico[] {
  return ORDEN_GRUPOS_QUIMIA.map((grupo) => ({ grupo, nodos: nodos.filter((n) => n.grupo === grupo) }))
    .filter((g) => g.nodos.length > 0)
    .map((g) => ({
      id: `quimia-${g.grupo}`,
      nombre: nombreGrupo[g.grupo],
      nodos: g.nodos.map((n) => ({
        id: n.id,
        slug: n.slug,
        nombre: n.nombre,
        estado: n.estado,
        ctaPro: n.bloqueadoPorPlan ? ctaPro : undefined,
      })),
    }));
}
