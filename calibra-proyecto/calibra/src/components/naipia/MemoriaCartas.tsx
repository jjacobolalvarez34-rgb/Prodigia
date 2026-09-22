"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Carta } from "@/lib/practica/naipia";
import {
  calendarioMemoria,
  estadoInicialMemoria,
  programarMemoria,
  type EstadoMemoria,
} from "@/lib/practica/memoriaNaipia";
import CartaSVG, { DorsoSVG } from "./CartaSVG";

const ANCHO_ESCENARIO = 88;
const ANCHO_MINI = 20;
const COLOR_DEFECTO = "#B91C1C";

interface VistaProps {
  cartas: Carta[];
  msPorCarta: number;
  estado: EstadoMemoria;
  colorHex?: string;
}

// Parte visual pura del modo memoria (recibe el estado ya calculado): una
// carta grande visible a la vez, progreso "carta 3 de 12" y una fila de
// dorsos que se va llenando con las cartas que ya se dieron vuelta. Separada
// del temporizador para poder renderizar cualquier estado en los tests.
export function MemoriaCartasVista({ cartas, msPorCarta, estado, colorHex = COLOR_DEFECTO }: VistaProps) {
  const t = useTranslations("Naipia");
  const reducirMovimiento = useReducedMotion();
  const total = cartas.length;
  const carta = estado.visible !== null ? cartas[estado.visible] : null;

  const progreso =
    estado.fase === "preparando"
      ? t("memoria.preparando")
      : estado.fase === "terminada"
        ? t("memoria.terminado", { total })
        : t("memoria.progreso", { n: (estado.visible ?? 0) + 1, total });

  // Lo que anuncia el lector de pantalla es lo que ve un vidente: la carta
  // mientras está visible; nada más que el progreso cuando ya no lo está.
  const anuncio = carta
    ? t("memoria.anuncio", {
        n: (estado.visible ?? 0) + 1,
        total,
        carta: t("cartas.etiqueta", { valor: t(`cartas.valores.${carta.valor}`), palo: t(`cartas.palos.${carta.palo}`) }),
      })
    : progreso;

  const duracionEntrada = reducirMovimiento ? 0.12 : Math.min(0.22, (msPorCarta / 1000) * 0.4);

  return (
    <div className="flex w-full flex-col items-center gap-3" data-modo-memoria="true">
      <div
        className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-center"
        style={{ background: `color-mix(in oklab, ${colorHex} 10%, transparent)` }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: colorHex }}>
          {t("memoria.modoTitulo")}
        </span>
        <p className="text-xs text-texto-secundario">{t("memoria.modoDescripcion")}</p>
      </div>

      <p className="font-mono text-sm font-semibold text-foreground">{progreso}</p>

      <div
        aria-hidden="true"
        className="flex items-center justify-center"
        style={{ width: ANCHO_ESCENARIO, height: Math.round((ANCHO_ESCENARIO * 84) / 60) }}
      >
        {carta ? (
          <motion.div
            key={estado.visible}
            initial={reducirMovimiento ? { opacity: 0 } : { opacity: 0, x: 40, y: -30, rotate: 8, scale: 0.75 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            transition={{ duration: duracionEntrada, ease: "easeOut" }}
          >
            <CartaSVG carta={carta} ancho={ANCHO_ESCENARIO} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <DorsoSVG ancho={ANCHO_ESCENARIO} colorHex={colorHex} decorativo />
          </motion.div>
        )}
      </div>

      <div aria-hidden="true" className="flex flex-wrap justify-center gap-1" data-fila-dorsos="true">
        {cartas.map((_, i) =>
          i < estado.ocultas ? (
            <motion.div
              key={i}
              data-dorso="true"
              initial={reducirMovimiento ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: reducirMovimiento ? 0.12 : 0.18 }}
            >
              <DorsoSVG ancho={ANCHO_MINI} colorHex={colorHex} decorativo />
            </motion.div>
          ) : (
            <div
              key={i}
              data-hueco="true"
              className="rounded-[3px] border border-dashed"
              style={{
                width: ANCHO_MINI,
                height: Math.round((ANCHO_MINI * 84) / 60),
                borderColor: i === estado.visible ? colorHex : "var(--border)",
                borderStyle: i === estado.visible ? "solid" : "dashed",
              }}
            />
          )
        )}
      </div>

      <p className="sr-only" aria-live="polite" data-anuncio="true">
        {anuncio}
      </p>
    </div>
  );
}

interface Props {
  cartas: Carta[];
  msPorCarta: number;
  colorHex?: string;
  // Se llama UNA vez cuando se da vuelta la última carta: recién ahí el
  // padre habilita el campo de respuesta y arranca su cronómetro.
  onTerminar: () => void;
}

// Reparto del modo memoria: las cartas salen una a una, cada una queda
// visible msPorCarta y se da vuelta. Remontar con `key` para empezar de cero
// con otra secuencia. El ritmo viene del problema (msPorCarta): nada de azar
// en el cliente. Con "reducir movimiento" el modo es el mismo (es mecánica
// de juego, no adorno), solo que las cartas aparecen con un fade simple.
export default function MemoriaCartas({ cartas, msPorCarta, colorHex, onTerminar }: Props) {
  const calendario = useMemo(() => calendarioMemoria(cartas.length, msPorCarta), [cartas.length, msPorCarta]);
  const [estado, setEstado] = useState<EstadoMemoria>(() => estadoInicialMemoria(calendario));
  const onTerminarRef = useRef(onTerminar);
  useEffect(() => {
    onTerminarRef.current = onTerminar;
  });

  useEffect(() => {
    return programarMemoria(calendario, {
      onEstado: setEstado,
      onFin: () => onTerminarRef.current(),
    });
  }, [calendario]);

  return <MemoriaCartasVista cartas={cartas} msPorCarta={msPorCarta} estado={estado} colorHex={colorHex} />;
}
