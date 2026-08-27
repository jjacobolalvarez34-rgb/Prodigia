"use client";

import { useRef, useState } from "react";

// Fase 1 (auditoría 2026-08-25, "racha se queda en 2 y se resetea"):
// causa real encontrada — TODOS los SprintRunner (Numeria incluido, no
// es una excepción) alimentaban RachaFuego con
// `skillLevel.racha_actual`, el contador INTERNO de calibración de
// dificultad (calcularNuevoNivel, skillLevels.ts): sube de a 1 con
// cada acierto pero se resetea a 0 apenas llega a 3, porque en ESE
// momento el nivel de calibración sube — es una señal de "cuándo subir
// de nivel", nunca pensada para mostrarse como un combo. RachaFuego, en
// cambio, está diseñado para un combo que crece sin techo (tiers en
// 2/4/6/8, ver el propio componente) — dos conceptos distintos
// compartiendo por error una sola variable.
//
// Esto es la "racha" real para mostrar: un contador puramente de
// sesión, sube con cada acierto, se resetea a 0 con cualquier error,
// nunca se resetea por una subida de nivel de calibración. Un solo
// hook, un solo criterio, para los 6 SprintRunner que hoy existen —
// antes cada uno tenía su propia copia de "setRacha(skillLevel.racha_actual)",
// ninguna en verdad distinta de las demás (Numeria tampoco se salvaba,
// pese a lo que parecía).
export function useRachaCombo() {
  const [racha, setRacha] = useState(0);
  const rachaRef = useRef(0);

  function registrarResultado(correct: boolean): number {
    rachaRef.current = correct ? rachaRef.current + 1 : 0;
    setRacha(rachaRef.current);
    return rachaRef.current;
  }

  return { racha, registrarResultado };
}
