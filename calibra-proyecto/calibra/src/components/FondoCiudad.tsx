"use client";

import { mulberry32 } from "@/lib/rng";
import { adornosCiudad } from "@/lib/temas/adornosCiudad";
import { capaVisible } from "@/lib/temas/temas";
import { useTemaHoy } from "@/components/temas/useTemaHoy";

// Fondo de la pantalla de carga (paridad con la app, mobile/src/ui/FondoCiudad.tsx):
// cielo de noche con estrellas, la ciudad con ventanas que titilan y abajo una
// carretera con farolas y las líneas del medio corriendo. SVG y CSS, sin JavaScript
// en el navegador; siempre igual (semilla fija).
const W = 1200;
const H = 800;
const ALTO_CIUDAD = 260;
const ALTO_CARRETERA = 86;
const SUELO = H - ALTO_CARRETERA;

function armar() {
  const r = mulberry32(20261014);
  const estrellas = Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * (SUELO - ALTO_CIUDAD), radio: 0.6 + r() * 1.2, o: 0.25 + r() * 0.6 }));
  const edificios: { x: number; w: number; h: number; capa: number }[] = [];
  for (const capa of [0, 1]) {
    let x = -10;
    while (x < W) {
      const w = 34 + Math.floor(r() * 60);
      const h = (capa === 0 ? 120 : 60) + Math.floor(r() * (capa === 0 ? 140 : 110));
      edificios.push({ x, w, h, capa });
      x += w + (capa === 0 ? 6 : 3);
    }
  }
  const ventanas: { x: number; y: number; titila: boolean; retraso: number }[] = [];
  for (const e of edificios.filter((b) => b.capa === 1)) {
    for (let vy = SUELO - e.h + 10; vy < SUELO - 10; vy += 14) {
      for (let vx = e.x + 6; vx < e.x + e.w - 8; vx += 11) {
        if (r() < 0.32) ventanas.push({ x: vx, y: vy, titila: r() < 0.18, retraso: Math.round(r() * 4000) });
      }
    }
  }
  return { estrellas, edificios, ventanas };
}

const ESCENA = armar();

// Festividades: los adornos de la fecha sobre la fila de edificios de adelante.
const ADELANTE = ESCENA.edificios.filter((e) => e.capa === 1);

export default function FondoCiudad({ acento = "#7C5CFF" }: { acento?: string }) {
  const tema = useTemaHoy();
  const tipos = capaVisible(tema, "ciudad") ? tema?.tema.ciudad : undefined;
  const adornos = tipos ? adornosCiudad(ADELANTE, W, SUELO, tipos, "carga", 2.6) : [];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#06080F]" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="fcHalo" cx="50%" cy="38%" r="40%">
            <stop offset="0" stopColor={acento} stopOpacity="0.32" />
            <stop offset="1" stopColor={acento} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fcAsfalto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#11142A" />
            <stop offset="1" stopColor="#080A16" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#fcHalo)" />
        {ESCENA.estrellas.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.radio} fill="#FFFFFF" opacity={e.o} />
        ))}
        {ESCENA.edificios.map((e, i) => (
          <rect key={i} x={e.x} y={SUELO - e.h} width={e.w} height={e.h} fill={e.capa === 0 ? "#0E1226" : "#141938"} />
        ))}
        {ESCENA.ventanas.map((v, i) => (
          <rect key={i} x={v.x} y={v.y} width={4.5} height={6} fill="#FFD27A" opacity={0.75} className={v.titila ? "fondo-ventana" : undefined} style={v.titila ? { animationDelay: `${v.retraso}ms` } : undefined} />
        ))}
        {adornos.map((f, i) => (
          <path key={`a${i}`} d={f.d} fill={f.relleno ?? "none"} stroke={f.trazo} strokeWidth={f.ancho} strokeLinecap="round" opacity={f.opacidad} />
        ))}
        <rect x={0} y={SUELO} width={W} height={ALTO_CARRETERA} fill="url(#fcAsfalto)" />
        <rect x={0} y={SUELO} width={W} height={10} fill="#1A1E38" />
        <rect x={0} y={SUELO + 10} width={W} height={1.5} fill={acento} opacity={0.55} />
        <rect x={0} y={H - 12} width={W} height={12} fill="#1A1E38" />
        {Array.from({ length: 10 }, (_, i) => {
          const x = ((i + 0.5) * W) / 10;
          return (
            <g key={i}>
              <circle cx={x} cy={SUELO + 11} r={34} fill="#FFD27A" opacity={0.07} />
              <rect x={x - 1} y={SUELO - 18} width={2} height={28} fill="#3A4060" />
              <rect x={x - 4} y={SUELO - 21} width={8} height={4} rx={2} fill="#FFD27A" />
            </g>
          );
        })}
        <g className="fondo-lineas">
          {Array.from({ length: Math.ceil(W / 46) + 2 }, (_, i) => (
            <rect key={i} x={i * 46} y={SUELO + ALTO_CARRETERA / 2 - 2} width={22} height={4} rx={2} fill="#F2C14E" opacity={0.85} />
          ))}
        </g>
      </svg>
    </div>
  );
}
