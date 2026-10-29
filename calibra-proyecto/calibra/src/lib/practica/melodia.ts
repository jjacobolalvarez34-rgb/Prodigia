// Mundo Melodía (Fase 1, 2026-08-24): teoría musical generada por
// fórmula — nada de contenido curado a mano. Todo acorde/escala sale
// de aplicar una fórmula real de intervalos (semitonos desde la
// fundamental) a una fundamental elegida al azar, así que la variedad
// es real (cualquier fundamental × cualquier fórmula) y no una lista
// fija de casos.
//
// Modelo de nota: las 7 notas naturales tienen un "índice diatónico"
// (posición en el pentagrama, una letra = un paso, sin importar
// alteraciones) y un "semitono" (posición cromática real, 0-11 desde
// Do). Separar los dos es necesario porque el pentagrama posiciona por
// letra (Do y Do♯ ocupan la MISMA línea/espacio, la alteración es un
// símbolo aparte), pero la música (escalas/acordes) se calcula por
// semitonos.

export type NotaLetra = "Do" | "Re" | "Mi" | "Fa" | "Sol" | "La" | "Si";
export type Alteracion = "sostenido" | "bemol" | null;

export const LETRAS: NotaLetra[] = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];

export const LETRA_A_CIFRADO: Record<NotaLetra, string> = {
  Do: "C", Re: "D", Mi: "E", Fa: "F", Sol: "G", La: "A", Si: "B",
};
export const CIFRADO_A_LETRA: Record<string, NotaLetra> = Object.fromEntries(
  Object.entries(LETRA_A_CIFRADO).map(([letra, cifrado]) => [cifrado, letra as NotaLetra])
) as Record<string, NotaLetra>;

// Índice diatónico dentro de la octava (0-6) — posición en el
// pentagrama, un paso por letra.
const INDICE_DIATONICO: Record<NotaLetra, number> = {
  Do: 0, Re: 1, Mi: 2, Fa: 3, Sol: 4, La: 5, Si: 6,
};

// Semitono dentro de la octava (0-11) — posición cromática real.
const SEMITONO_DE_LETRA: Record<NotaLetra, number> = {
  Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11,
};

export interface NotaMusical {
  letra: NotaLetra;
  octava: number;
  alteracion: Alteracion;
}

// Posición diatónica absoluta (para calcular dónde va en el
// pentagrama, ledger lines incluidas) — octava*7 + índice de letra.
export function indiceDiatonicoAbsoluto(nota: NotaMusical): number {
  return nota.octava * 7 + INDICE_DIATONICO[nota.letra];
}

// Semitono absoluto (para aritmética de intervalos) — octava*12 +
// semitono de la letra, +1/-1 según la alteración.
export function semitonoAbsoluto(nota: NotaMusical): number {
  const base = nota.octava * 12 + SEMITONO_DE_LETRA[nota.letra];
  return base + (nota.alteracion === "sostenido" ? 1 : nota.alteracion === "bemol" ? -1 : 0);
}

// Fase 7 ("oído absoluto"): A4 = 440Hz, temperamento igual — la
// fórmula estándar (freq = 440 × 2^(semitonos_desde_A4/12)).
// semitonoAbsoluto(La4) = 4*12+9 = 57, de ahí sale el 57 de acá abajo.
export function frecuenciaDeNota(nota: NotaMusical): number {
  return 440 * Math.pow(2, (semitonoAbsoluto(nota) - 57) / 12);
}

export function nombreNota(nota: NotaMusical): string {
  const simbolo = nota.alteracion === "sostenido" ? "♯" : nota.alteracion === "bemol" ? "♭" : "";
  return `${nota.letra}${simbolo}${nota.octava}`;
}

export function cifradoNota(nota: NotaMusical): string {
  const simbolo = nota.alteracion === "sostenido" ? "♯" : nota.alteracion === "bemol" ? "♭" : "";
  return `${LETRA_A_CIFRADO[nota.letra]}${simbolo}`;
}

// Tabla cromática de 12 posiciones → letra+alteración, en su grafía
// más simple. Dos variantes (sostenidos/bemoles) porque la ortografía
// musical real depende de contexto (una escala de Fa usa Si♭, no
// La♯) — para un modo de identificación como este alcanza con poder
// elegir cuál tabla usar según el ejercicio, sin resolver el problema
// completo de ortografía enarmónica por tonalidad.
const CROMATICA_SOSTENIDOS: { letra: NotaLetra; alteracion: Alteracion }[] = [
  { letra: "Do", alteracion: null },
  { letra: "Do", alteracion: "sostenido" },
  { letra: "Re", alteracion: null },
  { letra: "Re", alteracion: "sostenido" },
  { letra: "Mi", alteracion: null },
  { letra: "Fa", alteracion: null },
  { letra: "Fa", alteracion: "sostenido" },
  { letra: "Sol", alteracion: null },
  { letra: "Sol", alteracion: "sostenido" },
  { letra: "La", alteracion: null },
  { letra: "La", alteracion: "sostenido" },
  { letra: "Si", alteracion: null },
];

const CROMATICA_BEMOLES: { letra: NotaLetra; alteracion: Alteracion }[] = [
  { letra: "Do", alteracion: null },
  { letra: "Re", alteracion: "bemol" },
  { letra: "Re", alteracion: null },
  { letra: "Mi", alteracion: "bemol" },
  { letra: "Mi", alteracion: null },
  { letra: "Fa", alteracion: null },
  { letra: "Sol", alteracion: "bemol" },
  { letra: "Sol", alteracion: null },
  { letra: "La", alteracion: "bemol" },
  { letra: "La", alteracion: null },
  { letra: "Si", alteracion: "bemol" },
  { letra: "Si", alteracion: null },
];

// Construye una nota a partir de una absoluta en semitonos (0 = Do0),
// eligiendo grafía con sostenidos o bemoles.
export function notaDesdeSemitonoAbsoluto(semitonoAbs: number, usarBemoles: boolean): NotaMusical {
  const octava = Math.floor(semitonoAbs / 12);
  const posicion = ((semitonoAbs % 12) + 12) % 12;
  const tabla = usarBemoles ? CROMATICA_BEMOLES : CROMATICA_SOSTENIDOS;
  const { letra, alteracion } = tabla[posicion];
  return { letra, octava, alteracion };
}

// Fase 3 (reto diario multi-ciudad, 2026-08-25): mismo criterio que
// generadores.ts de Enigmia — una única referencia mutable a nivel de
// módulo en vez de rehacer cada función interna para recibir un
// parámetro `rng` (esto tiene bandas/fórmulas de acordes/escalas
// reales adentro, no vale la pena arriesgar tocar esa lógica).
let rngActual: () => number = Math.random;

function randomInt(min: number, max: number): number {
  return Math.floor(rngActual() * (max - min + 1)) + min;
}

