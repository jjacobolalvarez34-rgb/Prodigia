import type { Continente } from "@/lib/practica/geografia";
import type { VisualGeografia } from "@/lib/geografia/visuales";

export interface PreguntaLeccionGeografia {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una Técnica NUEVA de Geografía (retrofit Técnicas | Clases por
// continente, ver docs/PARIDAD_MUNDOS.md fila 22/23 y la fila 1 — "Aprender
// tiene solo 3 lecciones totales"): a diferencia de las 3 Técnicas
// genéricas históricas (0027_geografia_lecciones.sql — estrategias que no
// mapean a un continente específico y por eso quedan en el grupo
// "general", ver src/lib/geografia/path.ts), estas SÍ son específicas de
// UN continente — un atajo de identificación rápida (forma, vecinos,
// fronteras), gratis (`requierePro: false`).
export interface TecnicaGeografia {
  slug: string;
  continente: Continente;
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualGeografia[];
  quiz: PreguntaLeccionGeografia[];
}

// Una Clase NUEVA de Geografía: curso progresivo real, una lección por
// sub-región (src/lib/geografia/subregiones.ts) dentro de un continente —
// dónde queda esa sub-región, qué países la forman, un rasgo distintivo,
// quiz de identificación. `requierePro: true`; la primera Clase de cada
// continente es preview gratis (ver src/lib/geografia/path.ts).
export interface ClaseGeografia {
  slug: string;
  continente: Continente;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualGeografia[];
  quiz: PreguntaLeccionGeografia[];
}
