import { AppState } from "react-native";
import { cambiarIconoNativo, iconoActualNativo } from "widgets-prodigia";
import { forzarTema, temaActivo } from "@/lib/temas/temas";
import { leerAjustes } from "./ajustes";
import { temaEnVistaPrevia } from "./temporada";

// Ícono de la app en las festividades (2026-10-17). Solo las que tienen su alias en
// plugins/iconos-temporada.js (por ahora Halloween y Navidad; los íconos de las otras
// ya están hechos en assets/iconos-temporada). Se cambia al irse la app a segundo
// plano: en algunos launchers el cambio reinicia la app, así no interrumpe nada.
const ALIAS: Record<string, string> = { halloween: "IconoHalloween", navidad: "IconoNavidad" };

function iconoQueToca(): string {
  if (!leerAjustes().decoracion) return "IconoPredeterminado";
  forzarTema(temaEnVistaPrevia());
  const id = temaActivo()?.tema.id;
  return (id && ALIAS[id]) || "IconoPredeterminado";
}

export function vigilarIconoTemporada(): () => void {
  const sub = AppState.addEventListener("change", (estado) => {
    if (estado !== "background") return;
    try {
      const toca = iconoQueToca();
      const actual = iconoActualNativo();
      if (actual && actual !== toca) cambiarIconoNativo(toca);
    } catch {
      // Sin módulo nativo (Expo Go): nada que cambiar.
    }
  });
  return () => sub.remove();
}
