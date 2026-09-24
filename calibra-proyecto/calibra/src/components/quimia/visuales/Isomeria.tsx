"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import type { FichaMolecula } from "@/lib/quimia/moleculas";
import { formulaLatex } from "@/lib/quimia/formulas";
import { condensadaLatex } from "@/lib/quimia/organica";
import type { VisualQuimiaIsomeria } from "@/lib/quimia/visuales";
import Esqueleto from "./Esqueleto";
import { fichaSegura } from "./Cadena";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaIsomeria;
}

const TIPOS = ["cadena", "posicion", "funcion", "geometrica"] as const;

// Visual "quimia.isomeria": varios isómeros (misma fórmula molecular) van
// apareciendo de a uno con su nombre y su fórmula condensada. Si las
// moléculas NO comparten la fórmula calculada, no se dibuja nada (no es un
// ejemplo de isomería). Esqueletos 2D esquemáticos.
export default function Isomeria({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.isomeria");
  const fichas: FichaMolecula[] = (Array.isArray(visual.moleculas) ? visual.moleculas : [])
    .map((id) => fichaSegura(id))
    .filter((f): f is FichaMolecula => f !== null)
    .slice(0, 6);
  const valido = fichas.length >= 2 && fichas.every((f) => f.formula === fichas[0].formula);
  const total = fichas.length + 1;
  const { alVer, ...r } = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!valido) return null;
  const paso = Math.min(total, Math.max(1, r.paso));
  const tipo = TIPOS.includes(visual.isomeria as (typeof TIPOS)[number]) ? (visual.isomeria as (typeof TIPOS)[number]) : null;
  const formula = `$${formulaLatex(fichas[0].formula)}$`;
  const visibles = Math.min(paso, fichas.length);
  // con fórmulas condensadas largas una sola columna (en 2 se cortarían a 360 px)
  const larga = fichas.some((f) => (f.condensada ?? f.formula).length > 14);
  const resumen = tipo ? t(`resumen.${tipo}`, { formula, n: fichas.length }) : t("resumen.generico", { formula, n: fichas.length });
  const textoPaso = paso <= fichas.length ? t("isomero", { n: paso, nombre: fichas[paso - 1].nombre, formula }) : resumen;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { formula: fichas[0].formula })}
      titulo={visual.titulo}
      alternativa={
        <div>
          <p>{t("nota")}</p>
          <ul>
            {fichas.map((f, i) => (
              <li key={i}>
                {f.nombre}: <MathText texto={`$\\mathrm{${condensadaLatex(f.condensada ?? f.formula)}}$`} />
              </li>
            ))}
          </ul>
          <p>
            <MathText texto={resumen} />
          </p>
        </div>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <p className="text-center text-base font-semibold">
        <MathText texto={t("formulaComun", { formula })} />
      </p>
      <div className={`grid w-full gap-2 ${larga ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`} data-paso={paso}>
        {fichas.slice(0, visibles).map((f, i) => {
          const esActual = paso <= fichas.length && i === paso - 1;
          return (
            <div
              key={f.entrada.id}
              className="flex min-w-0 flex-col items-center gap-1 rounded-xl border bg-background px-1.5 py-2"
              style={{ borderColor: esActual || paso > fichas.length ? COLOR_QUIMIA : "var(--border)", borderWidth: esActual ? 2 : 1 }}
            >
              <Esqueleto dibujo={f.dibujo} animar={!r.reducir} maxAncho={170} />
              <span className="text-center text-xs font-semibold leading-tight">{f.nombre}</span>
              <span className="text-center text-[11px] text-texto-secundario">
                <MathText texto={`$\\mathrm{${condensadaLatex(f.condensada ?? f.formula)}}$`} />
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-texto-secundario">{t("nota")}</p>
      <TextoDelPaso>
        <MathText texto={textoPaso} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
