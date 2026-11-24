"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CartaSVG, { DorsoSVG } from "@/components/naipia/CartaSVG";
import { COLOR_NAIPIA } from "@/app/[locale]/naipia/colores";
import type { Carta } from "@/lib/practica/naipia";
import { porCien, puntosCarta, valorMano, type Decision } from "@/lib/ganaleModelo/blackjack";

// Piezas de la mesa de «Gánale al modelo»: el paño, las cartas (con la misma repartida
// en resorte de FilaCartas de Naipia, más el volteo de la oculta) y la ficha.

export const NEON_NAIPIA = "#F25C5C";

// Grano del paño, dibujado por código (sin imágenes externas).
const GRANO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.32 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function Pano({ children, leyenda, className = "" }: { children: ReactNode; leyenda?: string; className?: string }) {
  const idArco = `arco-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={`relative rounded-[2.2rem] border-[10px] border-[#3B2416] bg-[#0B5A38] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:p-6 ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.6rem]" style={{ backgroundImage: GRANO, boxShadow: "inset 0 0 90px rgba(0,0,0,0.5)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[1.4rem] border border-dashed border-[#E9D9A6]/25" />
      {leyenda && (
        <svg aria-hidden="true" viewBox="0 0 400 60" className="pointer-events-none absolute left-1/2 top-1/2 w-[88%] max-w-md -translate-x-1/2 -translate-y-1/2">
          <path id={idArco} d="M6 54 Q200 0 394 54" fill="none" />
          <text fill="#E9D9A6" fillOpacity={0.32} fontSize="10.5" fontWeight={700} letterSpacing="1" fontFamily="ui-sans-serif, system-ui, sans-serif">
            <textPath href={`#${idArco}`} startOffset="50%" textAnchor="middle">
              {leyenda.toUpperCase()}
            </textPath>
          </text>
        </svg>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

// Inclinación fija por posición: las cartas reales nunca caen derechas.
const GIRO = [-4, 3, -2, 4, -3, 2, -1, 3];

export function ManoCartas({ cartas, oculta = false, ancho = 64, etiqueta }: { cartas: Carta[]; oculta?: boolean; ancho?: number; etiqueta?: string }) {
  return (
    <div role="group" aria-label={etiqueta} className="flex min-h-[1px] justify-center" style={{ minHeight: (ancho * 84) / 60 + 8 }}>
      {cartas.map((c, i) => {
        const tapada = oculta && i === 1;
        return (
          <motion.div
            key={`${i}-${c.valor}-${c.palo}`}
            initial={{ opacity: 0, x: 120, y: -150, rotate: 25, scale: 0.6 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: GIRO[i % GIRO.length], scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 20, mass: 0.8 }}
            style={{ marginLeft: i === 0 ? 0 : -ancho * 0.38, zIndex: i, perspective: 600 }}
          >
            <motion.div
              key={tapada ? "dorso" : "cara"}
              initial={tapada ? false : { rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {tapada ? <DorsoSVG ancho={ancho} colorHex={COLOR_NAIPIA} /> : <CartaSVG carta={c} ancho={ancho} />}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Ficha de casino dibujada por código.
export function Ficha({ color = COLOR_NAIPIA, tam = 22 }: { color?: string; tam?: number }) {
  return (
    <svg aria-hidden="true" width={tam} height={tam} viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill={color} />
      <circle cx="12" cy="12" r="11" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4.3 4.3" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth="1" />
    </svg>
  );
}

export function conSigno(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `-${-n}` : "0";
}

// Textos derivados del modelo (estado, carta, la línea que explica una decisión).
export function useFrasesModelo() {
  const t = useTranslations("GanaleModelo");
  function estado(total: number, suave: boolean) {
    return suave ? t("suave", { n: total }) : t("duro", { n: total });
  }
  function totalDe(cartas: Carta[]) {
    const v = valorMano(cartas);
    return v.pasado ? `${v.total} · ${t("pasado")}` : estado(v.total, v.suave);
  }
  function carta(c: Carta) {
    const p = puntosCarta(c.valor);
    return p === 1 ? t("cartaAs") : p === 8 ? t("cartaOcho") : t("cartaNum", { n: p });
  }
  function valor(q: number) {
    const n = porCien(q);
    return n > 0 ? t("valor.gana", { n }) : n < 0 ? t("valor.pierde", { n: -n }) : t("valor.cero");
  }
  function explicacion(d: Decision) {
    return t("explicacion", {
      estado: estado(d.total, d.suave),
      carta: carta(d.visible),
      accion: t(`accion.${d.valores.accion}`),
      p: valor(d.valores.qPlantarse),
      h: valor(d.valores.qPedir),
    });
  }
  return { estado, totalDe, explicacion };
}
