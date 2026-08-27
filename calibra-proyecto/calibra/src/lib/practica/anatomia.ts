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
// Nivel alto (7-10): huesos del cráneo (sin zona de click propia — el
// cráneo es un único grupo en el SVG, sin sub-huesos separados) más
// mano y pie (2026-08-23: el SVG fuente SÍ los trae separados por
// hueso, izquierda y derecha, sin usar hasta ahora — ver comentario en
// esqueleto-oseo.svg). Mezclados a propósito en el mismo pool: los de
// mano/pie salen como pregunta de click, los del cráneo como opción
// múltiple — la decisión es por término elegido, no por nivel entero
// (ver generarPreguntaAnatomia).
const OSEO_ALTO = [
  "Frontal", "Parietal", "Temporal", "Occipital", "Esfenoides", "Etmoides", "Maxilar", "Mandíbula", "Cigomático", "Nasal",
  "Carpianos", "Metacarpianos", "Falanges de la mano", "Tarsianos", "Metatarsianos", "Falanges del pie",
];

const MUSCULAR_BAJO = ["Bíceps", "Tríceps", "Cuádriceps", "Deltoides", "Glúteos", "Recto abdominal", "Pectoral mayor", "Trapecio", "Gastrocnemio", "Dorsal ancho"];
// Fase 5: región del cuerpo de cada término de MUSCULAR_BAJO — decide
// qué lámina de public/anatomia/musculos/ mostrar (ver PreguntaAnatomiaOpcion.diagramaId).
const REGION_MUSCULAR: Partial<Record<string, "brazo" | "pierna" | "torso">> = {
  Bíceps: "brazo", Tríceps: "brazo", Deltoides: "brazo", "Pectoral mayor": "brazo",
  Cuádriceps: "pierna", Glúteos: "pierna", Gastrocnemio: "pierna",
  "Recto abdominal": "torso", Trapecio: "torso", "Dorsal ancho": "torso",
};
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

export interface PreguntaAnatomiaOpcion {
  tipo: "opcion";
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string;
  // Fase 5 (2026-08-25): no existe un diagrama muscular de cuerpo
  // completo con licencia libre (buscado y descartado, ver
  // docs/PROGRESO.md) — en vez de eso, láminas REALES de Gray's
  // Anatomy 1918 (dominio público, mismo autor que el esqueleto:
  // Henry Vandyke Carter) por región. Contexto visual de la zona, no
  // un click sobre el músculo exacto — son PNG escaneados, sin
  // regiones vectoriales que tagear (a diferencia del esqueleto SVG).
  diagramaId?: "brazo" | "pierna" | "torso";
}

// Fase 2 ("identificación por ubicación directa"): en vez de elegir el
// nombre entre 4 opciones, se pide clickear la zona correcta sobre
// public/data/esqueleto-oseo.svg. objetivoHueso es el data-hueso real
// del SVG (ver ese archivo) — NO todos los términos de OSEO_BAJO tienen
// uno: "Costillas" se queda en formato de opción múltiple porque el SVG
// fuente no separa la caja torácica en un grupo propio (ver el
// comentario en el propio SVG).
export interface PreguntaAnatomiaClick {
  tipo: "click";
  enunciado: string;
  objetivoHueso: string;
  respuesta: string;
  clave: string;
}

export type PreguntaAnatomia = PreguntaAnatomiaOpcion | PreguntaAnatomiaClick;

// Términos de OSEO_BAJO con una zona real y verificada en
// esqueleto-oseo.svg — construido a partir de los grupos que el propio
// SVG fuente (LadyofHats, dominio público) ya traía separados por
// hueso, no de coordenadas inventadas a mano.
export const HUESO_CLICKEABLE: Partial<Record<string, string>> = {
  Fémur: "femur",
  Húmero: "humero",
  Tibia: "tibia",
  Peroné: "perone",
  Radio: "radio",
  Cúbito: "cubito",
  "Columna vertebral": "columna",
  Cráneo: "craneo",
  Pelvis: "pelvis",
  // Nivel alto (2026-08-23) — ver comentario de OSEO_ALTO arriba.
  Carpianos: "carpianos",
  Metacarpianos: "metacarpianos",
  "Falanges de la mano": "falanges_mano",
  Tarsianos: "tarsianos",
  Metatarsianos: "metatarsianos",
  "Falanges del pie": "falanges_pie",
};

