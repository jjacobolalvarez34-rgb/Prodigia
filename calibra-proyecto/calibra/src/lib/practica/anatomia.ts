// Banco de datos de Anatomía — Fase 5 ("Anatomía", contenido
// verificado, usado tal cual, sin inventar términos nuevos). Como acá
// solo hay NOMBRES verificados (no una segunda propiedad independiente
// por término, a diferencia de Quimia con símbolo↔nombre), el formato
// de pregunta es de clasificación: "¿cuál de estas opciones es [X]?",
// nunca un dato inventado — mismo criterio de honestidad de contenido
// que el resto de la app.

export type ModoAnatomia = "oseo" | "muscular" | "organos" | "nervioso";

export const NOMBRE_MODO_ANATOMIA: Record<ModoAnatomia, string> = {
  oseo: "Sistema óseo",
  muscular: "Sistema muscular",
  organos: "Órganos",
  nervioso: "Sistema nervioso",
};

const OSEO_BAJO = ["Fémur", "Húmero", "Tibia", "Peroné", "Radio", "Cúbito", "Costillas", "Columna vertebral", "Cráneo", "Pelvis"];
const OSEO_ALTO = ["Frontal", "Parietal", "Temporal", "Occipital", "Esfenoides", "Etmoides", "Maxilar", "Mandíbula", "Cigomático", "Nasal"];

const MUSCULAR_BAJO = ["Bíceps", "Tríceps", "Cuádriceps", "Deltoides", "Glúteos", "Recto abdominal", "Pectoral mayor", "Trapecio", "Gastrocnemio", "Dorsal ancho"];
const MUSCULAR_ALTO = ["Frontal", "Orbicular de los ojos", "Orbicular de la boca", "Masetero", "Temporal", "Buccinador", "Cigomático mayor", "Occipital", "Platisma"];

const ORGANOS = ["Corazón", "Pulmones", "Hígado", "Riñones", "Estómago", "Cerebro", "Intestino", "Páncreas", "Vejiga", "Bazo"];

const NERVIOSO_BAJO = ["Cerebro", "Cerebelo", "Médula espinal", "Nervio periférico"];
const NERVIOSO_ALTO = [
  "Olfatorio", "Óptico", "Oculomotor", "Troclear", "Trigémino", "Abducens",
  "Facial", "Vestibulococlear", "Glosofaríngeo", "Vago", "Accesorio", "Hipogloso",
];

// Etiquetas de categoría para el enunciado — genérica en nivel bajo,
// específica (el escalón difícil real) en nivel alto.
const ETIQUETA_BAJO: Record<ModoAnatomia, string> = {
  oseo: "un hueso",
  muscular: "un músculo",
  organos: "un órgano",
  nervioso: "parte del sistema nervioso",
};
const ETIQUETA_ALTO: Record<Exclude<ModoAnatomia, "organos">, string> = {
  oseo: "un hueso del cráneo",
  muscular: "un músculo de la cara",
  nervioso: "un par craneal",
};

export interface PreguntaAnatomia {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string;
}

export type Rng = () => number;

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

function elegir<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function opcionesConDistractores(correcta: string, resto: string[], rng: Rng, cantidad = 4): string[] {
  const distractores = Array.from(new Set(resto.filter((x) => x !== correcta)));
  const elegidos: string[] = [];
  const disponibles = [...distractores];
  while (elegidos.length < cantidad - 1 && disponibles.length > 0) {
    const idx = Math.floor(rng() * disponibles.length);
    elegidos.push(disponibles.splice(idx, 1)[0]);
  }
  const opciones = [correcta, ...elegidos];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

// Pool "de otros sistemas" para armar distractores — bajo (fácil de
// descartar a simple vista) o alto (términos poco comunes, cuesta más
// distinguirlos del correcto).
function poolOtrosSistemas(modo: ModoAnatomia, dificil: boolean): string[] {
  const todos: { modo: ModoAnatomia; bajo: string[]; alto: string[] }[] = [
    { modo: "oseo", bajo: OSEO_BAJO, alto: OSEO_ALTO },
    { modo: "muscular", bajo: MUSCULAR_BAJO, alto: MUSCULAR_ALTO },
    { modo: "organos", bajo: ORGANOS, alto: ORGANOS },
    { modo: "nervioso", bajo: NERVIOSO_BAJO, alto: NERVIOSO_ALTO },
  ];
  return todos
    .filter((t) => t.modo !== modo)
    .flatMap((t) => (dificil ? t.alto : t.bajo));
}

export function generarPreguntaAnatomia(modo: ModoAnatomia, nivel: number, usados: Set<string>, rng: Rng = Math.random): PreguntaAnatomia {
  const band = banda(nivel);
  const esAlto = band >= 3 && modo !== "organos";

  let pool: string[];
  let etiqueta: string;
  if (modo === "organos") {
    pool = ORGANOS;
    etiqueta = ETIQUETA_BAJO.organos;
  } else if (esAlto) {
    pool = modo === "oseo" ? OSEO_ALTO : modo === "muscular" ? MUSCULAR_ALTO : NERVIOSO_ALTO;
    etiqueta = ETIQUETA_ALTO[modo];
  } else {
    pool = modo === "oseo" ? OSEO_BAJO : modo === "muscular" ? MUSCULAR_BAJO : NERVIOSO_BAJO;
    etiqueta = ETIQUETA_BAJO[modo];
  }

  const disponibles = pool.filter((x) => !usados.has(x));
  const correcta = elegir(disponibles.length > 0 ? disponibles : pool, rng);

  const distractoresPool = poolOtrosSistemas(modo, band >= 2);
  const opciones = opcionesConDistractores(correcta, distractoresPool, rng);

  return {
    enunciado: `¿Cuál de estas opciones es ${etiqueta}?`,
    opciones,
    respuesta: correcta,
    clave: correcta,
  };
}
