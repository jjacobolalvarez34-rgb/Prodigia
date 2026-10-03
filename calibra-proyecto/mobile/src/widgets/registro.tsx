/* eslint-disable @typescript-eslint/no-require-imports */
import { hayWidgets } from "~/lib/entorno";
import { cargarResumen, leerResumenGuardado, type Resumen } from "~/lib/resumen";

// Punto único de contacto con los widgets. El módulo nativo solo existe en un build
// propio: en Expo Go (o fuera de Android) estas funciones no hacen nada. Se usa
// `require` dentro de cada función, y no un import arriba, porque importar la
// librería en Expo Go rompe la app (busca un módulo nativo que no está).

type Modulo = typeof import("react-native-android-widget");
type Ui = typeof import("./ui");

function cargar(): { lib: Modulo; ui: Ui } | null {
  if (!hayWidgets) return null;
  return { lib: require("react-native-android-widget") as Modulo, ui: require("./ui") as Ui };
}

function conTiempoLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promesa, new Promise<null>((resolver) => setTimeout(() => resolver(null), ms))]);
}

// Se llama una vez al arrancar el bundle (index.ts). Android despierta la app en
// segundo plano para dibujar o refrescar un widget (al agregarlo, al cambiarle el
// tamaño y cada 30 min): primero se dibuja lo guardado y después, si hay red, se
// vuelve a dibujar con datos frescos.
export function registrarWidgets() {
  const m = cargar();
  if (!m) return;
  m.lib.registerWidgetTaskHandler(async ({ widgetInfo, widgetAction, renderWidget }) => {
    if (widgetAction === "WIDGET_DELETED" || widgetAction === "WIDGET_CLICK") return;
    const Componente = m.ui.WIDGETS[widgetInfo.widgetName as keyof Ui["WIDGETS"]];
    if (!Componente) return;
    // Siempre se dibuja algo, aunque falle la lectura o la red (si el handler
    // termina sin dibujar, Android muestra "No se pudo cargar el widget").
    let guardado: Resumen | null = null;
    try {
      guardado = await leerResumenGuardado();
    } catch {
      guardado = null;
    }
    renderWidget(<Componente resumen={guardado} />);
    try {
      const fresco = await conTiempoLimite(cargarResumen().catch(() => null), 8000);
      if (fresco) renderWidget(<Componente resumen={fresco} />);
    } catch {
      // Queda dibujado lo guardado.
    }
  });
}

// Redibuja los widgets que estén en la pantalla de inicio (después de una partida,
// al abrir la app...). Si no se pasa el resumen, se usa el último guardado.
export async function actualizarWidgets(resumen?: Resumen | null) {
  const m = cargar();
  if (!m) return;
  const datos = resumen ?? (await leerResumenGuardado());
  await Promise.all(
    (Object.keys(m.ui.WIDGETS) as (keyof Ui["WIDGETS"])[]).map((nombre) => {
      const Componente = m.ui.WIDGETS[nombre];
      return m.lib.requestWidgetUpdate({ widgetName: nombre, renderWidget: () => <Componente resumen={datos} /> }).catch(() => undefined);
    })
  );
}

// Abre el diálogo del launcher para anclar un widget. false = el launcher no lo soporta.
export async function anclarWidget(nombre: "Racha" | "Progreso"): Promise<boolean> {
  const m = cargar();
  if (!m) return false;
  return m.lib.requestPinWidget({ widgetName: nombre }).catch(() => false);
}
