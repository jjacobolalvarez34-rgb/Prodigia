"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  objetivoHueso: string;
  respondido: boolean;
  seleccion: string | null;
  onClickHueso: (hueso: string) => void;
}

// Diagrama interactivo del esqueleto óseo (Fase 2 de Anatomía, nivel
// 3+): el SVG real (public/data/esqueleto-oseo.svg, LadyofHats/Wikimedia
// Commons, dominio público — ver el comment de licencia dentro del
// archivo) se inyecta tal cual con dangerouslySetInnerHTML y se
// delega el click sobre cualquier elemento con data-hueso, en vez de
// armar ~100 elementos React a mano por cada hueso del dibujo.
export default function EsqueletoClickeable({ objetivoHueso, respondido, seleccion, onClickHueso }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch("/data/esqueleto-oseo.svg")
      .then((r) => r.text())
      .then((texto) => {
        if (!cancelado) setSvgMarkup(texto);
      });
    return () => {
      cancelado = true;
    };
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
