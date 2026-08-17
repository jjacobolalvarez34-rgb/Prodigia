"use client";

import { useRef, useState } from "react";
import { tiempoEsperadoMs } from "@/lib/practica/formulas";

// Fase C2, generalizado para todos los mundos de práctica (no solo
// Aritmética): desde nivel 5, responder en menos de la mitad del tiempo
// esperado para ese nivel suma +1 a +3s al reloj de la partida, con un
// tope acumulado por partida. `tiempoEsperadoMs` solo depende del nivel
// (1-10), no del tipo de problema, así que sirve igual para fracciones,
// acertijos de Enigmia o preguntas de Geografía.
const NIVEL_MIN_BONUS_TIEMPO = 5;
const BONUS_TIEMPO_MAX_ACUMULADO_MS = 20_000;

export function useBonusTiempo(duracionBaseMs: number) {
  const bonusAcumuladoRef = useRef(0);
  const [duracionTotalMs, setDuracionTotalMs] = useState(duracionBaseMs);
  const [bonusTiempo, setBonusTiempo] = useState<number | null>(null);

  function evaluarBonus(nivel: number, timeMs: number) {
    if (nivel < NIVEL_MIN_BONUS_TIEMPO || bonusAcumuladoRef.current >= BONUS_TIEMPO_MAX_ACUMULADO_MS) return;
    const esperado = tiempoEsperadoMs(nivel);
    if (timeMs >= esperado * 0.5) return;
    const factor = 1 - timeMs / esperado;
    const segundosBonus = Math.min(3, Math.max(1, Math.round(1 + factor * 2)));
    const msBonus = Math.min(segundosBonus * 1000, BONUS_TIEMPO_MAX_ACUMULADO_MS - bonusAcumuladoRef.current);
    if (msBonus <= 0) return;
    bonusAcumuladoRef.current += msBonus;
    setDuracionTotalMs(duracionBaseMs + bonusAcumuladoRef.current);
    setBonusTiempo(Math.round(msBonus / 1000));
  }

  function limpiarBonus() {
    setBonusTiempo(null);
  }

  return { duracionTotalMs, bonusTiempo, bonusAcumuladoRef, evaluarBonus, limpiarBonus };
}
