"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import ConvertirCuenta from "@/components/ConvertirCuenta";

const CLAVE_SESSION = "prodigia-recordatorio-invitado-mostrado";

// Pedido explícito del propietario (2026-09-14): "es importante
// recordarle [al invitado] que esta como invitado de manera
// insistente... es excesivamente importante que se metan". Dos capas,
// ninguna dismisseable para siempre:
//   1) una franja fija en el Header, en TODAS las páginas mientras
//      sigas siendo invitado — nunca desaparece sola.
//   2) un modal que se auto-abre una vez por sesión de navegador
//      (sessionStorage, no localStorage — vuelve a insistir la
//      próxima vez que abras la pestaña/app) con el formulario de
//      ConvertirCuenta.tsx ya adentro, cero fricción de navegación.
// Nunca bloquea la app (siempre se puede cerrar el modal y seguir
// jugando) — insistente, no un muro.
export default function RecordatorioInvitado() {
  const t = useTranslations("Common.recordatorioInvitado");
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE_SESSION)) return;
      sessionStorage.setItem(CLAVE_SESSION, "1");
    } catch {
      // sessionStorage no disponible (privado/bloqueado) — igual se
      // muestra esta vez, simplemente puede volver a insistir seguido.
    }
    // setTimeout, no un setState síncrono en el cuerpo del efecto: además
    // de lo que pide la regla de lint, da un respiro de medio segundo
    // antes de tapar la pantalla en vez de saltar en la cara apenas pinta.
    const id = setTimeout(() => setModalAbierto(true), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center gap-2 bg-logro/15 px-4 py-1.5 text-center text-xs font-medium text-foreground sm:text-sm">
        <span>⚠️ {t("banner")}</span>
        <button onClick={() => setModalAbierto(true)} className="font-bold text-primario underline underline-offset-2 hover:no-underline">
          {t("bannerBoton")}
        </button>
      </div>

      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            key="fondo-recordatorio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalAbierto(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          >
            <motion.div
              key="tarjeta-recordatorio"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-[70] w-full max-w-sm"
            >
              <button
                onClick={() => setModalAbierto(false)}
                aria-label={t("cerrar")}
                className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-texto-secundario shadow-md hover:text-foreground"
              >
                ✕
              </button>
              <div className="text-center">
                <span className="text-3xl">⏳</span>
                <h2 className="mt-2 font-display text-xl font-bold text-foreground">{t("modalTitulo")}</h2>
                <p className="mt-1 mb-4 text-sm text-texto-secundario">{t("modalSubtitulo")}</p>
              </div>
              <ConvertirCuenta inicial="form" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
