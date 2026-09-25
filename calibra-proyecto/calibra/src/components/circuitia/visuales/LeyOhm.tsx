"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosLeyOhm, type DatosLeyOhm, type MagnitudOhm } from "@/lib/circuitia/visualesDatos";
import type { VisualCircuitiaLeyOhm } from "@/lib/circuitia/visuales";
import { COLOR_CIRCUITIA, Formula, Leyenda, MarcoVisual } from "./comun";

interface Props {
  visual: VisualCircuitiaLeyOhm;
}

function calcular(v: VisualCircuitiaLeyOhm): DatosLeyOhm | null {
  try {
    return datosLeyOhm(v);
  } catch {
    return null;
  }
}

const UNIDAD: Record<MagnitudOhm, string> = { v: "V", i: "A", r: "Ω" };
const LETRA: Record<MagnitudOhm, string> = { v: "V", i: "I", r: "R" };

// Triángulo V / I / R (mnemotécnico clásico de V = I·R): V arriba, I abajo a
// la izquierda y R abajo a la derecha. Los 2 valores dados se muestran desde
// el principio; el que falta se revela al final de la animación, siempre
// calculado por datosLeyOhm (V = I·R). Los valores van en una fila bajo el
// triángulo para que se lean bien también en pantallas angostas.
export default function LeyOhm({ visual }: Props) {
  const t = useTranslations("Circuitia.visuales");
  const datos = useMemo(() => calcular(visual), [visual]);
  const { alVer, ...r } = useReproductor({ total: 1, ms: 1600, estatico: visual.estatico, inicio: 0 });
  if (!datos) return null;

  const revelado = r.paso >= 1;
  const valorTexto = (m: MagnitudOhm): string => (m === datos.incognita && !revelado ? "?" : `${datos[m]} ${UNIDAD[m]}`);
  const formula = datos.incognita === "v" ? "V = I \\cdot R" : datos.incognita === "i" ? "I = \\frac{V}{R}" : "R = \\frac{V}{I}";
  const colorDe = (m: MagnitudOhm) => (m === datos.incognita ? (revelado ? "var(--logro)" : "var(--error)") : COLOR_CIRCUITIA);

  const letras: Record<MagnitudOhm, { x: number; y: number }> = { v: { x: 100, y: 52 }, i: { x: 62, y: 112 }, r: { x: 138, y: 112 } };
  const columnas: Record<MagnitudOhm, number> = { v: 100, i: 36, r: 164 };
  // Orden de la fila de valores: I, V, R (izquierda a derecha).
  const fila: MagnitudOhm[] = ["i", "v", "r"];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.leyOhm")}
      titulo={visual.titulo}
      alternativa={
        <p>
          {t("alternativa.leyOhm", { v: `${datos.v} V`, i: `${datos.i} A`, r: `${datos.r} Ω`, incognita: LETRA[datos.incognita] })}
        </p>
      }
      controles={<ControlesReproductor r={r} color={COLOR_CIRCUITIA} />}
    >
      <svg viewBox="0 0 200 178" className="mx-auto h-auto w-full max-w-[280px]" focusable="false">
        <polygon points="100,8 20,132 180,132" fill="none" stroke={COLOR_CIRCUITIA} strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={52} y1={82} x2={148} y2={82} stroke={COLOR_CIRCUITIA} strokeWidth={2.5} />
        <line x1={100} y1={82} x2={100} y2={132} stroke={COLOR_CIRCUITIA} strokeWidth={2.5} />
        {(Object.keys(letras) as MagnitudOhm[]).map((m) => (
          <text key={m} x={letras[m].x} y={letras[m].y} textAnchor="middle" className="text-[26px] font-black" fill={colorDe(m)}>
            {LETRA[m]}
          </text>
        ))}
        {fila.map((m) => (
          <text key={`v${m}`} x={columnas[m]} y={162} textAnchor="middle" className="text-[12.5px] font-bold" fill={colorDe(m)}>
            {`${LETRA[m]} = ${valorTexto(m)}`}
          </text>
        ))}
      </svg>
      <Formula tex={formula} />
      <Leyenda>{t(`leyOhm.${revelado ? "resultado" : "pregunta"}`, { letra: LETRA[datos.incognita] })}</Leyenda>
    </MarcoVisual>
  );
}
