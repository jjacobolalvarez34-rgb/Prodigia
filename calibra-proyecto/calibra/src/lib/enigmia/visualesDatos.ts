// Cálculos puros de los visuales de Enigmia (sin React) — mismo patrón que
// src/lib/numeria/visualesDatos.ts y src/lib/naipia/visualesDatos.ts: los
// componentes de src/components/enigmia/visuales/ solo dibujan lo que estas
// funciones calculan, y src/lib/enigmia/lecciones/lecciones.test.ts
// contrasta cada resultado con aritmética/lógica reimplementada de forma
// independiente (nunca las mismas funciones que dibuja el componente).

// ============================================================
// Patrones: secuencias aritméticas, geométricas y de letras
// ============================================================

export interface DatosSecuenciaNumerica {
  primerTermino: number;
  paso: number;
  cantidad: number;
  terminos: number[];
}

// Diferencia constante: cada término es el anterior + `diferencia`.
export function secuenciaAritmetica(primerTermino: number, diferencia: number, cantidad: number): DatosSecuenciaNumerica {
  const terminos: number[] = [];
  for (let i = 0; i < cantidad; i++) terminos.push(primerTermino + diferencia * i);
  return { primerTermino, paso: diferencia, cantidad, terminos };
}

// Razón constante: cada término es el anterior × `razon`.
export function secuenciaGeometrica(primerTermino: number, razon: number, cantidad: number): DatosSecuenciaNumerica {
  const terminos: number[] = [];
  let actual = primerTermino;
  for (let i = 0; i < cantidad; i++) {
    terminos.push(actual);
    actual *= razon;
  }
  return { primerTermino, paso: razon, cantidad, terminos };
}

export interface DatosSecuenciaLetras {
  primeraLetra: string;
  paso: number;
  cantidad: number;
  letras: string[];
}

// Alfabeto de 26 letras en mayúscula (sin ñ, a propósito: la aritmética de
// "posición de letra" queda directa A=0..Z=25, mismo criterio simplificado
// que el acertijo real ya sembrado en 0015 — "A, C, E, G, ?" → I).
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function secuenciaLetras(primeraLetra: string, paso: number, cantidad: number): DatosSecuenciaLetras {
  const inicio = ALFABETO.indexOf(primeraLetra.toUpperCase());
  const base = inicio >= 0 ? inicio : 0;
  const letras: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const idx = (((base + paso * i) % ALFABETO.length) + ALFABETO.length) % ALFABETO.length;
    letras.push(ALFABETO[idx]);
  }
  return { primeraLetra: primeraLetra.toUpperCase(), paso, cantidad, letras };
}

// ============================================================
// Memoria: agrupar una secuencia plana en bloques (chunking)
// ============================================================

export interface DatosAgrupacion {
  items: string[];
  tamanos: number[];
  bloques: string[][];
}

// Reparte `items` en bloques consecutivos según `tamanos` (p. ej. [3,3,3]
// para un código de 9 dígitos). Si la suma de `tamanos` no cubre `items`
// por completo, el resto sobrante se agrega como un último bloque extra —
// nunca se pierde ningún elemento.
export function agruparEnBloques(items: string[], tamanos: number[]): DatosAgrupacion {
  const bloques: string[][] = [];
  let cursor = 0;
  for (const tam of tamanos) {
    if (cursor >= items.length) break;
    bloques.push(items.slice(cursor, cursor + Math.max(0, tam)));
    cursor += tam;
  }
  if (cursor < items.length) bloques.push(items.slice(cursor));
  return { items, tamanos, bloques };
}

// ============================================================
// Pensamiento computacional: traza de un algoritmo simple, con
// condicionales y con pasos en distinto orden (para mostrar por qué el
// orden importa).
// ============================================================

type OperacionSimple = { tipo: "sumar" | "restar" | "multiplicar" | "dividir"; valor: number };

