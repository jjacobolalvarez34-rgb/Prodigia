"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { ANCHO, AREA_H, AREA_W, EjeVertical, MARGEN, Marco, marcasDe, xDe, yDe } from "@/components/estadistica/ejes";
import type { EjeValores } from "@/lib/estadistica/tipos";
import { esListaNumeros, regresionLineal } from "@/lib/estadistica/visualesDatos";
import type { VisualEstadisticaDispersion } from "@/lib/estadistica/visuales";
import { COLOR_ESTADISTICA, MarcoVisual, useNumero } from "./comun";

interface Props {
  visual: VisualEstadisticaDispersion;
}

// Un eje "agradable" que arranca en 0 (o en el mínimo si es negativo) y
// llega un poco más allá del máximo, con un tick redondo.
function ejeAuto(valores: readonly number[], etiqueta: string): EjeValores {
  const max = Math.max(...valores);
  const min = Math.min(0, ...valores);
  const rango = Math.max(1e-9, max - min);
  const candidatos = [1, 2, 5, 10, 20, 25, 50, 100];
  const tick = candidatos.find((c) => rango / c <= 6) ?? candidatos[candidatos.length - 1];
  return { min: Math.floor(min / tick) * tick, max: Math.ceil((max + 1e-9) / tick) * tick, tick, etiqueta };
}

// Diagrama de dispersión con, opcionalmente, la recta de mínimos
// cuadrados (correlación y regresión lineal simple). r, pendiente e
// intercepto salen de regresionLineal() (visualesDatos.ts).
export default function Dispersion({ visual }: Props) {
  const t = useTranslations("Estadistica.visuales");
  const num = useNumero();
  const ok = esListaNumeros(visual.x) && esListaNumeros(visual.y) && visual.x.length === visual.y.length;
  const xs = ok ? visual.x : [0, 1];
  const ys = ok ? visual.y : [0, 1];
  const n = xs.length;
  const r = useReproductor({ total: n, ms: 400, estatico: visual.estatico });
  if (!ok) return null;

  const reg = regresionLineal(xs, ys);
  const ejeX = ejeAuto(xs, visual.etiquetaX ?? "x");
  const ejeY = ejeAuto(ys, visual.etiquetaY ?? "y");
  const reducir = r.reducir;

  const etiqueta = t("dispersionEtiqueta", { r: num(reg.r) });
  const alternativa = (
    <>
      <p>{t("dispersionPuntos", { puntos: xs.map((xi, i) => `(${num(xi)}, ${num(ys[i])})`).join(", ") })}</p>
      <p>{t("dispersionR", { r: num(reg.r) })}</p>
      {visual.mostrarRecta && <p>{t("dispersionRecta", { pendiente: num(reg.pendiente), intercepto: num(reg.intercepto) })}</p>}
    </>
  );

  const xPix = (v: number) => xDe(v, ejeX);
  const yPix = (v: number) => yDe(v, ejeY);
  const yRecta = (xv: number) => Math.max(ejeY.min, Math.min(ejeY.max, reg.pendiente * xv + reg.intercepto));

  return (
    <MarcoVisual refCont={r.alVer} etiqueta={etiqueta} titulo={visual.titulo} alternativa={alternativa} controles={<ControlesReproductor r={r} color={COLOR_ESTADISTICA} />}>
      <Marco titulo={etiqueta} ariaLabel={etiqueta}>
        <EjeVertical eje={ejeY} />
        {marcasDe(ejeX).map((v) => (
          <text key={`x-${v}`} x={xPix(v)} y={MARGEN.arriba + AREA_H + 16} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.75}>
            {v}
          </text>
        ))}
        <line x1={MARGEN.izq} x2={MARGEN.izq + AREA_W} y1={yPix(ejeY.min)} y2={yPix(ejeY.min)} stroke="currentColor" strokeOpacity={0.5} />
        {visual.mostrarRecta && r.paso >= n && (
          <motion.line
            initial={reducir ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            x1={xPix(ejeX.min)}
            y1={yPix(yRecta(ejeX.min))}
            x2={xPix(ejeX.max)}
            y2={yPix(yRecta(ejeX.max))}
            stroke={COLOR_ESTADISTICA}
            strokeWidth={2}
          />
        )}
        {xs.map((xi, i) => {
          const visible = i < r.paso;
          return (
            <motion.circle
              key={i}
              cx={xPix(xi)}
              cy={yPix(ys[i])}
              r={5}
              initial={reducir ? false : { opacity: 0 }}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              fill={COLOR_ESTADISTICA}
              stroke="var(--background)"
              strokeWidth={1.5}
            />
          );
        })}
        <text x={ANCHO / 2} y={MARGEN.arriba + AREA_H + 32} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.75}>
          {visual.etiquetaX ?? "x"}
        </text>
        <text x={MARGEN.izq} y={MARGEN.arriba - 8} fontSize={10} fill="currentColor" fillOpacity={0.75}>
          {visual.etiquetaY ?? "y"}
        </text>
      </Marco>
      {r.paso >= n && (
        <motion.div initial={reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-0.5 text-center text-sm font-semibold" style={{ color: COLOR_ESTADISTICA }}>
          <p>{t("dispersionR", { r: num(reg.r) })}</p>
          {visual.mostrarRecta && <p>{t("dispersionRecta", { pendiente: num(reg.pendiente), intercepto: num(reg.intercepto) })}</p>}
        </motion.div>
      )}
    </MarcoVisual>
  );
}
