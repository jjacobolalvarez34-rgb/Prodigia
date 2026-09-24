import type { Certeza, EpocaId, Hecho, Region } from "./tipos";

// TABLA CANÓNICA DE HECHOS. Fuente única de la práctica (cronología, fechas,
// causa y efecto), de las lecciones de Aprender y de los visuales. Nada más
// guarda un año ni un nombre: si un dato está mal, se corrige acá y se corrige
// en todas partes. docs/HISTORIA_HECHOS.md se GENERA de esta tabla para la
// revisión humana (historiaTabla.test.ts falla si quedan desincronizados).
//
// REGLAS PARA AGREGAR UN HECHO (el test de la tabla las hace cumplir):
//  - id estable en kebab-case; nunca se renombra;
//  - año con signo (a. C. negativo), sin año 0, dentro de su época;
//  - `certeza`: "exacta" solo si los libros no discrepan en el año; una
//    fecha de tradición o de convención va como "convencional"; una estimación,
//    como "aproximada" (con su `m` de incertidumbre en años);
//  - sin interpretación política ni cifras discutidas (víctimas, etc.);
//  - `p`: personajes VIVOS en ese año (el test detecta anacronismos);
//  - `c`: causas de amplio consenso, solo hechos anteriores;
//  - ante la menor duda de una fecha o de una atribución: no se incluye.
// Frontera de época: el hecho frontera pertenece a la época que empieza.

interface Extra {
  // personajes
  p?: string[];
  // causas
  c?: string[];
  // margen en años
  m?: number;
  // hecho frontera de época
  f?: true;
}

type Base = Omit<Hecho, "epoca">;

const MARGEN_POR_DEFECTO: Record<Certeza, number> = { exacta: 0, convencional: 3, aproximada: 10 };

function h(id: string, nombre: string, anio: number, certeza: Certeza, region: Region, prominencia: number, extra: Extra = {}): Base {
  return {
    id,
    nombre,
    anio,
    certeza,
    margen: extra.m ?? MARGEN_POR_DEFECTO[certeza],
    region,
    prominencia,
    personajes: extra.p ?? [],
    causas: extra.c ?? [],
    ...(extra.f ? { frontera: true as const } : {}),
  };
}

const en = (epoca: EpocaId, filas: Base[]): Hecho[] => filas.map((f) => ({ ...f, epoca }));

// ---------------------------------------------------------------------------
// PREHISTORIA (hasta la invención de la escritura, ~3500 a. C.). Todas las
// fechas son estimaciones con márgenes enormes: la prehistoria no se fecha por año.
// ---------------------------------------------------------------------------
const PREHISTORIA: Base[] = [
  h("herramientas-de-piedra", "Primeras herramientas de piedra talladas", -2500000, "aproximada", "africa", 6, { m: 500000 }),
  h("uso-del-fuego", "Uso controlado del fuego por los homínidos", -800000, "aproximada", "africa", 7, { m: 300000 }),
  h("homo-sapiens", "Aparición de los primeros Homo sapiens en África", -300000, "aproximada", "africa", 8, { m: 50000 }),
  h("humanos-en-australia", "Llegada de los primeros humanos a Australia", -50000, "aproximada", "oceania", 4, { m: 15000 }),
  h("pinturas-de-lascaux", "Pinturas rupestres de Lascaux", -17000, "aproximada", "europa", 6, { m: 3000 }),
  h("poblamiento-de-america", "Llegada de los primeros pobladores a América", -15000, "aproximada", "america", 6, { m: 8000 }),
  h("fin-de-la-glaciacion", "Fin de la última glaciación", -10000, "aproximada", "global", 5, { m: 1500 }),
  h("gobekli-tepe", "Construcción del templo de Göbekli Tepe", -9500, "aproximada", "oriente-proximo", 5, { m: 500 }),
  h("inicio-de-la-agricultura", "Inicio de la agricultura en el Creciente Fértil", -9000, "aproximada", "oriente-proximo", 9, { m: 1000, c: ["fin-de-la-glaciacion"] }),
  h("primeros-objetos-de-cobre", "Primeros objetos de cobre fundido", -5000, "aproximada", "oriente-proximo", 5, { m: 1000 }),
];

