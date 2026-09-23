"use client";

import { useTranslations } from "next-intl";
import type { VisualEnigmiaAgrupacion } from "@/lib/enigmia/visuales";
import { agruparEnBloques } from "@/lib/enigmia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { Casilla, MarcoVisual, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaAgrupacion;
}

function itemsValidos(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  const limpios = items.filter((v): v is string => typeof v === "string" && v.length > 0);
  return limpios.length >= 2 && limpios.length <= 16 ? limpios : [];
}

function tamanosValidos(tamanos: unknown): number[] {
  if (!Array.isArray(tamanos)) return [];
  return tamanos.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n > 0);
}

// Clase "Chunking y asociación" (Memoria): una secuencia suelta se
// reagrupa en bloques chicos — paso 0 muestra todo suelto, cada paso
// siguiente "cierra" un bloque más, hasta que todos quedan agrupados.
export default function Agrupacion({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.agrupacion");
  const items = itemsValidos(visual.items);
  const tamanos = tamanosValidos(visual.tamanos);
  const datos = items.length > 0 && tamanos.length > 0 ? agruparEnBloques(items, tamanos) : null;
  const totalBloques = datos?.bloques.length ?? 0;

  const { alVer, ...r } = useReproductor({ total: totalBloques, ms: 1100, estatico: visual.estatico });
  if (!datos) return null;

  const bloquesAgrupados = r.paso;

  const alternativa = (
    <p>{datos.bloques.map((b) => b.join("")).join(" - ")}</p>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        {datos.bloques.map((bloque, bi) => {
          const agrupado = bi < bloquesAgrupados;
          return (
            <motion.div
              key={bi}
              layout
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-1 rounded-xl border-2 px-2 py-1.5 ${agrupado ? "" : "border-transparent"}`}
              style={
                agrupado
                  ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 12%, var(--surface))` }
                  : undefined
              }
            >
              {bloque.map((item, ii) => (
                <Casilla key={ii} valor={item} chico />
              ))}
            </motion.div>
          );
        })}
      </div>
      {bloquesAgrupados >= totalBloques && (
        <p className="text-sm font-semibold text-foreground">{t("resultado", { n: datos.bloques.length })}</p>
      )}
    </MarcoVisual>
  );
}
