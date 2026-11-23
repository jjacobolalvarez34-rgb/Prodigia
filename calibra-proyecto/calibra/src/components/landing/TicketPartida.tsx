"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

// El ticket de la tanda «Conceptos» de Instagram (2026-11-07, el que más gustó) hecho
// objeto en la presentación: papel térmico con grano, letra mono y borde rasgado en
// zigzag. Explica la partida sin una tarjeta genérica.
const GRANO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.28  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")";

function zigzag(dientes: number, alto: number) {
  const puntos = ["0% 0%", "100% 0%", `100% calc(100% - ${alto}px)`];
  for (let i = dientes; i >= 0; i--) {
    const x = (i / dientes) * 100;
    puntos.push(`${x}% ${i % 2 === 0 ? `calc(100% - ${alto}px)` : "100%"}`);
  }
  return `polygon(${puntos.join(", ")})`;
}

export default function TicketPartida() {
  const t = useTranslations("Presentacion.ticket");
  const lineas = t.raw("lineas") as [string, string][];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -7 }}
      whileInView={{ opacity: 1, y: 0, rotate: -3 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 90, damping: 14 }}
      whileHover={{ rotate: -1.5, y: -4 }}
      className="mx-auto w-full max-w-[340px] drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]"
    >
      <div
        className="px-7 pb-12 pt-8 font-mono text-[#2B2A28]"
        style={{ background: `${GRANO}, #EEEBE3`, clipPath: zigzag(28, 12) }}
      >
        <div className="flex flex-col items-center gap-1">
          <Logo size={40} colorAro="#6C4CF1" />
          <p className="mt-1 text-lg font-bold tracking-[0.12em]">PRODIGIA</p>
          <p className="text-[11px] tracking-wide text-[#5C5A55]">{t("encabezado")}</p>
        </div>
        <div className="my-4 border-t-2 border-dashed border-[#B9B4A8]" />
        <ul className="flex flex-col gap-2 text-[13px]">
          {lineas.map(([concepto, valor]) => (
            <li key={concepto} className="flex items-baseline gap-2">
              <span className="shrink-0">{concepto}</span>
              <span className="mb-1 flex-1 border-b border-dotted border-[#A8A396]" />
              <span className="shrink-0">{valor}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[#6B685F]">{t("nota")}</p>
        <div className="my-4 border-t-2 border-dashed border-[#B9B4A8]" />
        <p className="flex items-baseline justify-between text-xl font-bold">
          <span>{t("total")}</span>
          <span>{t("totalValor")}</span>
        </p>
        <div className="my-4 border-t-2 border-dashed border-[#B9B4A8]" />
        <p className="text-center text-[11px] leading-relaxed text-[#5C5A55]">{t("pie")}</p>
        <div aria-hidden="true" className="mx-auto mt-4 flex h-12 w-[85%] items-stretch gap-[2px]">
          {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2].map((w, i) => (
            <span key={i} className="bg-[#2B2A28]" style={{ width: w * 1.6, opacity: i % 7 === 3 ? 0 : 1 }} />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] tracking-wide">prodigia-sandy.vercel.app</p>
      </div>
    </motion.div>
  );
}
