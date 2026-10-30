"use client";

import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaHoli } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import { useMetasMinievento } from "./useMetasMinievento";

// Holi · «Ciudad de colores» (0311): cada acierto del evento, en cualquier mundo, tiñe la
// ciudad de un color; con 60, queda pintada entera y da Polvos de color (solo).
export default function CiudadColores() {
  const t = useTranslations("Minieventos.holi");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.holi!.ficha;
  const meta = metasDe("holi")[0];
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("holi", true);
  const n = Math.min(progreso?.total ?? 0, meta.meta);
  const lograda = metaCobrada(meta, premios, hoy);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1E0B2A]">
        <DibujoTema dibujo={escenaHoli(n, meta.meta)} className="block h-auto w-full" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#FF5D8F] via-[#FFC53D] to-[#3DDC97] transition-all" style={{ width: `${(n / meta.meta) * 100}%` }} />
      </div>
      <p className="font-mono text-xs font-bold text-[#FF5D8F]">{cargado ? t("progreso", { n, meta: meta.meta }) : "…"}</p>
      {lograda ? (
        <p className="text-sm font-bold text-[#FFC53D]">{t("lograda", { fichas: meta.fichas, ficha: en ? ficha.nombreEn : ficha.nombre })}</p>
      ) : (
        <p className="text-xs text-texto-secundario">{t("texto")}</p>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
