"use client";

import { useState, useCallback, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PestanaAprender } from "@/lib/aprender/clases";
import AprenderLayout from "@/components/AprenderLayout";
import CaminoContinuo, { type UnidadCaminoGenerico } from "@/components/CaminoContinuo";

interface Props {
  // Encabezado y panel de progreso del layout compartido de Aprender.
  titulo: string;
  subtitulo: string;
  progresoLabel: string;
  progresoTexto: string;
  colorHex: string;
  basePath: string;
  // Temas (unidades) de la pestaña "Técnicas" (gratis) y de la pestaña
  // "Clases" (Pro). Si `clases` es null/undefined/vacío la pestaña NO se
  // muestra (mundo sin clases: se ve idéntico a como era antes).
  tecnicas: UnidadCaminoGenerico[];
  clases?: UnidadCaminoGenerico[] | null;
  // Plan del usuario: para no-Pro se muestra el aviso "Clase 1 gratis, el
  // resto es Pro" con link a `proHref` en la pestaña Clases.
  esPro: boolean;
  proHref?: string;
  // Pestaña inicial (resolverla en el server con resolverPestanaInicial
  // a partir de searchParams.tab). Default: "tecnicas".
  defaultTab?: PestanaAprender;
}

const ORDEN: PestanaAprender[] = ["tecnicas", "clases"];

// Aprender con pestañas "Técnicas | Clases" (fila 22 de docs/PARIDAD_MUNDOS.md)
// SOBRE el layout compartido de Aprender (fila 3): panel de temas sticky a
// la izquierda con el progreso y el botón "Ocultar temas", camino a la
// derecha — el diseño de Melodía/Trigonometría. Las pestañas solo cambian
// el camino que se muestra (y con él los temas del panel): no hay otro
// layout. La pestaña activa se recuerda en la URL (?tab=clases) con
// history.replaceState — sin navegación ni re-render del server — así un
// refresh, un link compartido o el "Volver a Aprender" de una lección
// caen en la pestaña correcta.
export default function AprenderTabs({
  titulo,
  subtitulo,
  progresoLabel,
  progresoTexto,
  colorHex,
  basePath,
  tecnicas,
  clases,
  esPro,
  proHref,
  defaultTab = "tecnicas",
}: Props) {
  const t = useTranslations("Aprender.tabs");
  const baseId = useId();
  const hayClases = !!clases && clases.some((u) => u.nodos.length > 0);
  const [activa, setActiva] = useState<PestanaAprender>(hayClases ? defaultTab : "tecnicas");
  const refs = useRef<Record<PestanaAprender, HTMLButtonElement | null>>({ tecnicas: null, clases: null });

  const seleccionar = useCallback((tab: PestanaAprender) => {
    setActiva(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === "clases") url.searchParams.set("tab", "clases");
      else url.searchParams.delete("tab");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // Entornos sin history/URL disponibles — el estado local alcanza.
    }
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = ORDEN.indexOf(activa);
    let destino: PestanaAprender | null = null;
    if (e.key === "ArrowRight") destino = ORDEN[(i + 1) % ORDEN.length];
    else if (e.key === "ArrowLeft") destino = ORDEN[(i - 1 + ORDEN.length) % ORDEN.length];
    else if (e.key === "Home") destino = ORDEN[0];
    else if (e.key === "End") destino = ORDEN[ORDEN.length - 1];
    if (destino) {
      e.preventDefault();
      seleccionar(destino);
      refs.current[destino]?.focus();
    }
  }

  const nodosDe = (us: UnidadCaminoGenerico[]) => us.flatMap((u) => u.nodos);
  const dominadasDe = (us: UnidadCaminoGenerico[]) => nodosDe(us).filter((n) => n.estado === "completado").length;
  const todas = [...tecnicas, ...(hayClases ? clases! : [])];
  const unidadesActivas = activa === "clases" && hayClases ? clases! : tecnicas;

  const resumen = (us: UnidadCaminoGenerico[]) =>
    us.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      dominadas: u.nodos.filter((n) => n.estado === "completado").length,
      total: u.nodos.length,
    }));

  const pestanas: { id: PestanaAprender; label: string; badge: string; pro?: boolean }[] = [
    { id: "tecnicas", label: t("tecnicas"), badge: `${dominadasDe(tecnicas)}/${nodosDe(tecnicas).length}` },
    ...(hayClases
      ? [{ id: "clases" as const, label: t("clases"), badge: `${dominadasDe(clases!)}/${nodosDe(clases!).length}`, pro: true }]
      : []),
  ];

  return (
    <AprenderLayout
      titulo={titulo}
      subtitulo={subtitulo}
      progresoLabel={progresoLabel}
      tecnicasTexto={progresoTexto}
      colorHex={colorHex}
      unidadesSidebar={resumen(unidadesActivas)}
      totalDominadas={dominadasDe(todas)}
      totalTecnicas={nodosDe(todas).length}
    >
      {hayClases && (
        <div
          role="tablist"
          aria-label={t("aria")}
          className="mt-4 flex gap-1 rounded-2xl border border-border bg-surface p-1"
        >
          {pestanas.map((p) => {
            const seleccionada = activa === p.id;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  refs.current[p.id] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${p.id}`}
                aria-selected={seleccionada}
                aria-controls={`${baseId}-panel`}
                tabIndex={seleccionada ? 0 : -1}
                onClick={() => seleccionar(p.id)}
                onKeyDown={onKeyDown}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  seleccionada ? "text-white" : "text-texto-secundario hover:bg-surface-2 hover:text-foreground"
                }`}
                style={seleccionada ? { background: colorHex } : undefined}
              >
                <span>{p.label}</span>
                {p.pro && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={
                      seleccionada
                        ? { background: "rgba(255,255,255,0.22)", color: "#fff" }
                        : { background: `color-mix(in oklab, ${colorHex} 14%, transparent)`, color: colorHex }
                    }
                  >
                    {t("pro")}
                  </span>
                )}
                <span className="font-mono text-xs opacity-80">{p.badge}</span>
              </button>
            );
          })}
        </div>
      )}

      <div
        role={hayClases ? "tabpanel" : undefined}
        id={`${baseId}-panel`}
        aria-labelledby={hayClases ? `${baseId}-tab-${activa}` : undefined}
        className="flex flex-col gap-2"
      >
        {activa === "clases" && hayClases && !esPro && proHref && (
          <div
            className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm"
            style={{
              borderColor: `color-mix(in oklab, ${colorHex} 35%, transparent)`,
              background: `color-mix(in oklab, ${colorHex} 8%, transparent)`,
            }}
          >
            <p className="text-foreground">{t("avisoPro")}</p>
            <Link href={proHref} className="font-semibold hover:underline" style={{ color: colorHex }}>
              {t("avisoProCta")}
            </Link>
          </div>
        )}
        {/* key: al cambiar de pestaña se remonta el camino (otro set de temas). */}
        <CaminoContinuo key={activa} unidades={unidadesActivas} basePath={basePath} colorHex={colorHex} />
      </div>
    </AprenderLayout>
  );
}
