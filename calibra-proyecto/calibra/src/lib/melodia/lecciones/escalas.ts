import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vEscala, vPentagramaEscala } from "./ayudas";

// Grupo "escalas" (modo de práctica Escalas): reconocer, a partir de la
// secuencia dibujada y su nota de partida, si es una escala Mayor, Menor
// natural, Pentatónica mayor o Pentatónica menor. Las escalas de los visuales
// salen de construirEscala (practica/melodia.ts) con la fundamental y la
// grafía (sostenidos o bemoles) que dan la ortografía correcta; los tests lo
// comprueban contra una tabla de referencia.

export const TECNICAS_ESCALAS: TecnicaMelodia[] = [
  {
    slug: "melodia-formula-escala-mayor",
    grupo: "escalas",
    orden: 1,
    requierePro: false,
    nombre: "La escala mayor: T-T-S-T-T-T-S desde cualquier nota",
    descripcion:
      "Toda escala mayor sigue la misma receta de saltos: tono, tono, semitono, tono, tono, tono, semitono. Aplica esa fórmula desde la nota que quieras y obtienes su escala mayor.",
    pasos: [
      "La fórmula de la escala mayor es T-T-S-T-T-T-S (T = tono, 2 semitonos; S = semitono, 1). Suma 12 semitonos: llega a la octava.",
      "En Do mayor la fórmula cae justo sobre las teclas blancas: Do-Re-Mi-Fa-Sol-La-Si-Do. Los semitonos están donde no hay tecla negra: entre Mi-Fa (3.º-4.º grado) y Si-Do (7.º-8.º).",
      "Desde otra nota, la misma fórmula usa teclas negras. Sol mayor: Sol, La, Si, Do, Re, Mi, Fa♯, Sol. El Fa♯ aparece porque el 7.º grado tiene que quedar a un semitono de la octava.",
      "Simplificación: en la Práctica, las notas alteradas se escriben siempre con sostenidos o siempre con bemoles según el ejercicio. En una partitura real cada grado usa una letra distinta (Fa mayor lleva Si♭, no La♯); el sonido es el mismo.",
    ],
    visuales: [
      vEscala({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 1, titulo: "Do mayor: T-T-S-T-T-T-S", escuchar: true }),
      vEscala({ fundamental: "Sol4", tipo: "mayor" }, { despuesDePaso: 2, titulo: "Sol mayor: el 7.º grado es Fa♯" }),
    ],
    quiz: [
      q("¿Cuál es la fórmula de la escala mayor?", "T-T-S-T-T-T-S", ["T-S-T-T-S-T-T", "T-T-T-S-T-T-S", "S-T-T-S-T-T-T"], "Tono, tono, semitono, tono, tono, tono, semitono."),
      q("En la escala mayor, ¿entre qué grados hay un semitono?", "Entre el 3.º y el 4.º, y entre el 7.º y el 8.º", ["Entre el 1.º y el 2.º, y entre el 5.º y el 6.º", "Entre el 2.º y el 3.º, y entre el 6.º y el 7.º", "Entre el 4.º y el 5.º únicamente"], "La fórmula T-T-S-T-T-T-S pone los semitonos en el 3.º-4.º y el 7.º-8.º."),
      q("¿Cuál es la 7.ª nota de la escala de Sol mayor?", "Fa♯", ["Fa", "Sol", "Mi♯"], "Sol-La-Si-Do-Re-Mi y el 7.º grado a un semitono de Sol: Fa♯."),
      q("¿Cuántos semitonos suma toda la escala mayor, de la nota de partida a su octava?", "12", ["7", "10", "14"], "5 tonos y 2 semitonos: 10 + 2 = 12."),
    ],
  },
  {
    slug: "melodia-menor-natural-desde-la-mayor",
    grupo: "escalas",
    orden: 2,
    requierePro: false,
    nombre: "Menor natural: la escala mayor empezada en su 6.º grado",
    descripcion:
      "La escala menor natural usa las mismas notas que una mayor, pero empezando en el 6.º grado: La menor son las notas de Do mayor tocadas desde La. Su fórmula es T-S-T-T-S-T-T.",
    pasos: [
      "La escala menor natural sigue la fórmula T-S-T-T-S-T-T (2, 1, 2, 2, 1, 2, 2 semitonos).",
      "Atajo: cada escala mayor tiene una menor «relativa» con las mismas notas, que empieza en su 6.º grado. En Do mayor el 6.º grado es La: La menor son las notas de Do mayor tocadas de La a La.",
      "Ejemplos: La menor = La-Si-Do-Re-Mi-Fa-Sol; Mi menor = Mi-Fa♯-Sol-La-Si-Do-Re, que son las de Sol mayor empezando en su 6.º grado (Mi).",
      "Comparada con la mayor de la misma nota de partida, la menor natural tiene el 3.º, el 6.º y el 7.º grado más bajos (medio tono). Simplificación: hay otras escalas menores (armónica y melódica) que no se ven aquí.",
    ],
    visuales: [
      vEscala({ fundamental: "La3", tipo: "menor_natural" }, { despuesDePaso: 1, titulo: "La menor natural: las notas de Do mayor desde La", escuchar: true }),
    ],
    quiz: [
      q("¿Cuál es la fórmula de la escala menor natural?", "T-S-T-T-S-T-T", ["T-T-S-T-T-T-S", "T-T-S-T-T-S-T", "S-T-T-S-T-T-T"], "Tono, semitono, tono, tono, semitono, tono, tono."),
      q("¿Con qué escala mayor comparte sus notas La menor?", "Do mayor", ["Sol mayor", "La mayor", "Fa mayor"], "La es el 6.º grado de Do mayor: La menor usa sus mismas notas."),
      q("¿En qué grado de una escala mayor empieza su menor relativa?", "En el 6.º grado", ["En el 2.º grado", "En el 4.º grado", "En el 7.º grado"], "La menor natural es la mayor tocada desde su 6.º grado (La en Do mayor)."),
      q("¿Cuál es la 2.ª nota de La menor natural?", "Si", ["Do", "Si♭", "La♯"], "La menor natural: La-Si-Do-Re-Mi-Fa-Sol."),
    ],
  },
  {
    slug: "melodia-reconocer-escala-por-el-primer-salto",
    grupo: "escalas",
    orden: 3,
    requierePro: false,
    nombre: "Reconoce la escala: cuenta las notas y mira el primer salto",
    descripcion:
      "Para reconocer una escala escrita en la Práctica, cuenta las notas (8 son mayor o menor natural; 6 son pentatónica) y mide un salto: la 3.ª nota a 4 semitonos de la primera es mayor; a 3, menor.",
    pasos: [
      "Cuenta las notas dibujadas (la última repite la primera, una octava arriba). Con 8 es una escala de siete sonidos: mayor o menor natural. Con 6 es una pentatónica (cinco sonidos).",
      "Si son 8: mide de la 1.ª a la 3.ª nota. 4 semitonos (3.ª mayor) es una escala mayor; 3 semitonos (3.ª menor) es una menor natural.",
      "Si son 6: mira el primer salto. Si es de un tono (2 semitonos) es una pentatónica mayor; si es de tono y medio (3 semitonos) es una pentatónica menor.",
      "Mide contando teclas del piano: de Do a Mi son 4 semitonos (Do, Do♯, Re, Re♯, Mi); de Do a Mi♭ son 3. La nota de partida siempre viene en el enunciado.",
    ],
    visuales: [
      vPentagramaEscala({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 1, titulo: "8 notas, 3.ª a 4 semitonos: mayor", etiquetas: "letra" }),
      vPentagramaEscala({ fundamental: "Do4", tipo: "pentatonica_menor", bemoles: true }, { despuesDePaso: 2, titulo: "6 notas, primer salto de 3 semitonos: pentatónica menor", etiquetas: "letra" }),
    ],
    quiz: [
      q("Una escala dibujada tiene 6 notas (la última repite la primera). ¿Qué tipo es?", "Pentatónica", ["Mayor", "Menor natural", "Cromática"], "5 sonidos más la octava son 6 notas dibujadas: pentatónica."),
      q("Una secuencia de 8 notas parte de Do y la 3.ª nota está a 4 semitonos de Do. ¿Qué escala es?", "Mayor", ["Menor natural", "Pentatónica mayor", "Pentatónica menor"], "Con 8 notas y 3.ª mayor (4 semitonos), es una escala mayor."),
      q("Una secuencia de 8 notas parte de La y la 3.ª nota está a 3 semitonos de La. ¿Qué escala es?", "Menor natural", ["Mayor", "Pentatónica menor", "Pentatónica mayor"], "3.ª menor (3 semitonos) con 8 notas: menor natural."),
      q("En una pentatónica, el primer salto es de tono y medio (3 semitonos). ¿Cuál es?", "Pentatónica menor", ["Pentatónica mayor", "Mayor", "Menor natural"], "La pentatónica menor empieza con un salto de 3 semitonos."),
    ],
  },
];

