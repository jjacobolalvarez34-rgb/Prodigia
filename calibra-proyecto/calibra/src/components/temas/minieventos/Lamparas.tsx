"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { createClient } from "@/lib/supabase/client";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaLamparas, FICHAS_LAMPARAS, lamparasEvento, META_LAMPARAS } from "@/lib/temas/minieventos";

// Diwali · «Enciende 100 lámparas» (0309): cada acierto del evento, en cualquier mundo,
// enciende una lámpara; con 100, la ciudad entera se ilumina y da Fichas.
export default function Lamparas() {
  const t = useTranslations("Minieventos.lamparas");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.diwali!.ficha;
  const [estado, setEstado] = useState<{ encendidas: number; premio: boolean } | null>(null);

  useEffect(() => {
    let vivo = true;
    void lamparasEvento(createClient()).then((r) => {
      if (vivo) setEstado(r ?? { encendidas: 0, premio: false });
    });
    return () => {
      vivo = false;
    };
  }, []);

  const n = estado?.encendidas ?? 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#120720]">
        <DibujoTema dibujo={escenaLamparas(n)} className="block h-auto w-full" />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#FFC53D] transition-all" style={{ width: `${Math.min(100, (n / META_LAMPARAS) * 100)}%` }} />
      </div>
      <p className="font-mono text-xs font-bold text-[#FFD36B]">{estado ? t("encendidas", { n, meta: META_LAMPARAS }) : "…"}</p>
      {estado?.premio ? (
        <p className="text-sm font-bold text-[#FFC53D]">{t("lograda", { fichas: FICHAS_LAMPARAS, ficha: en ? ficha.nombreEn : ficha.nombre })}</p>
      ) : (
        <p className="text-xs text-texto-secundario">{t("texto")}</p>
      )}
    </div>
  );
}
