"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import IconoCometa from "@/components/IconoCometa";
import IconoTrazo from "@/components/IconoTrazo";
import { abrirCheckoutPaddle } from "@/lib/pagos/paddleClient";
import { PRODUCTOS } from "@/lib/pagos/productos";
import type { ProductoComprable } from "@/lib/pagos/tipos";
import { bonoPorcentaje, MAS_ELEGIDO, mejorValor, PAQUETES_CHISPAS, PAQUETES_COMETAS, precioTexto } from "@/lib/pagos/vitrina";

// Rediseño de pagos (2026-10-14): tarjetas grandes, precio fuerte, lista con checks y
// botones con sombra desplazada (estilo «neo-brutalista»), que entran en cascada al
// verse. Lo usan /pro (planes) y el Mercado de la tienda (Cometas y Chispas). Nunca
// otorga nada acá: el pago lo confirma el webhook de Paddle en el servidor.

// ---------- Checkout ----------
export function useCheckout(alCompletar: (p: ProductoComprable) => void) {
  const t = useTranslations("Vitrina");
  const [comprando, setComprando] = useState<ProductoComprable | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function comprar(producto: ProductoComprable, detalle?: { mundo?: string; paquete?: string }) {
    setComprando(producto);
    setError(null);
    try {
      const res = await fetch("/api/pagos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto, proveedor: "paddle", ...detalle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("errorGenerico"));
        return;
      }
      if (data.tipo === "redirect") {
        window.location.assign(data.url);
      } else if (data.tipo === "overlay") {
        const abierto = await abrirCheckoutPaddle(data.transactionId, () => alCompletar(producto));
        if (!abierto) setError(t("errorOverlay"));
      }
    } catch {
      setError(t("errorConexion"));
    } finally {
      setComprando(null);
    }
  }

  return { comprar, comprando, error };
}

