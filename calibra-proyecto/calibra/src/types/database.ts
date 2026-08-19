// Tipos que reflejan el esquema de supabase/migrations/*.sql.
// Cuando el esquema crezca, lo ideal es generar esto automáticamente con:
//   supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.ts

// Las cuatro operaciones que cubre el motor de /practica (OperationPicker,
// SprintRunner, el diagnóstico). Fracciones (Fase OO) reutiliza el mismo
// shape de skill_levels/attempts pero deliberadamente NO es parte de este
// tipo — tiene su propio motor en /practica/fracciones — así que no se
// deriva por Exclude<> de un tipo más ancho, para que agregar "fracciones"
// a ProblemType no la cuele acá sin querer.
export type ArithmeticProblemType = "suma" | "resta" | "multiplicacion" | "division";
export type ProblemType =
  | ArithmeticProblemType
  | "logica"
  | "fracciones"
  | "geografia"
  | "decimales"
  | "potencias"
  | "algebra";
export type Plan = "free" | "pro" | "colegio";

export const ARITHMETIC_PROBLEM_TYPES: ArithmeticProblemType[] = [
  "suma",
  "resta",
  "multiplicacion",
  "division",
];

// Los "mundos" de Prodigia (Fase V): cada uno es una materia con su
// propia home, diagnóstico y catálogo. Puntos/racha/Experiencia son de
// cuenta, compartidos entre todos.
export type Mundo = "numeria" | "enigmia";

export type ColorDial = "violeta" | "esmeralda" | "coral" | "dorado";

export const COLOR_DIAL_HEX: Record<ColorDial, string> = {
  violeta: "#6C4CF1",
  esmeralda: "#0E9F6E",
  coral: "#FF8A3D",
  dorado: "#FFC53D",
};

export interface Profile {
  id: string;
  display_name: string | null;
  nivel_actual: number; // 1-10
  streak_dias: number;
  ultima_practica: string | null; // date ISO
  plan: Plan;
  puntos_total: number; // permanente — alimenta logros y la tienda, no se resetea nunca
  meta_xp_diaria: number;
  onboarding_completado: boolean; // diagnóstico de Numeria hecho/salteado
  onboarding_enigmia_completado: boolean; // diagnóstico de Enigmia hecho/salteado
  interes_inicial: ArithmeticProblemType | "logica" | null; // capa Prodigia del onboarding
  escudos_extra_pendientes: number;
  congelamientos_disponibles: number;
  boost_multiplicador_pendiente: number; // 1 = sin boost activo, ej. 1.5 = próxima partida con +50% Puntos
  color_dial: ColorDial;
  colores_dial_desbloqueados: ColorDial[];
  elo_rating: number;
  created_at: string;
  avatar_url: string | null; // Fase P3, Supabase Storage (bucket "avatares")
}

// Fase Q3: lo que puede ver cualquiera del perfil de OTRO usuario —
// nunca el objeto Profile completo (que trae saldo de tienda, apuestas
// activas, etc.). Viene de la RPC security definer
// obtener_perfil_publico, no de un select directo (profiles solo
// permite leer la fila propia por RLS).
export interface PerfilPublico {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  marco_perfil: string;
  color_dial: ColorDial;
  elo_rating: number;
  puntos_total: number;
  created_at: string;
  titulo_nombre: string | null;
}

export type MotivoReporte = "trampa" | "imagen_inapropiada" | "nombre_inapropiado" | "otro";

export interface Attempt {
  id: number;
  user_id: string;
  problem_type: ProblemType;
  level: number; // 1-10
  correct: boolean;
  time_ms: number;
  xp: number; // calculado server-side en /api/attempts
  created_at: string;
}

// Payload que manda el cliente al crear un intento (el resto lo pone la DB
// o lo calcula el servidor, como xp).
export type NewAttempt = Omit<Attempt, "id" | "user_id" | "created_at" | "xp">;

export interface SkillLevel {
  user_id: string;
  problem_type: ArithmeticProblemType;
  nivel: number; // 1-10
  racha_actual: number;
  updated_at: string;
}

export interface DailyProgress {
  user_id: string;
  fecha: string; // date ISO
  xp_ganado: number;
  meta_alcanzada: boolean;
  congelado: boolean;
}

export interface Technique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[] };
  orden: number;
  problem_type: ArithmeticProblemType;
}

export interface TechniqueProgress {
  user_id: string;
  technique_id: string;
  dominado: boolean;
  intentos: number;
  updated_at: string;
}

export type ModifierSlug = "numeros_grandes" | "negativos" | "inverso";

export interface Modifier {
  id: string;
  problem_type: ArithmeticProblemType;
  slug: ModifierSlug;
  nombre: string;
  descripcion: string | null;
}

export interface UnlockedModifier {
  user_id: string;
  modifier_id: string;
  unlocked_at: string;
}

export const MODIFIER_NOMBRES: Record<ModifierSlug, string> = {
  numeros_grandes: "Números grandes",
  negativos: "Negativos",
  inverso: "Inverso",
};

export type CategoriaLogro = "racha" | "volumen" | "precision" | "dominio" | "duelos" | "enigmia";

