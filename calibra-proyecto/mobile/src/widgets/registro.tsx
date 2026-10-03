import { anclarWidgetNativo, guardarDatosWidgets } from "widgets-prodigia";
import { leerResumenGuardado, type Resumen } from "~/lib/resumen";

// Punto único de contacto con los widgets de la pantalla de inicio. Son nativos
// (modules/widgets-prodigia): Android los dibuja solo con los últimos datos que
// la app les pasó, así que funcionan aunque el sistema no deje arrancar la app en
// segundo plano. En Expo Go el módulo no existe y esto no hace nada.

// Redibuja los widgets con el resumen (o el último guardado si no se pasa).
// null explícito = sesión cerrada: muestran "Entra a Prodigia".
export async function actualizarWidgets(resumen?: Resumen | null) {
  const datos = resumen === undefined ? await leerResumenGuardado() : resumen;
  try {
    guardarDatosWidgets(datos ? { ...datos } : null);
  } catch {
    // Sin módulo nativo (Expo Go): nada que dibujar.
  }
}

// Pide al launcher anclar un widget. false = el launcher no lo permite.
export async function anclarWidget(nombre: "Racha" | "Progreso"): Promise<boolean> {
  try {
    return anclarWidgetNativo(nombre);
  } catch {
    return false;
  }
}
