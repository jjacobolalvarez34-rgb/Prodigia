"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import { fijarPaqueteAcierto } from "@/lib/sonido";
import { COLUMNAS_COSMETICOS_NUEVOS, cosmeticosDesdeFila, recompensasPendientes, type CosmeticosNuevos, type Pendientes } from "./api";

// Lo equipado de la tienda ampliada (estela, efecto y sonido de acierto, emotes) y
// cuántas recompensas hay por reclamar, compartido por toda la web: la llama de
// racha, el estallido al acertar, los emotes de duelo y el Header lo leen de acá.
// Mismo papel que mobile/src/lib/recompensas.ts en la app.

const VACIO: CosmeticosNuevos = cosmeticosDesdeFila(null);
let cosmeticos: CosmeticosNuevos = VACIO;
let pendientes: Pendientes = { capsulas: 0, misiones: 0, calendario: false, regalos: 0 };
let cargado = false;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  if (!cargado) {
    cargado = true;
    refrescarCosmeticosWeb();
  }
  return () => oyentes.delete(o);
}

export function useCosmeticosWeb(): CosmeticosNuevos {
  return useSyncExternalStore(
    suscribir,
    () => cosmeticos,
    () => VACIO
  );
}

export function usePendientesWeb(): Pendientes {
  return useSyncExternalStore(
    suscribir,
    () => pendientes,
    () => pendientes
  );
}

export function leerCosmeticosWeb(): CosmeticosNuevos {
  return cosmeticos;
}

// Si la base todavía no tiene 0248/0249, queda todo por defecto.
export async function refrescarCosmeticosWeb(): Promise<void> {
  try {
    const sb = createClient();
    const { data: sesion } = await sb.auth.getUser();
    const user = sesion.user;
    if (!user || user.is_anonymous) return;
    const [{ data }, p] = await Promise.all([sb.from("profiles").select(COLUMNAS_COSMETICOS_NUEVOS).eq("id", user.id).maybeSingle(), recompensasPendientes(sb).catch(() => pendientes)]);
    if (data) cosmeticos = cosmeticosDesdeFila(data as Record<string, unknown>);
    pendientes = p;
    fijarPaqueteAcierto(cosmeticos.sonido);
    emitir();
  } catch {
    // Sin sesión o sin red: valores por defecto.
  }
}