// Inverso de HUESO_CLICKEABLE (data-hueso -> nombre en español) — lo
// usa el Runner para mostrar "clickeaste: X" cuando la respuesta fue
// incorrecta.
export const NOMBRE_POR_HUESO_CLICKEABLE: Record<string, string> = Object.fromEntries(
  Object.entries(HUESO_CLICKEABLE).map(([nombre, hueso]) => [hueso!, nombre])
);

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

// Fase 2 (nivel 3-6) + auditoría "Anatomía a nivel 10" (nivel 7-10): en
// el modo óseo, a partir de nivel 3 la pregunta es de click siempre que
// el término elegido tenga una zona real en esqueleto-oseo.svg
// (HUESO_CLICKEABLE) — la decisión es POR TÉRMINO, no por nivel entero,
// porque nivel alto (band>=3) mezcla huesos con zona real (mano, pie) y
// sin ella (cráneo, sin sub-huesos separados en el SVG). Si el término
// elegido no tiene zona, cae a opción múltiple — nunca se fuerza un
// click sin asset real detrás. Nivel 1-2 (band 0) se queda 100% en
// opción múltiple a propósito (nivel de entrada, más fácil — ver
// pedido original de Fase 2), aunque el término elegido SÍ tenga zona.

export function generarPreguntaAnatomia(modo: ModoAnatomia, nivel: number, usados: Set<string>, rng: Rng = Math.random): PreguntaAnatomia {
  const band = banda(nivel);
  const esAlto = band >= 3 && modo !== "organos";

  if (modo === "oseo") {
    const pool = band < 3 ? OSEO_BAJO : OSEO_ALTO;
    const disponibles = pool.filter((x) => !usados.has(x));
    const correcta = elegir(disponibles.length > 0 ? disponibles : pool, rng);
    const huesoClave = band >= 1 ? HUESO_CLICKEABLE[correcta] : undefined;
    if (huesoClave) {
      return {
        tipo: "click",
        enunciado: `Clickeá dónde está: ${correcta}`,
        objetivoHueso: huesoClave,
        respuesta: correcta,
        clave: correcta,
      };
    }
    // Sin zona real (Costillas en cualquier nivel, huesos del cráneo en
    // 7-10) o nivel 1-2 (opción múltiple siempre) — mismo formato de
    // siempre, no se aproxima ninguna zona de click.
    const etiquetaOseo = band < 3 ? "un hueso" : "un hueso del cráneo, la mano o el pie";
    const distractoresOseo = poolOtrosSistemas(modo, band >= 2);
    const opcionesOseo = opcionesConDistractores(correcta, distractoresOseo, rng);
    return {
      tipo: "opcion",
      enunciado: `¿Cuál de estas opciones es ${etiquetaOseo}?`,
      opciones: opcionesOseo,
      respuesta: correcta,
      clave: correcta,
    };
  }

  let pool: string[];
  let etiqueta: string;
  if (modo === "organos") {
    pool = ORGANOS;
    etiqueta = ETIQUETA_BAJO.organos;
  } else if (esAlto) {
    pool = modo === "muscular" ? MUSCULAR_ALTO : NERVIOSO_ALTO;
    etiqueta = ETIQUETA_ALTO[modo];
  } else {
    pool = modo === "muscular" ? MUSCULAR_BAJO : NERVIOSO_BAJO;
    etiqueta = ETIQUETA_BAJO[modo];
  }

  const disponibles = pool.filter((x) => !usados.has(x));
  const correcta = elegir(disponibles.length > 0 ? disponibles : pool, rng);

  const distractoresPool = poolOtrosSistemas(modo, band >= 2);
  const opciones = opcionesConDistractores(correcta, distractoresPool, rng);

  return {
    tipo: "opcion",
    enunciado: `¿Cuál de estas opciones es ${etiqueta}?`,
    opciones,
    respuesta: correcta,
    clave: correcta,
    diagramaId: modo === "muscular" ? REGION_MUSCULAR[correcta] : undefined,
  };
}
