"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { pasosPara, textoDe, type IdRecorrido, type PasoRecorrido } from "@/lib/tutorial/recorridos";
import { EVENTO_TUTORIAL, leerVistos, marcarVisto } from "@/lib/tutorial/vistos";

// Tutorial guiado de una sección (docs/PLAN_TUTORIAL_GUIADO.md). Sale solo la primera
// vez que entras (lo visto se guarda en la cuenta) y cuando tocas «?» en el encabezado.
// Oscurece todo menos el elemento que explica, con un borde del color de la sección, y
// una tarjeta corta con Siguiente, Atrás y Saltar. Los pasos cuyo elemento no está en
// la página se saltan solos. Nunca se abre encima de otro aviso.

const RELLENO = 8;

function buscarAncla(ancla: string): HTMLElement | null {
  const selector = /^[a-z0-9-]+$/.test(ancla) ? `[data-tour="${ancla}"]` : ancla;
  const lista = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return lista.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }) ?? null;
}

function hayOtroAviso(): boolean {
  return !!document.querySelector('[role="dialog"], [role="presentation"], [aria-modal="true"]');
}

export default function RecorridoGuiado({ id, acento = "#7C5CFF" }: { id: IdRecorrido; acento?: string }) {
  const locale = useLocale();
  const [pasos, setPasos] = useState<PasoRecorrido[]>([]);
  const [i, setI] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [medida, setMedida] = useState<{ paso: number; x: number; y: number; w: number; h: number } | null>(null);
  const tarjeta = useRef<HTMLDivElement>(null);

  const iniciar = useCallback(() => {
    const ps = pasosPara(id, "web").filter((p) => !p.web || buscarAncla(p.web));
    if (ps.length === 0) return false;
    setPasos(ps);
    setI(0);
    setAbierto(true);
    return true;
  }, [id]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    setMedida(null);
    marcarVisto(id);
  }, [id]);

  // La primera vez: espera a que la página esté quieta y a que no haya otro aviso.
  useEffect(() => {
    let vivo = true;
    let intentos = 0;
    let timer: ReturnType<typeof setTimeout>;
    const probar = async () => {
      const vistos = await leerVistos();
      if (!vivo || vistos.has(id)) return;
      const esperar = () => {
        if (!vivo) return;
        if (hayOtroAviso() && intentos++ < 30) {
          timer = setTimeout(esperar, 2000);
          return;
        }
        if (!hayOtroAviso()) iniciar();
      };
      esperar();
    };
    timer = setTimeout(probar, 1200);
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [id, iniciar]);

  // El botón «?» del encabezado.
  useEffect(() => {
    const oir = (e: Event) => {
      if ((e as CustomEvent).detail === id) iniciar();
    };
    window.addEventListener(EVENTO_TUTORIAL, oir);
    return () => window.removeEventListener(EVENTO_TUTORIAL, oir);
  }, [id, iniciar]);

  // Seguir al elemento del paso actual (scroll, cambios de tamaño).
  const paso = abierto ? pasos[i] : null;
  useEffect(() => {
    if (!paso) return;
    const el = paso.web ? buscarAncla(paso.web) : null;
    if (!el) return;
    const indice = pasos.indexOf(paso);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    let cuadro = 0;
    let ultimo = "";
    const medir = () => {
      const r = el.getBoundingClientRect();
      const clave = `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
      if (clave !== ultimo) {
        ultimo = clave;
        setMedida({ paso: indice, x: r.x, y: r.y, w: r.width, h: r.height });
      }
      cuadro = requestAnimationFrame(medir);
    };
    cuadro = requestAnimationFrame(medir);
    return () => cancelAnimationFrame(cuadro);
  }, [paso, pasos]);

  useEffect(() => {
    if (!abierto) return;
    tarjeta.current?.focus();
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") avanzar();
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", teclas);
    return () => window.removeEventListener("keydown", teclas);
  });

  function avanzar() {
    if (i < pasos.length - 1) setI(i + 1);
    else cerrar();
  }

  if (!abierto || !paso || typeof document === "undefined") return null;
  // La medida solo vale si es del paso que se está mostrando.
  const rect = paso.web && medida?.paso === i ? medida : null;

  const es = !locale.startsWith("en");
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const anchoTarjeta = Math.min(360, vw - 32);
  let estiloTarjeta: CSSProperties;
  if (rect) {
    const abajo = rect.y + rect.h + RELLENO + 14;
    const caeAbajo = abajo + 200 < vh;
    const left = Math.min(Math.max(16, rect.x + rect.w / 2 - anchoTarjeta / 2), vw - anchoTarjeta - 16);
    estiloTarjeta = caeAbajo ? { top: abajo, left, width: anchoTarjeta } : { bottom: vh - (rect.y - RELLENO - 14), left, width: anchoTarjeta };
  } else {
    estiloTarjeta = { top: "50%", left: "50%", width: anchoTarjeta, transform: "translate(-50%, -50%)" };
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={textoDe(paso.titulo, locale)}>
      {rect ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-2xl"
          initial={false}
          animate={{ left: rect.x - RELLENO, top: rect.y - RELLENO, width: rect.w + RELLENO * 2, height: rect.h + RELLENO * 2 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          style={{
            boxShadow: `0 0 0 9999px rgba(5,7,13,0.74), 0 0 0 2px color-mix(in oklab, ${acento} 40%, #fff), 0 0 18px 2px ${acento}`,
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-[rgba(5,7,13,0.74)]" />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          ref={tarjeta}
          tabIndex={-1}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed flex flex-col gap-2 rounded-2xl border border-[#232B47] bg-[#171D34] p-5 text-left text-[#F4F6FB] shadow-2xl outline-none"
          style={estiloTarjeta}
        >
          <p className="font-mono text-[11px] font-bold" style={{ color: acento }}>
            {es ? `${i + 1} DE ${pasos.length}` : `${i + 1} OF ${pasos.length}`}
          </p>
          <p className="font-display text-lg font-bold">{textoDe(paso.titulo, locale)}</p>
          <p className="text-sm text-[#AEB6D2]">{textoDe(paso.texto, locale)}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <button type="button" onClick={cerrar} className="text-xs text-[#8892B0] hover:text-white">
              {es ? "Saltar" : "Skip"}
            </button>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <button type="button" onClick={() => setI(i - 1)} className="rounded-full border border-[#3A3F66] px-3 py-1.5 text-sm font-semibold text-[#F4F6FB]">
                  {es ? "Atrás" : "Back"}
                </button>
              )}
              <button type="button" onClick={avanzar} className="rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ background: acento }}>
                {i < pasos.length - 1 ? (es ? "Siguiente" : "Next") : es ? "¡Entendido!" : "Got it!"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}
