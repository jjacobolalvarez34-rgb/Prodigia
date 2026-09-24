import type { EpocaId } from "./tipos";
import { formatoAnio } from "./tiempo";

// Las 5 ÉPOCAS de la periodización escolar habitual. Son CONVENCIONES, no
// hechos de la naturaleza: cambian según el país, el libro y la región del mundo
// (la historia de África, de China o de América precolombina no se parte igual).
// Fronteras usadas acá, todas con variantes en otros textos:
//   - Prehistoria / Antigüedad: la invención de la escritura, hacia el 3500 a. C.
//     (los primeros textos de Sumeria se datan entre 3500 y 3200 a. C.; algunos
//     libros ponen 3000 a. C.);
//   - Antigüedad / Edad Media: la caída del Imperio romano de Occidente, 476 d. C.
//     (los historiadores discuten que un año pueda marcar un proceso tan largo);
//   - Edad Media / Edad Moderna: la llegada de Colón a América, 1492 (otros textos
//     usan la caída de Constantinopla, 1453);
//   - Edad Moderna / Edad Contemporánea: la Revolución francesa, 1789 (otros
//     textos usan 1776, 1815 o 1914).
// Cada época incluye su año inicial: el hecho frontera pertenece a la época que
// empieza (476 es ya Edad Media; 1492 ya es Edad Moderna).

export interface Epoca {
  id: EpocaId;
  // 1..5, el orden cronológico.
  numero: number;
  nombre: { es: string; en: string };
  // Primer y último año de la época (inclusive). La Prehistoria no tiene un
  // comienzo fechable: se usa un año muy antiguo para poder ubicar todo.
  desde: number;
  hasta: number;
  // Qué fija la frontera de inicio (null en la Prehistoria).
  frontera: { es: string; en: string } | null;
  descripcion: { es: string; en: string };
}

export const ANIO_MAS_ANTIGUO = -3_000_000;
export const ANIO_MAS_RECIENTE = 2100;

export const EPOCAS: Epoca[] = [
  {
    id: "prehistoria",
    numero: 1,
    nombre: { es: "Prehistoria", en: "Prehistory" },
    desde: ANIO_MAS_ANTIGUO,
    hasta: -3501,
    frontera: null,
    descripcion: {
      es: "Desde las primeras herramientas de piedra hasta la invención de la escritura: cazadores recolectores, el fuego, la agricultura y las primeras aldeas.",
      en: "From the first stone tools to the invention of writing: hunter-gatherers, fire, farming and the first villages.",
    },
  },
  {
    id: "antiguedad",
    numero: 2,
    nombre: { es: "Antigüedad", en: "Antiquity" },
    desde: -3500,
    hasta: 475,
    frontera: {
      es: "La invención de la escritura, hacia el 3500 a. C. (convención escolar).",
      en: "The invention of writing, around 3500 BC (school convention).",
    },
    descripcion: {
      es: "Las primeras civilizaciones con escritura: Mesopotamia, Egipto, India, China, Grecia, Roma, Persia y las culturas antiguas de América y África.",
      en: "The first civilizations with writing: Mesopotamia, Egypt, India, China, Greece, Rome, Persia and the ancient cultures of the Americas and Africa.",
    },
  },
  {
    id: "edad-media",
    numero: 3,
    nombre: { es: "Edad Media", en: "Middle Ages" },
    desde: 476,
    hasta: 1491,
    frontera: {
      es: "La caída del Imperio romano de Occidente, 476 d. C. (convención escolar).",
      en: "The fall of the Western Roman Empire, AD 476 (school convention).",
    },
    descripcion: {
      es: "El Imperio bizantino, el mundo islámico, el feudalismo europeo, los mongoles, China y Japón, los imperios africanos y las civilizaciones de Mesoamérica y los Andes.",
      en: "The Byzantine Empire, the Islamic world, European feudalism, the Mongols, China and Japan, the African empires and the civilizations of Mesoamerica and the Andes.",
    },
  },
  {
    id: "edad-moderna",
    numero: 4,
    nombre: { es: "Edad Moderna", en: "Early Modern Age" },
    desde: 1492,
    hasta: 1788,
    frontera: {
      es: "La llegada de Colón a América, 1492 (otros textos usan la caída de Constantinopla, 1453).",
      en: "Columbus's arrival in the Americas, 1492 (other books use the fall of Constantinople, 1453).",
    },
    descripcion: {
      es: "El Renacimiento, la Reforma, los viajes de exploración y la conquista de América, la revolución científica, la Ilustración y la independencia de Estados Unidos.",
      en: "The Renaissance, the Reformation, the voyages of exploration and the conquest of the Americas, the scientific revolution, the Enlightenment and US independence.",
    },
  },
  {
    id: "contemporanea",
    numero: 5,
    nombre: { es: "Edad Contemporánea", en: "Contemporary Age" },
    desde: 1789,
    hasta: ANIO_MAS_RECIENTE,
    frontera: {
      es: "La Revolución francesa, 1789 (otros textos usan 1776, 1815 o 1914).",
      en: "The French Revolution, 1789 (other books use 1776, 1815 or 1914).",
    },
    descripcion: {
      es: "Las revoluciones, la industrialización, el imperialismo, las guerras mundiales, la Guerra Fría, la descolonización y el mundo actual.",
      en: "Revolutions, industrialization, imperialism, the world wars, the Cold War, decolonization and the present-day world.",
    },
  },
];

export const ORDEN_EPOCAS: EpocaId[] = EPOCAS.map((e) => e.id);

export const EPOCA_POR_ID: Record<EpocaId, Epoca> = Object.fromEntries(EPOCAS.map((e) => [e.id, e])) as Record<EpocaId, Epoca>;

export function epocaDeAnio(anio: number): EpocaId {
  const e = EPOCAS.find((x) => anio >= x.desde && anio <= x.hasta);
  if (!e) throw new Error(`Año fuera de todas las épocas: ${anio}`);
  return e.id;
}

// Distancia (en años) del año a la frontera de época más cercana, la que separa
// su época de la vecina. Sirve para no preguntar la época de un hecho que cae
// justo en el borde de una convención.
export function distanciaAFrontera(anio: number): number {
  const fronteras = EPOCAS.slice(1).map((e) => e.desde);
  return Math.min(...fronteras.map((f) => Math.abs(anio - f)));
}

// «3500 a. C.», «476 d. C.», «1492», «1789»: el año de inicio de cada época
// (salvo la primera) para los textos y visuales.
export function textoFrontera(id: EpocaId): string | null {
  const e = EPOCA_POR_ID[id];
  return e.numero === 1 ? null : formatoAnio(e.desde);
}
