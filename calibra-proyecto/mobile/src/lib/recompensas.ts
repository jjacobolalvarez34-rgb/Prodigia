import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import * as api from "@/lib/recompensas/api";
import type { CosmeticosNuevos, Pendientes } from "@/lib/recompensas/api";
import { fijarPaqueteAcierto } from "./efectos";
import { supabase } from "./supabase";

// Recompensas y cosméticos nuevos en la app: las mismas llamadas que la web
// (@/lib/recompensas/api, reglas en 0248/0249) con el cliente de la app, más un
// estado compartido con lo equipado (la partida lo lee para la estela, el efecto
// y el sonido de acierto) y cuántas recompensas hay por reclamar (Hoy y el HUD).

export * from "@/lib/recompensas/api";

const VACIO: CosmeticosNuevos = {
  estela: "clasica",
  estelas: [],
  efecto: "chispas",
  efectos: [],
  sonido: "clasico",
  sonidos: [],
  emotes: ["bien_jugado", "hola"],
  ciudadPlaca: null,
  ciudadesPlaca: [],
  pistas: 0,
  segundas: 0,
};

let cosmeticos: CosmeticosNuevos = VACIO;
let pendientes: Pendientes = { capsulas: 0, misiones: 0, calendario: false, regalos: 0 };
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useCosmeticos(): CosmeticosNuevos {
  return useSyncExternalStore(suscribir, () => cosmeticos);
}

export function leerCosmeticos(): CosmeticosNuevos {
  return cosmeticos;
}

export function usePendientes(): Pendientes {
  return useSyncExternalStore(suscribir, () => pendientes);
}

export function fijarCosmeticos(c: Partial<CosmeticosNuevos>) {
  cosmeticos = { ...cosmeticos, ...c };
  fijarPaqueteAcierto(cosmeticos.sonido);
  emitir();
}

// Lo equipado. Si la base todavía no tiene 0248 (o no hay red) queda lo último sabido.
export async function recargarCosmeticos(userId: string): Promise<void> {
  const clave = `prodigia:copia:cosmeticos:${userId}`;
  try {
    const { data, error } = await supabase.from("profiles").select(api.COLUMNAS_COSMETICOS_NUEVOS).eq("id", userId).maybeSingle();
    if (error || !data) throw error ?? new Error("sin datos");
    cosmeticos = api.cosmeticosDesdeFila(data as Record<string, unknown>);
    fijarPaqueteAcierto(cosmeticos.sonido);
    emitir();
    AsyncStorage.setItem(clave, JSON.stringify(cosmeticos)).catch(() => undefined);
  } catch {
    try {
      const crudo = await AsyncStorage.getItem(clave);
      if (crudo) {
        cosmeticos = { ...VACIO, ...(JSON.parse(crudo) as CosmeticosNuevos) };
        fijarPaqueteAcierto(cosmeticos.sonido);
        emitir();
      }
    } catch {
      // Sin copia: valores por defecto.
    }
  }
}

export async function recargarPendientes(): Promise<Pendientes> {
  try {
    pendientes = await api.recompensasPendientes(supabase);
    emitir();
  } catch {
    // Sin red: se queda lo último.
  }
  return pendientes;
}

// Al terminar una partida: otorga lo que corresponda y actualiza el contador.
// Constelaciones completadas por celebrar (0259): se avisa después de cada partida
// y al abrir la app; CelebracionConstelaciones las busca cuando puede mostrarlas.
let avisoConstelaciones = true;
const oyentesConstelaciones = new Set<() => void>();
export function avisarConstelaciones() {
  avisoConstelaciones = true;
  oyentesConstelaciones.forEach((o) => o());
}
export function limpiarAvisoConstelaciones() {
  avisoConstelaciones = false;
  oyentesConstelaciones.forEach((o) => o());
}
export const leerAvisoConstelaciones = () => avisoConstelaciones;
export function suscribirAvisoConstelaciones(o: () => void) {
  oyentesConstelaciones.add(o);
  return () => {
    oyentesConstelaciones.delete(o);
  };
}

export async function revisarTrasPartida(): Promise<number> {
  try {
    const r = await api.revisarRecompensas(supabase);
    avisarConstelaciones();
    await recargarPendientes();
    return r.nuevas;
  } catch {
    return 0;
  }
}

