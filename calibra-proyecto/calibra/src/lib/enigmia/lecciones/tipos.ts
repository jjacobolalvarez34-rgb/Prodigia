import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { CategoriaEnigmia } from "@/types/database";

export interface PreguntaLeccionEnigmia {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una Clase nueva de Enigmia (fila 22 + fila 23 de docs/PARIDAD_MUNDOS.md):
// a diferencia de las 6 Técnicas rápidas ya existentes (contenido de texto
// plano + quiz, sembradas en 0015/0020/0186), estas son INSERT nuevos en
// logic_techniques — `categoria` decide bajo cuál de las 4 categorías del
// camino de Enigmia (src/lib/enigmia/path.ts) caen. `pasos` es la
// introducción corta y la explicación real son los `visuales` animados
// (secuencia, cadena lógica, agrupación/chunking, traza de algoritmo).
export interface ClaseEnigmia {
  slug: string;
  categoria: CategoriaEnigmia;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccionEnigmia[];
}

// Una Técnica NUEVA de Enigmia (2026-09-22, expansión "está muy vacío"):
// mismo formato de contenido que ClaseEnigmia (pasos + visuales + quiz),
// pero `requierePro: false` (gratis, atajo rápido) y va a
// `logic_techniques` como INSERT nuevo, igual que las 6 Técnicas
// históricas de 0015/0020 pero CON `visuales` (esas no tenían). A
// diferencia de las Clases (curso progresivo, enseña el concepto desde
// cero), una Técnica es un atajo puntual — más corta, sin necesidad de
// dependencia con la anterior.
export interface TecnicaEnigmia {
  slug: string;
  categoria: CategoriaEnigmia;
  orden: number;
  requierePro: false;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccionEnigmia[];
}
