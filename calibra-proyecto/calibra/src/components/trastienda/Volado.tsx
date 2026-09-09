"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { ResultadoVolado } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const ENTRADAS: Record<number, number> = { 1: 30, 2: 60, 3: 120 };
const PREMIOS: Record<number, number> = { 1: 55, 2: 110, 3: 220 };

export default function Volado({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.volado");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [ronda, setRonda] = useState(1);
  const [eleccion, setEleccion] = useState<boolean | null>(null);
  const [tirando, setTirando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoVolado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const puedeTirar = eleccion !== null && puntos >= ENTRADAS[ronda] && !tirando;

  async function tirar() {
    if (eleccion === null) return;
    setTirando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/trastienda/volado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ronda, eleccion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("tirar"));
        return;
      }
      setResultado(data as ResultadoVolado);
      onPuntos((data as ResultadoVolado).puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("tirar"));
    } finally {
      setTirando(false);
    }
  }

  function resetear() {
    setRonda(1);
    setEleccion(null);
    setResultado(null);
    setError(null);
  }

  function seguir() {
    setRonda((r) => r + 1);
    setResultado(null);
  }

  const monedaCara =
    resultado?.cara === true
      ? { label: t("cara"), color: "#7c5cff" }
      : { label: t("cruz"), color: "#ffc53d" };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🪙 {t("titulo")}</h3>
        <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>
      </div>

      {!resultado ? (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-tt-text-muted">{t("elegiCaraO")}</p>
            <div className="mt-2 flex gap-2">
              {([true, false] as const).map((cara) => (
                <button
                  key={String(cara)}
                  onClick={() => setEleccion(cara)}
                  disabled={tirando}
                  className={`flex-1 rounded-full border-2 px-4 py-2 font-display text-sm font-bold transition-all duration-150 disabled:opacity-40 ${
                    eleccion === cara
                      ? "bg-tt-surface-2 text-tt-text"
                      : "border-tt-border text-tt-text-muted hover:text-tt-text"
                  }`}
                  style={{ borderColor: cara ? "#7c5cff" : "#ffc53d" }}
                >
                  {cara ? t("cara") : t("cruz")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-tt-surface-2 px-3.5 py-2.5 text-xs font-medium text-tt-text-muted">
            <span>{t("ronda", { n: ronda })}</span>
            <span className="font-mono">{t("entrada", { n: ENTRADAS[ronda] })}</span>
          </div>

          <Boton onClick={tirar} disabled={!puedeTirar} cargando={tirando} className="w-full">
            {tirando ? t("tirando") : t("tirar")}
          </Boton>
          {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 text-tt-bg"
            style={{ borderColor: monedaCara.color, background: monedaCara.color }}
          >
            <span className="font-display text-lg font-black">{monedaCara.label}</span>
          </span>

          {resultado.ganaste ? (
            <>
              <p className="rounded-full bg-tt-success/15 px-3 py-1 text-sm font-semibold text-tt-success">
                {t("ganaste", { n: PREMIOS[ronda] })}
              </p>
              {ronda < 3 ? (
                <div className="flex w-full gap-2">
                  <Boton onClick={seguir} className="flex-1 px-3 py-2 text-sm">
                    {t("seguir", { n: ronda + 1 })}
                  </Boton>
                  <Boton onClick={resetear} variante="fantasma" className="flex-1 px-3 py-2 text-sm">
                    {t("parar", { n: resultado.puntos_total })}
                  </Boton>
                </div>
              ) : (
                <Boton onClick={resetear} className="w-full">
                  {t("parar", { n: resultado.puntos_total })}
                </Boton>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-tt-danger">{t("perdiste")}</p>
              <Boton onClick={resetear} variante="fantasma" className="w-full">
                {t("tirar")}
              </Boton>
            </>
          )}
        </div>
      )}
    </div>
  );
}