"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { ciudadDe } from "@/lib/recompensas/catalogo";
import { constancia, estadisticasPro, mejorHora, precisionDe, tendencia, textoConstancia, type EstadisticasPro } from "@/lib/estadisticasPro";

// Panel de Estadísticas Pro (0293, diseño aprobado el 2026-10-19). Un solo color (el
// violeta de la marca) para la magnitud; el texto, en tintas neutras.
const ESCALA = ["#2A2350", "#3B2F7A", "#5543B0", "#7C5CFF", "#B9A8FF"];

function Seccion({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{titulo}</h2>
        {sub && <p className="text-xs text-texto-secundario">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Analisis({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-primario/35 bg-primario/10 px-3 py-2 text-sm text-foreground">{children}</p>;
}

function nombreTipo(mundo: string, tipo: string): string {
  const c = ciudadDe(mundo)?.nombre ?? mundo;
  const resto = tipo.startsWith(`${mundo}_`) ? tipo.slice(mundo.length + 1).replace(/_/g, " ") : "";
  return resto ? `${c} · ${resto}` : c;
}

export default function PanelEstadisticasPro() {
  const [e, setE] = useState<EstadisticasPro | null | undefined>(undefined);
  useEffect(() => {
    estadisticasPro(createClient()).then(setE);
  }, []);
  if (e === undefined) return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  if (e === null) return null;

  const dias = constancia(e);
  const hora = mejorHora(e);
  const tend = tendencia(e);
  const delta = e.indice - e.indice_antes;
  const maxHora = Math.max(1, ...e.horas.map((h) => precisionDe(h.correctos, h.intentos)));
  const pts = tend.valores.map((v, i) => `${(i / Math.max(1, tend.valores.length - 1)) * 300},${100 - (v - 40) * 1.6}`).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-primario/50 p-6" style={{ background: "linear-gradient(140deg, #2A1F66, transparent 75%)" }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#B9A8FF]">Índice Prodigia · esta semana</p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="font-display text-6xl font-bold text-foreground">{e.indice}</span>
          {e.indice_antes > 0 && <span className={`font-mono text-base ${delta >= 0 ? "text-correcto" : "text-error"}`}>{delta >= 0 ? `▲ ${delta}` : `▼ ${-delta}`}</span>}
        </div>
        <p className="mt-1 text-sm text-texto-secundario">
          Precisión, velocidad y constancia en un solo número.{e.top_pct != null && <> Estás en el <b className="text-foreground">top {e.top_pct} %</b> de esta semana.</>}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            [e.precision != null ? `${e.precision} %` : "—", "precisión"],
            [e.tiempo_ms != null ? `${(e.tiempo_ms / 1000).toFixed(1).replace(".", ",")} s` : "—", "por respuesta"],
            [`${e.dias_7}/7`, "días jugados"],
          ].map(([n, t]) => (
            <div key={t} className="rounded-xl bg-black/25 px-3 py-2">
              <p className="font-mono text-lg font-bold text-foreground">{n}</p>
              <p className="text-xs text-texto-secundario">{t}</p>
            </div>
          ))}
        </div>
      </div>

      <Seccion titulo="Tu constancia" sub="Las últimas 12 semanas: cada cuadro es un día">
        <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
          {dias.map((n, i) => (
            <span key={i} title={`${n} respuestas`} className="aspect-square rounded" style={{ background: n === 0 ? "#171D34" : ESCALA[Math.min(4, Math.floor(n / 15))] }} />
          ))}
        </div>
        <Analisis>{textoConstancia(e)}</Analisis>
      </Seccion>

      {hora && (
        <Seccion titulo="Tu mejor hora" sub="Precisión por hora del día">
          <div className="flex h-24 items-end gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const f = e.horas.find((x) => x.hora === h);
              const p = f && f.intentos >= 5 ? precisionDe(f.correctos, f.intentos) : 0;
              return <div key={h} title={f ? `${h}:00 · ${p} %` : `${h}:00`} className="flex-1 rounded-t" style={{ height: `${(p / maxHora) * 100}%`, background: h === hora.hora ? "#B9A8FF" : "#5543B0" }} />;
            })}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-texto-secundario">
            <span>0 h</span>
            <span>12 h</span>
            <span>23 h</span>
          </div>
          <Analisis>{hora.frase}</Analisis>
        </Seccion>
      )}

      {e.mundos.length > 0 && (
        <Seccion titulo="Tus fortalezas" sub="Precisión por ciudad (últimos 30 días)">
          {e.mundos.map((m) => {
            const c = ciudadDe(m.mundo);
            const p = precisionDe(m.correctos, m.intentos);
            return (
              <div key={m.mundo} className="flex items-center gap-3 text-sm">
                <span className="flex w-28 items-center gap-2 text-foreground">
                  <span className="h-2 w-2 rounded-sm" style={{ background: c?.color ?? "#7C5CFF" }} />
                  {c?.nombre ?? m.mundo}
                </span>
                <div className="h-3 flex-1 rounded bg-[#171D34]">
                  <div className="h-full rounded bg-primario" style={{ width: `${p}%` }} />
                </div>
                <span className="w-24 text-right font-mono text-xs text-texto-secundario">
                  {p} % · {(m.tiempo_ms / 1000).toFixed(1).replace(".", ",")} s
                </span>
              </div>
            );
          })}
          {e.mundos[0] && <Analisis>En {ciudadDe(e.mundos[0].mundo)?.nombre ?? e.mundos[0].mundo} eres más rápido que el {e.mundos[0].mas_lentos_pct} % de los jugadores.</Analisis>}
        </Seccion>
      )}

      {tend.valores.length > 1 && (
        <Seccion titulo="Tu progreso" sub="Precisión semanal">
          <svg viewBox="-6 -6 312 116" className="h-32 w-full">
            {[60, 80, 100].map((g) => (
              <line key={g} x1={0} x2={300} y1={100 - (g - 40) * 1.6} y2={100 - (g - 40) * 1.6} stroke="#232B47" strokeWidth={1} />
            ))}
            <polyline points={pts} fill="none" stroke="#9B85FF" strokeWidth={2} strokeLinejoin="round" />
          </svg>
          <Analisis>{tend.frase}</Analisis>
        </Seccion>
      )}

      {e.debiles.length > 0 && (
        <Seccion titulo="Lo que más te cuesta" sub="Los temas con menos aciertos (últimos 30 días)">
          {e.debiles.map((d) => (
            <div key={d.tipo} className="flex items-center justify-between gap-3 rounded-xl bg-[#171D34] px-4 py-3">
              <div>
                <p className="text-sm font-semibold capitalize text-foreground">{nombreTipo(d.mundo, d.tipo)}</p>
                <p className="font-mono text-xs text-racha">{precisionDe(d.correctos, d.intentos)} % de aciertos</p>
              </div>
              <Link href={`/${d.mundo}`} className="shrink-0 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-white">
                Practicar esto
              </Link>
            </div>
          ))}
        </Seccion>
      )}

      <Seccion titulo="Tus récords">
        <div className="grid grid-cols-3 gap-2">
          {[
            [e.records.mas_rapida_ms != null ? `${(e.records.mas_rapida_ms / 1000).toFixed(1).replace(".", ",")} s` : "—", "respuesta más rápida"],
            [e.records.mejor_dia ? `${e.records.mejor_dia.precision} %` : "—", "mejor día"],
            [e.records.elo != null ? String(e.records.elo) : "—", "ELO"],
          ].map(([n, t]) => (
            <div key={t} className="rounded-xl bg-[#171D34] px-3 py-2">
              <p className="font-mono text-lg font-bold text-foreground">{n}</p>
              <p className="text-xs text-texto-secundario">{t}</p>
            </div>
          ))}
        </div>
      </Seccion>
    </div>
  );
}
