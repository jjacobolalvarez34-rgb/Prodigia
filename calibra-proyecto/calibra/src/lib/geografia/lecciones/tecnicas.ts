import type { TecnicaGeografia } from "./tipos";

// 20 Técnicas nuevas de Geografía (5 por continente), retrofit Técnicas |
// Clases por continente — ver docs/PARIDAD_MUNDOS.md fila 1 ("Aprender
// tiene solo 3 lecciones totales — 3 lecciones genéricas para 4 regiones,
// ninguna por continente") y fila 22/23. A diferencia de las 3 Técnicas
// históricas (0027_geografia_lecciones.sql: dividir en sub-regiones,
// anclar por vecinos, reconocer por forma — estrategias genéricas que NO
// mapean a un continente específico y por eso quedan en el grupo
// "general", ver src/lib/geografia/path.ts), cada una de estas SÍ es
// específica de un continente: un atajo rápido de identificación (forma,
// vecinos, fronteras, tamaño relativo), gratis (requierePro: false). Cada
// dato geográfico usado (vecinos de Brasil, fiordos noruegos, el Sahara
// como frontera natural, Lesoto rodeado por Sudáfrica, los "-stán" de Asia
// Central...) está verificado contra hechos geográficos reales conocidos.
export const TECNICAS_GEOGRAFIA: TecnicaGeografia[] = [
  // ---------------- América ----------------
  {
    slug: "geografia-tecnica-forma-sudamerica-vs-centroamerica",
    continente: "america",
    orden: 1,
    requierePro: false,
    nombre: "Sudamérica vs. Centroamérica: dos formas muy distintas",
    descripcion: "Sudamérica es un triángulo ancho que se angosta hacia el sur; Centroamérica es una franja angosta en forma de istmo.",
    pasos: [
      "América no es un bloque único: Sudamérica es un triángulo grande, ancho en el norte y angosto en el extremo sur (la Patagonia).",
      "Centroamérica es completamente distinta — un istmo, una franja de tierra angosta que conecta América del Norte con Sudamérica.",
      "Reconocer esta diferencia de forma es el primer paso antes de aprender los países de cada bloque por separado.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["076", "320"], despuesDePaso: 2, titulo: "Brasil (triángulo ancho) y Guatemala (istmo angosto)" },
    ],
    quiz: [
      {
        pregunta: "¿Qué forma general tiene Sudamérica?",
        opciones: ["Un triángulo ancho que se angosta hacia el sur", "Una franja angosta de norte a sur", "Un círculo casi perfecto", "Un archipiélago de islas"],
        respuesta: "Un triángulo ancho que se angosta hacia el sur",
        explicacion: "Sudamérica es ancha en el norte (cerca del ecuador) y se angosta hacia el extremo sur, en la Patagonia.",
      },
      {
        pregunta: "¿Cómo se llama la franja de tierra angosta que conecta América del Norte con Sudamérica?",
        opciones: ["Istmo centroamericano", "Cono Sur", "Región andina", "Meseta mexicana"],
        respuesta: "Istmo centroamericano",
        explicacion: "Un istmo es una franja angosta de tierra entre dos masas más grandes — exactamente la forma de Centroamérica.",
      },
      {
        pregunta: "¿Por qué conviene distinguir la forma de Sudamérica y Centroamérica antes de memorizar países sueltos?",
        opciones: ["Porque ubicar el bloque grande primero hace más fácil ubicar los países de adentro", "Porque los países cambian de bloque según el año", "Porque no hay ninguna diferencia real entre ambos", "Porque Centroamérica no tiene países propios"],
        respuesta: "Porque ubicar el bloque grande primero hace más fácil ubicar los países de adentro",
        explicacion: "Es la misma idea de la técnica general de sub-regiones: el bloque grande primero, los países sueltos después.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-vecinos-de-brasil",
    continente: "america",
    orden: 2,
    requierePro: false,
    nombre: "Brasil como ancla: limita con casi todo el continente",
    descripcion: "Brasil es el país más grande de Sudamérica y limita con casi todos los demás países sudamericanos, salvo Chile y Ecuador.",
    pasos: [
      "Brasil ocupa casi la mitad del territorio de Sudamérica — es un ancla natural para ubicar a sus vecinos.",
      "Limita con casi todos los países sudamericanos: Argentina, Bolivia, Colombia, Paraguay, Perú, Uruguay y Venezuela, entre otros.",
      "Los dos países sudamericanos que NO tienen frontera con Brasil son Chile y Ecuador — ambos quedan del lado del Pacífico.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["076", "032", "170"], despuesDePaso: 2, titulo: "Brasil y dos de sus vecinos: Argentina y Colombia" },
    ],
    quiz: [
      {
        pregunta: "¿Por qué Brasil funciona como buen país ancla para ubicar a sus vecinos?",
        opciones: ["Porque es el país más grande de Sudamérica y limita con casi todos los demás", "Porque está en el centro exacto del continente americano", "Porque es el único país que tiene costa en dos océanos", "Porque todos los demás países fueron parte de Brasil"],
        respuesta: "Porque es el país más grande de Sudamérica y limita con casi todos los demás",
        explicacion: "Su tamaño y la cantidad de fronteras que comparte lo hacen un punto de referencia natural para ubicar al resto.",
      },
      {
        pregunta: "¿Cuáles son los dos países sudamericanos que NO limitan con Brasil?",
        opciones: ["Chile y Ecuador", "Argentina y Uruguay", "Perú y Bolivia", "Colombia y Venezuela"],
        respuesta: "Chile y Ecuador",
        explicacion: "Ambos quedan del lado del Pacífico, separados de Brasil por otros países — son la excepción a la regla.",
      },
      {
        pregunta: "¿Cuál de estos países SÍ limita con Brasil?",
        opciones: ["Argentina", "Chile", "Ecuador", "Ninguno de los anteriores"],
        respuesta: "Argentina",
        explicacion: "Argentina comparte una frontera larga con Brasil, a diferencia de Chile y Ecuador.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-caribe-por-tamano-y-posicion",
    continente: "america",
    orden: 3,
    requierePro: false,
    nombre: "Islas del Caribe: tamaño y posición relativa",
    descripcion: "Cuba es la isla más grande y la más al oeste del Caribe; Jamaica queda al sur; Haití y República Dominicana comparten una misma isla al este.",
    pasos: [
      "Cuba es la isla más grande del Caribe y la más cercana a Estados Unidos y México — un buen punto de partida.",
      "Jamaica es una isla más chica, ubicada al sur de Cuba.",
      "Más al este, una misma isla (La Española) está dividida entre dos países: Haití al oeste y República Dominicana al este.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["192", "388", "214"], despuesDePaso: 2, titulo: "Cuba, Jamaica y República Dominicana" },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es la isla más grande del Caribe?",
        opciones: ["Cuba", "Jamaica", "República Dominicana", "Haití"],
        respuesta: "Cuba",
        explicacion: "Cuba es, por lejos, la isla más grande del Caribe y la más al oeste del archipiélago.",
      },
      {
        pregunta: "¿Qué dos países comparten la misma isla (La Española)?",
        opciones: ["Haití y República Dominicana", "Cuba y Jamaica", "Jamaica y Haití", "Cuba y República Dominicana"],
        respuesta: "Haití y República Dominicana",
        explicacion: "La Española es una sola isla dividida en dos países: Haití al oeste, República Dominicana al este.",
      },
      {
        pregunta: "¿Dónde queda Jamaica respecto de Cuba?",
        opciones: ["Al sur", "Al norte", "Al este, mucho más lejos", "En la misma isla"],
        respuesta: "Al sur",
        explicacion: "Jamaica es una isla independiente, ubicada al sur de Cuba.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-istmo-centroamericano-en-cadena",
    continente: "america",
    orden: 4,
    requierePro: false,
    nombre: "El istmo centroamericano, país por país",
    descripcion: "Centroamérica es una cadena de 7 países entre México y Colombia — aprenderlos en orden, de norte a sur, es más fácil que sueltos.",
    pasos: [
      "Centroamérica tiene 7 países, dispuestos en cadena entre México (al norte) y Colombia (al sur, ya en Sudamérica).",
      "De norte a sur: Guatemala, Belice, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá.",
      "Panamá es el último eslabón — el país que conecta el istmo con Sudamérica a través de su frontera con Colombia.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["320", "340", "188", "591"], despuesDePaso: 2, titulo: "Cadena centroamericana: Guatemala, Honduras, Costa Rica y Panamá" },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos países forman la cadena centroamericana?",
        opciones: ["7", "5", "9", "4"],
        respuesta: "7",
        explicacion: "Guatemala, Belice, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá — 7 países en total.",
      },
      {
        pregunta: "¿Cuál es el país centroamericano que conecta el istmo con Sudamérica?",
        opciones: ["Panamá", "Guatemala", "Costa Rica", "Belice"],
        respuesta: "Panamá",
        explicacion: "Panamá es el eslabón final: al sureste limita con Colombia, ya en Sudamérica.",
      },
      {
        pregunta: "¿Cuál de estos países está más al norte de la cadena centroamericana?",
        opciones: ["Guatemala", "Panamá", "Costa Rica", "Nicaragua"],
        respuesta: "Guatemala",
        explicacion: "Guatemala es el primer país de la cadena, el más cercano a México.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-cono-sur-franja-y-bloque",
    continente: "america",
    orden: 5,
    requierePro: false,
    nombre: "Cono Sur: la franja angosta y el bloque grande",
    descripcion: "Chile es una franja larga y angosta pegada a la cordillera; Argentina es el bloque grande al lado, con Uruguay y Paraguay más chicos.",
    pasos: [
      "En el extremo sur de Sudamérica, Chile forma una franja larga y angosta, apretada entre la cordillera de los Andes y el océano Pacífico.",
      "Argentina, del otro lado de la cordillera, es un bloque mucho más ancho — casi el doble de largo que Chile de este a oeste.",
      "Uruguay y Paraguay son los dos países más chicos del grupo: Uruguay pegado a la costa atlántica, Paraguay sin salida al mar.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "america", paisesIds: ["152", "032", "858", "600"], despuesDePaso: 2, titulo: "Chile, Argentina, Uruguay y Paraguay" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país del Cono Sur tiene forma de franja larga y angosta?",
        opciones: ["Chile", "Argentina", "Uruguay", "Paraguay"],
        respuesta: "Chile",
        explicacion: "Chile está apretado entre la cordillera de los Andes y el océano Pacífico — muy largo de norte a sur, muy angosto de este a oeste.",
      },
      {
        pregunta: "¿Cuál de estos 4 países del Cono Sur no tiene salida al mar?",
        opciones: ["Paraguay", "Chile", "Uruguay", "Argentina"],
        respuesta: "Paraguay",
        explicacion: "Paraguay es el único de los 4 completamente rodeado de tierra, sin costa sobre ningún océano.",
      },
      {
        pregunta: "¿Cuál de estos países es el más chico del grupo, pegado a la costa atlántica?",
        opciones: ["Uruguay", "Argentina", "Chile", "Paraguay"],
        respuesta: "Uruguay",
        explicacion: "Uruguay es el más chico de los cuatro y tiene costa sobre el océano Atlántico.",
      },
    ],
  },

  // ---------------- Europa ----------------
  {
    slug: "geografia-tecnica-escandinavos-forma-y-orientacion",
    continente: "europa",
    orden: 1,
    requierePro: false,
    nombre: "Países escandinavos: forma y orientación",
    descripcion: "Noruega tiene una costa recortada por fiordos y se extiende en diagonal; Suecia es más ancha y está al este; Finlandia tiene miles de lagos.",
    pasos: [
      "Noruega tiene una costa muy recortada, llena de fiordos, y se extiende en diagonal hacia el noreste, bien pegada al mar.",
      "Suecia queda al este de Noruega — es más ancha y su costa es mucho más regular, sin tantos fiordos.",
      "Finlandia, al este de Suecia, se distingue por tener miles de lagos repartidos por todo su territorio.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["578", "752", "246"], despuesDePaso: 2, titulo: "Noruega, Suecia y Finlandia" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país escandinavo se reconoce por su costa recortada en fiordos?",
        opciones: ["Noruega", "Suecia", "Finlandia", "Dinamarca"],
        respuesta: "Noruega",
        explicacion: "Los fiordos son entrantes de mar profundos entre montañas, típicos de la costa oeste de Noruega.",
      },
      {
        pregunta: "¿Qué país queda al este de Suecia, conocido por sus miles de lagos?",
        opciones: ["Finlandia", "Noruega", "Dinamarca", "Islandia"],
        respuesta: "Finlandia",
        explicacion: "Finlandia tiene una enorme cantidad de lagos repartidos por su territorio — un rasgo muy distintivo.",
      },
      {
        pregunta: "¿Cuál de estos tres países queda más al oeste, pegado al mar de Noruega?",
        opciones: ["Noruega", "Suecia", "Finlandia", "Los tres están igual de al oeste"],
        respuesta: "Noruega",
        explicacion: "Noruega ocupa la franja más occidental de la península escandinava, con Suecia a su este.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-balcanes-muchos-paises-chicos",
    continente: "europa",
    orden: 2,
    requierePro: false,
    nombre: "Los Balcanes: muchos países chicos y cercanos",
    descripcion: "En el sureste de Europa hay muchos países chicos muy cerca uno del otro — Croacia, Serbia y Bulgaria son tres ejemplos.",
    pasos: [
      "Los Balcanes son la región del sureste de Europa, entre Italia y Turquía — a diferencia de Francia o España, ahí conviven muchos países chicos, muy cerca uno del otro.",
      "Croacia tiene una forma curva, como una media luna, pegada a la costa del mar Adriático.",
      "Serbia y Bulgaria quedan más hacia el interior y el este de la región, ambos sin la misma costa larga que tiene Croacia.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["191", "688", "100"], despuesDePaso: 2, titulo: "Croacia, Serbia y Bulgaria" },
    ],
    quiz: [
      {
        pregunta: "¿Qué caracteriza a la región de los Balcanes en el mapa de Europa?",
        opciones: ["Tiene muchos países chicos muy cerca uno del otro", "Es la región con menos países de todo el continente", "Todos sus países comparten el mismo idioma", "No tiene ningún país con costa al mar"],
        respuesta: "Tiene muchos países chicos muy cerca uno del otro",
        explicacion: "A diferencia de países grandes como Francia o España, el sureste de Europa está muy fragmentado.",
      },
      {
        pregunta: "¿Qué país balcánico tiene forma curva, como una media luna, sobre el mar Adriático?",
        opciones: ["Croacia", "Serbia", "Bulgaria", "Rumania"],
        respuesta: "Croacia",
        explicacion: "La costa de Croacia se curva siguiendo el mar Adriático, dándole esa forma característica.",
      },
      {
        pregunta: "¿Entre qué dos países queda la región de los Balcanes?",
        opciones: ["Italia y Turquía", "Francia y Alemania", "España y Portugal", "Noruega y Rusia"],
        respuesta: "Italia y Turquía",
        explicacion: "Los Balcanes ocupan el sureste de Europa, entre la península itálica y Turquía.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-islas-europeas-separadas",
    continente: "europa",
    orden: 3,
    requierePro: false,
    nombre: "Islas europeas separadas del continente",
    descripcion: "Reino Unido e Irlanda comparten un archipiélago separado por el Canal de la Mancha; Islandia está mucho más aislada, en pleno Atlántico Norte.",
    pasos: [
      "Reino Unido e Irlanda son dos islas vecinas, separadas del resto de Europa por el Canal de la Mancha — un mar angosto pero real.",
      "Islandia queda mucho más lejos, aislada en medio del océano Atlántico Norte, sin ningún vecino cercano.",
      "Reconocer estas tres islas como un grupo aparte ayuda a no confundirlas con países del continente pegados entre sí.",
    ],
    visuales: [
      // Islandia queda fuera del recorte visible del mapa de Europa (mismo
      // encuadre que usa /geografia/practica, centrado bien al este de
      // Islandia) — no se la puede resaltar con su nombre legible en este
      // visual. Se la deja solo en el texto y en el quiz; el visual
      // resalta las dos islas que sí entran en cuadro.
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["826", "372"], despuesDePaso: 2, titulo: "Reino Unido e Irlanda" },
    ],
    quiz: [
      {
        pregunta: "¿Qué separa a Reino Unido e Irlanda del resto de Europa continental?",
        opciones: ["El Canal de la Mancha", "El mar Mediterráneo", "Los montes Urales", "El mar Báltico"],
        respuesta: "El Canal de la Mancha",
        explicacion: "El Canal de la Mancha es el brazo de mar angosto que separa las islas británicas del continente.",
      },
      {
        pregunta: "¿Cuál de estas tres islas está más aislada, sin vecinos cercanos?",
        opciones: ["Islandia", "Reino Unido", "Irlanda", "Ninguna está aislada"],
        respuesta: "Islandia",
        explicacion: "Islandia está en pleno Atlántico Norte, mucho más lejos del continente que Reino Unido e Irlanda.",
      },
      {
        pregunta: "¿Reino Unido e Irlanda están en la misma isla o en islas distintas?",
        opciones: ["En islas distintas, aunque vecinas", "En la misma isla, divididos por una frontera interna", "Reino Unido no es una isla", "Irlanda es parte del continente"],
        respuesta: "En islas distintas, aunque vecinas",
        explicacion: "Son dos islas separadas por el mar de Irlanda, no una sola isla dividida.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-europa-central-fronteras-compartidas",
    continente: "europa",
    orden: 4,
    requierePro: false,
    nombre: "Alemania: el cruce de caminos de Europa central",
    descripcion: "Alemania comparte frontera con Francia, Polonia, Austria y varios países más — usarla de centro ayuda a ubicar a sus vecinos.",
    pasos: [
      "Alemania está en el centro de Europa y comparte frontera con más países que casi cualquier otro del continente.",
      "Al oeste queda Francia; al este, Polonia; al sur, Austria — tres de sus vecinos más grandes.",
      "Usar Alemania como centro es una forma rápida de ubicar a varios países vecinos a la vez, en vez de aprenderlos sueltos.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["276", "250", "616", "040"], despuesDePaso: 2, titulo: "Alemania y tres de sus vecinos: Francia, Polonia y Austria" },
    ],
    quiz: [
      {
        pregunta: "¿Por qué Alemania es un buen país ancla en el mapa de Europa central?",
        opciones: ["Porque comparte frontera con muchos países a la vez", "Porque es el país más grande de toda Europa", "Porque no tiene ningún vecino", "Porque es una isla en el centro del continente"],
        respuesta: "Porque comparte frontera con muchos países a la vez",
        explicacion: "La cantidad de vecinos que tiene Alemania la convierte en un buen punto de referencia central.",
      },
      {
        pregunta: "¿Qué país queda al este de Alemania?",
        opciones: ["Polonia", "Francia", "España", "Portugal"],
        respuesta: "Polonia",
        explicacion: "Polonia limita con Alemania por el este.",
      },
      {
        pregunta: "¿Qué país queda al oeste de Alemania?",
        opciones: ["Francia", "Polonia", "Austria", "Rumania"],
        respuesta: "Francia",
        explicacion: "Francia limita con Alemania por el oeste.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-peninsula-iberica-dos-paises",
    continente: "europa",
    orden: 5,
    requierePro: false,
    nombre: "La península ibérica: dos países, un mismo bloque",
    descripcion: "España y Portugal comparten la misma península, en el extremo suroeste de Europa; Portugal ocupa la franja pegada al Atlántico.",
    pasos: [
      "España y Portugal comparten la misma península — la Ibérica — en el extremo suroeste del continente.",
      "Portugal ocupa la franja angosta pegada al océano Atlántico, en el borde oeste de la península.",
      "España ocupa el resto, mucho más grande, con costa sobre el Atlántico y también sobre el mar Mediterráneo.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "europa", paisesIds: ["724", "620"], despuesDePaso: 2, titulo: "España y Portugal en la península ibérica" },
    ],
    quiz: [
      {
        pregunta: "¿Qué dos países comparten la península ibérica?",
        opciones: ["España y Portugal", "España e Italia", "Francia y España", "Portugal e Italia"],
        respuesta: "España y Portugal",
        explicacion: "Ambos países ocupan la misma península, en el extremo suroeste de Europa.",
      },
      {
        pregunta: "¿Qué país ocupa la franja pegada al océano Atlántico, en el borde oeste?",
        opciones: ["Portugal", "España", "Francia", "Italia"],
        respuesta: "Portugal",
        explicacion: "Portugal es la franja angosta del oeste de la península, toda su costa mira al Atlántico.",
      },
      {
        pregunta: "¿Con qué mar tiene costa España, además del Atlántico?",
        opciones: ["El Mediterráneo", "El Báltico", "El mar del Norte", "El mar Negro"],
        respuesta: "El Mediterráneo",
        explicacion: "España tiene costa tanto en el Atlántico como en el Mediterráneo, a diferencia de Portugal.",
      },
    ],
  },

  // ---------------- África ----------------
  {
    slug: "geografia-tecnica-costeros-vs-sin-salida-al-mar",
    continente: "africa",
    orden: 1,
    requierePro: false,
    nombre: "Países africanos sin salida al mar",
    descripcion: "Chad, Malí y Zambia están completamente rodeados de tierra — reconocerlos por estar 'encerrados' ayuda a ubicarlos.",
    pasos: [
      "En África hay varios países sin ninguna costa — están completamente rodeados de tierra por otros países.",
      "Chad y Malí, en el centro y oeste del continente, son dos ejemplos claros: ningún lado de su territorio toca el mar.",
      "Zambia, más al sur, es otro ejemplo — a diferencia de países costeros como Nigeria o Kenia, que sí tienen costa oceánica.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["148", "466", "894"], despuesDePaso: 2, titulo: "Chad, Malí y Zambia: sin salida al mar" },
    ],
    quiz: [
      {
        pregunta: "¿Qué significa que un país no tenga salida al mar?",
        opciones: ["Que está completamente rodeado de tierra, sin costa oceánica", "Que está en el centro exacto del continente", "Que no tiene ríos", "Que es el país más chico de la región"],
        respuesta: "Que está completamente rodeado de tierra, sin costa oceánica",
        explicacion: "Un país sin salida al mar (landlocked) está rodeado de tierra por todos sus lados.",
      },
      {
        pregunta: "¿Cuál de estos países africanos SÍ tiene costa oceánica?",
        opciones: ["Nigeria", "Chad", "Malí", "Zambia"],
        respuesta: "Nigeria",
        explicacion: "Nigeria tiene costa sobre el golfo de Guinea, a diferencia de Chad, Malí y Zambia.",
      },
      {
        pregunta: "¿Cuál de estos países está completamente rodeado de tierra?",
        opciones: ["Chad", "Kenia", "Nigeria", "Marruecos"],
        respuesta: "Chad",
        explicacion: "Chad no tiene costa en ningún océano — está en el centro-norte de África, rodeado de otros países.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-sahara-como-referencia",
    continente: "africa",
    orden: 2,
    requierePro: false,
    nombre: "El Sahara como frontera natural",
    descripcion: "El desierto del Sahara separa el norte de África (Marruecos, Argelia, Libia, Egipto) del resto del continente.",
    pasos: [
      "El Sahara es el desierto más grande del mundo y ocupa casi todo el norte de África.",
      "Los países al norte del Sahara — Marruecos, Argelia, Libia y Egipto — forman un bloque bien diferenciado del resto del continente.",
      "Usar el Sahara como una gran frontera natural ayuda a separar mentalmente 'el norte árabe' del África subsahariana.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["504", "012", "434", "818"], despuesDePaso: 2, titulo: "Marruecos, Argelia, Libia y Egipto: al norte del Sahara" },
    ],
    quiz: [
      {
        pregunta: "¿Qué desierto separa el norte de África del resto del continente?",
        opciones: ["El Sahara", "El Kalahari", "El desierto de Namibia", "El desierto Árabe"],
        respuesta: "El Sahara",
        explicacion: "El Sahara es el desierto más grande del mundo y ocupa casi todo el norte de África.",
      },
      {
        pregunta: "¿Cuál de estos países NO está en el bloque norteafricano al norte del Sahara?",
        opciones: ["Kenia", "Marruecos", "Argelia", "Libia"],
        respuesta: "Kenia",
        explicacion: "Kenia está en África Oriental, al sur del Sahara — no forma parte del bloque norteafricano.",
      },
      {
        pregunta: "¿Cuál de estos países SÍ queda al norte del Sahara?",
        opciones: ["Egipto", "Nigeria", "Sudáfrica", "Tanzania"],
        respuesta: "Egipto",
        explicacion: "Egipto está en el extremo noreste de África, al norte del Sahara.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-cuerno-de-africa",
    continente: "africa",
    orden: 3,
    requierePro: false,
    nombre: "El Cuerno de África: la punta que sobresale",
    descripcion: "Somalia, Etiopía, Eritrea y Yibuti forman la península puntiaguda que sobresale hacia el océano Índico en el noreste del continente.",
    pasos: [
      "El Cuerno de África es la península puntiaguda que sobresale hacia el este, hacia el océano Índico, en el noreste del continente.",
      "La forman cuatro países: Somalia (la punta misma), Etiopía (en el interior, sin costa), Eritrea y Yibuti (ambos con costa sobre el mar Rojo).",
      "Su forma puntiaguda es fácil de reconocer de un vistazo — muy distinta al resto de la costa africana.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["706", "231", "232", "262"], despuesDePaso: 2, titulo: "Somalia, Etiopía, Eritrea y Yibuti: el Cuerno de África" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país forma la punta misma del Cuerno de África?",
        opciones: ["Somalia", "Etiopía", "Eritrea", "Yibuti"],
        respuesta: "Somalia",
        explicacion: "Somalia ocupa la punta que sobresale hacia el océano Índico, dándole su forma característica al Cuerno de África.",
      },
      {
        pregunta: "¿Cuál de estos 4 países del Cuerno de África no tiene costa (está en el interior)?",
        opciones: ["Etiopía", "Somalia", "Eritrea", "Yibuti"],
        respuesta: "Etiopía",
        explicacion: "Etiopía es el único de los cuatro sin costa — está rodeada por los otros tres y por Kenia y Sudán.",
      },
      {
        pregunta: "¿Hacia qué océano sobresale la península del Cuerno de África?",
        opciones: ["El océano Índico", "El océano Atlántico", "El mar Mediterráneo", "El océano Pacífico"],
        respuesta: "El océano Índico",
        explicacion: "El Cuerno de África sobresale hacia el este, hacia el océano Índico.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-fronteras-rectas-coloniales",
    continente: "africa",
    orden: 4,
    requierePro: false,
    nombre: "Fronteras rectas: herencia colonial",
    descripcion: "Chad, Libia y Namibia tienen fronteras casi de regla y escuadra — trazadas por potencias coloniales sin seguir accidentes geográficos.",
    pasos: [
      "Muchas fronteras africanas fueron trazadas por potencias coloniales europeas, casi con una regla, sin seguir ríos ni montañas.",
      "Chad y Libia son dos ejemplos claros: varios de sus límites son líneas rectas, no las curvas irregulares típicas de un río o una cordillera.",
      "Namibia es otro caso llamativo: tiene una larga franja angosta y recta (la Franja de Caprivi) que se extiende hacia el este.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["148", "434", "516"], despuesDePaso: 2, titulo: "Chad, Libia y Namibia: fronteras casi rectas" },
    ],
    quiz: [
      {
        pregunta: "¿Por qué muchas fronteras africanas son líneas rectas?",
        opciones: ["Porque las trazaron potencias coloniales sin seguir accidentes geográficos", "Porque siguen siempre el curso de un río", "Porque todos los países africanos tienen el mismo tamaño", "Porque las trazó la ONU en el siglo XXI"],
        respuesta: "Porque las trazaron potencias coloniales sin seguir accidentes geográficos",
        explicacion: "A diferencia de fronteras naturales (ríos, montañas), muchas fronteras africanas son herencia de líneas trazadas en la época colonial.",
      },
      {
        pregunta: "¿Qué país tiene una larga franja angosta y recta que se extiende hacia el este (la Franja de Caprivi)?",
        opciones: ["Namibia", "Chad", "Libia", "Sudáfrica"],
        respuesta: "Namibia",
        explicacion: "La Franja de Caprivi es una prolongación angosta y recta del territorio de Namibia hacia el este.",
      },
      {
        pregunta: "¿Cuál de estos países es un ejemplo de fronteras casi rectas?",
        opciones: ["Chad", "Italia", "Chile", "Reino Unido"],
        respuesta: "Chad",
        explicacion: "Chad, en el centro-norte de África, tiene varios límites trazados como líneas rectas.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-sudafrica-rodea-a-lesoto",
    continente: "africa",
    orden: 5,
    requierePro: false,
    nombre: "Lesoto: un país rodeado por otro",
    descripcion: "Lesoto está completamente rodeado por Sudáfrica — no tiene frontera con ningún otro país, un caso único en el continente.",
    pasos: [
      "Lesoto es un país pequeño, montañoso, ubicado dentro del territorio de Sudáfrica.",
      "Está completamente rodeado por Sudáfrica: no comparte frontera con ningún otro país del mundo.",
      "Este tipo de país (rodeado por completo por otro) se llama enclave — Lesoto es el ejemplo más conocido de África.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "africa", paisesIds: ["710", "426"], despuesDePaso: 2, titulo: "Sudáfrica y Lesoto, el país que rodea por completo" },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos países, además de Sudáfrica, limitan con Lesoto?",
        opciones: ["Ninguno", "Uno", "Dos", "Tres"],
        respuesta: "Ninguno",
        explicacion: "Lesoto está completamente rodeado por Sudáfrica — no tiene frontera con ningún otro país.",
      },
      {
        pregunta: "¿Cómo se llama un país completamente rodeado por otro, como Lesoto?",
        opciones: ["Un enclave", "Una península", "Un istmo", "Un archipiélago"],
        respuesta: "Un enclave",
        explicacion: "Un enclave es un territorio rodeado por completo por otro país — Lesoto es el ejemplo más conocido de África.",
      },
      {
        pregunta: "¿Qué país rodea por completo a Lesoto?",
        opciones: ["Sudáfrica", "Namibia", "Botsuana", "Zimbabue"],
        respuesta: "Sudáfrica",
        explicacion: "Todo el territorio de Lesoto está dentro de Sudáfrica.",
      },
    ],
  },

  // ---------------- Asia + Oceanía ----------------
  {
    slug: "geografia-tecnica-peninsulas-asiaticas",
    continente: "asia_oceania",
    orden: 1,
    requierePro: false,
    nombre: "Tres penínsulas asiáticas para ubicarse rápido",
    descripcion: "Corea sobresale hacia el este, Indochina (Vietnam) hacia el sur, y la península arábiga (Arabia Saudita) es la más grande de las tres.",
    pasos: [
      "Corea es una península que sobresale hacia el este de China, entre el mar Amarillo y el mar de Japón.",
      "Indochina, donde está Vietnam, es la península que sobresale hacia el sur, entre India y China.",
      "La península arábiga, donde está Arabia Saudita, es la más grande de las tres — ocupa casi todo el suroeste de Asia.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["410", "704", "682"], despuesDePaso: 2, titulo: "Corea, Vietnam y Arabia Saudita: tres penínsulas" },
    ],
    quiz: [
      {
        pregunta: "¿Hacia qué dirección sobresale la península de Corea respecto de China?",
        opciones: ["Hacia el este", "Hacia el sur", "Hacia el oeste", "Hacia el norte"],
        respuesta: "Hacia el este",
        explicacion: "Corea sobresale hacia el este de China, entre el mar Amarillo y el mar de Japón.",
      },
      {
        pregunta: "¿Cuál es la península asiática más grande de las tres?",
        opciones: ["La península arábiga", "Corea", "Indochina", "Todas son del mismo tamaño"],
        respuesta: "La península arábiga",
        explicacion: "La península arábiga, donde está Arabia Saudita, ocupa casi todo el suroeste de Asia — mucho más grande que Corea o Indochina.",
      },
      {
        pregunta: "¿En qué península está Vietnam?",
        opciones: ["Indochina", "Corea", "Arábiga", "Anatolia"],
        respuesta: "Indochina",
        explicacion: "Vietnam está en la península de Indochina, que sobresale hacia el sur entre India y China.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-islas-sudeste-asiatico",
    continente: "asia_oceania",
    orden: 2,
    requierePro: false,
    nombre: "Indonesia y Filipinas: países archipiélago",
    descripcion: "Indonesia y Filipinas están formados por miles de islas, no por un bloque de tierra continua como China o India.",
    pasos: [
      "A diferencia de China o India (bloques de tierra continua), Indonesia y Filipinas son archipiélagos — países hechos de miles de islas.",
      "Indonesia, con más de 17.000 islas, es el archipiélago más grande del mundo, ubicado entre el océano Índico y el Pacífico.",
      "Filipinas, al norte de Indonesia, es otro archipiélago grande, formado por más de 7.000 islas.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["360", "608"], despuesDePaso: 2, titulo: "Indonesia y Filipinas: países formados por miles de islas" },
    ],
    quiz: [
      {
        pregunta: "¿Qué tienen en común Indonesia y Filipinas?",
        opciones: ["Ambos son archipiélagos, países formados por miles de islas", "Ambos son países sin salida al mar", "Ambos comparten la misma frontera terrestre", "Ambos están en la península arábiga"],
        respuesta: "Ambos son archipiélagos, países formados por miles de islas",
        explicacion: "A diferencia de China o India, ninguno de los dos es un bloque de tierra continua.",
      },
      {
        pregunta: "¿Cuál de estos dos países queda más al norte?",
        opciones: ["Filipinas", "Indonesia", "Quedan a la misma latitud", "Ninguno de los dos está en Asia"],
        respuesta: "Filipinas",
        explicacion: "Filipinas está al norte de Indonesia, más cerca del ecuador pero por encima de él.",
      },
      {
        pregunta: "¿Aproximadamente cuántas islas forman Indonesia?",
        opciones: ["Más de 17.000", "Alrededor de 100", "Solo 3", "Alrededor de 500"],
        respuesta: "Más de 17.000",
        explicacion: "Indonesia es el archipiélago más grande del mundo, con más de 17.000 islas.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-oceania-por-tamano-relativo",
    continente: "asia_oceania",
    orden: 3,
    requierePro: false,
    nombre: "Oceanía: Australia enorme, el resto mucho más chico",
    descripcion: "Australia es casi tan grande como toda Europa; Nueva Zelanda, Papúa Nueva Guinea y Fiyi son una fracción de su tamaño.",
    pasos: [
      "Australia domina Oceanía en tamaño — es casi tan grande como toda Europa junta.",
      "Nueva Zelanda, al sureste, está formada por dos islas principales, mucho más chicas que Australia.",
      "Papúa Nueva Guinea y Fiyi son otros dos países de Oceanía, ambos bastante más chicos que Australia y ubicados más al norte.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["036", "554", "242"], despuesDePaso: 2, titulo: "Australia, Nueva Zelanda y Fiyi: tamaños muy distintos" },
    ],
    quiz: [
      {
        pregunta: "¿Con qué continente se compara habitualmente el tamaño de Australia?",
        opciones: ["Europa (es casi tan grande)", "La Antártida", "Groenlandia", "Ninguno, es mucho más chica que cualquier continente"],
        respuesta: "Europa (es casi tan grande)",
        explicacion: "Australia es casi tan grande como toda Europa — domina el tamaño de Oceanía.",
      },
      {
        pregunta: "¿Cuántas islas principales forman Nueva Zelanda?",
        opciones: ["Dos", "Una", "Cinco", "Diez"],
        respuesta: "Dos",
        explicacion: "Nueva Zelanda está formada por dos islas principales (Isla Norte e Isla Sur), además de islas más chicas.",
      },
      {
        pregunta: "¿Cuál de estos países de Oceanía es mucho más chico que Australia?",
        opciones: ["Fiyi", "Ninguno, todos son del mismo tamaño", "No hay otros países en Oceanía", "Australia es el más chico"],
        respuesta: "Fiyi",
        explicacion: "Fiyi es un archipiélago pequeño, una fracción del tamaño de Australia.",
      },
    ],
  },
  {
    slug: "geografia-tecnica-asia-central-los-stan",
    continente: "asia_oceania",
    orden: 4,
    requierePro: false,
    nombre: "Asia Central: los cinco países terminados en '-stán'",
    descripcion: "Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán forman un bloque entre Rusia y Afganistán.",
    pasos: [
      "Cinco países de Asia Central terminan en '-stán': Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán.",
      "Los cinco quedan en un mismo bloque, entre Rusia al norte y Afganistán/Irán al sur.",
      "Kazajistán es, de lejos, el más grande y el más al norte de los cinco; Tayikistán y Kirguistán son los más chicos y montañosos.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["398", "860", "762"], despuesDePaso: 2, titulo: "Kazajistán, Uzbekistán y Tayikistán: Asia Central" },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos países de Asia Central terminan en '-stán'?",
        opciones: ["5", "3", "7", "2"],
        respuesta: "5",
        explicacion: "Kazajistán, Uzbekistán, Turkmenistán, Kirguistán y Tayikistán — cinco países en total.",
      },
      {
        pregunta: "¿Cuál de los cinco '-stán' es el más grande y el más al norte?",
        opciones: ["Kazajistán", "Tayikistán", "Kirguistán", "Turkmenistán"],
        respuesta: "Kazajistán",
        explicacion: "Kazajistán es, de lejos, el más grande de los cinco y el que más al norte llega, pegado a Rusia.",
      },
      {
        pregunta: "¿Qué dos países quedan al sur del bloque de Asia Central?",
        opciones: ["Afganistán e Irán", "China y Rusia", "India y Pakistán", "Turquía y Arabia Saudita"],
        respuesta: "Afganistán e Irán",
        explicacion: "El bloque de los cinco '-stán' queda entre Rusia (al norte) y Afganistán/Irán (al sur).",
      },
    ],
  },
  {
    slug: "geografia-tecnica-oriente-medio-alrededor-de-arabia",
    continente: "asia_oceania",
    orden: 5,
    requierePro: false,
    nombre: "Oriente Medio alrededor de Arabia Saudita",
    descripcion: "Arabia Saudita ocupa el centro de la península arábiga; a su alrededor, países más chicos como Catar, Kuwait y Emiratos.",
    pasos: [
      "Arabia Saudita ocupa la mayor parte de la península arábiga — un buen punto de partida para ubicar a sus vecinos.",
      "A su alrededor hay varios países mucho más chicos, todos con costa sobre el golfo Pérsico: Catar, Kuwait y Emiratos Árabes Unidos.",
      "Los tres países chicos comparten esa posición costera sobre el golfo, en el borde este de la península.",
    ],
    visuales: [
      { tipo: "geografia.mapa", continente: "asia_oceania", paisesIds: ["682", "634", "414", "784"], despuesDePaso: 2, titulo: "Arabia Saudita, Catar, Kuwait y Emiratos Árabes Unidos" },
    ],
    quiz: [
      {
        pregunta: "¿Qué país ocupa la mayor parte de la península arábiga?",
        opciones: ["Arabia Saudita", "Catar", "Kuwait", "Emiratos Árabes Unidos"],
        respuesta: "Arabia Saudita",
        explicacion: "Arabia Saudita es, de lejos, el país más grande de la península arábiga.",
      },
      {
        pregunta: "¿Sobre qué golfo tienen costa Catar, Kuwait y Emiratos Árabes Unidos?",
        opciones: ["El golfo Pérsico", "El golfo de Adén", "El mar Rojo", "El golfo de Omán"],
        respuesta: "El golfo Pérsico",
        explicacion: "Los tres países chicos de la península arábiga comparten costa sobre el golfo Pérsico.",
      },
      {
        pregunta: "¿Cuál de estos países es mucho más chico que Arabia Saudita?",
        opciones: ["Catar", "Ninguno, todos son similares en tamaño", "Todos son más grandes que Arabia Saudita", "Yemen"],
        respuesta: "Catar",
        explicacion: "Catar es un país muy pequeño comparado con la extensión de Arabia Saudita.",
      },
    ],
  },
];
