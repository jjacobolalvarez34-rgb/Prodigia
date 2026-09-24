import type { TecnicaHistoria } from "./tipos";
import { A, AH, N, P, Q, SIGLO, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, siglos, sincronia } from "./ayudas";

// Técnicas de la época «Edad Contemporánea» (gratis, atajos cortos con visual y quiz):
// cadenas de dos pasos de las revoluciones, sincronía de comienzos del siglo XIX, el
// cambio de siglo con años redondos, causa y consecuencia de la Primera Guerra,
// personajes de la Segunda Guerra y la posguerra, y cómo separar hechos de
// opiniones en la historia reciente. Solo hechos de amplio consenso, con fecha y
// protagonistas, sin juicios ni cifras discutidas. Nombres y años salen de la tabla.

const CADENA_1A = ["toma-de-la-bastilla", "rebelion-haitiana", "independencia-de-haiti"];
const CADENA_1B = ["napoleon-emperador", "invasion-napoleonica-de-espana", "independencias-hispanoamericanas"];
const ENSENA_1 = {
  hechos: ["toma-de-la-bastilla", "derechos-del-hombre", "rebelion-haitiana", "vacuna-de-jenner", "campana-de-egipto", "hallazgo-de-rosetta", "independencia-de-haiti", "napoleon-emperador", "invasion-napoleonica-de-espana", "independencias-hispanoamericanas"],
  personajes: ["napoleon", "toussaint-louverture", "jenner"],
};

const SINCRONIA_2 = [
  { region: "europa" as const, hechos: ["waterloo"] },
  { region: "africa" as const, hechos: ["shaka-reino-zulu"] },
  { region: "america" as const, hechos: ["cruce-de-los-andes"] },
  { region: "asia-oriental" as const, hechos: ["primera-guerra-del-opio"] },
];
const LINEA_2A = ["waterloo", "shaka-reino-zulu", "cruce-de-los-andes", "entrevista-de-guayaquil", "champollion-jeroglificos", "batalla-de-ayacucho"];
const LINEA_2B = ["primer-ferrocarril-publico", "abolicion-esclavitud-imperio-britanico", "primera-guerra-del-opio", "origen-de-las-especies", "guerra-de-secesion", "proclama-de-emancipacion"];
const ENSENA_2 = {
  hechos: [...LINEA_2A, ...LINEA_2B],
  personajes: ["shaka", "jose-de-san-martin", "simon-bolivar", "champollion", "marx", "darwin", "lincoln"],
};

const ENSENA_3 = {
  hechos: ["restauracion-meiji", "canal-de-suez", "telefono-de-bell", "conferencia-de-berlin", "voto-femenino-nueva-zelanda", "batalla-de-adua", "primer-vuelo-motorizado", "relatividad-especial", "republica-china"],
  personajes: ["bismarck", "emperador-meiji", "bell", "menelik-ii", "marie-curie", "sun-yat-sen", "tagore", "einstein"],
};

const CADENA_4A = ["asesinato-de-francisco-fernando", "primera-guerra-mundial", "revolucion-rusa", "fundacion-de-la-urss"];
const CADENA_4B = ["primera-guerra-mundial", "armisticio-de-1918", "tratado-de-versalles"];
const CADENA_4C = ["crisis-de-1929", "gran-depresion"];
const ENSENA_4 = {
  hechos: [...CADENA_4A, "armisticio-de-1918", "tratado-de-versalles", "penicilina", "crisis-de-1929", "gran-depresion", "marcha-de-la-sal"],
  personajes: ["lenin", "gandhi", "fleming"],
};

const LINEA_5A = ["invasion-de-polonia", "segunda-guerra-mundial", "pearl-harbor", "desembarco-de-normandia", "liberacion-de-auschwitz", "bombas-atomicas"];
const LINEA_5B = ["fin-de-la-segunda-guerra-mundial", "fundacion-de-la-onu", "comienzo-de-la-guerra-fria", "independencia-de-la-india", "declaracion-de-derechos-humanos", "republica-popular-china"];
const ENSENA_5 = {
  hechos: [...LINEA_5A, ...LINEA_5B],
  personajes: ["hitler", "churchill", "stalin", "franklin-roosevelt", "eleanor-roosevelt", "nehru", "mao-zedong"],
};

