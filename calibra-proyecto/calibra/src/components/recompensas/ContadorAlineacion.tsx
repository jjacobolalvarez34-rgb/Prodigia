"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { estadoAlineacion, partesTiempo } from "@/lib/recompensas/contadorAlineacion";

// Reloj que avisa cada segundo (en el servidor no hay hora: se muestra vacío).
function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 1000);
  return () => clearInterval(id);
}
const ahoraEnSegundos = () => Math.floor(Date.now() / 1000);
const sinHora = () => 0;

// Estrellitas fijas del fondo (mismas en cada render).
const ESTRELLAS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, r: 1 + (i % 3) * 0.6, d: (i % 5) * 0.7 }));

// Cuenta regresiva hasta la próxima Gran Alineación (o hasta que termine la actual).
export default function ContadorAlineacion() {
  const t = useTranslations("Recompensas.constelaciones.contador");
  const locale = useLocale();
  const segundos = useSyncExternalStore(suscribir, ahoraEnSegundos, sinHora);
  if (!segundos) return <div className="h-[132px] rounded-2xl border border-border bg-surface" aria-hidden="true" />;
  const e = estadoAlineacion(segundos * 1000);
  const p = partesTiempo(e.restanteMs);
  const fecha = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(e.objetivo));
  const bloques = [
    { v: p.dias, k: "dias" },
    { v: p.horas, k: "horas" },
    { v: p.minutos, k: "minutos" },
    { v: p.segundos, k: "segundos" },
  ] as const;
  return (
    <section
      aria-label={e.enCurso ? t("enCurso") : t("proxima")}
      className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-white ${e.enCurso ? "border-logro shadow-[0_0_30px_rgba(255,182,39,0.35)]" : "border-white/10"}`}
      style={{ background: e.enCurso ? "radial-gradient(circle at 50% 0%, #6b3fd8 0%, #241452 45%, #0b0820 100%)" : "linear-gradient(160deg, #1b1240 0%, #0b0820 70%)" }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {ESTRELLAS.map((s, i) => (
          <span key={i} className="absolute animate-pulse rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, opacity: 0.55, animationDelay: `${s.d}s` }} />
        ))}
      </div>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${e.enCurso ? "text-logro" : "text-white/60"}`}>{e.enCurso ? t("enCurso") : t("proxima")}</p>
        <div className="flex items-end gap-2 sm:gap-3" role="timer" aria-live="off">
          {bloques.map((b, i) => (
            <div key={b.k} className="flex items-end gap-2 sm:gap-3">
              <div className="flex flex-col items-center">
                <span className="min-w-[3.1rem] rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 font-mono text-2xl font-bold tabular-nums sm:text-3xl">{String(b.v).padStart(2, "0")}</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/55">{t(b.k)}</span>
              </div>
              {i < bloques.length - 1 && <span className="pb-6 font-mono text-xl font-bold text-white/40">:</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-white/75">{e.enCurso ? t("terminaEl", { fecha }) : t("empiezaEl", { fecha })}</p>
        <p className="text-xs font-semibold text-logro">{t("premio")}</p>
      </div>
    </section>
  );
}
