import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

// Preferencias del dispositivo (02-SISTEMA-VISUAL.md §8: sonido y háptica con
// interruptores separados). Viven en el teléfono, no en la cuenta.
export interface Ajustes {
  sonido: boolean;
  haptica: boolean;
  envioAutomatico: boolean;
}

const CLAVE = "prodigia:ajustes";
let estado: Ajustes = { sonido: true, haptica: true, envioAutomatico: false };
const oyentes = new Set<() => void>();

export function leerAjustes(): Ajustes {
  return estado;
}

export async function cargarAjustes() {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (raw) estado = { ...estado, ...(JSON.parse(raw) as Partial<Ajustes>) };
  } catch {
    // Sin almacenamiento se usan los valores por defecto.
  }
  oyentes.forEach((o) => o());
}

export function cambiarAjuste<K extends keyof Ajustes>(clave: K, valor: Ajustes[K]) {
  estado = { ...estado, [clave]: valor };
  oyentes.forEach((o) => o());
  AsyncStorage.setItem(CLAVE, JSON.stringify(estado)).catch(() => {});
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useAjustes(): Ajustes {
  return useSyncExternalStore(suscribir, leerAjustes, leerAjustes);
}
