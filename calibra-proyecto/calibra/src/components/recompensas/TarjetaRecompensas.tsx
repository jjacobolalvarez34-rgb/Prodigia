"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { totalPendientes } from "@/lib/recompensas/api";
import { usePendientesWeb } from "@/lib/recompensas/cosmeticosWeb";

// Acceso a Recompensas en la portada, con cuántas cosas hay por reclamar (igual
// que la tarjeta de Hoy en la app).
export default function TarjetaRecompensas() {
  const t = useTranslations("Recompensas.inicio");
  const n = totalPendientes(usePendientesWeb());
  return (
    <Link
      href="/recompensas"
      className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors ${n > 0 ? "border-logro/60 bg-logro/10 hover:bg-logro/15" : "border-border bg-surface hover:bg-surface-2"}`}
    >
      <span className="text-3xl transition-transform group-hover:-translate-y-1" aria-hidden="true">
        🎁
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-foreground">{n > 0 ? t("pendientes", { n }) : t("titulo")}</p>
        <p className="text-xs text-texto-secundario">{n > 0 ? t("toca") : t("notaNada")}</p>
      </div>
      {n > 0 && <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-logro px-2 font-mono text-sm font-bold text-[#2A1A00]">{n}</span>}
    </Link>
  );
}
