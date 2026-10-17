"use client";

import { useEffect, useSyncExternalStore } from "react";
import { capaVisible } from "@/lib/temas/temas";
import { decoracionHabilitada, decoracionHabilitadaServerSnapshot, subscribeDecoracion } from "@/lib/decoracion";
import { useTemaHoy } from "./useTemaHoy";

// Marca la festividad en <html> (data-tema y data-borde) para que el CSS vista los
// botones principales con el borde de la fecha (globals.css, «Festividades»). No
// dibuja nada.
export default function AplicarTema() {
  const tema = useTemaHoy();
  const decoracion = useSyncExternalStore(subscribeDecoracion, decoracionHabilitada, decoracionHabilitadaServerSnapshot);
  useEffect(() => {
    const html = document.documentElement;
    if (tema && decoracion && capaVisible(tema, "interfaz")) {
      html.dataset.tema = tema.tema.id;
      if (tema.tema.borde) html.dataset.borde = tema.tema.borde;
      else delete html.dataset.borde;
      html.style.setProperty("--acento-tema", tema.tema.acento);
    } else {
      delete html.dataset.tema;
      delete html.dataset.borde;
    }
  }, [tema, decoracion]);
  return null;
}
