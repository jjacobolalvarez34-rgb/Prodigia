"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { VisualAnatomiaEsqueleto } from "@/lib/anatomia/visuales";
import { resolverHuesos, textoDeVisual } from "@/lib/anatomia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ANATOMIA, fondoAcento } from "./comun";

interface Props {
  visual: VisualAnatomiaEsqueleto;
}

// Mismo SVG REAL de dominio público que usa la práctica
// (public/data/esqueleto-oseo.svg, LadyofHats / Wikimedia Commons; ver el
// comentario de licencia dentro del archivo). Caché a nivel de módulo (como
// EsqueletoClickeable): un solo pedido de red por sesión aunque haya varios
// visuales de esqueleto.
let svgCacheado: string | null = null;
let svgEnCurso: Promise<string> | null = null;

function obtenerSvg(): Promise<string> {
  if (svgCacheado !== null) return Promise.resolve(svgCacheado);
  if (!svgEnCurso) {
    svgEnCurso = fetch("/data/esqueleto-oseo.svg")
      .then((r) => r.text())
      .then((texto) => {
        svgCacheado = texto;
        return texto;
      })
      .catch(() => {
        svgEnCurso = null;
        return "";
      });
  }
  return svgEnCurso;
}

// Reglas CSS del estado actual. Las claves ya vienen validadas por
// resolverHuesos (solo [a-z_]), así que se pueden interpolar sin riesgo.
function reglasCss(id: string, previos: string[], actual: string | undefined): string {
  const base = `[data-esq="${id}"]`;
  const neutro = "color-mix(in oklab, var(--foreground) 9%, var(--surface))";
  const trazo = "color-mix(in oklab, var(--foreground) 28%, var(--surface))";
  const reglas = [
    `${base} svg{display:block;width:100%;height:auto}`,
    `${base} svg path{fill:${neutro} !important;stroke:${trazo} !important;transition:fill .35s ease,stroke .35s ease}`,
  ];
  for (const k of previos) {
    reglas.push(
      `${base} svg [data-hueso="${k}"] path{fill:color-mix(in oklab, ${COLOR_ANATOMIA} 38%, var(--surface)) !important;stroke:${COLOR_ANATOMIA} !important}`
    );
  }
  if (actual) {
    reglas.push(`${base} svg [data-hueso="${actual}"] path{fill:${COLOR_ANATOMIA} !important;stroke:${COLOR_ANATOMIA} !important}`);
  }
  return reglas.join("\n");
}

// Visual "anatomia.esqueleto": resalta sobre el esqueleto REAL un hueso (o
// grupo de huesos) por paso. Un punto marca dónde está y, al lado, el nombre
// en grande y la lista de todos los huesos de la lección. Los huesos que el
// SVG no trae separados (costillas, esternón, clavícula...) no se pueden
// resaltar: esos se explican con otros visuales.
export default function Esqueleto({ visual }: Props) {
  const t = useTranslations("Anatomia.visuales.esqueleto");
  const id = useId();
  const huesos = resolverHuesos(visual.huesos);
  const { alVer, ...r } = useReproductor({ total: huesos.length, ms: 1700, estatico: visual.estatico, inicio: huesos.length > 0 ? 1 : 0 });

  const contRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const [svg, setSvg] = useState<string | null>(svgCacheado);

  useEffect(() => {
    if (svg !== null) return;
    let cancelado = false;
    obtenerSvg().then((texto) => {
      if (!cancelado) setSvg(texto);
    });
    return () => {
      cancelado = true;
    };
  }, [svg]);

  const indiceActual = Math.max(0, r.paso - 1);
  const actual = huesos[indiceActual];
  const claveActual = actual?.clave;

  // Posiciona el punto sobre el hueso actual directamente en el DOM (medir
  // el SVG ya insertado es un efecto de lectura del navegador, no estado).
  useEffect(() => {
    const cont = contRef.current;
    const pin = pinRef.current;
    if (!cont || !pin) return;
    function colocar() {
      if (!cont || !pin) return;
      const el = claveActual ? cont.querySelector(`[data-hueso="${claveActual}"]`) : null;
      if (!el) {
        pin.style.opacity = "0";
        return;
      }
      const caja = el.getBoundingClientRect();
      const marco = cont.getBoundingClientRect();
      pin.style.left = `${caja.left - marco.left + caja.width / 2}px`;
      pin.style.top = `${caja.top - marco.top + caja.height / 2}px`;
      pin.style.opacity = "1";
    }
    colocar();
    window.addEventListener("resize", colocar);
    return () => window.removeEventListener("resize", colocar);
  }, [claveActual, svg]);

  if (huesos.length === 0) return null;

  const previos = huesos.slice(0, indiceActual).map((h) => h.clave);
  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      nota={t("nota")}
      controles={<ControlesReproductor r={r} color={COLOR_ANATOMIA} />}
    >
      <div className="flex items-center justify-center gap-3">
        <div className="relative w-[44%] max-w-[170px] shrink-0" data-esq={id}>
          <style>{reglasCss(id, previos, claveActual)}</style>
          {svg ? (
            <div ref={contRef} className="relative">
              <div dangerouslySetInnerHTML={{ __html: svg }} />
              <span
                ref={pinRef}
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{ background: COLOR_ANATOMIA, opacity: 0, transition: "left .3s ease, top .3s ease, opacity .2s" }}
              />
            </div>
          ) : (
            <div className="w-full animate-pulse rounded-2xl bg-foreground/5" style={{ aspectRatio: "435.687 / 841.89" }} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p
            className="rounded-xl border-2 px-3 py-2 text-center text-lg font-bold leading-snug"
            style={{ borderColor: COLOR_ANATOMIA, background: fondoAcento(12), color: COLOR_ANATOMIA }}
          >
            {actual.nombre}
          </p>
          <ul className="flex flex-col gap-1">
            {huesos.map((h, i) => {
              const visto = i < r.paso;
              const esActual = i === indiceActual;
              return (
                <li
                  key={h.clave}
                  className="rounded-lg border px-2 py-1 text-[13px] font-semibold leading-snug"
                  style={{
                    borderColor: visto ? COLOR_ANATOMIA : "var(--border)",
                    background: esActual ? COLOR_ANATOMIA : visto ? fondoAcento(12) : "var(--surface)",
                    color: esActual ? "#fff" : "var(--foreground)",
                    opacity: visto ? 1 : 0.45,
                  }}
                >
                  {h.nombre}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </MarcoVisual>
  );
}
