"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { VISTA_IDENTIDAD, datosIdentidad, type DatosIdentidad } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaIdentidad } from "@/lib/trigonometria/visuales";
import { COLOR_COSENO, COLOR_HIPOTENUSA, COLOR_SENO, COLOR_TRIGONOMETRIA, Formula, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualTrigonometriaIdentidad;
}

function calcular(v: VisualTrigonometriaIdentidad): DatosIdentidad | null {
  try {
    return datosIdentidad(v);
  } catch {
    return null;
  }
}

const HALO = { stroke: "var(--surface)", strokeWidth: 3.5, paintOrder: "stroke" } as const;

// La identidad pitagórica sen² θ + cos² θ = 1 sobre el círculo unitario: el
// triángulo con hipotenusa 1 y catetos cos θ y sen θ, la cuenta con los valores
// exactos del ángulo y, en la forma «derivadas», 1 + tan² θ = sec² θ y
// 1 + cot² θ = cosec² θ. Los números salen de datosIdentidad() (anillo exacto
// Q(√2, √3), que también comprueba que las tres identidades se cumplan).
export default function Identidad({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const datos = useMemo(() => calcular(visual), [visual]);
  const derivadas = visual.forma === "derivadas";
  const total = datos ? (derivadas ? 6 : 4) : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || !datos.cumple) return null;

  const { ancho, alto, cx, cy, radio } = VISTA_IDENTIDAD;
  const p = r.paso;
  const clave = ["circulo", "catetos", "pitagoras", "numeros", "tangente", "cotangente"][Math.max(0, p - 1)];

  let formula: string | null = null;
  if (clave === "pitagoras") formula = datos.pitagorica.general;
  if (clave === "numeros") formula = `${datos.pitagorica.conNumeros}=${datos.pitagorica.suma}`;
  if (clave === "tangente" && datos.tangente) formula = `${datos.tangente.general}\\qquad ${datos.tangente.conNumeros}`;
  if (clave === "cotangente" && datos.cotangente) formula = `${datos.cotangente.general}\\qquad ${datos.cotangente.conNumeros}`;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.identidad")}
      titulo={visual.titulo}
      alternativa={<p>{datos.textoPlano}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[360px]">
        <line x1={cx - radio - 14} y1={cy} x2={cx + radio + 14} y2={cy} stroke="var(--border)" strokeWidth={1.5} />
        <line x1={cx} y1={cy - radio - 14} x2={cx} y2={cy + radio + 14} stroke="var(--border)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={radio} fill={`color-mix(in oklab, ${COLOR_TRIGONOMETRIA} 6%, transparent)`} stroke="var(--foreground)" strokeOpacity={0.55} strokeWidth={1.5} />

        {/* triángulo inscripto: hipotenusa 1, catetos cos θ (naranja) y sen θ (azul) */}
        <g style={{ opacity: p >= 2 ? 1 : 0, transition: transicion(r.reducir, "opacity", 500) }}>
          <polygon points={`${datos.origen.x},${datos.origen.y} ${datos.pie.x},${datos.pie.y} ${datos.punto.x},${datos.punto.y}`} fill={`color-mix(in oklab, ${COLOR_TRIGONOMETRIA} 14%, transparent)`} />
          <line x1={datos.origen.x} y1={datos.origen.y} x2={datos.pie.x} y2={datos.pie.y} stroke={COLOR_COSENO} strokeWidth={4.5} strokeLinecap="round" />
          <line x1={datos.pie.x} y1={datos.pie.y} x2={datos.punto.x} y2={datos.punto.y} stroke={COLOR_SENO} strokeWidth={4.5} strokeLinecap="round" />
          <polyline
            points={`${datos.pie.x - 9},${datos.pie.y} ${datos.pie.x - 9},${datos.pie.y - 9} ${datos.pie.x},${datos.pie.y - 9}`}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.5}
          />
          <text x={(datos.origen.x + datos.pie.x) / 2} y={datos.origen.y + 17} textAnchor="middle" className="text-[12px] font-bold" fill={COLOR_COSENO} {...HALO}>
            cos θ
          </text>
          <text x={datos.pie.x + 8} y={(datos.pie.y + datos.punto.y) / 2 + 4} className="text-[12px] font-bold" fill={COLOR_SENO} {...HALO}>
            sen θ
          </text>
        </g>

        {/* radio = hipotenusa = 1 */}
        <line x1={datos.origen.x} y1={datos.origen.y} x2={datos.punto.x} y2={datos.punto.y} stroke={COLOR_HIPOTENUSA} strokeWidth={4} strokeLinecap="round" />
        <circle cx={datos.punto.x} cy={datos.punto.y} r={6} fill={COLOR_HIPOTENUSA} stroke="var(--surface)" strokeWidth={2} />
        <path d={datos.arco} fill="none" stroke="var(--foreground)" strokeWidth={2} />
        <text x={datos.origen.x + 32} y={datos.origen.y - 8} className="text-[12px] font-bold fill-foreground" {...HALO}>
          θ
        </text>
        <text x={(datos.origen.x + datos.punto.x) / 2 - 12} y={(datos.origen.y + datos.punto.y) / 2 - 8} textAnchor="end" className="text-[12px] font-bold" fill={COLOR_HIPOTENUSA} {...HALO}>
          1
        </text>
      </svg>

      {formula && <Formula tex={formula} tamano="text-[15px]" />}
      <Leyenda>
        <MathText texto={t(`identidad.${clave}`, { g: datos.angulo })} />
      </Leyenda>
    </MarcoVisual>
  );
}
