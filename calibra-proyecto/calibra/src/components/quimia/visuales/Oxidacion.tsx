"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { ecuacionOxidacionLatex, formulaConNumeros, oxidacionLatex, planOxidacion, type PlanOxidacion } from "@/lib/quimia/redox";
import type { VisualQuimiaOxidacion } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, motion, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaOxidacion;
}

const PASOS = 5;
const REGLA: Record<string, string> = { H: "hidrogeno", O: "oxigeno", F: "fluor", Li: "alcalino", Na: "alcalino", K: "alcalino", Mg: "alcalinoterreo", Ca: "alcalinoterreo", Ba: "alcalinoterreo", Al: "aluminio", Ag: "plata", Zn: "zinc" };

function planSeguro(v: VisualQuimiaOxidacion): PlanOxidacion | null {
  if (typeof v.formula !== "string" || typeof v.incognita !== "string") return null;
  try {
    return planOxidacion(v.formula, typeof v.carga === "number" ? v.carga : 0, v.incognita, v.fijos ?? {});
  } catch {
    return null;
  }
}

// Visual "quimia.oxidacion": cómo se calcula UN número de oxidación
// (fórmula, números conocidos por las reglas, ecuación de suma = carga,
// despeje y comprobación). Todo sale de numerosDeOxidacion/resolverOxidacion
// (src/lib/quimia/redox.ts, valencia.ts).
export default function Oxidacion({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.oxidacion");
  const plan = planSeguro(visual);
  const { alVer, ...r } = useReproductor({ total: PASOS, ms: 3200, estatico: visual.estatico, inicio: 1 });
  if (!plan) return null;
  const paso = Math.min(PASOS, Math.max(1, r.paso));
  const animar = !r.reducir;
  const carga = plan.especie.carga;
  const x = plan.numeros[plan.incognita];
  const fijos = visual.fijos ?? {};

  const conocidos: Record<string, number> = {};
  for (const s of plan.conocidos) conocidos[s] = plan.numeros[s];
  const formulaSolo = formulaConNumeros(plan.especie.formula, {}, carga);
  const formulaConocidos = formulaConNumeros(plan.especie.formula, { ...conocidos, [plan.incognita]: "x" }, carga);
  const formulaFinal = formulaConNumeros(plan.especie.formula, plan.numeros, carga);
  const ecuacion = ecuacionOxidacionLatex(plan);
  const suma = Object.keys(plan.cantidades)
    .map((s) => `${plan.cantidades[s] > 1 ? `${plan.cantidades[s]}\\cdot ` : ""}(${oxidacionLatex(plan.numeros[s])})`)
    .join(" + ");
  const lista = plan.conocidos
    .map((s) => `${s}: ${plan.numeros[s] > 0 ? "+" : "−"}${Math.abs(plan.numeros[s])} (${t(`reglas.${s in fijos ? "aclarado" : (REGLA[s] ?? "aclarado")}`)})`)
    .join("; ");

  const textos = [
    t("p1", { formula: `$${formulaSolo}$`, incognita: plan.incognita }),
    t("p2", { lista }),
    t("p3", { ecuacion: `$${ecuacion}$`, carga: carga === 0 ? "0" : `${carga > 0 ? "+" : "−"}${Math.abs(carga)}` }),
    t("p4", { incognita: plan.incognita, valor: `$${oxidacionLatex(x)}$` }),
    t("p5", { suma: `$${suma} = ${carga > 0 ? `+${carga}` : carga}$` }),
  ];

  const mostrada = paso === 1 ? formulaSolo : paso <= 3 ? formulaConocidos : formulaFinal;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta")}
      titulo={visual.titulo}
      alternativa={
        <ol>
          {textos.map((tx, i) => (
            <li key={i}>
              <MathText texto={tx} />
            </li>
          ))}
        </ol>
      }
      controles={<ControlesReproductor r={r} color={COLOR_QUIMIA} />}
    >
      <div className="w-full overflow-x-auto py-2 text-center text-2xl" data-paso={paso}>
        <MathText texto={`$${mostrada}$`} />
      </div>
      {paso >= 3 && (
        <motion.div
          key={paso >= 4 ? "resuelta" : "planteada"}
          initial={animar ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="w-full overflow-x-auto rounded-xl border border-border bg-background px-2 py-2 text-center text-lg"
          aria-hidden="true"
        >
          <MathText texto={paso >= 4 ? `$\\mathrm{${plan.incognita}}\\text{: } x = ${oxidacionLatex(x)}$` : `$${ecuacion}$`} />
        </motion.div>
      )}
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}