function elegir<T>(arr: T[]): T {
  return arr[Math.floor(rngActual() * arr.length)];
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rngActual() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function idFalso(prefijo: string): string {
  return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// Corre `fn` con un generador de números pseudo-aleatorios sembrado en
// vez de Math.random — usado por el reto diario para que la misma
// fecha produzca el mismo contenido para todos los usuarios.
export function conRngSembrado<T>(rng: () => number, fn: () => T): T {
  const anterior = rngActual;
  rngActual = rng;
  try {
    return fn();
  } finally {
    rngActual = anterior;
  }
}

// ─── Figuras rítmicas y equivalencia de cifrado (modo Fundamentos) ───

// Pedido del usuario (2026-10-06): en niveles altos, figuras más cortas
// (semicorchea, fusa, semifusa), con puntillo y corcheas unidas por la barra.
export type FiguraRitmica = "redonda" | "blanca" | "negra" | "corchea" | "semicorchea" | "fusa" | "semifusa" | "blanca_puntillo" | "negra_puntillo" | "corcheas_unidas";
export const FIGURAS: FiguraRitmica[] = ["redonda", "blanca", "negra", "corchea", "semicorchea", "corcheas_unidas", "negra_puntillo", "fusa", "blanca_puntillo", "semifusa"];
export const NOMBRE_FIGURA: Record<FiguraRitmica, string> = {
  redonda: "Redonda",
  blanca: "Blanca",
  negra: "Negra",
  corchea: "Corchea",
  semicorchea: "Semicorchea",
  fusa: "Fusa",
  semifusa: "Semifusa",
  blanca_puntillo: "Blanca con puntillo",
  negra_puntillo: "Negra con puntillo",
  corcheas_unidas: "Dos corcheas unidas",
};
// Cómo se dibuja cada figura (lo comparten el ícono de la web y el de la app):
// cabeza hueca o rellena, plica, cuántos corchetes, puntillo, y si son dos
// cabezas unidas por una barra (las corcheas unidas).
export interface FormaFigura {
  hueca: boolean;
  plica: boolean;
  corchetes: number;
  puntillo: boolean;
  unidas: boolean;
}
export function formaFigura(f: FiguraRitmica): FormaFigura {
  const base = f.replace("_puntillo", "") as FiguraRitmica;
  return {
    hueca: base === "redonda" || base === "blanca",
    plica: base !== "redonda",
    corchetes: { corchea: 1, semicorchea: 2, fusa: 3, semifusa: 4 }[base as string] ?? 0,
    puntillo: f.endsWith("_puntillo"),
    unidas: f === "corcheas_unidas",
  };
}

// Plural para las preguntas de equivalencias ("¿cuántas corcheas caben…?").
const PLURAL_FIGURA: Partial<Record<FiguraRitmica, string>> = {
  blanca: "blancas",
  negra: "negras",
  corchea: "corcheas",
  semicorchea: "semicorcheas",
  fusa: "fusas",
  semifusa: "semifusas",
};
// Duración relativa (en "pulsos de negra") — no se pregunta como
// número, pero ordena las figuras de forma consistente.
export const DURACION_FIGURA: Record<FiguraRitmica, number> = {
  redonda: 4,
  blanca: 2,
  negra: 1,
  corchea: 0.5,
  semicorchea: 0.25,
  fusa: 0.125,
  semifusa: 0.0625,
  blanca_puntillo: 3,
  negra_puntillo: 1.5,
  corcheas_unidas: 1,
};

// ─── Escalas (modo Escalas) — fórmulas reales en semitonos ───

export type TipoEscala = "mayor" | "menor_natural" | "pentatonica_mayor" | "pentatonica_menor";
export const NOMBRE_ESCALA: Record<TipoEscala, string> = {
  mayor: "Mayor",
  menor_natural: "Menor natural",
  pentatonica_mayor: "Pentatónica mayor",
  pentatonica_menor: "Pentatónica menor",
};
// Cada fórmula es la distancia en semitonos ENTRE grados consecutivos
// (no acumulada) — se acumula al construir la escala. Suman siempre
// 12 (octava completa).
export const FORMULA_ESCALA: Record<TipoEscala, number[]> = {
  mayor: [2, 2, 1, 2, 2, 2, 1],
  menor_natural: [2, 1, 2, 2, 1, 2, 2],
  pentatonica_mayor: [2, 2, 3, 2, 3],
  pentatonica_menor: [3, 2, 2, 3, 2],
};

export function construirEscala(fundamental: NotaMusical, tipo: TipoEscala, usarBemoles: boolean): NotaMusical[] {
  const pasos = FORMULA_ESCALA[tipo];
  const notas: NotaMusical[] = [fundamental];
  let semitonoActual = semitonoAbsoluto(fundamental);
  for (const paso of pasos) {
    semitonoActual += paso;
    notas.push(notaDesdeSemitonoAbsoluto(semitonoActual, usarBemoles));
  }
  return notas;
}

// ─── Acordes (modo Acordes) — fórmulas reales en semitonos desde la fundamental ───

export type TipoAcorde =
  | "mayor" | "menor" | "disminuido" | "aumentado"
  | "maj7" | "dominante7" | "menor7" | "disminuido7"
  | "sus2" | "sus4" | "add9"
  | "novena" | "oncena" | "trecena";

export const NOMBRE_ACORDE: Record<TipoAcorde, string> = {
  mayor: "Tríada mayor", menor: "Tríada menor", disminuido: "Tríada disminuida", aumentado: "Tríada aumentada",
  maj7: "Séptima mayor (maj7)", dominante7: "Séptima dominante (7)", menor7: "Séptima menor (m7)", disminuido7: "Séptima disminuida (dim7)",
  sus2: "Sus2", sus4: "Sus4", add9: "Add9",
  novena: "Novena (9)", oncena: "Oncena (11)", trecena: "Trecena (13)",
};

// Semitonos desde la fundamental (0), no distancias entre grados —
// para acordes es más directo que acumular pasos como en las escalas.
export const FORMULA_ACORDE: Record<TipoAcorde, number[]> = {
  mayor: [0, 4, 7],
  menor: [0, 3, 7],
  disminuido: [0, 3, 6],
  aumentado: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  dominante7: [0, 4, 7, 10],
  menor7: [0, 3, 7, 10],
  disminuido7: [0, 3, 6, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  // Extendidos: se arman sobre la base de dominante7 (0,4,7,10) +
  // el/los grado(s) agregado(s) — es la convención real de "acorde de
  // 9na/11va/13va" (no una tríada con una nota rara pegada).
  novena: [0, 4, 7, 10, 14],
  oncena: [0, 4, 7, 10, 14, 17],
  trecena: [0, 4, 7, 10, 14, 17, 21],
};

export function construirAcorde(fundamental: NotaMusical, tipo: TipoAcorde, usarBemoles: boolean): NotaMusical[] {
  const semitonoFundamental = semitonoAbsoluto(fundamental);
  return FORMULA_ACORDE[tipo].map((offset) => notaDesdeSemitonoAbsoluto(semitonoFundamental + offset, usarBemoles));
}

// ─── Bandas de dificultad (mismo patrón que anatomia.ts: banda(nivel)) ───

export function banda(nivel: number): number {
  return Math.min(4, Math.floor((nivel - 1) / 2));
}

// ─── Preguntas: unión discriminada por modo ───

export type ModoMelodia = "fundamentos" | "lectura" | "alteraciones" | "escalas" | "acordes" | "oido_absoluto" | "tempo";

interface PreguntaBase {
  id: string;
  modo: ModoMelodia;
  dificultad: number;
  enunciado: string;
  opciones: string[];
  respuesta: string;
}

// Fundamentos (cifrado) y Alteraciones/Escalas/Acordes se resuelven
// con opciones de texto puro — Lectura además trae las notas a dibujar
// en el pentagrama (el componente Pentagrama.tsx las consume directo).
// Fundamentos (figura) es la excepción DENTRO de "texto": necesita
// mostrar el ícono de la figura rítmica (FiguraRitmicaIcono.tsx), así
// que carga cuál es en figuraId — bug real (2026-08-25): esto no
// estaba, la pregunta "¿cómo se llama esta figura?" se mostraba sin
// ningún dibujo porque no había forma de que el cliente supiera qué
// dibujar.
export interface PreguntaMelodiaTexto extends PreguntaBase {
  tipo: "texto";
  figuraId?: FiguraRitmica;
}

export interface PreguntaMelodiaPentagrama extends PreguntaBase {
  tipo: "pentagrama";
  notas: NotaMusical[];
  disposicion: "secuencial" | "simultanea";
}

// Fase 7: "oído absoluto" — se reproduce la nota (frecuenciaDeNota) y
// hay que identificarla, nada de pentagrama a la vista (sería trampa).
export interface PreguntaMelodiaAudio extends PreguntaBase {
  tipo: "audio";
  nota: NotaMusical;
  // Oído absoluto de acordes (niveles 7-10): suenan todas juntas.
  acorde?: NotaMusical[];
}

// Tempo (2026-10-06): suena un pulso de metrónomo a `bpm`, con acento cada
// `acentoCada` pulsos, y hay que reconocer qué tan rápido va.
export interface PreguntaMelodiaPulso extends PreguntaBase {
  tipo: "pulso";
  bpm: number;
  pulsos: number;
  acentoCada: number;
}

export type PreguntaMelodia = PreguntaMelodiaTexto | PreguntaMelodiaPentagrama | PreguntaMelodiaAudio | PreguntaMelodiaPulso;

function fundamentalAlAzar(rangoOctava: [number, number] = [3, 5]): NotaMusical {
  const letra = elegir(LETRAS);
  const octava = randomInt(rangoOctava[0], rangoOctava[1]);
  return { letra, octava, alteracion: null };
}

// ─── Modo 1: Fundamentos ───
//
// Auditoría 2026-10-29: la banda 0 daba solo 5 preguntas (2 figuras y 3 notas de
// cifrado). Ahora cada banda mezcla varias formas y las básicas dejan de salir
// arriba:
// - nombre de la figura (con su dibujo), cifrado americano en los dos sentidos,
//   qué figura dura más o menos, y qué nota viene antes o después (banda 0);
// - contar notas hacia arriba o abajo y «¿cuántas X caben en una Y?» (banda 1);
// - «¿qué figura dura lo mismo que una blanca y una negra juntas?» (banda 2+);
// - completar un compás con una sola figura (banda 3+).
export const FIGURAS_POR_BANDA: FiguraRitmica[][] = [
  ["redonda", "blanca", "negra", "corchea"],
  ["redonda", "blanca", "negra", "corchea", "semicorchea", "corcheas_unidas"],
  ["redonda", "blanca", "negra", "corchea", "semicorchea", "corcheas_unidas", "negra_puntillo", "fusa"],
  ["redonda", "blanca", "negra", "corchea", "semicorchea", "corcheas_unidas", "negra_puntillo", "fusa", "blanca_puntillo"],
  ["redonda", "blanca", "negra", "corchea", "semicorchea", "corcheas_unidas", "negra_puntillo", "fusa", "blanca_puntillo", "semifusa"],
];

// Banda 1+: "¿cuántas corcheas caben en una blanca?". Solo pares que dan un
// número entero (con puntillo también: una negra con puntillo son 3 corcheas).
function generarEquivalencia(nivel: number, pool: FiguraRitmica[]): PreguntaMelodiaTexto | null {
  const pares: [FiguraRitmica, FiguraRitmica][] = [];
  for (const a of pool) {
    for (const b of pool) {
      const plural = PLURAL_FIGURA[b];
      if (!plural || a === b) continue;
      const r = DURACION_FIGURA[a] / DURACION_FIGURA[b];
      if (Number.isInteger(r) && r >= 2 && r <= 16) pares.push([a, b]);
    }
  }
  if (pares.length === 0) return null;
  const [a, b] = elegir(pares);
  const r = DURACION_FIGURA[a] / DURACION_FIGURA[b];
  const candidatos = [r * 2, r / 2, r + 1, r - 1, r + 2, 3, 4, 8, 16].filter((x) => Number.isInteger(x) && x > 0 && x !== r);
  const distractores: number[] = [];
  for (const x of mezclar(candidatos)) if (!distractores.includes(x) && distractores.length < 3) distractores.push(x);
  return {
    id: idFalso("melodia-fund"),
    modo: "fundamentos",
    tipo: "texto",
    dificultad: nivel,
    enunciado: `¿Cuántas ${PLURAL_FIGURA[b]} caben en una ${NOMBRE_FIGURA[a].toLowerCase()}?`,
    opciones: mezclar([r, ...distractores]).map(String),
    respuesta: String(r),
    figuraId: a,
  };
}
// Se exporta por compatibilidad; desde la auditoría 2026-10-29 el cifrado usa las
// 7 notas en todas las bandas (con 3 notas había solo 3 preguntas).
export const NOTAS_POR_BANDA: NotaLetra[][] = [LETRAS, LETRAS, LETRAS, LETRAS, LETRAS];

function textoFund(nivel: number, enunciado: string, respuesta: string, distractores: string[], figuraId?: FiguraRitmica): PreguntaMelodiaTexto {
  const unicos = [...new Set(distractores.filter((d) => d !== respuesta))].slice(0, 3);
  return { id: idFalso("melodia-fund"), modo: "fundamentos", tipo: "texto", dificultad: nivel, enunciado, opciones: mezclar([respuesta, ...unicos]), respuesta, figuraId };
}

// Figuras con duración propia (las corcheas unidas duran lo mismo que la negra:
// no sirven para comparar ni para equivalencias de una sola figura).
const sinUnidas = (pool: FiguraRitmica[]) => pool.filter((f) => f !== "corcheas_unidas");
const conArticulo = (f: FiguraRitmica) => `la ${NOMBRE_FIGURA[f].toLowerCase()}`;
const NUMERO_PALABRA = ["", "una", "dos", "tres", "cuatro"];

// «una blanca y dos negras» a partir de una lista de figuras.
function listarFiguras(figuras: FiguraRitmica[]): string {
  const cuenta = new Map<FiguraRitmica, number>();
  for (const f of figuras) cuenta.set(f, (cuenta.get(f) ?? 0) + 1);
  const partes = [...cuenta.entries()].map(([f, k]) => {
    const nombre = NOMBRE_FIGURA[f].toLowerCase();
    if (k === 1) return `una ${nombre}`;
    const plural = f.endsWith("_puntillo") ? nombre.replace(/^(\w+)/, (m) => PLURAL_FIGURA[m as FiguraRitmica] ?? `${m}s`) : (PLURAL_FIGURA[f] ?? `${nombre}s`);
    return `${NUMERO_PALABRA[k]} ${plural}`;
  });
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

// Combinaciones (multiconjuntos) de 2 o 3 figuras del pool.
function combinaciones(pool: FiguraRitmica[]): FiguraRitmica[][] {
  const out: FiguraRitmica[][] = [];
  for (let i = 0; i < pool.length; i++)
    for (let j = i; j < pool.length; j++) {
      out.push([pool[i], pool[j]]);
      for (let k = j; k < pool.length; k++) out.push([pool[i], pool[j], pool[k]]);
    }
  return out;
}
const suma = (fs: FiguraRitmica[]) => fs.reduce((a, f) => a + DURACION_FIGURA[f], 0);

function generarComparar(nivel: number, pool: FiguraRitmica[]): PreguntaMelodiaTexto {
  const [a, b] = mezclar(sinUnidas(pool)).slice(0, 2);
  const mas = rngActual() < 0.5;
  const ok = (DURACION_FIGURA[a] > DURACION_FIGURA[b]) === mas ? a : b;
  return textoFund(nivel, `¿Qué figura dura ${mas ? "más" : "menos"}: ${conArticulo(a)} o ${conArticulo(b)}?`, NOMBRE_FIGURA[ok], [NOMBRE_FIGURA[ok === a ? b : a], "Duran lo mismo", "Depende del tempo"]);
}

function generarNotaVecina(nivel: number, pasos: number): PreguntaMelodiaTexto {
  const i = randomInt(0, 6);
  const sube = rngActual() < 0.5;
  const j = (((i + (sube ? pasos : -pasos)) % 7) + 7) % 7;
  const enunciado =
    pasos === 1
      ? `En la escala Do, Re, Mi, Fa, Sol, La, Si, ¿qué nota viene justo ${sube ? "después" : "antes"} de ${LETRAS[i]}?`
      : `Desde ${LETRAS[i]}, ${sube ? "subiendo" : "bajando"} ${pasos} notas por la escala (Do, Re, Mi…), ¿a qué nota llegas?`;
  const cerca = [j - 1, j + 1, i, j + 2, j - 2].map((k) => LETRAS[((k % 7) + 7) % 7]);
  return textoFund(nivel, enunciado, LETRAS[j], cerca);
}

// «¿Qué figura dura lo mismo que una blanca y una negra juntas?»
function generarSumaFiguras(nivel: number, pool: FiguraRitmica[]): PreguntaMelodiaTexto | null {
  const p = sinUnidas(pool);
  const casos: { partes: FiguraRitmica[]; total: FiguraRitmica }[] = [];
  for (const partes of combinaciones(p)) {
    const total = p.find((f) => DURACION_FIGURA[f] === suma(partes));
    if (total && !partes.includes(total)) casos.push({ partes, total });
  }
  if (casos.length === 0) return null;
  const c = elegir(casos);
  const otras = mezclar(p.filter((f) => f !== c.total)).map((f) => NOMBRE_FIGURA[f]);
  return textoFund(nivel, `¿Qué figura sola dura lo mismo que ${listarFiguras(mezclar(c.partes))} juntas?`, NOMBRE_FIGURA[c.total], otras);
}

const COMPASES_COMPLETAR: { cifra: string; negras: number }[] = [
  { cifra: "2/4", negras: 2 },
  { cifra: "3/4", negras: 3 },
  { cifra: "4/4", negras: 4 },
];

// «En un compás de 4/4 ya hay una blanca y una corchea: ¿qué figura sola lo completa?»
function generarCompletarCompas(nivel: number, pool: FiguraRitmica[]): PreguntaMelodiaTexto | null {
  const p = sinUnidas(pool);
  const casos: { cifra: string; partes: FiguraRitmica[]; falta: FiguraRitmica }[] = [];
  for (const c of COMPASES_COMPLETAR) {
    const grupos: FiguraRitmica[][] = [...p.map((f) => [f]), ...combinaciones(p)];
    for (const partes of grupos) {
      const resto = c.negras - suma(partes);
      const falta = p.find((f) => DURACION_FIGURA[f] === resto);
      if (resto > 0 && falta) casos.push({ cifra: c.cifra, partes, falta });
    }
  }
  if (casos.length === 0) return null;
  const c = elegir(casos);
  const otras = mezclar(p.filter((f) => f !== c.falta)).map((f) => NOMBRE_FIGURA[f]);
  return textoFund(nivel, `En un compás de ${c.cifra} ya hay ${listarFiguras(mezclar(c.partes))}. ¿Qué figura sola completa el compás?`, NOMBRE_FIGURA[c.falta], otras);
}

function generarNombreFigura(nivel: number, pool: FiguraRitmica[]): PreguntaMelodiaTexto {
  const figura = elegir(pool);
  const distractores = mezclar(FIGURAS_POR_BANDA[banda(nivel)].filter((f) => f !== figura));
  // Relleno en orden (de las figuras básicas a las raras), no al azar.
  for (const relleno of FIGURAS.filter((f) => f !== figura)) {
    if (distractores.length >= 3) break;
    if (!distractores.includes(relleno)) distractores.push(relleno);
  }
  return textoFund(nivel, "¿Cómo se llama esta figura rítmica?", NOMBRE_FIGURA[figura], distractores.slice(0, 3).map((f) => NOMBRE_FIGURA[f]), figura);
}

function generarCifrado(nivel: number): PreguntaMelodiaTexto {
  const letra = elegir(LETRAS);
  const otras = mezclar(LETRAS.filter((l) => l !== letra)).slice(0, 3);
  if (rngActual() < 0.5) return textoFund(nivel, `¿Cuál es el cifrado americano de "${letra}"?`, LETRA_A_CIFRADO[letra], otras.map((l) => LETRA_A_CIFRADO[l]));
  return textoFund(nivel, `¿Qué nota corresponde al cifrado "${LETRA_A_CIFRADO[letra]}"?`, letra, otras);
}

type FormaFund = "figura" | "cifrado" | "comparar" | "vecina" | "contar" | "caben" | "suma" | "completar";
const FORMAS_FUNDAMENTOS: FormaFund[][] = [
  ["figura", "cifrado", "comparar", "vecina"],
  ["figura", "cifrado", "comparar", "contar", "caben"],
  ["figura", "contar", "caben", "suma"],
  ["figura", "caben", "suma", "completar"],
  ["figura", "caben", "suma", "completar", "completar"],
];
// En las bandas altas, la figura a nombrar es de las nuevas (las básicas ya se saben).
const FIGURAS_A_NOMBRAR: FiguraRitmica[][] = [
  FIGURAS_POR_BANDA[0],
  FIGURAS_POR_BANDA[1],
  ["semicorchea", "corcheas_unidas", "negra_puntillo", "fusa"],
  ["negra_puntillo", "fusa", "blanca_puntillo"],
  ["fusa", "blanca_puntillo", "semifusa", "negra_puntillo"],
];

function generarFundamentos(nivel: number): PreguntaMelodiaTexto {
  const b = banda(nivel);
  const pool = FIGURAS_POR_BANDA[b];
  const forma = elegir(FORMAS_FUNDAMENTOS[b]);
  if (forma === "cifrado") return generarCifrado(nivel);
  if (forma === "comparar") return generarComparar(nivel, pool);
  if (forma === "vecina") return generarNotaVecina(nivel, 1);
  if (forma === "contar") return generarNotaVecina(nivel, randomInt(2, b >= 2 ? 5 : 3));
  if (forma === "caben") return generarEquivalencia(nivel, pool) ?? generarNombreFigura(nivel, FIGURAS_A_NOMBRAR[b]);
  if (forma === "suma") return generarSumaFiguras(nivel, pool) ?? generarNombreFigura(nivel, FIGURAS_A_NOMBRAR[b]);
  if (forma === "completar") return generarCompletarCompas(nivel, pool) ?? generarNombreFigura(nivel, FIGURAS_A_NOMBRAR[b]);
  return generarNombreFigura(nivel, FIGURAS_A_NOMBRAR[b]);
}

// ─── Modo 2: Lectura en pentagrama ───
//
// Escala 1-10 por RANGO de notas legibles: banda baja = solo notas
// centrales (sin ledger lines), bandas altas suman notas por encima/
// debajo del pentagrama (con ledger lines reales, calculadas por el
// mismo componente que dibuja todo lo demás).
export const RANGO_LECTURA_POR_BANDA: { letra: NotaLetra; octava: number }[][] = [
  // banda 0-1: Do4 (primera línea adicional abajo) a Sol5 (dentro del pentagrama)
  [{ letra: "Do", octava: 4 }, { letra: "Mi", octava: 4 }, { letra: "Sol", octava: 4 }, { letra: "Si", octava: 4 }, { letra: "Re", octava: 5 }, { letra: "Fa", octava: 5 }],
  [],
  // banda 2-3: agrega hasta La5/Do6 arriba y Si3 abajo
  [],
  [],
  // banda 4: rango completo, incluye ledger lines de sobra
  [],
];
// Bandas 1-4 se completan por fórmula (agregar notas hacia arriba y
// abajo del rango base) en vez de listarlas a mano una por una.
(function construirRangoLectura() {
  const base = RANGO_LECTURA_POR_BANDA[0];
  let anterior = base;
  for (let b = 1; b <= 4; b++) {
    const extra: { letra: NotaLetra; octava: number }[] = [];
    // Suma una nota más abajo y una más arriba por banda (ledger lines
    // crecientes), usando el índice diatónico para no repetir.
    const masGrave = anterior.reduce((min, n) => Math.min(min, indiceDiatonicoAbsoluto({ ...n, alteracion: null })), Infinity);
    const masAguda = anterior.reduce((max, n) => Math.max(max, indiceDiatonicoAbsoluto({ ...n, alteracion: null })), -Infinity);
    for (const cand of LETRAS.map((letra) => [3, 4, 5, 6].map((octava) => ({ letra, octava }))).flat()) {
      const idx = indiceDiatonicoAbsoluto({ ...cand, alteracion: null });
      if (idx === masGrave - 1) extra.push(cand);
      if (idx === masAguda + 1) extra.push(cand);
    }
    anterior = [...anterior, ...extra];
    RANGO_LECTURA_POR_BANDA[b] = anterior;
  }
})();

// Auditoría 2026-10-29: con una sola nota por pregunta, el nivel 1 tenía 6 preguntas
// (las 6 notas del rango). Ahora también se leen grupos de notas: la más aguda, la
// más grave o la que va en cierto lugar (3 notas en las bandas 0-1, 4 en las 2-3 y
// 5 en la 4). La nota sola, desde la banda 2, es siempre una de líneas adicionales.
const ORDINALES = ["primera", "segunda", "tercera", "cuarta", "quinta"];
const claveLectura = (n: { letra: NotaLetra; octava: number }) => indiceDiatonicoAbsoluto({ ...n, alteracion: null });

function generarLectura(nivel: number): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const pool = RANGO_LECTURA_POR_BANDA[b];
  const forma = rngActual() < (b <= 1 ? 0.25 : 0.2) ? "una" : elegir(["aguda", "grave", "lugar"] as const);
  const cuantas = b <= 1 ? 3 : b <= 3 ? 4 : 5;
  let notas: NotaMusical[];
  let elegida: NotaMusical;
  let enunciado: string;
  if (forma === "una") {
    // Desde la banda 2, solo las notas que la banda anterior no tenía.
    const nuevas = b >= 2 ? pool.filter((n) => !RANGO_LECTURA_POR_BANDA[1].some((v) => claveLectura(v) === claveLectura(n))) : pool;
    elegida = { ...elegir(nuevas), alteracion: null };
    notas = [elegida];
    enunciado = "¿Qué nota es esta (nombre + octava)?";
  } else {
    notas = mezclar(pool).slice(0, cuantas).map((n) => ({ ...n, alteracion: null }) as NotaMusical);
    if (forma === "lugar") {
      const i = randomInt(0, cuantas - 1);
      elegida = notas[i];
      enunciado = `¿Qué nota es la ${ORDINALES[i]} (de izquierda a derecha)?`;
    } else {
      const orden = [...notas].sort((x, y) => claveLectura(x) - claveLectura(y));
      elegida = forma === "aguda" ? orden[orden.length - 1] : orden[0];
      enunciado = `¿Cuál es la nota más ${forma} de estas?`;
    }
  }
  const respuesta = nombreNota(elegida);
  const distractores = new Set<string>();
  for (const c of [...mezclar(notas), ...mezclar(pool.map((n) => ({ ...n, alteracion: null }) as NotaMusical))]) {
    if (distractores.size >= 3) break;
    const nombre = nombreNota(c);
    if (nombre !== respuesta) distractores.add(nombre);
  }
  return {
    id: idFalso("melodia-lectura"),
    modo: "lectura",
    tipo: "pentagrama",
    dificultad: nivel,
    enunciado,
    opciones: mezclar([respuesta, ...distractores]),
    respuesta,
    notas,
    disposicion: notas.length > 1 ? "secuencial" : "simultanea",
  };
}

// ─── Modo 3: Alteraciones ───
//
// Auditoría 2026-10-29: antes eran siempre las mismas 28 notas (7 letras × 2
// octavas × ♯/♭) en todos los niveles; el nivel solo cambiaba un distractor. Ahora
// cada banda tiene sus formas:
// - banda 0: nombrar la nota alterada (sin las raras Mi♯, Si♯, Fa♭, Do♭) y
//   «¿qué nota está un semitono arriba/abajo?» desde una natural;
// - banda 1: todas las alteraciones (también las raras), semitonos y «un tono»;
// - banda 2: enarmónicos (Do♯ = Re♭) y contar semitonos entre dos notas cercanas;
// - bandas 3-4: enarmónicos raros (Mi♯ = Fa, Do♭ = Si), tonos hacia abajo y
//   distancias de hasta una octava entre notas alteradas.
// Los distractores siempre SUENAN distinto de la correcta (nunca un enarmónico
// de la respuesta como opción incorrecta).

// Do4 (1.ª línea adicional abajo) a La5 (1.ª línea adicional arriba).
const POSICIONES_ALTERACION: NotaMusical[] = [
  ...(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"] as NotaLetra[]).map((letra) => ({ letra, octava: 4, alteracion: null }) as NotaMusical),
  ...(["Do", "Re", "Mi", "Fa", "Sol", "La"] as NotaLetra[]).map((letra) => ({ letra, octava: 5, alteracion: null }) as NotaMusical),
];

// Mi♯, Si♯, Fa♭ y Do♭: existen, pero se aprenden después.
function esRara(n: NotaMusical): boolean {
  return (n.alteracion === "sostenido" && (n.letra === "Mi" || n.letra === "Si")) || (n.alteracion === "bemol" && (n.letra === "Fa" || n.letra === "Do"));
}

// La letra `pasos` posiciones arriba (o abajo), con su octava.
function letraVecina(n: NotaMusical, pasos: number): { letra: NotaLetra; octava: number } {
  const idx = indiceDiatonicoAbsoluto({ ...n, alteracion: null }) + pasos;
  return { letra: LETRAS[((idx % 7) + 7) % 7], octava: Math.floor(idx / 7) };
}

// Escribe el semitono `objetivo` con la letra dada (natural, ♯ o ♭), o null si no se puede.
function escribirCon(letra: NotaLetra, octava: number, objetivo: number): NotaMusical | null {
  for (const alteracion of [null, "sostenido", "bemol"] as Alteracion[]) {
    const n: NotaMusical = { letra, octava, alteracion };
    if (semitonoAbsoluto(n) === objetivo) return n;
  }
  return null;
}

// 3 nombres de notas que suenan distinto de `objetivo` (y entre sí), cerca de él.
function distractoresQueSuenanDistinto(objetivo: NotaMusical, extra: NotaMusical[] = []): string[] {
  const s = semitonoAbsoluto(objetivo);
  const vistos = new Set<number>([s]);
  const out: string[] = [];
  const candidatos = [...extra, ...mezclar([-2, -1, 1, 2, 3, -3]).map((d) => notaDesdeSemitonoAbsoluto(s + d, rngActual() < 0.5))];
  for (const c of candidatos) {
    const sc = semitonoAbsoluto(c);
    if (out.length >= 3 || vistos.has(sc) || esRara(c)) continue;
    vistos.add(sc);
    out.push(nombreNota(c));
  }
  return out;
}

function preguntaPentagrama(nivel: number, enunciado: string, respuesta: string, distractores: string[], notas: NotaMusical[], disposicion: "secuencial" | "simultanea" = "simultanea"): PreguntaMelodiaPentagrama {
  const unicos = [...new Set(distractores.filter((d) => d !== respuesta))].slice(0, 3);
  return { id: idFalso("melodia-alt"), modo: "alteraciones", tipo: "pentagrama", dificultad: nivel, enunciado, opciones: mezclar([respuesta, ...unicos]), respuesta, notas, disposicion };
}

// «¿Qué nota está marcada?» — la forma original.
function alteracionNombrar(nivel: number, rarasPermitidas: boolean): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  let base: NotaMusical;
  do {
    const pos = elegir(b === 0 ? POSICIONES_ALTERACION : LETRAS.map((letra) => ({ letra, octava: randomInt(4, 5), alteracion: null }) as NotaMusical));
    base = { ...pos, alteracion: rngActual() < 0.5 ? "bemol" : "sostenido" };
  } while (!rarasPermitidas && esRara(base));
  const respuesta = nombreNota(base);
  const contraria: NotaMusical = { ...base, alteracion: base.alteracion === "bemol" ? "sostenido" : "bemol" };
  const distractores = [nombreNota({ ...base, alteracion: null }), ...(rarasPermitidas || !esRara(contraria) ? [nombreNota(contraria)] : [])];
  // Banda 2+: el enarmónico (suena igual, se escribe con otra letra) es el distractor difícil.
  if (b >= 2) distractores.push(nombreNota(notaDesdeSemitonoAbsoluto(semitonoAbsoluto(base), base.alteracion === "sostenido")));
  for (const d of distractoresQueSuenanDistinto(base)) if (distractores.length < 3 && !distractores.includes(d)) distractores.push(d);
  return preguntaPentagrama(nivel, "¿Qué nota está marcada aquí (con su alteración)?", respuesta, distractores, [base]);
}

// «¿Qué nota está un semitono (o un tono) más arriba/abajo de esta?», escrita
// con la letra siguiente o anterior (la grafía de escala: Mi + 1 = Fa, Mi + 2 = Fa♯).
function alteracionPaso(nivel: number, semitonos: 1 | 2, arriba: boolean): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const base = elegir(POSICIONES_ALTERACION);
  const objetivo = semitonoAbsoluto(base) + (arriba ? semitonos : -semitonos);
  // Semitono: la misma letra con ♯/♭ salvo Mi-Fa y Si-Do; tono: siempre la letra vecina.
  let n: NotaMusical | null = null;
  if (semitonos === 1) {
    const misma = escribirCon(base.letra, base.octava, objetivo);
    n = misma && !esRara(misma) ? misma : null;
  }
  if (!n) {
    const v = letraVecina(base, arriba ? 1 : -1);
    n = escribirCon(v.letra, v.octava, objetivo) ?? notaDesdeSemitonoAbsoluto(objetivo, !arriba);
  }
  const que = semitonos === 1 ? "un semitono (medio tono)" : "un tono (dos semitonos)";
  return preguntaPentagrama(nivel, `¿Qué nota está ${que} más ${arriba ? "arriba" : "abajo"} que esta?`, nombreNota(n), distractoresQueSuenanDistinto(n, b >= 1 ? [{ ...base, alteracion: arriba ? "sostenido" : "bemol" }] : []), [base]);
}

// «¿Qué otra nota suena igual?» (enarmónico).
function alteracionEnarmonico(nivel: number, rarasPermitidas: boolean): PreguntaMelodiaPentagrama {
  const quiereRara = rarasPermitidas && rngActual() < 0.4;
  let base: NotaMusical;
  do {
    base = { letra: elegir(LETRAS), octava: randomInt(4, 5), alteracion: rngActual() < 0.5 ? "bemol" : "sostenido" };
  } while (esRara(base) !== quiereRara);
  const s = semitonoAbsoluto(base);
  // La letra vecina en la dirección de la alteración (Do♯ → Re♭, Mi♯ → Fa, Do♭ → Si).
  const v = letraVecina(base, base.alteracion === "sostenido" ? 1 : -1);
  const otra = escribirCon(v.letra, v.octava, s) ?? notaDesdeSemitonoAbsoluto(s, base.alteracion === "sostenido");
  return preguntaPentagrama(nivel, "¿Qué otra nota suena igual que esta (su enarmónico)?", nombreNota(otra), distractoresQueSuenanDistinto(otra, [{ ...base, alteracion: null }, { ...otra, alteracion: base.alteracion }]), [base]);
}

// «¿Cuántos semitonos hay de la primera nota a la segunda?» (la segunda, más aguda).
function alteracionDistancia(nivel: number, maximo: number, primeraAlterada: boolean): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  let a: NotaMusical;
  let c: NotaMusical;
  let d: number;
  do {
    a = { ...elegir(POSICIONES_ALTERACION), alteracion: primeraAlterada || rngActual() < 0.5 ? (rngActual() < 0.5 ? "bemol" : "sostenido") : null };
    d = randomInt(1, maximo);
    const pasosLetra = Math.max(1, Math.round((d * 7) / 12));
    const v = letraVecina(a, pasosLetra);
    c = escribirCon(v.letra, v.octava, semitonoAbsoluto(a) + d) ?? notaDesdeSemitonoAbsoluto(semitonoAbsoluto(a) + d, rngActual() < 0.5);
  } while (esRara(a) || esRara(c) || (b < 3 && !a.alteracion && !c.alteracion));
  const opciones = [d - 1, d + 1, d + 2, d - 2, d + 12 - 2 * d].filter((x) => x > 0 && x !== d && x <= 13).map(String);
  return preguntaPentagrama(nivel, "¿Cuántos semitonos hay de la primera nota a la segunda?", String(d), mezclar(opciones), [a, c], "secuencial");
}

function generarAlteraciones(nivel: number): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const t = rngActual();
  if (b === 0) return t < 0.5 ? alteracionNombrar(nivel, false) : alteracionPaso(nivel, 1, rngActual() < 0.5);
  if (b === 1) return t < 0.4 ? alteracionNombrar(nivel, true) : t < 0.7 ? alteracionPaso(nivel, 1, rngActual() < 0.5) : alteracionPaso(nivel, 2, true);
  if (b === 2) return t < 0.25 ? alteracionNombrar(nivel, true) : t < 0.6 ? alteracionEnarmonico(nivel, false) : alteracionDistancia(nivel, 4, false);
  if (b === 3) return t < 0.35 ? alteracionEnarmonico(nivel, true) : t < 0.6 ? alteracionPaso(nivel, 2, false) : alteracionDistancia(nivel, 7, false);
  return t < 0.3 ? alteracionEnarmonico(nivel, true) : t < 0.45 ? alteracionPaso(nivel, 2, rngActual() < 0.5) : alteracionDistancia(nivel, 12, true);
}

