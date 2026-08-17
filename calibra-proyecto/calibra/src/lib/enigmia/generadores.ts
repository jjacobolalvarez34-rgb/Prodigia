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
  const cantidad = Math.min(8, 3 + Math.floor(dificultad / 2));
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

export function generarComputacional(dificultad: number): LogicPuzzle {
  const pasos = Math.min(4, 2 + Math.floor(dificultad / 3));
  let x = randomInt(1, 5);
  const inicial = x;
  const lineas: string[] = [];

  for (let i = 0; i < pasos; i++) {
    const instruccion = elegir(instruccionesDisponibles(x));
    lineas.push(instruccion.texto);
    x = instruccion.aplicar(x);
  }

  const distractores = new Set<number>();
  while (distractores.size < 3) {
    const ruido = x + randomInt(-6, 6);
    if (ruido !== x) distractores.add(ruido);
  }
  const opciones = mezclar([x, ...Array.from(distractores)]).map((n) => String(n));

  return {
    id: idFalso("computacional"),
    tipo: "programacion" as TipoAcertijo,
    dificultad,
    contenido: {
      enunciado: `x = ${inicial}. En orden: ${lineas.join(". ")}. ¿Cuánto vale x al final?`,
      opciones,
    },
    respuesta: String(x),
  };
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
