"use client";

import type { Dibujo } from "@/lib/quimia/organica";
import { motion, COLOR_QUIMIA } from "./comun";

// Esqueleto 2D ESQUEMÁTICO de una molécula (lo calcula dibujarMolecula en
// src/lib/quimia/organica.ts): cada vértice es un carbono, los enlaces
// dobles y triples se dibujan con 2 y 3 líneas, y los heteroátomos llevan su
// símbolo. Es un dibujo plano de la conectividad, NO una geometría 3D real.

const ESC_BASE = 30; // píxeles por unidad de enlace
const ESC_CON_CARBONOS = 48; // más grande cuando cada carbono lleva su fórmula (CH₃...)
const MARGEN = 20;
const COLOR_RAMA = "#F59E0B";

interface Props {
  dibujo: Dibujo;
  // Átomos resaltados con el color del mundo (los enlaces entre dos
  // resaltados también) y, con otro color, un segundo conjunto.
  resaltar?: Set<number>;
  resaltar2?: Set<number>;
  // Muestra el número de posición de cada carbono de la cadena.
  localizadores?: boolean;
  // Escribe en cada carbono su fórmula ("CH₃", "CH₂"...): id -> texto.
  carbonos?: Map<number, string>;
  animar?: boolean;
  // Ancho máximo en píxeles (por defecto, el natural del dibujo).
  maxAncho?: number;
}

function anchoEtiqueta(t: string): number {
  return Math.max(16, t.length * 9 + 6);
}

export default function Esqueleto({ dibujo, resaltar, resaltar2, localizadores = false, carbonos, animar = true, maxAncho }: Props) {
  const ESC = carbonos ? ESC_CON_CARBONOS : ESC_BASE;
  const por = new Map(dibujo.atomos.map((a) => [a.id, a]));
  const texto = (id: number): string | undefined => {
    const a = por.get(id)!;
    return a.etiqueta ?? carbonos?.get(id);
  };
  // Caja: los átomos más el ancho de las etiquetas.
  const xs = dibujo.atomos.map((a) => a.x * ESC);
  const ys = dibujo.atomos.map((a) => a.y * ESC);
  const anchos = dibujo.atomos.map((a) => (texto(a.id) ? anchoEtiqueta(texto(a.id)!) / 2 : localizadores && a.localizador ? 10 : 2));
  const minX = Math.min(...xs.map((x, i) => x - anchos[i])) - MARGEN;
  const maxX = Math.max(...xs.map((x, i) => x + anchos[i])) + MARGEN;
  const minY = Math.min(...ys) - MARGEN - 4;
  const maxY = Math.max(...ys) + MARGEN + 4;
  const ancho = Math.max(60, maxX - minX);
  const alto = Math.max(60, maxY - minY);
  const enfoque = !!resaltar;

  const dur = animar ? 0.45 : 0;
  const colorDe = (a: number, b: number) => {
    if (resaltar?.has(a) && resaltar.has(b)) return COLOR_QUIMIA;
    if (resaltar2?.has(a) && resaltar2.has(b)) return COLOR_RAMA;
    return "var(--foreground)";
  };
  const destacado = (a: number, b: number) => (resaltar?.has(a) && resaltar.has(b)) || (resaltar2?.has(a) && resaltar2.has(b));

  return (
    <svg
      viewBox={`${minX} ${minY} ${ancho} ${alto}`}
      className="h-auto w-full"
      style={{ maxWidth: maxAncho ?? Math.max(120, Math.min(ancho, 420)) }}
      role="presentation"
    >
      {dibujo.enlaces.map((e, k) => {
        const a = por.get(e.a)!;
        const b = por.get(e.b)!;
        let x1 = a.x * ESC;
        let y1 = a.y * ESC;
        let x2 = b.x * ESC;
        let y2 = b.y * ESC;
        const largo = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / largo;
        const uy = (y2 - y1) / largo;
        // Se acorta hacia los átomos con etiqueta para no pisar el texto.
        const ta = texto(e.a);
        const tb = texto(e.b);
        if (ta) {
          const r = anchoEtiqueta(ta) / 2 + 1;
          x1 += ux * Math.min(r, carbonos ? 12 : 14);
          y1 += uy * Math.min(r, carbonos ? 12 : 14);
        }
        if (tb) {
          const r = anchoEtiqueta(tb) / 2 + 1;
          x2 -= ux * Math.min(r, carbonos ? 12 : 14);
          y2 -= uy * Math.min(r, carbonos ? 12 : 14);
        }
        const nx = -uy;
        const ny = ux;
        const desplazamientos = e.orden === 1 ? [0] : e.orden === 2 ? [-3.2, 3.2] : [-4.5, 0, 4.5];
        const color = colorDe(e.a, e.b);
        const fuerte = destacado(e.a, e.b);
        const tenue = enfoque && !fuerte ? 0.4 : 1;
        return (
          <g key={k}>
            {desplazamientos.map((d, i) => (
              <motion.line
                key={i}
                x1={x1 + nx * d}
                y1={y1 + ny * d}
                x2={x2 + nx * d}
                y2={y2 + ny * d}
                strokeLinecap="round"
                initial={false}
                animate={{ stroke: color, strokeWidth: fuerte ? 3 : 2, opacity: tenue }}
                transition={{ duration: dur }}
              />
            ))}
          </g>
        );
      })}
      {dibujo.atomos.map((a) => {
        const t = texto(a.id);
        const x = a.x * ESC;
        const y = a.y * ESC;
        const color = resaltar?.has(a.id) ? COLOR_QUIMIA : resaltar2?.has(a.id) ? COLOR_RAMA : "var(--foreground)";
        if (t) {
          const w = anchoEtiqueta(t);
          return (
            <g key={a.id}>
              <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={6} fill="var(--surface)" />
              <motion.text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                initial={false}
                animate={{ fill: color, opacity: enfoque && color === "var(--foreground)" ? 0.5 : 1 }}
                transition={{ duration: dur }}
              >
                {t}
              </motion.text>
            </g>
          );
        }
        if (localizadores && a.localizador) {
          return (
            <g key={a.id}>
              <circle cx={x} cy={y} r={9} fill="var(--surface)" stroke={COLOR_QUIMIA} strokeWidth={1.6} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800} fill={COLOR_QUIMIA}>
                {a.localizador}
              </text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
}
