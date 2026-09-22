"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaFraccion } from "@/lib/numeria/visuales";
import { fraccionOperacion, type DatosFraccion } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaFraccion;
}

function BarraFraccion({ num, den }: { num: number; den: number }) {
  if (!Number.isFinite(den) || den <= 0) return null;
  const negativo = num < 0;
  const absNum = Math.round(Math.abs(num));
  // Impropia (num > den): una barra completa por cada "entero" y una barra
  // final con el resto — así 5/4 se ve como 1 entero + 1/4, no una sola
  // barra imposible de leer.
  const barras = Math.max(1, Math.ceil(absNum / den));
  let restante = absNum;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {negativo && (
        <span className="font-mono text-lg font-bold" style={{ color: "var(--error)" }}>
          −
        </span>
      )}
      {Array.from({ length: barras }).map((_, bi) => {
        const shaded = Math.min(den, restante);
        restante -= shaded;
        return (
          <div key={bi} className="flex overflow-hidden rounded-md border" style={{ borderColor: COLOR_NUMERIA }}>
            {Array.from({ length: den }).map((_, i) => (
              <span
                key={i}
                className="h-6 w-6 border-r last:border-r-0"
                style={{ borderColor: "var(--border)", background: i < shaded ? COLOR_NUMERIA : "var(--surface)" }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface Etapa {
  titulo: string;
  num: number;
  den: number;
}

function etapasDe(datos: DatosFraccion, t: (clave: string, valores?: Record<string, string | number | Date>) => string): Etapa[] {
  const original1: Etapa = { titulo: t("original", { num: datos.num1, den: datos.den1 }), num: datos.num1, den: datos.den1 };
  const original2: Etapa = { titulo: t("original", { num: datos.num2, den: datos.den2 }), num: datos.num2, den: datos.den2 };
  const resultado: Etapa = {
    titulo: t("resultado", { num: datos.numSimplificado, den: datos.denSimplificado }),
    num: datos.numSimplificado,
    den: datos.denSimplificado,
  };

  if (datos.operacion === "suma" || datos.operacion === "resta") {
    return [
      original1,
      original2,
      { titulo: t("convertida", { num: datos.num1Convertido!, den: datos.denominadorComun! }), num: datos.num1Convertido!, den: datos.denominadorComun! },
      { titulo: t("convertida", { num: datos.num2Convertido!, den: datos.denominadorComun! }), num: datos.num2Convertido!, den: datos.denominadorComun! },
      resultado,
    ];
  }
  const etapas = [original1, original2];
  if (datos.operacion === "division") {
    etapas.push({ titulo: t("reciproca", { num: datos.num2Operado!, den: datos.den2Operado! }), num: datos.num2Operado!, den: datos.den2Operado! });
  }
  etapas.push(resultado);
  return etapas;
}

// Clase 5 de Numeria: operaciones entre fracciones con barras. Suma/resta
// pasan por el denominador común (MCM de la Clase 4); multiplicación es
// numerador×numerador sobre denominador×denominador; división multiplica
// por la fracción recíproca del segundo término.
export default function Fraccion({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.fraccion");
  const { num1, den1, num2, den2, operacion } = visual;
  const valido = [den1, den2].every((d) => Number.isFinite(d) && d > 0) && [num1, num2].every(Number.isFinite);
  const datos = valido ? fraccionOperacion(operacion, num1, den1, num2, den2) : null;
  const etapas = datos ? etapasDe(datos, t) : [];
  const { alVer, ...r } = useReproductor({ total: etapas.length, ms: 2200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const simbolo = { suma: "+", resta: "−", multiplicacion: "×", division: "÷" }[operacion];

  const alternativa = (
    <ol>
      {etapas.map((e, i) => (
        <li key={i}>{e.titulo}</li>
      ))}
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { num1, den1, simbolo, num2, den2 })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <ol aria-hidden="true" className="flex w-full flex-col gap-3">
        {etapas.slice(0, r.paso).map((e, i) => (
          <motion.li
            key={i}
            initial={r.reducir ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2 ${
              i === r.paso - 1 ? "border-logro/50 bg-logro/10" : "border-border bg-background"
            }`}
          >
            <span className="text-xs font-semibold text-texto-secundario">{e.titulo}</span>
            <BarraFraccion num={e.num} den={e.den} />
          </motion.li>
        ))}
      </ol>
      {r.paso >= etapas.length && <Resaltado>{t("resultado", { num: datos.numSimplificado, den: datos.denSimplificado })}</Resaltado>}
    </MarcoVisual>
  );
}
