"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { LimitesApuestas, MiApuesta, PartidaDisponible, PreviewApuesta, ResultadoApostar } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const MONTOS = [25, 50, 100, 200];
const POR_PAGINA = 3;

// Mecánica 1: apostar al resultado de un duelo de OTRO jugador (0123).
// El feed y las odds vienen del server; el multiplier se lockea al apostar.
export default function ApostarPartida({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.apuestasPartida");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [partidas, setPartidas] = useState<PartidaDisponible[]>([]);
  const [misApuestas, setMisApuestas] = useState<MiApuesta[]>([]);
  const [limites, setLimites] = useState<LimitesApuestas>({ apuestas_realizadas: 0, monto_total_apostado: 0, perdida_total: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selección en la mesa de apuestas.
  const [seleccionada, setSeleccionada] = useState<PartidaDisponible | null>(null);
  const [eleccion, setEleccion] = useState<"a" | "b" | "empate" | null>(null);
  const [monto, setMonto] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewApuesta | null>(null);
  const [apostando, setApostando] = useState(false);
  const [confirmada, setConfirmada] = useState(false);
  const [pagina, setPagina] = useState(0);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/apuestas");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("apuestas"));
        return;
      }
      setPartidas(data.disponibles ?? []);
      setMisApuestas(data.misApuestas ?? []);
      setLimites(data.limites ?? { apuestas_realizadas: 0, monto_total_apostado: 0, perdida_total: 0 });
      setPagina(0);
    } catch {
      setError(terrores("apuestas"));
    } finally {
      setCargando(false);
    }
  }, [terrores]);

  useEffect(() => {
    let cancelado = false;
    Promise.resolve().then(() => {
      if (!cancelado) void cargar();
    });
    return () => {
      cancelado = true;
    };
  }, [cargar]);

  async function pedirPreview(p: PartidaDisponible, e: "a" | "b" | "empate", m: number) {
    const res = await fetch("/api/trastienda/apuestas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "preview", partida_id: p.partida_id, eleccion: e, monto: m }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? terrores("apuestas"));
      return;
    }
    setPreview(data as PreviewApuesta);
  }

  function elegir(p: PartidaDisponible) {
    setSeleccionada(p);
    setEleccion(null);
    setMonto(null);
    setPreview(null);
    setConfirmada(false);
    setError(null);
  }

  async function apostar() {
    if (!seleccionada || !eleccion || !monto) return;
    setApostando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/apuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "apostar", partida_id: seleccionada.partida_id, eleccion, monto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("apuestas"));
        return;
      }
      const r = data as ResultadoApostar;
      setConfirmada(true);
      onPuntos(r.puntos_total);
      onMovimiento();
      void cargar();
    } catch {
      setError(terrores("apuestas"));
    } finally {
      setApostando(false);
    }
  }

  const topLimite = limites.apuestas_realizadas >= 10 || limites.monto_total_apostado >= 500;
  const mostrarLimites = limites.apuestas_realizadas + limites.monto_total_apostado > 0;
  const paginas = Math.max(1, Math.ceil(partidas.length / POR_PAGINA));
  const visibles = partidas.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🎯 {t("titulo")}</h3>
          <p className="mt-1 max-w-md text-sm text-tt-text-muted">{t("descripcion")}</p>
        </div>
        {mostrarLimites && (
          <span className="rounded-full border border-tt-border bg-tt-surface-2 px-3 py-1 font-mono text-xs font-semibold text-tt-text-muted">
            {t("limiteDia", { hoy: limites.apuestas_realizadas, monto: limites.monto_total_apostado })}
          </span>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-tt-text-muted">{t("cargando")}</p>
      ) : error && partidas.length === 0 ? (
        <p className="text-sm font-medium text-tt-danger">{error}</p>
      ) : partidas.length === 0 ? (
        <p className="rounded-xl bg-tt-surface-2 px-3.5 py-2.5 text-sm font-medium text-tt-text-muted">{t("sinPartidas")}</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-tt-border bg-tt-surface-2 px-3 py-1 font-mono text-xs font-semibold text-tt-text-muted">
              {t("enLinea", { n: partidas.length })}
            </span>
            {paginas > 1 && (
              <span className="font-mono text-xs font-semibold text-tt-text-muted">
                {t("pagina", { actual: pagina + 1, total: paginas })}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {visibles.map((p) => (
              <li key={p.partida_id}>
                <button
                  onClick={() => elegir(p)}
                  disabled={topLimite}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-tt-border bg-tt-surface-2 px-4 py-3 text-left transition-colors hover:border-tt-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-bold text-tt-text">
                      {p.nombre_a} <span className="text-tt-text-muted">vs</span> {p.nombre_b}
                    </span>
                    <span className="font-mono text-xs text-tt-text-muted">
                      {t(`operaciones.${p.operation_type}`)} · ELO {p.elo_a}–{p.elo_b}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-tt-accent/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tt-accent">
                    {t("apostar")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {paginas > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="rounded-full border border-tt-border bg-tt-surface-2 px-4 py-1.5 text-sm font-semibold text-tt-text transition-colors hover:border-tt-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← {t("anterior")}
              </button>
              <div className="flex gap-1">
                {Array.from({ length: paginas }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagina(i)}
                    aria-label={t("pagina", { actual: i + 1, total: paginas })}
                    className={`h-7 w-7 rounded-full font-mono text-xs font-bold transition-colors ${
                      i === pagina
                        ? "bg-tt-accent text-tt-bg"
                        : "border border-tt-border bg-tt-surface text-tt-text-muted hover:border-tt-accent/60"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
                disabled={pagina >= paginas - 1}
                className="rounded-full border border-tt-border bg-tt-surface-2 px-4 py-1.5 text-sm font-semibold text-tt-text transition-colors hover:border-tt-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("siguiente")} →
              </button>
            </div>
          )}
        </>
      )}
      {error && partidas.length > 0 && <p className="text-sm font-medium text-tt-danger">{error}</p>}
      {topLimite && <p className="text-sm font-semibold text-tt-danger">{t("limiteDiaAlcanzado")}</p>}

      {seleccionada && (
        <div className="rounded-xl border border-tt-accent/40 bg-tt-surface-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold text-tt-text">
              {seleccionada.nombre_a} vs {seleccionada.nombre_b}
            </p>
            <button
              onClick={() => setSeleccionada(null)}
              className="text-sm text-tt-text-muted transition-colors hover:text-tt-text"
            >
              ✕
            </button>
          </div>

          {!confirmada ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["a", `${t("ganador", { nombre: seleccionada.nombre_a.split(" ")[0] })}`],
                    ["b", `${t("ganador", { nombre: seleccionada.nombre_b.split(" ")[0] })}`],
                    ["empate", t("empate")],
                  ] as Array<["a" | "b" | "empate", string]>
                ).map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    onClick={() => {
                      setEleccion(valor);
                      if (monto) void pedirPreview(seleccionada, valor, monto);
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      eleccion === valor
                        ? "bg-tt-accent text-tt-bg"
                        : "border border-tt-border bg-tt-surface text-tt-text hover:border-tt-accent/60"
                    }`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {MONTOS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMonto(m);
                      if (eleccion) void pedirPreview(seleccionada, eleccion, m);
                    }}
                    disabled={monto === m}
                    className={`rounded-full px-4 py-1.5 font-mono text-sm font-bold transition-colors ${
                      monto === m
                        ? "bg-tt-accent text-tt-bg"
                        : "border border-tt-border bg-tt-surface text-tt-text hover:border-tt-accent/60"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {preview && eleccion && monto && (
                <p className="mt-3 font-mono text-sm font-semibold text-tt-accent">
                  {t("gananciaPotencial", {
                    mult: preview.multiplier,
                    ganancia: preview.ganancia_potencial,
                  })}
                </p>
              )}

              <Boton
                onClick={apostar}
                disabled={!eleccion || !monto || puntos < (monto ?? 0) || apostando}
                cargando={apostando}
                className="mt-4 w-full"
              >
                {apostando ? t("apostando") : t("confirmar")}
              </Boton>
              {puntos < (monto ?? 0) && <p className="mt-2 text-sm font-medium text-tt-danger">{t("sinChispas")}</p>}
            </>
          ) : (
            <p className="mt-3 text-sm font-semibold text-tt-success">
              {t("apuestaHecha", { ganancia: preview?.ganancia_potencial ?? 0 })}
            </p>
          )}
          {error && <p className="mt-2 text-sm font-medium text-tt-danger">{error}</p>}
        </div>
      )}

      {misApuestas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-tt-text-muted">{t("misApuestas")}</p>
          {misApuestas.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-tt-surface-2 px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-tt-text-muted">
                {a.eleccion === "empate" ? t("empate") : `J${a.eleccion.toUpperCase()}`} · {a.monto} × {a.multiplier}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  a.estado === "ganada"
                    ? "text-tt-success"
                    : a.estado === "perdida"
                      ? "text-tt-danger"
                      : a.estado === "empate_devuelto"
                        ? "text-tt-text-muted"
                        : "text-tt-accent"
                }`}
              >
                {a.estado === "ganada"
                  ? t("estados.ganada", { n: a.payout })
                  : a.estado === "perdida"
                    ? t("estados.perdida")
                    : a.estado === "empate_devuelto"
                      ? t("estados.devuelta")
                      : t("estados.pendiente")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}