"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { INFO_GRUPO, grupoVisible, type FichaMolecula } from "@/lib/quimia/moleculas";
import { formulaLatex } from "@/lib/quimia/formulas";
import type { VisualQuimiaGrupos } from "@/lib/quimia/visuales";
import Esqueleto from "./Esqueleto";
import { fichaSegura } from "./Cadena";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaGrupos;
}

// Visual "quimia.grupos": un grupo funcional por paso sobre una molécula del
// catálogo, con los átomos del grupo resaltados, su fórmula general, la
// terminación del nombre y el nombre y la fórmula calculados de la molécula
// (src/lib/quimia/organica.ts). Esqueleto 2D esquemático.
export default function Grupos({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.grupos");
  const fichas: FichaMolecula[] = (Array.isArray(visual.moleculas) ? visual.moleculas : [])
    .map((id) => fichaSegura(id))
    .filter((f): f is FichaMolecula => f !== null && grupoVisible(f.grupos) !== undefined)
    .slice(0, 8);
  const { alVer, ...r } = useReproductor({ total: fichas.length, ms: 3000, estatico: visual.estatico, inicio: 1 });
  if (fichas.length === 0) return null;
  const paso = Math.min(fichas.length, Math.max(1, r.paso));
  const actual = fichas[paso - 1];
  const grupo = grupoVisible(actual.grupos)!;
  const resaltar = new Set(grupo.atomos);

  const textoDe = (f: FichaMolecula) => {
    const g = grupoVisible(f.grupos)!;
    return t("paso", {
      grupo: t(`nombres.${g.id}`),
      general: `$${INFO_GRUPO[g.id].general}$`,
      terminacion: INFO_GRUPO[g.id].nombre,
      nombre: f.entrada.comun ? `${f.nombre} (${f.entrada.comun})` : f.nombre,
      formula: `$${formulaLatex(f.formula)}$`,
    });
  };

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={
        <div>
          <p>{t("nota")}</p>
          <ol>
            {fichas.map((f, i) => (
              <li key={i}>
                <MathText texto={textoDe(f)} />
              </li>
            ))}
          </ol>
        </div>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="flex w-full flex-wrap justify-center gap-1.5" aria-hidden="true">
        {fichas.slice(0, paso).map((f, i) => {
          const g = grupoVisible(f.grupos)!;
          const esActual = i === paso - 1;
          return (
            <span
              key={i}
              className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              style={{ borderColor: COLOR_QUIMIA, color: esActual ? "#fff" : COLOR_QUIMIA, background: esActual ? COLOR_QUIMIA : "transparent" }}
            >
              {t(`nombres.${g.id}`)}
            </span>
          );
        })}
      </div>
      <div className="flex w-full justify-center" data-paso={paso}>
        <Esqueleto key={actual.entrada.id} dibujo={actual.dibujo} resaltar={resaltar} animar={!r.reducir} />
      </div>
      <p className="text-center text-[11px] text-texto-secundario">{t("nota")}</p>
      <TextoDelPaso>
        <MathText texto={textoDe(actual)} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
