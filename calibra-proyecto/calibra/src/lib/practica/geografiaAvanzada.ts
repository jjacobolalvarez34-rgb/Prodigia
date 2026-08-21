import type { Continente } from "./geografia";

// Sección 4 (auditoría de variedad, tanda nocturna): más granularidad
// para calibración alta (8-10) en Geografía — ciudades, ríos y puntos
// de referencia reales, no coordenadas inventadas. A diferencia de los
// países (que usan el topojson real de world-atlas + clic en el mapa),
// esto es texto/opción múltiple: agregar geometría de puntos real
// (ciudades/ríos como capas nuevas del mapa) es un proyecto de datos
// aparte por el volumen de topojson nuevo que requeriría — lo dejo
// anotado en el resumen final. La forma elegida acá reusa el mismo
// patrón de LogicPuzzle que ya prueba tener buen ritmo en Enigmia:
// dato real, curado a mano, con una sola respuesta correcta y 3
// distractores plausibles del mismo continente.
export interface PreguntaAvanzada {
  id: string; // sintético, solo para comparar contra la opción clickeada
  nombre: string; // nombre de la respuesta correcta, para el resumen de fin de ronda
  dificultad: number; // siempre 8-10 — este modo solo se sortea en calibración alta
  continente: Continente;
  pregunta: string;
  opciones: { id: string; texto: string }[];
}

function armar(
  continente: Continente,
  dificultad: number,
  pregunta: string,
  respuesta: string,
  distractores: [string, string, string]
): PreguntaAvanzada {
  const opciones = [respuesta, ...distractores].map((texto, i) => ({ id: `${respuesta}-${i}`, texto }));
  const correcta = opciones[0];
  return {
    id: correcta.id,
    nombre: respuesta,
    dificultad,
    continente,
    pregunta,
    opciones,
  };
}

// 10 preguntas reales por continente — ciudades importantes, ríos y
// puntos de referencia famosos, mezclados. Todas verificables (misma
// exigencia que "no inventes coordenadas a mano" aplicada a hechos).
const PREGUNTAS_AMERICA: PreguntaAvanzada[] = [
  armar("america", 8, "¿En qué país está la ciudad de Cusco?", "Perú", ["Bolivia", "Ecuador", "Colombia"]),
  armar("america", 8, "¿En qué país nace el río Amazonas?", "Perú", ["Brasil", "Colombia", "Ecuador"]),
  armar("america", 9, "¿En qué país está Machu Picchu?", "Perú", ["Bolivia", "Chile", "Ecuador"]),
  armar("america", 8, "¿En qué país está el Cañón del Colorado?", "Estados Unidos", ["Canadá", "México", "Argentina"]),
  armar("america", 9, "¿En qué país está el Salar de Uyuni?", "Bolivia", ["Perú", "Chile", "Argentina"]),
  armar("america", 8, "¿En qué país está la ciudad de Cartagena (la de las murallas coloniales)?", "Colombia", ["Venezuela", "Panamá", "Ecuador"]),
  armar("america", 9, "¿En qué país está el Desierto de Atacama?", "Chile", ["Perú", "Bolivia", "Argentina"]),
  armar("america", 10, "¿En qué país está el Salto Ángel, la catarata más alta del mundo?", "Venezuela", ["Guyana", "Brasil", "Colombia"]),
  armar("america", 9, "¿En qué país está el lago Titicaca (del lado con más territorio del lago)?", "Perú", ["Bolivia", "Chile", "Ecuador"]),
  armar("america", 10, "¿En qué país está la ciudad de Iquitos, sobre el río Amazonas?", "Perú", ["Brasil", "Colombia", "Ecuador"]),
];

const PREGUNTAS_EUROPA: PreguntaAvanzada[] = [
  armar("europa", 8, "¿En qué país nace el río Danubio?", "Alemania", ["Austria", "Hungría", "Rumania"]),
  armar("europa", 8, "¿En qué país está la Torre Eiffel?", "Francia", ["Bélgica", "Suiza", "Italia"]),
  armar("europa", 9, "¿En qué país está el Coliseo romano?", "Italia", ["Grecia", "España", "Francia"]),
  armar("europa", 8, "¿En qué país está la ciudad de Ámsterdam?", "Países Bajos", ["Bélgica", "Alemania", "Dinamarca"]),
  armar("europa", 9, "¿En qué país está el Big Ben?", "Reino Unido", ["Irlanda", "Francia", "Países Bajos"]),
  armar("europa", 9, "¿En qué país nace el río Rin?", "Suiza", ["Alemania", "Austria", "Francia"]),
  armar("europa", 10, "¿En qué país está la ciudad de Cracovia?", "Polonia", ["Chequia", "Eslovaquia", "Hungría"]),
  armar("europa", 9, "¿En qué país está el Vaticano (enclave dentro de esta capital)?", "Italia", ["Francia", "España", "Grecia"]),
  armar("europa", 10, "¿En qué país está el fiordo de Geiranger?", "Noruega", ["Suecia", "Finlandia", "Islandia"]),
  armar("europa", 8, "¿En qué país está la Sagrada Familia?", "España", ["Portugal", "Italia", "Francia"]),
];

