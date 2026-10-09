import type { VisualLeccion } from "@/lib/aprender/visuales";

export interface PreguntaLeccion {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Los 6 temas de Aprender de Vitalia: uno por modo de juego.
export type GrupoVitalia = "celula" | "procesos" | "genetica" | "sistemas" | "reinos" | "ecologia";

// Una lección de Vitalia (Técnica gratis o Clase Pro). Fuente única: la
// migración de contenido se genera desde acá (sql.ts) y el test la compara.
export interface LeccionVitalia {
  slug: string;
  grupo: GrupoVitalia;
  orden: number;
  requierePro: boolean;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccion[];
}
