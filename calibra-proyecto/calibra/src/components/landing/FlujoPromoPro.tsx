"use client";

import { useTranslations } from "next-intl";
import { BENEFICIOS_PRO } from "@/lib/pro/beneficios";

interface Props {
  onContinuar: () => void;
}

// Paso 7 del flujo nuevo (Fase 7): cierre con la promo de Pro, antes de
// elegir los 2 mundos gratis. Reusa BENEFICIOS_PRO (mismo contenido que
// /pro) en vez de duplicar la lista.
export default function FlujoPromoPro({ onContinuar }: Props) {
  const t = useTranslations("Landing.promo");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="text-xs font-medium uppercase tracking-wide text-primario">Prodigia Pro</span>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
      <p className="text-sm text-texto-secundario">{t("texto")}</p>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        {BENEFICIOS_PRO.map((b) => (
          <div
            key={b.titulo}
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-4 py-4 text-center"
          >
            <span className="text-xl">{b.emoji}</span>
            <p className="text-xs font-semibold text-foreground">{b.titulo}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onContinuar}
        className="mt-2 rounded-xl bg-primario px-6 py-3 font-display font-semibold text-white"
      >
        {t("continuar")}
      </button>
    </div>
  );
}
