// Mundo Circuitia — 4 modos de dificultad creciente (nivel 1-10 vía
// skill_levels, igual que el resto de los mundos): serie (2-3
// resistores en serie pura), paralelo (2-3 resistores en paralelo
// puro), mixto (una rama en serie con un bloque en paralelo adentro,
// 3-4 resistores, nivel>=4) y cualitativo (perturbar un resistor y
// preguntar qué le pasa a otro, opción múltiple).
//
// REGLA DURA de todo este archivo: nunca se recalcula la física del
// circuito a mano — toda resolución real pasa por
// `resolverCircuito`/`compararTrasPerturbacion` de @/lib/circuitos/
// resolver (kernel ya construido y testeado en una fase previa). Este
// archivo solo arma la topología (qué resistores, qué valores, cómo se
// conectan) y el enunciado; nunca "adivina" la respuesta.
//
// Mismo patrón que calculia.ts/trigonometria.ts: una referencia mutable
// a nivel de módulo que conRngSembrado() reemplaza temporalmente
// durante la llamada, sin pasar un `rng` explícito por parámetro a cada
// función interna.

import {
  resolverCircuito,
  compararTrasPerturbacion,
  type NodoCircuito,
} from "@/lib/circuitos/resolver";

// FORMATO DE SALIDA (convención $...$ de MathText, ver
// docs/PLAN_REVISION_CONTENIDO.md): los resistores (`R_{1}`, `R_{p1}`),
// los valores (ohmios con \Omega) y la fuente (voltios con \text{V}) salen entre
// `$...$` con LaTeX real. Las opciones del modo cualitativo son palabras
// ("Aumenta"/"Disminuye"/"No cambia") y quedan como texto plano. Las
// respuestas NUMÉRICAS (input) no llevan marcas. `resaltarId` (id crudo
// "R1"/"Rp1", lo usa CircuitoSVG) NO se toca.

export type ModoCircuitia = "serie" | "paralelo" | "mixto" | "cualitativo";

export const NOMBRE_MODO_CIRCUITIA: Record<ModoCircuitia, string> = {
  serie: "Circuitos en serie",
  paralelo: "Circuitos en paralelo",
  mixto: "Circuitos mixtos",
  cualitativo: "Análisis cualitativo",
};

interface ProblemaCircuitiaBase {
  modo: ModoCircuitia;
  enunciado: string;
  topologia: NodoCircuito;
  vFuente: number;
  resaltarId?: string;
}

export interface ProblemaCircuitiaNumero extends ProblemaCircuitiaBase {
  entrada: "numero";
  respuesta: number;
  tolerancia: number;
}

export interface ProblemaCircuitiaOpciones extends ProblemaCircuitiaBase {
  entrada: "opciones";
  opciones: string[];
  respuesta: string;
}

