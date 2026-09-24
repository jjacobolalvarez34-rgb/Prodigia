import { EPOCAS } from "./epocas";
import { HECHO_POR_ID, NOMBRE_REGION, PERSONAJE_POR_ID, anioTexto, distinguibles, vidaTexto } from "./tabla";
import { aRomano, formatoAnio, limitesSiglo, mismoSigloConMargen, siglo } from "./tiempo";
import type { EpocaId, Hecho, Region } from "./tipos";
import type { VisualHistoriaCausas, VisualHistoriaEpocas, VisualHistoriaLinea, VisualHistoriaPersonaje, VisualHistoriaSiglos, VisualHistoriaSincronia } from "./visuales";

// Funciones PURAS que calculan lo que dibujan los visuales de Historia a partir de
// la tabla canónica. Todo dato (nombre, año, siglo, certeza) sale de acá; los
// componentes no calculan ni escriben nada a mano. Toda coordenada se redondea a 2
// decimales: Math.* puede diferir en el último bit entre Node y Chromium y eso
// rompería la hidratación (bug real de Quimia, tanda 1). Si un id no existe o una
// relación no está en la tabla, la función LANZA y el visual se omite.

export const r2 = (x: number): number => Math.round(x * 100) / 100;

function hecho(id: string): Hecho {
  const h = HECHO_POR_ID.get(id);
  if (!h) throw new Error(`Hecho desconocido: «${id}»`);
  return h;
}

// Los años a. C. se ubican en un eje continuo sin año 0: 1 a. C. es -1 y 1 d. C. es 1.
// Para medir distancias se los pasa a «año astronómico» (sin salto).
const continuo = (anio: number): number => (anio < 0 ? anio + 1 : anio);

// ---------------------------------------------------------------------------
// LÍNEA DE TIEMPO
// ---------------------------------------------------------------------------
export interface FilaLinea {
  id: string;
  nombre: string;
  // «490 a. C.», «hacia 2560 a. C.»
  anioTexto: string;
  certeza: Hecho["certeza"];
  // Posición del punto en el eje (0 = arriba) y del centro de su etiqueta.
  yEje: number;
  yFila: number;
  anio: number;
}

export interface MarcaEje {
  y: number;
  texto: string;
}

export interface DatosLinea {
  escala: "proporcional" | "orden";
  filas: FilaLinea[];
  marcas: MarcaEje[];
  // Medidas fijas del dibujo (unidades del viewBox de la parte izquierda).
  altoFila: number;
  alto: number;
  margen: number;
  // El eje cruza el año 1 (a. C. / d. C.): la figura lo señala en `eraY`.
  cruzaEra: boolean;
  eraY: number | null;
  // Cuántos años separan el primer y el último hecho.
  span: number;
  // Algún par de hechos consecutivos tiene fechas que se superponen (por sus márgenes):
  // el orden de la figura es el de la estimación más habitual, no una certeza.
  superposicion: boolean;
}

export const MEDIDAS_LINEA = { altoFila: 60, margen: 18, minHechos: 2, maxHechos: 10 } as const;

// Pasos «redondos» posibles entre marcas del eje.
const PASOS_MARCA = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];

function marcasDelEje(min: number, max: number, yDe: (anio: number) => number): MarcaEje[] {
  const span = max - min;
  const paso = PASOS_MARCA.find((p) => span / p <= 5) ?? PASOS_MARCA[PASOS_MARCA.length - 1];
  const marcas: MarcaEje[] = [];
  const desde = Math.ceil(min / paso) * paso;
  for (let a = desde; a <= max; a += paso) {
    if (a === 0) continue;
    marcas.push({ y: r2(yDe(a)), texto: a < 0 ? `${-a} a. C.` : a < 1000 ? `${a} d. C.` : String(a) });
  }
  return marcas;
}

