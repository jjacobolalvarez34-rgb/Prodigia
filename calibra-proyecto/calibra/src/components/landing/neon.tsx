"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { ordenEncendido } from "@/lib/landing/rueda";

// Piezas de neón de la presentación (estilos en globals.css, «Noche de Prodigia»).

// Letrero de tubo: cada letra se enciende en desorden y, si se indica, una falla de
// vez en cuando. Se enciende al entrar en pantalla.
export function LetreroNeon({
  texto,
  color,
  falla,
  className,
  semilla = 7,
  retrasoBase = 0,
}: {
  texto: string;
  color: string;
  falla?: number;
  className?: string;
  semilla?: number;
  retrasoBase?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, margin: "-40px" });
  const letras = [...texto];
  const orden = ordenEncendido(letras.length, semilla);
  return (
    <span ref={ref} className={className} style={{ ["--n" as string]: color } as CSSProperties} aria-label={texto} role="img">
      {letras.map((l, i) =>
        l === " " ? (
          <span key={i}> </span>
        ) : (
          <span
            key={i}
            aria-hidden="true"
            className={`neon ${visto ? (i === falla ? "neon-letra-falla" : "neon-letra") : "neon-apagado"}`}
            style={{ ["--n" as string]: color, animationDelay: visto ? `${retrasoBase + orden[i] * 70}ms${i === falla ? `, ${retrasoBase + 2400}ms` : ""}` : undefined } as CSSProperties}
          >
            {l}
          </span>
        ),
      )}
    </span>
  );
}

// Un ícono o caja que se enciende como tubo al entrar en pantalla.
export function CajaNeon({ color, children, className, retraso = 0 }: { color: string; children: ReactNode; className?: string; retraso?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, margin: "-60px" });
  return (
    <span
      ref={ref}
      className={`neon-caja ${className ?? ""}`}
      data-encendido={visto ? "si" : "no"}
      style={{ ["--n" as string]: color, color, animationDelay: `${retraso}ms` } as CSSProperties}
    >
      {children}
    </span>
  );
}

// La ciudad de noche: un edificio por ciudad, con las ventanas del neón de esa ciudad.
// Las ventanas se prenden en desorden cuando el horizonte entra en pantalla.
function edificios(colores: string[], ancho: number, alto: number) {
  let s = 23;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const lista: { x: number; w: number; h: number; color: string; ventanas: { x: number; y: number; tarda: number }[] }[] = [];
  const anchoEdificio = ancho / colores.length;
  colores.forEach((color, k) => {
    const w = anchoEdificio - 3 - Math.floor(azar() * 6);
    const x = k * anchoEdificio + Math.floor(azar() * 3);
    const h = Math.floor(alto * (0.42 + azar() * 0.55));
    const ventanas = [];
    for (let vy = alto - h + 7; vy < alto - 6; vy += 9) {
      for (let vx = x + 4; vx < x + w - 5; vx += 7) {
        if (azar() < 0.42) ventanas.push({ x: vx, y: vy, tarda: Math.floor(azar() * 2600) });
      }
    }
    lista.push({ x, w, h, color, ventanas });
  });
  return lista;
}

export function CiudadDeNoche({ colores, alto = 110 }: { colores: string[]; alto?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const visto = useInView(ref, { once: true, margin: "-20px" });
  const ancho = 600;
  const lista = edificios(colores, ancho, alto);
  return (
    <svg ref={ref} viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full" data-encendido={visto ? "si" : "no"} aria-hidden="true">
      {lista.map((e, i) => (
        <g key={i}>
          <rect x={e.x} y={alto - e.h} width={e.w} height={e.h} fill={i % 2 ? "#111731" : "#0D1228"} />
          {e.ventanas.map((v, j) => (
            <rect key={j} x={v.x} y={v.y} width={3} height={4} fill={e.color} className="ventana-ciudad" style={{ animationDelay: `${v.tarda}ms` }} />
          ))}
        </g>
      ))}
    </svg>
  );
}

// Cielo con pocas estrellas quietas (deterministas: igual en el servidor y el cliente).
export function Estrellas({ cantidad = 26 }: { cantidad?: number }) {
  const [puntos] = useState(() => {
    let s = 91;
    const azar = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: cantidad }, () => ({ x: azar() * 100, y: azar() * 70, r: azar() < 0.2 ? 1.6 : 1, o: 0.25 + azar() * 0.5 }));
  });
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="none">
      {puntos.map((p, i) => (
        <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#C9D2F0" opacity={p.o} />
      ))}
    </svg>
  );
}
