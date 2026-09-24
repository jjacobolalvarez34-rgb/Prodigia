// Catálogo de identidades trigonométricas con su FÓRMULA EN LaTeX y dos
// funciones numéricas (lado izquierdo y lado derecho) para verificarlas: los
// tests evalúan cada identidad en muchos ángulos (nunca "a ojo"), y las
// expresiones "equivalentes" y sus distractores se contrastan igual: la
// correcta coincide en todos los ángulos y cada distractor FALLA en alguno.
// Las lecciones y la práctica toman los textos de acá, así una identidad
// mal copiada no llega a la app sin que un test lo note.
//
// Las funciones reciben el ángulo en radianes.

const S = Math.sin;
const C = Math.cos;
const T = Math.tan;
const sec = (x: number): number => 1 / Math.cos(x);
const cosec = (x: number): number => 1 / Math.sin(x);
const cot = (x: number): number => 1 / Math.tan(x);

export interface Identidad {
  id: string;
  tex: string; // sin los $
  izq: (x: number) => number;
  der: (x: number) => number;
}

const SEN = "\\operatorname{sen}";
const COSEC = "\\operatorname{cosec}";

export const IDENTIDADES_BASE: Identidad[] = [
  { id: "pitagorica", tex: `${SEN}^{2}(x)+\\cos^{2}(x)=1`, izq: (x) => S(x) ** 2 + C(x) ** 2, der: () => 1 },
  { id: "pitagorica-tan", tex: `1+\\tan^{2}(x)=\\sec^{2}(x)`, izq: (x) => 1 + T(x) ** 2, der: (x) => sec(x) ** 2 },
  { id: "pitagorica-cot", tex: `1+\\cot^{2}(x)=${COSEC}^{2}(x)`, izq: (x) => 1 + cot(x) ** 2, der: (x) => cosec(x) ** 2 },
  { id: "recip-cosec", tex: `${COSEC}(x)=\\dfrac{1}{${SEN}(x)}`, izq: (x) => cosec(x), der: (x) => 1 / S(x) },
  { id: "recip-sec", tex: `\\sec(x)=\\dfrac{1}{\\cos(x)}`, izq: (x) => sec(x), der: (x) => 1 / C(x) },
  { id: "recip-cot", tex: `\\cot(x)=\\dfrac{1}{\\tan(x)}`, izq: (x) => cot(x), der: (x) => 1 / T(x) },
  { id: "cociente-tan", tex: `\\tan(x)=\\dfrac{${SEN}(x)}{\\cos(x)}`, izq: (x) => T(x), der: (x) => S(x) / C(x) },
  { id: "cociente-cot", tex: `\\cot(x)=\\dfrac{\\cos(x)}{${SEN}(x)}`, izq: (x) => cot(x), der: (x) => C(x) / S(x) },
  { id: "cofuncion-sen", tex: `${SEN}(90^{\\circ}-x)=\\cos(x)`, izq: (x) => S(Math.PI / 2 - x), der: (x) => C(x) },
  { id: "cofuncion-cos", tex: `\\cos(90^{\\circ}-x)=${SEN}(x)`, izq: (x) => C(Math.PI / 2 - x), der: (x) => S(x) },
  { id: "cofuncion-tan", tex: `\\tan(90^{\\circ}-x)=\\cot(x)`, izq: (x) => T(Math.PI / 2 - x), der: (x) => cot(x) },
  { id: "doble-sen", tex: `${SEN}(2x)=2\\,${SEN}(x)\\cos(x)`, izq: (x) => S(2 * x), der: (x) => 2 * S(x) * C(x) },
  { id: "doble-cos-1", tex: `\\cos(2x)=\\cos^{2}(x)-${SEN}^{2}(x)`, izq: (x) => C(2 * x), der: (x) => C(x) ** 2 - S(x) ** 2 },
  { id: "doble-cos-2", tex: `\\cos(2x)=2\\cos^{2}(x)-1`, izq: (x) => C(2 * x), der: (x) => 2 * C(x) ** 2 - 1 },
  { id: "doble-cos-3", tex: `\\cos(2x)=1-2\\,${SEN}^{2}(x)`, izq: (x) => C(2 * x), der: (x) => 1 - 2 * S(x) ** 2 },
  { id: "doble-tan", tex: `\\tan(2x)=\\dfrac{2\\tan(x)}{1-\\tan^{2}(x)}`, izq: (x) => T(2 * x), der: (x) => (2 * T(x)) / (1 - T(x) ** 2) },
];

