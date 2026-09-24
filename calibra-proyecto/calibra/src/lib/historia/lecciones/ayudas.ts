import type { VisualCuadros, CuadroLeccion } from "@/lib/aprender/visuales";
import { HECHO_POR_ID, PERSONAJE_POR_ID, anioTexto, distinguibles, vidaTexto } from "@/lib/historia/tabla";
import { EPOCA_POR_ID } from "@/lib/historia/epocas";
import { aRomano, mismoSigloConMargen, siglo, sigloEtiqueta, sigloEtiquetaDe } from "@/lib/historia/tiempo";
import { EPOCAS, epocaDeAnio } from "@/lib/historia/epocas";
import { formatoAnio } from "@/lib/historia/tiempo";
import type { EpocaId, Hecho, Personaje, Region } from "@/lib/historia/tipos";
import type {
  VisualHistoriaCausas,
  VisualHistoriaEpocas,
  VisualHistoriaLinea,
  VisualHistoriaPersonaje,
  VisualHistoriaSiglos,
  VisualHistoriaSincronia,
} from "@/lib/historia/visuales";
import type { PreguntaLeccionHistoria } from "./tipos";

// Ayudas para ESCRIBIR las lecciones sin repetir datos a mano: todo nombre y todo
// año de un hecho o de un personaje sale de la TABLA CANÓNICA por id, así un dato
// se corrige en un solo lugar (hechos.ts / personajes.ts) y la migración se
// regenera. Un id inexistente lanza al importar el módulo: el error salta en el
// primer test, no en producción.

export function hecho(id: string): Hecho {
  const h = HECHO_POR_ID.get(id);
  if (!h) throw new Error(`Hecho desconocido en una lección: «${id}»`);
  return h;
}

export function pers(id: string): Personaje {
  const p = PERSONAJE_POR_ID.get(id);
  if (!p) throw new Error(`Personaje desconocido en una lección: «${id}»`);
  return p;
}

// Nombre del hecho tal como está en la tabla.
export const N = (id: string): string => hecho(id).nombre;
// «Nombre del hecho» (para usarlo en medio de una frase).
export const Q = (id: string): string => `«${hecho(id).nombre}»`;
// «490 a. C.», «hacia 2560 a. C.».
export const A = (id: string): string => anioTexto(hecho(id));
// «hacia 2560 a. C.» aunque la fecha no sea aproximada (para frases que dicen «hacia»).
export const AH = (id: string): string => (A(id).startsWith("hacia") ? A(id) : `hacia ${A(id)}`);
// Igual, con mayúscula inicial para empezar una frase: «Hacia 2560 a. C.».
export const AHc = (id: string): string => AH(id).charAt(0).toUpperCase() + AH(id).slice(1);
// «Batalla de Maratón (490 a. C.)».
export const NA = (id: string): string => `${hecho(id).nombre} (${anioTexto(hecho(id))})`;
// Nombre del personaje.
export const P = (id: string): string => pers(id).nombre;
// «Julio César (100 a. C. – 44 a. C.)».
export const PV = (id: string): string => `${pers(id).nombre} (${vidaTexto(pers(id))})`;
// «Siglo V a. C.» del hecho.
export const S = (id: string): string => sigloEtiqueta(hecho(id).anio);
// Siglo escrito «siglo XV» de un año cualquiera.
export const SIGLO = (anio: number): string => {
  const s = siglo(anio);
  return `siglo ${aRomano(s.n)}${s.aC ? " a. C." : ""}`;
};
// Siglo del auge de un personaje: «siglo XVIII a. C.».
export const SP = (id: string): string => SIGLO(pers(id).auge);
export const NOMBRE_EPOCA = (id: EpocaId): string => EPOCA_POR_ID[id].nombre.es;

// ---------- visuales (todo se arma a partir de ids) ----------
export function linea(despuesDePaso: number, titulo: string | undefined, hechos: string[], escala: "proporcional" | "orden" = "proporcional"): VisualHistoriaLinea {
  return { tipo: "historia.linea", despuesDePaso, ...(titulo ? { titulo } : {}), hechos, ...(escala === "orden" ? { escala } : {}) };
}

export function fichas(despuesDePaso: number, titulo: string | undefined, personajes: string[]): VisualHistoriaPersonaje {
  return { tipo: "historia.personaje", despuesDePaso, ...(titulo ? { titulo } : {}), personajes };
}

export function epocas(despuesDePaso: number, titulo: string | undefined, opciones: { resaltar?: EpocaId[]; ejemplos?: Partial<Record<EpocaId, string[]>> } = {}): VisualHistoriaEpocas {
  return { tipo: "historia.epocas", despuesDePaso, ...(titulo ? { titulo } : {}), ...opciones };
}

