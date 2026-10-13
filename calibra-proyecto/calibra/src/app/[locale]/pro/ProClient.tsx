"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { calcularVencimientoPro, textoRestantePro, type SuscripcionPro } from "@/lib/pro/vencimiento";
import { PRODUCTOS } from "@/lib/pagos/productos";
import { abrirCheckoutPaddle } from "@/lib/pagos/paddleClient";
import type { Proveedor, ProductoComprable } from "@/lib/pagos/tipos";

interface Props {
  esPro: boolean;
  // Lo decide el servidor en cada visita (lib/pagos/flags.ts).
  pagosHabilitados: boolean;
  // Para el contador de cuánto le queda a Pro (null = Pro sin suscripción, p. ej. dado a mano).
  suscripcion: SuscripcionPro | null;
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
    <div className={`mt-2 flex w-full max-w-xs flex-col items-center gap-1 rounded-xl border px-4 py-3 ${v.renueva ? "border-primario/30 bg-surface" : "border-racha/50 bg-racha/10"}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-texto-secundario">{v.renueva ? t("renueva") : t("termina")}</span>
      <span className={`font-mono text-2xl font-bold ${v.renueva ? "text-foreground" : "text-racha"}`}>{textoRestantePro(v)}</span>
      <span className="text-xs text-texto-secundario">{t(v.renueva ? "fechaRenueva" : "fechaTermina", { fecha })}</span>
    </div>
  );
}

// Fase 4 (infraestructura de pagos): antes /pro tenía un botón
// deshabilitado a propósito ("Stripe no cubre Colombia directamente").
// Ahora pega de verdad a /api/pagos/checkout — mismo flujo y mismo
// criterio que la sección "Comprar Chispas" de TiendaClient.tsx (nunca
// otorga nada acá mismo, el otorgamiento real pasa por el webhook del
// proveedor). Si Mercado Pago/Paddle todavía no están conectados
// (Fase 2/3 del plan), la ruta devuelve un 503 con el motivo exacto —
// se muestra tal cual, sin pretender que funcionó.
export default function ProClient({ esPro, pagosHabilitados, suscripcion }: Props) {
  const t = useTranslations("Legal.pro");
  // Solo Paddle (2026-10-12): Mercado Pago quedó fuera, su adaptador sigue en lib/pagos sin uso.
  const proveedor: Proveedor = "paddle";
  const [comprando, setComprando] = useState<ProductoComprable | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function suscribirse(producto: ProductoComprable) {
    setComprando(producto);
    setError(null);
    try {
      const res = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto, proveedor }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errorGenerico"));
        return;
      }
      if (data.tipo === "redirect") {
        window.location.assign(data.url);
      } else if (data.tipo === "overlay") {
        const abierto = await abrirCheckoutPaddle(data.transactionId, () => window.location.reload());
        if (!abierto) setError(t("overlayNoDisponible"));
      }
    } catch {
      setError(t("errorConexion"));
    } finally {
      setComprando(null);
    }
  }

  if (esPro) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-primario/40 bg-primario/5 px-6 py-8 text-center">
        <span className="text-2xl">✨</span>
        <p className="font-display text-lg font-bold text-foreground">{t("yaSosPro")}</p>
        <p className="text-xs text-texto-secundario">{t("yaSosProDetalle")}</p>
        <ContadorPro suscripcion={suscripcion} />
      </div>
    );
  }

  if (!pagosHabilitados) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-2 px-6 py-8 text-center">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-xl bg-primario/40 px-6 py-3 font-display font-semibold text-white opacity-70"
        >
          {t("proximamente")}
        </button>
        <p className="text-xs text-texto-secundario">{t("noDisponible")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface-2 px-6 py-8 text-center">

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => suscribirse("pro_mensual")}
          disabled={comprando !== null}
          className="flex flex-col items-center gap-1 rounded-xl bg-primario px-6 py-4 font-display font-semibold text-white transition-opacity disabled:opacity-60"
        >
          <span>{t("planMensual")}</span>
          <span className="font-mono text-sm font-normal opacity-90">
            {comprando === "pro_mensual" ? t("procesando") : t("precioUsd", { precio: PRODUCTOS.pro_mensual.precioUsd })}
          </span>
        </button>
        <button
          type="button"
          onClick={() => suscribirse("pro_anual")}
          disabled={comprando !== null}
          className="flex flex-col items-center gap-1 rounded-xl border-2 border-primario px-6 py-4 font-display font-semibold text-primario transition-opacity disabled:opacity-60"
        >
          <span>{t("planAnual")}</span>
          <span className="font-mono text-sm font-normal opacity-90">
            {comprando === "pro_anual" ? t("procesando") : t("precioUsd", { precio: PRODUCTOS.pro_anual.precioUsd })}
          </span>
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
