import type { VisualLeccion } from "@/lib/aprender/visuales";

export interface PreguntaLeccion {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una lección de Naipia en el formato visual: `pasos` es la INTRODUCCIÓN
// corta y la explicación real son los `visuales` animados (cada uno con
// `despuesDePaso`: el visual va justo debajo de ese paso, base 0).
export interface LeccionNaipia {
  slug: string;
  orden: number;
  requierePro: boolean;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccion[];
}
