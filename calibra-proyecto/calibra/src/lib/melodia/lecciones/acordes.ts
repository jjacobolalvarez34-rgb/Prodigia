import type { ClaseMelodia, TecnicaMelodia } from "./tipos";
import { q, vAcorde, vPentagramaAcorde, vTeclado } from "./ayudas";

// Grupo "acordes" (modo de práctica Acordes): reconocer el tipo de un acorde
// dibujado a partir de su fundamental. Los 14 tipos que puede preguntar la
// práctica (TipoAcorde): 4 tríadas, 4 séptimas, sus2, sus4, add9 y los
// extendidos de 9, 11 y 13. Los acordes de los visuales salen de
// construirAcorde (practica/melodia.ts) con la fundamental y la grafía
// (sostenidos o bemoles) que dan la ortografía correcta; los tests lo
// comprueban contra una tabla de referencia.

export const TECNICAS_ACORDES: TecnicaMelodia[] = [
  {
    slug: "melodia-triada-fundamental-3-5",
    grupo: "acordes",
    orden: 1,
    requierePro: false,
    nombre: "Cómo se arma cualquier tríada: fundamental, 3.ª y 5.ª",
    descripcion:
      "Una tríada son 3 notas apiladas por terceras: la fundamental, la 3.ª (a 4 semitonos si es mayor, a 3 si es menor) y la 5.ª (a 7 semitonos de la fundamental en la mayoría de los casos). Con cambiar esos números cambia el tipo de tríada.",
    pasos: [
      "Fundamental: la nota base, a 0 semitonos.",
      "3.ª: 4 semitonos arriba (mayor) o 3 semitonos arriba (menor). Esa sola diferencia decide si el acorde suena mayor o menor.",
      "5.ª: 7 semitonos arriba de la fundamental en la mayoría de los casos (6 si es disminuida y 8 si es aumentada).",
      "Con esta fórmula armas cualquier tríada desde cualquier fundamental: no hace falta memorizar 12 tríadas mayores sueltas, es la misma receta 12 veces.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 1, titulo: "Do mayor: 0, 4 y 7 semitonos", escuchar: true }),
      vAcorde({ fundamental: "Do4", tipo: "menor", bemoles: true }, { despuesDePaso: 1, titulo: "Do menor: 0, 3 y 7 semitonos" }),
    ],
    quiz: [
      q("¿Cuántos semitonos hay entre la fundamental y la 3.ª de una tríada MAYOR?", "4", ["3", "7", "6"], "4 semitonos da 3.ª mayor; 3 semitonos daría 3.ª menor."),
      q("¿Cuántos semitonos hay entre la fundamental y la 5.ª de una tríada DISMINUIDA?", "6", ["7", "8", "4"], "7 semitonos es la 5.ª «normal» (justa); 6 es la 5.ª disminuida y 8, la aumentada."),
      q("¿Qué decide si una tríada suena mayor o menor?", "La distancia de la 3.ª respecto de la fundamental (4 o 3 semitonos)", ["La distancia de la 5.ª únicamente", "El instrumento con el que se toque", "El volumen con el que se toque"], "Es el único número que cambia entre la fórmula mayor y la menor (con la 5.ª igual)."),
    ],
  },
  {
    slug: "melodia-de-triada-a-septima",
    grupo: "acordes",
    orden: 2,
    requierePro: false,
    nombre: "De tríada a séptima: una nota más arriba",
    descripcion:
      "Una séptima es una tríada (fundamental, 3.ª, 5.ª) con una 4.ª nota arriba, a 10 u 11 semitonos de la fundamental según el tipo. No es un acorde nuevo desde cero, es la tríada de siempre con un agregado.",
    pasos: [
      "Empiezas con la tríada de siempre (fundamental, 3.ª y 5.ª).",
      "Le sumas una nota más, la 7.ª. Sobre una tríada mayor: a 11 semitonos de la fundamental da la séptima mayor (maj7) y a 10 semitonos, la séptima dominante (7).",
      "Sobre una tríada menor, la 7.ª a 10 semitonos da la séptima menor (m7).",
      "Piénsalo como «tríada + una nota», no como una forma nueva que hay que aprender desde cero.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "maj7" }, { despuesDePaso: 1, titulo: "Do maj7: la 7.ª a 11 semitonos" }),
      vAcorde({ fundamental: "Do4", tipo: "dominante7", bemoles: true }, { despuesDePaso: 1, titulo: "Do 7: la 7.ª a 10 semitonos" }),
    ],
    quiz: [
      q("¿Cuántos semitonos hay entre la fundamental y la 7.ª en un acorde de séptima MAYOR (maj7)?", "11", ["10", "7", "9"], "11 semitonos arriba de la fundamental da la séptima mayor."),
      q("¿Cuántos semitonos hay entre la fundamental y la 7.ª en una séptima dominante (7)?", "10", ["11", "9", "12"], "10 semitonos: la misma distancia que la séptima menor, pero sobre una tríada mayor."),
      q("Según esta técnica, ¿cómo conviene pensar un acorde de séptima?", "Como una tríada de siempre con una nota más arriba", ["Como un acorde totalmente nuevo, sin relación con la tríada", "Como dos tríadas superpuestas", "Como una escala completa"], "Es la idea central: «tríada + una nota», no una forma nueva."),
    ],
  },
  {
    slug: "melodia-cuatro-triadas-por-terceras",
    grupo: "acordes",
    orden: 3,
    requierePro: false,
    nombre: "Las cuatro tríadas: apila terceras de 4 y de 3 semitonos",
    descripcion:
      "Cada tríada es una pila de dos terceras: mayor = 4 + 3, menor = 3 + 4, disminuida = 3 + 3, aumentada = 4 + 4. Mide los dos saltos entre las notas y sabes cuál es.",
    pasos: [
      "Mide dos saltos en semitonos: de la fundamental a la 2.ª nota y de la 2.ª a la 3.ª. Los saltos solo pueden ser 3 (tercera menor) o 4 (tercera mayor).",
      "Mayor = 4 + 3 (0-4-7). Menor = 3 + 4 (0-3-7). Disminuida = 3 + 3 (0-3-6). Aumentada = 4 + 4 (0-4-8).",
      "Si el primer salto es 4, es mayor o aumentada; si es 3, es menor o disminuida. El segundo salto separa el par: mayor 3 (mayor) o 4 (aumentada); menor 4 (menor) o 3 (disminuida).",
      "Cuenta los semitonos sobre el teclado, mentalmente (Do a Mi: Do♯, Re, Re♯, Mi = 4), sin contar la nota de partida.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "disminuido", bemoles: true }, { despuesDePaso: 1, titulo: "Do disminuida: 3 + 3" }),
      vAcorde({ fundamental: "Do4", tipo: "aumentado" }, { despuesDePaso: 1, titulo: "Do aumentada: 4 + 4" }),
    ],
    quiz: [
      q("¿Qué saltos, en semitonos, forman una tríada menor?", "3 + 4", ["4 + 3", "3 + 3", "4 + 4"], "Menor: 3.ª menor abajo y 3.ª mayor arriba (0-3-7)."),
      q("¿Qué tríada tiene saltos de 3 + 3 semitonos?", "Disminuida", ["Menor", "Mayor", "Aumentada"], "Dos terceras menores seguidas: 0-3-6."),
      q("¿Qué saltos forman una tríada aumentada?", "4 + 4", ["4 + 3", "3 + 4", "3 + 3"], "Dos terceras mayores seguidas: 0-4-8."),
      q("Una tríada tiene sus notas a 0, 4 y 7 semitonos de la fundamental. ¿Cuál es?", "Mayor", ["Menor", "Aumentada", "Disminuida"], "4 + 3: es la tríada mayor."),
    ],
  },
  {
    slug: "melodia-suspendidos-y-extendidos",
    grupo: "acordes",
    orden: 4,
    requierePro: false,
    nombre: "Sus, add9 y los de 9, 11 y 13: qué nota cambia o se agrega",
    descripcion:
      "Sus2 y sus4 cambian la 3.ª por una 2.ª o una 4.ª; add9 agrega una 9.ª a la tríada mayor; y los de 9, 11 y 13 son séptima dominante más una, dos o tres terceras más arriba.",
    pasos: [
      "Suspendidos: no tienen 3.ª. Sus2 cambia la 3.ª por la 2.ª (0-2-7) y sus4 por la 4.ª (0-5-7). Sin 3.ª no suenan ni mayores ni menores.",
      "Add9: tríada mayor más la 9.ª, sin la séptima (0-4-7-14). 14 semitonos es la 2.ª pero una octava más arriba.",
      "9, 11 y 13 se construyen sobre la séptima dominante (0-4-7-10) y suman una tercera más cada vez: novena (9.ª, a 14 semitonos), oncena (más la 11.ª, a 17) y trecena (más la 13.ª, a 21).",
      "Para reconocerlos en la Práctica, cuenta las notas y mide desde la fundamental: 3 notas con la 2.ª nota a 2 o a 5 semitonos = sus2 o sus4; 4 notas con una nota a 14 semitonos (y sin 7.ª) = add9; 5, 6 o 7 notas = novena, oncena o trecena.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "sus4" }, { despuesDePaso: 0, titulo: "Do sus4: 0, 5 y 7 semitonos" }),
      vAcorde({ fundamental: "Do4", tipo: "novena", bemoles: true }, { despuesDePaso: 2, titulo: "Do 9: la séptima dominante más la 9.ª" }),
    ],
    quiz: [
      q("¿Qué nota cambia un acorde sus2 respecto de la tríada mayor?", "La 3.ª por la 2.ª", ["La 5.ª por la 6.ª", "La fundamental por la 2.ª", "La 3.ª por la 4.ª"], "Sus2 = 0-2-7: la 3.ª (4 semitonos) pasa a ser la 2.ª (2 semitonos)."),
      q("¿A cuántos semitonos de la fundamental está la 9.ª?", "14", ["9", "12", "10"], "La 9.ª es la 2.ª más una octava: 2 + 12 = 14."),
      q("¿Sobre qué acorde se construyen los de 9, 11 y 13?", "La séptima dominante", ["La tríada menor", "La tríada disminuida", "El acorde de sus4"], "0-4-7-10 más terceras encima: 14, 17 y 21."),
      q("Un acorde de 4 notas: fundamental, 3.ª mayor, 5.ª justa y 9.ª (sin séptima). ¿Cuál es?", "Add9", ["Novena (9)", "Sus2", "Séptima mayor (maj7)"], "Add9 es la tríada mayor con la 9.ª añadida y sin 7.ª."),
    ],
  },
];

