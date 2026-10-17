"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import IlustracionPaquete from "@/components/tienda/IlustracionPaquete";
import { ILUSTRACION_ANUNCIO, type TipoAnuncio } from "@/lib/anuncios/ilustraciones";

interface Anuncio {
  id: string;
  tipo: TipoAnuncio;
  titulo: string;
  descripcion: string;
  fecha: string;
}

const ACENTO: Record<TipoAnuncio, string> = { actualizacion: "#9B85FF", arreglo: "#3DDC97", evento: "#FFC53D" };

function formatearFecha(iso: string, locale: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(locale === "en" ? "en-US" : "es", { day: "numeric", month: "long" });
}

// Novedades (Fase 12, rediseño 2026-10-16). Vive una vez en el layout raíz. La base
// solo manda lo publicado desde que se creó la cuenta, como mucho 3 de las últimas 3
// semanas (0288): antes una cuenta nueva recibía los ~12 anuncios de la historia.
// Una sola tarjeta con las novedades para pasar de una a otra y un «Entendido» que las
// marca todas como leídas.
export default function AnunciosModal() {
  const t = useTranslations("Common.anuncios");
  const locale = useLocale();
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!activo || !user || user.is_anonymous) return;
      const { data } = await supabase.rpc("anuncios_pendientes");
      if (activo && data) setAnuncios(data as Anuncio[]);
    });
    return () => {
      activo = false;
    };
  }, []);

  if (cerrado || !anuncios || anuncios.length === 0) return null;
  const actual = anuncios[Math.min(indice, anuncios.length - 1)];
  const acento = ACENTO[actual.tipo] ?? ACENTO.actualizacion;
  const ultimo = indice >= anuncios.length - 1;

  async function cerrar() {
    setCerrado(true);
    const supabase = createClient();
    await Promise.all((anuncios ?? []).map((a) => supabase.rpc("marcar_anuncio_leido", { p_anuncio_id: a.id })));
  }

  return (
    <AnimatePresence>
      <motion.div key="fondo-anuncio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#03040A]/75 px-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-[#05060F] bg-[#0B1022] text-white shadow-[6px_6px_0_0_#05060F]"
          role="dialog"
          aria-modal="true"
          aria-label={t("titulo")}
        >
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">{t("titulo")}</span>
            {anuncios.length > 1 && (
              <span className="font-mono text-[11px] font-bold text-white/50">
                {indice + 1}/{anuncios.length}
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={actual.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="flex flex-col items-center px-6 pb-2 pt-4 text-center">
              <div className="relative">
                <span className="absolute inset-0 rounded-3xl blur-2xl" style={{ background: `${acento}55` }} aria-hidden="true" />
                <IlustracionPaquete ilustracion={ILUSTRACION_ANUNCIO[actual.tipo] ?? ILUSTRACION_ANUNCIO.actualizacion} className="relative h-24 w-24" />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: acento }}>
                {t(`tipos.${actual.tipo}`)} · {formatearFecha(actual.fecha, locale)}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold leading-tight">{actual.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{actual.descripcion}</p>
            </motion.div>
          </AnimatePresence>

          {anuncios.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-1 pt-3" aria-hidden="true">
              {anuncios.map((a, i) => (
                <button key={a.id} type="button" onClick={() => setIndice(i)} className="h-2 rounded-full transition-all" style={{ width: i === indice ? 22 : 8, background: i === indice ? acento : "rgba(255,255,255,0.25)" }} tabIndex={-1} />
              ))}
            </div>
          )}

          <div className="flex gap-2 p-5">
            {!ultimo && (
              <button type="button" onClick={() => setIndice((i) => i + 1)} className="flex-1 rounded-xl border-2 border-white/25 px-4 py-2.5 font-display text-sm font-bold text-white transition-colors hover:border-white/50">
                {t("siguiente")}
              </button>
            )}
            <button
              type="button"
              onClick={cerrar}
              className="flex-1 rounded-xl border-2 border-[#05060F] px-4 py-2.5 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#05060F]"
              style={{ background: acento }}
            >
              {t("entendido")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
