import type { VisualCuadros } from "@/lib/aprender/visuales";
import type { VisualCalculia } from "@/lib/calculia/visuales";
import type { GrupoCalculia } from "@/lib/calculia/bloques";

// Visuales permitidos en una lección de Calculia: los propios
// ("calculia.*") y el primitivo genérico de cuadros animados.
export type VisualLeccionCalculia = VisualCalculia | VisualCuadros;

export interface PreguntaLeccionCalculia {
  pregunta: string;
  opciones: string[];
  // Siempre una de las `opciones` (lecciones.test.ts lo comprueba).
  respuesta: string;
  explicacion: string;
}

// Una lección de Calculia (Técnica o Clase — misma forma, la tabla
// `techniques` no distingue). `pasos` y `quiz` son EXACTAMENTE el contenido
// ya sembrado (0165/0170/0178/0181/0195_latex_clases_calculia_circuitia.sql)
// — lecciones.test.ts los compara byte a byte contra esas migraciones. Lo
// único NUEVO de este retrofit es `visuales`: la migración generada por
// sql.ts solo agrega ese campo (nunca reescribe pasos/quiz).
export interface LeccionCalculia {
  slug: string;
  // Tema del currículo (bloques.ts): de él depende el desbloqueo por tema.
  grupo: GrupoCalculia;
  // Mismo `orden` ya sembrado (1..5 Técnicas, 6..12 Clases: correlativo en toda
  // la tabla; dentro de un tema el orden relativo es el que cuenta).
  orden: number;
  requierePro: boolean;
  nombre: string;
  descripcion: string;
  pasos: string[];
  quiz: PreguntaLeccionCalculia[];
  visuales: VisualLeccionCalculia[];
}
