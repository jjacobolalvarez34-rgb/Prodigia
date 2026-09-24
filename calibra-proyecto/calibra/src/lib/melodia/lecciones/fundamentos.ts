import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vRitmo, vTeclado } from "./ayudas";

// Grupo "fundamentos" (modo de práctica Fundamentos): nombre de las figuras
// rítmicas (redonda, blanca, negra, corchea) y cifrado americano de las 7
// notas, en los dos sentidos (Sol -> G y G -> Sol). Datos verificados en
// lecciones.test.ts contra practica/melodia.ts y una tabla de referencia.

export const TECNICAS_FUNDAMENTOS: TecnicaMelodia[] = [
  {
    slug: "melodia-cifrado-americano",
    grupo: "fundamentos",
    orden: 1,
    requierePro: false,
    nombre: "Cifrado americano: Do es C y sigue el abecedario",
    descripcion:
      "El cifrado americano nombra las siete notas con letras: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B. Truco: las letras siguen el abecedario, pero la serie empieza en C (Do), no en A.",
    pasos: [
      "Las siete notas naturales son Do, Re, Mi, Fa, Sol, La, Si. El cifrado americano las escribe con letras: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B.",
      "Truco de memoria: La es A, la primera letra del abecedario. Desde ahí todo sigue en orden: La = A, Si = B, Do = C, Re = D, Mi = E, Fa = F, Sol = G.",
      "Por eso la serie Do-Re-Mi-Fa-Sol-La-Si se lee C-D-E-F-G-A-B: empieza en C, no en A. Si te pierdes, ubica primero el La (A) y cuenta desde ahí.",
      "Los símbolos ♯ y ♭ se escriben igual detrás de la letra: Fa♯ = F♯ y Si♭ = B♭. Simplificación: en algunos países se usa el cifrado latino (Do, Re, Mi...) y en otros el americano (C, D, E...); son solo dos formas de nombrar las mismas notas.",
    ],
    visuales: [
      vTeclado(["Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4"], {
        despuesDePaso: 2,
        titulo: "Cada nota con su letra",
        cifrado: true,
        nombres: "todas",
      }),
    ],
    quiz: [
      q("¿Cuál es el cifrado americano de la nota Sol?", "G", ["F", "A", "S"], "Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B."),
      q("¿Qué nota corresponde a la letra A?", "La", ["Do", "Si", "Fa"], "La es A: es la primera letra del abecedario y la serie sigue con B = Si, C = Do."),
      q("¿Con qué letra empieza la serie Do-Re-Mi-Fa-Sol-La-Si en cifrado americano?", "C", ["A", "B", "D"], "Do es C, así que la serie se lee C-D-E-F-G-A-B (no empieza en A)."),
      q("¿Cómo se escribe Si♭ en cifrado americano?", "B♭", ["S♭", "A♭", "C♭"], "Si = B; el bemol se escribe igual detrás de la letra: B♭."),
    ],
  },
  {
    slug: "melodia-figuras-por-fraccion",
    grupo: "fundamentos",
    orden: 2,
    requierePro: false,
    nombre: "Figuras rítmicas: cada una vale la mitad de la anterior",
    descripcion:
      "Redonda, blanca, negra y corchea se distinguen por tres detalles: cabeza hueca o rellena, plica (el palito) y corchete (la banderita). Y cada una dura la mitad que la anterior: 4, 2, 1 y ½ pulsos.",
    pasos: [
      "Mira la cabeza: hueca (vacía) es redonda o blanca; rellena es negra o corchea. La redonda no tiene plica (palito); las demás sí.",
      "Redonda: cabeza hueca y sin plica. Blanca: hueca con plica. Negra: rellena con plica. Corchea: rellena con plica y un corchete (una banderita).",
      "Cada figura dura la mitad que la anterior: redonda 4 pulsos, blanca 2, negra 1 y corchea ½. En un compás de 4/4 caben 1 redonda, 2 blancas, 4 negras u 8 corcheas.",
      "Simplificación: aquí el pulso es la negra (lo normal en 4/4); en otros compases el pulso puede ser otra figura. La duración real en segundos depende del tempo (la velocidad).",
    ],
    visuales: [vRitmo(["redonda", "blanca", "negra", "corchea"], { despuesDePaso: 2, titulo: "Cada figura, la mitad de la anterior" })],
    quiz: [
      q("¿Cómo se llama la figura de cabeza hueca y sin plica?", "Redonda", ["Blanca", "Negra", "Corchea"], "La redonda es la única sin plica, y dura 4 pulsos."),
      q("¿Cuántos pulsos dura una blanca?", "2", ["1", "4", "½"], "La blanca dura la mitad que la redonda: 2 pulsos."),
      q("¿Cuántas negras caben en una redonda?", "4", ["2", "8", "1"], "Redonda = 4 pulsos y negra = 1 pulso, así que caben 4."),
      q("¿Qué figura es rellena, con plica y con corchete?", "Corchea", ["Negra", "Blanca", "Redonda"], "La corchea lleva el corchete y dura medio pulso."),
    ],
  },
  {
    slug: "melodia-teclas-negras-para-ubicarse",
    grupo: "fundamentos",
    orden: 3,
    requierePro: false,
    nombre: "Teclas negras: los grupos de 2 y 3 te dicen dónde estás",
    descripcion:
      "En un piano las teclas negras van en grupos de 2 y de 3. Con eso ubicas las siete notas blancas sin contar: Do queda justo a la izquierda del grupo de 2 y Fa justo a la izquierda del grupo de 3.",
    pasos: [
      "Las teclas negras se agrupan de a 2 y de a 3, y ese patrón se repite. Es el mapa que te dice dónde estás en el teclado.",
      "Do es la tecla blanca justo a la izquierda del grupo de 2. Re queda entre las dos negras de ese grupo y Mi, a la derecha de la segunda.",
      "Fa es la tecla blanca justo a la izquierda del grupo de 3. Después vienen Sol (entre la primera y la segunda negra), La (entre la segunda y la tercera) y Si (a la derecha de la tercera).",
      "Entre Mi y Fa, y entre Si y Do, no hay tecla negra: están pegadas. En las demás blancas, sí hay una negra en medio.",
    ],
    visuales: [
      vTeclado(["Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5"], {
        despuesDePaso: 1,
        titulo: "Grupos de 2 y de 3 teclas negras",
        grupos: true,
        nombres: "todas",
      }),
    ],
    quiz: [
      q("¿Qué tecla blanca queda justo a la izquierda del grupo de dos teclas negras?", "Do", ["Re", "Mi", "Fa"], "Do está pegada a la izquierda del grupo de 2."),
      q("¿Qué tecla blanca está entre las dos negras del grupo de dos?", "Re", ["Do", "Mi", "Sol"], "Re queda en el medio de las dos negras del grupo de 2."),
      q("¿Qué tecla blanca queda justo a la izquierda del grupo de tres teclas negras?", "Fa", ["Mi", "Sol", "Si"], "Fa está pegada a la izquierda del grupo de 3."),
      q("¿Qué tecla blanca queda entre la segunda y la tercera negra del grupo de tres?", "La", ["Sol", "Si", "Fa"], "Fa, Sol y La rodean las negras del grupo de 3: La va entre la segunda y la tercera."),
    ],
  },
];

