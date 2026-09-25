"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { bandasNormal, densidadNormal, esNumeroFinito, zScore } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaNormal } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaNormal;
}

const ANCHO = 360;
const ALTO = 190;
const MARGEN_X = 14;
const BASE_Y = 150;
const ALTO_CURVA = 120;
const OPACIDAD_BANDA = { 1: 0.5, 2: 0.32, 3: 0.16 } as const;

// Curva normal con las bandas de la regla empírica (±1σ: 68 %, ±2σ: 95 %,
// ±3σ: 99.7 %) que aparecen una por una y, opcionalmente, un punto marcado
// con su puntaje z. Las bandas salen de bandasNormal() y z de zScore()
// (visualesDatos.ts); los porcentajes son los nominales de la regla
// (visualesDatos.test.ts los contrasta con el área exacta de la normal).
export default function Normal({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok =
    esNumeroFinito(visual.media) &&
    esNumeroFinito(visual.sigma) &&
    visual.sigma > 0 &&
    (visual.marcarX === undefined || esNumeroFinito(visual.marcarX));
  const hayMarca = ok && visual.marcarX !== undefined;
  const r = useReproductor({ total: hayMarca ? 4 : 3, ms: 1100, estatico: visual.estatico });
  if (!ok) return null;

  const { media, sigma } = visual;
  const bandas = bandasNormal(media, sigma);
  const xMin = media - 4 * sigma;
  const xMax = media + 4 * sigma;
  const xPix = (x: number) => MARGEN_X + ((x - xMin) / (xMax - xMin)) * (ANCHO - 2 * MARGEN_X);
  const pico = densidadNormal(media, media, sigma);
  const yPix = (x: number) => BASE_Y - (densidadNormal(x, media, sigma) / pico) * ALTO_CURVA;

  const puntos = (desde: number, hasta: number, pasos: number) =>
    Array.from({ length: pasos + 1 }, (_, i) => {
      const x = desde + ((hasta - desde) * i) / pasos;
      return [xPix(x), yPix(x)] as const;
    });
  const curva = puntos(xMin, xMax, 80)
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaBanda = (k: number) => {
    const p = puntos(media - k * sigma, media + k * sigma, 40);
    const [x0] = p[0];
    const [x1] = p[p.length - 1];
    return `M${x0.toFixed(1)} ${BASE_Y} ${p.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} L${x1.toFixed(1)} ${BASE_Y} Z`;
  };

  const etiqueta = t("normalEtiqueta", { media: num(media), sigma: num(sigma) });
  const textoBanda = (b: (typeof bandas)[number]) => t("normalBanda", { k: b.k, porcentaje: num(b.porcentaje), desde: num(b.desde), hasta: num(b.hasta) });
  const z = hayMarca ? zScore(visual.marcarX!, media, sigma) : null;
  const textoMarca = z !== null ? t("normalMarca", { x: num(visual.marcarX!), z: (z > 0 ? "+" : "") + num(z) }) : null;

  const alternativa = (
    <>
      <p>{etiqueta}</p>
      <ul>
        {bandas.map((b) => (
          <li key={b.k}>{textoBanda(b)}</li>
        ))}
      </ul>
      {textoMarca && <p>{textoMarca}</p>}
    </>
  );

  const marcaVisible = hayMarca && r.paso >= 4;

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <div className="flex w-full flex-col items-center gap-2">
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={etiqueta} className="h-auto w-full max-w-sm text-foreground">
          {[3, 2, 1].map((k) => (
            <motion.path
              key={k}
              d={areaBanda(k)}
              fill={COLOR_ESTADISTICA}
              initial={r.reducir ? false : { opacity: 0 }}
              animate={{ opacity: r.paso >= k ? OPACIDAD_BANDA[k as 1 | 2 | 3] : 0 }}
              transition={{ duration: 0.5 }}
            />
          ))}
          <path d={curva} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
          <line x1={MARGEN_X} x2={ANCHO - MARGEN_X} y1={BASE_Y} y2={BASE_Y} stroke="currentColor" strokeOpacity={0.5} />
          {[-3, -2, -1, 0, 1, 2, 3].map((j) => {
            const x = media + j * sigma;
            return (
              <g key={j}>
                <line x1={xPix(x)} x2={xPix(x)} y1={BASE_Y} y2={BASE_Y + 4} stroke="currentColor" strokeOpacity={0.6} />
                <text x={xPix(x)} y={BASE_Y + 16} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.85}>
                  {num(redondearEje(x))}
                </text>
                <text x={xPix(x)} y={BASE_Y + 29} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.55}>
                  {j === 0 ? "μ" : j > 0 ? `+${j}σ` : `−${Math.abs(j)}σ`}
                </text>
              </g>
            );
          })}
          {hayMarca && (
            <motion.g initial={r.reducir ? false : { opacity: 0 }} animate={{ opacity: marcaVisible ? 1 : 0 }} transition={{ duration: 0.4 }}>
              <line x1={xPix(visual.marcarX!)} x2={xPix(visual.marcarX!)} y1={BASE_Y} y2={yPix(visual.marcarX!) - 6} stroke="var(--logro)" strokeWidth={2.5} />
              <circle cx={xPix(visual.marcarX!)} cy={yPix(visual.marcarX!)} r={4.5} fill="var(--logro)" stroke="var(--background)" strokeWidth={1.5} />
              <text x={xPix(visual.marcarX!)} y={yPix(visual.marcarX!) - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                {`z = ${z! > 0 ? "+" : ""}${num(z!)}`}
              </text>
            </motion.g>
          )}
        </svg>
        <ul className="flex w-full flex-col gap-1">
          {bandas.map((b) => (
            <li key={b.k} className="text-xs font-semibold" style={{ color: r.paso >= b.k ? "var(--foreground)" : "var(--texto-secundario)", opacity: r.paso >= b.k ? 1 : 0.4 }}>
              {textoBanda(b)}
            </li>
          ))}
        </ul>
        {marcaVisible && textoMarca && (
          <p className="text-center text-sm font-semibold" style={{ color: COLOR_ESTADISTICA }}>
            {textoMarca}
          </p>
        )}
      </div>
    </MarcoVisual>
  );
}

// Las marcas del eje se muestran con hasta 2 decimales.
function redondearEje(x: number): number {
  return Math.round(x * 100) / 100;
}
