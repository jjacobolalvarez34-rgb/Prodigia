import { File, Paths } from "expo-file-system";
import { useSyncExternalStore } from "react";
import { estadoLetraApp, SIN_LETRA_APP, type EstadoLetraApp } from "@/lib/recompensas/api";
import { letraDe } from "@/lib/recompensas/temas";
import { supabase } from "./supabase";
import { ARCHIVO_LETRA_APP, LETRA_APP_ACTIVA } from "~/tema";

// Letra libre (0314) en el teléfono. Igual que el tema (lib/temaApp.ts): tema.ts lee al
// arrancar el archivo que se escribe acá y arma `fuente` con esa letra; por eso una
// letra nueva se ve después de reiniciar la app (AvisoTemaApp ofrece «Aplicar ahora»)
// o la próxima vez que se abre. `pendiente` es la letra guardada que todavía no se ve
// (id = null: vuelve a la del tema).

let estado: EstadoLetraApp = SIN_LETRA_APP;
let pendiente: { id: string | null } | null = null;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useLetraApp(): EstadoLetraApp {
  return useSyncExternalStore(suscribir, () => estado);
}

export function useLetraPendiente(): { id: string | null } | null {
  return useSyncExternalStore(suscribir, () => pendiente);
}

// La letra guardada en el teléfono (la que se pone al arrancar); null = la del tema.
export function letraGuardada(): string | null {
  try {
    const f = new File(Paths.document, ARCHIVO_LETRA_APP);
    if (!f.exists) return null;
    const j = JSON.parse(f.textSync()) as { id?: unknown };
    return typeof j.id === "string" ? (letraDe(j.id)?.id ?? null) : null;
  } catch {
    return null;
  }
}

// Guarda la letra para el próximo arranque. Si es otra que la que se ve, queda pendiente.
export function guardarLetra(id: string | null): void {
  const valida = letraDe(id)?.id ?? null;
  try {
    const f = new File(Paths.document, ARCHIVO_LETRA_APP);
    if (!valida) {
      if (f.exists) f.delete();
    } else {
      if (!f.exists) f.create();
      f.write(JSON.stringify({ id: valida }));
    }
  } catch {
    // Sin poder escribir: queda como estaba.
    return;
  }
  pendiente = valida === LETRA_APP_ACTIVA ? null : { id: valida };
  emitir();
}

export function descartarLetraPendiente(): void {
  pendiente = null;
  emitir();
}

export function fijarEstadoLetra(e: EstadoLetraApp): void {
  estado = e;
  emitir();
}

// Lo de la cuenta: si tienes la Letra libre y cuál elegiste. Si no es la del teléfono
// (se cambió desde la web u otro teléfono), se guarda y queda pendiente. Sin 0314 en la
// base, no toca nada.
export async function sincronizarLetraApp(userId: string): Promise<EstadoLetraApp> {
  const e = await estadoLetraApp(supabase, userId).catch(() => SIN_LETRA_APP);
  fijarEstadoLetra(e);
  if (!e.disponible) return e;
  const deseada = e.tiene ? (letraDe(e.elegida)?.id ?? null) : null;
  if (deseada !== letraGuardada()) guardarLetra(deseada);
  return e;
}
