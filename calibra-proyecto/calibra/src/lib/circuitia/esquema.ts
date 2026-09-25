// Geometría (PURA) del esquema de circuito de las lecciones de Aprender.
//
// Por qué existe además de CircuitoSVG.tsx (el diagrama de Práctica): ese
// diagrama es fiel al generador pero no está pensado para enseñar (la fuente
// queda en cortocircuito en el paralelo puro, las etiquetas se pisan entre
// ramas, no muestra el sentido de la corriente). Práctica y Diagnóstico
// siguen usándolo SIN cambios; las lecciones usan este esquema.
//
// Convenciones del dibujo:
//   - Símbolos estándar: batería (placa larga = +, placa corta y gruesa = −),
//     resistor en zigzag, cables y puntos en las uniones.
//   - Corriente CONVENCIONAL: sale del terminal + de la fuente, recorre el
//     lazo y vuelve al terminal −. La batería va a la izquierda con el + hacia
//     la derecha, así que la corriente recorre el circuito en sentido horario.
//   - Un paralelo pura se dibuja como una serie con un único bloque (los dos
//     rieles del bloque son los dos nodos entre los que está la fuente).
//   - Soporta lo que produce el generador de práctica y las lecciones: raíz
//     "serie" (resistores y bloques en paralelo de resistores), raíz
//     "paralelo" (resistores) o un único resistor. Cualquier otra forma lanza
//     un error (el visual se omite y la lección sigue funcionando).
//
// Ningún valor eléctrico sale de acá: la geometría solo depende de la
// topología; los valores los calcula resolverCircuito (visualesDatos.ts) y
// la corriente de cada tramo se usa para escalar la velocidad de los pulsos.

import { resistenciaEquivalente, resolverCircuito, type NodoCircuito } from "@/lib/circuitos/resolver";

export const ANCHO_ESQUEMA = 360;

export interface Punto {
  x: number;
  y: number;
}

export interface CableEsquema {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ResistorEsquema {
  id: string;
  ohmios: number;
  // Puntos del zigzag de izquierda a derecha (incluye los terminales).
  puntos: Punto[];
  x1: number;
  x2: number;
  y: number;
  // Centro horizontal para las etiquetas (encima: id y ohmios; debajo: valores).
  xCentro: number;
  yEtiqueta: number;
  yValor: number;
  // Ancho disponible para las etiquetas (para no pisar al vecino).
  anchoTexto: number;
}

// Camino que recorren los pulsos de corriente, en el SENTIDO de la corriente.
export interface PulsoEsquema {
  puntos: Punto[];
  // Corriente que circula por ese camino (A, sin redondear).
  corriente: number;
  // Duración de un ciclo de la animación (ms): inversamente proporcional a
  // la corriente, así la rama que lleva el doble se ve el doble de rápida.
  duracionMs: number;
}

export interface FlechaEsquema {
  x: number;
  y: number;
  // Ángulo en grados (0 = hacia la derecha, 90 = hacia abajo).
  grados: number;
}

export interface BateriaEsquema {
  xNegativa: number;
  xPositiva: number;
  y: number;
  // Posición de la etiqueta con el voltaje de la fuente.
  xTexto: number;
  yTexto: number;
}

export interface Esquema {
  ancho: number;
  alto: number;
  cables: CableEsquema[];
  uniones: Punto[];
  resistores: ResistorEsquema[];
  bateria: BateriaEsquema;
  pulsos: PulsoEsquema[];
  flechas: FlechaEsquema[];
  corrienteTotal: number;
  // Cuántos resistores hay en cada bloque en paralelo (para describirlo).
  bloques: number[];
}

// ---------- Constantes de diseño ----------

const X_IZQ = 24; // cable izquierdo del lazo
const X_DER = 336; // cable derecho del lazo
const X_NEGATIVA = 46;
const X_POSITIVA = 56;
const X_CADENA_1 = 72;
const X_CADENA_2 = 336;
const AMPLITUD = 8;
const SEPARACION_RAMAS = 60;
const MARGEN_RIEL = 16;
const PESO_RESISTOR = 1;
const PESO_BLOQUE = 1.6;
// Ciclo de los pulsos del tramo con la corriente TOTAL; las ramas más lentas
// se acotan para que siempre se note el movimiento.
const CICLO_BASE_MS = 520;
const CICLO_MAX_MS = 2600;

function zigzag(x1: number, x2: number, y: number): Punto[] {
  const largo = x2 - x1;
  const cuerpoIni = x1 + largo * 0.16;
  const cuerpoFin = x2 - largo * 0.16;
  const paso = (cuerpoFin - cuerpoIni) / 6;
  const pts: Punto[] = [{ x: x1, y }, { x: cuerpoIni, y }];
  for (let i = 1; i < 6; i++) pts.push({ x: cuerpoIni + paso * i, y: y + (i % 2 === 1 ? -AMPLITUD : AMPLITUD) });
  pts.push({ x: cuerpoFin, y }, { x: x2, y });
  return pts;
}

function sinRepetidos(puntos: Punto[]): Punto[] {
  return puntos.filter((p, i) => i === 0 || p.x !== puntos[i - 1].x || p.y !== puntos[i - 1].y);
}

function duracionPara(corriente: number, corrienteTotal: number): number {
  if (!(corriente > 0)) return CICLO_MAX_MS;
  return Math.round(Math.min(CICLO_MAX_MS, CICLO_BASE_MS * (corrienteTotal / corriente)));
}

type Elemento = { tipo: "resistor"; nodo: Extract<NodoCircuito, { tipo: "resistor" }> } | { tipo: "bloque"; hijos: Extract<NodoCircuito, { tipo: "resistor" }>[] };

function aElementos(topologia: NodoCircuito): Elemento[] {
  const comoResistor = (n: NodoCircuito) => {
    if (n.tipo !== "resistor") throw new Error("Circuitia (esquema): forma de circuito no soportada.");
    return n;
  };
  if (topologia.tipo === "resistor") return [{ tipo: "resistor", nodo: topologia }];
  if (topologia.tipo === "paralelo") {
    if (topologia.hijos.length < 2) throw new Error("Circuitia (esquema): un paralelo necesita 2 o más resistores.");
    return [{ tipo: "bloque", hijos: topologia.hijos.map(comoResistor) }];
  }
  const elementos: Elemento[] = topologia.hijos.map((h) => {
    if (h.tipo === "resistor") return { tipo: "resistor" as const, nodo: h };
    if (h.tipo === "paralelo") {
      if (h.hijos.length < 2) throw new Error("Circuitia (esquema): un paralelo necesita 2 o más resistores.");
      return { tipo: "bloque" as const, hijos: h.hijos.map(comoResistor) };
    }
    throw new Error("Circuitia (esquema): forma de circuito no soportada.");
  });
  if (elementos.length === 0) throw new Error("Circuitia (esquema): serie vacía.");
  return elementos;
}

function flechaDelTramoMasLargo(puntos: Punto[]): FlechaEsquema | null {
  let mejor = -1;
  let largo = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    const d = Math.hypot(puntos[i + 1].x - puntos[i].x, puntos[i + 1].y - puntos[i].y);
    if (d > largo) {
      largo = d;
      mejor = i;
    }
  }
  if (mejor < 0 || largo < 20) return null;
  const a = puntos[mejor];
  const b = puntos[mejor + 1];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, grados: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}

