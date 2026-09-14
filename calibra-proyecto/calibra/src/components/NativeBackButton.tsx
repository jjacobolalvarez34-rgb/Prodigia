"use client";

// Botón/gesto de "atrás" del sistema, SOLO dentro de la app nativa
// (Capacitor). Es 100% inerte en la web/PWA (Capacitor.isNativePlatform()
// da false ahí), mismo criterio que NativePush.tsx.
//
// Sin esto, BridgeActivity usaba su comportamiento nativo por defecto para
// el botón/gesto de atrás de Android — cerraba la app en vez de navegar a
// la pantalla anterior de Prodigia. @capacitor/app expone el evento
// "backButton" con `canGoBack` (basado en el historial real del WebView):
// si hay una pantalla anterior en el historial navegamos ahí
// (window.history.back(), que Next.js App Router intercepta vía popstate
// para renderizar la ruta anterior sin recargar), y si no hay ninguna
// (estamos en la pantalla raíz) recién ahí se sale de la app.

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export default function NativeBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });

    return () => {
      void listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return null;
}
