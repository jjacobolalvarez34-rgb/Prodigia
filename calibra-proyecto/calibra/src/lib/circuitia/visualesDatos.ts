// Funciones PURAS que calculan los datos de los visuales de Circuitia.
// Ninguna coordenada ni valor eléctrico se escribe a mano en un
// componente: todo sale de acá, y esto a su vez SIEMPRE delega la
// física real a src/lib/circuitos/resolver.ts (resolverCircuito /
// resistenciaEquivalente) — la misma regla dura que sigue
// src/lib/practica/circuitia.ts. visualesDatos.test.ts verifica estos
// resultados contra un cálculo independiente (fórmulas escritas de
// nuevo a mano, sin llamar a resolver.ts).

import { resolverCircuito, resistenciaEquivalente, type NodoCircuito } from "@/lib/circuitos/resolver";

// Redondeo a 2 decimales — mismo criterio que redondear2() de
// src/lib/practica/circuitia.ts (evita el problema de Math.sin/cos de
// Quimia: acá no hay trigonometría, pero la división sí puede dar
// periódicos como 6.666666..., y Node/Chromium coinciden en el
// redondeo de una división simple, así que no hace falta épsilon
// especial — solo se redondea para que se vea limpio).
export function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

// 4 decimales: para la suma de recíprocos (un intermedio del cálculo en
// paralelo), que con 2 decimales daría un R_eq inconsistente con lo que se ve.
export function redondear4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ---------- Recorrido de la topología ----------

// Lista los resistores hoja en orden de lectura izquierda-a-derecha
// (mismo orden en que los arma construirSerie/Paralelo/Mixto de
// circuitia.ts: serie primero sus hijos en orden, paralelo sus hijos
// en orden, y un hijo "paralelo" dentro de un "serie" se recorre en
// el lugar que ocupa).
export function listarResistores(nodo: NodoCircuito): { id: string; ohmios: number }[] {
  if (nodo.tipo === "resistor") return [{ id: nodo.id, ohmios: nodo.ohmios }];
  return nodo.hijos.flatMap(listarResistores);
}

// "serie" (una cadena de resistores), "paralelo" (todos entre los mismos dos
// nodos) o "mixto" (una serie con un bloque en paralelo adentro). Un resistor
// solo cuenta como serie.
export type TipoCircuito = "serie" | "paralelo" | "mixto";

export function clasificarCircuito(nodo: NodoCircuito): TipoCircuito {
  if (nodo.tipo === "resistor") return "serie";
  if (nodo.tipo === "paralelo") return "paralelo";
  return nodo.hijos.some((h) => h.tipo === "paralelo") ? "mixto" : "serie";
}

export interface ResistorResuelto {
  id: string;
  ohmios: number;
  voltaje: number;
  corriente: number;
}

// Resuelve el circuito completo (delegando SIEMPRE a resolverCircuito)
// y devuelve la lista de resistores con sus valores, en el mismo orden
// de listarResistores — lo que consume el componente Circuito.tsx para
// dibujar las etiquetas.
export function resolverParaVisual(topologia: NodoCircuito, vFuente: number): ResistorResuelto[] {
  const resueltos = resolverCircuito(topologia, vFuente);
  return listarResistores(topologia).map(({ id, ohmios }) => {
    const valor = resueltos.get(id);
    if (!valor) throw new Error(`Circuitia (visual): no se encontró el resistor "${id}" al resolver el circuito.`);
    return { id, ohmios, voltaje: redondear2(valor.voltaje), corriente: redondear2(valor.corriente) };
  });
}

// ---------- Resistencia equivalente armada paso a paso ----------

export interface DatosResistenciaEquivalente {
  modo: "serie" | "paralelo";
  ohmios: number[];
  // LaTeX (sin $) de cada fórmula intermedia: serie tiene 1 (la suma
  // directa); paralelo tiene 2 (la suma de recíprocos, y la inversión
  // final) — igual que el ejemplo resuelto de 0195 para Rp1=Rp2=20.
  formulas: string[];
  total: number;
}

function listaOhmiosTex(ohmios: number[]): string {
  return ohmios.map((o) => `${o}\\,\\Omega`).join(" + ");
}

export function datosResistenciaEquivalente(modo: "serie" | "paralelo", ohmios: number[]): DatosResistenciaEquivalente {
  if (ohmios.length < 2) throw new Error("Circuitia (visual): hacen falta al menos 2 resistores.");
  const nodo: NodoCircuito = {
    tipo: modo,
    hijos: ohmios.map((o, i) => ({ tipo: "resistor", id: `R${i + 1}`, ohmios: o })),
  };
  const total = redondear2(resistenciaEquivalente(nodo));
  if (modo === "serie") {
    return { modo, ohmios, total, formulas: [`R_{\\text{eq}} = ${listaOhmiosTex(ohmios)} = ${total}\\,\\Omega`] };
  }
  const sumaInversos = ohmios.reduce((s, o) => s + 1 / o, 0);
  const inversosTex = ohmios.map((o) => `\\frac{1}{${o}}`).join(" + ");
  return {
    modo,
    ohmios,
    total,
    formulas: [
      `\\frac{1}{R_{\\text{eq}}} = ${inversosTex} = ${redondear4(sumaInversos)}`,
      `R_{\\text{eq}} = ${total}\\,\\Omega`,
    ],
  };
}

// ---------- Ley de Ohm: dados 2 de 3, calcular el tercero ----------

export type MagnitudOhm = "v" | "i" | "r";

export interface DatosLeyOhm {
  v: number;
  i: number;
  r: number;
  incognita: MagnitudOhm;
}

// Recibe EXACTAMENTE 2 de los 3 campos (el tercero debe faltar) y
// calcula el que falta con V = I·R. Nunca acepta los 3 ni menos de 2
// (para eso, resolverParaVisual/resolverCircuito son el camino real).
export function datosLeyOhm(datos: { v?: number; i?: number; r?: number }): DatosLeyOhm {
  const dados = (["v", "i", "r"] as const).filter((k) => typeof datos[k] === "number");
  if (dados.length !== 2) throw new Error("Circuitia (visual): la Ley de Ohm necesita exactamente 2 de los 3 valores (v, i, r).");
  const incognita = (["v", "i", "r"] as const).find((k) => !dados.includes(k))!;
  if (incognita === "v") {
    const i = datos.i!;
    const r = datos.r!;
    return { v: redondear2(i * r), i, r, incognita };
  }
  if (incognita === "i") {
    const v = datos.v!;
    const r = datos.r!;
    if (r === 0) throw new Error("Circuitia (visual): R no puede ser 0.");
    return { v, i: redondear2(v / r), r, incognita };
  }
  const v = datos.v!;
  const i = datos.i!;
  if (i === 0) throw new Error("Circuitia (visual): I no puede ser 0.");
  return { v, i, r: redondear2(v / i), incognita };
}