// ─── Modo 4: Escalas ───
//
// Banda baja: solo pentatónicas (menos notas, patrón más simple).
// Banda media (5-7 según el enunciado original): suma mayor/menor
// natural. Banda alta: las 4 mezcladas, fundamentales menos comunes.
export const ESCALAS_POR_BANDA: TipoEscala[][] = [
  ["pentatonica_mayor", "pentatonica_menor"],
  ["pentatonica_mayor", "pentatonica_menor"],
  ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"],
  ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"],
  ["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"],
];

function generarEscalas(nivel: number): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const pool = ESCALAS_POR_BANDA[b];
  const tipo = elegir(pool);
  let usarBemoles = rngActual() < 0.5;
  let fundamental = fundamentalAlAzar([3, 4]);
  // Bandas 3-4 (auditoría 2026-10-29): también escalas que parten de una nota
  // alterada (Fa♯, Si♭…), para que el nivel 10 no repita las del nivel 1.
  if (b >= 3 && rngActual() < 0.5) {
    const alterada: NotaMusical = { ...fundamental, alteracion: usarBemoles ? "bemol" : "sostenido" };
    if (!esRara(alterada)) fundamental = alterada;
    else usarBemoles = !usarBemoles;
  }
  const notas = construirEscala(fundamental, tipo, usarBemoles);

  const distractores = mezclar(pool.filter((t) => t !== tipo)).slice(0, 3);
  while (distractores.length < 3) {
    const relleno = elegir((["mayor", "menor_natural", "pentatonica_mayor", "pentatonica_menor"] as TipoEscala[]).filter((t) => t !== tipo && !distractores.includes(t)));
    distractores.push(relleno);
  }
  const opciones = mezclar([tipo, ...distractores]).map((t) => NOMBRE_ESCALA[t]);

  return {
    id: idFalso("melodia-escala"),
    modo: "escalas",
    tipo: "pentagrama",
    dificultad: nivel,
    enunciado: `Esta secuencia parte de ${nombreNota(fundamental)}. ¿Qué escala es?`,
    opciones,
    respuesta: NOMBRE_ESCALA[tipo],
    notas,
    disposicion: "secuencial",
  };
}

