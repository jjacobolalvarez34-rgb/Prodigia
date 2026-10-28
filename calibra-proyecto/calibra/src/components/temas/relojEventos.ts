"use client";

import { useSyncExternalStore } from "react";
import { crearRelojEventos } from "@/lib/temas/momentosClave";

// Reloj de los eventos en la web (src/lib/temas/momentosClave.ts, igual que la app): un
// temporizador al próximo momento clave (abre o cierra la Gran Alineación, empieza una
// fiesta, cambia el día) que se reprograma al volver a la pestaña (en segundo plano los
// navegadores atrasan los temporizadores). Quien lo usa se vuelve a pintar en ese instante.
export const relojEventos = crearRelojEventos({
  alVolver: (avisar) => {
    const alCambiar = () => {
      if (document.visibilityState === "visible") avisar();
    };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  },
});

const enServidor = () => 0;

// Sube en cada momento clave: sirve de dependencia para recalcular.
export function useRelojEventos(): number {
  return useSyncExternalStore(relojEventos.suscribir, relojEventos.version, enServidor);
}
