"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import IconoCometa from "@/components/IconoCometa";
import { createClient } from "@/lib/supabase/client";
import { abrirCheckoutPaddle } from "@/lib/pagos/paddleClient";
import { PRODUCTOS } from "@/lib/pagos/productos";
import type { ProductoComprable } from "@/lib/pagos/tipos";

// Cometas en la tienda de la web (2026-10-13, 0279): saldo, canje por Chispas
// (1 Cometa = 10 Chispas, lo hace la base) y compra con Paddle. Igual que la
// pestaña Cometas del Bazar de la app.
import { CANJES_COMETAS as CANJES, CHISPAS_POR_COMETA } from "@/lib/cometas";

export default function SeccionCometas({
  cometasIniciales,
  paquetes,
  pagosHabilitados,
}: {
  cometasIniciales: number;
  // Paquetes de Cometas con price_id cargado (los demás no se muestran).
  paquetes: ProductoComprable[];
  pagosHabilitados: boolean;
}) {
  const t = useTranslations("Cometas");
  const [cometas, setCometas] = useState(cometasIniciales);
  const [pendiente, setPendiente] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  // Compras con Cometas en otra parte de la tienda (lo legendario).
  useEffect(() => {
    const alCambiar = (ev: Event) => {
      const n = (ev as CustomEvent<number>).detail;
      if (typeof n === "number") setCometas(n);
    };
    window.addEventListener("prodigia:cometas", alCambiar);
    return () => window.removeEventListener("prodigia:cometas", alCambiar);
  }, []);

  async function canjear(n: number) {
    if (pendiente !== n) {
      setPendiente(n);
      return;
    }
    setOcupado(true);
    setMensaje(null);
    const { data, error } = await createClient().rpc("canjear_cometas", { p_cometas: n });
    setOcupado(false);
    setPendiente(null);
    if (error) {
      setMensaje({ texto: /faltan Cometas/i.test(error.message) ? t("faltan") : t("errorCanje"), error: true });
      return;
    }
    const fila = (data as { cometas: number; puntos_total: number }[] | null)?.[0];
    if (fila) {
      setCometas(fila.cometas);
      window.dispatchEvent(new CustomEvent("prodigia:chispas", { detail: fila.puntos_total }));
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: fila.cometas }));
    }
    setMensaje({ texto: t("canjeHecho", { n: (n * CHISPAS_POR_COMETA).toLocaleString() }), error: false });
  }

  async function comprar(producto: ProductoComprable) {
    setOcupado(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto, proveedor: "paddle" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje({ texto: data.error ?? t("errorCompra"), error: true });
        return;
      }
      if (data.tipo === "overlay") {
        const abierto = await abrirCheckoutPaddle(data.transactionId, () => window.location.reload());
        if (!abierto) setMensaje({ texto: t("errorCompra"), error: true });
      }
    } catch {
      setMensaje({ texto: t("errorCompra"), error: true });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#5DE4FF]/40 bg-[#0B1022]/85 p-5 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-4">
        <IconoCometa className="h-14 w-14" />
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5DE4FF]">{t("tusCometas")}</span>
          <span className="font-mono text-3xl font-bold tabular-nums">{cometas.toLocaleString()}</span>
          <span className="text-xs text-white/70">{t("explicacion", { n: CHISPAS_POR_COMETA })}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-base font-bold">{t("canjeTitulo")}</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CANJES.map((n) => {
            const alcanza = cometas >= n;
            const confirmando = pendiente === n;
            return (
              <button
                key={n}
                type="button"
                disabled={!alcanza || ocupado}
                onClick={() => canjear(n)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40 ${confirmando ? "border-[#5DE4FF] bg-[#5DE4FF]/10" : "border-white/15 bg-white/5"}`}
              >
                <span className="flex items-center gap-1 font-mono text-base font-bold">
                  <IconoCometa className="h-5 w-5" /> {n}
                </span>
                <span className="text-[11px] text-white/60">{confirmando ? t("confirmar") : t("seCambianPor")}</span>
                <span className="font-mono text-base font-bold text-[#FFC53D]">✦ {(n * CHISPAS_POR_COMETA).toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {pagosHabilitados && paquetes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-base font-bold">{t("comprarTitulo")}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {paquetes.map((p) => {
              const def = PRODUCTOS[p];
              return (
                <button
                  key={p}
                  type="button"
                  disabled={ocupado}
                  onClick={() => comprar(p)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-[#5DE4FF]/30 bg-[#5DE4FF]/5 px-3 py-3 transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1 font-mono text-lg font-bold">
                    <IconoCometa className="h-5 w-5" /> {def.montoCometas?.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-white/90">US${def.precioUsd.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mensaje && <p className={`text-sm font-semibold ${mensaje.error ? "text-[#FF8A8A]" : "text-[#3DDC97]"}`}>{mensaje.texto}</p>}
      <p className="text-xs text-white/60">{t("comoConseguir")}</p>
    </section>
  );
}