// ─── Modo 5: Acordes (nivel 6-10 según el enunciado, escala completa igual) ───
//
// Niveles 1-5 no estaban descriptos en la especificación original —
// se completan con el subconjunto más simple (mayor/menor, las dos
// tríadas más intuitivas) para que el modo tenga una rampa real en
// vez de arrancar directo en nivel 6 de complejidad. A partir de ahí
// sigue tal cual lo pedido: 6-7 las 4 tríadas, 8 séptimas, 9 sus/add9,
// 10 extendidos.
export function acordesPorNivel(nivel: number): TipoAcorde[] {
  if (nivel <= 5) return ["mayor", "menor"];
  if (nivel <= 7) return ["mayor", "menor", "disminuido", "aumentado"];
  if (nivel === 8) return ["maj7", "dominante7", "menor7", "disminuido7"];
  if (nivel === 9) return ["sus2", "sus4", "add9"];
  return ["novena", "oncena", "trecena"];
}

function generarAcordes(nivel: number): PreguntaMelodiaPentagrama {
  const pool = acordesPorNivel(nivel);
  const tipo = elegir(pool);
  const usarBemoles = rngActual() < 0.5;
  const fundamental = fundamentalAlAzar([3, 4]);
  const notas = construirAcorde(fundamental, tipo, usarBemoles);

  const poolCompleto: TipoAcorde[] = ["mayor", "menor", "disminuido", "aumentado", "maj7", "dominante7", "menor7", "disminuido7", "sus2", "sus4", "add9", "novena", "oncena", "trecena"];
  // Los distractores salen del MISMO grupo de complejidad primero (más
  // exigente: hay que distinguir tríadas entre sí, no descartar por
  // "cantidad de notas" a simple vista) y solo si no alcanza se suma
  // del pool completo.
  const distractoresPool = pool.filter((t) => t !== tipo);
  const distractores = mezclar(distractoresPool);
  while (distractores.length < 3) {
    const relleno = elegir(poolCompleto.filter((t) => t !== tipo && !distractores.includes(t)));
    distractores.push(relleno);
  }
  const opciones = mezclar([tipo, ...distractores.slice(0, 3)]).map((t) => NOMBRE_ACORDE[t]);

  return {
    id: idFalso("melodia-acorde"),
    modo: "acordes",
    tipo: "pentagrama",
    dificultad: nivel,
    enunciado: `Fundamental: ${nombreNota(fundamental)}. ¿Qué tipo de acorde es?`,
    opciones,
    respuesta: NOMBRE_ACORDE[tipo],
    notas,
    disposicion: "simultanea",
  };
}

