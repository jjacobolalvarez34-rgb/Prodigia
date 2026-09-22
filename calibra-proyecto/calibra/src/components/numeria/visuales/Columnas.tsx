"use client";

import { useTranslations } from "next-intl";
import type { VisualNumeriaColumnas } from "@/lib/numeria/visuales";
import { columnasSuma, columnasResta, type DatosColumnas } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { CasillaDigito, MarcoVisual, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaColumnas;
}

function datosDe(visual: VisualNumeriaColumnas): DatosColumnas | null {
  const a = Math.trunc(visual.a);
  const b = Math.trunc(visual.b);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) return null;
  if (visual.operacion === "resta" && a < b) return null;
  return visual.operacion === "suma" ? columnasSuma(a, b) : columnasResta(a, b);
}

// Clase 1 de Numeria: valor posicional + suma/resta en columna, animado de
// derecha a izquierda (unidades primero, igual que se explica y se calcula
// de verdad) mostrando de dónde sale cada dígito, incluido el acarreo /
// préstamo entre columnas.
export default function Columnas({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.columnas");
  const datos = datosDe(visual);
  const { alVer, ...r } = useReproductor({
    total: datos?.columnas.length ?? 0,
    ms: 1500,
    estatico: visual.estatico,
  });
  if (!datos) return null;
  const { columnas, resultado, operacion, a, b } = datos;
  const total = columnas.length;
  // r.paso = cuántas columnas están reveladas, contando desde la de la
  // derecha (unidades) hacia la izquierda — el orden real de cálculo.
  const primerIndiceRevelado = total - r.paso;
  const indiceActual = r.reproduciendo || r.paso < total ? primerIndiceRevelado : -1;

  const simbolo = operacion === "suma" ? "+" : "−";
  const etiquetaEntra = operacion === "suma" ? t("acarreo") : t("prestamo");

  const alternativa = (
    <ol>
      {[...columnas]
        .slice()
        .reverse()
        .map((c, i) => (
          <li key={i}>
            {c.digitoA} {simbolo} {c.digitoB}
            {c.entra > 0 ? ` (${etiquetaEntra} ${c.entra})` : ""} = {c.resultado}
            {c.sale > 0 ? `, ${etiquetaEntra.toLowerCase()} ${c.sale}` : ""}
          </li>
        ))}
      <li>
        {t("resultado", { n: resultado })}
      </li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { a, b })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex items-end gap-1.5">
        <div className="flex w-6 shrink-0 flex-col items-center justify-end gap-1">
          <span className="h-5" />
          <span className="invisible flex h-10 min-w-10 items-center justify-center">0</span>
          <span className="flex h-10 items-center justify-center text-xl font-bold" style={{ color: COLOR_NUMERIA }}>
            {simbolo}
          </span>
        </div>
        {columnas.map((c, i) => {
          const revelado = i >= primerIndiceRevelado;
          return (
            <motion.div
              key={i}
              animate={{ opacity: revelado ? 1 : 0, y: revelado ? 0 : 6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-1"
            >
              <span className="flex h-5 items-center justify-center">
                {revelado && c.entra > 0 && <CasillaDigito valor={c.entra} chico activo />}
              </span>
              <CasillaDigito valor={c.digitoA} activo={i === indiceActual} />
              <CasillaDigito valor={c.digitoB} activo={i === indiceActual} />
            </motion.div>
          );
        })}
      </div>
      <div className="h-0.5 w-full max-w-full rounded-full" style={{ background: COLOR_NUMERIA, opacity: 0.5 }} />
      <div className="flex items-end gap-1.5">
        <div className="w-6 shrink-0" />
        {columnas.map((c, i) => {
          const revelado = i >= primerIndiceRevelado;
          return (
            <motion.div
              key={i}
              animate={{ opacity: revelado ? 1 : 0, y: revelado ? 0 : 6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <CasillaDigito valor={revelado ? c.resultado : ""} activo={i === indiceActual} />
            </motion.div>
          );
        })}
      </div>
      {r.paso >= total && (
        <p className="text-sm font-semibold text-foreground">{t("resultado", { n: resultado })}</p>
      )}
    </MarcoVisual>
  );
}
