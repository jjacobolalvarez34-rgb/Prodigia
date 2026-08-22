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
}

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
      return { tipo: "perimetro", enunciado: `Perímetro de un cuadrado de lado ${lado}`, respuesta: lado * 4, tolerancia: 0 };
    }
    if (forma === 1) {
      const base = randomInt(4, 10 + i * 3);
      const altura = randomInt(3, 8 + i * 2);
      return {
        tipo: "perimetro",
        enunciado: `Perímetro de un rectángulo de ${base} × ${altura}`,
        respuesta: 2 * (base + altura),
        tolerancia: 0,
      };
    }
    const a = randomInt(3, 10 + i * 2);
    const b = randomInt(3, 10 + i * 2);
    const c = randomInt(3, 10 + i * 2);
    return { tipo: "perimetro", enunciado: `Perímetro de un triángulo de lados ${a}, ${b} y ${c}`, respuesta: a + b + c, tolerancia: 0 };
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
      return { tipo: "area", enunciado: `Área de un rectángulo de ${base} × ${altura}`, respuesta: base * altura, tolerancia: 0 };
    }
    if (forma === 1) {
      const base = randomInt(4, 12 + i * 2) * 2; // par, para que /2 dé entero
      const altura = randomInt(3, 10 + i * 2);
      return {
        tipo: "area",
        enunciado: `Área de un triángulo de base ${base} y altura ${altura}`,
        respuesta: (base * altura) / 2,
        tolerancia: 0,
      };
    }
    const radio = randomInt(2, 6 + i);
    return {
      tipo: "area",
      enunciado: `Área de un círculo de radio ${radio} (usá π ≈ 3.14)`,
      respuesta: Math.round(3.14 * radio * radio * 100) / 100,
      tolerancia: 0.1,
    };
  }
  // Compuesta: rectángulo grande menos un rectángulo chico (esquina
  // faltante) — "dividí en partes simples", el mismo truco que la
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
  };
}

// ---------- Ternas pitagóricas: reconocer, no calcular raíz ----------
const TERNAS_BASE: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
];

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
    };
  }
  return {
    tipo: "ternas",
    enunciado: `Un triángulo rectángulo tiene catetos de ${cateto1} y ${cateto2}. ¿Cuánto mide la hipotenusa?`,
    respuesta: hipotenusa,
    tolerancia: 0,
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
