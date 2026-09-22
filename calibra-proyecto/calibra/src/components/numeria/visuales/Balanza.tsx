"use client";

import { useTranslations } from "next-intl";
import MathText from "@/components/MathText";
import type { VisualNumeriaBalanza } from "@/lib/numeria/visuales";
import { despejarLineal, verificarSustitucion } from "@/lib/numeria/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { MarcoVisual, Resaltado, COLOR_NUMERIA, motion } from "./comun";

interface Props {
  visual: VisualNumeriaBalanza;
}

interface Etapa {
  izq: string;
  der: string;
}

function Plato({ contenido }: { contenido: string }) {
  return (
    <span
      className="inline-flex min-h-11 min-w-16 items-center justify-center rounded-lg border-2 px-3 py-1.5 font-mono text-base font-bold text-foreground"
      style={{ borderColor: COLOR_NUMERIA, background: "var(--surface)" }}
    >
      <MathText texto={contenido} />
    </span>
  );
}

function textoEcuacion(coefX: number, constante: number): string {
  const coefTexto = coefX === 1 ? "x" : coefX === -1 ? "-x" : `${coefX}x`;
  if (constante === 0) return coefTexto;
  const signo = constante > 0 ? "+" : "-";
  return `${coefTexto} ${signo} ${Math.abs(constante)}`;
}

// Técnicas de Álgebra: una ecuación de un paso o dos pasos representada
// como una balanza — cada etapa muestra los dos "platos" (izquierda y
// derecha) equilibrados, hasta llegar a x (modo "despejar") o comprobar
// que la solución cierra sustituyéndola de nuevo (modo "verificar").
export default function Balanza({ visual }: Props) {
  const t = useTranslations("Numeria.visuales.balanza");
  const coefX = visual.coefX;
  const constante = visual.constante;
  const resultado = visual.resultado;
  const valido = [coefX, constante, resultado].every((n) => Number.isFinite(n)) && coefX !== 0;
  const modo = visual.modo === "verificar" ? "verificar" : "despejar";
  const totalPasos = modo === "despejar" ? 2 : 1;
  const { alVer, ...r } = useReproductor({ total: totalPasos, ms: 2000, estatico: visual.estatico, inicio: 1 });
  const despeje = valido ? despejarLineal(coefX, constante, resultado) : null;
  if (!despeje) return null;
  const { x, trasConstante } = despeje;

  const ecuacionOriginal = textoEcuacion(coefX, constante);
  const etapas: Etapa[] =
    modo === "despejar"
      ? [
          { izq: ecuacionOriginal, der: `${resultado}` },
          { izq: textoEcuacion(coefX, 0), der: `${trasConstante}` },
          { izq: "x", der: `${x}` },
        ]
      : [
          { izq: ecuacionOriginal, der: `${resultado}` },
          { izq: `${coefX}(${x})${constante >= 0 ? "+" : "-"}${Math.abs(constante)}`, der: `${resultado}` },
        ];

  const comprobado = modo === "verificar" ? verificarSustitucion(coefX, constante, x) : null;
  const paso = Math.min(r.paso, etapas.length - 1);

  const alternativa = (
    <ol>
      {etapas.map((e, i) => (
        <li key={i}>
          {e.izq} = {e.der}
        </li>
      ))}
      {modo === "verificar" && <li>{t("comprobacion", { n: comprobado ?? 0 })}</li>}
    </ol>
  );

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={visual.titulo ?? t("etiqueta", { izq: ecuacionOriginal, der: resultado })}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} />}
    >
      <motion.div
        key={paso}
        initial={r.reducir ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-xs items-center justify-center gap-3"
      >
        <Plato contenido={etapas[paso].izq} />
        <span className="text-lg font-bold" style={{ color: COLOR_NUMERIA }}>
          =
        </span>
        <Plato contenido={etapas[paso].der} />
      </motion.div>
      {r.paso >= totalPasos && modo === "despejar" && <Resaltado>{t("resultado", { n: x })}</Resaltado>}
      {r.paso >= totalPasos && modo === "verificar" && <Resaltado>{t("comprobacion", { n: comprobado! })}</Resaltado>}
    </MarcoVisual>
  );
}
