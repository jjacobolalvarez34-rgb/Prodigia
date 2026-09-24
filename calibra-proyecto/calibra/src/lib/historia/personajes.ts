import type { CategoriaPersonaje, Personaje, Region } from "./tipos";
import { epocaDeAnio } from "./epocas";

// TABLA CANÓNICA DE PERSONAJES (ver hechos.ts). Cada fila alimenta las pistas del
// modo «Personajes», las fichas de Aprender (`historia.personaje`) y las
// comprobaciones de anacronismo (un personaje solo puede figurar en hechos en los
// que estaba vivo).
//
// Reglas:
//  - `nac`/`mue` en años con signo (a. C. negativo); null si no se conocen. `auge`
//    es el año en que se lo sitúa (mitad del reinado, de la obra o de su vida
//    activa) y decide su época;
//  - `aprox` = true cuando alguna fecha de vida es aproximada o tiene variantes
//    entre los libros (Confucio, Buda, Homero, Newton por el cambio de calendario...);
//  - `logro`: UNA frase que lo identifica sin ambigüedad. Redacción neutra y
//    factual: sin juicios morales ni interpretación política;
//  - `rol` + `pueblo` deciden qué otros personajes NO pueden ser distractores de
//    una pista de rol (mismo `categoria` y mismo `pueblo` = pista compatible).

function p(
  id: string,
  nombre: string,
  rol: string,
  categoria: CategoriaPersonaje,
  pueblo: string,
  region: Region,
  nac: number | null,
  mue: number | null,
  auge: number,
  prominencia: number,
  logro: string,
  aprox = false
): Personaje {
  return { id, nombre, rol, categoria, pueblo, epoca: epocaDeAnio(auge), region, nac, mue, auge, aprox, prominencia, logro };
}

