"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import CountUp from "@/components/CountUp";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";
import { reproducirTono } from "@/lib/sonido";

export interface NivelCuentaInfo {
  subio: boolean;
  nivel: number;
  bonus: number;
}

interface Props {
  nivelCuenta?: NivelCuentaInfo | null;
}

const PARTICULAS = 28;

// "Cápsula de chispas" — la celebración de subir de nivel DE CUENTA
// (pedido en vivo, 2026-09-15). Ya había un spec completo de esto de
// una sesión anterior (docs/audits/LEVEL-UP-ANIMACION-2026-09-08.md):
// el enganche real (profiles.nivel_cuenta) nunca se exponía en las
// rutas de finish — ver 0156_nivel_cuenta_subio_expuesto.sql. Mismo
// storyboard que ahí (carga → estalla → recompensa), pero el símbolo
// central es una cápsula propia (dos mitades en degradé que se abren)
// en vez de reusar GestoLogo tal cual — mismo lenguaje visual de marca
// (el degradé violeta→dorado de GestoLogo/ChispaClick), pedido explícito
// de "no un emoji, un diseño real". Partículas con motion (no canvas,
// como PuntajeCorner.tsx) — es un evento único en pantalla, no una
// lista, así que no hace falta el motor de canvas del spec original.
export default function NivelCuentaSubio({ nivelCuenta }: Props) {
  const t = useTranslations("Componentes.nivelCuentaSubio");
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  const [visible, setVisible] = useState(false);
  const [fase, setFase] = useState<"charging" | "burst" | "reward">("charging");

  useEffect(() => {
    if (!nivelCuenta?.subio) return;
    // setTimeout (no setState directo en el cuerpo del efecto) — mismo
    // criterio que RecordatorioInvitado.tsx, react-hooks/set-state-in-effect.
    const t0 = setTimeout(() => {
      setVisible(true);
      setFase("charging");
      reproducirTono("nivel_cuenta");
    }, 0);
    const t1 = setTimeout(() => setFase("burst"), 550);
    const t2 = setTimeout(() => setFase("reward"), 780);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // Un solo disparo por objeto nivelCuenta nuevo — el padre no debería
    // reusar la misma referencia entre dos partidas distintas.
  }, [nivelCuenta]);

  if (!nivelCuenta?.subio || !visible) return null;

  function cerrar() {
    setVisible(false);
  }

  const estallo = fase === "burst" || fase === "reward";
  const mostrarPremio = fase === "reward";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alertdialog"
          aria-label={t("aria", { nivel: nivelCuenta.nivel, bonus: nivelCuenta.bonus })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={cerrar}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: "backOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-[88vw] max-w-sm flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-2xl"
          >
            <div className="relative flex h-36 w-36 items-center justify-center">
              {efectos ? (
                <CapsulaChispas fase={fase} />
              ) : (
                // prefers-reduced-motion / efectos apagados: la info
                // sigue, solo se pierde lo decorativo (mismo criterio
                // que PuntajeCorner.tsx).
                <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #A794FF, #FFC53D)" }} />
              )}
              {efectos && estallo && <ParticulasBurst />}
            </div>

            <AnimatePresence>
              {mostrarPremio && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "backOut" }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="font-display text-3xl font-black tracking-tight text-foreground">
                    {t("titulo", { nivel: nivelCuenta.nivel })}
                  </p>
                  <p className="font-mono text-2xl font-bold text-primario">
                    +<CountUp value={nivelCuenta.bonus} /> {t("chispas")}
                  </p>
                  <p className="text-sm text-texto-secundario">{t("subtitulo", { siguiente: nivelCuenta.nivel + 1 })}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={cerrar}
              className="mt-2 w-full rounded-xl bg-primario px-5 py-3 font-display font-semibold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--primario)_55%,transparent)] transition-opacity hover:opacity-90"
            >
              {t("continuar")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Las 2 mitades de la cápsula (degradé de marca, #A794FF→#FFC53D, mismo
// que GestoLogo.tsx/ChispaClick.tsx) — en "charging" pulsan juntas
// acumulando luz, en "burst" se separan de golpe revelando el brillo
// del centro.
function CapsulaChispas({ fase }: { fase: "charging" | "burst" | "reward" }) {
  const abierta = fase === "burst" || fase === "reward";
  return (
    <motion.svg
      width={120}
      height={120}
      viewBox="0 0 100 140"
      className="pointer-events-none"
      aria-hidden="true"
      animate={fase === "charging" ? { scale: [1, 1.08, 1.16, 1.08] } : { scale: 1 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="capsula-grad-top" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#A794FF" />
        </linearGradient>
        <linearGradient id="capsula-grad-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC53D" />
          <stop offset="100%" stopColor="#E4CBA0" />
        </linearGradient>
        <radialGradient id="capsula-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6DE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFC53D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.circle
        cx="50"
        cy="70"
        r="10"
        fill="url(#capsula-glow)"
        animate={
          fase === "charging"
            ? { r: [8, 14, 10], opacity: [0.5, 0.9, 0.6] }
            : fase === "burst"
              ? { r: [10, 55], opacity: [0.9, 0] }
              : { r: 0, opacity: 0 }
        }
        transition={{ duration: fase === "burst" ? 0.4 : 0.55, ease: "easeOut" }}
      />

      <motion.path
        d="M20 70 V50 A30 30 0 0 1 80 50 V70 Z"
        fill="url(#capsula-grad-top)"
        animate={abierta ? { y: -34, rotate: -18, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ transformOrigin: "50px 70px" }}
      />
      <motion.path
        d="M20 70 V90 A30 30 0 0 0 80 90 V70 Z"
        fill="url(#capsula-grad-bottom)"
        animate={abierta ? { y: 34, rotate: 18, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ transformOrigin: "50px 70px" }}
      />
    </motion.svg>
  );
}

// Estrellas de 4 puntas (mismo look que las "chispas" del resto de la
// app) volando en radial desde el centro — mismo patrón de motion.span
// radial que PuntajeCorner.tsx, escalado a un evento grande.
function ParticulasBurst() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: PARTICULAS }).map((_, i) => {
        const angulo = (i / PARTICULAS) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : -0.15);
        const distancia = 55 + (i % 3) * 20;
        const dorado = i % 2 === 0;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.6, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: Math.cos(angulo) * distancia,
              y: Math.sin(angulo) * distancia,
              scale: [0.6, 1, 0.3],
              rotate: dorado ? 90 : -90,
            }}
            transition={{ duration: 0.7, ease: "easeOut", delay: (i % 4) * 0.02 }}
            className="absolute -ml-1 -mt-1 h-2 w-2"
            style={{
              background: dorado ? "#FFC53D" : "#A794FF",
              clipPath: "polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)",
            }}
          />
        );
      })}
    </div>
  );
}
