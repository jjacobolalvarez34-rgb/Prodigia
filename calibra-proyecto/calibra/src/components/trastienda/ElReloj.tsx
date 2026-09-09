"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { InicioElReloj, ResultadoElReloj } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const TIEMPO_TOTAL = 85;
const TOTAL_PROBLEMAS = 15;

// El Reloj del sótano (0124): 15 sumas/restas contra el reloj. Las
// respuestas viven solo en el server; acá se acumulan y se envían al final.
export default function ElReloj({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.elReloj");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [estado, setEstado] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [inicio, setInicio] = useState<InicioElReloj | null>(null);
  const [idx, setIdx] = useState(0);
  const [resolviendo, setResolviendo] = useState("");
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<ResultadoElReloj | null>(null);
  const [restante, setRestante] = useState(TIEMPO_TOTAL);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const relojRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (relojRef.current) clearInterval(relojRef.current);
    };
  }, []);

  async function iniciar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/el-reloj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("elReloj"));
        return;
      }
      const i = data as InicioElReloj;
      setInicio(i);
      setIdx(0);
      setRespuestas([]);
      setResolviendo("");
      setResultado(null);
      setRestante(TIEMPO_TOTAL);
      setEstado("jugando");
      onPuntos(i.puntos_total);
      relojRef.current = setInterval(() => setRestante((r) => Math.max(0, r - 1)), 1000);
    } catch {
      setError(terrores("elReloj"));
    } finally {
      setCargando(false);
    }
  }

  async function finalizar(lista: number[]) {
    if (!inicio) return;
    if (relojRef.current) {
      clearInterval(relojRef.current);
      relojRef.current = null;
    }
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/el-reloj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "finalizar", reloj_id: inicio.id, respuestas: lista }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("elReloj"));
        return;
      }
      const r = data as ResultadoElReloj;
      setResultado(r);
      setEstado("fin");
      onPuntos(r.puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("elReloj"));
    } finally {
      setCargando(false);
    }
  }

  const enviarRespuesta = () => {
    const n = Number(resolviendo);
    if (!inicio || Number.isNaN(n)) return;
    const nueva = [...respuestas, n];
    setRespuestas(nueva);
    setResolviendo("");
    if (nueva.length >= inicio.problemas.length) {
      void finalizar(nueva);
    } else {
      setIdx((prev) => prev + 1);
    }
  };

  const problema = inicio?.problemas[idx];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">⏰ {t("titulo")}</h3>
      <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>

      {estado === "inicio" && (
        <>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 60} className="w-full">
            {cargando ? t("iniciando") : t("jugar", { costo: "60" })}
          </Boton>
          {puntos < 60 && <p className="text-sm font-medium text-tt-danger">{t("sinChispas")}</p>}
        </>
      )}

      {estado === "jugando" && inicio && problema && (
        <>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-tt-text-muted">
              {t("progreso", { n: respuestas.length, total: inicio.problemas.length })}
            </span>
            <span
              className={`font-mono text-xl font-black ${restante <= 15 ? "text-tt-danger" : "text-tt-accent"}`}
            >
              {restante}s
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-4xl font-black text-tt-text">
              {problema.a} {problema.op === "suma" ? "+" : "−"} {problema.b} =
            </p>
            <input
              value={resolviendo}
              onChange={(e) => setResolviendo(e.target.value.replace(/[^0-9-]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarRespuesta();
              }}
              autoFocus
              inputMode="numeric"
              className="w-32 rounded-xl border border-tt-border bg-tt-surface-2 px-4 py-3 text-center font-mono text-2xl font-bold text-tt-text outline-none focus:border-tt-accent"
            />
            <Boton onClick={enviarRespuesta} disabled={resolviendo === "" || cargando} className="w-full">
              {t("siguiente")}
            </Boton>
          </div>
        </>
      )}

      {estado === "fin" && resultado && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-tt-text">
            {t("correctas", { n: resultado.correctas, total: TOTAL_PROBLEMAS })}
          </p>
          <p className="font-mono text-lg font-bold text-tt-accent">{t("premio", { n: resultado.payout })}</p>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 60} className="w-full">
            {t("deNuevo")}
          </Boton>
        </div>
      )}
      {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
    </div>
  );
}