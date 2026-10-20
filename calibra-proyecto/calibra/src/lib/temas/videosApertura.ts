import { momentoAlineacion } from "@/lib/recompensas/alineacion";
import type { IdTema } from "./calendario";
import { slugEvento } from "./colecciones";
import { temaActivo } from "./temas";

// Videos de apertura de los eventos (docs/eventos/ANIMACIONES_EVENTOS.md). Cada uno se
// ve una vez por edición en cada dispositivo: si se abre la app (o la web) durante el
// evento, en lugar del menú; si empieza con la app abierta, con un fundido.
// Archivos: app mobile/assets/videos/<archivo>.mp4 (vertical); web
// public/videos/<archivo>.mp4 (horizontal) y <archivo>-vertical.mp4, con sus pósters.
// Para sumar el de otra fiesta: agregarla acá y su archivo en VIDEOS de la app.
export const VIDEO_DE_TEMA: Partial<Record<IdTema, string>> = {
  halloween: "halloween",
  navidad: "navidad",
};

export const VIDEO_ALINEACION = "gran-alineacion";

export interface VideoApertura {
  // Una por edición: «alineacion-3», «halloween-2026»… (lo que se marca como visto).
  clave: string;
  archivo: string;
}

export function videoAperturaActual(ahora = Date.now()): VideoApertura | null {
  const m = momentoAlineacion(ahora);
  if (m.momento === "durante") return { clave: `alineacion-${m.numero}`, archivo: VIDEO_ALINEACION };
  // Basta con que la fecha esté en su fase de evento (no hace falta que tenga colección).
  const t = temaActivo(ahora);
  const archivo = t ? VIDEO_DE_TEMA[t.tema.id] : undefined;
  if (t && t.fase === "evento" && archivo && t.hoy.rango.desde) return { clave: slugEvento(t.tema.id, t.hoy.rango.desde), archivo };
  return null;
}