// ---------------------------------------------------------------------------
// ANTIGÜEDAD (de la escritura, ~3500 a. C., a la caída de Roma de Occidente, 476)
// ---------------------------------------------------------------------------
const ANTIGUEDAD: Base[] = [
  h("escritura-cuneiforme", "Invención de la escritura en Sumeria", -3500, "convencional", "oriente-proximo", 9, { m: 300, f: true, c: ["inicio-de-la-agricultura"] }),
  h("unificacion-de-egipto", "Unificación del Alto y el Bajo Egipto", -3100, "aproximada", "africa", 4, { m: 100 }),
  h("piramide-de-keops", "Construcción de la Gran Pirámide de Guiza", -2560, "aproximada", "africa", 9, { m: 40 }),
  h("ciudades-del-indo", "Auge de las ciudades del valle del Indo (Harappa y Mohenjo-Daro)", -2600, "aproximada", "asia-sur", 4, { m: 200 }),
  h("codigo-de-hammurabi", "Código de Hammurabi en Babilonia", -1754, "aproximada", "oriente-proximo", 8, { m: 30, p: ["hammurabi"], c: ["escritura-cuneiforme"] }),
  h("dinastia-shang", "Comienzo de la dinastía Shang en China, según la cronología tradicional", -1600, "aproximada", "asia-oriental", 4, { m: 350 }),
  h("olmecas", "Auge de la cultura olmeca en el golfo de México", -1200, "aproximada", "america", 5, { m: 200 }),
  h("fundacion-de-cartago", "Fundación de Cartago, según la tradición", -814, "convencional", "africa", 4),
  h("primeros-juegos-olimpicos", "Primeros Juegos Olímpicos de la Antigüedad", -776, "convencional", "europa", 6),
  h("fundacion-de-roma", "Fundación de Roma, según la tradición", -753, "convencional", "europa", 8),
  h("iliada-y-odisea", "Composición de la Ilíada y la Odisea", -750, "aproximada", "europa", 5, { m: 60, p: ["homero"] }),
  h("republica-romana", "Comienzo de la República romana", -509, "convencional", "europa", 5),
  h("ciro-conquista-babilonia", "Ciro II de Persia conquista Babilonia", -539, "exacta", "oriente-proximo", 5, { p: ["ciro-ii"] }),
  h("ensenanzas-de-buda", "Enseñanzas de Buda y nacimiento del budismo", -500, "aproximada", "asia-sur", 8, { m: 60, p: ["buda"] }),
  h("ensenanzas-de-confucio", "Enseñanzas de Confucio en China", -500, "aproximada", "asia-oriental", 8, { m: 50, p: ["confucio"] }),
  h("batalla-de-maraton", "Batalla de Maratón", -490, "exacta", "europa", 7),
  h("batalla-de-las-termopilas", "Batalla de las Termópilas", -480, "exacta", "europa", 6, { p: ["leonidas", "jerjes-i"] }),
  h("construccion-del-partenon", "Comienzo de la construcción del Partenón", -447, "exacta", "europa", 6, { p: ["pericles"] }),
  h("muerte-de-socrates", "Juicio y muerte de Sócrates", -399, "exacta", "europa", 8, { p: ["socrates"] }),
  h("inicio-conquista-persa", "Alejandro Magno inicia la conquista del Imperio persa", -334, "exacta", "europa", 7, { p: ["alejandro-magno"] }),
  h("muerte-de-alejandro", "Muerte de Alejandro Magno en Babilonia", -323, "exacta", "oriente-proximo", 7, { p: ["alejandro-magno"] }),
  h("imperio-maurya", "Chandragupta funda el Imperio maurya", -321, "aproximada", "asia-sur", 4, { m: 5, p: ["chandragupta"] }),
  h("elementos-de-euclides", "Euclides escribe los Elementos", -300, "aproximada", "africa", 4, { m: 30, p: ["euclides"] }),
  h("guerra-de-kalinga", "Guerra de Kalinga y conversión de Aśoka al budismo", -261, "aproximada", "asia-sur", 3, { m: 3, p: ["asoka"], c: ["imperio-maurya"] }),
  h("unificacion-de-china", "Qin Shi Huang unifica China", -221, "exacta", "asia-oriental", 9, { p: ["qin-shi-huang"] }),
  h("anibal-cruza-los-alpes", "Aníbal cruza los Alpes", -218, "exacta", "europa", 6, { p: ["anibal"] }),
  h("dinastia-han", "Fundación de la dinastía Han en China", -202, "exacta", "asia-oriental", 8),
  h("destruccion-de-cartago", "Destrucción de Cartago por Roma", -146, "exacta", "africa", 5),
  h("cesar-cruza-el-rubicon", "Julio César cruza el Rubicón", -49, "exacta", "europa", 6, { p: ["julio-cesar"] }),
  h("asesinato-de-julio-cesar", "Asesinato de Julio César", -44, "exacta", "europa", 9, { p: ["julio-cesar"] }),
  h("batalla-de-accio", "Batalla de Accio", -31, "exacta", "europa", 4, { p: ["augusto", "cleopatra"], c: ["asesinato-de-julio-cesar"] }),
  h("muerte-de-cleopatra", "Muerte de Cleopatra y fin del Egipto ptolemaico", -30, "exacta", "africa", 4, { p: ["cleopatra"], c: ["batalla-de-accio"] }),
  h("comienzo-del-imperio-romano", "Augusto inicia el Imperio romano", -27, "exacta", "europa", 9, { p: ["augusto"], c: ["batalla-de-accio"] }),
  h("erupcion-del-vesubio", "Erupción del Vesubio y destrucción de Pompeya", 79, "exacta", "europa", 8),
  h("papel-de-cai-lun", "Cai Lun presenta el papel a la corte china", 105, "convencional", "asia-oriental", 5, { p: ["cai-lun"] }),
  h("imperio-gupta", "Comienzo del Imperio gupta en la India", 320, "aproximada", "asia-sur", 3, { m: 10 }),
  h("periodo-clasico-maya", "Comienzo del período clásico maya", 250, "aproximada", "america", 4, { m: 30 }),
  h("edicto-de-milan", "Edicto de Milán", 313, "exacta", "europa", 5, { p: ["constantino"] }),
  h("fundacion-de-constantinopla", "Constantino inaugura Constantinopla como capital", 330, "exacta", "europa", 5, { p: ["constantino"] }),
  h("ezana-de-aksum", "Ezana, rey de Aksum, adopta el cristianismo", 330, "aproximada", "africa", 5, { m: 15 }),
  h("cristianismo-religion-oficial", "El cristianismo se declara religión oficial del Imperio romano", 380, "exacta", "europa", 4, { c: ["edicto-de-milan"] }),
  h("division-del-imperio-romano", "División definitiva del Imperio romano en Oriente y Occidente", 395, "exacta", "europa", 5),
];