export const CLASES_FUNDAMENTOS: ClaseMelodia[] = [
  {
    slug: "melodia-clase-sonido-y-nota",
    grupo: "fundamentos",
    orden: 1,
    requierePro: true,
    nombre: "El sonido y la nota: altura, octava y nombre",
    descripcion:
      "Qué es la altura de un sonido, cómo se convierte en una nota con nombre, por qué las notas se repiten cada octava y qué significa el número de Do4 o La4.",
    pasos: [
      "Un sonido tiene cuatro cualidades: altura (qué tan grave o agudo es), duración, intensidad (qué tan fuerte suena) y timbre (lo que distingue a una flauta de un piano tocando la misma nota). La música con notas trabaja sobre todo con la altura.",
      "La altura depende de la frecuencia: cuántas vibraciones por segundo (hercios, Hz) tiene el sonido. Más frecuencia, más agudo; menos frecuencia, más grave. Una nota es el nombre que le damos a una altura concreta.",
      "Las notas naturales tienen siete nombres: Do, Re, Mi, Fa, Sol, La, Si. Después de Si vuelve a empezar la serie con otro Do, más agudo: esa distancia de un Do al siguiente es una octava. Entre un Do y el siguiente hay 12 semitonos (las 12 teclas, blancas y negras, de esa octava).",
      "Para distinguir un Do de otro se añade el número de octava: Do4, Do5... Se usa la convención científica: Do4 es el Do central del piano y La4 (el La justo encima) es la nota de afinación, de 440 Hz. El número sube al llegar a Do, no a La: Si3 y Do4 son vecinas.",
      "Cuando dos notas tienen el mismo nombre y distinta octava, como Do4 y Do5, suenan «la misma nota» en registros distintos. Eso es lo que hace que la escala se repita.",
      "Errores comunes: pensar que el número de octava cambia en La (cambia en Do); creer que Do4 y Do5 son notas distintas por nombre (son la misma nota en otra octava); y mezclar altura con volumen: una nota puede sonar suave y aguda, o fuerte y grave.",
    ],
    visuales: [
      vTeclado(["Do4", "Do5"], { despuesDePaso: 3, titulo: "Do4 y Do5: la misma nota, una octava aparte", desde: "Do4", hasta: "Do5", nombres: "todas" }),
      vTeclado(["Si3", "Do4"], { despuesDePaso: 3, titulo: "El número de octava sube al llegar a Do", desde: "Sol3", hasta: "Mi4", nombres: "todas" }),
    ],
    quiz: [
      q("¿De qué depende que un sonido sea grave o agudo?", "De su frecuencia", ["De su volumen", "De su timbre", "De su duración"], "La altura la da la frecuencia: más vibraciones por segundo, más agudo."),
      q("¿Cuántos semitonos hay de un Do al siguiente Do (una octava)?", "12", ["7", "8", "10"], "Una octava abarca 12 semitonos: las 12 teclas, blancas y negras, entre un Do y el siguiente."),
      q("En la convención científica, ¿qué nota es Do4?", "El Do central del piano", ["El Do más grave del piano", "El La de afinación", "El Do más agudo del piano"], "Do4 es el Do central; La4, un poco más arriba, es el de 440 Hz."),
      q("¿Dónde cambia el número de octava?", "Al llegar a Do", ["Al llegar a La", "Al llegar a Mi", "Al llegar a Si"], "Si3 es la nota justo debajo de Do4: el número sube en Do."),
      q("Do4 y Do5 son...", "La misma nota en octavas distintas", ["Dos notas con nombres distintos", "Notas que suenan igual de agudas", "La misma altura exacta"], "Tienen el mismo nombre; Do5 es una octava más aguda que Do4."),
    ],
  },
  {
    slug: "melodia-clase-teclado-y-cifrado",
    grupo: "fundamentos",
    orden: 2,
    requierePro: true,
    nombre: "Las siete notas en el teclado y el cifrado americano",
    descripcion:
      "Cómo ubicar Do, Re, Mi, Fa, Sol, La y Si con los grupos de teclas negras, y cómo traducir entre los nombres en español y el cifrado americano (C, D, E, F, G, A, B).",
    pasos: [
      "Las siete notas naturales son las teclas blancas del piano: Do, Re, Mi, Fa, Sol, La, Si. Las teclas negras son las notas alteradas (sostenidos y bemoles), que se estudian más adelante.",
      "Para ubicarte, usa los grupos de teclas negras. Do es la blanca a la izquierda del grupo de 2; Re queda entre esas dos negras; Mi es la siguiente. Fa es la blanca a la izquierda del grupo de 3; luego siguen Sol, La y Si.",
      "El cifrado americano da una letra a cada nota: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B. Las letras siguen el abecedario, pero la serie empieza en C (Do) y no en A, porque A corresponde a La.",
      "En la Práctica te preguntan en los dos sentidos: «¿cuál es el cifrado de Sol?» (G) y «¿qué nota es la letra B?» (Si). Conviene dominar ambos: la mitad de las veces hay que ir de la letra al nombre.",
      "Un truco: memoriza los extremos. Do = C (la primera de la serie) y La = A (la del principio del abecedario). El resto se cuenta desde uno de los dos.",
      "Errores comunes: creer que A es Do (es La); confundir B con Si♭ (B es Si natural; Si♭ se escribe B♭); y olvidar que en el cifrado latino (Do, Re, Mi...) y en el americano son dos maneras de nombrar exactamente las mismas notas.",
    ],
    visuales: [
      vTeclado(["Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4"], { despuesDePaso: 1, titulo: "Las siete notas naturales", grupos: true, nombres: "todas" }),
      vTeclado(["Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4"], { despuesDePaso: 2, titulo: "Nombre en español y letra del cifrado", cifrado: true, nombres: "todas" }),
    ],
    quiz: [
      q("¿Qué nota es la letra E en el cifrado americano?", "Mi", ["Re", "Fa", "Si"], "C = Do, D = Re, E = Mi."),
      q("¿Cuál es el cifrado americano de La?", "A", ["C", "G", "B"], "La es A, la primera letra del abecedario."),
      q("¿Dónde queda la nota Do en el teclado?", "En la tecla blanca a la izquierda del grupo de 2 negras", ["Entre las dos negras del grupo de 2", "A la izquierda del grupo de 3 negras", "A la derecha del grupo de 3 negras"], "Do es la blanca pegada a la izquierda del grupo de dos negras."),
      q("¿A qué letra corresponde Si?", "B", ["A", "C", "S"], "La = A, Si = B, Do = C."),
      q("El cifrado latino (Do, Re, Mi...) y el americano (C, D, E...) son...", "Dos formas de nombrar las mismas notas", ["Notas distintas", "Alturas separadas por un semitono", "Escalas distintas"], "Do = C, Re = D, etc.: cambia el nombre, no el sonido."),
    ],
  },
  {
    slug: "melodia-clase-figuras-y-compas",
    grupo: "fundamentos",
    orden: 3,
    requierePro: true,
    nombre: "Figuras rítmicas, pulso y compás",
    descripcion:
      "Cómo se escriben y qué duran la redonda, la blanca, la negra y la corchea, qué es el pulso y qué indica un compás como 4/4.",
    pasos: [
      "El ritmo organiza el sonido en el tiempo. Una figura rítmica indica cuánto dura un sonido. Las cuatro básicas son redonda, blanca, negra y corchea.",
      "Cómo se dibujan: la redonda es una cabeza hueca sin plica; la blanca, cabeza hueca con plica; la negra, cabeza rellena con plica; la corchea, cabeza rellena con plica y un corchete. Cada figura tiene también un silencio de la misma duración.",
      "Sus duraciones son relativas: cada figura vale la mitad de la anterior. Tomando la negra como un pulso, la redonda dura 4, la blanca 2, la negra 1 y la corchea ½. Por eso 2 blancas = 1 redonda, 2 negras = 1 blanca y 2 corcheas = 1 negra.",
      "El pulso es el latido regular de la música, el que marcas con el pie. El compás agrupa los pulsos en bloques iguales, separados por líneas verticales (barras de compás). En 4/4, el 4 de arriba dice que hay 4 pulsos por compás y el 4 de abajo, que cada pulso vale una negra.",
      "En un compás de 4/4 caben, por ejemplo, 1 redonda, o 2 blancas, o 4 negras, u 8 corcheas, o cualquier mezcla que sume 4 pulsos: 1 blanca + 2 negras, 2 corcheas + 1 negra + 1 blanca...",
      "Errores comunes: pensar que una figura dura siempre lo mismo en segundos (depende del tempo); creer que la blanca dura menos que la negra por ser «blanca» (dura el doble); y confundir el nombre con la cantidad de pulsos. Simplificación: hay compases con otros pulsos (3/4, 6/8...) que no se estudian aquí.",
    ],
    visuales: [
      vRitmo(["redonda", "blanca", "negra", "corchea"], { despuesDePaso: 2, titulo: "Duración de cada figura en un compás de 4/4" }),
    ],
    quiz: [
      q("Si la negra dura 1 pulso, ¿cuánto dura la blanca?", "2 pulsos", ["1 pulso", "4 pulsos", "medio pulso"], "La blanca dura el doble que la negra."),
      q("¿Cuántas corcheas suman lo mismo que una negra?", "2", ["1", "4", "8"], "La corchea vale medio pulso: 2 corcheas = 1 negra."),
      q("En un compás de 4/4, ¿cuántos pulsos hay en cada compás?", "4", ["2", "3", "8"], "El número de arriba indica los pulsos por compás."),
      q("¿Cuál de estas combinaciones llena un compás de 4/4?", "1 blanca + 2 negras", ["1 blanca + 1 negra", "3 blancas", "2 negras + 1 redonda"], "2 + 1 + 1 = 4 pulsos."),
      q("¿Qué figura tiene la cabeza hueca y plica?", "Blanca", ["Redonda", "Negra", "Corchea"], "Hueca sin plica es la redonda; hueca con plica, la blanca."),
    ],
  },
];
