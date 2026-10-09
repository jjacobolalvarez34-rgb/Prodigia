import type { LeccionVitalia } from "./tipos";

// Las 26 Técnicas de Vitalia (gratis): un atajo por idea, con su animación y 2
// preguntas para darla por aprendida.
type Tecnica = Omit<LeccionVitalia, "orden" | "requierePro">;

const T: Tecnica[] = [
  // ---------- La célula ----------
  {
    slug: "vitalia-animal-o-vegetal",
    grupo: "celula",
    nombre: "Animal o vegetal en 3 pistas",
    descripcion: "Pared, cloroplastos y una vacuola grande: es vegetal.",
    pasos: [
      "Las células animales y vegetales comparten casi todo: membrana, núcleo, mitocondrias, ribosomas, retículo y Golgi.",
      "Para distinguirlas, busca tres pistas. 1) **Pared celular** rígida por fuera de la membrana. 2) **Cloroplastos** verdes.",
      "3) Una **vacuola** enorme en el centro, que empuja todo lo demás contra los bordes.",
      "Si ves las tres, es vegetal. Si es redondeada, sin pared ni cloroplastos y con vacuolas chiquitas, es animal.",
    ],
    visuales: [{ tipo: "vitalia.celula", variante: "vegetal", organelos: ["pared", "cloroplasto", "vacuola"], titulo: "Las tres pistas de la célula vegetal" }],
    quiz: [
      { pregunta: "Una célula tiene pared celular y cloroplastos. ¿Qué es?", opciones: ["Vegetal", "Animal", "Una bacteria", "Un virus"], respuesta: "Vegetal", explicacion: "Pared y cloroplastos son pistas de célula vegetal." },
      { pregunta: "¿Cuál de estas partes tiene una célula animal?", opciones: ["Mitocondrias", "Pared celular", "Cloroplastos", "Una vacuola central enorme"], respuesta: "Mitocondrias", explicacion: "Las mitocondrias están en animales y vegetales; las otras tres son de la vegetal." },
    ],
  },
  {
    slug: "vitalia-cada-organelo-un-oficio",
    grupo: "celula",
    nombre: "Cada organelo, un oficio",
    descripcion: "Piensa la célula como una ciudad: cada parte tiene un trabajo.",
    pasos: [
      "**Núcleo**: la alcaldía, guarda el ADN y da las órdenes. **Mitocondria**: la central de energía, saca energía de la glucosa.",
      "**Ribosoma**: la fábrica de proteínas. **Retículo endoplasmático**: las calles por donde se fabrican y transportan.",
      "**Aparato de Golgi**: el correo, empaqueta y reparte. **Lisosoma**: el reciclaje, digiere lo que no sirve.",
      "**Membrana**: la frontera, decide qué entra y qué sale.",
    ],
    visuales: [{ tipo: "vitalia.celula", variante: "animal", titulo: "Cada parte de la célula animal y su oficio" }],
    quiz: [
      { pregunta: "¿Qué organelo arma las proteínas?", opciones: ["Ribosoma", "Lisosoma", "Mitocondria", "Vacuola"], respuesta: "Ribosoma", explicacion: "Los ribosomas son la fábrica de proteínas." },
      { pregunta: "¿Qué organelo empaqueta y reparte lo que fabrica la célula?", opciones: ["Aparato de Golgi", "Núcleo", "Ribosoma", "Mitocondria"], respuesta: "Aparato de Golgi", explicacion: "El Golgi funciona como el correo de la célula." },
    ],
  },
  {
    slug: "vitalia-osmosis-sin-confundirse",
    grupo: "celula",
    nombre: "Ósmosis sin confundirse",
    descripcion: "El agua va hacia donde hay más sal.",
    pasos: [
      "En la ósmosis lo que se mueve es el **agua**, a través de la membrana. La sal no puede pasar.",
      "Regla única: **el agua va hacia donde hay más sal** (más solutos), como para diluirla.",
      "Medio **hipotónico** (menos sal afuera): el agua entra y la célula se hincha. Medio **hipertónico** (más sal afuera): el agua sale y la célula se arruga.",
      "Por eso las verduras con sal sueltan agua, y una pasa en agua se hincha.",
    ],
    visuales: [
      { tipo: "vitalia.membrana", modo: "osmosis", medio: "hipertonico", titulo: "Más sal afuera: el agua sale" },
      { tipo: "vitalia.membrana", modo: "osmosis", medio: "hipotonico", titulo: "Menos sal afuera: el agua entra" },
    ],
    quiz: [
      { pregunta: "Pones un glóbulo rojo en agua muy salada. ¿Qué le pasa?", opciones: ["Pierde agua y se arruga", "Se hincha y puede reventar", "Queda igual", "Absorbe la sal"], respuesta: "Pierde agua y se arruga", explicacion: "Afuera hay más sal: el agua sale de la célula." },
      { pregunta: "En la ósmosis, ¿qué atraviesa la membrana?", opciones: ["El agua", "La sal", "Las proteínas", "El núcleo"], respuesta: "El agua", explicacion: "La ósmosis es el paso de agua hacia donde hay más solutos." },
    ],
  },
  {
    slug: "vitalia-biomoleculas-por-su-ladrillo",
    grupo: "celula",
    nombre: "Biomoléculas por su ladrillo",
    descripcion: "Glucosa: carbohidratos. Aminoácido: proteínas. Nucleótido: ADN.",
    pasos: [
      "Las cuatro grandes familias de moléculas de la vida se arman con piezas repetidas, como un muro con ladrillos.",
      "**Carbohidratos** (almidón, celulosa): su ladrillo es la **glucosa**. **Proteínas**: su ladrillo es el **aminoácido**.",
      "**Ácidos nucleicos** (ADN, ARN): su ladrillo es el **nucleótido**. **Lípidos** (grasas): ácidos grasos y glicerol.",
      "Truco: si te dicen el ladrillo, ya sabes la familia.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        cuadros: [
          { texto: "Glucosa + glucosa + glucosa…", resaltar: "Carbohidratos (almidón, celulosa)" },
          { texto: "Aminoácido + aminoácido + …", resaltar: "Proteínas" },
          { texto: "Nucleótido + nucleótido + …", resaltar: "ADN y ARN" },
          { texto: "Ácidos grasos + glicerol", resaltar: "Lípidos (grasas y aceites)" },
        ],
      },
    ],
    quiz: [
      { pregunta: "¿Cuál es el ladrillo de las proteínas?", opciones: ["El aminoácido", "La glucosa", "El nucleótido", "El ácido graso"], respuesta: "El aminoácido", explicacion: "Las proteínas son cadenas de aminoácidos." },
      { pregunta: "El almidón está hecho de muchas glucosas. ¿Qué es?", opciones: ["Un carbohidrato", "Una proteína", "Un lípido", "Un ácido nucleico"], respuesta: "Un carbohidrato", explicacion: "Los carbohidratos se arman con azúcares como la glucosa." },
    ],
  },
  // ---------- Procesos celulares ----------
  {
    slug: "vitalia-fotosintesis-y-respiracion-espejo",
    grupo: "procesos",
    nombre: "Fotosíntesis y respiración son espejo",
    descripcion: "Lo que una toma, la otra lo da.",
    pasos: [
      "**Fotosíntesis**: $6\\,CO_2 + 6\\,H_2O + \\text{luz} \\to C_6H_{12}O_6 + 6\\,O_2$. Pasa en el cloroplasto.",
      "**Respiración celular**: $C_6H_{12}O_6 + 6\\,O_2 \\to 6\\,CO_2 + 6\\,H_2O + \\text{ATP}$. Pasa en la mitocondria.",
      "Es la misma ecuación dada vuelta: los productos de una son los ingredientes de la otra.",
      "Ojo: las plantas hacen las dos. Fotosíntesis de día; respiración, todo el tiempo.",
    ],
    visuales: [{ tipo: "vitalia.energia", modo: "ciclo", titulo: "El ciclo se cierra entre cloroplasto y mitocondria" }],
    quiz: [
      { pregunta: "¿Qué gas sueltan las plantas al hacer fotosíntesis?", opciones: ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Hidrógeno"], respuesta: "Oxígeno", explicacion: "La fotosíntesis produce glucosa y $O_2$." },
      { pregunta: "¿Qué produce la respiración celular para que la célula use?", opciones: ["ATP", "Glucosa", "Oxígeno", "Luz"], respuesta: "ATP", explicacion: "La respiración saca la energía de la glucosa en forma de ATP." },
    ],
  },
  {
    slug: "vitalia-pmat-mitosis",
    grupo: "procesos",
    nombre: "PMAT: el orden de la mitosis",
    descripcion: "Profase, metafase, anafase, telofase.",
    pasos: [
      "Las cuatro fases de la mitosis, en orden: **P**rofase, **M**etafase, **A**nafase, **T**elofase. «PMAT».",
      "**Profase**: los cromosomas se condensan. **Metafase**: se alinean en el **M**edio.",
      "**Anafase**: las cromátidas se **A**partan hacia los polos. **Telofase**: se forman dos núcleos y la célula se divide.",
      "Antes de todo está la **interfase**, cuando la célula crece y copia su ADN.",
    ],
    visuales: [{ tipo: "vitalia.division", modo: "mitosis", dosN: 4, titulo: "Las cuatro fases, una por una" }],
    quiz: [
      { pregunta: "¿En qué fase los cromosomas se alinean en el medio de la célula?", opciones: ["Metafase", "Profase", "Anafase", "Telofase"], respuesta: "Metafase", explicacion: "Metafase: M de Medio." },
      { pregunta: "¿Qué fase viene justo después de la metafase?", opciones: ["Anafase", "Profase", "Telofase", "Interfase"], respuesta: "Anafase", explicacion: "PMAT: después de la M viene la A." },
    ],
  },
  {
    slug: "vitalia-contar-cromosomas",
    grupo: "procesos",
    nombre: "Contar cromosomas",
    descripcion: "La mitosis conserva 2n; la meiosis deja n.",
    pasos: [
      "Las células del cuerpo tienen sus cromosomas en pares: **2n**. En los humanos, $2n = 46$.",
      "**Mitosis** (crecer, reparar): salen **2** células iguales a la madre, con **2n**. Humanos: $46 \\to 46$.",
      "**Meiosis** (hacer gametos): salen **4** células con la mitad, **n**. Humanos: $46 \\to 23$.",
      "Al unirse un óvulo ($n$) y un espermatozoide ($n$) se vuelve a $2n$: $23 + 23 = 46$.",
    ],
    visuales: [{ tipo: "vitalia.division", modo: "meiosis", dosN: 4, titulo: "Meiosis: de $2n$ a cuatro células $n$" }],
    quiz: [
      { pregunta: "Un perro tiene $2n = 78$. ¿Cuántos cromosomas tiene un óvulo de perra?", opciones: ["39", "78", "156", "19"], respuesta: "39", explicacion: "Los gametos tienen $n$: la mitad, 39." },
      { pregunta: "Una célula de la piel humana ($46$) hace mitosis. ¿Cuántos cromosomas tiene cada hija?", opciones: ["46", "23", "92", "12"], respuesta: "46", explicacion: "La mitosis conserva el número: $2n = 46$." },
    ],
  },
  {
    slug: "vitalia-con-oxigeno-o-sin",
    grupo: "procesos",
    nombre: "¿Con oxígeno o sin?",
    descripcion: "Respiración: unos 36 ATP. Fermentación: 2 ATP.",
    pasos: [
      "La célula saca energía de la glucosa de dos maneras, según haya oxígeno o no.",
      "**Con oxígeno** (respiración aeróbica, en la mitocondria): unos **36 ATP** por glucosa, y salen $CO_2$ y agua.",
      "**Sin oxígeno** (fermentación, en el citoplasma): solo **2 ATP**. Sale ácido láctico (músculo cansado, yogur) o alcohol y $CO_2$ (pan, cerveza).",
      "Por eso la respiración es unas 18 veces más eficiente.",
    ],
    visuales: [
      { tipo: "vitalia.energia", modo: "respiracion", titulo: "Con oxígeno: unos 36 ATP" },
      { tipo: "vitalia.energia", modo: "fermentacion", titulo: "Sin oxígeno: 2 ATP" },
    ],
    quiz: [
      { pregunta: "Un músculo trabaja tan fuerte que le falta oxígeno. ¿Qué hace?", opciones: ["Fermentación láctica", "Fotosíntesis", "Fermentación alcohólica", "Deja de usar glucosa"], respuesta: "Fermentación láctica", explicacion: "Sin oxígeno, el músculo fermenta y produce ácido láctico." },
      { pregunta: "¿Cuántos ATP da la fermentación por cada glucosa?", opciones: ["2", "36", "6", "0"], respuesta: "2", explicacion: "Solo 2 ATP, contra unos 36 de la respiración." },
    ],
  },
  // ---------- Genética ----------
  {
    slug: "vitalia-hebra-complementaria",
    grupo: "genetica",
    nombre: "La hebra complementaria al toque",
    descripcion: "A con T, G con C; en el ARN, A con U.",
    pasos: [
      "En el ADN las bases se aparean siempre igual: **A con T** y **G con C**.",
      "Para escribir la hebra complementaria, cambia letra por letra: $ATGC \\to TACG$.",
      "Al pasar a **ARN** (transcripción) no hay T: la **A** se aparea con **U**. Así, $TACG \\to AUGC$.",
      "Truco: «**A**ndrea **T**oma **G**aseosa **C**on hielo», y en el ARN la T se cambia por U.",
    ],
    visuales: [{ tipo: "vitalia.adn", modo: "replicacion", hebra: "ATGCCA", titulo: "Cada base con su pareja" }],
    quiz: [
      { pregunta: "¿Cuál es la hebra de ADN complementaria de $AATGC$?", opciones: ["TTACG", "UUACG", "AATGC", "GCATT"], respuesta: "TTACG", explicacion: "A→T, A→T, T→A, G→C, C→G." },
      { pregunta: "¿Qué ARN mensajero sale de transcribir $TACG$?", opciones: ["AUGC", "ATGC", "UACG", "TACG"], respuesta: "AUGC", explicacion: "T→A, A→U, C→G, G→C." },
    ],
  },
  {
    slug: "vitalia-punnett-30-segundos",
    grupo: "genetica",
    nombre: "Punnett en 30 segundos",
    descripcion: "Arma el cuadro, llena las casillas y cuéntalas.",
    pasos: [
      "1) Separa los alelos de cada padre: $Aa$ da gametos $A$ y $a$.",
      "2) Pon los de un padre arriba y los del otro a la izquierda. 3) Cada casilla junta la letra de su fila con la de su columna.",
      "4) Cuenta: $Aa \\times Aa$ da $AA$, $Aa$, $Aa$, $aa$. Fenotipos: 3 con el rasgo dominante y 1 recesivo: **3 : 1**.",
      "Cada casilla vale un 25 %: $aa$ sale en el 25 % de los casos.",
    ],
    visuales: [{ tipo: "vitalia.punnett", padre1: "Aa", padre2: "Aa", titulo: "$Aa \\times Aa$: 3 : 1" }],
    quiz: [
      { pregunta: "Cruzas $Aa \\times aa$. ¿Qué porcentaje de las crías es $aa$?", opciones: ["50 %", "25 %", "75 %", "0 %"], respuesta: "50 %", explicacion: "Casillas: $Aa$, $Aa$, $aa$, $aa$: 2 de 4." },
      { pregunta: "Cruzas $AA \\times aa$. ¿Cómo salen todas las crías?", opciones: ["Aa", "AA", "aa", "Mitad AA y mitad aa"], respuesta: "Aa", explicacion: "Un padre solo da $A$ y el otro solo $a$." },
    ],
  },
  {
    slug: "vitalia-9331-sin-16-casillas",
    grupo: "genetica",
    nombre: "9:3:3:1 sin dibujar 16 casillas",
    descripcion: "Multiplica las probabilidades de cada rasgo.",
    pasos: [
      "Con dos genes que se heredan por separado, cada uno sigue su propio 3 : 1.",
      "Para $AaBb \\times AaBb$: la chance de dominante en A es $\\tfrac{3}{4}$ y en B también $\\tfrac{3}{4}$.",
      "Multiplica: dominante en los dos, $\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$; solo uno dominante, $\\tfrac{3}{16}$ cada caso; los dos recesivos, $\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$.",
      "Ahí está el **9 : 3 : 3 : 1** sin dibujar el cuadro de 16.",
    ],
    visuales: [{ tipo: "vitalia.punnett", padre1: "AaBb", padre2: "AaBb", titulo: "Las 16 casillas confirman 9 : 3 : 3 : 1" }],
    quiz: [
      { pregunta: "En $AaBb \\times AaBb$, ¿qué fracción sale $aabb$?", opciones: ["1/16", "1/4", "9/16", "3/16"], respuesta: "1/16", explicacion: "$\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$." },
      { pregunta: "En el mismo cruce, ¿qué fracción muestra los dos rasgos dominantes?", opciones: ["9/16", "3/16", "1/16", "3/4"], respuesta: "9/16", explicacion: "$\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$." },
    ],
  },
  {
    slug: "vitalia-chargaff",
    grupo: "genetica",
    nombre: "Chargaff en un paso",
    descripcion: "A = T y G = C; las cuatro suman 100 %.",
    pasos: [
      "Como A siempre se aparea con T, en un ADN doble hay **tanta A como T**. Y tanta G como C.",
      "Las cuatro suman 100 %. Si te dan una, sacas todas.",
      "Ejemplo: 20 % de A. Entonces T = 20 %, y quedan 60 % para G y C juntas: **30 % cada una**.",
    ],
    visuales: [{ tipo: "vitalia.adn", modo: "replicacion", hebra: "AGCTTA", titulo: "Cada A tiene su T; cada G, su C" }],
    quiz: [
      { pregunta: "Un ADN tiene 35 % de G. ¿Qué porcentaje de A tiene?", opciones: ["15 %", "35 %", "65 %", "30 %"], respuesta: "15 %", explicacion: "C = 35 %; G + C = 70 %; quedan 30 % para A y T: 15 % cada una." },
      { pregunta: "Un ADN tiene 28 % de T. ¿Cuánta A tiene?", opciones: ["28 %", "22 %", "72 %", "44 %"], respuesta: "28 %", explicacion: "A = T siempre." },
    ],
  },
  {
    slug: "vitalia-tabla-de-codones",
    grupo: "genetica",
    nombre: "Leer la tabla de codones",
    descripcion: "Primera letra a la izquierda, segunda arriba, tercera a la derecha.",
    pasos: [
      "El ribosoma lee el ARN mensajero **de a tres letras**: cada trío es un **codón**, y cada codón dice un aminoácido.",
      "En la tabla: la **primera letra** elige la fila grande (izquierda); la **segunda**, la columna (arriba); la **tercera**, el renglón dentro de la casilla (derecha).",
      "$AUG$ es Met y además marca el **inicio**. $UAA$, $UAG$ y $UGA$ son **stop**: ahí termina la proteína.",
      "Ejemplo: $AUG\\text{-}CCU\\text{-}GUU \\to$ Met-Pro-Val.",
    ],
    visuales: [{ tipo: "vitalia.adn", modo: "traduccion", hebra: "AUGCCUGUU", titulo: "De a tres letras: un aminoácido por codón" }],
    quiz: [
      { pregunta: "¿Cuántas letras del ARN forman un codón?", opciones: ["3", "1", "2", "4"], respuesta: "3", explicacion: "Un codón es un trío de bases." },
      { pregunta: "¿Qué hace el codón $UAA$?", opciones: ["Termina la proteína", "Empieza la proteína", "Codifica metionina", "Nada"], respuesta: "Termina la proteína", explicacion: "$UAA$ es un codón de stop." },
    ],
  },
  // ---------- Sistemas del cuerpo ----------
  {
    slug: "vitalia-arterias-salen-venas-vuelven",
    grupo: "sistemas",
    nombre: "Arterias salen, venas vuelven",
    descripcion: "La regla del corazón, con la excepción de los pulmones.",
    pasos: [
      "**Arterias**: llevan la sangre **desde** el corazón. **Venas**: la traen **hacia** el corazón. La regla es la dirección, no el color.",
      "Casi siempre las arterias llevan sangre con oxígeno y las venas sin oxígeno.",
      "Excepción: la **arteria pulmonar** sale del corazón hacia los pulmones **sin** oxígeno, y las **venas pulmonares** vuelven **con** oxígeno.",
      "Truco: «**A**rteria = **A**fuera del corazón».",
    ],
    visuales: [{ tipo: "vitalia.recorrido", sistema: "circulatorio", titulo: "El recorrido de la sangre por el corazón" }],
    quiz: [
      { pregunta: "¿Qué vaso lleva sangre del corazón a los pulmones?", opciones: ["La arteria pulmonar", "La vena pulmonar", "La aorta", "La vena cava"], respuesta: "La arteria pulmonar", explicacion: "Sale del corazón: es arteria, aunque lleve sangre sin oxígeno." },
      { pregunta: "¿Qué define si un vaso es vena?", opciones: ["Que lleve la sangre hacia el corazón", "Que lleve sangre sin oxígeno", "Que sea delgado", "Que sea azul"], respuesta: "Que lleve la sangre hacia el corazón", explicacion: "La regla es la dirección del flujo." },
    ],
  },
  {
    slug: "vitalia-digestion-por-estaciones",
    grupo: "sistemas",
    nombre: "La digestión por estaciones",
    descripcion: "Boca: almidón. Estómago: proteínas. Intestino delgado: todo, y se absorbe.",
    pasos: [
      "**Boca**: se mastica y la **amilasa** de la saliva empieza a romper el **almidón**.",
      "**Estómago**: el ácido y la **pepsina** rompen las **proteínas**.",
      "**Intestino delgado**: con la bilis y las enzimas del páncreas se termina de digerir todo (también las grasas, con la **lipasa**), y los nutrientes **se absorben** a la sangre.",
      "**Intestino grueso**: se recupera el agua.",
    ],
    visuales: [{ tipo: "vitalia.recorrido", sistema: "digestivo", titulo: "Estación por estación" }],
    quiz: [
      { pregunta: "¿Dónde empieza la digestión del almidón?", opciones: ["En la boca", "En el estómago", "En el intestino grueso", "En el hígado"], respuesta: "En la boca", explicacion: "La amilasa de la saliva empieza a romperlo." },
      { pregunta: "¿Dónde se absorbe la mayor parte de los nutrientes?", opciones: ["En el intestino delgado", "En el estómago", "En la boca", "En el esófago"], respuesta: "En el intestino delgado", explicacion: "Sus vellosidades los pasan a la sangre." },
    ],
  },
  {
    slug: "vitalia-insulina-baja-glucagon-sube",
    grupo: "sistemas",
    nombre: "Insulina baja, glucagón sube",
    descripcion: "Para no confundirlas nunca.",
    pasos: [
      "Las dos salen del **páncreas** y controlan el azúcar (glucosa) de la sangre.",
      "**Insulina**: después de comer, la glucosa sube; la insulina hace que las células la tomen y **la baja**.",
      "**Glucagón**: en ayunas, la glucosa baja; el glucagón hace que el hígado la suelte y **la sube**.",
      "Truco: el **glu**cagón trae **glu**cosa de vuelta. En la diabetes falla la insulina y la glucosa queda alta.",
    ],
    visuales: [{ tipo: "vitalia.hormona", modo: "glucosa", titulo: "Sube, baja: el páncreas corrige" }],
    quiz: [
      { pregunta: "Acabas de comer y tu glucosa subió. ¿Qué hormona la baja?", opciones: ["Insulina", "Glucagón", "Adrenalina", "Tiroxina"], respuesta: "Insulina", explicacion: "La insulina hace que las células tomen glucosa." },
      { pregunta: "¿Qué órgano produce la insulina y el glucagón?", opciones: ["El páncreas", "El hígado", "El estómago", "El riñón"], respuesta: "El páncreas", explicacion: "Las dos hormonas salen del páncreas." },
    ],
  },
  {
    slug: "vitalia-innata-o-adquirida",
    grupo: "sistemas",
    nombre: "Innata o adquirida",
    descripcion: "Rápida y general, o lenta y con memoria.",
    pasos: [
      "**Inmunidad innata**: viene de nacimiento, actúa rápido y contra cualquier invasor. Piel, mucosas, fiebre, inflamación y glóbulos blancos que «comen» microbios.",
      "**Inmunidad adquirida**: tarda más la primera vez, pero es **específica** (anticuerpos hechos a la medida de cada microbio) y tiene **memoria**.",
      "Gracias a la memoria, la segunda vez la respuesta es rápida y fuerte. Eso aprovechan las **vacunas**.",
    ],
    visuales: [{ tipo: "vitalia.defensa", modo: "respuesta", titulo: "Primero la innata; después, los anticuerpos" }],
    quiz: [
      { pregunta: "¿Qué tipo de defensa tiene memoria?", opciones: ["La adquirida", "La innata", "La piel", "La fiebre"], respuesta: "La adquirida", explicacion: "Los linfocitos de memoria recuerdan al microbio." },
      { pregunta: "La piel que no deja entrar microbios es parte de la inmunidad…", opciones: ["Innata", "Adquirida", "Artificial", "Por vacuna"], respuesta: "Innata", explicacion: "Es una barrera general, de nacimiento." },
    ],
  },
  // ---------- Reinos y clasificación ----------
  {
    slug: "vitalia-reino-en-3-preguntas",
    grupo: "reinos",
    nombre: "El reino en 3 preguntas",
    descripcion: "¿Tiene núcleo? ¿Tiene pared? ¿Fabrica su comida?",
    pasos: [
      "1) ¿Tiene **núcleo**? Si no: **Moneras** (bacterias).",
      "2) Si tiene núcleo y es de **una sola célula** (casi siempre): **Protistas**, como la ameba o el paramecio.",
      "3) Pluricelular **con pared y fabrica su comida** (fotosíntesis): **Plantas**. Con pared de quitina y **absorbe** su comida: **Hongos**.",
      "4) Pluricelular **sin pared** y **come** a otros seres vivos: **Animales**.",
    ],
    visuales: [{ tipo: "vitalia.reinos", modo: "reinos", titulo: "Cada uno a su reino" }],
    quiz: [
      { pregunta: "Un ser pluricelular, con pared de quitina, que absorbe su comida. ¿Qué reino es?", opciones: ["Hongos", "Plantas", "Animales", "Protistas"], respuesta: "Hongos", explicacion: "Pared de quitina y nutrición por absorción: hongo." },
      { pregunta: "Un ser vivo sin núcleo. ¿A qué reino pertenece?", opciones: ["Moneras", "Protistas", "Hongos", "Animales"], respuesta: "Moneras", explicacion: "Sin núcleo es procariota: bacteria." },
    ],
  },
  {
    slug: "vitalia-vertebrados-por-la-piel",
    grupo: "reinos",
    nombre: "Vertebrados por la piel",
    descripcion: "Pelo, plumas, escamas secas, escamas húmedas o piel desnuda.",
    pasos: [
      "Para clasificar un vertebrado, mírale la piel:",
      "**Pelo**: mamífero. **Plumas**: ave. **Escamas secas**: reptil.",
      "**Escamas** con branquias en el agua: pez. **Piel desnuda y húmeda**: anfibio.",
      "Cuidado con los engaños: la ballena y el delfín son mamíferos (respiran aire y dan leche), y el pingüino es ave.",
    ],
    visuales: [{ tipo: "vitalia.reinos", modo: "vertebrados", titulo: "Las 5 clases de vertebrados" }],
    quiz: [
      { pregunta: "Un animal con piel desnuda y húmeda que nace en el agua. ¿Qué es?", opciones: ["Anfibio", "Reptil", "Pez", "Mamífero"], respuesta: "Anfibio", explicacion: "Piel desnuda y húmeda: anfibio, como la rana." },
      { pregunta: "¿A qué clase pertenece el delfín?", opciones: ["Mamíferos", "Peces", "Anfibios", "Reptiles"], respuesta: "Mamíferos", explicacion: "Respira aire, tiene pelo al nacer y amamanta." },
    ],
  },
  {
    slug: "vitalia-plantas-vasos-semillas-flores",
    grupo: "reinos",
    nombre: "Plantas: vasos, semillas, flores",
    descripcion: "Cada grupo agrega una cosa nueva.",
    pasos: [
      "**Musgos** (briofitas): sin vasos; por eso son bajitos y viven en lugares húmedos.",
      "**Helechos**: suman **vasos** que llevan agua; crecen más, pero se reproducen por esporas, sin semillas.",
      "**Gimnospermas** (pinos): suman la **semilla**, desnuda, en conos.",
      "**Angiospermas**: suman **flor y fruto**, que protege la semilla. Son la mayoría de las plantas.",
    ],
    visuales: [{ tipo: "vitalia.plantas", titulo: "De los musgos a las flores" }],
    quiz: [
      { pregunta: "Una planta tiene vasos pero se reproduce por esporas, sin semillas. ¿Qué grupo es?", opciones: ["Helechos", "Musgos", "Gimnospermas", "Angiospermas"], respuesta: "Helechos", explicacion: "Vasos sin semillas: helechos." },
      { pregunta: "¿Qué tienen las angiospermas que no tienen los pinos?", opciones: ["Flores y frutos", "Semillas", "Vasos", "Raíces"], respuesta: "Flores y frutos", explicacion: "El pino tiene semillas desnudas en conos; las angiospermas, dentro de un fruto." },
    ],
  },
  {
    slug: "vitalia-dona-reina-fue",
    grupo: "reinos",
    nombre: "«Doña Reina Fue Con Once Feos Gatos Enanos»",
    descripcion: "El orden de las categorías, de la más grande a la más chica.",
    pasos: [
      "Las categorías para clasificar van de la más amplia a la más específica: **D**ominio, **R**eino, **F**ilo, **C**lase, **O**rden, **F**amilia, **G**énero, **E**specie.",
      "La frase «**D**oña **R**eina **F**ue **C**on **O**nce **F**eos **G**atos **E**nanos» tiene las mismas iniciales.",
      "Cuanto más abajo, más parecidos son los seres que comparten esa categoría: todos los mamíferos comparten clase; solo los perros comparten especie.",
    ],
    visuales: [{ tipo: "vitalia.arbol", ejemplo: "humano", titulo: "El ser humano, de dominio a especie" }],
    quiz: [
      { pregunta: "¿Qué categoría va justo después de «Clase»?", opciones: ["Orden", "Familia", "Filo", "Género"], respuesta: "Orden", explicacion: "Doña Reina Fue Con **O**nce…" },
      { pregunta: "¿Cuál es la categoría más específica?", opciones: ["Especie", "Género", "Reino", "Dominio"], respuesta: "Especie", explicacion: "Es la última: solo seres que pueden reproducirse entre sí." },
    ],
  },
  {
    slug: "vitalia-nombre-cientifico",
    grupo: "reinos",
    nombre: "Escribir un nombre científico",
    descripcion: "Género con mayúscula, especie con minúscula, en cursiva.",
    pasos: [
      "Cada especie tiene un nombre de **dos palabras** en latín, igual en todo el mundo (lo inventó Linneo).",
      "La primera es el **género**, con **mayúscula**; la segunda, la **especie**, con **minúscula**.",
      "Se escribe en **cursiva** (o subrayado a mano): *Homo sapiens*, *Panthera leo*.",
      "Errores típicos: *Panthera Leo* (especie con mayúscula), *panthera leo* (género con minúscula).",
    ],
    visuales: [{ tipo: "vitalia.arbol", ejemplo: "perro", titulo: "Género y especie son los dos últimos escalones" }],
    quiz: [
      { pregunta: "¿Cuál está bien escrito?", opciones: ["Canis familiaris", "canis familiaris", "Canis Familiaris", "CANIS FAMILIARIS"], respuesta: "Canis familiaris", explicacion: "Género con mayúscula y especie con minúscula." },
      { pregunta: "En *Quercus robur*, ¿qué es «Quercus»?", opciones: ["El género", "La especie", "La familia", "El reino"], respuesta: "El género", explicacion: "La primera palabra es el género." },
    ],
  },
  // ---------- Ecología ----------
  {
    slug: "vitalia-cadena-en-3-eslabones",
    grupo: "ecologia",
    nombre: "La cadena en 3 eslabones",
    descripcion: "Productor, consumidor primario, consumidor secundario.",
    pasos: [
      "Una **cadena alimentaria** muestra quién se come a quién. La flecha apunta hacia el que come.",
      "Siempre empieza por un **productor**: una planta o un alga que fabrica su comida con la luz.",
      "Después vienen los **consumidores**: primario (come plantas, herbívoro), secundario (come herbívoros) y terciario.",
      "Los **descomponedores** (hongos y bacterias) reciclan los restos de todos.",
    ],
    visuales: [{ tipo: "vitalia.cadena", eslabones: ["Maíz", "Saltamontes", "Rana", "Serpiente"], titulo: "Cada eslabón come al de abajo" }],
    quiz: [
      { pregunta: "En pasto → vaca → humano, ¿qué es la vaca?", opciones: ["Consumidor primario", "Productor", "Consumidor secundario", "Descomponedor"], respuesta: "Consumidor primario", explicacion: "Come al productor: es herbívoro." },
      { pregunta: "¿Con qué empieza siempre una cadena alimentaria?", opciones: ["Un productor", "Un carnívoro", "Un descomponedor", "Un herbívoro"], respuesta: "Un productor", explicacion: "La energía entra por los que hacen fotosíntesis." },
    ],
  },
  {
    slug: "vitalia-regla-del-10",
    grupo: "ecologia",
    nombre: "La regla del 10 %",
    descripcion: "A cada nivel le llega solo el 10 % de la energía del anterior.",
    pasos: [
      "En cada paso de la cadena, la mayor parte de la energía se gasta en vivir (moverse, respirar) y se pierde como calor.",
      "Al nivel siguiente le llega, más o menos, el **10 %**.",
      "Si el pasto tiene $10\\,000$ kcal, los conejos reciben $1000$, los zorros $100$ y el águila $10$.",
      "Por eso hay muchas plantas, menos herbívoros y pocos depredadores: la pirámide se angosta hacia arriba.",
    ],
    visuales: [{ tipo: "vitalia.cadena", eslabones: ["Pasto", "Conejo", "Zorro", "Águila"], energia: 10000, titulo: "Cada nivel recibe el 10 % del anterior" }],
    quiz: [
      { pregunta: "Las plantas de un campo tienen $50\\,000$ kcal. ¿Cuánto les llega a los herbívoros?", opciones: ["5000 kcal", "500 kcal", "50 000 kcal", "45 000 kcal"], respuesta: "5000 kcal", explicacion: "El 10 % de $50\\,000$ es $5000$." },
      { pregunta: "¿Por qué hay menos depredadores que herbívoros?", opciones: ["Les llega mucha menos energía", "Comen menos", "Viven más", "No necesitan energía"], respuesta: "Les llega mucha menos energía", explicacion: "Solo el 10 % pasa de un nivel al siguiente." },
    ],
  },
  {
    slug: "vitalia-relaciones-quien-gana",
    grupo: "ecologia",
    nombre: "Relaciones por «quién gana»",
    descripcion: "Gana-gana, gana-pierde, gana-nada, pierde-pierde.",
    pasos: [
      "Para nombrar una relación entre dos especies, pregunta quién gana y quién pierde.",
      "**Mutualismo** (gana-gana): la abeja y la flor. **Depredación** (gana-pierde, uno muere): el león y la cebra.",
      "**Parasitismo** (gana-pierde, el otro sigue vivo): la garrapata y el perro. **Comensalismo** (gana-nada): la rémora y el tiburón.",
      "**Competencia** (pierden los dos): dos leones por la misma presa.",
    ],
    visuales: [
      {
        tipo: "cuadros",
        cuadros: [
          { texto: "Abeja y flor", resaltar: "Mutualismo: ganan los dos" },
          { texto: "León y cebra", resaltar: "Depredación: uno gana, el otro muere" },
          { texto: "Garrapata y perro", resaltar: "Parasitismo: uno gana, el otro pierde pero vive" },
          { texto: "Rémora y tiburón", resaltar: "Comensalismo: uno gana, al otro no le afecta" },
          { texto: "Dos leones, una presa", resaltar: "Competencia: pierden los dos" },
        ],
      },
    ],
    quiz: [
      { pregunta: "Un piojo vive en la cabeza de una persona y se alimenta de su sangre. ¿Qué relación es?", opciones: ["Parasitismo", "Mutualismo", "Comensalismo", "Depredación"], respuesta: "Parasitismo", explicacion: "Uno gana y el otro pierde, pero sigue vivo." },
      { pregunta: "Los peces payaso viven en la anémona y la limpian; ella los protege. ¿Qué relación es?", opciones: ["Mutualismo", "Parasitismo", "Competencia", "Comensalismo"], respuesta: "Mutualismo", explicacion: "Ganan los dos." },
    ],
  },
  {
    slug: "vitalia-ciclo-del-carbono",
    grupo: "ecologia",
    nombre: "El ciclo del carbono en 4 flechas",
    descripcion: "Fotosíntesis lo saca del aire; respiración, descomposición y combustión lo devuelven.",
    pasos: [
      "El carbono da vueltas entre el aire (como $CO_2$) y los seres vivos.",
      "1) La **fotosíntesis** saca $CO_2$ del aire y lo convierte en glucosa.",
      "2) La **respiración** de todos los seres vivos lo devuelve al aire. 3) Los **descomponedores** también, al degradar restos.",
      "4) La **combustión** de petróleo, carbón y gas suelta carbono que estuvo guardado millones de años: por eso aumenta el $CO_2$ del aire.",
    ],
    visuales: [{ tipo: "vitalia.energia", modo: "ciclo", titulo: "El carbono entra por la fotosíntesis y sale por la respiración" }],
    quiz: [
      { pregunta: "¿Qué proceso saca dióxido de carbono del aire?", opciones: ["La fotosíntesis", "La respiración", "La combustión", "La descomposición"], respuesta: "La fotosíntesis", explicacion: "Las plantas toman $CO_2$ para fabricar glucosa." },
      { pregunta: "¿Qué actividad humana aumenta el $CO_2$ del aire?", opciones: ["Quemar petróleo y carbón", "Plantar árboles", "Hacer compost", "Ahorrar agua"], respuesta: "Quemar petróleo y carbón", explicacion: "La combustión libera carbono que estaba guardado bajo tierra." },
    ],
  },
];

export const TECNICAS_VITALIA: LeccionVitalia[] = T.map((t, i) => ({ ...t, orden: i + 1, requierePro: false }));
