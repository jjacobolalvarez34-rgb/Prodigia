"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { contenidoCapsula, type ContenidoCapsula } from "@/lib/recompensas/api";
import { coloresCapsula, type TipoCapsula } from "@/lib/recompensas/catalogo";
import { CONTENIDO_CAPSULAS, GRUPOS_CAPSULAS, porcentaje } from "@/lib/recompensas/contenidoCapsulas";
import { DibujoCapsula } from "./DibujoCapsula";

// «¿Qué trae cada cápsula?»: todas las cápsulas, cómo se consigue cada una y qué puede
// traer con su porcentaje. Las filas se piden a la base (contenido_capsula, lo que de
// verdad se sortea); si no hay red, se muestra la tabla compartida
// (contenidoCapsulas.ts, que un test compara con la migración). Igual que la guía de la
// app (mobile/src/ui/recompensas/GuiaCapsulas.tsx).

const TIPOS = GRUPOS_CAPSULAS.flatMap((g) => g.tipos);

export function useTextoPremio() {
  const t = useTranslations("Recompensas");
  return (f: ContenidoCapsula): string => {
    if (f.premio === "chispas") return f.minimo === f.maximo ? t("premios.chispasFijo", { n: f.minimo }) : t("premios.chispas", { min: f.minimo, max: f.maximo });
    if (f.premio.startsWith("cosmetico_")) return t("premios.cosmetico", { rareza: t(`tienda.rareza.${f.premio.slice(10)}`).toLowerCase() });
    if (f.premio === "coleccion") return t("premios.coleccionSin");
    if (f.premio === "marco_coleccion") return t("premios.marcoColeccionSin");
    return t.has(`premios.${f.premio}`) ? t(`premios.${f.premio}`) : f.premio.replace(/_/g, " ");
  };
}

export default function GuiaCapsulas({ onCerrar }: { onCerrar: () => void }) {
  const t = useTranslations("Recompensas.capsulas");
  const texto = useTextoPremio();
  const [tabla, setTabla] = useState<Record<string, ContenidoCapsula[]>>(CONTENIDO_CAPSULAS);

  useEffect(() => {
    let vivo = true;
    const sb = createClient();
    Promise.all(TIPOS.map(async (tipo) => [tipo, await contenidoCapsula(sb, tipo).catch(() => [])] as const)).then((filas) => {
      if (!vivo) return;
      // Lo que diga la base; lo que no llegó, de la tabla compartida.
      setTabla(Object.fromEntries(filas.map(([tipo, f]) => [tipo, f.length ? f : CONTENIDO_CAPSULAS[tipo]])));
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onCerrar} role="dialog" aria-modal="true" aria-label={t("guia.titulo")}>
      <div className="flex max-h-[88vh] w-full max-w-xl flex-col rounded-3xl border border-border bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border p-5 pb-3">
          <h3 className="font-display text-xl font-bold text-foreground">{t("guia.titulo")}</h3>
          <p className="mt-1 text-sm text-texto-secundario">{t("probabilidades")}</p>
        </div>
        <div className="flex flex-col gap-5 overflow-y-auto p-5">
          {GRUPOS_CAPSULAS.map((g) => (
            <section key={g.id} className="flex flex-col gap-3">
              <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-texto-secundario">{t(`guia.grupos.${g.id}`)}</h4>
              {g.tipos.map((tipo: TipoCapsula) => {
                const filas = tabla[tipo] ?? [];
                const conTema = filas.some((f) => f.premio === "tema_app");
                return (
                  <article key={tipo} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-2 p-3">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0">
                        <DibujoCapsula colores={coloresCapsula(tipo)} tam={44} adorno={null} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base font-bold text-foreground">{t(`nombres.${tipo}`)}</p>
                        <p className="text-xs text-texto-secundario">{t(`guia.como.${tipo}`)}</p>
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <tbody>
                        {filas.map((f) => (
                          <tr key={f.premio} className="border-t border-border/60">
                            <td className={`py-1.5 pr-3 ${f.premio === "tema_app" ? "font-semibold text-primario" : "text-foreground"}`}>{texto(f)}</td>
                            <td className="py-1.5 text-right font-mono font-bold tabular-nums text-foreground">{porcentaje(filas, f)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {conTema && <p className="text-[11px] text-texto-secundario">{t("guia.conTema")}</p>}
                  </article>
                );
              })}
            </section>
          ))}
          <p className="text-xs text-texto-secundario">{t("guia.nota")}</p>
        </div>
        <div className="border-t border-border p-4">
          <button type="button" onClick={onCerrar} className="w-full rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
            {t("cerrar")}
          </button>
        </div>
      </div>
    </div>
  );
}
