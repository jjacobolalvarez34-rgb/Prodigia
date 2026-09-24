import type { ClaseHistoria } from "./tipos";
import { A, AH, DIST, N, P, Q, causas, fichas, linea, preg, pregCausa, pregConsecuencia, pregEpoca, pregPrimero, pregQuien, pregSiglo, sincronia } from "./ayudas";

// Clases de la época «Edad Contemporánea» (Pro). Cada Clase: objetivo, contexto (repaso
// de lo que usa de épocas anteriores), desarrollo con líneas de tiempo animadas,
// personajes clave, causas y consecuencias, conexiones, errores comunes y quiz de 4 a
// 6 preguntas. Solo hechos de amplio consenso, con fecha y protagonistas, en
// redacción neutra: sin juicios morales, sin cifras discutidas y sin interpretación
// política. Todo nombre y todo año sale de la tabla canónica por id.

const C1 = {
  hechos: ["guerra-de-los-siete-anios", "independencia-de-estados-unidos", "contrato-social", "toma-de-la-bastilla", "derechos-del-hombre", "campana-de-egipto", "hallazgo-de-rosetta", "champollion-jeroglificos", "napoleon-emperador", "invasion-napoleonica-de-espana", "waterloo"],
  personajes: ["napoleon", "champollion"],
};
const C2 = {
  hechos: ["toma-de-la-bastilla", "rebelion-haitiana", "independencia-de-haiti", "invasion-napoleonica-de-espana", "independencias-hispanoamericanas", "cruce-de-los-andes", "entrevista-de-guayaquil", "batalla-de-ayacucho"],
  personajes: ["toussaint-louverture", "jose-de-san-martin", "simon-bolivar"],
};
const C3 = {
  hechos: ["maquina-de-vapor-de-watt", "primer-ferrocarril-publico", "vacuna-de-jenner", "viruela-erradicada", "origen-de-las-especies", "telefono-de-bell", "primer-vuelo-motorizado", "relatividad-especial", "penicilina"],
  personajes: ["jenner", "darwin", "marx", "bell", "marie-curie", "einstein", "fleming"],
};
const C4 = {
  hechos: ["abolicion-esclavitud-imperio-britanico", "guerra-de-secesion", "proclama-de-emancipacion", "primera-guerra-del-opio", "restauracion-meiji", "canal-de-suez", "conferencia-de-berlin", "batalla-de-adua", "shaka-reino-zulu", "voto-femenino-nueva-zelanda", "republica-china"],
  personajes: ["lincoln", "bismarck", "emperador-meiji", "menelik-ii", "shaka", "sun-yat-sen", "tagore"],
};
const C5 = {
  hechos: ["asesinato-de-francisco-fernando", "primera-guerra-mundial", "revolucion-rusa", "armisticio-de-1918", "tratado-de-versalles", "fundacion-de-la-urss", "crisis-de-1929", "gran-depresion", "marcha-de-la-sal"],
  personajes: ["lenin", "gandhi"],
};
const C6 = {
  hechos: ["invasion-de-polonia", "segunda-guerra-mundial", "pearl-harbor", "desembarco-de-normandia", "liberacion-de-auschwitz", "bombas-atomicas", "fin-de-la-segunda-guerra-mundial"],
  personajes: ["hitler", "churchill", "stalin", "franklin-roosevelt"],
};
const C7 = {
  hechos: ["segunda-guerra-mundial", "fin-de-la-segunda-guerra-mundial", "fundacion-de-la-onu", "declaracion-de-derechos-humanos", "comienzo-de-la-guerra-fria", "republica-popular-china", "sputnik", "muro-de-berlin", "vuelo-de-gagarin", "crisis-de-los-misiles", "marcha-sobre-washington", "llegada-a-la-luna"],
  personajes: ["eleanor-roosevelt", "mao-zedong", "kennedy", "martin-luther-king", "gagarin", "armstrong"],
};
const C8 = {
  hechos: ["independencia-de-la-india", "independencia-de-ghana", "anio-de-africa", "mandela-libre", "mandela-presidente", "caida-del-muro-de-berlin", "reunificacion-de-alemania", "disolucion-de-la-urss", "pandemia-de-covid-19"],
  personajes: ["nehru", "nkrumah", "mandela", "gorbachov", "berners-lee"],
};

