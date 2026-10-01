"use client";

import { cloneElement, isValidElement, useEffect, useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reproducirTono } from "@/lib/sonido";

// "¿Preparado? 3, 2, 1… ¡Ya!" antes de cada partida (pedido 2026-10-01: antes la
// partida arrancaba de golpe). Envuelve al SprintRunner de cualquier mundo y lo
// monta recién al terminar la cuenta; como los runners miden su reloj desde la
// prop `startedAt` (performance.now()), se la reemplaza por el instante real de
// arranque para que la cuenta no le coma segundos a la partida. En duelos no se
// usa (`omitir`): la sala ya tiene su propia cuenta sincronizada con el rival.

const PASOS = ["¿Preparado?", "3", "2", "1", "¡Ya!"];
const MS_POR_PASO = 650;

interface Props {
  children: ReactElement<{ startedAt?: number }>;
  omitir?: boolean;
}

export default function ConCuentaRegresiva({ children, omitir = false }: Props) {
  const [paso, setPaso] = useState(omitir ? PASOS.length : 0);
  const [inicio, setInicio] = useState<number | null>(null);

  useEffect(() => {
    if (omitir) return;
    if (paso >= PASOS.length) return;
    if (paso >= 1) reproducirTono(paso === PASOS.length - 1 ? "ya" : "cuenta");
    const t = setTimeout(() => {
      if (paso + 1 >= PASOS.length) setInicio(performance.now());
      setPaso((p) => p + 1);
    }, paso === PASOS.length - 1 ? 380 : MS_POR_PASO);
    return () => clearTimeout(t);
  }, [paso, omitir]);

  if (omitir) return children;
  if (paso >= PASOS.length) {
    return isValidElement(children) && inicio !== null && "startedAt" in (children.props ?? {}) ? cloneElement(children, { startedAt: inicio }) : children;
  }

  const texto = PASOS[paso];
  const esNumero = /^\d$/.test(texto);
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24" aria-live="assertive">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={texto}
          initial={{ scale: 2.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className={`font-display font-bold ${esNumero ? "text-8xl text-primario" : "text-4xl text-foreground"} ${texto === "¡Ya!" ? "text-logro" : ""}`}
        >
          {texto}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
