import type { EpocaId, Hecho, Personaje, Region } from "./tipos";
import { HECHOS } from "./hechos";
import { PERSONAJES } from "./personajes";
import { formatoAnio } from "./tiempo";

// Índices y consultas sobre la tabla canónica (hechos.ts y personajes.ts). Todo
// lo que se DERIVA de la tabla (cronología, fechas, causa y efecto, visuales,
// lecciones) pregunta acá; nada guarda una copia de un año o de un nombre.

export { HECHOS, PERSONAJES };

export const NOMBRE_REGION: Record<Region, string> = {
  europa: "Europa",
  africa: "África",
  "oriente-proximo": "Oriente Próximo",
  "asia-sur": "Asia del Sur",
  "asia-oriental": "Asia Oriental",
  "asia-central": "Asia Central",
  "asia-sudeste": "Asia Sudoriental",
  america: "América",
  oceania: "Oceanía",
  global: "Global",
};


export const HECHO_POR_ID: ReadonlyMap<string, Hecho> = new Map(HECHOS.map((h) => [h.id, h]));
export const PERSONAJE_POR_ID: ReadonlyMap<string, Personaje> = new Map(PERSONAJES.map((p) => [p.id, p]));

export function hecho(id: string): Hecho {
  const h = HECHO_POR_ID.get(id);
  if (!h) throw new Error(`Hecho desconocido: «${id}»`);
  return h;
}

export function personaje(id: string): Personaje {
  const p = PERSONAJE_POR_ID.get(id);
  if (!p) throw new Error(`Personaje desconocido: «${id}»`);
  return p;
}

// Hechos que tienen a `id` entre sus causas (sus consecuencias directas en la tabla).
const CONSECUENCIAS = new Map<string, Hecho[]>();
for (const h of HECHOS) for (const c of h.causas) CONSECUENCIAS.set(c, [...(CONSECUENCIAS.get(c) ?? []), h]);

export function consecuenciasDe(id: string): Hecho[] {
  return CONSECUENCIAS.get(id) ?? [];
}

export function causasDe(id: string): Hecho[] {
  return hecho(id).causas.map(hecho);
}

export function hechosDeEpoca(epoca: EpocaId): Hecho[] {
  return HECHOS.filter((h) => h.epoca === epoca);
}

export function personajesDeEpoca(epoca: EpocaId): Personaje[] {
  return PERSONAJES.filter((p) => p.epoca === epoca);
}

// Hechos en los que figura un personaje.
export function hechosDePersonaje(id: string): Hecho[] {
  return HECHOS.filter((h) => h.personajes.includes(id));
}

// Intervalo en que se acepta que un personaje estaba activo: su vida, o (si se
// ignora un extremo) 40 años alrededor de su auge.
export function ventanaDeVida(p: Personaje): [number, number] {
  return [p.nac ?? p.auge - 40, p.mue ?? p.auge + 40];
}

// «hacia 2560 a. C.» para los aproximados, «753 a. C.» para el resto.
export function anioTexto(h: Pick<Hecho, "anio" | "certeza">): string {
  return h.certeza === "aproximada" ? `hacia ${formatoAnio(h.anio)}` : formatoAnio(h.anio);
}

// «Batalla de Maratón (490 a. C.)».
export function nombreConAnio(h: Pick<Hecho, "nombre" | "anio" | "certeza">): string {
  return `${h.nombre} (${anioTexto(h)})`;
}

// «Julio César (100 a. C. – 44 a. C.)», «Homero (siglo VIII a. C., aprox.)»...
export function vidaTexto(p: Personaje): string {
  const f = (n: number | null) => (n === null ? "?" : formatoAnio(n));
  const aprox = p.aprox ? " (fechas aproximadas)" : "";
  if (p.nac === null && p.mue === null) return `activo hacia ${formatoAnio(p.auge)}${aprox}`;
  if (p.nac === null) return `murió en ${f(p.mue)}${aprox}`;
  if (p.mue === null) return `nació en ${f(p.nac)}`;
  return `${f(p.nac)} – ${f(p.mue)}${aprox}`;
}

// ¿A y B están separados por más años que la suma de sus márgenes? (solo
// entonces se puede afirmar cuál ocurrió antes).
export function distinguibles(a: Hecho, b: Hecho): boolean {
  return Math.abs(a.anio - b.anio) > a.margen + b.margen;
}

export function primeroSeguro(a: Hecho, b: Hecho): Hecho | null {
  if (!distinguibles(a, b)) return null;
  return a.anio < b.anio ? a : b;
}

// ¿El texto revela el nombre de un personaje? (alguna palabra significativa de su
// nombre aparece en el texto). Una pregunta «¿qué personaje se relaciona con
// "Napoleón invade España"?» sería trivial: se evita.
const PARTICULAS = new Set(["de", "del", "la", "el", "los", "las", "von", "van", "el", "gran", "grande", "magno", "conquistador", "sin", "tierra", "kan"]);

function sinAcentos(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const palabras = (s: string): string[] => sinAcentos(s).replace(/[().,;:«»¿?¡!]/g, " ").split(/[\s-]+/).filter(Boolean);

// Palabras del nombre que IDENTIFICAN al personaje: las que no son partículas,
// números romanos ni forman parte de su rol o de su pueblo («Isabel I de
// Castilla»: «Castilla» está en «reina de Castilla», que es una pista legítima).
export function palabrasDeNombre(p: Personaje): string[] {
  const descripcion = new Set(palabras(`${p.rol} ${p.pueblo}`));
  return palabras(p.nombre).filter((w) => w.length >= 3 && !PARTICULAS.has(w) && !/^[ivxl]+$/.test(w) && !descripcion.has(w));
}

export function textoRevela(texto: string, p: Personaje): boolean {
  const ws = palabras(texto);
  return palabrasDeNombre(p).some((tok) => ws.some((w) => w === tok || (tok.length >= 5 && w.startsWith(tok))));
}