export function datosLinea(v: VisualHistoriaLinea): DatosLinea {
  if (!Array.isArray(v.hechos) || v.hechos.length < MEDIDAS_LINEA.minHechos || v.hechos.length > MEDIDAS_LINEA.maxHechos) {
    throw new Error(`La línea de tiempo lleva de ${MEDIDAS_LINEA.minHechos} a ${MEDIDAS_LINEA.maxHechos} hechos`);
  }
  if (new Set(v.hechos).size !== v.hechos.length) throw new Error("Hechos repetidos en la línea de tiempo");
  const hs = v.hechos.map(hecho).sort((a, b) => a.anio - b.anio);
  const n = hs.length;
  const { altoFila, margen } = MEDIDAS_LINEA;
  const alto = n * altoFila + 2 * margen;
  const min = hs[0].anio;
  const max = hs[n - 1].anio;
  const escala = v.escala ?? "proporcional";
  if (escala === "proporcional" && continuo(max) - continuo(min) <= 0) throw new Error("La escala proporcional necesita años distintos");
  const yFilaDe = (i: number) => margen + altoFila * i + altoFila / 2;
  const yEjeDe = (anio: number) => margen + ((continuo(anio) - continuo(min)) / (continuo(max) - continuo(min))) * (alto - 2 * margen);
  const filas: FilaLinea[] = hs.map((h, i) => ({
    id: h.id,
    nombre: h.nombre,
    anioTexto: anioTexto(h),
    certeza: h.certeza,
    yEje: r2(escala === "orden" ? yFilaDe(i) : yEjeDe(h.anio)),
    yFila: r2(yFilaDe(i)),
    anio: h.anio,
  }));
  return {
    escala,
    filas,
    marcas: escala === "proporcional" ? marcasDelEje(min, max, yEjeDe) : [],
    altoFila,
    alto,
    margen,
    cruzaEra: min < 0 && max > 0,
    eraY: min < 0 && max > 0 && escala === "proporcional" ? r2(margen + ((0.5 - continuo(min)) / (continuo(max) - continuo(min))) * (alto - 2 * margen)) : null,
    span: max - min,
    superposicion: hs.some((h, i) => i > 0 && !distinguibles(hs[i - 1], h)),
  };
}

export function textoLinea(v: VisualHistoriaLinea): string {
  const d = datosLinea(v);
  return d.filas.map((f) => `${f.nombre}, ${f.anioTexto}`).join("; ");
}

// ---------------------------------------------------------------------------
// LAS 5 ÉPOCAS
// ---------------------------------------------------------------------------
export interface BandaEpoca {
  id: EpocaId;
  numero: number;
  nombreEs: string;
  nombreEn: string;
  // «hasta 3500 a. C.», «3500 a. C. – 476 d. C.»
  rango: string;
  resaltada: boolean;
  // Hecho frontera que abre la época (null en la Prehistoria).
  frontera: { id: string; nombre: string; anioTexto: string; nota: string } | null;
  ejemplos: { id: string; nombre: string; anioTexto: string }[];
}

export function datosEpocas(v: VisualHistoriaEpocas): BandaEpoca[] {
  const resaltar = new Set(v.resaltar ?? []);
  return EPOCAS.map((e) => {
    const fr = e.numero === 1 ? null : [...HECHO_POR_ID.values()].find((h) => h.frontera && h.epoca === e.id) ?? null;
    if (e.numero > 1 && !fr) throw new Error(`Falta el hecho frontera de ${e.id}`);
    const ejemplos = (v.ejemplos?.[e.id] ?? []).map(hecho);
    if (ejemplos.length > 3) throw new Error("Hasta 3 ejemplos por época");
    for (const h of ejemplos) if (h.epoca !== e.id) throw new Error(`«${h.id}» no es de la época ${e.id}`);
    const fin = e.hasta >= 2000 ? "hoy" : formatoAnio(e.hasta);
    const rango = e.numero === 1 ? `hasta ${formatoAnio(EPOCAS[1].desde)}` : e.numero === 5 ? `desde ${formatoAnio(e.desde)}` : `${formatoAnio(e.desde)} – ${fin}`;
    return {
      id: e.id,
      numero: e.numero,
      nombreEs: e.nombre.es,
      nombreEn: e.nombre.en,
      rango,
      resaltada: resaltar.size === 0 || resaltar.has(e.id),
      frontera: fr ? { id: fr.id, nombre: fr.nombre, anioTexto: anioTexto(fr), nota: e.frontera!.es } : null,
      ejemplos: ejemplos.map((h) => ({ id: h.id, nombre: h.nombre, anioTexto: anioTexto(h) })),
    };
  });
}

export function textoEpocas(v: VisualHistoriaEpocas): string {
  return datosEpocas(v)
    .map((b) => `${b.numero}. ${b.nombreEs}, ${b.rango}${b.frontera ? ` (${b.frontera.nota})` : ""}`)
    .join(" ");
}

// ---------------------------------------------------------------------------
// CADENA CAUSAL
// ---------------------------------------------------------------------------
export interface NodoCausa {
  id: string;
  nombre: string;
  anioTexto: string;
  anio: number;
  rol: "causa" | "hecho" | "consecuencia";
}

