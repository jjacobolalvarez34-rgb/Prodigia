import type { ClaseAnatomia } from "./tipos";
import {
  ENTRADAS_ORGANOS,
  FLUJO_ALIMENTO,
  FLUJO_AIRE,
  FLUJO_ORINA,
  FLUJO_SANGRE,
  gruposCavidades,
} from "@/lib/anatomia/datos";

const entradas = (nombres: string[]) => ENTRADAS_ORGANOS.filter((e) => nombres.includes(e.nombre));

// Clases (Pro) de órganos y aparatos: 5 lecciones. Cubren los 10 órganos que
// evalúa la práctica. Se dejaron FUERA a propósito el aparato reproductor y
// el sistema endocrino completo: la práctica no evalúa ningún órgano de
// ellos (el páncreas, único evaluado, se explica en el aparato digestivo
// con su función endocrina). Cifras aproximadas marcadas como tales.
export const CLASES_ORGANOS: ClaseAnatomia[] = [
  {
    slug: "anatomia-clase-cavidades-del-cuerpo",
    grupo: "organos",
    orden: 1,
    requierePro: true,
    nombre: "Las cavidades del cuerpo y sus órganos",
    descripcion:
      "Las cavidades que alojan y protegen los órganos (craneal, torácica, abdominal y pélvica), el diafragma, las membranas que las recubren y los cuadrantes del abdomen.",
    pasos: [
      "El cuerpo tiene espacios internos, las cavidades, que alojan y protegen los órganos. Hay dos grandes: la cavidad dorsal, hacia atrás, y la cavidad ventral, hacia adelante.",
      "La cavidad dorsal incluye la cavidad craneal, que aloja el encéfalo (en Prodigia, el cerebro), y el conducto vertebral, que aloja la médula espinal.",
      "La cavidad ventral se divide con el diafragma, un músculo en forma de cúpula. Arriba está la cavidad torácica, con el corazón y los pulmones (el espacio entre los dos pulmones se llama mediastino y contiene también la tráquea y el esófago). Abajo está la cavidad abdominopélvica, que se subdivide en la cavidad abdominal (hígado, estómago, intestinos, páncreas, bazo y riñones) y la cavidad pélvica (vejiga y el tramo final del intestino, el recto).",
      "Cada cavidad está tapizada por membranas serosas, con un poco de líquido que reduce la fricción: la pleura envuelve los pulmones, el pericardio el corazón y el peritoneo el abdomen. Los riñones y el páncreas quedan detrás del peritoneo (se dice que son retroperitoneales).",
      "Para ubicar algo en el abdomen se lo divide en cuatro cuadrantes: superior derecho, superior izquierdo, inferior derecho e inferior izquierdo. El hígado está en el cuadrante superior derecho; el estómago y el bazo, en el superior izquierdo.",
      "Errores comunes: creer que el corazón está entero en el lado izquierdo (está en el centro del tórax, con la punta inclinada a la izquierda); creer que la vejiga está en el abdomen (está en la pelvis) y creer que los riñones están «adelante» (están atrás, a cada lado de la columna).",
    ],
    visuales: [
      { tipo: "anatomia.grupos", despuesDePaso: 2, titulo: "Cuatro cavidades y sus órganos", grupos: gruposCavidades() },
      { tipo: "anatomia.cuerpo", despuesDePaso: 3, titulo: "Dónde queda cada órgano", entradas: ENTRADAS_ORGANOS },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Cuadrantes del abdomen",
        grupos: [
          { nombre: "Superior derecho", items: [{ texto: "Hígado" }] },
          { nombre: "Superior izquierdo", items: [{ texto: "Estómago" }, { texto: "Bazo" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Qué estructura separa la cavidad torácica de la abdominal?",
        opciones: ["El esternón", "El diafragma", "El peritoneo", "El mediastino"],
        respuesta: "El diafragma",
        explicacion: "Es un músculo en forma de cúpula que separa el tórax del abdomen.",
      },
      {
        pregunta: "¿Dónde están los riñones?",
        opciones: ["En la pelvis", "En el tórax", "Atrás en el abdomen, a cada lado de la columna", "Delante del estómago"],
        respuesta: "Atrás en el abdomen, a cada lado de la columna",
        explicacion: "Son retroperitoneales: quedan detrás de la membrana que envuelve el abdomen.",
      },
      {
        pregunta: "¿Qué membrana serosa envuelve el corazón?",
        opciones: ["Pleura", "Peritoneo", "Pericardio", "Meninges"],
        respuesta: "Pericardio",
        explicacion: "Pleura (pulmones), pericardio (corazón), peritoneo (abdomen).",
      },
      {
        pregunta: "¿En qué cuadrante del abdomen está el hígado?",
        opciones: ["Superior derecho", "Inferior izquierdo", "Superior izquierdo", "Inferior derecho"],
        respuesta: "Superior derecho",
        explicacion: "El hígado ocupa sobre todo el lado derecho, bajo el diafragma.",
      },
      {
        pregunta: "¿En qué cavidad está la vejiga?",
        opciones: ["Abdominal", "Torácica", "Pélvica", "Craneal"],
        respuesta: "Pélvica",
        explicacion: "La vejiga está dentro de la pelvis, detrás del pubis.",
      },
    ],
  },
  {
    slug: "anatomia-clase-aparato-digestivo",
    grupo: "organos",
    orden: 2,
    requierePro: true,
    nombre: "Aparato digestivo: del bocado al ano",
    descripcion:
      "El tubo digestivo paso a paso (boca, esófago, estómago, intestinos) y las glándulas que lo ayudan: hígado, vesícula, páncreas y glándulas salivales.",
    pasos: [
      "El aparato digestivo transforma los alimentos en nutrientes que la sangre puede llevar a las células. Tiene un tubo digestivo (boca, faringe, esófago, estómago, intestino delgado, intestino grueso, recto y ano) y glándulas anexas (glándulas salivales, hígado, vesícula biliar y páncreas).",
      "Hay digestión mecánica (masticar, mezclar) y química (enzimas). En la boca, la saliva contiene amilasa, una enzima que empieza a digerir el almidón. El esófago empuja el alimento hasta el estómago con movimientos ondulatorios (peristaltismo).",
      "El estómago es una bolsa muscular en la parte superior izquierda del abdomen. Mezcla el alimento con el jugo gástrico (ácido clorhídrico y pepsina, una enzima que digiere proteínas) y lo convierte en una pasta. Una capa de moco protege sus paredes del ácido.",
      "El intestino delgado mide unos 6 metros y tiene tres partes: duodeno, yeyuno e íleon. Allí llegan la bilis y el jugo pancreático. Sus paredes tienen vellosidades, que aumentan la superficie por donde los nutrientes pasan a la sangre. El intestino grueso mide alrededor de 1,5 metros: absorbe agua y sales y forma las heces, que se almacenan en el recto y salen por el ano.",
      "El hígado es la glándula más grande del cuerpo. Produce la bilis, que ayuda a digerir las grasas, almacena glucosa en forma de glucógeno y transforma sustancias. La vesícula biliar guarda la bilis. El páncreas produce el jugo pancreático, con enzimas que vierte en el duodeno, y además las hormonas insulina y glucagón, que regulan la glucosa en la sangre.",
      "Errores comunes: creer que el alimento pasa por el hígado o el páncreas (solo llegan sus jugos); confundir digerir (descomponer) con absorber (pasar a la sangre) y pensar que el estómago absorbe la mayoría de los nutrientes (lo hace el intestino delgado).",
    ],
    visuales: [
      { tipo: "anatomia.flujo", despuesDePaso: 1, titulo: "Recorrido del alimento", etapas: FLUJO_ALIMENTO },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Glándulas anexas",
        grupos: [
          { nombre: "Hígado", items: [{ texto: "Bilis", detalle: "digestión de las grasas" }, { texto: "Glucógeno", detalle: "almacena glucosa" }] },
          { nombre: "Vesícula biliar", items: [{ texto: "Guarda la bilis" }] },
          { nombre: "Páncreas", items: [{ texto: "Jugo pancreático", detalle: "enzimas al duodeno" }, { texto: "Insulina y glucagón", detalle: "hormonas de la glucosa" }] },
        ],
      },
    ],
    quiz: [
      {
        pregunta: "¿Dónde empieza la digestión química del almidón?",
        opciones: ["En el estómago", "En la boca, con la saliva", "En el intestino grueso", "En el hígado"],
        respuesta: "En la boca, con la saliva",
        explicacion: "La amilasa de la saliva empieza a digerir el almidón.",
      },
      {
        pregunta: "¿Qué contiene el jugo gástrico?",
        opciones: ["Bilis", "Insulina", "Ácido clorhídrico y pepsina", "Amilasa"],
        respuesta: "Ácido clorhídrico y pepsina",
        explicacion: "El ácido y la pepsina digieren las proteínas en el estómago.",
      },
      {
        pregunta: "¿Qué órgano absorbe la mayor parte de los nutrientes?",
        opciones: ["Estómago", "Intestino delgado", "Esófago", "Intestino grueso"],
        respuesta: "Intestino delgado",
        explicacion: "Sus vellosidades dan una gran superficie de absorción.",
      },
      {
        pregunta: "¿Qué produce el hígado que ayuda a digerir las grasas?",
        opciones: ["Bilis", "Insulina", "Pepsina", "Saliva"],
        respuesta: "Bilis",
        explicacion: "La bilis se guarda en la vesícula y se vierte en el intestino delgado.",
      },
      {
        pregunta: "¿Qué hormonas produce el páncreas para regular la glucosa?",
        opciones: ["Adrenalina y cortisol", "Insulina y glucagón", "Tiroxina y calcitonina", "Bilis y saliva"],
        respuesta: "Insulina y glucagón",
        explicacion: "Además de su función digestiva, el páncreas es una glándula endocrina.",
      },
    ],
  },
  {
    slug: "anatomia-clase-aparato-respiratorio",
    grupo: "organos",
    orden: 3,
    requierePro: true,
    nombre: "Aparato respiratorio: vías, pulmones y alvéolos",
    descripcion:
      "El camino del aire, la estructura de los pulmones (3 lóbulos a la derecha y 2 a la izquierda), los alvéolos donde ocurre el intercambio de gases y la mecánica de la respiración.",
    pasos: [
      "El aparato respiratorio aporta oxígeno a la sangre y elimina dióxido de carbono. Tiene las vías respiratorias (nariz, faringe, laringe, tráquea, bronquios y bronquiolos) y los pulmones.",
      "En las vías: la nariz calienta, humedece y filtra el aire; la faringe es un cruce con el aparato digestivo; la laringe contiene las cuerdas vocales y la epiglotis, que tapa la vía al tragar; la tráquea es un tubo con anillos de cartílago que la mantienen abierta y se divide en dos bronquios, uno para cada pulmón.",
      "Los pulmones ocupan la mayor parte de la cavidad torácica, a cada lado del corazón. El derecho tiene 3 lóbulos y el izquierdo 2, porque comparte espacio con el corazón. Cada pulmón está envuelto por la pleura.",
      "Los bronquios se ramifican en bronquiolos cada vez más finos y terminan en los alvéolos: sacos diminutos (cientos de millones) rodeados de capilares. Allí el oxígeno pasa a la sangre y el dióxido de carbono pasa al aire para salir.",
      "Ventilación: al inspirar, el diafragma se contrae y baja y los músculos intercostales elevan las costillas; el tórax se agranda y entra el aire. Al espirar se relajan y el aire sale. Los pulmones no tienen músculo propio: se llenan y se vacían porque cambia el volumen del tórax.",
      "Errores comunes: creer que los dos pulmones son iguales; confundir ventilar (mover el aire) con el intercambio de gases (ocurre en los alvéolos) y pensar que el intercambio sucede en la tráquea.",
    ],
    visuales: [
      { tipo: "anatomia.flujo", despuesDePaso: 1, titulo: "Recorrido del aire", etapas: FLUJO_AIRE },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 2,
        titulo: "Los dos pulmones",
        grupos: [
          { nombre: "Pulmón derecho", items: [{ texto: "3 lóbulos" }] },
          { nombre: "Pulmón izquierdo", items: [{ texto: "2 lóbulos", detalle: "deja lugar al corazón" }] },
        ],
      },
      {
        tipo: "anatomia.cuerpo",
        despuesDePaso: 2,
        titulo: "Ubicación de los pulmones",
        entradas: entradas(["Pulmones", "Corazón"]),
      },
    ],
    quiz: [
      {
        pregunta: "¿Cuántos lóbulos tiene el pulmón derecho?",
        opciones: ["2", "3", "4", "5"],
        respuesta: "3",
        explicacion: "El derecho tiene 3 y el izquierdo 2.",
      },
      {
        pregunta: "¿Qué evita que la tráquea se cierre?",
        opciones: ["Anillos de cartílago", "Válvulas cardíacas", "El diafragma", "Las cuerdas vocales"],
        respuesta: "Anillos de cartílago",
        explicacion: "Los anillos de cartílago mantienen la tráquea abierta.",
      },
      {
        pregunta: "¿Dónde se intercambian el oxígeno y el dióxido de carbono con la sangre?",
        opciones: ["En los bronquios", "En los alvéolos", "En la laringe", "En la pleura"],
        respuesta: "En los alvéolos",
        explicacion: "Sus paredes finas y los capilares que los rodean permiten el intercambio.",
      },
      {
        pregunta: "¿Qué hace el diafragma al inspirar?",
        opciones: ["Se relaja y sube", "Se contrae y baja", "Cierra la laringe", "Bombea sangre"],
        respuesta: "Se contrae y baja",
        explicacion: "Así agranda el tórax y entra el aire.",
      },
      {
        pregunta: "¿Qué estructura tapa la laringe al tragar?",
        opciones: ["La epiglotis", "La úvula", "El bronquio", "La pleura"],
        respuesta: "La epiglotis",
        explicacion: "Evita que el alimento entre en las vías respiratorias.",
      },
    ],
  },
  {
    slug: "anatomia-clase-corazon-sangre-y-bazo",
    grupo: "organos",
    orden: 4,
    requierePro: true,
    nombre: "Corazón, vasos, sangre y bazo",
    descripcion:
      "El corazón y sus 4 cavidades, arterias, venas y capilares, los dos circuitos de la sangre, sus componentes y el bazo, órgano del sistema linfático.",
    pasos: [
      "El aparato circulatorio lleva la sangre a todo el cuerpo. Lo forman el corazón (la bomba), los vasos sanguíneos (arterias, venas y capilares) y la sangre.",
      "El corazón, del tamaño aproximado de un puño, está en el centro del tórax, con la punta inclinada hacia la izquierda. Tiene cuatro cavidades: dos aurículas (arriba, reciben la sangre) y dos ventrículos (abajo, la impulsan), y válvulas que evitan el retroceso. Su músculo se llama miocardio.",
      "Las arterias sacan la sangre del corazón y tienen paredes gruesas y elásticas; las venas la traen de vuelta y tienen válvulas; los capilares son vasos finísimos donde se intercambian oxígeno y nutrientes con los tejidos. La aorta es la arteria más grande.",
      "Dos circuitos: la circulación menor (pulmonar) va del ventrículo derecho a los pulmones y vuelve a la aurícula izquierda; la circulación mayor (sistémica) va del ventrículo izquierdo a todo el cuerpo y vuelve a la aurícula derecha.",
      "La sangre tiene plasma (la parte líquida), glóbulos rojos (llevan el oxígeno con la hemoglobina), glóbulos blancos (defensa) y plaquetas (coagulación).",
      "El bazo, un órgano del sistema linfático de aproximadamente el tamaño de un puño, está arriba a la izquierda del abdomen, bajo el diafragma y junto al estómago. Filtra la sangre, elimina glóbulos rojos viejos, guarda plaquetas y participa en las defensas del cuerpo.",
      "Errores comunes: creer que todas las arterias llevan sangre oxigenada (las pulmonares no); creer que el corazón está en el lado izquierdo del pecho (está en el centro) y creer que el bazo es del aparato digestivo.",
    ],
    visuales: [
      { tipo: "anatomia.flujo", despuesDePaso: 3, titulo: "Circulación de la sangre", etapas: FLUJO_SANGRE, ciclo: true },
      {
        tipo: "anatomia.grupos",
        despuesDePaso: 4,
        titulo: "Componentes de la sangre",
        grupos: [
          { nombre: "Plasma", items: [{ texto: "Parte líquida" }] },
          { nombre: "Glóbulos rojos", items: [{ texto: "Transportan oxígeno" }] },
          { nombre: "Glóbulos blancos", items: [{ texto: "Defensa" }] },
          { nombre: "Plaquetas", items: [{ texto: "Coagulación" }] },
        ],
      },
      { tipo: "anatomia.cuerpo", despuesDePaso: 5, titulo: "Corazón y bazo", entradas: entradas(["Corazón", "Bazo"]) },
    ],
    quiz: [
      {
        pregunta: "¿Cuántas cavidades tiene el corazón?",
        opciones: ["2", "3", "4", "6"],
        respuesta: "4",
        explicacion: "Dos aurículas y dos ventrículos.",
      },
      {
        pregunta: "La circulación menor (pulmonar) va del ventrículo derecho hacia...",
        opciones: ["Los pulmones", "La aorta", "Todo el cuerpo", "El hígado"],
        respuesta: "Los pulmones",
        explicacion: "Lleva la sangre a oxigenarse y vuelve a la aurícula izquierda.",
      },
      {
        pregunta: "¿Qué células transportan el oxígeno?",
        opciones: ["Plaquetas", "Glóbulos blancos", "Glóbulos rojos", "Neuronas"],
        respuesta: "Glóbulos rojos",
        explicacion: "Lo transportan unidos a la hemoglobina.",
      },
      {
        pregunta: "El bazo pertenece al sistema...",
        opciones: ["Digestivo", "Linfático", "Respiratorio", "Excretor"],
        respuesta: "Linfático",
        explicacion: "Filtra la sangre y participa en las defensas.",
      },
      {
        pregunta: "¿En qué vasos se intercambian oxígeno y nutrientes con los tejidos?",
        opciones: ["Arterias", "Venas", "Capilares", "Aorta"],
        respuesta: "Capilares",
        explicacion: "Son los vasos más finos: sus paredes permiten el intercambio.",
      },
    ],
  },
  {
    slug: "anatomia-clase-aparato-excretor",
    grupo: "organos",
    orden: 5,
    requierePro: true,
    nombre: "Aparato excretor: riñones y vejiga",
    descripcion:
      "Cómo los riñones filtran la sangre y forman la orina, el recorrido por los uréteres, la vejiga y la uretra, y otras funciones de los riñones.",
    pasos: [
      "El aparato excretor (o urinario) filtra la sangre, elimina desechos y regula el agua y las sales del cuerpo. Lo forman dos riñones, dos uréteres, la vejiga y la uretra.",
      "Los riñones tienen forma de frijol y miden unos 11 cm. Están en la parte de atrás del abdomen, a cada lado de la columna, protegidos por las últimas costillas. El derecho queda un poco más abajo que el izquierdo porque el hígado ocupa lugar.",
      "Cada riñón tiene alrededor de un millón de nefronas, las unidades que filtran la sangre. El filtrado pasa por tubos donde el cuerpo recupera el agua y las sustancias útiles; lo que sobra, con urea y sales, forma la orina.",
      "Los uréteres son dos tubos que llevan la orina a la vejiga. La vejiga es un órgano hueco, de músculo liso, que almacena la orina; está en la pelvis, detrás del pubis. La uretra la conduce al exterior.",
      "Los riñones cumplen además otras funciones: ayudan a regular la presión arterial y el equilibrio ácido-base, y producen eritropoyetina, la hormona que estimula la formación de glóbulos rojos.",
      "Errores comunes: creer que los riñones fabrican el agua de la orina (la toman de la sangre); creer que la vejiga está en el abdomen (está en la pelvis) y pensar que los riñones están adelante en el abdomen (están atrás).",
    ],
    visuales: [
      { tipo: "anatomia.flujo", despuesDePaso: 3, titulo: "Recorrido de la orina", etapas: FLUJO_ORINA },
      { tipo: "anatomia.cuerpo", despuesDePaso: 3, titulo: "Riñones y vejiga", entradas: entradas(["Riñones", "Vejiga"]) },
    ],
    quiz: [
      {
        pregunta: "¿Cuál es la unidad que filtra la sangre en el riñón?",
        opciones: ["La nefrona", "El alvéolo", "La neurona", "La vellosidad"],
        respuesta: "La nefrona",
        explicacion: "Cada riñón tiene alrededor de un millón.",
      },
      {
        pregunta: "¿Qué estructura lleva la orina del riñón a la vejiga?",
        opciones: ["La uretra", "El uréter", "El esófago", "La aorta"],
        respuesta: "El uréter",
        explicacion: "Los uréteres son dos, uno por riñón; la uretra sale de la vejiga.",
      },
      {
        pregunta: "¿Dónde se ubica la vejiga?",
        opciones: ["En la cavidad pélvica", "En el tórax", "Detrás de los riñones", "En la cavidad craneal"],
        respuesta: "En la cavidad pélvica",
        explicacion: "Está detrás del pubis, dentro de la pelvis.",
      },
      {
        pregunta: "¿Dónde están los riñones?",
        opciones: ["A cada lado de la columna, atrás en el abdomen", "Delante del estómago", "Dentro de la pelvis", "En el tórax"],
        respuesta: "A cada lado de la columna, atrás en el abdomen",
        explicacion: "Están protegidos por las últimas costillas.",
      },
      {
        pregunta: "¿Cuál es el orden correcto del recorrido de la orina?",
        opciones: [
          "Vejiga, riñón, uréter, uretra",
          "Riñón, uréter, vejiga, uretra",
          "Riñón, vejiga, uréter, uretra",
          "Uretra, vejiga, uréter, riñón",
        ],
        respuesta: "Riñón, uréter, vejiga, uretra",
        explicacion: "Se forma en el riñón, baja por el uréter, se almacena en la vejiga y sale por la uretra.",
      },
    ],
  },
];
