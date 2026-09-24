import type { VisualBase } from "@/lib/aprender/visuales";

// Visuales propios de Trigonometría (prefijo "trigonometria."), mismo criterio
// que Numeria/Quimia/Anatomía/Melodía: cada componente
// (src/components/trigonometria/visuales/) solo DIBUJA lo que calculó una
// función pura de src/lib/trigonometria/ (visualesDatos.ts, que usa
// exactos.ts, triangulos.ts y ondas.ts) — ningún valor ni coordenada está
// escrito a mano en el componente ni en el JSON de la lección más allá de los
// DATOS de entrada (qué ángulo, qué lados, qué onda).
//
// Para AGREGAR un visual nuevo: 1) su tipo acá y en la unión VisualTrigonometria,
// 2) su función de datos en visualesDatos.ts (con test), 3) el componente en
// src/components/trigonometria/visuales/ y su entrada en registro.ts, 4) las
// claves de Trigonometria.visuales.<nombre> en messages/es.json y en.json.

// Un número o una fracción [numerador, denominador]: 2, 0.5 no (los decimales
// se evitan: usa [1, 2]). Sirve para a, b, d y para los desfases (en múltiplos de π).
export type NumeroJson = number | [number, number];

export interface OndaJson {
  fn: "sen" | "cos" | "tan";
  // y = a · f(b · (x − c)) + d, con c en múltiplos de π (por defecto a = 1, b = 1, c = 0, d = 0).
  a?: NumeroJson;
  b?: NumeroJson;
  c?: NumeroJson;
  d?: NumeroJson;
}

// ---------- triángulo rectángulo: lados relativos y razones ----------
export type PasoTriangulo = "hipotenusa" | "opuesto" | "adyacente" | "sen" | "cos" | "tan" | "cosec" | "sec" | "cot";

// Triángulo rectángulo (recto en C) con los catetos a (vertical) y b
// (horizontal); resalta, paso a paso, los lados según el ángulo elegido y arma
// las razones con los números reales. `vertice` es el ángulo desde el que se
// nombran opuesto y adyacente.
export interface VisualTrigonometriaTriangulo extends VisualBase {
  tipo: "trigonometria.triangulo";
  catetos: [number, number];
  vertice: "A" | "B";
  // Por defecto: hipotenusa, opuesto, adyacente, sen, cos, tan.
  pasos?: PasoTriangulo[];
}

// ---------- resolver un triángulo rectángulo (hallar un lado o un ángulo) ----------
export type LadoRectangulo = "a" | "b" | "c";

export interface VisualTrigonometriaResolverLado extends VisualBase {
  tipo: "trigonometria.resolver";
  modo: "lado";
  // Ángulo A (grados), un lado conocido y el que se pide (a opuesto a A, b adyacente a A, c hipotenusa).
  angulo: number;
  dado: LadoRectangulo;
  valor: number;
  pedido: LadoRectangulo;
}

export interface VisualTrigonometriaResolverAngulo extends VisualBase {
  tipo: "trigonometria.resolver";
  modo: "angulo";
  // Dos lados conocidos (letras distintas) y se pide el ángulo A.
  lados: [{ lado: LadoRectangulo; valor: number }, { lado: LadoRectangulo; valor: number }];
}

export type VisualTrigonometriaResolver = VisualTrigonometriaResolverLado | VisualTrigonometriaResolverAngulo;

// ---------- círculo unitario ----------
// Un ángulo por paso (en grados, múltiplos de 15; puede ser negativo o mayor
// que 360): el radio barre hasta él y se ven el punto (cos θ, sen θ), sus
// proyecciones y los valores exactos.
export interface VisualTrigonometriaCirculo extends VisualBase {
  tipo: "trigonometria.circulo";
  angulos: number[];
  unidad?: "grados" | "radianes" | "ambas";
  // "referencia": dibuja y nombra el ángulo de referencia.
  mostrar?: ("referencia")[];
  // false = solo el ángulo (sin proyecciones ni valores de cos, sen y tan): para las
  // lecciones que hablan de cuadrantes o radianes antes de definir las razones.
  valores?: boolean;
}

// ---------- cuadrantes y signos (Todos, Seno, Tangente, Coseno) ----------
export interface VisualTrigonometriaCuadrantes extends VisualBase {
  tipo: "trigonometria.cuadrantes";
  // Ángulo de referencia del ejemplo: en cada cuadrante se ubica el ángulo con esa referencia.
  referencia: 30 | 45 | 60;
}

// ---------- ondas: seno, coseno y tangente ----------
export type PasoOnda = "curva" | "amplitud" | "periodo" | "desfase" | "vertical" | "puntos" | "asintotas";

export interface VisualTrigonometriaOnda extends VisualBase {
  tipo: "trigonometria.onda";
  onda: OndaJson;
  // Curva de referencia punteada (por ejemplo y = sen x) para comparar.
  base?: OndaJson;
  // Rango del eje x en múltiplos de π: [desde, hasta].
  rango: [NumeroJson, NumeroJson];
  // Por defecto: ["curva"]. Cada paso agrega una marca a la gráfica (acumulativo).
  pasos?: PasoOnda[];
}

// ---------- leyes de seno y coseno (triángulo oblicuo) ----------
export interface DatosLey {
  a?: number;
  b?: number;
  A?: number;
  B?: number;
  C?: number;
}

// seno: A, B y a (ASA/AAS). coseno: a, b y C (SAS). area: a, b y C. ambiguo: a, b y A (SSA).
export interface VisualTrigonometriaLey extends VisualBase {
  tipo: "trigonometria.ley";
  ley: "seno" | "coseno" | "area" | "ambiguo";
  datos: DatosLey;
}

// ---------- ecuación trigonométrica básica en [0, 2π) ----------
// Resuelve fn(x) = fn(gradosValor°): la gráfica con una recta, los cortes y los puntos del círculo.
export interface VisualTrigonometriaEcuacion extends VisualBase {
  tipo: "trigonometria.ecuacion";
  fn: "sen" | "cos" | "tan";
  gradosValor: number;
}

// ---------- identidad pitagórica sobre el círculo ----------
export interface VisualTrigonometriaIdentidad extends VisualBase {
  tipo: "trigonometria.identidad";
  // Ángulo agudo (grados, múltiplo de 15).
  angulo: number;
  // "pitagorica" (sen² + cos² = 1); "derivadas" agrega 1 + tan² = sec² y 1 + cot² = cosec².
  forma?: "pitagorica" | "derivadas";
}

// ---------- el truco de la mano (componente interactivo) ----------
export interface VisualTrigonometriaMano extends VisualBase {
  tipo: "trigonometria.mano";
}

export type VisualTrigonometria =
  | VisualTrigonometriaTriangulo
  | VisualTrigonometriaResolver
  | VisualTrigonometriaCirculo
  | VisualTrigonometriaCuadrantes
  | VisualTrigonometriaOnda
  | VisualTrigonometriaLey
  | VisualTrigonometriaEcuacion
  | VisualTrigonometriaIdentidad
  | VisualTrigonometriaMano;

export const TIPOS_VISUAL_TRIGONOMETRIA = [
  "trigonometria.triangulo",
  "trigonometria.resolver",
  "trigonometria.circulo",
  "trigonometria.cuadrantes",
  "trigonometria.onda",
  "trigonometria.ley",
  "trigonometria.ecuacion",
  "trigonometria.identidad",
  "trigonometria.mano",
] as const;
