"use client";

import { useTranslations } from "next-intl";
import type { VisualEnigmiaSecuencia } from "@/lib/enigmia/visuales";
import { secuenciaAritmetica, secuenciaGeometrica, secuenciaLetras } from "@/lib/enigmia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { Casilla, MarcoVisual, Resaltado, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaSecuencia;
}

// Clase "Secuencias" (Patrones): revela término por término, resaltando la
// diferencia (aritmética) o razón (geométrica) entre cada par consecutivo
// — o, en modo "letras", el mismo salto aplicado a la posición de la letra
// (patrón no numérico).
export default function Secuencia({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.secuencia");
  const cantidad = Math.trunc(visual.cantidad);
  const valido = Number.isFinite(cantidad) && cantidad >= 2 && cantidad <= 12;

  const numerica = visual.modo !== "letras" && valido && Number.isFinite(visual.primerTermino) && Number.isFinite(visual.paso);
  const letras = visual.modo === "letras" && valido && typeof visual.primeraLetra === "string" && visual.primeraLetra.length > 0;

  const datosNumericos = numerica
    ? visual.modo === "aritmetica"
      ? secuenciaAritmetica(visual.primerTermino, visual.paso, cantidad)
      : secuenciaGeometrica(visual.primerTermino, visual.paso, cantidad)
    : null;
  const datosLetras = letras && visual.modo === "letras" ? secuenciaLetras(visual.primeraLetra, visual.paso, cantidad) : null;

  const terminos: (string | number)[] = datosNumericos?.terminos ?? datosLetras?.letras ?? [];

  const { alVer, ...r } = useReproductor({ total: terminos.length, ms: 900, estatico: visual.estatico, inicio: 1 });
  if (terminos.length === 0) return null;

  const esGeometrica = visual.modo === "geometrica";
  const simboloPaso = visual.modo === "letras" || !esGeometrica ? "+" : "×";
  const valorPaso = datosNumericos?.paso ?? (datosLetras ? datosLetras.paso : 0);

  const alternativa = (
    <>
      <p>{terminos.join(", ")}</p>
      <p>
        {t(esGeometrica ? "razon" : "diferencia", { n: valorPaso })}
      </p>
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
        {terminos.slice(0, Math.max(1, r.paso)).map((term, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold"
                style={{ color: COLOR_ENIGMIA }}
              >
                {simboloPaso}
                {valorPaso}
              </motion.span>
            )}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
              <Casilla valor={term} activo={i === Math.max(0, r.paso - 1)} />
            </motion.div>
          </div>
        ))}
        {r.paso < terminos.length && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: COLOR_ENIGMIA }}>
              {simboloPaso}
              {valorPaso}
            </span>
            <Casilla valor="?" />
          </div>
        )}
      </div>
      {r.paso >= terminos.length && (
        <Resaltado>{t(esGeometrica ? "razon" : "diferencia", { n: valorPaso })}</Resaltado>
      )}
    </MarcoVisual>
  );
}