export type ProblemaCircuitia = ProblemaCircuitiaNumero | ProblemaCircuitiaOpciones;

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

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Envuelve LaTeX en $...$, y helpers de las tres piezas de notación que
// repite todo enunciado: el resistor con subíndice (R1 -> R_{1}), el valor
// en ohmios y el voltaje de la fuente.
const m = (expr: string): string => `$${expr}$`;
function idTex(id: string): string {
  const partes = /^R([a-z]*)(\d+)$/.exec(id);
  return partes ? `R_{${partes[1]}${partes[2]}}` : id;
}
const ohmiosTex = (ohmios: number): string => `${ohmios}\\,\\Omega`;
const voltiosTex = (v: number): string => `${v}\\,\\text{V}`;

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------- Bancos "razonables" (para que ninguna respuesta salga con
// decimales feos) ----------
const POOL_OHMIOS = [10, 22, 33, 47, 68, 100, 150, 220, 330, 470, 680, 1000];
const POOL_VOLTAJE = [6, 9, 12, 15, 18, 24];

interface ResistorInfo {
  id: string;
  ohmios: number;
}

interface TopologiaArmada {
  topologia: NodoCircuito;
  resistores: ResistorInfo[];
  vFuente: number;
}

// ---------- Constructores de topología (nunca deciden la respuesta —
// solo arman la estructura; la respuesta siempre sale de resolver.ts) ----------

function construirSerie(nivel: number): TopologiaArmada {
  const n = nivel >= 6 ? 3 : 2;
  const resistores: ResistorInfo[] = [];
  for (let i = 1; i <= n; i++) resistores.push({ id: `R${i}`, ohmios: randomChoice(POOL_OHMIOS) });
  const vFuente = randomChoice(POOL_VOLTAJE);
  const topologia: NodoCircuito = {
    tipo: "serie",
    hijos: resistores.map((r) => ({ tipo: "resistor", id: r.id, ohmios: r.ohmios })),
  };
  return { topologia, resistores, vFuente };
}

function construirParalelo(nivel: number): TopologiaArmada {
  const n = nivel >= 6 ? 3 : 2;
  const resistores: ResistorInfo[] = [];
  for (let i = 1; i <= n; i++) resistores.push({ id: `R${i}`, ohmios: randomChoice(POOL_OHMIOS) });
  const vFuente = randomChoice(POOL_VOLTAJE);
  const topologia: NodoCircuito = {
    tipo: "paralelo",
    hijos: resistores.map((r) => ({ tipo: "resistor", id: r.id, ohmios: r.ohmios })),
  };
  return { topologia, resistores, vFuente };
}

// Una rama en serie con UN bloque en paralelo adentro — 2 niveles de
// profundidad máximo (restricción del layout del SVG, ver
// CircuitoSVG.tsx): serie([Rs1, paralelo([Rp1, Rp2]), Rs2?]). 3
// resistores en niveles bajos (sin Rs2), 4 en niveles altos.
function construirMixto(nivel: number): TopologiaArmada {
  const nivelEfectivo = Math.max(4, Math.min(10, nivel));
  const total = nivelEfectivo >= 7 ? 4 : 3;
  const serieCount = total - 2; // 1 o 2

  const resistoresParalelo: ResistorInfo[] = [
    { id: "Rp1", ohmios: randomChoice(POOL_OHMIOS) },
    { id: "Rp2", ohmios: randomChoice(POOL_OHMIOS) },
  ];
  const resistoresSerie: ResistorInfo[] = [];
  for (let i = 1; i <= serieCount; i++) resistoresSerie.push({ id: `Rs${i}`, ohmios: randomChoice(POOL_OHMIOS) });
  const vFuente = randomChoice(POOL_VOLTAJE);

  const bloqueParalelo: NodoCircuito = {
    tipo: "paralelo",
    hijos: resistoresParalelo.map((r) => ({ tipo: "resistor", id: r.id, ohmios: r.ohmios })),
  };
  const hijosSerie: NodoCircuito[] = [
    { tipo: "resistor", id: resistoresSerie[0].id, ohmios: resistoresSerie[0].ohmios },
    bloqueParalelo,
  ];
  if (resistoresSerie[1]) {
    hijosSerie.push({ tipo: "resistor", id: resistoresSerie[1].id, ohmios: resistoresSerie[1].ohmios });
  }
  const topologia: NodoCircuito = { tipo: "serie", hijos: hijosSerie };
  return { topologia, resistores: [...resistoresSerie, ...resistoresParalelo], vFuente };
}

function describirTopologia(tipo: "serie" | "paralelo" | "mixto", resistores: ResistorInfo[]): string {
  const lista = resistores.map((r) => m(`${idTex(r.id)} = ${ohmiosTex(r.ohmios)}`)).join(", ");
  if (tipo === "serie") return `Circuito en serie con ${lista}.`;
  if (tipo === "paralelo") return `Circuito en paralelo con ${lista}.`;
  return `Circuito mixto (una rama en serie con un bloque en paralelo adentro) con ${lista}.`;
}

// Tolerancia estilo trigonometria.ts (Math.max(piso, respuesta*fracción))
// pero con pisos propios de Circuitia: los valores de corriente en este
// banco de resistores/voltajes rondan entre ~0.003A y ~2.4A (mucho más
// chicos que los grados de Trigonometría), así que un piso de 0.1 sería
// demasiado permisivo — se usa un piso chico + 1-2% relativo.
function tolerancia(magnitud: "voltaje" | "corriente", respuesta: number): number {
  if (magnitud === "voltaje") return Math.max(0.05, Math.abs(respuesta) * 0.01);
  return Math.max(0.005, Math.abs(respuesta) * 0.02);
}

// ============================================================
// Modos 1-3: serie / paralelo / mixto — siempre entrada numérica
// (corriente en un punto o voltaje sobre un resistor), respuesta
// SIEMPRE calculada por resolverCircuito, nunca a mano.
// ============================================================

function construirPreguntaNumero(tipo: "serie" | "paralelo" | "mixto", nivel: number): ProblemaCircuitiaNumero {
  const armado = tipo === "serie" ? construirSerie(nivel) : tipo === "paralelo" ? construirParalelo(nivel) : construirMixto(nivel);
  const { topologia, resistores, vFuente } = armado;

  const resueltos = resolverCircuito(topologia, vFuente);
  const target = randomChoice(resistores);
  const magnitud: "voltaje" | "corriente" = rngActual() < 0.5 ? "corriente" : "voltaje";
  const valor = resueltos.get(target.id);
  if (!valor) {
    // No debería pasar nunca (target siempre viene de la misma lista de
    // resistores que se usó para construir la topología) — guard
    // defensivo, nunca un crash silencioso si algún día cambia.
    throw new Error(`Circuitia: no se encontró el resistor "${target.id}" al resolver el circuito.`);
  }

  const respuesta = redondear2(valor[magnitud]);
  const pregunta = magnitud === "corriente" ? `la corriente que pasa por ${m(idTex(target.id))}` : `el voltaje sobre ${m(idTex(target.id))}`;
  const enunciado = `${describirTopologia(tipo, resistores)} ¿Cuál es ${pregunta}? (fuente de ${m(voltiosTex(vFuente))})`;

  return {
    modo: tipo,
    entrada: "numero",
    enunciado,
    topologia,
    vFuente,
    resaltarId: target.id,
    respuesta,
    tolerancia: tolerancia(magnitud, respuesta),
  };
}

// ============================================================
// Modo 4: cualitativo — perturbar un resistor (duplicar o reducir a la
// mitad) y preguntar qué le pasa a la corriente/voltaje de OTRO
// resistor. La respuesta correcta SIEMPRE sale de
// compararTrasPerturbacion (nunca una regla hardcodeada) — incluye
// "no_cambia" como resultado legítimo cuando idObjetivo es un hermano
// dentro de un bloque en paralelo conectado directo a la fuente (ver el
// comentario de compararTrasPerturbacion en resolver.ts: la corriente/
// voltaje de esa rama depende solo de su propia R y del voltaje
// compartido, nunca de una rama hermana).
// ============================================================

function reemplazarOhmios(nodo: NodoCircuito, id: string, nuevoOhmios: number): NodoCircuito {
  if (nodo.tipo === "resistor") {
    return nodo.id === id ? { ...nodo, ohmios: nuevoOhmios } : { ...nodo };
  }
  return { tipo: nodo.tipo, hijos: nodo.hijos.map((h) => reemplazarOhmios(h, id, nuevoOhmios)) };
}

const ETIQUETA_RESULTADO: Record<"aumenta" | "disminuye" | "no_cambia", string> = {
  aumenta: "Aumenta",
  disminuye: "Disminuye",
  no_cambia: "No cambia",
};

function construirPreguntaCualitativa(nivel: number): ProblemaCircuitiaOpciones {
  const nivelEfectivo = Math.max(1, Math.min(10, nivel));
  const tipos: Array<"serie" | "paralelo" | "mixto"> = ["serie", "paralelo"];
  if (nivelEfectivo >= 4) tipos.push("mixto");
  const tipoBase = randomChoice(tipos);
  const armado = tipoBase === "serie" ? construirSerie(nivelEfectivo) : tipoBase === "paralelo" ? construirParalelo(nivelEfectivo) : construirMixto(nivelEfectivo);
  const { topologia, resistores, vFuente } = armado;

  const idPerturbado = randomChoice(resistores);
  const candidatosObjetivo = resistores.filter((r) => r.id !== idPerturbado.id);
  const idObjetivo = randomChoice(candidatosObjetivo);
  const magnitud: "voltaje" | "corriente" = rngActual() < 0.5 ? "corriente" : "voltaje";

  let accion: "duplica" | "reduce_mitad" = rngActual() < 0.5 ? "duplica" : "reduce_mitad";
  // Solo se reduce a la mitad cuando el valor original es par — así el
  // nuevo valor mostrado en el enunciado siempre es un entero limpio,
  // nunca una fracción rara (ver misma disciplina en calculia.ts).
  if (accion === "reduce_mitad" && idPerturbado.ohmios % 2 !== 0) accion = "duplica";
  const nuevoOhmios = accion === "duplica" ? idPerturbado.ohmios * 2 : idPerturbado.ohmios / 2;

  const topologiaPerturbada = reemplazarOhmios(topologia, idPerturbado.id, nuevoOhmios);
  const resultado = compararTrasPerturbacion(topologia, topologiaPerturbada, vFuente, idObjetivo.id, magnitud);
  const respuesta = ETIQUETA_RESULTADO[resultado];
  const opciones = mezclar(["Aumenta", "Disminuye", "No cambia"]);

  const cambio = accion === "duplica" ? `se duplica a ${m(ohmiosTex(nuevoOhmios))}` : `se reduce a la mitad, a ${m(ohmiosTex(nuevoOhmios))}`;
  const magnitudTexto = magnitud === "corriente" ? "la corriente" : "el voltaje";
  const enunciado = `${describirTopologia(tipoBase, resistores)} Si ${m(idTex(idPerturbado.id))} (${m(ohmiosTex(idPerturbado.ohmios))}) ${cambio}, ¿qué le pasa a ${magnitudTexto} en ${m(idTex(idObjetivo.id))}? (fuente de ${m(voltiosTex(vFuente))})`;

  return {
    modo: "cualitativo",
    entrada: "opciones",
    enunciado,
    topologia,
    vFuente,
    resaltarId: idObjetivo.id,
    opciones,
    respuesta,
  };
}

export function generarProblemaCircuitia(modo: ModoCircuitia, nivel: number): ProblemaCircuitia {
  if (modo === "serie") return construirPreguntaNumero("serie", Math.max(1, Math.min(10, nivel)));
  if (modo === "paralelo") return construirPreguntaNumero("paralelo", Math.max(1, Math.min(10, nivel)));
  if (modo === "mixto") return construirPreguntaNumero("mixto", nivel);
  return construirPreguntaCualitativa(nivel);
}
