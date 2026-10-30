"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES, slugEvento } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { abrirCasillaAdviento, casillasAdviento, diaUtc, esDomingo, mensajeErrorMinievento, ULTIMA_CASILLA, type CasillaAdviento } from "@/lib/temas/minieventos";

// Navidad · «Calendario de adviento» (0309): del 1 al 24 de diciembre, una casilla por
// día (solo la de hoy): Fichas, y los domingos una cápsula del evento.
export default function Adviento({ desde }: { desde: string }) {
  const t = useTranslations("Minieventos.adviento");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.navidad!.ficha;
  const slug = slugEvento("navidad", desde);
  const hoy = diaUtc();
  const anio = desde.slice(0, 4);
  const diaHoy = hoy.slice(0, 7) === `${anio}-12` ? Number(hoy.slice(8, 10)) : 0;
  const [casillas, setCasillas] = useState<CasillaAdviento[] | null>(null);
  const [ultima, setUltima] = useState<CasillaAdviento | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCasillas((await casillasAdviento(createClient(), slug)) ?? []);
  }, [slug]);

  useEffect(() => {
    // Las casillas que ya abriste (sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  async function abrir() {
    setOcupado(true);
    setError(null);
    try {
      const c = await abrirCasillaAdviento(createClient());
      setUltima(c);
      setCasillas((antes) => [...(antes ?? []), c]);
    } catch (e) {
      setError(mensajeErrorMinievento(e, en));
    } finally {
      setOcupado(false);
    }
  }

  const abierta = (dia: number) => casillas?.find((c) => Number(c.dia.slice(8, 10)) === dia) ?? null;
  const hoyAbierta = diaHoy > 0 ? abierta(diaHoy) : null;
  const textoCasilla = (c: CasillaAdviento) =>
    c.premio === "capsula" ? t("capsula", { dia: Number(c.dia.slice(8, 10)) }) : t("fichas", { dia: Number(c.dia.slice(8, 10)), n: c.cantidad, ficha: en ? ficha.nombreEn : ficha.nombre });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: ULTIMA_CASILLA }, (_, i) => i + 1).map((dia) => {
          const c = abierta(dia);
          const esHoy = dia === diaHoy;
          const domingo = esDomingo(`${anio}-12-${String(dia).padStart(2, "0")}`);
          return (
            <motion.div
              key={dia}
              initial={false}
              animate={c && esHoy ? { scale: [1, 1.12, 1] } : {}}
              className="relative flex aspect-square items-center justify-center rounded-lg border text-sm font-bold"
              style={{
                borderColor: esHoy ? "#FFC53D" : c ? "#3DDC9766" : "#ffffff1f",
                background: c ? "#3DDC9714" : esHoy ? "#E6394633" : dia < diaHoy ? "transparent" : "#ffffff08",
                color: dia < diaHoy && !c ? "#ffffff40" : "#fff",
              }}
            >
              {c ? <DibujoTema dibujo={PARTICULAS.regalo} className="h-5 w-5 opacity-50" /> : dia}
              {domingo && !c && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[#FFC53D]" />}
            </motion.div>
          );
        })}
      </div>
      <p className="text-[11px] text-texto-secundario">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#FFC53D] align-middle" /> {t("domingo")}
      </p>
      {diaHoy === 0 || diaHoy > ULTIMA_CASILLA ? (
        <p className="text-sm text-texto-secundario">{t("termino")}</p>
      ) : casillas === null ? (
        <p className="text-sm text-texto-secundario">…</p>
      ) : hoyAbierta ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#3DDC97]">{textoCasilla(ultima ?? hoyAbierta)}</p>
          <p className="text-xs text-texto-secundario">{t("vuelve")}</p>
        </div>
      ) : (
        <button
          type="button"
          disabled={ocupado}
          onClick={abrir}
          className="flex w-fit items-center gap-2 rounded-xl border-2 border-[#05060F] bg-[#E63946] px-4 py-2 font-display text-sm font-bold text-white shadow-[3px_3px_0_0_#05060F] disabled:opacity-60"
        >
          <DibujoTema dibujo={PARTICULAS.regalo} className="h-5 w-5" />
          {t("abrir", { dia: diaHoy })}
        </button>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
