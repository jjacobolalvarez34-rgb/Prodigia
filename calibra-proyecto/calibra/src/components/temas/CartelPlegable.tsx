"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Carteles de evento del Inicio minimizados (pedido del 2026-10-28): por defecto se ven
// como una franja compacta (dibujo, nombre y contador) para que «jugar» quede a un
// clic; al tocarla se abre el cartel completo, y se puede volver a minimizar. Si el
// jugador lo deja abierto, se recuerda por evento (en este navegador). Igual en la app
// (mobile/src/ui/temas/CartelPlegable.tsx).
const PREFIJO = "prodigia:cartel-abierto:";
const EVENTO = "prodigia:cartel-plegable";
// Lo elegido en esta visita (por si el navegador no deja guardar).
const memoria = new Map<string, boolean>();

function leer(id: string): boolean {
  const m = memoria.get(id);
  if (m !== undefined) return m;
  try {
    return localStorage.getItem(PREFIJO + id) === "1";
  } catch {
    return false;
  }
}

function guardar(id: string, abierto: boolean) {
  memoria.set(id, abierto);
  try {
    if (abierto) localStorage.setItem(PREFIJO + id, "1");
    else localStorage.removeItem(PREFIJO + id);
  } catch {
    // Sin almacenamiento (ventana privada): dura solo esta visita.
  }
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  return () => window.removeEventListener(EVENTO, avisar);
}

// El contador de la franja, corto: solo las dos unidades mayores de faltaPara
// («6 d 23 h», «2 h 05 min», «4 min 09 s»).
export function faltaCorto(tiempo: string): string {
  return tiempo.split(" ").slice(0, 4).join(" ");
}

function Chevron({ arriba = false, className = "" }: { arriba?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d={arriba ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface FranjaCartel {
  // Dibujo chico de la izquierda (el del evento).
  icono: ReactNode;
  eyebrow: string;
  titulo: string;
  // El contador o la línea corta de la derecha.
  detalle?: ReactNode;
  acento: string;
  fondo: string;
  borde?: string;
  sombra?: string;
  // Algo por reclamar: un punto sobre el dibujo y una etiqueta discreta.
  pendiente?: string | null;
}

const SUAVE = [0.22, 1, 0.36, 1] as const;

export default function CartelPlegable({ id, franja, children }: { id: string; franja: FranjaCartel; children: ReactNode }) {
  const t = useTranslations("Carteles");
  const abierto = useSyncExternalStore(
    suscribir,
    () => leer(id),
    () => false
  );

  // -m-2 p-2: el recorte de la animación deja lugar a las sombras de los carteles.
  return (
    <AnimatePresence initial={false} mode="wait">
      {abierto ? (
        <motion.div key="abierto" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: SUAVE }} className="relative -m-2 overflow-hidden p-2">
          {children}
          <button
            type="button"
            onClick={() => guardar(id, false)}
            aria-expanded
            aria-label={t("minimizar")}
            title={t("minimizar")}
            className="absolute right-5 top-5 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-[#05060F]/60 text-white/85 backdrop-blur transition-colors hover:bg-[#05060F]/85 hover:text-white"
          >
            <Chevron arriba className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div key="franja" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: SUAVE }} className="-m-2 overflow-hidden p-2">
          <button
            type="button"
            onClick={() => guardar(id, true)}
            aria-expanded={false}
            aria-label={`${franja.titulo}. ${t("abrir")}`}
            className="group relative flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-white transition-transform hover:-translate-y-0.5"
            style={{ background: franja.fondo, borderColor: franja.borde ?? "#05060F", boxShadow: franja.sombra ?? "4px 4px 0 0 #05060F" }}
          >
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-[#05060F]/45">
              {franja.icono}
              {franja.pendiente && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#05060F]" style={{ background: franja.acento }} />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: franja.acento }}>
                {franja.eyebrow}
              </span>
              <span className="truncate font-display text-base font-bold leading-tight">{franja.titulo}</span>
            </span>
            {franja.pendiente ? (
              <span className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold" style={{ borderColor: `${franja.acento}99`, color: franja.acento, background: `${franja.acento}1a` }}>
                {franja.pendiente}
              </span>
            ) : (
              franja.detalle && <span className="hidden shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums empty:hidden min-[380px]:inline">{franja.detalle}</span>
            )}
            <Chevron className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
