import type { VisualBase } from "@/lib/aprender/visuales";
import type { Organelo } from "./tipos";

// Animaciones de las lecciones de Vitalia (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §5.1).
// Cada una trae solo los datos; lo que se muestra lo calcula src/lib/vitalia/escenas.ts.

export interface VisualVitaliaCelula extends VisualBase {
  tipo: "vitalia.celula";
  variante: "animal" | "vegetal" | "procariota";
  // Organelos que se iluminan de a uno (por defecto, todos los de esa célula).
  organelos?: Organelo[];
}
export interface VisualVitaliaMembrana extends VisualBase {
  tipo: "vitalia.membrana";
  modo: "difusion" | "osmosis" | "activo";
  // Solo ósmosis: cómo es el medio de afuera.
  medio?: "hipotonico" | "isotonico" | "hipertonico";
}
export interface VisualVitaliaDivision extends VisualBase {
  tipo: "vitalia.division";
  modo: "mitosis" | "meiosis";
  // Cromosomas de la célula madre (2n), para el contador.
  dosN?: number;
}
export interface VisualVitaliaEnergia extends VisualBase {
  tipo: "vitalia.energia";
  modo: "ciclo" | "fotosintesis" | "respiracion" | "fermentacion";
}
export interface VisualVitaliaAdn extends VisualBase {
  tipo: "vitalia.adn";
  modo: "replicacion" | "transcripcion" | "traduccion";
  // Hebra de ADN (A, T, G, C), de 3 a 12 letras. En traducción es el ARN
  // mensajero (A, U, G, C), con un múltiplo de 3 letras.
  hebra: string;
}
export interface VisualVitaliaPunnett extends VisualBase {
  tipo: "vitalia.punnett";
  // Genotipos de los padres: "Aa" (un rasgo) o "AaBb" (dos rasgos).
  padre1: string;
  padre2: string;
  // Dominancia incompleta: el heterocigoto es intermedio.
  incompleta?: boolean;
}
export interface VisualVitaliaPedigri extends VisualBase {
  tipo: "vitalia.pedigri";
  modo: "recesiva" | "ligadaX";
}
export interface VisualVitaliaRecorrido extends VisualBase {
  tipo: "vitalia.recorrido";
  sistema: "circulatorio" | "digestivo" | "respiratorio" | "urinario" | "nervioso";
}
export interface VisualVitaliaHormona extends VisualBase {
  tipo: "vitalia.hormona";
  modo: "glucosa" | "temperatura";
}
export interface VisualVitaliaDefensa extends VisualBase {
  tipo: "vitalia.defensa";
  modo: "respuesta" | "vacuna";
}
export interface VisualVitaliaArbol extends VisualBase {
  tipo: "vitalia.arbol";
  ejemplo: "humano" | "perro" | "roble";
}
export interface VisualVitaliaReinos extends VisualBase {
  tipo: "vitalia.reinos";
  modo: "reinos" | "vertebrados" | "invertebrados";
}
export interface VisualVitaliaPlantas extends VisualBase {
  tipo: "vitalia.plantas";
}
export interface VisualVitaliaCadena extends VisualBase {
  tipo: "vitalia.cadena";
  // De productor a consumidor más alto (2 a 5 eslabones).
  eslabones: string[];
  // Energía del primer nivel, en kcal (por defecto 10 000).
  energia?: number;
}

export type VisualVitalia =
  | VisualVitaliaCelula
  | VisualVitaliaMembrana
  | VisualVitaliaDivision
  | VisualVitaliaEnergia
  | VisualVitaliaAdn
  | VisualVitaliaPunnett
  | VisualVitaliaPedigri
  | VisualVitaliaRecorrido
  | VisualVitaliaHormona
  | VisualVitaliaDefensa
  | VisualVitaliaArbol
  | VisualVitaliaReinos
  | VisualVitaliaPlantas
  | VisualVitaliaCadena;

export const TIPOS_VISUALES_VITALIA = [
  "vitalia.celula",
  "vitalia.membrana",
  "vitalia.division",
  "vitalia.energia",
  "vitalia.adn",
  "vitalia.punnett",
  "vitalia.pedigri",
  "vitalia.recorrido",
  "vitalia.hormona",
  "vitalia.defensa",
  "vitalia.arbol",
  "vitalia.reinos",
  "vitalia.plantas",
  "vitalia.cadena",
] as const;