export function disenarEsquema(topologia: NodoCircuito, vFuente: number): Esquema {
  const elementos = aElementos(topologia);
  const corrienteTotal = vFuente / resistenciaEquivalente(topologia);
  const corrientes = resolverCircuito(topologia, vFuente);
  const corrienteDe = (id: string): number => {
    const v = corrientes.get(id);
    if (!v) throw new Error(`Circuitia (esquema): no se encontró el resistor "${id}".`);
    return v.corriente;
  };

  const mayorBloque = Math.max(0, ...elementos.map((e) => (e.tipo === "bloque" ? e.hijos.length : 0)));
  const mitad = mayorBloque > 1 ? ((mayorBloque - 1) / 2) * SEPARACION_RAMAS : 0;
  const yPrincipal = mitad + 32;
  const yInferior = yPrincipal + mitad + 40;
  const alto = yInferior + 12;

  const cables: CableEsquema[] = [];
  const uniones: Punto[] = [];
  const resistores: ResistorEsquema[] = [];
  const pulsos: PulsoEsquema[] = [];
  const cable = (x1: number, y1: number, x2: number, y2: number) => cables.push({ x1, y1, x2, y2 });

  // Reparto del ancho de la cadena entre los elementos.
  const pesos = elementos.map((e) => (e.tipo === "bloque" ? PESO_BLOQUE : PESO_RESISTOR));
  const pesoTotal = pesos.reduce((a, b) => a + b, 0);
  const disponible = X_CADENA_2 - X_CADENA_1;

  // Camino actual del tronco (se corta en cada bloque).
  let tronco: Punto[] = [{ x: X_POSITIVA, y: yPrincipal }];
  const cerrarTronco = (corriente: number) => {
    if (tronco.length >= 2) pulsos.push({ puntos: sinRepetidos(tronco), corriente, duracionMs: duracionPara(corriente, corrienteTotal) });
  };

  let x = X_CADENA_1;
  elementos.forEach((el, idx) => {
    const ancho = (disponible * pesos[idx]) / pesoTotal;
    const x1 = x;
    const x2 = x + ancho;
    x = x2;

    if (el.tipo === "resistor") {
      const largo = Math.min(72, ancho - 12);
      const zx1 = (x1 + x2) / 2 - largo / 2;
      const zx2 = zx1 + largo;
      cable(x1, yPrincipal, zx1, yPrincipal);
      cable(zx2, yPrincipal, x2, yPrincipal);
      const puntos = zigzag(zx1, zx2, yPrincipal);
      resistores.push({
        id: el.nodo.id,
        ohmios: el.nodo.ohmios,
        puntos,
        x1: zx1,
        x2: zx2,
        y: yPrincipal,
        xCentro: (x1 + x2) / 2,
        yEtiqueta: yPrincipal - AMPLITUD - 6,
        yValor: yPrincipal + AMPLITUD + 14,
        anchoTexto: ancho - 4,
      });
      tronco.push(...puntos, { x: x2, y: yPrincipal });
      return;
    }

    // Bloque en paralelo: dos rieles verticales con un peldaño por resistor.
    const railL = x1 + MARGEN_RIEL;
    const railR = x2 - MARGEN_RIEL;
    cable(x1, yPrincipal, railL, yPrincipal);
    cable(railR, yPrincipal, x2, yPrincipal);
    tronco.push({ x: railL, y: yPrincipal });
    cerrarTronco(corrienteTotal);
    tronco = [{ x: railR, y: yPrincipal }, { x: x2, y: yPrincipal }];

    const n = el.hijos.length;
    const ys = el.hijos.map((_, i) => yPrincipal + (i - (n - 1) / 2) * SEPARACION_RAMAS);
    cable(railL, ys[0], railL, ys[n - 1]);
    cable(railR, ys[0], railR, ys[n - 1]);
    uniones.push({ x: railL, y: yPrincipal }, { x: railR, y: yPrincipal });
    el.hijos.forEach((h, i) => {
      const y = ys[i];
      const puntos = zigzag(railL, railR, y);
      // Los extremos de los peldaños en las puntas de los rieles son esquinas
      // (sin punto); los intermedios son uniones en T.
      if (i > 0 && i < n - 1 && Math.abs(y - yPrincipal) > 0.01) uniones.push({ x: railL, y }, { x: railR, y });
      resistores.push({
        id: h.id,
        ohmios: h.ohmios,
        puntos,
        x1: railL,
        x2: railR,
        y,
        xCentro: (railL + railR) / 2,
        yEtiqueta: y - AMPLITUD - 6,
        yValor: y + AMPLITUD + 14,
        anchoTexto: railR - railL - 4,
      });
      // Camino de la rama: entra por el riel izquierdo, atraviesa el resistor
      // y sale por el riel derecho hacia el nodo de salida.
      const rama: Punto[] = [{ x: railL, y: yPrincipal }, { x: railL, y }, ...puntos.slice(1), { x: railR, y }, { x: railR, y: yPrincipal }];
      pulsos.push({ puntos: sinRepetidos(rama), corriente: corrienteDe(h.id), duracionMs: duracionPara(corrienteDe(h.id), corrienteTotal) });
    });
  });

  // Cierre del lazo: por la derecha, por abajo y de vuelta al terminal −.
  tronco.push({ x: X_DER, y: yPrincipal }, { x: X_DER, y: yInferior }, { x: X_IZQ, y: yInferior }, { x: X_IZQ, y: yPrincipal }, { x: X_NEGATIVA - 1, y: yPrincipal });
  cerrarTronco(corrienteTotal);
  cable(X_DER, yPrincipal, X_DER, yInferior);
  cable(X_DER, yInferior, X_IZQ, yInferior);
  cable(X_IZQ, yInferior, X_IZQ, yPrincipal);
  cable(X_IZQ, yPrincipal, X_NEGATIVA, yPrincipal);
  cable(X_POSITIVA, yPrincipal, X_CADENA_1, yPrincipal);

  const flechas = pulsos.map((p) => flechaDelTramoMasLargo(p.puntos)).filter((f): f is FlechaEsquema => f !== null);

  return {
    ancho: ANCHO_ESQUEMA,
    alto,
    cables,
    uniones,
    resistores,
    bateria: {
      xNegativa: X_NEGATIVA,
      xPositiva: X_POSITIVA,
      y: yPrincipal,
      xTexto: (X_NEGATIVA + X_POSITIVA) / 2,
      yTexto: yPrincipal + 30,
    },
    pulsos,
    flechas,
    corrienteTotal,
    bloques: elementos.filter((e): e is Extract<Elemento, { tipo: "bloque" }> => e.tipo === "bloque").map((e) => e.hijos.length),
  };
}

