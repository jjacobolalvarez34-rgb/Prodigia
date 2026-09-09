"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { PrediccionActual, ResultadoPrediccion } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const MONTOS = [25, 50, 100, 200];
// Multipliers espejo de los del server (0123 multiplier_prediccion) — solo
// para mostrar la ganancia potencial ANTES de apostar; el server lockea.
const MULT: Record<string, number> = {
  "1": 6.0,
  "2": 4.0,
  "3": 3.0,
  "4-5": 2.2,
  "6-10": 1.65,
  "11-20": 1.3,
  "21+": 1.12,
};
const PUESTOS = ["1", "2", "3", "4-5", "6-10", "11-20", "21+"] as const;

// Mecánica 2: predecí tu propio puesto final del ranking semanal (0123).
export default function PrediccionRanking({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.prediccionRanking");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [predicciones, setPredicciones] = useState<PrediccionActual[]>([]);
  const [semana, setSemana] = useState<string>("");
  const [ventanaAbierta, setVentanaAbierta] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [puesto, setPuesto] = useState<(typeof PUESTOS)[number] | null>(null);
  const [monto, setMonto] = useState<number | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [apostando, setApostando] = useState(false);

  const activa = predicciones[0];

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/predicciones");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("prediccion"));
        return;
      }
      setPredicciones(data.predicciones ?? []);
      setSemana(data.semana ?? "");
      setVentanaAbierta(data.ventanaAbierta ?? false);
      setConfirmada(false);
    } catch {
      setError(terrores("prediccion"));
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

  async function apostar() {
    if (!puesto || !monto) return;
    setApostando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/predicciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puesto, monto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("prediccion"));
        return;
      }
      const r = data as ResultadoPrediccion;
      setConfirmada(true);
      onPuntos(r.puntos_total);
      onMovimiento();
      void cargar();
    } catch {
      setError(terrores("prediccion"));
    } finally {
      setApostando(false);
    }
  }

  const ganancia = puesto && monto ? Math.floor(monto * MULT[puesto]) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🔮 {t("titulo")}</h3>
        <p className="mt-1 max-w-md text-sm text-tt-text-muted">{t("descripcion")}</p>
        {semana && (
          <p className="mt-1 font-mono text-xs text-tt-text-muted">
            {t("semana", { semana: semana.replace("T00:00:00.000Z", "") })}
          </p>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-tt-text-muted">{t("cargando")}</p>
      ) : activa ? (
        <div className="flex flex-col gap-1.5">
          <p className="rounded-xl bg-tt-surface-2 px-3.5 py-2.5 text-sm font-medium text-tt-text">
            {t("tuPrediccion", { puesto: activa.puesto_predicho, monto: activa.monto, mult: activa.multiplier })}
          </p>
          <span
            className={`text-xs font-bold uppercase tracking-wide ${
              activa.estado === "ganada"
                ? "text-tt-success"
                : activa.estado === "perdida"
                  ? "text-tt-danger"
                  : activa.estado === "parcial"
                    ? "text-tt-accent"
                    : "text-tt-text-muted"
            }`}
          >
            {t(`estados.${activa.estado}`, { n: activa.payout })}
          </span>
          {predicciones.slice(1, 4).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-tt-surface-2 px-3 py-2 text-xs">
              <span className="font-mono text-tt-text-muted">{p.semana_inicio}</span>
              <span className="font-semibold text-tt-text">
                {p.puesto_predicho} · {t(`estados.${p.estado}`, { n: p.payout })}
              </span>
            </div>
          ))}
        </div>
      ) : !ventanaAbierta ? (
        <p className="rounded-xl bg-tt-surface-2 px-3.5 py-2.5 text-sm font-medium text-tt-text-muted">
          {t("ventanaCerrada")}
        </p>
      ) : !confirmada ? (
        <>
          <div className="flex flex-wrap gap-2">
            {PUESTOS.map((p) => (
              <button
                key={p}
                onClick={() => setPuesto(p)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  puesto === p
                    ? "bg-tt-accent text-tt-bg"
                    : "border border-tt-border bg-tt-surface text-tt-text hover:border-tt-accent/60"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {MONTOS.map((m) => (
              <button
                key={m}
                onClick={() => setMonto(m)}
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
          {puesto && monto && (
            <p className="font-mono text-sm font-semibold text-tt-accent">
              {t("gananciaPotencial", { mult: MULT[puesto], ganancia })}
            </p>
          )}
          <Boton
            onClick={apostar}
            disabled={!puesto || !monto || puntos < (monto ?? 0) || apostando}
            cargando={apostando}
            className="w-full"
          >
            {apostando ? t("apostando") : t("confirmar")}
          </Boton>
        </>
      ) : (
        <p className="text-sm font-semibold text-tt-success">{t("hecha", { ganancia })}</p>
      )}
      {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
    </div>
  );
}