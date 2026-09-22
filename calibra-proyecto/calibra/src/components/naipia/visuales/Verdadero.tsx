"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import { dividirConRegla, esReglaRedondeo, mediosMazosRestantes } from "@/lib/naipia/visualesDatos";
import type { VisualNaipiaVerdadero } from "@/lib/naipia/visuales";
import { COLOR_NAIPIA, MarcoVisual, Marcador, signo, useNumero } from "./comun";

interface Props {
  visual: VisualNaipiaVerdadero;
}

const MS_POR_PASO = 2600;
const ALTO_MAZO = 44;
const ANCHO_MAZO = 32;

// Un mazo como pila: el contorno es el mazo entero y el relleno lo que
// queda (rest entre 0 y 1). Al gastarse, el relleno baja con animación.
function Mazo({ rest, reducir }: { rest: number; reducir: boolean }) {
  const alto = Math.max(0, Math.min(1, rest)) * (ALTO_MAZO - 4);
  return (
    <svg width={ANCHO_MAZO} height={ALTO_MAZO} viewBox={`0 0 ${ANCHO_MAZO} ${ALTO_MAZO}`} aria-hidden="true">
      <rect
        x={1}
        y={1}
        width={ANCHO_MAZO - 2}
        height={ALTO_MAZO - 2}
        rx={4}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <motion.rect
        x={3}
        rx={3}
        width={ANCHO_MAZO - 6}
        fill={COLOR_NAIPIA}
        initial={false}
        animate={{ height: alto, y: ALTO_MAZO - 2 - alto }}
        transition={reducir ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

function Fila({ visible, reducir, children }: { visible: boolean; reducir: boolean; children: ReactNode }) {
  return (
    <motion.p
      initial={reducir ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.35 }}
      className="w-full text-center text-sm text-foreground"
    >
      {children}
    </motion.p>
  );
}

// Conteo verdadero animado: los mazos como pilas que se van gastando, el
// conteo corriente ÷ mazos restantes, y el redondeo con la regla siempre
// declarada. Las cuentas usan las mismas reglas que naipia.ts.
export default function Verdadero({ visual }: Props) {
  const t = useTranslations("Naipia.visuales");
  const numero = useNumero();
  const conteoOk = Number.isInteger(visual.conteo);
  const reglaOk = esReglaRedondeo(visual.regla);
  const conJugadas =
    Number.isInteger(visual.mazosTotales) &&
    Number.isInteger(visual.cartasJugadas) &&
    (visual.mazosTotales as number) >= 1 &&
    (visual.cartasJugadas as number) >= 0 &&
    (visual.cartasJugadas as number) < 52 * (visual.mazosTotales as number);
  const restantesDirecto =
    typeof visual.mazosRestantes === "number" && visual.mazosRestantes >= 0.5 && Number.isInteger(visual.mazosRestantes * 2);
  const datosOk = conteoOk && reglaOk && (conJugadas || restantesDirecto);

  const mazosTotales = conJugadas ? (visual.mazosTotales as number) : Math.ceil(visual.mazosRestantes ?? 1);
  const cartasJugadas = conJugadas ? (visual.cartasJugadas as number) : 0;
  const cartasRestantes = conJugadas ? 52 * mazosTotales - cartasJugadas : 0;
  const mazosRestantes = conJugadas ? mediosMazosRestantes(mazosTotales, cartasJugadas) / 2 : (visual.mazosRestantes ?? 1);
  // Pasos: 1 los mazos, [2 las cartas jugadas], luego la división y la regla.
  const pasosTotales = conJugadas ? 4 : 3;
  const pDivision = conJugadas ? 3 : 2;
  const pRegla = pDivision + 1;
  const r = useReproductor({ total: pasosTotales, ms: MS_POR_PASO, estatico: visual.estatico });
  if (!datosOk || mazosRestantes <= 0 || mazosTotales > 12) return null;

  const crudo = visual.conteo / mazosRestantes;
  const resultado = dividirConRegla(visual.conteo, mazosRestantes, visual.regla);
  const textoRegla = t(`regla.${visual.regla}`);
  const restos = Array.from({ length: mazosTotales }, (_, i) => {
    const rest = Math.max(0, Math.min(1, mazosRestantes - (mazosTotales - 1 - i)));
    return conJugadas && r.paso < 2 ? 1 : rest;
  });
  const esExacto = Math.abs(crudo * 100 - Math.round(crudo * 100)) < 1e-9;

  const alternativa = (
    <>
      <p>{t("verdaderoEtiqueta")}</p>
      <ul>
        {conJugadas ? (
          <>
            <li>{t("verdaderoConjuntoAlt", { m: mazosTotales })}</li>
            <li>
              {t("verdaderoJugadasAlt", { j: cartasJugadas, r: cartasRestantes, mazos: numero(cartasRestantes / 52), medio: numero(mazosRestantes) })}
            </li>
          </>
        ) : (
          <li>{t("verdaderoRestantesAlt", { mazos: numero(mazosRestantes) })}</li>
        )}
        <li>{t("verdaderoDivisionAlt", { c: signo(visual.conteo), m: numero(mazosRestantes), q: numero(crudo) })}</li>
        <li>{t("verdaderoReglaAlt", { regla: textoRegla, n: signo(resultado) })}</li>
      </ul>
    </>
  );

  return (
    <MarcoVisual
      refCont={r.alVer}
      etiqueta={t("verdaderoEtiqueta")}
      titulo={visual.titulo}
      alternativa={alternativa}
      controles={<ControlesReproductor r={r} color={COLOR_NAIPIA} />}
    >
      <div className="flex flex-wrap items-end justify-center gap-1.5">
        {restos.map((rest, i) => (
          <motion.div
            key={i}
            initial={r.reducir ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: r.paso >= 1 ? 1 : 0, y: r.paso >= 1 ? 0 : 10 }}
            transition={{ duration: 0.4, delay: r.reducir ? 0 : i * 0.08 }}
          >
            <Mazo rest={rest} reducir={r.reducir} />
          </motion.div>
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <Fila visible={r.paso >= 1} reducir={r.reducir}>
          {conJugadas ? t("verdaderoConjunto", { m: mazosTotales }) : t("verdaderoRestantes", { mazos: numero(mazosRestantes) })}
        </Fila>
        {conJugadas && (
          <Fila visible={r.paso >= 2} reducir={r.reducir}>
            {t("verdaderoJugadas", {
              j: cartasJugadas,
              r: cartasRestantes,
              mazos: numero(cartasRestantes / 52),
              medio: numero(mazosRestantes),
            })}
          </Fila>
        )}
        <Fila visible={r.paso >= pDivision} reducir={r.reducir}>
          <span className="font-mono font-bold tabular-nums">
            {signo(visual.conteo)} {"÷"} {numero(mazosRestantes)} {esExacto ? "=" : "≈"} {numero(crudo)}
          </span>
        </Fila>
        <Fila visible={r.paso >= pRegla} reducir={r.reducir}>
          {t("verdaderoRegla", { regla: textoRegla })}
        </Fila>
      </div>

      <Marcador
        etiqueta={t("verdaderoConteo")}
        valor={r.paso >= pRegla ? resultado : 0}
        texto={r.paso >= pRegla ? signo(resultado) : "?"}
      />
    </MarcoVisual>
  );
}