// ---------------------------------------------------------------------------
// EDAD MEDIA (476 - 1491)
// ---------------------------------------------------------------------------
const EDAD_MEDIA: Base[] = [
  h("caida-de-roma-occidente", "Caída del Imperio romano de Occidente", 476, "convencional", "europa", 9, { f: true, m: 5 }),
  h("santa-sofia", "Inauguración de Santa Sofía en Constantinopla", 537, "exacta", "europa", 4, { p: ["justiniano"] }),
  h("dinastia-tang", "Comienzo de la dinastía Tang en China", 618, "exacta", "asia-oriental", 5),
  h("hegira", "Hégira: Mahoma y sus seguidores se trasladan de La Meca a Medina", 622, "exacta", "oriente-proximo", 9, { p: ["mahoma"] }),
  h("musulmanes-en-iberia", "Los ejércitos musulmanes llegan a la península ibérica", 711, "exacta", "europa", 5),
  h("batalla-de-poitiers", "Batalla de Poitiers, entre francos y ejércitos musulmanes", 732, "convencional", "europa", 4, { c: ["musulmanes-en-iberia"] }),
  h("fundacion-de-bagdad", "Fundación de Bagdad por los abasíes", 762, "exacta", "oriente-proximo", 5),
  h("coronacion-de-carlomagno", "Carlomagno es coronado emperador", 800, "exacta", "europa", 9, { p: ["carlomagno"] }),
  h("casa-de-la-sabiduria", "Auge de la Casa de la Sabiduría en Bagdad", 830, "aproximada", "oriente-proximo", 4, { m: 20, p: ["al-juarismi"], c: ["fundacion-de-bagdad"] }),
  h("dinastia-song", "Comienzo de la dinastía Song en China", 960, "exacta", "asia-oriental", 3),
  h("leif-en-america", "Leif Erikson llega a América del Norte", 1000, "aproximada", "america", 6, { m: 15, p: ["leif-erikson"] }),
  h("cisma-de-oriente-y-occidente", "Cisma entre las Iglesias de Oriente y Occidente", 1054, "convencional", "europa", 4),
  h("batalla-de-hastings", "Batalla de Hastings", 1066, "exacta", "europa", 7, { p: ["guillermo-el-conquistador"] }),
  h("primera-cruzada", "Comienzo de la Primera Cruzada", 1096, "exacta", "oriente-proximo", 7),
  h("angkor-wat", "Construcción de Angkor Wat en el Imperio jemer", 1130, "aproximada", "asia-sudeste", 5, { m: 20 }),
  h("saladino-recupera-jerusalen", "Saladino recupera Jerusalén", 1187, "exacta", "oriente-proximo", 4, { p: ["saladino"], c: ["primera-cruzada"] }),
  h("shogunato-de-kamakura", "Minamoto no Yoritomo establece el shogunato de Kamakura", 1192, "convencional", "asia-oriental", 4, { p: ["minamoto-no-yoritomo"] }),
  h("gengis-kan-proclamado", "Temüjin es proclamado Gengis Kan", 1206, "exacta", "asia-central", 9, { p: ["gengis-kan"] }),
  h("sultanato-de-delhi", "Fundación del Sultanato de Delhi", 1206, "exacta", "asia-sur", 3),
  h("carta-magna", "Carta Magna en Inglaterra", 1215, "exacta", "europa", 6),
  h("imperio-de-mali", "Sundiata Keita funda el Imperio de Mali", 1235, "aproximada", "africa", 4, { m: 5, p: ["sundiata-keita"] }),
  h("dinastia-yuan", "Kublai Kan funda la dinastía Yuan en China", 1271, "exacta", "asia-oriental", 5, { p: ["kublai-kan"], c: ["gengis-kan-proclamado"] }),
  h("marco-polo-en-china", "Marco Polo llega a la corte de Kublai Kan", 1275, "aproximada", "asia-oriental", 7, { m: 3, p: ["marco-polo", "kublai-kan"] }),
  h("imperio-otomano", "Osmán I funda el Imperio otomano", 1299, "convencional", "oriente-proximo", 4),
  h("gran-zimbabue", "Apogeo del Gran Zimbabue", 1300, "aproximada", "africa", 3, { m: 100 }),
  h("maories-en-nueva-zelanda", "Los maoríes se establecen en Nueva Zelanda", 1300, "aproximada", "oceania", 3, { m: 50 }),
  h("peregrinacion-de-mansa-musa", "Peregrinación de Mansa Musa a La Meca", 1324, "aproximada", "africa", 6, { m: 2, p: ["mansa-musa"], c: ["imperio-de-mali"] }),
  h("fundacion-de-tenochtitlan", "Fundación de Tenochtitlan, según la tradición", 1325, "convencional", "america", 7),
  h("viajes-de-ibn-battuta", "Ibn Battuta inicia sus viajes desde Tánger", 1325, "exacta", "africa", 4, { p: ["ibn-battuta"] }),
  h("guerra-de-los-cien-anios", "Comienzo de la guerra de los Cien Años", 1337, "exacta", "europa", 5),
  h("peste-negra", "La peste negra llega a Europa", 1347, "exacta", "europa", 9),
  h("dinastia-ming", "Comienzo de la dinastía Ming en China", 1368, "exacta", "asia-oriental", 5, { c: ["dinastia-yuan"] }),
  h("expediciones-de-zheng-he", "Primera expedición marítima de Zheng He", 1405, "exacta", "asia-oriental", 4, { p: ["zheng-he"], c: ["dinastia-ming"] }),
  h("juana-de-arco-en-orleans", "Juana de Arco libera Orleans", 1429, "exacta", "europa", 5, { p: ["juana-de-arco"], c: ["guerra-de-los-cien-anios"] }),
  h("expansion-inca", "Pachacútec inicia la expansión del Imperio inca", 1438, "aproximada", "america", 5, { m: 10, p: ["pachacutec"] }),
  h("machu-picchu", "Construcción de Machu Picchu", 1450, "aproximada", "america", 7, { m: 20, c: ["expansion-inca"] }),
  h("caida-de-constantinopla", "Caída de Constantinopla en manos otomanas", 1453, "exacta", "europa", 8, { p: ["mehmed-ii"], c: ["imperio-otomano"] }),
  h("biblia-de-gutenberg", "Gutenberg imprime la Biblia con tipos móviles", 1455, "aproximada", "europa", 8, { m: 3, p: ["gutenberg"] }),
];