export function causas(despuesDePaso: number, titulo: string | undefined, cadena: string[]): VisualHistoriaCausas {
  return { tipo: "historia.causas", despuesDePaso, ...(titulo ? { titulo } : {}), cadena };
}

export function siglos(despuesDePaso: number, titulo: string | undefined, ejemplos: (number | string)[]): VisualHistoriaSiglos {
  return { tipo: "historia.siglos", despuesDePaso, ...(titulo ? { titulo } : {}), ejemplos };
}

export function sincronia(despuesDePaso: number, titulo: string | undefined, carriles: { region: Region; hechos: string[] }[]): VisualHistoriaSincronia {
  return { tipo: "historia.sincronia", despuesDePaso, ...(titulo ? { titulo } : {}), carriles };
}

export function cuadros(despuesDePaso: number, titulo: string | undefined, lista: CuadroLeccion[], msPorCuadro = 3000): VisualCuadros {
  return { tipo: "cuadros", despuesDePaso, ...(titulo ? { titulo } : {}), cuadros: lista, msPorCuadro };
}

// ---------- quiz ----------
// Posición de la respuesta correcta entre las opciones: determinista (depende solo
// del texto de la pregunta) para que la migración generada sea estable y la
// respuesta no esté siempre en el mismo lugar.
function posicionDe(texto: string, n: number): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % n;
}

export function preg(pregunta: string, correcta: string, incorrectas: string[], explicacion: string): PreguntaLeccionHistoria {
  const opciones = [...incorrectas];
  opciones.splice(posicionDe(pregunta, opciones.length + 1), 0, correcta);
  return { pregunta, opciones, respuesta: correcta, explicacion };
}

// «¿Cuál de estos hechos ocurrió primero?»: dos hechos que la tabla puede ordenar.
export function pregPrimero(a: string, b: string, explicacion?: string): PreguntaLeccionHistoria {
  const ha = hecho(a);
  const hb = hecho(b);
  if (!distinguibles(ha, hb)) throw new Error(`«${a}» y «${b}» no se pueden ordenar con seguridad`);
  const [primero, segundo] = ha.anio < hb.anio ? [ha, hb] : [hb, ha];
  return preg(
    `¿Cuál ocurrió primero: ${Q(ha.id)} o ${Q(hb.id)}?`,
    primero.nombre,
    [segundo.nombre, "Ocurrieron en el mismo año", "No se puede saber cuál fue primero"],
    explicacion ?? `${primero.nombre} es de ${anioTexto(primero)} y ${segundo.nombre}, de ${anioTexto(segundo)}.`
  );
}

// «¿En qué siglo ocurrió X?» con distractores de la trampa clásica (siglo vecino y
// mismo número en la otra era).
export function pregSiglo(id: string, explicacion?: string): PreguntaLeccionHistoria {
  const h = hecho(id);
  if (!mismoSigloConMargen(h.anio, h.margen)) throw new Error(`«${id}» no tiene un siglo seguro`);
  const s = siglo(h.anio);
  const distractores: string[] = [];
  if (s.n + 1 <= 21 || s.aC) distractores.push(sigloEtiquetaDe(s.n + 1, s.aC));
  if (s.n - 1 >= 1) distractores.push(sigloEtiquetaDe(s.n - 1, s.aC));
  distractores.push(sigloEtiquetaDe(s.n, !s.aC));
  if (distractores.length < 3) distractores.push(sigloEtiquetaDe(s.n + 2, s.aC));
  return preg(
    `¿En qué siglo ocurrió ${Q(id)}?`,
    sigloEtiqueta(h.anio),
    distractores.slice(0, 3),
    explicacion ?? `${anioTexto(h)} pertenece al ${SIGLO(h.anio)}: el siglo n va del año (n − 1) · 100 + 1 al año n · 100 y, en los años a. C., se cuenta hacia atrás.`
  );
}

// Años que separan dos hechos (número entero positivo), para escribir «297 años».
export const DIST = (a: string, b: string): number => Math.abs(hecho(a).anio - hecho(b).anio) + (hecho(a).anio < 0 !== hecho(b).anio < 0 ? -1 : 0);

// «¿En qué época ocurrió X?»: solo hechos de época clara (lejos de una frontera).
export function pregEpoca(id: string, explicacion?: string): PreguntaLeccionHistoria {
  const h = hecho(id);
  if (h.frontera || epocaDeAnio(h.anio - h.margen) !== epocaDeAnio(h.anio + h.margen)) throw new Error(`«${id}» no tiene una época segura`);
  const e = EPOCAS.find((x) => x.id === h.epoca)!;
  const otras = EPOCAS.filter((x) => x.id !== e.id).map((x) => x.nombre.es);
  const cerca = otras.filter((n) => Math.abs(EPOCAS.find((x) => x.nombre.es === n)!.numero - e.numero) === 1);
  const lejos = otras.filter((n) => !cerca.includes(n));
  const dist = [...cerca, ...lejos].slice(0, 3);
  return preg(
    `Según la periodización escolar, ¿en qué época ocurrió ${Q(id)}?`,
    e.nombre.es,
    dist,
    explicacion ?? `${A(id)} cae en la ${e.nombre.es} (${e.numero === 1 ? "hasta " : "desde "}${e.numero === 1 ? formatoAnio(EPOCAS[1].desde) : formatoAnio(e.desde)}, por convención escolar).`
  );
}

