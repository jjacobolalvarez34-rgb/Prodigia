import type { ClaseHistoria } from "./tipos";
import { A, AH, DIST, N, P, Q, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo } from "./ayudas";

// Clases de la época «Edad Moderna» (Pro). Cada Clase: objetivo, contexto (repaso de lo
// que usa de épocas anteriores), desarrollo con líneas de tiempo animadas, personajes
// clave, causas y consecuencias, conexiones, errores comunes y quiz de 4 a 6
// preguntas. Todo nombre y todo año sale de la tabla canónica por id.

const C1 = {
  hechos: ["mona-lisa", "capilla-sixtina", "don-quijote", "noventa-y-cinco-tesis", "guerra-de-los-treinta-anios", "paz-de-westfalia"],
  personajes: ["leonardo-da-vinci", "miguel-angel", "cervantes", "shakespeare", "lutero"],
};
const C2 = {
  hechos: ["llegada-de-colon", "caida-de-granada", "tratado-de-tordesillas", "vasco-da-gama-en-la-india", "magallanes-parte", "primera-vuelta-al-mundo", "caida-de-tenochtitlan", "captura-de-atahualpa", "virreinato-de-nueva-espana"],
  personajes: ["colon", "isabel-de-castilla", "vasco-da-gama", "magallanes", "elcano", "hernan-cortes", "moctezuma-ii", "pizarro", "atahualpa"],
};
const C3 = {
  hechos: ["batalla-de-panipat", "reinado-de-akbar", "comienzo-del-taj-mahal", "batalla-de-sekigahara", "shogunato-tokugawa", "dinastia-qing"],
  personajes: ["babur", "akbar", "shah-jahan", "tokugawa-ieyasu"],
};
const C4 = {
  hechos: ["de-revolutionibus", "telescopio-de-galileo", "principia-de-newton", "contrato-social", "maquina-de-vapor-de-watt"],
  personajes: ["copernico", "galileo", "newton", "rousseau", "james-watt"],
};
const C5 = {
  hechos: ["armada-invencible", "fundacion-de-jamestown", "africanos-esclavizados-en-virginia", "nzinga-reina", "cook-en-australia", "rebelion-de-tupac-amaru-ii", "guerra-de-los-siete-anios"],
  personajes: ["nzinga", "james-cook", "tupac-amaru-ii"],
};
const C6 = {
  hechos: ["guerra-de-los-siete-anios", "independencia-de-estados-unidos", "constitucion-de-estados-unidos"],
  personajes: ["jefferson", "franklin", "washington"],
};

