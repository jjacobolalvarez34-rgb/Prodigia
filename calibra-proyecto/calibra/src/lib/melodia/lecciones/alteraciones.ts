import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vPentagrama, vTeclado } from "./ayudas";

// Grupo "alteraciones" (modo de práctica Alteraciones): identificar la nota
// marcada con ♯ o ♭ sobre las siete letras (incluidos Mi♯, Si♯, Fa♭ y Do♭),
// distinguiéndola de la natural, de la alteración contraria y de la nota
// enarmónica (mismo sonido, otra letra). Datos verificados en
// lecciones.test.ts: semitonos por letra, enarmonías y pares Mi-Fa / Si-Do.

export const TECNICAS_ALTERACIONES: TecnicaMelodia[] = [
  {
    slug: "melodia-sostenidos-bemoles",
    grupo: "alteraciones",
    orden: 1,
    requierePro: false,
    nombre: "Sostenidos y bemoles: la misma tecla, dos nombres",
    descripcion:
      "Un sostenido (♯) sube la nota medio tono y un bemol (♭) la baja medio tono. Do♯ y Re♭ son la misma tecla: se llaman distinto según de qué nota vengas, no porque suenen distinto (en un piano).",
    pasos: [
      "♯ (sostenido) = medio tono más arriba que la nota natural. ♭ (bemol) = medio tono más abajo.",
      "Do♯ y Re♭ suenan igual en un piano: es la misma tecla negra. Es un «enarmónico»: dos nombres para la misma altura.",
      "La alteración no mueve la posición en el pentagrama: la nota sigue en la misma línea o espacio, y solo se añade el símbolo a su izquierda.",
      "Simplificación: esta lección usa el afinado del piano (temperamento igual), donde Do♯ y Re♭ son idénticos. En instrumentos que pueden ajustar la afinación, como un violín o la voz, pueden diferir muy poco.",
    ],
    visuales: [
      vPentagrama(["Fa4", "Fa♯4", "Fa♭4"], { despuesDePaso: 2, titulo: "La posición no cambia: solo el símbolo", etiquetas: "nombre" }),
    ],
    quiz: [
      q("¿Qué hace un sostenido (♯) a una nota?", "La sube medio tono", ["La baja medio tono", "La sube un tono completo", "No cambia nada, es decorativo"], "♯ sube medio tono; ♭ baja medio tono: son operaciones opuestas de la misma magnitud."),
      q("Do♯ y Re♭ son...", "La misma altura, con dos nombres distintos", ["Dos alturas distintas, separadas por un semitono", "Notas que no existen en el mismo instrumento", "La misma nota con el mismo nombre"], "Es un enarmónico: mismo sonido en el piano, nombre distinto según de qué nota natural vengas."),
      q("¿Qué le pasa a la posición de una nota en el pentagrama cuando se le agrega una alteración (♯ o ♭)?", "No cambia: sigue en la misma línea o espacio", ["Se mueve una línea hacia arriba", "Se mueve un espacio hacia abajo", "Cambia de clave"], "La alteración solo agrega el símbolo al lado: la posición queda igual."),
    ],
  },
  {
    slug: "melodia-semitonos-mi-fa-si-do",
    grupo: "alteraciones",
    orden: 2,
    requierePro: false,
    nombre: "Mi-Fa y Si-Do: los dos semitonos sin tecla negra",
    descripcion:
      "En el teclado, entre Mi y Fa y entre Si y Do no hay tecla negra: están a un semitono. Por eso Mi♯ suena igual que Fa, Si♯ igual que Do, Fa♭ igual que Mi y Do♭ igual que Si.",
    pasos: [
      "Entre dos teclas blancas vecinas casi siempre hay una negra en medio (son dos semitonos, un tono). Solo en Mi-Fa y en Si-Do no la hay: esas parejas están a un solo semitono.",
      "Consecuencia: si subes Mi medio tono llegas a Fa, así que Mi♯ suena igual que Fa. Y Si♯ suena igual que Do (el Do de la octava siguiente).",
      "Lo mismo hacia abajo: Fa♭ suena igual que Mi, y Do♭ suena igual que Si (el Si de la octava anterior).",
      "En cambio, Do♯, Re♯, Fa♯, Sol♯ y La♯ (y sus bemoles Re♭, Mi♭, Sol♭, La♭ y Si♭) son las cinco teclas negras: ahí sí cambia de tecla.",
    ],
    visuales: [
      vTeclado(["Mi4", "Fa4", "Si4", "Do5"], { despuesDePaso: 0, titulo: "Mi-Fa y Si-Do: un solo semitono", desde: "Do4", hasta: "Do5", nombres: "todas", semitonosNaturales: true }),
    ],
    quiz: [
      q("¿Con qué nota suena igual Mi♯?", "Fa", ["Re", "Fa♯", "Mi♭"], "Entre Mi y Fa no hay tecla negra: subir Mi medio tono da Fa."),
      q("¿Con qué nota suena igual Do♭?", "Si (de la octava anterior)", ["Re♭", "Do♯", "La"], "Entre Si y Do no hay tecla negra: bajar Do medio tono da Si."),
      q("¿Entre cuáles teclas blancas vecinas NO hay tecla negra?", "Mi y Fa, y Si y Do", ["Do y Re, y Fa y Sol", "Re y Mi, y La y Si", "Sol y La, y Do y Re"], "Mi-Fa y Si-Do son los dos semitonos naturales de la escala."),
      q("¿Con qué nota suena igual Si♯?", "Do (de la octava siguiente)", ["La♯", "Si", "Re"], "Subir Si medio tono da Do, ya en la octava siguiente."),
    ],
  },
  {
    slug: "melodia-enarmonia-lee-la-posicion",
    grupo: "alteraciones",
    orden: 3,
    requierePro: false,
    nombre: "Enarmonía: primero la posición, después el símbolo",
    descripcion:
      "Cuando una pregunta te ofrece dos nombres con el mismo sonido (como Do♯ y Re♭), el nombre correcto lo da la posición de la nota en el pentagrama: lee primero la letra y solo después aplica el ♯ o el ♭.",
    pasos: [
      "En un pentagrama, la posición te da la letra. Una nota en la línea de Sol es Sol, con o sin alteración; la alteración solo la modifica.",
      "Por eso el orden de lectura es siempre el mismo: 1) ubica la posición y di la letra; 2) mira el símbolo; 3) júntalos. Una nota en la posición de Do con un ♯ delante es Do♯, nunca Re♭, aunque suenen igual.",
      "En la Práctica, algunas opciones de respuesta son el enarmónico de la correcta: el mismo sonido con otra letra. Son un truco para quien mira el sonido y no la posición; descártalas.",
      "También aparecen la nota natural (sin el símbolo) y la alteración contraria sobre la misma letra: revisa siempre que el símbolo de la opción sea el que ves dibujado.",
    ],
    visuales: [
      vPentagrama(["Do♯4", "Re♭4"], { despuesDePaso: 1, titulo: "Suenan igual, pero se escriben en posiciones distintas", etiquetas: "nombre" }),
      vTeclado(["Do♯4"], { despuesDePaso: 1, titulo: "La misma tecla negra", desde: "Do4", hasta: "Mi4", textos: ["Do♯ = Re♭"] }),
    ],
    quiz: [
      q("Una nota en la posición de Do con un sostenido delante es...", "Do♯", ["Do", "Re♯", "Do♭"], "La posición da la letra (Do); el símbolo la modifica: Do♯. Re♭ suena igual, pero se escribiría en la posición de Re."),
      q("¿Qué debes mirar primero para nombrar una nota alterada en el pentagrama?", "La posición, para saber la letra", ["El símbolo, para saber la alteración", "El color de la nota", "Si tiene plica"], "Primero la letra que da la posición y después el símbolo."),
      q("¿Por qué una opción con el mismo sonido pero otra letra no es la respuesta correcta?", "Porque el nombre lo da la posición dibujada, no solo el sonido", ["Porque suena distinto", "Porque no existe en el piano", "Porque siempre está mal escrita"], "Do♯ y Re♭ suenan igual, pero solo una está escrita en esa posición."),
    ],
  },
];

