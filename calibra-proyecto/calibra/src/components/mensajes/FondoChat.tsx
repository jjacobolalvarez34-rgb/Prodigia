"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { FONDO_CHAT_POR_SLUG, FONDOS_CHAT, type FondoChat } from "@/lib/mensajes/fondosChat";
import { urlFondoChat } from "@/lib/mensajes/dibujoFondosChat";

// Fondo de una conversación (0262): la misma escena ilustrada que dibuja la app
// (lib/mensajes/dibujoFondosChat.ts), armada para el tamaño del lienzo.
export function estiloFondoChat(fondo: FondoChat | null, ancho = 320, alto = 160): CSSProperties | undefined {
  if (!fondo) return undefined;
  const url = urlFondoChat(fondo.slug, ancho, alto);
  const respaldo = `linear-gradient(170deg, ${fondo.colores.join(", ")})`;
  return {
    backgroundColor: fondo.colores[fondo.colores.length - 1],
    backgroundImage: url ? `${url}, ${respaldo}` : respaldo,
    backgroundSize: "cover",
    backgroundPosition: "center bottom",
    backgroundRepeat: "no-repeat",
  };
}

// Para el chat: mide la caja (redondeado a 40 px, así no se redibuja a cada
// píxel) y devuelve el estilo con la escena de ese tamaño.
export function useEstiloFondoChat<T extends HTMLElement>(fondo: FondoChat | null): [RefObject<T | null>, CSSProperties | undefined] {
  const ref = useRef<T>(null);
  const [tam, setTam] = useState<{ ancho: number; alto: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const medir = () => {
      const ancho = Math.max(40, Math.round(el.clientWidth / 40) * 40);
      const alto = Math.max(40, Math.round(el.clientHeight / 40) * 40);
      setTam((t) => (t && t.ancho === ancho && t.alto === alto ? t : { ancho, alto }));
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // El SVG pesa unos KB: se arma solo cuando cambia el fondo o el tamaño, no
  // con cada tecla que se escribe en el chat.
  const estilo = useMemo(() => estiloFondoChat(fondo, tam?.ancho ?? 640, tam?.alto ?? 480), [fondo, tam]);
  return [ref, estilo];
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

  const muestras = useMemo(() => Object.fromEntries(FONDOS_CHAT.map((f) => [f.slug, estiloFondoChat(f, 160, 84)])), []);
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
              <span className="block h-14 w-full rounded-lg border border-border bg-surface" style={muestras[f.slug]} />
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