export const CLASES_HISTORIA_CONTEMPORANEA: ClaseHistoria[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "historia-clase-24-revolucion-francesa-y-napoleon",
    grupo: "contemporanea",
    orden: 1,
    requierePro: true,
    nombre: "La Revolución francesa y Napoleón",
    descripcion: "El comienzo de la Edad Contemporánea: la Revolución francesa, los Derechos del Hombre, la Francia de Napoleón y su final en Waterloo.",
    conceptos: {
      introduce: ["revolucion-francesa"],
      usa: ["fronteras-de-epoca", "ilustracion", "independencia-eeuu", "causa-y-consecuencia"],
      repasa: ["fronteras-de-epoca", "ilustracion", "independencia-eeuu", "causa-y-consecuencia"],
    },
    ensena: C1,
    pasos: [
      "Objetivo: al terminar podrás explicar qué fue la Revolución francesa, por qué su comienzo se toma como frontera de la Edad Contemporánea y qué papel tuvo Napoleón.",
      `Contexto: por convención escolar, la Edad Moderna termina y la Contemporánea empieza con ${A("toma-de-la-bastilla")} (otros textos usan otras fechas). Repaso de la Edad Moderna: las ideas de la Ilustración, como las de Rousseau en ${Q("contrato-social")} (${A("contrato-social")}), y la independencia de Estados Unidos (${A("independencia-de-estados-unidos")}), que había seguido a la guerra de los Siete Años (${A("guerra-de-los-siete-anios")}), circulaban por Francia. Recuerda que una causa siempre precede a su consecuencia.`,
      `En ${A("toma-de-la-bastilla")}, el pueblo de París tomó la Bastilla, una fortaleza-prisión; ese hecho simboliza el comienzo de la Revolución francesa. Poco después se aprobó la Declaración de los Derechos del Hombre y del Ciudadano (${A("derechos-del-hombre")}), que afirmó la igualdad de derechos ante la ley.`,
      `Napoleón Bonaparte, un general, fue ganando poder y se coronó emperador de los franceses (${A("napoleon-emperador")}). Su campaña en Egipto (${A("campana-de-egipto")}) trajo el hallazgo de la piedra de Rosetta (${A("hallazgo-de-rosetta")}), cuyo texto en tres escrituras permitió que Champollion descifrara los jeroglíficos egipcios (${A("champollion-jeroglificos")}).`,
      `Napoleón invadió España (${A("invasion-napoleonica-de-espana")}), lo que tuvo grandes consecuencias en Hispanoamérica. Su poder terminó con la derrota en Waterloo (${A("waterloo")}).`,
      `Personajes clave: ${P("napoleon")} y ${P("champollion")}.`,
      "Causas y consecuencias: la independencia de Estados Unidos y las ideas de la Ilustración contribuyeron a la Revolución francesa; la Revolución llevó a la Declaración de Derechos. La figura une esas relaciones. Simplificación de nivel escolar: la Revolución tuvo muchas etapas y causas económicas y sociales que aquí no se detallan.",
      "Conecta con: la lección de las revoluciones de América (la haitiana y las hispanoamericanas), con la de independencia de Estados Unidos y con las que siguen sobre industrialización e imperialismo.",
      "Errores comunes: (1) creer que la Revolución francesa terminó con la toma de la Bastilla: fue el comienzo; (2) confundir a Napoleón con un rey: se coronó emperador; (3) pensar que Champollion halló la piedra de Rosetta: la halló el ejército de Napoleón y él descifró después los jeroglíficos.",
    ],
    visuales: [
      linea(4, `De ${A("independencia-de-estados-unidos")} a ${A("waterloo")}`, ["independencia-de-estados-unidos", "contrato-social", "toma-de-la-bastilla", "derechos-del-hombre", "campana-de-egipto", "hallazgo-de-rosetta", "champollion-jeroglificos", "napoleon-emperador", "invasion-napoleonica-de-espana", "waterloo"]),
      causas(7, "De la independencia de Estados Unidos a los Derechos del Hombre", ["guerra-de-los-siete-anios", "independencia-de-estados-unidos", "toma-de-la-bastilla", "derechos-del-hombre"]),
      causas(7, "De Rousseau a la Bastilla", ["contrato-social", "toma-de-la-bastilla"]),
      fichas(6, "Napoleón y Champollion", C1.personajes),
    ],
    quiz: [
      pregPrimero("toma-de-la-bastilla", "napoleon-emperador"),
      pregConsecuencia("toma-de-la-bastilla", "derechos-del-hombre", ["caida-de-constantinopla", "llegada-de-colon", "guerra-de-los-siete-anios"]),
      pregConsecuencia("campana-de-egipto", "hallazgo-de-rosetta", ["caida-de-constantinopla", "llegada-de-colon", "guerra-de-los-siete-anios"]),
      pregQuien("champollion", ["napoleon", "jenner", "darwin"]),
      pregEpoca("waterloo"),
      preg(
        "¿Qué hecho se toma, por convención escolar, como comienzo de la Edad Contemporánea?",
        N("toma-de-la-bastilla"),
        [N("llegada-de-colon"), N("caida-de-roma-occidente"), N("escritura-cuneiforme")],
        "La convención escolar abre la Edad Contemporánea con la Revolución francesa; otros textos proponen otras fechas."
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-clase-25-revoluciones-e-independencias-de-america",
    grupo: "contemporanea",
    orden: 2,
    requierePro: true,
    nombre: "La revolución haitiana y las independencias de Hispanoamérica",
    descripcion: "Cómo Haití se independizó y cómo las colonias españolas de América dejaron de serlo con Bolívar y San Martín.",
    conceptos: {
      introduce: ["independencias-americanas"],
      usa: ["revolucion-francesa", "exploracion-y-conquista", "causa-y-consecuencia"],
      repasa: ["exploracion-y-conquista"],
    },
    ensena: C2,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo se independizó Haití y por qué comenzaron las independencias de Hispanoamérica, con sus protagonistas principales.",
      `Contexto: en la lección anterior viste la Revolución francesa (${A("toma-de-la-bastilla")}) y la invasión de España por Napoleón (${A("invasion-napoleonica-de-espana")}). Repaso de la Edad Moderna: las colonias de América llevaban unos tres siglos bajo dominio europeo desde los viajes de exploración y la conquista.`,
      `Haití era una colonia francesa con una economía de plantaciones sostenida por personas esclavizadas. La rebelión de ${A("rebelion-haitiana")} fue una de las mayores rebeliones de esclavizados de la historia colonial y la única que terminó creando un Estado independiente (${A("independencia-de-haiti")}): Haití fue el primer país independiente de América Latina y el Caribe y el primero gobernado por antiguos esclavizados. Su principal líder fue Toussaint Louverture.`,
      `En Hispanoamérica, la invasión napoleónica de España debilitó el poder español y comenzaron los movimientos de independencia (${AH("independencias-hispanoamericanas")}).`,
      `José de San Martín cruzó los Andes con su ejército (${A("cruce-de-los-andes")}) para liberar Chile y luego Perú. Simón Bolívar, desde el norte, lideró la independencia de varios países. Ambos se reunieron en la entrevista de Guayaquil (${A("entrevista-de-guayaquil")}); los historiadores discuten qué acordaron. La batalla de Ayacucho (${A("batalla-de-ayacucho")}) fue decisiva para el fin del dominio español en Sudamérica.`,
      `Personajes clave: ${["toussaint-louverture", "jose-de-san-martin", "simon-bolivar"].map(P).join(", ")}.`,
      "Causas y consecuencias: la Revolución francesa influyó en la rebelión haitiana, que llevó a la independencia; la invasión napoleónica de España llevó a las independencias hispanoamericanas, que produjeron las expediciones de San Martín y las batallas como Ayacucho.",
      "Conecta con: la lección de la independencia de Estados Unidos (primer país que se independizó de un imperio europeo), la de la Revolución francesa y la de imperialismo, donde otras regiones perderán o ganarán autonomía.",
      "Errores comunes: (1) creer que todas las independencias ocurrieron a la vez: fueron procesos distintos a lo largo de años; (2) confundir a Bolívar con San Martín: uno actuó sobre todo en el norte de Sudamérica y el otro en el sur y el Pacífico; (3) creer que Haití fue una colonia española: fue francesa.",
    ],
    visuales: [
      linea(4, `De ${A("toma-de-la-bastilla")} a ${A("batalla-de-ayacucho")}`, C2.hechos),
      causas(6, "De la Bastilla a la independencia de Haití", ["toma-de-la-bastilla", "rebelion-haitiana", "independencia-de-haiti"]),
      causas(6, "De Napoleón a las independencias hispanoamericanas", ["invasion-napoleonica-de-espana", "independencias-hispanoamericanas", "cruce-de-los-andes"]),
      fichas(5, "Tres protagonistas", C2.personajes),
    ],
    quiz: [
      pregPrimero("rebelion-haitiana", "cruce-de-los-andes"),
      pregConsecuencia("rebelion-haitiana", "independencia-de-haiti", ["caida-de-constantinopla", "llegada-de-colon", "guerra-de-los-siete-anios"]),
      pregConsecuencia("independencias-hispanoamericanas", "cruce-de-los-andes", ["caida-de-constantinopla", "llegada-de-colon", "guerra-de-los-siete-anios"]),
      pregQuien("toussaint-louverture", ["simon-bolivar", "jose-de-san-martin", "napoleon"]),
      pregQuien("jose-de-san-martin", ["simon-bolivar", "toussaint-louverture", "washington"]),
      preg(
        "¿Qué potencia gobernaba Haití antes de su independencia?",
        "Francia",
        ["España", "El Reino Unido", "Portugal"],
        `Haití era una colonia francesa; su independencia llegó en ${A("independencia-de-haiti")}.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "historia-clase-26-industrializacion-y-ciencia",
    grupo: "contemporanea",
    orden: 3,
    requierePro: true,
    nombre: "La industrialización y los avances científicos",
    descripcion: "De la máquina de vapor y el ferrocarril a la vacuna, la evolución, el teléfono, el avión, la relatividad y la penicilina.",
    conceptos: {
      introduce: ["revolucion-industrial-y-ciencia"],
      usa: ["revolucion-cientifica", "ilustracion", "causa-y-consecuencia"],
      repasa: ["revolucion-cientifica", "ilustracion", "causa-y-consecuencia"],
    },
    ensena: C3,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo la máquina de vapor cambió el trabajo y el transporte y ubicar los grandes avances científicos y técnicos de los siglos XIX y XX.",
      `Contexto: la revolución científica de los siglos XVI y XVII y la Ilustración habían difundido la confianza en la razón y en la observación. Con ese impulso, la máquina de vapor de Watt (${A("maquina-de-vapor-de-watt")}) llegó a las fábricas; y una causa siempre precede a su consecuencia.`,
      `La Revolución Industrial comenzó en el Reino Unido: las fábricas y las máquinas reemplazaron muchas tareas manuales, las ciudades crecieron y cambió la vida de las familias. Un símbolo fue el ferrocarril de vapor entre Liverpool y Manchester (${A("primer-ferrocarril-publico")}). También surgieron nuevas ideas sobre la sociedad, como las de Karl Marx.`,
      `En la medicina, Jenner probó la primera vacuna, contra la viruela (${A("vacuna-de-jenner")}); casi dos siglos más tarde, la Organización Mundial de la Salud declaró erradicada esa enfermedad (${A("viruela-erradicada")}). Fleming descubrió la penicilina (${A("penicilina")}), el primer antibiótico.`,
      `En la biología, Darwin publicó El origen de las especies (${A("origen-de-las-especies")}), donde propuso la evolución por selección natural.`,
      `Las comunicaciones y el transporte se aceleraron: el teléfono de Bell (${A("telefono-de-bell")}) y el primer vuelo motorizado de los hermanos Wright (${A("primer-vuelo-motorizado")}). En la física, Einstein publicó la teoría de la relatividad especial (${A("relatividad-especial")}).`,
      `Personajes clave: ${["jenner", "darwin", "marx", "bell", "marie-curie", "einstein", "fleming"].map(P).join(", ")}.`,
      "Causas y consecuencias: la máquina de vapor de Watt hizo posible el ferrocarril; y la vacuna de Jenner, con el tiempo y la difusión de la vacunación, llevó a la erradicación de la viruela. Ambas cadenas están en la figura.",
      "Conecta con: la lección de imperialismo (las nuevas técnicas dieron ventajas a las potencias industriales), con la de la Primera Guerra Mundial y con el mundo actual, marcado por la ciencia y la tecnología.",
      "Errores comunes: (1) creer que Watt inventó la máquina de vapor: la mejoró; (2) confundir vacuna y antibiótico: la vacuna previene enfermedades y el antibiótico las trata; (3) creer que Darwin habló de que «el ser humano viene del mono»: propuso la selección natural como mecanismo de evolución.",
    ],
    visuales: [
      linea(5, "Del vapor a la penicilina", C3.hechos),
      causas(8, "De la máquina de vapor al ferrocarril", ["maquina-de-vapor-de-watt", "primer-ferrocarril-publico"]),
      causas(8, "De la vacuna a la erradicación de la viruela", ["vacuna-de-jenner", "viruela-erradicada"]),
      fichas(7, "Siete protagonistas", C3.personajes),
    ],
    quiz: [
      pregPrimero("maquina-de-vapor-de-watt", "telefono-de-bell"),
      pregConsecuencia("maquina-de-vapor-de-watt", "primer-ferrocarril-publico", ["caida-de-constantinopla", "llegada-de-colon", "hegira"]),
      pregConsecuencia("vacuna-de-jenner", "viruela-erradicada", ["caida-de-constantinopla", "llegada-de-colon", "hegira"]),
      pregQuien("darwin", ["einstein", "fleming", "jenner"]),
      pregQuien("fleming", ["jenner", "darwin", "marie-curie"]),
      pregSiglo("relatividad-especial"),
    ],
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "historia-clase-27-imperialismo-y-abolicion-de-la-esclavitud",
    grupo: "contemporanea",
    orden: 4,
    requierePro: true,
    nombre: "Imperialismo, abolición de la esclavitud y nuevos Estados",
    descripcion: "La abolición de la esclavitud en el Imperio británico y en Estados Unidos, la guerra del Opio, la modernización de Japón, el reparto de África y las resistencias.",
    conceptos: {
      introduce: ["imperialismo-y-abolicion"],
      usa: ["mundo-atlantico", "asia-moderna", "africa-medieval", "causa-y-consecuencia"],
      repasa: ["mundo-atlantico", "asia-moderna", "africa-medieval", "causa-y-consecuencia"],
    },
    ensena: C4,
    pasos: [
      "Objetivo: al terminar podrás explicar cómo terminó la esclavitud legal en el Imperio británico y en Estados Unidos, qué fue el imperialismo del siglo XIX y cómo respondieron algunos Estados de Asia y África.",
      "Contexto: la trata de africanos esclavizados había crecido en el mundo atlántico durante siglos. En Asia, Japón estaba bajo el shogunato Tokugawa y China bajo la dinastía Qing; en África había Estados como Mali en la Edad Media y otros después. Con la industrialización, las potencias europeas ganaron ventajas técnicas y extendieron su control. Una causa precede a su consecuencia.",
      `La abolición: el Reino Unido aprobó la Ley de Abolición de la Esclavitud en su Imperio (${A("abolicion-esclavitud-imperio-britanico")}). En Estados Unidos, la guerra de Secesión (${A("guerra-de-secesion")}) llevó a la Proclamación de Emancipación de Lincoln (${A("proclama-de-emancipacion")}); la abolición completa en el país llegó después.`,
      `El imperialismo: las potencias europeas ampliaron su dominio sobre Asia y África. La primera guerra del Opio (${A("primera-guerra-del-opio")}) enfrentó a China con el Reino Unido. El canal de Suez (${A("canal-de-suez")}) acortó la ruta a Asia, y la Conferencia de Berlín (${A("conferencia-de-berlin")}) reguló el reparto colonial de África entre potencias europeas, sin participación de los pueblos africanos.`,
      `No todos los Estados fueron dominados. Japón se modernizó tras la Restauración Meiji (${A("restauracion-meiji")}); Etiopía derrotó a Italia en la batalla de Adua (${A("batalla-de-adua")}); en África austral, Shaka formó el reino zulú (${AH("shaka-reino-zulu")}); China terminó el imperio y proclamó la República (${A("republica-china")}); y Nueva Zelanda fue el primer país en conceder el voto a las mujeres (${A("voto-femenino-nueva-zelanda")}).`,
      `Personajes clave: ${["lincoln", "bismarck", "emperador-meiji", "menelik-ii", "shaka", "sun-yat-sen", "tagore"].map(P).join(", ")}.`,
      "Causas y consecuencias: la guerra de Secesión llevó a la Proclamación de Emancipación; el desequilibrio de poder entre potencias industriales y otros Estados llevó a guerras como la del Opio; y la Restauración Meiji fue una respuesta japonesa a ese mundo. Simplificación de nivel escolar: cada región tuvo su propia historia y sus propios protagonistas.",
      "Conecta con: la lección de las independencias americanas (otra forma de terminar el dominio colonial), la de la Primera Guerra Mundial (las rivalidades imperiales fueron una de sus causas) y la de la descolonización, siglo XX.",
      "Errores comunes: (1) creer que la esclavitud terminó en todo el mundo a la vez: fue un proceso con fechas distintas en cada lugar; (2) creer que todo África fue colonizado: Etiopía mantuvo su independencia (con una breve ocupación en el siglo XX); (3) confundir Meiji con el shogunato: Meiji lo terminó.",
    ],
    visuales: [
      linea(5, `De ${A("abolicion-esclavitud-imperio-britanico")} a ${A("canal-de-suez")}`, ["abolicion-esclavitud-imperio-britanico", "primera-guerra-del-opio", "guerra-de-secesion", "proclama-de-emancipacion", "restauracion-meiji", "canal-de-suez"]),
      linea(5, `De ${A("shaka-reino-zulu")} a ${A("republica-china")}`, ["shaka-reino-zulu", "conferencia-de-berlin", "voto-femenino-nueva-zelanda", "batalla-de-adua", "republica-china"]),
      causas(7, "De la guerra de Secesión a la Emancipación", ["guerra-de-secesion", "proclama-de-emancipacion"]),
      fichas(6, "Los protagonistas", C4.personajes),
    ],
    quiz: [
      pregPrimero("abolicion-esclavitud-imperio-britanico", "guerra-de-secesion"),
      pregConsecuencia("guerra-de-secesion", "proclama-de-emancipacion", ["caida-de-constantinopla", "llegada-de-colon", "toma-de-la-bastilla"]),
      pregPrimero("primera-guerra-del-opio", "conferencia-de-berlin"),
      pregQuien("menelik-ii", ["lincoln", "bismarck", "sun-yat-sen"]),
      pregQuien("lincoln", ["bismarck", "menelik-ii", "washington"]),
      preg(
        "¿Qué reguló la Conferencia de Berlín?",
        "El reparto colonial de África entre potencias europeas",
        ["El fin de la guerra de Secesión", "La independencia de Haití", "La unificación de China"],
        `La Conferencia de Berlín (${A("conferencia-de-berlin")}) reguló el reparto colonial de África entre potencias europeas, sin participación de los pueblos africanos.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "historia-clase-28-primera-guerra-mundial-revolucion-rusa-y-entreguerras",
    grupo: "contemporanea",
    orden: 5,
    requierePro: true,
    nombre: "La Primera Guerra Mundial, la Revolución rusa y los años de entreguerras",
    descripcion: "De Sarajevo a la Primera Guerra Mundial, la Revolución rusa, el Tratado de Versalles, la fundación de la URSS y la crisis de 1929.",
    conceptos: {
      introduce: ["primera-guerra-mundial-y-entreguerras"],
      usa: ["imperialismo-y-abolicion", "causa-y-consecuencia", "cadenas-causales"],
      repasa: ["cadenas-causales"],
    },
    ensena: C5,
    pasos: [
      "Objetivo: al terminar podrás explicar qué desencadenó la Primera Guerra Mundial, qué fue la Revolución rusa y qué ocurrió en los años de entreguerras, con sus fechas y protagonistas.",
      "Contexto: en la lección anterior viste que las potencias europeas competían por imperios. Y recuerda que una cadena de dos pasos une tres hechos: A provoca B y B provoca C; en esta lección hay varias.",
      `En ${A("asesinato-de-francisco-fernando")} fue asesinado en Sarajevo el archiduque Francisco Fernando, heredero del trono austrohúngaro. A partir de ese hecho, los sistemas de alianzas llevaron a que se enfrentaran las principales potencias europeas y comenzó la Primera Guerra Mundial (${A("primera-guerra-mundial")}), que se extendió a otros continentes.`,
      `Durante la guerra, en Rusia se produjo la revolución (${A("revolucion-rusa")}): los bolcheviques, liderados por Lenin, tomaron el poder. Poco después se fundó la Unión Soviética (${A("fundacion-de-la-urss")}).`,
      `La guerra terminó con un armisticio (${A("armisticio-de-1918")}) y las potencias vencedoras firmaron el Tratado de Versalles (${A("tratado-de-versalles")}).`,
      `En ${A("crisis-de-1929")} se produjo el colapso de la bolsa de Nueva York y comenzó la Gran Depresión (${A("gran-depresion")}), una crisis económica mundial con desempleo y cierres de empresas. En la India, Gandhi encabezó la Marcha de la Sal (${A("marcha-de-la-sal")}), una acción no violenta contra el impuesto británico a la sal.`,
      `Personajes clave: ${P("lenin")} (líder bolchevique) y ${P("gandhi")} (líder del movimiento de independencia de la India).`,
      "Causas y consecuencias: el asesinato de Sarajevo llevó a la guerra; la guerra abrió el camino de la Revolución rusa y de la fundación de la URSS; la guerra terminó con el armisticio y con Versalles; y la crisis de 1929 llevó a la Gran Depresión. Las cuatro cadenas están en las figuras.",
      "Conecta con: la lección de imperialismo (causas de fondo), con la de la Segunda Guerra Mundial (que ocurrió pocos años después) y con la de descolonización (la Marcha de la Sal es un episodio de la independencia de la India).",
      "Errores comunes: (1) creer que el asesinato causó por sí solo la guerra: fue el detonante de tensiones acumuladas; (2) confundir armisticio con tratado de paz: el primero detiene los combates y el segundo fija las condiciones de la paz; (3) creer que la URSS se fundó en 1917: la Revolución fue en 1917 y la URSS en 1922.",
    ],
    visuales: [
      causas(7, "De Sarajevo a la URSS", ["asesinato-de-francisco-fernando", "primera-guerra-mundial", "revolucion-rusa", "fundacion-de-la-urss"]),
      causas(7, "De la guerra a Versalles", ["primera-guerra-mundial", "armisticio-de-1918", "tratado-de-versalles"]),
      causas(7, "De la crisis de 1929 a la Depresión", ["crisis-de-1929", "gran-depresion"]),
      linea(6, `De ${A("asesinato-de-francisco-fernando")} a ${A("marcha-de-la-sal")}`, C5.hechos),
      fichas(7, "Lenin y Gandhi", C5.personajes),
    ],
    quiz: [
      pregConsecuencia("asesinato-de-francisco-fernando", "primera-guerra-mundial", ["toma-de-la-bastilla", "waterloo", "restauracion-meiji"]),
      pregConsecuencia("primera-guerra-mundial", "revolucion-rusa", ["toma-de-la-bastilla", "waterloo", "restauracion-meiji"]),
      pregConsecuencia("crisis-de-1929", "gran-depresion", ["primera-guerra-mundial", "revolucion-rusa", "tratado-de-versalles"]),
      pregPrimero("revolucion-rusa", "crisis-de-1929"),
      pregQuien("lenin", ["gandhi", "churchill", "nehru"]),
      preg(
        "¿Cuál es la diferencia entre un armisticio y un tratado de paz?",
        "El armisticio detiene los combates; el tratado fija las condiciones de la paz",
        ["Son lo mismo", "El armisticio lo firma solo un país y el tratado, todos", "El tratado detiene los combates y el armisticio fija la paz"],
        `El armisticio (${A("armisticio-de-1918")}) detuvo los combates de la Primera Guerra Mundial; el Tratado de Versalles (${A("tratado-de-versalles")}) fijó las condiciones de la paz.`
      ),
    ],
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "historia-clase-29-segunda-guerra-mundial",
    grupo: "contemporanea",
    orden: 6,
    requierePro: true,
    nombre: "La Segunda Guerra Mundial",
    descripcion: "El comienzo de la guerra, Pearl Harbor, Normandía, la liberación de Auschwitz, las bombas atómicas y el final de la guerra, con sus fechas y protagonistas.",
    conceptos: {
      introduce: ["segunda-guerra-mundial"],
      usa: ["primera-guerra-mundial-y-entreguerras", "hechos-y-opiniones", "causa-y-consecuencia"],
      repasa: ["hechos-y-opiniones"],
    },
    ensena: C6,
    pasos: [
      "Objetivo: al terminar podrás ubicar en orden los hechos principales de la Segunda Guerra Mundial y reconocer a sus protagonistas, con fechas y sin juicios.",
      `Contexto: la Primera Guerra Mundial y la crisis de 1929 dejaron un mundo inestable. Como esta lección trata un tema reciente, recuerda la técnica «Hechos y opiniones»: aquí se enseñan solo los hechos de amplio consenso, con su fecha y sus protagonistas, sin juicios ni cifras discutidas.`,
      `Alemania, gobernada por el régimen de Adolf Hitler, invadió Polonia (${A("invasion-de-polonia")}) y comenzó la Segunda Guerra Mundial (${A("segunda-guerra-mundial")}). La guerra se extendió a Europa, África, Asia y el Pacífico.`,
      `En ${A("pearl-harbor")}, Japón atacó la base estadounidense de Pearl Harbor, en Hawái; después Estados Unidos entró en la guerra. En ${A("desembarco-de-normandia")} las fuerzas aliadas desembarcaron en Normandía, en el norte de Francia, el llamado Día D.`,
      `En ${A("liberacion-de-auschwitz")}, tropas soviéticas liberaron el campo de Auschwitz, uno de los campos de concentración y exterminio del régimen nazi. Los ejércitos aliados y soviéticos fueron encontrando otros campos al avanzar. Su estudio requiere más espacio del que tiene esta lección, por eso aquí no se dan cifras.`,
      `Estados Unidos lanzó bombas atómicas sobre las ciudades japonesas de Hiroshima y Nagasaki (${A("bombas-atomicas")}), y la guerra terminó (${A("fin-de-la-segunda-guerra-mundial")}).`,
      `Personajes clave: ${["hitler", "churchill", "stalin", "franklin-roosevelt"].map(P).join(", ")}: el jefe de gobierno de Alemania, el primer ministro del Reino Unido, el líder de la Unión Soviética y el presidente de Estados Unidos.`,
      "Causas y consecuencias: la invasión de Polonia llevó al comienzo de la guerra; el ataque a Pearl Harbor llevó a Estados Unidos a entrar en ella. Simplificación de nivel escolar: las causas de fondo de la guerra son numerosas y de ellas se ocupan los historiadores.",
      "Conecta con: la lección de la Primera Guerra Mundial y las crisis de entreguerras, y con la siguiente, donde se crean las Naciones Unidas y comienza la Guerra Fría.",
      "Errores comunes: (1) confundir la fecha de comienzo (1939) con la de la entrada de Estados Unidos (1941): son dos hechos distintos; (2) creer que la guerra fue solo europea: se combatió en varios continentes; (3) atribuir a una sola persona el desarrollo de la guerra: participaron gobiernos, ejércitos y sociedades enteras.",
    ],
    visuales: [
      linea(6, `De ${A("invasion-de-polonia")} a ${A("fin-de-la-segunda-guerra-mundial")}`, C6.hechos),
      causas(8, "De la invasión de Polonia a la guerra", ["invasion-de-polonia", "segunda-guerra-mundial"]),
      fichas(7, "Cuatro protagonistas", C6.personajes),
    ],
    quiz: [
      pregPrimero("invasion-de-polonia", "pearl-harbor"),
      pregPrimero("desembarco-de-normandia", "bombas-atomicas"),
      pregConsecuencia("invasion-de-polonia", "segunda-guerra-mundial", ["toma-de-la-bastilla", "waterloo", "restauracion-meiji"]),
      pregQuien("churchill", ["franklin-roosevelt", "stalin", "hitler"]),
      pregQuien("franklin-roosevelt", ["churchill", "stalin", "lincoln"]),
      pregEpoca("desembarco-de-normandia"),
    ],
  },

  // ---------------------------------------------------------------- 7
  {
    slug: "historia-clase-30-onu-derechos-humanos-y-guerra-fria",
    grupo: "contemporanea",
    orden: 7,
    requierePro: true,
    nombre: "Las Naciones Unidas, los derechos humanos y la Guerra Fría",
    descripcion: "La ONU, la Declaración Universal de Derechos Humanos, el comienzo y los hitos de la Guerra Fría, la carrera espacial y el movimiento por los derechos civiles.",
    conceptos: {
      introduce: ["onu-y-guerra-fria"],
      usa: ["segunda-guerra-mundial", "hechos-y-opiniones", "causa-y-consecuencia"],
      repasa: ["hechos-y-opiniones"],
    },
    ensena: C7,
    pasos: [
      "Objetivo: al terminar podrás explicar qué son las Naciones Unidas y la Declaración Universal de Derechos Humanos y ubicar los hechos principales de la Guerra Fría hasta la llegada a la Luna, con fechas y protagonistas.",
      "Contexto: la lección anterior terminó con el final de la Segunda Guerra Mundial. Como este tema es reciente, se sigue la técnica «Hechos y opiniones»: aquí solo hay hechos de amplio consenso, sin juicios ni interpretación.",
      `Las Naciones Unidas, una organización internacional para mantener la paz y promover la cooperación entre países, se fundaron en ${A("fundacion-de-la-onu")}. En ${A("declaracion-de-derechos-humanos")}, su Asamblea General aprobó la Declaración Universal de Derechos Humanos; el comité que la redactó lo presidió Eleanor Roosevelt. Es una declaración de principios: no es un tratado obligatorio.`,
      `La Guerra Fría fue una rivalidad política, económica y militar entre Estados Unidos y la Unión Soviética y sus aliados, sin combate directo entre ambas potencias; se sitúa, por convención, a partir de ${A("comienzo-de-la-guerra-fria")}. En ${A("republica-popular-china")}, Mao Zedong proclamó la República Popular China.`,
      `En Berlín se construyó el Muro (${A("muro-de-berlin")}), que dividió la ciudad. En la crisis de los misiles de Cuba (${A("crisis-de-los-misiles")}), Estados Unidos y la Unión Soviética se enfrentaron por misiles soviéticos instalados en Cuba; la crisis se resolvió sin guerra.`,
      `La rivalidad también fue tecnológica: la URSS lanzó el satélite Sputnik 1 (${A("sputnik")}) y envió al primer ser humano al espacio, Yuri Gagarin (${A("vuelo-de-gagarin")}). Estados Unidos llevó a la Luna a Neil Armstrong con la misión Apolo 11 (${A("llegada-a-la-luna")}).`,
      `En Estados Unidos, el movimiento por los derechos civiles, liderado por Martin Luther King, reunió a una multitud en la Marcha sobre Washington (${A("marcha-sobre-washington")}), donde pronunció el discurso «Tengo un sueño».`,
      `Personajes clave: ${["eleanor-roosevelt", "mao-zedong", "kennedy", "martin-luther-king", "gagarin", "armstrong"].map(P).join(", ")}.`,
      "Causas y consecuencias: la fundación de la ONU llevó a la Declaración Universal; el final de la guerra abrió la Guerra Fría; esta produjo el Muro, la crisis de los misiles y la carrera espacial; y el Sputnik llevó a Gagarin y a la llegada a la Luna. Las cadenas están en las figuras.",
      "Conecta con: la lección de la Segunda Guerra Mundial, con la de descolonización y el fin de la Guerra Fría, y con la lección de las revoluciones (los derechos del hombre de 1789).",
      "Errores comunes: (1) creer que la Guerra Fría fue una guerra con batallas entre las dos potencias: la rivalidad se expresó en otros terrenos; (2) confundir la ONU con la Declaración: la ONU es la organización; la Declaración es un documento que aprobó; (3) creer que la carrera espacial terminó con Gagarin: siguió hasta la llegada a la Luna.",
    ],
    visuales: [
      linea(6, `De ${A("fundacion-de-la-onu")} a ${A("republica-popular-china")}`, ["fundacion-de-la-onu", "comienzo-de-la-guerra-fria", "declaracion-de-derechos-humanos", "republica-popular-china"]),
      linea(6, `De ${A("sputnik")} a ${A("llegada-a-la-luna")}`, ["sputnik", "muro-de-berlin", "vuelo-de-gagarin", "crisis-de-los-misiles", "marcha-sobre-washington", "llegada-a-la-luna"]),
      causas(9, "De la ONU a la Declaración Universal", ["segunda-guerra-mundial", "fundacion-de-la-onu", "declaracion-de-derechos-humanos"]),
      causas(9, "De la posguerra a la Guerra Fría y a los misiles", ["fin-de-la-segunda-guerra-mundial", "comienzo-de-la-guerra-fria", "crisis-de-los-misiles"]),
      causas(9, "Del Sputnik a la Luna", ["sputnik", "vuelo-de-gagarin", "llegada-a-la-luna"]),
      fichas(8, "Seis protagonistas", C7.personajes),
    ],
    quiz: [
      pregConsecuencia("fundacion-de-la-onu", "declaracion-de-derechos-humanos", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregConsecuencia("sputnik", "vuelo-de-gagarin", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregConsecuencia("vuelo-de-gagarin", "llegada-a-la-luna", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregPrimero("muro-de-berlin", "llegada-a-la-luna"),
      pregQuien("eleanor-roosevelt", ["franklin-roosevelt", "marie-curie", "kennedy"]),
      pregQuien("martin-luther-king", ["kennedy", "mandela", "gandhi"]),
    ],
  },

  // ---------------------------------------------------------------- 8
  {
    slug: "historia-clase-31-descolonizacion-y-mundo-actual",
    grupo: "contemporanea",
    orden: 8,
    requierePro: true,
    nombre: "La descolonización, el fin de la Guerra Fría y el mundo actual",
    descripcion: "La independencia de la India y de Ghana, el Año de África, Mandela, la caída del Muro de Berlín, la disolución de la URSS y la pandemia de COVID-19.",
    conceptos: {
      introduce: ["descolonizacion-y-mundo-actual"],
      usa: ["onu-y-guerra-fria", "imperialismo-y-abolicion", "hechos-y-opiniones", "causa-y-consecuencia"],
      repasa: ["hechos-y-opiniones"],
    },
    ensena: C8,
    pasos: [
      "Objetivo: al terminar podrás explicar qué fue la descolonización, ubicar el fin de la Guerra Fría y reconocer los hechos más importantes de las últimas décadas, con fechas y protagonistas.",
      "Contexto: en la lección anterior viste la Guerra Fría; en la de imperialismo, cómo las potencias europeas dominaron gran parte de Asia y África. Como este tema es reciente, se sigue la técnica «Hechos y opiniones»: solo hechos de amplio consenso, sin juicios ni cifras discutidas.",
      `Tras la Segunda Guerra Mundial, muchos pueblos de Asia y África dejaron de ser colonias. En ${A("independencia-de-la-india")} la India y Pakistán se independizaron del Reino Unido, en una partición acompañada de grandes desplazamientos de población; Jawaharlal Nehru fue el primer jefe de gobierno de la India independiente. En ${A("independencia-de-ghana")} Ghana, liderada por Kwame Nkrumah, fue uno de los primeros países del África subsahariana en lograrlo y ${A("anio-de-africa")} se llama el «Año de África» por las muchas independencias.`,
      `En Sudáfrica, el sistema de segregación racial legal, el apartheid, terminó con un proceso político. Nelson Mandela salió de prisión (${A("mandela-libre")}) y fue elegido presidente en las primeras elecciones multirraciales (${A("mandela-presidente")}).`,
      `En Europa, cayó el Muro de Berlín (${A("caida-del-muro-de-berlin")}) y Alemania se reunificó (${A("reunificacion-de-alemania")}). La Unión Soviética, dirigida por Mijaíl Gorbachov, se disolvió (${A("disolucion-de-la-urss")}), y con ella terminó la Guerra Fría.`,
      `El mundo actual: en la década de 1990 se abrió al público la World Wide Web, inventada por Tim Berners-Lee, que cambió la comunicación; y la Organización Mundial de la Salud declaró la pandemia de COVID-19 (${A("pandemia-de-covid-19")}).`,
      `Personajes clave: ${["nehru", "nkrumah", "mandela", "gorbachov", "berners-lee"].map(P).join(", ")}.`,
      "Causas y consecuencias: la independencia de Ghana llevó a que muchos países africanos siguieran ese camino; la salida de Mandela de la cárcel llevó a su elección como presidente; y la caída del Muro llevó a la reunificación alemana. Estas cadenas están en las figuras.",
      "Conecta con: la lección de la Guerra Fría, la de imperialismo, la de la Revolución industrial y la ciencia (la web) y todo el curso: la historia sigue.",
      "Errores comunes: (1) creer que todas las colonias se independizaron el mismo año: hubo procesos distintos a lo largo de décadas; (2) confundir la caída del Muro (1989) con la reunificación alemana (1990) o la disolución de la URSS (1991): son tres hechos distintos; (3) mezclar hechos con opiniones sobre ellos: en historia reciente conviene separarlos siempre.",
    ],
    visuales: [
      linea(7, `De ${A("independencia-de-la-india")} a ${A("reunificacion-de-alemania")}`, ["independencia-de-la-india", "independencia-de-ghana", "anio-de-africa", "caida-del-muro-de-berlin", "mandela-libre", "reunificacion-de-alemania"]),
      linea(7, `De ${A("disolucion-de-la-urss")} a ${A("pandemia-de-covid-19")}`, ["disolucion-de-la-urss", "mandela-presidente", "pandemia-de-covid-19"]),
      causas(8, "De Ghana al Año de África", ["independencia-de-ghana", "anio-de-africa"]),
      causas(8, "De la salida de prisión a la presidencia", ["mandela-libre", "mandela-presidente"]),
      causas(8, "De la caída del Muro a la reunificación", ["caida-del-muro-de-berlin", "reunificacion-de-alemania"]),
      fichas(7, "Cinco protagonistas", C8.personajes),
    ],
    quiz: [
      pregPrimero("independencia-de-ghana", "caida-del-muro-de-berlin"),
      pregConsecuencia("independencia-de-ghana", "anio-de-africa", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregConsecuencia("mandela-libre", "mandela-presidente", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregConsecuencia("caida-del-muro-de-berlin", "reunificacion-de-alemania", ["toma-de-la-bastilla", "waterloo", "primera-guerra-mundial"]),
      pregQuien("nkrumah", ["mandela", "nehru", "gorbachov"]),
      pregQuien("gorbachov", ["mandela", "nehru", "nkrumah"]),
    ],
  },
];

void DIST;
void pregCausa;
void pregSiglo;
void sincronia;
