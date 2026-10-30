import type { IdTema } from "./calendario";
import { COLECCIONES } from "./colecciones";
import type { Dibujo } from "./dibujos";
import type { FormaIlustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Los minieventos propios de cada fiesta (celebracion.ts → minievento), que funcionan de
// verdad en la web y la app (0309). Cada uno guarda en la base lo que ganaste; las Fichas
// que dan suman a las del evento (minievento_premios → _fichas_ganadas).
//   - Día de Muertos «La ofrenda»: una pregunta de Historia por día; acertarla enciende
//     una vela y da Fichas.
//   - Diwali «Enciende 100 lámparas»: cada acierto del evento enciende una lámpara; con
//     100, la ciudad se ilumina y da Fichas.
//   - Viernes Estelar «Estrella fugaz»: cada día cae una oferta sorpresa de la colección
//     por 2 horas (a mitad de precio). No se anuncia antes: se ve cuando cae.
//   - Navidad «Calendario de adviento»: del 1 al 24, una casilla por día (Fichas; los
//     domingos, una cápsula del evento).
//   - Año Nuevo «Reto 2027»: entre toda la comunidad, 2027 operaciones de Numeria bien
//     resueltas en un día; si se llega, cápsula para todos.

// Tipo mínimo del cliente (sirve el de la web y el de la app).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any; from: (tabla: string) => any };

const DIA_MS = 86_400_000;

export function diaUtc(ahora = Date.now()): string {
  return new Date(ahora).toISOString().slice(0, 10);
}

function diasDesdeEpoca(iso: string): number {
  return Math.floor(Date.parse(`${iso}T00:00:00Z`) / DIA_MS);
}

// ---------- Día de Muertos: La ofrenda ----------
// Fichas por cada vela encendida (pregunta acertada).
export const FICHAS_POR_VELA = 4;

export interface PreguntaOfrenda {
  personaje: string;
  vida: string;
  pregunta: string;
  preguntaEn: string;
  // La correcta es siempre la primera; se muestran mezcladas.
  opciones: [string, string, string, string];
  opcionesEn: [string, string, string, string];
  dato: string;
  datoEn: string;
}

// Personajes que ya no están (una por día, en orden; el 1 y 2 de noviembre de 2026 tocan
// Frida Kahlo y Nezahualcóyotl).
export const PREGUNTAS_OFRENDA: PreguntaOfrenda[] = [
  {
    personaje: "Marie Curie",
    vida: "1867 – 1934",
    pregunta: "Marie Curie ganó dos veces el mismo premio, en dos ciencias distintas. ¿Cuál?",
    preguntaEn: "Marie Curie won the same prize twice, in two different sciences. Which one?",
    opciones: ["El Premio Nobel", "La Medalla Fields", "El Premio Pulitzer", "El Premio Príncipe de Asturias"],
    opcionesEn: ["The Nobel Prize", "The Fields Medal", "The Pulitzer Prize", "The Princess of Asturias Award"],
    dato: "Física en 1903 y Química en 1911. Descubrió el polonio y el radio.",
    datoEn: "Physics in 1903 and Chemistry in 1911. She discovered polonium and radium.",
  },
  {
    personaje: "Benito Juárez",
    vida: "1806 – 1872",
    pregunta: "¿Qué frase se le atribuye a Benito Juárez?",
    preguntaEn: "Which phrase is attributed to Benito Juárez?",
    opciones: ["«El respeto al derecho ajeno es la paz»", "«Vine, vi, vencí»", "«Pienso, luego existo»", "«Solo sé que no sé nada»"],
    opcionesEn: ["“Respect for the rights of others is peace”", "“I came, I saw, I conquered”", "“I think, therefore I am”", "“I only know that I know nothing”"],
    dato: "Fue el primer presidente indígena de México; era zapoteco, de Oaxaca.",
    datoEn: "He was Mexico's first Indigenous president; a Zapotec from Oaxaca.",
  },
  {
    personaje: "Sor Juana Inés de la Cruz",
    vida: "1648 – 1695",
    pregunta: "¿En qué siglo vivió Sor Juana Inés de la Cruz?",
    preguntaEn: "In which century did Sor Juana Inés de la Cruz live?",
    opciones: ["En el siglo XVII", "En el siglo XV", "En el siglo XIX", "En el siglo XX"],
    opcionesEn: ["The 17th century", "The 15th century", "The 19th century", "The 20th century"],
    dato: "La llamaron «la Décima Musa» y defendió el derecho de las mujeres a estudiar.",
    datoEn: "She was called “the Tenth Muse” and defended women's right to study.",
  },
  {
    personaje: "Simón Bolívar",
    vida: "1783 – 1830",
    pregunta: "¿Qué país lleva el nombre de Simón Bolívar?",
    preguntaEn: "Which country is named after Simón Bolívar?",
    opciones: ["Bolivia", "Venezuela", "Colombia", "Ecuador"],
    opcionesEn: ["Bolivia", "Venezuela", "Colombia", "Ecuador"],
    dato: "Nació en Caracas y lideró la independencia de seis países actuales.",
    datoEn: "Born in Caracas, he led the independence of six present-day countries.",
  },
  {
    personaje: "Ada Lovelace",
    vida: "1815 – 1852",
    pregunta: "¿Por qué se recuerda a Ada Lovelace?",
    preguntaEn: "Why is Ada Lovelace remembered?",
    opciones: ["Escribió el primer algoritmo para una máquina", "Inventó el teléfono", "Descubrió la penicilina", "Dibujó el primer mapa del mundo"],
    opcionesEn: ["She wrote the first algorithm for a machine", "She invented the telephone", "She discovered penicillin", "She drew the first world map"],
    dato: "Lo pensó para la Máquina Analítica de Charles Babbage, un siglo antes de las computadoras.",
    datoEn: "She wrote it for Charles Babbage's Analytical Engine, a century before computers.",
  },
  {
    personaje: "Leonardo da Vinci",
    vida: "1452 – 1519",
    pregunta: "¿Cuál de estas obras pintó Leonardo da Vinci?",
    preguntaEn: "Which of these did Leonardo da Vinci paint?",
    opciones: ["La Gioconda (Mona Lisa)", "La noche estrellada", "Las meninas", "El grito"],
    opcionesEn: ["The Mona Lisa", "The Starry Night", "Las Meninas", "The Scream"],
    dato: "Además de pintor, dibujó máquinas voladoras y estudió el cuerpo humano.",
    datoEn: "Besides painting, he sketched flying machines and studied the human body.",
  },
  {
    personaje: "Gabriel García Márquez",
    vida: "1927 – 2014",
    pregunta: "¿Qué novela escribió Gabriel García Márquez?",
    preguntaEn: "Which novel did Gabriel García Márquez write?",
    opciones: ["Cien años de soledad", "Don Quijote de la Mancha", "Rayuela", "Pedro Páramo"],
    opcionesEn: ["One Hundred Years of Solitude", "Don Quixote", "Hopscotch", "Pedro Páramo"],
    dato: "Ganó el Nobel de Literatura en 1982; su pueblo inventado se llama Macondo.",
    datoEn: "He won the Nobel Prize in Literature in 1982; his invented town is Macondo.",
  },
  {
    personaje: "Hipatia de Alejandría",
    vida: "c. 360 – 415",
    pregunta: "¿En qué ciudad enseñó Hipatia matemáticas y astronomía?",
    preguntaEn: "In which city did Hypatia teach mathematics and astronomy?",
    opciones: ["Alejandría", "Atenas", "Roma", "Babilonia"],
    opcionesEn: ["Alexandria", "Athens", "Rome", "Babylon"],
    dato: "Es una de las primeras matemáticas de las que se conserva el nombre.",
    datoEn: "She is one of the earliest women mathematicians whose name we know.",
  },
  {
    personaje: "Nelson Mandela",
    vida: "1918 – 2013",
    pregunta: "¿Qué país presidió Nelson Mandela?",
    preguntaEn: "Which country did Nelson Mandela lead as president?",
    opciones: ["Sudáfrica", "Kenia", "Nigeria", "Egipto"],
    opcionesEn: ["South Africa", "Kenya", "Nigeria", "Egypt"],
    dato: "Pasó 27 años preso y, al salir, fue el primer presidente elegido por todos los sudafricanos.",
    datoEn: "He spent 27 years in prison and then became the first president elected by all South Africans.",
  },
  {
    personaje: "Galileo Galilei",
    vida: "1564 – 1642",
    pregunta: "¿Qué descubrió Galileo con su telescopio en 1610?",
    preguntaEn: "What did Galileo discover with his telescope in 1610?",
    opciones: ["Cuatro lunas de Júpiter", "Los anillos de Urano", "El planeta Plutón", "Un agujero negro"],
    opcionesEn: ["Four moons of Jupiter", "The rings of Uranus", "The planet Pluto", "A black hole"],
    dato: "Hoy se llaman satélites galileanos: Ío, Europa, Ganímedes y Calisto.",
    datoEn: "They are now called the Galilean moons: Io, Europa, Ganymede and Callisto.",
  },
  {
    personaje: "Frida Kahlo",
    vida: "1907 – 1954",
    pregunta: "¿Cómo se llama la casa de Frida Kahlo en Coyoacán, que hoy es museo?",
    preguntaEn: "What is the name of Frida Kahlo's house in Coyoacán, now a museum?",
    opciones: ["La Casa Azul", "La Casa Roja", "La Casa de los Azulejos", "La Casa Blanca"],
    opcionesEn: ["The Blue House", "The Red House", "The House of Tiles", "The White House"],
    dato: "Allí nació y allí murió. Pintó más de 50 autorretratos.",
    datoEn: "She was born and died there. She painted more than 50 self-portraits.",
  },
  {
    personaje: "Nezahualcóyotl",
    vida: "1402 – 1472",
    pregunta: "Nezahualcóyotl, poeta y gobernante, fue tlatoani de qué ciudad?",
    preguntaEn: "Nezahualcóyotl, poet and ruler, was the tlatoani of which city?",
    opciones: ["Texcoco", "Tenochtitlan", "Cusco", "Tula"],
    opcionesEn: ["Texcoco", "Tenochtitlan", "Cusco", "Tula"],
    dato: "Escribió poemas en náhuatl y mandó construir el acueducto de Chapultepec.",
    datoEn: "He wrote poems in Nahuatl and had the Chapultepec aqueduct built.",
  },
  {
    personaje: "Albert Einstein",
    vida: "1879 – 1955",
    pregunta: "¿Qué ecuación hizo famoso a Albert Einstein?",
    preguntaEn: "Which equation made Albert Einstein famous?",
    opciones: ["E = mc²", "F = m·a", "a² + b² = c²", "PV = nRT"],
    opcionesEn: ["E = mc²", "F = m·a", "a² + b² = c²", "PV = nRT"],
    dato: "Dice que la masa y la energía son dos formas de lo mismo.",
    datoEn: "It says that mass and energy are two forms of the same thing.",
  },
  {
    personaje: "K'inich Janaab' Pakal",
    vida: "603 – 683",
    pregunta: "¿Qué ciudad maya gobernó Pakal el Grande?",
    preguntaEn: "Which Maya city did Pakal the Great rule?",
    opciones: ["Palenque", "Chichén Itzá", "Tikal", "Copán"],
    opcionesEn: ["Palenque", "Chichén Itzá", "Tikal", "Copán"],
    dato: "Su tumba, con una lápida tallada, está en el Templo de las Inscripciones.",
    datoEn: "His tomb, with a carved lid, lies in the Temple of the Inscriptions.",
  },
];

export function preguntaOfrendaDe(iso: string): { indice: number; pregunta: PreguntaOfrenda } {
  const indice = ((diasDesdeEpoca(iso) % PREGUNTAS_OFRENDA.length) + PREGUNTAS_OFRENDA.length) % PREGUNTAS_OFRENDA.length;
  return { indice, pregunta: PREGUNTAS_OFRENDA[indice] };
}

// Orden en que se muestran las 4 opciones ese día (índices de `opciones`; la 0 es la buena).
export function ordenOpcionesOfrenda(iso: string): number[] {
  const n = diasDesdeEpoca(iso);
  const orden = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = (n * 7 + i * 13) % (i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
}

export interface RespuestaOfrenda {
  dia: string;
  opcion: number;
  acierto: boolean;
}

// Tus respuestas de este evento (null si la base todavía no tiene la ofrenda).
export async function respuestasOfrenda(sb: SupabaseClient, evento: string): Promise<RespuestaOfrenda[] | null> {
  const { data, error } = await sb.from("ofrenda_respuestas").select("dia, opcion, acierto").eq("evento", evento);
  if (error) return null;
  return (data ?? []) as RespuestaOfrenda[];
}

export async function responderOfrenda(sb: SupabaseClient, opcion: number): Promise<{ acierto: boolean; velas: number; saldo: number }> {
  const { data, error } = await sb.rpc("responder_ofrenda", { p_opcion: opcion });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { acierto: boolean; velas: number; saldo: number };
}

// ---------- Diwali: Enciende 100 lámparas ----------
export const META_LAMPARAS = 100;
export const FICHAS_LAMPARAS = 10;

export async function lamparasEvento(sb: SupabaseClient): Promise<{ evento: string; encendidas: number; premio: boolean } | null> {
  const { data, error } = await sb.rpc("lamparas_evento");
  if (error) return null;
  const fila = (Array.isArray(data) ? data[0] : data) as { evento: string; encendidas: number; premio: boolean } | undefined;
  return fila ?? null;
}

// ---------- Viernes Estelar: Estrella fugaz ----------
// Una oferta por día del evento: `dia` (0 = el primero) y la hora UTC en que cae; dura
// DURACION_OFERTA_MS y cuesta la mitad (Fichas y Cometas). La base guarda las mismas
// (eventos_ofertas, generadas desde acá) y cobra ese precio.
export const DURACION_OFERTA_MS = 2 * 3_600_000;
export const OFERTAS_ESTELARES: { dia: number; hora: number; item: string }[] = [
  { dia: 0, hora: 23, item: "marco_evento_constelacion" },
  { dia: 1, hora: 16, item: "fondo_evento_noche_estelar" },
  { dia: 3, hora: 1, item: "marco_evento_cometa" },
  { dia: 3, hora: 20, item: "efecto_evento_estrella_fugaz" },
];

export function mitad(n: number): number {
  return Math.ceil(n / 2);
}

export interface OfertaEstelar {
  item: string;
  desdeMs: number;
  hastaMs: number;
  fichas: number;
  cometas: number;
}

export function ofertasEstelaresDe(desde: string): OfertaEstelar[] {
  const piezas = COLECCIONES.viernes_estelar?.piezas ?? [];
  const base = Date.parse(`${desde}T00:00:00Z`);
  return OFERTAS_ESTELARES.flatMap((o) => {
    const p = piezas.find((x) => x.item === o.item);
    if (!p) return [];
    const desdeMs = base + o.dia * DIA_MS + o.hora * 3_600_000;
    return [{ item: o.item, desdeMs, hastaMs: desdeMs + DURACION_OFERTA_MS, fichas: mitad(p.fichas), cometas: mitad(p.cometas) }];
  });
}

// La oferta que está cayendo ahora (null si no hay). Nunca dice cuál viene.
export function ofertaEstelarAhora(desde: string, ahora = Date.now()): OfertaEstelar | null {
  return ofertasEstelaresDe(desde).find((o) => ahora >= o.desdeMs && ahora < o.hastaMs) ?? null;
}

// ---------- Navidad: Calendario de adviento ----------
export const FICHAS_ADVIENTO = 3;
export const ULTIMA_CASILLA = 24;

export interface CasillaAdviento {
  dia: string;
  premio: "fichas" | "capsula";
  cantidad: number;
}

export function esDomingo(iso: string): boolean {
  return new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;
}

export async function casillasAdviento(sb: SupabaseClient, evento: string): Promise<CasillaAdviento[] | null> {
  const { data, error } = await sb.from("adviento_casillas").select("dia, premio, cantidad").eq("evento", evento);
  if (error) return null;
  return (data ?? []) as CasillaAdviento[];
}

export async function abrirCasillaAdviento(sb: SupabaseClient): Promise<CasillaAdviento> {
  const { data, error } = await sb.rpc("abrir_casilla_adviento");
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as CasillaAdviento;
}

// ---------- Año Nuevo: Reto de la comunidad ----------
export interface RetoComunidad {
  evento: string;
  dia: string;
  total: number;
  meta: number;
  logrado: boolean;
  reclamado: boolean;
}

export async function retoComunidad(sb: SupabaseClient): Promise<RetoComunidad | null> {
  const { data, error } = await sb.rpc("reto_comunidad");
  if (error) return null;
  return ((Array.isArray(data) ? data[0] : data) as RetoComunidad | undefined) ?? null;
}

export async function reclamarRetoComunidad(sb: SupabaseClient): Promise<void> {
  const { error } = await sb.rpc("reclamar_reto_comunidad");
  if (error) throw error;
}

// ---------- Fiestas de febrero a septiembre (0311) ----------
// Metas de aciertos: una tabla genérica (minievento_metas, generada desde acá). Cada una
// se reclama una vez (por día si `porDia`); cuentan los aciertos desde que abrió el
// evento (o de hoy), en cualquier mundo o solo en `mundo`. Las usan:
//   - Año Nuevo Lunar «Sobres rojos»: 3 sobres por día, con 5, 15 y 30 aciertos del día.
//   - Carnaval «Comparsa»: aciertos de Melodía del evento (20, 50 y 100); hay tabla.
//   - Holi «Ciudad de colores»: 60 aciertos del evento pintan la ciudad entera.
//   - Día de la Música «Melodía al doble»: 16 aciertos de Melodía tocan la melodía.
//   - Vuelta a clases «Semana de repaso»: 10 aciertos del día llenan una página.
export interface MetaMinievento {
  tema: IdTema;
  clave: string;
  mundo: string | null;
  porDia: boolean;
  meta: number;
  fichas: number;
}

export const METAS_MINIEVENTOS: MetaMinievento[] = [
  { tema: "anio_nuevo_lunar", clave: "sobre1", mundo: null, porDia: true, meta: 5, fichas: 2 },
  { tema: "anio_nuevo_lunar", clave: "sobre2", mundo: null, porDia: true, meta: 15, fichas: 3 },
  { tema: "anio_nuevo_lunar", clave: "sobre3", mundo: null, porDia: true, meta: 30, fichas: 4 },
  { tema: "carnaval", clave: "comparsa1", mundo: "melodia", porDia: false, meta: 20, fichas: 3 },
  { tema: "carnaval", clave: "comparsa2", mundo: "melodia", porDia: false, meta: 50, fichas: 4 },
  { tema: "carnaval", clave: "comparsa3", mundo: "melodia", porDia: false, meta: 100, fichas: 6 },
  { tema: "holi", clave: "colores", mundo: null, porDia: false, meta: 60, fichas: 8 },
  { tema: "dia_musica", clave: "melodia", mundo: "melodia", porDia: true, meta: 16, fichas: 6 },
  { tema: "vuelta_clases", clave: "pagina", mundo: null, porDia: true, meta: 10, fichas: 3 },
];

export function metasDe(tema: IdTema): MetaMinievento[] {
  return METAS_MINIEVENTOS.filter((m) => m.tema === tema);
}

// La clave con la que la base guarda el premio de una meta (minievento_premios).
export function clavePremioMeta(m: MetaMinievento, dia: string): string {
  return m.porDia ? `meta:${m.clave}:${dia}` : `meta:${m.clave}`;
}

export interface ProgresoMinievento {
  evento: string;
  hoy: number;
  total: number;
}

// Tus aciertos de hoy y del evento (en el mundo de sus metas). null si la base todavía no
// tiene el minievento o no hay evento abierto.
export async function progresoMinievento(sb: SupabaseClient, tema: IdTema): Promise<ProgresoMinievento | null> {
  const { data, error } = await sb.rpc("progreso_minievento", { p_tema: tema });
  if (error) return null;
  return ((Array.isArray(data) ? data[0] : data) as ProgresoMinievento | undefined) ?? null;
}

export interface PremioMinievento {
  clave: string;
  fichas: number;
}

export async function premiosMinievento(sb: SupabaseClient, evento: string): Promise<PremioMinievento[] | null> {
  const { data, error } = await sb.from("minievento_premios").select("clave, fichas").eq("evento", evento);
  if (error) return null;
  return (data ?? []) as PremioMinievento[];
}

export async function reclamarMetaMinievento(sb: SupabaseClient, tema: IdTema, clave: string): Promise<{ fichas: number; saldo: number }> {
  const { data, error } = await sb.rpc("reclamar_meta_minievento", { p_tema: tema, p_clave: clave });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { fichas: number; saldo: number };
}

// ¿Ya cobraste esta meta (hoy, si es por día)?
export function metaCobrada(m: MetaMinievento, premios: PremioMinievento[], dia: string): boolean {
  return premios.some((x) => x.clave === clavePremioMeta(m, dia));
}

// Las metas que ya alcanzaste y todavía no cobraste.
export function metasPorCobrar(tema: IdTema, p: ProgresoMinievento, premios: PremioMinievento[], dia: string): MetaMinievento[] {
  return metasDe(tema).filter((m) => (m.porDia ? p.hoy : p.total) >= m.meta && !metaCobrada(m, premios, dia));
}

// Carnaval: un bailarín por cada 10 aciertos de Melodía (hasta 10).
export const ACIERTOS_POR_BAILARIN = 10;

export interface FilaComparsa {
  nombre: string;
  aciertos: number;
  yo: boolean;
}

export async function tablaComparsa(sb: SupabaseClient): Promise<FilaComparsa[] | null> {
  const { data, error } = await sb.rpc("tabla_comparsa");
  if (error) return null;
  return (data ?? []) as FilaComparsa[];
}

// ---------- Amor y amistad: Dúo de la amistad ----------
// Un duelo amistoso (no ranked) terminado con un amigo durante el evento: los dos ganan
// Fichas, una vez por amigo y hasta DUO_MAX_AMIGOS amigos.
export const FICHAS_POR_DUO = 3;
export const DUO_MAX_AMIGOS = 5;

export interface DuoAmistad {
  amigo_id: string;
  nombre: string;
  fichas: number;
}

export async function duoAmistad(sb: SupabaseClient): Promise<DuoAmistad[] | null> {
  const { data, error } = await sb.rpc("duo_amistad");
  if (error) return null;
  return (data ?? []) as DuoAmistad[];
}

// ---------- Pregunta del día (Noches de linternas) ----------
export const FICHAS_POR_PREGUNTA = 4;

export interface PreguntaDia {
  tema: string;
  temaEn: string;
  pregunta: string;
  preguntaEn: string;
  // La correcta es siempre la primera; se muestran mezcladas (ordenOpcionesOfrenda).
  opciones: [string, string, string, string];
  opcionesEn: [string, string, string, string];
  dato: string;
  datoEn: string;
}

// Noches de luna: la luna y los números, con calma (una por noche).
export const PREGUNTAS_LUNA: PreguntaDia[] = [
  {
    tema: "Fases de la luna",
    temaEn: "Moon phases",
    pregunta: "¿Cuántos días tarda la luna en pasar de una luna nueva a la siguiente, más o menos?",
    preguntaEn: "About how many days does the moon take to go from one new moon to the next?",
    opciones: ["29,5 días", "7 días", "15 días", "365 días"],
    opcionesEn: ["29.5 days", "7 days", "15 days", "365 days"],
    dato: "Es el mes sinódico. Por eso los calendarios lunares tienen meses de 29 o 30 días.",
    datoEn: "It's the synodic month. That's why lunar calendars have 29- or 30-day months.",
  },
  {
    tema: "Las cuatro fases",
    temaEn: "The four phases",
    pregunta: "El ciclo dura 29,5 días y tiene 4 fases principales. ¿Cuántos días pasan, más o menos, entre una fase y la siguiente?",
    preguntaEn: "The cycle lasts 29.5 days and has 4 main phases. About how many days pass between one phase and the next?",
    opciones: ["7,4 días", "4 días", "10 días", "14,7 días"],
    opcionesEn: ["7.4 days", "4 days", "10 days", "14.7 days"],
    dato: "29,5 ÷ 4 ≈ 7,4. Por eso la semana de 7 días se parece tanto a un cuarto de luna.",
    datoEn: "29.5 ÷ 4 ≈ 7.4. That's why a 7-day week is so close to a quarter moon.",
  },
  {
    tema: "Probabilidad",
    temaEn: "Probability",
    pregunta: "En un mes de 30 noches hay 1 noche de luna llena. ¿Qué probabilidad hay de que una noche al azar sea de luna llena?",
    preguntaEn: "In a 30-night month there is 1 full-moon night. What's the probability that a random night is a full moon?",
    opciones: ["1/30", "1/2", "1/4", "1/12"],
    opcionesEn: ["1/30", "1/2", "1/4", "1/12"],
    dato: "Casos favorables entre casos posibles: 1 de 30, un poco más de 3 %.",
    datoEn: "Favorable cases over possible cases: 1 out of 30, a little over 3%.",
  },
  {
    tema: "La cara oculta",
    temaEn: "The far side",
    pregunta: "¿Por qué desde la Tierra vemos siempre la misma cara de la luna?",
    preguntaEn: "Why do we always see the same side of the moon from Earth?",
    opciones: ["Gira sobre sí misma en el mismo tiempo que tarda en dar la vuelta a la Tierra", "Porque no gira", "Porque la Tierra la tapa", "Porque la otra cara no refleja luz"],
    opcionesEn: ["It spins once in the same time it takes to orbit Earth", "Because it doesn't spin", "Because Earth blocks it", "Because the other side doesn't reflect light"],
    dato: "Se llama rotación sincrónica. La cara oculta recibe sol igual que la otra.",
    datoEn: "It's called synchronous rotation. The far side gets as much sunlight as the near side.",
  },
  {
    tema: "Promedio",
    temaEn: "Average",
    pregunta: "Tres noches se ven 4, 6 y 8 linternas en el cielo. ¿Cuál es el promedio?",
    preguntaEn: "Over three nights, 4, 6 and 8 lanterns are seen in the sky. What's the average?",
    opciones: ["6", "18", "8", "5"],
    opcionesEn: ["6", "18", "8", "5"],
    dato: "Se suman (18) y se divide entre la cantidad de noches (3).",
    datoEn: "Add them (18) and divide by the number of nights (3).",
  },
  {
    tema: "Distancia",
    temaEn: "Distance",
    pregunta: "¿A qué distancia aproximada está la luna de la Tierra?",
    preguntaEn: "Roughly how far is the moon from Earth?",
    opciones: ["384 000 km", "3 840 km", "38 millones de km", "150 millones de km"],
    opcionesEn: ["384,000 km", "3,840 km", "38 million km", "150 million km"],
    dato: "Su luz tarda poco más de 1 segundo en llegarnos; la del Sol, unos 8 minutos.",
    datoEn: "Its light takes just over 1 second to reach us; the Sun's, about 8 minutes.",
  },
  {
    tema: "Mareas",
    temaEn: "Tides",
    pregunta: "¿Qué causa principalmente las mareas del mar?",
    preguntaEn: "What mainly causes ocean tides?",
    opciones: ["La gravedad de la luna", "El viento", "La lluvia", "La rotación del Sol"],
    opcionesEn: ["The moon's gravity", "The wind", "The rain", "The Sun's rotation"],
    dato: "Hay dos mareas altas por día, porque la luna estira el agua de los dos lados de la Tierra.",
    datoEn: "There are two high tides a day, because the moon pulls the water on both sides of Earth.",
  },
];

export function preguntaLunaDe(iso: string): PreguntaDia {
  const n = PREGUNTAS_LUNA.length;
  return PREGUNTAS_LUNA[((diasDesdeEpoca(iso) % n) + n) % n];
}

export interface RespuestaDia {
  dia: string;
  opcion: number;
  acierto: boolean;
}

export async function respuestasPreguntaDia(sb: SupabaseClient, evento: string): Promise<RespuestaDia[] | null> {
  const { data, error } = await sb.from("pregunta_dia_respuestas").select("dia, opcion, acierto").eq("evento", evento);
  if (error) return null;
  return (data ?? []) as RespuestaDia[];
}

export async function responderPreguntaDia(sb: SupabaseClient, tema: IdTema, opcion: number): Promise<{ acierto: boolean; aciertos: number; saldo: number }> {
  const { data, error } = await sb.rpc("responder_pregunta_dia", { p_tema: tema, p_opcion: opcion });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { acierto: boolean; aciertos: number; saldo: number };
}

// ---------- Día de π: Fichas por dígitos ----------
// Con tu mejor marca del día en «Dígitos de π» (0295): cada meta, una vez.
export const METAS_PI: { digitos: number; fichas: number }[] = [
  { digitos: 10, fichas: 2 },
  { digitos: 20, fichas: 3 },
  { digitos: 31, fichas: 4 },
];

export async function premiosDigitosPi(sb: SupabaseClient): Promise<{ evento: string; mejor: number; fichas: number } | null> {
  const { data, error } = await sb.rpc("premios_digitos_pi");
  if (error) return null;
  return ((Array.isArray(data) ? data[0] : data) as { evento: string; mejor: number; fichas: number } | undefined) ?? null;
}

// ---------- Pascua: Huevos escondidos ----------
// Un huevo por día del evento, cada día en otra pantalla (en este orden). La base sabe el
// mismo orden y solo acepta el de hoy en su lugar.
export type LugarHuevo = "tienda" | "perfil" | "recompensas" | "evento";
export const LUGARES_HUEVOS: LugarHuevo[] = ["tienda", "perfil", "recompensas", "evento"];
export const FICHAS_POR_HUEVO = 4;
export const FICHAS_TODOS_HUEVOS = 6;

export const PISTAS_HUEVOS: Record<LugarHuevo, { es: string; en: string }> = {
  tienda: { es: "Pista: donde se compran cosas.", en: "Hint: where things are bought." },
  perfil: { es: "Pista: donde está tu placa.", en: "Hint: where your plaque is." },
  recompensas: { es: "Pista: donde se abren las cápsulas.", en: "Hint: where capsules are opened." },
  evento: { es: "Pista: junto a la colección de Pascua.", en: "Hint: next to the Easter collection." },
};

// El lugar del huevo de un día del evento (null fuera de sus días).
export function lugarHuevoDe(desde: string, dia: string): LugarHuevo | null {
  const i = Math.round((Date.parse(`${dia}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / DIA_MS);
  return LUGARES_HUEVOS[i] ?? null;
}

export async function encontrarHuevo(sb: SupabaseClient, lugar: LugarHuevo): Promise<{ fichas: number; encontrados: number; saldo: number }> {
  const { data, error } = await sb.rpc("encontrar_huevo", { p_lugar: lugar });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { fichas: number; encontrados: number; saldo: number };
}

// ---------- Día de la Tierra: Bosque compartido ----------
// Cada ACIERTOS_POR_ARBOL aciertos de toda la comunidad plantan un árbol; con
// META_BOSQUE árboles, los que plantaron al menos uno reciben FICHAS_BOSQUE.
export const ACIERTOS_POR_ARBOL = 5;
export const META_BOSQUE = 400;
export const FICHAS_BOSQUE = 6;

export interface BosqueCompartido {
  evento: string;
  arboles: number;
  meta: number;
  mios: number;
  reclamado: boolean;
}

export async function bosqueCompartido(sb: SupabaseClient): Promise<BosqueCompartido | null> {
  const { data, error } = await sb.rpc("bosque_compartido");
  if (error) return null;
  return ((Array.isArray(data) ? data[0] : data) as BosqueCompartido | undefined) ?? null;
}

export async function reclamarBosque(sb: SupabaseClient): Promise<void> {
  const { error } = await sb.rpc("reclamar_bosque");
  if (error) throw error;
}

export function mensajeErrorMinievento(e: unknown, en = false): string {
  const m = (e as { message?: string } | null)?.message ?? "";
  if (/aun no llegas/i.test(m)) return en ? "You haven't reached that goal yet." : "Todavía no llegas a esa meta.";
  if (/ya tienes este premio/i.test(m)) return en ? "You already got this reward." : "Ya tienes este premio.";
  if (/ya encontraste/i.test(m)) return en ? "You already found today's egg." : "Ya encontraste el huevo de hoy.";
  if (/aqui no hay/i.test(m)) return en ? "There's no egg here today." : "Hoy no hay ningún huevo aquí.";
  if (/planta al menos/i.test(m)) return en ? "Plant at least one tree to get the reward." : "Planta al menos un árbol para recibir el premio.";
  if (/no autenticado/i.test(m)) return en ? "Create your account to play the mini-event." : "Crea tu cuenta para jugar el minievento.";
  if (/ya respondiste/i.test(m)) return en ? "You already answered today's question." : "Ya respondiste la pregunta de hoy.";
  if (/ya abriste/i.test(m)) return en ? "You already opened today's door." : "Ya abriste la casilla de hoy.";
  if (/ya reclamaste/i.test(m)) return en ? "You already got today's reward." : "Ya recibiste el premio de hoy.";
  if (/todavia no/i.test(m)) return en ? "The community hasn't reached the goal yet." : "La comunidad todavía no llegó a la meta.";
  if (/no hay un evento/i.test(m)) return en ? "There's no event open right now." : "Ahora no hay un evento abierto.";
  if (/termino/i.test(m)) return en ? "The calendar is over." : "El calendario ya terminó.";
  if (/function|does not exist|schema cache/i.test(m)) return en ? "This mini-event isn't ready yet. Try again later." : "El minievento todavía no está listo. Prueba más tarde.";
  return en ? "Something went wrong. Try again." : "No se pudo. Inténtalo de nuevo.";
}

// ---------- Dibujos ----------
function rect(x: number, y: number, w: number, h: number): string {
  return `M${x} ${y}h${w}v${h}h${-w}z`;
}

function circ(x: number, y: number, r: number): string {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0z`;
}

function llama(x: number, base: number, alto: number): string {
  const a = alto;
  const w = a * 0.42;
  return `M${x} ${base - a}c${w * 0.9} ${a * 0.45} ${w * 1.1} ${a * 0.7} ${w * 0.55} ${a * 0.9}c-${w * 0.2} ${a * 0.08}-${w * 0.35} ${a * 0.1}-${w * 0.55} ${a * 0.1}s-${w * 0.35}-${a * 0.02}-${w * 0.55}-${a * 0.1}c-${w * 0.55}-${a * 0.2}-${w * 0.35}-${a * 0.45} ${w * 0.55}-${a * 0.9}z`;
}

// Flor de cempasúchil chica para la ofrenda.
function florChica(x: number, y: number, r: number): string {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    d += circ(+(x + Math.cos(a) * r).toFixed(2), +(y + Math.sin(a) * r).toFixed(2), +(r * 0.65).toFixed(2));
  }
  return d;
}

// La ofrenda: papel picado arriba, dos escalones, flores y una vela por cada día del
// evento (encendida si acertaste ese día). 160 × 100.
export function escenaOfrenda(velas: boolean[]): Dibujo {
  const formas: FormaIlustracion[] = [];
  // Papel picado: banderitas de colores colgando de un hilo.
  const colores = ["#FF5D8F", "#FF9F1C", "#3DDC97", "#A794FF", "#4FE0F5", "#FFC53D", "#FF5D8F"];
  formas.push({ d: "M4 6Q80 14 156 6", trazo: "#F4EAD5", ancho: 0.8, opacidad: 0.7 });
  colores.forEach((c, i) => {
    const x = 10 + i * 21;
    const y = 7.5 + Math.sin((i / 6) * Math.PI) * 3.2;
    formas.push({ d: `M${x} ${y}h16v11l-2.7 2.4-2.6-2.4-2.7 2.4-2.6-2.4-2.7 2.4-2.7-2.4z`, relleno: c, opacidad: 0.92 });
    formas.push({ d: circ(x + 8, y + 5.5, 1.6) + rect(x + 3.5, y + 2.5, 2, 2) + rect(x + 10.5, y + 2.5, 2, 2), relleno: "#1A0B2E", opacidad: 0.55 });
  });
  // Escalones de la ofrenda.
  formas.push({ d: rect(18, 70, 124, 14), relleno: "#7A1F4D" });
  formas.push({ d: rect(34, 58, 92, 12), relleno: "#9D2B5E" });
  formas.push({ d: rect(10, 84, 140, 12), relleno: "#5C1238" });
  formas.push({ d: "M18 70h124M34 58h92M10 84h140", trazo: "#FFC53D", ancho: 0.8, opacidad: 0.6 });
  // Flores en los costados.
  for (const [x, y] of [
    [24, 66],
    [136, 66],
    [16, 80],
    [144, 80],
    [40, 55],
    [120, 55],
  ] as const) {
    formas.push({ d: florChica(x, y, 3.4), relleno: "#FF8A00" });
    formas.push({ d: circ(x, y, 1.8), relleno: "#C2410C" });
  }
  // El retrato en el centro (una silueta en un marco dorado) y dos panes de muerto.
  formas.push({ d: rect(69, 32, 22, 26), relleno: "#E8A317" });
  formas.push({ d: rect(71.5, 34.5, 17, 21), relleno: "#2A1240" });
  formas.push({ d: circ(80, 41.5, 3.6) + "M73.5 55.5c0-6 3-8.5 6.5-8.5s6.5 2.5 6.5 8.5z", relleno: "#7A5C8F" });
  for (const x of [52, 108]) {
    formas.push({ d: `M${x - 7} 70c0-6 3.5-8 7-8s7 2 7 8z`, relleno: "#D98A3A" });
    formas.push({ d: `M${x - 4} 66l8 0M${x} 63v6`, trazo: "#B5642A", ancho: 1.2 });
  }
  // Velas: repartidas en el escalón de arriba.
  const n = Math.max(1, velas.length);
  velas.forEach((encendida, i) => {
    const x = 80 + (i - (n - 1) / 2) * (n > 2 ? 22 : 34);
    formas.push({ d: rect(x - 4, 38, 8, 20), relleno: "#F4EAD5" });
    formas.push({ d: rect(x - 4, 38, 8, 3), relleno: "#E3D3B0" });
    formas.push({ d: `M${x} 38v-3`, trazo: "#3B2A1A", ancho: 0.9 });
    if (encendida) {
      formas.push({ d: circ(x, 31, 8), relleno: "#FFD36B", opacidad: 0.16 });
      formas.push({ d: circ(x, 31.5, 4.5), relleno: "#FFE08A", opacidad: 0.22 });
      formas.push({ d: llama(x, 36, 11), relleno: "#FF9F1C" });
      formas.push({ d: llama(x, 35.5, 6), relleno: "#FFF3B0" });
    }
  });
  return { ancho: 160, alto: 100, formas };
}

// Diwali: una fila de casas con 100 lámparas (las encendidas brillan). 200 × 80.
export function escenaLamparas(encendidas: number): Dibujo {
  const formas: FormaIlustracion[] = [];
  // Casas (siluetas).
  const casas = [
    [0, 30, 34],
    [34, 22, 30],
    [64, 34, 36],
    [100, 18, 34],
    [134, 28, 32],
    [166, 24, 34],
  ] as const;
  for (const [x, y, w] of casas) {
    formas.push({ d: `M${x} 80V${y + 8}l${w / 2} -8 ${w / 2} 8V80z`, relleno: "#2A0B3D" });
  }
  formas.push({ d: rect(0, 74, 200, 6), relleno: "#1A0726" });
  // 100 lámparas: 4 filas de 25.
  const apagadas: string[] = [];
  const brillo: string[] = [];
  const luz: string[] = [];
  for (let i = 0; i < META_LAMPARAS; i++) {
    const fila = Math.floor(i / 25);
    const col = i % 25;
    const x = 4.5 + col * 7.8;
    const y = 72 - fila * 9.5 - (col % 2) * 1.2;
    const base = `M${x - 2.6} ${y}c0.9 2 4.3 2 5.2 0z`;
    if (i < encendidas) {
      brillo.push(circ(x, y - 1.6, 3));
      luz.push(llama(x, y - 0.3, 3.4));
      apagadas.push(base);
    } else apagadas.push(base);
  }
  formas.push({ d: brillo.join(""), relleno: "#FFC53D", opacidad: 0.22 });
  formas.push({ d: apagadas.join(""), relleno: "#C2410C" });
  if (luz.length) formas.push({ d: luz.join(""), relleno: "#FFD36B" });
  return { ancho: 200, alto: 80, formas };
}
