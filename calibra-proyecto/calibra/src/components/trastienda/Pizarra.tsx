"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { AdivinanzaPizarra, InicioPizarra } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

export default function Pizarra({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.pizarra");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [partidaId, setPartidaId] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);
  const [numero, setNumero] = useState("");
  const [pista, setPista] = useState<string | null>(null);
  const [terminado, setTerminado] = useState(false);
  const [ganado, setGanado] = useState(false);
  const [payout, setPayout] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numeroValido = /^\d{1,3}$/.test(numero) && Number(numero) >= 1 && Number(numero) <= 100;

  async function entrar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/pizarra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("pizarra"));
        return;
      }
      const inicio = data as InicioPizarra;
      setPartidaId(inicio.pizarra_id);
      setIntentos(0);
      setPista(null);
      setTerminado(false);
      setGanado(false);
      setPayout(0);
      setNumero("");
      onPuntos(inicio.puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("pizarra"));
    } finally {
      setCargando(false);
    }
  }

  async function preguntar() {
    if (!partidaId || !numeroValido) return;
    const n = Number(numero);
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/pizarra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "adivinar", pizarra_id: partidaId, numero: n }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("pizarra"));
        return;
      }
      const adiv = data as AdivinanzaPizarra;
      setIntentos(adiv.intentos);
      setPista(adiv.pista);
      setNumero("");
      setTerminado(adiv.terminado);
      setGanado(adiv.ganaste);
      setPayout(adiv.chispas_ganadas);
      onPuntos(adiv.puntos_total);
      if (adiv.terminado) onMovimiento();
    } catch {
      setError(terrores("pizarra"));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">📝 {t("titulo")}</h3>
        <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>
      </div>

      {partidaId === null ? (
        <>
          <p className="rounded-xl bg-tt-surface-2 px-3.5 py-2.5 font-mono text-xs font-semibold text-tt-text-muted">
            {t("entrar")}
          </p>
          <Boton onClick={entrar} disabled={puntos < 30 || cargando} cargando={cargando} className="w-full">
            {cargando ? t("entrando") : t("entrar")}
          </Boton>
          {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
        </>
      ) : !terminado ? (
        <>
          <div className="flex items-center justify-between rounded-xl bg-tt-surface-2 px-3.5 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-tt-text-muted">
              {t("intentos", { n: intentos })}
            </span>
            {pista && (
              <span className="inline-flex items-center gap-2 font-mono text-sm font-bold text-tt-accent">{pista}</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && preguntar()}
              inputMode="numeric"
              placeholder="1–100"
              className="w-full rounded-full border border-tt-border bg-tt-surface-2 px-4 py-2 font-mono text-sm font-bold text-tt-text outline-none placeholder:text-tt-text-muted/60 focus:border-tt-accent/60"
            />
            <Boton
              onClick={preguntar}
              disabled={!numeroValido || puntos < 10 || cargando}
              cargando={cargando}
              className="shrink-0 px-4 py-2 text-sm"
            >
              {t("preguntar")}
            </Boton>
          </div>
          {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className={`text-sm font-semibold ${ganado ? "text-tt-success" : "text-tt-danger"}`}>
            {ganado ? t("ganaste", { n: payout }) : t("perdiste")}
          </p>
          <Boton onClick={() => setPartidaId(null)} variante="fantasma" className="w-full">
            {t("deNuevo")}
          </Boton>
        </div>
      )}
    </div>
  );
}