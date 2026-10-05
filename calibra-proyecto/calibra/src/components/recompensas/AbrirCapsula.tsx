"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useTranslations } from "next-intl";
import { CAPSULAS, CATALOGO_NUEVO, ciudadDe, COLOR_RAREZA, coloresCapsula, type Rareza } from "@/lib/recompensas/catalogo";
import { abrirCapsula, type Capsula, type PremioCapsula } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import VistaCosmetico from "./VistaCosmetico";

// Abrir una cápsula en la web (igual que AbrirCapsula de la app): cae, la tocas,
// tiembla mientras la base sortea el premio (abrir_capsula, 0249), se abre en dos
// mitades y estallan partículas de sus colores.

export function DibujoCapsula({ colores, abierta = false, tam = 110 }: { colores: [string, string]; abierta?: boolean; tam?: number }) {
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
    </span>
  );
}

function Premio({ p }: { p: PremioCapsula }) {
  const t = useTranslations("Recompensas");
  if (p.premio === "chispas" || p.convertido) {
    return (
      <div className="flex flex-col items-center gap-2">
        {p.convertido && <p className="text-center text-sm text-texto-secundario">{t("capsulas.yaTenias", { nombre: p.nombre ?? "" })}</p>}
        <p className="rounded-full border border-logro/50 bg-logro/10 px-5 py-2 font-mono text-3xl font-bold text-logro">+{p.cantidad} ✦</p>
      </div>
    );
  }
  if (p.premio === "hielo" || p.premio === "tiempo_extra" || p.premio === "escudo") {
    const icono = p.premio === "hielo" ? "🧊" : p.premio === "escudo" ? "🛡️" : "⏱️";
    return <p className="text-5xl">{icono}</p>;
  }
  const it = CATALOGO_NUEVO.find((x) => x.item === p.slug);
  const rareza = (p.rareza ?? "raro") as Rareza;
  const categoria = it?.categoria ?? (p.slug?.startsWith("marco_") ? "marco" : "titulo");
  const valor = it?.valor ?? p.slug?.replace(/^marco_/, "") ?? "";
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 bg-surface-2" style={{ borderColor: COLOR_RAREZA[rareza], boxShadow: `0 0 24px ${COLOR_RAREZA[rareza]}88` }}>
        <VistaCosmetico categoria={categoria} valor={valor} tam={64} />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ color: COLOR_RAREZA[rareza] }}>
        {t(`tienda.rareza.${rareza}`).toUpperCase()}
      </span>
      <p className="font-display text-2xl font-bold text-foreground">{p.nombre}</p>
      <p className="text-sm text-texto-secundario">{t("capsulas.esTuyo")}</p>
    </div>
  );
}

export default function AbrirCapsula({ capsula, onCerrar, onChispas }: { capsula: Capsula; onCerrar: () => void; onChispas?: (total: number) => void }) {
  const t = useTranslations("Recompensas.capsulas");
  const colores = coloresCapsula(capsula.tipo, capsula.mundo);
  const [fase, setFase] = useState<"espera" | "abre" | "premio">("espera");
  const [premio, setPremio] = useState<PremioCapsula | null>(null);
  const [error, setError] = useState(false);
  const controles = useAnimationControls();
  const ciudad = ciudadDe(capsula.mundo);

  useEffect(() => {
    controles.start({ y: 0, transition: { type: "spring", damping: 9, stiffness: 120 } });
  }, [controles]);

  async function abrir() {
    if (fase !== "espera") return;
    setFase("abre");
    reproducirTono("cuenta");
    controles.start({ x: [0, -7, 7, -7, 7, -5, 5, 0], transition: { duration: 0.5, repeat: Infinity } });
    try {
      const [r] = await Promise.all([abrirCapsula(createClient(), capsula.id), new Promise((res) => setTimeout(res, 500))]);
      controles.stop();
      controles.set({ x: 0 });
      setPremio(r);
      onChispas?.(r.puntos_total);
      reproducirTono("nivel_cuenta");
      setTimeout(() => setFase("premio"), 450);
      refrescarCosmeticosWeb();
    } catch {
      controles.stop();
      setError(true);
      setFase("premio");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6" role="dialog" aria-modal="true" aria-label={CAPSULAS[capsula.tipo]?.nombre}>
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        {fase !== "premio" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colores[1] }}>
              {ciudad ? `${CAPSULAS[capsula.tipo]?.nombre} · ${ciudad.nombre}` : CAPSULAS[capsula.tipo]?.nombre}
            </p>
            <p className="font-display text-2xl font-bold text-white">{fase === "abre" ? t("abriendo") : t("tocaParaAbrir")}</p>
          </div>
        )}
        <div className="relative flex h-60 w-64 items-center justify-center">
          <AnimatePresence>
            {premio && (
              <motion.span key="brillo" className="absolute h-40 w-40 rounded-full" style={{ background: colores[1] }} initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.9 }} />
            )}
          </AnimatePresence>
          {premio &&
            Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute h-2 w-2 rounded-sm"
                  style={{ background: i % 2 ? colores[0] : colores[1] }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(a) * (90 + (i % 3) * 30), y: Math.sin(a) * (90 + (i % 3) * 30), opacity: 0, rotate: 200 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          {fase !== "premio" && (
            <motion.button type="button" onClick={abrir} disabled={fase !== "espera"} initial={{ y: -400 }} animate={controles} className="cursor-pointer" aria-label={t("abrir")}>
              <motion.span className="block" animate={fase === "espera" ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={{ duration: 1.3, repeat: Infinity }}>
                <DibujoCapsula colores={colores} abierta={!!premio} />
              </motion.span>
            </motion.button>
          )}
          {fase === "premio" && (
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 10 }}>
              {error || !premio ? <p className="text-white">{t("error")}</p> : <Premio p={premio} />}
            </motion.div>
          )}
        </div>
        {fase === "premio" && (
          <button type="button" onClick={onCerrar} className="w-full rounded-full bg-logro px-6 py-3 font-display font-bold text-[#2A1A00]">
            {t("genial")}
          </button>
        )}
      </div>
    </div>
  );
}
