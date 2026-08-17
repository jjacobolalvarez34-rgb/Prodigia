"use client";

import { useSyncExternalStore } from "react";
import { sonidoHabilitado, sonidoHabilitadoServerSnapshot, setSonidoHabilitado, subscribeSonido } from "@/lib/sonido";

export default function SonidoToggle({ className }: { className?: string }) {
  const habilitado = useSyncExternalStore(subscribeSonido, sonidoHabilitado, sonidoHabilitadoServerSnapshot);

  function toggle() {
    setSonidoHabilitado(!habilitado);
  }

  return (
    <button
      onClick={toggle}
      aria-label={habilitado ? "Silenciar sonido" : "Activar sonido"}
      aria-pressed={habilitado}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground/60 transition-colors hover:text-foreground ${className ?? ""}`}
    >
      {habilitado ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4Z" />
          <path d="M17 8a5 5 0 0 1 0 8" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 9v6h4l5 5V4L8 9H4Z" />
          <path d="M16 9l5 6M21 9l-5 6" />
        </svg>
      )}
    </button>
  );
}
