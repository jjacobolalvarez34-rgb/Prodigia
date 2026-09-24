"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import {
  buscarEjemploRedox,
  ecuacionConNumeros,
  ecuacionLatex,
  electronesDelEjemplo,
  especieLatex,
  oxidacionLatex,
  ELECTRON_LATEX,
  type EjemploRedox,
} from "@/lib/quimia/redox";
import { formulaLatex } from "@/lib/quimia/formulas";
import type { VisualQuimiaRedox } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaRedox;
}

const COLOR_OXIDA = "#EF4444";
const COLOR_REDUCE = "#3B82F6";
const PASOS = 5;

// "\overset{+2}{\mathrm{Zn}}": el símbolo con su número de oxidación.
const conNumero = (simbolo: string, n: number) => `\\overset{${oxidacionLatex(n)}}{\\mathrm{${simbolo}}}`;
const cantidad = (n: number) => (n > 1 ? `${n}\\,` : "");

function nombreAgente(ej: EjemploRedox, formula: string): string {
  const x = [...ej.reactivos].find((y) => y.especie.formula === formula);
  return x ? `$${especieLatex(x.especie)}$` : `$${formulaLatex(formula)}$`;
}

// Visual "quimia.redox": una reacción redox paso a paso (ecuación
// balanceada, números de oxidación, quién sube y quién baja, balance de
// electrones y agentes). Los números de oxidación salen de
// numerosDeOxidacion y la ecuación está verificada en redox.test.ts.
export default function Redox({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.redox");
  const ej = typeof visual.ejemplo === "string" ? buscarEjemploRedox(visual.ejemplo) : undefined;
  const { alVer, ...r } = useReproductor({ total: PASOS, ms: 3400, estatico: visual.estatico, inicio: 1 });
  if (!ej) return null;
  const paso = Math.min(PASOS, Math.max(1, r.paso));
  const animar = !r.reducir;
  const { perdidos, ganados } = electronesDelEjemplo(ej);
  const dismutacion = ej.tipo === "dismutacion";
  const ox = ej.oxida;
  const re = ej.reduce;

  const semiOx = `${cantidad(ox.n)}${conNumero(ox.simbolo, ox.de)} \\rightarrow ${cantidad(ox.n)}${conNumero(ox.simbolo, ox.a)} + ${cantidad(perdidos)}${ELECTRON_LATEX}`;
  const semiRe = `${cantidad(re.n)}${conNumero(re.simbolo, re.de)} + ${cantidad(ganados)}${ELECTRON_LATEX} \\rightarrow ${cantidad(re.n)}${conNumero(re.simbolo, re.a)}`;

  const textos = [
    t("p1", { tipo: t(`tipos.${ej.tipo}`) }),
    t("p2"),
    dismutacion
      ? t("p3Dismutacion", { simbolo: ox.simbolo, de: `$${oxidacionLatex(ox.de)}$`, a1: `$${oxidacionLatex(ox.a)}$`, a2: `$${oxidacionLatex(re.a)}$` })
      : t("p3", {
          oxida: ox.simbolo,
          deO: `$${oxidacionLatex(ox.de)}$`,
          aO: `$${oxidacionLatex(ox.a)}$`,
          reduce: re.simbolo,
          deR: `$${oxidacionLatex(re.de)}$`,
          aR: `$${oxidacionLatex(re.a)}$`,
        }),
    t("p4", { oxSemi: `$${semiOx}$`, reSemi: `$${semiRe}$`, perdidos, ganados }),
    dismutacion
      ? t("p5Dismutacion", { especie: nombreAgente(ej, ej.agenteReductor) })
      : t("p5", { reductor: nombreAgente(ej, ej.agenteReductor), oxidante: nombreAgente(ej, ej.agenteOxidante) }),
  ];

  const ecuacion = paso >= 2 ? ecuacionConNumeros(ej) : ecuacionLatex(ej.reactivos, ej.productos);

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={
        <div>
          <p>
            <MathText texto={`$${ecuacionLatex(ej.reactivos, ej.productos)}$`} />
          </p>
          <ol>
            {textos.map((x, i) => (
              <li key={i}>
                <MathText texto={x} />
              </li>
            ))}
          </ol>
        </div>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="w-full overflow-x-auto text-center text-base sm:text-lg" data-paso={paso}>
        <MathText texto={`$${ecuacion}$`} />
      </div>
      {paso >= 3 && (
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-1.5" aria-hidden="true">
          <motion.div
            initial={animar ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border-2 px-2 py-2 text-center text-xs"
            style={{ borderColor: COLOR_OXIDA, background: `color-mix(in oklab, ${COLOR_OXIDA} 8%, var(--surface))` }}
          >
            <p className="font-bold" style={{ color: COLOR_OXIDA }}>
              {t("seOxida")} ↑
            </p>
            <p className="mt-0.5">
              <MathText texto={`$${conNumero(ox.simbolo, ox.de)} \\rightarrow ${conNumero(ox.simbolo, ox.a)}$`} />
            </p>
            <p className="text-[11px] text-texto-secundario">{t("pierde", { n: perdidos })}</p>
          </motion.div>
          <svg viewBox="0 0 60 30" className="h-8 w-14" role="presentation">
            <defs>
              <marker id="quimia-redox-flecha" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={COLOR_QUIMIA} />
              </marker>
            </defs>
            <line x1={4} y1={15} x2={52} y2={15} stroke={COLOR_QUIMIA} strokeWidth={2.5} markerEnd="url(#quimia-redox-flecha)" />
            {animar ? (
              <motion.circle cy={15} r={3.4} fill="#F59E0B" initial={{ cx: 6 }} animate={{ cx: [6, 46] }} transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }} />
            ) : (
              <circle cx={28} cy={15} r={3.4} fill="#F59E0B" />
            )}
            <text x={30} y={9} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--foreground)">
              e⁻
            </text>
          </svg>
          <motion.div
            initial={animar ? { opacity: 0, x: 8 } : false}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border-2 px-2 py-2 text-center text-xs"
            style={{ borderColor: COLOR_REDUCE, background: `color-mix(in oklab, ${COLOR_REDUCE} 8%, var(--surface))` }}
          >
            <p className="font-bold" style={{ color: COLOR_REDUCE }}>
              {t("seReduce")} ↓
            </p>
            <p className="mt-0.5">
              <MathText texto={`$${conNumero(re.simbolo, re.de)} \\rightarrow ${conNumero(re.simbolo, re.a)}$`} />
            </p>
            <p className="text-[11px] text-texto-secundario">{t("gana", { n: ganados })}</p>
          </motion.div>
        </div>
      )}
      {paso >= 4 && (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-background px-2 py-1.5 text-center text-sm" aria-hidden="true">
          <div>
            <MathText texto={`$${semiOx}$`} />
          </div>
          <div>
            <MathText texto={`$${semiRe}$`} />
          </div>
        </div>
      )}
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
