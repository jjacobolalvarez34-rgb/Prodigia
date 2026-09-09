"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconCandado } from "@/components/icons";
import type { ItemHistorial } from "@/lib/trastienda/tipos";

interface Props {
  refreshKey: number;
}

export default function HistorialTrastienda({ refreshKey }: Props) {
  const t = useTranslations("Tienda.trastienda.historial");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const locale = useLocale();
  const [items, setItems] = useState<ItemHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    fetch("/api/trastienda/historial")
      .then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (!activo) return;
        if (!ok) {
          setError((data.error as string) ?? terrores("historial"));
          return;
        }
        setItems((data.items as ItemHistorial[]) ?? []);
        setError(null);
      })
      .catch(() => {
        if (activo) setError(terrores("historial"));
      });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const etiquetaTipo = (tipo: string): string =>
    tipo === "ruleta" ? t("ruleta") : tipo === "pizarra" ? t("la_pizarra") : t("volado");

  return (
    <div className="rounded-2xl border border-tt-border bg-tt-surface p-5">
      <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">📋 {t("titulo")}</h3>
      {error && <p className="mt-2 text-sm font-medium text-tt-danger">{error}</p>}
      {items !== null && items.length === 0 && !error && (
        <p className="mt-3 rounded-xl border border-dashed border-tt-border bg-tt-surface-2 px-4 py-3 text-sm text-tt-text-muted">
          {t("vacio")}
        </p>
      )}
      {items !== null && items.length > 0 && (
        <ul className="mt-3 divide-y divide-tt-border/60 rounded-xl bg-tt-surface-2/60 px-2">
          {items.map((item, i) => (
            <li key={`${item.tipo}-${item.creado_at}-${i}`} className="flex items-center gap-3 py-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: item.tipo === "ruleta" ? "var(--tt-accent)" : "var(--tt-surface)",
                  border: "1px solid var(--tt-border)",
                }}
              >
                {item.tipo === "ruleta" ? (
                  <IconCandado className="h-4 w-4 text-tt-bg" />
                ) : (
                  <span className={`text-sm leading-none ${item.monto > 0 ? "text-tt-success" : "text-tt-text-muted"}`}>
                    {item.monto > 0 ? "▲" : "▼"}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-tt-text">{etiquetaTipo(item.tipo)}</p>
                <p className="truncate text-xs text-tt-text-muted">
                  {new Date(item.creado_at).toLocaleString(locale, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {item.monto > 0 ? (
                <span className="shrink-0 font-mono text-sm font-bold text-tt-success">+{item.monto} ⚡</span>
              ) : (
                <span className="shrink-0 font-mono text-sm font-bold text-tt-text-muted">0 ⚡</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}