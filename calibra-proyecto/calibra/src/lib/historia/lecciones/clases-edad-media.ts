import type { ClaseHistoria } from "./tipos";
import { A, AH, DIST, N, P, Q, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, sincronia } from "./ayudas";

// Clases de la época «Edad Media» (Pro). Cada Clase: objetivo, contexto (repaso de lo
// que usa de épocas anteriores), desarrollo con líneas de tiempo animadas, personajes
// clave, causas y consecuencias, conexiones, errores comunes y quiz de 4 a 6
// preguntas. Todo nombre y todo año sale de la tabla canónica por id.

const C1 = {
  hechos: ["caida-de-roma-occidente", "santa-sofia", "cisma-de-oriente-y-occidente", "imperio-otomano", "caida-de-constantinopla"],
  personajes: ["justiniano", "mehmed-ii"],
};
const C2 = {
  hechos: ["hegira", "musulmanes-en-iberia", "batalla-de-poitiers", "fundacion-de-bagdad", "casa-de-la-sabiduria", "primera-cruzada", "saladino-recupera-jerusalen"],
  personajes: ["mahoma", "al-juarismi", "avicena", "saladino"],
};
const C3 = {
  hechos: ["coronacion-de-carlomagno", "leif-en-america", "batalla-de-hastings", "carta-magna", "primera-cruzada"],
  personajes: ["carlomagno", "guillermo-el-conquistador", "leif-erikson"],
};
const C4 = {
  hechos: ["guerra-de-los-cien-anios", "peste-negra", "juana-de-arco-en-orleans", "biblia-de-gutenberg"],
  personajes: ["juana-de-arco", "gutenberg"],
};
const C5 = {
  hechos: ["dinastia-tang", "dinastia-song", "angkor-wat", "shogunato-de-kamakura", "sultanato-de-delhi", "gengis-kan-proclamado", "dinastia-yuan", "marco-polo-en-china", "dinastia-ming", "expediciones-de-zheng-he"],
  personajes: ["murasaki-shikibu", "minamoto-no-yoritomo", "gengis-kan", "kublai-kan", "marco-polo", "zheng-he"],
};
const C6 = {
  hechos: ["imperio-de-mali", "peregrinacion-de-mansa-musa", "viajes-de-ibn-battuta", "gran-zimbabue", "maories-en-nueva-zelanda"],
  personajes: ["sundiata-keita", "mansa-musa", "ibn-battuta"],
};
const C7 = {
  hechos: ["fundacion-de-tenochtitlan", "expansion-inca", "machu-picchu"],
  personajes: ["pachacutec"],
};

