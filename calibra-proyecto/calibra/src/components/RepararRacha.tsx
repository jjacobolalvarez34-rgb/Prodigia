"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import IconoCometa from "@/components/IconoCometa";
import { IconLlama } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { estadoRachaReparable, mensajeError, repararRachaConCometas, type RachaReparable } from "@/lib/recompensas/api";

// Reparar la racha con Cometas (0287): si se cortó hace poco (hasta 3 días), aparece
// en el inicio con su precio; una vez por semana. Igual que en la app.
export default function RepararRacha() {
  const t = useTranslations("RepararRacha");
  const locale = useLocale();
  const router = useRouter();
  const [estado, setEstado] = useState<RachaReparable | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    estadoRachaReparable(createClient()).then((e) => {
      if (vivo) setEstado(e);
    });
    return () => {
      vivo = false;
    };
  }, []);

  if (!estado) return null;

  async function reparar() {
    setOcupado(true);
    setError(null);
    try {
      const r = await repararRachaConCometas(createClient());
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: r.cometas }));
      setEstado(null);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  const espera = estado.disponible_en ? new Date(estado.disponible_en).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }) : null;

  return (
    <section className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-racha/60 bg-racha/10 px-5 py-4">
      <IconLlama className="h-9 w-9 shrink-0 text-racha" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-bold text-foreground">{t("titulo", { n: estado.perdida })}</p>
        <p className="text-sm text-texto-secundario">{espera ? t("yaUsada", { fecha: espera }) : t("texto", { dias: estado.dias_perdidos })}</p>
        {error && <p className="mt-1 text-sm font-semibold text-error">{error}</p>}
      </div>
      {!espera && (
        <button
          type="button"
          onClick={reparar}
          disabled={ocupado}
          className="flex items-center gap-2 rounded-xl border-2 border-[#05060F] bg-[#5DE4FF] px-4 py-2 font-display text-sm font-bold text-[#04121A] shadow-[3px_3px_0_0_#05060F] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#05060F] disabled:opacity-60"
        >
          <IconoCometa className="h-4 w-4" />
          {ocupado ? t("reparando") : t("boton", { costo: estado.costo })}
        </button>
      )}
    </section>
  );
}
