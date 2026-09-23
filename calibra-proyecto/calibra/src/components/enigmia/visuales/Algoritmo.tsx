"use client";

import { useTranslations } from "next-intl";
import type { VisualEnigmiaAlgoritmo } from "@/lib/enigmia/visuales";
import { trazarAlgoritmo, type PasoAlgoritmoEntrada } from "@/lib/enigmia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_ENIGMIA, motion } from "./comun";

interface Props {
  visual: VisualEnigmiaAlgoritmo;
}

function pasosValidos(pasos: unknown): PasoAlgoritmoEntrada[] {
  if (!Array.isArray(pasos)) return [];
  return pasos.filter((p): p is PasoAlgoritmoEntrada => {
    if (typeof p !== "object" || p === null) return false;
    const o = p as Record<string, unknown>;
    if (o.tipo === "condicional") {
      return (
        typeof o.comparacion === "string" &&
        typeof o.umbral === "number" &&
        typeof o.siVerdadero === "object" &&
        typeof o.siFalso === "object"
      );
    }
    return (o.tipo === "sumar" || o.tipo === "restar" || o.tipo === "multiplicar" || o.tipo === "dividir") && typeof o.valor === "number";
  });
}

function describirPaso(p: PasoAlgoritmoEntrada, variable: string, t: (k: string, v?: Record<string, string | number>) => string): string {
  if (p.tipo === "condicional") {
    return t("pasoCondicional", { variable, comparacion: p.comparacion, umbral: p.umbral });
  }
  const simbolo = { sumar: "+", restar: "−", multiplicar: "×", dividir: "÷" }[p.tipo];
  return `${variable} = ${variable} ${simbolo} ${p.valor}`;
}

// Clase "Qué es un algoritmo" (Pensamiento computacional): traza, paso a
// paso, cómo cambia una variable al ejecutar una lista de instrucciones EN
// ORDEN — incluye pasos condicionales (si/si no) y permite mostrar el
// mismo conjunto de pasos en otro orden para evidenciar que el resultado
// final cambia (dos visuales distintos con los mismos pasos reordenados).
export default function Algoritmo({ visual }: Props) {
  const t = useTranslations("Enigmia.visuales.algoritmo");
  const variable = visual.variable && visual.variable.length > 0 ? visual.variable : "x";
  const pasos = pasosValidos(visual.pasos);
  const inicial = Number.isFinite(visual.inicial) ? visual.inicial : null;
  const datos = inicial !== null && pasos.length > 0 ? trazarAlgoritmo(inicial, pasos) : null;

  const { alVer, ...r } = useReproductor({ total: datos?.pasos.length ?? 0, ms: 1200, estatico: visual.estatico, inicio: 1 });
  if (!datos) return null;

  const revelados = datos.pasos.slice(0, Math.max(1, r.paso));

  const alternativa = (
    <ol>
      <li>{t("inicial", { variable, n: datos.inicial })}</li>
      {datos.pasos.map((p, i) => (
        <li key={i}>
          {describirPaso(p.entrada, variable, t)}
          {p.ramaTomada && ` (${t(p.ramaTomada === "verdadero" ? "ramaVerdadero" : "ramaFalso")})`} → {variable} = {p.valorDespues}
        </li>
      ))}
      <li>{t("final", { variable, n: datos.final })}</li>
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <div className="flex w-full flex-col gap-2">
        <div
          className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm font-mono font-bold"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span>{t("inicial", { variable, n: datos.inicial })}</span>
        </div>
        <ol className="flex flex-col gap-1.5">
          {revelados.map((p, i) => {
            const actual = i === revelados.length - 1;
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                  actual ? "" : "opacity-70"
                }`}
                style={actual ? { borderColor: COLOR_ENIGMIA, background: `color-mix(in oklab, ${COLOR_ENIGMIA} 10%, var(--surface))` } : { borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <span className="font-mono">
                  {i + 1}. {describirPaso(p.entrada, variable, t)}
                  {p.ramaTomada && (
                    <span className="ml-1 text-xs font-semibold" style={{ color: COLOR_ENIGMIA }}>
                      ({t(p.ramaTomada === "verdadero" ? "ramaVerdadero" : "ramaFalso")})
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold" style={{ color: COLOR_ENIGMIA }}>
                  {variable} = {p.valorDespues}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </div>
      {r.paso >= datos.pasos.length && <Resaltado>{t("final", { variable, n: datos.final })}</Resaltado>}
    </MarcoVisual>
  );
}