const PREGUNTAS_AFRICA: PreguntaAvanzada[] = [
  armar("africa", 8, "¿En qué país están las pirámides de Guiza?", "Egipto", ["Sudán", "Libia", "Marruecos"]),
  armar("africa", 8, "¿En qué país está el monte Kilimanjaro?", "Tanzania", ["Kenia", "Uganda", "Etiopía"]),
  armar("africa", 9, "¿En qué país está la ciudad de Marrakech?", "Marruecos", ["Argelia", "Túnez", "Libia"]),
  armar("africa", 9, "¿En qué país está la mayor parte de las cataratas Victoria?", "Zimbabue", ["Zambia", "Botsuana", "Mozambique"]),
  armar("africa", 8, "¿En qué país está el desierto del Sahara en su mayor extensión?", "Argelia", ["Libia", "Egipto", "Malí"]),
  armar("africa", 10, "¿En qué país está el delta del río Okavango?", "Botsuana", ["Namibia", "Zambia", "Angola"]),
  armar("africa", 9, "¿En qué país está la isla de Zanzíbar?", "Tanzania", ["Kenia", "Mozambique", "Madagascar"]),
  armar("africa", 10, "¿En qué país está la Gran Mezquita de Djenné?", "Malí", ["Níger", "Senegal", "Burkina Faso"]),
  armar("africa", 9, "¿En qué país nace el Nilo Azul?", "Etiopía", ["Sudán", "Egipto", "Uganda"]),
  armar("africa", 8, "¿En qué país está la ciudad de Ciudad del Cabo?", "Sudáfrica", ["Namibia", "Botsuana", "Mozambique"]),
];

const PREGUNTAS_ASIA_OCEANIA: PreguntaAvanzada[] = [
  armar("asia_oceania", 8, "¿En qué país está el Taj Mahal?", "India", ["Pakistán", "Bangladés", "Nepal"]),
  armar("asia_oceania", 8, "¿En qué país está el monte Fuji?", "Japón", ["Corea del Sur", "China", "Taiwán"]),
  armar("asia_oceania", 9, "¿En qué país está Angkor Wat?", "Camboya", ["Tailandia", "Vietnam", "Laos"]),
  armar("asia_oceania", 9, "¿En qué país nace el río Ganges?", "India", ["Nepal", "Bangladés", "Pakistán"]),
  armar("asia_oceania", 8, "¿En qué país está la Gran Barrera de Coral?", "Australia", ["Nueva Zelanda", "Indonesia", "Filipinas"]),
  armar("asia_oceania", 10, "¿En qué país está la ciudad de Samarcanda?", "Uzbekistán", ["Kazajistán", "Tayikistán", "Turkmenistán"]),
  armar("asia_oceania", 9, "¿En qué país está el desierto de Gobi en su mayor extensión?", "Mongolia", ["China", "Kazajistán", "Rusia"]),
  armar("asia_oceania", 10, "¿En qué país está el lago Baikal?", "Rusia", ["Mongolia", "Kazajistán", "China"]),
  armar("asia_oceania", 9, "¿En qué país está la ciudad de Petra?", "Jordania", ["Siria", "Irak", "Arabia Saudita"]),
  armar("asia_oceania", 8, "¿En qué país está la ciudad de Bali (isla)?", "Indonesia", ["Malasia", "Filipinas", "Tailandia"]),
];

export const PREGUNTAS_AVANZADAS_POR_CONTINENTE: Record<Continente, PreguntaAvanzada[]> = {
  america: PREGUNTAS_AMERICA,
  europa: PREGUNTAS_EUROPA,
  africa: PREGUNTAS_AFRICA,
  asia_oceania: PREGUNTAS_ASIA_OCEANIA,
};

// Solo se ofrece en calibración alta (8-10) — en niveles bajos sigue
// siendo únicamente el mapa de países, como pediste explícitamente.
export const NIVEL_MINIMO_AVANZADO = 8;
export const PROBABILIDAD_AVANZADO = 0.4;

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// `armar()` deja siempre la respuesta correcta en el índice 0 — acá se
// devuelve una COPIA con las opciones mezcladas (nunca el objeto del
// banco original), así el botón correcto no cae siempre primero.
export function elegirPreguntaAvanzada(continente: Continente, usadas: Set<string>): PreguntaAvanzada | null {
  const banco = PREGUNTAS_AVANZADAS_POR_CONTINENTE[continente];
  const candidatas = banco.filter((p) => !usadas.has(p.id));
  const pool = candidatas.length > 0 ? candidatas : banco;
  const elegida = pool[Math.floor(Math.random() * pool.length)];
  if (!elegida) return null;
  return { ...elegida, opciones: mezclar(elegida.opciones) };
}
