"use client";

import { useSyncExternalStore } from "react";

// Lo que ya se vio de lo «NUEVO», en este navegador (src/lib/recompensas/novedades.ts).
const CLAVE = "prodigia:nuevo-visto";
const oyentes = new Set<() => void>();
let cache: Set<string> | null = null;
const VACIO: ReadonlySet<string> = new Set();

function leer(): Set<string> {
  if (cache) return cache;
  try {
    cache = new Set(JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as string[]);
  } catch {
    cache = new Set();
  }
  return cache;
}

export function marcarNuevoVisto(clave: string) {
  const s = leer();
  if (s.has(clave)) return;
  cache = new Set(s).add(clave);
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...cache]));
  } catch {
    // Sin almacenamiento: dura hasta recargar.
  }
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useNuevoVisto(): ReadonlySet<string> {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}
