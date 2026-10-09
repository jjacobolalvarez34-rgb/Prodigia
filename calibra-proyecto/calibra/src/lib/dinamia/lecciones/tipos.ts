import type { VisualLeccion } from "@/lib/aprender/visuales";

export interface PreguntaLeccion {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Los 6 temas de Aprender de Dinamia: uno por modo de juego.
export type GrupoDinamia = "cinematica" | "vectores" | "newton" | "energia" | "termo" | "fluidos";

// Una lección de Dinamia (Técnica gratis o Clase Pro). Fuente única: la
// migración de contenido se genera desde acá (sql.ts) y el test la compara.
export interface LeccionDinamia {
  slug: string;
  grupo: GrupoDinamia;
  orden: number;
  requierePro: boolean;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccion[];
}
