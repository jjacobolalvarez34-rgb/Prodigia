"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { FONDO_CHAT_POR_SLUG, FONDOS_CHAT, puntosPatron, type FondoChat } from "@/lib/mensajes/fondosChat";

// Fondo de una conversación (0262), el mismo que dibuja la app.
export function estiloFondoChat(fondo: FondoChat | null): CSSProperties | undefined {
  if (!fondo) return undefined;
  const capas = [`linear-gradient(170deg, ${fondo.colores.join(", ")})`];
  const tinta = encodeURIComponent(fondo.tinta);
  if (fondo.patron === "cuadricula") {
    capas.unshift(`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M24 0H0V24' fill='none' stroke='${tinta}' stroke-opacity='.3' stroke-width='.6'/%3E%3C/svg%3E")`);
  } else if (fondo.patron === "ondas") {
    capas.unshift(`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Cpath d='M0 20 Q10 14 20 20 T40 20 T60 20 T80 20' fill='none' stroke='${tinta}' stroke-opacity='.18' stroke-width='1.2'/%3E%3C/svg%3E")`);
  } else if (fondo.patron) {
    const puntos = puntosPatron(fondo.patron === "puntos" ? 70 : 46)
      .map((p, i) => `%3Ccircle cx='${(p.x * 2).toFixed(1)}' cy='${(p.y * 2).toFixed(1)}' r='${(p.r * 2 * (fondo.patron === "puntos" ? 0.7 : 1)).toFixed(2)}' fill='${tinta}' fill-opacity='${fondo.patron === "puntos" ? 0.22 : (0.15 + (i % 4) * 0.12).toFixed(2)}'/%3E`)
      .join("");
    capas.unshift(`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E${puntos}%3C/svg%3E")`);
  }
  return { backgroundImage: capas.join(", "), backgroundSize: capas.length > 1 ? "auto, cover" : "cover" };
}

export function ElegirFondoChat({ amigoId, nombreAmigo, actual, onPuesto, onCerrar }: { amigoId: string; nombreAmigo: string; actual: string | null; onPuesto: (slug: string | null) => void; onCerrar: () => void }) {
  const t = useTranslations("Social.mensajes.fondo");
  const [mios, setMios] = useState<string[]>([]);
  const [chispas, setChispas] = useState(0);
  const [elegido, setElegido] = useState(actual ?? "ninguno");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("fondos_chat_desbloqueados, puntos_total").eq("id", data.user.id).maybeSingle();
      const fila = p as { fondos_chat_desbloqueados: string[] | null; puntos_total: number | null } | null;
      setMios(fila?.fondos_chat_desbloqueados ?? []);
      setChispas(fila?.puntos_total ?? 0);
    });
  }, []);

  const fondo = FONDO_CHAT_POR_SLUG[elegido];
  const loTengo = elegido === "ninguno" || mios.includes(elegido);
  const esActual = elegido === (actual ?? "ninguno");

  async function confirmar() {
    const supabase = createClient();
    setOcupado(true);
    setError(null);
    if (!loTengo && fondo) {
      const { data, error: e } = await supabase.rpc("comprar_fondo_chat", { p_fondo: fondo.slug });
      if (e) {
        setError(e.message.includes("chispas insuficientes") ? t("sinChispas") : e.message);
        setOcupado(false);
        return;
      }
      setChispas(data as number);
      setMios((m) => [...m, fondo.slug]);
    }
    const { error: e } = await supabase.rpc("poner_fondo_chat", { p_amigo: amigoId, p_fondo: elegido });
    setOcupado(false);
    if (e) {
      setError(e.message);
      return;
    }
    onPuesto(elegido === "ninguno" ? null : elegido);
    onCerrar();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-foreground">{t("titulo")}</h2>
        <span className="font-mono text-xs tabular-nums text-texto-secundario">⚡ {chispas.toLocaleString()}</span>
      </div>
      <p className="text-xs text-texto-secundario">{t("explicacion", { nombre: nombreAmigo })}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {[{ slug: "ninguno" }, ...FONDOS_CHAT].map((f) => {
          const datos = FONDO_CHAT_POR_SLUG[f.slug] ?? null;
          const mio = f.slug === "ninguno" || mios.includes(f.slug);
          return (
            <button
              key={f.slug}
              type="button"
              onClick={() => setElegido(f.slug)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 text-center ${elegido === f.slug ? "border-primario bg-primario/10" : "border-transparent"}`}
            >
              <span className="block h-14 w-full rounded-lg border border-border bg-surface" style={estiloFondoChat(datos)} />
              <span className="text-xs font-semibold text-foreground">{datos?.nombre ?? t("sinFondo")}</span>
              <span className={`font-mono text-[11px] ${mio ? "text-correcto" : "text-logro"}`}>{f.slug === "ninguno" ? t("gratis") : mio ? `${t("tuyo")} ✓` : `⚡ ${datos?.precio}`}</span>
            </button>
          );
        })}
      </div>
      {!loTengo && fondo && chispas < fondo.precio && <p className="text-xs text-texto-secundario">{t("faltan", { n: fondo.precio - chispas })}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCerrar} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
          {t("cerrar")}
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={ocupado || esActual || (!loTengo && !!fondo && chispas < fondo.precio)}
          className="flex-1 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loTengo ? (esActual ? t("actual") : elegido === "ninguno" ? t("quitar") : t("poner")) : t("comprar", { precio: fondo?.precio ?? 0 })}
        </button>
      </div>
    </div>
  );
}
