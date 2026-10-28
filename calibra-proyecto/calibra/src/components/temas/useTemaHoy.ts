"use client";

import { useEffect, useState } from "react";
import { forzarTema, temaActivo, type TemaActivo } from "@/lib/temas/temas";
import { TEMAS } from "@/lib/temas/temas";
import type { IdTema } from "@/lib/temas/calendario";
import { relojEventos } from "./relojEventos";

// La festividad de hoy en la web (src/lib/temas). Se calcula en el navegador (en el
// servidor no hay tema: así el primer render es igual en los dos y no hay saltos) y se
// recalcula en el instante exacto en que cambia algo (relojEventos: empieza o termina una
// fase, al volver a la pestaña), no cada tantos minutos. Solo en desarrollo, ?tema=<id> muestra un tema fuera de su
// fecha; en producción no hay forma de ver un evento antes de tiempo.
const CLAVE_FORZADO = "prodigia-tema-forzado";

function leerForzado(): IdTema | null {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const p = new URLSearchParams(window.location.search).get("tema");
    if (p === "ninguno") {
      sessionStorage.removeItem(CLAVE_FORZADO);
      return null;
    }
    if (p && p in TEMAS) {
      sessionStorage.setItem(CLAVE_FORZADO, p);
      return p as IdTema;
    }
    const g = sessionStorage.getItem(CLAVE_FORZADO);
    return g && g in TEMAS ? (g as IdTema) : null;
  } catch {
    return null;
  }
}

export function useTemaHoy(): TemaActivo | null {
  const [tema, setTema] = useState<TemaActivo | null>(null);
  useEffect(() => {
    const calcular = () => {
      forzarTema(leerForzado());
      const nuevo = temaActivo();
      // Mientras no cambie nada se queda el mismo objeto (así no se repinta todo de balde).
      setTema((antes) => (antes?.tema.id === nuevo?.tema.id && antes?.fase === nuevo?.fase && antes?.hoy.rango.desde === nuevo?.hoy.rango.desde ? antes : nuevo));
    };
    calcular();
    return relojEventos.suscribir(calcular);
  }, []);
  return tema;
}
