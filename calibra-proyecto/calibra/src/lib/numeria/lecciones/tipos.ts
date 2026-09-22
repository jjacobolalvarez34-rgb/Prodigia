import type { VisualLeccion } from "@/lib/aprender/visuales";
import type { TemaAprendible } from "@/lib/aprender/path";

export interface PreguntaLeccionNumeria {
  pregunta: string;
  opciones: string[];
  respuesta: string;
  explicacion: string;
}

// Una Clase nueva de Numeria (fila 22 + fila 23 de docs/PARIDAD_MUNDOS.md):
// a diferencia de las Técnicas rápidas viejas (contenido de texto plano,
// sembradas en 0005/0007/0018/etc.), estas son INSERT nuevos —
// `problemType` decide bajo qué tema del camino de 9 temas de Numeria
// (src/lib/aprender/path.ts) caen. `pasos` es la introducción corta y la
// explicación real son los `visuales` animados (tablero de columnas,
// productos parciales, casita de dividir, listado de múltiplos, barras
// fraccionarias) — mismo formato que Naipia.
export interface ClaseNumeria {
  slug: string;
  problemType: TemaAprendible;
  orden: number;
  requierePro: true;
  nombre: string;
  descripcion: string;
  pasos: string[];
  visuales: VisualLeccion[];
  quiz: PreguntaLeccionNumeria[];
}

// Una Técnica rápida ya existente de Numeria (requiere_pro = false,
// sembrada en migraciones viejas: 0007/0018/0019/0026/0032/0079/0101) a
// la que se le agrega su apartado visual (2026-09-22, "revisa TODAS y
// colócales su apartado visual"). A diferencia de ClaseNumeria, esto NO
// es una fila nueva: es un UPDATE sobre `contenido` de una fila que ya
// existe, así que solo hace falta lo que cambia — `pasos` (introducción
// corta reescrita en español neutro) y `visuales` (nuevos). `quiz` NO se
// toca (ya lo agregaron 0182/0183/0184; el generador de SQL usa
// jsonb_set para dejarlo intacto).
export interface TecnicaVisualNumeria {
  slug: string;
  pasos: string[];
  visuales: VisualLeccion[];
}
