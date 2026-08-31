// Mundo Trigonometría — 4 modos de dificultad creciente (nivel 1-10 vía
// skill_levels, igual que el resto de los mundos): razones básicas
// (SOHCAHTOA sobre triángulos rectángulos con lados enteros), círculo
// unitario (valores exactos, no aproximados — nunca decimales),
// identidades (pitagórica/ángulo doble/complementarios, resueltas por
// sustitución con ángulos notables, nunca un parser simbólico — no
// existe ninguno en todo el codebase, ver auditoría previa a esta
// tanda) y leyes de seno/coseno (triángulos oblicuos reales). Sin
// semilla compartida entre rivales de duelo — mismo criterio que
// Enigmia/Geografía/Anatomía/Melodía (Numeria y Quimia son la
// excepción con semilla, no la regla, ver src/lib/duelos/rutas.ts).

export type ModoTrigonometria = "razones" | "circulo" | "identidades" | "leyes";

export const NOMBRE_MODO_TRIGONOMETRIA: Record<ModoTrigonometria, string> = {
  razones: "Razones básicas",
  circulo: "Círculo unitario",
  identidades: "Identidades",
  leyes: "Leyes de seno y coseno",
};

// Geometría de un triángulo para el diagrama (TrianguloSVG) — SIEMPRE
// los 3 lados y los 3 ángulos reales (nunca solo los "dados" del
// enunciado), así el dibujo queda geométricamente correcto incluso
// cuando uno de esos valores es la incógnita — `ocultar` es el único
// que le dice al SVG qué etiqueta reemplazar por "?" en vez de mostrar
// el número. Convención estándar: ladoA opuesto a anguloA, etc.
export interface TrianguloDiagrama {
  ladoA: number;
  ladoB: number;
  ladoC: number;
  anguloA: number;
  anguloB: number;
  anguloC: number;
  ocultar?: "ladoA" | "ladoB" | "ladoC";
  marcarRectoEn?: "A" | "B" | "C";
}

interface ProblemaBase {
  enunciado: string;
  triangulo?: TrianguloDiagrama;
}

