import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vFrecuencia, vTeclado } from "./ayudas";

// Grupo "oido_absoluto" (modo de práctica Oído absoluto): identificar de oído
// una nota sintetizada (frecuenciaDeNota, La4 = 440 Hz, temperamento igual)
// entre 4 opciones. Las opciones del banco (POOL_OIDO_POR_BANDA) van de
// Do4, Fa4, Sol4 y Do5 en el nivel más bajo, a las siete naturales de dos
// octavas y a los sostenidos de Do, Re, Fa, Sol y La en los niveles altos.
// Las frecuencias de los visuales salen de frecuenciaDeNota.
//
// Rigor: aquí no se promete ningún «poder». El oído absoluto (nombrar una nota
// sin referencia) es poco frecuente y no hay consenso sobre cuánto puede
// desarrollarse en la adultez; lo que sí se entrena con práctica es el oído
// relativo (reconocer alturas y distancias contra una referencia).

export const TECNICAS_OIDO: TecnicaMelodia[] = [
  {
    slug: "melodia-oido-ancla-la-440",
    grupo: "oido_absoluto",
    orden: 1,
    requierePro: false,
    nombre: "Ancla tu oído en una referencia: el La de 440 Hz",
    descripcion:
      "Sin una referencia es muy difícil nombrar una nota de oído. Ancla tu oído en una nota que conozcas bien, como el La4 de 440 Hz (la de afinación), y compara: ¿más grave o más aguda?, ¿cuánto?",
    pasos: [
      "En este modo escuchas una nota sintetizada (un tono electrónico, no un piano) y eliges cuál es. No te dan ninguna referencia: la construyes tú.",
      "Una ancla útil es el La4, de 440 Hz, la nota con la que se afinan los instrumentos. Si recuerdas cómo suena, compara: la nota que oyes ¿es más grave o más aguda que ese La? ¿Muy lejos o cerca?",
      "Empieza por el registro: ¿es grave o aguda? Eso te dice en qué octava está. Después decide el nombre entre las opciones.",
      "El mismo nombre en octavas distintas (La3, La4, La5) suena como «la misma nota» más grave o más aguda: al subir una octava, la frecuencia se duplica.",
    ],
    visuales: [vFrecuencia(["La3", "La4", "La5"], { despuesDePaso: 3, titulo: "El La en tres octavas", escuchar: true })],
    quiz: [
      q("¿Cuántos hercios tiene el La4, la nota de afinación?", "440", ["220", "261", "880"], "La4 = 440 Hz es la referencia de afinación más usada."),
      q("¿Qué pasa con la frecuencia al subir una octava?", "Se duplica", ["Aumenta 12 Hz", "Se reduce a la mitad", "Se mantiene igual"], "La5 = 880 Hz, el doble de La4 (440 Hz)."),
      q("¿Por dónde conviene empezar al identificar una nota de oído?", "Decidir si es grave o aguda y compararla con una referencia", ["Adivinar al azar la primera vez", "Mirar el volumen de la nota", "Contar los segundos que dura"], "Primero el registro y la comparación con una referencia; después el nombre."),
    ],
  },
  {
    slug: "melodia-oido-ordena-las-opciones",
    grupo: "oido_absoluto",
    orden: 2,
    requierePro: false,
    nombre: "Ordena las opciones de grave a aguda y compara",
    descripcion:
      "En los primeros niveles las opciones están muy separadas. Ordénalas mentalmente de la más grave a la más aguda antes de escuchar, y en los niveles altos compara la nota con sus vecinas a un semitono.",
    pasos: [
      "En los niveles más bajos las cuatro opciones son Do4, Fa4, Sol4 y Do5: muy separadas entre sí (una 4.ª, una 5.ª y una octava desde Do4). Ordénalas antes de escuchar, de la más grave a la más aguda.",
      "Cuando suena la nota, decide si es de las graves, de las medias o de las agudas. Con opciones tan separadas, eso suele bastar.",
      "En los niveles altos aparecen sostenidos: un sostenido está un semitono por encima de su nota natural (Do♯ queda justo encima de Do). Compara la nota que oyes con las dos vecinas más cercanas y decide si está más arriba o más abajo.",
      "Puedes repetir la nota las veces que quieras con el botón de escuchar. Si te cansas, para y vuelve más tarde: el oído rinde mejor en sesiones cortas.",
    ],
    visuales: [
      vTeclado(["Do4", "Fa4", "Sol4", "Do5"], { despuesDePaso: 0, titulo: "Las opciones más separadas: Do4, Fa4, Sol4 y Do5", desde: "Do4", hasta: "Do5", nombres: "resaltadas", saltos: true, escuchar: true }),
    ],
    quiz: [
      q("¿Qué haces primero con las opciones en los niveles bajos?", "Ordenarlas de la más grave a la más aguda", ["Elegir la del medio siempre", "Ignorarlas y adivinar", "Buscar la más larga"], "Al ordenarlas sabes con qué comparar la nota que suena."),
      q("¿Qué es un sostenido respecto de su nota natural?", "Un semitono más agudo", ["Un semitono más grave", "Una octava más aguda", "La misma nota"], "Do♯ suena justo encima de Do, a un semitono."),
      q("¿A cuántos semitonos está Do4 de Sol4?", "7", ["5", "4", "12"], "Do4 a Sol4 es una 5.ª justa: 7 semitonos."),
    ],
  },
];