// ---------- Piezas ----------
export function BotonBrutal({
  children,
  onClick,
  disabled,
  variante = "oro",
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variante?: "oro" | "violeta" | "cometa";
  href?: string;
}) {
  const fondo = variante === "oro" ? "bg-[#FFC53D] text-[#1A1206]" : variante === "cometa" ? "bg-[#5DE4FF] text-[#04121A]" : "bg-[#6C4CF1] text-white";
  const clase = `boton-tema flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#05060F] px-5 py-3 font-display text-base font-bold ${fondo} shadow-[4px_4px_0_0_#05060F] transition-all enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] enabled:hover:shadow-[2px_2px_0_0_#05060F] enabled:active:translate-x-[4px] enabled:active:translate-y-[4px] enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-60`;
  if (href) {
    return (
      <Link href={href} className={`${clase} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#05060F]`}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={clase}>
      {children}
    </button>
  );
}

// Entrada en cascada al aparecer en pantalla (como el TimelineAnimation del ejemplo).
export function Entrada({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -18, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Sello({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className="absolute -top-3 right-4 rotate-[4deg] rounded-full border-2 border-[#05060F] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#05060F] shadow-[2px_2px_0_0_#05060F]"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

const CHISPA = "M12 1.5c.6 5 2.4 7.6 9.5 10.5-7.1 2.9-8.9 5.5-9.5 10.5-.6-5-2.4-7.6-9.5-10.5C9.6 9.1 11.4 6.5 12 1.5z";
// Dónde va cada moneda del montón según el tamaño del paquete (x, y, tamaño en %).
const MONTON: [number, number, number][][] = [
  [[50, 50, 60]],
  [[40, 56, 48], [66, 38, 36]],
  [[50, 58, 46], [24, 36, 32], [76, 32, 34]],
  [[48, 60, 44], [22, 38, 30], [74, 30, 32], [76, 74, 26]],
  [[50, 56, 42], [22, 34, 28], [76, 26, 30], [78, 72, 26], [24, 76, 24]],
];

function Chispa({ tam }: { tam: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" style={{ width: tam, height: tam }} aria-hidden="true">
      <defs>
        <linearGradient id={`vc${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A794FF" />
          <stop offset="0.5" stopColor="#E4CBA0" />
          <stop offset="1" stopColor="#FFC53D" />
        </linearGradient>
      </defs>
      <path d={CHISPA} fill={`url(#vc${id})`} />
    </svg>
  );
}

// Montón de monedas que crece con el paquete.
export function IlustracionMoneda({ tipo, nivel }: { tipo: "chispas" | "cometas"; nivel: number }) {
  const puestos = MONTON[Math.min(MONTON.length - 1, Math.max(0, nivel))];
  const brillo = tipo === "cometas" ? "rgba(93,228,255,0.45)" : "rgba(255,197,61,0.45)";
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[9rem]" aria-hidden="true">
      <div className="absolute inset-[18%] rounded-full blur-2xl" style={{ background: brillo }} />
      {puestos.map(([x, y, s], i) => (
        <motion.span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%`, width: `${s}%`, height: `${s}%` }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {tipo === "cometas" ? <IconoCometa className="h-full w-full" /> : <Chispa tam="100%" />}
        </motion.span>
      ))}
    </div>
  );
}

// ---------- Paquete de moneda ----------
function TarjetaMoneda({
  producto,
  nivel,
  destacado,
  sello,
  comprando,
  deshabilitado,
  onComprar,
}: {
  producto: ProductoComprable;
  nivel: number;
  destacado: boolean;
  sello: string | null;
  comprando: boolean;
  deshabilitado: boolean;
  onComprar: () => void;
}) {
  const t = useTranslations("Vitrina");
  const def = PRODUCTOS[producto];
  const tipo = def.tipo === "cometas" ? "cometas" : "chispas";
  const monto = def.montoCometas ?? def.montoChispas ?? 0;
  const bono = bonoPorcentaje(producto);
  const acento = tipo === "cometas" ? "#5DE4FF" : "#FFC53D";
  return (
    <div
      className={`relative flex h-full flex-col gap-3 rounded-2xl border-2 p-4 pt-5 text-white ${destacado ? "bg-gradient-to-b from-[#2A1F5C] to-[#12172A]" : "bg-[#12172A]"}`}
      style={{ borderColor: destacado ? acento : "rgba(244,228,193,0.25)", boxShadow: destacado ? `6px 6px 0 0 ${acento}` : "4px 4px 0 0 rgba(5,6,15,0.9)" }}
    >
      {sello && <Sello color={acento}>{sello}</Sello>}
      <IlustracionMoneda tipo={tipo} nivel={nivel} />
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="flex items-center gap-1.5 font-display text-2xl font-bold tabular-nums">{monto.toLocaleString()}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/60">{t(tipo === "cometas" ? "cometas" : "chispas")}</span>
        <span className="mt-1 h-5 font-mono text-xs font-bold" style={{ color: acento }}>
          {bono > 0 ? t("extra", { n: bono }) : ""}
        </span>
      </div>
      <div className="mt-auto">
        <BotonBrutal variante={tipo === "cometas" ? "cometa" : "oro"} onClick={onComprar} disabled={deshabilitado}>
          {comprando ? t("procesando") : precioTexto(def.precioUsd)}
        </BotonBrutal>
      </div>
    </div>
  );
}

// ---------- Vitrina del Mercado: Cometas y Chispas ----------
export function VitrinaMonedas({
  pagosHabilitados,
  cometasDisponibles,
  esPro,
}: {
  pagosHabilitados: boolean;
  // Paquetes de Cometas con price_id cargado en el servidor (los demás no se venden).
  cometasDisponibles: ProductoComprable[];
  esPro: boolean;
}) {
  const t = useTranslations("Vitrina");
  const [pestana, setPestana] = useState<"cometas" | "chispas">(cometasDisponibles.length > 0 ? "cometas" : "chispas");
  const { comprar, comprando, error } = useCheckout(() => window.location.reload());
  const lista = pestana === "cometas" ? PAQUETES_COMETAS.filter((p) => cometasDisponibles.includes(p)) : PAQUETES_CHISPAS;
  const mejor = mejorValor(lista);

  return (
    <section className="flex flex-col gap-5 rounded-3xl border-2 border-[#05060F] bg-[#0B1022] p-5 text-white shadow-[6px_6px_0_0_#05060F] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#FFC53D]">{t("eyebrow")}</span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("titulo")}</h2>
          <p className="mt-1 max-w-md text-sm text-white/70">{t(pestana === "cometas" ? "cometasQue" : "chispasQue")}</p>
        </div>
        <div className="flex gap-1 rounded-full border-2 border-[#05060F] bg-[#05060F] p-1">
          {(["cometas", "chispas"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPestana(p)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${pestana === p ? (p === "cometas" ? "bg-[#5DE4FF] text-[#04121A]" : "bg-[#FFC53D] text-[#1A1206]") : "text-white/70 hover:text-white"}`}
            >
              {p === "cometas" ? <IconoCometa className="h-4 w-4" /> : <Chispa tam="1rem" />}
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {!pagosHabilitados || lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/70">{t("noDisponible")}</p>
      ) : (
        <div key={pestana} className={`grid grid-cols-2 gap-4 ${lista.length >= 5 ? "lg:grid-cols-5" : "sm:grid-cols-4"}`}>
          {lista.map((p, i) => (
            <Entrada key={p} i={i} className="h-full">
              <TarjetaMoneda
                producto={p}
                nivel={i}
                destacado={MAS_ELEGIDO.has(p)}
                sello={MAS_ELEGIDO.has(p) ? t("masElegido") : p === mejor ? t("mejorValor") : null}
                comprando={comprando === p}
                deshabilitado={comprando !== null}
                onComprar={() => comprar(p)}
              />
            </Entrada>
          ))}
        </div>
      )}
      {error && <p className="text-sm font-semibold text-[#FF8A8A]">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="flex items-center gap-2 text-xs text-white/60">
          <IconoTrazo nombre="candado" className="h-4 w-4" />
          {t("seguro")}
        </span>
        {!esPro && (
          <Link href="/pro" className="group flex items-center gap-2 rounded-full border border-[#FFC53D]/50 bg-[#FFC53D]/10 px-4 py-2 text-sm font-semibold text-[#FFD36B] transition-colors hover:bg-[#FFC53D]/20">
            <IconoTrazo nombre="corona" className="h-4 w-4" />
            {t("proAtajo")}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}

// ---------- Planes de Pro ----------
export function PlanesPro({ pagosHabilitados, ahorro }: { pagosHabilitados: boolean; ahorro: { usd: number; porcentaje: number; porMes: number } }) {
  const t = useTranslations("Vitrina.planes");
  const router = useRouter();
  const { comprar, comprando, error } = useCheckout(() => router.push("/pro/bienvenida"));
  const planes = [
    {
      producto: "pro_mensual" as const,
      nombre: t("mensual.nombre"),
      periodo: t("mensual.periodo"),
      nota: t("mensual.nota"),
      puntos: [t("mensual.p1"), t("mensual.p2"), t("mensual.p3")],
      destacado: false,
    },
    {
      producto: "pro_anual" as const,
      nombre: t("anual.nombre"),
      periodo: t("anual.periodo"),
      nota: t("anual.nota", { porMes: ahorro.porMes.toFixed(2) }),
      puntos: [t("anual.p1"), t("anual.p2", { usd: ahorro.usd.toFixed(2) }), t("anual.p3")],
      destacado: true,
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-6 sm:grid-cols-2">
        {planes.map((p, i) => (
          <Entrada key={p.producto} i={i + 1}>
            <div
              className={`relative flex h-full flex-col gap-5 rounded-3xl border-2 border-[#05060F] p-6 ${p.destacado ? "bg-gradient-to-br from-[#3B2C8F] via-[#2A1F5C] to-[#12172A] text-white shadow-[8px_8px_0_0_#FFC53D]" : "bg-[#F4E4C1] text-[#1A1206] shadow-[8px_8px_0_0_#05060F]"}`}
            >
              {p.destacado && <Sello color="#FFC53D">{t("anual.sello", { porcentaje: ahorro.porcentaje })}</Sello>}
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${p.destacado ? "text-[#FFD36B]" : "text-[#6C4CF1]"}`}>{p.nombre}</span>
                <IconoTrazo nombre={p.destacado ? "corona" : "destello"} className={`h-6 w-6 ${p.destacado ? "text-[#FFC53D]" : "text-[#6C4CF1]"}`} />
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="font-display text-5xl font-bold leading-none tracking-tight">{precioTexto(PRODUCTOS[p.producto].precioUsd)}</span>
                  <span className={`pb-1 text-sm font-semibold ${p.destacado ? "text-white/70" : "text-[#1A1206]/60"}`}>{p.periodo}</span>
                </div>
                <p className={`mt-1 text-sm ${p.destacado ? "text-white/75" : "text-[#1A1206]/70"}`}>{p.nota}</p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {p.puntos.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-sm font-semibold">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#05060F] ${p.destacado ? "bg-[#FFC53D] text-[#05060F]" : "bg-[#6C4CF1] text-white"}`}>
                      <IconoTrazo nombre="check" className="h-3 w-3" ancho={3.5} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <BotonBrutal variante={p.destacado ? "oro" : "violeta"} onClick={() => comprar(p.producto)} disabled={!pagosHabilitados || comprando !== null}>
                  {!pagosHabilitados ? t("proximamente") : comprando === p.producto ? t("procesando") : t("elegir", { plan: p.nombre })}
                </BotonBrutal>
              </div>
            </div>
          </Entrada>
        ))}
      </div>
      {error && <p className="text-center text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
