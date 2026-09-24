import {
  LETRAS,
  DURACION_FIGURA,
  FIGURAS,
  NOMBRE_ACORDE,
  NOMBRE_ESCALA,
  NOMBRE_FIGURA,
  construirAcorde,
  cifradoNota,
  construirEscala,
  frecuenciaDeNota,
  nombreNota,
  notaDesdeSemitonoAbsoluto,
  semitonoAbsoluto,
  type FiguraRitmica,
  type NotaLetra,
  type NotaMusical,
  type TipoAcorde,
} from "@/lib/practica/melodia";
import type {
  AcordeParametros,
  EscalaParametros,
  VisualMelodiaAcorde,
  VisualMelodiaEscala,
  VisualMelodiaFrecuencia,
  VisualMelodiaPentagrama,
  VisualMelodiaRitmo,
  VisualMelodiaTeclado,
} from "@/lib/melodia/visuales";

// Funciones puras que limpian y resuelven los datos de los visuales de
// Melodía. Los componentes SOLO dibujan lo que estas funciones devuelven:
// nunca calculan (ni tipean) una escala, un acorde o una frecuencia por su
// cuenta — todo sale de src/lib/practica/melodia.ts. Un dato malo del jsonb
// se descarta sin romper la lección.

export const MAX_NOTAS_PENTAGRAMA = 10;
export const MAX_NOTAS_TECLADO = 10;
export const MAX_NOTAS_FRECUENCIA = 6;
export const MAX_FIGURAS = 4;

const LETRAS_SET = new Set<string>(LETRAS);

// "Do4", "Fa♯4", "Si♭3" -> nota. null si el texto no es una nota válida.
export function parseNota(texto: unknown): NotaMusical | null {
  if (typeof texto !== "string") return null;
  const m = /^(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)(\d)$/.exec(texto.trim());
  if (!m || !LETRAS_SET.has(m[1])) return null;
  return { letra: m[1] as NotaLetra, alteracion: m[2] === "♯" ? "sostenido" : m[2] === "♭" ? "bemol" : null, octava: Number(m[3]) };
}

// Nota sin la octava: "Fa♯".
export function nombreSinOctava(nota: NotaMusical): string {
  return nombreNota(nota).replace(/\d+$/, "");
}

// Lista de notas de un jsonb: descarta lo que no es una nota y recorta.
export function resolverNotas(crudo: unknown, max: number): NotaMusical[] {
  if (!Array.isArray(crudo)) return [];
  const salida: NotaMusical[] = [];
  for (const c of crudo) {
    const n = parseNota(c);
    if (n) salida.push(n);
    if (salida.length >= max) break;
  }
  return salida;
}

const ES_ESCALA = new Set(Object.keys(NOMBRE_ESCALA));
const ES_ACORDE = new Set(Object.keys(NOMBRE_ACORDE));

export function resolverEscala(p: unknown): { fundamental: NotaMusical; notas: NotaMusical[]; params: EscalaParametros } | null {
  if (typeof p !== "object" || p === null) return null;
  const e = p as Partial<EscalaParametros>;
  const fundamental = parseNota(e.fundamental);
  if (!fundamental || typeof e.tipo !== "string" || !ES_ESCALA.has(e.tipo)) return null;
  return { fundamental, notas: construirEscala(fundamental, e.tipo, e.bemoles === true), params: e as EscalaParametros };
}

export function resolverAcorde(p: unknown): { fundamental: NotaMusical; notas: NotaMusical[]; params: AcordeParametros } | null {
  if (typeof p !== "object" || p === null) return null;
  const a = p as Partial<AcordeParametros>;
  const fundamental = parseNota(a.fundamental);
  if (!fundamental || typeof a.tipo !== "string" || !ES_ACORDE.has(a.tipo)) return null;
  return { fundamental, notas: construirAcorde(fundamental, a.tipo, a.bemoles === true), params: a as AcordeParametros };
}

// Grado de cada nota de un acorde, en el orden en que construirAcorde las
// devuelve (1 = fundamental). Sus semitonos salen de FORMULA_ACORDE; los
// grados son la convención de cifrado: tríadas 1-3-5, séptimas 1-3-5-7,
// sus2 = 1-2-5, sus4 = 1-4-5, add9 = 1-3-5-9, y 9, 11 y 13 apilan terceras
// sobre la séptima dominante.
export const GRADOS_ACORDE: Record<TipoAcorde, string[]> = {
  mayor: ["1", "3", "5"],
  menor: ["1", "3", "5"],
  disminuido: ["1", "3", "5"],
  aumentado: ["1", "3", "5"],
  maj7: ["1", "3", "5", "7"],
  dominante7: ["1", "3", "5", "7"],
  menor7: ["1", "3", "5", "7"],
  disminuido7: ["1", "3", "5", "7"],
  sus2: ["1", "2", "5"],
  sus4: ["1", "4", "5"],
  add9: ["1", "3", "5", "9"],
  novena: ["1", "3", "5", "7", "9"],
  oncena: ["1", "3", "5", "7", "9", "11"],
  trecena: ["1", "3", "5", "7", "9", "11", "13"],
};

