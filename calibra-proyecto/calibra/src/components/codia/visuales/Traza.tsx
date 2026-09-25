"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import BloqueCodigo from "@/components/codia/BloqueCodigo";
import { datosTraza, nombreFallo } from "@/lib/codia/visualesDatos";
import { NOMBRE_LENGUAJE } from "@/lib/codia/tipos";
import type { VisualCodiaTraza } from "@/lib/codia/visuales";
import { COLOR_CODIA, Leyenda, MarcoVisual, useTextoError } from "./comun";

interface Props {
  visual: VisualCodiaTraza;
}

// Ejecución paso a paso: el mismo IR de la práctica se renderiza y se
// interpreta de VERDAD (datosTraza -> render.ts + interprete.ts, nunca una
// salida tipeada a mano). Cada paso resalta su línea y muestra el estado de
// las variables DESPUÉS de esa línea.
export default function Traza({ visual }: Props) {
  const t = useTranslations("Codia.visuales.traza");
  const textoError = useTextoError();
  const datos = useMemo(() => {
    try {
      return datosTraza(visual.programa, visual.lenguaje);
    } catch {
      return null;
    }
  }, [visual.programa, visual.lenguaje]);
  const total = datos?.pasos.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1300, estatico: visual.estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos || total === 0) return null;

  const actual = datos.pasos[Math.max(0, r.paso - 1)];
  const alFinal = r.paso >= total;
  const nombreLenguaje = NOMBRE_LENGUAJE[visual.lenguaje];
  const detalleError = datos.fallo ? textoError(datos.fallo, nombreFallo(datos.fallo, visual.lenguaje)) : null;

  const alternativa = (
    <>
      <p>{datos.codigo}</p>
      <ol>
        {datos.pasos.map((p, i) => (
          <li key={i}>
            {t("pasoAlt", {
              n: i + 1,
              linea: p.linea,
              variables: p.variables.length ? p.variables.map(([k, val]) => `${k} = ${val}`).join(", ") : t("sinVariables"),
            })}
          </li>
        ))}
        <li>{detalleError ?? t("salidaAlt", { salida: datos.salida || t("sinSalida") })}</li>
      </ol>
    </>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { lenguaje: nombreLenguaje })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_CODIA} />}
    >
      <BloqueCodigo codigo={datos.codigo} lenguaje={visual.lenguaje} resaltarLinea={actual?.linea} />
      <Leyenda>
        <p className="font-semibold text-texto-secundario">{t("variablesDespues", { linea: actual.linea })}</p>
        {actual.variables.length > 0 ? (
          <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[13px]">
            {actual.variables.map(([nombre, val]) => (
              <div key={nombre} className="flex min-w-0 items-baseline gap-1">
                <dt className="font-semibold" style={{ color: COLOR_CODIA }}>
                  {nombre}
                </dt>
                <dd className="min-w-0 break-words">= {val}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-1 text-texto-secundario">{t("sinVariables")}</p>
        )}
      </Leyenda>
      {alFinal && (
        <Leyenda acento={COLOR_CODIA}>
          <p className="font-semibold text-texto-secundario">{t("salida")}</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px]">{detalleError ?? (datos.salida || t("sinSalida"))}</pre>
        </Leyenda>
      )}
    </MarcoVisual>
  );
}
