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
// Las ventanas se prenden en desorden cuando el horizonte entra en pantalla. Algunos
// techos llevan el letrero de su ciudad (su glifo en tubo de neón, uno falla de vez en
// cuando) y la calle mojada refleja las luces (2026-11-23: «le falta algo neón en el
// fondo»). Todo es dibujo: nada de manchas borrosas.
type CiudadLuz = { neon: string; glifo: string };

function edificios(ciudades: CiudadLuz[], ancho: number, alto: number) {
  let s = 23;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const lista: { x: number; w: number; h: number; color: string; glifo: string; letrero: boolean; ventanas: { x: number; y: number; tarda: number }[] }[] = [];
  const anchoEdificio = ancho / ciudades.length;
  ciudades.forEach((c, k) => {
    const w = anchoEdificio - 3 - Math.floor(azar() * 6);
    const x = k * anchoEdificio + Math.floor(azar() * 3);
    const letrero = k % 3 === 1;
    // Los que llevan letrero son más bajos: el letrero entra completo en el dibujo.
    const h = Math.floor(alto * (letrero ? 0.45 + azar() * 0.2 : 0.42 + azar() * 0.45));
    const ventanas = [];
    for (let vy = alto - h + 7; vy < alto - 6; vy += 9) {
      for (let vx = x + 4; vx < x + w - 5; vx += 7) {
        if (azar() < 0.42) ventanas.push({ x: vx, y: vy, tarda: Math.floor(azar() * 2600) });
      }
    }
    lista.push({ x, w, h, color: c.neon, glifo: c.glifo, letrero, ventanas });
  });
  return lista;
}

export function CiudadDeNoche({ ciudades, alto = 120 }: { ciudades: CiudadLuz[]; alto?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const visto = useInView(ref, { once: true, margin: "-20px" });
  // Ancho de dibujo amplio: en pantallas anchas casi no se recorta arriba y los
  // letreros de los techos se ven completos.
  const ancho = 900;
  const calle = 22;
  const lista = edificios(ciudades, ancho, alto);
  return (
    <svg ref={ref} viewBox={`0 0 ${ancho} ${alto + calle}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full" data-encendido={visto ? "si" : "no"} aria-hidden="true">
      <defs>
        <filter id="brillo-ventana" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="brillo-letrero" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.6" result="b2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b1" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="reflejo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2 1.2" />
        </filter>
        <linearGradient id="calle-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="calle-mascara">
          <rect x="0" y={alto} width={ancho} height={calle} fill="url(#calle-fade)" />
        </mask>
      </defs>

      {lista.map((e, i) => (
        <g key={i}>
          <rect x={e.x} y={alto - e.h} width={e.w} height={e.h} fill={i % 2 ? "#111731" : "#0D1228"} />
          <g filter="url(#brillo-ventana)">
            {e.ventanas.map((v, j) => (
              <rect key={j} x={v.x} y={v.y} width={3} height={4} fill={e.color} className="ventana-ciudad" style={{ animationDelay: `${v.tarda}ms` }} />
            ))}
          </g>
          {e.letrero && (
            <g className={i === 4 ? "letrero-techo letrero-techo-falla" : "letrero-techo"} style={{ animationDelay: `${600 + i * 140}ms` }}>
              <line x1={e.x + e.w / 2 - 6} y1={alto - e.h} x2={e.x + e.w / 2 - 6} y2={alto - e.h - 5} stroke="#2A3150" strokeWidth="1" />
              <line x1={e.x + e.w / 2 + 6} y1={alto - e.h} x2={e.x + e.w / 2 + 6} y2={alto - e.h - 5} stroke="#2A3150" strokeWidth="1" />
              <text
                x={e.x + e.w / 2}
                y={alto - e.h - 7}
                textAnchor="middle"
                fontSize="19"
                fontWeight="700"
                fill={`color-mix(in oklab, ${e.color} 35%, #ffffff)`}
                stroke={e.color}
                strokeWidth="0.4"
                filter="url(#brillo-letrero)"
                style={{ fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}
              >
                {e.glifo}
              </text>
            </g>
          )}
        </g>
      ))}

      <rect x="0" y={alto} width={ancho} height={calle} fill="#070A13" />
      <g mask="url(#calle-mascara)">
        <g transform={`translate(0 ${alto * 2}) scale(1 -1)`} filter="url(#reflejo)">
          {lista.map((e, i) => (
            <g key={i}>
              {e.ventanas
                .filter((v) => v.y > alto - 26)
                .map((v, j) => (
                  <rect key={j} x={v.x - 1} y={v.y} width={5} height={5} fill={e.color} className="ventana-ciudad" style={{ animationDelay: `${v.tarda}ms` }} />
                ))}
            </g>
          ))}
        </g>
      </g>
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
