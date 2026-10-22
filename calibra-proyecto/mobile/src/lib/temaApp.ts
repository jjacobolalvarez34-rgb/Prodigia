import { reloadAppAsync } from "expo";
import { File, Paths } from "expo-file-system";
import { useSyncExternalStore } from "react";
import { estadoTemasApp, SIN_TEMAS_APP, type EstadoTemasApp } from "@/lib/recompensas/api";
import { TEMA_CLASICO, temaAppDe } from "@/lib/recompensas/temas";
import { supabase } from "./supabase";
import { ARCHIVO_TEMA_APP, TEMA_APP_ACTIVO } from "~/tema";

// Tema de la app en el teléfono (0297). tema.ts lee al arrancar el archivo que se
// escribe acá y arma los colores con esa paleta; por eso un tema nuevo se ve después
// de reiniciar la app (reloadAppAsync recarga el JavaScript, también en la app
// publicada, sin dependencias nativas nuevas) o la próxima vez que se abre.
// `pendiente` es el tema guardado que todavía no se ve: AvisoTemaApp ofrece
// reiniciar para ponérselo.

let estado: EstadoTemasApp = SIN_TEMAS_APP;
let pendiente: string | null = null;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useTemasApp(): EstadoTemasApp {
  return useSyncExternalStore(suscribir, () => estado);
}

export function useTemaPendiente(): string | null {
  return useSyncExternalStore(suscribir, () => pendiente);
}

// El tema guardado en el teléfono (el que se pone al arrancar).
export function temaGuardado(): string {
  try {
    const f = new File(Paths.document, ARCHIVO_TEMA_APP);
    if (!f.exists) return TEMA_CLASICO;
    const j = JSON.parse(f.textSync()) as { slug?: unknown };
    return typeof j.slug === "string" && temaAppDe(j.slug) ? j.slug : TEMA_CLASICO;
  } catch {
    return TEMA_CLASICO;
  }
}

// Guarda el tema para el próximo arranque. Si es otro que el que se ve, queda pendiente.
export function guardarTema(slug: string): void {
  const valido = temaAppDe(slug) ? slug : TEMA_CLASICO;
  try {
    const f = new File(Paths.document, ARCHIVO_TEMA_APP);
    if (valido === TEMA_CLASICO) {
      if (f.exists) f.delete();
    } else {
      if (!f.exists) f.create();
      f.write(JSON.stringify({ slug: valido }));
    }
  } catch {
    // Sin poder escribir: el tema queda como estaba.
    return;
  }
  pendiente = valido === TEMA_APP_ACTIVO ? null : valido;
  emitir();
}

export function descartarPendiente(): void {
  pendiente = null;
  emitir();
}

// Reinicia la app para ponerse el tema guardado. Devuelve false si no se pudo (queda
// para la próxima vez que se abra).
export async function reiniciarConTema(): Promise<boolean> {
  try {
    await reloadAppAsync("tema de la app");
    return true;
  } catch {
    return false;
  }
}

// Lo de la cuenta: qué temas tiene y cuál lleva puesto. Si el puesto no es el del
// teléfono (se cambió desde la web u otro teléfono), se guarda y queda pendiente.
// Sin 0297 en la base, no toca nada.
export async function sincronizarTemasApp(userId: string): Promise<EstadoTemasApp> {
  const e = await estadoTemasApp(supabase, userId).catch(() => SIN_TEMAS_APP);
  estado = e;
  emitir();
  if (!e.disponible) return e;
  const puesto = e.puesto !== TEMA_CLASICO && e.mios.includes(e.puesto) && temaAppDe(e.puesto) ? e.puesto : TEMA_CLASICO;
  if (puesto !== temaGuardado()) guardarTema(puesto);
  return e;
}

export function fijarEstadoTemas(e: EstadoTemasApp): void {
  estado = e;
  emitir();
}
