// Rendimiento de las animaciones (pedido 2026-10-01: en un teléfono de 4 GB iban a
// pocos fps). Dos reglas:
// 1) Lo que no se ve no se anima: las pestañas quedan montadas al cambiar de una a
//    otra, así que cada animación en bucle se pausa si su pantalla no tiene el foco
//    o la app está en segundo plano (useAnimacionActiva).
// 2) En teléfonos con poca memoria (o si el jugador lo pide en Ajustes) se usan
//    menos partículas y menos efectos simultáneos (esLiviano).
import * as Device from "expo-device";
import { useIsFocused } from "expo-router";
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { useAjustes } from "./ajustes";

const GB = 1024 * 1024 * 1024;
// Debajo de ~6 GB de RAM real se considera gama media/baja.
export const EQUIPO_LIVIANO = (Device.totalMemory ?? 8 * GB) < 6 * GB;

export function useLiviano(): boolean {
  const { animaciones } = useAjustes();
  if (animaciones === "completas") return false;
  if (animaciones === "livianas") return true;
  return EQUIPO_LIVIANO;
}

function useAppActiva(): boolean {
  const [activa, setActiva] = useState(AppState.currentState === "active");
  useEffect(() => {
    const sub = AppState.addEventListener("change", (e) => setActiva(e === "active"));
    return () => sub.remove();
  }, []);
  return activa;
}

// 3) Una celebración a pantalla completa (constelación, 2026-11-23: «es la primera vez
//    que al completar una constelación se me traba TANTO») tapa la pestaña, pero la
//    pestaña sigue con el foco y seguía animando todo debajo (glifos, placa, marcos
//    animados, carteles) mientras arriba corría el estallido. Mientras hay una
//    superposición, lo de abajo se pausa; lo que está dentro de ella
//    (<DentroDeSuperposicion>) sigue animando.
let superposiciones = 0;
const oyentes = new Set<() => void>();
function suscribirSuperposicion(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}
const leerSuperposicion = () => superposiciones > 0;

// Mientras el componente que lo llama esté montado con `activa`, pausa lo de abajo.
export function useTaparFondo(activa: boolean) {
  useEffect(() => {
    if (!activa) return;
    superposiciones++;
    oyentes.forEach((f) => f());
    return () => {
      superposiciones--;
      oyentes.forEach((f) => f());
    };
  }, [activa]);
}

const ContextoSuperposicion = createContext(false);
export const DentroDeSuperposicion = ContextoSuperposicion.Provider;

// true si la pantalla que contiene al componente está a la vista.
export function useAnimacionActiva(): boolean {
  const enFoco = useIsFocused();
  const activa = useAppActiva();
  const tapada = useSyncExternalStore(suscribirSuperposicion, leerSuperposicion);
  const dentro = useContext(ContextoSuperposicion);
  return enFoco && activa && (!tapada || dentro);
}
