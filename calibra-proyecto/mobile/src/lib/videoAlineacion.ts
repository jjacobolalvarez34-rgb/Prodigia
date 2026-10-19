import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Video de apertura de la Gran Alineación (docs/eventos/ANIMACIONES_EVENTOS.md): se
// ve una vez por alineación en cada teléfono, y el cartel del Inicio lo puede repetir.
const clave = (numero: number) => `prodigia:alineacion-video:${numero}`;

export async function videoVisto(numero: number): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(clave(numero))) === "1";
  } catch {
    return false;
  }
}

export function marcarVideoVisto(numero: number) {
  AsyncStorage.setItem(clave(numero), "1").catch(() => {});
}

let pedidos = 0;
const oyentes = new Set<() => void>();

export function repetirVideoAlineacion() {
  pedidos++;
  oyentes.forEach((o) => o());
}

export function usePedidosVideo(): number {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => pedidos,
  );
}
