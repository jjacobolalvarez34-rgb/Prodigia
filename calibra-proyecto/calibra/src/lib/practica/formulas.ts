// XP = 10 base × multiplicador_de_nivel × bonus_de_velocidad (si correcto; si no, 0 XP).
// Ver docs/MECANICA.md — el error nunca resta, solo no suma.

const XP_BASE = 10;

// 1.0x en nivel 1 hasta 2.35x en nivel 10.
export function multiplicadorDeNivel(nivel: number): number {
  return 1 + (nivel - 1) * 0.15;
}

// Tiempo "esperado" para responder en ese nivel: cuanto más alto el nivel,
// menos tiempo se espera que tome (el problema es más chico en esa escala
// de dificultad, no más lento de resolver).
export function tiempoEsperadoMs(nivel: number): number {
  return 6000 - (nivel - 1) * 350; // 6000ms (nivel 1) → 2850ms (nivel 10)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// 1.5x si responde casi instantáneo, baja linealmente a 1.0x en el tiempo
// esperado, y nunca menos de 1.0x (responder lento nunca resta XP).
export function bonusDeVelocidad(timeMs: number, nivel: number): number {
  const esperado = tiempoEsperadoMs(nivel);
  const factor = 1.5 - 0.5 * (timeMs / esperado);
  return clamp(factor, 1.0, 1.5);
}

export function calcularXp(nivel: number, correct: boolean, timeMs: number): number {
  if (!correct) return 0;
  const xp = XP_BASE * multiplicadorDeNivel(nivel) * bonusDeVelocidad(timeMs, nivel);
  return Math.round(xp);
}

export interface DesgloseXp {
  base: number;
  multiplicadorNivel: number;
  bonusVelocidad: number;
  total: number;
}

// Mismo cálculo que calcularXp, pero exponiendo cada factor por separado
// — lo usa la animación de puntaje de /practica para mostrar la
// secuencia base -> nivel -> velocidad en vez del número final de una.
export function calcularXpDetallado(nivel: number, timeMs: number): DesgloseXp {
  const multiplicadorNivel = multiplicadorDeNivel(nivel);
  const bonusVelocidad = bonusDeVelocidad(timeMs, nivel);
  return {
    base: XP_BASE,
    multiplicadorNivel: Math.round(multiplicadorNivel * 100) / 100,
    bonusVelocidad: Math.round(bonusVelocidad * 100) / 100,
    total: Math.round(XP_BASE * multiplicadorNivel * bonusVelocidad),
  };
}