// ---------------------------------------------------------------------------
// Pentagrama
// ---------------------------------------------------------------------------

export interface PentagramaResuelto {
  notas: NotaMusical[];
  disposicion: "secuencial" | "simultanea";
  etiquetas: string[];
}

export function resolverPentagrama(v: Partial<VisualMelodiaPentagrama>): PentagramaResuelto | null {
  let notas: NotaMusical[] = [];
  let disposicion: "secuencial" | "simultanea" = v.disposicion === "simultanea" ? "simultanea" : "secuencial";
  if (v.escala !== undefined) {
    const e = resolverEscala(v.escala);
    if (!e) return null;
    notas = e.notas;
    disposicion = "secuencial";
  } else if (v.acorde !== undefined) {
    const a = resolverAcorde(v.acorde);
    if (!a) return null;
    notas = a.notas;
    disposicion = "simultanea";
  } else {
    notas = resolverNotas(v.notas, MAX_NOTAS_PENTAGRAMA);
  }
  if (notas.length === 0 || notas.length > MAX_NOTAS_PENTAGRAMA) return null;
  const modo = v.etiquetas ?? "nombre";
  let etiquetas = notas.map((n) => (modo === "ninguna" ? "" : modo === "letra" ? nombreSinOctava(n) : nombreNota(n)));
  if (Array.isArray(v.textos)) etiquetas = notas.map((_, i) => (typeof v.textos![i] === "string" ? v.textos![i] : etiquetas[i]));
  return { notas, disposicion, etiquetas };
}

// ---------------------------------------------------------------------------
// Teclado
// ---------------------------------------------------------------------------

const NEGRAS = new Set([1, 3, 6, 8, 10]);
export const esTeclaNegra = (semitono: number) => NEGRAS.has(((semitono % 12) + 12) % 12);

export interface TeclaDibujo {
  semitono: number;
  negra: boolean;
  // Posición horizontal del centro de la tecla, en "anchos de tecla blanca"
  // (0 = borde izquierdo del teclado).
  centro: number;
  // Índice de la tecla blanca (solo blancas): 0, 1, 2...
  indiceBlanca: number;
}

export interface GeometriaTeclado {
  desde: number;
  hasta: number;
  blancas: number;
  teclas: TeclaDibujo[];
}

// Teclas entre dos semitonos absolutos, completadas a teclas blancas en los
// extremos (una tecla negra nunca queda colgando sin su vecina blanca).
export function geometriaTeclado(desde: number, hasta: number): GeometriaTeclado {
  let a = Math.min(desde, hasta);
  let b = Math.max(desde, hasta);
  while (esTeclaNegra(a)) a--;
  while (esTeclaNegra(b)) b++;
  const teclas: TeclaDibujo[] = [];
  let blancas = 0;
  for (let s = a; s <= b; s++) {
    if (esTeclaNegra(s)) {
      // La blanca de la izquierda (s - 1) siempre existe y ya tiene índice.
      teclas.push({ semitono: s, negra: true, centro: blancas, indiceBlanca: -1 });
    } else {
      teclas.push({ semitono: s, negra: false, centro: blancas + 0.5, indiceBlanca: blancas });
      blancas++;
    }
  }
  return { desde: a, hasta: b, blancas, teclas };
}

export interface TecladoResuelto {
  notas: NotaMusical[];
  geometria: GeometriaTeclado;
  // Texto de cada nota resaltada (nombre sin octava, o el propio).
  etiquetas: string[];
  // Cifrado americano de cada nota resaltada ("C", "F♯").
  cifrados: string[];
  // Distancia en semitonos entre notas resaltadas consecutivas.
  saltos: number[];
}

function armarTeclado(notas: NotaMusical[], desde?: unknown, hasta?: unknown, textos?: unknown): TecladoResuelto | null {
  if (notas.length === 0) return null;
  const semitonos = notas.map(semitonoAbsoluto);
  const d = parseNota(desde);
  const h = parseNota(hasta);
  const geometria = geometriaTeclado(d ? semitonoAbsoluto(d) : Math.min(...semitonos), h ? semitonoAbsoluto(h) : Math.max(...semitonos));
  // Todas las notas tienen que caer dentro del teclado dibujado.
  if (semitonos.some((s) => s < geometria.desde || s > geometria.hasta)) return null;
  if (geometria.blancas > 16) return null;
  let etiquetas = notas.map(nombreSinOctava);
  if (Array.isArray(textos)) etiquetas = notas.map((_, i) => (typeof textos[i] === "string" ? (textos[i] as string) : etiquetas[i]));
  return { notas, geometria, etiquetas, cifrados: notas.map(cifradoNota), saltos: semitonos.slice(1).map((s, i) => s - semitonos[i]) };
}

