import { anclarWidgetNativo, guardarDatosWidgets } from "widgets-prodigia";
import { forzarTema, temaActivo } from "@/lib/temas/temas";
import { leerAjustes } from "~/lib/ajustes";
import { leerResumenGuardado, type Resumen } from "~/lib/resumen";
import { temaEnVistaPrevia } from "~/lib/temporada";

// Punto único de contacto con los widgets de la pantalla de inicio. Son nativos
// (modules/widgets-prodigia): Android los dibuja solo con los últimos datos que
// la app les pasó, así que funcionan aunque el sistema no deje arrancar la app en
// segundo plano. En Expo Go el módulo no existe y esto no hace nada.

const DIA = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

// Festividades de los próximos 60 días, por tramos (src/lib/temas): el widget elige la
// de hoy con el reloj del teléfono, así se decora en la fecha aunque la app no se abra.
function temasProximos(): { id: string; desde: string; hasta: string }[] {
  if (!leerAjustes().decoracion) return [];
  const vista = temaEnVistaPrevia();
  const hoy = Date.now();
  if (vista) return [{ id: vista, desde: iso(hoy), hasta: iso(hoy + 30 * DIA) }];
  forzarTema(null);
  const tramos: { id: string; desde: string; hasta: string }[] = [];
  const inicio = Date.parse(`${iso(hoy)}T12:00:00Z`);
  for (let i = 0; i < 60; i++) {
    const t = inicio + i * DIA;
    const id = temaActivo(t)?.tema.id;
    if (!id) continue;
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.id === id && Date.parse(`${ultimo.hasta}T12:00:00Z`) === t - DIA) ultimo.hasta = iso(t);
    else tramos.push({ id, desde: iso(t), hasta: iso(t) });
  }
  return tramos;
}

// Redibuja los widgets con el resumen (o el último guardado si no se pasa).
// null explícito = sesión cerrada: muestran "Entra a Prodigia".
export async function actualizarWidgets(resumen?: Resumen | null) {
  const datos = resumen === undefined ? await leerResumenGuardado() : resumen;
  try {
    guardarDatosWidgets(datos ? { ...datos, temas: temasProximos() } : null);
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
