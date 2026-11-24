"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CartaSVG from "@/components/naipia/CartaSVG";
import { Ficha } from "./mesa";

// Banner del minievento «Gánale al modelo» (2026-11-24) en la página principal, la
// pública y la del jugador con sesión. Lleva a /ganale-al-modelo.
export default function BannerGanaleModelo({ className = "" }: { className?: string }) {
  const t = useTranslations("GanaleModelo");
  return (
    <Link
      href="/ganale-al-modelo"
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border-[3px] border-[#3B2416] bg-[#0B5A38] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-1 rounded-xl border border-dashed border-[#E9D9A6]/25" />
      <div aria-hidden="true" className="relative flex shrink-0">
        <div className="-rotate-6 transition-transform group-hover:-rotate-12">
          <CartaSVG carta={{ valor: "A", palo: "picas" }} ancho={34} />
        </div>
        <div className="-ml-3 rotate-6 transition-transform group-hover:rotate-12">
          <CartaSVG carta={{ valor: "K", palo: "corazones" }} ancho={34} />
        </div>
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F4B4B4]">
          <Ficha tam={12} />
          {t("banner.etiqueta")}
        </span>
        <span className="font-display text-lg font-bold leading-tight text-[#F5EBCB]">{t("titulo")}</span>
        <span className="text-xs text-[#E9D9A6]/80">{t("banner.texto")}</span>
      </div>
      <span className="relative shrink-0 rounded-full bg-[#B91C1C] px-4 py-2 text-sm font-bold text-white shadow-[0_0_16px_#F25C5C55]">{t("banner.cta")}</span>
    </Link>
  );
}
