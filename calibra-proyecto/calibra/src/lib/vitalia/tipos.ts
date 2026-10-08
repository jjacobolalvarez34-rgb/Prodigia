// Tipos públicos del mundo Vitalia (Biología, mundo 15).

export type ModoVitalia = "celula" | "procesos" | "genetica" | "sistemas" | "reinos" | "ecologia";

export const MODOS_VITALIA: readonly ModoVitalia[] = ["celula", "procesos", "genetica", "sistemas", "reinos", "ecologia"];

export const NOMBRE_MODO_VITALIA: Record<ModoVitalia, string> = {
  celula: "La célula",
  procesos: "Procesos celulares",
  genetica: "Genética",
  sistemas: "Sistemas del cuerpo",
  reinos: "Reinos y clasificación",
  ecologia: "Ecología",
};

export const SIMBOLO_MODO_VITALIA: Record<ModoVitalia, string> = {
  celula: "◉",
  procesos: "⟳",
  genetica: "ADN",
  sistemas: "♥",
  reinos: "✿",
  ecologia: "☀",
};

export const DESCRIPCION_MODO_VITALIA: Record<ModoVitalia, string> = {
  celula: "Organelos, membrana y biomoléculas.",
  procesos: "Fotosíntesis, respiración y división.",
  genetica: "ADN, Punnett y herencia.",
  sistemas: "Cómo funciona el cuerpo por dentro.",
  reinos: "Clasificar a los seres vivos.",
  ecologia: "Cadenas, energía y relaciones.",
};

export type Organelo =
  | "nucleo"
  | "mitocondria"
  | "ribosoma"
  | "reticulo"
  | "golgi"
  | "lisosoma"
  | "cloroplasto"
  | "vacuola"
  | "pared"
  | "membrana";

export const NOMBRE_ORGANELO: Record<Organelo, string> = {
  nucleo: "Núcleo",
  mitocondria: "Mitocondria",
  ribosoma: "Ribosoma",
  reticulo: "Retículo endoplasmático",
  golgi: "Aparato de Golgi",
  lisosoma: "Lisosoma",
  cloroplasto: "Cloroplasto",
  vacuola: "Vacuola",
  pared: "Pared celular",
  membrana: "Membrana plasmática",
};

export type FaseMitosis = "profase" | "metafase" | "anafase" | "telofase";

export type DiagramaVitalia =
  | { tipo: "celula"; variante: "animal" | "vegetal"; senalado?: Organelo }
  | { tipo: "division"; fase: FaseMitosis };

interface Base {
  modo: ModoVitalia;
  enunciado: string;
  diagrama?: DiagramaVitalia;
  detalle: { tipo: string };
}

export interface ProblemaVitaliaNumero extends Base {
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export interface ProblemaVitaliaOpciones extends Base {
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export type ProblemaVitalia = ProblemaVitaliaNumero | ProblemaVitaliaOpciones;