// ─── Modo 6: Oído absoluto (Fase 7, dificultad reservada para lo más
// alto) — se reproduce el audio de una nota (Web Audio API, tono
// sintetizado con la frecuencia real, ver frecuenciaDeNota/sonido.ts)
// y hay que identificarla de oído, nada de pentagrama a la vista. No
// hay forma de hacer "fácil" reconocer una nota de oído más allá de
// separar bien las opciones entre sí — la escalada real es reducir esa
// separación a medida que sube el nivel: de un piso/quinta/octava bien
// distintos hasta semitonos vecinos con alteración, el caso genuinamente
// difícil de oído absoluto.
// Auditoría 2026-10-29: antes la banda 0 tenía 4 notas (4 preguntas), la 1 cinco y la 2
// siete. Ahora cada banda pregunta más notas y las opciones se acercan al subir (3+
// semitonos en la banda 0, 2+ en la 1, vecinas desde la 2); en las bandas 0-2 también
// «¿en qué octava suena?» (se dice la letra y hay que reconocer el registro).
const nat = (letra: NotaLetra, octava: number): NotaMusical => ({ letra, octava, alteracion: null });
const sost = (letra: NotaLetra, octava: number): NotaMusical => ({ letra, octava, alteracion: "sostenido" });
const LETRAS_SOSTENIDO: NotaLetra[] = ["Do", "Re", "Fa", "Sol", "La"];
const naturalesDe = (octavas: number[]) => octavas.flatMap((o) => LETRAS.map((l) => nat(l, o)));
const sostenidosDe = (octavas: number[]) => octavas.flatMap((o) => LETRAS_SOSTENIDO.map((l) => sost(l, o)));

