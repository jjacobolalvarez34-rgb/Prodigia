// Estadísticas Pro nuevas (0293, diseño aprobado el 2026-10-19; galería
// «estadisticas-pro»). Un llamado trae todo el panel; acá están los tipos y las frases
// de análisis, iguales en la web y la app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

export interface EstadisticasPro {
  indice: number;
  indice_antes: number;
  top_pct: number | null;
  precision: number | null;
  tiempo_ms: number | null;
  dias_7: number;
  dias: { fecha: string; intentos: number }[];
  horas: { hora: number; intentos: number; correctos: number }[];
  semanas: { semana: string; intentos: number; correctos: number }[];
  mundos: { mundo: string; intentos: number; correctos: number; tiempo_ms: number; mas_lentos_pct: number }[];
  debiles: { mundo: string; tipo: string; intentos: number; correctos: number }[];
  records: { mas_rapida_ms: number | null; mejor_dia: { fecha: string; precision: number } | null; elo: number | null };
}

export async function estadisticasPro(sb: SupabaseClient): Promise<EstadisticasPro | null> {
  const { data, error } = await sb.rpc("estadisticas_pro_v2", { p_tz_min: -new Date().getTimezoneOffset() });
  if (error || !data) return null;
  return data as EstadisticasPro;
}

const pct = (c: number, n: number) => (n > 0 ? Math.round((c / n) * 100) : 0);

// Las últimas 84 casillas (de la más vieja a hoy) con los intentos de cada día.
export function constancia(e: EstadisticasPro, hoy = new Date()): number[] {
  const porFecha = new Map(e.dias.map((d) => [d.fecha, d.intentos]));
  const out: number[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push(porFecha.get(iso) ?? 0);
  }
  return out;
}

export function textoConstancia(e: EstadisticasPro): string {
  const jugados = constancia(e).filter((n) => n > 0).length;
  return `Jugaste ${jugados} de los últimos 84 días.`;
}

// La hora con mejor precisión (con al menos 20 intentos) y cuánto mejor que la peor.
export function mejorHora(e: EstadisticasPro): { hora: number; precision: number; frase: string } | null {
  const validas = e.horas.filter((h) => h.intentos >= 20);
  if (validas.length < 2) return null;
  const mejor = validas.reduce((a, h) => (pct(h.correctos, h.intentos) > pct(a.correctos, a.intentos) ? h : a));
  const peor = validas.reduce((a, h) => (pct(h.correctos, h.intentos) < pct(a.correctos, a.intentos) ? h : a));
  const pm = pct(mejor.correctos, mejor.intentos);
  const diferencia = pm - pct(peor.correctos, peor.intentos);
  const hora = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "a. m." : "p. m."}`;
  return {
    hora: mejor.hora,
    precision: pm,
    frase: diferencia >= 5 ? `A las ${hora(mejor.hora)} aciertas ${diferencia} puntos más que a las ${hora(peor.hora)}. Juega tus Rankeds a esa hora.` : `Tu precisión es pareja a cualquier hora: ${pm} % en tu mejor momento.`,
  };
}

export function tendencia(e: EstadisticasPro): { valores: number[]; frase: string } {
  const valores = e.semanas.filter((s) => s.intentos >= 10).map((s) => pct(s.correctos, s.intentos));
  if (valores.length < 2) return { valores, frase: "Juega unas semanas más y aquí verás cómo mejoras." };
  const delta = valores[valores.length - 1] - valores[0];
  return {
    valores,
    frase: delta > 0 ? `Subiste ${delta} puntos de precisión en ${valores.length} semanas.` : delta < 0 ? `Bajaste ${-delta} puntos en ${valores.length} semanas: repasa los temas de abajo.` : `Te mantienes estable en ${valores[valores.length - 1]} %.`,
  };
}

export const precisionDe = pct;
