"use client";

import { useEffect } from "react";

// PWA (Fase U-PWA): registra /public/sw.js — cache de assets estáticos
// nada más, ver el comentario en ese archivo. No renderiza nada.
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Si falla (navegador viejo, contexto no seguro, etc.) la app
      // sigue funcionando igual sin el cache extra — no es crítico.
    });
  }, []);

  return null;
}
