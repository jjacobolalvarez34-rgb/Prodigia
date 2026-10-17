"use client";

import { useEffect, useState } from "react";
import { forzarTema, temaActivo, type TemaActivo } from "@/lib/temas/temas";
import { TEMAS } from "@/lib/temas/temas";
import type { IdTema } from "@/lib/temas/calendario";

// La festividad de hoy en la web (src/lib/temas). Se calcula en el navegador (en el
// servidor no hay tema: así el primer render es igual en los dos y no hay saltos) y se
// revisa cada 10 minutos. Con ?tema=<id> en la dirección se puede ver cualquier tema
// fuera de su fecha (vista previa); se recuerda en la pestaña.
const CLAVE_FORZADO = "prodigia-tema-forzado";

function leerForzado(): IdTema | null {
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
      setTema(temaActivo());
    };
    calcular();
    const id = setInterval(calcular, 10 * 60_000);
    return () => clearInterval(id);
  }, []);
  return tema;
}
