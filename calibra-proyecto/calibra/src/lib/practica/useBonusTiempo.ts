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

// Pedido en vivo (2026-09-15): +3s comprado (tiempo_extra) es un bonus
// DELIBERADO, no debería taparlo el mismo tope silencioso pensado para
// el bonus pasivo por responder rápido.
const BONUS_TIEMPO_EXTRA_MS = 3_000;
// Hielo (consumible de tienda): detiene el reloj 10s.
const PAUSA_HIELO_MS = 10_000;

export function useBonusTiempo(duracionBaseMs: number) {
  const bonusAcumuladoRef = useRef(0);
  const [duracionTotalMs, setDuracionTotalMs] = useState(duracionBaseMs);
  const [bonusTiempo, setBonusTiempo] = useState<number | null>(null);

  // Pausa del reloj (Fase 2026-09-14: tiempo de memorización de Enigmia
  // no debía consumir el reloj de responder; Fase 2026-09-15: mismo
  // mecanismo generalizado para el consumible "hielo") — pausaAcumuladaRef
  // guarda cuánto tiempo YA pasó pausado, pausaDesdeRef marca cuándo
  // arrancó la pausa en curso (null si no hay ninguna activa). Las dos
  // pausas comparten el mismo bucket: no hay forma de que se pisen entre
  // sí en la práctica (Enigmia no vende hielo, y el hielo no se usa
  // durante la fase de memorización, que ni muestra el botón).
  const pausaAcumuladaRef = useRef(0);
  const pausaDesdeRef = useRef<number | null>(null);

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

  // Consumible "+3 segundos" (tiempo_extra) — a diferencia de
  // evaluarBonus, no respeta BONUS_TIEMPO_MAX_ACUMULADO_MS (fue comprado
  // con Chispas reales, no debería perderse en silencio por un tope
  // pensado para el bonus pasivo).
  function agregarBonusExtra() {
    bonusAcumuladoRef.current += BONUS_TIEMPO_EXTRA_MS;
    setDuracionTotalMs(duracionBaseMs + bonusAcumuladoRef.current);
    setBonusTiempo(Math.round(BONUS_TIEMPO_EXTRA_MS / 1000));
  }

  function limpiarBonus() {
    setBonusTiempo(null);
  }

  // Arranca una pausa manual (ej. mientras se muestra una secuencia
  // para memorizar) — se cierra con terminarPausa().
  function iniciarPausa() {
    if (pausaDesdeRef.current === null) pausaDesdeRef.current = performance.now();
  }

  function terminarPausa() {
    if (pausaDesdeRef.current !== null) {
      pausaAcumuladaRef.current += performance.now() - pausaDesdeRef.current;
      pausaDesdeRef.current = null;
    }
  }

  // Consumible "hielo": pausa automática de PAUSA_HIELO_MS que se cierra
  // sola — no depende de que el juego avise cuándo termina, a diferencia
  // de iniciarPausa/terminarPausa (memorización).
  function pausarPorHielo() {
    iniciarPausa();
    setTimeout(terminarPausa, PAUSA_HIELO_MS);
  }

  // Único cálculo de "cuánto falta" usado por los 9 SprintRunner que
  // comparten este hook — descuenta del tiempo transcurrido cualquier
  // pausa ya cerrada MÁS la que esté en curso ahora mismo.
  function calcularRestante(startedAt: number): number {
    const transcurrido = performance.now() - startedAt;
    const pausaEnCurso = pausaDesdeRef.current !== null ? performance.now() - pausaDesdeRef.current : 0;
    const transcurridoEfectivo = transcurrido - pausaAcumuladaRef.current - pausaEnCurso;
    return Math.max(0, duracionBaseMs + bonusAcumuladoRef.current - transcurridoEfectivo);
  }

  return {
    duracionTotalMs,
    bonusTiempo,
    bonusAcumuladoRef,
    evaluarBonus,
    agregarBonusExtra,
    limpiarBonus,
    iniciarPausa,
    terminarPausa,
    pausarPorHielo,
    calcularRestante,
  };
}
