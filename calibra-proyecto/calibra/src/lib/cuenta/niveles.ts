// Espejo en TS de la curva de niveles de cuenta definida en
// supabase/migrations/0118_niveles_cuenta_recompensas.sql. El SQL es
// la fuente de verdad en runtime (todas las llamadas reales van por
// RPC: xp_requerido_nivel_cuenta / nivel_desde_xp_cuenta /
// recompensa_nivel_cuenta) — este módulo solo existe para poder testear
// la fórmula con vitest sin necesitar una base. No usarlo desde
// componentes: desincronizar la fórmula TS del SQL rompería la barra
// de progreso que hoy llama al RPC directo.

export function costoMarginalNivelCuenta(nivel: number): number {
  const k = Math.max(1, Math.floor(nivel));
  if (k <= 2) return 200;
  if (k <= 5) return 300;
  if (k <= 10) return 550;
  if (k <= 15) return 900;
  if (k <= 20) return 1400;
  if (k <= 30) return 1900;
  return 2400;
}

export function xpRequeridoNivelCuenta(nivel: number): number {
  const n = Math.max(1, Math.floor(nivel));
  let acumulado = 0;
  for (let k = 2; k <= n; k++) {
    acumulado += costoMarginalNivelCuenta(k);
  }
  return acumulado;
}

export function nivelDesdeXpCuenta(xp: number): number {
  let nivel = 1;
  let restante = Math.max(0, Math.floor(xp));
  while (costoMarginalNivelCuenta(nivel + 1) <= restante) {
    restante -= costoMarginalNivelCuenta(nivel + 1);
    nivel++;
  }
  return nivel;
}

export function recompensaNivelCuenta(nivel: number): number {
  return 50 * Math.max(1, Math.floor(nivel)) + 250;
}