"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import CinematicaPro from "@/components/fx/CinematicaPro";
import { createClient } from "@/lib/supabase/client";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";
import IconoTrazo from "@/components/IconoTrazo";

type Fase = "activando" | "cinematica" | "lista" | "demora";

const ESPERA_MAX_MS = 90_000;

// Pedido 2026-10-13: «apenas se compre, cargue y diga "ya tienes Pro"; una
// cinemática del logo navegando en el espacio que de la nada recibe poderes y explota
// en un Prodigia Pro; luego vuelve a la app con la lista de las funciones nuevas y
// que el contador está en la sección Pro». El pago lo confirma el webhook de Paddle,
// que tarda unos segundos: mientras tanto se espera mirando profiles.plan.
export default function BienvenidaPro({ userId, yaEraPro }: { userId: string; yaEraPro: boolean }) {
  const t = useTranslations("ProBienvenida");
  const tBen = useTranslations("ProBeneficios");
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

  // 2) La cinemática (components/fx/CinematicaPro) pasa sola a la lista al terminar, o
  // con un toque. Corre aunque el sistema pida reducir movimiento (Windows lo pide con
  // «mejor rendimiento» y nunca se veía): es una sola vez y se salta tocando.

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#03040A] px-4 py-10 text-white">
      <Estrellas />
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

        {fase === "cinematica" && <CinematicaPro key="cinematica" onTerminar={() => setFase("lista")} subtitulo={t("yaTienesPro")} />}

        {fase === "lista" && (
          <motion.div key="lista" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex w-full max-w-xl flex-col gap-5">
            <div className="text-center">
              <p className="bg-gradient-to-r from-[#FFC53D] via-white to-[#5DE4FF] bg-clip-text font-display text-4xl font-black text-transparent">{t("yaTienesPro")}</p>
              <p className="mt-2 text-sm text-white/75">{t("estoEsLoNuevo")}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {BENEFICIOS_PRO.map((b, i) => (
                <motion.li key={b.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <IconoTrazo nombre={b.icono} className="mt-0.5 h-6 w-6 text-[#FFC53D]" />
                  <span>
                    <span className="block font-display font-bold">{tBen(`${b.id}.titulo`)}</span>
                    <span className="block text-sm text-white/70">{tBen(`${b.id}.descripcion`)}</span>
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

// Fondo de estrellas quietas (la cinemática dibuja las suyas en su canvas).
const ESTRELLAS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 100, t: 1 + r(3) * 2, o: 0.3 + r(4) * 0.6 };
});

function Estrellas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {ESTRELLAS.map((e, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.t, height: e.t, opacity: e.o }} />
      ))}
    </div>
  );
}