export const CLASES_ALTERACIONES: ClaseMelodia[] = [
  {
    slug: "melodia-clase-tonos-y-semitonos",
    grupo: "alteraciones",
    orden: 1,
    requierePro: true,
    nombre: "Semitonos y tonos: la unidad de medida de la música",
    descripcion:
      "Qué es un semitono y qué es un tono, cómo se cuentan sobre el teclado, cuáles son los saltos entre las notas naturales y por qué una octava suma 12 semitonos.",
    pasos: [
      "El semitono es la distancia más pequeña de la música occidental: de una tecla del piano a la tecla vecina, sea blanca o negra. Un tono son dos semitonos: de una tecla a la segunda vecina.",
      "Una octava, de un Do al siguiente, tiene 12 semitonos: las 12 teclas (7 blancas y 5 negras) que van de un Do hasta antes del siguiente. Por eso todas las distancias musicales se pueden medir contando teclas.",
      "Entre las notas naturales, casi todas están a un tono: Do-Re, Re-Mi, Fa-Sol, Sol-La y La-Si. Solo dos parejas están a un semitono, porque no tienen tecla negra en medio: Mi-Fa y Si-Do.",
      "Recorriendo Do-Re-Mi-Fa-Sol-La-Si-Do: T, T, S, T, T, T, S (T = tono, S = semitono). Suma 5 tonos y 2 semitonos: 5 × 2 + 2 = 12 semitonos, una octava completa.",
      "Esta secuencia de saltos, T-T-S-T-T-T-S, es la que define la escala mayor. En la clase de escalas se aplica a cualquier nota de partida.",
      "Errores comunes: contar la nota de partida como un semitono (se cuentan los saltos, no las teclas donde empiezas); pensar que un tono es la distancia entre teclas blancas vecinas (Mi-Fa es un semitono, aunque sean blancas vecinas); y creer que el semitono es «media octava» (es un doceavo).",
    ],
    visuales: [
      vTeclado(["Do4", "Re4", "Mi4", "Fa4", "Sol4", "La4", "Si4", "Do5"], { despuesDePaso: 3, titulo: "Tonos (T) y semitonos (S) entre las notas naturales", desde: "Do4", hasta: "Do5", saltos: true, nombres: "resaltadas" }),
    ],
    quiz: [
      q("¿Cuántos semitonos tiene un tono?", "2", ["1", "3", "4"], "Un tono equivale a dos semitonos."),
      q("¿Cuántos semitonos hay en una octava?", "12", ["7", "8", "10"], "Las 12 teclas (7 blancas y 5 negras) de un Do al siguiente."),
      q("¿Entre cuáles notas naturales hay solo un semitono?", "Mi-Fa y Si-Do", ["Do-Re y Fa-Sol", "Re-Mi y La-Si", "Sol-La y Do-Re"], "No hay tecla negra entre Mi y Fa, ni entre Si y Do."),
      q("¿Cuántos tonos y semitonos suman las notas naturales de Do a Do, de una octava?", "5 tonos y 2 semitonos", ["4 tonos y 3 semitonos", "6 tonos y 1 semitono", "7 tonos"], "T, T, S, T, T, T, S: 5 tonos y 2 semitonos suman 12 semitonos."),
      q("¿Cuántos semitonos hay de Mi a Sol?", "3", ["2", "4", "1"], "Mi-Fa es 1 semitono y Fa-Sol es 2 (un tono): 1 + 2 = 3."),
    ],
  },
  {
    slug: "melodia-clase-sostenido-bemol-becuadro",
    grupo: "alteraciones",
    orden: 2,
    requierePro: true,
    nombre: "Sostenido, bemol y becuadro",
    descripcion:
      "Qué hacen las tres alteraciones básicas, cómo se dibujan junto a la nota, y cómo se lee una nota alterada en el pentagrama.",
    pasos: [
      "Las alteraciones modifican la altura de una nota sin cambiarle el nombre de letra. El sostenido (♯) la sube un semitono; el bemol (♭) la baja un semitono; el becuadro (♮) cancela una alteración anterior y devuelve la nota a su forma natural.",
      "En el pentagrama, el símbolo se escribe a la izquierda de la cabeza de la nota, a su misma altura. La nota no se mueve: Fa♯ se escribe en la misma posición que Fa, y Fa♭ también.",
      "En el teclado, los sostenidos y bemoles suelen caer en teclas negras: Do♯ es la negra entre Do y Re, y Re♭ es esa misma tecla vista desde Re. Los casos que no usan tecla negra (Mi♯, Si♯, Fa♭, Do♭) se ven en la clase de enarmonía.",
      "Las siete notas pueden llevar sostenido o bemol: Do♯, Re♯, Mi♯, Fa♯, Sol♯, La♯, Si♯ y Do♭, Re♭, Mi♭, Fa♭, Sol♭, La♭, Si♭. En la Práctica te muestran una de ellas y debes nombrarla con su octava (por ejemplo, Sol♯4).",
      "Regla de partitura: una alteración escrita durante un compás vale para esa nota (en esa posición) hasta la barra de compás, salvo que un becuadro la cancele antes. Las alteraciones de una armadura (las que se escriben al inicio) valen para toda la pieza. En esta clase solo se estudian las que van junto a la nota.",
      "Errores comunes: leer la alteración como si cambiara la letra (Fa♯ sigue siendo una nota Fa modificada); confundir ♯ con ♭ (♯ sube, ♭ baja); y olvidar que existen también el doble sostenido y el doble bemol, que aquí no se estudian.",
    ],
    visuales: [
      vPentagrama(["Sol4", "Sol♯4", "Sol♭4"], { despuesDePaso: 1, titulo: "La misma posición: natural, sostenido y bemol", etiquetas: "nombre" }),
      vTeclado(["Sol4", "Sol♯4", "Sol♭4"], { despuesDePaso: 2, titulo: "Sol, Sol♯ y Sol♭ en el teclado", desde: "Fa4", hasta: "La4", textos: ["Sol", "Sol♯", "Sol♭"] }),
    ],
    quiz: [
      q("¿Qué hace un bemol (♭) a una nota?", "La baja un semitono", ["La sube un semitono", "La baja un tono", "La cancela"], "Un bemol baja la nota medio tono (un semitono)."),
      q("¿Qué función tiene el becuadro (♮)?", "Cancela una alteración anterior y devuelve la nota a su forma natural", ["Sube la nota un tono", "Baja la nota un tono", "Repite la nota"], "El becuadro deja la nota natural, sin sostenido ni bemol."),
      q("¿Dónde se escribe el símbolo de alteración respecto de la nota?", "A la izquierda de la cabeza de la nota", ["A la derecha de la nota", "Encima de la plica", "Debajo del pentagrama"], "La alteración va delante de la nota, a su misma altura."),
      q("¿La posición de Fa♯ en el pentagrama es distinta que la de Fa?", "No: es la misma posición, con el símbolo delante", ["Sí: está un espacio más arriba", "Sí: está una línea más abajo", "Sí: cambia de clave"], "La alteración no mueve la nota: solo cambia su altura real."),
      q("¿Cuál de estas notas alteradas es válida (existe y se puede escribir)?", "Mi♯", ["Ninguna: Mi no admite alteraciones", "Solo Do♯ y Fa♯ existen", "Solo los bemoles existen"], "Las siete notas pueden llevar ♯ o ♭; Mi♯ suena igual que Fa."),
    ],
  },
  {
    slug: "melodia-clase-enarmonia",
    grupo: "alteraciones",
    orden: 3,
    requierePro: true,
    nombre: "Enarmonía: un sonido, dos nombres",
    descripcion:
      "Por qué cada tecla negra tiene dos nombres, cuáles son los cuatro casos en que una nota alterada suena como una tecla blanca (Mi♯, Si♯, Fa♭, Do♭) y cómo evitar la trampa del enarmónico en la Práctica.",
    pasos: [
      "Dos notas son enarmónicas si suenan igual (en el piano, es la misma tecla) pero se escriben con nombres distintos. Cada tecla negra tiene dos nombres: Do♯ o Re♭, Re♯ o Mi♭, Fa♯ o Sol♭, Sol♯ o La♭, La♯ o Si♭.",
      "Cuál de los dos usar depende de la escala y de la letra que necesite la escritura: en Sol mayor aparece Fa♯ (no Sol♭) porque la escala usa una letra por grado. En una nota suelta se puede elegir, y por eso en la Práctica ves tanto sostenidos como bemoles.",
      "También hay enarmonías con teclas blancas, porque Mi-Fa y Si-Do están a un semitono: Mi♯ = Fa, Si♯ = Do (de la octava siguiente), Fa♭ = Mi y Do♭ = Si (de la octava anterior). Son raras en la práctica musical, pero son válidas y la Práctica las usa.",
      "Cómo evitar la trampa: cuando una pregunta te ofrece dos nombres que suenan igual, el correcto es el que corresponde a la posición dibujada. Una nota dibujada en la posición de Mi con ♯ delante es Mi♯, no Fa. Lee primero la letra por la posición.",
      "Simplificación: la equivalencia perfecta vale en el afinado del piano (temperamento igual). En teoría musical las notas enarmónicas se distinguen por su función dentro de la tonalidad, y algunos instrumentos las afinan con matices distintos.",
      "Errores comunes: creer que Do♯ y Re♭ son teclas distintas (en el piano son la misma); contestar por el sonido en vez de por la posición; y olvidar que Si♯ cae en la octava siguiente y Do♭ en la anterior (el número de octava cambia).",
    ],
    visuales: [
      vTeclado(["Do♯4", "Re♯4", "Fa♯4", "Sol♯4", "La♯4"], {
        despuesDePaso: 0,
        titulo: "Cada tecla negra, dos nombres",
        desde: "Do4",
        hasta: "Si4",
        textos: ["Do♯=Re♭", "Re♯=Mi♭", "Fa♯=Sol♭", "Sol♯=La♭", "La♯=Si♭"],
      }),
      vTeclado(["Mi4", "Fa4", "Si4", "Do5"], { despuesDePaso: 2, titulo: "Mi♯ = Fa · Si♯ = Do", desde: "Do4", hasta: "Do5", nombres: "todas", textos: ["Mi=Fa♭", "Fa=Mi♯", "Si=Do♭", "Do=Si♯"] }),
    ],
    quiz: [
      q("¿Cómo se llaman las dos formas de nombrar la tecla negra entre La y Si?", "La♯ y Si♭", ["La♭ y Si♯", "Sol♯ y La♭", "La♯ y Si♯"], "La♯ y Si♭ son enarmónicas."),
      q("¿Con qué nota suena igual Fa♭?", "Mi", ["Fa♯", "Sol♭", "Re♯"], "Fa♭ baja Fa un semitono: es Mi."),
      q("Una nota dibujada en la posición de Mi con ♯ delante es...", "Mi♯", ["Fa", "Fa♯", "Re♯"], "La posición da la letra: Mi♯ (suena igual que Fa, pero se nombra por la posición)."),
      q("¿En qué octava cae Si♯3?", "Suena como Do4, en la octava siguiente", ["Suena como Do3, en la misma octava", "Suena como La♯3", "Suena como Si4"], "Subir Si3 un semitono da Do4."),
      q("¿Por qué Do♯ y Re♭ son la misma tecla del piano?", "Porque entre Do y Re hay una sola tecla negra, un semitono arriba de Do y uno abajo de Re", ["Porque Do y Re son la misma nota", "Porque las dos están una octava aparte", "Porque el bemol y el sostenido no cambian la altura"], "Do♯ sube Do un semitono y Re♭ baja Re un semitono: llegan a la misma tecla."),
    ],
  },
];
