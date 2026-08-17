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