// «¿Cuál de estos hechos contribuyó a provocar X?»: la causa está en la tabla y los
// distractores son POSTERIORES al hecho, así que no pueden ser su causa.
export function pregCausa(efecto: string, causa: string, distractores: string[], explicacion?: string): PreguntaLeccionHistoria {
  const e = hecho(efecto);
  if (!e.causas.includes(causa)) throw new Error(`«${causa}» no figura como causa de «${efecto}»`);
  for (const d of distractores) {
    const h = hecho(d);
    if (!(h.anio - h.margen > e.anio + e.margen)) throw new Error(`Distractor «${d}» no es posterior a «${efecto}»`);
  }
  return preg(
    `¿Cuál de estos hechos contribuyó a provocar ${Q(efecto)}?`,
    N(causa),
    distractores.map(N),
    explicacion ?? `${N(causa)} (${A(causa)}) fue anterior y contribuyó a provocarlo; los otros hechos ocurrieron después de ${A(efecto)}, así que no pueden ser una causa.`
  );
}

// «¿Cuál de estos hechos fue consecuencia de X?»: los distractores son ANTERIORES a la causa.
export function pregConsecuencia(causa: string, efecto: string, distractores: string[], explicacion?: string): PreguntaLeccionHistoria {
  const c = hecho(causa);
  if (!hecho(efecto).causas.includes(causa)) throw new Error(`«${efecto}» no es consecuencia de «${causa}»`);
  for (const d of distractores) {
    const h = hecho(d);
    if (!(h.anio + h.margen < c.anio - c.margen)) throw new Error(`Distractor «${d}» no es anterior a «${causa}»`);
  }
  return preg(
    `¿Cuál de estos hechos fue consecuencia de ${Q(causa)}?`,
    N(efecto),
    distractores.map(N),
    explicacion ?? `${N(efecto)} (${A(efecto)}) vino después y se apoya en ${Q(causa)}; los otros hechos son anteriores a ${A(causa)}, así que no pueden ser su consecuencia.`
  );
}

// «¿Quién fue?» a partir del rol y del dato de la tabla. Los distractores tienen otro dato.
export function pregQuien(id: string, distractores: string[], explicacion?: string): PreguntaLeccionHistoria {
  const p = pers(id);
  for (const d of distractores) if (pers(d).logro === p.logro) throw new Error(`«${d}» tiene el mismo dato que «${id}»`);
  return preg(
    `¿Quién fue este personaje? ${p.rol}. ${p.logro}`,
    p.nombre,
    distractores.map(P),
    explicacion ?? `${p.nombre} (${vidaTexto(p)}): ${p.logro.charAt(0).toLowerCase()}${p.logro.slice(1)}`
  );
}

// «¿En qué año ocurrió X?»: solo hechos de fecha exacta; los distractores están en la misma era.
export function pregAnio(id: string, distractores: number[], explicacion?: string): PreguntaLeccionHistoria {
  const h = hecho(id);
  if (h.certeza !== "exacta") throw new Error(`«${id}» no tiene un año exacto`);
  for (const d of distractores) if (d === h.anio || Math.sign(d) !== Math.sign(h.anio)) throw new Error(`Distractor inválido para «${id}»`);
  return preg(`¿En qué año ocurrió ${Q(id)}?`, formatoAnio(h.anio), distractores.map(formatoAnio), explicacion ?? `${N(id)} ocurrió en ${formatoAnio(h.anio)}.`);
}

// Distractores de `pregSiglo` y afines: ids de hechos que NO están entre `excluir`.
export function nombresDe(ids: string[]): string[] {
  return ids.map(N);
}

// Un año que termina la frase («... es anterior a 490 a. C.») queda con dos puntos
// («a. C..»): se deja uno solo. Se aplica a todo el texto de cada lección al armar los
// arreglos (tecnicas.ts y clases.ts); los tres puntos suspensivos no se tocan.
export function sinPuntoDoble(s: string): string {
  return s.replace(/\b([ad])\. C\.\.(?!\.)/g, "$1. C.");
}

export function normalizarTextos<T>(valor: T): T {
  if (typeof valor === "string") return sinPuntoDoble(valor) as unknown as T;
  if (Array.isArray(valor)) return valor.map((x) => normalizarTextos(x)) as unknown as T;
  if (valor !== null && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, normalizarTextos(v)])) as T;
  }
  return valor;
}
