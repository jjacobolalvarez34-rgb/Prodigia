"use client";

import { useTranslations } from "next-intl";
import { faltanteParaSubir, type ProgresoMundo } from "@/lib/mundos/progresoNivel";

interface Props {
  nombreMundo: string;
  colorHex: string;
  progreso: ProgresoMundo;
}

function Barra({ etiqueta, pct, color }: { etiqueta: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-semibold text-texto-secundario">{etiqueta}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-xs font-bold text-foreground">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function NivelMundoProgreso({ nombreMundo, colorHex, progreso }: Props) {
  const t = useTranslations("mundoProgreso");
  const faltante = faltanteParaSubir(progreso);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 px-5 py-4" style={{ borderColor: `color-mix(in oklab, ${colorHex} 25%, transparent)` }}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-bold text-foreground">{t("titulo")}</h2>
        <span className="font-mono text-xs font-bold text-texto-secundario">
          {t("puntos", { xp: progreso.puntos, mundo: nombreMundo })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Barra etiqueta={t("volumen")} pct={progreso.fracVolumen * 100} color={colorHex} />
        <Barra etiqueta={t("dominio")} pct={progreso.fracDominio * 100} color={`color-mix(in oklab, ${colorHex} 60%, #FFC53D)`} />
        <Barra etiqueta={t("aprender")} pct={progreso.fracLecciones * 100} color={`color-mix(in oklab, ${colorHex} 40%, #1D5BFF)`} />
      </div>

      <p
        className="rounded-xl px-3.5 py-2.5 text-sm font-medium"
        style={{ background: `color-mix(in oklab, ${colorHex} 8%, var(--surface))` }}
      >
        {faltante.tipo === "maximo"
          ? t("maximo")
          : faltante.tipo === "dominio"
            ? t("necesitaMas")
            : t("paraSubir", { nivel: progreso.nivel + 1, xp: faltante.xpFaltante })}
      </p>
    </section>
  );
}