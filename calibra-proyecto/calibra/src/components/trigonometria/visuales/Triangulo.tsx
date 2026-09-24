"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import TrianguloSVG from "@/components/trigonometria/TrianguloSVG";
import { OPERADOR_TEX } from "@/lib/trigonometria/exactos";
import { redondear } from "@/lib/trigonometria/triangulos";
import { datosTriangulo, decTex, textoTriangulo, type Rol, type TrianguloDatos } from "@/lib/trigonometria/visualesDatos";
import type { VisualTrigonometriaTriangulo } from "@/lib/trigonometria/visuales";
import MathText from "@/components/MathText";
import { COLOR_COSENO, COLOR_HIPOTENUSA, COLOR_SENO, COLOR_TRIGONOMETRIA, Formula, Leyenda, MarcoVisual, useSeparadorDecimal } from "./comun";

interface Props {
  visual: VisualTrigonometriaTriangulo;
}

const COLOR_ROL: Record<Rol, string> = { opuesto: COLOR_SENO, adyacente: COLOR_COSENO, hipotenusa: COLOR_HIPOTENUSA };

function calcular(v: VisualTrigonometriaTriangulo): TrianguloDatos | null {
  try {
    return datosTriangulo(v);
  } catch {
    return null;
  }
}

// Triángulo rectángulo con los lados nombrados según el ángulo elegido
// (opuesto, adyacente, hipotenusa) y las razones armadas con los números
// reales, paso a paso. Los números salen de datosTriangulo() (visualesDatos.ts).
export default function Triangulo({ visual }: Props) {
  const t = useTranslations("Trigonometria.visuales");
  const sep = useSeparadorDecimal();
  const datos = calcular(visual);
  const total = datos?.pasos.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;

  const actual = datos.pasos[Math.max(0, r.paso - 1)];
  // Los roles ya presentados (se van nombrando en el dibujo a medida que aparecen).
  const nombrados = new Set<Rol>();
  for (const p of datos.pasos.slice(0, r.paso)) p.resaltar.forEach((x) => nombrados.add(x));
  const rolesDe = datos.rolDe;
  const clave = { a: "ladoA", b: "ladoB", c: "ladoC" } as const;
  const resaltar: Partial<Record<"ladoA" | "ladoB" | "ladoC", string>> = {};
  const nombres: Partial<Record<"ladoA" | "ladoB" | "ladoC", string>> = {};
  for (const l of ["a", "b", "c"] as const) {
    if (actual.resaltar.includes(rolesDe[l])) resaltar[clave[l]] = COLOR_ROL[rolesDe[l]];
    if (nombrados.has(rolesDe[l])) nombres[clave[l]] = t(`roles.${rolesDe[l]}`);
  }

  let leyenda: React.ReactNode;
  let formula: string | null = null;
  if (actual.razon) {
    const z = actual.razon;
    const num = decTex(z.numValor, 2, sep);
    const den = decTex(z.denValor, 2, sep);
    const exacto = Math.abs(redondear(z.valor, 2) - z.valor) < 1e-9;
    formula = `${OPERADOR_TEX[z.fn]}(${datos.vertice})=\\dfrac{\\text{${t(`roles.${z.num}`)}}}{\\text{${t(`roles.${z.den}`)}}}=\\dfrac{${num}}{${den}}${exacto ? "=" : "\\approx"}${decTex(z.valor, 2, sep)}`;
    leyenda = <MathText texto={t(`triangulo.razon.${z.fn}`)} />;
  } else {
    leyenda = <MathText texto={t(`triangulo.${actual.id}`, { vertice: datos.vertice })} />;
  }
  const acento = actual.razon ? COLOR_TRIGONOMETRIA : COLOR_ROL[actual.resaltar[0]];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.triangulo")}
      titulo={visual.titulo}
      alternativa={<p>{textoTriangulo(visual, sep)}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_TRIGONOMETRIA} />}
    >
      <TrianguloSVG
        triangulo={{
          ladoA: datos.a,
          ladoB: datos.b,
          ladoC: datos.c,
          anguloA: (Math.atan2(datos.a, datos.b) * 180) / Math.PI,
          anguloB: 90 - (Math.atan2(datos.a, datos.b) * 180) / Math.PI,
          anguloC: 90,
          marcarRectoEn: "C",
          ocultarAngulos: ["A", "B"],
        }}
        colorHex={COLOR_TRIGONOMETRIA}
        resaltar={resaltar}
        nombres={nombres}
        marcarAngulo={datos.vertice}
        descripcion={textoTriangulo(visual, sep)}
      />
      <Leyenda acento={acento}>{leyenda}</Leyenda>
      {formula && <Formula tex={formula} />}
    </MarcoVisual>
  );
}