// Identidades de dos ángulos (a, b): se verifican con pares de ángulos.
export interface IdentidadDos {
  id: string;
  tex: string;
  izq: (a: number, b: number) => number;
  der: (a: number, b: number) => number;
}

export const IDENTIDADES_DOS_ANGULOS: IdentidadDos[] = [
  { id: "suma-sen", tex: `${SEN}(a+b)=${SEN}(a)\\cos(b)+\\cos(a)${SEN}(b)`, izq: (a, b) => S(a + b), der: (a, b) => S(a) * C(b) + C(a) * S(b) },
  { id: "dif-sen", tex: `${SEN}(a-b)=${SEN}(a)\\cos(b)-\\cos(a)${SEN}(b)`, izq: (a, b) => S(a - b), der: (a, b) => S(a) * C(b) - C(a) * S(b) },
  { id: "suma-cos", tex: `\\cos(a+b)=\\cos(a)\\cos(b)-${SEN}(a)${SEN}(b)`, izq: (a, b) => C(a + b), der: (a, b) => C(a) * C(b) - S(a) * S(b) },
  { id: "dif-cos", tex: `\\cos(a-b)=\\cos(a)\\cos(b)+${SEN}(a)${SEN}(b)`, izq: (a, b) => C(a - b), der: (a, b) => C(a) * C(b) + S(a) * S(b) },
  { id: "suma-tan", tex: `\\tan(a+b)=\\dfrac{\\tan(a)+\\tan(b)}{1-\\tan(a)\\tan(b)}`, izq: (a, b) => T(a + b), der: (a, b) => (T(a) + T(b)) / (1 - T(a) * T(b)) },
  { id: "dif-tan", tex: `\\tan(a-b)=\\dfrac{\\tan(a)-\\tan(b)}{1+\\tan(a)\\tan(b)}`, izq: (a, b) => T(a - b), der: (a, b) => (T(a) - T(b)) / (1 + T(a) * T(b)) },
];

// Los ángulos (en grados) donde se verifican las identidades: ninguno es
// múltiplo de 15° ni de 90° (así ninguna razón está indefinida ni es 0 por casualidad).
export const ANGULOS_DE_PRUEBA_GRADOS = [7, 13, 17, 23, 29, 34, 38, 41, 52, 58, 64, 67, 71, 76, 83, 97, 112, 128, 143, 158, 171, 199, 217, 233, 251, 263, 287, 301, 322, 347];

// ---------- Expresiones equivalentes (práctica "equivalente" y lecciones) ----------
export interface Expresion {
  tex: string;
  f: (x: number) => number;
}

export interface Equivalencia {
  id: string;
  nivel: 0 | 1 | 2;
  expr: Expresion;
  correcta: Expresion;
  incorrectas: Expresion[];
}

const e = (tex: string, f: (x: number) => number): Expresion => ({ tex, f });

