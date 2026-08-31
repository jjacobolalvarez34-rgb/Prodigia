"use client";

import { useTranslations } from "next-intl";

interface Props {
  correctos: number;
  total: number;
  colorHex: string;
  onContinuar: () => void;
}

// Paso intermedio entre el sprint (paso 5) y el tour (paso 6): muestra
// el resultado REAL (Fase 2 del rediseño — correctos viene del contador
// real del runner, ya no se infiere de "total - errores"), sin todavía
// ofrecer crear cuenta ni el link de "seguir explorando" — eso se movió
// al final del flujo (paso 8).
export default function FlujoResultado({ correctos, total, colorHex, onContinuar }: Props) {
  const t = useTranslations("Landing.cta");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-4 py-16 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-black text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${colorHex}, color-mix(in oklab, ${colorHex} 55%, white))` }}
      >
        {correctos}/{total}
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("titulo")}</h1>
        <p className="mt-1 text-sm text-texto-secundario">{t("resultado", { correctos, total })}</p>
      </div>
      <button
        onClick={onContinuar}
        className="rounded-xl bg-primario px-6 py-3 font-display font-semibold text-white"
      >
        {t("continuar")}
      </button>
    </div>
  );
}
