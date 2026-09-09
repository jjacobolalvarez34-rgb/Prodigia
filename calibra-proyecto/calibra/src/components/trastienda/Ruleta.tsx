"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import { IconCandado } from "@/components/icons";
import {
  SEGMENTOS_RULETA,
  RULETA_COSTO_NORMAL,
  RULETA_COSTO_PRIMERO,
  conicGradientRuleta,
  rotacionParaSegmento,
  type SegmentoRuleta,
} from "@/lib/trastienda/ruleta";
import type { ResultadoRuleta } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

export default function Ruleta({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.ruleta");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const [resultado, setResultado] = useState<ResultadoRuleta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const costo = resultado?.giros_hoy && resultado.giros_hoy >= 1 ? RULETA_COSTO_NORMAL : RULETA_COSTO_PRIMERO;
  const alcanza = puntos >= costo;
  const bloqueado = resultado?.giros_hoy != null && resultado.giros_hoy >= 5;

  async function girar() {
    setGirando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/trastienda/girar-ruleta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("girar"));
        return;
      }
      setRotacion(rotacionParaSegmento(data.segmento as SegmentoRuleta, 5));
      window.setTimeout(() => {
        setResultado(data as ResultadoRuleta);
        setGirando(false);
        onPuntos((data as ResultadoRuleta).puntos_total);
        onMovimiento();
      }, 2600);
    } catch {
      setError(terrores("girar"));
      setGirando(false);
    }
  }

  const premioNombre = (r: ResultadoRuleta): string => {
    if (r.segmento === "nada") return t("premios.nada");
    if (r.segmento === "fuente") return t("premios.fuente");
    if (r.segmento === "marco") return t("premios.marco");
    if (r.premio_tipo === "chispas") {
      const chispas = (r.premio_detalle?.chispas as number | undefined) ?? r.chispas_ganadas;
      return t("premios.chispas", { n: chispas });
    }
    const item = (r.premio_detalle?.item as string | undefined) ?? r.segmento;
    const key = item === "boost" ? "boost" : item === "escudo" ? "escudo" : "congelamiento";
    return t(`premios.${key}`);
  };

  return (
    <div className="rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🎰 {t("titulo")}</h3>
          <p className="mt-1 max-w-md text-sm text-tt-text-muted">{t("descripcion")}</p>
        </div>
        {resultado && resultado.pity_activo && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-tt-accent/60 bg-tt-accent/10 px-3 py-1 text-xs font-semibold text-tt-accent">
            <span aria-hidden>🛡️</span> {t("pityActivo")}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
        <div className="relative h-52 w-52 shrink-0 sm:h-60 sm:w-60">
          <div
            className="absolute inset-0 rounded-full border-4 border-tt-surface-2"
            style={{
              background: conicGradientRuleta(),
              boxShadow: "0 0 0 6px var(--tt-border), 0 14px 40px -10px rgba(0,0,0,0.6)",
              transform: `rotate(${rotacion}deg)`,
              transition: girando ? "transform 2.6s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-tt-border bg-tt-surface-2"
            style={{ boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)" }}
          >
            <IconCandado className="h-7 w-7 text-tt-accent" />
          </div>
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-tt-accent drop-shadow-lg" />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:items-stretch">
          <div className="flex flex-wrap justify-center gap-1.5">
            {SEGMENTOS_RULETA.map((s) => (
              <span
                key={s.slug}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
            ))}
          </div>

          {bloqueado ? (
            <p className="max-w-xs text-center text-sm font-semibold text-tt-danger sm:text-left">
              {t("limiteDiario")}
            </p>
          ) : resultado ? (
            <div className="flex items-center gap-3 rounded-xl border border-tt-accent/40 bg-tt-surface-2 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-tt-text-muted">{t("resultado")}</p>
                <p className="font-display text-base font-bold text-tt-text">{premioNombre(resultado)}</p>
              </div>
              {resultado.segmento === "nada" && (
                <Boton onClick={() => setResultado(null)} variante="fantasma" className="px-3 py-1.5 text-sm">
                  {girando ? t("girando") : t("girar")}
                </Boton>
              )}
            </div>
          ) : (
            <p className="max-w-xs text-center text-xs font-medium text-tt-text-muted sm:text-left">
              {t(resultado ? "girando" : "costoPrimero", { costo: RULETA_COSTO_PRIMERO })}
              {" · "}
              {t("costoNormal", { costo: RULETA_COSTO_NORMAL })}
            </p>
          )}

          {!bloqueado && (
            <Boton onClick={girar} disabled={girando || !alcanza} cargando={girando} className="w-full sm:w-auto">
              {girando ? t("girando") : t("girar")}
            </Boton>
          )}
          {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}