export function resolverTeclado(v: Partial<VisualMelodiaTeclado>): TecladoResuelto | null {
  return armarTeclado(resolverNotas(v.notas, MAX_NOTAS_TECLADO), v.desde, v.hasta, v.textos);
}

export function resolverTecladoEscala(v: Partial<VisualMelodiaEscala>): (TecladoResuelto & { nombre: string }) | null {
  const e = resolverEscala(v.escala);
  if (!e) return null;
  const t = armarTeclado(e.notas, undefined, undefined, undefined);
  return t ? { ...t, nombre: NOMBRE_ESCALA[e.params.tipo] } : null;
}

export interface AcordeResuelto extends TecladoResuelto {
  nombre: string;
  grados: string[];
  // Semitonos de cada nota desde la fundamental (0 = fundamental).
  semitonos: number[];
}

export function resolverTecladoAcorde(v: Partial<VisualMelodiaAcorde>): AcordeResuelto | null {
  const a = resolverAcorde(v.acorde);
  if (!a) return null;
  const t = armarTeclado(a.notas, undefined, undefined, undefined);
  if (!t) return null;
  const base = semitonoAbsoluto(a.notas[0]);
  return { ...t, nombre: NOMBRE_ACORDE[a.params.tipo], grados: GRADOS_ACORDE[a.params.tipo], semitonos: a.notas.map((n) => semitonoAbsoluto(n) - base) };
}

// Etiqueta de la distancia entre dos notas: S (semitono, 1), T (tono, 2),
// 1½ (tono y medio, 3); más de eso, el número de semitonos.
export function etiquetaSalto(semitonos: number, idioma: "es" | "en" = "es"): string {
  if (semitonos === 1) return idioma === "en" ? "H" : "S";
  if (semitonos === 2) return idioma === "en" ? "W" : "T";
  if (semitonos === 3) return "1½";
  return String(semitonos);
}

// Nombre de una tecla en su grafía más simple (Do♯ o Re♭ según `bemoles`).
export function nombreDeTecla(semitono: number, bemoles: boolean): string {
  return nombreSinOctava(notaDesdeSemitonoAbsoluto(semitono, bemoles));
}

// ---------------------------------------------------------------------------
// Ritmo y frecuencia
// ---------------------------------------------------------------------------

export interface FiguraResuelta {
  figura: FiguraRitmica;
  pulsos: number;
  // Fracción del compás de 4/4 que ocupa (0-1).
  fraccionCompas: number;
}

export function resolverRitmo(v: Partial<VisualMelodiaRitmo>): FiguraResuelta[] {
  if (!Array.isArray(v.figuras)) return [];
  const vistas = new Set<string>();
  const salida: FiguraResuelta[] = [];
  for (const f of v.figuras) {
    if (typeof f !== "string" || !(FIGURAS as string[]).includes(f) || vistas.has(f)) continue;
    vistas.add(f);
    const figura = f as FiguraRitmica;
    salida.push({ figura, pulsos: DURACION_FIGURA[figura], fraccionCompas: DURACION_FIGURA[figura] / 4 });
    if (salida.length >= MAX_FIGURAS) break;
  }
  return salida;
}

export interface NotaConFrecuencia {
  nota: NotaMusical;
  hz: number;
  // Razón con la nota anterior (null en la primera).
  razon: number | null;
  // Posición en el eje logarítmico: octavas (2:1) desde la primera nota.
  octavasDesdeLaPrimera: number;
}

export function resolverFrecuencia(v: Partial<VisualMelodiaFrecuencia>): NotaConFrecuencia[] {
  const notas = resolverNotas(v.notas, MAX_NOTAS_FRECUENCIA);
  if (notas.length < 2) return [];
  const hz = notas.map(frecuenciaDeNota);
  return notas.map((nota, i) => ({
    nota,
    hz: hz[i],
    razon: i === 0 ? null : hz[i] / hz[i - 1],
    octavasDesdeLaPrimera: Math.log2(hz[i] / hz[0]),
  }));
}

// 2 -> "×2"; 1,0595 -> "×1,0595" (coma decimal en español).
export function formatoRazon(razon: number, idioma: "es" | "en" = "es"): string {
  if (Math.abs(razon - Math.round(razon)) < 1e-9) return `×${Math.round(razon)}`;
  const s = razon.toFixed(4);
  return `×${idioma === "es" ? s.replace(".", ",") : s}`;
}

