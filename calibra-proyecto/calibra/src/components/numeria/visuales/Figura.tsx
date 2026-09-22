"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaFigura } from "@/lib/numeria/visuales";
import { ternaPitagorica, areaCompuesta, areaCirculo, anguloComplementario } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaFigura;
}

type T = ReturnType<typeof useTranslations>;

// Segundo color (naranja) para distinguir la parte "recortada" del área
// compuesta, o el segundo ángulo, del violeta principal de Numeria.
const ACENTO2 = "#E8703A";

function Triangulo({ visual, t }: { visual: Extract<VisualNumeriaFigura, { modo: "triangulo" }>; t: T }) {
  const cateto1 = Math.trunc(visual.cateto1);
  const cateto2 = Math.trunc(visual.cateto2);
  const valido = Number.isFinite(cateto1) && cateto1 > 0 && Number.isFinite(cateto2) && cateto2 > 0;
  const { alVer, ...r } = useReproductor({ total: 3, ms: 1300, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? ternaPitagorica(cateto1, cateto2) : null;
  if (!datos) return null;
  const { hipotenusa } = datos;
  const hipotenusaTexto = Number.isInteger(hipotenusa) ? String(hipotenusa) : hipotenusa.toFixed(2);

  const escala = Math.min(14, 130 / Math.max(cateto1, cateto2));
  const w = cateto1 * escala;
  const h = cateto2 * escala;

  const alternativa = (
    <ol>
      <li>{t("cateto", { n: 1, valor: cateto1 })}</li>
      <li>{t("cateto", { n: 2, valor: cateto2 })}</li>
      <li>{t("hipotenusa", { n: hipotenusaTexto })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiquetaTriangulo", { c1: cateto1, c2: cateto2 })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <svg viewBox={`0 0 ${w + 40} ${h + 40}`} width={w + 40} height={h + 40} className="max-w-full text-foreground">
        <polygon points={`20,20 20,${20 + h} ${20 + w},${20 + h}`} fill="none" stroke={COLOR_NUMERIA} strokeWidth={2} />
        <rect x={20} y={20 + h - 10} width={10} height={10} fill="none" stroke={COLOR_NUMERIA} strokeWidth={1.5} />
        {r.paso >= 1 && (
          <text x={8} y={20 + h / 2} fontSize={12} fontWeight="bold" fill="currentColor" textAnchor="middle">
            {cateto2}
          </text>
        )}
        {r.paso >= 2 && (
          <text x={20 + w / 2} y={20 + h + 16} fontSize={12} fontWeight="bold" fill="currentColor" textAnchor="middle">
            {cateto1}
          </text>
        )}
        {r.paso >= 3 && (
          <text x={20 + w / 2 + 8} y={20 + h / 2 - 6} fontSize={12} fontWeight="bold" fill={COLOR_NUMERIA} textAnchor="middle">
            {hipotenusaTexto}
          </text>
        )}
      </svg>
      {r.paso >= 3 && <Resaltado>{t("hipotenusa", { n: hipotenusaTexto })}</Resaltado>}
    </MarcoVisual>
  );
}

function AreaCompuestaFig({ visual, t }: { visual: Extract<VisualNumeriaFigura, { modo: "areaCompuesta" }>; t: T }) {
  const anchoGrande = Math.trunc(visual.anchoGrande);
  const altoGrande = Math.trunc(visual.altoGrande);
  const anchoRecorte = Math.trunc(visual.anchoRecorte);
  const altoRecorte = Math.trunc(visual.altoRecorte);
  const valido =
    [anchoGrande, altoGrande, anchoRecorte, altoRecorte].every((n) => Number.isFinite(n) && n > 0) &&
    anchoRecorte < anchoGrande &&
    altoRecorte < altoGrande;
  const { alVer, ...r } = useReproductor({ total: 3, ms: 1500, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? areaCompuesta(anchoGrande, altoGrande, anchoRecorte, altoRecorte) : null;
  if (!datos) return null;
  const { areaGrande, areaRecorte, areaFinal } = datos;

  const escala = Math.min(16, 160 / anchoGrande, 120 / altoGrande);
  const wG = anchoGrande * escala;
  const hG = altoGrande * escala;
  const wR = anchoRecorte * escala;
  const hR = altoRecorte * escala;

  const alternativa = (
    <ol>
      <li>{t("areaGrande", { ancho: anchoGrande, alto: altoGrande, n: areaGrande })}</li>
      <li>{t("areaRecorte", { ancho: anchoRecorte, alto: altoRecorte, n: areaRecorte })}</li>
      <li>{t("areaFinal", { n: areaFinal })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiquetaArea", { ancho: anchoGrande, alto: altoGrande })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <svg viewBox={`0 0 ${wG + 4} ${hG + 4}`} width={wG + 4} height={hG + 4} className="max-w-full">
        <motion.rect
          x={2}
          y={2}
          width={wG}
          height={hG}
          fill={`color-mix(in oklab, ${COLOR_NUMERIA} 22%, transparent)`}
          stroke={COLOR_NUMERIA}
          strokeWidth={2}
          animate={{ opacity: r.paso >= 1 ? 1 : 0.3 }}
        />
        {r.paso >= 2 && (
          <rect x={2 + wG - wR} y={2} width={wR} height={hR} fill="var(--background)" stroke={ACENTO2} strokeWidth={2} strokeDasharray="4 3" />
        )}
      </svg>
      <div className="flex flex-col items-center gap-1 text-center">
        {r.paso >= 1 && <span className="text-xs text-texto-secundario">{t("areaGrande", { ancho: anchoGrande, alto: altoGrande, n: areaGrande })}</span>}
        {r.paso >= 2 && (
          <span className="text-xs text-texto-secundario" style={{ color: ACENTO2 }}>
            {t("areaRecorte", { ancho: anchoRecorte, alto: altoRecorte, n: areaRecorte })}
          </span>
        )}
        {r.paso >= 3 && <Resaltado>{t("areaFinal", { n: areaFinal })}</Resaltado>}
      </div>
    </MarcoVisual>
  );
}

function Circulo({ visual, t }: { visual: Extract<VisualNumeriaFigura, { modo: "circulo" }>; t: T }) {
  const radio = Math.trunc(visual.radio);
  const valido = Number.isFinite(radio) && radio > 0;
  const { alVer, ...r } = useReproductor({ total: 2, ms: 1600, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? areaCirculo(radio) : null;
  if (!datos) return null;
  const { multiploDe7, area } = datos;
  const areaTexto = Number.isInteger(area) ? String(area) : area.toFixed(2);
  const piTexto = multiploDe7 ? "22/7" : "3.14";

  const escala = Math.min(10, 90 / radio);
  const rPx = radio * escala;
  const tam = rPx * 2 + 30;

  const alternativa = (
    <ol>
      <li>{t("radio", { n: radio })}</li>
      <li>{t("area", { pi: piTexto, n: areaTexto })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiquetaCirculo", { n: radio })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <svg viewBox={`0 0 ${tam} ${tam}`} width={tam} height={tam} className="max-w-full text-foreground">
        <circle cx={tam / 2} cy={tam / 2} r={rPx} fill={`color-mix(in oklab, ${COLOR_NUMERIA} 18%, transparent)`} stroke={COLOR_NUMERIA} strokeWidth={2} />
        {r.paso >= 1 && <line x1={tam / 2} y1={tam / 2} x2={tam / 2 + rPx} y2={tam / 2} stroke={COLOR_NUMERIA} strokeWidth={2} />}
        {r.paso >= 1 && (
          <text x={tam / 2 + rPx / 2} y={tam / 2 - 6} fontSize={12} fontWeight="bold" fill="currentColor" textAnchor="middle">
            {radio}
          </text>
        )}
      </svg>
      {r.paso >= 1 && <span className="text-xs text-texto-secundario">{t("radio", { n: radio })}</span>}
      {r.paso >= 2 && <Resaltado>{t("area", { pi: piTexto, n: areaTexto })}</Resaltado>}
    </MarcoVisual>
  );
}

function Angulos({ visual, t }: { visual: Extract<VisualNumeriaFigura, { modo: "angulos" }>; t: T }) {
  const conocido = Math.trunc(visual.conocido);
  const tipoAngulo = visual.tipoAngulo === "complementario" ? "complementario" : "suplementario";
  const tope = tipoAngulo === "complementario" ? 90 : 180;
  const valido = Number.isFinite(conocido) && conocido > 0 && conocido < tope;
  const { alVer, ...r } = useReproductor({ total: 2, ms: 1300, estatico: visual.estatico, inicio: 1 });
  const datos = valido ? anguloComplementario(tipoAngulo, conocido) : null;
  if (!datos) return null;
  const { total, otro } = datos;
  const anchoBarra = 220;
  const anchoConocido = (conocido / total) * anchoBarra;
  const anchoOtro = anchoBarra - anchoConocido;

  const alternativa = (
    <ol>
      <li>{t("conocido", { n: conocido })}</li>
      <li>{t("otro", { total, n: otro })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiquetaAngulos", { total, n: conocido })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex h-10 w-full max-w-xs overflow-hidden rounded-lg border" style={{ borderColor: COLOR_NUMERIA }}>
        <motion.div
          animate={{ width: r.paso >= 1 ? anchoConocido : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center text-xs font-bold text-white"
          style={{ background: COLOR_NUMERIA }}
        >
          {r.paso >= 1 ? `${conocido}°` : ""}
        </motion.div>
        <motion.div
          animate={{ width: r.paso >= 2 ? anchoOtro : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center text-xs font-bold text-white"
          style={{ background: ACENTO2 }}
        >
          {r.paso >= 2 ? `${otro}°` : ""}
        </motion.div>
      </div>
      {r.paso >= 1 && <span className="text-xs text-texto-secundario">{t("conocido", { n: conocido })}</span>}
      {r.paso >= 2 && <Resaltado>{t("otro", { total, n: otro })}</Resaltado>}
    </MarcoVisual>
  );
}

// Técnicas de Geometría: 4 figuras posibles (triángulo rectángulo,
// rectángulo con un recorte, círculo, dos ángulos) — cada una con sus
// medidas etiquetadas y el resultado calculado con
// src/lib/numeria/visualesDatos.ts, animado paso a paso.
export default function Figura({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.figura");
  if (visual.modo === "triangulo") return <Triangulo visual={visual} t={t} />;
  if (visual.modo === "areaCompuesta") return <AreaCompuestaFig visual={visual} t={t} />;
  if (visual.modo === "circulo") return <Circulo visual={visual} t={t} />;
  if (visual.modo === "angulos") return <Angulos visual={visual} t={t} />;
  return null;
}
