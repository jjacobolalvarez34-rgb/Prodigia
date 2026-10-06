import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vAcorde, vMetronomo, vRitmo } from "./ayudas";

// Ampliación de Melodía (pedido del usuario, 2026-10-06): lo que la Práctica
// empezó a evaluar ese día y Aprender tiene que enseñar.
//   - Fundamentos: semicorchea, fusa, semifusa, puntillo y corcheas unidas, con
//     sus equivalencias (las preguntas «¿cuántas X caben en una Y?»).
//   - Oído absoluto: oído de acordes (el tipo de tríada en los niveles 7-8 y el
//     acorde completo en los niveles 9-10).
//   - Tempo y compás: grupo nuevo (modo melodia_tempo) con pulso, BPM, términos
//     italianos y cifras de compás.
// Va en su propia migración (0253) para no tocar 0213, que ya está aplicada.
// Datos verificados en lecciones.test.ts contra practica/melodia.ts.

export const TECNICAS_AMPLIACION_MELODIA: TecnicaMelodia[] = [
  {
    slug: "melodia-figuras-cortas-y-puntillo",
    grupo: "fundamentos",
    orden: 4,
    requierePro: false,
    nombre: "Un corchete más, la mitad de duración; el puntillo suma la mitad",
    descripcion:
      "Cada corchete parte la duración a la mitad: corchea (1), semicorchea (2), fusa (3) y semifusa (4). El puntillo alarga una figura la mitad de lo que vale, y dos corcheas unidas por una barra duran lo mismo que una negra.",
    pasos: [
      "Cuenta los corchetes (las banderitas de la plica): uno es corchea (medio pulso), dos es semicorchea (un cuarto de pulso), tres es fusa (un octavo de pulso) y cuatro es semifusa (un dieciseisavo de pulso). Cada corchete más parte la duración a la mitad.",
      "Por eso caben 2 semicorcheas en una corchea, 4 en una negra y 16 en una redonda; y 2 fusas en una semicorchea.",
      "El puntillo (un punto a la derecha de la cabeza) suma la mitad de lo que vale la figura: la negra con puntillo dura 1 + ½ = 1 pulso y medio, y la blanca con puntillo, 2 + 1 = 3 pulsos.",
      "Cuando hay varias corcheas seguidas, los corchetes se cambian por una barra que las une. Dos corcheas unidas duran ½ + ½ = 1 pulso, lo mismo que una negra: la barra no cambia la duración, solo las agrupa para leerlas mejor.",
    ],
    visuales: [
      vRitmo(["corchea", "semicorchea", "fusa", "semifusa"], { despuesDePaso: 0, titulo: "Un corchete más, la mitad de duración" }),
      vRitmo(["negra_puntillo", "blanca_puntillo", "corcheas_unidas"], { despuesDePaso: 3, titulo: "El puntillo y las corcheas unidas" }),
    ],
    quiz: [
      q("¿Cuántos corchetes tiene una fusa?", "3", ["2", "4", "1"], "Corchea 1, semicorchea 2, fusa 3 y semifusa 4."),
      q("¿Cuántas semicorcheas caben en una negra?", "4", ["2", "8", "16"], "La negra dura 1 pulso y la semicorchea un cuarto de pulso: caben 4."),
      q("¿Cuánto dura una negra con puntillo?", "1 pulso y medio", ["2 pulsos", "1 pulso", "3 pulsos"], "El puntillo suma la mitad: 1 + ½ = 1 pulso y medio."),
      q("Dos corcheas unidas por una barra duran lo mismo que...", "Una negra", ["Una blanca", "Una corchea", "Una semicorchea"], "½ + ½ = 1 pulso, igual que la negra."),
    ],
  },
  {
    slug: "melodia-oido-color-de-los-acordes",
    grupo: "oido_absoluto",
    orden: 3,
    requierePro: false,
    nombre: "Acordes de oído: escucha el carácter y la nota del medio",
    descripcion:
      "Las cuatro tríadas suenan distinto: la mayor, estable y luminosa; la menor, estable pero más oscura; la disminuida, tensa; la aumentada, abierta y sin reposo. La diferencia está en las terceras que las forman.",
    pasos: [
      "En los niveles altos de Oído absoluto suena un acorde (tres notas a la vez) y tienes que decir de qué tipo es. No hace falta nombrar cada nota: primero escucha el carácter general.",
      "Tríada mayor: suena estable y luminosa. Tríada menor: también estable, pero más oscura. Las dos tienen la misma 5.ª; cambia solo la nota del medio (la 3.ª), que en la menor está un semitono más grave. Simplificación: «luminosa» y «oscura» son ayudas para empezar, no reglas.",
      "Tríada disminuida: suena tensa, como si pidiera moverse a otro acorde (su 5.ª está un semitono más grave que en la menor). Tríada aumentada: suena abierta y sin reposo (su 5.ª está un semitono más aguda que en la mayor).",
      "En los niveles 9 y 10 hay que decir el acorde completo, por ejemplo «Sol menor». Busca la nota más grave (la fundamental, que da el nombre) cantándola por dentro, y después decide si suena mayor o menor.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 1, titulo: "Tríada mayor: Do-Mi-Sol", escuchar: true }),
      vAcorde({ fundamental: "Do4", tipo: "menor", bemoles: true }, { despuesDePaso: 1, titulo: "Tríada menor: Do-Mi♭-Sol", escuchar: true }),
    ],
    quiz: [
      q("¿Qué nota cambia entre una tríada mayor y una menor con la misma fundamental?", "La 3.ª (la del medio)", ["La fundamental", "La 5.ª", "Ninguna"], "La menor tiene la 3.ª un semitono más grave: Do-Mi-Sol frente a Do-Mi♭-Sol."),
      q("¿Qué tríada suena tensa, como si pidiera moverse?", "Tríada disminuida", ["Tríada mayor", "Tríada menor", "Tríada aumentada"], "La disminuida tiene dos terceras menores: suena inestable y apretada."),
      q("En el acorde «Sol menor», ¿qué indica «Sol»?", "La fundamental del acorde", ["La nota más aguda", "La 3.ª del acorde", "El tempo de la canción"], "El nombre del acorde es su fundamental; «menor» es su tipo."),
    ],
  },
  {
    slug: "melodia-tempo-bpm-en-segundos",
    grupo: "tempo",
    orden: 1,
    requierePro: false,
    nombre: "BPM: cuántos pulsos caben en un minuto",
    descripcion:
      "El tempo se mide en BPM (pulsos por minuto). A 60 BPM hay un pulso por segundo; a 120, dos. Para saber cuánto dura un pulso: 60 ÷ BPM segundos.",
    pasos: [
      "El pulso es el latido regular de la música. El tempo es qué tan rápido va ese pulso, y se mide en BPM: pulsos por minuto (del inglés beats per minute).",
      "Ancla: 60 BPM es un pulso por segundo, como el segundero de un reloj. 120 BPM es el doble de rápido (dos pulsos por segundo) y 30 BPM, la mitad.",
      "Cuánto dura un pulso: 60 ÷ BPM segundos. A 120 BPM, 60 ÷ 120 = 0,5 s; a 90 BPM, 60 ÷ 90 ≈ 0,67 s. Si la negra es el pulso, una blanca dura el doble y una corchea, la mitad.",
      "En la Práctica suena un metrónomo y tienes que decir a cuántos BPM va. Compara con el segundero (60) y decide si va más rápido o más lento, y cuánto: el doble, la mitad o un poco.",
    ],
    visuales: [vMetronomo([60, 120], { despuesDePaso: 1, titulo: "60 y 120 BPM: uno y dos pulsos por segundo", escuchar: true })],
    quiz: [
      q("¿Qué significa BPM?", "Pulsos por minuto", ["Pulsos por segundo", "Compases por minuto", "Notas por compás"], "BPM = beats per minute: cuántos pulsos caben en un minuto."),
      q("A 120 BPM, ¿cuánto dura un pulso?", "0,5 s", ["1 s", "2 s", "0,25 s"], "60 ÷ 120 = 0,5 segundos."),
      q("A 60 BPM, ¿cuánto dura una blanca si la negra es el pulso?", "2 s", ["1 s", "0,5 s", "4 s"], "A 60 BPM la negra dura 1 s; la blanca, el doble."),
      q("Un metrónomo a 30 BPM va...", "La mitad de rápido que a 60", ["El doble de rápido que a 60", "Igual que a 60", "Un pulso por segundo"], "30 pulsos por minuto: un pulso cada 2 segundos."),
    ],
  },
  {
    slug: "melodia-tempo-terminos-italianos",
    grupo: "tempo",
    orden: 2,
    requierePro: false,
    nombre: "Términos de tempo: de Largo a Presto",
    descripcion:
      "Las partituras indican el tempo con palabras en italiano. De lento a rápido: Largo, Adagio, Andante, Moderato, Allegro y Presto.",
    pasos: [
      "Antes de que existieran los metrónomos, los compositores escribían el tempo con palabras, casi siempre en italiano. Todavía se usan, a veces junto con el número de BPM.",
      "De lento a rápido: Largo (muy lento, unos 40-60 BPM), Adagio (lento, 66-76), Andante (al paso de caminar, 76-108), Moderato (moderado, 108-120), Allegro (rápido y alegre, 120-156) y Presto (muy rápido, 168-200).",
      "Truco: Andante viene de «andar»: es el tempo de una caminata tranquila. Lo que está por debajo es lento (Largo, Adagio) y lo que está por encima es cada vez más rápido (Moderato, Allegro, Presto).",
      "Simplificación: los rangos de BPM son aproximados y cambian un poco según el libro o el metrónomo; lo importante es el orden y el carácter de cada término.",
    ],
    visuales: [vMetronomo([50, 92, 138], { despuesDePaso: 1, titulo: "Largo, Andante y Allegro", escuchar: true })],
    quiz: [
      q("¿Qué indica «Andante»?", "Al paso de caminar", ["Muy rápido", "Muy lento", "Rápido y alegre"], "Andante viene de andar: el tempo de una caminata tranquila."),
      q("De estos cuatro, ¿cuál es el tempo más rápido?", "Presto", ["Allegro", "Moderato", "Adagio"], "De lento a rápido: Largo, Adagio, Andante, Moderato, Allegro, Presto."),
      q("De estos cuatro, ¿cuál es el tempo más lento?", "Largo", ["Andante", "Adagio", "Moderato"], "Largo es el más lento de la lista (unos 40-60 BPM)."),
      q("Una pieza marcada «Allegro» va...", "Rápida y alegre", ["Muy lenta", "Al paso de caminar", "Lenta"], "Allegro: rápido y alegre, unos 120-156 BPM."),
    ],
  },
  {
    slug: "melodia-tempo-leer-el-compas",
    grupo: "tempo",
    orden: 3,
    requierePro: false,
    nombre: "El compás: el número de arriba cuenta, el de abajo dice la figura",
    descripcion:
      "En 2/4, 3/4 y 4/4 el número de arriba dice cuántos tiempos tiene cada compás y el de abajo, qué figura vale un tiempo (4 = negra, 2 = blanca, 8 = corchea).",
    pasos: [
      "La cifra de compás son dos números al principio del pentagrama. El de arriba cuenta cuántos tiempos tiene cada compás: 2/4 tiene 2, 3/4 tiene 3 y 4/4 tiene 4.",
      "El de abajo dice qué figura vale un tiempo: 4 es la negra (la redonda partida en 4), 2 es la blanca y 8 es la corchea. Por eso en 2/2 cada tiempo es una blanca.",
      "El primer tiempo de cada compás es el fuerte. En 3/4 se cuenta UN-dos-tres (como un vals) y en 4/4, UN-dos-tres-cuatro, con el tres algo marcado.",
      "Para saber cuántas corcheas caben, cuenta los tiempos y multiplica por lo que vale cada uno: en 3/4 hay 3 negras = 6 corcheas; en 4/4, 8 corcheas; en 2/2, 2 blancas = 8 corcheas.",
    ],
    visuales: [vMetronomo([90], { compas: "3/4", despuesDePaso: 2, titulo: "3/4: UN-dos-tres", escuchar: true })],
    quiz: [
      q("En un compás de 3/4, ¿cuántos tiempos tiene cada compás?", "3", ["4", "2", "6"], "El número de arriba indica los tiempos: 3."),
      q("En un compás de 2/2, ¿qué figura vale un tiempo?", "Blanca", ["Negra", "Corchea", "Redonda"], "El 2 de abajo es la blanca."),
      q("¿Cuántas corcheas caben en un compás de 3/4?", "6", ["3", "8", "4"], "3 negras × 2 corcheas = 6 corcheas."),
      q("¿Qué tiempo del compás es el fuerte?", "El primero", ["El último", "El segundo", "Todos por igual"], "El primer tiempo de cada compás es el que se acentúa."),
    ],
  },
];

