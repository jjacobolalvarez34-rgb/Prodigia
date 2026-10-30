"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { useTemaHoy } from "@/components/temas/useTemaHoy";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { diaUtc, encontrarHuevo, FICHAS_POR_HUEVO, FICHAS_TODOS_HUEVOS, lugarHuevoDe, mensajeErrorMinievento, premiosMinievento, type LugarHuevo } from "@/lib/temas/minieventos";

// Pascua · «Huevos escondidos» (0311): el huevo del día, medio escondido en el borde de
// la pantalla que le toca (solo durante el evento, solo el de hoy y solo si no lo
// encontraste). Tocarlo lo guarda en la base, que comprueba el lugar.
export default function HuevoEscondido({ lugar }: { lugar: LugarHuevo }) {
  const tema = useTemaHoy();
  const t = useTranslations("Minieventos.huevos");
  const en = useLocale() === "en";
  const hoy = diaUtc();
  const esPascua = tema?.tema.id === "pascua" && tema.fase === "evento";
  const desde = tema?.hoy.rango.desde ?? "";
  const aqui = esPascua && lugarHuevoDe(desde, hoy) === lugar;
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!aqui) return;
    let vivo = true;
    void premiosMinievento(createClient(), slugEvento("pascua", desde)).then((r) => {
      if (vivo && r) setVisible(!r.some((p) => p.clave === `huevo:${hoy}`));
    });
    return () => {
      vivo = false;
    };
  }, [aqui, desde, hoy]);

  async function tocar() {
    const ficha = COLECCIONES.pascua!.ficha;
    const nombre = en ? ficha.nombreEn : ficha.nombre;
    try {
      const r = await encontrarHuevo(createClient(), lugar);
      setMensaje(r.fichas > FICHAS_POR_HUEVO ? `${t("encontraste", { fichas: FICHAS_POR_HUEVO, ficha: nombre })} ${t("todos", { fichas: FICHAS_TODOS_HUEVOS, ficha: nombre })}` : t("encontraste", { fichas: r.fichas, ficha: nombre }));
    } catch (e) {
      setMensaje(mensajeErrorMinievento(e, en));
    }
    setVisible(false);
    setTimeout(() => setMensaje(null), 4000);
  }

  if (!aqui) return null;
  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            aria-label={t("aria")}
            onClick={tocar}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.85, y: 0, rotate: [-8, 8, -8] }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ rotate: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
            className="fixed bottom-20 left-1 z-40 h-9 w-9 md:bottom-6"
          >
            <DibujoTema dibujo={PARTICULAS.huevo} className="h-full w-full" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mensaje && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 left-3 right-3 z-40 mx-auto w-fit rounded-xl border border-[#9BE7FF66] bg-[#0B1A2A] px-4 py-2 text-sm font-bold text-[#9BE7FF] shadow-lg md:bottom-6"
          >
            {mensaje}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
