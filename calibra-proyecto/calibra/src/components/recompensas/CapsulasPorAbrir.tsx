"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { coloresCapsula, type TipoCapsula } from "@/lib/recompensas/catalogo";
import type { Capsula } from "@/lib/recompensas/api";
import { agruparCapsulas, COLOR_RANGO, FUSION, fusionarCapsulas, fusionesPosibles, mensajeErrorFusion, rangoCapsula, type FusionPosible } from "@/lib/recompensas/fusion";
import { DibujoCapsula } from "./AbrirCapsula";
import EtiquetaNuevo from "@/components/EtiquetaNuevo";
import { esNuevo } from "@/lib/recompensas/novedades";
import { marcarNuevoVisto, useNuevoVisto } from "@/lib/recompensas/novedadesWeb";

// Cápsulas por abrir (rehecho 2026-10-18, «mejora el apartado de las cápsulas»): juntas
// por tipo con su contador, el rango de cada una (Bronce, Plata, Oro, Prisma o
// Especial) y, arriba, las fusiones que se pueden hacer ahora (0290).
export default function CapsulasPorAbrir({
  capsulas,
  detalle,
  onAbrir,
  onVer,
  onCambio,
}: {
  capsulas: Capsula[];
  detalle: (c: Capsula) => string;
  onAbrir: (c: Capsula) => void;
  onVer: (c: Capsula) => void;
  onCambio: (puntosTotal?: number) => void;
}) {
  const t = useTranslations("Recompensas.capsulas");
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fusionada, setFusionada] = useState<{ capsula: Capsula; de: TipoCapsula[] } | null>(null);
  const [verComo, setVerComo] = useState(false);
  const vistos = useNuevoVisto();
  const grupos = agruparCapsulas(capsulas);
  const fusiones = fusionesPosibles(capsulas);

  async function fusionar(f: FusionPosible) {
    setOcupado(true);
    setError(null);
    try {
      const de = f.ids.map((id) => capsulas.find((c) => c.id === id)?.tipo ?? "diaria");
      const r = await fusionarCapsulas(createClient(), f.ids);
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: r.puntos_total }));
      reproducirTono("logro");
      setFusionada({ capsula: { id: r.id, tipo: r.tipo, mundo: null, detalle: null, creada_at: new Date().toISOString() }, de });
      setConfirmando(null);
      onCambio(r.puntos_total);
    } catch (e) {
      setError(mensajeErrorFusion(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">{t("titulo")}</h2>
        <span className="font-mono text-xs font-bold text-texto-secundario">{t("porAbrir", { n: capsulas.length })}</span>
      </div>

      {/* Fusiones disponibles */}
      {fusiones.map((f) => {
        const destino = t(`nombres.${f.destino}`);
        const color = COLOR_RANGO[rangoCapsula(f.destino)];
        return (
          <motion.div
            key={f.nivel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border-2 bg-[#0B1022] p-4 text-white"
            style={{ borderColor: `${color}99`, boxShadow: `0 0 0 1px ${color}22, 0 10px 30px -18px ${color}` }}
          >
            <span className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(120% 90% at 85% 50%, ${color}26, transparent 60%)` }} />
            {esNuevo("fusion", vistos) && <EtiquetaNuevo className="absolute right-3 top-2" />}
            <div className="relative flex items-center">
              {f.ids.map((id, i) => {
                const c = capsulas.find((x) => x.id === id);
                return (
                  <span key={id} className="-ml-3 first:ml-0" style={{ zIndex: 3 - i }}>
                    <DibujoCapsula colores={coloresCapsula(c?.tipo ?? "diaria", c?.mundo)} tam={30} />
                  </span>
                );
              })}
              <svg viewBox="0 0 24 24" className="mx-2 h-5 w-5" aria-hidden="true">
                <path d="M4 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <DibujoCapsula colores={coloresCapsula(f.destino)} tam={42} />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="font-display text-base font-bold">{t("fusion.texto", { nivel: t(`rango.${rangoCapsula(capsulas.find((x) => x.id === f.ids[0])?.tipo ?? "diaria")}`), destino })}</p>
              <p className="text-xs text-white/60">
                {t("fusion.tienes", { n: f.cuantas })} ·{" "}
                <button type="button" onClick={() => setVerComo((v) => !v)} className="font-semibold text-white/80 underline-offset-2 hover:underline">
                  {t("fusion.comoFunciona")}
                </button>
              </p>
            </div>
            <div className="relative flex gap-2">
              {confirmando === f.nivel ? (
                <>
                  <button type="button" onClick={() => setConfirmando(null)} disabled={ocupado} className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white/80">
                    {t("fusion.cancelar")}
                  </button>
                  <button
                    type="button"
                    onClick={() => fusionar(f)}
                    disabled={ocupado}
                    className="rounded-xl border-2 border-[#05060F] px-4 py-2 font-display text-sm font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60"
                    style={{ background: "linear-gradient(180deg,#FFD36B,#FFB627)" }}
                  >
                    {t("fusion.confirmar", { n: f.costo })}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmando(f.nivel);
                    marcarNuevoVisto("fusion");
                  }}
                  className="rounded-xl border-2 border-[#05060F] bg-white px-4 py-2 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F] transition-transform hover:-translate-y-0.5"
                >
                  {t("fusion.boton", { n: FUSION[f.nivel].costo })}
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
      {verComo && <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-texto-secundario">{t("fusion.como")}</p>}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}

      {/* Las cápsulas, juntas por tipo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {grupos.map((g, i) => {
          const primera = g.capsulas[0];
          const rango = rangoCapsula(g.tipo);
          const color = COLOR_RANGO[rango];
          const colores = coloresCapsula(g.tipo, g.mundo);
          return (
            <motion.div
              key={g.clave}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border bg-surface px-3 pb-3 pt-4"
              style={{ borderColor: `${colores[0]}66` }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70" style={{ background: `radial-gradient(70% 100% at 50% 0%, ${colores[0]}33, transparent 70%)` }} />
              <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color, background: `${color}1f`, border: `1px solid ${color}55` }}>
                {t(`rango.${rango}`)}
              </span>
              {g.tipo === "alineacion" && esNuevo("capsula_alineacion", vistos) && <EtiquetaNuevo className="absolute bottom-24 right-2" />}
              {g.capsulas.length > 1 && (
                <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 font-display text-xs font-black text-[#05060F] shadow-[2px_2px_0_0_#05060F]">×{g.capsulas.length}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (g.tipo === "alineacion") marcarNuevoVisto("capsula_alineacion");
                  onAbrir(primera);
                }}
                className="relative transition-transform duration-200 group-hover:-translate-y-1"
              >
                <DibujoCapsula colores={colores} tam={58} />
              </button>
              <span className="relative text-center text-sm font-bold leading-tight text-foreground">{t(`nombres.${g.tipo}`)}</span>
              <span className="relative line-clamp-1 text-center text-[11px] text-texto-secundario">{detalle(primera)}</span>
              <div className="relative mt-1 flex w-full flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onAbrir(primera)}
                  className="w-full rounded-xl border-2 border-[#05060F] py-1.5 font-display text-sm font-bold text-[#05060F] shadow-[2px_2px_0_0_#05060F] transition-transform hover:-translate-y-0.5"
                  style={{ background: colores[1] }}
                >
                  {t("abrir")}
                </button>
                <button type="button" onClick={() => onVer(primera)} className="text-xs font-semibold text-primario hover:underline">
                  {t("queSale")}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Animación de la fusión: las 3 se juntan, destello, y sale la nueva. */}
      <AnimatePresence>
        {fusionada && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05060F]/85 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative flex w-full max-w-sm flex-col items-center gap-5 text-center text-white">
              <div className="relative flex h-48 w-full items-center justify-center">
                {fusionada.de.map((tipo, i) => (
                  <motion.span
                    key={i}
                    className="absolute"
                    initial={{ x: (i - 1) * 110, y: i === 1 ? -20 : 10, opacity: 1, scale: 1 }}
                    animate={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: (i - 1) * 40 }}
                    transition={{ duration: 0.75, ease: [0.6, 0, 0.4, 1] }}
                  >
                    <DibujoCapsula colores={coloresCapsula(tipo)} tam={56} />
                  </motion.span>
                ))}
                <motion.span
                  className="absolute h-40 w-40 rounded-full"
                  style={{ background: `radial-gradient(circle, ${COLOR_RANGO[rangoCapsula(fusionada.capsula.tipo)]}cc, transparent 65%)` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.6, 1], opacity: [0, 0.9, 0.35] }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
                <motion.span className="absolute" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.8, type: "spring", damping: 9, stiffness: 160 }}>
                  <DibujoCapsula colores={coloresCapsula(fusionada.capsula.tipo)} tam={110} />
                </motion.span>
              </div>
              <motion.p className="font-display text-2xl font-black" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
                {t("fusion.lista", { destino: t(`nombres.${fusionada.capsula.tipo}`) })}
              </motion.p>
              <motion.div className="flex w-full gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                <button type="button" onClick={() => setFusionada(null)} className="flex-1 rounded-xl border border-white/25 py-2.5 font-semibold text-white/85">
                  {t("fusion.guardar")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const c = fusionada.capsula;
                    setFusionada(null);
                    onAbrir(c);
                  }}
                  className="flex-1 rounded-xl border-2 border-[#05060F] py-2.5 font-display font-bold text-[#1A1206] shadow-[3px_3px_0_0_#05060F]"
                  style={{ background: "linear-gradient(180deg,#FFD36B,#FFB627)" }}
                >
                  {t("fusion.abrirAhora")}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
