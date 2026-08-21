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
  | "algebra"
  | "quimia"
  | "quimia_simbolos"
  | "quimia_formulas"
  | "quimia_tabla"
  | "quimia_nomenclatura"
  | "quimia_organica";
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

// Fase 5 (mercado): "color del dial" se retiró de la tienda — no
// generaba sensación de diferencia real jugando de verdad — pero el
// tipo se mantiene porque el dial de nivel de /practica y /practica/
// fracciones todavía lee y aplica el color_dial YA comprado por quien
// lo tenía antes de este cambio (nadie pierde un cosmético que ya
// pagó); solo se sacó la vidriera para comprar uno nuevo.
export type ColorDial = "violeta" | "esmeralda" | "coral" | "dorado";

export const COLOR_DIAL_HEX: Record<ColorDial, string> = {
  violeta: "#6C4CF1",
  esmeralda: "#0E9F6E",
  coral: "#FF8A3D",
  dorado: "#FFC53D",
};

// Fase 5 (mercado): tipografías comprables para el nombre de usuario —
// el cosmético nuevo que reemplaza al dial en la vidriera de la tienda.
// "default" = tipografía normal de la UI.
export type FuenteNombre = "default" | "mono" | "serif" | "manuscrita" | "impacto" | "script" | "futurista";

export const FUENTE_NOMBRE_CLASS: Record<FuenteNombre, string> = {
  default: "",
  mono: "font-mono",
  serif: "font-[family-name:var(--font-playfair)]",
  manuscrita: "font-[family-name:var(--font-caveat)]",
  // Fase 8: 3 fuentes nuevas de la tienda — mismo criterio que las de
  // arriba, todas Google Fonts vía next/font/google (layout.tsx).
  impacto: "font-[family-name:var(--font-bebas-neue)]",
  script: "font-[family-name:var(--font-pacifico)]",
  futurista: "font-[family-name:var(--font-orbitron)]",
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
  onboarding_quimia_completado: boolean; // diagnóstico de Quimia hecho/salteado
  interes_inicial: ArithmeticProblemType | "logica" | null; // capa Prodigia del onboarding
  escudos_extra_pendientes: number;
  congelamientos_disponibles: number;
  boost_multiplicador_pendiente: number; // 1 = sin boost activo, ej. 1.5 = próxima partida con +50% Puntos
  fuente_nombre: FuenteNombre;
  fuentes_desbloqueadas: FuenteNombre[];
  ocultar_doble_o_nada: boolean;
  elo_rating: number;
  created_at: string;
  avatar_url: string | null; // Fase P3, Supabase Storage (bucket "avatares")
  es_admin: boolean; // Fase 12: acceso a /admin/anuncios — se otorga a mano por email, ver 0065_anuncios.sql
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
  fuente_nombre: FuenteNombre;
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

// Fase 7 (mercado): "Marco de perfil" pasó de 2 opciones fijas
// (plata/oro con hex propio) a los 6 rangos reales de Rankeds — mismos
// slugs y mismo hex que RANGOS_ELO arriba, para no inventar una paleta
// nueva. Clases Tailwind literales (no generadas por interpolación:
// las arbitrary values necesitan aparecer tal cual en el código fuente
// para que el JIT las genere) — si RANGOS_ELO cambia de color algún
// día, hay que actualizar esto a mano también.
export const ESTILO_MARCO_PERFIL: Record<string, string> = {
  ninguno: "border-border",
  bronce: "border-[#B08D57] shadow-[0_0_0_3px_rgba(176,141,87,0.25)]",
  plata: "border-[#B8C4D9] shadow-[0_0_0_3px_rgba(184,196,217,0.25)]",
  oro: "border-[#E8B34D] shadow-[0_0_0_3px_rgba(232,179,77,0.25)]",
  platino: "border-[#5FBFA8] shadow-[0_0_0_3px_rgba(95,191,168,0.25)]",
  diamante: "border-[#5DC8F5] shadow-[0_0_0_3px_rgba(93,200,245,0.25)]",
  prodigio: "border-[#FFC53D] shadow-[0_0_0_3px_rgba(255,197,61,0.35)]",
};

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
