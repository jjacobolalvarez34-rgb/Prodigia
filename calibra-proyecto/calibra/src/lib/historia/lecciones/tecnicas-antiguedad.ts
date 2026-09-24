import type { TecnicaHistoria } from "./tipos";
import { A, DIST, N, P, PV, Q, SP, SIGLO, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregSiglo, siglos, sincronia } from "./ayudas";

// Técnicas de la época «Antigüedad» (gratis, atajos cortos con visual y quiz): agrupar
// por siglo, los años a. C., la sincronía entre civilizaciones, reconocer personajes
// por su rol y las cadenas de dos pasos. Los nombres y los años salen de la tabla
// canónica (src/lib/historia/hechos.ts y personajes.ts) por id.

const ENSENA_1 = {
  hechos: ["escritura-cuneiforme", "unificacion-de-egipto", "ciudades-del-indo", "piramide-de-keops", "codigo-de-hammurabi", "dinastia-shang", "olmecas", "fundacion-de-cartago"],
  personajes: ["hammurabi", "ramses-ii"],
};
// Además de los ocho hechos de la línea, la figura de siglos usa cuatro ejemplos más.
const ENSENA_1_SIGLOS = ["erupcion-del-vesubio", "batalla-de-maraton", "asesinato-de-julio-cesar"];

const ENSENA_2 = {
  hechos: ["primeros-juegos-olimpicos", "fundacion-de-roma", "iliada-y-odisea", "republica-romana", "ciro-conquista-babilonia", "ensenanzas-de-buda", "ensenanzas-de-confucio", "batalla-de-maraton"],
  personajes: ["homero", "ciro-ii", "buda", "confucio"],
};

const SINCRONIA_3 = [
  { region: "europa" as const, hechos: ["muerte-de-alejandro", "elementos-de-euclides"] },
  { region: "asia-sur" as const, hechos: ["imperio-maurya", "guerra-de-kalinga"] },
  { region: "asia-oriental" as const, hechos: ["unificacion-de-china"] },
];
const ENSENA_3 = {
  hechos: ["batalla-de-las-termopilas", "construccion-del-partenon", "muerte-de-socrates", "inicio-conquista-persa", "muerte-de-alejandro", "elementos-de-euclides", "imperio-maurya", "guerra-de-kalinga", "unificacion-de-china"],
  personajes: ["leonidas", "jerjes-i", "pericles", "socrates", "platon", "aristoteles", "alejandro-magno", "euclides"],
};

const ENSENA_4 = {
  hechos: ["unificacion-de-china", "anibal-cruza-los-alpes", "dinastia-han", "destruccion-de-cartago", "cesar-cruza-el-rubicon", "asesinato-de-julio-cesar", "batalla-de-accio", "muerte-de-cleopatra"],
  personajes: ["qin-shi-huang", "anibal", "espartaco", "julio-cesar", "cleopatra", "augusto", "asoka", "chandragupta"],
};

const CADENA_5 = ["asesinato-de-julio-cesar", "batalla-de-accio", "comienzo-del-imperio-romano"];
const LINEA_5 = ["comienzo-del-imperio-romano", "erupcion-del-vesubio", "papel-de-cai-lun", "imperio-gupta", "periodo-clasico-maya", "edicto-de-milan", "fundacion-de-constantinopla", "ezana-de-aksum", "cristianismo-religion-oficial", "division-del-imperio-romano"];
const ENSENA_5 = {
  hechos: ["asesinato-de-julio-cesar", "batalla-de-accio", "comienzo-del-imperio-romano", "erupcion-del-vesubio", "papel-de-cai-lun", "imperio-gupta", "periodo-clasico-maya", "edicto-de-milan", "fundacion-de-constantinopla", "ezana-de-aksum", "cristianismo-religion-oficial", "division-del-imperio-romano"],
  personajes: ["cai-lun", "constantino"],
};

