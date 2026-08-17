interface DiaProgreso {
  fecha: string;
  meta_alcanzada: boolean;
  congelado?: boolean;
}

// Racha máxima histórica: la corrida más larga de días consecutivos con
// meta_alcanzada=true (o congelados) en TODO el historial, no solo la
// racha activa de hoy hacia atrás (para eso ya existe calcularRachaDiaria).
export function calcularRachaMaxima(rows: DiaProgreso[]): number {
  const fechas = rows
    .filter((r) => r.meta_alcanzada || r.congelado)
    .map((r) => r.fecha)
    .sort();

  if (fechas.length === 0) return 0;

  let maxima = 1;
  let actual = 1;
  for (let i = 1; i < fechas.length; i++) {
    const anterior = new Date(`${fechas[i - 1]}T00:00:00Z`);
    const esperado = new Date(anterior);
    esperado.setUTCDate(esperado.getUTCDate() + 1);
    const esperadoIso = esperado.toISOString().slice(0, 10);

    if (fechas[i] === esperadoIso) {
      actual++;
    } else if (fechas[i] !== fechas[i - 1]) {
      actual = 1;
    }
    maxima = Math.max(maxima, actual);
  }
  return maxima;
}

// No hay sprint_id persistido en attempts, así que "mejor precisión en un
// sprint" se aproxima con la mejor precisión de un DÍA completo — es la
// unidad de agrupación más chica que realmente tenemos en la base.
export function calcularMejorPrecisionDiaria(
  rows: { created_at: string; correct: boolean }[]
): number | null {
  const porDia = new Map<string, { total: number; correctos: number }>();
  for (const r of rows) {
    const dia = r.created_at.slice(0, 10);
    const actual = porDia.get(dia) ?? { total: 0, correctos: 0 };
    actual.total++;
    if (r.correct) actual.correctos++;
    porDia.set(dia, actual);
  }

  let mejor: number | null = null;
  for (const { total, correctos } of porDia.values()) {
    if (total < 5) continue; // evita que un solo intento cuente como "100%"
    const precision = correctos / total;
    if (mejor === null || precision > mejor) mejor = precision;
  }
  return mejor;
}