// ---------------------------------------------------------------------------
// EDAD MODERNA (1492 - 1788)
// ---------------------------------------------------------------------------
const EDAD_MODERNA: Base[] = [
  h("llegada-de-colon", "Llegada de Colón a América", 1492, "exacta", "america", 10, { f: true, p: ["colon", "isabel-de-castilla"] }),
  h("caida-de-granada", "Caída de Granada, último reino musulmán de la península ibérica", 1492, "exacta", "europa", 5, { p: ["isabel-de-castilla"] }),
  h("tratado-de-tordesillas", "Tratado de Tordesillas entre Castilla y Portugal", 1494, "exacta", "europa", 4, { c: ["llegada-de-colon"] }),
  h("vasco-da-gama-en-la-india", "Vasco da Gama llega a la India por mar", 1498, "exacta", "asia-sur", 6, { p: ["vasco-da-gama"] }),
  h("mona-lisa", "Leonardo da Vinci comienza la Mona Lisa", 1503, "aproximada", "europa", 8, { m: 3, p: ["leonardo-da-vinci"] }),
  h("capilla-sixtina", "Miguel Ángel comienza a pintar el techo de la Capilla Sixtina", 1508, "exacta", "europa", 7, { p: ["miguel-angel"] }),
  h("noventa-y-cinco-tesis", "Lutero publica las 95 tesis y comienza la Reforma protestante", 1517, "exacta", "europa", 9, { p: ["lutero"] }),
  h("magallanes-parte", "Magallanes parte de España con cinco naves hacia las Molucas", 1519, "exacta", "global", 4, { p: ["magallanes"] }),
  h("caida-de-tenochtitlan", "Caída de Tenochtitlan ante los españoles", 1521, "exacta", "america", 9, { p: ["hernan-cortes"], c: ["llegada-de-colon"] }),
  h("primera-vuelta-al-mundo", "La expedición de Magallanes y Elcano completa la primera vuelta al mundo", 1522, "exacta", "global", 8, { p: ["elcano"], c: ["magallanes-parte"] }),
  h("batalla-de-panipat", "Babur funda el Imperio mogol tras la batalla de Panipat", 1526, "exacta", "asia-sur", 4, { p: ["babur"] }),
  h("captura-de-atahualpa", "Captura de Atahualpa en Cajamarca", 1532, "exacta", "america", 6, { p: ["pizarro", "atahualpa"], c: ["llegada-de-colon"] }),
  h("virreinato-de-nueva-espana", "Se crea el Virreinato de Nueva España", 1535, "exacta", "america", 3, { c: ["caida-de-tenochtitlan"] }),
  h("de-revolutionibus", "Copérnico publica su teoría heliocéntrica", 1543, "exacta", "europa", 7, { p: ["copernico"] }),
  h("reinado-de-akbar", "Akbar comienza su reinado en el Imperio mogol", 1556, "exacta", "asia-sur", 3, { p: ["akbar"] }),
  h("armada-invencible", "Derrota de la Armada Invencible", 1588, "exacta", "europa", 6),
  h("batalla-de-sekigahara", "Tokugawa Ieyasu vence en Sekigahara", 1600, "exacta", "asia-oriental", 3, { p: ["tokugawa-ieyasu"] }),
  h("shogunato-tokugawa", "Comienza el shogunato Tokugawa en Japón", 1603, "exacta", "asia-oriental", 4, { p: ["tokugawa-ieyasu"], c: ["batalla-de-sekigahara"] }),
  h("don-quijote", "Cervantes publica la primera parte de Don Quijote", 1605, "exacta", "europa", 6, { p: ["cervantes"] }),
  h("fundacion-de-jamestown", "Fundación de Jamestown, primer asentamiento inglés duradero en América del Norte", 1607, "exacta", "america", 4),
  h("telescopio-de-galileo", "Galileo observa el cielo con el telescopio", 1609, "exacta", "europa", 6, { p: ["galileo"] }),
  h("guerra-de-los-treinta-anios", "Comienzo de la guerra de los Treinta Años", 1618, "exacta", "europa", 5, { c: ["noventa-y-cinco-tesis"] }),
  h("africanos-esclavizados-en-virginia", "Llegan a Virginia los primeros africanos esclavizados", 1619, "exacta", "america", 5, { c: ["fundacion-de-jamestown"] }),
  h("nzinga-reina", "Nzinga se convierte en reina de Ndongo", 1624, "convencional", "africa", 3, { p: ["nzinga"] }),
  h("comienzo-del-taj-mahal", "Comienza la construcción del Taj Mahal", 1632, "convencional", "asia-sur", 6, { p: ["shah-jahan"] }),
  h("paz-de-westfalia", "Paz de Westfalia", 1648, "exacta", "europa", 5, { c: ["guerra-de-los-treinta-anios"] }),
  h("dinastia-qing", "Los manchúes toman Pekín y comienza el dominio de la dinastía Qing en China", 1644, "exacta", "asia-oriental", 4),
  h("principia-de-newton", "Newton publica los Principia", 1687, "exacta", "europa", 7, { p: ["newton"] }),
  h("guerra-de-los-siete-anios", "Guerra de los Siete Años", 1756, "convencional", "global", 4, { m: 2 }),
  h("contrato-social", "Rousseau publica El contrato social", 1762, "exacta", "europa", 5, { p: ["rousseau"] }),
  h("maquina-de-vapor-de-watt", "Watt patenta su máquina de vapor", 1769, "exacta", "europa", 7, { p: ["james-watt"] }),
  h("cook-en-australia", "James Cook llega a la costa este de Australia", 1770, "exacta", "oceania", 5, { p: ["james-cook"] }),
  h("rebelion-de-tupac-amaru-ii", "Rebelión de Túpac Amaru II en los Andes", 1780, "exacta", "america", 3, { p: ["tupac-amaru-ii"] }),
  h("independencia-de-estados-unidos", "Declaración de Independencia de Estados Unidos", 1776, "exacta", "america", 10, { p: ["jefferson", "franklin"], c: ["guerra-de-los-siete-anios"] }),
  h("constitucion-de-estados-unidos", "Se redacta la Constitución de Estados Unidos", 1787, "exacta", "america", 5, { p: ["washington", "franklin"], c: ["independencia-de-estados-unidos"] }),
];

