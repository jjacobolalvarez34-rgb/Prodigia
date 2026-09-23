"use client";

import { useTranslations } from "next-intl";
import type { VisualEnigmiaEliminacion } from "@/lib/enigmia/visuales";
import { resolverPorEliminacion } from "@/lib/enigmia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaEliminacion;
}

function candidatosValidos(c: unknown): string[] {
  if (!Array.isArray(c)) return [];
  const limpios = c.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return limpios.length >= 2 && limpios.length <= 8 && new Set(limpios).size === limpios.length ? limpios : [];
}

function descartesValidos(d: unknown, candidatos: string[]): { candidato: string; motivo: string }[] {
  if (!Array.isArray(d)) return [];
  const disponibles = new Set(candidatos);
  const usados = new Set<string>();
  const limpios: { candidato: string; motivo: string }[] = [];
  for (const v of d) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    if (typeof o.candidato !== "string" || typeof o.motivo !== "string") continue;
    if (!disponibles.has(o.candidato) || usados.has(o.candidato)) continue;
    usados.add(o.candidato);
    limpios.push({ candidato: o.candidato, motivo: o.motivo });
  }
  return limpios;
}

// Técnica "Eliminación por descarte" y Clase "Deducción por eliminación"
// (Deducción): un grupo de candidatos se va descartando uno a uno por un
// motivo concreto, hasta que queda uno solo — la conclusión no se adivina,
// se deduce por descarte (mismo criterio pedagógico que el resto de
// Enigmia: cada dato mostrado sale de resolverPorEliminacion(), nunca
// hardcodeado en el componente).
export default function Eliminacion({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.eliminacion");
  const candidatos = candidatosValidos(visual.candidatos);
  const descartes = descartesValidos(visual.descartes, candidatos);
  const valido = candidatos.length > 0 && descartes.length > 0 && descartes.length === candidatos.length - 1;
  const datos = valido ? resolverPorEliminacion(candidatos, descartes) : null;
  const restante = datos?.restante ?? null;

  const { alVer, ...r } = useReproductor({ total: descartes.length, ms: 1100, estatico: visual.estatico });
  if (!datos || !restante) return null;

  const descartadosHastaAhora = r.paso;
  const terminado = descartadosHastaAhora >= descartes.length;

  const alternativa = (
    <>
      <ol>
        {datos.descartes.map((d, i) => (
          <li key={i}>{t("descartado", { candidato: d.candidato, motivo: d.motivo })}</li>
        ))}
      </ol>
      <p>{t("restante", { candidato: restante })}</p>
    </>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {candidatos.map((c) => {
          const idxDescarte = datos.descartes.findIndex((d) => d.candidato === c);
          const descartado = idxDescarte >= 0 && idxDescarte < descartadosHastaAhora;
          const esRestante = c === restante;
          return (
            <motion.span
              key={c}
              initial={false}
              animate={{ opacity: descartado ? 0.4 : 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-semibold"
              style={
                esRestante && terminado
                  ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 16%, var(--surface))`, color: "var(--foreground)" }
                  : {
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color: "var(--foreground)",
                      textDecoration: descartado ? "line-through" : "none",
                    }
              }
            >
              {c}
            </motion.span>
          );
        })}
      </div>
      <ol className="flex w-full flex-col gap-1 text-sm text-texto-secundario">
        {datos.descartes.slice(0, descartadosHastaAhora).map((d, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {t("descartado", { candidato: d.candidato, motivo: d.motivo })}
          </motion.li>
        ))}
      </ol>
      {terminado && <Resaltado>{t("restante", { candidato: restante })}</Resaltado>}
    </MarcoVisual>
  );
}