export const CLASES_OIDO: ClaseMelodia[] = [
  {
    slug: "melodia-clase-frecuencia-y-octava",
    grupo: "oido_absoluto",
    orden: 1,
    requierePro: true,
    nombre: "Frecuencia, La = 440 Hz y la razón de octava",
    descripcion:
      "Qué es la frecuencia de una nota, por qué el La4 vale 440 Hz, cómo se relacionan las octavas (2:1) y cuánto vale un semitono en el afinado del piano.",
    pasos: [
      "La frecuencia de un sonido es el número de vibraciones por segundo y se mide en hercios (Hz). A mayor frecuencia, sonido más agudo. Cada nota corresponde a una frecuencia concreta.",
      "Por convención internacional, el La4 se afina a 440 Hz: es la referencia con la que se afinan diapasones, orquestas y pianos. Algunas orquestas barrocas afinan más bajo (por ejemplo, alrededor de 415 Hz); 440 es el estándar más extendido, no una ley de la naturaleza.",
      "Octava: subir una octava duplica la frecuencia, y bajarla la divide por dos. La3 = 220 Hz, La4 = 440 Hz, La5 = 880 Hz. Esa relación 2:1 es la razón por la que dos notas con el mismo nombre suenan «la misma nota» en registros distintos.",
      "El afinado de los pianos modernos, el temperamento igual, reparte la octava en 12 semitonos iguales. Cada semitono multiplica la frecuencia por 2^(1/12), aproximadamente 1,0595. Doce semitonos seguidos multiplican por 2: una octava.",
      "Ejemplo: Do4 (el Do central) ≈ 261,63 Hz y Do5 ≈ 523,25 Hz (el doble). De Do4 a Do♯4 la frecuencia sube por un factor 1,0595, unos 277,18 Hz. Por eso los semitonos «se sienten» igual de grandes en cualquier parte del teclado, aunque en Hz no lo sean.",
      "Errores comunes: creer que sumar 12 Hz da una octava (se multiplica por 2, no se suma); creer que cada nota está a la misma cantidad de Hz de la anterior (la distancia en Hz crece con la altura; lo que se mantiene igual es la razón); y pensar que 440 Hz es universal. Simplificación: se usa el temperamento igual de nivel colegio; hay otros sistemas de afinación con valores ligeramente distintos.",
    ],
    visuales: [
      vFrecuencia(["La3", "La4", "La5"], { despuesDePaso: 2, titulo: "Cada octava duplica la frecuencia", escuchar: true }),
      vFrecuencia(["Do4", "Do♯4"], { despuesDePaso: 3, titulo: "Un semitono: la frecuencia se multiplica por 1,0595", escuchar: true }),
      vFrecuencia(["Do4", "Do5"], { despuesDePaso: 4, titulo: "Doce semitonos: una octava, el doble" }),
    ],
    quiz: [
      q("¿Qué frecuencia tiene el La una octava por encima de La4 (440 Hz)?", "880 Hz", ["450 Hz", "660 Hz", "452 Hz"], "Una octava arriba duplica la frecuencia: 2 × 440 = 880 Hz."),
      q("¿Por cuánto se multiplica la frecuencia al subir un semitono en el temperamento igual?", "Por 2^(1/12), aproximadamente 1,0595", ["Por 2", "Por 1,5", "Se le suman 12 Hz"], "12 semitonos seguidos deben dar el doble: 2^(1/12) multiplicado 12 veces es 2."),
      q("¿A cuántos hercios se afina normalmente el La4?", "440 Hz", ["262 Hz", "220 Hz", "1 000 Hz"], "El estándar de afinación más extendido es La4 = 440 Hz."),
      q("¿Qué relación tienen las frecuencias de dos notas con el mismo nombre a una octava de distancia?", "Una es el doble de la otra", ["Se diferencian en 12 Hz", "Son iguales", "Una es el triple de la otra"], "Relación 2:1: por eso suenan como la misma nota."),
      q("Aproximadamente, ¿cuántos hercios tiene el Do central (Do4)?", "261,63 Hz", ["440 Hz", "329,63 Hz", "523,25 Hz"], "Do4 ≈ 261,63 Hz; su octava, Do5, ≈ 523,25 Hz."),
    ],
  },
  {
    slug: "melodia-clase-oido-absoluto-y-relativo",
    grupo: "oido_absoluto",
    orden: 2,
    requierePro: true,
    nombre: "Oído absoluto y oído relativo: qué son y cómo se entrena",
    descripcion:
      "La diferencia entre reconocer una nota sin referencia (oído absoluto) y reconocerla comparándola con otra (oído relativo), y estrategias honestas para el modo de la Práctica.",
    pasos: [
      "El oído absoluto es la capacidad de identificar o cantar una nota concreta sin ninguna referencia. Es poco frecuente, y hay debate científico sobre en qué medida se puede desarrollar en la adultez. Nada de lo que aparece en Prodigia promete conseguirlo.",
      "El oído relativo es reconocer una altura por su relación con otra: una distancia entre dos notas (un intervalo), o una nota respecto de una referencia. Es lo que usan casi todos los músicos y sí mejora con práctica.",
      "En el modo Oído absoluto de la Práctica escuchas una nota sintetizada y eliges su nombre entre cuatro opciones. En los niveles bajos las opciones están muy separadas (Do4, Fa4, Sol4, Do5); después se suman las siete naturales, dos octavas y, al final, sostenidos: semitonos vecinos que son la parte difícil.",
      "Estrategias: (1) fija una referencia que conozcas, como el La4 de 440 Hz; (2) decide primero el registro (grave o agudo) y luego el nombre; (3) ordena las opciones de grave a aguda; (4) en los niveles altos compara con las notas vecinas a un semitono.",
      "Practicar mejora tu reconocimiento dentro de este ejercicio (opciones cerradas, mismo timbre), y refuerza el oído relativo, sin garantizar que desarrolles oído absoluto. Lo más útil suele ser sesiones cortas y repetidas, con descansos.",
      "Errores comunes: confundir la octava (una nota una octava más aguda «se parece» mucho: fíjate en el registro); asociar cada nota con su timbre en vez de con su altura (aquí siempre suena el mismo timbre sintetizado); y esperar resultados inmediatos. Simplificación: el sonido es un tono electrónico afinado a temperamento igual; con un instrumento real el timbre y la afinación pueden cambiar.",
    ],
    visuales: [
      vTeclado(["Do4", "Fa4", "Sol4", "Do5"], { despuesDePaso: 2, titulo: "Nivel bajo: las opciones más separadas", desde: "Do4", hasta: "Do5", escuchar: true }),
      vFrecuencia(["Do4", "Do♯4"], { despuesDePaso: 2, titulo: "Nivel alto: notas a un semitono", escuchar: true }),
    ],
    quiz: [
      q("¿Qué es el oído relativo?", "Reconocer una altura por su relación con otra o con una referencia", ["Nombrar cualquier nota sin referencia", "Tener un oído más sensible al volumen", "Oír sonidos muy agudos"], "Compara distancias entre notas o contra una referencia."),
      q("¿Qué se puede afirmar con seguridad sobre el oído absoluto?", "Es poco frecuente y no hay consenso sobre cuánto puede desarrollarse de adulto", ["Se consigue con 10 minutos al día", "Lo tienen todos los músicos", "No existe"], "Es una capacidad real pero poco común; su desarrollo en la adultez está en debate."),
      q("En el modo Oído absoluto de la Práctica, ¿qué escuchas?", "Una nota sintetizada, siempre con el mismo timbre", ["Un instrumento distinto cada vez", "Una melodía completa", "El nombre de la nota dicho en voz alta"], "Es un tono electrónico afinado por fórmula (La4 = 440 Hz)."),
      q("¿Qué estrategia ayuda al identificar una nota de oído?", "Decidir primero si es grave o aguda y comparar con una referencia", ["Contar el volumen", "Elegir siempre la primera opción", "Ignorar la octava"], "Registro primero, luego el nombre; una referencia como el La de 440 Hz ayuda."),
      q("¿Qué es lo más difícil en los niveles altos de este modo?", "Distinguir semitonos vecinos, como Do y Do♯", ["Distinguir Do4 de Do5", "Distinguir un piano de una guitarra", "Contar las notas"], "Los sostenidos son notas a un semitono de sus vecinas: la diferencia es mínima."),
    ],
  },
];
