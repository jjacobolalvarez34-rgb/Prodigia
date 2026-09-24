"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosLinea, textoLinea, type DatosLinea } from "@/lib/historia/visualesDatos";
import { formatoAnio } from "@/lib/historia/tiempo";
import type { VisualHistoriaLinea } from "@/lib/historia/visuales";
import { COLOR_HISTORIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualHistoriaLinea;
}

function calcular(v: VisualHistoriaLinea): DatosLinea | null {
  try {
    return datosLinea(v);
  } catch {
    return null;
  }
}

const ANCHO_EJE = 104;
const X_EJE = 66;

// Línea de tiempo vertical. En modo «proporcional» el punto de cada hecho se ubica
// sobre el eje a escala (con marcas de años redondos) y un conector lo une con su
// etiqueta, que va en una fila de altura fija: así las etiquetas nunca se solapan
// aunque dos hechos estén muy cerca en el tiempo. En modo «orden» no hay escala y
// la figura lo avisa. Cada paso agrega el hecho siguiente.
export default function Linea({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const datos = calcular(visual);
  const total = datos ? datos.filas.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1800, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  const actual = datos.filas[Math.min(datos.filas.length, Math.max(1, r.paso)) - 1];
  const prop = datos.escala === "proporcional";
  const primero = datos.filas[0];
  const ultimo = datos.filas[datos.filas.length - 1];

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.linea")}
      titulo={visual.titulo}
      alternativa={<p>{t("linea.alternativa", { n: datos.filas.length, lista: textoLinea(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <div className="relative w-full" style={{ height: datos.alto }}>
        <svg width={ANCHO_EJE} height={datos.alto} viewBox={`0 0 ${ANCHO_EJE} ${datos.alto}`} className="absolute left-0 top-0">
          <line x1={X_EJE} y1={datos.margen} x2={X_EJE} y2={datos.alto - datos.margen} stroke="var(--border)" strokeWidth={3} strokeLinecap="round" strokeDasharray={prop ? undefined : "2 6"} />
          {datos.marcas.map((m) => (
            <g key={m.texto}>
              <line x1={X_EJE - 5} y1={m.y} x2={X_EJE + 5} y2={m.y} stroke="var(--foreground)" strokeOpacity={0.45} strokeWidth={1.5} />
              <text x={X_EJE - 9} y={m.y + 3} textAnchor="end" fontSize={9.5} className="fill-foreground" opacity={0.65}>
                {m.texto}
              </text>
            </g>
          ))}
          {datos.eraY !== null && (
            <g>
              <line x1={X_EJE - 12} y1={datos.eraY} x2={X_EJE + 12} y2={datos.eraY} stroke={COLOR_HISTORIA} strokeWidth={2} />
              <text x={X_EJE - 14} y={datos.eraY - 4} textAnchor="end" fontSize={8.5} fontWeight={700} fill={COLOR_HISTORIA}>
                {t("linea.era")}
              </text>
            </g>
          )}
          {datos.filas.map((f, i) => {
            const visible = i < r.paso;
            const activo = i === r.paso - 1;
            const aprox = f.certeza === "aproximada";
            return (
              <g key={f.id} style={{ opacity: visible ? 1 : 0, transition: transicion(r.reducir, "opacity", 450) }}>
                <path d={`M${X_EJE},${f.yEje} L${X_EJE + 16},${f.yEje} L${ANCHO_EJE - 2},${f.yFila}`} fill="none" stroke={COLOR_HISTORIA} strokeOpacity={activo ? 0.9 : 0.4} strokeWidth={1.5} />
                <circle cx={X_EJE} cy={f.yEje} r={activo ? 6.5 : 5} fill={aprox ? "var(--surface)" : COLOR_HISTORIA} stroke={COLOR_HISTORIA} strokeWidth={2} />
              </g>
            );
          })}
        </svg>
        {datos.filas.map((f, i) => {
          const visible = i < r.paso;
          const activo = i === r.paso - 1;
          return (
            <div
              key={f.id}
              className="absolute flex items-center rounded-lg border px-2 text-[11.5px] leading-[14px]"
              style={{
                left: ANCHO_EJE,
                right: 0,
                top: f.yFila - datos.altoFila / 2 + 3,
                height: datos.altoFila - 6,
                opacity: visible ? 1 : 0,
                transition: transicion(r.reducir, "opacity", 450),
                borderColor: activo ? COLOR_HISTORIA : "var(--border)",
                background: activo ? `color-mix(in oklab, ${COLOR_HISTORIA} 10%, var(--surface))` : "var(--surface)",
              }}
            >
              <span className="line-clamp-3">
                <strong style={{ color: COLOR_HISTORIA }}>{f.anioTexto}</strong> · {f.nombre}
              </span>
            </div>
          );
        })}
      </div>
      <Leyenda>
        <span className="block font-semibold">
          {actual.anioTexto} · {actual.nombre}
        </span>
        <span className="mt-1 block text-[12px] text-texto-secundario">{t(`linea.certeza.${actual.certeza}`)}</span>
        <span className="mt-1 block text-[12px] text-texto-secundario">
          {prop ? t("linea.escala", { desde: formatoAnio(primero.anio), hasta: formatoAnio(ultimo.anio) }) : t("linea.sinEscala")}
        </span>
        {datos.superposicion && <span className="mt-1 block text-[12px] text-texto-secundario">{t("linea.superposicion")}</span>}
      </Leyenda>
    </MarcoVisual>
  );
}
