import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Videos de apertura de los eventos (docs/eventos/ANIMACIONES_EVENTOS.md; cuál toca lo
// dice videoAperturaActual en src/lib/temas/videosApertura.ts): se ven una vez por
// edición en cada teléfono, y los carteles los pueden repetir.
const clave = (c: string) => `prodigia:video-apertura:${c}`;

export async function videoVisto(c: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(clave(c))) === "1";
  } catch {
    return false;
  }
}

export function marcarVideoVisto(c: string) {
  AsyncStorage.setItem(clave(c), "1").catch(() => {});
}

// «Ver el video» desde un cartel: qué archivo y un contador para notar cada pedido.
let pedido: { n: number; archivo?: string } = { n: 0 };
const oyentes = new Set<() => void>();

export function repetirVideo(archivo?: string) {
  pedido = { n: pedido.n + 1, archivo };
  oyentes.forEach((o) => o());
}

export function usePedidoVideo(): { n: number; archivo?: string } {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => pedido,
  );
}