export const CLASES_HISTORIA_EDAD_MEDIA: ClaseHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-clase-11-bizancio-y-los-otomanos",
    grupo: "edad-media",
    orden: 1,
    requierePro: true,
    nombre: "Bizancio: del fin de Roma de Occidente a la caída de Constantinopla",
    descripcion: "El Imperio romano de Oriente, su gran época con Justiniano, la separación de las Iglesias y la conquista otomana de Constantinopla.",
    conceptos: { introduce: ["bizancio", "fronteras-de-epoca"], usa: ["epocas-historicas", "cristianismo-y-fin-de-roma", "causa-y-consecuencia"], repasa: ["epocas-historicas", "cristianismo-y-fin-de-roma", "causa-y-consecuencia"] },
    ensena: C1,
    pasos: [
      "Objetivo: al terminar podrás explicar qué ocurrió con el Imperio romano tras 476, qué fue el Imperio bizantino y cómo terminó.",
      `Contexto: la Edad Media empieza, por convención escolar, con la caída del Imperio romano de Occidente (${A("caida-de-roma-occidente")}). Repaso de la Antigüedad: el Imperio se había dividido en dos partes, Oriente y Occidente, y Constantinopla era la capital del Oriente; el cristianismo era la religión oficial, y una causa siempre precede a su consecuencia.`,
      `Cuando cayó Roma de Occidente, el Imperio de Oriente siguió con capital en Constantinopla. Los historiadores lo llaman Imperio bizantino (un nombre posterior: sus habitantes se seguían llamando romanos). Su emperador Justiniano ordenó compilar el derecho romano y construir la basílica de Santa Sofía, inaugurada en ${A("santa-sofia")}.`,
      `Con el tiempo, las Iglesias de Roma y de Constantinopla se distanciaron y se separaron en ${A("cisma-de-oriente-y-occidente")}: el llamado Cisma de Oriente y Occidente, origen de la Iglesia católica y de la ortodoxa.`,
      `Al este apareció una nueva potencia. Según la tradición, Osmán I fundó el Imperio otomano ${AH("imperio-otomano")}, y en ${A("caida-de-constantinopla")} el sultán Mehmed II conquistó Constantinopla, poniendo fin al Imperio bizantino. La ciudad pasó a ser la capital otomana.`,
      `Personajes clave: ${P("justiniano")} (emperador bizantino) y ${P("mehmed-ii")} (sultán otomano, conquistador de Constantinopla).`,
      "Causas y consecuencias: los otomanos, al crecer, fueron rodeando al Imperio bizantino, y la conquista de Constantinopla es la consecuencia de ese proceso. La figura muestra esa relación.",
      "Conecta con: la Técnica «Cómo se cierra la Edad Media: 1453 o 1492» (algunos textos usan 1453 como fin de la época); con la lección del mundo islámico y con la Edad Moderna, donde el Imperio otomano será una gran potencia.",
      `Errores comunes: (1) creer que en 476 terminó todo el Imperio romano: solo terminó el de Occidente, el de Oriente siguió hasta ${A("caida-de-constantinopla")} (${DIST("caida-de-constantinopla", "caida-de-roma-occidente")} años después); (2) pensar que «bizantino» es un pueblo distinto: es el nombre moderno del Imperio romano de Oriente; (3) creer que Constantinopla y Estambul son ciudades distintas: es la misma con nombres distintos.`,
    ],
    visuales: [
      linea(4, "De 476 a 1453", C1.hechos),
      causas(6, "El ascenso otomano y la caída de Constantinopla", ["imperio-otomano", "caida-de-constantinopla"]),
      fichas(5, "Un emperador y un sultán", C1.personajes),
    ],
    quiz: [
      pregPrimero("santa-sofia", "cisma-de-oriente-y-occidente"),
      pregConsecuencia("imperio-otomano", "caida-de-constantinopla", ["caida-de-roma-occidente", "hegira", "dinastia-tang"]),
      pregQuien("justiniano", ["mehmed-ii", "carlomagno", "mahoma"]),
      pregQuien("mehmed-ii", ["justiniano", "saladino", "gengis-kan"]),
      preg(
        "¿Qué pasó con el Imperio romano de Oriente en 476?",
        "Siguió existiendo con capital en Constantinopla",
        ["Desapareció junto con el de Occidente", "Se unió a los francos", "Fue conquistado por los otomanos ese mismo año"],
        `Solo cayó el Imperio de Occidente. El de Oriente, llamado bizantino, duró hasta ${A("caida-de-constantinopla")}.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-clase-12-mundo-islamico",
    grupo: "edad-media",
    orden: 2,
    requierePro: true,
    nombre: "El mundo islámico: de Mahoma a Saladino",
    descripcion: "El nacimiento del islam, su expansión, Bagdad como centro del saber y la reconquista de Jerusalén por Saladino.",
    conceptos: { introduce: ["islam-medieval"], usa: ["causa-y-consecuencia"], repasa: ["causa-y-consecuencia"] },
    ensena: C2,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo nació y se expandió el islam, por qué Bagdad fue un gran centro del saber y quién fue Saladino.",
      `Contexto: en esta lección hay varias relaciones de causa y consecuencia: una causa provoca una consecuencia y esta puede ser, a su vez, causa de otra. Como antecedente, recuerda que del mundo antiguo se conservaban textos griegos, persas e indios que los sabios de Bagdad terminarán traduciendo.`,
      `Mahoma predicó en La Meca en la península arábiga; su predicación dio origen al islam. En ${A("hegira")} él y sus seguidores se trasladaron a Medina: es la Hégira, año 1 del calendario islámico.`,
      `Tras su muerte, el islam se expandió con rapidez. Los ejércitos musulmanes llegaron a la península ibérica en ${A("musulmanes-en-iberia")} y, según la tradición, los francos detuvieron un avance musulmán en la ${Q("batalla-de-poitiers")} (${A("batalla-de-poitiers")}); su importancia real se discute.`,
      `Los abasíes fundaron Bagdad como capital (${A("fundacion-de-bagdad")}). Allí, ${AH("casa-de-la-sabiduria")}, floreció la Casa de la Sabiduría, un centro donde se traducían y estudiaban textos griegos, persas e indios. De su sabio Al-Juarismi derivan las palabras «álgebra» y «algoritmo»; y Avicena escribió el Canon de medicina, que se estudió durante siglos.`,
      `Las Cruzadas fueron expediciones militares cristianas hacia Tierra Santa: la primera comenzó en ${A("primera-cruzada")}. El sultán Saladino recuperó Jerusalén para los musulmanes en ${A("saladino-recupera-jerusalen")}.`,
      `Personajes clave: ${["mahoma", "al-juarismi", "avicena", "saladino"].map(P).join(", ")}. Para no confundirlos: un profeta, un matemático, un médico y un sultán.`,
      "Causas y consecuencias: la llegada a Iberia llevó a un enfrentamiento en Poitiers; la fundación de Bagdad llevó a la Casa de la Sabiduría; y la Primera Cruzada llevó a la reconquista de Jerusalén por Saladino. Las tres cadenas están en la figura.",
      "Conecta con: la lección del Imperio bizantino (las Cruzadas terminaron afectando a Constantinopla), con la de Europa feudal (Carlomagno y los francos) y con la Edad Moderna, donde el conocimiento del mundo islámico ayudó al Renacimiento europeo.",
      "Errores comunes: (1) creer que «islámico» y «árabe» son lo mismo: el mundo islámico incluyó pueblos muy distintos (persas, turcos, bereberes y otros); (2) confundir la Hégira con el nacimiento de Mahoma: es su traslado a Medina; (3) pensar que la batalla de Poitiers detuvo a todo el islam: fue un episodio y su importancia se discute.",
    ],
    visuales: [
      linea(3, "De la Hégira a Saladino", C2.hechos),
      fichas(6, "Un profeta, un matemático, un médico y un sultán", C2.personajes),
      causas(7, "Del avance en Iberia a Poitiers", ["musulmanes-en-iberia", "batalla-de-poitiers"]),
      causas(7, "De Bagdad a la Casa de la Sabiduría", ["fundacion-de-bagdad", "casa-de-la-sabiduria"]),
      causas(7, "De la Primera Cruzada a Jerusalén", ["primera-cruzada", "saladino-recupera-jerusalen"]),
    ],
    quiz: [
      pregPrimero("hegira", "fundacion-de-bagdad"),
      pregConsecuencia("fundacion-de-bagdad", "casa-de-la-sabiduria", ["caida-de-roma-occidente", "santa-sofia", "dinastia-tang"]),
      pregQuien("al-juarismi", ["avicena", "mahoma", "saladino"]),
      pregQuien("saladino", ["avicena", "mahoma", "gengis-kan"]),
      preg(
        "¿Qué fue la Hégira?",
        "El traslado de Mahoma y sus seguidores de La Meca a Medina",
        ["El nacimiento de Mahoma", "Una batalla contra los francos", "La conquista de Jerusalén"],
        `La ${N("hegira")} (${A("hegira")}) fue el traslado de La Meca a Medina; es el punto de partida del calendario islámico.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-clase-13-europa-feudal",
    grupo: "edad-media",
    orden: 3,
    requierePro: true,
    nombre: "Europa feudal: francos, vikingos, normandos y Cruzadas",
    descripcion: "Carlomagno, el feudalismo, los viajes vikingos, la conquista normanda de Inglaterra, la Carta Magna y la Primera Cruzada.",
    conceptos: { introduce: ["feudalismo"], usa: ["causa-y-consecuencia"], repasa: ["causa-y-consecuencia"] },
    ensena: C3,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo se organizaba la Europa feudal y ubicar en orden a Carlomagno, los vikingos, Guillermo el Conquistador, la Carta Magna y la Primera Cruzada.",
      `Contexto: tras la caída de Roma de Occidente (${A("caida-de-roma-occidente")}) Europa occidental quedó dividida en reinos gobernados por pueblos germanos. Entre ellos destacaron los francos. Y recuerda que una causa siempre precede a su consecuencia.`,
      `Carlomagno, rey de los francos, fue coronado emperador por el papa el día de Navidad de ${A("coronacion-de-carlomagno")}. Su imperio reunió gran parte de Europa occidental.`,
      "La sociedad feudal se organizaba en una cadena de lealtades: el rey, los señores y los caballeros, y bajo ellos los campesinos, muchos de ellos siervos ligados a la tierra que trabajaban. Simplificación de nivel escolar: el feudalismo varió mucho según el lugar y el siglo.",
      `Los vikingos, navegantes escandinavos, recorrieron Europa. Uno de ellos, Leif Erikson, llegó a América del Norte ${AH("leif-en-america")}: casi cinco siglos antes de Colón (${DIST("llegada-de-colon", "leif-en-america")} años).`,
      `En ${A("batalla-de-hastings")}, Guillermo, duque de Normandía, venció en Hastings y se convirtió en rey de Inglaterra. En ${A("carta-magna")} los barones obligaron al rey a firmar la Carta Magna, que estableció que el poder del rey tenía límites.`,
      `En ${A("primera-cruzada")} comenzó la Primera Cruzada: expedición militar cristiana hacia Tierra Santa, convocada por el papa.`,
      `Personajes clave: ${["carlomagno", "guillermo-el-conquistador", "leif-erikson"].map(P).join(", ")}.`,
      "Causas y consecuencias: la conquista normanda cambió la nobleza y la lengua de Inglaterra; la Carta Magna es un antecedente lejano de la idea de gobierno con límites; la Primera Cruzada abrió un siglo de enfrentamientos con el mundo islámico.",
      "Conecta con: la lección del mundo islámico (cruzadas y Saladino), la de Bizancio (el cisma entre Iglesias) y la Edad Moderna, donde los Estados europeos se harán más fuertes.",
      "Errores comunes: (1) creer que Colón fue el primer europeo en América: los vikingos llegaron antes, pero su contacto no tuvo continuidad; (2) confundir a Carlomagno (rey de los francos) con un emperador romano; (3) pensar que la Carta Magna dio derechos a todos: protegió sobre todo a los barones y con el tiempo se usó como ejemplo de límites al poder.",
    ],
    visuales: [linea(6, "De Carlomagno a la Primera Cruzada", C3.hechos), fichas(7, "Un emperador, un explorador y un rey", C3.personajes)],
    quiz: [
      pregPrimero("coronacion-de-carlomagno", "batalla-de-hastings"),
      pregPrimero("leif-en-america", "carta-magna"),
      pregQuien("guillermo-el-conquistador", ["carlomagno", "leif-erikson", "saladino"]),
      pregQuien("leif-erikson", ["marco-polo", "ibn-battuta", "zheng-he"]),
      preg(
        "¿Qué estableció la Carta Magna?",
        "Que el poder del rey tenía límites",
        ["Que el rey era dueño de todas las tierras", "Que los campesinos eran libres", "Que Inglaterra pertenecía a Francia"],
        `La Carta Magna (${A("carta-magna")}) fue un acuerdo entre el rey y los barones que puso límites al poder real.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-clase-14-crisis-tardomedieval",
    grupo: "edad-media",
    orden: 4,
    requierePro: true,
    nombre: "La crisis de la Baja Edad Media: peste negra y guerra de los Cien Años",
    descripcion: "La peste negra, la guerra entre Francia e Inglaterra, Juana de Arco y la imprenta de Gutenberg.",
    conceptos: { introduce: ["baja-edad-media"], usa: ["causa-y-consecuencia", "feudalismo"], repasa: ["causa-y-consecuencia", "feudalismo"] },
    ensena: C4,
    pasos: [
      "Objetivo: al terminar podrás explicar qué fue la peste negra, por qué se recuerda la guerra de los Cien Años y qué cambió con la imprenta de Gutenberg.",
      "Contexto: la Europa feudal era una sociedad de reyes, señores y campesinos ligados a la tierra. En los siglos XIV y XV esa sociedad pasó por una crisis de epidemias, guerras y cambios económicos que marcó el final de la Edad Media. Recuerda también que una causa precede a su consecuencia: aquí una guerra y una epidemia cambian la sociedad.",
      `La guerra de los Cien Años enfrentó a Inglaterra y Francia desde ${A("guerra-de-los-cien-anios")}. En realidad fue una serie de guerras con treguas que se prolongó más de un siglo.`,
      `La peste negra, una epidemia de peste bubónica, llegó a Europa en ${A("peste-negra")} por las rutas comerciales y provocó la muerte de una parte muy grande de la población; las cifras exactas se discuten y por eso aquí no se dan. Con menos campesinos, escaseó la mano de obra y cambiaron las condiciones de trabajo.`,
      `En plena guerra, Juana de Arco, una joven campesina francesa, lideró tropas francesas y liberó Orleans (${A("juana-de-arco-en-orleans")}). Fue capturada, juzgada y ejecutada en 1431.`,
      `Poco después, Gutenberg desarrolló en Europa la imprenta de tipos móviles e imprimió la Biblia (${A("biblia-de-gutenberg")}): los libros se hicieron más rápidos y baratos de producir, y el conocimiento escrito se difundió mucho más.`,
      `Personajes clave: ${P("juana-de-arco")} (heroína militar francesa) y ${P("gutenberg")} (impresor alemán).`,
      "Causas y consecuencias: la guerra de los Cien Años llevó a la aparición de figuras como Juana de Arco; la imprenta de Gutenberg será una herramienta clave para el Renacimiento y la Reforma, que se estudian en la Edad Moderna.",
      "Conecta con: la lección de Europa feudal, con la Técnica «Cómo se cierra la Edad Media: 1453 o 1492» y con la Edad Moderna.",
      "Errores comunes: (1) creer que la guerra de los Cien Años duró exactamente cien años: fue más larga, con treguas; (2) creer que Gutenberg inventó la imprenta en general: en China ya se imprimía con tipos móviles antes, y él desarrolló el sistema de tipos móviles en Europa; (3) tomar la fecha de la Biblia como exacta: es aproximada.",
    ],
    visuales: [linea(5, "De la guerra a la imprenta", C4.hechos), fichas(6, "Una heroína y un impresor", C4.personajes), causas(7, "La guerra que trajo a Juana de Arco", ["guerra-de-los-cien-anios", "juana-de-arco-en-orleans"])],
    quiz: [
      pregPrimero("peste-negra", "juana-de-arco-en-orleans"),
      pregConsecuencia("guerra-de-los-cien-anios", "juana-de-arco-en-orleans", ["caida-de-roma-occidente", "hegira", "coronacion-de-carlomagno"]),
      pregQuien("juana-de-arco", ["gutenberg", "marco-polo", "guillermo-el-conquistador"]),
      pregQuien("gutenberg", ["juana-de-arco", "mehmed-ii", "marco-polo"]),
      preg(
        "¿Cuál fue una consecuencia de la imprenta de tipos móviles en Europa?",
        "Los libros se hicieron más rápidos y baratos de producir y el conocimiento se difundió más",
        ["Se dejó de escribir a mano para siempre", "El papel dejó de fabricarse", "Los libros se prohibieron"],
        "Con la imprenta se pudieron producir muchos ejemplares con menos trabajo y menor costo; el resto de las opciones no ocurrió."
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-clase-15-asia-oriental-y-los-mongoles",
    grupo: "edad-media",
    orden: 5,
    requierePro: true,
    nombre: "China, Japón, India y el Sudeste asiático: de los Tang a los Ming",
    descripcion: "Las dinastías chinas, el Japón de los shogunes, el sultanato de Delhi, Angkor Wat y el imperio de los mongoles.",
    conceptos: { introduce: ["asia-medieval", "imperio-mongol"], usa: ["china-antigua", "causa-y-consecuencia"], repasa: ["china-antigua", "causa-y-consecuencia"] },
    ensena: C5,
    pasos: [
      "Objetivo: al terminar podrás ubicar las dinastías chinas de la Edad Media, el imperio mongol y las otras grandes civilizaciones de Asia: Japón, India y el Imperio jemer.",
      "Contexto: en la lección de la China antigua viste que los Han unificaron un gran Estado. Tras siglos de divisiones, China volvió a unificarse bajo nuevas dinastías. Y recuerda: una causa precede a su consecuencia; en esta lección hay una cadena de cuatro hechos.",
      `La dinastía Tang (${A("dinastia-tang")}) es recordada como una época de esplendor, con una gran capital, Chang'an, y una brillante poesía. La dinastía Song (${A("dinastia-song")}) fue una época de gran desarrollo económico y de inventos como la imprenta, la pólvora y la brújula, aunque algunos ya existían antes.`,
      `En Japón, el poder real pasó a los jefes militares: Minamoto no Yoritomo estableció el shogunato de Kamakura (${A("shogunato-de-kamakura")}). El emperador seguía existiendo, pero gobernaba el shogún. Antes, la dama de la corte Murasaki Shikibu había escrito El relato de Genji, considerada una de las primeras novelas del mundo.`,
      `En la India, el sultanato de Delhi se fundó en ${A("sultanato-de-delhi")}. En el Sudeste asiático, el Imperio jemer levantó el templo de Angkor Wat (${A("angkor-wat")}), en la actual Camboya.`,
      `Los mongoles: Temüjin fue proclamado Gengis Kan (${A("gengis-kan-proclamado")}) y con él nació el mayor imperio terrestre continuo de la historia. Su nieto Kublai Kan fundó en China la dinastía Yuan (${A("dinastia-yuan")}). El veneciano Marco Polo llegó a su corte ${AH("marco-polo-en-china")} y relató su viaje en un famoso libro.`,
      `Los Ming expulsaron a los mongoles de China (${A("dinastia-ming")}). Con ellos, el almirante Zheng He dirigió grandes flotas hasta el océano Índico y las costas de África oriental (${A("expediciones-de-zheng-he")}).`,
      `Personajes clave: ${["murasaki-shikibu", "minamoto-no-yoritomo", "gengis-kan", "kublai-kan", "marco-polo", "zheng-he"].map(P).join(", ")}.`,
      "Causas y consecuencias: la proclamación de Gengis Kan llevó al imperio mongol; de él nació la dinastía Yuan; y de la caída de los Yuan surgió la dinastía Ming, que impulsó las expediciones de Zheng He.",
      "Conecta con: la lección del mundo islámico (Bagdad y los mongoles), la de África medieval (Ibn Battuta viajó por Asia) y la Edad Moderna (el comercio con Asia impulsará los viajes de exploración europeos).",
      "Errores comunes: (1) confundir a Gengis Kan con Kublai Kan: Kublai era su nieto y fundó la dinastía Yuan; (2) confundir shogún con emperador: en Japón el emperador seguía, pero el poder real lo tenía el shogún; (3) creer que Zheng He llegó a América: llegó al océano Índico y a África oriental.",
    ],
    visuales: [
      linea(5, "Cinco hitos de los siglos VII a XII", ["dinastia-tang", "dinastia-song", "angkor-wat", "shogunato-de-kamakura", "sultanato-de-delhi"]),
      linea(7, "Cinco hitos de los mongoles a los Ming", ["gengis-kan-proclamado", "dinastia-yuan", "marco-polo-en-china", "dinastia-ming", "expediciones-de-zheng-he"]),
      fichas(8, "Los protagonistas", C5.personajes),
      causas(9, "De Gengis Kan a Zheng He", ["gengis-kan-proclamado", "dinastia-yuan", "dinastia-ming", "expediciones-de-zheng-he"]),
    ],
    quiz: [
      pregPrimero("dinastia-tang", "dinastia-song"),
      pregConsecuencia("gengis-kan-proclamado", "dinastia-yuan", ["caida-de-roma-occidente", "hegira", "dinastia-tang"]),
      pregCausa("dinastia-ming", "dinastia-yuan", ["expediciones-de-zheng-he", "caida-de-constantinopla", "biblia-de-gutenberg"]),
      pregQuien("kublai-kan", ["gengis-kan", "marco-polo", "zheng-he"]),
      pregQuien("zheng-he", ["marco-polo", "gengis-kan", "kublai-kan"]),
      preg(
        "En el Japón medieval, ¿quién tenía el poder real?",
        "El shogún, jefe militar",
        ["El emperador, que gobernaba solo", "El sultán de Delhi", "Los mongoles"],
        `Con el shogunato de Kamakura (${A("shogunato-de-kamakura")}) el poder real pasó al shogún, aunque el emperador siguió existiendo.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "historia-clase-16-africa-y-oceania-medievales",
    grupo: "edad-media",
    orden: 6,
    requierePro: true,
    nombre: "África y Oceanía medievales: Mali, Zimbabue y los maoríes",
    descripcion: "El imperio de Mali y Mansa Musa, los viajes de Ibn Battuta, el Gran Zimbabue y la llegada de los maoríes a Nueva Zelanda.",
    conceptos: { introduce: ["africa-medieval"], usa: ["causa-y-consecuencia", "africa-y-america-antiguas"], repasa: ["causa-y-consecuencia", "africa-y-america-antiguas"] },
    ensena: C6,
    pasos: [
      "Objetivo: al terminar podrás explicar por qué fue famoso el imperio de Mali, quién fue Ibn Battuta y qué eran el Gran Zimbabue y el poblamiento de Nueva Zelanda.",
      "Contexto: en la Antigüedad hubo grandes Estados africanos, como Cartago y Aksum. En la Edad Media, en África occidental, el comercio a través del desierto del Sahara, de oro y de sal, hizo crecer nuevos imperios: una causa (el comercio) que provoca una consecuencia (la riqueza y el poder).",
      `Sundiata Keita fundó el imperio de Mali ${AH("imperio-de-mali")}, una tradición que se conserva en la epopeya oral de Sundiata. Mali controlaba el comercio del oro, y ciudades como Tombuctú fueron centros comerciales y de estudio del islam.`,
      `El emperador Mansa Musa hizo una famosa peregrinación a La Meca (${A("peregrinacion-de-mansa-musa")}). Según los cronistas árabes, llevó tanto oro que su viaje mostró la riqueza de Mali a todo el mundo islámico.`,
      `Ibn Battuta, un viajero marroquí, salió de Tánger en ${A("viajes-de-ibn-battuta")} y recorrió durante casi treinta años África, Asia y parte de Europa; dictó luego el libro de sus viajes.`,
      `En el sur de África, el Gran Zimbabue fue una ciudad de piedra con gran comercio de oro con la costa del océano Índico (${AH("gran-zimbabue")}). Y en el Pacífico, los maoríes, navegantes polinesios, se establecieron en Nueva Zelanda (${AH("maories-en-nueva-zelanda")}).`,
      `Personajes clave: ${["sundiata-keita", "mansa-musa", "ibn-battuta"].map(P).join(", ")}.`,
      "Causas y consecuencias: el imperio de Mali, rico por el comercio, hizo posible la famosa peregrinación de Mansa Musa. Simplificación de nivel escolar: los datos sobre el oro que llevó provienen de cronistas de la época y no se conocen con exactitud.",
      "Conecta con: la lección del mundo islámico (Mali era un imperio islámico), con la de Asia (Ibn Battuta viajó por Asia) y con la Edad Moderna, cuando los europeos llegarán a las costas africanas.",
      "Errores comunes: (1) creer que la actual República de Mali es el mismo territorio que el imperio medieval: no coinciden; (2) pensar que África carecía de historia escrita: hay tradición oral y fuentes árabes, además de las ruinas; (3) atribuir el Gran Zimbabue a otros pueblos: fue construido por pueblos africanos.",
    ],
    visuales: [linea(5, "Cinco hechos de África y Oceanía en el siglo XIII y XIV", C6.hechos), fichas(6, "Un fundador, un emperador y un viajero", C6.personajes), causas(7, "Un imperio rico y una peregrinación", ["imperio-de-mali", "peregrinacion-de-mansa-musa"])],
    quiz: [
      pregPrimero("imperio-de-mali", "peregrinacion-de-mansa-musa"),
      pregConsecuencia("imperio-de-mali", "peregrinacion-de-mansa-musa", ["caida-de-roma-occidente", "hegira", "dinastia-tang"]),
      pregQuien("ibn-battuta", ["mansa-musa", "marco-polo", "zheng-he"]),
      pregQuien("sundiata-keita", ["mansa-musa", "ibn-battuta", "gengis-kan"]),
      preg(
        "¿Qué comerciaba sobre todo el imperio de Mali a través del Sahara?",
        "Oro y sal",
        ["Seda y papel", "Petróleo y gas", "Especias y porcelana chinas"],
        "El comercio de oro y sal a través del Sahara hizo rico al imperio de Mali."
      ),
    ],
  },

  // ---------------------------------------------------------------- 7
  {
    slug: "historia-clase-17-america-precolombina",
    grupo: "edad-media",
    orden: 7,
    requierePro: true,
    nombre: "América precolombina: aztecas e incas",
    descripcion: "Tenochtitlan, la capital azteca, y el Imperio inca de los Andes, con Machu Picchu.",
    conceptos: { introduce: ["america-precolombina"], usa: ["africa-y-america-antiguas", "causa-y-consecuencia"], repasa: ["africa-y-america-antiguas", "causa-y-consecuencia"] },
    ensena: C7,
    pasos: [
      "Objetivo: al terminar podrás distinguir a los aztecas de los incas y ubicar la fundación de Tenochtitlan, la expansión inca y Machu Picchu.",
      "Contexto: en la Antigüedad, América tuvo culturas como la olmeca y la maya. En la Edad Media surgieron en Mesoamérica y en los Andes dos grandes Estados: el azteca y el inca. Ninguno tuvo contacto con Europa hasta 1492. Y una causa precede siempre a su consecuencia: aquí, la expansión precede a las grandes ciudades.",
      `Los mexicas, llamados también aztecas, fundaron Tenochtitlan, según la tradición, ${AH("fundacion-de-tenochtitlan")}, en una isla del lago de Texcoco. Cultivaban en chinampas, islas artificiales de cultivo, y su ciudad llegó a ser la capital de un gran imperio.`,
      `En los Andes, los incas tuvieron su capital en Cusco. Con el gobernante Pachacútec comenzó la expansión que convirtió al Cusco en el centro de un gran imperio (${AH("expansion-inca")}). El Estado inca tenía una red de caminos y usaba los quipus, cuerdas con nudos para registrar información.`,
      `A esa expansión se asocia Machu Picchu (${AH("machu-picchu")}), una ciudad de piedra en los Andes, considerada una propiedad real de Pachacútec.`,
      `Personajes clave: ${P("pachacutec")}, gobernante inca. De los aztecas, la tabla del curso no incluye gobernantes de esta época.`,
      "Causas y consecuencias: la expansión inca llevó a la construcción de ciudades como Machu Picchu. Ambos imperios serán conquistados por los españoles en la Edad Moderna; esa historia sigue en las lecciones siguientes.",
      "Conecta con: la lección de África y América antiguas (olmecas y mayas), con la Edad Moderna (la llegada de Colón y la conquista) y con el mundo actual, donde la lengua quechua y el náhuatl siguen vivas.",
      "Errores comunes: (1) confundir mayas, aztecas e incas: los mayas son mucho más antiguos; (2) creer que aztecas e incas eran vecinos: estaban muy lejos entre sí, en Mesoamérica y en los Andes; (3) leer la fecha de fundación de Tenochtitlan como un año exacto: es la fecha de la tradición.",
    ],
    visuales: [linea(4, "Tenochtitlan, la expansión inca y Machu Picchu", C7.hechos), fichas(5, "Pachacútec", C7.personajes), causas(6, "De la expansión al monumento", ["expansion-inca", "machu-picchu"])],
    quiz: [
      pregPrimero("fundacion-de-tenochtitlan", "expansion-inca"),
      pregConsecuencia("expansion-inca", "machu-picchu", ["caida-de-roma-occidente", "hegira", "dinastia-tang"]),
      pregQuien("pachacutec", ["mansa-musa", "gengis-kan", "mehmed-ii"]),
      pregEpoca("machu-picchu"),
      preg(
        "¿Qué eran los quipus?",
        "Cuerdas con nudos que usaban los incas para registrar información",
        ["Barcos de los vikingos", "Templos de los aztecas", "Monedas de oro de los mayas"],
        "Los quipus eran cuerdas con nudos: el Estado inca las usaba para llevar cuentas y registros."
      ),
    ],
  },
];

void N;
void pregSiglo;
void sincronia;
