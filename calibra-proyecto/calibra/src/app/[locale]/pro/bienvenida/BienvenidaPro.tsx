"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import GestoLogo from "@/components/GestoLogo";
import { createClient } from "@/lib/supabase/client";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import { reproducirTono } from "@/lib/sonido";

type Fase = "activando" | "cinematica" | "lista" | "demora";

const ESPERA_MAX_MS = 90_000;
const DURACION_CINEMATICA_MS = 5200;

// Pedido 2026-10-13: «apenas se compre, cargue y diga "ya tienes Pro"; una
// cinemática del logo navegando en el espacio que de la nada recibe poderes y explota
// en un Prodigia Pro; luego vuelve a la app con la lista de las funciones nuevas y
// que el contador está en la sección Pro». El pago lo confirma el webhook de Paddle,
// que tarda unos segundos: mientras tanto se espera mirando profiles.plan.
export default function BienvenidaPro({ userId, yaEraPro }: { userId: string; yaEraPro: boolean }) {
  const t = useTranslations("ProBienvenida");
  const reducirMovimiento = useReducedMotion();
  const [fase, setFase] = useState<Fase>(yaEraPro ? "cinematica" : "activando");
  // Cuándo empezó a esperar; se fija dentro del efecto (no en el render).
  const inicio = useRef<number | null>(null);

  // 1) Esperar a que el webhook active Pro.
  useEffect(() => {
    if (fase !== "activando") return;
    const sb = createClient();
    inicio.current = Date.now();
    const id = setInterval(async () => {
      const { data } = await sb.from("profiles").select("plan").eq("id", userId).maybeSingle();
      if ((data as { plan?: string } | null)?.plan === "pro") {
        clearInterval(id);
        setFase("cinematica");
      } else if (Date.now() - (inicio.current ?? Date.now()) > ESPERA_MAX_MS) {
        clearInterval(id);
        setFase("demora");
      }
    }, 2000);
    return () => clearInterval(id);
  }, [fase, userId]);

  // 2) La cinemática dura unos segundos y pasa sola a la lista.
  useEffect(() => {
    if (fase !== "cinematica") return;
    reproducirTono("nivel_cuenta");
    const id = setTimeout(() => setFase("lista"), reducirMovimiento ? 600 : DURACION_CINEMATICA_MS);
    return () => clearTimeout(id);
  }, [fase, reducirMovimiento]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#03040A] px-4 py-10 text-white">
      <Estrellas veloces={fase === "cinematica"} />
      <AnimatePresence mode="wait">
        {fase === "activando" && (
          <motion.div key="activando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center gap-5 text-center">
            <motion.div className="h-16 w-16 rounded-full border-4 border-[#7C5CFF]/25 border-t-[#5DE4FF]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} aria-hidden="true" />
            <p className="font-display text-2xl font-bold">{t("activando")}</p>
            <p className="max-w-sm text-sm text-white/70">{t("activandoNota")}</p>
          </motion.div>
        )}

        {fase === "demora" && (
          <motion.div key="demora" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex max-w-md flex-col items-center gap-4 text-center">
            <p className="font-display text-2xl font-bold">{t("demoraTitulo")}</p>
            <p className="text-sm text-white/75">{t("demoraTexto")}</p>
            <button type="button" onClick={() => setFase("activando")} className="rounded-full bg-[#5DE4FF] px-6 py-3 font-display font-bold text-[#06202A]">
              {t("reintentar")}
            </button>
          </motion.div>
        )}

        {fase === "cinematica" && (
          <motion.div key="cinematica" className="relative z-10 flex h-[60vh] w-full max-w-3xl items-center justify-center" exit={{ opacity: 0 }}>
            {/* El logo cruza el espacio… */}
            <motion.div
              initial={{ x: "-55vw", y: 60, rotate: -20, scale: 0.5 }}
              animate={{ x: 0, y: 0, rotate: 0, scale: [0.5, 0.8, 1, 1.15, 0] }}
              transition={{ duration: 3.6, times: [0, 0.4, 0.62, 0.86, 1], ease: "easeOut" }}
              className="relative"
            >
              {/* …recibe poderes: anillos de energía que se cierran sobre él… */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 rounded-full border-2"
                  style={{ borderColor: i === 1 ? "#5DE4FF" : "#FFC53D", width: 260, height: 260, marginLeft: -130, marginTop: -130 }}
                  initial={{ scale: 2.4, opacity: 0 }}
                  animate={{ scale: [2.4, 0.4], opacity: [0, 1, 0] }}
                  transition={{ delay: 1.5 + i * 0.35, duration: 0.9, ease: "easeIn" }}
                />
              ))}
              <motion.div animate={{ filter: ["drop-shadow(0 0 0px #FFC53D)", "drop-shadow(0 0 28px #FFC53D)", "drop-shadow(0 0 60px #5DE4FF)"] }} transition={{ delay: 1.4, duration: 2 }}>
                <GestoLogo size={150} colorHex="#A794FF" />
              </motion.div>
            </motion.div>
            {/* …y explota en «Prodigia Pro». */}
            <motion.div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, #FFFFFF 0%, #FFC53D 25%, #7C5CFF 55%, transparent 70%)" }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 3], opacity: [0, 1, 0] }} transition={{ delay: 3.4, duration: 0.9, ease: "easeOut" }} />
            <motion.p
              className="absolute bg-gradient-to-r from-[#FFC53D] via-white to-[#5DE4FF] bg-clip-text text-center font-display text-5xl font-black tracking-tight text-transparent sm:text-7xl"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.12, 1], opacity: 1 }}
              transition={{ delay: 3.7, duration: 0.8, ease: "backOut" }}
            >
              PRODIGIA PRO
            </motion.p>
          </motion.div>
        )}

        {fase === "lista" && (
          <motion.div key="lista" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex w-full max-w-xl flex-col gap-5">
            <div className="text-center">
              <p className="bg-gradient-to-r from-[#FFC53D] via-white to-[#5DE4FF] bg-clip-text font-display text-4xl font-black text-transparent">{t("yaTienesPro")}</p>
              <p className="mt-2 text-sm text-white/75">{t("estoEsLoNuevo")}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {BENEFICIOS_PRO.map((b, i) => (
                <motion.li key={b.titulo} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-2xl" aria-hidden="true">{b.emoji}</span>
                  <span>
                    <span className="block font-display font-bold">{b.titulo}</span>
                    <span className="block text-sm text-white/70">{b.descripcion}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
            <p className="rounded-2xl border border-[#5DE4FF]/40 bg-[#5DE4FF]/10 px-4 py-3 text-sm">{t("contador")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="flex-1 rounded-full bg-[#7C5CFF] px-6 py-3 text-center font-display font-bold text-white">
                {t("volver")}
              </Link>
              <Link href="/pro" className="flex-1 rounded-full border border-white/25 px-6 py-3 text-center font-display font-bold text-white">
                {t("verPro")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fondo de estrellas: quietas mientras espera; en la cinemática pasan como rayas,
// como si el logo viajara.
const ESTRELLAS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 100, t: 1 + r(3) * 2, o: 0.3 + r(4) * 0.6 };
});

function Estrellas({ veloces }: { veloces: boolean }) {
  const estrellas = ESTRELLAS;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {estrellas.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${e.x}%`, top: `${e.y}%`, height: e.t, opacity: e.o }}
          animate={veloces ? { width: [e.t, 90, e.t], x: [0, -260] } : { width: e.t, x: 0 }}
          transition={veloces ? { duration: 0.9 + (i % 5) * 0.15, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}