export const PERSONAJES: Personaje[] = [
  // ---------------------------------------------------------------- Antigüedad
  p("hammurabi", "Hammurabi", "Rey de Babilonia", "gobernante", "Babilonia", "oriente-proximo", null, -1750, -1770, 7, "Hizo grabar en una estela un famoso conjunto de leyes.", true),
  p("ramses-ii", "Ramsés II", "Faraón de Egipto", "gobernante", "Egipto", "africa", -1303, -1213, -1250, 7, "Reinó más de sesenta años y libró la batalla de Kadesh contra los hititas.", true),
  p("homero", "Homero", "Poeta griego", "escritor", "Grecia", "europa", null, null, -750, 8, "Se le atribuyen la Ilíada y la Odisea.", true),
  p("ciro-ii", "Ciro II el Grande", "Rey de Persia", "gobernante", "Persia", "oriente-proximo", null, -530, -550, 6, "Fundó el Imperio persa aqueménida y conquistó Babilonia.", true),
  p("buda", "Buda (Siddhartha Gautama)", "Maestro espiritual de la India", "religioso", "India", "asia-sur", null, null, -500, 8, "Su enseñanza dio origen al budismo.", true),
  p("confucio", "Confucio", "Filósofo chino", "filosofo", "China", "asia-oriental", -551, -479, -500, 8, "Sus enseñanzas sobre la conducta y el buen gobierno dieron origen al confucianismo.", true),
  p("leonidas", "Leónidas", "Rey de Esparta", "gobernante", "Esparta", "europa", null, -480, -480, 5, "Murió defendiendo el paso de las Termópilas contra el ejército persa.", true),
  p("jerjes-i", "Jerjes I", "Rey de Persia", "gobernante", "Persia", "oriente-proximo", -519, -465, -480, 3, "Dirigió la segunda invasión persa de Grecia.", true),
  p("pericles", "Pericles", "Estadista ateniense", "politico", "Grecia", "europa", -495, -429, -447, 6, "Impulsó la reconstrucción de la Acrópolis de Atenas, con el Partenón.", true),
  p("socrates", "Sócrates", "Filósofo griego", "filosofo", "Grecia", "europa", -470, -399, -420, 9, "Enseñaba dialogando con preguntas, no dejó nada escrito y fue condenado a muerte en Atenas.", true),
  p("platon", "Platón", "Filósofo griego", "filosofo", "Grecia", "europa", -428, -348, -387, 8, "Fundó la Academia de Atenas y fue discípulo de Sócrates.", true),
  p("aristoteles", "Aristóteles", "Filósofo griego", "filosofo", "Grecia", "europa", -384, -322, -335, 9, "Fundó el Liceo y fue maestro de Alejandro Magno."),
  p("alejandro-magno", "Alejandro Magno", "Rey de Macedonia", "gobernante", "Macedonia", "europa", -356, -323, -331, 10, "Conquistó el Imperio persa y llegó con su ejército hasta el valle del Indo."),
  p("chandragupta", "Chandragupta Maurya", "Fundador del Imperio maurya", "gobernante", "India", "asia-sur", -340, -297, -321, 3, "Fundó un gran imperio en el norte de la India, el primero que unió gran parte del subcontinente.", true),
  p("euclides", "Euclides", "Matemático griego", "cientifico", "Grecia", "africa", null, null, -300, 5, "Escribió los Elementos, el gran tratado de geometría de la Antigüedad.", true),
  p("asoka", "Aśoka", "Emperador maurya", "gobernante", "India", "asia-sur", -304, -232, -261, 4, "Tras la guerra de Kalinga adoptó el budismo y difundió sus enseñanzas.", true),
  p("qin-shi-huang", "Qin Shi Huang", "Primer emperador de China", "gobernante", "China", "asia-oriental", -259, -210, -221, 8, "Unificó China y se hizo enterrar con un ejército de terracota."),
  p("anibal", "Aníbal", "General cartaginés", "militar", "Cartago", "africa", -247, -183, -218, 8, "Cruzó los Alpes con elefantes para atacar Roma.", true),
  p("espartaco", "Espartaco", "Líder de una rebelión de esclavos", "militar", "Roma", "europa", null, -71, -72, 5, "Lideró una gran rebelión de esclavos y gladiadores contra Roma.", true),
  p("julio-cesar", "Julio César", "General y político romano", "politico", "Roma", "europa", -100, -44, -49, 10, "Conquistó la Galia, cruzó el Rubicón y fue asesinado en los idus de marzo.", true),
  p("cleopatra", "Cleopatra VII", "Reina de Egipto", "gobernante", "Egipto", "africa", -69, -30, -40, 9, "Fue la última reina del Egipto ptolemaico y aliada de Marco Antonio."),
  p("augusto", "Augusto", "Primer emperador romano", "gobernante", "Roma", "europa", -63, 14, -27, 8, "Fue el primer emperador de Roma y heredero adoptivo de Julio César."),
  p("cai-lun", "Cai Lun", "Funcionario de la corte china", "cientifico", "China", "asia-oriental", null, 121, 105, 3, "Presentó al emperador el papel como material para escribir.", true),
  p("constantino", "Constantino I", "Emperador romano", "gobernante", "Roma", "europa", 272, 337, 320, 8, "Dictó el Edicto de Milán y trasladó la capital a una nueva ciudad junto al Bósforo.", true),

  // ---------------------------------------------------------------- Edad Media
  p("justiniano", "Justiniano I", "Emperador bizantino", "gobernante", "Imperio bizantino", "europa", 482, 565, 537, 4, "Ordenó compilar el derecho romano y construir Santa Sofía."),
  p("mahoma", "Mahoma", "Profeta y líder religioso de Arabia", "religioso", "Arabia", "oriente-proximo", 570, 632, 622, 9, "Su predicación dio origen al islam y encabezó la Hégira a Medina.", true),
  p("carlomagno", "Carlomagno", "Rey de los francos", "gobernante", "Francos", "europa", 742, 814, 800, 9, "Fue coronado emperador por el papa el día de Navidad del año 800.", true),
  p("al-juarismi", "Al-Juarismi", "Matemático del mundo islámico", "cientifico", "Mundo islámico", "oriente-proximo", 780, 850, 830, 4, "De su nombre proviene la palabra «algoritmo» y de su libro, la palabra «álgebra».", true),
  p("murasaki-shikibu", "Murasaki Shikibu", "Escritora japonesa", "escritor", "Japón", "asia-oriental", null, null, 1010, 3, "Escribió El relato de Genji, considerada una de las primeras novelas del mundo.", true),
  p("avicena", "Avicena", "Médico y filósofo persa", "cientifico", "Mundo islámico", "oriente-proximo", 980, 1037, 1025, 4, "Escribió el Canon de medicina, que se estudió en universidades durante siglos."),
  p("leif-erikson", "Leif Erikson", "Explorador nórdico", "explorador", "Vikingos", "america", null, null, 1000, 5, "Llegó a América del Norte hacia el año 1000, siglos antes que Colón.", true),
  p("guillermo-el-conquistador", "Guillermo el Conquistador", "Duque de Normandía y rey de Inglaterra", "gobernante", "Normandía", "europa", 1028, 1087, 1066, 5, "Venció en la batalla de Hastings y se convirtió en rey de Inglaterra.", true),
  p("saladino", "Saladino", "Sultán de Egipto y Siria", "gobernante", "Mundo islámico", "oriente-proximo", 1137, 1193, 1187, 5, "Reconquistó Jerusalén en 1187.", true),
  p("minamoto-no-yoritomo", "Minamoto no Yoritomo", "Primer shogun de Japón", "gobernante", "Japón", "asia-oriental", 1147, 1199, 1192, 3, "Estableció el gobierno militar del shogunato de Kamakura."),
  p("gengis-kan", "Gengis Kan", "Fundador del Imperio mongol", "gobernante", "Mongolia", "asia-central", 1162, 1227, 1206, 9, "Unió a las tribus mongolas y fundó el mayor imperio continental de su tiempo.", true),
  p("kublai-kan", "Kublai Kan", "Emperador mongol de China", "gobernante", "Mongolia", "asia-oriental", 1215, 1294, 1271, 6, "Nieto de Gengis Kan, fundó la dinastía Yuan en China."),
  p("sundiata-keita", "Sundiata Keita", "Fundador del Imperio de Mali", "gobernante", "Mali", "africa", null, null, 1235, 3, "Fundó el Imperio de Mali en África occidental.", true),
  p("marco-polo", "Marco Polo", "Mercader veneciano", "explorador", "Venecia", "asia-oriental", 1254, 1324, 1275, 8, "Viajó hasta la corte de Kublai Kan y relató sus viajes en un famoso libro."),
  p("mansa-musa", "Mansa Musa", "Emperador de Mali", "gobernante", "Mali", "africa", null, null, 1324, 5, "Su peregrinación a La Meca, con grandes cantidades de oro, lo hizo famoso en todo el mundo.", true),
  p("ibn-battuta", "Ibn Battuta", "Viajero marroquí", "explorador", "Marruecos", "africa", 1304, 1368, 1340, 4, "Recorrió África, Asia y parte de Europa durante casi treinta años y dictó el libro de sus viajes.", true),
  p("zheng-he", "Zheng He", "Almirante chino", "explorador", "China", "asia-oriental", 1371, 1433, 1405, 4, "Dirigió grandes flotas chinas hasta el océano Índico y las costas de África oriental.", true),
  p("juana-de-arco", "Juana de Arco", "Heroína militar francesa", "militar", "Francia", "europa", 1412, 1431, 1429, 8, "Lideró tropas francesas en Orleans durante la guerra de los Cien Años y murió en la hoguera.", true),
  p("pachacutec", "Pachacútec", "Gobernante inca", "gobernante", "Imperio inca", "america", null, null, 1438, 4, "Transformó el señorío del Cusco en el Imperio inca.", true),
  p("mehmed-ii", "Mehmed II", "Sultán otomano", "gobernante", "Imperio otomano", "oriente-proximo", 1432, 1481, 1453, 4, "Conquistó Constantinopla en 1453."),
  p("gutenberg", "Johannes Gutenberg", "Impresor alemán", "cientifico", "Alemania", "europa", null, 1468, 1455, 8, "Desarrolló en Europa la imprenta de tipos móviles.", true),

  // ---------------------------------------------------------------- Edad Moderna
  p("colon", "Cristóbal Colón", "Navegante genovés al servicio de Castilla", "explorador", "Génova", "america", 1451, 1506, 1492, 10, "Llegó a América en 1492 en un viaje financiado por la corona de Castilla.", true),
  p("isabel-de-castilla", "Isabel I de Castilla", "Reina de Castilla", "gobernante", "Castilla", "europa", 1451, 1504, 1492, 5, "Junto con su esposo Fernando, apoyó el viaje de Colón en 1492."),
  p("vasco-da-gama", "Vasco da Gama", "Navegante portugués", "explorador", "Portugal", "asia-sur", 1469, 1524, 1498, 7, "Abrió la ruta marítima de Europa a la India rodeando África.", true),
  p("leonardo-da-vinci", "Leonardo da Vinci", "Artista e inventor italiano", "artista", "Italia", "europa", 1452, 1519, 1503, 10, "Pintó la Mona Lisa y dibujó estudios de anatomía y de máquinas."),
  p("miguel-angel", "Miguel Ángel", "Escultor y pintor italiano", "artista", "Italia", "europa", 1475, 1564, 1508, 9, "Esculpió el David y pintó el techo de la Capilla Sixtina."),
  p("lutero", "Martín Lutero", "Teólogo alemán", "religioso", "Alemania", "europa", 1483, 1546, 1517, 9, "Sus 95 tesis dieron inicio a la Reforma protestante."),
  p("magallanes", "Fernando de Magallanes", "Navegante portugués al servicio de España", "explorador", "Portugal", "global", 1480, 1521, 1519, 7, "Dirigió la expedición de la primera vuelta al mundo, pero murió en Filipinas antes de que terminara.", true),
  p("elcano", "Juan Sebastián Elcano", "Navegante español", "explorador", "España", "global", null, 1526, 1522, 3, "Completó la primera vuelta al mundo al mando de la nave Victoria.", true),
  p("hernan-cortes", "Hernán Cortés", "Conquistador español", "militar", "España", "america", 1485, 1547, 1521, 8, "Dirigió la expedición que derrotó al Imperio azteca."),
  p("moctezuma-ii", "Moctezuma II", "Gobernante mexica", "gobernante", "Imperio azteca", "america", null, 1520, 1519, 5, "Gobernaba Tenochtitlan cuando llegaron los españoles.", true),
  p("pizarro", "Francisco Pizarro", "Conquistador español", "militar", "España", "america", null, 1541, 1532, 7, "Dirigió la conquista del Imperio inca.", true),
  p("atahualpa", "Atahualpa", "Gobernante inca", "gobernante", "Imperio inca", "america", null, 1533, 1532, 5, "Fue capturado por Pizarro en Cajamarca.", true),
  p("babur", "Babur", "Fundador del Imperio mogol", "gobernante", "Imperio mogol", "asia-sur", 1483, 1530, 1526, 3, "Venció en Panipat y fundó el Imperio mogol en la India."),
  p("copernico", "Nicolás Copérnico", "Astrónomo polaco", "cientifico", "Polonia", "europa", 1473, 1543, 1543, 8, "Propuso que la Tierra y los planetas giran alrededor del Sol."),
  p("akbar", "Akbar", "Emperador mogol", "gobernante", "Imperio mogol", "asia-sur", 1542, 1605, 1570, 4, "Emperador mogol conocido por su política de tolerancia entre religiones."),
  p("tokugawa-ieyasu", "Tokugawa Ieyasu", "Primer shogun Tokugawa", "gobernante", "Japón", "asia-oriental", 1543, 1616, 1603, 4, "Fundó el shogunato que gobernó Japón durante más de doscientos años."),
  p("shakespeare", "William Shakespeare", "Dramaturgo inglés", "escritor", "Inglaterra", "europa", 1564, 1616, 1600, 8, "Escribió Hamlet, Romeo y Julieta y Macbeth."),
  p("cervantes", "Miguel de Cervantes", "Escritor español", "escritor", "España", "europa", 1547, 1616, 1605, 8, "Escribió Don Quijote de la Mancha."),
  p("galileo", "Galileo Galilei", "Físico y astrónomo italiano", "cientifico", "Italia", "europa", 1564, 1642, 1609, 9, "Observó con el telescopio las lunas de Júpiter."),
  p("nzinga", "Nzinga", "Reina de Ndongo y Matamba", "gobernante", "Ndongo", "africa", 1583, 1663, 1624, 3, "Resistió durante décadas la presión portuguesa en el África central."),
  p("shah-jahan", "Shah Jahan", "Emperador mogol", "gobernante", "Imperio mogol", "asia-sur", 1592, 1666, 1632, 4, "Mandó construir el Taj Mahal como mausoleo de su esposa."),
  p("newton", "Isaac Newton", "Científico inglés", "cientifico", "Inglaterra", "europa", 1643, 1727, 1687, 9, "Formuló la ley de la gravitación universal.", true),
  p("rousseau", "Jean-Jacques Rousseau", "Filósofo de la Ilustración", "filosofo", "Suiza y Francia", "europa", 1712, 1778, 1762, 4, "Escribió El contrato social."),
  p("franklin", "Benjamin Franklin", "Científico y político estadounidense", "politico", "Estados Unidos", "america", 1706, 1790, 1776, 5, "Estudió la electricidad, inventó el pararrayos y participó en la Declaración de Independencia."),
  p("james-cook", "James Cook", "Navegante británico", "explorador", "Reino Unido", "oceania", 1728, 1779, 1770, 4, "Exploró el Pacífico y llegó a la costa este de Australia."),
  p("james-watt", "James Watt", "Ingeniero escocés", "cientifico", "Escocia", "europa", 1736, 1819, 1769, 5, "Mejoró la máquina de vapor y la hizo útil para la industria."),
  p("washington", "George Washington", "Presidente de Estados Unidos", "politico", "Estados Unidos", "america", 1732, 1799, 1781, 9, "Comandó el ejército continental y fue el primer presidente de Estados Unidos."),
  p("jefferson", "Thomas Jefferson", "Presidente de Estados Unidos", "politico", "Estados Unidos", "america", 1743, 1826, 1776, 5, "Redactó la Declaración de Independencia y fue el tercer presidente de Estados Unidos."),
  p("tupac-amaru-ii", "Túpac Amaru II", "Líder de una rebelión andina", "militar", "Perú", "america", 1738, 1781, 1780, 3, "Encabezó una gran rebelión en los Andes contra la administración colonial."),

  // ---------------------------------------------------------------- Edad Contemporánea
  p("toussaint-louverture", "Toussaint Louverture", "Líder de la revolución haitiana", "militar", "Haití", "america", 1743, 1803, 1793, 5, "Fue el principal líder de la revolución de los esclavizados en Haití.", true),
  p("jenner", "Edward Jenner", "Médico inglés", "cientifico", "Inglaterra", "europa", 1749, 1823, 1796, 4, "Desarrolló la primera vacuna, contra la viruela."),
  p("napoleon", "Napoleón Bonaparte", "Emperador de los franceses", "gobernante", "Francia", "europa", 1769, 1821, 1804, 10, "Se coronó emperador de los franceses en 1804 y fue derrotado en Waterloo."),
  p("champollion", "Jean-François Champollion", "Egiptólogo francés", "cientifico", "Francia", "europa", 1790, 1832, 1822, 4, "Descifró los jeroglíficos egipcios."),
  p("shaka", "Shaka", "Rey de los zulúes", "gobernante", "Zulúes", "africa", null, 1828, 1816, 3, "Fundó y expandió el reino zulú en África austral.", true),
  p("jose-de-san-martin", "José de San Martín", "General de la independencia sudamericana", "militar", "Río de la Plata", "america", 1778, 1850, 1817, 8, "Cruzó los Andes con su ejército para liberar Chile y Perú."),
  p("simon-bolivar", "Simón Bolívar", "Libertador sudamericano", "politico", "Venezuela", "america", 1783, 1830, 1819, 9, "Encabezó la independencia de varios países de América del Sur."),
  p("marx", "Karl Marx", "Filósofo alemán", "filosofo", "Alemania", "europa", 1818, 1883, 1848, 7, "Coautor del Manifiesto del Partido Comunista."),
  p("darwin", "Charles Darwin", "Naturalista inglés", "cientifico", "Inglaterra", "europa", 1809, 1882, 1859, 9, "Propuso la evolución por selección natural en El origen de las especies."),
  p("lincoln", "Abraham Lincoln", "Presidente de Estados Unidos", "politico", "Estados Unidos", "america", 1809, 1865, 1863, 9, "Fue presidente durante la guerra de Secesión y proclamó la emancipación de los esclavizados."),
  p("bismarck", "Otto von Bismarck", "Canciller alemán", "politico", "Alemania", "europa", 1815, 1898, 1871, 6, "Canciller que unificó Alemania bajo el liderazgo de Prusia."),
  p("emperador-meiji", "Emperador Meiji", "Emperador de Japón", "gobernante", "Japón", "asia-oriental", 1852, 1912, 1868, 3, "Su reinado inició la modernización industrial y política de Japón."),
  p("bell", "Alexander Graham Bell", "Inventor escocés-estadounidense", "cientifico", "Estados Unidos", "america", 1847, 1922, 1876, 6, "Obtuvo la primera patente del teléfono, en 1876."),
  p("menelik-ii", "Menelik II", "Emperador de Etiopía", "gobernante", "Etiopía", "africa", 1844, 1913, 1896, 3, "Derrotó a Italia en la batalla de Adua."),
  p("marie-curie", "Marie Curie", "Científica polaca y francesa", "cientifico", "Polonia y Francia", "europa", 1867, 1934, 1903, 9, "Investigó la radiactividad y recibió dos premios Nobel en ciencias distintas."),
  p("sun-yat-sen", "Sun Yat-sen", "Líder político chino", "politico", "China", "asia-oriental", 1866, 1925, 1912, 3, "Fue el primer presidente provisional de la República de China."),
  p("tagore", "Rabindranath Tagore", "Escritor bengalí", "escritor", "India", "asia-sur", 1861, 1941, 1913, 3, "Fue el primer escritor no europeo en recibir el Nobel de Literatura."),
  p("einstein", "Albert Einstein", "Físico alemán", "cientifico", "Alemania", "europa", 1879, 1955, 1905, 10, "Formuló la teoría de la relatividad."),
  p("lenin", "Vladímir Lenin", "Líder bolchevique ruso", "politico", "Rusia", "europa", 1870, 1924, 1917, 8, "Encabezó a los bolcheviques en la Revolución de octubre de 1917."),
  p("gandhi", "Mahatma Gandhi", "Líder de la independencia de la India", "politico", "India", "asia-sur", 1869, 1948, 1930, 9, "Lideró la lucha por la independencia de la India con métodos no violentos."),
  p("fleming", "Alexander Fleming", "Científico escocés", "cientifico", "Escocia", "europa", 1881, 1955, 1928, 7, "Descubrió la penicilina en 1928."),
  p("franklin-roosevelt", "Franklin D. Roosevelt", "Presidente de Estados Unidos", "politico", "Estados Unidos", "america", 1882, 1945, 1941, 7, "Fue presidente durante la Gran Depresión y casi toda la Segunda Guerra Mundial."),
  p("eleanor-roosevelt", "Eleanor Roosevelt", "Diplomática estadounidense", "politico", "Estados Unidos", "global", 1884, 1962, 1948, 4, "Presidió el comité que redactó la Declaración Universal de Derechos Humanos."),
  p("hitler", "Adolf Hitler", "Canciller de Alemania", "politico", "Alemania", "europa", 1889, 1945, 1939, 7, "Fue canciller de Alemania desde 1933 y líder del régimen nazi durante la Segunda Guerra Mundial."),
  p("churchill", "Winston Churchill", "Primer ministro británico", "politico", "Reino Unido", "europa", 1874, 1965, 1944, 8, "Fue primer ministro del Reino Unido durante la mayor parte de la Segunda Guerra Mundial."),
  p("stalin", "Iósif Stalin", "Líder de la Unión Soviética", "politico", "Unión Soviética", "europa", 1878, 1953, 1942, 6, "Gobernó la Unión Soviética durante casi treinta años, incluida la Segunda Guerra Mundial."),
  p("nehru", "Jawaharlal Nehru", "Primer ministro de la India", "politico", "India", "asia-sur", 1889, 1964, 1947, 4, "Fue el primer jefe de gobierno de la India independiente."),
  p("mao-zedong", "Mao Zedong", "Líder político chino", "politico", "China", "asia-oriental", 1893, 1976, 1949, 7, "Proclamó la República Popular China en 1949."),
  p("nkrumah", "Kwame Nkrumah", "Líder de la independencia de Ghana", "politico", "Ghana", "africa", 1909, 1972, 1957, 3, "Lideró la independencia de Ghana y fue su primer jefe de gobierno."),
  p("kennedy", "John F. Kennedy", "Presidente de Estados Unidos", "politico", "Estados Unidos", "america", 1917, 1963, 1962, 5, "Era presidente de Estados Unidos durante la crisis de los misiles de Cuba."),
  p("martin-luther-king", "Martin Luther King Jr.", "Líder del movimiento por los derechos civiles", "politico", "Estados Unidos", "america", 1929, 1968, 1963, 8, "Lideró con métodos no violentos el movimiento por los derechos civiles en Estados Unidos."),
  p("gagarin", "Yuri Gagarin", "Cosmonauta soviético", "explorador", "Unión Soviética", "global", 1934, 1968, 1961, 8, "Fue el primer ser humano en viajar al espacio."),
  p("armstrong", "Neil Armstrong", "Astronauta estadounidense", "explorador", "Estados Unidos", "global", 1930, 2012, 1969, 9, "Fue el primer ser humano en pisar la Luna."),
  p("mandela", "Nelson Mandela", "Presidente de Sudáfrica", "politico", "Sudáfrica", "africa", 1918, 2013, 1994, 9, "Pasó 27 años en prisión y fue el primer presidente de Sudáfrica elegido en votaciones multirraciales."),
  p("gorbachov", "Mijaíl Gorbachov", "Último líder de la Unión Soviética", "politico", "Unión Soviética", "europa", 1931, 2022, 1989, 5, "Fue el último líder de la Unión Soviética."),
  p("berners-lee", "Tim Berners-Lee", "Informático británico", "cientifico", "Reino Unido", "europa", 1955, null, 1991, 4, "Inventó la World Wide Web."),
];
