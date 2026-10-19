import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Lo que ya se vio de lo «NUEVO» en este teléfono (src/lib/recompensas/novedades.ts).
const CLAVE = "prodigia:nuevo-visto";
const oyentes = new Set<() => void>();
let vistos: ReadonlySet<string> = new Set();

AsyncStorage.getItem(CLAVE)
  .then((raw) => {
    if (raw) {
      vistos = new Set(JSON.parse(raw) as string[]);
      oyentes.forEach((o) => o());
    }
  })
  .catch(() => {});

export function marcarNuevoVisto(clave: string) {
  if (vistos.has(clave)) return;
  vistos = new Set(vistos).add(clave);
  AsyncStorage.setItem(CLAVE, JSON.stringify([...vistos])).catch(() => {});
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}
const leer = () => vistos;

export function useNuevoVisto(): ReadonlySet<string> {
  return useSyncExternalStore(suscribir, leer, leer);
}