// ---------- Resistencia equivalente: los resistores en su arreglo ----------

export interface CableEquivalente extends CableEsquema {
  // Cantidad mínima de resistores ya mostrados para que este cable aparezca
  // (así el arreglo se va armando de a un resistor).
  desde: number;
}

export interface EsquemaEquivalente {
  modo: "serie" | "paralelo";
  ancho: number;
  alto: number;
  resistores: ResistorEsquema[];
  cables: CableEquivalente[];
  // Uniones en T de los rieles (solo paralelo; aparecen con 2 o más resistores).
  uniones: Punto[];
  // Resistor único al que se funde el arreglo (id "Req", ohmios = el total).
  equivalente: ResistorEsquema;
  cablesEquivalente: CableEsquema[];
}

const ANCHO_EQ = 360;
const SEPARACION_EQ = 46;

export function disenarEquivalente(modo: "serie" | "paralelo", ohmios: number[], total: number): EsquemaEquivalente {
  const n = ohmios.length;
  if (n < 2) throw new Error("Circuitia (esquema): hacen falta al menos 2 resistores.");
  const cables: CableEquivalente[] = [];
  const resistores: ResistorEsquema[] = [];
  const alto = modo === "serie" ? 84 : 46 + (n - 1) * SEPARACION_EQ + 28;
  const yCentro = modo === "serie" ? 46 : 46 + ((n - 1) * SEPARACION_EQ) / 2;

  const resistor = (id: string, oh: number, x1: number, x2: number, y: number, anchoTexto: number): ResistorEsquema => ({
    id,
    ohmios: oh,
    puntos: zigzag(x1, x2, y),
    x1,
    x2,
    y,
    xCentro: (x1 + x2) / 2,
    yEtiqueta: y - AMPLITUD - 6,
    yValor: y + AMPLITUD + 14,
    anchoTexto,
  });

  if (modo === "serie") {
    const margen = 14;
    const slot = (ANCHO_EQ - 2 * margen) / n;
    ohmios.forEach((o, i) => {
      const s1 = margen + slot * i;
      const s2 = s1 + slot;
      const largo = Math.min(76, slot - 14);
      const z1 = (s1 + s2) / 2 - largo / 2;
      const z2 = z1 + largo;
      resistores.push(resistor(`R${i + 1}`, o, z1, z2, yCentro, slot - 4));
      cables.push({ x1: s1, y1: yCentro, x2: z1, y2: yCentro, desde: i + 1 }, { x1: z2, y1: yCentro, x2: s2, y2: yCentro, desde: i + 1 });
    });
  } else {
    const railL = 74;
    const railR = ANCHO_EQ - 74;
    const y0 = 46;
    ohmios.forEach((o, i) => {
      const y = y0 + i * SEPARACION_EQ;
      resistores.push(resistor(`R${i + 1}`, o, railL, railR, y, railR - railL - 4));
      if (i > 0) {
        cables.push({ x1: railL, y1: y - SEPARACION_EQ, x2: railL, y2: y, desde: i + 1 }, { x1: railR, y1: y - SEPARACION_EQ, x2: railR, y2: y, desde: i + 1 });
      }
    });
    cables.push({ x1: 14, y1: yCentro, x2: railL, y2: yCentro, desde: 2 }, { x1: railR, y1: yCentro, x2: ANCHO_EQ - 14, y2: yCentro, desde: 2 });
  }

  const largoEq = 96;
  const eq = resistor("Req", total, ANCHO_EQ / 2 - largoEq / 2, ANCHO_EQ / 2 + largoEq / 2, yCentro, 200);
  return {
    modo,
    ancho: ANCHO_EQ,
    alto,
    resistores,
    cables,
    uniones: modo === "paralelo" ? [{ x: 74, y: yCentro }, { x: ANCHO_EQ - 74, y: yCentro }] : [],
    equivalente: eq,
    cablesEquivalente: [
      { x1: 14, y1: yCentro, x2: eq.x1, y2: yCentro },
      { x1: eq.x2, y1: yCentro, x2: ANCHO_EQ - 14, y2: yCentro },
    ],
  };
}

// Texto que se escribe bajo un resistor con los valores ya revelados.
export function textoValores(v: { voltaje: number; corriente: number } | undefined, mostrar: "ninguna" | "voltaje" | "corriente" | "ambas"): string {
  if (!v) return "";
  const partes: string[] = [];
  if (mostrar === "corriente" || mostrar === "ambas") partes.push(`${v.corriente} A`);
  if (mostrar === "voltaje" || mostrar === "ambas") partes.push(`${v.voltaje} V`);
  return partes.join(" · ");
}

export function textoResistor(r: { id: string; ohmios: number }): string {
  return `${r.id} = ${r.ohmios} Ω`;
}
