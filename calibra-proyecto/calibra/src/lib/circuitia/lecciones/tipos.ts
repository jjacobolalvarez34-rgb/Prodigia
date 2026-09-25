import type { VisualLeccion } from "@/lib/aprender/visuales";

export interface PreguntaLeccion {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una lección de Circuitia (Técnica gratis o Clase Pro) en el formato
// visual. `pasos` y `quiz` son EXACTAMENTE los que ya están sembrados (ver
// supabase/migrations/0167, 0171, 0179, 0195 — la última migración que
// tocó el contenido de cada slug) — este retrofit solo AGREGA `visuales`,
// nunca reescribe el texto ya sembrado.
export interface LeccionCircuitia {
  slug: string;
  orden: number;
  requierePro: boolean;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccion[];
}
