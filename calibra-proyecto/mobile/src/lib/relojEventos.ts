import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { crearRelojEventos } from "@/lib/temas/momentosClave";

// Reloj de los eventos en la app (src/lib/temas/momentosClave.ts, igual que la web): un
// temporizador al próximo momento clave (abre o cierra la Gran Alineación, empieza una
// fiesta, cambia el día) que se reprograma al volver la app al frente. Quien lo usa se
// vuelve a pintar en ese instante exacto, sin revisar cada tantos minutos.
export const relojEventos = crearRelojEventos({
  alVolver: (avisar) => {
    const sub = AppState.addEventListener("change", (e) => e === "active" && avisar());
    return () => sub.remove();
  },
});

// Sube en cada momento clave: sirve de dependencia para recalcular.
export function useRelojEventos(): number {
  return useSyncExternalStore(relojEventos.suscribir, relojEventos.version, relojEventos.version);
}
