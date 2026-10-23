"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import InsigniaRango from "@/components/InsigniaRango";
import { createClient } from "@/lib/supabase/client";
import { aplicarMiReinicioTemporada, capsulasAgrupadas, cargarUmbralProdigio, nombreRango, reclamarTemporadaRanked, recompensaTemporadaPendiente, tierTemporada, type RecompensaTemporada } from "@/lib/rankeds/temporadas";
import { rangoDeSlug } from "@/types/database";

// Fin de temporada de rankeds (0296), igual que la app: al terminar una temporada
// (en cada Gran Alineación) sale este anuncio con el rango que alcanzaste, su tier
// (v1, v2, v3… según cuántas temporadas llegaste a él), el título desde Oro y las
// cápsulas. «Reclamar» las entrega. También fija el corte de Prodigio (top 100).
export default function AnuncioTemporada() {
  const t = useTranslations("Rankeds.temporada");
  const [recompensa, setRecompensa] = useState<RecompensaTemporada | null>(null);
  const [reclamando, setReclamando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();
    void cargarUmbralProdigio(supabase);
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!activo || !user || user.is_anonymous) return;
      await aplicarMiReinicioTemporada(supabase).catch(() => undefined);
      const r = await recompensaTemporadaPendiente(supabase);
      if (activo) setRecompensa(r);
    });
    return () => {
      activo = false;
    };
  }, []);

  async function reclamar() {
    if (!recompensa) return;
    setReclamando(true);
    setError(false);
    try {
      const supabase = createClient();
      await reclamarTemporadaRanked(supabase, recompensa.temporada);
      // Si quedó otra temporada sin reclamar (estuviste afuera varias), sale después.
      setRecompensa(await recompensaTemporadaPendiente(supabase));
    } catch {
      setError(true);
    } finally {
      setReclamando(false);
    }
  }

  const rango = recompensa ? rangoDeSlug(recompensa.rango) : undefined;
  const colorRango = rango?.colorHex ?? "#FFC53D";

  return (
    <AnimatePresence>
      {recompensa && (
        <motion.div
          key={`temporada-${recompensa.temporada}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[70] w-full max-w-sm overflow-hidden rounded-3xl border-2 bg-surface px-6 py-7 text-center shadow-2xl"
            style={{ borderColor: colorRango }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30" style={{ background: `radial-gradient(circle at 50% 0%, ${colorRango}, transparent 70%)` }} />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colorRango }}>
              {t("fin", { numero: recompensa.temporada })}
            </p>
            <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10, stiffness: 140, delay: 0.15 }} className="relative mx-auto mt-4 w-fit">
              <InsigniaRango elo={recompensa.elo_max} slug={recompensa.rango} className="h-28 w-28" />
              <span className="absolute -bottom-1 -right-3 rounded-full border-2 border-[#05060F] px-2 py-0.5 font-mono text-sm font-black text-[#05060F]" style={{ background: colorRango }}>
                {tierTemporada(recompensa.veces)}
              </span>
            </motion.div>
            <h2 className="relative mt-4 font-display text-2xl font-black text-foreground">{t("llegaste", { rango: nombreRango(recompensa.rango) })}</h2>
            <p className="relative mt-1 text-sm text-texto-secundario">
              {recompensa.veces > 1 ? t("veces", { veces: recompensa.veces }) : t("primeraVez")} · {t("eloMax", { elo: recompensa.elo_max })}
            </p>
            <ul className="relative mt-4 flex flex-col gap-1.5 rounded-xl bg-foreground/[0.05] px-4 py-3 text-left text-sm">
              {capsulasAgrupadas(recompensa.capsulas).map((c) => (
                <li key={c.tipo} className="flex justify-between gap-3">
                  <span>{c.nombre}</span>
                  <span className="font-mono font-bold">×{c.cantidad}</span>
                </li>
              ))}
              {recompensa.titulo && (
                <li className="flex justify-between gap-3">
                  <span>{t("titulo")}</span>
                  <span className="font-bold" style={{ color: colorRango }}>
                    {recompensa.titulo}
                  </span>
                </li>
              )}
            </ul>
            {error && <p className="relative mt-3 text-sm text-red-400">{t("error")}</p>}
            <button
              type="button"
              disabled={reclamando}
              onClick={() => void reclamar()}
              className="relative mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-[#05060F] transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: colorRango }}
            >
              {reclamando ? t("reclamando") : t("reclamar")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
