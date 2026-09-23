"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import type { VisualQuimiaCuadro } from "@/lib/quimia/visuales";
import { MarcoVisual, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaCuadro;
}

function columnasValidas(c: unknown): string[] {
  return Array.isArray(c) ? c.filter((x): x is string => typeof x === "string") : [];
}

function filasValidas(f: unknown, columnas: number): string[][] {
  if (!Array.isArray(f)) return [];
  return f
    .filter((fila): fila is string[] => Array.isArray(fila) && fila.length === columnas && fila.every((x) => typeof x === "string"))
    .slice(0, 24);
}

// Visual "quimia.cuadro": una tabla de datos (nombres, fórmulas, reglas) que
// se va armando fila por fila. Admite $...$ en cada celda. Con "reducir
// movimiento" se ve completa desde el principio.
export default function Cuadro({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.cuadro");
  const columnas = columnasValidas(visual.columnas);
  const filas = filasValidas(visual.filas, columnas.length);
  const { alVer, ...r } = useReproductor({ total: filas.length, ms: 1500, estatico: visual.estatico, inicio: 1 });
  if (columnas.length === 0 || filas.length === 0) return null;

  const alternativa = (
    <table>
      <thead>
        <tr>
          {columnas.map((c, i) => (
            <th key={i}>
              <MathText texto={c} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((celda, j) => (
              <td key={j}>
                <MathText texto={celda} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left text-xs sm:text-sm">
          <thead>
            <tr>
              {columnas.map((c, i) => (
                <th
                  key={i}
                  className="border-b-2 px-2 py-1.5 font-bold text-foreground"
                  style={{ borderColor: COLOR_QUIMIA, background: `color-mix(in oklab, ${COLOR_QUIMIA} 10%, var(--surface))` }}
                >
                  <MathText texto={c} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.slice(0, r.paso).map((fila, i) => {
              const actual = i === r.paso - 1 && r.paso < filas.length;
              return (
                <motion.tr
                  key={i}
                  // `initial` depende solo de `estatico` (lo sabe el servidor): con
                  // "reducir movimiento" del sistema (que solo se conoce en el
                  // cliente) usar `r.reducir` acá causaba un mismatch de
                  // hidratación. Con reducir, la transición dura 0.
                  initial={visual.estatico ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: r.reducir ? 0 : 0.3 }}
                  style={actual ? { background: `color-mix(in oklab, ${COLOR_QUIMIA} 10%, transparent)` } : undefined}
                >
                  {fila.map((celda, j) => (
                    <td key={j} className="border-b border-border px-2 py-1.5 align-top text-foreground">
                      <MathText texto={celda} />
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </MarcoVisual>
  );
}