export function datosCausas(v: VisualHistoriaCausas): NodoCausa[] {
  if (!Array.isArray(v.cadena) || v.cadena.length < 2 || v.cadena.length > 5) throw new Error("La cadena causal lleva de 2 a 5 hechos");
  const hs = v.cadena.map(hecho);
  for (let i = 1; i < hs.length; i++) {
    if (!hs[i].causas.includes(hs[i - 1].id)) throw new Error(`«${hs[i - 1].id}» no figura como causa de «${hs[i].id}» en la tabla`);
  }
  return hs.map((h, i) => ({
    id: h.id,
    nombre: h.nombre,
    anioTexto: anioTexto(h),
    anio: h.anio,
    rol: i === 0 ? "causa" : i === hs.length - 1 ? "consecuencia" : "hecho",
  }));
}

export function textoCausas(v: VisualHistoriaCausas): string {
  return datosCausas(v)
    .map((n) => `${n.nombre} (${n.anioTexto})`)
    .join(" → ");
}

// ---------------------------------------------------------------------------
// AÑO A SIGLO
// ---------------------------------------------------------------------------
export interface EjemploSiglo {
  // Texto del ejemplo: «1492» o «Batalla de Maratón, 490 a. C.».
  etiqueta: string;
  anio: number;
  aC: boolean;
  // Valor absoluto, centenas completas y resto.
  valor: number;
  centenas: number;
  resto: number;
  n: number;
  romano: string;
  // «Siglo XV».
  siglo: string;
  // Años que abarca el siglo: «1401 – 1500» o «500 a. C. – 401 a. C.».
  desde: string;
  hasta: string;
  // El año es el último del siglo (año redondo).
  cierra: boolean;
}

export function datosSiglos(v: VisualHistoriaSiglos): EjemploSiglo[] {
  if (!Array.isArray(v.ejemplos) || v.ejemplos.length < 1 || v.ejemplos.length > 6) throw new Error("De 1 a 6 ejemplos");
  return v.ejemplos.map((e) => {
    const h = typeof e === "string" ? hecho(e) : null;
    const anio = h ? h.anio : e;
    if (typeof anio !== "number") throw new Error("Ejemplo inválido");
    if (h && !mismoSigloConMargen(h.anio, h.margen)) throw new Error(`«${h.id}» no tiene un año exacto para calcular su siglo`);
    const s = siglo(anio);
    const valor = Math.abs(anio);
    const { primero, ultimo } = limitesSiglo(s.n, s.aC);
    return {
      etiqueta: h ? `${h.nombre}, ${anioTexto(h)}` : formatoAnio(anio),
      anio,
      aC: s.aC,
      valor,
      centenas: Math.floor(valor / 100),
      resto: valor % 100,
      n: s.n,
      romano: aRomano(s.n),
      siglo: `Siglo ${aRomano(s.n)}${s.aC ? " a. C." : ""}`,
      desde: formatoAnio(primero),
      hasta: formatoAnio(ultimo),
      cierra: valor % 100 === 0,
    };
  });
}

export function textoSiglos(v: VisualHistoriaSiglos): string {
  return datosSiglos(v)
    .map((e) => `${e.etiqueta}: ${e.siglo}`)
    .join("; ");
}

// ---------------------------------------------------------------------------
// SINCRONÍA
// ---------------------------------------------------------------------------
export interface MarcaSincronia {
  id: string;
  numero: number;
  nombre: string;
  anioTexto: string;
  x: number;
  anio: number;
}

export interface CarrilDatos {
  region: Region;
  regionEs: string;
  y: number;
  marcas: MarcaSincronia[];
}

export interface DatosSincronia {
  carriles: CarrilDatos[];
  ancho: number;
  alto: number;
  x0: number;
  x1: number;
  marcasEje: MarcaEje[];
  // Todas las marcas, en orden cronológico, para la leyenda.
  leyenda: MarcaSincronia[];
  desde: number;
  hasta: number;
}

// Distancia mínima (en unidades del dibujo) entre dos marcas del mismo carril: el diámetro del círculo.
export const SEPARACION_MINIMA = 20;

export const MEDIDAS_SINCRONIA = { ancho: 340, altoCarril: 52, margenSup: 14, x0: 92, x1: 322, margenInf: 30 } as const;

