"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import TextoQuimica from "@/components/quimia/TextoQuimica";
import type { FallaRepaso } from "@/lib/practica/repaso";

// Repaso de errores al terminar una partida (pedido 2026-10-12, igual que en la app):
// cada pregunta fallada se toca y se abre con lo que contestaste, la respuesta correcta
// y cómo se resuelve paso a paso. Los pasos los arma el generador de cada pregunta.
export default function RepasoErrores({ fallos, colorHex = "var(--primario)", className = "" }: { fallos: FallaRepaso[]; colorHex?: string; className?: string }) {
  const t = useTranslations("RepasoErrores");
  const [abierto, setAbierto] = useState<number | null>(null);
  if (fallos.length === 0) return null;

  return (
    <div className={`w-full max-w-md rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm ${className}`}>
      <p className="font-display text-sm font-semibold text-foreground">{t("titulo")}</p>
      <p className="mb-2 text-xs text-texto-secundario">{t("sub")}</p>
      <ul className="flex flex-col">
        {fallos.map((f, i) => {
          const abiertoAca = abierto === i;
          return (
            <li key={i} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setAbierto(abiertoAca ? null : i)}
                aria-expanded={abiertoAca}
                className="flex w-full items-center gap-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {f.formato === "quimica" ? <TextoQuimica texto={f.enunciado} /> : <MathText texto={f.enunciado} />}
                  </span>
                  <span className="block truncate font-mono text-xs">
                    <span className="text-error line-through">{f.tuRespuesta ?? t("sinResponder")}</span>
                    <span className="text-texto-secundario">{"  →  "}</span>
                    <span className="text-correcto">
                      {f.formato === "quimica" ? <TextoQuimica texto={f.correcta} /> : <MathText texto={f.correcta} />}
                    </span>
                  </span>
                </span>
                <span className={`font-mono text-lg transition-transform ${abiertoAca ? "rotate-90" : ""}`} style={{ color: colorHex }} aria-hidden="true">
                  ›
                </span>
              </button>
              {abiertoAca && (
                <div className="flex flex-col gap-3 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-error/40 bg-error/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-error">{t("tuRespuesta")}</p>
                      <p className="font-mono text-sm font-semibold text-foreground">{f.tuRespuesta ?? t("sinResponder")}</p>
                    </div>
                    <div className="rounded-xl border border-correcto/40 bg-correcto/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-correcto">{t("correcta")}</p>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {f.formato === "quimica" ? <TextoQuimica texto={f.correcta} /> : <MathText texto={f.correcta} />}
                      </p>
                    </div>
                  </div>
                  {f.pasos.length > 0 ? (
                    <div className="rounded-xl bg-surface-2 px-3 py-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-texto-secundario">{t("comoSeResuelve")}</p>
                      <ol className="flex flex-col gap-2">
                        {f.pasos.map((p, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ color: colorHex, background: `color-mix(in srgb, ${colorHex} 18%, transparent)` }}>
                              {j + 1}
                            </span>
                            <span className="min-w-0">
                              <MathText texto={p} />
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <p className="text-xs text-texto-secundario">{t("sinPasos")}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
