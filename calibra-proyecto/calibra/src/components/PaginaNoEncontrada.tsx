"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CiudadSkyline from "@/components/recompensas/CiudadSkyline";

// 404 de Prodigia (pedido del usuario, 2026-10-06): una ciudad de noche con un
// ovni que se está llevando el "0" del 404 con su rayo. Las estrellas titilan y el
// "0" sube y baja dentro del rayo. Mismo diseño que +not-found.tsx de la app.

const ESTRELLAS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 55,
  tam: 1 + (i % 3),
  demora: (i % 7) * 0.4,
}));

export default function PaginaNoEncontrada() {
  const t = useTranslations("Common.noEncontrado");
  const quieto = useReducedMotion();
  return (
    <main className="relative flex min-h-[80vh] flex-1 flex-col items-center justify-center overflow-hidden bg-[#070A16] px-4 py-16 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1B1442_0%,#070A16_65%)]" />
      {ESTRELLAS.map((e, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-white"
          style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.tam, height: e.tam }}
          animate={quieto ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: e.demora }}
        />
      ))}

      <div aria-hidden="true" className="relative mb-2 h-64 w-full max-w-md">
        {/* El ovni que flota */}
        <motion.svg
          viewBox="0 0 120 70"
          className="absolute left-1/2 top-0 w-40 -translate-x-1/2"
          animate={quieto ? undefined : { y: [0, -8, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="60" cy="26" rx="22" ry="18" fill="#9BE7FF" fillOpacity="0.85" />
          <ellipse cx="54" cy="20" rx="7" ry="5" fill="#ffffff" fillOpacity="0.6" />
          <ellipse cx="60" cy="38" rx="56" ry="14" fill="#B8C2DA" />
          <ellipse cx="60" cy="42" rx="40" ry="6" fill="#7C86A2" />
          {[24, 42, 60, 78, 96].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy="38"
              r="3.2"
              fill={i % 2 ? "#FFC53D" : "#7CFFB2"}
              animate={quieto ? undefined : { opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </motion.svg>
        {/* El rayo */}
        <motion.div
          className="absolute left-1/2 top-16 h-44 w-44 -translate-x-1/2"
          style={{ clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", background: "linear-gradient(180deg, rgba(124,255,178,0.55), rgba(124,255,178,0.05))" }}
          animate={quieto ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        {/* 4 · 0 · 4: el 0 flota en el rayo */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-3 font-display font-black leading-none">
          <span className="text-8xl text-primario drop-shadow-[0_0_24px_rgba(124,92,255,0.6)]">4</span>
          <motion.span
            className="text-8xl text-[#7CFFB2] drop-shadow-[0_0_24px_rgba(124,255,178,0.7)]"
            animate={quieto ? undefined : { y: [-36, -58, -36], rotate: [-8, 8, -8] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            0
          </motion.span>
          <span className="text-8xl text-logro drop-shadow-[0_0_24px_rgba(255,197,61,0.6)]">4</span>
        </div>
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-white">{t("titulo")}</h1>
        <p className="text-sm text-[#B8C2DA]">{t("descripcion")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-primario px-6 py-3 font-display font-bold text-white shadow-[0_0_24px_rgba(124,92,255,0.45)] transition-transform hover:-translate-y-0.5">
            {t("inicio")}
          </Link>
          <Link href="/aprender" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-display font-bold text-white transition-colors hover:bg-white/10">
            {t("aprender")}
          </Link>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 flex opacity-90">
        <CiudadSkyline ciudad="numeria" alto={110} ancho={1600} />
      </div>
    </main>
  );
}
