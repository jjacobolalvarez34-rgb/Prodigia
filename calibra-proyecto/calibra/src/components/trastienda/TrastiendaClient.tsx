"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconCandado } from "@/components/icons";
import Ruleta from "@/components/trastienda/Ruleta";
import Volado from "@/components/trastienda/Volado";
import Pizarra from "@/components/trastienda/Pizarra";
import HistorialTrastienda from "@/components/trastienda/HistorialTrastienda";
import ApostarPartida from "@/components/trastienda/ApostarPartida";
import PrediccionRanking from "@/components/trastienda/PrediccionRanking";
import LaCalcu from "@/components/trastienda/LaCalcu";
import Acertijos from "@/components/trastienda/Acertijos";
import ElReloj from "@/components/trastienda/ElReloj";

const MONTOS_APUESTA = [25, 50, 100];
const APUESTA_MAXIMA = 200;

interface Props {
  puntosIniciales: number;
  apuestaActivaInicial: boolean;
  ocultarDobleONada: boolean;
}

// La Trastienda es su propio lugar: el sótano del Bazar vive en
// /trastienda, no dentro de la página de la Tienda. Fondo deliberadamente
// más oscuro y contenido que el resto de la app — se siente clandestino.
export default function TrastiendaClient({ puntosIniciales, apuestaActivaInicial, ocultarDobleONada }: Props) {
  const t = useTranslations("Tienda");
  const [puntos, setPuntos] = useState(puntosIniciales);
  const [apuestaActiva, setApuestaActiva] = useState(apuestaActivaInicial);
  const [apostando, setApostando] = useState(false);
  const [errorApuesta, setErrorApuesta] = useState<string | null>(null);
  const [historialVersion, setHistorialVersion] = useState(0);

  async function apostar(monto: number) {
    setApostando(true);
    setErrorApuesta(null);
    try {
      const res = await fetch("/api/tienda/apostar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorApuesta(data.error ?? t("noSePudoApostar"));
        return;
      }
      setPuntos(data.puntos_total);
      setApuestaActiva(true);
    } catch {
      setErrorApuesta(t("noSePudoApostarConexion"));
    } finally {
      setApostando(false);
    }
  }

  return (
    <div
      className="relative min-h-dvh flex-1 overflow-hidden"
      style={{
        background:
          "radial-gradient(85% 65% at 50% -8%, #1d1228 0%, #0b0712 55%, #040309 100%)",
      }}
    >
      {/* Vignette + tenue luz de "celda": el único brillo de la sala */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 0%, rgba(124,92,255,0.10) 0%, transparent 55%), radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
        {/* Cabecera: escalera hacia arriba + la caja fuerte */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-tt-text-muted transition-colors hover:text-tt-text"
            aria-label={t("volverAlBazar")}
          >
            <span aria-hidden>←</span> {t("volverAlBazar")}
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.08em] text-tt-text-muted sm:inline">
              {t("cajaFuerte")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-tt-accent/50 bg-tt-surface-2 px-4 py-1.5">
              <span className="text-sm leading-none text-tt-accent" aria-hidden>
                ⚡
              </span>
              <span
                className="font-mono text-xl font-bold tabular-nums leading-none text-tt-accent"
                style={{ letterSpacing: "0.04em" }}
              >
                {puntos}
              </span>
            </span>
          </div>
        </div>

        {/* Título de la sala */}
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-tt-border bg-tt-surface/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <IconCandado className="h-6 w-6 text-tt-accent" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-tt-text">{t("laTrastienda")}</h1>
          </div>
          <p className="max-w-md text-sm text-tt-text-muted">{t("sotanoDescripcion")}</p>
          <p className="mt-1 inline-flex items-center gap-2 rounded-md bg-tt-surface-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-tt-danger">
            <span aria-hidden>⚠</span> zona clandestina — la casa siempre gana
          </p>
        </div>

        {!ocultarDobleONada && (
          <section
            className="relative overflow-hidden rounded-2xl border border-tt-border bg-tt-surface p-5"
            style={{ boxShadow: "0 8px 32px -8px rgba(0,0,0,0.55)" }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none" aria-hidden>🎲</span>
              <div>
                <p className="font-display text-lg font-bold tracking-tight text-tt-text">{t("dobleONada")}</p>
                <p className="mt-1 text-sm text-tt-text-muted">{t("dobleONadaDescripcion")}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-tt-border bg-tt-surface-2 px-3.5 py-2.5 text-xs font-medium text-tt-text-muted">
              <span aria-hidden>⚠️</span> {t("dobleONadaAviso", { max: APUESTA_MAXIMA })}
            </div>

            {apuestaActiva ? (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-tt-accent/60 bg-tt-surface-2 px-4 py-3">
                <span className="shrink-0 rounded-full bg-tt-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-tt-bg">
                  <span aria-hidden>⏳</span> {t("apuestaPendiente")}
                </span>
                <p className="text-sm font-medium text-tt-text">{t("apuestaActivaAviso")}</p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {apostando && (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-tt-accent/30 border-t-tt-accent" />
                )}
                {MONTOS_APUESTA.map((monto) => (
                  <button
                    key={monto}
                    onClick={() => apostar(monto)}
                    disabled={apostando || puntos < monto}
                    className="rounded-full bg-tt-surface-2 px-5 py-2 font-mono text-sm font-bold text-tt-text transition-all duration-150 hover:scale-105 hover:border-tt-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    style={{ border: "1px solid var(--tt-border)" }}
                  >
                    {t("apostarMonto", { monto })}
                  </button>
                ))}
              </div>
            )}
            {errorApuesta && <p className="mt-3 text-sm font-medium text-tt-danger">{errorApuesta}</p>}
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <ApostarPartida puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
          <PrediccionRanking puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
        </div>

        <Ruleta puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Volado puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
          <Pizarra puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <LaCalcu puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
          <Acertijos puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
          <ElReloj puntos={puntos} onPuntos={setPuntos} onMovimiento={() => setHistorialVersion((v) => v + 1)} />
        </div>

        <HistorialTrastienda refreshKey={historialVersion} />

        {/* "Salí por donde entraste" */}
        <div className="flex justify-center pb-2 pt-1">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-1.5 rounded-full border border-tt-border bg-tt-surface px-5 py-2 font-display text-sm font-semibold text-tt-text-muted transition-colors hover:border-tt-accent/60 hover:text-tt-text"
          >
            ← {t("volverAlBazar")}
          </Link>
        </div>
      </div>
    </div>
  );
}