// Ciclo de día y noche de las 15 ciudades (pedido del usuario, 2026-10-06): cada
// ciudad tiene su propio largo de día, así que en cada momento unas están de día y
// otras de noche, y el sol de cada una va a su ritmo. Los largos son divisores de
// 672 horas (28 días): por eso, cada 28 días exactos, las 15 ciudades amanecen a la
// vez. Ese instante es «La Gran Alineación», un evento especial.
//
// Todo es una cuenta pura sobre el reloj (sin servidor): cualquier teléfono y la web
// ven la misma hora del día en la misma ciudad.

export const CICLO_TOTAL_HORAS = 672;

// Horas que dura un día completo (amanecer → amanecer) en cada ciudad. Todos son
// divisores de 672 y distintos entre sí, del más rápido (Dinamia, 8 h) al más lento
// (Vitalia, 168 h: una semana, al ritmo lento de la vida).
export const HORAS_DIA_CIUDAD: Record<string, number> = {
  dinamia: 8,
  codia: 12,
  circuitia: 14,
  numeria: 16,
  enigmia: 21,
  geografia: 24,
  trigonometria: 28,
  calculia: 32,
  estadistica: 42,
  quimia: 48,
  melodia: 56,
  naipia: 84,
  anatomia: 96,
  historia: 112,
  vitalia: 168,
};

// Primera alineación: sábado 24 de octubre de 2026, 18:00 en Colombia (23:00 UTC).
// Desde ahí se repite cada 28 días.
export const PRIMERA_ALINEACION_MS = Date.UTC(2026, 9, 24, 23, 0, 0);
const HORA_MS = 3_600_000;
export const CICLO_TOTAL_MS = CICLO_TOTAL_HORAS * HORA_MS;
// Cuánto dura el evento visible (las ciudades quedan casi juntas un buen rato).
export const DURACION_EVENTO_MS = 3 * HORA_MS;

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

// Fase del día en [0, 1): 0 amanecer, 0,25 mediodía, 0,5 atardecer, 0,75 medianoche.
export function faseDelDia(slug: string, ahoraMs: number): number {
  const horas = HORAS_DIA_CIUDAD[slug] ?? 24;
  return mod(ahoraMs - PRIMERA_ALINEACION_MS, horas * HORA_MS) / (horas * HORA_MS);
}

export function proximaAlineacion(ahoraMs: number): number {
  const desde = ahoraMs - PRIMERA_ALINEACION_MS;
  if (desde < 0) return PRIMERA_ALINEACION_MS;
  return PRIMERA_ALINEACION_MS + Math.ceil(desde / CICLO_TOTAL_MS) * CICLO_TOTAL_MS;
}

// La alineación en curso (si estamos dentro de las 3 horas del evento), o null.
export function alineacionEnCurso(ahoraMs: number): { inicio: number; fin: number } | null {
  if (ahoraMs < PRIMERA_ALINEACION_MS) return null;
  const inicio = PRIMERA_ALINEACION_MS + Math.floor((ahoraMs - PRIMERA_ALINEACION_MS) / CICLO_TOTAL_MS) * CICLO_TOTAL_MS;
  return ahoraMs < inicio + DURACION_EVENTO_MS ? { inicio, fin: inicio + DURACION_EVENTO_MS } : null;
}

// De noche en esa ciudad: del anochecer (0,55) a la madrugada (0,95). Mismo corte
// que ciudad_de_noche() de la base (0259): ahí las constelaciones dan +20 %.
export function esDeNoche(slug: string, ahoraMs: number): boolean {
  const f = faseDelDia(slug, ahoraMs);
  return f >= 0.55 && f < 0.95;
}

// ---------- Colores del cielo según la hora ----------

interface Clave {
  f: number;
  arriba: string;
  abajo: string;
  // 0 = pleno día, 1 = noche cerrada (ventanas encendidas, estrellas, luna).
  noche: number;
}

// Amanecer, mañana, mediodía, tarde, atardecer, anochecer, medianoche, madrugada.
const CLAVES: Clave[] = [
  { f: 0, arriba: "#3A3F7A", abajo: "#F28C5B", noche: 0.45 },
  { f: 0.08, arriba: "#4F8FD6", abajo: "#A9D4F5", noche: 0.1 },
  { f: 0.25, arriba: "#2F7FD8", abajo: "#9ED0FF", noche: 0 },
  { f: 0.42, arriba: "#3D7AC4", abajo: "#F5C58A", noche: 0.1 },
  { f: 0.5, arriba: "#3A2E6E", abajo: "#F06A4E", noche: 0.45 },
  { f: 0.58, arriba: "#1A1A40", abajo: "#5B3A6E", noche: 0.8 },
  { f: 0.75, arriba: "#0C1024", abajo: "#070913", noche: 1 },
  { f: 0.92, arriba: "#121838", abajo: "#2A2550", noche: 0.9 },
  { f: 1, arriba: "#3A3F7A", abajo: "#F28C5B", noche: 0.45 },
];

function mezclarHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const canal = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (canal(16) << 16) | (canal(8) << 8) | canal(0)).toString(16).slice(1)}`;
}

export interface EstadoCielo {
  fase: number;
  arriba: string;
  abajo: string;
  noche: number;
  // Sol (de día) o luna (de noche): posición relativa (0..1) sobre el arco del cielo.
  sol: { x: number; y: number } | null;
  luna: { x: number; y: number } | null;
}

function arco(t: number): { x: number; y: number } {
  return { x: 0.08 + 0.84 * t, y: 0.78 - 0.62 * Math.sin(Math.PI * t) };
}

export function estadoCielo(fase: number): EstadoCielo {
  const f = mod(fase, 1);
  let i = 0;
  while (i < CLAVES.length - 2 && CLAVES[i + 1].f <= f) i++;
  const a = CLAVES[i];
  const b = CLAVES[i + 1];
  const t = (f - a.f) / (b.f - a.f);
  return {
    fase: f,
    arriba: mezclarHex(a.arriba, b.arriba, t),
    abajo: mezclarHex(a.abajo, b.abajo, t),
    noche: a.noche + (b.noche - a.noche) * t,
    sol: f < 0.5 ? arco(f / 0.5) : null,
    luna: f >= 0.5 ? arco((f - 0.5) / 0.5) : null,
  };
}