// Las notas que se pueden preguntar en «¿cuál es?», por banda.
export const POOL_OIDO_POR_BANDA: NotaMusical[][] = [
  // banda 0 (nivel 1-2): las naturales de Do4 a Do5.
  [...naturalesDe([4]), nat("Do", 5)],
  // banda 1 (nivel 3-4): dos octavas de naturales (4 y 5).
  naturalesDe([4, 5]),
  // banda 2 (nivel 5-6): tres octavas de naturales y los sostenidos de la octava 4.
  [...naturalesDe([3, 4, 5]), ...sostenidosDe([4])],
  // banda 3 (nivel 7-8): naturales y sostenidos de las octavas 3 y 4.
  [...naturalesDe([3, 4]), ...sostenidosDe([3, 4])],
  // banda 4 (nivel 9-10): las 12 notas en tres octavas, opciones a un semitono.
  [...naturalesDe([3, 4, 5]), ...sostenidosDe([3, 4, 5])],
];
// Separación mínima (en semitonos) entre la correcta y los distractores.
const SEPARACION_OIDO = [3, 2, 1, 1, 1];

// Oído absoluto de acordes (pedido del usuario, 2026-10-06): en los niveles
// 7-8 hay que reconocer el tipo de tríada que suena; en 9-10, el acorde
// completo (fundamental y si es mayor o menor).
const CALIDADES_OIDO: TipoAcorde[] = ["mayor", "menor", "disminuido", "aumentado"];
const NOMBRE_CALIDAD: Record<string, string> = { mayor: "mayor", menor: "menor", disminuido: "disminuido", aumentado: "aumentado" };

