// Mundo Historia — 4 modos, todos de opción múltiple (mismo patrón que
// geografiaAvanzada.ts: contenido curado a mano, no generado por
// fórmula, porque son hechos reales). Contenido restringido a deuda
// explícita del pedido: solo hechos de consenso histórico amplio,
// nada de historia política del siglo XX-XXI ni de interpretación
// disputada — ver el resumen final para la lista completa de hechos
// usados, pensada para revisión humana antes de darse por buena.

export type ModoHistoria = "cronologia" | "personajes" | "causaefecto" | "fechas";

export const NOMBRE_MODO_HISTORIA: Record<ModoHistoria, string> = {
  cronologia: "Cronología",
  personajes: "Personajes",
  causaefecto: "Causa y efecto",
  fechas: "Fechas exactas",
};

export interface PreguntaHistoria {
  enunciado: string;
  opciones: string[];
  respuesta: string;
  clave: string;
  dificultad: number;
}

export type Rng = () => number;

function elegirAlAzar<T extends { dificultad: number }>(banco: T[], nivel: number, usados: Set<string>, clave: (t: T) => string, rng: Rng): T {
  const candidatos = banco.filter((x) => Math.abs(x.dificultad - nivel) <= 3 && !usados.has(clave(x)));
  const pool = candidatos.length > 0 ? candidatos : banco.filter((x) => !usados.has(clave(x)));
  const poolFinal = pool.length > 0 ? pool : banco;
  return poolFinal[Math.floor(rng() * poolFinal.length)];
}

