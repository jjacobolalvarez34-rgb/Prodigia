"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import {
  ecuacionLatex,
  ladoLatex,
  ladoLatexResaltado,
  resolverCaso,
  type ResultadoCaso,
  type SemirreaccionBalanceada,
  type TerminoRedox,
} from "@/lib/quimia/redox";
import type { VisualQuimiaBalanceo } from "@/lib/quimia/visuales";
import { MarcoVisual, TextoDelPaso, COLOR_QUIMIA } from "./comun";

interface Props {
  visual: VisualQuimiaBalanceo;
}

function resolverSeguro(id: unknown): ResultadoCaso | null {
  if (typeof id !== "string") return null;
  try {
    return resolverCaso(id);
  } catch {
    return null;
  }
}

const porCoef = (l: TerminoRedox[], m: number): TerminoRedox[] => l.map((x) => ({ ...x, coef: x.coef * m }));

interface Estado {
  reactivos: TerminoRedox[];
  productos: TerminoRedox[];
  eR: number;
  eP: number;
}
const deSemi = (s: SemirreaccionBalanceada): Estado => ({ reactivos: s.reactivos, productos: s.productos, eR: s.tipo === "reduccion" ? s.electrones : 0, eP: s.tipo === "oxidacion" ? s.electrones : 0 });

// Línea de una semirreacción con lo que cambió respecto del estado anterior en color.
function linea(actual: Estado, previo: Estado | null): string {
  const p = previo ?? actual;
  return `${ladoLatexResaltado(actual.reactivos, previo ? p.reactivos : actual.reactivos, actual.eR, p.eR)} \\rightarrow ${ladoLatexResaltado(actual.productos, previo ? p.productos : actual.productos, actual.eP, p.eP)}`;
}

