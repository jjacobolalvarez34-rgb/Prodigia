"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { COLOR_RAREZA, type Rareza } from "@/lib/recompensas/catalogo";
import { constelacionesPorVer, marcarConstelacionesVistas, type ConstelacionCompletada } from "@/lib/recompensas/constelaciones";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import Constelacion from "./Constelacion";

// Constelaciones completadas que todavía no se celebraron (0259): se muestran una
// vez, fuera de las partidas (igual que CelebracionConstelaciones de la app). Se
// revisa al cambiar de página, así la que se completó en la última partida aparece
// al volver al inicio o a los resultados.
const NO_INTERRUMPIR = /(practica|sprint|duelo|diagnostico|reto)/;

export default function CelebracionConstelaciones() {
  const t = useTranslations("Recompensas.constelaciones.celebracion");
  const tMundos = useTranslations("Mundos.nombres");
  const ruta = usePathname();
  const [lista, setLista] = useState<ConstelacionCompletada[]>([]);
  const [i, setI] = useState(0);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (NO_INTERRUMPIR.test(ruta) || lista.length > 0) return;
    let vivo = true;
    constelacionesPorVer(createClient()).then((l) => {
      if (vivo && l.length > 0) {
        setI(0);
        setLista(l);
      }
    });
    return () => {
      vivo = false;
    };
  }, [ruta, lista.length]);

  const actual = lista[i];
  useEffect(() => {
    if (!actual) return;
    const fin = setTimeout(() => {
      setListo(true);
      reproducirTono("logro");
    }, 2600);
    return () => clearTimeout(fin);
  }, [actual]);

  async function seguir() {
    setListo(false);
    if (i < lista.length - 1) {
      setI(i + 1);
      return;
    }
    setLista([]);
    await marcarConstelacionesVistas(createClient());
    refrescarCosmeticosWeb();
  }

  return (
    <AnimatePresence>
      {actual && (
        <motion.div key="fondo" className="fixed inset-0 z-[90] flex items-center justify-center bg-[#05070D]/95 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div key={actual.id} className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primario">{t("de", { ciudad: tMundos(actual.mundo), n: actual.numero })}</p>
            <Constelacion mundo={actual.mundo} estrellas={7} tam={260} celebrar />
            {actual.premio.fugaz && (
              <motion.span
                className="pointer-events-none fixed left-0 top-16 h-[3px] w-24 rounded-full bg-white shadow-[0_0_12px_#FFB627]"
                initial={{ x: -120, y: 0, rotate: 25, opacity: 0 }}
                animate={{ x: "110vw", y: 160, opacity: [0, 1, 0.4] }}
                transition={{ delay: 2.6, duration: 0.9, ease: "easeOut" }}
              />
            )}
            {listo && (
              <motion.div className="flex w-full flex-col gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-2xl font-bold text-foreground">{t("titulo")}</h2>
                <div className="flex flex-col gap-2 rounded-2xl border border-logro/40 bg-logro/10 p-4 text-left text-sm">
                  <p className="font-semibold text-foreground">⚡ {t("chispas", { n: actual.premio.chispas })}</p>
                  {actual.premio.pieza && (
                    <p className="font-semibold text-foreground">
                      🧩 {actual.premio.pieza.nombre} <span style={{ color: COLOR_RAREZA[actual.premio.pieza.rareza as Rareza] }}>·</span>
                    </p>
                  )}
                  {actual.premio.fugaz && <p className="font-semibold text-logro">🌠 {t("fugaz", { premio: t(`fugaces.${actual.premio.fugaz.premio}`) })}</p>}
                  {actual.alineacion && <p className="text-primario">{t("alineacion")}</p>}
                  {actual.de_noche && <p className="text-primario">{t("noche")}</p>}
                </div>
                <button type="button" onClick={seguir} className="rounded-full bg-logro px-6 py-3 font-bold text-[#2A1A00] transition hover:brightness-110">
                  {i < lista.length - 1 ? t("siguiente") : t("genial")}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
