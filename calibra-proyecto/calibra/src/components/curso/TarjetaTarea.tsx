"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { RUTA_MUNDO_PAGO, esMundoPago } from "@/lib/mundos/precios";
import { plazoDe, type MiTarea } from "@/lib/docentes/panel";

// Una tarea del curso, vista por el estudiante (en /curso y en el inicio).
export default function TarjetaTarea({ tarea, ahora }: { tarea: MiTarea; ahora: number }) {
  const t = useTranslations("Curso.estudiante.tareas");
  const mundo = MUNDOS_LANDING.find((m) => m.slug === tarea.mundo);
  const color = mundo?.colorHex ?? "#6C4CF1";
  const cumplida = tarea.hechos >= tarea.meta_ejercicios;
  const plazo = plazoDe(tarea.vence_at, ahora);
  const pct = Math.min(100, (tarea.hechos / Math.max(1, tarea.meta_ejercicios)) * 100);
  const textoPlazo = cumplida
    ? t("cumplida")
    : plazo.tipo === "vencida"
      ? t("vencida")
      : plazo.tipo === "hoy"
        ? t("hoy")
        : plazo.tipo === "manana"
          ? t("manana")
          : t("dias", { n: plazo.n });
  const ruta = esMundoPago(tarea.mundo) ? RUTA_MUNDO_PAGO[tarea.mundo] : "/";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 60%, white))` }}
      >
        {mundo && <mundo.Icono className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-display font-bold text-foreground">{tarea.titulo}</p>
          <span className={`shrink-0 text-xs font-semibold ${cumplida ? "text-correcto" : plazo.tipo === "vencida" ? "text-error" : plazo.tipo === "hoy" ? "text-racha" : "text-texto-secundario"}`}>
            {textoPlazo}
          </span>
        </div>
        <p className="truncate text-xs text-texto-secundario">{t("de", { grupo: tarea.grupo, ciudad: mundo?.nombre ?? tarea.mundo })}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cumplida ? "var(--correcto)" : color }} />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-texto-secundario">{t("progreso", { hechos: tarea.hechos, meta: tarea.meta_ejercicios })}</span>
        </div>
        {tarea.instrucciones && <p className="mt-2 text-xs text-texto-secundario">{tarea.instrucciones}</p>}
      </div>
      {!cumplida && plazo.tipo !== "vencida" && (
        <Link href={ruta} className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: color }}>
          {t("practicar")}
        </Link>
      )}
    </div>
  );
}
