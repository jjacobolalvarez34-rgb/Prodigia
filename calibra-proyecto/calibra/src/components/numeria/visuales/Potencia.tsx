"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaPotencia } from "@/lib/numeria/visuales";
import { potenciaCadena } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { CasillaDigito, MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaPotencia;
}

// Técnicas de Potencias: modo "cadena" dibuja la multiplicación repetida
// paso a paso (base, ×base, ×base...) — modo "cuadricula" dibuja el área
// de base×base (para "raíz cuadrada por tanteo": ver que 7×7=49 como una
// cuadrícula de 7 por 7, no solo una cuenta).
export default function Potencia({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.potencia");
  const base = Math.trunc(visual.base);
  const exponente = Math.trunc(visual.exponente);
  const modo = visual.modo === "cuadricula" ? "cuadricula" : "cadena";
  const valido =
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(exponente) &&
    exponente >= 2 &&
    exponente <= 8 &&
    (modo !== "cuadricula" || (exponente === 2 && base <= 15));
  const datos = valido ? potenciaCadena(base, exponente) : null;
  const totalPasos = modo === "cuadricula" ? base : (datos?.pasos.length ?? 0);
  const { alVer, ...r } = useReproductor({
    total: totalPasos,
    ms: modo === "cuadricula" ? 150 : 1600,
    estatico: visual.estatico,
    inicio: modo === "cadena" ? 0 : 1,
  });
  if (!datos) return null;
  const { pasos, resultado } = datos;

  const alternativa =
    modo === "cadena" ? (
      <ol>
        <li>{t("inicial", { base })}</li>
        {pasos.map((p, i) => (
          <li key={i}>{t("paso", { base, acumulado: p.acumulado })}</li>
        ))}
        <li>{t("resultado", { base, exponente, n: resultado })}</li>
      </ol>
    ) : (
      <p>{t("cuadricula", { base, n: resultado })}</p>
    );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { base, exponente })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      {modo === "cadena" ? (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CasillaDigito valor={base} activo={r.paso === 0} />
            {pasos.map((p, i) => {
              const revelado = i < r.paso;
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: revelado ? 1 : 0, y: revelado ? 0 : 6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg font-bold" style={{ color: COLOR_NUMERIA }}>
                    × {base} =
                  </span>
                  <CasillaDigito valor={revelado ? p.acumulado : ""} activo={revelado && i === r.paso - 1} />
                </motion.div>
              );
            })}
          </div>
          {r.paso >= totalPasos && <Resaltado>{t("resultado", { base, exponente, n: resultado })}</Resaltado>}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {Array.from({ length: base }).map((_, fila) => (
              <div key={fila} className="flex gap-1">
                {Array.from({ length: base }).map((_, col) => (
                  <motion.span
                    key={col}
                    animate={{ opacity: fila < r.paso ? 0.85 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4 rounded-sm"
                    style={{ background: COLOR_NUMERIA }}
                  />
                ))}
              </div>
            ))}
          </div>
          {r.paso >= totalPasos && <Resaltado>{t("cuadricula", { base, n: resultado })}</Resaltado>}
        </>
      )}
    </MarcoVisual>
  );
}
