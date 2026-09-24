"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { VISTA_CUADRANTES, datosCuadrantes, textoCuadrantes, type CuadranteDatos } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaCuadrantes } from "@/lib/trigonometria/visuales";
import { COLOR_COSENO, COLOR_SENO, COLOR_TANGENTE, COLOR_TRIGONOMETRIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualTrigonometriaCuadrantes;
}

function calcular(v: VisualTrigonometriaCuadrantes): CuadranteDatos[] | null {
  try {
    return datosCuadrantes(v);
  } catch {
    return null;
  }
}

// Signo de dirección de cada cuadrante (derecha/izquierda y arriba/abajo en pantalla).
const DIRECCION = [
  { dx: 1, dy: -1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: 1 },
] as const;

const ROMANO = ["I", "II", "III", "IV"];
// La letra de la regla: T(odos), S(eno), T(angente), C(oseno).
const LETRA_REGLA = ["T", "S", "T", "C"];

// Signos de seno, coseno y tangente en los cuatro cuadrantes con un ángulo de
// referencia (p. ej. 30°, 150°, 210°, 330°) y la regla «Todos, Seno,
// Tangente, Coseno». Los signos y valores salen de datosCuadrantes().
export default function Cuadrantes({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const cuadrantes = calcular(visual);
  const total = cuadrantes ? 5 : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!cuadrantes) return null;

  const { ancho, alto, cx, cy, radio } = VISTA_CUADRANTES;
  const enRegla = r.paso >= 5;
  const indice = Math.min(3, r.paso - 1);
  const actual = cuadrantes[indice];
  const colorSigno = { sen: COLOR_SENO, cos: COLOR_COSENO, tan: COLOR_TANGENTE } as const;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.cuadrantes")}
      titulo={visual.titulo}
      alternativa={<p>{textoCuadrantes(visual)}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[340px]">
        <line x1={8} y1={cy} x2={ancho - 8} y2={cy} stroke="var(--border)" strokeWidth={1.5} />
        <line x1={cx} y1={4} x2={cx} y2={alto - 4} stroke="var(--border)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={radio} fill="none" stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1.5} />

        {cuadrantes.map((q, i) => {
          const visible = i < Math.min(4, r.paso);
          const activo = i === indice && !enRegla;
          const { dx, dy } = DIRECCION[i];
          const xTexto = cx + dx * 148;
          const yBase = dy < 0 ? 26 : alto - 44;
          return (
            <g key={q.cuadrante} style={{ opacity: visible ? (enRegla ? 0.28 : 1) : 0, transition: transicion(r.reducir, "opacity", 450) }}>
              {activo && (
                <rect x={dx > 0 ? cx : 8} y={dy > 0 ? cy : 4} width={dx > 0 ? ancho - 8 - cx : cx - 8} height={dy > 0 ? alto - 4 - cy : cy - 4} fill={COLOR_TRIGONOMETRIA} opacity={0.09} />
              )}
              <line x1={q.punto.x} y1={q.punto.y} x2={q.punto.x} y2={cy} stroke={COLOR_SENO} strokeWidth={2} strokeDasharray="4 3" />
              <line x1={q.punto.x} y1={q.punto.y} x2={cx} y2={q.punto.y} stroke={COLOR_COSENO} strokeWidth={2} strokeDasharray="4 3" />
              <line x1={cx} y1={cy} x2={q.punto.x} y2={q.punto.y} stroke={COLOR_TRIGONOMETRIA} strokeWidth={activo ? 3 : 2} />
              <circle cx={q.punto.x} cy={q.punto.y} r={activo ? 6 : 4.5} fill={COLOR_TRIGONOMETRIA} stroke="var(--surface)" strokeWidth={1.5} />
              <text x={xTexto} y={yBase - 14} textAnchor={dx > 0 ? "end" : "start"} className="fill-foreground text-[10px] font-bold" opacity={0.7}>
                {ROMANO[i]}
              </text>
              {(["sen", "cos", "tan"] as const).map((f, k) => (
                <text key={f} x={xTexto} y={yBase + k * 13} textAnchor={dx > 0 ? "end" : "start"} className="font-mono text-[11px] font-bold" fill={colorSigno[f]}>
                  {`${f} ${q.signo[f] === "+" ? "+" : "−"}`}
                </text>
              ))}
            </g>
          );
        })}

        {/* la regla: una letra por cuadrante */}
        {cuadrantes.map((q, i) => {
          const { dx, dy } = DIRECCION[i];
          return (
            <text
              key={`letra-${q.cuadrante}`}
              x={cx + dx * 52}
              y={cy + dy * 40 + 10}
              textAnchor="middle"
              className="text-[30px] font-black"
              fill={COLOR_TRIGONOMETRIA}
              style={{ opacity: enRegla ? 1 : 0, transition: transicion(r.reducir, "opacity", 500, i * 150) }}
            >
              {LETRA_REGLA[i]}
            </text>
          );
        })}
      </svg>

      <Leyenda>
        {enRegla ? (
          <MathText texto={t("cuadrantes.regla")} />
        ) : (
          <>
            <MathText texto={t("cuadrantes.angulo", { n: actual.cuadrante, g: actual.grados, ref: visual.referencia })} />
            <br />
            <MathText texto={`$\\operatorname{sen}=${actual.senTex}$`} /> · <MathText texto={`$\\cos=${actual.cosTex}$`} /> · <MathText texto={`$\\tan=${actual.tanTex}$`} />
          </>
        )}
      </Leyenda>
    </MarcoVisual>
  );
}
