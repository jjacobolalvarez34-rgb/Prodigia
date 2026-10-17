"use client";

import { motion } from "framer-motion";
import { ADORNOS_CAPSULA, type AdornoCapsula } from "@/lib/temas/dibujos";
import { useTemaHoy } from "@/components/temas/useTemaHoy";
import { capaVisible } from "@/lib/temas/temas";

// La cápsula dibujada en dos mitades (se abren hacia los lados). La usan la lista de
// cápsulas de Recompensas y la escena de apertura (fx/RevelacionWeb). En una
// festividad (src/lib/temas) toma sus colores y su adorno: moño de regalo, calabaza…
export function DibujoCapsula({ colores: coloresBase, abierta = false, tam = 110, adorno: adornoFijo }: { colores: [string, string]; abierta?: boolean; tam?: number; adorno?: AdornoCapsula | null }) {
  const tema = useTemaHoy();
  const piel = capaVisible(tema, "capsula") ? tema?.tema.capsula : undefined;
  const colores = piel?.colores ?? coloresBase;
  const adorno = adornoFijo === null ? null : (adornoFijo ?? piel?.adorno ?? null);
  const [a, b] = colores;
  const id = `${a}${b}`.replace(/#/g, "");
  return (
    <span className="relative inline-block" style={{ width: tam, height: (tam * 140) / 100 }}>
      <motion.svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" animate={abierta ? { y: -50, x: -16, rotate: -28, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
        <defs>
          <linearGradient id={`wa${id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <path d="M20 70 V50 A30 30 0 0 1 80 50 V70 Z" fill={`url(#wa${id})`} />
        <path d="M30 44 A20 20 0 0 1 48 30" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" fill="none" />
      </motion.svg>
      <motion.svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" animate={abierta ? { y: 50, x: 16, rotate: 28, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
        <defs>
          <linearGradient id={`wb${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={b} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <path d="M20 70 V90 A30 30 0 0 0 80 90 V70 Z" fill={`url(#wb${id})`} />
        <path d="M17 69 H83 V73 H17 Z" fill="#2A1A00" fillOpacity={0.25} />
      </motion.svg>
      {adorno && (
        <motion.svg viewBox="0 0 100 140" className="pointer-events-none absolute inset-0 h-full w-full" animate={{ opacity: abierta ? 0 : 1 }} transition={{ duration: 0.25 }} aria-hidden="true">
          {ADORNOS_CAPSULA[adorno].map((f, i) => (
            <path key={i} d={f.d} fill={f.relleno ?? "none"} stroke={f.trazo} strokeWidth={f.ancho} strokeLinecap="round" strokeLinejoin="round" opacity={f.opacidad} />
          ))}
        </motion.svg>
      )}
    </span>
  );
}
