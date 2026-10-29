"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Achievement } from "@/types/database";
import type { EstadoGuardadoLeccion } from "./useCompletarLeccion";
import { reproducirTono } from "@/lib/sonido";
import LogroBanner from "@/components/LogroBanner";

interface Props {
  titulo: ReactNode;
  colorHex?: string;
  logros: Achievement[];
  estado: EstadoGuardadoLeccion;
  onReintentar: () => void;
  // Lo propio de cada mundo: modificadores desbloqueados, botones de salida.
  children?: ReactNode;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Festejo al terminar una Técnica o Clase (web; la app tiene el suyo en
// ui/aprender/CelebracionLeccion.tsx). Entra al instante, sin esperar al
// servidor: el sello de «completado» se dibuja (círculo, anillo y tilde),
// después el título y por último las acciones, en cascada corta. Mientras
// se guarda se ve una línea discreta; si falla, se ofrece reintentar.
export default function CelebracionLeccion({ titulo, colorHex, logros, estado, onReintentar, children }: Props) {
  const t = useTranslations("LeccionQuiz");
  const reducir = useReducedMotion();
  const acento = colorHex ?? "var(--primario)";
  const sono = useRef(false);

  useEffect(() => {
    if (sono.current) return;
    sono.current = true;
    reproducirTono("nivel");
  }, []);

  const d = (s: number) => (reducir ? 0 : s);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {!reducir && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${acento}` }}
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          />
        )}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `color-mix(in oklab, ${acento} 16%, transparent)` }}
          initial={{ scale: reducir ? 1 : 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        />
        <svg viewBox="0 0 112 112" className="relative h-28 w-28" role="img" aria-label={t("completada")}>
          <motion.circle
            cx="56"
            cy="56"
            r="44"
            fill="none"
            stroke={acento}
            strokeWidth={5}
            strokeLinecap="round"
            transform="rotate(-90 56 56)"
            initial={{ pathLength: reducir ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: d(0.5), delay: d(0.1), ease: EASE }}
          />
          <motion.path
            d="M38 57l12 12 25-26"
            fill="none"
            stroke={acento}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reducir ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: d(0.35), delay: d(0.5), ease: "easeOut" }}
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reducir ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: d(0.55), ease: EASE }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: acento }}>
          {t("completada")}
        </span>
        <h1 className="font-display text-2xl font-black tracking-tight text-foreground">{titulo}</h1>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {estado === "guardando" && (
          <motion.p
            key="guardando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-texto-secundario"
            aria-live="polite"
          >
            {t("guardando")}
          </motion.p>
        )}
        {estado === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 rounded-xl border border-error/40 bg-error/10 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-error">{t("errorGuardar")}</p>
            <button type="button" onClick={onReintentar} className="text-sm font-semibold text-foreground underline-offset-2 hover:underline">
              {t("reintentar")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <LogroBanner logros={logros} />

      <motion.div
        initial={{ opacity: 0, y: reducir ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: d(0.75), ease: EASE }}
        className="mt-2 flex w-full flex-col gap-3"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