export type PasoAlgoritmoEntrada =
  | OperacionSimple
  | {
      tipo: "condicional";
      comparacion: ">" | "<" | ">=" | "<=";
      umbral: number;
      siVerdadero: OperacionSimple;
      siFalso: OperacionSimple;
    };

export interface PasoAlgoritmoTrazado {
  entrada: PasoAlgoritmoEntrada;
  valorAntes: number;
  valorDespues: number;
  // Solo presente para pasos condicionales: qué rama se tomó de verdad.
  ramaTomada?: "verdadero" | "falso";
}

export interface DatosTrazaAlgoritmo {
  inicial: number;
  pasos: PasoAlgoritmoTrazado[];
  final: number;
}

function aplicarOperacionSimple(valor: number, op: OperacionSimple): number {
  switch (op.tipo) {
    case "sumar":
      return valor + op.valor;
    case "restar":
      return valor - op.valor;
    case "multiplicar":
      return valor * op.valor;
    case "dividir":
      return valor / op.valor;
  }
}

function cumpleComparacion(valor: number, comparacion: ">" | "<" | ">=" | "<=", umbral: number): boolean {
  switch (comparacion) {
    case ">":
      return valor > umbral;
    case "<":
      return valor < umbral;
    case ">=":
      return valor >= umbral;
    case "<=":
      return valor <= umbral;
    default:
      return false;
  }
}

// Simula el algoritmo paso a paso, en el ORDEN EXACTO en que viene `pasos`
// (nunca reordenado) — la función es intencionalmente sensible al orden de
// entrada: llamarla con los mismos pasos en otro orden da otro resultado,
// que es justo el punto pedagógico de la Clase 6.
export function trazarAlgoritmo(inicial: number, pasos: PasoAlgoritmoEntrada[]): DatosTrazaAlgoritmo {
  let actual = inicial;
  const trazados: PasoAlgoritmoTrazado[] = pasos.map((p) => {
    const valorAntes = actual;
    if (p.tipo === "condicional") {
      const verdadero = cumpleComparacion(actual, p.comparacion, p.umbral);
      actual = aplicarOperacionSimple(actual, verdadero ? p.siVerdadero : p.siFalso);
      return { entrada: p, valorAntes, valorDespues: actual, ramaTomada: verdadero ? "verdadero" : "falso" };
    }
    actual = aplicarOperacionSimple(actual, p);
    return { entrada: p, valorAntes, valorDespues: actual };
  });
  return { inicial, pasos: trazados, final: actual };
}

// ============================================================
// Deducción: eliminación por descarte — se van descartando candidatos uno
// a uno por un motivo concreto, hasta que queda uno solo (la conclusión).
// ============================================================

export interface DatosEliminacion {
  candidatos: string[];
  descartes: { candidato: string; motivo: string }[];
  // null si el descarte no deja exactamente un candidato (dato mal armado).
  restante: string | null;
}

export function resolverPorEliminacion(
  candidatos: string[],
  descartes: { candidato: string; motivo: string }[]
): DatosEliminacion {
  const descartados = new Set(descartes.map((d) => d.candidato));
  const restantes = candidatos.filter((c) => !descartados.has(c));
  return { candidatos, descartes, restante: restantes.length === 1 ? restantes[0] : null };
}

// ============================================================
// Memoria: método de loci — asocia cada elemento a memorizar con un lugar
// de un recorrido conocido, en el mismo orden (zip de las dos listas).
// ============================================================

export interface DatosLoci {
  lugares: string[];
  items: string[];
  pares: { lugar: string; item: string }[];
}

export function asociarLoci(lugares: string[], items: string[]): DatosLoci {
  const cantidad = Math.min(lugares.length, items.length);
  const lugaresUsados = lugares.slice(0, cantidad);
  const itemsUsados = items.slice(0, cantidad);
  const pares = lugaresUsados.map((lugar, i) => ({ lugar, item: itemsUsados[i] }));
  return { lugares: lugaresUsados, items: itemsUsados, pares };
}
