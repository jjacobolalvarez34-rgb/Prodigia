// Constelaciones (0259, aprobadas el 2026-10-07; docs/PLAN_PRIMERA_VEZ_APP.md §5).
// Cada ciudad tiene en su cielo una constelación de 7 estrellas con la forma de su
// glifo. Las reglas (cuántas estrellas da una partida, premio, noche, estrella
// fugaz, Gran Alineación) viven en la base; acá están la forma de cada una, las
// constantes que se muestran y las llamadas. Lo usan la web y la app.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

export const ESTRELLAS_POR_CONSTELACION = 7;
// Probabilidad de estrella fugaz al completar una (random() < 0.2 en _completar_constelacion).
export const PROBABILIDAD_FUGAZ = 0.2;
export const TEXTO_FUGAZ = "1 de cada 5 constelaciones trae una estrella fugaz con un premio extra.";
export const CHISPAS_BASE = 300;
export const BONUS_NOCHE = 0.2;

// Cómo se encienden (lo mismo que hace la base, para explicarlo en pantalla).
export const COMO_SE_ENCIENDEN = [
  "Cada partida enciende 1 estrella en la ciudad donde jugaste (+1 si aciertas el 80 % o más).",
  "Subir de nivel, la racha de 7 días, las 3 misiones del día y la liga encienden estrellas en tu ciudad favorita.",
  "Al llegar a 7, la constelación se dibuja en el cielo y te da su premio.",
  "Si en esa ciudad es de noche, el premio sube un 20 %. En la Gran Alineación, el doble.",
];

// Puntos en una caja de 100 × 100 y las líneas que los unen al completarse.
export interface FormaConstelacion {
  puntos: [number, number][];
  lineas: [number, number][];
}

export const FORMAS_CONSTELACION: Record<string, FormaConstelacion> = {
  // ÷
  numeria: { puntos: [[50, 18], [14, 50], [32, 50], [50, 50], [68, 50], [86, 50], [50, 82]], lineas: [[1, 2], [2, 3], [3, 4], [4, 5]] },
  // ?
  enigmia: { puntos: [[30, 32], [38, 16], [58, 12], [72, 26], [64, 44], [50, 58], [50, 86]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // ◎
  geografia: { puntos: [[86, 50], [68, 81], [32, 81], [14, 50], [32, 19], [68, 19], [50, 50]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
  // ⚛
  quimia: { puntos: [[50, 50], [14, 36], [86, 64], [14, 64], [86, 36], [50, 12], [50, 88]], lineas: [[1, 0], [0, 2], [3, 0], [0, 4], [5, 0], [0, 6]] },
  // ♥
  anatomia: { puntos: [[50, 86], [22, 58], [14, 34], [30, 18], [50, 32], [70, 18], [86, 34]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]] },
  // ♪
  melodia: { puntos: [[60, 14], [60, 38], [60, 64], [48, 84], [32, 78], [78, 24], [84, 42]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6]] },
  // θ
  trigonometria: { puntos: [[50, 12], [78, 32], [78, 68], [50, 88], [22, 68], [22, 32], [50, 50]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]] },
  // ⌛
  historia: { puntos: [[22, 14], [78, 14], [64, 32], [50, 50], [36, 68], [22, 86], [78, 86]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3], [3, 0]] },
  // ∫
  calculia: { puntos: [[70, 12], [58, 14], [52, 30], [50, 50], [48, 70], [42, 86], [30, 88]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
  // Ω
  circuitia: { puntos: [[16, 86], [32, 70], [24, 40], [50, 16], [76, 40], [68, 70], [84, 86]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
  // σ
  estadistica: { puntos: [[86, 26], [56, 26], [30, 36], [24, 62], [42, 82], [66, 74], [70, 46]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]] },
  // ♠
  naipia: { puntos: [[50, 12], [22, 44], [26, 66], [50, 62], [74, 66], [78, 44], [50, 88]], lineas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6]] },
  // </>
  codia: { puntos: [[30, 28], [12, 50], [30, 72], [58, 18], [42, 82], [70, 28], [88, 50]], lineas: [[0, 1], [1, 2], [3, 4], [5, 6]] },
};

// Polvo de estrellas de fondo del cielo de cada ciudad: siempre el mismo para la misma ciudad.
export function polvoDeEstrellas(mundo: string, cantidad = 22): [number, number, number][] {
  let s = [...mundo].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0;
  const azar = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: cantidad }, () => [azar() * 100, azar() * 100, 0.3 + azar() * 0.6]);
}

export interface Constelacion {
  mundo: string;
  estrellas: number;
  completadas: number;
  de_noche: boolean;
  alineacion: boolean;
  chispas_premio: number;
  falta_pieza: boolean;
  favorita: boolean;
}

export interface PremioConstelacion {
  chispas: number;
  pieza: { slug: string; nombre: string; rareza: string } | null;
  fugaz: { premio: "hielo" | "tiempo_extra" | "pista" | "chispas"; cantidad: number } | null;
}

export interface ConstelacionCompletada {
  id: string;
  mundo: string;
  numero: number;
  premio: PremioConstelacion;
  de_noche: boolean;
  alineacion: boolean;
}

export const NOMBRE_FUGAZ: Record<string, string> = {
  hielo: "1 hielo",
  tiempo_extra: "+3 segundos",
  pista: "1 pista",
  chispas: "200 Chispas",
};

function filas<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

// Si la base todavía no tiene 0259, todo devuelve vacío (la pantalla no muestra la sección).
export async function misConstelaciones(sb: SupabaseClient): Promise<Constelacion[]> {
  const { data, error } = await sb.rpc("mis_constelaciones");
  return error ? [] : filas<Constelacion>(data);
}

export async function constelacionesPorVer(sb: SupabaseClient): Promise<ConstelacionCompletada[]> {
  const { data, error } = await sb.rpc("constelaciones_por_ver");
  return error ? [] : filas<ConstelacionCompletada>(data);
}

export async function marcarConstelacionesVistas(sb: SupabaseClient): Promise<void> {
  await sb.rpc("marcar_constelaciones_vistas");
}

export function textoPremioConstelacion(c: Pick<Constelacion, "chispas_premio" | "falta_pieza">, nombreCiudad: string): string {
  return c.falta_pieza ? `${c.chispas_premio} Chispas y una pieza de la colección de ${nombreCiudad}` : `${c.chispas_premio} Chispas`;
}