export const CLASES_AMPLIACION_MELODIA: ClaseMelodia[] = [
  {
    slug: "melodia-clase-figuras-cortas-y-puntillo",
    grupo: "fundamentos",
    orden: 4,
    requierePro: true,
    nombre: "Semicorcheas, fusas, semifusas, puntillo y corcheas unidas",
    descripcion:
      "Las figuras más cortas que la corchea, cómo se dibujan, cuántas caben en las demás, qué hace el puntillo y por qué las corcheas se unen con una barra.",
    pasos: [
      "Ya conoces la redonda (4 pulsos), la blanca (2), la negra (1) y la corchea (½). La serie sigue partiendo a la mitad: la semicorchea dura un cuarto de pulso, la fusa un octavo y la semifusa un dieciseisavo. Se reconocen por los corchetes: la corchea tiene 1, la semicorchea 2, la fusa 3 y la semifusa 4.",
      "Equivalencias que conviene tener a mano (con la negra como pulso): 1 redonda = 2 blancas = 4 negras = 8 corcheas = 16 semicorcheas. 1 negra = 2 corcheas = 4 semicorcheas = 8 fusas = 16 semifusas.",
      "Para calcular cuántas figuras cortas caben en una larga, divide sus duraciones: en una blanca (2 pulsos) caben 2 ÷ ¼ = 8 semicorcheas; en una corchea (½) caben 2 semicorcheas o 4 fusas.",
      "El puntillo es un punto a la derecha de la cabeza y suma la mitad del valor de la figura. Negra con puntillo: 1 + ½ = 1 pulso y medio, así que 1 negra con puntillo = 3 corcheas = 6 semicorcheas. Blanca con puntillo: 2 + 1 = 3 pulsos, así que 1 blanca con puntillo = 3 negras = 6 corcheas = 12 semicorcheas.",
      "Cuando aparecen varias corcheas seguidas, se escriben unidas por una barra en lugar de llevar cada una su corchete. Dos corcheas unidas duran ½ + ½ = 1 pulso, igual que una negra. Una barra equivale a un corchete; con dos barras se unen semicorcheas.",
      "Errores comunes: pensar que más corchetes significa más duración (es al revés: cada corchete parte la duración a la mitad); creer que el puntillo suma siempre medio pulso (suma la mitad de la figura: en la blanca suma un pulso entero); y pensar que la barra cambia la duración de las corcheas (solo las agrupa para leerlas mejor).",
    ],
    visuales: [
      vRitmo(["corchea", "semicorchea", "fusa", "semifusa"], { despuesDePaso: 0, titulo: "Cada corchete parte la duración a la mitad" }),
      vRitmo(["negra_puntillo", "blanca_puntillo", "corcheas_unidas"], { despuesDePaso: 4, titulo: "Puntillo y corcheas unidas" }),
    ],
    quiz: [
      q("¿Cuántas semicorcheas caben en una blanca?", "8", ["4", "16", "6"], "La blanca dura 2 pulsos y la semicorchea un cuarto de pulso: 2 ÷ ¼ = 8."),
      q("¿Qué figura tiene tres corchetes?", "Fusa", ["Semicorchea", "Semifusa", "Corchea"], "1 corchete es corchea, 2 semicorchea, 3 fusa y 4 semifusa."),
      q("¿Cuántas corcheas suman una blanca con puntillo?", "6", ["4", "3", "8"], "La blanca con puntillo dura 3 pulsos, y en cada pulso caben 2 corcheas: 6."),
      q("¿Qué hace el puntillo?", "Suma la mitad del valor de la figura", ["Duplica la duración", "Suma siempre medio pulso", "Convierte la figura en un silencio"], "Negra con puntillo: 1 + ½; blanca con puntillo: 2 + 1."),
      q("¿Cuánto duran dos corcheas unidas por una barra?", "1 pulso", ["medio pulso", "2 pulsos", "un cuarto de pulso"], "½ + ½ = 1 pulso: lo mismo que una negra."),
    ],
  },
  {
    slug: "melodia-clase-oido-de-acordes",
    grupo: "oido_absoluto",
    orden: 3,
    requierePro: true,
    nombre: "Oído de acordes: tríadas mayor, menor, disminuida y aumentada",
    descripcion:
      "Cómo se forman las cuatro tríadas con terceras mayores y menores, cómo reconocerlas de oído y cómo nombrar un acorde completo (fundamental y tipo).",
    pasos: [
      "Una tríada son tres notas apiladas por terceras: fundamental, 3.ª y 5.ª. Hay dos tamaños de tercera: la mayor (4 semitonos) y la menor (3 semitonos). Combinándolas salen las cuatro tríadas.",
      "Tríada mayor = 3.ª mayor + 3.ª menor (0-4-7): Do-Mi-Sol. Tríada menor = 3.ª menor + 3.ª mayor (0-3-7): Do-Mi♭-Sol. Las dos llegan a 7 semitonos de la fundamental: una 5.ª justa, que suena estable.",
      "Tríada disminuida = dos 3.as menores (0-3-6): Do-Mi♭-Sol♭. Tríada aumentada = dos 3.as mayores (0-4-8): Do-Mi-Sol♯. Como la 5.ª ya no es justa, las dos suenan inestables: la disminuida, tensa y apretada; la aumentada, abierta y sin reposo.",
      "Para reconocerlas de oído, decide primero si el acorde suena estable (mayor o menor) o inestable (disminuida o aumentada). Si es estable, escucha si es luminoso (mayor) u oscuro (menor). Si es inestable, si suena apretado (disminuida) o abierto (aumentada).",
      "En los niveles 9 y 10 se pide el acorde completo, como «Re menor» o «Fa mayor». El nombre es la fundamental, que en estas preguntas es también la nota más grave. Cántala por dentro, compárala con una referencia que conozcas (como el La4 de 440 Hz) y después decide mayor o menor.",
      "Errores comunes: tomar la nota más aguda por la fundamental (el acorde se nombra por la de abajo cuando no está invertido); pensar que mayor y menor se diferencian en la 5.ª (es la 3.ª); y creer que «menor» quiere decir más grave o más suave: es un tipo de acorde, no un volumen ni un registro. Simplificación: decir que la mayor es alegre y la menor triste ayuda al principio, pero hay canciones alegres en menor y tristes en mayor.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 1, titulo: "Tríada mayor (0-4-7)", escuchar: true }),
      vAcorde({ fundamental: "Do4", tipo: "menor", bemoles: true }, { despuesDePaso: 1, titulo: "Tríada menor (0-3-7)", escuchar: true }),
      vAcorde({ fundamental: "Do4", tipo: "disminuido", bemoles: true }, { despuesDePaso: 2, titulo: "Tríada disminuida (0-3-6)", escuchar: true }),
      vAcorde({ fundamental: "Do4", tipo: "aumentado" }, { despuesDePaso: 2, titulo: "Tríada aumentada (0-4-8)", escuchar: true }),
    ],
    quiz: [
      q("¿Cuántos semitonos tiene una 3.ª mayor?", "4", ["3", "5", "2"], "La 3.ª mayor tiene 4 semitonos y la 3.ª menor, 3."),
      q("¿Qué tríada se forma con dos terceras mayores?", "Tríada aumentada", ["Tríada mayor", "Tríada disminuida", "Tríada menor"], "4 + 4 = 8 semitonos: Do-Mi-Sol♯."),
      q("¿Qué tienen en común la tríada mayor y la menor?", "La 5.ª justa (7 semitonos)", ["La misma 3.ª", "Que suenan inestables", "Que tienen 4 notas"], "Las dos llegan a la 5.ª justa; lo que cambia es la 3.ª."),
      q("En el acorde «Re menor», ¿qué nota es la fundamental?", "Re", ["Fa", "La", "Mi"], "La fundamental es la que da nombre al acorde: Re (Re-Fa-La)."),
      q("Suena un acorde inestable y apretado. ¿De qué tipo es lo más probable?", "Tríada disminuida", ["Tríada aumentada", "Tríada mayor", "Tríada menor"], "La disminuida (dos 3.as menores) suena tensa y apretada; la aumentada, abierta."),
    ],
  },
  {
    slug: "melodia-clase-pulso-y-tempo",
    grupo: "tempo",
    orden: 1,
    requierePro: true,
    nombre: "Pulso, tempo y BPM: medir la velocidad de la música",
    descripcion:
      "Qué es el pulso, qué es el tempo, cómo se mide en BPM y cómo calcular cuánto dura cada figura en segundos a un tempo dado.",
    pasos: [
      "El pulso es el latido regular de la música: lo que marcas con el pie o con las palmas sin pensarlo. Las figuras rítmicas (redonda, blanca, negra...) dicen cuántos pulsos dura cada sonido, pero no cuántos segundos.",
      "El tempo es la velocidad del pulso y se mide en BPM (pulsos por minuto). Un metrónomo es el aparato que marca ese pulso con un clic. 60 BPM son 60 pulsos por minuto: el pulso coincide con el segundero de un reloj.",
      "Fórmula: duración de un pulso = 60 ÷ BPM segundos. A 60 BPM, 1 s; a 120 BPM, 0,5 s; a 30 BPM, 2 s; a 240 BPM, 0,25 s. Más BPM, pulsos más cortos.",
      "Con la negra como pulso, cada figura dura sus pulsos multiplicados por lo que dura un pulso. A 120 BPM: negra 0,5 s, blanca 1 s, redonda 2 s, corchea 0,25 s y negra con puntillo 0,75 s.",
      "Para reconocer un tempo de oído, compara con referencias: 60 BPM es un clic por segundo y 120 BPM, dos por segundo (como una marcha rápida). Si el clic va un poco más rápido que el segundero, estás entre 60 y 90; si va casi al doble, cerca de 120.",
      "Errores comunes: pensar que una figura dura siempre lo mismo (depende del tempo: una negra a 60 BPM dura el doble que a 120); confundir BPM con notas por minuto (cuenta pulsos, no notas); y creer que más BPM significa más fuerte (es más rápido, no más volumen).",
    ],
    visuales: [
      vMetronomo([60, 120, 240], { despuesDePaso: 2, titulo: "60, 120 y 240 BPM", escuchar: true }),
      vRitmo(["redonda", "blanca", "negra", "corchea"], { despuesDePaso: 3, titulo: "Pulsos de cada figura (la negra es el pulso)" }),
    ],
    quiz: [
      q("¿Qué mide el tempo?", "La velocidad del pulso", ["El volumen de la música", "Cuántas notas tiene un acorde", "La altura de las notas"], "El tempo es qué tan rápido va el pulso, y se mide en BPM."),
      q("A 120 BPM, ¿cuánto dura una blanca si la negra es el pulso?", "1 s", ["0,5 s", "2 s", "0,25 s"], "Un pulso dura 60 ÷ 120 = 0,5 s y la blanca son 2 pulsos: 1 s."),
      q("A 30 BPM, ¿cuánto dura un pulso?", "2 s", ["0,5 s", "1 s", "30 s"], "60 ÷ 30 = 2 segundos."),
      q("Si el tempo pasa de 60 a 120 BPM, las negras...", "Duran la mitad", ["Duran el doble", "Duran lo mismo", "Suenan más fuerte"], "El doble de pulsos por minuto: cada pulso dura la mitad."),
      q("A 120 BPM, ¿cuánto dura una negra con puntillo?", "0,75 s", ["0,5 s", "1 s", "1,5 s"], "1 pulso y medio × 0,5 s = 0,75 s."),
    ],
  },
  {
    slug: "melodia-clase-terminos-de-tempo",
    grupo: "tempo",
    orden: 2,
    requierePro: true,
    nombre: "Los términos italianos de tempo y el metrónomo",
    descripcion:
      "Largo, Adagio, Andante, Moderato, Allegro y Presto: qué significa cada uno, en qué rango de BPM suele estar y cómo se indica un cambio de tempo dentro de una pieza.",
    pasos: [
      "Durante siglos el tempo se escribió con palabras. El italiano quedó como idioma común de la música, y por eso esas indicaciones siguen apareciendo al principio de las partituras, muchas veces junto al número del metrónomo.",
      "Los lentos: Largo (muy lento, unos 40-60 BPM) y Adagio (lento, unos 66-76 BPM). Se usan en piezas tranquilas o solemnes.",
      "Los medios: Andante (al paso de caminar, unos 76-108 BPM) y Moderato (moderado, unos 108-120 BPM). Andante viene de «andar»: piensa en una caminata tranquila.",
      "Los rápidos: Allegro (rápido y alegre, unos 120-156 BPM) y Presto (muy rápido, unos 168-200 BPM). Ordenados de lento a rápido: Largo, Adagio, Andante, Moderato, Allegro, Presto.",
      "El tempo también puede cambiar dentro de una pieza: accelerando (acelerar poco a poco), ritardando (ir frenando poco a poco) y a tempo (volver al tempo de antes).",
      "Errores comunes: creer que Allegro indica solo un carácter alegre (indica sobre todo un tempo rápido); pensar que Andante es tan lento como Adagio (es más ágil: el paso de caminar); y tomar los rangos de BPM como exactos. Simplificación: cada libro y cada metrónomo da rangos un poco distintos; lo que no cambia es el orden.",
    ],
    visuales: [
      vMetronomo([50, 70, 92], { despuesDePaso: 2, titulo: "Largo, Adagio y Andante", escuchar: true }),
      vMetronomo([114, 138, 184], { despuesDePaso: 3, titulo: "Moderato, Allegro y Presto", escuchar: true }),
    ],
    quiz: [
      q("¿Qué indica «Adagio»?", "Lento", ["Muy rápido", "Al paso de caminar", "Moderado"], "Adagio: lento, unos 66-76 BPM."),
      q("Ordenados de lento a rápido, ¿qué término va justo después de Andante?", "Moderato", ["Allegro", "Adagio", "Presto"], "Largo, Adagio, Andante, Moderato, Allegro, Presto."),
      q("¿Qué indica «Presto»?", "Muy rápido", ["Rápido y alegre", "Muy lento", "Moderado"], "Presto es el más rápido de la lista: unos 168-200 BPM."),
      q("¿Qué significa «ritardando»?", "Ir frenando poco a poco", ["Acelerar poco a poco", "Volver al tempo anterior", "Tocar más fuerte"], "Ritardando frena; accelerando acelera; a tempo vuelve al tempo de antes."),
      q("Una pieza a 92 BPM está más cerca de...", "Andante", ["Largo", "Presto", "Allegro"], "92 BPM cae en el rango de Andante (unos 76-108)."),
    ],
  },
  {
    slug: "melodia-clase-compases",
    grupo: "tempo",
    orden: 3,
    requierePro: true,
    nombre: "Compases: 2/4, 3/4, 4/4, 2/2 y 6/8",
    descripcion:
      "Cómo se lee la cifra de compás, cuántos tiempos y cuántas corcheas caben en cada compás, dónde caen los acentos y en qué se diferencia el 6/8.",
    pasos: [
      "El compás agrupa los pulsos en bloques iguales separados por barras verticales. La cifra de compás, al principio, son dos números: el de arriba dice cuántos tiempos hay y el de abajo, qué figura vale un tiempo (4 = negra, 2 = blanca, 8 = corchea).",
      "Los compases simples más comunes: 2/4 (2 negras, como una marcha: UN-dos), 3/4 (3 negras, como un vals: UN-dos-tres) y 4/4 (4 negras: UN-dos-tres-cuatro, el más común en la música popular). En 2/2 hay 2 tiempos, y cada uno vale una blanca.",
      "Cuántas figuras caben: multiplica los tiempos por lo que vale cada uno. 2/4 = 4 corcheas; 3/4 = 6 corcheas; 4/4 = 8 corcheas = 1 redonda; 2/2 = 2 blancas = 8 corcheas.",
      "El primer tiempo de cada compás es el fuerte. En 4/4 el tercero es semifuerte (UN-dos-TRES-cuatro) y los demás, débiles. Por eso un vals y una marcha se distinguen por cómo se agrupan los acentos, aunque vayan al mismo tempo.",
      "El 6/8 es un compás compuesto: tiene 6 corcheas por compás, pero se siente en dos grupos de tres (UN-dos-tres-DOS-dos-tres). Cada grupo equivale a una negra con puntillo, así que muchas veces se cuenta a 2 pulsos de negra con puntillo.",
      "Errores comunes: simplificar la cifra como una fracción (2/4 no se toca como 1/2 ni como 4/8: cambia cómo se cuenta); pensar que el número de abajo cuenta tiempos (dice qué figura vale uno); y contar el 6/8 como un 3/4 (los dos tienen 6 corcheas, pero 3/4 las agrupa de a dos y 6/8, de a tres).",
    ],
    visuales: [
      vMetronomo([96], { compas: "3/4", despuesDePaso: 1, titulo: "3/4: UN-dos-tres" }),
      vMetronomo([96], { compas: "4/4", despuesDePaso: 3, titulo: "4/4: UN-dos-TRES-cuatro", escuchar: true }),
      vMetronomo([180], { compas: "6/8", despuesDePaso: 4, titulo: "6/8: dos grupos de tres corcheas", escuchar: true }),
    ],
    quiz: [
      q("En un compás de 4/4, ¿cuántas corcheas caben?", "8", ["4", "6", "16"], "4 negras × 2 corcheas = 8."),
      q("¿Qué indica el número de abajo de la cifra de compás?", "Qué figura vale un tiempo", ["Cuántos tiempos hay", "El tempo en BPM", "Cuántos compases tiene la pieza"], "4 = negra, 2 = blanca, 8 = corchea."),
      q("¿Cómo se agrupan las corcheas en 6/8?", "En dos grupos de tres", ["En tres grupos de dos", "En un grupo de seis", "En seis grupos de una"], "UN-dos-tres-DOS-dos-tres: dos tiempos de negra con puntillo."),
      q("En 4/4, ¿qué tiempo es semifuerte?", "El tercero", ["El segundo", "El cuarto", "El primero"], "UN-dos-TRES-cuatro: fuerte el 1 y semifuerte el 3."),
      q("¿Qué compás tiene 3 tiempos de negra, como un vals?", "3/4", ["2/4", "4/4", "6/8"], "El 3 de arriba son 3 tiempos; el 4 de abajo, la negra."),
    ],
  },
];
