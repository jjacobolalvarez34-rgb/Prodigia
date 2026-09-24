import type { ClaseHistoria } from "./tipos";
import { A, N, Q, causas, linea, preg, pregCausa, pregEpoca, pregPrimero, AH } from "./ayudas";

// Clases de la época «Prehistoria» (Pro; la primera es la preview gratis del mundo).
// Cada Clase: objetivo, contexto, desarrollo con línea de tiempo animada, personajes
// clave, causas y consecuencias, conexiones, errores comunes y quiz de 4 a 6
// preguntas. Todo nombre y todo año sale de la tabla canónica por id.

const ENSENA_C1 = {
  hechos: ["herramientas-de-piedra", "uso-del-fuego", "homo-sapiens", "humanos-en-australia", "pinturas-de-lascaux", "poblamiento-de-america"],
  personajes: [],
};

const ENSENA_C2 = {
  hechos: ["fin-de-la-glaciacion", "gobekli-tepe", "inicio-de-la-agricultura", "primeros-objetos-de-cobre", "escritura-cuneiforme"],
  personajes: [],
};

export const CLASES_HISTORIA_PREHISTORIA: ClaseHistoria[] = [
  // ---------------------------------------------------------------- 1 (preview gratis)
  {
    slug: "historia-clase-01-paleolitico",
    grupo: "prehistoria",
    orden: 1,
    requierePro: true,
    nombre: "Los primeros humanos: el Paleolítico",
    descripcion: "Cómo vivían los primeros humanos, qué cambió con el fuego y cómo nuestra especie llegó a todos los continentes.",
    conceptos: { introduce: ["paleolitico", "linea-de-tiempo", "epocas-historicas"], usa: [] },
    ensena: ENSENA_C1,
    pasos: [
      "Objetivo: al terminar podrás describir cómo vivían los primeros humanos y ordenar en el tiempo las herramientas de piedra, el fuego, la aparición de Homo sapiens y sus migraciones.",
      `Contexto: es la primera lección del curso y no necesitas saber nada antes. Solo ten presente que la Prehistoria es todo lo ocurrido antes de la escritura (que la escuela sitúa ${AH("escritura-cuneiforme")}), y que por eso sus fechas son siempre aproximadas.`,
      `El Paleolítico («piedra antigua») es la etapa más larga de la humanidad: empieza con las primeras herramientas de piedra talladas (${A("herramientas-de-piedra")}) y termina con el final de la última glaciación (${A("fin-de-la-glaciacion")}). Simplificación de nivel escolar: los especialistas lo dividen en fases. Los grupos eran pequeños, nómadas, y vivían de la caza, la pesca y la recolección.`,
      `Dominar el fuego (${A("uso-del-fuego")}) permitió calentarse, cocinar, ahuyentar animales y prolongar el día. Fue obra de homínidos anteriores a nuestra especie.`,
      `Los primeros Homo sapiens aparecen en África (${A("homo-sapiens")}); esa fecha se revisa cuando se descubren restos más antiguos. Desde allí nuestra especie se expandió: llegó a Australia (${A("humanos-en-australia")}) y a América (${A("poblamiento-de-america")}); sobre cuándo llegó a América los especialistas siguen discutiendo.`,
      `Los humanos del Paleolítico también dejaron arte: las pinturas rupestres de Lascaux (${A("pinturas-de-lascaux")}), en Francia, muestran sobre todo animales.`,
      "Personajes clave: en la Prehistoria no conocemos nombres, porque nadie los escribió. Conocemos a esas personas por lo que dejaron: herramientas, huesos, restos de fogatas y pinturas.",
      "Causas y consecuencias: cada avance abrió el siguiente. Con fuego y mejores herramientas, los grupos pudieron sobrevivir en climas fríos y expandirse a nuevos territorios; esa expansión llevó a nuestra especie a casi todos los continentes.",
      "Conecta con: la siguiente lección, el Neolítico, donde la agricultura cambia la forma de vivir; y con la Antigüedad, donde la escritura permite por fin fechar por año.",
      "Errores comunes: (1) creer que los dinosaurios y los humanos convivieron: los dinosaurios no aviares se extinguieron millones de años antes de que apareciera nuestra especie; (2) imaginar un «primer humano» en un año concreto: fue un proceso gradual; (3) leer «hacia» como un año exacto.",
    ],
    visuales: [linea(5, "Del primer útil de piedra a las primeras migraciones", ENSENA_C1.hechos, "orden")],
    quiz: [
      pregEpoca("homo-sapiens"),
      pregPrimero("uso-del-fuego", "humanos-en-australia"),
      preg(
        "¿Por qué en la Prehistoria no conocemos nombres de personas?",
        "Porque todavía no existía la escritura y solo quedan restos materiales",
        ["Porque entonces nadie tenía nombre", "Porque los nombres se perdieron en una guerra", "Porque los historiadores decidieron no anotarlos"],
        "La Prehistoria termina, por convención, con la invención de la escritura: antes de ella no hay textos y solo se estudian restos como herramientas, huesos y pinturas."
      ),
      preg(
        "¿Cuál de estas afirmaciones sobre el Paleolítico es correcta?",
        "Los grupos eran pequeños y nómadas, y vivían de la caza, la pesca y la recolección",
        ["Vivían en grandes ciudades amuralladas", "Cultivaban cereales en grandes campos", "Escribían tablillas para llevar cuentas"],
        "Las ciudades, la agricultura y la escritura aparecen mucho después, con el Neolítico y el final de la Prehistoria."
      ),
      preg(
        `Una fecha como «${A("homo-sapiens")}» para la aparición de Homo sapiens es...`,
        "Una estimación con un gran margen de error",
        ["El año exacto en que nació el primer ser humano", "Una fecha convencional que fija la escuela", "Una fecha que ya no se discute nunca"],
        "Las fechas de la Prehistoria son aproximadas y se revisan cuando aparecen nuevos hallazgos."
      ),
    ],
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "historia-clase-02-neolitico",
    grupo: "prehistoria",
    orden: 2,
    requierePro: true,
    nombre: "El Neolítico: la revolución agrícola y el fin de la Prehistoria",
    descripcion: "Cómo la agricultura transformó la vida humana y por qué la aparición de la escritura cierra la Prehistoria.",
    conceptos: { introduce: ["neolitico", "causa-y-consecuencia"], usa: ["linea-de-tiempo", "paleolitico"] },
    ensena: ENSENA_C2,
    pasos: [
      "Objetivo: al terminar podrás explicar qué fue la revolución agrícola, qué cambió con ella y por qué la aparición de la escritura se toma como el final de la Prehistoria.",
      `Contexto: en la lección anterior viste que los grupos del Paleolítico eran nómadas. El clima cambió cuando terminó la última glaciación (${A("fin-de-la-glaciacion")}) y eso abrió el camino a una forma de vida nueva.`,
      `Con un clima más templado y estable, en el Creciente Fértil (una región en forma de arco en Oriente Próximo) algunas comunidades empezaron a cultivar cereales y a criar animales: es el inicio de la agricultura (${A("inicio-de-la-agricultura")}). Se lo llama «revolución neolítica» («piedra nueva») porque cambió la forma de vivir, aunque el proceso llevó muchos siglos.`,
      `No todo el cambio fue solo agrícola. En Göbekli Tepe, en la actual Turquía, se levantó un templo de piedra monumental (${A("gobekli-tepe")}) que, según la mayoría de los especialistas, construyeron comunidades que aún no dependían de la agricultura. Y más tarde aparecen los primeros objetos de cobre fundido (${A("primeros-objetos-de-cobre")}), el comienzo de la metalurgia.`,
      `Al producir alimento y guardarlo, las comunidades se volvieron sedentarias: aparecieron las aldeas, los excedentes, los oficios especializados y las diferencias de riqueza. Con las aldeas grandes y los intercambios, en Sumeria surgió la escritura (${A("escritura-cuneiforme")}, por convención), que se usó primero para llevar cuentas. Esa invención marca el final de la Prehistoria.`,
      "Personajes clave: como en la lección anterior, no conocemos nombres. El protagonista colectivo son las primeras comunidades agrícolas.",
      "Causas y consecuencias: el fin de la glaciación favoreció la agricultura; la agricultura permitió aldeas y excedentes; y de ellos surgieron las ciudades y la escritura. Simplificación de nivel escolar: cada paso tuvo muchas causas y ocurrió en varias regiones.",
      `Conecta con: la Antigüedad, que empieza justo con ${Q("escritura-cuneiforme")}; y con la Técnica «Causa, hecho y consecuencia», que usa esta misma cadena.`,
      "Errores comunes: (1) la agricultura no apareció en un solo lugar ni en un solo año: surgió de forma independiente en varias regiones del mundo; (2) «revolución» no significa rápido, sino que cambió las cosas de raíz; (3) el Neolítico todavía es Prehistoria: la Antigüedad empieza con la escritura.",
    ],
    visuales: [
      linea(2, "Del fin de la glaciación a la escritura", ENSENA_C2.hechos),
      causas(6, "Una cadena de causas", ["fin-de-la-glaciacion", "inicio-de-la-agricultura", "escritura-cuneiforme"]),
    ],
    quiz: [
      pregPrimero("gobekli-tepe", "primeros-objetos-de-cobre"),
      pregEpoca("primeros-objetos-de-cobre"),
      pregCausa("inicio-de-la-agricultura", "fin-de-la-glaciacion", ["escritura-cuneiforme", "piramide-de-keops", "codigo-de-hammurabi"]),
      preg(
        "¿Qué hecho marca, por convención, el final de la Prehistoria?",
        N("escritura-cuneiforme"),
        [N("inicio-de-la-agricultura"), N("uso-del-fuego"), N("primeros-objetos-de-cobre")],
        `La Prehistoria es lo ocurrido antes de la escritura; la escuela sitúa su invención ${AH("escritura-cuneiforme")}.`
      ),
      preg(
        "¿Por qué se habla de «revolución» agrícola si el proceso llevó siglos?",
        "Porque cambió de raíz la forma de vivir, aunque el cambio fue lento",
        ["Porque ocurrió en un solo año", "Porque la hicieron ejércitos", "Porque solo ocurrió en Europa"],
        "«Revolución» se refiere a la profundidad del cambio (vida sedentaria, excedentes, aldeas), no a su rapidez."
      ),
    ],
  },
];
