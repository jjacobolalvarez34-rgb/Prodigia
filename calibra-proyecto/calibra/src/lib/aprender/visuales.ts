import type { VisualNaipia } from "@/lib/naipia/visuales";
import type { VisualNumeria } from "@/lib/numeria/visuales";

// Formato de lección con explicación VISUAL/ANIMADA (compartido por todos
// los mundos). En `techniques.contenido` (jsonb):
//
//   { pasos: string[],            // introducción corta (1-3 frases por paso)
//     visuales?: VisualLeccion[], // la explicación real, animada
//     quiz?: [...] }              // sin cambios
//
// Cada visual es `{ tipo, despuesDePaso?, ...props }`. `despuesDePaso` es el
// índice (base 0) del paso debajo del cual se ubica; si falta (o es inválido
// o supera el último paso) va después del último paso. Un `tipo` que ningún
// registro conoce se ignora sin romper la lección (ver
// src/components/aprender/VisualLeccion.tsx). Cada mundo agrega su unión de
// visuales a `VisualLeccion` (aquí abajo) y su registro de componentes.
//
// Retrocompatible por construcción: una lección sin `visuales` se ve
// exactamente igual que antes.

export interface VisualBase {
  tipo: string;
  despuesDePaso?: number;
  // Frase corta encima del visual (texto plano; admite $...$ KaTeX).
  titulo?: string;
  // true = mostrar el estado final sin animar (mismo resultado que
  // "reducir movimiento"; útil para capturas y tests).
  estatico?: boolean;
}

// ---------- Primitivo genérico: explicación por cuadros animados ----------

export interface CuadroLeccion {
  // Texto del cuadro; admite $...$ (KaTeX vía MathText).
  texto?: string;
  // Fórmula en LaTeX SIN los signos de dólar (se dibuja centrada, grande).
  formula?: string;
  // Resultado del cuadro, destacado en una etiqueta de color (admite $...$).
  resaltar?: string;
}

export interface VisualCuadros extends VisualBase {
  tipo: "cuadros";
  cuadros: CuadroLeccion[];
  // Por defecto true: los cuadros aparecen solos de a uno.
  autoplay?: boolean;
  // Milisegundos entre cuadros (por defecto 2400).
  msPorCuadro?: number;
}

// ---------- Unión de todos los visuales conocidos ----------

export type VisualLeccion = VisualCuadros | VisualNaipia | VisualNumeria;

// Validador tolerante: solo exige la forma mínima ({ tipo: string no vacío }
// y `despuesDePaso` entero >= 0 si está). NO valida el tipo (un tipo que
// ningún registro conozca lo ignora el dispatcher) ni las props de cada
// visual (cada componente se defiende de sus propios datos malos).
export function esVisualLeccion(valor: unknown): valor is VisualLeccion {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return false;
  const v = valor as Record<string, unknown>;
  if (typeof v.tipo !== "string" || v.tipo.length === 0) return false;
  if (v.despuesDePaso !== undefined) {
    if (typeof v.despuesDePaso !== "number" || !Number.isInteger(v.despuesDePaso) || v.despuesDePaso < 0) return false;
  }
  return true;
}

// Saca los visuales bien formados del `contenido.visuales` crudo (el jsonb
// puede traer cualquier cosa): lo que no es un arreglo da [].
export function visualesDeContenido(crudo: unknown): VisualLeccion[] {
  return Array.isArray(crudo) ? crudo.filter(esVisualLeccion) : [];
}

// Agrupa los visuales por índice de paso (0..cantidadPasos-1). Los sin
// `despuesDePaso`, o con uno fuera de rango, van bajo el último paso. Con
// cero pasos no hay dónde colgarlos: se devuelve un mapa vacío.
export function agruparVisualesPorPaso(cantidadPasos: number, visuales: VisualLeccion[]): Map<number, VisualLeccion[]> {
  const grupos = new Map<number, VisualLeccion[]>();
  if (cantidadPasos <= 0) return grupos;
  const ultimo = cantidadPasos - 1;
  for (const v of visuales) {
    const destino = v.despuesDePaso !== undefined && v.despuesDePaso <= ultimo ? v.despuesDePaso : ultimo;
    grupos.set(destino, [...(grupos.get(destino) ?? []), v]);
  }
  return grupos;
}
