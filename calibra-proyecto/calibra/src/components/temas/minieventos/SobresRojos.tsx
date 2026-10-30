"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { escenaSobres } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import { useMetasMinievento } from "./useMetasMinievento";

// Año Nuevo Lunar · «Sobres rojos» (0311): 3 sobres por día; cada uno se abre con 5, 15
// y 30 aciertos del día (en cualquier mundo) y trae Monedas de la suerte.
export default function SobresRojos() {
  const t = useTranslations("Minieventos.sobres");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.anio_nuevo_lunar!.ficha;
  const nombreFicha = en ? ficha.nombreEn : ficha.nombre;
  const { hoy, progreso, premios, cargado, ocupado, error, cobrar } = useMetasMinievento("anio_nuevo_lunar", false);
  const metas = metasDe("anio_nuevo_lunar");
  const aciertos = progreso?.hoy ?? 0;
  const estado = metas.map((m) => (metaCobrada(m, premios, hoy) ? "abierto" : aciertos >= m.meta ? "listo" : "cerrado") as "abierto" | "listo" | "cerrado");

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1A0508]">
        <DibujoTema dibujo={escenaSobres(estado)} className="block h-auto w-full" />
      </div>
      <p className="font-mono text-xs font-bold text-[#FFC53D]">{cargado ? t("hoy", { n: aciertos }) : "…"}</p>
      <div className="grid grid-cols-3 gap-2">
        {metas.map((m, i) => (
          <div key={m.clave} className="flex flex-col items-center gap-1 rounded-xl border border-white/10 px-2 py-2 text-center">
            {estado[i] === "abierto" ? (
              <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-xs font-bold text-[#FFC53D]">
                <DibujoTema dibujo={PARTICULAS.moneda} className="h-4 w-4" />
                {t("abierto", { n: m.fichas, ficha: nombreFicha })}
              </motion.p>
            ) : estado[i] === "listo" ? (
              <button
                type="button"
                disabled={ocupado || !progreso}
                onClick={() => void cobrar(m.clave)}
                className="rounded-lg border-2 border-[#05060F] bg-[#E63946] px-3 py-1 font-display text-xs font-bold text-white shadow-[2px_2px_0_0_#05060F] disabled:opacity-60"
              >
                {t("abrir")}
              </button>
            ) : (
              <p className="text-xs text-texto-secundario">{t("falta", { n: m.meta })}</p>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
