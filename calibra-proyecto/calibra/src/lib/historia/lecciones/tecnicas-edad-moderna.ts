import type { TecnicaHistoria } from "./tipos";
import { A, AH, DIST, N, Q, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, sincronia } from "./ayudas";

// Técnicas de la época «Edad Moderna» (gratis, atajos cortos con visual y quiz): las
// anclas alrededor de 1492, las cadenas de dos pasos de la conquista de América, la
// sincronía de fines del siglo XVI, los personajes por rol y la cadena que lleva a la
// independencia de Estados Unidos. Los nombres y los años salen de la tabla canónica.

const ENSENA_1 = {
  hechos: ["llegada-de-colon", "caida-de-granada", "tratado-de-tordesillas", "vasco-da-gama-en-la-india", "mona-lisa", "capilla-sixtina", "noventa-y-cinco-tesis"],
  personajes: ["colon", "isabel-de-castilla", "vasco-da-gama", "leonardo-da-vinci", "miguel-angel", "lutero"],
};

const CADENA_2 = ["llegada-de-colon", "caida-de-tenochtitlan", "virreinato-de-nueva-espana"];
const ENSENA_2 = {
  hechos: ["magallanes-parte", "caida-de-tenochtitlan", "primera-vuelta-al-mundo", "batalla-de-panipat", "captura-de-atahualpa", "virreinato-de-nueva-espana", "de-revolutionibus", "llegada-de-colon"],
  personajes: ["magallanes", "elcano", "hernan-cortes", "moctezuma-ii", "pizarro", "atahualpa", "babur", "copernico"],
};

const SINCRONIA_3 = [
  { region: "asia-sur" as const, hechos: ["reinado-de-akbar"] },
  { region: "europa" as const, hechos: ["armada-invencible", "don-quijote"] },
  { region: "asia-oriental" as const, hechos: ["shogunato-tokugawa"] },
  { region: "america" as const, hechos: ["fundacion-de-jamestown"] },
];
const ENSENA_3 = {
  hechos: ["reinado-de-akbar", "armada-invencible", "batalla-de-sekigahara", "shogunato-tokugawa", "don-quijote", "fundacion-de-jamestown", "telescopio-de-galileo", "guerra-de-los-treinta-anios"],
  personajes: ["akbar", "tokugawa-ieyasu", "shakespeare", "cervantes", "galileo"],
};

const ENSENA_4 = {
  hechos: ["africanos-esclavizados-en-virginia", "nzinga-reina", "comienzo-del-taj-mahal", "paz-de-westfalia", "dinastia-qing", "principia-de-newton", "guerra-de-los-siete-anios"],
  personajes: ["nzinga", "shah-jahan", "newton"],
};

const CADENA_5 = ["guerra-de-los-siete-anios", "independencia-de-estados-unidos", "constitucion-de-estados-unidos"];
const ENSENA_5 = {
  hechos: ["guerra-de-los-siete-anios", "contrato-social", "maquina-de-vapor-de-watt", "cook-en-australia", "rebelion-de-tupac-amaru-ii", "independencia-de-estados-unidos", "constitucion-de-estados-unidos"],
  personajes: ["rousseau", "franklin", "james-cook", "james-watt", "washington", "jefferson", "tupac-amaru-ii"],
};

