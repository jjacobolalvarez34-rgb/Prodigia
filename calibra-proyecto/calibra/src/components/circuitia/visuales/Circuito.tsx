"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { disenarEsquema, type Esquema } from "@/lib/circuitia/esquema";
import { clasificarCircuito, resolverParaVisual, type ResistorResuelto } from "@/lib/circuitia/visualesDatos";
import type { VisualCircuitiaCircuito } from "@/lib/circuitia/visuales";
import EsquemaCircuito from "./EsquemaCircuito";
import { COLOR_CIRCUITIA, MarcoVisual } from "./comun";

interface Props {
  visual: VisualCircuitiaCircuito;
}

interface Calculado {
  esquema: Esquema;
  resueltos: ResistorResuelto[];
}

function calcular(v: VisualCircuitiaCircuito): Calculado | null {
  try {
    return { esquema: disenarEsquema(v.topologia, v.vFuente), resueltos: resolverParaVisual(v.topologia, v.vFuente) };
  } catch {
    return null;
  }
}

// Esquema de un circuito (serie, paralelo o mixto) con símbolos estándar y la
// corriente convencional animada. Con `mostrarValores` revela, resistor a
// resistor, el voltaje y/o la corriente REALES (siempre de resolverParaVisual,
// que delega en resolverCircuito). La velocidad de los puntos de corriente es
// proporcional a la corriente de cada tramo.
export default function Circuito({ visual }: Props) {
  const t = useTranslations("Circuitia.visuales");
  const calculado = useMemo(() => calcular(visual), [visual]);
  const mostrar = visual.mostrarValores ?? "ninguna";
  const totalPasos = mostrar === "ninguna" || !calculado ? 0 : calculado.resueltos.length;
  const { alVer, ...r } = useReproductor({ total: totalPasos, ms: 1200, estatico: visual.estatico, inicio: totalPasos > 0 ? 1 : 0 });
  const [corrienteActiva, setCorrienteActiva] = useState(true);
  if (!calculado) return null;

  const { esquema, resueltos } = calculado;
  const revelados = new Map(resueltos.slice(0, Math.max(r.paso, 0)).map((x) => [x.id, { voltaje: x.voltaje, corriente: x.corriente }]));
  const conPulsos = (visual.animarCorriente ?? true) && !r.reducir;
  const animar = conPulsos && corrienteActiva;

  const tipo = clasificarCircuito(visual.topologia);
  const lista = resueltos
    .map((res) => {
      const partes = [`${res.id} = ${res.ohmios} Ω`];
      if (mostrar === "corriente" || mostrar === "ambas") partes.push(`${res.corriente} A`);
      if (mostrar === "voltaje" || mostrar === "ambas") partes.push(`${res.voltaje} V`);
      return partes.join(", ");
    })
    .join("; ");

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta.circuito")}
      titulo={visual.titulo}
      alternativa={
        <p>
          {t(`alternativa.circuito.${tipo}`, { v: visual.vFuente, n: esquema.bloques[0] ?? 0 })} {lista}.
        </p>
      }
      controles={
        totalPasos > 0 || conPulsos ? (
          <div className="flex flex-col gap-2">
            {totalPasos > 0 && <ControlesReproductor r={r} color={COLOR_CIRCUITIA} />}
            {conPulsos && (
              <button
                type="button"
                onClick={() => setCorrienteActiva((a) => !a)}
                className="self-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground"
              >
                {corrienteActiva ? t("circuito.pausarCorriente") : t("circuito.mostrarCorriente")}
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      <EsquemaCircuito
        esquema={esquema}
        vFuente={visual.vFuente}
        colorHex={COLOR_CIRCUITIA}
        resaltarId={visual.resaltarId}
        mostrar={mostrar}
        valores={revelados}
        animar={animar}
      />
      <p className="text-center text-xs text-texto-secundario">{t("circuito.leyenda")}</p>
    </MarcoVisual>
  );
}
