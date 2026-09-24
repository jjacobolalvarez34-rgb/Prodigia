import type { ClaseHistoria } from "./tipos";
import { A, N, P, PV, Q, SIGLO, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, siglos, sincronia, AH, AHc } from "./ayudas";

// Clases de la época «Antigüedad» (Pro). Cada Clase: objetivo, contexto (repaso de lo
// que usa de la época anterior), desarrollo con líneas de tiempo animadas,
// personajes clave, causas y consecuencias, conexiones, errores comunes y quiz de 4 a
// 6 preguntas. Todo nombre y todo año sale de la tabla canónica por id.

const C1 = {
  hechos: ["fin-de-la-glaciacion", "inicio-de-la-agricultura", "escritura-cuneiforme", "codigo-de-hammurabi", "unificacion-de-egipto", "piramide-de-keops"],
  personajes: ["hammurabi", "ramses-ii"],
};
const C2 = {
  hechos: ["ciudades-del-indo", "ensenanzas-de-buda", "imperio-maurya", "guerra-de-kalinga", "imperio-gupta"],
  personajes: ["buda", "chandragupta", "asoka"],
};
const C3 = {
  hechos: ["dinastia-shang", "ensenanzas-de-confucio", "unificacion-de-china", "dinastia-han", "papel-de-cai-lun"],
  personajes: ["confucio", "qin-shi-huang", "cai-lun"],
};
const C4_SINCRONIA = [
  { region: "europa" as const, hechos: ["batalla-de-maraton", "batalla-de-las-termopilas"] },
  { region: "oriente-proximo" as const, hechos: ["ciro-conquista-babilonia"] },
  { region: "asia-sur" as const, hechos: ["ensenanzas-de-buda"] },
  { region: "asia-oriental" as const, hechos: ["ensenanzas-de-confucio"] },
];
const C4 = {
  hechos: ["primeros-juegos-olimpicos", "iliada-y-odisea", "ciro-conquista-babilonia", "batalla-de-maraton", "batalla-de-las-termopilas", "construccion-del-partenon", "muerte-de-socrates", "ensenanzas-de-buda", "ensenanzas-de-confucio"],
  personajes: ["ciro-ii", "jerjes-i", "leonidas", "pericles", "homero", "socrates", "platon"],
};
const C5 = {
  hechos: ["inicio-conquista-persa", "muerte-de-alejandro", "elementos-de-euclides"],
  personajes: ["alejandro-magno", "aristoteles", "euclides"],
};
const C6 = {
  hechos: ["fundacion-de-roma", "republica-romana", "anibal-cruza-los-alpes", "destruccion-de-cartago", "cesar-cruza-el-rubicon", "asesinato-de-julio-cesar"],
  personajes: ["julio-cesar", "anibal", "espartaco"],
};
const C7 = {
  hechos: ["asesinato-de-julio-cesar", "batalla-de-accio", "muerte-de-cleopatra", "comienzo-del-imperio-romano", "erupcion-del-vesubio", "edicto-de-milan", "fundacion-de-constantinopla", "cristianismo-religion-oficial", "division-del-imperio-romano"],
  personajes: ["augusto", "cleopatra", "constantino"],
};
const C8 = {
  hechos: ["fundacion-de-cartago", "olmecas", "periodo-clasico-maya", "ezana-de-aksum"],
  personajes: [],
};

