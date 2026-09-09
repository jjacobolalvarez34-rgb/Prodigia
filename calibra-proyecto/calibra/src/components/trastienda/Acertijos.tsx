"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { InicioAcertijos, ResultadoAcertijos } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

// Acertijos de Enigmia (0124): el server genera una secuencia la muestra una
// vez (3s) y el jugador debe reproducir el orden exacto de los símbolos.
export default function Acertijos({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.acertijos");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [estado, setEstado] = useState<"inicio" | "memorizando" | "jugando" | "fin">("inicio");
  const [inicio, setInicio] = useState<InicioAcertijos | null>(null);
  const [orden, setOrden] = useState<number[]>([]);
  const [resultado, setResultado] = useState<ResultadoAcertijos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function iniciar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/acertijos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("acertijos"));
        return;
      }
      setInicio(data as InicioAcertijos);
      setOrden([]);
      setResultado(null);
      setEstado("memorizando");
      onPuntos((data as InicioAcertijos).puntos_total);
      timerRef.current = setTimeout(() => setEstado("jugando"), 3000);
    } catch {
      setError(terrores("acertijos"));
    } finally {
      setCargando(false);
    }
  }

  async function responder(secuencia: number[]) {
    if (!inicio) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/acertijos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "responder", acertijo_id: inicio.id, secuencia }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("acertijos"));
        return;
      }
      const r = data as ResultadoAcertijos;
      setResultado(r);
      setEstado("fin");
      onPuntos(r.puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("acertijos"));
    } finally {
      setCargando(false);
    }
  }

  // Botones de símbolos: los primeros N slots se llenan en orden de toque,
  // y los símbolos ya usados quedan tachados.
  const disponibles = [...new Set([...Array(8).keys()].map((i) => i + 1))];

  const fin = () => {
    if (!inicio) return;
    if (orden.length === inicio.secuencia.length) void responder(orden);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🔢 {t("titulo")}</h3>
      <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>

      {estado === "inicio" && (
        <>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 100} className="w-full">
            {cargando ? t("iniciando") : t("jugar", { costo: "100" })}
          </Boton>
          {puntos < 100 && <p className="text-sm font-medium text-tt-danger">{t("sinChispas")}</p>}
        </>
      )}

      {estado === "memorizando" && inicio && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-tt-text-muted">
            {t(`dificultades.${inicio.dificultad}`)} — {t("memoriza")}
          </p>
          <div className="flex gap-2">
            {inicio.secuencia.map((s, i) => (
              <span
                key={i}
                className="grid h-12 w-12 place-items-center rounded-xl bg-tt-accent font-mono text-xl font-black text-tt-bg"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {estado === "jugando" && inicio && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-tt-text-muted">
              {t("completa")} ({orden.length}/{inicio.secuencia.length})
            </p>
            <div className="flex gap-2">
              {inicio.secuencia.map((_, i) => (
                <span
                  key={i}
                  className={`grid h-12 w-12 place-items-center rounded-xl font-mono text-xl font-black ${
                    i < orden.length ? "bg-tt-surface-2 text-tt-text" : "border border-dashed border-tt-border text-tt-text-muted"
                  }`}
                >
                  {i < orden.length ? orden[i] : "?"}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {disponibles.map((s) => {
              const usos = orden.filter((o) => o === s).length;
              const usosMax = inicio.secuencia.filter((x) => x === s).length;
              const agotado = usos >= usosMax;
              return (
                <button
                  key={s}
                  disabled={agotado}
                  onClick={() => setOrden((prev) => (prev.length < inicio.secuencia.length ? [...prev, s] : prev))}
                  className="rounded-xl border border-tt-border bg-tt-surface-2 py-3 font-mono text-lg font-bold text-tt-text transition-colors hover:border-tt-accent/60 disabled:opacity-30"
                >
                  {s}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Boton onClick={() => setOrden((prev) => prev.slice(0, -1))} disabled={orden.length === 0} variante="fantasma" className="flex-1">
              {t("deshacer")}
            </Boton>
            <Boton onClick={fin} disabled={orden.length !== inicio.secuencia.length || cargando} cargando={cargando} className="flex-1">
              {t("confirmar")}
            </Boton>
          </div>
        </>
      )}

      {estado === "fin" && resultado && (
        <div className="flex flex-col gap-3">
          <p className={`text-sm font-semibold ${resultado.ganado ? "text-tt-success" : "text-tt-danger"}`}>
            {resultado.ganado ? t("resuelto", { n: resultado.payout }) : t("fallido")}
          </p>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 100} className="w-full">
            {t("deNuevo")}
          </Boton>
        </div>
      )}
      {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
    </div>
  );
}