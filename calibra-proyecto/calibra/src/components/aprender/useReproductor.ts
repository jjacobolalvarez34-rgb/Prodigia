"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Opciones {
  // Cantidad de pasos; `paso` va de 0 (nada mostrado) a `total` (todo).
  total: number;
  // Milisegundos entre paso y paso mientras reproduce.
  ms: number;
  // true = mostrar todo ya (sin animar), como con "reducir movimiento".
  estatico?: boolean;
  // false = no arrancar solo (el usuario da Reproducir o avanza a mano).
  autoplay?: boolean;
  // Paso mínimo (por defecto 0). Con 1, el primer paso ya está visible al
  // empezar (p. ej. el primer cuadro de una explicación por cuadros).
  inicio?: number;
}

// Reproductor de pasos para los visuales animados: arranca solo cuando el
// visual entra en pantalla, y permite Pausa/Reproducir, Anterior, Siguiente
// y Repetir. Con `prefers-reduced-motion` (o `estatico`) muestra el estado
// final y NO reproduce solo (el usuario puede recorrerlo a mano). Todo el
// estado se deriva sin setState dentro de efectos: el único efecto es el
// temporizador del siguiente paso.
export function useReproductor({ total, ms, estatico = false, autoplay = true, inicio = 0 }: Opciones) {
  // Arranca cuando el visual entra en pantalla (ref de callback: sin
  // objetos ref que circulen por el render).
  const [enVista, setEnVista] = useState(false);
  const alVer = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setEnVista(true);
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setEnVista(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const reducirSistema = useReducedMotion();
  const reducir = estatico || reducirSistema === true;
  // null = el usuario todavía no tocó nada.
  const [manual, setManual] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);

  const minimo = Math.min(inicio, total);
  const paso = Math.min(total, Math.max(minimo, manual ?? (reducir ? total : minimo)));
  const reproduciendo = autoplay && enVista && !pausado && !reducir && paso < total;

  useEffect(() => {
    if (!reproduciendo) return;
    // El primer paso llega rápido; los demás siguen el ritmo pedido.
    const id = setTimeout(() => setManual(paso + 1), paso === 0 ? Math.min(500, ms) : ms);
    return () => clearTimeout(id);
  }, [reproduciendo, paso, ms]);

  function repetir() {
    setManual(minimo);
    setPausado(false);
  }

  return {
    alVer,
    paso,
    minimo,
    total,
    reproduciendo,
    reducir,
    alFinal: paso >= total,
    siguiente: () => {
      setManual(Math.min(total, paso + 1));
      setPausado(true);
    },
    anterior: () => {
      setManual(Math.max(minimo, paso - 1));
      setPausado(true);
    },
    repetir,
    alternar: () => {
      if (paso >= total) repetir();
      else if (reproduciendo) setPausado(true);
      else setPausado(false);
    },
  };
}

export type Reproductor = ReturnType<typeof useReproductor>;