export const CLASES_HISTORIA_EDAD_MODERNA: ClaseHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-clase-18-renacimiento-y-reforma",
    grupo: "edad-moderna",
    orden: 1,
    requierePro: true,
    nombre: "El Renacimiento y la Reforma protestante",
    descripcion: "El arte y las letras del Renacimiento, las 95 tesis de Lutero y las guerras de religión que terminaron con la Paz de Westfalia.",
    conceptos: {
      introduce: ["renacimiento", "reforma"],
      usa: ["epocas-historicas", "baja-edad-media", "causa-y-consecuencia"],
      repasa: ["epocas-historicas", "baja-edad-media", "causa-y-consecuencia"],
    },
    ensena: C1,
    pasos: [
      "Objetivo: al terminar podrás explicar qué fue el Renacimiento, qué desencadenó la Reforma protestante y cómo terminaron las guerras religiosas en Europa.",
      `Contexto: la Edad Moderna empieza, por convención escolar, con ${A("llegada-de-colon")}. Repaso de la Edad Media: la imprenta de Gutenberg (${A("biblia-de-gutenberg")}) hizo que los libros fueran más baratos y las ideas circularan más; y recuerda que una causa siempre precede a su consecuencia.`,
      `El Renacimiento fue un movimiento de renovación del arte, las letras y el pensamiento, que nació en Italia y se extendió por Europa; recuperó el interés por la cultura de la Antigüedad clásica y puso al ser humano en el centro. Leonardo da Vinci pintó la ${Q("mona-lisa")} (${AH("mona-lisa")}) y Miguel Ángel el techo de la Capilla Sixtina (${A("capilla-sixtina")}).`,
      `En la literatura, Cervantes publicó ${Q("don-quijote")} (${A("don-quijote")}), considerada una de las grandes novelas de la literatura universal, y Shakespeare escribió obras de teatro como Hamlet y Romeo y Julieta.`,
      `En ${A("noventa-y-cinco-tesis")} el teólogo alemán Martín Lutero publicó sus 95 tesis, en las que criticaba prácticas de la Iglesia católica; así empezó la Reforma protestante, que dividió a los cristianos de Europa occidental entre católicos y protestantes.`,
      `Los conflictos religiosos se mezclaron con la política. La guerra de los Treinta Años, que comenzó en ${A("guerra-de-los-treinta-anios")}, enfrentó a muchos Estados europeos y terminó con la Paz de Westfalia (${A("paz-de-westfalia")}), que sentó bases del sistema de Estados soberanos.`,
      `Personajes clave: ${["leonardo-da-vinci", "miguel-angel", "cervantes", "shakespeare", "lutero"].map(P).join(", ")}. Los cuatro primeros, artistas y escritores; el último, un teólogo.`,
      "Causas y consecuencias: las 95 tesis llevaron a la ruptura religiosa; esa ruptura contribuyó a la guerra de los Treinta Años; y la guerra terminó en la Paz de Westfalia. La figura une los tres hechos.",
      "Conecta con: la lección de la crisis de la Baja Edad Media (imprenta) y la de la exploración de América, que ocurrió a la vez; y con la Ilustración, que heredará el espíritu crítico del Renacimiento.",
      "Errores comunes: (1) creer que Renacimiento y Reforma son lo mismo: el primero es un movimiento cultural; la segunda, religioso; (2) pensar que Lutero quiso crear una Iglesia nueva desde el principio: empezó criticando prácticas; (3) creer que la Paz de Westfalia terminó con todas las guerras de Europa: cerró la guerra de los Treinta Años.",
    ],
    visuales: [
      linea(5, "Del arte del Renacimiento a la Paz de Westfalia", C1.hechos),
      fichas(7, "Artistas, escritores y un teólogo", C1.personajes),
      causas(8, "De las 95 tesis a la Paz de Westfalia", ["noventa-y-cinco-tesis", "guerra-de-los-treinta-anios", "paz-de-westfalia"]),
    ],
    quiz: [
      pregPrimero("mona-lisa", "noventa-y-cinco-tesis"),
      pregConsecuencia("noventa-y-cinco-tesis", "guerra-de-los-treinta-anios", ["caida-de-roma-occidente", "hegira", "biblia-de-gutenberg"]),
      pregConsecuencia("guerra-de-los-treinta-anios", "paz-de-westfalia", ["caida-de-roma-occidente", "hegira", "biblia-de-gutenberg"]),
      pregQuien("miguel-angel", ["leonardo-da-vinci", "lutero", "galileo"]),
      pregQuien("cervantes", ["shakespeare", "miguel-angel", "lutero"]),
      preg(
        "¿Qué fue la Reforma protestante?",
        "Un movimiento religioso iniciado por Lutero que dividió a los cristianos de Europa occidental",
        ["Una guerra entre el Imperio romano y Persia", "Un movimiento artístico italiano", "Una ley del Imperio otomano"],
        `La Reforma comenzó con las 95 tesis (${A("noventa-y-cinco-tesis")}); el movimiento artístico es el Renacimiento.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-clase-19-exploracion-y-conquista-de-america",
    grupo: "edad-moderna",
    orden: 2,
    requierePro: true,
    nombre: "Los viajes de exploración y la conquista de América",
    descripcion: "Colón, Tordesillas, el camino a la India, la primera vuelta al mundo y la caída de los imperios azteca e inca.",
    conceptos: {
      introduce: ["exploracion-y-conquista"],
      usa: ["fronteras-de-epoca", "america-precolombina", "cadenas-causales"],
      repasa: ["fronteras-de-epoca", "america-precolombina", "cadenas-causales"],
    },
    ensena: C2,
    pasos: [
      "Objetivo: al terminar podrás explicar por qué los europeos se lanzaron al mar, qué ocurrió con la llegada de Colón y cómo cayeron los imperios azteca e inca.",
      `Contexto: la Edad Moderna empieza con ${A("llegada-de-colon")}. Repaso de la Edad Media: los aztecas (Tenochtitlan, ${AH("fundacion-de-tenochtitlan")}) y los incas (con Pachacútec) eran dos grandes Estados de América sin contacto con Europa, y las cadenas de causas y consecuencias sirven para ordenar los hechos.`,
      `Las potencias ibéricas buscaban rutas marítimas hacia Asia, por sus especias, evitando las rutas controladas por otros. Portugal rodeó África y Vasco da Gama llegó a la India (${A("vasco-da-gama-en-la-india")}). Castilla apoyó a Colón, que en ${A("llegada-de-colon")} llegó a América pensando que había llegado a Asia; por eso a los habitantes de América se los llamó «indios».`,
      `Ese mismo año cayó Granada, último reino musulmán de la península ibérica (${A("caida-de-granada")}). Para evitar conflictos entre Castilla y Portugal, en ${A("tratado-de-tordesillas")} firmaron el Tratado de Tordesillas, que repartió entre ambas las zonas de exploración.`,
      `La expedición de Magallanes partió de España (${A("magallanes-parte")}). Magallanes murió en Filipinas en 1521 y Elcano completó el viaje: la primera vuelta al mundo (${A("primera-vuelta-al-mundo")}).`,
      `Hernán Cortés dirigió una expedición que, con la ayuda de aliados indígenas enemigos de los mexicas, conquistó Tenochtitlan (${A("caida-de-tenochtitlan")}); en ${A("virreinato-de-nueva-espana")} se creó el Virreinato de Nueva España. Pizarro capturó al gobernante inca Atahualpa en Cajamarca (${A("captura-de-atahualpa")}), en un Imperio inca debilitado por una guerra interna.`,
      `Personajes clave: ${["colon", "isabel-de-castilla", "vasco-da-gama", "magallanes", "elcano", "hernan-cortes", "moctezuma-ii", "pizarro", "atahualpa"].map(P).join(", ")}.`,
      "Causas y consecuencias: los viajes de Colón llevaron al Tratado de Tordesillas, a la conquista de Tenochtitlan y a la captura de Atahualpa; de la caída de Tenochtitlan surgió el Virreinato. Las epidemias traídas de Europa causaron una enorme mortalidad entre los pueblos americanos; las cifras se discuten y por eso aquí no se dan.",
      "Conecta con: la lección de América precolombina (aztecas e incas), la de los imperios de Asia, que tuvo contacto con los portugueses, y la Edad Contemporánea, donde las independencias de América cierran este período.",
      "Errores comunes: (1) creer que América era un territorio vacío: estaba habitada por millones de personas; y creer que Colón supo que había llegado a un continente nuevo: él creyó que había llegado a Asia; (2) creer que Magallanes completó la vuelta al mundo: murió antes; la completó Elcano; (3) creer que la conquista fue solo militar: influyeron alianzas, enfermedades y guerras internas.",
    ],
    visuales: [
      linea(5, "Nueve hechos de la exploración y la conquista", C2.hechos),
      causas(7, "De Colón a Tenochtitlan y al Virreinato", ["llegada-de-colon", "caida-de-tenochtitlan", "virreinato-de-nueva-espana"]),
      causas(7, "De Magallanes a la primera vuelta al mundo", ["magallanes-parte", "primera-vuelta-al-mundo"]),
      fichas(6, "Los protagonistas (1)", C2.personajes.slice(0, 5)),
      fichas(6, "Los protagonistas (2)", C2.personajes.slice(5)),
    ],
    quiz: [
      pregPrimero("tratado-de-tordesillas", "vasco-da-gama-en-la-india"),
      pregConsecuencia("llegada-de-colon", "tratado-de-tordesillas", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregConsecuencia("caida-de-tenochtitlan", "virreinato-de-nueva-espana", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregQuien("elcano", ["magallanes", "colon", "hernan-cortes"]),
      pregQuien("pizarro", ["hernan-cortes", "colon", "vasco-da-gama"]),
      preg(
        "¿Por qué Colón llamó «indios» a los habitantes de América?",
        "Porque creía haber llegado a Asia, a las Indias",
        ["Porque hablaban idiomas de la India", "Porque venían de la India", "Porque así se llamaba su pueblo"],
        "Colón pensó que había llegado a las Indias, es decir, a Asia; el nombre se quedó, aunque no corresponde a los pueblos americanos."
      ),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-clase-20-imperios-de-asia-moderna",
    grupo: "edad-moderna",
    orden: 3,
    requierePro: true,
    nombre: "Los grandes imperios de Asia: mogoles, Tokugawa y Qing",
    descripcion: "El Imperio mogol de la India, el shogunato Tokugawa de Japón y la dinastía Qing de China.",
    conceptos: { introduce: ["asia-moderna"], usa: ["asia-medieval", "causa-y-consecuencia"], repasa: ["asia-medieval", "causa-y-consecuencia"] },
    ensena: C3,
    pasos: [
      "Objetivo: al terminar podrás ubicar tres grandes Estados asiáticos de la Edad Moderna: el Imperio mogol, el Japón de los Tokugawa y la China de los Qing.",
      "Contexto: en la Edad Media, el sultanato de Delhi gobernaba el norte de la India, en Japón el poder había pasado a los shogunes y en China gobernaba la dinastía Ming. En esta lección se ve qué las reemplazó, y cada hecho tiene una causa que lo precede.",
      `En la India, Babur, un príncipe de Asia central, venció en Panipat (${A("batalla-de-panipat")}) y fundó el Imperio mogol. Su nieto Akbar gobernó desde ${A("reinado-de-akbar")} y es recordado por su política de tolerancia entre religiones.`,
      `Shah Jahan, otro emperador mogol, mandó construir el Taj Mahal como mausoleo de su esposa (${A("comienzo-del-taj-mahal")}).`,
      `En Japón, Tokugawa Ieyasu venció en Sekigahara (${A("batalla-de-sekigahara")}) y se convirtió en shogún en ${A("shogunato-tokugawa")}. El shogunato Tokugawa gobernó Japón durante más de dos siglos y medio (hasta la Restauración Meiji, ${A("restauracion-meiji")}).`,
      `En China, los manchúes tomaron Pekín y comenzó el dominio de la dinastía Qing (${A("dinastia-qing")}), la última dinastía imperial de China.`,
      `Personajes clave: ${["babur", "akbar", "shah-jahan", "tokugawa-ieyasu"].map(P).join(", ")}.`,
      "Causas y consecuencias: la victoria de Ieyasu en Sekigahara llevó al shogunato Tokugawa. Simplificación de nivel escolar: el Imperio mogol, muy rico, también fue objetivo de los comerciantes europeos.",
      "Conecta con: la lección de Asia oriental medieval, la de los grandes viajes europeos (los portugueses ya estaban en la India) y la Edad Contemporánea, donde Japón se modernizará con la Restauración Meiji y China será afectada por el imperialismo.",
      "Errores comunes: (1) confundir a los mogoles con los mongoles: los primeros gobernaron la India (Babur descendía de los mongoles por vía materna), los segundos son los de Gengis Kan; (2) creer que el shogún era el emperador: el shogún gobernaba en nombre del emperador; (3) pensar que el Taj Mahal es un templo: es un mausoleo.",
    ],
    visuales: [linea(5, "Seis hechos de la India, Japón y China", C3.hechos), fichas(6, "Cuatro protagonistas", C3.personajes), causas(7, "De la batalla de Sekigahara al shogunato", ["batalla-de-sekigahara", "shogunato-tokugawa"])],
    quiz: [
      pregPrimero("batalla-de-panipat", "batalla-de-sekigahara"),
      pregConsecuencia("batalla-de-sekigahara", "shogunato-tokugawa", ["caida-de-constantinopla", "hegira", "dinastia-tang"]),
      pregQuien("shah-jahan", ["akbar", "babur", "tokugawa-ieyasu"]),
      pregQuien("babur", ["akbar", "shah-jahan", "tokugawa-ieyasu"]),
      preg(
        "¿Qué es el Taj Mahal?",
        "Un mausoleo que mandó construir Shah Jahan para su esposa",
        ["Un templo de Japón", "Una fortaleza china", "Un palacio de Constantinopla"],
        `El Taj Mahal, cuya construcción comenzó ${AH("comienzo-del-taj-mahal")}, es un mausoleo del Imperio mogol.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-clase-21-revolucion-cientifica-e-ilustracion",
    grupo: "edad-moderna",
    orden: 4,
    requierePro: true,
    nombre: "La revolución científica y la Ilustración",
    descripcion: "Copérnico, Galileo, Newton, la idea de razón y de soberanía popular de la Ilustración y la máquina de vapor.",
    conceptos: { introduce: ["revolucion-cientifica", "ilustracion"], usa: ["renacimiento"], repasa: [] },
    ensena: C4,
    pasos: [
      "Objetivo: al terminar podrás explicar qué cambió en la ciencia con Copérnico, Galileo y Newton y qué ideas defendió la Ilustración.",
      "Contexto: el Renacimiento (lección anterior) devolvió a Europa el interés por observar y estudiar la naturaleza. De esa curiosidad nacieron los avances científicos de los siglos siguientes.",
      `Nicolás Copérnico propuso que la Tierra y los demás planetas giran alrededor del Sol, en su obra de ${A("de-revolutionibus")}. Galileo observó el cielo con el telescopio (${A("telescopio-de-galileo")}) y descubrió, entre otras cosas, las lunas de Júpiter; tuvo conflictos con la Iglesia por defender esas ideas.`,
      `Isaac Newton publicó los Principia (${A("principia-de-newton")}), donde formuló la ley de la gravitación universal y las leyes del movimiento.`,
      "La Ilustración fue un movimiento del siglo XVIII que defendió el uso de la razón, la libertad de pensamiento y la crítica a la autoridad. Sus ideas influyeron en las revoluciones que siguieron.",
      `Uno de sus autores, Rousseau, escribió ${Q("contrato-social")} (${A("contrato-social")}), donde sostiene que el poder político nace de un acuerdo de los ciudadanos.`,
      `La técnica también avanzó: James Watt patentó una máquina de vapor mejorada (${A("maquina-de-vapor-de-watt")}), que pronto se aplicó en fábricas y transportes.`,
      `Personajes clave: ${["copernico", "galileo", "newton", "rousseau", "james-watt"].map(P).join(", ")}.`,
      "Causas y consecuencias: los descubrimientos científicos cambiaron la idea de universo; la Ilustración aplicó esa confianza en la razón a la política y a la sociedad; y la máquina de vapor abrió el camino de la Revolución Industrial, que se estudia en la Edad Contemporánea.",
      "Conecta con: la lección del Renacimiento (de ahí viene la curiosidad científica), con la de la exploración de América (la navegación usó la astronomía) y con la Edad Contemporánea, donde la ciencia impulsa la industrialización.",
      "Errores comunes: (1) creer que Galileo inventó el telescopio: lo perfeccionó y lo usó para observar el cielo; (2) confundir a Copérnico con Galileo: Copérnico propuso el heliocentrismo, Galileo aportó observaciones; (3) creer que Watt inventó la máquina de vapor de la nada: mejoró una máquina que ya existía.",
    ],
    visuales: [linea(6, "Cinco hitos de la ciencia y las ideas", C4.hechos), fichas(8, "Cinco protagonistas", C4.personajes)],
    quiz: [
      pregPrimero("de-revolutionibus", "principia-de-newton"),
      pregPrimero("telescopio-de-galileo", "contrato-social"),
      pregQuien("copernico", ["galileo", "newton", "rousseau"]),
      pregQuien("newton", ["galileo", "copernico", "james-watt"]),
      preg(
        "¿Qué defendieron los pensadores de la Ilustración?",
        "El uso de la razón, la libertad de pensamiento y la crítica a la autoridad",
        ["La obediencia absoluta a los reyes", "El regreso a la vida nómada", "La prohibición de los libros"],
        "La Ilustración confió en la razón y criticó las autoridades que no se basaban en ella."
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-clase-22-colonias-comercio-y-esclavitud-atlantica",
    grupo: "edad-moderna",
    orden: 5,
    requierePro: true,
    nombre: "El mundo atlántico: colonias, esclavitud y rivalidades entre potencias",
    descripcion: "La Armada Invencible, las colonias de América del Norte, la esclavización de africanos, la reina Nzinga, las expediciones de Cook y la rebelión de Túpac Amaru II.",
    conceptos: { introduce: ["mundo-atlantico"], usa: ["exploracion-y-conquista", "causa-y-consecuencia"], repasa: ["exploracion-y-conquista", "causa-y-consecuencia"] },
    ensena: C5,
    pasos: [
      "Objetivo: al terminar podrás ubicar las principales potencias que compitieron en el Atlántico, cómo se fundaron las colonias inglesas de América del Norte y qué fue la trata de africanos esclavizados.",
      "Contexto: tras los viajes de exploración y la conquista de América, otras potencias europeas, como Inglaterra, Francia y los Países Bajos, se lanzaron a competir por territorios y comercio. Cada hecho de esta lección tiene causas y consecuencias que se encadenan.",
      `La rivalidad entre España e Inglaterra se vio en la derrota de la Armada Invencible, la flota que España envió contra Inglaterra (${A("armada-invencible")}).`,
      `En ${A("fundacion-de-jamestown")} se fundó Jamestown, el primer asentamiento inglés duradero en América del Norte. En ${A("africanos-esclavizados-en-virginia")} llegaron a Virginia los primeros africanos esclavizados. La trata transatlántica llevó a América a millones de personas africanas esclavizadas; las cifras se discuten y por eso aquí no se dan.`,
      `En África, la reina Nzinga de Ndongo (${A("nzinga-reina")}) resistió durante décadas la presión portuguesa. En el Pacífico, James Cook exploró la costa este de Australia (${A("cook-en-australia")}). Y en los Andes, Túpac Amaru II encabezó una rebelión contra la administración colonial (${A("rebelion-de-tupac-amaru-ii")}).`,
      `La guerra de los Siete Años (${A("guerra-de-los-siete-anios")}) enfrentó a las potencias europeas en varios continentes: dejó deudas y cambios en el mapa colonial.`,
      `Personajes clave: ${["nzinga", "james-cook", "tupac-amaru-ii"].map(P).join(", ")}.`,
      "Causas y consecuencias: la fundación de Jamestown llevó a que en Virginia se asentaran plantaciones y, con ellas, a la llegada de africanos esclavizados; la guerra de los Siete Años tuvo efectos en las colonias británicas, tema de la próxima lección.",
      "Conecta con: la lección de exploración y conquista, la de la independencia de Estados Unidos, la de África medieval y la Edad Contemporánea (abolición de la esclavitud).",
      "Errores comunes: (1) creer que la esclavitud comenzó con la trata atlántica: existía antes en muchas sociedades; lo nuevo fue su escala y su carácter transoceánico; (2) pensar que los pueblos africanos solo sufrieron la trata y no resistieron: hubo resistencias, como la de Nzinga; (3) creer que Cook «descubrió» Australia, habitada desde hace decenas de miles de años.",
    ],
    visuales: [linea(5, "Siete hechos del mundo atlántico", C5.hechos), fichas(6, "Nzinga, Cook y Túpac Amaru II", C5.personajes), causas(7, "De Jamestown a Virginia", ["fundacion-de-jamestown", "africanos-esclavizados-en-virginia"])],
    quiz: [
      pregPrimero("armada-invencible", "fundacion-de-jamestown"),
      pregConsecuencia("fundacion-de-jamestown", "africanos-esclavizados-en-virginia", ["caida-de-constantinopla", "hegira", "biblia-de-gutenberg"]),
      pregQuien("nzinga", ["tupac-amaru-ii", "james-cook", "atahualpa"]),
      pregQuien("james-cook", ["tupac-amaru-ii", "magallanes", "colon"]),
      pregSiglo("rebelion-de-tupac-amaru-ii"),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "historia-clase-23-independencia-de-estados-unidos",
    grupo: "edad-moderna",
    orden: 6,
    requierePro: true,
    nombre: "La independencia de Estados Unidos",
    descripcion: "Del conflicto por los impuestos a la Declaración de Independencia y a la Constitución, y cómo cierra la Edad Moderna.",
    conceptos: { introduce: ["independencia-eeuu"], usa: ["mundo-atlantico", "ilustracion", "causa-y-consecuencia"], repasa: ["mundo-atlantico", "ilustracion", "causa-y-consecuencia"] },
    ensena: C6,
    pasos: [
      "Objetivo: al terminar podrás explicar por qué las colonias británicas de América del Norte se independizaron y qué se estableció en su Constitución.",
      "Contexto: las trece colonias británicas se habían fundado a lo largo de las costas de América del Norte (mundo atlántico), y las ideas de la Ilustración, como que el poder político nace de un acuerdo de los ciudadanos, circulaban entre sus habitantes. Una causa precede a su consecuencia; en esta lección hay una cadena.",
      `Tras la guerra de los Siete Años (${A("guerra-de-los-siete-anios")}), el Reino Unido quedó endeudado e impuso nuevos impuestos a sus colonias. Los colonos protestaron: sostenían que no debían pagar impuestos sin tener representantes en el Parlamento.`,
      `Las colonias se enfrentaron al Reino Unido y declararon su independencia (${A("independencia-de-estados-unidos")}). La Declaración, redactada sobre todo por Thomas Jefferson, afirmaba que todos los hombres han sido creados iguales y con derechos como la vida y la libertad, ideas de la Ilustración.`,
      "George Washington comandó el ejército continental durante la guerra. Simplificación de nivel escolar: los ideales de igualdad y libertad no alcanzaron en la práctica a todos: la esclavitud continuó y las mujeres y los pueblos originarios quedaron sin esos derechos.",
      `En ${A("constitucion-de-estados-unidos")} se redactó la Constitución de Estados Unidos, que estableció un gobierno federal con poderes divididos en tres ramas.`,
      `Personajes clave: ${["jefferson", "franklin", "washington"].map(P).join(", ")}: el redactor, el científico y político que participó, y el comandante y primer presidente.`,
      "Causas y consecuencias: la guerra de los Siete Años llevó a los impuestos, los impuestos a la protesta y la protesta a la independencia; la independencia llevó a la Constitución. La figura muestra la cadena principal.",
      "Conecta con: la Revolución francesa (que se apoyó en ideas similares), con las independencias de Hispanoamérica y con la Edad Contemporánea, que comienza con la Revolución francesa en 1789.",
      "Errores comunes: (1) confundir la fecha de la Declaración con el final de la guerra: la independencia se declaró antes y la guerra siguió después; (2) creer que la Constitución y la Declaración son el mismo documento; (3) pensar que la Edad Moderna termina con esta independencia: la convención escolar la cierra en 1789.",
    ],
    visuales: [causas(7, "De la guerra a la Constitución", C6.hechos), fichas(6, "Tres protagonistas", C6.personajes)],
    quiz: [
      pregConsecuencia("guerra-de-los-siete-anios", "independencia-de-estados-unidos", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregConsecuencia("independencia-de-estados-unidos", "constitucion-de-estados-unidos", ["caida-de-constantinopla", "llegada-de-colon", "hegira"]),
      pregCausa("independencia-de-estados-unidos", "guerra-de-los-siete-anios", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregQuien("washington", ["jefferson", "franklin", "lutero"]),
      preg(
        "¿Quién redactó principalmente la Declaración de Independencia de Estados Unidos?",
        P("jefferson"),
        [P("washington"), P("franklin"), P("newton")],
        `${P("jefferson")} redactó la mayor parte de la Declaración (${A("independencia-de-estados-unidos")}); Washington comandó el ejército y Franklin participó del proceso.`
      ),
    ],
  },
];

void N;
void DIST;
void pregEpoca;
