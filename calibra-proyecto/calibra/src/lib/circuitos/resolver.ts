/**
 * Kernel matemático de resolución de circuitos DC resistivos puros
 * (combinaciones serie/paralelo, sin fuentes múltiples ni mallas).
 *
 * Este módulo es puro: no toca la base de datos, ni UI, ni rutas.
 * Sirve como base para el mundo "Circuitia" (fase posterior), que se
 * construirá encima de este kernel ya probado.
 */

export type NodoCircuito =
  | { tipo: "resistor"; id: string; ohmios: number }
  | { tipo: "serie"; hijos: NodoCircuito[] }
  | { tipo: "paralelo"; hijos: NodoCircuito[] };

/**
 * Calcula la resistencia equivalente de un nodo del circuito, de forma
 * recursiva:
 * - Un resistor hoja devuelve su propia resistencia.
 * - Un nodo serie devuelve la suma de las resistencias equivalentes de
 *   sus hijos.
 * - Un nodo paralelo devuelve el recíproco de la suma de los recíprocos
 *   de las resistencias equivalentes de sus hijos.
 */
export function resistenciaEquivalente(nodo: NodoCircuito): number {
  switch (nodo.tipo) {
    case "resistor":
      return nodo.ohmios;
    case "serie":
      return nodo.hijos.reduce((suma, hijo) => suma + resistenciaEquivalente(hijo), 0);
    case "paralelo": {
      const sumaInversos = nodo.hijos.reduce(
        (suma, hijo) => suma + 1 / resistenciaEquivalente(hijo),
        0
      );
      return 1 / sumaInversos;
    }
  }
}

/**
 * Resuelve un circuito DC resistivo puro dada una fuente de voltaje
 * `vFuente` aplicada al nodo raíz.
 *
 * Algoritmo en dos pasadas:
 * 1. Bottom-up: se calcula la resistencia equivalente total y, con la
 *    ley de Ohm, la corriente total que entrega la fuente.
 * 2. Top-down: se reparte esa corriente/voltaje desde la raíz hasta
 *    cada resistor hoja, respetando que en serie la corriente es
 *    compartida y en paralelo el voltaje es compartido.
 *
 * Devuelve un mapa `id resistor -> { voltaje, corriente }` con una
 * entrada por cada resistor hoja del árbol.
 */
export function resolverCircuito(
  nodo: NodoCircuito,
  vFuente: number
): Map<string, { voltaje: number; corriente: number }> {
  const resultado = new Map<string, { voltaje: number; corriente: number }>();

  const rEqTotal = resistenciaEquivalente(nodo);
  const iTotal = vFuente / rEqTotal;

  function repartir(n: NodoCircuito, corriente: number, voltaje: number): void {
    switch (n.tipo) {
      case "resistor":
        resultado.set(n.id, { voltaje, corriente });
        return;
      case "serie":
        // Todos los hijos comparten la misma corriente; el voltaje de
        // cada hijo depende de su propia resistencia equivalente.
        for (const hijo of n.hijos) {
          const vHijo = corriente * resistenciaEquivalente(hijo);
          repartir(hijo, corriente, vHijo);
        }
        return;
      case "paralelo":
        // Todos los hijos comparten el mismo voltaje; la corriente de
        // cada hijo depende de su propia resistencia equivalente.
        for (const hijo of n.hijos) {
          const iHijo = voltaje / resistenciaEquivalente(hijo);
          repartir(hijo, iHijo, voltaje);
        }
        return;
    }
  }

  repartir(nodo, iTotal, vFuente);

  return resultado;
}

/**
 * Compara el valor (voltaje o corriente) de un resistor identificado por
 * `idObjetivo` entre dos versiones del mismo circuito (antes/después de
 * una perturbación, p.ej. cambiar el valor de otro resistor), resolviendo
 * ambos circuitos de verdad con `resolverCircuito` y comparando los
 * resultados numéricos con un pequeño épsilon relativo.
 *
 * IMPORTANTE: "no_cambia" es una respuesta legítima en ciertas topologías
 * (por ejemplo, la corriente de una rama en paralelo depende únicamente
 * de su propia resistencia y del voltaje compartido del nodo, así que no
 * se ve afectada por un cambio de resistencia en una rama hermana). Esta
 * función nunca debe tratar ese caso como especial: siempre hace una
 * comparación numérica real basada en épsilon a partir de dos resoluciones
 * reales del circuito.
 */
export function compararTrasPerturbacion(
  original: NodoCircuito,
  perturbado: NodoCircuito,
  vFuente: number,
  idObjetivo: string,
  magnitud: "voltaje" | "corriente"
): "aumenta" | "disminuye" | "no_cambia" {
  const resultadoOriginal = resolverCircuito(original, vFuente);
  const resultadoPerturbado = resolverCircuito(perturbado, vFuente);

  const valorOriginal = resultadoOriginal.get(idObjetivo);
  const valorPerturbado = resultadoPerturbado.get(idObjetivo);

  if (!valorOriginal || !valorPerturbado) {
    throw new Error(`No se encontró el resistor "${idObjetivo}" en el resultado del circuito.`);
  }

  const a = valorOriginal[magnitud];
  const b = valorPerturbado[magnitud];

  const epsilon = Math.max(1e-6, Math.abs(a) * 1e-4);

  if (Math.abs(b - a) <= epsilon) {
    return "no_cambia";
  }

  return b > a ? "aumenta" : "disminuye";
}
