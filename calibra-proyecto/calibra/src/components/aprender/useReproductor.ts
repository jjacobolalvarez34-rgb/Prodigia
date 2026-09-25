"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// "Reducir movimiento" del sistema, leído de forma segura para la hidratación.
// framer-motion `useReducedMotion()` devuelve null en el servidor y el valor
// real en el primer render del cliente, así que el HTML hidratado no coincidía
// (server: con animación; cliente: estático) y React tiraba "Hydration failed"
// cuando un visual se renderizaba en el servidor con la preferencia activada.
// useSyncExternalStore usa `false` SOLO mientras hidrata y el valor real en
// cualquier otro render del cliente (un visual que aparece tras un clic sigue
// leyendo la preferencia real desde su primer render, como antes).
const CONSULTA_MENOS_MOVIMIENTO = "(prefers-reduced-motion: reduce)";
const haySoporteMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
function suscribirMenosMovimiento(avisar: () => void) {
  if (!haySoporteMatchMedia()) return () => {};
  const mq = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO);
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}
const leerMenosMovimiento = () => haySoporteMatchMedia() && window.matchMedia(CONSULTA_MENOS_MOVIMIENTO).matches;
const menosMovimientoEnServidor = () => false;

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
  const reducirSistema = useSyncExternalStore(suscribirMenosMovimiento, leerMenosMovimiento, menosMovimientoEnServidor);
  const reducir = estatico || reducirSistema;
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
