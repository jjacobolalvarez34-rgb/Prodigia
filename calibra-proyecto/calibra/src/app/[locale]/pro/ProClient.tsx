"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { calcularVencimientoPro, textoRestantePro, type SuscripcionPro } from "@/lib/pro/vencimiento";
import IconoTrazo from "@/components/IconoTrazo";
import { PlanesPro } from "@/components/pagos/Vitrina";

interface Props {
  esPro: boolean;
  // Lo decide el servidor en cada visita (lib/pagos/flags.ts).
  pagosHabilitados: boolean;
  // Para el contador de cuánto le queda a Pro (null = Pro sin suscripción, p. ej. dado a mano).
  suscripcion: SuscripcionPro | null;
  ahorro: { usd: number; porcentaje: number; porMes: number };
}

// Cuánto le queda a Pro, con la fecha; se actualiza cada 30 s.
function ContadorPro({ suscripcion }: { suscripcion: SuscripcionPro | null }) {
  const t = useTranslations("Legal.pro.vence");
  const locale = useLocale();
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const v = calcularVencimientoPro(suscripcion, ahora);
  if (!v) return null;
  const fecha = v.fin.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className={`mt-2 flex w-full max-w-xs flex-col items-center gap-1 rounded-xl border px-4 py-3 ${v.renueva ? "border-white/20 bg-white/5" : "border-racha/50 bg-racha/10"}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">{v.renueva ? t("renueva") : t("termina")}</span>
      <span className={`font-mono text-2xl font-bold ${v.renueva ? "text-white" : "text-racha"}`}>{textoRestantePro(v)}</span>
      <span className="text-xs text-white/60">{t(v.renueva ? "fechaRenueva" : "fechaTermina", { fecha })}</span>
    </div>
  );
}

// Rediseño 2026-10-14: los dos planes como tarjetas grandes (components/pagos/Vitrina),
// arriba de todo para no tener que bajar. El cobro sigue igual: /api/pagos/checkout abre
// Paddle y al pagar se pasa a /pro/bienvenida; el Pro lo da el webhook del servidor.
export default function ProClient({ esPro, pagosHabilitados, suscripcion, ahorro }: Props) {
  const t = useTranslations("Legal.pro");

  if (esPro) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 rounded-3xl border-2 border-[#05060F] bg-gradient-to-br from-[#3B2C8F] to-[#12172A] px-6 py-8 text-center shadow-[8px_8px_0_0_#FFC53D]">
        <IconoTrazo nombre="corona" className="h-10 w-10 text-[#FFC53D]" />
        <p className="font-display text-xl font-bold">{t("yaSosPro")}</p>
        <p className="text-sm text-white/70">{t("yaSosProDetalle")}</p>
        <ContadorPro suscripcion={suscripcion} />
      </div>
    );
  }

  return <PlanesPro pagosHabilitados={pagosHabilitados} ahorro={ahorro} />;
}
