"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MEDIDAS_SINCRONIA, datosSincronia, textoSincronia, type DatosSincronia } from "@/lib/historia/visualesDatos";
import type { VisualHistoriaSincronia } from "@/lib/historia/visuales";
import { COLOR_HISTORIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualHistoriaSincronia;
}

function calcular(v: VisualHistoriaSincronia): DatosSincronia | null {
  try {
    return datosSincronia(v);
  } catch {
    return null;
  }
}

const COLORES_CARRIL = ["#D97706", "#7C3AED", "#0D9488", "#2563EB"];

// Sincronía: qué pasaba a la vez en distintas partes del mundo. Un carril por
// región sobre UN MISMO eje de tiempo a escala; cada hecho es un círculo numerado
// (en orden cronológico) y la leyenda de abajo dice cuál es cuál, así que ningún
// texto se solapa. Cada paso agrega un carril.
export default function Sincronia({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const datos = calcular(visual);
  const total = datos ? datos.carriles.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2200, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  const { ancho, alto, x0, x1 } = datos;
  const { altoCarril, margenSup } = MEDIDAS_SINCRONIA;
  const yEje = margenSup + altoCarril * datos.carriles.length + 6;
  const visibles = datos.carriles.slice(0, r.paso);
  const leyenda = datos.leyenda.filter((m) => visibles.some((c) => c.marcas.some((x) => x.id === m.id)));
  const actual = datos.carriles[Math.min(datos.carriles.length, Math.max(1, r.paso)) - 1];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.sincronia")}
      titulo={visual.titulo}
      alternativa={<p>{t("sincronia.alternativa", { lista: textoSincronia(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="mx-auto h-auto w-full max-w-[380px]">
        {datos.marcasEje.map((m) => (
          <g key={m.texto}>
            <line x1={m.y} y1={margenSup - 4} x2={m.y} y2={yEje} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" />
            <text x={m.y} y={yEje + 14} textAnchor="middle" fontSize={9.5} className="fill-foreground" opacity={0.7}>
              {m.texto}
            </text>
          </g>
        ))}
        <line x1={x0} y1={yEje} x2={x1} y2={yEje} stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth={1.5} />
        {datos.carriles.map((c, i) => {
          const color = COLORES_CARRIL[i % COLORES_CARRIL.length];
          const visible = i < r.paso;
          return (
            <g key={c.region} style={{ opacity: visible ? 1 : 0, transition: transicion(r.reducir, "opacity", 450) }}>
              <text x={4} y={c.y + 3.5} fontSize={10} fontWeight={700} fill={color}>
                {t(`regiones.${c.region}`)}
              </text>
              <line x1={x0} y1={c.y} x2={x1} y2={c.y} stroke={color} strokeOpacity={0.35} strokeWidth={2} />
              {c.marcas.map((m) => (
                <g key={m.id}>
                  <circle cx={m.x} cy={c.y} r={10} fill={color} stroke="var(--surface)" strokeWidth={2} />
                  <text x={m.x} y={c.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                    {m.numero}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <ol className="flex flex-col gap-1">
        {leyenda.map((m) => (
          <li key={m.id} className="flex items-start gap-2 text-[12px] leading-snug text-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: COLORES_CARRIL[datos.carriles.findIndex((c) => c.marcas.some((x) => x.id === m.id)) % COLORES_CARRIL.length] }}>
              {m.numero}
            </span>
            <span>
              <strong>{m.anioTexto}</strong> · {m.nombre}
            </span>
          </li>
        ))}
      </ol>
      <Leyenda>{t("sincronia.comparar", { region: t(`regiones.${actual.region}`) })}</Leyenda>
    </MarcoVisual>
  );
}
