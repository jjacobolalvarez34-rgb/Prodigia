"use client";

import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { datosSiglos, r2, textoSiglos, type EjemploSiglo } from "@/lib/historia/visualesDatos";
import type { VisualHistoriaSiglos } from "@/lib/historia/visuales";
import { limitesSiglo } from "@/lib/historia/tiempo";
import { COLOR_HISTORIA, Leyenda, MarcoVisual, transicion } from "./comun";

interface Props {
  visual: VisualHistoriaSiglos;
}

function calcular(v: VisualHistoriaSiglos): EjemploSiglo[] | null {
  try {
    return datosSiglos(v);
  } catch {
    return null;
  }
}

// Posición del año dentro de su siglo (0 = primer año, 1 = último).
function posicion(e: EjemploSiglo): number {
  const { primero, ultimo } = limitesSiglo(e.n, e.aC);
  return r2((e.anio - primero) / (ultimo - primero));
}

const ANCHO = 300;
const X0 = 14;
const X1 = 286;

// Año a siglo, con el cálculo a la vista: el siglo n abarca desde el año (n-1)·100+1
// hasta el año n·100, y en los años a. C. se cuenta hacia atrás. Cada paso muestra un
// ejemplo con su barra del siglo y el punto donde cae el año.
export default function Siglos({ visual }: Props) {
  const t = useTranslations("Historia.visuales");
  const ejemplos = calcular(visual);
  const total = ejemplos ? ejemplos.length : 0;
  const { alVer, ...r } = useReproductor({ total, ms: 2600, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!ejemplos) return null;

  const idx = Math.min(ejemplos.length, Math.max(1, r.paso)) - 1;
  const e = ejemplos[idx];
  const x = r2(X0 + posicion(e) * (X1 - X0));

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.siglos")}
      titulo={visual.titulo}
      alternativa={<p>{t("siglos.alternativa", { lista: textoSiglos(visual) })}</p>}
      controles={<ControlesReproductor r={r} color={COLOR_HISTORIA} />}
    >
      <div className="rounded-xl border border-border bg-surface px-3 py-3 text-center" style={{ transition: transicion(r.reducir, "opacity", 300) }}>
        <p className="text-[12px] text-texto-secundario">{e.etiqueta}</p>
        <p className="mt-1 font-display text-2xl font-black" style={{ color: COLOR_HISTORIA }}>
          {e.siglo}
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-left text-[12.5px] leading-snug text-foreground">
          <li>{e.cierra ? t("siglos.pasoRedondo", { valor: e.valor, centenas: e.centenas }) : t("siglos.pasoCentenas", { valor: e.valor, centenas: e.centenas, resto: e.resto })}</li>
          <li>{e.cierra ? t("siglos.pasoSigloRedondo", { n: e.n }) : t("siglos.pasoMasUno", { centenas: e.centenas, n: e.n })}</li>
          <li>{t("siglos.pasoRomano", { n: e.n, romano: e.romano })}</li>
          {e.aC && <li>{t("siglos.pasoAC")}</li>}
        </ul>
      </div>
      <svg viewBox={`0 0 ${ANCHO} 58`} className="mx-auto h-auto w-full max-w-[340px]">
        <rect x={X0} y={22} width={X1 - X0} height={12} rx={6} fill="var(--border)" />
        <rect x={X0} y={22} width={X1 - X0} height={12} rx={6} fill={COLOR_HISTORIA} opacity={0.18} />
        <circle cx={x} cy={28} r={7} fill={COLOR_HISTORIA} stroke="var(--surface)" strokeWidth={2} style={{ transition: transicion(r.reducir, "cx", 500) }} />
        <text x={X0} y={52} fontSize={10} className="fill-foreground" opacity={0.75} textAnchor="start">
          {e.desde}
        </text>
        <text x={X1} y={52} fontSize={10} className="fill-foreground" opacity={0.75} textAnchor="end">
          {e.hasta}
        </text>
        <text x={x} y={14} fontSize={10.5} fontWeight={700} fill={COLOR_HISTORIA} textAnchor={posicion(e) > 0.8 ? "end" : posicion(e) < 0.2 ? "start" : "middle"}>
          {e.aC ? `${e.valor} a. C.` : e.valor}
        </text>
      </svg>
      <Leyenda>{t("siglos.regla")}</Leyenda>
    </MarcoVisual>
  );
}
