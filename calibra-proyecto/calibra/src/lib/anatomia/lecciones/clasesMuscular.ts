import type { ClaseAnatomia } from "./tipos";
import { ENTRADAS_MUSCULOS_GRANDES, FLUJO_CONTRACCION } from "@/lib/anatomia/datos";

const entradas = (nombres: string[]) => ENTRADAS_MUSCULOS_GRANDES.filter((e) => nombres.includes(e.nombre));

// Clases (Pro) del sistema muscular: 5 lecciones. Origen, inserción y
// acción son de NIVEL COLEGIO: la acción principal y los huesos de anclaje
// más importantes, no las fichas completas de un atlas. Los 19 músculos
// que evalúa la práctica aparecen todos (lecciones.test.ts lo comprueba).
export const CLASES_MUSCULAR: ClaseAnatomia[] = [
  {
    slug: "anatomia-clase-tipos-y-contraccion",
    grupo: "muscular",
    orden: 1,
    requierePro: true,
    nombre: "Tipos de músculo y cómo se contraen",
    descripcion:
      "Los tres tipos de tejido muscular (esquelético, liso y cardíaco), las partes de un músculo esquelético y cómo se contrae una fibra: actina, miosina, calcio y energía.",
    pasos: [
      "Hay tres tipos de tejido muscular. El esquelético está unido a los huesos y se mueve a voluntad; se ve estriado al microscopio. El liso forma las paredes de órganos huecos y de vasos (estómago, intestino, vejiga, arterias) y es involuntario. El cardíaco forma el corazón: es estriado como el esquelético, pero involuntario.",
      "Un músculo esquelético se une al hueso mediante tendones. Tiene un vientre (la parte carnosa) y se ancla en dos huesos: el origen (el extremo más fijo) y la inserción (el extremo que se mueve). El cuerpo humano tiene más de 600 músculos esqueléticos.",
      "Funciones: producir movimiento, mantener la postura, generar calor (por eso tiritas de frío: contraes músculos para calentarte) y sostener y proteger órganos. Propiedades: contractilidad (acortarse), excitabilidad (responder a un estímulo), extensibilidad (estirarse) y elasticidad (volver a su forma).",
      "Cada fibra muscular contiene miofibrillas, formadas por filamentos de dos proteínas: actina y miosina. Cuando llega el impulso nervioso se libera calcio dentro de la fibra y los filamentos se deslizan uno sobre otro, acortándola. El proceso gasta energía en forma de ATP.",
      "Un músculo solo puede tirar, no empujar; por eso trabajan en pares: el agonista realiza el movimiento y el antagonista hace el contrario (bíceps y tríceps). La contracción es isotónica cuando el músculo cambia de longitud y hay movimiento, e isométrica cuando genera tensión sin cambiar de longitud, como al sostener un peso quieto.",
      "Errores comunes: creer que el corazón es músculo esquelético (es cardíaco e involuntario); pensar que los músculos «empujan» y confundir tendón (une músculo con hueso) con ligamento (une hueso con hueso).",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 0,
        titulo: "Tres tipos de tejido muscular",
        grupos: [
          { nombre: "Esquelético", items: [{ texto: "Estriado", detalle: "voluntario; unido a los huesos" }] },
          { nombre: "Liso", items: [{ texto: "No estriado", detalle: "involuntario; paredes del estómago, intestino, vejiga y vasos" }] },
          { nombre: "Cardíaco", items: [{ texto: "Estriado", detalle: "involuntario; solo en el corazón" }] },
        ],
      },
      { tipo: "anatomia.flujo", despuesDePaso: 3, titulo: "Cómo se contrae un músculo esquelético", etapas: FLUJO_CONTRACCION },
    ],
    quiz: [
      {
        pregunta: "¿Qué tipo de músculo es estriado pero involuntario?",
        opciones: ["Esquelético", "Liso", "Cardíaco", "Ninguno"],
        respuesta: "Cardíaco",
        explicacion: "El cardíaco tiene estrías como el esquelético, pero no lo controlas a voluntad.",
      },
      {
        pregunta: "¿Dónde se encuentra el músculo liso?",
        opciones: ["En las paredes del estómago y de los vasos", "Unido a los huesos de las piernas", "Solo en la cara", "Solo en el corazón"],
        respuesta: "En las paredes del estómago y de los vasos",
        explicacion: "El músculo liso forma las paredes de los órganos huecos y de los vasos sanguíneos.",
      },
      {
        pregunta: "¿Qué une un tendón?",
        opciones: ["Hueso con hueso", "Músculo con hueso", "Piel con músculo", "Músculo con músculo"],
        respuesta: "Músculo con hueso",
        explicacion: "Los ligamentos son los que unen hueso con hueso.",
      },
      {
        pregunta: "¿Qué dos proteínas se deslizan para acortar una fibra muscular?",
        opciones: ["Colágeno y elastina", "Actina y miosina", "Hemoglobina y albúmina", "Queratina y melanina"],
        respuesta: "Actina y miosina",
        explicacion: "Los filamentos de actina y miosina se deslizan y acortan la fibra; gastan ATP.",
      },
      {
        pregunta: "Sostener un peso sin moverlo es una contracción...",
        opciones: ["Isotónica", "Isométrica", "Involuntaria", "Lisa"],
        respuesta: "Isométrica",
        explicacion: "Isométrica: hay tensión, pero el músculo no cambia de longitud.",
      },
    ],
  },
  {
    slug: "anatomia-clase-nomenclatura-origen-insercion",
    grupo: "muscular",
    orden: 2,
    requierePro: true,
    nombre: "Nombres, origen e inserción de los músculos grandes",
    descripcion:
      "Cómo leer el nombre de un músculo y dónde se ancla cada uno de los diez músculos grandes que evalúa la práctica: origen, inserción y acción principal.",
    pasos: [
      "Los nombres de los músculos siguen criterios que puedes leer: forma (deltoides, trapecio), número de cabezas (bíceps, tríceps, cuádriceps), ubicación (pectoral, glúteos, frontal, temporal, occipital), dirección de las fibras (recto abdominal, oblicuos, transverso), tamaño (mayor, menor, ancho) y acción (masetero, flexor, extensor).",
      "Origen e inserción: el origen es el extremo unido al hueso más fijo (por lo general el más cercano al tronco) y la inserción es el extremo unido al hueso que se mueve. Al contraerse, el músculo acerca la inserción hacia el origen. Simplificación: las fichas reales tienen más puntos de anclaje; aquí van los principales.",
      "Miembro superior. Bíceps braquial: origen en la escápula, inserción en el radio; flexiona el codo. Tríceps braquial: origen en la escápula y el húmero, inserción en el cúbito (el olécranon, la punta del codo); extiende el codo. Deltoides: origen en la clavícula y la escápula, inserción en el húmero; levanta el brazo hacia el costado.",
      "Tronco. Pectoral mayor: origen en la clavícula, el esternón y los cartílagos de las costillas superiores, inserción en el húmero; lleva el brazo hacia adelante y adentro. Dorsal ancho: origen en las vértebras de la parte baja de la espalda, el sacro y la cresta ilíaca (hueso de la cadera), inserción en el húmero; lleva el brazo hacia atrás y abajo. Trapecio: origen en el occipital y en las vértebras cervicales y torácicas, inserción en la clavícula y la escápula; sube y junta los omóplatos. Recto abdominal: origen en el pubis, inserción en el esternón y en los cartílagos de las costillas 5 a 7; flexiona el tronco.",
      "Miembro inferior. Glúteos (sobre todo el mayor): origen en el ilion, el sacro y el cóccix, inserción en el fémur; extienden la cadera. Cuádriceps: origen en la cadera y el fémur, inserción en la tibia a través de la rótula; extiende la rodilla. Gastrocnemio: origen en el fémur, sobre la rodilla, inserción en el calcáneo a través del tendón de Aquiles; levanta el talón.",
      "Errores comunes: creer que el origen es siempre el extremo que no se mueve (en algunos movimientos se invierten los papeles) y olvidar que un músculo cruza al menos una articulación: por eso sus dos anclajes están en huesos distintos.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 0,
        titulo: "Cómo leer un nombre",
        grupos: [
          { nombre: "Forma", items: [{ texto: "Deltoides" }, { texto: "Trapecio" }] },
          { nombre: "Número de cabezas", items: [{ texto: "Bíceps", marca: "2" }, { texto: "Tríceps", marca: "3" }, { texto: "Cuádriceps", marca: "4" }] },
          { nombre: "Ubicación", items: [{ texto: "Pectoral mayor" }, { texto: "Glúteos" }, { texto: "Recto abdominal" }] },
          { nombre: "Tamaño o dirección", items: [{ texto: "Dorsal ancho" }, { texto: "Recto abdominal" }] },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Origen → inserción",
        grupos: [
          {
            nombre: "Brazo y hombro",
            items: [
              { texto: "Bíceps", detalle: "escápula → radio: flexiona el codo" },
              { texto: "Tríceps", detalle: "escápula y húmero → cúbito: extiende el codo" },
              { texto: "Deltoides", detalle: "clavícula y escápula → húmero: levanta el brazo" },
            ],
          },
          {
            nombre: "Tronco",
            items: [
              { texto: "Pectoral mayor", detalle: "clavícula, esternón y costillas → húmero" },
              { texto: "Dorsal ancho", detalle: "espalda baja, sacro y cadera → húmero" },
              { texto: "Trapecio", detalle: "occipital y vértebras → clavícula y escápula" },
              { texto: "Recto abdominal", detalle: "pubis → esternón y costillas 5 a 7" },
            ],
          },
          {
            nombre: "Cadera y pierna",
            items: [
              { texto: "Glúteos", detalle: "ilion, sacro y cóccix → fémur" },
              { texto: "Cuádriceps", detalle: "cadera y fémur → tibia, por la rótula" },
              { texto: "Gastrocnemio", detalle: "fémur → calcáneo, por el tendón de Aquiles" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué es la inserción de un músculo?",
        opciones: [
          "El extremo unido al hueso más fijo",
          "El extremo unido al hueso que se mueve",
          "El centro del vientre muscular",
          "La membrana que lo envuelve",
        ],
        respuesta: "El extremo unido al hueso que se mueve",
        explicacion: "El origen es el extremo más fijo; la inserción es el que se mueve al contraerse el músculo.",
      },
      {
        pregunta: "¿En qué hueso se inserta el bíceps braquial?",
        opciones: ["Húmero", "Escápula", "Radio", "Fémur"],
        respuesta: "Radio",
        explicacion: "Origen en la escápula e inserción en el radio: al contraerse, flexiona el codo.",
      },
      {
        pregunta: "¿Dónde se inserta el tríceps braquial?",
        opciones: ["En el olécranon del cúbito", "En la tibia", "En la clavícula", "En el calcáneo"],
        respuesta: "En el olécranon del cúbito",
        explicacion: "Por eso extiende el codo: tira de la punta del cúbito.",
      },
      {
        pregunta: "¿Qué tendón une el gastrocnemio con el talón?",
        opciones: ["El tendón rotuliano", "El tendón de Aquiles", "El tendón del bíceps", "El ligamento cruzado"],
        respuesta: "El tendón de Aquiles",
        explicacion: "El tendón de Aquiles (calcáneo) es el más grueso del cuerpo.",
      },
      {
        pregunta: "¿Cuál de estos músculos flexiona el tronco?",
        opciones: ["Trapecio", "Recto abdominal", "Deltoides", "Gastrocnemio"],
        respuesta: "Recto abdominal",
        explicacion: "Del pubis al esternón y las costillas: al contraerse, acerca el tórax a la pelvis.",
      },
    ],
  },
  {
    slug: "anatomia-clase-musculos-cabeza-cuello",
    grupo: "muscular",
    orden: 3,
    requierePro: true,
    nombre: "Músculos de la cabeza y el cuello",
    descripcion:
      "Los músculos de la expresión facial (frontal, orbiculares, cigomático mayor, buccinador, occipital y platisma), los de la masticación (masetero y temporal), los del cuello y sus nervios.",
    pasos: [
      "Los músculos de la cabeza se dividen en dos grupos: los de la expresión facial, que mueven la piel (se unen al hueso por un extremo y a la piel por el otro), y los de la masticación, que mueven la mandíbula.",
      "Expresión: el frontal (en la frente) sube las cejas y arruga la frente; el orbicular de los ojos cierra los párpados; el orbicular de la boca cierra y frunce los labios; el cigomático mayor tira de la comisura de la boca hacia arriba (es el de la sonrisa); el buccinador, en la mejilla, comprime la mejilla, como al soplar. Todos los mueve el nervio facial (VII).",
      "El occipital y el frontal son los dos vientres de un mismo músculo del cuero cabelludo (occipitofrontal), unidos por una lámina de tendón; el occipital, en la nuca, tira del cuero cabelludo hacia atrás. El platisma es una lámina fina bajo la piel del cuello que baja el labio inferior y la mandíbula. También los mueve el nervio facial.",
      "Masticación: el masetero (va del pómulo al ángulo de la mandíbula) y el temporal (en la sien) elevan la mandíbula para cerrar la boca. Los mueve el nervio trigémino (V).",
      "Cuello: el esternocleidomastoideo va del esternón y la clavícula hasta la apófisis mastoides del hueso temporal (detrás de la oreja) y gira e inclina la cabeza; el trapecio sube los hombros y sostiene la cabeza. Ambos los mueve el nervio accesorio (XI).",
      "Errores comunes: llamar «músculos de la cara» a todo el grupo (el occipital está en la nuca y el platisma en el cuello); confundir el hueso temporal con el músculo temporal y creer que los músculos de la masticación son de expresión.",
    ],
    visuales: [
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Expresión y masticación",
        grupos: [
          {
            nombre: "Expresión (nervio facial, VII)",
            items: [
              { texto: "Frontal", detalle: "sube las cejas" },
              { texto: "Orbicular de los ojos", detalle: "cierra los párpados" },
              { texto: "Orbicular de la boca", detalle: "cierra y frunce los labios" },
              { texto: "Cigomático mayor", detalle: "sonrisa" },
              { texto: "Buccinador", detalle: "comprime la mejilla" },
              { texto: "Occipital", detalle: "tira del cuero cabelludo hacia atrás" },
              { texto: "Platisma", detalle: "baja el labio inferior y la mandíbula" },
            ],
          },
          {
            nombre: "Masticación (nervio trigémino, V)",
            items: [
              { texto: "Masetero", detalle: "eleva la mandíbula" },
              { texto: "Temporal", detalle: "eleva la mandíbula" },
            ],
          },
        ],
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Cuello (nervio accesorio, XI)",
        grupos: [
          {
            nombre: "Cuello y hombros",
            items: [
              { texto: "Esternocleidomastoideo", detalle: "gira e inclina la cabeza" },
              { texto: "Trapecio", detalle: "sube los hombros; sostiene la cabeza" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué nervio craneal mueve los músculos de la expresión facial?",
        opciones: ["Trigémino (V)", "Facial (VII)", "Vago (X)", "Hipogloso (XII)"],
        respuesta: "Facial (VII)",
        explicacion: "El facial (VII) inerva los músculos de la expresión; el trigémino (V), los de la masticación.",
      },
      {
        pregunta: "¿Qué hacen el masetero y el temporal?",
        opciones: ["Cierran los párpados", "Elevan la mandíbula para masticar", "Suben las cejas", "Giran la cabeza"],
        respuesta: "Elevan la mandíbula para masticar",
        explicacion: "Son los músculos de la masticación: cierran la boca con fuerza.",
      },
      {
        pregunta: "¿Dónde está el músculo occipital?",
        opciones: ["En la frente", "En la parte de atrás de la cabeza (nuca)", "En la mejilla", "En la sien"],
        respuesta: "En la parte de atrás de la cabeza (nuca)",
        explicacion: "Es el vientre posterior del músculo del cuero cabelludo; el frontal es el anterior.",
      },
      {
        pregunta: "¿Dónde se ubica el platisma?",
        opciones: ["En el cuello, bajo la piel", "En la frente", "En el muslo", "En el abdomen"],
        respuesta: "En el cuello, bajo la piel",
        explicacion: "Es una lámina superficial del cuello: por eso no es solo «de la cara».",
      },
      {
        pregunta: "¿Qué nervio mueve el trapecio y el esternocleidomastoideo?",
        opciones: ["Accesorio (XI)", "Óptico (II)", "Facial (VII)", "Oculomotor (III)"],
        respuesta: "Accesorio (XI)",
        explicacion: "El nervio accesorio es motor de estos dos músculos del cuello y el hombro.",
      },
    ],
  },
  {
    slug: "anatomia-clase-musculos-del-tronco",
    grupo: "muscular",
    orden: 4,
    requierePro: true,
    nombre: "Músculos del tronco: pecho, abdomen y espalda",
    descripcion:
      "Los músculos que mueven el brazo y la columna y sostienen el abdomen: pectoral mayor, recto abdominal, trapecio y dorsal ancho, más el diafragma, los músculos intercostales, los oblicuos y el transverso.",
    pasos: [
      "El tronco tiene músculos que mueven el brazo, la columna y la respiración. Por delante están el pectoral mayor (pecho) y el recto abdominal (abdomen); por detrás, el trapecio y el dorsal ancho.",
      "Pecho: el pectoral mayor lleva el brazo hacia adelante y adentro, como para abrazar; debajo está el pectoral menor. Los músculos intercostales, entre las costillas, ayudan a respirar. El diafragma es el principal músculo de la respiración: separa el tórax del abdomen y baja al inspirar.",
      "Abdomen: la pared abdominal tiene cuatro músculos: el recto abdominal (vertical, flexiona el tronco), los oblicuos externo e interno (giran e inclinan el tronco) y el transverso del abdomen (el más profundo, comprime como un corsé). Sostienen y protegen las vísceras y ayudan a mantener la postura.",
      "Espalda: el trapecio (con forma de trapecio, del cuello hasta la mitad de la espalda) sube, junta y baja los omóplatos; el dorsal ancho, el más ancho de la espalda, lleva el brazo hacia atrás y abajo; los erectores de la columna, a lo largo de la columna, ayudan a mantenerla derecha.",
      "En el esquema puedes ubicar cada uno por región. Es un esquema de regiones, no un dibujo anatómico.",
      "Errores comunes: creer que los «abdominales» son solo el recto abdominal (la pared tiene cuatro músculos) y confundir el trapecio (cuello y espalda alta) con el deltoides (el hombro).",
    ],
    visuales: [
      {
        tipo: "anatomia.cuerpo",
        despuesDePaso: 4,
        titulo: "Músculos del tronco por región",
        entradas: entradas(["Pectoral mayor", "Recto abdominal", "Trapecio", "Dorsal ancho"]),
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Los cuatro músculos de la pared abdominal",
        grupos: [
          {
            nombre: "Pared abdominal",
            items: [
              { texto: "Recto abdominal", detalle: "vertical; flexiona el tronco" },
              { texto: "Oblicuo externo", detalle: "gira e inclina el tronco" },
              { texto: "Oblicuo interno", detalle: "gira e inclina el tronco" },
              { texto: "Transverso del abdomen", detalle: "el más profundo; comprime" },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es el principal músculo de la respiración?",
        opciones: ["Trapecio", "Diafragma", "Recto abdominal", "Deltoides"],
        respuesta: "Diafragma",
        explicacion: "El diafragma separa el tórax del abdomen y baja al inspirar.",
      },
      {
        pregunta: "¿Qué músculo lleva el brazo hacia atrás y abajo?",
        opciones: ["Pectoral mayor", "Dorsal ancho", "Bíceps", "Cuádriceps"],
        respuesta: "Dorsal ancho",
        explicacion: "El dorsal ancho es antagonista del pectoral mayor en el hombro.",
      },
      {
        pregunta: "¿Cuántos músculos forman la pared abdominal descrita en esta clase?",
        opciones: ["2", "3", "4", "6"],
        respuesta: "4",
        explicacion: "Recto abdominal, oblicuo externo, oblicuo interno y transverso del abdomen.",
      },
      {
        pregunta: "¿Qué hace el trapecio con los omóplatos?",
        opciones: ["Los sube y los junta", "Los separa del cuerpo", "Los deja fijos", "Los gira hacia el pecho"],
        respuesta: "Los sube y los junta",
        explicacion: "Sus fibras superiores los suben y las medias los juntan.",
      },
      {
        pregunta: "¿Hacia dónde lleva el brazo el pectoral mayor?",
        opciones: ["Hacia atrás y abajo", "Hacia adelante y adentro", "Solo hacia arriba", "Lo mantiene quieto"],
        respuesta: "Hacia adelante y adentro",
        explicacion: "Como para abrazar: aduce y flexiona el brazo.",
      },
    ],
  },
  {
    slug: "anatomia-clase-musculos-de-las-extremidades",
    grupo: "muscular",
    orden: 5,
    requierePro: true,
    nombre: "Músculos de los brazos y las piernas",
    descripcion:
      "Deltoides, bíceps y tríceps en el miembro superior; glúteos, cuádriceps, isquiotibiales y músculos de la pantorrilla en el inferior, con sus pares de antagonistas.",
    pasos: [
      "Miembro superior: el deltoides cubre el hombro y levanta el brazo hacia el costado. En el brazo, el bíceps braquial, por delante, flexiona el codo (y gira el antebrazo para que la palma mire hacia arriba); el tríceps braquial, por detrás, lo extiende. En el antebrazo, los flexores (por delante) doblan la muñeca y los dedos y los extensores (por detrás) los estiran.",
      "Cadera y muslo: los glúteos (mayor, medio y menor) forman la nalga; el glúteo mayor es el más grande y extiende la cadera (al subir escaleras o levantarte de una silla). Delante del muslo, el cuádriceps (cuatro cabezas: recto femoral y tres vastos) extiende la rodilla; detrás, los isquiotibiales la flexionan; en la cara interna, los aductores juntan las piernas.",
      "Pierna: el gastrocnemio (la pantorrilla) y el sóleo, más profundo, se unen al calcáneo por el tendón de Aquiles, el más grueso del cuerpo, y levantan el talón. El tibial anterior, en la parte delantera de la pierna, levanta la punta del pie.",
      "Antagonistas por articulación: codo (bíceps y tríceps), rodilla (cuádriceps e isquiotibiales), tobillo (gastrocnemio y tibial anterior) y hombro (pectoral mayor y dorsal ancho). Si sabes uno, sabes su opuesto.",
      "Errores comunes: creer que el cuádriceps es un solo bulto (tiene cuatro cabezas); confundir el gastrocnemio (superficial, forma el bulto de la pantorrilla) con el sóleo (más profundo) y pensar que los glúteos son solo un relleno: están entre los músculos más potentes del cuerpo.",
    ],
    visuales: [
      {
        tipo: "anatomia.cuerpo",
        despuesDePaso: 2,
        titulo: "Extremidades por región",
        entradas: entradas(["Deltoides", "Bíceps", "Tríceps", "Glúteos", "Cuádriceps", "Gastrocnemio"]),
      },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 3,
        titulo: "Pares de músculos opuestos",
        grupos: [
          { nombre: "Codo", items: [{ texto: "Bíceps", marca: "flexiona" }, { texto: "Tríceps", marca: "extiende" }] },
          { nombre: "Rodilla", items: [{ texto: "Cuádriceps", marca: "extiende" }, { texto: "Isquiotibiales", marca: "flexionan" }] },
          { nombre: "Tobillo", items: [{ texto: "Gastrocnemio", detalle: "levanta el talón" }, { texto: "Tibial anterior", detalle: "levanta la punta" }] },
          { nombre: "Hombro", items: [{ texto: "Pectoral mayor", detalle: "adelante y adentro" }, { texto: "Dorsal ancho", detalle: "atrás y abajo" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántas cabezas tiene el cuádriceps?",
        opciones: ["2", "3", "4", "5"],
        respuesta: "4",
        explicacion: "Recto femoral y tres vastos: por eso «cuádriceps».",
      },
      {
        pregunta: "¿Qué tendón une el gastrocnemio y el sóleo con el calcáneo?",
        opciones: ["Tendón de Aquiles", "Tendón rotuliano", "Ligamento colateral", "Tendón del bíceps"],
        respuesta: "Tendón de Aquiles",
        explicacion: "Es el tendón más grueso del cuerpo.",
      },
      {
        pregunta: "¿Qué músculo extiende la cadera y forma la nalga?",
        opciones: ["Glúteo mayor", "Cuádriceps", "Tibial anterior", "Deltoides"],
        respuesta: "Glúteo mayor",
        explicacion: "El glúteo mayor es el más grande de los tres glúteos y extiende la cadera.",
      },
      {
        pregunta: "¿Cuál es el antagonista del tríceps braquial?",
        opciones: ["Bíceps braquial", "Deltoides", "Gastrocnemio", "Sóleo"],
        respuesta: "Bíceps braquial",
        explicacion: "El bíceps flexiona el codo y el tríceps lo extiende.",
      },
      {
        pregunta: "¿Qué hace el deltoides?",
        opciones: ["Extiende la rodilla", "Levanta el brazo hacia el costado", "Flexiona el tronco", "Cierra los párpados"],
        respuesta: "Levanta el brazo hacia el costado",
        explicacion: "Cubre el hombro y abduce el brazo.",
      },
    ],
  },
];
