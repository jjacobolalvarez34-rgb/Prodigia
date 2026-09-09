// Progreso resumible del reto diario y del reto semanal.
//
// Patrón P0 (2026-09-07): `leerProgresoGuardado` devuelve un objeto NUEVO
// en cada llamada. usarla directo como getSnapshot de useSyncExternalStore
// viola su contrato ("getSnapshot debe ser Object.is-estable entre renders
// sin cambios en la store") → React cree que la store cambió en cada render
// → bucle infinito ("Maximum update depth exceeded"). Por eso acá existe
// `crearSnapshotProgreso`: memoiza la primera lectura por clave+total y
// devuelve SIEMPRE la misma referencia mientras la clave no cambie.
export interface ProgresoReto {
  indice: number;
  correctos: number;
}

export function leerProgresoGuardado(
  claveStorage: string,
  total: number,
  storage: Pick<Storage, "getItem"> | null = null
): ProgresoReto | null {
  const store = storage ?? (typeof localStorage !== "undefined" ? localStorage : null);
  if (!store) return null;
  try {
    const guardado = store.getItem(claveStorage);
    if (!guardado) return null;
    const datos = JSON.parse(guardado) as { indice?: number; correctos?: number };
    if (typeof datos.indice === "number" && datos.indice > 0 && datos.indice < total) {
      return { indice: datos.indice, correctos: datos.correctos ?? 0 };
    }
    return null;
  } catch {
    return null; // localStorage no disponible (modo privado) — simplemente arranca de cero.
  }
}

// Devuelve un getSnapshot estable para useSyncExternalStore: la primera
// llamada lee localStorage (o inyecta `storage` en tests); las siguientes
// devuelven la MISMA referencia. Cuando `claveStorage`/`total` cambian, el
// llamador debe crear un snapshot nuevo (useMemo con esas deps).
export function crearSnapshotProgreso(
  claveStorage: string,
  total: number,
  storage: Pick<Storage, "getItem"> | null = null
): () => ProgresoReto | null {
  let cacheado: ProgresoReto | null | undefined;
  return () => {
    if (cacheado === undefined) {
      cacheado = leerProgresoGuardado(claveStorage, total, storage);
    }
    return cacheado;
  };
}