export const EQUIVALENCIAS: Equivalencia[] = [
  // ---- nivel 0: reciprocas, cociente y una pitagórica
  {
    id: "sen-cot",
    nivel: 0,
    expr: e(`${SEN}(x)\\cdot\\cot(x)`, (x) => S(x) * cot(x)),
    correcta: e("\\cos(x)", C),
    incorrectas: [e(`${SEN}(x)`, S), e("\\tan(x)", T), e(`${COSEC}(x)`, cosec)],
  },
  {
    id: "tan-cos",
    nivel: 0,
    expr: e("\\tan(x)\\cdot\\cos(x)", (x) => T(x) * C(x)),
    correcta: e(`${SEN}(x)`, S),
    incorrectas: [e("\\cos(x)", C), e("\\sec(x)", sec), e("1", () => 1)],
  },
  {
    id: "sen-sobre-tan",
    nivel: 0,
    expr: e(`\\dfrac{${SEN}(x)}{\\tan(x)}`, (x) => S(x) / T(x)),
    correcta: e("\\cos(x)", C),
    incorrectas: [e(`${COSEC}(x)`, cosec), e("\\sec(x)", sec), e("\\tan(x)", T)],
  },
  {
    id: "uno-menos-cos2",
    nivel: 0,
    expr: e("1-\\cos^{2}(x)", (x) => 1 - C(x) ** 2),
    correcta: e(`${SEN}^{2}(x)`, (x) => S(x) ** 2),
    incorrectas: [e("\\cos^{2}(x)", (x) => C(x) ** 2), e(`${SEN}(x)`, S), e("\\tan^{2}(x)", (x) => T(x) ** 2)],
  },
  {
    id: "uno-menos-sen2",
    nivel: 0,
    expr: e(`1-${SEN}^{2}(x)`, (x) => 1 - S(x) ** 2),
    correcta: e("\\cos^{2}(x)", (x) => C(x) ** 2),
    incorrectas: [e(`${SEN}^{2}(x)`, (x) => S(x) ** 2), e("\\cos(x)", C), e("1", () => 1)],
  },
  {
    id: "sec-cos",
    nivel: 0,
    expr: e("\\sec(x)\\cdot\\cos(x)", (x) => sec(x) * C(x)),
    correcta: e("1", () => 1),
    incorrectas: [e(`${SEN}(x)`, S), e("\\tan(x)", T), e("\\cos^{2}(x)", (x) => C(x) ** 2)],
  },
  {
    id: "cosec-tan",
    nivel: 0,
    expr: e(`${COSEC}(x)\\cdot\\tan(x)`, (x) => cosec(x) * T(x)),
    correcta: e("\\sec(x)", sec),
    incorrectas: [e(`${COSEC}(x)`, cosec), e("\\cot(x)", cot), e("1", () => 1)],
  },
  // ---- nivel 1: pitagóricas combinadas
  {
    id: "pit-mas-tan2",
    nivel: 1,
    expr: e(`${SEN}^{2}(x)+\\cos^{2}(x)+\\tan^{2}(x)`, (x) => S(x) ** 2 + C(x) ** 2 + T(x) ** 2),
    correcta: e("\\sec^{2}(x)", (x) => sec(x) ** 2),
    incorrectas: [e("1", () => 1), e("\\tan^{2}(x)", (x) => T(x) ** 2), e(`${COSEC}^{2}(x)`, (x) => cosec(x) ** 2)],
  },
  {
    id: "uno-menos-cos2-sobre-sen",
    nivel: 1,
    expr: e(`\\dfrac{1-\\cos^{2}(x)}{${SEN}(x)}`, (x) => (1 - C(x) ** 2) / S(x)),
    correcta: e(`${SEN}(x)`, S),
    incorrectas: [e("\\cos(x)", C), e("1", () => 1), e("\\tan(x)", T)],
  },
  {
    id: "uno-sobre-uno-mas-tan2",
    nivel: 1,
    expr: e("\\dfrac{1}{1+\\tan^{2}(x)}", (x) => 1 / (1 + T(x) ** 2)),
    correcta: e("\\cos^{2}(x)", (x) => C(x) ** 2),
    incorrectas: [e(`${SEN}^{2}(x)`, (x) => S(x) ** 2), e("\\sec^{2}(x)", (x) => sec(x) ** 2), e("1", () => 1)],
  },
  {
    id: "cuadrado-de-suma",
    nivel: 1,
    expr: e(`(${SEN}(x)+\\cos(x))^{2}-2\\,${SEN}(x)\\cos(x)`, (x) => (S(x) + C(x)) ** 2 - 2 * S(x) * C(x)),
    correcta: e("1", () => 1),
    incorrectas: [e(`1+2\\,${SEN}(x)\\cos(x)`, (x) => 1 + 2 * S(x) * C(x)), e(`${SEN}^{2}(x)-\\cos^{2}(x)`, (x) => S(x) ** 2 - C(x) ** 2), e("2", () => 2)],
  },
  {
    id: "cosec2-menos-cot2",
    nivel: 1,
    expr: e(`${COSEC}^{2}(x)-\\cot^{2}(x)`, (x) => cosec(x) ** 2 - cot(x) ** 2),
    correcta: e("1", () => 1),
    incorrectas: [e("0", () => 0), e(`${COSEC}(x)`, cosec), e("-1", () => -1)],
  },
  {
    id: "cos-por-tan-mas-cot",
    nivel: 1,
    expr: e("\\cos(x)\\,(\\tan(x)+\\cot(x))", (x) => C(x) * (T(x) + cot(x))),
    correcta: e(`${COSEC}(x)`, cosec),
    incorrectas: [e("\\sec(x)", sec), e("\\tan(x)", T), e("\\cot(x)", cot)],
  },
  // ---- nivel 2: ángulo doble
  {
    id: "cos2-sen2",
    nivel: 2,
    expr: e(`\\cos^{2}(x)-${SEN}^{2}(x)`, (x) => C(x) ** 2 - S(x) ** 2),
    correcta: e("\\cos(2x)", (x) => C(2 * x)),
    incorrectas: [e(`${SEN}(2x)`, (x) => S(2 * x)), e("2\\cos^{2}(x)", (x) => 2 * C(x) ** 2), e(`\\cos^{2}(x)+${SEN}^{2}(x)`, () => 1)],
  },
  {
    id: "un-medio-uno-menos-cos2x",
    nivel: 2,
    expr: e("\\dfrac{1-\\cos(2x)}{2}", (x) => (1 - C(2 * x)) / 2),
    correcta: e(`${SEN}^{2}(x)`, (x) => S(x) ** 2),
    incorrectas: [e("\\cos^{2}(x)", (x) => C(x) ** 2), e(`${SEN}(x)`, S), e(`\\dfrac{${SEN}(2x)}{2}`, (x) => S(2 * x) / 2)],
  },
  {
    id: "un-medio-uno-mas-cos2x",
    nivel: 2,
    expr: e("\\dfrac{1+\\cos(2x)}{2}", (x) => (1 + C(2 * x)) / 2),
    correcta: e("\\cos^{2}(x)", (x) => C(x) ** 2),
    incorrectas: [e(`${SEN}^{2}(x)`, (x) => S(x) ** 2), e("\\cos(x)", C), e(`\\dfrac{${SEN}(2x)}{2}`, (x) => S(2 * x) / 2)],
  },
  {
    id: "sen2x-sobre-2senx",
    nivel: 2,
    expr: e(`\\dfrac{${SEN}(2x)}{2\\,${SEN}(x)}`, (x) => S(2 * x) / (2 * S(x))),
    correcta: e("\\cos(x)", C),
    incorrectas: [e(`${SEN}(x)`, S), e("\\cos(2x)", (x) => C(2 * x)), e("1", () => 1)],
  },
  {
    id: "tan-doble-trampa",
    nivel: 2,
    expr: e("\\dfrac{2\\tan(x)}{1-\\tan^{2}(x)}", (x) => (2 * T(x)) / (1 - T(x) ** 2)),
    correcta: e("\\tan(2x)", (x) => T(2 * x)),
    incorrectas: [e("2\\tan(x)", (x) => 2 * T(x)), e(`${SEN}(2x)`, (x) => S(2 * x)), e("\\dfrac{2\\tan(x)}{1+\\tan^{2}(x)}", (x) => (2 * T(x)) / (1 + T(x) ** 2))],
  },
  {
    id: "sen2x-sobre-cos",
    nivel: 2,
    expr: e(`\\dfrac{${SEN}(2x)}{\\cos(x)}`, (x) => S(2 * x) / C(x)),
    correcta: e(`2\\,${SEN}(x)`, (x) => 2 * S(x)),
    incorrectas: [e(`${SEN}(x)`, S), e("2\\cos(x)", (x) => 2 * C(x)), e("\\tan(2x)", (x) => T(2 * x))],
  },
];
