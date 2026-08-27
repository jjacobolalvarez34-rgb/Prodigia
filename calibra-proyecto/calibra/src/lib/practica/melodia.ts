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
function notaDesdeSemitonoAbsoluto(semitonoAbs: number, usarBemoles: boolean): NotaMusical {
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

export type FiguraRitmica = "redonda" | "blanca" | "negra" | "corchea";
export const FIGURAS: FiguraRitmica[] = ["redonda", "blanca", "negra", "corchea"];
export const NOMBRE_FIGURA: Record<FiguraRitmica, string> = {
  redonda: "Redonda", blanca: "Blanca", negra: "Negra", corchea: "Corchea",
};
// Duración relativa (en "pulsos de negra") — no se pregunta como
// número, pero ordena las figuras de forma consistente.
export const DURACION_FIGURA: Record<FiguraRitmica, number> = {
  redonda: 4, blanca: 2, negra: 1, corchea: 0.5,
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
const FORMULA_ESCALA: Record<TipoEscala, number[]> = {
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
const FORMULA_ACORDE: Record<TipoAcorde, number[]> = {
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

export type ModoMelodia = "fundamentos" | "lectura" | "alteraciones" | "escalas" | "acordes" | "oido_absoluto";

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
}

export type PreguntaMelodia = PreguntaMelodiaTexto | PreguntaMelodiaPentagrama | PreguntaMelodiaAudio;

function fundamentalAlAzar(rangoOctava: [number, number] = [3, 5]): NotaMusical {
  const letra = elegir(LETRAS);
  const octava = randomInt(rangoOctava[0], rangoOctava[1]);
  return { letra, octava, alteracion: null };
}

// ─── Modo 1: Fundamentos (nivel 1-2 como piso, escala completa 1-10) ───
//
// El contenido en sí (nombre de figura ↔ cifrado) no tiene mucho techo
// de dificultad real — la escalada acá es de VARIEDAD del pool, no de
// concepto nuevo: banda 0 arranca angosto (2 figuras, 3 notas) y cada
// banda suma más figuras/notas hasta cubrir el set completo, más
// preguntas "inversas" (cifrado → nota) en las bandas altas en vez de
// solo "nota → cifrado".
const FIGURAS_POR_BANDA: FiguraRitmica[][] = [
  ["redonda", "negra"],
  ["redonda", "blanca", "negra"],
  ["redonda", "blanca", "negra", "corchea"],
  ["redonda", "blanca", "negra", "corchea"],
  ["redonda", "blanca", "negra", "corchea"],
];
const NOTAS_POR_BANDA: NotaLetra[][] = [
  ["Do", "Re", "Mi"],
  ["Do", "Re", "Mi", "Fa", "Sol"],
  LETRAS,
  LETRAS,
  LETRAS,
];

function generarFundamentos(nivel: number): PreguntaMelodiaTexto {
  const b = banda(nivel);
  const esFigura = rngActual() < 0.5;

  if (esFigura) {
    const pool = FIGURAS_POR_BANDA[b];
    const figura = elegir(pool);
    // El pool de la banda puede ser más chico que 4 (banda 0 solo
    // tiene 2 figuras) — los distractores completan desde el set
    // completo de figuras en ese caso, la CORRECTA siempre sale del
    // pool restringido de la banda.
    const distractores = mezclar(pool.filter((f) => f !== figura));
    for (const relleno of mezclar(FIGURAS.filter((f) => f !== figura))) {
      if (distractores.length >= 3) break;
      if (!distractores.includes(relleno)) distractores.push(relleno);
    }
    const opciones = mezclar([figura, ...distractores.slice(0, 3)]).map((f) => NOMBRE_FIGURA[f]);
    return {
      id: idFalso("melodia-fund"),
      modo: "fundamentos",
      tipo: "texto",
      dificultad: nivel,
      enunciado: "¿Cómo se llama esta figura rítmica?",
      opciones,
      respuesta: NOMBRE_FIGURA[figura],
      figuraId: figura,
    };
  }

  const pool = NOTAS_POR_BANDA[b];
  const letra = elegir(pool);
  // Banda alta: a veces la pregunta va al revés (cifrado → nota en
  // español) para no quedarse siempre en la misma dirección.
  const invertida = b >= 3 && rngActual() < 0.5;
  // Mismo criterio que con las figuras arriba: si el pool de la banda
  // (3 notas en banda 0) no alcanza para 3 distractores, se completa
  // desde el set completo de 7 notas.
  const distractoresLetras = mezclar(pool.filter((l) => l !== letra));
  for (const relleno of mezclar(LETRAS.filter((l) => l !== letra))) {
    if (distractoresLetras.length >= 3) break;
    if (!distractoresLetras.includes(relleno)) distractoresLetras.push(relleno);
  }
  distractoresLetras.length = Math.min(distractoresLetras.length, 3);

  if (!invertida) {
    return {
      id: idFalso("melodia-fund"),
      modo: "fundamentos",
      tipo: "texto",
      dificultad: nivel,
      enunciado: `¿Cuál es el cifrado americano de "${letra}"?`,
      opciones: mezclar([letra, ...distractoresLetras]).map((l) => LETRA_A_CIFRADO[l]),
      respuesta: LETRA_A_CIFRADO[letra],
    };
  }
  return {
    id: idFalso("melodia-fund"),
    modo: "fundamentos",
    tipo: "texto",
    dificultad: nivel,
    enunciado: `¿Qué nota corresponde al cifrado "${LETRA_A_CIFRADO[letra]}"?`,
    opciones: mezclar([letra, ...distractoresLetras]),
    respuesta: letra,
  };
}

// ─── Modo 2: Lectura en pentagrama ───
//
// Escala 1-10 por RANGO de notas legibles: banda baja = solo notas
// centrales (sin ledger lines), bandas altas suman notas por encima/
// debajo del pentagrama (con ledger lines reales, calculadas por el
// mismo componente que dibuja todo lo demás).
const RANGO_LECTURA_POR_BANDA: { letra: NotaLetra; octava: number }[][] = [
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

function generarLectura(nivel: number): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const pool = RANGO_LECTURA_POR_BANDA[b];
  const elegida = elegir(pool);
  const nota: NotaMusical = { ...elegida, alteracion: null };
  const respuesta = nombreNota(nota);

  const distractores = new Set<string>();
  const candidatos = mezclar(pool.filter((n) => !(n.letra === elegida.letra && n.octava === elegida.octava)));
  for (const c of candidatos) {
    if (distractores.size >= 3) break;
    distractores.add(nombreNota({ ...c, alteracion: null }));
  }
  const opciones = mezclar([respuesta, ...Array.from(distractores)]);

  return {
    id: idFalso("melodia-lectura"),
    modo: "lectura",
    tipo: "pentagrama",
    dificultad: nivel,
    enunciado: "¿Qué nota es esta (nombre + octava)?",
    opciones,
    respuesta,
    notas: [nota],
    disposicion: "simultanea",
  };
}

// ─── Modo 3: Alteraciones ───
//
// Banda baja: un sostenido/bemol sobre una nota central, elegir el
// nombre correcto entre naturales/alteradas cercanas. Bandas altas:
// el distractor "enarmónico" (mismo sonido, otro nombre) entra al
// pool para forzar a distinguir grafía, no solo sonido.
function generarAlteraciones(nivel: number): PreguntaMelodiaPentagrama {
  const b = banda(nivel);
  const usarBemol = rngActual() < 0.5;
  const base: NotaMusical = { letra: elegir(LETRAS), octava: randomInt(4, 5), alteracion: usarBemol ? "bemol" : "sostenido" };
  const respuesta = nombreNota(base);

  const opcionesSet = new Set<string>([respuesta]);
  // Distractor 1: la nota natural (sin alterar).
  opcionesSet.add(nombreNota({ ...base, alteracion: null }));
  // Distractor 2: la alteración contraria sobre la misma letra.
  opcionesSet.add(nombreNota({ ...base, alteracion: usarBemol ? "sostenido" : "bemol" }));
  // Distractor 3 (banda >=2): el enarmónico real (mismo semitono, otra
  // letra) — solo entra en bandas más altas, es el más difícil de
  // descartar porque suena igual.
  if (b >= 2) {
    const enarmonico = notaDesdeSemitonoAbsoluto(semitonoAbsoluto(base), !usarBemol);
    opcionesSet.add(nombreNota(enarmonico));
  }
  while (opcionesSet.size < 4) {
    const relleno = fundamentalAlAzar([4, 5]);
    opcionesSet.add(nombreNota(relleno));
  }
  const opciones = mezclar(Array.from(opcionesSet)).slice(0, 4);
  if (!opciones.includes(respuesta)) opciones[0] = respuesta;

  return {
    id: idFalso("melodia-alt"),
    modo: "alteraciones",
    tipo: "pentagrama",
    dificultad: nivel,
    enunciado: "¿Qué nota está marcada acá (con su alteración)?",
    opciones: mezclar(opciones),
    respuesta,
    notas: [base],
    disposicion: "simultanea",
  };
}

// ─── Modo 4: Escalas ───
//
// Banda baja: solo pentatónicas (menos notas, patrón más simple).
// Banda media (5-7 según el enunciado original): suma mayor/menor
// natural. Banda alta: las 4 mezcladas, fundamentales menos comunes.
const ESCALAS_POR_BANDA: TipoEscala[][] = [
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
  const usarBemoles = rngActual() < 0.5;
  const fundamental = fundamentalAlAzar([3, 4]);
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
function acordesPorNivel(nivel: number): TipoAcorde[] {
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
const POOL_OIDO_POR_BANDA: NotaMusical[][] = [
  // banda 0 (nivel 1-2): máxima separación — cuarta, quinta y octava.
  // 4 notas, no 3: hacen falta al menos 4 para armar 4 opciones únicas
  // sin repetir la correcta (mismo bug ya encontrado y corregido esta
  // tanda en Fundamentos/melodia.ts — pool de banda demasiado chico).
  [
    { letra: "Do", octava: 4, alteracion: null },
    { letra: "Fa", octava: 4, alteracion: null },
    { letra: "Sol", octava: 4, alteracion: null },
    { letra: "Do", octava: 5, alteracion: null },
  ],
  // banda 1 (nivel 3-4): suma un par de naturales más de la misma octava.
  [
    { letra: "Do", octava: 4, alteracion: null },
    { letra: "Mi", octava: 4, alteracion: null },
    { letra: "Sol", octava: 4, alteracion: null },
    { letra: "La", octava: 4, alteracion: null },
    { letra: "Do", octava: 5, alteracion: null },
  ],
  // banda 2 (nivel 5-6): las 7 naturales de una octava completa.
  LETRAS.map((letra) => ({ letra, octava: 4, alteracion: null }) as NotaMusical),
  // banda 3 (nivel 7-8): dos octavas de naturales — hay que distinguir
  // register, no solo nombre de nota.
  [
    ...LETRAS.map((letra) => ({ letra, octava: 3, alteracion: null }) as NotaMusical),
    ...LETRAS.map((letra) => ({ letra, octava: 4, alteracion: null }) as NotaMusical),
  ],
  // banda 4 (nivel 9-10): suma sostenidos — semitonos vecinos reales,
  // el desafío genuino de oído absoluto.
  [
    ...LETRAS.map((letra) => ({ letra, octava: 4, alteracion: null }) as NotaMusical),
    ...(["Do", "Re", "Fa", "Sol", "La"] as NotaLetra[]).map((letra) => ({ letra, octava: 4, alteracion: "sostenido" }) as NotaMusical),
  ],
];

function generarOidoAbsoluto(nivel: number): PreguntaMelodiaAudio {
  const pool = POOL_OIDO_POR_BANDA[banda(nivel)];
  const nota = elegir(pool);
  const respuesta = nombreNota(nota);

  const distractores = mezclar(pool.filter((n) => nombreNota(n) !== respuesta)).slice(0, 3);
  const opciones = mezclar([respuesta, ...distractores.map(nombreNota)]);

  return {
    id: idFalso("melodia-oido"),
    modo: "oido_absoluto",
    tipo: "audio",
    dificultad: nivel,
    enunciado: "Escuchá la nota — ¿cuál es?",
    opciones,
    respuesta,
    nota,
  };
}

const GENERADORES: Record<ModoMelodia, (nivel: number) => PreguntaMelodia> = {
  fundamentos: generarFundamentos,
  lectura: generarLectura,
  alteraciones: generarAlteraciones,
  escalas: generarEscalas,
  acordes: generarAcordes,
  oido_absoluto: generarOidoAbsoluto,
};

export function generarPreguntaMelodia(modo: ModoMelodia, nivel: number): PreguntaMelodia {
  return GENERADORES[modo](Math.max(1, Math.min(10, Math.round(nivel))));
}

export const MODOS_MELODIA: ModoMelodia[] = ["fundamentos", "lectura", "alteraciones", "escalas", "acordes", "oido_absoluto"];
export const NOMBRE_MODO_MELODIA: Record<ModoMelodia, string> = {
  fundamentos: "Fundamentos",
  lectura: "Lectura en pentagrama",
  alteraciones: "Alteraciones",
  escalas: "Escalas",
  acordes: "Acordes",
  oido_absoluto: "Oído absoluto",
};
