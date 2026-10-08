"use client";

import { useEffect, useMemo, useState } from "react";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import type { Escena } from "@/lib/dibujo/escena";
import DibujoWeb from "../DibujoWeb";

// Avance (0..1) de la transición hacia el paso actual. Cada vez que cambia el
// paso, `t` arranca en 0 y llega a 1 en `duracion` ms; con «reducir
// movimiento» queda siempre en 1 (el dibujo final del paso, sin moverse).
function useAvancePaso(paso: number, duracion: number, reducir: boolean): number {
  const [estado, setEstado] = useState({ paso, t: 0 });
  useEffect(() => {
    if (reducir) return;
    let id = 0;
    const inicio = performance.now();
    const cuadro = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      setEstado({ paso, t });
      if (t < 1) id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [paso, duracion, reducir]);
  if (reducir) return 1;
  return estado.paso === paso ? estado.t : 0;
}

// Reproductor web de una escena (src/lib/dibujo/escena.ts): la misma escena se
// dibuja igual en la app con su propio reproductor.
export function ReproductorEscena({ escena, color, titulo, estatico }: { escena: Escena; color: string; titulo?: string; estatico?: boolean }) {
  const { alVer, ...r } = useReproductor({ total: escena.pasos, ms: escena.ms, estatico });
  const t = useAvancePaso(r.paso, Math.min(1200, escena.ms * 0.75), r.reducir);
  const dibujo = escena.dibujar(r.paso, t);
  const leyenda = escena.leyenda(r.paso);
  return (
    <figure
      ref={alVer}
      role="group"
      aria-label={titulo ?? escena.alternativa}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex min-w-0 flex-col items-center gap-3">
        <DibujoWeb dibujo={dibujo} acento={color} className="h-auto w-full max-w-[420px]" />
        {leyenda && (
          <div
            className="min-h-[3.25rem] w-full rounded-xl border px-3 py-2 text-[13px] leading-snug text-foreground"
            style={{ borderColor: color, background: `color-mix(in oklab, ${color} 9%, var(--surface))` }}
          >
            <MathText texto={leyenda} />
          </div>
        )}
      </div>
      <figcaption className="sr-only">{escena.alternativa}</figcaption>
      <ControlesReproductor r={r} color={color} />
    </figure>
  );
}

// Componente de registro: arma la escena del visual con `crear` y la reproduce.
// Con datos que la escena no acepta, no dibuja nada (la lección sigue).
export function crearVisualEscena<V extends { titulo?: string; estatico?: boolean }>(crear: (v: V) => Escena | null, color: string) {
  function VisualEscena({ visual }: { visual: V }) {
    const escena = useMemo(() => {
      try {
        return crear(visual);
      } catch {
        return null;
      }
    }, [visual]);
    if (!escena) return null;
    return <ReproductorEscena escena={escena} color={color} titulo={visual.titulo} estatico={visual.estatico} />;
  }
  return VisualEscena;
}