// Visual "quimia.balanceo": el método ion-electrón paso a paso para un caso
// de CASOS_BALANCEO (src/lib/quimia/redox.ts): H₂O para el oxígeno, H⁺ para
// el hidrógeno, e⁻ para la carga (y OH⁻ en medio básico), igualar los
// electrones y sumar. Cada ecuación se calcula con el algoritmo de
// balancearSemirreaccion y se verifica en redox.test.ts.
export default function Balanceo({ visual }: Props) {
  const t = useTranslations("Quimia.visuales.balanceo");
  const res = resolverSeguro(visual.caso);
  const basico = res?.caso.medio === "basico";
  const total = basico ? 8 : 6;
  const { alVer, ...r } = useReproductor({ total, ms: 3600, estatico: visual.estatico, inicio: 1 });
  if (!res) return null;
  const paso = Math.min(total, Math.max(1, r.paso));
  const { reduccion: R, oxidacion: O, suma } = res;

  // Estados sucesivos de cada semirreacción (cada uno es un paso de la lección).
  const esq = (p: typeof R): Estado => ({ ...p.esqueleto, eR: 0, eP: 0 });
  const conAgua = (p: typeof R): Estado => ({ reactivos: p.conAgua.reactivos, productos: p.conAgua.productos, eR: 0, eP: 0 });
  const conH = (p: typeof R): Estado => ({ reactivos: p.conProtones.reactivos, productos: p.conProtones.productos, eR: 0, eP: 0 });
  const conE = (p: typeof R): Estado => deSemi(p.conElectrones);
  const conOH = (p: typeof R): Estado => ({ reactivos: p.basico!.conOH.reactivos, productos: p.basico!.conOH.productos, eR: p.conElectrones.tipo === "reduccion" ? p.conElectrones.electrones : 0, eP: p.conElectrones.tipo === "oxidacion" ? p.conElectrones.electrones : 0 });
  const fin = (p: typeof R): Estado => deSemi(p.final);
  const secuencia = (p: typeof R): Estado[] => (basico ? [esq(p), conAgua(p), conH(p), conE(p), conOH(p), fin(p)] : [esq(p), conAgua(p), conH(p), conE(p)]);
  const sR = secuencia(R);
  const sO = secuencia(O);
  const pasosSemi = sR.length; // 4 en medio ácido, 6 en básico

  let lineaR: string;
  let lineaO: string;
  let final: string | null = null;
  let multiplicadores: { r: number; o: number } | null = null;
  if (paso <= pasosSemi) {
    lineaR = linea(sR[paso - 1], paso > 1 ? sR[paso - 2] : null);
    lineaO = linea(sO[paso - 1], paso > 1 ? sO[paso - 2] : null);
  } else {
    lineaR = ladoRes(R.final, suma.multReduccion);
    lineaO = ladoRes(O.final, suma.multOxidacion);
    multiplicadores = { r: suma.multReduccion, o: suma.multOxidacion };
    if (paso === total) final = ecuacionLatex(suma.reactivos, suma.productos);
  }

  const agregadas = (p: typeof R) => p.conAgua.agregadas;
  const protones = (p: typeof R) => p.conProtones.agregados;
  const textos: string[] = [
    t("p1"),
    t("p2", { rd: agregadas(R), ox: agregadas(O), aRed: t(`lado.${R.conAgua.lado ?? "ninguno"}`), aOx: t(`lado.${O.conAgua.lado ?? "ninguno"}`) }),
    t("p3", { rd: protones(R), ox: protones(O), aRed: t(`lado.${R.conProtones.lado ?? "ninguno"}`), aOx: t(`lado.${O.conProtones.lado ?? "ninguno"}`) }),
    t("p4", { rd: R.conElectrones.electrones, ox: O.conElectrones.electrones }),
  ];
  if (basico) {
    textos.push(t("p5Basico", { rd: R.basico!.conOH.agregados, ox: O.basico!.conOH.agregados }));
    textos.push(t("p6Basico"));
  }
  textos.push(t("pMultiplicar", { mr: suma.multReduccion, mo: suma.multOxidacion, e: suma.electrones }));
  textos.push(t("pSumar", { ecuacion: `$${ecuacionLatex(suma.reactivos, suma.productos)}$` }));

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
      <div className="flex w-full flex-col gap-2" data-paso={paso} aria-hidden="true">
        <Semirreaccion etiqueta={t("reduccion")} tex={lineaR} multiplicador={multiplicadores?.r ?? null} color="#3B82F6" />
        <Semirreaccion etiqueta={t("oxidacion")} tex={lineaO} multiplicador={multiplicadores?.o ?? null} color="#EF4444" />
        {final && (
          <div className="overflow-x-auto rounded-xl border-2 px-2 py-2 text-center text-sm sm:text-base" style={{ borderColor: COLOR_QUIMIA }}>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLOR_QUIMIA }}>
              {t("neta")}
            </p>
            <MathText texto={`$${final}$`} />
          </div>
        )}
      </div>
      <TextoDelPaso>
        <MathText texto={textos[paso - 1]} />
      </TextoDelPaso>
    </MarcoVisual>
  );
}

function ladoRes(s: SemirreaccionBalanceada, m: number): string {
  const e = deSemi(s);
  return `${ladoLatex(porCoef(e.reactivos, m), e.eR * m)} \\rightarrow ${ladoLatex(porCoef(e.productos, m), e.eP * m)}`;
}

function Semirreaccion({ etiqueta, tex, multiplicador, color }: { etiqueta: string; tex: string; multiplicador: number | null; color: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border px-2 py-1.5" style={{ borderColor: color, background: `color-mix(in oklab, ${color} 7%, var(--surface))` }}>
      <p className="mb-0.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color }}>
        {etiqueta}
        {multiplicador !== null && multiplicador > 1 && <span className="rounded-full px-1.5 py-0.5 text-[11px] normal-case text-white" style={{ background: color }}>× {multiplicador}</span>}
      </p>
      <div className="text-center text-sm sm:text-base">
        <MathText texto={`$${tex}$`} />
      </div>
    </div>
  );
}