export function formatoHz(hz: number, idioma: "es" | "en" = "es"): string {
  const s = (Math.round(hz * 100) / 100).toString();
  return `${idioma === "es" ? s.replace(".", ",") : s} Hz`;
}

// ---------------------------------------------------------------------------
// Texto plano de un visual (alternativa accesible y corpus de los tests)
// ---------------------------------------------------------------------------

const PULSOS_TEXTO: Record<FiguraRitmica, { es: string; en: string }> = {
  redonda: { es: "4 pulsos", en: "4 beats" },
  blanca: { es: "2 pulsos", en: "2 beats" },
  negra: { es: "1 pulso", en: "1 beat" },
  corchea: { es: "medio pulso", en: "half a beat" },
};
export const NOMBRE_FIGURA_EN: Record<FiguraRitmica, string> = { redonda: "Whole note", blanca: "Half note", negra: "Quarter note", corchea: "Eighth note" };

export function textoDeVisual(visual: { tipo: string } & Record<string, unknown>, idioma: "es" | "en" = "es"): string {
  const es = idioma === "es";
  const lista = (notas: NotaMusical[]) => notas.map(nombreNota).join(", ");
  switch (visual.tipo) {
    case "melodia.pentagrama": {
      const r = resolverPentagrama(visual as Partial<VisualMelodiaPentagrama>);
      if (!r) return "";
      const pref = es ? "Pentagrama en clave de sol" : "Staff in treble clef";
      const cuerpo = r.etiquetas.some((e) => e !== "") ? r.etiquetas.filter((e) => e !== "").join(", ") : lista(r.notas);
      return `${pref}: ${cuerpo}.`;
    }
    case "melodia.teclado": {
      const r = resolverTeclado(visual as Partial<VisualMelodiaTeclado>);
      if (!r) return "";
      const cif = (visual as Partial<VisualMelodiaTeclado>).cifrado ? ` ${es ? "Cifrado americano" : "American letter names"}: ${r.notas.map((n, i) => `${nombreSinOctava(n)} = ${r.cifrados[i]}`).join(", ")}.` : "";
      const saltos = (visual as Partial<VisualMelodiaTeclado>).saltos ? ` ${es ? "Saltos" : "Steps"}: ${r.saltos.map((s) => etiquetaSalto(s, idioma)).join(", ")}.` : "";
      return `${es ? "Teclado de piano con las notas resaltadas" : "Piano keyboard with the highlighted notes"}: ${lista(r.notas)}.${cif}${saltos}`;
    }
    case "melodia.escala": {
      const r = resolverTecladoEscala(visual as Partial<VisualMelodiaEscala>);
      if (!r) return "";
      const esc = (visual as unknown as VisualMelodiaEscala).escala;
      return `${es ? "Escala" : "Scale"} ${r.nombre} ${es ? "desde" : "from"} ${esc.fundamental}: ${lista(r.notas)}. ${es ? "Saltos" : "Steps"}: ${r.saltos.map((s) => etiquetaSalto(s, idioma)).join(", ")}.`;
    }
    case "melodia.acorde": {
      const r = resolverTecladoAcorde(visual as Partial<VisualMelodiaAcorde>);
      if (!r) return "";
      const partes = r.notas.map((n, i) => `${r.grados[i]} ${nombreSinOctava(n)} (+${r.semitonos[i]})`);
      return `${r.nombre} ${es ? "desde" : "from"} ${nombreNota(r.notas[0])}: ${partes.join(", ")}.`;
    }
    case "melodia.ritmo": {
      const r = resolverRitmo(visual as Partial<VisualMelodiaRitmo>);
      if (r.length === 0) return "";
      return r.map((f) => `${es ? NOMBRE_FIGURA[f.figura] : NOMBRE_FIGURA_EN[f.figura]}: ${PULSOS_TEXTO[f.figura][idioma]}`).join("; ") + ".";
    }
    case "melodia.frecuencia": {
      const r = resolverFrecuencia(visual as Partial<VisualMelodiaFrecuencia>);
      if (r.length === 0) return "";
      return r.map((n) => `${nombreNota(n.nota)}: ${formatoHz(n.hz, idioma)}${n.razon !== null ? ` (${formatoRazon(n.razon, idioma)})` : ""}`).join("; ") + ".";
    }
    default:
      return "";
  }
}

// Texto de los visuales genéricos ("cuadros") para el corpus de los tests.
export function textoDeCuadros(visual: { tipo: string } & Record<string, unknown>): string {
  if (visual.tipo !== "cuadros" || !Array.isArray(visual.cuadros)) return "";
  return (visual.cuadros as { texto?: string; formula?: string; resaltar?: string }[])
    .map((c) => [c.texto, c.formula, c.resaltar].filter(Boolean).join(" "))
    .join(" ");
}
