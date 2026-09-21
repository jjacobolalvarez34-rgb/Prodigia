"use client";

import { useState, useCallback, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PestanaAprender } from "@/lib/aprender/clases";

interface Props {
  // Contenido de la pestaña "Técnicas" (gratis) — normalmente un
  // <CaminoContinuo /> con las filas techniques de requiere_pro=false.
  tecnicas: React.ReactNode;
  // Contenido de la pestaña "Clases" (Pro). Si es null/undefined la
  // pestaña NO se muestra (mundo sin clases: no cambia nada respecto a
  // antes) — la página lo decide con `hayClases` de partirCaminoPorClases.
  clases?: React.ReactNode;
  colorHex: string;
  // Plan del usuario: para no-Pro se muestra el aviso "Clase 1 gratis, el
  // resto es Pro" con link a `proHref` en la pestaña Clases.
  esPro: boolean;
  // Destino del CTA del aviso, ej. "/pro?next=/calculia/aprender?tab=clases".
  // Si se omite no se muestra el aviso.
  proHref?: string;
  // Pestaña inicial (resolverla en el server con resolverPestanaInicial
  // a partir de searchParams.tab). Default: "tecnicas".
  defaultTab?: PestanaAprender;
  // Texto opcional de progreso junto a cada pestaña, ej. "3/5".
  tecnicasBadge?: string;
  clasesBadge?: string;
}

const ORDEN: PestanaAprender[] = ["tecnicas", "clases"];

// Pestañas "Técnicas | Clases" dentro de Aprender (fila 22 de
// docs/PARIDAD_MUNDOS.md). Va como hijo de <AprenderLayout> y comparte
// su encuadre. La pestaña activa se recuerda en la URL (?tab=clases) con
// history.replaceState — sin navegación ni re-render del server — así un
// refresh, un link compartido o el "Volver a Aprender" de una lección
// caen en la pestaña correcta. Ambos paneles quedan montados (el
// inactivo con `hidden`) para no reiniciar animaciones al alternar.
export default function AprenderTabs({
  tecnicas,
  clases,
  colorHex,
  esPro,
  proHref,
  defaultTab = "tecnicas",
  tecnicasBadge,
  clasesBadge,
}: Props) {
  const t = useTranslations("Aprender.tabs");
  const baseId = useId();
  const hayClases = clases !== null && clases !== undefined;
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

  // Un mundo sin Clases no ve la barra de pestañas: el contenido se
  // renderiza directo, idéntico a como era antes de las pestañas.
  if (!hayClases) return <>{tecnicas}</>;

  const pestanas: { id: PestanaAprender; label: string; badge?: string; pro?: boolean }[] = [
    { id: "tecnicas", label: t("tecnicas"), badge: tecnicasBadge },
    { id: "clases", label: t("clases"), badge: clasesBadge, pro: true },
  ];

  return (
    <div className="flex flex-col gap-2">
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
              aria-controls={`${baseId}-panel-${p.id}`}
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
              {p.badge && <span className="font-mono text-xs opacity-80">{p.badge}</span>}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-tecnicas`}
        aria-labelledby={`${baseId}-tab-tecnicas`}
        hidden={activa !== "tecnicas"}
      >
        {tecnicas}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-clases`}
        aria-labelledby={`${baseId}-tab-clases`}
        hidden={activa !== "clases"}
        className="flex flex-col gap-2"
      >
        {!esPro && proHref && (
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
        {clases}
      </div>
    </div>
  );
}
