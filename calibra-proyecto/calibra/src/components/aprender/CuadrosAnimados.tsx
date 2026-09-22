"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { CuadroLeccion, VisualCuadros } from "@/lib/aprender/visuales";
import ControlesReproductor from "./ControlesReproductor";
import { useReproductor } from "./useReproductor";

interface Props {
  visual: VisualCuadros;
}

const MS_POR_CUADRO = 2400;

function sinDolar(s: string): string {
  return s.replace(/\$/g, "");
}

function cuadroValido(c: unknown): c is CuadroLeccion {
  if (typeof c !== "object" || c === null) return false;
  const o = c as Record<string, unknown>;
  const campos = [o.texto, o.formula, o.resaltar];
  if (campos.some((v) => v !== undefined && typeof v !== "string")) return false;
  return typeof o.texto === "string" || typeof o.formula === "string";
}

function Contenido({ c }: { c: CuadroLeccion }) {
  return (
    <>
      {c.texto && (
        <p className="text-sm leading-relaxed text-foreground">
          <MathText texto={c.texto} />
        </p>
      )}
      {c.formula && (
        <p className="overflow-x-auto py-1 text-center text-lg text-foreground">
          <MathText texto={`$${sinDolar(c.formula)}$`} />
        </p>
      )}
      {c.resaltar && (
        <p className="w-fit rounded-lg bg-logro/20 px-2.5 py-1 text-sm font-semibold text-foreground">
          <MathText texto={c.resaltar} />
        </p>
      )}
    </>
  );
}

// Primitivo genérico del formato de lección visual: una explicación por
// CUADROS que aparecen de a uno (con controles Anterior / Siguiente /
// Repetir / Reproducir-Pausa e indicador "2 de 5"). Con "reducir
// movimiento" se muestran todos ya visibles, sin animar.
export default function CuadrosAnimados({ visual }: Props) {
  const t = useTranslations("Aprender.visual");
  const cuadros = Array.isArray(visual.cuadros) ? visual.cuadros.filter(cuadroValido) : [];
  const { alVer, ...r } = useReproductor({
    total: cuadros.length,
    ms: typeof visual.msPorCuadro === "number" && visual.msPorCuadro > 200 ? visual.msPorCuadro : MS_POR_CUADRO,
    estatico: visual.estatico,
    autoplay: visual.autoplay ?? true,
    inicio: 1,
  });
  if (cuadros.length === 0) return null;

  return (
    <figure
      ref={alVer}
      role="group"
      aria-label={visual.titulo ?? t("cuadrosEtiqueta", { n: cuadros.length })}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3"
    >
      {visual.titulo && (
        <p className="text-sm font-semibold text-foreground">
          <MathText texto={visual.titulo} />
        </p>
      )}
      <ol aria-hidden="true" className="flex flex-col gap-2">
        {cuadros.slice(0, r.paso).map((c, i) => {
          const actual = i === r.paso - 1;
          return (
            <motion.li
              key={i}
              initial={r.reducir ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left ${
                actual ? "border-logro/50 bg-logro/10" : "border-border bg-background"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-texto-secundario">{i + 1}</span>
              <Contenido c={c} />
            </motion.li>
          );
        })}
      </ol>
      <figcaption className="sr-only">
        <ol>
          {cuadros.map((c, i) => (
            <li key={i}>
              <Contenido c={c} />
            </li>
          ))}
        </ol>
      </figcaption>
      <ControlesReproductor r={r} />
    </figure>
  );
}