function opcionesConDistractores(correcta: string, distractores: string[], rng: Rng): string[] {
  const opciones = [correcta, ...distractores];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

// ---------- Modo "personajes": identificar la figura desde 2-3 pistas ----------
interface HechoPersonaje {
  pista: string;
  respuesta: string;
  distractores: [string, string, string];
  dificultad: number;
}

const PERSONAJES: HechoPersonaje[] = [
  { pista: "Filósofo griego que fue maestro de Alejandro Magno.", respuesta: "Aristóteles", distractores: ["Platón", "Sócrates", "Pitágoras"], dificultad: 4 },
  { pista: "Filósofo griego condenado a beber cicuta por las preguntas incómodas que le hacía a la gente.", respuesta: "Sócrates", distractores: ["Aristóteles", "Platón", "Diógenes"], dificultad: 4 },
  { pista: "Emperador romano asesinado por senadores en el 44 a.C.", respuesta: "Julio César", distractores: ["Augusto", "Nerón", "Trajano"], dificultad: 3 },
  { pista: "Pintó la Mona Lisa y diseñó máquinas voladoras siglos antes de que existiera la aviación.", respuesta: "Leonardo da Vinci", distractores: ["Miguel Ángel", "Rafael", "Donatello"], dificultad: 3 },
  { pista: "Pintó el techo de la Capilla Sixtina, en el Vaticano.", respuesta: "Miguel Ángel", distractores: ["Leonardo da Vinci", "Rafael", "Botticelli"], dificultad: 4 },
  { pista: "Inventó en Europa la imprenta de tipos móviles, hacia 1440.", respuesta: "Johannes Gutenberg", distractores: ["Nicolás Copérnico", "Galileo Galilei", "Johannes Kepler"], dificultad: 5 },
  { pista: "Matemático griego que, según la leyenda, gritó '¡Eureka!' al descubrir el principio de la flotación en su bañera.", respuesta: "Arquímedes", distractores: ["Pitágoras", "Euclides", "Tales de Mileto"], dificultad: 5 },
  { pista: "Viajó por tierra desde Europa hasta la corte del imperio mongol en China, en el siglo XIII.", respuesta: "Marco Polo", distractores: ["Vasco da Gama", "Fernando de Magallanes", "Américo Vespucio"], dificultad: 5 },
  { pista: "Descifró los jeroglíficos egipcios usando la piedra de Rosetta, en 1822.", respuesta: "Jean-François Champollion", distractores: ["Howard Carter", "Napoleón Bonaparte", "Flinders Petrie"], dificultad: 6 },
  { pista: "Científico escocés que descubrió la penicilina de forma accidental, en 1928.", respuesta: "Alexander Fleming", distractores: ["Louis Pasteur", "Robert Koch", "Marie Curie"], dificultad: 5 },
  { pista: "Inventó el teléfono en 1876.", respuesta: "Alexander Graham Bell", distractores: ["Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"], dificultad: 4 },
  { pista: "Construyó la primera máquina de vapor comercialmente exitosa, a fines del siglo XVIII.", respuesta: "James Watt", distractores: ["George Stephenson", "Robert Fulton", "Richard Trevithick"], dificultad: 6 },
  { pista: "Comandó la misión que llevó al primer ser humano a caminar sobre la Luna, en 1969.", respuesta: "Neil Armstrong", distractores: ["Buzz Aldrin", "Yuri Gagarin", "John Glenn"], dificultad: 4 },
];

function generarPersonajes(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  const h = elegirAlAzar(PERSONAJES, nivel, usados, (p) => p.respuesta, rng);
  return {
    enunciado: h.pista,
    opciones: opcionesConDistractores(h.respuesta, h.distractores, rng),
    respuesta: h.respuesta,
    clave: h.respuesta,
    dificultad: h.dificultad,
  };
}

// ---------- Modo "causaefecto": relación de consecuencia directa ----------
interface HechoCausaEfecto {
  causa: string;
  efecto: string;
  distractores: [string, string, string];
  dificultad: number;
}

const CAUSA_EFECTO: HechoCausaEfecto[] = [
  {
    causa: "La invención de la imprenta de tipos móviles de Gutenberg",
    efecto: "Los libros se volvieron mucho más rápidos y baratos de producir, y el conocimiento escrito se difundió más rápido",
    distractores: [
      "Se abandonó por completo la escritura a mano en toda Europa",
      "El papel dejó de fabricarse en Europa",
      "Los escribas monásticos duplicaron su producción anual sin ayuda de máquinas",
    ],
    dificultad: 6,
  },
  {
    causa: "La caída del Imperio Romano de Occidente (476 d.C.)",
    efecto: "Marcó, en la periodización histórica estándar, el inicio de la Edad Media en Europa",
    distractores: [
      "El Imperio Romano de Oriente desapareció ese mismo año",
      "Egipto se independizó de Roma por primera vez",
      "Se fundó de inmediato el Sacro Imperio Romano Germánico",
    ],
    dificultad: 6,
  },
  {
    causa: "La máquina de vapor de James Watt",
    efecto: "Impulsó el desarrollo de fábricas y del transporte durante la Revolución Industrial",
    distractores: [
      "Reemplazó a los caballos en la agricultura de un día para el otro",
      "Eliminó la necesidad de usar carbón como combustible",
      "Se usó primero para viajes espaciales",
    ],
    dificultad: 5,
  },
  {
    causa: "El descubrimiento de la penicilina por Alexander Fleming",
    efecto: "Dio inicio a la era de los antibióticos modernos",
    distractores: [
      "Eliminó por completo las enfermedades infecciosas en el mundo",
      "Se usó primero como anestesia quirúrgica",
      "Permaneció sin ningún uso médico durante 50 años",
    ],
    dificultad: 6,
  },
  {
    causa: "El asesinato de Julio César en el 44 a.C.",
    efecto: "Desencadenó una serie de guerras civiles que terminaron con el fin de la República Romana y el inicio del Imperio",
    distractores: [
      "Restauró de inmediato la democracia plena en Roma",
      "Provocó la caída total de la ciudad de Roma ese mismo año",
      "Hizo que Roma se dividiera en dos ciudades separadas",
    ],
    dificultad: 7,
  },
  {
    causa: "La llegada del Apolo 11 a la Luna, en 1969",
    efecto: "Confirmó que el ser humano podía viajar y caminar fuera de la Tierra, un hito científico y tecnológico",
    distractores: [
      "Permitió instalar de inmediato una base humana permanente en la Luna",
      "Fue el primer objeto creado por humanos en llegar al espacio",
      "Puso fin a todos los programas espaciales posteriores",
    ],
    dificultad: 6,
  },
  {
    causa: "La invención del papel por Cai Lun en China, hacia el año 105 d.C.",
    efecto: "Hizo que escribir y conservar información fuera mucho más barato que usar seda o tablillas",
    distractores: [
      "Reemplazó de inmediato la escritura cuneiforme en Mesopotamia",
      "Se mantuvo en secreto y nunca se difundió fuera de China",
      "Eliminó por completo el uso de la tinta",
    ],
    dificultad: 8,
  },
];

function generarCausaEfecto(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  const h = elegirAlAzar(CAUSA_EFECTO, nivel, usados, (c) => c.causa, rng);
  return {
    enunciado: `${h.causa} — ¿cuál fue su consecuencia directa más reconocida?`,
    opciones: opcionesConDistractores(h.efecto, h.distractores, rng),
    respuesta: h.efecto,
    clave: h.causa,
    dificultad: h.dificultad,
  };
}

// ---------- Modo "fechas": año/siglo exacto de eventos menos conocidos ----------
interface HechoFecha {
  pregunta: string;
  respuesta: string;
  distractores: [string, string, string];
  dificultad: number;
}

const FECHAS: HechoFecha[] = [
  { pregunta: "¿En qué año se fundó legendariamente la ciudad de Roma?", respuesta: "753 a.C.", distractores: ["509 a.C.", "44 a.C.", "27 a.C."], dificultad: 8 },
  { pregunta: "¿En qué año se celebraron los primeros Juegos Olímpicos de la Antigüedad?", respuesta: "776 a.C.", distractores: ["508 a.C.", "490 a.C.", "146 a.C."], dificultad: 8 },
  { pregunta: "¿En qué año fue asesinado Julio César?", respuesta: "44 a.C.", distractores: ["27 a.C.", "509 a.C.", "476 d.C."], dificultad: 7 },
  { pregunta: "¿En qué año cayó el Imperio Romano de Occidente?", respuesta: "476 d.C.", distractores: ["395 d.C.", "800 d.C.", "1453 d.C."], dificultad: 7 },
  { pregunta: "¿En qué década imprimió Gutenberg su primera Biblia con tipos móviles?", respuesta: "1440", distractores: ["1400", "1500", "1350"], dificultad: 8 },
  { pregunta: "¿En qué año Champollion descifró los jeroglíficos egipcios con la piedra de Rosetta?", respuesta: "1822", distractores: ["1799", "1850", "1900"], dificultad: 9 },
  { pregunta: "¿En qué año voló por primera vez un avión motorizado?", respuesta: "1903", distractores: ["1890", "1927", "1914"], dificultad: 8 },
  { pregunta: "¿En qué año descubrió Alexander Fleming la penicilina?", respuesta: "1928", distractores: ["1910", "1945", "1900"], dificultad: 9 },
  { pregunta: "¿En qué año llegó el Apolo 11 a la Luna?", respuesta: "1969", distractores: ["1957", "1961", "1975"], dificultad: 7 },
  { pregunta: "¿Aproximadamente en qué año se terminó de construir la Gran Pirámide de Guiza?", respuesta: "2560 a.C.", distractores: ["1500 a.C.", "3500 a.C.", "1000 a.C."], dificultad: 10 },
];

function generarFechas(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  const h = elegirAlAzar(FECHAS, nivel, usados, (f) => f.pregunta, rng);
  return {
    enunciado: h.pregunta,
    opciones: opcionesConDistractores(h.respuesta, h.distractores, rng),
    respuesta: h.respuesta,
    clave: h.pregunta,
    dificultad: h.dificultad,
  };
}

// ---------- Modo "cronología": ordenar eventos, o identificar el siglo ----------
interface SecuenciaCronologica {
  eventos: [string, string, string];
  dificultad: number;
}

const SECUENCIAS: SecuenciaCronologica[] = [
  { eventos: ["Primeros Juegos Olímpicos de la Antigüedad (776 a.C.)", "Fundación legendaria de Roma (753 a.C.)", "Reforma democrática de Clístenes en Atenas (508 a.C.)"], dificultad: 2 },
  { eventos: ["Construcción de la Gran Pirámide de Guiza (~2560 a.C.)", "Invención del papel en China (~105 d.C.)", "Imprenta de Gutenberg (~1440)"], dificultad: 2 },
  { eventos: ["Asesinato de Julio César (44 a.C.)", "Caída del Imperio Romano de Occidente (476 d.C.)", "Mona Lisa de Leonardo da Vinci (~1505)"], dificultad: 3 },
  { eventos: ["Caída del Imperio Romano de Occidente (476 d.C.)", "Viajes de Marco Polo a China (siglo XIII)", "Imprenta de Gutenberg (~1440)"], dificultad: 3 },
  { eventos: ["Máquina de vapor de James Watt (1769)", "Teléfono de Alexander Graham Bell (1876)", "Penicilina de Alexander Fleming (1928)"], dificultad: 2 },
  { eventos: ["Bombilla eléctrica de Thomas Edison (1879)", "Primer vuelo motorizado de los hermanos Wright (1903)", "Llegada a la Luna del Apolo 11 (1969)"], dificultad: 2 },
  { eventos: ["Piedra de Rosetta descifrada (1822)", "Teléfono de Alexander Graham Bell (1876)", "Primer vuelo motorizado (1903)"], dificultad: 3 },
  { eventos: ["Capilla Sixtina de Miguel Ángel (1508-1512)", "Máquina de vapor de James Watt (1769)", "Penicilina de Alexander Fleming (1928)"], dificultad: 3 },
];

function permutaciones3([a, b, c]: [string, string, string]): [string, string, string][] {
  return [
    [a, b, c],
    [a, c, b],
    [b, a, c],
    [b, c, a],
    [c, a, b],
    [c, b, a],
  ];
}

function textoSecuencia(eventos: [string, string, string]): string {
  return eventos.join(" → ");
}

function generarOrdenar(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  const s = elegirAlAzar(SECUENCIAS, nivel, usados, (x) => textoSecuencia(x.eventos), rng);
  const correcta = textoSecuencia(s.eventos);
  const incorrectas = permutaciones3(s.eventos)
    .map(textoSecuencia)
    .filter((t) => t !== correcta);
  // Fisher-Yates sobre las incorrectas para no repetir siempre las mismas 3 de las 5 posibles.
  for (let i = incorrectas.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [incorrectas[i], incorrectas[j]] = [incorrectas[j], incorrectas[i]];
  }
  const distractores = incorrectas.slice(0, 3) as [string, string, string];

  return {
    enunciado: "Ordená estos 3 eventos de más antiguo a más reciente:",
    opciones: opcionesConDistractores(correcta, distractores, rng),
    respuesta: correcta,
    clave: correcta,
    dificultad: s.dificultad,
  };
}

interface HechoSiglo {
  evento: string;
  siglo: string;
  distractores: [string, string, string];
  dificultad: number;
}

const SIGLOS: HechoSiglo[] = [
  { evento: "la caída del Imperio Romano de Occidente (476 d.C.)", siglo: "Siglo V", distractores: ["Siglo III", "Siglo VIII", "Siglo X"], dificultad: 3 },
  { evento: "el asesinato de Julio César (44 a.C.)", siglo: "Siglo I a.C.", distractores: ["Siglo III a.C.", "Siglo I d.C.", "Siglo V a.C."], dificultad: 3 },
  { evento: "la imprenta de tipos móviles de Gutenberg (~1440)", siglo: "Siglo XV", distractores: ["Siglo XIII", "Siglo XVI", "Siglo XVIII"], dificultad: 4 },
  { evento: "la Mona Lisa de Leonardo da Vinci (~1505)", siglo: "Siglo XVI", distractores: ["Siglo XIV", "Siglo XV", "Siglo XVII"], dificultad: 4 },
  { evento: "la máquina de vapor de James Watt (1769)", siglo: "Siglo XVIII", distractores: ["Siglo XVI", "Siglo XVII", "Siglo XIX"], dificultad: 4 },
  { evento: "la llegada del Apolo 11 a la Luna (1969)", siglo: "Siglo XX", distractores: ["Siglo XVIII", "Siglo XIX", "Siglo XXI"], dificultad: 2 },
];

function generarSiglo(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  const h = elegirAlAzar(SIGLOS, nivel, usados, (s) => s.evento, rng);
  return {
    enunciado: `¿En qué siglo ocurrió ${h.evento}?`,
    opciones: opcionesConDistractores(h.siglo, h.distractores, rng),
    respuesta: h.siglo,
    clave: h.evento,
    dificultad: h.dificultad,
  };
}

function generarCronologia(nivel: number, usados: Set<string>, rng: Rng): PreguntaHistoria {
  return rng() < 0.5 ? generarOrdenar(nivel, usados, rng) : generarSiglo(nivel, usados, rng);
}

// ---------- Sin semilla en la práctica normal — mismo patrón que
// trigonometria.ts (conRngSembrado) para Reto Diario. ----------
let rngActual: Rng = Math.random;

export function conRngSembrado<T>(rng: Rng, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

export function generarPreguntaHistoria(modo: ModoHistoria, nivel: number, usados: Set<string> = new Set()): PreguntaHistoria {
  if (modo === "personajes") return generarPersonajes(nivel, usados, rngActual);
  if (modo === "causaefecto") return generarCausaEfecto(nivel, usados, rngActual);
  if (modo === "fechas") return generarFechas(nivel, usados, rngActual);
  return generarCronologia(nivel, usados, rngActual);
}
