"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { VisualAnatomiaGrupos } from "@/lib/anatomia/visuales";
import { resolverGrupos, textoDeVisual } from "@/lib/anatomia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, COLOR_ANATOMIA, fondoAcento } from "./comun";

interface Props {
  visual: VisualAnatomiaGrupos;
}

// Cajas rotuladas: un grupo por paso. Los grupos todavía no revelados quedan
// atenuados (el diseño no salta al aparecer). Con detalle en algún ítem el
// grupo se dibuja como filas "marca — texto: detalle"; sin detalle, como
// chips.
export default function Grupos({ visual }: Props) {
  const t = useTranslations("Anatomia.visuales.grupos");
  const grupos = resolverGrupos(visual.grupos);
  const { alVer, ...r } = useReproductor({ total: grupos.length, ms: 1500, estatico: visual.estatico, inicio: grupos.length > 0 ? 1 : 0 });
  if (grupos.length === 0) return null;

  const alternativa = <p>{textoDeVisual(visual as unknown as { tipo: string } & Record<string, unknown>)}</p>;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_ANATOMIA} />}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {grupos.map((g, gi) => {
          const visible = gi < r.paso;
          const actual = gi === r.paso - 1;
          return (
            <motion.div
              key={gi}
              initial={false}
              animate={{ opacity: visible ? 1 : 0.28 }}
              transition={{ duration: 0.35 }}
              className="min-w-0 rounded-xl border-2 p-2.5"
              style={{
                borderColor: visible ? COLOR_ANATOMIA : "var(--border)",
                background: actual ? fondoAcento(14) : "var(--surface)",
              }}
            >
              <p className="mb-1.5 text-sm font-bold leading-snug" style={{ color: visible ? COLOR_ANATOMIA : undefined }}>
                {g.nombre}
              </p>
              {g.conDetalle ? (
                <ul className="flex flex-col gap-1">
                  {g.items.map((it, ii) => (
                    <li key={ii} className="flex items-baseline gap-1.5 text-[13px] leading-snug">
                      {it.marca && (
                        <span
                          className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-md px-1 text-[11px] font-bold"
                          style={{ background: fondoAcento(16), color: COLOR_ANATOMIA }}
                        >
                          {it.marca}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="font-semibold text-foreground">{it.texto}</span>
                        {it.detalle && <span className="text-texto-secundario"> — {it.detalle}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {g.items.map((it, ii) => (
                    <li
                      key={ii}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[13px] font-medium leading-snug text-foreground"
                    >
                      {it.marca && (
                        <span className="text-[11px] font-bold" style={{ color: COLOR_ANATOMIA }}>
                          {it.marca}
                        </span>
                      )}
                      {it.texto}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>
    </MarcoVisual>
  );
}