const LINEA_6A = ["independencia-de-ghana", "sputnik", "anio-de-africa", "muro-de-berlin", "vuelo-de-gagarin", "crisis-de-los-misiles", "marcha-sobre-washington", "llegada-a-la-luna"];
const LINEA_6B = ["viruela-erradicada", "caida-del-muro-de-berlin", "mandela-libre", "reunificacion-de-alemania", "disolucion-de-la-urss", "mandela-presidente", "pandemia-de-covid-19"];
const ENSENA_6 = {
  hechos: [...LINEA_6A, ...LINEA_6B],
  personajes: ["nkrumah", "kennedy", "martin-luther-king", "gagarin", "armstrong", "mandela", "gorbachov", "berners-lee"],
};

export const TECNICAS_HISTORIA_CONTEMPORANEA: TecnicaHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-tecnica-cadenas-de-las-revoluciones",
    grupo: "contemporanea",
    orden: 1,
    requierePro: false,
    nombre: "Cadenas de dos pasos: de la Revolución francesa a Haití y a Hispanoamérica",
    descripcion: "Une con dos cadenas los hechos de 1789 a 1810: las revoluciones, Napoleón y las independencias.",
    conceptos: { introduce: [], usa: ["cadenas-causales"], repasa: ["cadenas-causales"] },
    ensena: ENSENA_1,
    pasos: [
      "Recuerda: una cadena de dos pasos une tres hechos, A provoca B y B provoca C. Ante una pregunta que une dos hechos lejanos, busca el hecho intermedio que hace de puente.",
      `Cadena 1: ${Q("toma-de-la-bastilla")} (${A("toma-de-la-bastilla")}), comienzo de la Revolución francesa, influyó en la ${Q("rebelion-haitiana")} (${A("rebelion-haitiana")}), que terminó en la ${Q("independencia-de-haiti")} (${A("independencia-de-haiti")}).`,
      `Cadena 2: Napoleón se coronó emperador (${A("napoleon-emperador")}); su invasión de España (${A("invasion-napoleonica-de-espana")}) debilitó el poder español; y en ${AH("independencias-hispanoamericanas")} comenzaron las revoluciones de independencia en Hispanoamérica.`,
      `Otros hechos del período: los Derechos del Hombre (${A("derechos-del-hombre")}), la vacuna de Jenner (${A("vacuna-de-jenner")}) y la campaña de Napoleón en Egipto (${A("campana-de-egipto")}), que trajo el hallazgo de la piedra de Rosetta (${A("hallazgo-de-rosetta")}).`,
    ],
    visuales: [
      causas(1, "De la Revolución francesa a Haití", CADENA_1A),
      causas(2, "De Napoleón a las independencias hispanoamericanas", CADENA_1B),
      linea(3, "Diez hechos de 1789 a 1810", ENSENA_1.hechos),
      fichas(3, "Tres protagonistas", ENSENA_1.personajes),
    ],
    quiz: [
      pregConsecuencia("toma-de-la-bastilla", "rebelion-haitiana", ["caida-de-constantinopla", "llegada-de-colon", "independencia-de-estados-unidos"]),
      pregConsecuencia("napoleon-emperador", "invasion-napoleonica-de-espana", ["caida-de-constantinopla", "llegada-de-colon", "toma-de-la-bastilla"]),
      pregCausa("independencias-hispanoamericanas", "invasion-napoleonica-de-espana", ["primera-guerra-mundial", "muro-de-berlin", "llegada-a-la-luna"]),
      pregQuien("napoleon", ["toussaint-louverture", "jenner", "washington"]),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-tecnica-sincronia-siglo-xix",
    grupo: "contemporanea",
    orden: 2,
    requierePro: false,
    nombre: "Cuatro continentes a la vez: 1815 y 1839",
    descripcion: "Aplica la sincronía a la primera mitad del siglo XIX: Europa, África, América y Asia oriental.",
    conceptos: { introduce: [], usa: ["sincronia"], repasa: ["sincronia"] },
    ensena: ENSENA_2,
    pasos: [
      "Recuerda: la sincronía es comparar lo que ocurría a la vez en regiones distintas sobre un mismo eje de tiempo.",
      `Ejemplo: en Europa terminaron las guerras napoleónicas en ${Q("waterloo")} (${A("waterloo")}); casi a la vez, en África austral Shaka fundaba el reino zulú (${AH("shaka-reino-zulu")}), en América del Sur San Martín cruzaba los Andes (${A("cruce-de-los-andes")}) y, unos veinte años después, en Asia oriental comenzaba la primera guerra del Opio (${A("primera-guerra-del-opio")}).`,
      "Las dos líneas de abajo agregan los hechos de las décadas siguientes, hasta la emancipación de esclavizados en Estados Unidos.",
      `Siete protagonistas: ${["shaka", "jose-de-san-martin", "simon-bolivar", "champollion", "marx", "darwin", "lincoln"].map(P).join(", ")}.`,
    ],
    visuales: [
      sincronia(1, `De ${A("waterloo")} a ${A("primera-guerra-del-opio")}, cuatro regiones`, SINCRONIA_2),
      linea(2, "De 1815 a 1824", LINEA_2A),
      linea(2, "De 1830 a 1863", LINEA_2B),
      fichas(3, "Siete protagonistas", ENSENA_2.personajes),
    ],
    quiz: [
      pregPrimero("waterloo", "primera-guerra-del-opio"),
      pregPrimero("cruce-de-los-andes", "guerra-de-secesion"),
      pregSiglo("origen-de-las-especies"),
      pregQuien("lincoln", ["darwin", "marx", "simon-bolivar"]),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-tecnica-cambio-de-siglo",
    grupo: "contemporanea",
    orden: 3,
    requierePro: false,
    nombre: "El cambio de siglo: los años redondos cierran el siglo",
    descripcion: "Practica el año a siglo con años redondos como 1900 y 2000, y ubica los hechos entre 1868 y 1912.",
    conceptos: { introduce: [], usa: ["siglos"], repasa: ["siglos"] },
    ensena: ENSENA_3,
    pasos: [
      "Recuerda: el siglo n va del año (n − 1) · 100 + 1 al año n · 100. Un año redondo cierra el siglo; no lo empieza.",
      `Por eso ${Q("batalla-de-adua")} (${A("batalla-de-adua")}) es del ${SIGLO(1896)}, mientras que ${Q("primer-vuelo-motorizado")} (${A("primer-vuelo-motorizado")}) ya es del ${SIGLO(1903)}. Y el año 1900 es todavía del siglo XIX y el 2000 del XX.`,
      `El cambio de siglo del XIX al XX reúne hechos de todo el mundo: la ${Q("restauracion-meiji")} en Japón (${A("restauracion-meiji")}), el canal de Suez (${A("canal-de-suez")}), el teléfono de Bell (${A("telefono-de-bell")}), la Conferencia de Berlín (${A("conferencia-de-berlin")}), el voto femenino en Nueva Zelanda (${A("voto-femenino-nueva-zelanda")}), la relatividad de Einstein (${A("relatividad-especial")}) y la República china (${A("republica-china")}).`,
      `Ocho protagonistas: ${["bismarck", "emperador-meiji", "bell", "menelik-ii", "marie-curie", "sun-yat-sen", "tagore", "einstein"].map(P).join(", ")}.`,
    ],
    visuales: [
      siglos(1, "Años redondos y cambio de siglo", [1900, 2000, 2001, "batalla-de-adua", "primer-vuelo-motorizado"]),
      linea(2, "Nueve hechos de 1868 a 1912", ENSENA_3.hechos),
      fichas(3, "Ocho protagonistas", ENSENA_3.personajes),
    ],
    quiz: [
      pregSiglo("batalla-de-adua"),
      pregSiglo("primer-vuelo-motorizado"),
      preg("¿A qué siglo pertenece el año 2000?", "Siglo XX", ["Siglo XXI", "Siglo XIX", "Siglo XXII"], "El año 2000 cierra el siglo XX; el siglo XXI empezó en el año 2001."),
      pregPrimero("telefono-de-bell", "primer-vuelo-motorizado"),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-tecnica-causas-de-la-primera-guerra",
    grupo: "contemporanea",
    orden: 4,
    requierePro: false,
    nombre: "Causas y consecuencias: la Primera Guerra Mundial y la crisis de 1929",
    descripcion: "Tres cadenas cortas de las primeras décadas del siglo XX: la guerra y la Revolución rusa, la guerra y Versalles, y la crisis de 1929.",
    conceptos: { introduce: [], usa: ["causa-y-consecuencia"], repasa: ["causa-y-consecuencia"] },
    ensena: ENSENA_4,
    pasos: [
      "Recuerda: una consecuencia nunca es anterior a su causa. Para comprobar una cadena, léela hacia atrás con «porque» y hacia delante con «entonces».",
      `Cadena 1: ${Q("asesinato-de-francisco-fernando")} (${A("asesinato-de-francisco-fernando")}) fue el detonante de la ${Q("primera-guerra-mundial")} (${A("primera-guerra-mundial")}); durante la guerra tuvo lugar la ${Q("revolucion-rusa")} (${A("revolucion-rusa")}), de la que surgió la ${Q("fundacion-de-la-urss")} (${A("fundacion-de-la-urss")}).`,
      `Cadena 2: la guerra terminó con el armisticio (${A("armisticio-de-1918")}) y las potencias vencedoras firmaron el Tratado de Versalles (${A("tratado-de-versalles")}). Cadena 3: la crisis bursátil de ${A("crisis-de-1929")} en Nueva York fue seguida por la Gran Depresión, una crisis económica mundial.`,
      `Otros hechos de esas décadas: el descubrimiento de la penicilina (${A("penicilina")}) y la Marcha de la Sal de Gandhi (${A("marcha-de-la-sal")}). Protagonistas: ${["lenin", "gandhi", "fleming"].map(P).join(", ")}.`,
    ],
    visuales: [
      causas(1, "Del asesinato de Sarajevo a la URSS", CADENA_4A),
      causas(2, "De la guerra a Versalles", CADENA_4B),
      causas(2, "De la crisis a la Depresión", CADENA_4C),
      linea(3, "Diez hechos de 1914 a 1930", ["asesinato-de-francisco-fernando", "primera-guerra-mundial", "revolucion-rusa", "armisticio-de-1918", "tratado-de-versalles", "fundacion-de-la-urss", "penicilina", "crisis-de-1929", "gran-depresion", "marcha-de-la-sal"]),
      fichas(3, "Tres protagonistas", ENSENA_4.personajes),
    ],
    quiz: [
      pregConsecuencia("asesinato-de-francisco-fernando", "primera-guerra-mundial", ["toma-de-la-bastilla", "waterloo", "restauracion-meiji"]),
      pregConsecuencia("primera-guerra-mundial", "revolucion-rusa", ["toma-de-la-bastilla", "waterloo", "restauracion-meiji"]),
      pregCausa("tratado-de-versalles", "armisticio-de-1918", ["segunda-guerra-mundial", "muro-de-berlin", "llegada-a-la-luna"]),
      pregCausa("gran-depresion", "crisis-de-1929", ["segunda-guerra-mundial", "muro-de-berlin", "llegada-a-la-luna"]),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-tecnica-personajes-de-la-segunda-guerra",
    grupo: "contemporanea",
    orden: 5,
    requierePro: false,
    nombre: "Personajes por rol: la Segunda Guerra Mundial y la posguerra",
    descripcion: "Reconoce a los protagonistas de 1939 a 1949 por su rol, su país y un hecho asociado, sin juicios.",
    conceptos: { introduce: [], usa: ["personajes-por-rol"], repasa: ["personajes-por-rol"] },
    ensena: ENSENA_5,
    pasos: [
      "Recuerda: para no confundir personajes, guarda su rol, su época y un hecho asociado. En la historia reciente conviene registrar solo datos verificables, sin juicios.",
      `Ejemplos: ${P("churchill")} fue primer ministro del Reino Unido durante la mayor parte de la guerra; ${P("franklin-roosevelt")} era presidente de Estados Unidos cuando entró en la guerra (${A("pearl-harbor")}); ${P("stalin")} gobernaba la Unión Soviética; ${P("hitler")} era canciller de Alemania cuando comenzó la guerra (${A("invasion-de-polonia")}).`,
      `Tras la guerra (${A("fin-de-la-segunda-guerra-mundial")}) surgieron nuevos protagonistas: ${P("eleanor-roosevelt")}, que presidió el comité que redactó la Declaración Universal de Derechos Humanos (${A("declaracion-de-derechos-humanos")}); ${P("nehru")}, primer jefe de gobierno de la India independiente (${A("independencia-de-la-india")}); y ${P("mao-zedong")}, que proclamó la República Popular China (${A("republica-popular-china")}).`,
      "Las dos líneas de abajo ordenan los doce hechos de la guerra y de la posguerra inmediata.",
    ],
    visuales: [fichas(2, "Siete protagonistas", ENSENA_5.personajes), linea(3, "De 1939 a 1945", LINEA_5A), linea(3, "De 1945 a 1949", LINEA_5B)],
    quiz: [
      pregQuien("churchill", ["franklin-roosevelt", "stalin", "nehru"]),
      pregQuien("eleanor-roosevelt", ["franklin-roosevelt", "churchill", "marie-curie"]),
      pregPrimero("pearl-harbor", "declaracion-de-derechos-humanos"),
      pregPrimero("fundacion-de-la-onu", "independencia-de-la-india"),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "historia-tecnica-hechos-y-opiniones",
    grupo: "contemporanea",
    orden: 6,
    requierePro: false,
    nombre: "Hechos y opiniones: cómo estudiar la historia reciente",
    descripcion: "Separa un hecho (con fecha y protagonistas) de un juicio o una interpretación, y ubica los hechos de 1957 a 2020.",
    conceptos: { introduce: ["hechos-y-opiniones"], usa: [] },
    ensena: ENSENA_6,
    pasos: [
      "Un hecho tiene fecha, lugar y protagonistas y se puede comprobar. Una opinión o una interpretación dice si algo estuvo bien o mal, o por qué ocurrió «realmente»; los historiadores la discuten y puede cambiar.",
      `Ejemplos: «${N("llegada-a-la-luna")} ocurrió en ${A("llegada-a-la-luna")}» es un hecho. «Fue el mayor logro de la humanidad» es una opinión. «${N("caida-del-muro-de-berlin")} ocurrió en ${A("caida-del-muro-de-berlin")}» es un hecho.`,
      "Cuanto más reciente es un período, más cerca están las opiniones de los lectores. Por eso este curso enseña de la historia reciente solo lo de amplio consenso: qué pasó, cuándo y quiénes intervinieron. Las cifras discutidas y los juicios quedan afuera.",
      "Aplica la técnica a los hechos de 1957 a 2020: las dos líneas de abajo tienen solo hechos y la ficha de ocho protagonistas, sin juicios.",
    ],
    visuales: [linea(3, "De 1957 a 1969", LINEA_6A), linea(3, "De 1980 a 2020", LINEA_6B), fichas(3, "Ocho protagonistas", ENSENA_6.personajes)],
    quiz: [
      preg(
        "¿Cuál de estas afirmaciones es un hecho?",
        `${N("llegada-a-la-luna")} ocurrió en ${A("llegada-a-la-luna")}`,
        ["La llegada a la Luna fue el mayor logro de la humanidad", "La llegada a la Luna fue una pérdida de dinero", "La llegada a la Luna fue lo mejor que pasó en el siglo XX"],
        "Un hecho se puede comprobar con una fecha y protagonistas; las otras opciones son opiniones o juicios."
      ),
      preg(
        "Según esta técnica, ¿qué se enseña de la historia reciente?",
        "Lo de amplio consenso: qué pasó, cuándo y quiénes intervinieron",
        ["Las opiniones de cada autor", "Solo las cifras discutidas", "Únicamente lo que ocurrió hace más de mil años"],
        "En la historia reciente conviene quedarse con fechas y protagonistas verificables y evitar juicios."
      ),
      pregPrimero("sputnik", "caida-del-muro-de-berlin"),
      pregQuien("mandela", ["kennedy", "nkrumah", "gorbachov"]),
    ],
  },
];

void pregEpoca;