export const TECNICAS_HISTORIA_EDAD_MODERNA: TecnicaHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-tecnica-anclas-de-1492",
    grupo: "edad-moderna",
    orden: 1,
    requierePro: false,
    nombre: "Antes y después de 1492: usa la ancla de la Edad Moderna",
    descripcion: "Ubica los hechos del cuarto de siglo posterior a la llegada de Colón según su distancia a esa ancla.",
    conceptos: { introduce: [], usa: ["anclas", "epocas-historicas"], repasa: ["anclas", "epocas-historicas"] },
    ensena: ENSENA_1,
    pasos: [
      `Recuerda: una ancla es una fecha que sabes bien y usas como referencia. La de la Edad Moderna es ${A("llegada-de-colon")}, la llegada de Colón a América: por convención escolar, la Edad Moderna empieza con ella.`,
      `Ese mismo año ocurrió ${Q("caida-de-granada")}. Dos años después, en ${A("tratado-de-tordesillas")}, Castilla y Portugal firmaron el Tratado de Tordesillas para repartirse las zonas de exploración; y en ${A("vasco-da-gama-en-la-india")} Vasco da Gama llegó a la India por mar, rodeando África.`,
      `El Renacimiento, del que forman parte Leonardo da Vinci (la ${Q("mona-lisa")}, ${AH("mona-lisa")}) y Miguel Ángel (el techo de la Capilla Sixtina, ${A("capilla-sixtina")}), sigue de cerca.`,
      `Y solo ${DIST("noventa-y-cinco-tesis", "llegada-de-colon")} años después de la ancla, Lutero publicó sus 95 tesis (${A("noventa-y-cinco-tesis")}) y empezó la Reforma protestante. Ubicar cada hecho por su distancia a 1492 vuelve fácil recordar su orden.`,
    ],
    visuales: [linea(1, "Un cuarto de siglo a partir de la ancla de 1492", ENSENA_1.hechos), fichas(3, "Seis protagonistas", ENSENA_1.personajes)],
    quiz: [
      pregPrimero("tratado-de-tordesillas", "vasco-da-gama-en-la-india"),
      pregPrimero("vasco-da-gama-en-la-india", "noventa-y-cinco-tesis"),
      pregEpoca("capilla-sixtina"),
      pregQuien("lutero", ["colon", "leonardo-da-vinci", "copernico"]),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-tecnica-cadenas-de-la-conquista",
    grupo: "edad-moderna",
    orden: 2,
    requierePro: false,
    nombre: "Cadenas de dos pasos: de Colón al Virreinato",
    descripcion: "Une la llegada de Colón con la caída de Tenochtitlan y con el Virreinato de Nueva España, y otros hechos de la exploración.",
    conceptos: { introduce: [], usa: ["cadenas-causales"], repasa: ["cadenas-causales"] },
    ensena: ENSENA_2,
    pasos: [
      "Recuerda: una cadena de dos pasos une tres hechos, A provoca B y B provoca C. Ante una pregunta que une dos hechos lejanos, busca el hecho intermedio.",
      `Ejemplo: el viaje de Colón (${A("llegada-de-colon")}) abrió el camino a nuevas expediciones; una de ellas, la de Hernán Cortés, terminó con la ${Q("caida-de-tenochtitlan")} (${A("caida-de-tenochtitlan")}); y después se creó el ${Q("virreinato-de-nueva-espana")} (${A("virreinato-de-nueva-espana")}). Los historiadores señalan varias causas de esa caída, entre ellas las alianzas de los españoles con pueblos enemigos de los mexicas y las epidemias.`,
      `Otra cadena: la expedición de Magallanes partió de España (${A("magallanes-parte")}) y, tras la muerte de Magallanes en Filipinas, Elcano la completó: la primera vuelta al mundo (${A("primera-vuelta-al-mundo")}).`,
      `Estos hechos están en la línea de abajo, junto con la captura de Atahualpa por Pizarro (${A("captura-de-atahualpa")}), la batalla de Panipat, que dio origen al Imperio mogol en la India, y la teoría de Copérnico (${A("de-revolutionibus")}).`,
    ],
    visuales: [
      causas(1, "De Colón al Virreinato", CADENA_2),
      linea(3, "Ocho hechos de 1492 a 1543", ENSENA_2.hechos),
      fichas(3, "Ocho protagonistas", ENSENA_2.personajes),
    ],
    quiz: [
      pregConsecuencia("llegada-de-colon", "caida-de-tenochtitlan", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregCausa("virreinato-de-nueva-espana", "caida-de-tenochtitlan", ["de-revolutionibus", "armada-invencible", "telescopio-de-galileo"]),
      pregConsecuencia("magallanes-parte", "primera-vuelta-al-mundo", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregQuien("elcano", ["magallanes", "colon", "vasco-da-gama"]),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-tecnica-sincronia-siglo-xvi",
    grupo: "edad-moderna",
    orden: 3,
    requierePro: false,
    nombre: "Fines del siglo XVI y comienzos del XVII: cuatro regiones a la vez",
    descripcion: "Aplica la sincronía: qué pasaba a la vez en la India, Europa, Japón y América del Norte.",
    conceptos: { introduce: [], usa: ["sincronia"], repasa: ["sincronia"] },
    ensena: ENSENA_3,
    pasos: [
      "Recuerda: la sincronía es comparar lo que ocurría a la vez en regiones distintas sobre un mismo eje de tiempo, para no mezclar civilizaciones.",
      `Ejemplo: en la India comenzó el reinado de Akbar (${A("reinado-de-akbar")}); en Europa fue derrotada la ${Q("armada-invencible")} (${A("armada-invencible")}) y Cervantes publicó ${Q("don-quijote")} (${A("don-quijote")}); en Japón se inició el ${Q("shogunato-tokugawa")} (${A("shogunato-tokugawa")}); y en América del Norte se fundó ${Q("fundacion-de-jamestown")} (${A("fundacion-de-jamestown")}).`,
      `Estos hechos ocurrieron en aproximadamente medio siglo, pero en mundos casi sin contacto entre sí. Otros tres completan la línea: ${Q("batalla-de-sekigahara")} (${A("batalla-de-sekigahara")}), ${Q("telescopio-de-galileo")} (${A("telescopio-de-galileo")}) y ${Q("guerra-de-los-treinta-anios")} (${A("guerra-de-los-treinta-anios")}).`,
      "Cinco protagonistas de esa época: Akbar, Tokugawa Ieyasu, Shakespeare, Cervantes y Galileo.",
    ],
    visuales: [
      sincronia(1, `De ${A("reinado-de-akbar")} a ${A("fundacion-de-jamestown")}, cuatro regiones`, SINCRONIA_3),
      linea(2, "Ocho hechos de 1556 a 1618", ENSENA_3.hechos),
      fichas(3, "Cinco protagonistas", ENSENA_3.personajes),
    ],
    quiz: [
      pregPrimero("reinado-de-akbar", "armada-invencible"),
      pregPrimero("armada-invencible", "shogunato-tokugawa"),
      pregSiglo("shogunato-tokugawa"),
      pregQuien("cervantes", ["shakespeare", "galileo", "akbar"]),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-tecnica-personajes-siglo-xvii",
    grupo: "edad-moderna",
    orden: 4,
    requierePro: false,
    nombre: "Reconocer personajes del siglo XVII por su rol",
    descripcion: "Distingue a una reina africana, un emperador mogol y un científico inglés por su rol, su época y el hecho que los identifica.",
    conceptos: { introduce: [], usa: ["personajes-por-rol"], repasa: ["personajes-por-rol"] },
    ensena: ENSENA_4,
    pasos: [
      "Recuerda: para no confundir personajes, guarda tres datos de cada uno: su rol, su época y un hecho con el que se le asocia.",
      `Ejemplo: Nzinga fue reina de Ndongo y Matamba y resistió durante décadas la presión portuguesa (${A("nzinga-reina")}); Shah Jahan, emperador mogol, mandó construir el Taj Mahal (${A("comienzo-del-taj-mahal")}); e Isaac Newton, científico inglés, publicó los Principia (${A("principia-de-newton")}).`,
      `Alrededor de ellos ocurren hechos de otros lugares: la llegada de los primeros africanos esclavizados a Virginia (${A("africanos-esclavizados-en-virginia")}), la Paz de Westfalia (${A("paz-de-westfalia")}), la dinastía Qing en China (${A("dinastia-qing")}) y la guerra de los Siete Años (${A("guerra-de-los-siete-anios")}).`,
    ],
    visuales: [fichas(1, "Tres personajes, tres roles", ENSENA_4.personajes), linea(2, "Siete hechos del siglo XVII y mediados del XVIII", ENSENA_4.hechos)],
    quiz: [
      pregQuien("nzinga", ["shah-jahan", "newton", "cleopatra"]),
      pregQuien("newton", ["shah-jahan", "galileo", "copernico"]),
      pregPrimero("comienzo-del-taj-mahal", "guerra-de-los-siete-anios"),
      preg(
        "¿Qué tres datos conviene guardar de cada personaje?",
        "Su rol, su época y un hecho con el que se le asocia",
        ["Su altura, su peso y su edad", "Solo su nombre completo", "Su color favorito y su comida"],
        "Con el rol, la época y un hecho asociado se reconoce a un personaje sin confundirlo con otro."
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-tecnica-cadena-hacia-la-independencia-de-eeuu",
    grupo: "edad-moderna",
    orden: 5,
    requierePro: false,
    nombre: "Una cadena de tres hechos: de la guerra de los Siete Años a la Constitución",
    descripcion: "Une la guerra de los Siete Años, la independencia de Estados Unidos y su Constitución, y ubica los hechos de fines del siglo XVIII.",
    conceptos: { introduce: [], usa: ["causa-y-consecuencia"], repasa: ["causa-y-consecuencia"] },
    ensena: ENSENA_5,
    pasos: [
      "Recuerda: una consecuencia nunca es anterior a su causa, y una cadena se comprueba leyéndola hacia atrás con «porque» y hacia delante con «entonces».",
      `Ejemplo: la guerra de los Siete Años (${A("guerra-de-los-siete-anios")}) dejó al Reino Unido con grandes deudas; el gobierno británico impuso nuevos impuestos a sus colonias de América del Norte; las colonias protestaron y declararon su independencia (${A("independencia-de-estados-unidos")}); y crearon su Constitución (${A("constitucion-de-estados-unidos")}).`,
      `Fines del siglo XVIII fue también el tiempo del ${Q("contrato-social")} de Rousseau (${A("contrato-social")}), la máquina de vapor de Watt (${A("maquina-de-vapor-de-watt")}), el viaje de Cook a Australia (${A("cook-en-australia")}) y la rebelión de Túpac Amaru II en los Andes (${A("rebelion-de-tupac-amaru-ii")}).`,
      "Simplificación de nivel escolar: cada hecho tiene más de una causa. Aquí se muestra la cadena más reconocida.",
    ],
    visuales: [causas(1, "De la guerra a la Constitución", CADENA_5), linea(2, "Seis hechos de 1762 a 1787", ENSENA_5.hechos.filter((h) => h !== "guerra-de-los-siete-anios")), fichas(3, "Siete protagonistas", ENSENA_5.personajes)],
    quiz: [
      pregConsecuencia("guerra-de-los-siete-anios", "independencia-de-estados-unidos", ["caida-de-constantinopla", "biblia-de-gutenberg", "hegira"]),
      pregConsecuencia("independencia-de-estados-unidos", "constitucion-de-estados-unidos", ["caida-de-constantinopla", "llegada-de-colon", "hegira"]),
      pregCausa("independencia-de-estados-unidos", "guerra-de-los-siete-anios", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregQuien("jefferson", ["washington", "franklin", "rousseau"]),
    ],
  },
];

void N;
