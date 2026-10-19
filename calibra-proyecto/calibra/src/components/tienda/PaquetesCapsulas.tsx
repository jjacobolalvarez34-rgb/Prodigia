"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import IconoCometa from "@/components/IconoCometa";
import { Link } from "@/i18n/navigation";
import { DibujoCapsula } from "@/components/recompensas/DibujoCapsula";
import { createClient } from "@/lib/supabase/client";
import { comprarPaqueteCapsulas, contenidoCapsula, mensajeError, paquetesCapsulas, type ContenidoCapsula, type PaqueteCapsulas as Paquete } from "@/lib/recompensas/api";
import { CAPSULAS_CON_COMETAS, coloresCapsula, COLOR_RAREZA, textoPremio, type Rareza } from "@/lib/recompensas/catalogo";

// Paquetes de cápsulas con Cometas (0291, pedido 2026-10-19: «microtransacciones»,
// solo con Cometas). Los fijos siempre; los de temporada, mientras dura su evento. Lo
// que trae cada uno y su precio los decide la base (paquetes_capsulas). Se ven las
// probabilidades antes de pagar; las cápsulas quedan en Recompensas › Por abrir.
const PRECIO_SUELTA: Record<string, number> = Object.fromEntries(CAPSULAS_CON_COMETAS.map((c) => [c.tipo, c.costo]));

function Pila({ colores, n }: { colores: [string, string]; n: number }) {
  const visibles = Math.min(3, n);
  return (
    <span className="relative flex h-24 w-28 shrink-0 items-end justify-center">
      {Array.from({ length: visibles }, (_, i) => (
        <span key={i} className="absolute bottom-0" style={{ transform: `translateX(${(i - (visibles - 1) / 2) * 22}px) rotate(${(i - (visibles - 1) / 2) * 8}deg)`, zIndex: i === Math.floor(visibles / 2) ? 3 : 1 }}>
          <DibujoCapsula colores={colores} tam={visibles > 1 ? 70 : 88} />
        </span>
      ))}
      {n > 1 && (
        <span className="absolute -right-1 -top-1 z-10 rounded-lg border-2 border-[#05060F] bg-white px-1.5 py-0.5 font-mono text-xs font-black text-[#05060F] shadow-[2px_2px_0_0_#05060F]">×{n}</span>
      )}
    </span>
  );
}

