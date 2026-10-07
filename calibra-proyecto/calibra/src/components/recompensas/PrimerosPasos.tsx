"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { reproducirTono } from "@/lib/sonido";
import { mensajeError } from "@/lib/recompensas/api";
import { refrescarCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";
import { misPrimerosPasos, primerosPasosTerminados, reclamarPrimerPaso, RUTA_WEB_PRIMEROS_PASOS, type PasoPrimerosPasos } from "@/lib/primerosPasos";

// Tarjeta «Primeros pasos» de la portada (0260), igual que la de la app: 8 tareas
// con premio y uno grande al final. Las hechas se reclaman acá.
export default function PrimerosPasos() {
  const t = useTranslations("PrimerosPasos");
  const [pasos, setPasos] = useState<PasoPrimerosPasos[]>([]);
  const [abierta, setAbierta] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(() => {
    misPrimerosPasos(createClient()).then(setPasos);
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  if (primerosPasosTerminados(pasos)) return null;
  const tareas = pasos.filter((p) => p.tarea !== "final");
  const final = pasos.find((p) => p.tarea === "final");
  const reclamadas = tareas.filter((p) => p.reclamada).length;
  const visibles = abierta ? tareas : tareas.filter((p) => !p.reclamada).slice(0, 2);
  const premio = (p: PasoPrimerosPasos) => (p.premio === "hielo" ? t("premio.hielo", { n: p.cantidad }) : t("premio.chispas", { n: p.cantidad }));

  async function reclamar(p: PasoPrimerosPasos) {
    setOcupado(p.tarea);
    try {
      await reclamarPrimerPaso(createClient(), p.tarea);
      reproducirTono("logro");
      setAviso(p.tarea === "final" ? t("finalReclamado") : `+${premio(p)}`);
      setTimeout(() => setAviso(null), 2500);
      refrescarCosmeticosWeb();
      cargar();
    } catch (e) {
      setAviso(mensajeError(e));
    } finally {
      setOcupado(null);
    }
  }

  const fila = (p: PasoPrimerosPasos) => (
    <li key={p.tarea} className="flex items-center gap-3 py-1.5">
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] ${p.reclamada ? "border-correcto bg-correcto text-background" : p.hecha ? "border-logro" : "border-border"}`}>{p.reclamada ? "✓" : ""}</span>
      <div className="min-w-0 flex-1">
        {p.hecha || !RUTA_WEB_PRIMEROS_PASOS[p.tarea] ? (
          <p className={`text-sm font-semibold text-foreground ${p.reclamada ? "line-through opacity-60" : ""}`}>{t(`tareas.${p.tarea}.titulo`)}</p>
        ) : (
          <Link href={RUTA_WEB_PRIMEROS_PASOS[p.tarea]!} className="text-sm font-semibold text-foreground hover:text-primario">
            {t(`tareas.${p.tarea}.titulo`)} →
          </Link>
        )}
        <p className="text-xs text-texto-secundario">{t(`tareas.${p.tarea}.ensena`)}</p>
      </div>
      {!p.reclamada &&
        (p.hecha ? (
          <button type="button" disabled={ocupado === p.tarea} onClick={() => reclamar(p)} className="shrink-0 rounded-full bg-logro px-3 py-1 font-mono text-xs font-bold text-[#2A1A00] disabled:opacity-60">
            {t("reclamar", { premio: premio(p) })}
          </button>
        ) : (
          <span className="shrink-0 rounded-full border border-logro/60 px-3 py-1 font-mono text-xs text-logro">{premio(p)}</span>
        ))}
    </li>
  );

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-primario/40 bg-surface px-5 py-4">
      <button type="button" onClick={() => setAbierta((a) => !a)} className="flex items-center justify-between text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-primario">{t("titulo")}</span>
        <span className="text-xs text-texto-secundario">
          {reclamadas}/8 · {abierta ? t("ocultar") : t("verTodo")}
        </span>
      </button>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-logro transition-all" style={{ width: `${(reclamadas / 8) * 100}%` }} />
      </div>
      <ul className="flex flex-col">
        {visibles.map(fila)}
        {final?.hecha && fila(final)}
      </ul>
      {!abierta && final && !final.hecha && <p className="text-xs text-texto-secundario">{t("alFinal")}</p>}
      {aviso && <p className="text-sm font-semibold text-logro">{aviso}</p>}
    </section>
  );
}