export const TECNICAS_HISTORIA_ANTIGUEDAD: TecnicaHistoria[] = [
  // ---------------------------------------------------------------- 1 (existente: 0109 + quiz de 0176)
  {
    slug: "historia-bloques-por-siglo",
    grupo: "antiguedad",
    orden: 1,
    requierePro: false,
    existente: true,
    nombre: "Agrupar por siglo, no por fecha suelta",
    descripcion: "Pasa de un año a su siglo con una regla y agrupa los hechos en bloques de tiempo: es mucho más fácil de repasar que una lista de fechas sueltas.",
    conceptos: { introduce: ["siglos", "agrupar-por-bloques"], usa: [] },
    ensena: { hechos: [...ENSENA_1.hechos, ...ENSENA_1_SIGLOS], personajes: ENSENA_1.personajes },
    pasos: [
      "Antes de aprender el año exacto de un hecho, ubica en qué siglo ocurrió. Un siglo son cien años, y agrupar los hechos por siglos convierte una lista de fechas sueltas en unos pocos bloques fáciles de repasar.",
      `Regla para los años d. C.: el siglo n va del año (n − 1) · 100 + 1 al año n · 100. Por eso el año 1900 es del siglo XIX y el 1901, del XX. Ejemplo: ${Q("erupcion-del-vesubio")} ocurrió en ${A("erupcion-del-vesubio")}, que es del ${SIGLO(79)}.`,
      `En los años a. C. se cuenta hacia atrás: el siglo I a. C. va del año 100 a. C. al año 1 a. C. Así, ${Q("asesinato-de-julio-cesar")} (${A("asesinato-de-julio-cesar")}) es del ${SIGLO(-44)} y ${Q("batalla-de-maraton")} (${A("batalla-de-maraton")}), del ${SIGLO(-490)}.`,
      `Aplícalo a los primeros grandes hitos de la Antigüedad. El primer bloque llega hasta hacia 2500 a. C. y reúne la escritura, la unificación de Egipto, la Gran Pirámide y las ciudades del Indo; el segundo, la época de Hammurabi, la dinastía Shang y los olmecas; y solo después llega Cartago, ya en el ${SIGLO(-814)}.`,
      `Conoce a dos protagonistas de esos bloques: ${P("hammurabi")} (${SP("hammurabi")}) y ${P("ramses-ii")} (${SP("ramses-ii")}). Sus fechas de vida son aproximadas.`,
    ],
    visuales: [
      siglos(1, "De año a siglo", ["erupcion-del-vesubio", 1900, "batalla-de-maraton", "asesinato-de-julio-cesar"]),
      linea(3, "Los primeros grandes hitos, en bloques de siglos", ENSENA_1.hechos),
      fichas(4, "Dos protagonistas de los primeros bloques", ENSENA_1.personajes),
    ],
    quiz: [
      pregSiglo("batalla-de-maraton"),
      pregSiglo("asesinato-de-julio-cesar"),
      preg(
        "¿A qué siglo pertenece el año 1900?",
        "Siglo XIX",
        ["Siglo XX", "Siglo XVIII", "Siglo XXI"],
        "El siglo XIX va del año 1801 al año 1900: los años redondos cierran el siglo, no lo empiezan."
      ),
      preg(
        "Según esta técnica, ¿qué conviene ubicar antes que el año exacto de un hecho?",
        "El siglo o el bloque de tiempo al que pertenece",
        ["El nombre de la persona que lo escribió", "La ciudad donde se estudia", "El día y el mes"],
        "Ubicar primero el siglo (el bloque) y después afinar el año dentro de él es más fácil que memorizar una lista plana de fechas."
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-tecnica-anios-antes-de-cristo",
    grupo: "antiguedad",
    orden: 2,
    requierePro: false,
    nombre: "Los años a. C. se cuentan hacia atrás",
    descripcion: "Cómo ordenar años antes de Cristo sin equivocarte: cuanto mayor es el número, más antiguo es el hecho.",
    conceptos: { introduce: ["anio-antes-de-cristo"], usa: [] },
    ensena: ENSENA_2,
    pasos: [
      `Los años antes de Cristo (a. C.) se cuentan hacia atrás: cuanto mayor es el número, más antiguo es el hecho. Por eso ${Q("primeros-juegos-olimpicos")} (${A("primeros-juegos-olimpicos")}) es anterior a ${Q("batalla-de-maraton")} (${A("batalla-de-maraton")}).`,
      `No existe el año 0: después del 1 a. C. viene el 1 d. C. Por eso entre ${Q("comienzo-del-imperio-romano")} (${A("comienzo-del-imperio-romano")}) y ${Q("erupcion-del-vesubio")} (${A("erupcion-del-vesubio")}) pasaron ${DIST("comienzo-del-imperio-romano", "erupcion-del-vesubio")} años y no ${DIST("comienzo-del-imperio-romano", "erupcion-del-vesubio") + 1} años.`,
      "Para ordenar varios años a. C., escríbelos de mayor a menor número. Aplícalo a estos ocho hechos: leídos de arriba abajo, sus números bajan porque los hechos son cada vez más recientes.",
      "Trampa habitual: un hecho a. C. siempre es anterior a uno d. C., aunque el número del segundo sea pequeño. Comprueba siempre la era antes de comparar los números.",
      `Cuatro protagonistas de esta línea: ${P("homero")} (${SP("homero")}), ${P("ciro-ii")} (${SP("ciro-ii")}), ${P("buda")} y ${P("confucio")}, que enseñaron ${A("ensenanzas-de-buda")} en la India y en China.`,
    ],
    visuales: [
      linea(2, "Ocho hechos a. C., del más antiguo al más reciente", ENSENA_2.hechos),
      fichas(4, "Cuatro protagonistas", ENSENA_2.personajes),
    ],
    quiz: [
      pregPrimero("primeros-juegos-olimpicos", "batalla-de-maraton"),
      pregPrimero("fundacion-de-roma", "republica-romana"),
      preg(
        "¿Cuántos años hay entre el 10 a. C. y el 10 d. C.?",
        "19 años",
        ["20 años", "18 años", "0 años"],
        "No existe el año 0: del 10 a. C. al 1 a. C. pasan 9 años, del 1 a. C. al 1 d. C. pasa 1 año y del 1 d. C. al 10 d. C. pasan 9 años; en total, 19."
      ),
      pregSiglo("primeros-juegos-olimpicos"),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-tecnica-sincronia",
    grupo: "antiguedad",
    orden: 3,
    requierePro: false,
    nombre: "¿Qué pasaba a la vez en otras partes?",
    descripcion: "Compara civilizaciones en el mismo período en vez de estudiarlas por separado: es la clave para no mezclar épocas.",
    conceptos: { introduce: ["sincronia"], usa: [] },
    ensena: ENSENA_3,
    pasos: [
      "La sincronía es lo que ocurre a la vez en lugares distintos. En vez de estudiar cada civilización por separado, pregúntate siempre: ¿cuándo fue esto?, ¿y qué pasaba mientras tanto en el resto del mundo?",
      `Ejemplo entre los siglos IV y III a. C.: mientras ${Q("muerte-de-alejandro")} (${A("muerte-de-alejandro")}) cerraba una etapa en el Mediterráneo, en la India se fundaba el Imperio maurya (${A("imperio-maurya")}) y, un siglo después, en China se unificaba el país (${A("unificacion-de-china")}).`,
      "La figura pone los hechos en carriles por región sobre un mismo eje de tiempo. Lee de izquierda a derecha y fíjate en qué carril ocurre cada hecho: ese es el truco para no confundir civilizaciones.",
      "Cuidado: que dos cosas ocurran a la vez no significa que una provocó la otra. La sincronía sirve para ubicar, no para explicar. Estos otros hechos completan el panorama de la época.",
      `Protagonistas del período: ${["leonidas", "jerjes-i", "pericles", "socrates", "platon", "aristoteles", "alejandro-magno", "euclides"].map(P).join(", ")}.`,
    ],
    visuales: [
      sincronia(1, "Mismo período, tres regiones", SINCRONIA_3),
      linea(3, "Ocho hechos de los siglos V a III a. C.", ["batalla-de-las-termopilas", "construccion-del-partenon", "muerte-de-socrates", "inicio-conquista-persa", "muerte-de-alejandro", "elementos-de-euclides", "imperio-maurya", "guerra-de-kalinga"]),
      fichas(4, "Protagonistas del período", ENSENA_3.personajes),
    ],
    quiz: [
      preg(
        "¿Qué es la sincronía?",
        "Comparar lo que ocurría a la vez en distintas regiones del mundo",
        ["Ordenar los hechos por su nombre", "Contar los años entre dos hechos", "Explicar la causa de un hecho"],
        "Sincronía significa «al mismo tiempo»: es comparar civilizaciones en un mismo período."
      ),
      pregPrimero("imperio-maurya", "unificacion-de-china"),
      preg(
        `¿Cuál de estos hechos ocurrió en otra región, pero en el mismo período que ${Q("imperio-maurya")}?`,
        N("muerte-de-alejandro"),
        [N("caida-de-roma-occidente"), N("llegada-de-colon"), N("piramide-de-keops")],
        `${N("imperio-maurya")} es de ${A("imperio-maurya")} y ${N("muerte-de-alejandro")}, de ${A("muerte-de-alejandro")}: casi coinciden. Los otros hechos ocurrieron siglos o milenios antes o después.`
      ),
      preg(
        "Si dos hechos ocurren a la vez en regiones distintas, ¿se puede afirmar que uno provocó el otro?",
        "No: la sincronía sirve para ubicar los hechos, no para explicarlos",
        ["Sí, siempre", "Sí, si los dos son de la misma época", "Solo si ocurrieron en el mismo mes"],
        "Para hablar de causa hace falta una relación explicada por los historiadores, no solo coincidencia en el tiempo."
      ),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-tecnica-personajes-por-rol",
    grupo: "antiguedad",
    orden: 4,
    requierePro: false,
    nombre: "Reconocer personajes por su rol y su época",
    descripcion: "Para no confundir a los protagonistas, fíjate en tres cosas: qué papel tuvieron, cuándo vivieron y con qué hecho se les asocia.",
    conceptos: { introduce: ["personajes-por-rol", "personajes-y-hechos"], usa: [] },
    ensena: ENSENA_4,
    pasos: [
      "Los nombres se confunden cuando se estudian sueltos. Para cada personaje guarda tres datos: su rol (gobernante, militar, científico...), su época y un hecho con el que se le asocia. Con eso casi nunca se mezclan.",
      `Ejemplo: ${P("julio-cesar")} fue un general y político romano asociado con ${Q("cesar-cruza-el-rubicon")} (${A("cesar-cruza-el-rubicon")}) y ${Q("asesinato-de-julio-cesar")} (${A("asesinato-de-julio-cesar")}). No fue emperador: el primero fue ${P("augusto")}, que inició el Imperio en ${A("comienzo-del-imperio-romano")}.`,
      "Otra ayuda: pregúntate si un personaje pudo estar vivo en un hecho. Aníbal no pudo conocer a Augusto: ocurrieron con más de un siglo de diferencia.",
      "Las fichas de abajo dan el rol, los años de vida, la época y los hechos de la tabla en los que figura cada personaje. Las fechas de nacimiento y muerte de algunos son aproximadas.",
      "Los ocho hechos de la línea de esta técnica son los que enmarcan a esos ocho personajes.",
    ],
    visuales: [
      fichas(3, "Ocho personajes, ocho roles", ENSENA_4.personajes),
      linea(4, "Los hechos que enmarcan a esos personajes", ENSENA_4.hechos),
    ],
    quiz: [
      preg(
        "¿Fue Julio César emperador romano?",
        "No: fue general y político; el primer emperador fue Augusto",
        ["Sí, fue el primer emperador", "Sí, fue el último emperador", "No: fue un rey de Egipto"],
        `${P("julio-cesar")} murió asesinado en ${A("asesinato-de-julio-cesar")}, antes de que empezara el Imperio (${A("comienzo-del-imperio-romano")}) con Augusto.`
      ),
      preg(
        "Según la técnica, ¿qué tres datos conviene guardar de cada personaje?",
        "Su rol, su época y un hecho con el que se le asocia",
        ["Su color favorito, su ciudad y su comida", "Su altura, su peso y su edad", "Solo su nombre completo"],
        "Rol, época y un hecho asociado permiten reconocerlo sin confundirlo con otro."
      ),
      preg(
        `¿Cuál de estos personajes pudo estar vivo en ${Q("batalla-de-accio")} (${A("batalla-de-accio")})?`,
        P("augusto"),
        [P("anibal"), P("alejandro-magno"), P("qin-shi-huang")],
        `${PV("augusto")} vivía en ${A("batalla-de-accio")} y participó en ella; los otros tres murieron siglos antes.`
      ),
      pregEpoca("dinastia-han"),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-tecnica-cadenas-causales",
    grupo: "antiguedad",
    orden: 5,
    requierePro: false,
    nombre: "Cadenas de dos pasos: del hecho A al hecho C",
    descripcion: "Para una consecuencia lejana, busca el hecho intermedio: A provoca B, y B provoca C.",
    conceptos: { introduce: ["cadenas-causales"], usa: [] },
    ensena: ENSENA_5,
    pasos: [
      "Una cadena de dos pasos une tres hechos: A provoca B y B provoca C. Cuando una pregunta une dos hechos lejanos, busca el hecho intermedio que hace de puente.",
      `Ejemplo romano: el asesinato de César (${A("asesinato-de-julio-cesar")}) desató una guerra civil; una de sus batallas decisivas fue ${Q("batalla-de-accio")} (${A("batalla-de-accio")}); y tras ella Augusto inició el Imperio (${A("comienzo-del-imperio-romano")}).`,
      `Otra relación de la época: el Edicto de Milán (${A("edicto-de-milan")}) permitió practicar el cristianismo en el Imperio, y en ${A("cristianismo-religion-oficial")} el cristianismo se declaró religión oficial.`,
      "Simplificación de nivel escolar: cada hecho tiene varias causas. Se elige la cadena más reconocida, pero conviene saber que hay más.",
      "Estos diez hechos completan la línea de tiempo desde el Imperio de Augusto hasta la división del Imperio romano, con lo que ocurría a la vez en otras regiones.",
    ],
    visuales: [
      causas(1, "De los idus de marzo al Imperio", CADENA_5),
      linea(4, "Diez hechos del final de la Antigüedad", LINEA_5),
      fichas(4, "Dos protagonistas", ENSENA_5.personajes),
    ],
    quiz: [
      pregConsecuencia("batalla-de-accio", "comienzo-del-imperio-romano", ["escritura-cuneiforme", "batalla-de-maraton", "unificacion-de-china"]),
      pregCausa("comienzo-del-imperio-romano", "batalla-de-accio", ["erupcion-del-vesubio", "edicto-de-milan", "caida-de-roma-occidente"]),
      preg(
        "En la cadena «asesinato de César → Accio → Imperio», ¿cuál es el hecho intermedio?",
        N("batalla-de-accio"),
        [N("erupcion-del-vesubio"), N("edicto-de-milan"), N("fundacion-de-roma")],
        `La cadena es ${N("asesinato-de-julio-cesar")} (${A("asesinato-de-julio-cesar")}) → ${N("batalla-de-accio")} (${A("batalla-de-accio")}) → ${N("comienzo-del-imperio-romano")} (${A("comienzo-del-imperio-romano")}). Los otros hechos no están entre esos dos.`
      ),
      pregConsecuencia("edicto-de-milan", "cristianismo-religion-oficial", ["escritura-cuneiforme", "batalla-de-maraton", "erupcion-del-vesubio"]),
    ],
  },
];
