import type { TecnicaHistoria } from "./tipos";
import { A, AH, N, P, Q, SIGLO, causas, fichas, linea, preg, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, sincronia } from "./ayudas";

// Técnicas de la época «Edad Media» (gratis, atajos cortos con visual y quiz): la
// asociación memorable, las siglas para secuencias, la sincronía del siglo XIII, la
// cadena de causas del siglo XIV y los hechos que cierran la época. Los nombres y
// los años salen de la tabla canónica por id.

const ENSENA_1 = {
  hechos: ["caida-de-roma-occidente", "santa-sofia", "dinastia-tang", "hegira", "musulmanes-en-iberia", "batalla-de-poitiers", "fundacion-de-bagdad", "coronacion-de-carlomagno"],
  personajes: ["justiniano", "mahoma", "carlomagno", "al-juarismi"],
};

const ENSENA_2 = {
  hechos: ["casa-de-la-sabiduria", "dinastia-song", "leif-en-america", "cisma-de-oriente-y-occidente", "batalla-de-hastings", "primera-cruzada", "angkor-wat", "saladino-recupera-jerusalen"],
  personajes: ["murasaki-shikibu", "avicena", "leif-erikson", "guillermo-el-conquistador", "saladino"],
};

const SINCRONIA_3 = [
  { region: "europa" as const, hechos: ["carta-magna"] },
  { region: "africa" as const, hechos: ["imperio-de-mali"] },
  { region: "asia-central" as const, hechos: ["gengis-kan-proclamado"] },
  { region: "asia-oriental" as const, hechos: ["shogunato-de-kamakura", "dinastia-yuan"] },
];
const ENSENA_3 = {
  hechos: ["shogunato-de-kamakura", "gengis-kan-proclamado", "sultanato-de-delhi", "carta-magna", "imperio-de-mali", "dinastia-yuan", "marco-polo-en-china", "imperio-otomano"],
  personajes: ["minamoto-no-yoritomo", "gengis-kan", "kublai-kan", "sundiata-keita", "marco-polo"],
};

const ENSENA_4 = {
  hechos: ["gran-zimbabue", "maories-en-nueva-zelanda", "peregrinacion-de-mansa-musa", "fundacion-de-tenochtitlan", "viajes-de-ibn-battuta", "guerra-de-los-cien-anios", "peste-negra", "dinastia-ming", "imperio-de-mali", "dinastia-yuan"],
  personajes: ["mansa-musa", "ibn-battuta"],
};

const ENSENA_5 = {
  hechos: ["expediciones-de-zheng-he", "juana-de-arco-en-orleans", "expansion-inca", "machu-picchu", "caida-de-constantinopla", "biblia-de-gutenberg"],
  personajes: ["zheng-he", "juana-de-arco", "pachacutec", "mehmed-ii", "gutenberg"],
};