export default function PaquetesCapsulas() {
  const t = useTranslations("PaquetesCapsulas");
  const tRareza = useTranslations("Recompensas.tienda.rareza");
  const locale = useLocale();
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [contenido, setContenido] = useState<Record<string, ContenidoCapsula[]>>({});
  const [abierto, setAbierto] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<number | null>(null);

  useEffect(() => {
    const sb = createClient();
    paquetesCapsulas(sb).then(async (ps) => {
      setPaquetes(ps);
      const tipos = [...new Set(ps.map((p) => p.tipo))];
      const filas = await Promise.all(tipos.map(async (tipo) => [tipo, await contenidoCapsula(sb, tipo)] as const));
      setContenido(Object.fromEntries(filas));
    });
  }, []);

  if (paquetes.length === 0) return null;

  // Precio de una suelta: las de Cometas tienen precio fijo; la de temporada, el de su paquete de 1.
  const suelta = (p: Paquete) => PRECIO_SUELTA[p.tipo] ?? paquetes.find((x) => x.tipo === p.tipo && x.tema === p.tema && x.cantidad === 1)?.cometas ?? null;
  const fecha = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-US" : "es-CO", { day: "numeric", month: "long" });

  async function comprar(p: Paquete) {
    setOcupado(true);
    setError(null);
    setListo(null);
    try {
      const r = await comprarPaqueteCapsulas(createClient(), p.slug);
      window.dispatchEvent(new CustomEvent("prodigia:cometas", { detail: r.cometas }));
      setListo(r.cantidad);
      setConfirmar(null);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border-2 border-[#05060F] bg-[#0B1022] p-5 text-white shadow-[6px_6px_0_0_#05060F] sm:p-6">
      <div>
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#5DE4FF]">{t("eyebrow")}</span>
        <h2 className="font-display text-2xl font-bold">{t("titulo")}</h2>
        <p className="mt-1 text-sm text-white/70">{t("texto")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {paquetes.map((p) => {
          const colores = coloresCapsula(p.tipo, p.tema);
          const unidad = suelta(p);
          const ahorro = unidad != null && p.cantidad > 1 ? unidad * p.cantidad - p.cometas : 0;
          const filas = contenido[p.tipo] ?? [];
          const total = filas.reduce((a, f) => a + f.peso, 0);
          const nombre = t.has(`nombres.${p.slug}`) ? t(`nombres.${p.slug}`) : p.slug;
          return (
            <div key={p.slug} className="flex flex-col gap-3 rounded-2xl border p-4" style={{ borderColor: p.tema ? `${colores[0]}88` : "rgba(255,255,255,0.15)", background: p.tema ? `linear-gradient(160deg, ${colores[0]}1f, transparent 70%)` : "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-4">
                <Pila colores={colores} n={p.cantidad} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {p.tema && (
                    <span className="w-fit rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-[#05060F]" style={{ background: colores[0] }}>
                      {t("temporada")}
                    </span>
                  )}
                  <span className="font-display text-lg font-bold leading-tight">{nombre}</span>
                  <span className="text-xs text-white/65">
                    {t("cantidad", { n: p.cantidad })}
                    {p.hasta ? ` · ${t("hastaEl", { fecha: fecha(p.hasta) })}` : ""}
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-base font-bold">
                      <IconoCometa className="h-4 w-4" /> {p.cometas}
                    </span>
                    {ahorro > 0 && <span className="rounded-md bg-[#3DDC97]/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#3DDC97]">{t("ahorras", { n: ahorro })}</span>}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setAbierto(abierto === p.slug ? null : p.slug)} className="w-fit text-xs font-semibold text-white/70 underline-offset-2 hover:underline">
                {t("queSale")}
              </button>
              {abierto === p.slug && (
                <ul className="flex flex-col gap-0.5 rounded-xl bg-black/25 px-3 py-2 text-xs">
                  {filas.map((f) => {
                    const rareza = f.premio.startsWith("cosmetico_") ? (f.premio.slice(10) as Rareza) : null;
                    return (
                      <li key={f.premio} className="flex justify-between gap-2">
                        <span style={{ color: rareza ? COLOR_RAREZA[rareza] : colores[0] }}>{rareza ? tRareza(rareza) : textoPremio(f.premio, f.minimo, f.maximo)}</span>
                        <span className="font-mono text-white/70">{total ? Math.round((f.peso / total) * 100) : 0} %</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {confirmar === p.slug ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => comprar(p)}
                    className="rounded-xl border-2 border-[#05060F] bg-[#5DE4FF] px-3 py-2 font-display text-sm font-bold text-[#04121A] shadow-[3px_3px_0_0_#05060F] disabled:opacity-60"
                  >
                    {ocupado ? t("comprando") : t("confirmar", { n: p.cometas })}
                  </button>
                  <button type="button" disabled={ocupado} onClick={() => setConfirmar(null)} className="rounded-xl border-2 border-white/30 px-3 py-2 font-display text-sm font-bold text-white disabled:opacity-60">
                    {t("cancelar")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmar(p.slug);
                    setError(null);
                    setListo(null);
                  }}
                  className="rounded-xl border-2 border-[#05060F] bg-white px-3 py-2 font-display text-sm font-bold text-[#05060F] shadow-[3px_3px_0_0_#05060F] transition-transform hover:-translate-y-0.5"
                >
                  {t("comprar")}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm font-semibold text-[#FF8A8A]">{error}</p>}
      {listo != null && (
        <p className="text-sm font-semibold text-[#3DDC97]">
          {t("listo", { n: listo })}{" "}
          <Link href="/recompensas" className="underline">
            {t("irRecompensas")}
          </Link>
        </p>
      )}
    </section>
  );
}
