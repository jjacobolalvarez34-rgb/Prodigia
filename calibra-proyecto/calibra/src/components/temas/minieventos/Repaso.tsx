"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import DibujoTema from "@/components/temas/DibujoTema";
import { COLECCIONES } from "@/lib/temas/colecciones";
import { escenaCuaderno } from "@/lib/temas/escenasFiestas";
import { clavePremioMeta, metasDe } from "@/lib/temas/minieventos";
import type { TemaActivo } from "@/lib/temas/temas";
import { useMetasMinievento } from "./useMetasMinievento";

// Vuelta a clases · «Semana de repaso» (0311): cada día que haces 10 aciertos se llena una
// página del cuaderno de la semana y da Lápices (solo).
export default function Repaso({ tema }: { tema: TemaActivo }) {
  const t = useTranslations("Minieventos.repaso");
  const en = useLocale() === "en";
  const ficha = COLECCIONES.vuelta_clases!.ficha;
  const meta = metasDe("vuelta_clases")[0];
  const { desde, hasta } = tema.hoy.rango;
  const { hoy, progreso, premios, cargado, error } = useMetasMinievento("vuelta_clases", true);
  const dias = useMemo(() => {
    const lista: string[] = [];
    for (let d = Date.parse(`${desde}T00:00:00Z`); d <= Date.parse(`${hasta}T00:00:00Z`); d += 86_400_000) lista.push(new Date(d).toISOString().slice(0, 10));
    return lista;
  }, [desde, hasta]);
  const llena = (d: string) => premios.some((p) => p.clave === clavePremioMeta(meta, d));
  const paginas = dias.map((d) => (llena(d) ? "llena" : d === hoy ? "hoy" : "vacia") as "llena" | "hoy" | "vacia");
  const n = Math.min(progreso?.hoy ?? 0, meta.meta);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1A16] p-1">
        <DibujoTema dibujo={escenaCuaderno(paginas)} className="block h-auto w-full" />
      </div>
      <p className="font-mono text-xs font-bold text-[#5DE4FF]">{t("paginas", { n: paginas.filter((p) => p === "llena").length, total: dias.length })}</p>
      {llena(hoy) ? (
        <p className="text-sm font-bold text-[#3DDC97]">{t("llena", { fichas: meta.fichas, ficha: en ? ficha.nombreEn : ficha.nombre })}</p>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#5DE4FF] transition-all" style={{ width: `${(n / meta.meta) * 100}%` }} />
          </div>
          <p className="text-xs text-texto-secundario">{cargado ? t("hoy", { n, meta: meta.meta }) : "…"}</p>
        </div>
      )}
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
