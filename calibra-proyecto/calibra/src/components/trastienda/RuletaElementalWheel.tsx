"use client";

// La rueda visual de la Ruleta Elemental: un aro de 118 gajos (uno por
// elemento, coloreado por familia — mismo criterio que la mesa de abajo)
// que gira de verdad y frena exactamente sobre el elemento que ya eligió
// el server. No decide nada: solo anima hacia un resultado que ya se sabe
// (se llama después de tener la respuesta del RPC, nunca antes), así que
// no hay riesgo de que la animación "mienta" o tenga que corregirse a
// mitad de giro.
import { useEffect, useRef, useState } from "react";
import { ELEMENTOS_CASINO, colorElementoCasino, type ElementoCasino } from "@/lib/trastienda/casino";

interface Props {
  girando: boolean;
  elegido: string | null;
  duracionMs?: number;
}

const SEGMENTOS = ELEMENTOS_CASINO.length;
const ANGULO_SEGMENTO = 360 / SEGMENTOS;
const VUELTAS_EXTRA = 5;
const RADIO_EXTERIOR = 100;
const RADIO_INTERIOR = 30;

function anilloPath(anguloInicioDeg: number, anguloFinDeg: number): string {
  const a0 = (anguloInicioDeg * Math.PI) / 180;
  const a1 = (anguloFinDeg * Math.PI) / 180;
  const x0e = RADIO_EXTERIOR * Math.cos(a0);
  const y0e = RADIO_EXTERIOR * Math.sin(a0);
  const x1e = RADIO_EXTERIOR * Math.cos(a1);
  const y1e = RADIO_EXTERIOR * Math.sin(a1);
  const x0i = RADIO_INTERIOR * Math.cos(a0);
  const y0i = RADIO_INTERIOR * Math.sin(a0);
  const x1i = RADIO_INTERIOR * Math.cos(a1);
  const y1i = RADIO_INTERIOR * Math.sin(a1);
  return `M ${x0i} ${y0i} L ${x0e} ${y0e} A ${RADIO_EXTERIOR} ${RADIO_EXTERIOR} 0 0 1 ${x1e} ${y1e} L ${x1i} ${y1i} A ${RADIO_INTERIOR} ${RADIO_INTERIOR} 0 0 0 ${x0i} ${y0i} Z`;
}

function Gajo({ elemento, indice }: { elemento: ElementoCasino; indice: number }) {
  const inicio = indice * ANGULO_SEGMENTO - 90;
  const fin = inicio + ANGULO_SEGMENTO;
  return (
    <path
      d={anilloPath(inicio, fin)}
      fill={colorElementoCasino(elemento.tipo)}
      stroke="#0b0712"
      strokeWidth={0.4}
    />
  );
}

export default function RuletaElementalWheel({ girando, elegido, duracionMs = 2200 }: Props) {
  const [rotacion, setRotacion] = useState(0);
  const rotacionRef = useRef(0);
  const aplicadoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!girando) {
      aplicadoRef.current = null;
      return;
    }
    if (!elegido || aplicadoRef.current === elegido) return;
    aplicadoRef.current = elegido;

    const idx = ELEMENTOS_CASINO.findIndex((e) => e.simbolo === elegido);
    if (idx < 0) return;

    const centroGajo = idx * ANGULO_SEGMENTO + ANGULO_SEGMENTO / 2;
    const actualMod = ((rotacionRef.current % 360) + 360) % 360;
    const deseadoMod = ((360 - centroGajo) % 360 + 360) % 360;
    const delta = ((deseadoMod - actualMod) % 360 + 360) % 360;
    const nueva = rotacionRef.current + delta + VUELTAS_EXTRA * 360;

    rotacionRef.current = nueva;
    setRotacion(nueva);
  }, [girando, elegido]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "14px solid var(--tt-accent)",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
        }}
      />
      <svg
        viewBox="-110 -110 220 220"
        className="h-full w-full"
        style={{
          transform: `rotate(${rotacion}deg)`,
          transition: girando ? `transform ${duracionMs}ms cubic-bezier(0.12, 0.72, 0.18, 1)` : "none",
        }}
      >
        {ELEMENTOS_CASINO.map((e, i) => (
          <Gajo key={e.simbolo} elemento={e} indice={i} />
        ))}
        <circle r={RADIO_INTERIOR - 2} fill="#0b0712" stroke="#2a2438" strokeWidth={2} />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="text-xl" role="img" aria-hidden>
          ⚛️
        </span>
      </div>
    </div>
  );
}
