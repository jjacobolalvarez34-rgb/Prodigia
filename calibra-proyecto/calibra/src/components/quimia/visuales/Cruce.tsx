"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { armarFormula, buscarAnion, buscarCation, nombreDe, type IonDef } from "@/lib/quimia/nomenclatura";
import { formulaLatex, ionLatex } from "@/lib/quimia/formulas";
import type { VisualQuimiaCruce } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaCruce;
}

function resolver(cation: string, anion: string): { c: IonDef; a: IonDef } | null {
  try {
    return { c: buscarCation(cation), a: buscarAnion(anion) };
  } catch {
    return null;
  }
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

// Visual "quimia.cruce": el método de cruzar las cargas para armar la
// fórmula de un compuesto iónico. Los iones vienen de las tablas de
// src/lib/quimia/nomenclatura.ts y la fórmula final la calcula armarFormula
// (nada escrito a mano).
export default function Cruce({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.cruce");
  const ok = resolver(visual.cation, visual.anion);
  const simplifica = ok ? mcd(Math.abs(ok.c.carga), Math.abs(ok.a.carga)) > 1 : false;
  const total = simplifica ? 5 : 4;
  const { alVer, ...r } = useReproductor({ total, ms: 2800, estatico: visual.estatico, inicio: 1 });
  if (!ok) return null;
  const { c, a } = ok;
  const paso = Math.min(total, Math.max(1, r.paso));
  const animar = !r.reducir;

  const qc = Math.abs(c.carga);
  const qa = Math.abs(a.carga);
  const armada = armarFormula(c, a);
  // Fórmula "cruda" antes de simplificar: los subíndices son las cargas.
  const cruda = simplificaTexto(c, a, qa, qc);
  const cuenta = `${armada.nCation}\\times(${c.carga > 0 ? "+" : ""}${c.carga}) + ${armada.nAnion}\\times(${a.carga})`;
  let nombre = "";
  try {
    nombre = nombreDe(armada.formula, "stock");
  } catch {
    nombre = "";
  }

  // Pasos: 1 escribir los iones, 2 cruzar, [3 simplificar], verificar, resultado.
  const textos = [
    t("p1"),
    t("p2"),
    ...(simplifica ? [t("p3Simplifica", { cruda: `$${cruda}$`, formula: `$${formulaLatex(armada.formula)}$` })] : []),
    t("pVerifica", { cuenta: `$${cuenta} = 0$` }),
    nombre
      ? t("pResultadoNombre", { formula: `$${formulaLatex(armada.formula)}$`, nombre })
      : t("pResultado", { formula: `$${formulaLatex(armada.formula)}$` }),
  ];

  const mostrarCruce = paso >= 2;
  const cruzado = paso === 2;
  const mostrarFinal = paso >= 3;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={
        <ol>
          {textos.map((x, i) => (
            <li key={i}>
              <MathText texto={x} />
            </li>
          ))}
        </ol>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="relative mx-auto h-[150px] w-full max-w-xs" data-paso={paso}>
        <div className="absolute left-[24%] top-2 -translate-x-1/2 text-2xl">
          <MathText texto={`$${ionLatex(c.formula, c.carga)}$`} />
        </div>
        <div className="absolute left-[76%] top-2 -translate-x-1/2 text-2xl">
          <MathText texto={`$${ionLatex(a.formula, a.carga)}$`} />
        </div>
        {mostrarCruce && (
          <svg viewBox="0 0 320 64" className="absolute inset-x-0 top-11 h-16 w-full" role="presentation">
            <defs>
              <marker id="quimia-cruz" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={COLOR_QUIMIA} />
              </marker>
            </defs>
            <motion.line
              x1={106}
              y1={4}
              x2={210}
              y2={58}
              stroke={COLOR_QUIMIA}
              strokeWidth={2.2}
              markerEnd="url(#quimia-cruz)"
              initial={animar ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: cruzado ? 1 : 0.25 }}
              transition={{ duration: 0.7 }}
            />
            <motion.line
              x1={214}
              y1={4}
              x2={110}
              y2={58}
              stroke={COLOR_QUIMIA}
              strokeWidth={2.2}
              markerEnd="url(#quimia-cruz)"
              initial={animar ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: cruzado ? 1 : 0.25 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            />
          </svg>
        )}
        {mostrarCruce && (
          <motion.div
            initial={animar ? { opacity: 0, y: -6 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xl"
          >
            <MathText texto={`$${mostrarFinal ? formulaLatex(armada.formula) : cruda}$`} />
          </motion.div>
        )}
      </div>
      <TextoDelPaso>
        <MathText texto={textos[paso - 1] ?? ""} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}

// Fórmula antes de simplificar: el subíndice de cada ion es la carga (en
// valor absoluto) del otro, sin quitar el 1 ni dividir por nada.
function simplificaTexto(c: IonDef, a: IonDef, qa: number, qc: number): string {
  const parte = (ion: IonDef, n: number) => {
    const base = formulaLatex(ion.formula).replace(/^\\mathrm\{/, "").replace(/\}$/, "");
    const con = ion.poliatomico && n > 1 ? `(${base})` : `{${base}}`;
    return `${con}_{${n}}`;
  };
  return `\\mathrm{${parte(c, qa)}${parte(a, qc)}}`;
}