function generarOidoAcorde(nivel: number): PreguntaMelodiaAudio {
  const b = banda(nivel);
  if (b === 3) {
    const tipo = elegir(CALIDADES_OIDO);
    const fundamental = nat(elegir(LETRAS), randomInt(3, 4));
    const acorde = construirAcorde(fundamental, tipo, false);
    return {
      id: idFalso("melodia-oido-acorde"),
      modo: "oido_absoluto",
      tipo: "audio",
      dificultad: nivel,
      enunciado: "Escucha el acorde — ¿de qué tipo es?",
      opciones: mezclar(CALIDADES_OIDO).map((t) => NOMBRE_ACORDE[t]),
      respuesta: NOMBRE_ACORDE[tipo],
      nota: fundamental,
      acorde,
    };
  }
  const tipo = elegir(["mayor", "menor"] as TipoAcorde[]);
  const letra = elegir(LETRAS);
  const fundamental = nat(letra, randomInt(3, 4));
  const acorde = construirAcorde(fundamental, tipo, false);
  const nombre = (l: NotaLetra, t: TipoAcorde) => `${l} ${NOMBRE_CALIDAD[t]}`;
  const respuesta = nombre(letra, tipo);
  const otro: TipoAcorde = tipo === "mayor" ? "menor" : "mayor";
  const distractores = new Set<string>([nombre(letra, otro)]);
  for (const l of mezclar(LETRAS.filter((x) => x !== letra))) {
    if (distractores.size >= 3) break;
    distractores.add(nombre(l, rngActual() < 0.5 ? tipo : otro));
  }
  return {
    id: idFalso("melodia-oido-acorde"),
    modo: "oido_absoluto",
    tipo: "audio",
    dificultad: nivel,
    enunciado: "Escucha el acorde — ¿cuál es?",
    opciones: mezclar([respuesta, ...distractores]),
    respuesta,
    nota: fundamental,
    acorde,
  };
}

// «Suena un Sol: ¿en qué octava?» — opciones: la misma letra en las octavas 3 a 6.
function generarOidoOctava(nivel: number): PreguntaMelodiaAudio {
  const b = banda(nivel);
  const conSostenido = b >= 1 && (b === 1 || rngActual() < 0.5);
  const letra = conSostenido ? elegir(LETRAS_SOSTENIDO) : elegir(LETRAS);
  const crear = conSostenido ? sost : nat;
  const nota = crear(letra, randomInt(3, 6));
  const nombreLetra = nombreNota(nota).replace(/\d+$/, "");
  return {
    id: idFalso("melodia-oido"),
    modo: "oido_absoluto",
    tipo: "audio",
    dificultad: nivel,
    enunciado: `Suena un ${nombreLetra}. ¿En qué octava está?`,
    opciones: mezclar([3, 4, 5, 6].map((o) => nombreNota(crear(letra, o)))),
    respuesta: nombreNota(nota),
    nota,
  };
}

function generarOidoAbsoluto(nivel: number): PreguntaMelodiaAudio {
  const b = banda(nivel);
  if (b >= 3 && rngActual() < 0.5) return generarOidoAcorde(nivel);
  if (b <= 2 && rngActual() < (b === 2 ? 0.3 : 0.5)) return generarOidoOctava(nivel);
  const pool = POOL_OIDO_POR_BANDA[b];
  const nota = elegir(pool);
  const respuesta = nombreNota(nota);
  const s = semitonoAbsoluto(nota);
  const sep = SEPARACION_OIDO[b];
  const candidatos = pool.filter((n) => Math.abs(semitonoAbsoluto(n) - s) >= sep);
  // Bandas 0-1: separadas entre sí también. Desde la 2: las más cercanas (lo difícil).
  let distractores: NotaMusical[];
  if (b <= 1) {
    distractores = [];
    for (const c of mezclar(candidatos)) {
      if (distractores.length >= 3) break;
      if (distractores.every((d) => Math.abs(semitonoAbsoluto(d) - semitonoAbsoluto(c)) >= sep)) distractores.push(c);
    }
    for (const c of mezclar(candidatos)) if (distractores.length < 3 && !distractores.includes(c)) distractores.push(c);
  } else {
    distractores = mezclar([...candidatos].sort((x, y) => Math.abs(semitonoAbsoluto(x) - s) - Math.abs(semitonoAbsoluto(y) - s)).slice(0, 5)).slice(0, 3);
  }
  return {
    id: idFalso("melodia-oido"),
    modo: "oido_absoluto",
    tipo: "audio",
    dificultad: nivel,
    enunciado: "Escucha la nota — ¿cuál es?",
    opciones: mezclar([respuesta, ...distractores.map(nombreNota)]),
    respuesta,
    nota,
  };
}

// ─── Modo 7: Tempo y compás (pedido del usuario, 2026-10-06: "se está
// descuidando mucho el tempo") ───
//
// Cuatro tipos de pregunta: los términos italianos de tempo, qué es un BPM y
// cuánto dura cada figura a cierto tempo, cómo se lee un compás (2/4, 3/4,
// 4/4, 6/8, 2/2) y, la de oído, un pulso de metrónomo que suena y hay que
// reconocer a qué velocidad va. Las opciones de BPM se acercan entre sí al
// subir de nivel (de 40 en 40 a de 10 en 10).

export const TEMPOS_ITALIANOS: { nombre: string; min: number; max: number; significa: string }[] = [
  { nombre: "Largo", min: 40, max: 60, significa: "Muy lento" },
  { nombre: "Adagio", min: 66, max: 76, significa: "Lento" },
  { nombre: "Andante", min: 76, max: 108, significa: "Al paso de caminar" },
  { nombre: "Moderato", min: 108, max: 120, significa: "Moderado" },
  { nombre: "Allegro", min: 120, max: 156, significa: "Rápido y alegre" },
  { nombre: "Presto", min: 168, max: 200, significa: "Muy rápido" },
];

