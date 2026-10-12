// Fase 1 ("Geometría básica" — activación de Numeria): mismo espíritu
// que el resto de /practica — técnicas MENTALES, no enseñar geometría
// desde cero. 4 sub-temas independientes, mismo patrón de calibración
// por sub-tema que fracciones/decimales/potencias/algebra (Fase 2).

export type TipoGeometria = "perimetro" | "area" | "angulos" | "ternas";

export interface ProblemaGeometria {
  tipo: TipoGeometria;
  enunciado: string;
  respuesta: number;
  tolerancia: number;
  // «Cómo se resuelve» para el repaso de errores (repaso.ts).
  pasos?: string[];
}

const fmt = (x: number) => x.toLocaleString("es", { maximumFractionDigits: 2 });

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// ---------- Perímetro: figuras simples -> compuestas ----------
function generarPerimetro(nivel: number): ProblemaGeometria {
  const i = banda(nivel);
  if (i < 3) {
    const forma = randomInt(0, 2);
    if (forma === 0) {
      const lado = randomInt(3, 8 + i * 3);
      return { tipo: "perimetro", enunciado: `Perímetro de un cuadrado de lado ${lado}`, respuesta: lado * 4, tolerancia: 0, pasos: [`El cuadrado tiene 4 lados iguales: ${lado} × 4 = ${lado * 4}`] };
    }
    if (forma === 1) {
      const base = randomInt(4, 10 + i * 3);
      const altura = randomInt(3, 8 + i * 2);
      return {
        tipo: "perimetro",
        enunciado: `Perímetro de un rectángulo de ${base} × ${altura}`,
        respuesta: 2 * (base + altura),
        tolerancia: 0,
        pasos: [`Suma un largo y un ancho: ${base} + ${altura} = ${base + altura}`, `El rectángulo tiene dos de cada uno: ${base + altura} × 2 = ${2 * (base + altura)}`],
      };
    }
    const a = randomInt(3, 10 + i * 2);
    const b = randomInt(3, 10 + i * 2);
    const c = randomInt(3, 10 + i * 2);
    return { tipo: "perimetro", enunciado: `Perímetro de un triángulo de lados ${a}, ${b} y ${c}`, respuesta: a + b + c, tolerancia: 0, pasos: [`Suma los tres lados: ${a} + ${b} + ${c} = ${a + b + c}`] };
  }
  // Compuesta: figura en L — el truco mental es que su perímetro es
  // IDÉNTICO al del rectángulo que la contiene (los segmentos que se
  // "meten" hacia adentro se cancelan con los que salen).
  const base = randomInt(8, 16);
  const altura = randomInt(6, 14);
  return {
    tipo: "perimetro",
    enunciado: `Una figura en L cabe justo en un rectángulo de ${base} × ${altura} (le falta un rectángulo en una esquina). ¿Cuál es su perímetro?`,
    respuesta: 2 * (base + altura),
    tolerancia: 0,
    pasos: [
      `Los lados que entran en la esquina recortada miden lo mismo que los que faltan: el perímetro es el del rectángulo de ${base} × ${altura}`,
      `(${base} + ${altura}) × 2 = ${2 * (base + altura)}`,
    ],
  };
}

// ---------- Área: rectángulo/triángulo/círculo -> compuestas ----------
function generarArea(nivel: number): ProblemaGeometria {
  const i = banda(nivel);
  if (i < 3) {
    const forma = randomInt(0, 2);
    if (forma === 0) {
      const base = randomInt(3, 10 + i * 3);
      const altura = randomInt(3, 10 + i * 3);
      return { tipo: "area", enunciado: `Área de un rectángulo de ${base} × ${altura}`, respuesta: base * altura, tolerancia: 0, pasos: [`Área del rectángulo = base × altura`, `${base} × ${altura} = ${base * altura}`] };
    }
    if (forma === 1) {
      const base = randomInt(4, 12 + i * 2) * 2; // par, para que /2 dé entero
      const altura = randomInt(3, 10 + i * 2);
      return {
        tipo: "area",
        enunciado: `Área de un triángulo de base ${base} y altura ${altura}`,
        respuesta: (base * altura) / 2,
        tolerancia: 0,
        pasos: [`Área del triángulo = base × altura ÷ 2`, `${base} × ${altura} = ${base * altura}`, `${base * altura} ÷ 2 = ${(base * altura) / 2}`],
      };
    }
    const radio = randomInt(2, 6 + i);
    return {
      tipo: "area",
      enunciado: `Área de un círculo de radio ${radio} (usa π ≈ 3.14)`,
      respuesta: Math.round(3.14 * radio * radio * 100) / 100,
      tolerancia: 0.1,
      pasos: [`Área del círculo = π × radio²`, `${radio}² = ${radio} × ${radio} = ${radio * radio}`, `3,14 × ${radio * radio} = ${fmt(Math.round(3.14 * radio * radio * 100) / 100)}`],
    };
  }
  // Compuesta: rectángulo grande menos un rectángulo chico (esquina
  // faltante) — "divide en partes simples", el mismo truco que la
  // lección de Aprender.
  const baseGrande = randomInt(10, 18);
  const alturaGrande = randomInt(8, 14);
  const baseChica = randomInt(2, Math.floor(baseGrande / 2));
  const alturaChica = randomInt(2, Math.floor(alturaGrande / 2));
  return {
    tipo: "area",
    enunciado: `Un rectángulo de ${baseGrande} × ${alturaGrande} tiene un rectángulo de ${baseChica} × ${alturaChica} recortado en una esquina. ¿Cuál es el área que queda?`,
    respuesta: baseGrande * alturaGrande - baseChica * alturaChica,
    tolerancia: 0,
    pasos: [
      `Área del rectángulo grande: ${baseGrande} × ${alturaGrande} = ${baseGrande * alturaGrande}`,
      `Área del recorte: ${baseChica} × ${alturaChica} = ${baseChica * alturaChica}`,
      `Resta: ${baseGrande * alturaGrande} − ${baseChica * alturaChica} = ${baseGrande * alturaGrande - baseChica * alturaChica}`,
    ],
  };
}