// ---------------------------------------------------------------------------
// EDAD CONTEMPORÁNEA (desde 1789)
// ---------------------------------------------------------------------------
const CONTEMPORANEA: Base[] = [
  h("toma-de-la-bastilla", "Toma de la Bastilla, comienzo de la Revolución francesa", 1789, "exacta", "europa", 10, { f: true, c: ["contrato-social", "independencia-de-estados-unidos"] }),
  h("derechos-del-hombre", "Declaración de los Derechos del Hombre y del Ciudadano", 1789, "exacta", "europa", 7, { c: ["toma-de-la-bastilla", "independencia-de-estados-unidos"] }),
  h("rebelion-haitiana", "Comienza la revolución haitiana", 1791, "exacta", "america", 7, { p: ["toussaint-louverture"], c: ["toma-de-la-bastilla"] }),
  h("vacuna-de-jenner", "Jenner prueba la vacuna contra la viruela", 1796, "exacta", "europa", 5, { p: ["jenner"] }),
  h("campana-de-egipto", "Campaña de Napoleón en Egipto", 1798, "exacta", "africa", 3, { p: ["napoleon"] }),
  h("hallazgo-de-rosetta", "Hallazgo de la piedra de Rosetta", 1799, "exacta", "africa", 5, { c: ["campana-de-egipto"] }),
  h("independencia-de-haiti", "Independencia de Haití", 1804, "exacta", "america", 6, { c: ["rebelion-haitiana"] }),
  h("napoleon-emperador", "Napoleón se corona emperador de los franceses", 1804, "exacta", "europa", 8, { p: ["napoleon"] }),
  h("invasion-napoleonica-de-espana", "Napoleón invade España", 1808, "exacta", "europa", 4, { p: ["napoleon"], c: ["napoleon-emperador"] }),
  h("independencias-hispanoamericanas", "Comienzan las revoluciones de independencia en Hispanoamérica", 1810, "convencional", "america", 6, { c: ["invasion-napoleonica-de-espana"] }),
  h("waterloo", "Batalla de Waterloo", 1815, "exacta", "europa", 8, { p: ["napoleon"] }),
  h("shaka-reino-zulu", "Shaka funda el reino zulú", 1816, "aproximada", "africa", 3, { m: 2, p: ["shaka"] }),
  h("cruce-de-los-andes", "San Martín cruza los Andes", 1817, "exacta", "america", 5, { p: ["jose-de-san-martin"], c: ["independencias-hispanoamericanas"] }),
  h("entrevista-de-guayaquil", "Entrevista de Guayaquil entre Bolívar y San Martín", 1822, "exacta", "america", 3, { p: ["simon-bolivar", "jose-de-san-martin"] }),
  h("champollion-jeroglificos", "Champollion descifra los jeroglíficos egipcios", 1822, "exacta", "europa", 5, { p: ["champollion"], c: ["hallazgo-de-rosetta"] }),
  h("batalla-de-ayacucho", "Batalla de Ayacucho", 1824, "exacta", "america", 4, { c: ["independencias-hispanoamericanas"] }),
  h("primer-ferrocarril-publico", "Inauguración del ferrocarril de vapor entre Liverpool y Manchester", 1830, "exacta", "europa", 6, { c: ["maquina-de-vapor-de-watt"] }),
  h("abolicion-esclavitud-imperio-britanico", "Ley de Abolición de la Esclavitud en el Imperio británico", 1833, "exacta", "europa", 5),
  h("primera-guerra-del-opio", "Comienza la primera guerra del Opio", 1839, "exacta", "asia-oriental", 4),
  h("origen-de-las-especies", "Darwin publica El origen de las especies", 1859, "exacta", "europa", 9, { p: ["darwin"] }),
  h("guerra-de-secesion", "Comienzo de la guerra de Secesión de Estados Unidos", 1861, "exacta", "america", 7, { p: ["lincoln"] }),
  h("proclama-de-emancipacion", "Proclamación de Emancipación de Lincoln", 1863, "exacta", "america", 6, { p: ["lincoln"], c: ["guerra-de-secesion"] }),
  h("restauracion-meiji", "Restauración Meiji en Japón", 1868, "exacta", "asia-oriental", 6, { p: ["emperador-meiji"] }),
  h("canal-de-suez", "Inauguración del canal de Suez", 1869, "exacta", "africa", 5),
  h("telefono-de-bell", "Bell patenta el teléfono", 1876, "exacta", "america", 7, { p: ["bell"] }),
  h("conferencia-de-berlin", "Conferencia de Berlín sobre el reparto colonial de África", 1884, "exacta", "africa", 6, { p: ["bismarck"] }),
  h("voto-femenino-nueva-zelanda", "Nueva Zelanda concede el voto a las mujeres", 1893, "exacta", "oceania", 5),
  h("batalla-de-adua", "Etiopía derrota a Italia en la batalla de Adua", 1896, "exacta", "africa", 4, { p: ["menelik-ii"] }),
  h("primer-vuelo-motorizado", "Primer vuelo motorizado de los hermanos Wright", 1903, "exacta", "america", 8),
  h("relatividad-especial", "Einstein publica la teoría de la relatividad especial", 1905, "exacta", "europa", 8, { p: ["einstein"] }),
  h("republica-china", "Se proclama la República en China y termina el imperio", 1912, "exacta", "asia-oriental", 4, { p: ["sun-yat-sen"] }),
  h("asesinato-de-francisco-fernando", "Asesinato del archiduque Francisco Fernando en Sarajevo", 1914, "exacta", "europa", 7),
  h("primera-guerra-mundial", "Comienzo de la Primera Guerra Mundial", 1914, "exacta", "global", 10, { c: ["asesinato-de-francisco-fernando"] }),
  h("revolucion-rusa", "Revolución de Octubre en Rusia", 1917, "exacta", "europa", 9, { p: ["lenin"], c: ["primera-guerra-mundial"] }),
  h("armisticio-de-1918", "Armisticio que pone fin a la Primera Guerra Mundial", 1918, "exacta", "global", 7, { c: ["primera-guerra-mundial"] }),
  h("tratado-de-versalles", "Tratado de Versalles", 1919, "exacta", "europa", 7, { c: ["armisticio-de-1918"] }),
  h("fundacion-de-la-urss", "Fundación de la Unión Soviética", 1922, "exacta", "europa", 6, { p: ["lenin"], c: ["revolucion-rusa"] }),
  h("penicilina", "Fleming descubre la penicilina", 1928, "exacta", "europa", 8, { p: ["fleming"] }),
  h("crisis-de-1929", "Crisis bursátil en Wall Street", 1929, "exacta", "america", 8),
  h("gran-depresion", "Comienza la Gran Depresión", 1929, "exacta", "global", 7, { c: ["crisis-de-1929"] }),
  h("marcha-de-la-sal", "Marcha de la Sal de Gandhi", 1930, "exacta", "asia-sur", 5, { p: ["gandhi"] }),
  h("invasion-de-polonia", "Alemania invade Polonia", 1939, "exacta", "europa", 7, { p: ["hitler"] }),
  h("segunda-guerra-mundial", "Comienzo de la Segunda Guerra Mundial", 1939, "exacta", "global", 10, { c: ["invasion-de-polonia"] }),
  h("pearl-harbor", "Ataque a Pearl Harbor", 1941, "exacta", "america", 7, { p: ["franklin-roosevelt"] }),
  h("desembarco-de-normandia", "Desembarco de Normandía (Día D)", 1944, "exacta", "europa", 8, { p: ["churchill", "franklin-roosevelt"] }),
  h("liberacion-de-auschwitz", "Liberación del campo de Auschwitz", 1945, "exacta", "europa", 5),
  h("bombas-atomicas", "Bombas atómicas sobre Hiroshima y Nagasaki", 1945, "exacta", "asia-oriental", 8),
  h("fin-de-la-segunda-guerra-mundial", "Fin de la Segunda Guerra Mundial", 1945, "exacta", "global", 9),
  h("fundacion-de-la-onu", "Fundación de la Organización de las Naciones Unidas", 1945, "exacta", "global", 8, { c: ["segunda-guerra-mundial"] }),
  h("comienzo-de-la-guerra-fria", "Comienzo de la Guerra Fría", 1947, "convencional", "global", 7, { c: ["fin-de-la-segunda-guerra-mundial"] }),
  h("independencia-de-la-india", "Independencia de la India y Pakistán", 1947, "exacta", "asia-sur", 7, { p: ["gandhi", "nehru"] }),
  h("declaracion-de-derechos-humanos", "Declaración Universal de Derechos Humanos", 1948, "exacta", "global", 8, { p: ["eleanor-roosevelt"], c: ["fundacion-de-la-onu"] }),
  h("republica-popular-china", "Proclamación de la República Popular China", 1949, "exacta", "asia-oriental", 6, { p: ["mao-zedong"] }),
  h("independencia-de-ghana", "Independencia de Ghana", 1957, "exacta", "africa", 5, { p: ["nkrumah"] }),
  h("sputnik", "Lanzamiento del Sputnik 1", 1957, "exacta", "global", 7),
  h("anio-de-africa", "Año de África: independencia de numerosos países africanos", 1960, "exacta", "africa", 4, { c: ["independencia-de-ghana"] }),
  h("muro-de-berlin", "Construcción del Muro de Berlín", 1961, "exacta", "europa", 9, { c: ["comienzo-de-la-guerra-fria"] }),
  h("vuelo-de-gagarin", "Yuri Gagarin, primer ser humano en el espacio", 1961, "exacta", "global", 7, { p: ["gagarin"], c: ["sputnik"] }),
  h("crisis-de-los-misiles", "Crisis de los misiles de Cuba", 1962, "exacta", "america", 6, { p: ["kennedy"], c: ["comienzo-de-la-guerra-fria"] }),
  h("marcha-sobre-washington", "Marcha sobre Washington y discurso «Tengo un sueño»", 1963, "exacta", "america", 6, { p: ["martin-luther-king"] }),
  h("llegada-a-la-luna", "Llegada del Apolo 11 a la Luna", 1969, "exacta", "america", 10, { p: ["armstrong"], c: ["vuelo-de-gagarin"] }),
  h("viruela-erradicada", "La OMS declara erradicada la viruela", 1980, "exacta", "global", 4, { c: ["vacuna-de-jenner"] }),
  h("caida-del-muro-de-berlin", "Caída del Muro de Berlín", 1989, "exacta", "europa", 10, { p: ["gorbachov"] }),
  h("mandela-libre", "Nelson Mandela sale de prisión", 1990, "exacta", "africa", 5, { p: ["mandela"] }),
  h("reunificacion-de-alemania", "Reunificación de Alemania", 1990, "exacta", "europa", 6, { c: ["caida-del-muro-de-berlin"] }),
  h("disolucion-de-la-urss", "Disolución de la Unión Soviética", 1991, "exacta", "europa", 7, { p: ["gorbachov"] }),
  h("mandela-presidente", "Mandela es elegido presidente en las primeras elecciones multirraciales de Sudáfrica", 1994, "exacta", "africa", 6, { p: ["mandela"], c: ["mandela-libre"] }),
  h("pandemia-de-covid-19", "La OMS declara la pandemia de COVID-19", 2020, "exacta", "global", 6),
];

export const HECHOS: Hecho[] = [
  ...en("prehistoria", PREHISTORIA),
  ...en("antiguedad", ANTIGUEDAD),
  ...en("edad-media", EDAD_MEDIA),
  ...en("edad-moderna", EDAD_MODERNA),
  ...en("contemporanea", CONTEMPORANEA),
];
