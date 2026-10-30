"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import DibujoTema from "@/components/temas/DibujoTema";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaPentagrama } from "@/lib/temas/escenasFiestas";
import { metaCobrada, metasDe } from "@/lib/temas/minieventos";
import { useMetasMinievento } from "./useMetasMinievento";

// Día de la Música · «Melodía al doble» (0311): ese día la Exp de Melodía da el doble de
// Notas (eventos.dia_doble) y cada acierto en Melodía toca una nota; con 16, la melodía
// queda completa y da Notas (solo).
export default function MelodiaCompleta() {
  const t = useTranslations("Minieventos.musica");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.dia_musica!.ficha;
  const meta = metasDe("dia_musica")[0];
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("dia_musica", true);
  const n = Math.min(progreso?.hoy ?? 0, meta.meta);
  const completa = metaCobrada(meta, premios, hoy);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120A2A]">
        <DibujoTema dibujo={escenaPentagrama(n, meta.meta)} className="block h-auto w-full" />
      </div>
      <p className="font-mono text-xs font-bold text-[#FFC53D]">{cargado ? t("notas", { n, total: meta.meta }) : "…"}</p>
      {completa ? (
        <p className="text-sm font-bold text-[#FFC53D]">{t("completa", { fichas: meta.fichas, ficha: en ? ficha.nombreEn : ficha.nombre })}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-texto-secundario">{t("texto")}</p>
          <Link href="/melodia" className="rounded-xl border-2 border-[#05060F] bg-[#A794FF] px-3 py-1.5 font-display text-xs font-bold text-[#140B2A] shadow-[2px_2px_0_0_#05060F]">
            {t("jugar")}
          </Link>
        </div>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