// ---------- Ángulos: complementarios / suplementarios ----------
function generarAngulos(nivel: number): ProblemaGeometria {
  const i = banda(nivel);
  const suplementario = Math.random() < 0.5;
  const total = suplementario ? 180 : 90;
  const paso = i < 2 ? 5 : 1; // niveles bajos: múltiplos de 5, más fácil de calcular
  const maxAngulo = total - paso;
  const angulo = randomInt(1, Math.floor(maxAngulo / paso)) * paso;
  return {
    tipo: "angulos",
    enunciado: `Dos ángulos son ${suplementario ? "suplementarios" : "complementarios"} (suman ${total}°). Uno mide ${angulo}°. ¿Cuánto mide el otro?`,
    respuesta: total - angulo,
    tolerancia: 0,
    pasos: [`Los ángulos ${suplementario ? "suplementarios" : "complementarios"} suman ${total}°`, `${total}° − ${angulo}° = ${total - angulo}°`],
  };
}

// ---------- Ternas pitagóricas: reconocer, no calcular raíz ----------
const TERNAS_BASE: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
];

// Ternas pitagóricas: se reconoce la terna base y su múltiplo, sin sacar raíces.
function pasosTerna(a: number, b: number, c: number, factor: number, queMide: string, original: number, valor: number): string[] {
  const terna = `${a}, ${b} y ${c} forman un triángulo rectángulo porque ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} = ${c}²`;
  if (factor === 1) return [terna, `Así que ${queMide} ${valor}`];
  return [`Estos lados son los de la terna ${a}, ${b}, ${c} multiplicados por ${factor}`, terna, `Entonces ${queMide} ${original} × ${factor} = ${valor}`];
}

function generarTernas(nivel: number): ProblemaGeometria {
  const i = banda(nivel);
  const [a0, b0, c0] = TERNAS_BASE[randomInt(0, TERNAS_BASE.length - 1)];
  const factor = randomInt(1, 2 + i); // nivel alto = factores más grandes, sigue siendo patrón, no cálculo
  const [cateto1, cateto2, hipotenusa] = [a0 * factor, b0 * factor, c0 * factor];

  // Niveles bajos: siempre pedimos la hipotenusa (lo más intuitivo).
  // Niveles altos: a veces pedimos un cateto dados el otro cateto y la
  // hipotenusa — mismo patrón, hay que reconocerlo "al revés".
  const pedirCateto = i >= 3 && Math.random() < 0.4;
  if (pedirCateto) {
    return {
      tipo: "ternas",
      enunciado: `Un triángulo rectángulo tiene un cateto de ${cateto1} y la hipotenusa mide ${hipotenusa}. ¿Cuánto mide el otro cateto?`,
      respuesta: cateto2,
      tolerancia: 0,
      pasos: pasosTerna(a0, b0, c0, factor, "el otro cateto mide", b0, cateto2),
    };
  }
  return {
    tipo: "ternas",
    enunciado: `Un triángulo rectángulo tiene catetos de ${cateto1} y ${cateto2}. ¿Cuánto mide la hipotenusa?`,
    respuesta: hipotenusa,
    tolerancia: 0,
    pasos: pasosTerna(a0, b0, c0, factor, "la hipotenusa mide", c0, hipotenusa),
  };
}

const GENERADORES: Record<TipoGeometria, (nivel: number) => ProblemaGeometria> = {
  perimetro: generarPerimetro,
  area: generarArea,
  angulos: generarAngulos,
  ternas: generarTernas,
};

export const TIPOS_GEOMETRIA: TipoGeometria[] = ["perimetro", "area", "angulos", "ternas"];

export function generarProblemaGeometria(
  nivelPorTipo: Record<TipoGeometria, number>,
  tipos: TipoGeometria[] = TIPOS_GEOMETRIA
): ProblemaGeometria {
  const disponibles = tipos.length > 0 ? tipos : TIPOS_GEOMETRIA;
  const tipo = disponibles[Math.floor(Math.random() * disponibles.length)];
  return GENERADORES[tipo](nivelPorTipo[tipo]);
}