export const CLASES_ACORDES: ClaseMelodia[] = [
  {
    slug: "melodia-clase-intervalos-y-terceras",
    grupo: "acordes",
    orden: 1,
    requierePro: true,
    nombre: "Intervalos: medir la distancia entre dos notas",
    descripcion:
      "Qué es un intervalo, cómo se cuenta por semitonos, cuáles son las terceras y quintas que forman los acordes y por qué un acorde es una pila de terceras.",
    pasos: [
      "Un intervalo es la distancia entre dos notas. Se puede medir en semitonos, contando teclas del piano de una a otra sin contar la de partida: de Do a Mi son 4 semitonos (Do♯, Re, Re♯, Mi).",
      "También se nombra por número de letras: de Do a Mi (Do, Re, Mi) es una 3.ª; de Do a Sol, una 5.ª; de Do a Si, una 7.ª. El nombre completo suma la calidad: mayor, menor, justa, aumentada o disminuida.",
      "Las terceras: 3.ª menor = 3 semitonos (Do-Mi♭); 3.ª mayor = 4 semitonos (Do-Mi). Las quintas: 5.ª justa = 7 semitonos (Do-Sol); 5.ª disminuida = 6 (Do-Sol♭); 5.ª aumentada = 8 (Do-Sol♯).",
      "Las séptimas: 7.ª menor = 10 semitonos (Do-Si♭); 7.ª mayor = 11 (Do-Si); 7.ª disminuida = 9 (se escribe con un doble bemol sobre Si y suena como La). Otras distancias que aparecen en los acordes: 2.ª mayor = 2, 4.ª justa = 5, y una octava más arriba, la 9.ª = 14, la 11.ª = 17 y la 13.ª = 21.",
      "Un acorde se arma apilando terceras sobre una nota fundamental: fundamental, 3.ª, 5.ª y, si sigue, 7.ª, 9.ª, 11.ª, 13.ª. En el pentagrama se ve como notas en líneas o espacios consecutivos (una sí, una no).",
      "Errores comunes: contar la nota de partida como un semitono (Do a Mi es 4, no 5); confundir el número con los semitonos (una 3.ª son 3 o 4 semitonos, no 3 siempre); y creer que todos los intervalos de un mismo nombre miden lo mismo (una 3.ª puede ser mayor o menor). Simplificación: se estudian solo los intervalos que usan los acordes.",
    ],
    visuales: [
      vTeclado(["Do4", "Mi4"], { despuesDePaso: 2, titulo: "3.ª mayor: de Do a Mi, 4 semitonos", desde: "Do4", hasta: "Sol4", saltos: true, textos: ["Do", "Mi"] }),
      vTeclado(["Do4", "Mi♭4"], { despuesDePaso: 2, titulo: "3.ª menor: de Do a Mi♭, 3 semitonos", desde: "Do4", hasta: "Sol4", saltos: true, textos: ["Do", "Mi♭"] }),
      vTeclado(["Do4", "Sol4"], { despuesDePaso: 2, titulo: "5.ª justa: de Do a Sol, 7 semitonos", desde: "Do4", hasta: "Sol4", saltos: true, textos: ["Do", "Sol"] }),
    ],
    quiz: [
      q("¿Cuántos semitonos hay entre Do y Mi?", "4", ["3", "5", "2"], "Do♯, Re, Re♯, Mi: 4 semitonos (3.ª mayor)."),
      q("¿Cuántos semitonos mide una 5.ª justa?", "7", ["6", "8", "5"], "Ejemplo: de Do a Sol hay 7 semitonos."),
      q("¿Cuántos semitonos mide una 3.ª menor?", "3", ["4", "2", "5"], "Ejemplo: de Do a Mi♭ hay 3 semitonos."),
      q("¿Cómo se arma un acorde según esta clase?", "Apilando terceras sobre una fundamental", ["Sumando notas al azar", "Tocando una escala completa", "Repitiendo la misma nota en distintas octavas"], "Fundamental, 3.ª, 5.ª, 7.ª..., cada una a una tercera de la anterior."),
      q("¿Cuántos semitonos mide una 7.ª mayor?", "11", ["10", "9", "12"], "De Do a Si son 11 semitonos; a Si♭ serían 10 (7.ª menor)."),
    ],
  },
  {
    slug: "melodia-clase-triadas",
    grupo: "acordes",
    orden: 2,
    requierePro: true,
    nombre: "Las cuatro tríadas: mayor, menor, disminuida y aumentada",
    descripcion:
      "Cómo se forma cada tríada con sus semitonos (0-4-7, 0-3-7, 0-3-6, 0-4-8), cómo reconocerla en el pentagrama y en qué se diferencian.",
    pasos: [
      "Una tríada es un acorde de tres notas: fundamental, 3.ª y 5.ª. Hay cuatro tipos según el tamaño de esas dos terceras.",
      "Mayor: 0-4-7 semitonos (3.ª mayor + 3.ª menor). Menor: 0-3-7 (3.ª menor + 3.ª mayor). Disminuida: 0-3-6 (dos terceras menores). Aumentada: 0-4-8 (dos terceras mayores).",
      "Do mayor: Do-Mi-Sol. Do menor: Do-Mi♭-Sol. Do disminuida: Do-Mi♭-Sol♭. Do aumentada: Do-Mi-Sol♯. Compara con la mayor: la menor baja la 3.ª; la disminuida baja también la 5.ª; la aumentada sube la 5.ª.",
      "En el pentagrama, una tríada escrita en forma normal son tres notas en líneas consecutivas o espacios consecutivos (una sí, una no). Fíjate en las alteraciones: es lo que distingue una tríada de otra, porque las letras son las mismas.",
      "Cómo suenan: la mayor suele describirse como estable y brillante, la menor como más oscura, la disminuida como tensa e inestable y la aumentada como suspendida y ambigua. Son descripciones generales, no reglas exactas.",
      "Errores comunes: confundir la aumentada con la mayor porque tienen la misma 3.ª (el que cambia es la 5.ª); contar mal los semitonos de la 5.ª (7 es justa, 6 disminuida, 8 aumentada); y creer que la tríada menor tiene 5.ª distinta (es igual que la mayor, 7 semitonos). Simplificación: en la Práctica, las alteradas se escriben con sostenidos o bemoles según el ejercicio; aquí se usa la grafía habitual.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "mayor" }, { despuesDePaso: 2, titulo: "Do mayor" }),
      vAcorde({ fundamental: "Do4", tipo: "menor", bemoles: true }, { despuesDePaso: 2, titulo: "Do menor" }),
      vAcorde({ fundamental: "Do4", tipo: "disminuido", bemoles: true }, { despuesDePaso: 2, titulo: "Do disminuida" }),
      vAcorde({ fundamental: "Do4", tipo: "aumentado" }, { despuesDePaso: 2, titulo: "Do aumentada" }),
      vPentagramaAcorde({ fundamental: "Do4", tipo: "menor", bemoles: true }, { despuesDePaso: 3, titulo: "Do menor en el pentagrama", etiquetas: "letra" }),
    ],
    quiz: [
      q("¿Qué semitonos tiene una tríada menor?", "0-3-7", ["0-4-7", "0-3-6", "0-4-8"], "Fundamental, 3.ª menor y 5.ª justa."),
      q("¿Qué tríada tiene la 3.ª mayor y la 5.ª aumentada?", "Aumentada", ["Mayor", "Menor", "Disminuida"], "0-4-8: dos terceras mayores."),
      q("¿Qué notas forman Do disminuida?", "Do-Mi♭-Sol♭", ["Do-Mi-Sol♭", "Do-Mi♭-Sol", "Do-Mi-Sol♯"], "3.ª menor (Mi♭) y 5.ª disminuida (Sol♭): 0-3-6."),
      q("¿Qué diferencia a Do menor de Do mayor?", "La 3.ª es un semitono más baja", ["La 5.ª es un semitono más baja", "La fundamental es distinta", "Tiene una nota más"], "Do-Mi-Sol pasa a Do-Mi♭-Sol: solo baja la 3.ª."),
      q("En el pentagrama, ¿cómo se ve una tríada normal?", "Tres notas en líneas consecutivas o en espacios consecutivos", ["Tres notas en la misma línea", "Tres notas en posiciones vecinas", "Una nota con tres alteraciones"], "Las notas están a una tercera: una posición sí, otra no."),
    ],
  },
  {
    slug: "melodia-clase-septimas",
    grupo: "acordes",
    orden: 3,
    requierePro: true,
    nombre: "Acordes de séptima: maj7, 7, m7 y dim7",
    descripcion:
      "Cómo se forman los cuatro acordes de séptima que evalúa la Práctica, sumando una 7.ª a una tríada: maj7, dominante (7), m7 y disminuida (dim7).",
    pasos: [
      "Un acorde de séptima es una tríada con una cuarta nota, la 7.ª, apilada una tercera más arriba. Tiene cuatro notas: fundamental, 3.ª, 5.ª y 7.ª.",
      "Séptima mayor (maj7): tríada mayor + 7.ª mayor: 0-4-7-11 (Do-Mi-Sol-Si). Séptima dominante (7): tríada mayor + 7.ª menor: 0-4-7-10 (Do-Mi-Sol-Si♭). Séptima menor (m7): tríada menor + 7.ª menor: 0-3-7-10 (Do-Mi♭-Sol-Si♭).",
      "Séptima disminuida (dim7): tríada disminuida + 7.ª disminuida: 0-3-6-9 (Do-Mi♭-Sol♭ y una cuarta nota a 9 semitonos, que suena como La). Está hecha de tres terceras menores seguidas: 3 + 3 + 3.",
      "La 7.ª mayor está a 11 semitonos (un semitono debajo de la octava) y la menor a 10 (un tono debajo). La disminuida, a 9. Fíjate que la dominante 7 y la m7 comparten la misma 7.ª (10); lo que las diferencia es la 3.ª (4 o 3).",
      "Para reconocer el acorde en la Práctica, mide la 3.ª (4 = mayor, 3 = menor) y la 7.ª (11 = mayor, 10 = menor, 9 = disminuida): 3.ª mayor y 7.ª 11 = maj7; 3.ª mayor y 7.ª 10 = 7; 3.ª menor y 7.ª 10 = m7; 3.ª menor, 5.ª 6 y 7.ª 9 = dim7.",
      "Errores comunes: confundir maj7 (11 semitonos) con la dominante 7 (10); contar la 7.ª como 7 semitonos (es el número de la letra, no de semitonos); y creer que la 7 sin apellido es la mayor (7 es la dominante). Simplificación: la 7.ª de dim7 se escribe en teoría como Si con doble bemol, que suena como La; la Práctica y esta clase la muestran como La.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "maj7" }, { despuesDePaso: 1, titulo: "Do maj7" }),
      vAcorde({ fundamental: "Do4", tipo: "dominante7", bemoles: true }, { despuesDePaso: 1, titulo: "Do 7 (dominante)" }),
      vAcorde({ fundamental: "Do4", tipo: "menor7", bemoles: true }, { despuesDePaso: 1, titulo: "Do m7" }),
      vAcorde({ fundamental: "Do4", tipo: "disminuido7", bemoles: true }, { despuesDePaso: 2, titulo: "Do dim7: tres terceras menores" }),
    ],
    quiz: [
      q("¿Qué semitonos tiene un acorde de séptima dominante (7)?", "0-4-7-10", ["0-4-7-11", "0-3-7-10", "0-3-6-9"], "Tríada mayor con 7.ª menor."),
      q("¿Qué semitonos tiene un acorde de séptima mayor (maj7)?", "0-4-7-11", ["0-4-7-10", "0-3-7-11", "0-3-7-10"], "Tríada mayor con 7.ª mayor (11 semitonos)."),
      q("¿Qué acorde tiene 3.ª menor, 5.ª justa y 7.ª a 10 semitonos?", "Séptima menor (m7)", ["Séptima dominante (7)", "Séptima mayor (maj7)", "Séptima disminuida (dim7)"], "0-3-7-10: m7."),
      q("¿Qué forma tiene un acorde dim7 en semitonos?", "0-3-6-9", ["0-3-7-10", "0-4-7-10", "0-4-8-11"], "Tres terceras menores seguidas: 3 + 3 + 3."),
      q("¿Qué diferencia a Do maj7 de Do 7?", "La 7.ª: 11 semitonos frente a 10", ["La 3.ª: 3 frente a 4", "La 5.ª: 6 frente a 7", "La fundamental"], "Ambas tienen 3.ª mayor y 5.ª justa; cambia la séptima."),
    ],
  },
  {
    slug: "melodia-clase-suspendidos-y-extendidos",
    grupo: "acordes",
    orden: 4,
    requierePro: true,
    nombre: "Acordes suspendidos, add9 y extendidos (9, 11 y 13)",
    descripcion:
      "Los acordes que aparecen en los niveles altos de la Práctica: sus2, sus4, add9 y los extendidos de novena, oncena y trecena, con sus semitonos y cómo reconocerlos.",
    pasos: [
      "Suspendidos: sustituyen la 3.ª por otra nota, así que no suenan mayores ni menores. Sus2: 0-2-7 (Do-Re-Sol), con la 2.ª en lugar de la 3.ª. Sus4: 0-5-7 (Do-Fa-Sol), con la 4.ª en lugar de la 3.ª.",
      "Add9: la tríada mayor más la 9.ª, sin séptima: 0-4-7-14 (Do-Mi-Sol-Re, con el Re una octava más arriba). La 9.ª es la 2.ª subida una octava: 2 + 12 = 14 semitonos.",
      "Extendidos: se apilan terceras sobre la séptima dominante (0-4-7-10). Novena (9): más la 9.ª, a 14 semitonos: 0-4-7-10-14 (5 notas). Oncena (11): más la 11.ª, a 17: 0-4-7-10-14-17 (6 notas). Trecena (13): más la 13.ª, a 21: 0-4-7-10-14-17-21 (7 notas).",
      "Números de las notas añadidas: 9.ª = 2.ª más una octava; 11.ª = 4.ª más una octava (5 + 12 = 17); 13.ª = 6.ª más una octava (9 + 12 = 21). Por eso son las notas «de arriba» del acorde.",
      "Cómo reconocerlos: primero cuenta las notas (3: tríada o suspendido; 4: séptima o add9; 5, 6 o 7: novena, oncena o trecena). Con 3 notas, mide la 2.ª nota desde la fundamental: a 2 semitonos es sus2, a 5 es sus4 y a 3 o 4 es una tríada con 3.ª. Con 4 notas, el add9 es el que tiene una nota a 14 semitonos y ninguna a 9, 10 u 11.",
      "Errores comunes: confundir add9 con novena (la novena incluye la 7.ª, a 10 semitonos; add9 no); creer que sus2 y sus4 son menores o mayores (no tienen 3.ª); y no distinguir oncena de trecena (cuenta las notas: 6 y 7). Simplificación: en la música real, los acordes de 11 y 13 suelen omitir alguna nota (por ejemplo la 3.ª o la 5.ª); aquí se muestran completos, apilados por terceras, como los usa la Práctica.",
    ],
    visuales: [
      vAcorde({ fundamental: "Do4", tipo: "sus2" }, { despuesDePaso: 0, titulo: "Do sus2" }),
      vAcorde({ fundamental: "Do4", tipo: "sus4" }, { despuesDePaso: 0, titulo: "Do sus4" }),
      vAcorde({ fundamental: "Do4", tipo: "add9" }, { despuesDePaso: 1, titulo: "Do add9" }),
      vAcorde({ fundamental: "Do4", tipo: "novena", bemoles: true }, { despuesDePaso: 2, titulo: "Do 9" }),
      vAcorde({ fundamental: "Do4", tipo: "oncena", bemoles: true }, { despuesDePaso: 2, titulo: "Do 11" }),
      vAcorde({ fundamental: "Do4", tipo: "trecena", bemoles: true }, { despuesDePaso: 2, titulo: "Do 13" }),
      vPentagramaAcorde({ fundamental: "Do4", tipo: "novena", bemoles: true }, { despuesDePaso: 3, titulo: "Do 9 en el pentagrama", etiquetas: "letra" }),
    ],
    quiz: [
      q("¿Qué semitonos tiene un acorde sus4?", "0-5-7", ["0-2-7", "0-4-7", "0-3-7"], "La 4.ª (5 semitonos) sustituye a la 3.ª."),
      q("¿En qué se diferencia una novena (9) de un add9?", "La novena incluye la 7.ª menor; el add9 no", ["El add9 tiene la 3.ª menor", "La novena no tiene 5.ª", "No se diferencian"], "Novena: 0-4-7-10-14. Add9: 0-4-7-14."),
      q("¿A cuántos semitonos de la fundamental está la 13.ª?", "21", ["14", "17", "13"], "9 (la 6.ª) + 12 = 21."),
      q("Un acorde tiene 6 notas apiladas por terceras sobre la séptima dominante. ¿Cuál es?", "Oncena (11)", ["Novena (9)", "Trecena (13)", "Add9"], "Novena tiene 5 notas, oncena 6 y trecena 7."),
      q("¿Por qué sus2 y sus4 no suenan ni mayores ni menores?", "Porque no tienen 3.ª", ["Porque no tienen 5.ª", "Porque tienen una 7.ª", "Porque están en otra octava"], "La 3.ª define mayor o menor; en los suspendidos la reemplaza otra nota."),
    ],
  },
];
