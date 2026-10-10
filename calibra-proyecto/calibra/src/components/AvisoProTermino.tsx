"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

// «Tu Prodigia Pro terminó» (0276), igual que AvisoProTermino de la app. Mismo
// auto-montaje que AnunciosModal: revisar_mi_pro apaga Pro si venció y dice si
// falta mostrar el aviso; «Renovar» o «Ahora no» lo marcan como visto.
export default function AvisoProTermino() {
  const t = useTranslations("Common.proTermino");
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let activo = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!activo || !user || user.is_anonymous) return;
      const { data } = await supabase.rpc("revisar_mi_pro");
      const fila = (data as { aviso: boolean }[] | null)?.[0];
      if (activo && fila?.aviso) setVisible(true);
    });
    return () => {
      activo = false;
    };
  }, []);

  function cerrar(renovar: boolean) {
    setVisible(false);
    void createClient().rpc("marcar_aviso_pro_visto");
    if (renovar) router.push("/pro");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="aviso-pro-termino"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[70] w-full max-w-sm rounded-3xl border border-logro/40 bg-surface px-6 py-7 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-logro/15 text-3xl">✦</div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-logro">Prodigia Pro</p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">{t("titulo")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-texto-secundario">{t("texto")}</p>
            <ul className="mt-3 flex flex-col gap-1 rounded-xl bg-logro/10 px-4 py-3 text-left text-sm text-texto-secundario">
              {(["mundos", "clases", "estadisticas", "anuncios"] as const).map((k) => (
                <li key={k}>· {t(`lista.${k}`)}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-texto-secundario">{t("seQueda")}</p>
            <button
              type="button"
              onClick={() => cerrar(true)}
              className="mt-5 w-full rounded-xl bg-logro px-4 py-2.5 text-sm font-semibold text-[#2A1A00] transition-opacity hover:opacity-90"
            >
              {t("renovar")}
            </button>
            <button type="button" onClick={() => cerrar(false)} className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-texto-secundario hover:text-foreground">
              {t("ahoraNo")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
