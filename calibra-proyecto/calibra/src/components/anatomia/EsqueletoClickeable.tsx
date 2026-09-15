"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  objetivoHueso: string;
  respondido: boolean;
  seleccion: string | null;
  onClickHueso: (hueso: string) => void;
}

// Caché a nivel de módulo, fuera del componente a propósito. Bug
// reportado en vivo (2026-09-14, "se traba al hacer click en las
// preguntas... anatomía, el mapa del cuerpo"): TarjetaSprint envuelve
// a sus children en un `key={cardKey}` (para el swipe de entrada/
// salida de cada pregunta) — eso hace que este componente se desmonte
// y remonte de CERO en cada pregunta de tipo "click", no solo una vez
// por partida. Sin caché, cada remonte volvía a pedir por red y
// parsear el SVG entero (843KB, 918 elementos <path> — LadyofHats/
// Wikimedia Commons, dominio público, ver el comment de licencia
// dentro del archivo) — con varias preguntas de este tipo en un mismo
// sprint de 60s, eso se sentía como una traba justo después de cada
// respuesta. El módulo se carga una sola vez por sesión del navegador;
// los remontes posteriores leen el string ya resuelto, sin red.
let svgCacheado: string | null = null;
let svgFetchEnCurso: Promise<string> | null = null;

function obtenerSvgEsqueleto(): Promise<string> {
  if (svgCacheado !== null) return Promise.resolve(svgCacheado);
  if (!svgFetchEnCurso) {
    svgFetchEnCurso = fetch("/data/esqueleto-oseo.svg")
      .then((r) => r.text())
      .then((texto) => {
        svgCacheado = texto;
        return texto;
      });
  }
  return svgFetchEnCurso;
}

export default function EsqueletoClickeable({ objetivoHueso, respondido, seleccion, onClickHueso }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(svgCacheado);

  useEffect(() => {
    if (svgMarkup !== null) return;
    let cancelado = false;
    obtenerSvgEsqueleto().then((texto) => {
      if (!cancelado) setSvgMarkup(texto);
    });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleClick(e: MouseEvent) {
      if (respondido) return;
      const target = e.target as Element;
      const hueso = target.closest("[data-hueso]")?.getAttribute("data-hueso");
      if (hueso) onClickHueso(hueso);
    }
    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [respondido, onClickHueso]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !respondido) return;
    const correctos = el.querySelectorAll(`[data-hueso="${objetivoHueso}"]`);
    correctos.forEach((n) => n.classList.add("hueso-correcto"));
    const incorrectos =
      seleccion && seleccion !== objetivoHueso ? el.querySelectorAll(`[data-hueso="${seleccion}"]`) : [];
    incorrectos.forEach((n) => n.classList.add("hueso-incorrecto"));
    return () => {
      correctos.forEach((n) => n.classList.remove("hueso-correcto"));
      incorrectos.forEach((n) => n.classList.remove("hueso-incorrecto"));
    };
  }, [respondido, objetivoHueso, seleccion]);

  return (
    <div className="mx-auto w-full max-w-[240px]">
      <style>{`
        .esqueleto-clickeable svg { display: block; width: 100%; height: auto; }
        .esqueleto-clickeable [data-hueso] { cursor: pointer; transition: filter 0.15s ease; }
        .esqueleto-clickeable [data-hueso]:hover { filter: brightness(0.88) saturate(1.4); }
        .esqueleto-clickeable.respondido [data-hueso] { cursor: default; }
        .esqueleto-clickeable.respondido [data-hueso]:hover { filter: none; }
        .esqueleto-clickeable .hueso-correcto,
        .esqueleto-clickeable .hueso-correcto * { fill: var(--correcto) !important; stroke: var(--correcto) !important; }
        .esqueleto-clickeable .hueso-incorrecto,
        .esqueleto-clickeable .hueso-incorrecto * { fill: var(--error) !important; stroke: var(--error) !important; }
      `}</style>
      {svgMarkup ? (
        <div
          ref={containerRef}
          className={`esqueleto-clickeable${respondido ? " respondido" : ""}`}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : (
        <div className="w-full animate-pulse rounded-2xl bg-foreground/5" style={{ aspectRatio: "435.687 / 841.89" }} />
      )}
    </div>
  );
}
