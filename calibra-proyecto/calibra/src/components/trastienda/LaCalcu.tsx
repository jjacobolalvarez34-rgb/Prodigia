"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import type { InicioLaCalcu, ResultadoLaCalcu } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

type Token = { num: number } | { op: string };

// La Calcu (0124): armá la secuencia con los 4 números (cada uno una vez)
// y las operaciones + − × ÷. Al tocar "=" el cliente construye un AST JSONB
// ["+", ["−", n0, n1], n2]… y el server lo valida contra el target oculto.
export default function LaCalcu({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.laCalcu");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [estado, setEstado] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [inicio, setInicio] = useState<InicioLaCalcu | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [resultado, setResultado] = useState<ResultadoLaCalcu | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ops = ["+", "-", "×", "÷"];
  const ultimo = tokens[tokens.length - 1];
  const esperaNumero = !ultimo || "op" in ultimo;
  const usados: Record<number, number> = {};
  for (const tk of tokens) if ("num" in tk) usados[tk.num] = (usados[tk.num] ?? 0) + 1;
  // Disponibilidad de botones por CANTIDAD de cada número (puede repetirse).
  const conteo: Record<number, number> = {};
  for (const n of inicio?.numeros ?? []) conteo[n] = (conteo[n] ?? 0) + 1;
  const numerosDisponibles = Object.entries(conteo).flatMap(([n, total]) => {
    const restantes = total - (usados[Number(n)] ?? 0);
    return restantes > 0 ? [Number(n)] : [];
  });

  async function iniciar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/la-calcu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("laCalcu"));
        return;
      }
      setInicio(data as InicioLaCalcu);
      setTokens([]);
      setResultado(null);
      setEstado("jugando");
      onPuntos((data as InicioLaCalcu).puntos_total);
    } catch {
      setError(terrores("laCalcu"));
    } finally {
      setCargando(false);
    }
  }

  async function resolver() {
    if (!inicio || tokens.length !== 7) return; // 4 números + 3 ops
    const ast = buildAst(tokens);
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/trastienda/la-calcu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "resolver", calcu_id: inicio.id, expresion: ast }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? terrores("laCalcu"));
        return;
      }
      const r = data as ResultadoLaCalcu;
      setResultado(r);
      setEstado("fin");
      onPuntos(r.puntos_total);
      onMovimiento();
    } catch {
      setError(terrores("laCalcu"));
    } finally {
      setCargando(false);
    }
  }

  function buildAst(seq: Token[]): unknown {
    const numeros = seq.filter((s): s is { num: number } => "num" in s).map((s) => s.num);
    const opsSeq = seq.filter((s): s is { op: string } => "op" in s).map((s) => s.op);
    let acc: unknown = numeros[0];
    for (let i = 0; i < opsSeq.length; i++) acc = [opsSeq[i], acc, numeros[i + 1]];
    return acc;
  }

  function deshacer() {
    setTokens((prev) => prev.slice(0, -1));
  }

  const puedeResolver = tokens.length === 7 && numerosDisponibles.length === 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-tt-border bg-tt-surface p-5">
      <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🧮 {t("titulo")}</h3>
      <p className="mt-1 text-sm text-tt-text-muted">{t("descripcion")}</p>

      {estado === "inicio" && (
        <>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 50} className="w-full">
            {cargando ? t("iniciando") : t("jugar", { costo: "50" })}
          </Boton>
          {puntos < 50 && <p className="text-sm font-medium text-tt-danger">{t("sinChispas")}</p>}
        </>
      )}

      {estado === "jugando" && inicio && (
        <>
          <p className="font-mono text-xl font-black text-tt-accent">Objetivo: {inicio.target} 🎯</p>
          <div className="flex flex-wrap gap-2">
            {numerosDisponibles.map((n, i) => (
              <button
                key={`${n}-${i}`}
                disabled={!esperaNumero}
                onClick={() => setTokens((prev) => [...prev, { num: n }])}
                className="rounded-xl bg-tt-surface-2 px-4 py-3 font-mono text-xl font-black text-tt-text transition-colors hover:border hover:border-tt-accent/60 disabled:opacity-30"
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ops.map((o) => (
              <button
                key={o}
                disabled={esperaNumero}
                onClick={() => setTokens((prev) => [...prev, { op: o }])}
                className="rounded-xl border border-tt-border bg-tt-surface px-4 py-3 font-mono text-lg font-bold text-tt-text transition-colors hover:border-tt-accent/60 disabled:opacity-30"
              >
                {o}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {tokens.length === 0 ? (
              <p className="text-sm text-tt-text-muted">{t("completa")}</p>
            ) : (
              tokens.map((tk, i) => (
                <span key={i} className="rounded-lg bg-tt-surface-2 px-2.5 py-1 font-mono text-lg font-bold text-tt-text">
                  {"num" in tk ? tk.num : tk.op}
                </span>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Boton onClick={deshacer} disabled={tokens.length === 0} variante="fantasma" className="flex-1">
              {t("deshacer")}
            </Boton>
            <Boton onClick={resolver} disabled={!puedeResolver || cargando} cargando={cargando} className="flex-1">
              {t("resolver")}
            </Boton>
          </div>
        </>
      )}

      {estado === "fin" && resultado && (
        <div className="flex flex-col gap-3">
          <p className={`text-sm font-semibold ${resultado.resolvio ? "text-tt-success" : "text-tt-danger"}`}>
            {resultado.resolvio ? t("resuelta", { n: resultado.payout }) : t("fallida")}
          </p>
          <Boton onClick={iniciar} cargando={cargando} disabled={puntos < 50} className="w-full">
            {t("deNuevo")}
          </Boton>
        </div>
      )}
      {error && <p className="text-sm font-medium text-tt-danger">{error}</p>}
    </div>
  );
}