// Separación entre las opciones de BPM por banda.
const SEPARACION_BPM = [40, 30, 20, 15, 10];
// Opciones fijas de la versión anterior (se exporta por compatibilidad).
export const BPM_POR_BANDA: number[][] = [
  [60, 100, 140, 180],
  [60, 90, 120, 150],
  [70, 90, 110, 130],
  [80, 95, 110, 125],
  [90, 100, 110, 120],
];

const COMPASES: { cifra: string; tiempos: number; unidad: FiguraRitmica; corcheas: number }[] = [
  { cifra: "2/4", tiempos: 2, unidad: "negra", corcheas: 4 },
  { cifra: "3/4", tiempos: 3, unidad: "negra", corcheas: 6 },
  { cifra: "4/4", tiempos: 4, unidad: "negra", corcheas: 8 },
  { cifra: "2/2", tiempos: 2, unidad: "blanca", corcheas: 8 },
];

const segundos = (x: number) => `${String(Math.round(x * 1000) / 1000).replace(".", ",")} s`;

function preguntaTexto(nivel: number, enunciado: string, respuesta: string, distractores: string[]): PreguntaMelodiaTexto {
  const unicos = [...new Set(distractores.filter((d) => d !== respuesta))].slice(0, 3);
  return { id: idFalso("melodia-tempo"), modo: "tempo", tipo: "texto", dificultad: nivel, enunciado, opciones: mezclar([respuesta, ...unicos]), respuesta };
}

function generarTempo(nivel: number): PreguntaMelodia {
  const b = banda(nivel);
  const tipos = b === 0 ? ["pulso", "termino", "bpm"] : b === 1 ? ["pulso", "termino", "bpm", "compas"] : ["pulso", "pulso", "termino", "bpm", "compas", "compas"];
  const tipo = elegir(tipos);

  if (tipo === "pulso") {
    // Auditoría 2026-10-29: antes las 4 opciones de cada banda eran fijas (4
    // preguntas). Ahora el BPM varía y las opciones se arman a su alrededor, con la
    // separación de la banda (de 40 en 40 a de 10 en 10).
    const sep = SEPARACION_BPM[b];
    const paso = b <= 1 ? 10 : 5;
    const bpm = randomInt(60 / paso, 180 / paso) * paso;
    const posibles = [0, 1, 2, 3].filter((k) => bpm - k * sep >= 40 && bpm + (3 - k) * sep <= 220);
    const k = elegir(posibles);
    const opciones = [0, 1, 2, 3].map((i) => bpm + (i - k) * sep);
    return {
      id: idFalso("melodia-pulso"),
      modo: "tempo",
      tipo: "pulso",
      dificultad: nivel,
      enunciado: "Escucha el pulso — ¿a cuántos BPM va?",
      opciones: mezclar(opciones).map((x) => `${x} BPM`),
      respuesta: `${bpm} BPM`,
      bpm,
      pulsos: 8,
      acentoCada: 4,
    };
  }

  if (tipo === "termino") {
    const t = elegir(TEMPOS_ITALIANOS);
    if (rngActual() < 0.5) {
      return preguntaTexto(nivel, `¿Qué indica «${t.nombre}» en una partitura?`, t.significa, mezclar(TEMPOS_ITALIANOS.filter((x) => x !== t)).map((x) => x.significa));
    }
    const otros = mezclar(TEMPOS_ITALIANOS.filter((x) => x !== t)).slice(0, 3);
    const todos = [t, ...otros];
    if (rngActual() < 0.5) {
      const masLento = todos.reduce((a, x) => (x.min < a.min ? x : a));
      return preguntaTexto(nivel, `¿Cuál de estos tempos es el más lento?`, masLento.nombre, todos.filter((x) => x !== masLento).map((x) => x.nombre));
    }
    const masRapido = todos.reduce((a, x) => (x.min > a.min ? x : a));
    return preguntaTexto(nivel, `¿Cuál de estos tempos es el más rápido?`, masRapido.nombre, todos.filter((x) => x !== masRapido).map((x) => x.nombre));
  }

  if (tipo === "bpm") {
    if (b === 0 && rngActual() < 0.5) {
      return preguntaTexto(nivel, "¿Qué quiere decir 60 BPM?", "60 pulsos por minuto", ["60 notas por segundo", "60 compases por minuto", "60 segundos por pulso"]);
    }
    if (rngActual() < 0.4) {
      // «A 90 BPM, ¿cuántos pulsos suenan en 20 segundos?»
      const ritmo = elegir(b === 0 ? [60, 120] : b === 1 ? [60, 90, 120, 180] : [45, 60, 72, 80, 90, 100, 120, 150, 180]);
      const s = elegir([10, 15, 20, 30, 40, 60].filter((x) => (ritmo * x) % 60 === 0));
      const n = (ritmo * s) / 60;
      return preguntaTexto(nivel, `A ${ritmo} BPM, ¿cuántos pulsos suenan en ${s} segundos?`, String(n), [n * 2, n / 2, n + 5, n - 5, s, n + 10, n * 3].filter((x) => Number.isInteger(x) && x > 0 && x !== n).map(String));
    }
    const bpm = elegir(b <= 1 ? [60, 120] : [60, 120, 30, 240]);
    const figuras: FiguraRitmica[] = b <= 1 ? ["negra", "blanca", "redonda"] : ["negra", "blanca", "redonda", "corchea", "negra_puntillo"];
    const f = elegir(figuras);
    const dur = (DURACION_FIGURA[f] * 60) / bpm;
    const distractores = [dur * 2, dur / 2, dur + 1, dur * 4, dur / 4].filter((x) => x > 0 && x !== dur).map(segundos);
    return preguntaTexto(nivel, `A ${bpm} BPM (la negra es el pulso), ¿cuánto dura una ${NOMBRE_FIGURA[f].toLowerCase()}?`, segundos(dur), distractores);
  }

  const c = elegir(b <= 1 ? COMPASES.slice(0, 3) : COMPASES);
  if (b >= 2 && rngActual() < 0.4) {
    const seisOcho = rngActual() < 0.5;
    if (seisOcho) return preguntaTexto(nivel, "En un compás de 6/8, ¿cuántas corcheas hay en cada compás?", "6", ["8", "3", "12"]);
    return preguntaTexto(nivel, `En un compás de ${c.cifra}, ¿cuántas corcheas caben?`, String(c.corcheas), [String(c.corcheas * 2), String(c.corcheas / 2), String(c.corcheas + 2)]);
  }
  if (rngActual() < 0.5) {
    return preguntaTexto(nivel, `En un compás de ${c.cifra}, ¿cuántos tiempos tiene cada compás?`, String(c.tiempos), ["2", "3", "4", "6", "8"]);
  }
  return preguntaTexto(nivel, `En un compás de ${c.cifra}, ¿qué figura vale un tiempo?`, NOMBRE_FIGURA[c.unidad], [NOMBRE_FIGURA.negra, NOMBRE_FIGURA.blanca, NOMBRE_FIGURA.corchea, NOMBRE_FIGURA.redonda]);
}

const GENERADORES: Record<ModoMelodia, (nivel: number) => PreguntaMelodia> = {
  fundamentos: generarFundamentos,
  lectura: generarLectura,
  alteraciones: generarAlteraciones,
  escalas: generarEscalas,
  acordes: generarAcordes,
  oido_absoluto: generarOidoAbsoluto,
  tempo: generarTempo,
};

export function generarPreguntaMelodia(modo: ModoMelodia, nivel: number): PreguntaMelodia {
  return GENERADORES[modo](Math.max(1, Math.min(10, Math.round(nivel))));
}

export const MODOS_MELODIA: ModoMelodia[] = ["fundamentos", "lectura", "alteraciones", "escalas", "acordes", "oido_absoluto", "tempo"];
export const NOMBRE_MODO_MELODIA: Record<ModoMelodia, string> = {
  fundamentos: "Fundamentos",
  lectura: "Lectura en pentagrama",
  alteraciones: "Alteraciones",
  escalas: "Escalas",
  acordes: "Acordes",
  oido_absoluto: "Oído absoluto",
  tempo: "Tempo y compás",
};