export function datosSincronia(v: VisualHistoriaSincronia): DatosSincronia {
  if (!Array.isArray(v.carriles) || v.carriles.length < 2 || v.carriles.length > 4) throw new Error("La sincronía lleva de 2 a 4 carriles");
  const todos = v.carriles.flatMap((c) => c.hechos);
  if (todos.length < 3 || todos.length > 10) throw new Error("La sincronía lleva de 3 a 10 hechos");
  if (new Set(todos).size !== todos.length) throw new Error("Hechos repetidos en la sincronía");
  if (new Set(v.carriles.map((c) => c.region)).size !== v.carriles.length) throw new Error("Regiones repetidas");
  const hs = todos.map(hecho);
  const min = Math.min(...hs.map((h) => h.anio));
  const max = Math.max(...hs.map((h) => h.anio));
  if (continuo(max) - continuo(min) <= 0) throw new Error("La sincronía necesita años distintos");
  const { ancho, altoCarril, margenSup, x0, x1, margenInf } = MEDIDAS_SINCRONIA;
  const xDe = (anio: number) => x0 + ((continuo(anio) - continuo(min)) / (continuo(max) - continuo(min))) * (x1 - x0);
  const ordenadas = [...hs].sort((a, b) => a.anio - b.anio || a.id.localeCompare(b.id));
  const numeroDe = new Map(ordenadas.map((h, i) => [h.id, i + 1]));
  const carriles: CarrilDatos[] = v.carriles.map((c, i) => ({
    region: c.region,
    regionEs: NOMBRE_REGION[c.region],
    y: r2(margenSup + altoCarril * i + altoCarril / 2),
    marcas: c.hechos.map(hecho).map((h) => ({
      id: h.id,
      numero: numeroDe.get(h.id)!,
      nombre: h.nombre,
      anioTexto: anioTexto(h),
      x: r2(xDe(h.anio)),
      anio: h.anio,
    })),
  }));
  for (const c of carriles) {
    const xs = c.marcas.map((m) => m.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) {
      if (xs[i] - xs[i - 1] < SEPARACION_MINIMA) throw new Error(`Marcas solapadas en el carril ${c.region}`);
    }
  }
  return {
    carriles,
    ancho,
    alto: margenSup + altoCarril * v.carriles.length + margenInf,
    x0,
    x1,
    marcasEje: marcasDelEje(min, max, xDe),
    leyenda: ordenadas.map((h) => carriles.flatMap((c) => c.marcas).find((m) => m.id === h.id)!),
    desde: min,
    hasta: max,
  };
}

export function textoSincronia(v: VisualHistoriaSincronia): string {
  const d = datosSincronia(v);
  return d.carriles.map((c) => `${c.regionEs}: ${c.marcas.map((m) => `${m.nombre}, ${m.anioTexto}`).join("; ")}`).join(". ");
}

// ---------------------------------------------------------------------------
// FICHAS DE PERSONAJES
// ---------------------------------------------------------------------------
export interface FichaPersonaje {
  id: string;
  nombre: string;
  rol: string;
  vida: string;
  epocaEs: string;
  epocaEn: string;
  regionEs: string;
  region: Region;
  logro: string;
  siglo: string;
  hechos: { id: string; nombre: string; anioTexto: string }[];
}

export function datosPersonajes(v: VisualHistoriaPersonaje): FichaPersonaje[] {
  if (!Array.isArray(v.personajes) || v.personajes.length < 1 || v.personajes.length > 8) throw new Error("De 1 a 8 personajes");
  if (new Set(v.personajes).size !== v.personajes.length) throw new Error("Personajes repetidos");
  return v.personajes.map((id) => {
    const p = PERSONAJE_POR_ID.get(id);
    if (!p) throw new Error(`Personaje desconocido: «${id}»`);
    const e = EPOCAS.find((x) => x.id === p.epoca)!;
    const s = siglo(p.auge);
    return {
      id: p.id,
      nombre: p.nombre,
      rol: p.rol,
      vida: vidaTexto(p),
      epocaEs: e.nombre.es,
      epocaEn: e.nombre.en,
      regionEs: NOMBRE_REGION[p.region],
      region: p.region,
      logro: p.logro,
      siglo: `siglo ${aRomano(s.n)}${s.aC ? " a. C." : ""}`,
      hechos: [...HECHO_POR_ID.values()]
        .filter((h) => h.personajes.includes(p.id))
        .slice(0, 3)
        .map((h) => ({ id: h.id, nombre: h.nombre, anioTexto: anioTexto(h) })),
    };
  });
}

export function textoPersonajes(v: VisualHistoriaPersonaje): string {
  return datosPersonajes(v)
    .map((f) => `${f.nombre}: ${f.rol}, ${f.vida}. ${f.logro}`)
    .join(" ");
}
