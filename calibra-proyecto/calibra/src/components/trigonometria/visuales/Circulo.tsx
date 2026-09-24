"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";
import { VISTA_CIRCULO, datosCirculo, textoCirculo, type PasoCirculoDatos } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaCirculo } from "@/lib/trigonometria/visuales";
import { COLOR_COSENO, COLOR_SENO, COLOR_TRIGONOMETRIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualTrigonometriaCirculo;
}

function calcular(v: VisualTrigonometriaCirculo): PasoCirculoDatos[] | null {
  try {
    const p = datosCirculo(v);
    return p.length > 0 ? p : null;
  } catch {
    return null;
  }
}

const ETIQUETAS_GRADOS = ["0°", "90°", "180°", "270°"];
const ETIQUETAS_RADIANES = ["0", "π/2", "π", "3π/2"];

// Círculo unitario: el radio barre hasta cada ángulo (giro con transición CSS),
// y se ven el punto (cos θ, sen θ), sus proyecciones (coseno en naranja sobre
// el eje x, seno en azul sobre el eje y), el ángulo de referencia y los valores
// exactos. Las coordenadas y los valores salen de datosCirculo() (ya
// redondeadas: Math.sin/cos difieren en el último bit entre Node y Chromium).
export default function Circulo({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const pasos = calcular(visual);
  const { alVer, ...r } = useReproductor({ total: pasos?.length ?? 0, ms: 2800, estatico: visual.estatico, inicio: pasos ? 1 : 0 });
  if (!pasos) return null;

  const { ancho, alto, cx, cy, radio } = VISTA_CIRCULO;
  const p = pasos[Math.max(0, r.paso - 1)];
  const unidad = visual.unidad ?? "ambas";
  const conReferencia = visual.mostrar?.includes("referencia") ?? false;
  const conValores = visual.valores !== false;
  const etiquetasEje = unidad === "radianes" ? ETIQUETAS_RADIANES : ETIQUETAS_GRADOS;
  // La proyección sobre el eje y (seno) y sobre el eje x (coseno), en px.
  const proyX = { x: p.punto.x, y: cy };
  const proyY = { x: cx, y: p.punto.y };

  const angulo =
    unidad === "grados" ? `$${p.gradosTex}$` : unidad === "radianes" ? `$${p.radianesTex}$` : `$${p.gradosTex}=${p.radianesTex}\\ \\text{rad}$`;
  const cuadrante = p.cuadrante === null ? t("circulo.sobreEje") : t("circulo.cuadrante", { n: p.cuadrante });

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.circulo")}
      titulo={visual.titulo}
      alternativa={<p>{textoCirculo(visual)}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[340px]">
        {/* ejes y círculo */}
        <line x1={cx - radio - 22} y1={cy} x2={cx + radio + 22} y2={cy} stroke="var(--border)" strokeWidth={1.5} />
        <line x1={cx} y1={cy - radio - 22} x2={cx} y2={cy + radio + 22} stroke="var(--border)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={radio} fill={`color-mix(in oklab, ${COLOR_TRIGONOMETRIA} 6%, transparent)`} stroke="var(--foreground)" strokeOpacity={0.55} strokeWidth={1.5} />
        <text x={cx + radio + 6} y={cy - 6} className="fill-foreground text-[10px]" opacity={0.7}>
          {etiquetasEje[0]}
        </text>
        <text x={cx + 6} y={cy - radio - 8} className="fill-foreground text-[10px]" opacity={0.7}>
          {etiquetasEje[1]}
        </text>
        <text x={cx - radio - 6} y={cy - 6} textAnchor="end" className="fill-foreground text-[10px]" opacity={0.7}>
          {etiquetasEje[2]}
        </text>
        <text x={cx + 6} y={cy + radio + 16} className="fill-foreground text-[10px]" opacity={0.7}>
          {etiquetasEje[3]}
        </text>
        <text x={cx + radio - 10} y={cy + 13} className="fill-foreground text-[10px]" opacity={0.5}>
          1
        </text>

        {/* arcos del ángulo y de la referencia (aparecen cuando termina el giro) */}
        {p.arco && (
          <path key={`arco-${r.paso}`} d={p.arco} fill="none" stroke="var(--foreground)" strokeWidth={2} style={{ opacity: 1, transition: transicion(r.reducir, "opacity", 400, 700) }} />
        )}
        {conReferencia && p.arcoReferencia && <path d={p.arcoReferencia} fill="none" stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} strokeDasharray="4 3" />}

        {/* proyecciones */}
        {conValores && (
          <>
            <line x1={p.punto.x} y1={p.punto.y} x2={proyX.x} y2={proyX.y} stroke={COLOR_SENO} strokeWidth={2.5} strokeDasharray="5 3" />
            <line x1={p.punto.x} y1={p.punto.y} x2={proyY.x} y2={proyY.y} stroke={COLOR_COSENO} strokeWidth={2.5} strokeDasharray="5 3" />
            <circle cx={proyX.x} cy={proyX.y} r={3.5} fill={COLOR_COSENO} />
            <circle cx={proyY.x} cy={proyY.y} r={3.5} fill={COLOR_SENO} />
          </>
        )}

        {/* radio que gira hasta el ángulo */}
        <g style={{ transform: `rotate(${p.rotacion}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: transicion(r.reducir, "transform", 900) }}>
          <line x1={cx} y1={cy} x2={cx + radio} y2={cy} stroke={COLOR_TRIGONOMETRIA} strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx + radio} cy={cy} r={6} fill={COLOR_TRIGONOMETRIA} stroke="var(--surface)" strokeWidth={2} />
        </g>
        <circle cx={cx} cy={cy} r={2.5} fill="var(--foreground)" />
      </svg>

      <Leyenda>
        <MathText texto={`${t("circulo.angulo")} ${angulo} · ${cuadrante}`} />
        {conValores && (
          <>
            <br />
            <span style={{ color: COLOR_COSENO }} className="font-semibold">
              <MathText texto={`$\\cos\\theta=${p.cosTex}$`} />
            </span>
            {"  "}
            <span style={{ color: COLOR_SENO }} className="font-semibold">
              <MathText texto={`$\\operatorname{sen}\\theta=${p.senTex}$`} />
            </span>
            {"  "}
            <MathText texto={`$\\tan\\theta=${p.tanTex === "\\text{indefinida}" ? `\\text{${t("circulo.indefinida")}}` : p.tanTex}$`} />
          </>
        )}
        {conReferencia && p.cuadrante !== null && (
          <>
            <br />
            <MathText texto={t("circulo.referencia", { g: p.referencia })} />
          </>
        )}
      </Leyenda>
    </MarcoVisual>
  );
}