export const TECNICAS_HISTORIA_EDAD_MEDIA: TecnicaHistoria[] = [
  // ---------------------------------------------------------------- 1 (existente: 0109 + quiz de 0176)
  {
    slug: "historia-asociacion-memorable",
    grupo: "edad-media",
    orden: 1,
    requierePro: false,
    existente: true,
    nombre: "Asociación memorable",
    descripcion: "Conecta un hecho con una imagen o con un dato real y distintivo: se recuerda mejor que repetir una fecha en voz alta. Sin inventar nada.",
    conceptos: { introduce: ["nemotecnia-honesta"], usa: [] },
    ensena: ENSENA_1,
    pasos: [
      "Para cada hecho que te cueste recordar, busca una imagen o un detalle real y distintivo que lo conecte con el dato clave. Cuanto más rara o vívida sea la imagen, más se queda, y no hace falta que tenga sentido para otra persona.",
      `Ejemplo con ${P("carlomagno")}: su nombre viene del latín y significa «Carlos el Grande». Imagina una corona de Navidad, porque fue coronado emperador el día de Navidad de ${A("coronacion-de-carlomagno")}.`,
      `Ejemplo con la ${Q("hegira")}: «hégira» significa «migración». Imagina una caravana que sale de La Meca hacia Medina en ${A("hegira")}, el punto de partida del calendario islámico.`,
      "Regla de honestidad: la asociación ayuda a recordar, pero nunca inventes un dato para que rime o suene mejor. Si la imagen dice algo falso, mejor no usarla. Después, al día siguiente, revisa la asociación una vez más: ese segundo repaso la fija.",
      `Aplícalo a estos ocho hechos de los primeros siglos de la Edad Media y a cuatro protagonistas (${["justiniano", "mahoma", "carlomagno", "al-juarismi"].map(P).join(", ")}).`,
    ],
    visuales: [linea(4, "Ocho hechos de la Alta Edad Media", ENSENA_1.hechos), fichas(4, "Cuatro protagonistas", ENSENA_1.personajes)],
    quiz: [
      preg(
        "Según esta técnica, ¿qué hace que una asociación sea útil?",
        "Que conecte el hecho con una imagen o un dato real y distintivo",
        ["Que invente una fecha que rime", "Que sea larga y complicada", "Que copie la de otro hecho"],
        "La imagen o el dato debe ser real y llamativo; inventar datos para que rimen produce errores."
      ),
      pregPrimero("hegira", "coronacion-de-carlomagno"),
      preg(
        "¿Qué significa «hégira»?",
        "Migración",
        ["Batalla", "Coronación", "Peregrinación a La Meca"],
        `La ${N("hegira")} (${A("hegira")}) fue el traslado de Mahoma y sus seguidores de La Meca a Medina; la palabra significa «migración».`
      ),
      pregQuien("carlomagno", ["mahoma", "justiniano", "gengis-kan"]),
    ],
  },

  // ---------------------------------------------------------------- 2 (existente: 0109 + quiz de 0176)
  {
    slug: "historia-siglas-para-secuencias",
    grupo: "edad-media",
    orden: 2,
    requierePro: false,
    existente: true,
    nombre: "Siglas para recordar secuencias cortas",
    descripcion: "Cuando debas memorizar el orden de tres o cuatro hechos, arma una sigla con la primera letra de cada uno.",
    conceptos: { introduce: ["siglas-secuencias"], usa: [] },
    ensena: ENSENA_2,
    pasos: [
      "Toma la primera letra (o sílaba) de cada hecho, en el orden correcto. Arma con ellas una palabra o una frase corta; no hace falta que sea una palabra real, basta con que te resulte fácil de pronunciar.",
      `Ejemplo: ${Q("cisma-de-oriente-y-occidente")} (${A("cisma-de-oriente-y-occidente")}), ${Q("batalla-de-hastings")} (${A("batalla-de-hastings")}), ${Q("primera-cruzada")} (${A("primera-cruzada")}) y ${Q("saladino-recupera-jerusalen")} (${A("saladino-recupera-jerusalen")}). Las iniciales, en ese orden, son C-H-C-S: «chics».`,
      "La sigla te da el ORDEN, no el contexto. Combínala con la línea de tiempo mental: la sigla fija el orden y la línea te muestra dónde cae cada hecho.",
      "Aplícala a estos ocho hechos de los siglos IX a XII y a cinco protagonistas de la época. Dilo en voz alta un par de veces: el ritmo de la sigla ayuda más que mirar la lista.",
    ],
    visuales: [linea(2, "Ocho hechos de los siglos IX a XII", ENSENA_2.hechos), fichas(3, "Cinco protagonistas", ENSENA_2.personajes)],
    quiz: [
      preg(
        "¿Qué sigla resulta de ordenar «Cisma de Oriente y Occidente, Hastings, Primera Cruzada, Saladino»?",
        "C-H-C-S",
        ["H-C-S-C", "S-C-H-C", "C-C-H-S"],
        `Las iniciales en orden cronológico son C (${A("cisma-de-oriente-y-occidente")}), H (${A("batalla-de-hastings")}), C (${A("primera-cruzada")}) y S (${A("saladino-recupera-jerusalen")}).`
      ),
      pregPrimero("batalla-de-hastings", "primera-cruzada"),
      preg(
        "¿Qué conviene combinar con la sigla, según la técnica?",
        "La línea de tiempo mental: la sigla da el orden y la línea da el contexto",
        ["Un mapa de la ciudad", "La lista alfabética de los nombres", "Una fecha inventada"],
        "La sigla sirve para recordar el orden; la línea de tiempo muestra cuándo y dónde ocurrió cada hecho."
      ),
      pregSiglo("batalla-de-hastings"),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-tecnica-sincronia-siglo-xiii",
    grupo: "edad-media",
    orden: 3,
    requierePro: false,
    nombre: "El siglo XIII: cuatro regiones a la vez",
    descripcion: "Aplica la sincronía al siglo XIII: qué pasaba a la vez en Europa, África, Asia central y Asia oriental.",
    conceptos: { introduce: [], usa: ["sincronia"], repasa: ["sincronia"] },
    ensena: ENSENA_3,
    pasos: [
      "Recuerda: la sincronía consiste en comparar lo que ocurría a la vez en regiones distintas, sobre un mismo eje de tiempo, en vez de estudiar cada civilización por separado.",
      `Ejemplo del siglo XIII: en Asia central ${Q("gengis-kan-proclamado")} (${A("gengis-kan-proclamado")}) dio origen al Imperio mongol; en Inglaterra se firmó la ${Q("carta-magna")} (${A("carta-magna")}); en África occidental se formó el ${Q("imperio-de-mali")} (${A("imperio-de-mali")}); y en China los mongoles fundaron la dinastía Yuan (${A("dinastia-yuan")}).`,
      "Lee el eje de izquierda a derecha y compara los carriles: un mismo siglo, cuatro mundos distintos. Así no confundes qué civilización estaba en qué momento.",
      `Los otros hechos del siglo, en la línea de abajo, y cinco protagonistas: ${["minamoto-no-yoritomo", "gengis-kan", "kublai-kan", "sundiata-keita", "marco-polo"].map(P).join(", ")}.`,
    ],
    visuales: [
      sincronia(1, `De ${A("shogunato-de-kamakura")} a ${A("dinastia-yuan")}, cuatro regiones`, SINCRONIA_3),
      linea(3, "Ocho hechos del siglo XIII (y de fines del XII)", ENSENA_3.hechos),
      fichas(3, "Cinco protagonistas", ENSENA_3.personajes),
    ],
    quiz: [
      preg(
        `¿Qué hecho ocurrió en otra región, pero en el mismo siglo que ${Q("carta-magna")}?`,
        N("imperio-de-mali"),
        [N("caida-de-roma-occidente"), N("llegada-de-colon"), N("dinastia-tang")],
        `${N("carta-magna")} es de ${A("carta-magna")}, ${SIGLO(1215)}; ${N("imperio-de-mali")} es de ${A("imperio-de-mali")}, del mismo siglo. Los otros hechos son de siglos muy distintos.`
      ),
      pregPrimero("gengis-kan-proclamado", "dinastia-yuan"),
      pregSiglo("dinastia-yuan"),
      pregQuien("kublai-kan", ["gengis-kan", "marco-polo", "saladino"]),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-tecnica-causa-y-efecto-siglo-xiv",
    grupo: "edad-media",
    orden: 4,
    requierePro: false,
    nombre: "Causa y efecto en el siglo XIV",
    descripcion: "Une con «porque» y «entonces» los hechos del siglo XIV: cómo un imperio lleva a otro y cómo un reino rico llega a ser famoso.",
    conceptos: { introduce: [], usa: ["causa-y-consecuencia"], repasa: ["causa-y-consecuencia"] },
    ensena: ENSENA_4,
    pasos: [
      "Recuerda: una consecuencia nunca es anterior a su causa. Para comprobar una cadena léela hacia atrás con «porque» y hacia delante con «entonces».",
      `Ejemplo 1: el ${Q("imperio-de-mali")} (${A("imperio-de-mali")}) se hizo rico con el comercio de oro; por eso su emperador Mansa Musa pudo hacer su famosa ${Q("peregrinacion-de-mansa-musa")} (${A("peregrinacion-de-mansa-musa")}).`,
      `Ejemplo 2: ${Q("dinastia-yuan")} (${A("dinastia-yuan")}), fundada por los mongoles en China, precedió a la ${Q("dinastia-ming")} (${A("dinastia-ming")}), que gobernó China tras la salida de los mongoles.`,
      "Los otros hechos del siglo (la peste negra, la guerra de los Cien Años, los viajes de Ibn Battuta, el Gran Zimbabue, los maoríes y Tenochtitlan) no se muestran aquí en una cadena; se estudian igual como hitos del siglo.",
    ],
    visuales: [
      causas(1, "Un reino rico y un viaje famoso", ["imperio-de-mali", "peregrinacion-de-mansa-musa"]),
      causas(2, "De los mongoles a los Ming", ["dinastia-yuan", "dinastia-ming"]),
      linea(3, "Ocho hechos del siglo XIV", ["gran-zimbabue", "maories-en-nueva-zelanda", "peregrinacion-de-mansa-musa", "fundacion-de-tenochtitlan", "viajes-de-ibn-battuta", "guerra-de-los-cien-anios", "peste-negra", "dinastia-ming"]),
      fichas(3, "Dos viajeros del siglo XIV", ENSENA_4.personajes),
    ],
    quiz: [
      pregConsecuencia("dinastia-yuan", "dinastia-ming", ["caida-de-roma-occidente", "hegira", "dinastia-tang"]),
      pregConsecuencia("imperio-de-mali", "peregrinacion-de-mansa-musa", ["dinastia-tang", "caida-de-roma-occidente", "hegira"]),
      pregPrimero("peste-negra", "dinastia-ming"),
      pregQuien("mansa-musa", ["sundiata-keita", "ibn-battuta", "saladino"]),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-tecnica-cierre-de-la-edad-media",
    grupo: "edad-media",
    orden: 5,
    requierePro: false,
    nombre: "Cómo se cierra la Edad Media: 1453 o 1492",
    descripcion: "Los hechos de los años finales de la Edad Media y las dos fechas que los libros proponen como frontera con la Edad Moderna.",
    conceptos: { introduce: [], usa: ["epocas-historicas"], repasa: ["epocas-historicas"] },
    ensena: ENSENA_5,
    pasos: [
      `Recuerda: las fronteras entre épocas son convenciones. Esta lección usa la de la escuela, ${A("llegada-de-colon")} (la llegada de Colón a América), pero otros libros cierran la Edad Media en ${A("caida-de-constantinopla")}, con la ${Q("caida-de-constantinopla")}.`,
      `Antes de esas fechas ocurrieron hechos que ya anuncian el mundo moderno: ${Q("expediciones-de-zheng-he")} (${A("expediciones-de-zheng-he")}), ${Q("juana-de-arco-en-orleans")} (${A("juana-de-arco-en-orleans")}) y ${Q("biblia-de-gutenberg")} (${A("biblia-de-gutenberg")}).`,
      `En América, ${Q("expansion-inca")} (${A("expansion-inca")}) y ${Q("machu-picchu")} (${A("machu-picchu")}) muestran que los Andes tenían un gran Estado sin ningún contacto con Europa.`,
      "Consejo: si un texto dice «fin de la Edad Media», comprueba qué frontera usa. Ambas fechas son válidas, pero no son la misma.",
    ],
    visuales: [linea(2, "Seis hechos del siglo XV", ENSENA_5.hechos), fichas(3, "Cinco protagonistas del siglo XV", ENSENA_5.personajes)],
    quiz: [
      preg(
        "¿Qué hecho proponen otros textos, en lugar de la llegada de Colón, como fin de la Edad Media?",
        N("caida-de-constantinopla"),
        [N("toma-de-la-bastilla"), N("caida-de-roma-occidente"), N("escritura-cuneiforme")],
        `Otros textos usan ${A("caida-de-constantinopla")}, la caída de Constantinopla, como fin de la Edad Media; la escuela usa ${A("llegada-de-colon")}.`
      ),
      pregPrimero("juana-de-arco-en-orleans", "caida-de-constantinopla"),
      pregQuien("juana-de-arco", ["zheng-he", "pachacutec", "gutenberg"]),
      pregEpoca("machu-picchu"),
    ],
  },
];

void AH;
