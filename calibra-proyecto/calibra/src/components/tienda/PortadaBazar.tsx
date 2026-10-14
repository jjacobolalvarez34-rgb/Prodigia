"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import VistaCosmetico from "@/components/recompensas/VistaCosmetico";
import IconoCometa from "@/components/IconoCometa";
import { CATALOGO_NUEVO, COLOR_RAREZA, temporadaActual } from "@/lib/recompensas/catalogo";
import { msHastaCambioDiario, PUESTOS, relojHasta, rotacionDelDia, type PuestoId } from "@/lib/tienda/bazar";

// Portada del Bazar en la web (tienda A + C, 2026-10-14; igual que la app): arriba lo
// del día (rotación con su reloj y la oferta) y abajo la calle con sus puestos. Tocar
// algo del día abre su puesto con ese artículo elegido.

function puestoDeCategoria(categoria: string): PuestoId {
  return PUESTOS.find((p) => p.categorias.includes(categoria))?.id ?? "mercado";
}

export function Toldo({ claro, oscuro, alto = 14 }: { claro: string; oscuro: string; alto?: number }) {
  return (
    <span
      aria-hidden="true"
      className="block w-full"
      style={{
        height: alto,
        background: `repeating-linear-gradient(90deg, ${claro} 0 14px, ${oscuro} 14px 28px)`,
        clipPath: "polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%)",
      }}
    />
  );
}

export default function PortadaBazar({ oferta, extra }: { oferta: ReactNode; extra?: ReactNode }) {
  const t = useTranslations("Bazar");
  const tRareza = useTranslations("Recompensas.tienda.rareza");
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => setAhora(Date.now());
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);
  const hoy = new Date().toISOString().slice(0, 10);
  const rot = useMemo(() => rotacionDelDia(hoy, CATALOGO_NUEVO, temporadaActual()), [hoy]);
  const destacado = CATALOGO_NUEVO.find((x) => x.item === rot.destacado) ?? null;
  const otros = rot.otros.map((s) => CATALOGO_NUEVO.find((x) => x.item === s)).filter((x): x is (typeof CATALOGO_NUEVO)[number] => !!x);

  const precio = (it: (typeof CATALOGO_NUEVO)[number]) =>
    it.precioCometas ? (
      <span className="inline-flex items-center gap-1 font-mono text-sm font-bold">
        <IconoCometa className="h-4 w-4" /> {it.precioCometas}
      </span>
    ) : (
      <span className="font-mono text-sm font-bold text-[#FFC53D]">✦ {it.precio.toLocaleString()}</span>
    );
  const href = (it: (typeof CATALOGO_NUEVO)[number]) => ({ pathname: "/tienda", query: { puesto: puestoDeCategoria(it.categoria), item: it.item } });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-3xl border border-[#FFB627]/50 bg-[#0B1022]/90 p-4 text-white shadow-[0_0_30px_-10px_rgba(255,182,39,0.6)]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFB627]">{t("hoy")}</span>
          <span className="font-mono text-xs font-bold tabular-nums text-[#FFB627]">{ahora != null ? t("cambiaEn", { reloj: relojHasta(msHastaCambioDiario(ahora)) }) : ""}</span>
        </div>
        {destacado && (
          <Link href={href(destacado)} className="flex items-center gap-4 rounded-2xl bg-black/30 p-3 transition-transform hover:-translate-y-0.5">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/5" style={{ boxShadow: `0 0 24px ${COLOR_RAREZA[destacado.rareza]}66` }}>
              <VistaCosmetico categoria={destacado.categoria} valor={destacado.valor} tam={70} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: COLOR_RAREZA[destacado.rareza] }}>
                {tRareza(destacado.rareza)}
              </span>
              <span className="font-display text-xl font-bold">{destacado.nombre}</span>
              {precio(destacado)}
            </span>
          </Link>
        )}
        <div className="grid grid-cols-3 gap-2">
          {otros.map((it) => (
            <Link key={it.item} href={href(it)} className="flex flex-col items-center gap-1 rounded-2xl bg-black/30 p-2 text-center transition-transform hover:-translate-y-0.5">
              <VistaCosmetico categoria={it.categoria} valor={it.valor} tam={44} />
              <span className="line-clamp-2 min-h-[2.2em] text-xs font-semibold leading-tight">{it.nombre}</span>
              {precio(it)}
            </Link>
          ))}
        </div>
      </section>

      {oferta}

      <section className="flex flex-col gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#3D2410]">{t("calle")}</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PUESTOS.map((p) => (
            <Link
              key={p.id}
              href={{ pathname: "/tienda", query: { puesto: p.id } }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1022] text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-1"
            >
              <Toldo claro={p.color} oscuro={p.oscuro} />
              <span className="flex flex-col gap-0.5 px-3 pb-3 pt-2">
                <span className="font-display text-lg font-bold" style={{ color: p.color, textShadow: `0 0 10px ${p.color}` }}>
                  {t(`puestos.${p.id}.nombre`)}
                </span>
                <span className="text-xs text-white/65">{t(`puestos.${p.id}.que`)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      {extra}
    </div>
  );
}

export function CabeceraPuesto({ puesto }: { puesto: PuestoId }) {
  const t = useTranslations("Bazar");
  const p = PUESTOS.find((x) => x.id === puesto)!;
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0B1022] text-white">
      <Toldo claro={p.color} oscuro={p.oscuro} alto={18} />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/tienda" className="text-sm font-semibold text-white/70 hover:text-white">
          ← {t("volverCalle")}
        </Link>
        <span className="font-display text-2xl font-bold" style={{ color: p.color, textShadow: `0 0 12px ${p.color}` }}>
          {t(`puestos.${p.id}.nombre`)}
        </span>
      </div>
    </div>
  );
}