export interface ProblemaTrigonometriaNumero extends ProblemaBase {
  modo: "razones" | "leyes";
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export interface ProblemaTrigonometriaOpciones extends ProblemaBase {
  modo: "circulo" | "identidades";
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export type ProblemaTrigonometria = ProblemaTrigonometriaNumero | ProblemaTrigonometriaOpciones;

// Sin semilla en la práctica normal (Math.random por default) — pero
// Reto Diario sí necesita que las 45 preguntas del día sean idénticas
// para cualquiera que las genere (mismo criterio determinístico que
// Melodía). En vez de pasar un `rng` por parámetro a cada función de
// acá (reescribiría toda la firma interna), se usa el mismo patrón de
// melodia.ts: una referencia mutable a nivel de módulo que
// conRngSembrado() reemplaza temporalmente durante la llamada.
let rngActual: () => number = Math.random;

export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

function opcionesConDistractores(correcta: string, pool: string[], cantidad = 4): string[] {
  const distractores = Array.from(new Set(pool.filter((x) => x !== correcta)));
  const elegidos: string[] = [];
  const disponibles = [...distractores];
  while (elegidos.length < cantidad - 1 && disponibles.length > 0) {
    const idx = Math.floor(rngActual() * disponibles.length);
    elegidos.push(disponibles.splice(idx, 1)[0]);
  }
  const opciones = [correcta, ...elegidos];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}

function gradosARad(g: number): number {
  return (g * Math.PI) / 180;
}

function radAGrados(r: number): number {
  return (r * 180) / Math.PI;
}

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- Modo 1: Razones básicas (SOHCAHTOA) ----------
// Ternas pitagóricas escaladas (mismo banco que Numeria/Geometría,
// src/lib/practica/geometria.ts) — lados siempre enteros, así sen/cos/
// tan dan un decimal limpio de calcular a mano con calculadora.
const TERNAS_PITAGORICAS: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

function generarRazones(nivel: number): ProblemaTrigonometriaNumero {
  const [a0, b0, c0] = TERNAS_PITAGORICAS[randomInt(0, TERNAS_PITAGORICAS.length - 1)];
  const factorMax = 1 + Math.min(2, Math.floor((nivel - 1) / 1)); // nivel 1-3 -> factor hasta 1-3
  const factor = randomInt(1, Math.max(1, factorMax));
  const opuesto = a0 * factor;
  const adyacente = b0 * factor;
  const hipotenusa = c0 * factor;
  const anguloA = Math.round(radAGrados(Math.asin(opuesto / hipotenusa)));

  const funciones = ["sen", "cos", "tan"] as const;
  const fn = funciones[randomInt(0, 2)];
  let respuesta: number;
  if (fn === "sen") respuesta = opuesto / hipotenusa;
  else if (fn === "cos") respuesta = adyacente / hipotenusa;
  else respuesta = opuesto / adyacente;

  return {
    modo: "razones",
    entrada: "numero",
    enunciado: `En este triángulo rectángulo, ¿cuánto es ${fn}(A)? Redondeá a 2 decimales.`,
    respuesta: redondear2(respuesta),
    tolerancia: 0.01,
    triangulo: {
      ladoA: opuesto,
      ladoB: adyacente,
      ladoC: hipotenusa,
      anguloA,
      anguloB: 90 - anguloA,
      anguloC: 90,
      marcarRectoEn: "C",
    },
  };
}

// ---------- Modo 2: Círculo unitario ----------
// Valores exactos reales (no aproximados) para los 12 ángulos notables
// de una vuelta completa, en los 4 cuadrantes — verificados a mano
// (signo por cuadrante, referencia 30/45/60). Nunca se pide un
// decimal acá: la respuesta siempre es uno de estos strings.
interface ValorAngulo {
  grados: number;
  radianLabel: string;
  sen: string;
  cos: string;
  tan: string;
}

const TABLA_CIRCULO: ValorAngulo[] = [
  { grados: 0, radianLabel: "0", sen: "0", cos: "1", tan: "0" },
  { grados: 30, radianLabel: "π/6", sen: "1/2", cos: "√3/2", tan: "√3/3" },
  { grados: 45, radianLabel: "π/4", sen: "√2/2", cos: "√2/2", tan: "1" },
  { grados: 60, radianLabel: "π/3", sen: "√3/2", cos: "1/2", tan: "√3" },
  { grados: 90, radianLabel: "π/2", sen: "1", cos: "0", tan: "indefinido" },
  { grados: 120, radianLabel: "2π/3", sen: "√3/2", cos: "-1/2", tan: "-√3" },
  { grados: 135, radianLabel: "3π/4", sen: "√2/2", cos: "-√2/2", tan: "-1" },
  { grados: 150, radianLabel: "5π/6", sen: "1/2", cos: "-√3/2", tan: "-√3/3" },
  { grados: 180, radianLabel: "π", sen: "0", cos: "-1", tan: "0" },
  { grados: 210, radianLabel: "7π/6", sen: "-1/2", cos: "-√3/2", tan: "√3/3" },
  { grados: 225, radianLabel: "5π/4", sen: "-√2/2", cos: "-√2/2", tan: "1" },
  { grados: 240, radianLabel: "4π/3", sen: "-√3/2", cos: "-1/2", tan: "√3" },
  { grados: 270, radianLabel: "3π/2", sen: "-1", cos: "0", tan: "indefinido" },
  { grados: 300, radianLabel: "5π/3", sen: "-√3/2", cos: "1/2", tan: "-√3" },
  { grados: 315, radianLabel: "7π/4", sen: "-√2/2", cos: "√2/2", tan: "-1" },
  { grados: 330, radianLabel: "11π/6", sen: "-1/2", cos: "√3/2", tan: "-√3/3" },
];

const VALORES_Q1 = TABLA_CIRCULO.filter((v) => v.grados <= 90);

function bandaCirculoMaxGrados(nivel: number): number {
  if (nivel <= 3) return 90;
  if (nivel <= 5) return 180;
  if (nivel <= 7) return 270;
  return 330;
}

function generarCirculo(nivel: number): ProblemaTrigonometriaOpciones {
  const max = bandaCirculoMaxGrados(nivel);
  const candidatos = TABLA_CIRCULO.filter((v) => v.grados <= max);
  const entrada = candidatos[randomInt(0, candidatos.length - 1)];
  const funciones = ["sen", "cos", "tan"] as const;
  const fn = funciones[randomInt(0, 2)];
  const respuesta = entrada[fn];
  const enGrados = rngActual() < 0.5;
  const anguloTexto = enGrados ? `${entrada.grados}°` : entrada.radianLabel;
  const pool = TABLA_CIRCULO.map((v) => v[fn]);

  return {
    modo: "circulo",
    entrada: "opciones",
    enunciado: `¿Cuánto es ${fn}(${anguloTexto})? Valor exacto, no aproximado.`,
    opciones: opcionesConDistractores(respuesta, pool),
    respuesta,
  };
}

// ---------- Modo 3: Identidades ----------
// 3 sub-tipos, todos resueltos por sustitución con ángulos notables
// del propio círculo unitario de arriba (nunca un parser simbólico
// libre) — cada uno tiene una única respuesta exacta sin ambigüedad.
function generarPitagorica(): ProblemaTrigonometriaOpciones {
  const notables = VALORES_Q1.filter((v) => v.grados !== 0 && v.grados !== 90);
  const entrada = notables[randomInt(0, notables.length - 1)];
  const darSeno = rngActual() < 0.5;
  const dado = darSeno ? entrada.sen : entrada.cos;
  const buscado = darSeno ? entrada.cos : entrada.sen;
  const nombreDado = darSeno ? "sen" : "cos";
  const nombreBuscado = darSeno ? "cos" : "sen";
  const pool = VALORES_Q1.map((v) => (darSeno ? v.cos : v.sen));

  return {
    modo: "identidades",
    entrada: "opciones",
    enunciado: `Si ${nombreDado}(θ) = ${dado} y θ está en el primer cuadrante, ¿cuánto vale ${nombreBuscado}(θ)? Usá sen²(θ) + cos²(θ) = 1.`,
    opciones: opcionesConDistractores(buscado, pool),
    respuesta: buscado,
  };
}

function generarAnguloDoble(): ProblemaTrigonometriaOpciones {
  const base = [30, 45, 60][randomInt(0, 2)];
  const doble = TABLA_CIRCULO.find((v) => v.grados === base * 2)!;
  const pool = TABLA_CIRCULO.map((v) => v.sen);

  return {
    modo: "identidades",
    entrada: "opciones",
    enunciado: `Si θ = ${base}°, ¿cuánto vale sen(2θ)?`,
    opciones: opcionesConDistractores(doble.sen, pool),
    respuesta: doble.sen,
  };
}

function generarComplementario(): ProblemaTrigonometriaOpciones {
  const notables = VALORES_Q1.filter((v) => v.grados !== 90);
  const entrada = notables[randomInt(0, notables.length - 1)];
  const pool = VALORES_Q1.map((v) => v.cos);

  return {
    modo: "identidades",
    entrada: "opciones",
    enunciado: `¿Cuánto vale sen(90° − ${entrada.grados}°)? Usá sen(90° − x) = cos(x).`,
    opciones: opcionesConDistractores(entrada.cos, pool),
    respuesta: entrada.cos,
  };
}

function generarIdentidades(nivel: number): ProblemaTrigonometriaOpciones {
  if (nivel < 7) {
    return rngActual() < 0.5 ? generarPitagorica() : generarComplementario();
  }
  const r = rngActual();
  if (r < 0.34) return generarPitagorica();
  if (r < 0.67) return generarComplementario();
  return generarAnguloDoble();
}

// ---------- Modo 4: Leyes de seno y coseno ----------
// Triángulos oblicuos reales (no rectángulos) — ley del coseno (SAS,
// se pide el lado faltante) o ley del seno (ASA/AAS, nunca SSA para no
// caer en el caso ambiguo de 2 soluciones posibles).
function generarLeyCoseno(): ProblemaTrigonometriaNumero {
  const a = randomInt(4, 15);
  const b = randomInt(4, 15);
  const anguloCgrados = randomInt(30, 150);
  const C = gradosARad(anguloCgrados);
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
  const senA = Math.min(1, Math.max(-1, (a * Math.sin(C)) / c));
  const A = Math.round(radAGrados(Math.asin(senA)));
  const B = 180 - anguloCgrados - A;
  const respuesta = redondear2(c);

  return {
    modo: "leyes",
    entrada: "numero",
    enunciado: `Un triángulo tiene dos lados de ${a} y ${b}, con un ángulo de ${anguloCgrados}° entre ellos. ¿Cuánto mide el tercer lado? Ley del coseno, redondeá a 2 decimales.`,
    respuesta,
    tolerancia: Math.max(0.1, respuesta * 0.01),
    triangulo: { ladoA: a, ladoB: b, ladoC: respuesta, anguloA: A, anguloB: B, anguloC: anguloCgrados, ocultar: "ladoC" },
  };
}

function generarLeySeno(): ProblemaTrigonometriaNumero {
  const A = randomInt(30, 100);
  let B = randomInt(30, 100);
  while (A + B >= 150) {
    B = randomInt(30, 100);
  }
  const C = 180 - A - B;
  const a = randomInt(5, 20);
  const factor = a / Math.sin(gradosARad(A));
  const b = factor * Math.sin(gradosARad(B));
  const c = factor * Math.sin(gradosARad(C));
  const respuesta = redondear2(b);

  return {
    modo: "leyes",
    entrada: "numero",
    enunciado: `Un triángulo tiene ángulos de ${A}° y ${B}°, y el lado opuesto al primer ángulo mide ${a}. ¿Cuánto mide el lado opuesto al segundo ángulo? Ley del seno, redondeá a 2 decimales.`,
    respuesta,
    tolerancia: Math.max(0.1, respuesta * 0.01),
    triangulo: { ladoA: a, ladoB: respuesta, ladoC: redondear2(c), anguloA: A, anguloB: B, anguloC: C, ocultar: "ladoB" },
  };
}

function generarLeyes(): ProblemaTrigonometriaNumero {
  return rngActual() < 0.5 ? generarLeyCoseno() : generarLeySeno();
}

export function generarProblemaTrigonometria(modo: ModoTrigonometria, nivel: number): ProblemaTrigonometria {
  if (modo === "razones") return generarRazones(nivel);
  if (modo === "circulo") return generarCirculo(nivel);
  if (modo === "identidades") return generarIdentidades(nivel);
  return generarLeyes();
}
