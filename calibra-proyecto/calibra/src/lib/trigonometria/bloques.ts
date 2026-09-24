import type { ModoTrigonometria } from "@/lib/practica/trigonometriaEscala";

// Los 6 BLOQUES del currículo de Trigonometría, en orden de colegio. Son la
// fuente única de los grupos de Aprender (Técnicas | Clases) y de la relación
// con la práctica: cada bloque dice qué modo de práctica lo ejercita, o `null`
// si todavía no tiene modo. Los bloques 3 (gráficas y periodo) y 6 (ecuaciones)
// SE ENSEÑAN en Aprender pero aún no tienen modo de práctica: son la Fase 2
// (docs/PARIDAD_MUNDOS.md, "Trigonometría: rediseño del mundo (fase 1)"), que
// solo tiene que poner el modo acá (y migrar skill_levels, duelos, reto diario,
// niveles de mundo y logros).
//
// Es presentación: no hay columna nueva en la base. Vive en su propio módulo
// (como src/lib/anatomia/grupos.ts) para que el contenido tipado (lecciones/)
// y el camino (path.ts) puedan importarlo sin ciclos.

export type GrupoTrigonometria = "razones" | "circulo" | "graficas" | "leyes" | "identidades" | "ecuaciones";

export interface BloqueTrigonometria {
  id: GrupoTrigonometria;
  // 1..6: el orden del currículo.
  numero: number;
  nombre: { es: string; en: string };
  descripcion: { es: string; en: string };
  // Modo de práctica que ejercita el bloque (o null si todavía no hay modo).
  modoPractica: ModoTrigonometria | null;
}

export const BLOQUES_TRIGONOMETRIA: BloqueTrigonometria[] = [
  {
    id: "razones",
    numero: 1,
    nombre: { es: "Razones en el triángulo rectángulo", en: "Ratios in the right triangle" },
    descripcion: {
      es: "Seno, coseno y tangente, recíprocas, hallar lados y ángulos, triángulos especiales y ángulos de elevación.",
      en: "Sine, cosine and tangent, reciprocals, finding sides and angles, special triangles and angles of elevation.",
    },
    modoPractica: "razones",
  },
  {
    id: "circulo",
    numero: 2,
    nombre: { es: "Ángulos y círculo unitario", en: "Angles and the unit circle" },
    descripcion: {
      es: "Cuadrantes, ángulos coterminales, radianes, valores exactos y signos.",
      en: "Quadrants, coterminal angles, radians, exact values and signs.",
    },
    modoPractica: "circulo",
  },
  {
    id: "graficas",
    numero: 3,
    nombre: { es: "Gráficas y periodo", en: "Graphs and period" },
    descripcion: {
      es: "Seno, coseno y tangente como funciones: amplitud, periodo, desfase y ecuación de una gráfica.",
      en: "Sine, cosine and tangent as functions: amplitude, period, phase shift and the equation of a graph.",
    },
    modoPractica: null,
  },
  {
    id: "leyes",
    numero: 4,
    nombre: { es: "Leyes de seno y coseno", en: "Laws of sines and cosines" },
    descripcion: {
      es: "Triángulos oblicuos: cuál ley usar, área con seno y el caso ambiguo.",
      en: "Oblique triangles: which law to use, area with sine and the ambiguous case.",
    },
    modoPractica: "leyes",
  },
  {
    id: "identidades",
    numero: 5,
    nombre: { es: "Identidades", en: "Identities" },
    descripcion: {
      es: "Recíprocas, cociente, pitagóricas, ángulo doble, suma y diferencia, y cómo verificar una identidad.",
      en: "Reciprocal, quotient, Pythagorean, double-angle, sum and difference, and how to verify an identity.",
    },
    modoPractica: "identidades",
  },
  {
    id: "ecuaciones",
    numero: 6,
    nombre: { es: "Ecuaciones trigonométricas", en: "Trigonometric equations" },
    descripcion: {
      es: "Ecuaciones básicas en [0, 2π), con funciones inversas, con identidades y con factorización.",
      en: "Basic equations in [0, 2π), with inverse functions, with identities and with factoring.",
    },
    modoPractica: null,
  },
];

// Orden del currículo (sidebar de Aprender, orden de las Clases).
export const ORDEN_GRUPOS_TRIGONOMETRIA: GrupoTrigonometria[] = BLOQUES_TRIGONOMETRIA.map((b) => b.id);

export const NOMBRES_GRUPOS_TRIGONOMETRIA: Record<GrupoTrigonometria, { es: string; en: string }> = Object.fromEntries(
  BLOQUES_TRIGONOMETRIA.map((b) => [b.id, b.nombre])
) as Record<GrupoTrigonometria, { es: string; en: string }>;

export function bloqueDeModo(modo: ModoTrigonometria): BloqueTrigonometria {
  const b = BLOQUES_TRIGONOMETRIA.find((x) => x.modoPractica === modo);
  if (!b) throw new Error(`Ningún bloque ejercita el modo ${modo}`);
  return b;
}

export function esGrupoTrigonometria(valor: unknown): valor is GrupoTrigonometria {
  return typeof valor === "string" && (ORDEN_GRUPOS_TRIGONOMETRIA as string[]).includes(valor);
}