export const CLASES_ESCALAS: ClaseMelodia[] = [
  {
    slug: "melodia-clase-escala-mayor",
    grupo: "escalas",
    orden: 1,
    requierePro: true,
    nombre: "La escala mayor",
    descripcion:
      "Qué es una escala, sus grados y su fórmula de tonos y semitonos, y cómo construir la escala mayor desde Do, Sol o Fa.",
    pasos: [
      "Una escala es una serie de notas ordenadas por altura dentro de una octava, con una distribución fija de tonos y semitonos. La primera nota (la tónica) le da el nombre, y cada nota tiene un grado: 1.º, 2.º... 7.º y el 8.º, que repite la tónica una octava arriba.",
      "Recuerda: un tono son 2 semitonos y un semitono es la distancia entre teclas vecinas (blancas o negras). La escala mayor sigue siempre la fórmula T-T-S-T-T-T-S, es decir, 2-2-1-2-2-2-1 semitonos, que suma 12 (una octava).",
      "Do mayor cae sobre las teclas blancas: Do-Re-Mi-Fa-Sol-La-Si-Do. Los semitonos están en Mi-Fa y Si-Do.",
      "Sol mayor: Sol-La-Si-Do-Re-Mi-Fa♯-Sol. Hace falta el Fa♯ (una tecla negra) para que entre el 6.º y el 7.º haya un tono, y del 7.º a la octava, un semitono.",
      "Fa mayor: Fa-Sol-La-Si♭-Do-Re-Mi-Fa. Aquí hace falta el Si♭ para que entre el 3.º y el 4.º haya un semitono (La-Si♭).",
      "Errores comunes: contar mal los semitonos (se cuentan los saltos, no las teclas); olvidar las teclas negras; y creer que hay una sola grafía posible. Simplificación: en la Práctica, Fa mayor puede aparecer escrita con La♯ en lugar de Si♭ porque las alteradas se escriben siempre con sostenidos o siempre con bemoles; suena igual. En una partitura se usa una letra por grado.",
    ],
    visuales: [
      vEscala({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 2, titulo: "Do mayor", escuchar: true }),
      vEscala({ fundamental: "Sol4", tipo: "mayor" }, { despuesDePaso: 3, titulo: "Sol mayor" }),
      vEscala({ fundamental: "Fa4", tipo: "mayor", bemoles: true }, { despuesDePaso: 4, titulo: "Fa mayor" }),
      vPentagramaEscala({ fundamental: "Sol4", tipo: "mayor" }, { despuesDePaso: 3, titulo: "Sol mayor en el pentagrama", etiquetas: "letra" }),
    ],
    quiz: [
      q("¿Cuántos semitonos hay en total en la escala mayor, de la tónica a su octava?", "12", ["7", "10", "14"], "2+2+1+2+2+2+1 = 12."),
      q("¿Qué fórmula de semitonos tiene la escala mayor?", "2-2-1-2-2-2-1", ["2-1-2-2-1-2-2", "2-2-3-2-3", "1-2-2-1-2-2-2"], "Es la fórmula T-T-S-T-T-T-S."),
      q("¿Cuál es la escala de Sol mayor?", "Sol-La-Si-Do-Re-Mi-Fa♯-Sol", ["Sol-La-Si-Do-Re-Mi-Fa-Sol", "Sol-La♭-Si♭-Do-Re-Mi♭-Fa-Sol", "Sol-La-Si♭-Do-Re-Mi-Fa♯-Sol"], "Necesita Fa♯ para que el 7.º grado quede a un semitono de la octava."),
      q("¿Cuál es el 4.º grado de Fa mayor?", "Si♭", ["Si", "La", "Do"], "Fa-Sol-La-Si♭: entre La y Si♭ hay un semitono, como manda la fórmula."),
      q("¿Dónde están los semitonos de Do mayor?", "Entre Mi-Fa y entre Si-Do", ["Entre Do-Re y Re-Mi", "Entre Fa-Sol y Sol-La", "Entre La-Si y Si-Do únicamente"], "No hay tecla negra entre Mi y Fa, ni entre Si y Do."),
    ],
  },
  {
    slug: "melodia-clase-escala-menor-natural",
    grupo: "escalas",
    orden: 2,
    requierePro: true,
    nombre: "La escala menor natural y las escalas relativas",
    descripcion:
      "La fórmula de la escala menor natural, su relación con la mayor (relativas) y cómo construirla desde La, Mi o Re.",
    pasos: [
      "La escala menor natural tiene la fórmula T-S-T-T-S-T-T, es decir, 2-1-2-2-1-2-2 semitonos (suma 12). Sus dos semitonos caen entre el 2.º y el 3.º grado, y entre el 5.º y el 6.º.",
      "Comparada con la mayor de la misma tónica, la menor natural tiene tres notas más bajas: el 3.º, el 6.º y el 7.º grado. Ese 3.º grado más bajo (3 semitonos sobre la tónica, en lugar de 4) es lo que da el carácter «menor».",
      "Relativas: cada mayor tiene una menor con sus mismas notas, que empieza en el 6.º grado de la mayor. La menor natural son las notas de esa mayor empezadas en su 6.º grado; La menor y Do mayor comparten todas sus notas.",
      "La menor: La-Si-Do-Re-Mi-Fa-Sol-La (solo teclas blancas). Mi menor: Mi-Fa♯-Sol-La-Si-Do-Re-Mi (mismas notas que Sol mayor). Re menor: Re-Mi-Fa-Sol-La-Si♭-Do-Re (mismas que Fa mayor).",
      "Errores comunes: creer que menor es simplemente «mayor con bemoles en todo» (solo bajan el 3.º, 6.º y 7.º); confundir una escala con su relativa (comparten notas, pero tienen distinta tónica); y olvidar que hay otras variantes menores. Simplificación: aquí se estudia solo la menor natural, no la armónica ni la melódica.",
    ],
    visuales: [
      vEscala({ fundamental: "La3", tipo: "menor_natural" }, { despuesDePaso: 3, titulo: "La menor natural", escuchar: true }),
      vEscala({ fundamental: "Mi4", tipo: "menor_natural" }, { despuesDePaso: 3, titulo: "Mi menor natural" }),
      vEscala({ fundamental: "Re4", tipo: "menor_natural", bemoles: true }, { despuesDePaso: 3, titulo: "Re menor natural" }),
    ],
    quiz: [
      q("¿Qué fórmula de semitonos tiene la escala menor natural?", "2-1-2-2-1-2-2", ["2-2-1-2-2-2-1", "3-2-2-3-2", "2-2-3-2-3"], "T-S-T-T-S-T-T."),
      q("¿Qué grados son más bajos en una menor natural que en la mayor de la misma tónica?", "El 3.º, el 6.º y el 7.º", ["El 2.º, el 4.º y el 5.º", "Solo el 3.º", "El 1.º y el 8.º"], "Son las tres notas que bajan medio tono."),
      q("¿Con qué escala mayor comparte notas Mi menor?", "Sol mayor", ["Mi mayor", "Re mayor", "Do mayor"], "Mi es el 6.º grado de Sol mayor."),
      q("¿Cuál es la 3.ª nota de La menor natural?", "Do", ["Do♯", "Si", "Re"], "La-Si-Do: de La a Do hay 3 semitonos (3.ª menor)."),
      q("¿Qué es la escala relativa de una escala mayor?", "La menor que empieza en su 6.º grado y usa las mismas notas", ["Una escala mayor a una octava de distancia", "La misma escala tocada al revés", "Una escala con todas las notas alteradas"], "Ejemplo: La menor es la relativa de Do mayor."),
    ],
  },
  {
    slug: "melodia-clase-pentatonicas",
    grupo: "escalas",
    orden: 3,
    requierePro: true,
    nombre: "Las escalas pentatónicas mayor y menor",
    descripcion:
      "Escalas de cinco notas: sus fórmulas, cómo salen de la mayor y de la menor natural quitando dos grados, y cómo reconocerlas.",
    pasos: [
      "«Pentatónica» significa «cinco sonidos». Son escalas de cinco notas por octava, sin los grados que crean semitonos dentro de la escala, por eso suenan muy «abiertas» y se usan en muchas músicas del mundo.",
      "Pentatónica mayor: fórmula 2-2-3-2-3 semitonos (T-T-1½-T-1½). Sale de la escala mayor quitando el 4.º y el 7.º grado. Do pentatónica mayor: Do-Re-Mi-Sol-La (se quitan Fa y Si).",
      "Pentatónica menor: fórmula 3-2-2-3-2 semitonos. Sale de la menor natural quitando el 2.º y el 6.º grado. La pentatónica menor: La-Do-Re-Mi-Sol (se quitan Si y Fa).",
      "Las dos son relativas, como la mayor y la menor: La pentatónica menor tiene las mismas cinco notas que Do pentatónica mayor.",
      "Cómo reconocerlas en la Práctica: dibujadas son 6 notas (con la octava). Si el primer salto es de un tono, es pentatónica mayor; si es de tono y medio (3 semitonos), pentatónica menor. Los saltos de 3 semitonos son los que la distinguen de la mayor y de la menor natural.",
      "Errores comunes: contar la octava como si fuera una sexta nota distinta (repite la primera); confundir la pentatónica menor con la menor natural (la pentatónica tiene solo cinco notas); y suponer que su fórmula suma menos de una octava (2+2+3+2+3 = 12 y 3+2+2+3+2 = 12).",
    ],
    visuales: [
      vEscala({ fundamental: "Do4", tipo: "pentatonica_mayor" }, { despuesDePaso: 1, titulo: "Do pentatónica mayor", escuchar: true }),
      vEscala({ fundamental: "La3", tipo: "pentatonica_menor" }, { despuesDePaso: 2, titulo: "La pentatónica menor" }),
    ],
    quiz: [
      q("¿Cuántas notas distintas tiene una escala pentatónica dentro de una octava?", "5", ["4", "6", "7"], "«Penta» significa cinco."),
      q("¿Qué fórmula de semitonos tiene la pentatónica mayor?", "2-2-3-2-3", ["3-2-2-3-2", "2-2-1-2-2-2-1", "2-1-2-2-1-2-2"], "Tono, tono, tono y medio, tono, tono y medio."),
      q("¿Qué grados se quitan de la escala mayor para obtener la pentatónica mayor?", "El 4.º y el 7.º", ["El 2.º y el 6.º", "El 3.º y el 7.º", "El 1.º y el 5.º"], "En Do mayor se quitan Fa y Si: quedan Do-Re-Mi-Sol-La."),
      q("¿Cuál es la pentatónica menor de La?", "La-Do-Re-Mi-Sol", ["La-Si-Do♯-Mi-Fa♯", "La-Si-Do-Re-Mi", "La-Do-Re♯-Mi-Sol"], "Sale de La menor natural quitando el 2.º (Si) y el 6.º (Fa)."),
      q("Una secuencia parte de Do, tiene 6 notas y su primer salto es de 3 semitonos. ¿Qué escala es?", "Pentatónica menor", ["Pentatónica mayor", "Menor natural", "Mayor"], "El salto inicial de tono y medio es la firma de la pentatónica menor."),
    ],
  },
];
