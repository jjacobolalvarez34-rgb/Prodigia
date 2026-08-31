interface DiaProgreso {
  fecha: string; // date ISO (YYYY-MM-DD)
  meta_alcanzada: boolean;
  congelado?: boolean; // día protegido con un congelamiento de la tienda (Fase M)
}

// Cuenta días consecutivos con la meta diaria alcanzada (o congelados con
// un ítem de la tienda), terminando hoy o ayer. Si hoy todavía no se
// alcanzó la meta, no corta la racha — solo no la extiende todavía (el
// usuario puede seguir practicando hoy).
// No usamos profiles.streak_dias porque nada lo escribe: se deriva de
// daily_progress en cada request, así nunca queda desincronizado.
export function calcularRachaDiaria(rows: DiaProgreso[], hoyIso: string): number {
  const porFecha = new Map(rows.map((r) => [r.fecha, r.meta_alcanzada || !!r.congelado]));
  const cursor = new Date(`${hoyIso}T00:00:00Z`);

  if (!porFecha.get(hoyIso)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let racha = 0;
  while (porFecha.get(cursor.toISOString().slice(0, 10))) {
    racha++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return racha;
}

// Lunes de la semana ISO en curso, en UTC — mismo criterio que
// date_trunc('week', current_date) en Postgres (completar_reto_semanal,
// ranking_semanal_filtrado). Único punto de verdad para "qué semana es
// hoy" entre el reto semanal y su racha.
export function lunesDeEstaSemanaIso(): string {
  const hoy = new Date();
  const dia = hoy.getUTCDay(); // 0 = domingo
  const diffAlLunes = dia === 0 ? 6 : dia - 1;
  const lunes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - diffAlLunes));
  return lunes.toISOString().slice(0, 10);
}

// Mismo criterio que calcularRachaDiaria pero contando semanas
// consecutivas en vez de días — cada fila es el lunes (date_trunc
// 'week') de una semana en la que se completó el reto semanal. Si esta
// semana todavía no se completó, no corta la racha (solo no la
// extiende todavía), igual que la diaria.
export function calcularRachaSemanal(semanas: string[], semanaActualIso: string): number {
  const set = new Set(semanas);
  const cursor = new Date(`${semanaActualIso}T00:00:00Z`);

  if (!set.has(semanaActualIso)) {
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }

  let racha = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    racha++;
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }

  return racha;
}
