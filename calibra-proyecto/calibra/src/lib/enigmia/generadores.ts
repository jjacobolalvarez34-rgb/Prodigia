import type { LogicPuzzle, TipoAcertijo } from "@/types/database";

// Fase A2: generadores por código para Memoria, Patrones y Pensamiento
// computacional — infinitos, no una lista fija. Deducción sigue siendo
// un banco manual (logic_puzzles sembrado): un generador de deducción
// de verdad implicaría producir una solución válida al azar y derivar
// de ahí las pistas mínimas necesarias, que es un problema bastante más
// difícil — queda anotado como proyecto aparte, no se fuerza acá.

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function elegir<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function idFalso(prefijo: string): string {
  return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

const PALABRAS_MEMORIA = [
  "Perro", "Gato", "Pájaro", "Pez", "León", "Oso", "Lobo", "Zorro",
  "Ciervo", "Conejo", "Tigre", "Elefante", "Delfín", "Águila", "Búho",
];
const ORDINALES = ["primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo", "octavo"];

// Fase W2: antes el enunciado incluía la secuencia Y la pregunta en el
// mismo texto, mostradas junto con las opciones — anulaba el ejercicio
// (nunca hacía falta memorizar nada). Ahora `secuencia` viaja aparte:
// el runner la muestra sola primero, la oculta, y RECIÉN AHÍ revela
// `enunciado` (solo la pregunta) + `opciones`.
export function generarMemoria(dificultad: number): LogicPuzzle {
  // Sección 3 (auditoría de variedad): el techo estaba en 8 pase lo que
  // pase — dificultad 10 se sentía igual que dificultad 6/7. Ahora
  // escala lineal de 3 (dificultad 1) a 10 (dificultad 10) de verdad.
  const cantidad = Math.min(10, Math.round(3 + ((dificultad - 1) * 7) / 9));
  const items = mezclar(PALABRAS_MEMORIA).slice(0, cantidad);
  const idxPreguntado = randomInt(0, cantidad - 1);
  const respuesta = items[idxPreguntado];

  const distractores = mezclar(items.filter((p) => p !== respuesta)).slice(0, 3);
  const opciones = mezclar([respuesta, ...distractores]);

  return {
    id: idFalso("memoria"),
    tipo: "memoria" as TipoAcertijo,
    dificultad,
    contenido: {
      enunciado: `¿Cuál fue el ${ORDINALES[idxPreguntado]} de la secuencia?`,
      opciones,
      secuencia: items,
    },
    respuesta,
  };
}

export function generarPatron(dificultad: number): LogicPuzzle {
  // Alterna entre progresión aritmética y geométrica según la dificultad.
  const geometrica = dificultad >= 6;
  const inicio = randomInt(1, 5 + dificultad);
  let secuencia: number[];
  let siguiente: number;

  if (geometrica) {
    const razon = randomInt(2, 3);
    secuencia = [0, 1, 2, 3].map((i) => inicio * razon ** i);
    siguiente = inicio * razon ** 4;
  } else {
    const paso = randomInt(2, 4 + Math.floor(dificultad / 2));
    secuencia = [0, 1, 2, 3].map((i) => inicio + paso * i);
    siguiente = inicio + paso * 4;
  }

  const distractores = new Set<number>();
  while (distractores.size < 3) {
    const ruido = siguiente + randomInt(-5, 5) * (geometrica ? randomInt(2, 4) : 1);
    if (ruido !== siguiente && ruido > 0) distractores.add(ruido);
  }
  const opciones = mezclar([siguiente, ...Array.from(distractores)]).map((n) => String(n));

  return {
    id: idFalso("patron"),
    tipo: "secuencia" as TipoAcertijo,
    dificultad,
    contenido: { enunciado: `${secuencia.join(", ")}, ?`, opciones },
    respuesta: String(siguiente),
  };
}

interface Instruccion {
  texto: string;
  aplicar: (x: number) => number;
}

function instruccionesDisponibles(x: number): Instruccion[] {
  const suma = randomInt(1, 9);
  const resta = randomInt(1, Math.max(1, x - 1));
  return [
    { texto: `x = x + ${suma}`, aplicar: (v) => v + suma },
    { texto: `x = x - ${resta}`, aplicar: (v) => v - resta },
    { texto: "x = x × 2", aplicar: (v) => v * 2 },
  ];
}

function opcionesNumericasDesde(x: number, ruidoMax = 6, factorGeometrico = false): string[] {
  const distractores = new Set<number>();
  while (distractores.size < 3) {
    const ruido = x + randomInt(-ruidoMax, ruidoMax) * (factorGeometrico ? randomInt(2, 4) : 1);
    if (ruido !== x) distractores.add(ruido);
  }
  return mezclar([x, ...Array.from(distractores)]).map((n) => String(n));
}

// Dificultad 1-3: secuencia plana de instrucciones sueltas (el
// generador original, sin bucles ni condicionales).
function generarComputacionalSecuencial(dificultad: number): LogicPuzzle {
  const pasos = Math.min(4, 2 + Math.floor(dificultad / 3));
  let x = randomInt(1, 5);
  const inicial = x;
  const lineas: string[] = [];

  for (let i = 0; i < pasos; i++) {
    const instruccion = elegir(instruccionesDisponibles(x));
    lineas.push(instruccion.texto);
    x = instruccion.aplicar(x);
  }

  return {
    id: idFalso("computacional"),
    tipo: "programacion" as TipoAcertijo,
    dificultad,
    contenido: {
      enunciado: `x = ${inicial}. En orden: ${lineas.join(". ")}. ¿Cuánto vale x al final?`,
      opciones: opcionesNumericasDesde(x),
    },
    respuesta: String(x),
  };
}

// Dificultad 4-5 (bucle simple) y 8-10 (bucle anidado, cuando toca):
// "repetir N veces" con una sola instrucción fija — la resta siempre
// arranca con un `inicial` grande de sobra para nunca cruzar a
// negativo en ninguna vuelta.
function generarInstruccionDeBucle(veces: number): { inicial: number; aplicar: (v: number) => number; texto: string; geometrico: boolean } {
  const tipoOp = elegir(["suma", "resta", "doble"] as const);
  if (tipoOp === "suma") {
    const k = randomInt(1, 9);
    return { inicial: randomInt(1, 10), aplicar: (v) => v + k, texto: `x = x + ${k}`, geometrico: false };
  }
  if (tipoOp === "resta") {
    const k = randomInt(1, 3);
    return { inicial: randomInt(10 + k * veces, 20 + k * veces), aplicar: (v) => v - k, texto: `x = x - ${k}`, geometrico: false };
  }
  return { inicial: randomInt(1, 4), aplicar: (v) => v * 2, texto: "x = x × 2", geometrico: true };
}

function generarComputacionalBucle(dificultad: number, anidado: boolean): LogicPuzzle {
  const veces = randomInt(2, anidado ? 4 : 6);
  const vecesInterno = anidado ? randomInt(2, 3) : 0;
  const { inicial, aplicar, texto, geometrico } = generarInstruccionDeBucle(anidado ? veces * vecesInterno : veces);

  let x = inicial;
  let enunciado: string;
  if (!anidado) {
    for (let i = 0; i < veces; i++) x = aplicar(x);
    enunciado = `x = ${inicial}. Repetir ${veces} veces: ${texto}. ¿Cuánto vale x al final?`;
  } else {
    for (let i = 0; i < veces; i++) {
      for (let j = 0; j < vecesInterno; j++) x = aplicar(x);
    }
    enunciado = `x = ${inicial}. Repetir ${veces} veces: { repetir ${vecesInterno} veces: ${texto} }. ¿Cuánto vale x al final?`;
  }

  return {
    id: idFalso("computacional"),
    tipo: "programacion" as TipoAcertijo,
    dificultad,
    contenido: { enunciado, opciones: opcionesNumericasDesde(x, 6, geometrico) },
    respuesta: String(x),
  };
}

// Dificultad 6-7: condicionales simples (par/impar, o comparación
// contra un umbral) encadenados uno o dos pasos.
function generarComputacionalCondicional(dificultad: number): LogicPuzzle {
  const inicial = randomInt(1, 20);
  let x = inicial;
  const pasos = dificultad >= 8 ? 2 : 1;
  const lineas: string[] = [];

  for (let i = 0; i < pasos; i++) {
    if (Math.random() < 0.5) {
      const suma = randomInt(1, 5);
      lineas.push(`si x es par: x = x + ${suma}; si no: x = x × 2`);
      x = x % 2 === 0 ? x + suma : x * 2;
    } else {
      const umbral = randomInt(5, 15);
      const delta = randomInt(1, 5);
      lineas.push(`si x > ${umbral}: x = x - ${delta}; si no: x = x + ${delta}`);
      x = x > umbral ? x - delta : x + delta;
    }
  }

  return {
    id: idFalso("computacional"),
    tipo: "programacion" as TipoAcertijo,
    dificultad,
    contenido: {
      enunciado: `x = ${inicial}. En orden: ${lineas.join(". ")}. ¿Cuánto vale x al final?`,
      opciones: opcionesNumericasDesde(x),
    },
    respuesta: String(x),
  };
}

// Dificultad 8-10 (alterna con bucle anidado): ordenar pasos de un
// algoritmo — 3 instrucciones desordenadas, hay que elegir en qué
// orden aplicarlas para llegar al resultado marcado. Siempre incluye
// un "×2" entre las 3 (no conmuta con sumar/restar), así entre las 6
// permutaciones posibles casi siempre hay ≥4 resultados distintos.
function generarComputacionalOrdenar(dificultad: number): LogicPuzzle {
  for (let intento = 0; intento < 12; intento++) {
    const inicial = randomInt(1, 6);
    const sumaA = randomInt(1, 8);
    const sumaB = randomInt(1, 8);
    if (sumaA === sumaB) continue;
    const instrucciones: Instruccion[] = mezclar([
      { texto: `x = x + ${sumaA}`, aplicar: (v: number) => v + sumaA },
      { texto: `x = x - ${Math.min(sumaB, inicial)}`, aplicar: (v: number) => v - Math.min(sumaB, inicial) },
      { texto: "x = x × 2", aplicar: (v: number) => v * 2 },
    ]);

    const permutaciones: Instruccion[][] = [];
    function permutar(actual: Instruccion[], restantes: Instruccion[]) {
      if (restantes.length === 0) {
        permutaciones.push(actual);
        return;
      }
      for (let i = 0; i < restantes.length; i++) {
        permutar([...actual, restantes[i]], [...restantes.slice(0, i), ...restantes.slice(i + 1)]);
      }
    }
    permutar([], instrucciones);

    const vistos = new Map<number, Instruccion[]>();
    for (const perm of permutaciones) {
      let x = inicial;
      for (const instr of perm) x = instr.aplicar(x);
      if (!vistos.has(x)) vistos.set(x, perm);
    }
    if (vistos.size < 4) continue;

    const resultadosDistintos = mezclar(Array.from(vistos.keys())).slice(0, 4);
    const correcto = resultadosDistintos[Math.floor(Math.random() * resultadosDistintos.length)];
    const opciones = resultadosDistintos.map((resultado) => vistos.get(resultado)!.map((i) => i.texto).join(" → "));
    const respuesta = vistos.get(correcto)!.map((i) => i.texto).join(" → ");

    return {
      id: idFalso("computacional"),
      tipo: "programacion" as TipoAcertijo,
      dificultad,
      contenido: {
        enunciado: `x = ${inicial}. Estos 3 pasos están desordenados — ¿en qué orden hay que aplicarlos para que x termine en ${correcto}?`,
        opciones,
      },
      respuesta,
    };
  }
  // Caso extremo (no debería pasar con los rangos de arriba): cae a un
  // bucle anidado, que siempre tiene una única respuesta numérica.
  return generarComputacionalBucle(dificultad, true);
}

export function generarComputacional(dificultad: number): LogicPuzzle {
  if (dificultad <= 3) return generarComputacionalSecuencial(dificultad);
  if (dificultad <= 5) return generarComputacionalBucle(dificultad, false);
  if (dificultad <= 7) return generarComputacionalCondicional(dificultad);
  // 8-10: la banda más alta alterna entre 2 formas de estructura
  // distinta, no un único tipo repetido — "más variedad real", no solo
  // "más difícil".
  return Math.random() < 0.5 ? generarComputacionalBucle(dificultad, true) : generarComputacionalOrdenar(dificultad);
}

export type CategoriaGenerada = "memoria" | "patrones" | "computacional";

const GENERADORES: Record<CategoriaGenerada, (dificultad: number) => LogicPuzzle> = {
  memoria: generarMemoria,
  patrones: generarPatron,
  computacional: generarComputacional,
};

export function generarAcertijoProcedural(categoria: CategoriaGenerada, dificultad: number): LogicPuzzle {
  return GENERADORES[categoria](Math.max(1, Math.min(10, dificultad)));
}