export const CLASES_HISTORIA_ANTIGUEDAD: ClaseHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-clase-03-mesopotamia-y-egipto",
    grupo: "antiguedad",
    orden: 1,
    requierePro: true,
    nombre: "Mesopotamia y Egipto: las primeras civilizaciones",
    descripcion: "Dos civilizaciones nacidas junto a grandes ríos: la escritura y las leyes de Mesopotamia, y los faraones y las pirámides de Egipto.",
    conceptos: {
      introduce: ["mesopotamia", "egipto-antiguo", "siglos", "anio-antes-de-cristo"],
      usa: ["epocas-historicas", "neolitico", "causa-y-consecuencia"],
      repasa: ["epocas-historicas", "neolitico", "causa-y-consecuencia"],
    },
    ensena: C1,
    pasos: [
      "Objetivo: al terminar podrás explicar qué tienen en común las primeras civilizaciones de Mesopotamia y Egipto y ubicar sus grandes hitos: la escritura, el Código de Hammurabi, la unificación de Egipto y la Gran Pirámide.",
      `Contexto: la Antigüedad empieza con la escritura, que la escuela sitúa ${AH("escritura-cuneiforme")}. Repaso de la Prehistoria: al terminar la última glaciación (${A("fin-de-la-glaciacion")}) apareció la agricultura (${A("inicio-de-la-agricultura")}); con alimento guardado crecieron las aldeas y, después, surgió la escritura. Esa cadena de causas y consecuencias termina justo acá.`,
      "Mesopotamia significa «entre ríos»: es la región entre el Tigris y el Éufrates, en el actual Irak. Allí, en Sumeria, hubo ciudades como Ur y Uruk y se desarrolló la escritura cuneiforme, hecha con signos en forma de cuña marcados con una caña sobre tablillas de arcilla.",
      `En Babilonia, el rey Hammurabi hizo grabar en una estela de piedra un conjunto de leyes: el Código de Hammurabi (${A("codigo-de-hammurabi")}). Es uno de los primeros códigos legales escritos que se conservan y regulaba asuntos como el comercio, la propiedad y la familia. Es del ${SIGLO(-1754)}.`,
      `Egipto nació a lo largo del río Nilo, cuyas crecidas anuales dejaban tierra fértil. ${AHc("unificacion-de-egipto")} se unieron el Alto y el Bajo Egipto bajo un solo faraón. Los faraones eran considerados figuras sagradas y gobernaban con ayuda de escribas y sacerdotes. La Gran Pirámide de Guiza (${A("piramide-de-keops")}) fue la tumba del faraón Keops y es del ${SIGLO(-2560)}.`,
      `Personajes clave: ${P("hammurabi")}, rey de Babilonia, y ${P("ramses-ii")}, faraón de Egipto durante más de sesenta años. Se los conoce por textos y monumentos, y algunas de sus fechas de vida son aproximadas.`,
      "Causas y consecuencias: la escritura permitió registrar cuentas, leyes y noticias. Por eso, mucho después de su invención, un rey pudo publicar leyes por escrito para todo su reino. La figura de abajo une la cadena desde la Prehistoria hasta el Código de Hammurabi.",
      "Conecta con: las lecciones de India y China, donde otras grandes civilizaciones también surgieron junto a ríos; con la lección de Grecia, que heredará ideas de Egipto y Mesopotamia; y con la Técnica «Los años a. C. se cuentan hacia atrás», que sirve para ordenar todas estas fechas.",
      "Errores comunes: (1) confundir Mesopotamia (Tigris y Éufrates, Asia) con Egipto (Nilo, África); (2) creer que Hammurabi inventó las leyes: ya existían leyes escritas antes, pero su código es de los más completos que se conservan; (3) leer «hacia 2560 a. C.» como un año exacto: es una estimación.",
    ],
    visuales: [
      siglos(3, "Siglos a. C.: se cuentan hacia atrás", ["codigo-de-hammurabi", "piramide-de-keops"]),
      linea(4, "Egipto y Mesopotamia en la línea del tiempo", ["escritura-cuneiforme", "unificacion-de-egipto", "piramide-de-keops", "codigo-de-hammurabi"]),
      fichas(5, "Hammurabi y Ramsés II", C1.personajes),
      causas(6, "De la glaciación a las leyes escritas", ["fin-de-la-glaciacion", "inicio-de-la-agricultura", "escritura-cuneiforme", "codigo-de-hammurabi"]),
    ],
    quiz: [
      pregSiglo("codigo-de-hammurabi"),
      pregPrimero("unificacion-de-egipto", "piramide-de-keops"),
      preg(
        "¿Qué significa «Mesopotamia»?",
        "«Entre ríos»: la región entre el Tigris y el Éufrates",
        ["«Tierra del Nilo»", "«Ciudad del rey»", "«Tierra de los faraones»"],
        "Mesopotamia viene del griego y significa «entre ríos». El Nilo es el río de Egipto."
      ),
      pregConsecuencia("escritura-cuneiforme", "codigo-de-hammurabi", ["uso-del-fuego", "pinturas-de-lascaux", "fin-de-la-glaciacion"]),
      preg(
        "¿Qué fue el Código de Hammurabi?",
        "Un conjunto de leyes escritas, grabado en una estela, del reino de Babilonia",
        ["Un poema épico de Grecia", "Un templo de Egipto", "Una tablilla de cuentas de la Prehistoria"],
        `Fue un conjunto de leyes de ${P("hammurabi")}, rey de Babilonia (${A("codigo-de-hammurabi")}); su estela es de las pruebas legales escritas más antiguas que se conservan.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-clase-04-india-antigua",
    grupo: "antiguedad",
    orden: 2,
    requierePro: true,
    nombre: "La India antigua: del valle del Indo a los Gupta",
    descripcion: "Las ciudades del Indo, el nacimiento del budismo y los imperios Maurya y Gupta.",
    conceptos: { introduce: ["india-antigua"], usa: ["epocas-historicas", "causa-y-consecuencia", "anio-antes-de-cristo"], repasa: [] },
    ensena: C2,
    pasos: [
      "Objetivo: al terminar podrás ubicar las grandes etapas de la India antigua: las ciudades del Indo, el nacimiento del budismo y los imperios Maurya y Gupta.",
      `Contexto: en la lección de Mesopotamia y Egipto viste que las primeras civilizaciones nacieron junto a ríos; la India tuvo la suya en el valle del río Indo. Y recuerda que los años a. C. se cuentan hacia atrás: ${A("ciudades-del-indo")} es más antiguo que ${A("imperio-maurya")}.`,
      `La civilización del Indo tuvo ciudades planificadas como Harappa y Mohenjo-Daro (${A("ciudades-del-indo")}), con calles ordenadas, casas de ladrillo y sistemas de drenaje. Su escritura todavía no se ha logrado descifrar, así que sabemos de ella solo por lo que dejó bajo tierra.`,
      `${AHc("ensenanzas-de-buda")}, Siddhartha Gautama, llamado Buda («el despierto»), enseñó en el norte de la India un camino para superar el sufrimiento; su enseñanza dio origen al budismo. Los especialistas discuten desde qué década vivió, por eso la fecha es aproximada.`,
      `Chandragupta fundó el Imperio maurya (${A("imperio-maurya")}), el primero que unió gran parte del subcontinente. Su nieto Aśoka, tras la guerra de Kalinga (${A("guerra-de-kalinga")}), abrazó el budismo y dejó edictos grabados en piedra y en pilares.`,
      `El Imperio gupta (${A("imperio-gupta")}) suele recordarse como una época de gran desarrollo de las artes, las matemáticas y las ciencias en el norte de la India.`,
      "Personajes clave: Buda, maestro espiritual; Chandragupta, fundador del Imperio maurya; y Aśoka, emperador que difundió el budismo. Las fechas de vida de los tres son aproximadas o discutidas.",
      `Causas y consecuencias: el Imperio maurya, formado por Chandragupta, dejó un reino grande que Aśoka gobernó; la guerra de Kalinga marcó su giro hacia el budismo y hacia una política de tolerancia declarada en sus edictos. Simplificación de nivel escolar: la relación entre esa guerra y su conversión se conoce sobre todo por sus propios edictos.`,
      "Conecta con: la lección de Alejandro Magno, que llegó al valle del Indo en el mismo siglo en que se formó el Imperio maurya; y con la lección de China, donde el budismo llegará más tarde por la Ruta de la Seda.",
      "Errores comunes: (1) creer que Buda fue un dios: fue un maestro que vivió como persona; (2) pensar que el budismo nació en China: nació en la India y se extendió luego a otras regiones; (3) confundir el Imperio maurya (a partir del siglo IV a. C.) con el gupta (a partir del siglo IV d. C.).",
    ],
    visuales: [
      linea(5, "De las ciudades del Indo al Imperio gupta", C2.hechos),
      fichas(6, "Buda, Chandragupta y Aśoka", C2.personajes),
      causas(7, "El Imperio maurya y su giro hacia el budismo", ["imperio-maurya", "guerra-de-kalinga"]),
    ],
    quiz: [
      pregPrimero("ensenanzas-de-buda", "imperio-maurya"),
      pregConsecuencia("imperio-maurya", "guerra-de-kalinga", ["ciudades-del-indo", "codigo-de-hammurabi", "piramide-de-keops"]),
      pregQuien("asoka", ["chandragupta", "buda", "qin-shi-huang"]),
      pregEpoca("imperio-gupta"),
      preg(
        "¿Dónde nació el budismo?",
        "En la India",
        ["En China", "En Egipto", "En Grecia"],
        "El budismo nació en el norte de la India a partir de las enseñanzas de Buda y luego se extendió a otras regiones de Asia."
      ),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-clase-05-china-antigua",
    grupo: "antiguedad",
    orden: 3,
    requierePro: true,
    nombre: "La China antigua: de los Shang a los Han",
    descripcion: "Los primeros textos, Confucio, el primer emperador y la dinastía Han, con la invención del papel.",
    conceptos: { introduce: ["china-antigua"], usa: ["anio-antes-de-cristo", "siglos"], repasa: [] },
    ensena: C3,
    pasos: [
      "Objetivo: al terminar podrás ubicar las grandes etapas de la China antigua: la dinastía Shang, Confucio, la unificación del país, la dinastía Han y el papel.",
      `Contexto: como Mesopotamia, Egipto y la India, China tuvo una gran civilización junto a un río, el río Amarillo. Y recuerda la regla de los siglos a. C.: ${A("unificacion-de-china")} pertenece al ${SIGLO(-221)}, que se cuenta hacia atrás.`,
      `Según la cronología tradicional, la dinastía Shang comenzó ${AH("dinastia-shang")}. De ella se conservan las inscripciones más antiguas de China: preguntas a los dioses escritas sobre huesos de animales y caparazones de tortuga, los «huesos oraculares».`,
      `Confucio enseñó ${AH("ensenanzas-de-confucio")}. Sus ideas sobre la conducta, el respeto a la familia y el buen gobierno formaron el confucianismo, que influyó en China durante muchos siglos.`,
      `Qin Shi Huang unificó los reinos chinos bajo un solo emperador en ${A("unificacion-de-china")}. Unificó la escritura, las monedas y las medidas, se le asocia con la unión de muros defensivos anteriores (origen de la Gran Muralla) y se hizo enterrar con un ejército de figuras de terracota.`,
      `La dinastía Han (${A("dinastia-han")}) gobernó durante más de cuatro siglos. Durante ella se consolidó la Ruta de la Seda, una red de caminos que unía China con el Mediterráneo, y el confucianismo se volvió la base de la formación de los funcionarios. ${AHc("papel-de-cai-lun")}, Cai Lun presentó a la corte el papel hecho con fibras vegetales; hoy se sabe que ya se usaba antes, pero él mejoró y difundió su fabricación.`,
      "Personajes clave: Confucio (filósofo), Qin Shi Huang (primer emperador) y Cai Lun (funcionario de la corte). Sus fechas de vida son aproximadas o poco precisas en el caso de Cai Lun.",
      "Causas y consecuencias: la unificación de Qin creó un Estado centralizado que los Han heredaron y consolidaron durante siglos. Simplificación de nivel escolar: entre ambas dinastías hubo guerras y cambios que aquí no se detallan.",
      "Conecta con: la India, donde nació el budismo que llegaría a China por la Ruta de la Seda; con Roma, el otro gran imperio de la época (a la vez que los Han); y con la Edad Media, cuando la dinastía Tang, y luego los mongoles, gobernarán China.",
      "Errores comunes: (1) tratar a China como una sola dinastía: hubo muchas; (2) creer que una sola persona construyó la Gran Muralla de una vez: se construyó y reconstruyó durante siglos; (3) creer que el papel lo inventó Cai Lun de la nada: mejoró y difundió una técnica que ya existía.",
    ],
    visuales: [
      linea(5, "De los Shang a la invención del papel", C3.hechos),
      fichas(6, "Confucio, Qin Shi Huang y Cai Lun", C3.personajes),
    ],
    quiz: [
      pregPrimero("dinastia-shang", "ensenanzas-de-confucio"),
      pregPrimero("unificacion-de-china", "dinastia-han"),
      pregQuien("qin-shi-huang", ["confucio", "julio-cesar", "alejandro-magno"]),
      pregSiglo("unificacion-de-china"),
      preg(
        "¿Qué era la Ruta de la Seda?",
        "Una red de caminos que unía China con el Mediterráneo",
        ["Un canal que cruzaba China", "Una muralla en la frontera del norte", "Un imperio de la India"],
        "La Ruta de la Seda permitió que circularan mercancías, religiones e ideas entre China y el Mediterráneo; se consolidó durante la dinastía Han."
      ),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-clase-06-grecia-y-persia",
    grupo: "antiguedad",
    orden: 4,
    requierePro: true,
    nombre: "Grecia y Persia: polis, guerras médicas y filosofía",
    descripcion: "Las ciudades-Estado griegas, el Imperio persa, las guerras entre ambos y el nacimiento de la filosofía.",
    conceptos: { introduce: ["grecia-clasica", "persia-antigua", "sincronia"], usa: ["anio-antes-de-cristo"], repasa: [] },
    ensena: C4,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo era la Grecia clásica, qué enfrentó a griegos y persas y por qué se recuerda a Atenas por su democracia y su filosofía.",
      `Contexto: como en todas las fechas a. C. de esta lección, cuanto mayor es el número, más antiguo es el hecho: ${A("primeros-juegos-olimpicos")} es anterior a ${A("batalla-de-maraton")}. Si vienes de las lecciones anteriores, recuerda que las civilizaciones de Mesopotamia y Egipto son mucho más antiguas que las de Grecia.`,
      `Persia era un imperio enorme. Ciro II el Grande lo fundó y conquistó Babilonia en ${A("ciro-conquista-babilonia")}, en uno de los mayores imperios de su tiempo.`,
      `Grecia, en cambio, no era un país unido sino muchas ciudades-Estado independientes (polis), como Atenas y Esparta. Compartían lengua, religión y competencias como los Juegos Olímpicos (${A("primeros-juegos-olimpicos")}, según la tradición), y sus poemas más antiguos son la Ilíada y la Odisea, atribuidos a Homero (${A("iliada-y-odisea")}); se discute quién fue y si existió una sola persona.`,
      `Los persas intentaron someter a las polis. Los atenienses vencieron en ${Q("batalla-de-maraton")} (${A("batalla-de-maraton")}). En ${Q("batalla-de-las-termopilas")} (${A("batalla-de-las-termopilas")}), un pequeño ejército griego, con el rey espartano Leónidas, resistió varios días al enorme ejército de Jerjes I antes de ser derrotado. Al final, los griegos ganaron la guerra.`,
      `Con Pericles, Atenas vivió su época de mayor esplendor: la democracia ateniense, en la que votaban los ciudadanos varones adultos (no las mujeres, ni los esclavizados, ni los extranjeros), y la construcción del Partenón (${A("construccion-del-partenon")}) en la Acrópolis.`,
      `En Atenas nació la filosofía como pregunta sobre la vida y el mundo. Sócrates enseñaba dialogando y no dejó nada escrito; fue juzgado y condenado a muerte (${A("muerte-de-socrates")}). Su discípulo Platón fundó la Academia.`,
      "Personajes clave: Ciro II y Jerjes I (Persia), Leónidas (Esparta), Pericles, Sócrates y Platón (Atenas) y Homero, el poeta. Las fechas de vida de varios son aproximadas.",
      "Causas y consecuencias: los intentos persas de dominar Grecia llevaron a las guerras médicas; la victoria griega dio a Atenas prestigio y poder, y ese poder permitió la época de Pericles, con su democracia y su arte. Simplificación de nivel escolar: no todas las polis apoyaron a Atenas ni todas se beneficiaron por igual.",
      "Conecta con: la India y China, donde en esos mismos siglos enseñaron Buda y Confucio; la figura de sincronía de abajo lo muestra. También con la siguiente lección, donde Alejandro Magno conquistará el imperio persa.",
      "Errores comunes: (1) confundir Atenas con Esparta: la primera destacó por su democracia y su cultura; la segunda, por su organización militar; (2) creer que la Grecia antigua era un país: eran muchas polis; (3) pensar que Sócrates escribió libros: lo conocemos sobre todo por Platón.",
    ],
    visuales: [
      linea(4, `Grecia y Persia, de ${A("primeros-juegos-olimpicos")} a ${A("muerte-de-socrates")}`, ["primeros-juegos-olimpicos", "iliada-y-odisea", "ciro-conquista-babilonia", "batalla-de-maraton", "batalla-de-las-termopilas", "construccion-del-partenon", "muerte-de-socrates"]),
      fichas(7, "Los protagonistas", C4.personajes),
      sincronia(9, `${AHc("ensenanzas-de-buda")}, cuatro regiones a la vez`, C4_SINCRONIA),
    ],
    quiz: [
      pregPrimero("batalla-de-maraton", "batalla-de-las-termopilas"),
      pregPrimero("primeros-juegos-olimpicos", "construccion-del-partenon"),
      pregQuien("leonidas", ["pericles", "ciro-ii", "platon"]),
      pregQuien("socrates", ["platon", "homero", "jerjes-i"]),
      pregSiglo("muerte-de-socrates"),
      preg(
        "¿Qué eran las polis?",
        "Ciudades-Estado independientes, como Atenas y Esparta",
        ["Provincias de un solo reino griego", "Los barcos de guerra persas", "Los templos de los Juegos Olímpicos"],
        "Grecia estaba formada por muchas ciudades-Estado independientes que compartían lengua y religión pero no un gobierno único."
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-clase-07-alejandro-y-el-helenismo",
    grupo: "antiguedad",
    orden: 5,
    requierePro: true,
    nombre: "Alejandro Magno y el mundo helenístico",
    descripcion: "La conquista del Imperio persa, la mezcla de culturas del helenismo y la ciencia de Alejandría.",
    conceptos: { introduce: ["helenismo", "personajes-por-rol"], usa: ["grecia-clasica", "persia-antigua"], repasa: [] },
    ensena: C5,
    pasos: [
      "Objetivo: al terminar podrás contar quién fue Alejandro Magno, qué conquistó, qué es el helenismo y por qué se recuerda a Euclides.",
      "Contexto: en la lección anterior viste que Grecia eran muchas polis y que el Imperio persa era enorme. Al norte de Grecia estaba Macedonia, un reino que terminó dominando a las polis y atacando a Persia.",
      `Alejandro fue rey de Macedonia siendo muy joven y alumno de Aristóteles. En ${A("inicio-conquista-persa")} inició la conquista del Imperio persa y avanzó hasta el valle del Indo, donde sus soldados, agotados, se negaron a seguir.`,
      `Alejandro murió en Babilonia en ${A("muerte-de-alejandro")}. Su imperio no sobrevivió unido: sus generales se lo repartieron y formaron reinos separados.`,
      "Esa mezcla de la cultura griega con las de Egipto y Oriente se llama helenismo. Uno de sus centros fue Alejandría, en Egipto, ciudad con biblioteca y museo donde trabajaron científicos y estudiosos.",
      `Según la tradición, allí trabajó Euclides, que escribió los Elementos (${A("elementos-de-euclides")}), un tratado de geometría que se siguió estudiando durante más de dos mil años.`,
      "Personajes clave: Alejandro Magno (rey conquistador), Aristóteles (filósofo, su maestro) y Euclides (matemático). Para no confundirlos, fíjate en su rol: rey, filósofo y matemático.",
      "Causas y consecuencias: las conquistas de Alejandro difundieron el griego y las ideas griegas por Oriente, y también llevaron ideas orientales a Grecia. Es una sincronía notable: casi al mismo tiempo se formaba el Imperio maurya en la India.",
      "Conecta con: la lección de la India (Imperio maurya) y con la de Roma, que después heredará gran parte del mundo helenístico.",
      "Errores comunes: (1) creer que Alejandro fue griego de Atenas: era macedonio; (2) pensar que su imperio duró siglos: se dividió a su muerte; (3) confundir helenístico con helénico: el helenismo es la mezcla posterior a Alejandro.",
    ],
    visuales: [
      linea(3, "De la conquista de Persia a los Elementos", C5.hechos),
      fichas(6, "Un rey, un filósofo y un matemático", C5.personajes),
    ],
    quiz: [
      pregPrimero("inicio-conquista-persa", "muerte-de-alejandro"),
      pregQuien("aristoteles", ["platon", "socrates", "pericles"]),
      pregQuien("euclides", ["aristoteles", "homero", "alejandro-magno"]),
      pregSiglo("muerte-de-alejandro"),
      preg(
        "¿Qué es el helenismo?",
        "La mezcla de la cultura griega con las de Egipto y Oriente tras las conquistas de Alejandro",
        ["La cultura griega anterior a las polis", "Un imperio fundado por Roma", "Una religión de la India"],
        "Helenismo es la difusión de la cultura griega por Oriente y su mezcla con otras culturas después de las conquistas de Alejandro."
      ),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "historia-clase-08-roma-republica",
    grupo: "antiguedad",
    orden: 6,
    requierePro: true,
    nombre: "Roma: de la ciudad a la República",
    descripcion: "La fundación de Roma, la República, las guerras contra Cartago y la figura de Julio César.",
    conceptos: { introduce: ["roma-republica", "personajes-y-hechos"], usa: ["anio-antes-de-cristo", "personajes-por-rol"], repasa: [] },
    ensena: C6,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo creció Roma desde una ciudad hasta dominar el Mediterráneo, qué fue la República y quién fue Julio César.",
      `Contexto: en esta lección las fechas también son a. C., así que recuerda que ${A("fundacion-de-roma")} es anterior a ${A("republica-romana")}. Y para no confundir personajes, fíjate en su rol y en el hecho con el que se los asocia.`,
      `Según la tradición, Roma fue fundada en ${A("fundacion-de-roma")}; según la leyenda, por Rómulo, que con su hermano Remo habría sido criado por una loba. Es una fecha convencional, no probada.`,
      `Roma fue primero una monarquía. ${AHc("republica-romana")} los romanos crearon la República, gobernada por magistrados elegidos (los cónsules) y por el Senado. Simplificación de nivel escolar: solo una parte de la población tenía derechos políticos plenos.`,
      `La rival de Roma en el Mediterráneo era Cartago, en el norte de África. En la segunda guerra púnica, el general cartaginés Aníbal cruzó los Alpes con elefantes (${A("anibal-cruza-los-alpes")}) para atacar Roma desde el norte. Al final, Roma ganó y destruyó Cartago (${A("destruccion-de-cartago")}).`,
      `Las conquistas trajeron riqueza pero también conflictos internos: rebeliones de esclavos, como la de Espartaco, y luchas entre generales. Uno de ellos fue Julio César, que conquistó la Galia y cruzó el Rubicón con su ejército (${A("cesar-cruza-el-rubicon")}), lo que desató una guerra civil.`,
      `Julio César fue nombrado dictador y murió asesinado por un grupo de senadores en ${A("asesinato-de-julio-cesar")}. No fue emperador: el Imperio empezó después.`,
      "Personajes clave: Julio César (general y político), Aníbal (general cartaginés) y Espartaco (líder de una rebelión de esclavos). Asócialos con su hecho: el Rubicón, los Alpes y la rebelión.",
      "Causas y consecuencias: las guerras contra Cartago hicieron de Roma una potencia; las guerras civiles del final de la República se relacionan con el fin de ese sistema, tema de la lección siguiente.",
      "Conecta con: la lección siguiente, sobre el Imperio romano, que empieza con las guerras civiles de esta etapa; la de Grecia (Roma heredó y adaptó buena parte de su cultura) y la de África antigua, donde está Cartago.",
      "Errores comunes: (1) creer que Julio César fue emperador: fue general y dictador; (2) confundir la República romana con una democracia moderna; (3) creer que Aníbal era romano: era de Cartago; (4) leer 753 a. C. como un año probado: es la fecha de la tradición.",
    ],
    visuales: [
      linea(4, "De la fundación de Roma al asesinato de César", C6.hechos),
      fichas(7, "Julio César, Aníbal y Espartaco", C6.personajes),
    ],
    quiz: [
      pregPrimero("fundacion-de-roma", "republica-romana"),
      pregPrimero("anibal-cruza-los-alpes", "destruccion-de-cartago"),
      pregQuien("anibal", ["julio-cesar", "espartaco", "leonidas"]),
      pregQuien("espartaco", ["anibal", "julio-cesar", "augusto"]),
      preg(
        "¿Fue Julio César el primer emperador romano?",
        "No: fue general y dictador; el Imperio comenzó después de su muerte",
        ["Sí, fue el primer emperador", "Sí, fue el último emperador de la República", "No: fue un rey de Egipto"],
        `Julio César murió en ${A("asesinato-de-julio-cesar")}; el Imperio empezó con Augusto, en ${A("comienzo-del-imperio-romano")}.`
      ),
      preg(
        "¿Por qué 753 a. C. se considera una fecha convencional?",
        "Porque es la fecha que fija la tradición, no un año probado",
        ["Porque es el año en que murió Rómulo", "Porque es la fecha exacta de la República", "Porque se calculó con satélites"],
        "La fundación de Roma se explica con una tradición y una leyenda; la fecha 753 a. C. es la que fijó la tradición."
      ),
    ],
  },

  // ---------------------------------------------------------------- 7
  {
    slug: "historia-clase-09-imperio-romano-y-cristianismo",
    grupo: "antiguedad",
    orden: 7,
    requierePro: true,
    nombre: "El Imperio romano y el cristianismo",
    descripcion: "De la guerra civil al Imperio de Augusto, la erupción del Vesubio y el camino del cristianismo hasta ser religión oficial.",
    conceptos: { introduce: ["roma-imperio", "cristianismo-y-fin-de-roma", "cadenas-causales"], usa: ["roma-republica", "causa-y-consecuencia"], repasa: [] },
    ensena: C7,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo terminó la República y empezó el Imperio, qué ocurrió con el cristianismo y por qué el Imperio se dividió.",
      `Contexto: en la lección anterior viste que Julio César fue asesinado (${A("asesinato-de-julio-cesar")}) y que Roma vivía guerras civiles. De ahí parte esta lección: una cadena de causas y consecuencias que va de ese asesinato al Imperio.`,
      `El asesinato de César desató una nueva guerra civil. Su heredero adoptivo, Octaviano, venció en ${Q("batalla-de-accio")} (${A("batalla-de-accio")}) a Marco Antonio y Cleopatra. Cleopatra murió en ${A("muerte-de-cleopatra")} y Egipto pasó a ser provincia romana.`,
      `Poco después, Octaviano recibió el nombre de Augusto y se convirtió en el primer emperador (${A("comienzo-del-imperio-romano")}). Empezó un largo período de relativa paz y prosperidad, la Pax Romana, que duró unos dos siglos.`,
      `Un episodio famoso de este período es la erupción del Vesubio (${A("erupcion-del-vesubio")}), que destruyó Pompeya y Herculano y las conservó bajo capas de ceniza y piedra pómez.`,
      `El cristianismo, nacido en el Imperio, sufrió persecuciones durante un tiempo. El emperador Constantino dictó el Edicto de Milán (${A("edicto-de-milan")}), que permitió practicarlo, y trasladó la capital a una nueva ciudad junto al Bósforo, Constantinopla (${A("fundacion-de-constantinopla")}). Más tarde, en ${A("cristianismo-religion-oficial")}, el cristianismo se declaró religión oficial del Imperio.`,
      `En ${A("division-del-imperio-romano")} el Imperio quedó dividido definitivamente en dos partes, Oriente y Occidente. La de Occidente caerá, por convención escolar, en ${A("caida-de-roma-occidente")}: esa fecha abre la Edad Media.`,
      "Personajes clave: Augusto (primer emperador), Cleopatra (última reina del Egipto ptolemaico) y Constantino (emperador que favoreció el cristianismo).",
      "Causas y consecuencias: la guerra civil llevó de César a Accio y de Accio al Imperio; el Edicto de Milán llevó a que el cristianismo se hiciera religión oficial. Las dos cadenas están en las figuras de abajo.",
      "Conecta con: la Edad Media, que empieza con la caída de Roma de Occidente; el Imperio bizantino, que continúa en Oriente con capital en Constantinopla; y la India y China, contemporáneas del Imperio romano.",
      "Errores comunes: (1) creer que «el Imperio romano cayó» en un solo día: la caída de Occidente en 476 es una fecha convencional de un proceso largo; (2) pensar que Roma terminó del todo: el Imperio de Oriente siguió mil años más; (3) confundir República con Imperio: la República termina con los conflictos que llevan a Augusto.",
    ],
    visuales: [
      causas(8, "De los idus de marzo al Imperio", ["asesinato-de-julio-cesar", "batalla-de-accio", "comienzo-del-imperio-romano"]),
      causas(8, "El cristianismo, religión oficial", ["edicto-de-milan", "cristianismo-religion-oficial"]),
      linea(10, "Del Imperio de Augusto a la división del Imperio", ["batalla-de-accio", "muerte-de-cleopatra", "comienzo-del-imperio-romano", "erupcion-del-vesubio", "edicto-de-milan", "fundacion-de-constantinopla", "cristianismo-religion-oficial", "division-del-imperio-romano"]),
      fichas(9, "Augusto, Cleopatra y Constantino", C7.personajes),
    ],
    quiz: [
      pregConsecuencia("batalla-de-accio", "comienzo-del-imperio-romano", ["escritura-cuneiforme", "batalla-de-maraton", "unificacion-de-china"]),
      pregCausa("cristianismo-religion-oficial", "edicto-de-milan", ["caida-de-roma-occidente", "hegira", "santa-sofia"]),
      pregPrimero("erupcion-del-vesubio", "edicto-de-milan"),
      pregQuien("constantino", ["augusto", "julio-cesar", "cleopatra"]),
      pregSiglo("erupcion-del-vesubio"),
      preg(
        "¿Cuándo termina la Antigüedad según la convención escolar?",
        `Con la caída del Imperio romano de Occidente, ${A("caida-de-roma-occidente")}`,
        [`Con el Edicto de Milán, ${A("edicto-de-milan")}`, `Con el asesinato de Julio César, ${A("asesinato-de-julio-cesar")}`, `Con la llegada de Colón, ${A("llegada-de-colon")}`],
        "Por convención escolar, la caída del Imperio romano de Occidente abre la Edad Media; otros libros usan otras fechas."
      ),
    ],
  },

  // ---------------------------------------------------------------- 8
  {
    slug: "historia-clase-10-africa-y-america-antiguas",
    grupo: "antiguedad",
    orden: 8,
    requierePro: true,
    nombre: "África y América antiguas: Cartago, Aksum, los olmecas y los mayas",
    descripcion: "Civilizaciones que se desarrollaron lejos del Mediterráneo oriental: el comercio de Cartago y Aksum y las culturas de Mesoamérica.",
    conceptos: { introduce: ["africa-y-america-antiguas"], usa: ["anio-antes-de-cristo"], repasa: [] },
    ensena: C8,
    pasos: [
      "Objetivo: al terminar podrás ubicar cuatro civilizaciones antiguas fuera de Europa y Asia: Cartago y Aksum, en África, y los olmecas y los mayas, en América.",
      `Contexto: la historia antigua no ocurrió solo en el Mediterráneo oriental. Como en toda la Antigüedad, los años a. C. se cuentan hacia atrás: ${A("olmecas")} es anterior a ${A("fundacion-de-cartago")}.`,
      `Cartago, en la costa de la actual Túnez, fue fundada según la tradición por colonos fenicios de Tiro ${AH("fundacion-de-cartago")}. Llegó a ser una gran potencia comercial marítima y rival de Roma; es la ciudad de Aníbal.`,
      `Aksum fue un reino en el norte de la actual Etiopía y Eritrea, con comercio por el mar Rojo y el océano Índico. Su rey Ezana adoptó el cristianismo ${AH("ezana-de-aksum")}; Aksum fue uno de los primeros Estados cristianos.`,
      `Los olmecas desarrollaron en la costa del golfo de México (${AH("olmecas")}) la primera gran cultura de Mesoamérica; son famosas sus enormes cabezas de piedra.`,
      `El período clásico de la civilización maya (${A("periodo-clasico-maya")}) se conoce por sus ciudades con templos en forma de pirámide, una escritura jeroglífica, un calendario muy preciso y avanzados conocimientos de astronomía.`,
      "Personajes clave: en esta lección los protagonistas son colectivos (los cartagineses, los aksumitas, los olmecas y los mayas). Sus gobernantes se conocen menos por fuentes escritas y no figuran en la tabla del curso.",
      "Causas y consecuencias: la escritura maya se desarrolló de forma independiente de las del Viejo Mundo. Simplificación de nivel escolar: se resume la historia de cuatro civilizaciones distintas a un hecho por cada una.",
      "Conecta con: la lección de la República romana (guerras contra Cartago), con la del Imperio romano (Aksum es contemporáneo de Constantino) y con la Edad Media, cuando surgirán Mali, los aztecas y los incas.",
      "Errores comunes: (1) confundir mayas, aztecas e incas: los mayas son mucho más antiguos que los aztecas y los incas, que son del final de la Edad Media; (2) creer que África no tuvo Estados antiguos: Cartago y Aksum son dos ejemplos; (3) pensar que Cartago era griega o romana: era fenicia de origen.",
    ],
    visuales: [linea(5, "Cuatro civilizaciones fuera del Mediterráneo oriental", C8.hechos)],
    quiz: [
      pregPrimero("olmecas", "fundacion-de-cartago"),
      pregEpoca("periodo-clasico-maya"),
      pregSiglo("ezana-de-aksum"),
      preg(
        "¿En qué región se desarrolló la cultura olmeca?",
        "En la costa del golfo de México (Mesoamérica)",
        ["En el norte de África", "En el valle del Indo", "En el mar Egeo"],
        "Los olmecas fueron la primera gran cultura de Mesoamérica y se desarrollaron cerca del golfo de México."
      ),
      preg(
        `¿Qué civilización adoptó el cristianismo ${AH("ezana-de-aksum")} con su rey Ezana?`,
        "Aksum",
        ["Cartago", "Los olmecas", "Los mayas"],
        `Ezana, rey de Aksum, adoptó el cristianismo ${A("ezana-de-aksum")}; Cartago fue destruida siglos antes y las culturas de Mesoamérica estaban en otro continente.`
      ),
    ],
  },
];

// La tabla se importa con nombres para que un error de tipeo en un id salte al cargar.
void N;
void PV;
