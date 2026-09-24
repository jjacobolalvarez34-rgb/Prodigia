// Prodigia usa español neutro latinoamericano (tuteo: "tú" implícito,
// imperativo "haz/sigue/practica") en TODO texto visible — mensajes de
// error, lecciones, quiz, anuncios, copy de UI. Nunca voseo rioplatense
// ("hacé", "seguí", "tenés", "sos"). Esta regla ya existía (migración
// 0128_espanol_neutro.sql, scripts/normalizar-espanol*.mjs,
// scripts/detectar-voseo.mjs, scripts/analizar-voseo-funciones.mjs) pero
// solo se aplicaba a mano, sobre messages/es.json y las funciones SQL —
// nunca sobre el contenido de lecciones (techniques.pasos/quiz,
// sembrado por `insert into public.techniques`), que es donde más
// volumen de texto nuevo se agrega por mundo. Este módulo centraliza el
// detector para que un test (espanolNeutro.test.ts) lo corra sobre TODO
// texto visible del proyecto — messages/*.json y el contenido literal
// de cada migración — y quede imposible que voseo nuevo pase sin que
// falle la suite.

// Lista curada: mismo criterio que scripts/normalizar-espanol.mjs
// (imperativos con tilde final o monosílabo) + formas de presente en
// "-és"/"-ás"/"-ís" + "sos"/"vos". Con límites de palabra Unicode-aware
// para no confundir con sustantivos legítimos ("mamá", "sofá", "así",
// "quizá" NO están acá a propósito — no son voseo).
const IMPERATIVOS_VOSEO = [
  "hacé", "jugá", "probá", "elegí", "mirá", "intentá", "completá", "empezá",
  "arrancá", "agregá", "compartí", "guardá", "esperá", "sumá", "mandá",
  "andá", "vení", "decí", "poné", "sacá", "pasá", "meté", "pensá", "entrá",
  "buscá", "enviá", "tomá", "contá", "seguí", "volvé", "subí", "bajá",
  "tocá", "activá", "borrá", "creá", "descargá", "editá", "echá", "gastá",
  "golpeá", "ingresá", "liberá", "navegá", "observá", "optimizá",
  "realizá", "reiniciá", "seleccioná", "soltá", "usá", "validá", "regulá",
  "fijate", "dale", "animate", "quedate", "fijáte", "dejá",
  "respondé", "revisá", "reintentá", "corregí", "repetí", "recordá", "olvidá", "escribí",
  "leé", "abrí", "cerrá", "girá", "apretá", "soltá", "mové", "escogé",
  "empujá", "tirá", "aflojá", "aumentá", "disminuí", "multiplicá", "dividí",
  "restá", "sumale", "fijáte", "asegurate", "acordate", "avisá",
];

// Palabras reales del español (no voseo) que terminan igual que un
// presente voseo tónico + "s" — "más", "después" y compañía NO son
// verbos, son adverbios/preposiciones/adjetivos comunes. Sin esta
// lista de exclusión, el patrón genérico de abajo las marca como falso
// positivo en casi cualquier texto largo.
const NO_ES_VOSEO = new Set([
  "más", "además", "detrás", "atrás", "jamás", "quizás", "después", "través",
  "revés", "envés", "compás", "disfraz", "capaz", "eficaz", "audaz", "veraz",
  "inglés", "francés", "japonés", "cortés", "cordobés", "interés", "descortés",
  "adiós", "país", "raíz", "maíz", "baúl", "oís", "reís", "aquí", "allí", "así",
  "demás", "jamás",
  // "estar" es irregular: la 2da persona del presente es IDÉNTICA en
  // tuteo y voseo ("tú estás" = "vos estás") — nunca es un indicio de
  // voseo, a diferencia de "tenés"/"podés"/etc. (que sí difieren de
  // "tienes"/"puedes"). Mismo caso con "das"/"vas" (dar/ir), pero esas
  // no llevan tilde y ya no matchean el patrón de regex.
  "estás", "estas",
  // Futuro simple: "tú vencerás" = "vos vencerás" (idéntico en tuteo y
  // voseo). Aparece en el título de la técnica "Divide y vencerás".
  "vencerás",
  // Más futuros simples ("al terminar podrás...", "sabrás", "verás"): la forma
  // es idéntica en tuteo y voseo, así que no delata voseo. Los usan las lecciones
  // de Trigonometría ("Objetivo: al terminar podrás..."). Una lista cerrada, no
  // una regla por sufijo, porque "mirás" (voseo real) también termina en "-rás".
  "ramsés", "parís", "nicolás", "tomás", "andrés", "cartaginés", "genovés", "portugués", "escocés", "holandés", "irlandés", "danés", "finlandés", "vietnamés", "libanés", "sudanés", "senegalés", "congolés", "milanés", "podrás", "sabrás", "entenderás", "reconocerás", "conocerás", "verás", "usarás", "tendrás", "serás", "harás", "irás", "resolverás", "comprenderás", "aprenderás", "notarás", "obtendrás",
]);

const PATRON_VOSEO = new RegExp(
  String.raw`(?<![\p{L}\p{N}_])(?:` +
    // imperativos curados
    IMPERATIVOS_VOSEO.join("|") +
    // presente voseo: raíz + tilde en á/é/í + s ("tenés", "podés", "querés")
    String.raw`|[a-zñ]+[áéí]s` +
    // pronombre/verbo "sos" y "vos" (nunca parte de otra palabra)
    String.raw`|sos|vos` +
  String.raw`)(?![\p{L}\p{N}_])`,
  "giu"
);

export interface HallazgoVoseo {
  termino: string;
  contexto: string;
}

// Busca voseo en un texto libre; devuelve cada término encontrado con
// ~40 caracteres de contexto alrededor (para que el test lo reporte
// legible). Vacío = sin voseo.
export function detectarVoseo(texto: string): HallazgoVoseo[] {
  const hallazgos: HallazgoVoseo[] = [];
  let m: RegExpExecArray | null;
  PATRON_VOSEO.lastIndex = 0;
  while ((m = PATRON_VOSEO.exec(texto)) !== null) {
    if (NO_ES_VOSEO.has(m[0].toLowerCase())) continue;
    const desde = Math.max(0, m.index - 20);
    const hasta = Math.min(texto.length, m.index + m[0].length + 20);
    hallazgos.push({ termino: m[0], contexto: texto.slice(desde, hasta).replace(/\s+/g, " ").trim() });
  }
  return hallazgos;
}

// Recorre un objeto de mensajes i18n (JSON anidado) y devuelve cada
// hallazgo con su ruta de clave completa (ej. "Social.hook.errorX").
export function detectarVoseoEnMensajes(obj: unknown, ruta = ""): { ruta: string; hallazgo: HallazgoVoseo }[] {
  const salida: { ruta: string; hallazgo: HallazgoVoseo }[] = [];
  if (typeof obj === "string") {
    for (const h of detectarVoseo(obj)) salida.push({ ruta, hallazgo: h });
    return salida;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      salida.push(...detectarVoseoEnMensajes(v, ruta ? `${ruta}.${k}` : k));
    }
  }
  return salida;
}