export interface Achievement {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaLogro;
  criterio: { tipo: string; valor: number };
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  desbloqueado_at: string;
}

export type EstadoAmistad = "pendiente" | "aceptada";

export interface Friendship {
  user_id: string;
  friend_id: string;
  estado: EstadoAmistad;
  creado_at: string;
}

export type EstadoDuelo = "pendiente" | "en_curso" | "completado";

export interface Duel {
  id: string;
  retador_id: string;
  retado_id: string;
  semilla_problemas: number;
  operation_type: ArithmeticProblemType | null;
  estado: EstadoDuelo;
  creado_at: string;
  mundo: MundoDuelo;
  sub_tipo: string | null; // continente (geografía) o categoría (enigmia) — null en numeria
  modo: ModoDuelo;
  serie_id: string | null;
  ronda_numero: number;
  ronda_total: number;
}

export interface DuelResult {
  duel_id: string;
  user_id: string;
  precision: number;
  tiempo_promedio: number;
  puntaje_final: number;
}

// ---------- Rankeds: rangos (Fase 1 de la tanda de Rankeds) ----------
// Reemplaza el TIERS_ELO/tierDeElo viejo (4 tiers, sin color) — ahora 6
// rangos con umbral y color propios. Prodigio (el tope) no tiene un
// colorHex sólido representativo: lleva `degradado` (violeta→ámbar, los
// colores del logo) para que el tratamiento visual se sienta distinto
// al resto, no "un color más de la lista".
export interface RangoElo {
  slug: string;
  nombre: string;
  min: number;
  colorHex: string;
  degradado?: [string, string];
}

export const RANGOS_ELO: RangoElo[] = [
  { slug: "bronce", nombre: "Bronce", min: 0, colorHex: "#B08D57" },
  { slug: "plata", nombre: "Plata", min: 900, colorHex: "#B8C4D9" },
  { slug: "oro", nombre: "Oro", min: 1100, colorHex: "#E8B34D" },
  { slug: "platino", nombre: "Platino", min: 1300, colorHex: "#5FBFA8" },
  { slug: "diamante", nombre: "Diamante", min: 1500, colorHex: "#5DC8F5" },
  { slug: "prodigio", nombre: "Prodigio", min: 1700, colorHex: "#FFC53D", degradado: ["#A794FF", "#FFC53D"] },
];

export function rangoDeElo(elo: number): RangoElo {
  return [...RANGOS_ELO].reverse().find((r) => elo >= r.min) ?? RANGOS_ELO[0];
}

export function rangoDeSlug(slug: string): RangoElo | undefined {
  return RANGOS_ELO.find((r) => r.slug === slug);
}

// ---------- Rankeds: títulos (Fase 2) ----------
// Esquema pensado para más de un origen a futuro (hoy el único origen
// real es "rango", pero `origen` queda como texto libre desde el
// arranque para no migrar el esquema el día que se sumen títulos de
// logros u otro lado).
export interface TituloUsuario {
  slug: string;
  nombre: string;
  origen: string;
  desbloqueado_at: string;
}

// ---------- Rankeds: duelos multi-mundo (Fases 3-5) ----------
export type MundoDuelo = "numeria" | "geografia" | "enigmia";
export type ModoDuelo = "simple" | "mejor_de_3";

// ---------- Enigmia (Fase X): mundo de lógica ----------

export type TipoAcertijo = "secuencia" | "patron" | "deduccion" | "memoria" | "programacion";

export type CategoriaEnigmia = "memoria" | "patrones" | "deduccion" | "computacional";

export const CATEGORIA_DE_TIPO: Record<TipoAcertijo, CategoriaEnigmia> = {
  secuencia: "patrones",
  patron: "patrones",
  deduccion: "deduccion",
  memoria: "memoria",
  programacion: "computacional",
};

export const NOMBRE_CATEGORIA_ENIGMIA: Record<CategoriaEnigmia, string> = {
  memoria: "Memoria",
  patrones: "Patrones",
  deduccion: "Acertijos de deducción",
  computacional: "Pensamiento computacional",
};

export interface LogicPuzzle {
  id: string;
  tipo: TipoAcertijo;
  dificultad: number; // 1-10
  // `secuencia`: solo la usan los acertijos de Memoria (Fase W2) — la
  // lista a memorizar, mostrada y ocultada ANTES de revelar `enunciado`
  // + `opciones`, nunca al mismo tiempo que la respuesta.
  contenido: { enunciado: string; opciones: string[]; secuencia?: string[] };
  respuesta: string;
}

export interface LogicSkillLevel {
  user_id: string;
  nivel: number; // 1-10, calibración única (no por tipo de acertijo)
  racha_actual: number;
  updated_at: string;
}

export interface LogicAttempt {
  id: number;
  user_id: string;
  puzzle_id: string;
  correct: boolean;
  time_ms: number;
  xp: number;
  created_at: string;
}

export interface LogicTechnique {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  contenido: { pasos: string[]; ejemplo: { enunciado: string; opciones: string[]; respuesta: string } };
  orden: number;
  categoria: CategoriaEnigmia;
}

export interface LogicTechniqueProgress {
  user_id: string;
  technique_id: string;
  dominado: boolean;
  intentos: number;
  updated_at: string;
}
