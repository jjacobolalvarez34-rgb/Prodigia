-- ============================================================
-- Prodigia — Melodía: Técnicas | Clases completas (docs/PARIDAD_MUNDOS.md
-- filas 22 y 23). Antes Melodía tenía 5 Técnicas (0089_mundo_melodia.sql,
-- con quiz en 0174) y 0 Clases; la práctica evalúa figuras y cifrado,
-- lectura en pentagrama, alteraciones, escalas, 14 tipos de acordes y oído,
-- y Aprender no cubría casi nada de eso.
--
-- 18 Técnicas (requiere_pro=false): 5 históricas REESCRITAS por slug con UPDATE (corrige el
-- voseo de 0089 y errores de contenido, ver docs/PARIDAD_MUNDOS.md
-- "Melodía: Técnicas | Clases") y 13 INSERT nuevas. Por grupo (modo de
-- práctica): fundamentos 3, lectura 3, alteraciones 3, escalas 3, acordes 4, oido_absoluto 2.
--
-- 18 Clases nuevas (requiere_pro=true): fundamentos 3, lectura 3, alteraciones 3, escalas 3, acordes 4, oido_absoluto 2. Cada grupo
-- es un curso independiente (orden de dependencia DENTRO del grupo); la
-- primera Clase de todas (el sonido y la nota) es preview gratis. Ver
-- src/lib/melodia/path.ts.
--
-- 6 primitivos de visual nuevos (src/components/melodia/visuales/):
-- "melodia.pentagrama", "melodia.teclado", "melodia.escala",
-- "melodia.acorde", "melodia.ritmo" y "melodia.frecuencia". Las escalas, los
-- acordes y las frecuencias NO se guardan tipeadas: se guardan sus
-- parámetros (fundamental, tipo) y el componente llama a las mismas
-- funciones puras que la práctica. Cada Técnica y Clase trae al menos un
-- visual y un quiz con `explicacion` y la `respuesta` literal dentro de
-- `opciones`.
--
-- Orden de las sentencias: primero los UPDATE de las filas existentes,
-- después los INSERT — un slug nuevo nunca pisa uno existente
-- (unique (problem_type, slug)) y las columnas requiere_pro/orden ya
-- existen (0170). No se tocan technique_progress: quien ya dominó una
-- técnica histórica la sigue teniendo dominada.
--
-- Este archivo se GENERA desde src/lib/melodia/lecciones/ (fuente única)
-- y lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: MELODIA_ESCRIBIR_SQL=1 npx vitest run src/lib/melodia/lecciones
-- ============================================================

update public.techniques
set nombre = 'Lee el pentagrama por posición, no nota por nota',
  descripcion = 'El pentagrama tiene 5 líneas y 4 espacios (se cuentan de abajo hacia arriba). En clave de sol, cada línea y cada espacio es siempre la misma nota: memoriza la posición, no cada nota suelta.',
  contenido = $melodia${
  "pasos": [
    "Las 5 líneas, de abajo hacia arriba, son: Mi, Sol, Si, Re, Fa.",
    "Los 4 espacios, de abajo hacia arriba, son: Fa, La, Do, Mi.",
    "Una vez que sabes esas 9 posiciones fijas, cualquier nota dentro del pentagrama es una de ellas: no hay que adivinar de nuevo cada vez.",
    "Las notas que quedan por encima o por debajo de las 5 líneas usan líneas adicionales cortas (ledger lines): siguen la misma lógica, solo que fuera del pentagrama."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 0,
      "titulo": "Las 5 líneas, de abajo hacia arriba",
      "etiquetas": "letra",
      "notas": [
        "Mi4",
        "Sol4",
        "Si4",
        "Re5",
        "Fa5"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "Los 4 espacios, de abajo hacia arriba",
      "etiquetas": "letra",
      "notas": [
        "Fa4",
        "La4",
        "Do5",
        "Mi5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En clave de sol, ¿qué nota es la 3.ª línea del pentagrama (la del medio), contando desde abajo?",
      "opciones": [
        "Sol",
        "Re",
        "Si",
        "Fa"
      ],
      "respuesta": "Si",
      "explicacion": "Las 5 líneas de abajo hacia arriba son Mi-Sol-Si-Re-Fa: la del medio es la 3.ª, Si."
    },
    {
      "pregunta": "¿Cuál es la nota del espacio más bajo del pentagrama, en clave de sol?",
      "opciones": [
        "Fa",
        "Mi",
        "La",
        "Do"
      ],
      "respuesta": "Fa",
      "explicacion": "Los 4 espacios de abajo hacia arriba son Fa-La-Do-Mi: el más bajo es Fa."
    },
    {
      "pregunta": "¿Qué son las «líneas adicionales» (ledger lines)?",
      "opciones": [
        "Un tipo de alteración musical",
        "Las líneas que separan los compases",
        "Líneas que solo existen en clave de fa",
        "Líneas cortas que extienden el pentagrama para notas más agudas o más graves"
      ],
      "respuesta": "Líneas cortas que extienden el pentagrama para notas más agudas o más graves",
      "explicacion": "Siguen la misma lógica de línea y espacio, solo que fuera de las cinco líneas."
    },
    {
      "pregunta": "¿Qué nota está en la 5.ª línea, la de arriba, en clave de sol?",
      "opciones": [
        "Mi",
        "Re",
        "Fa",
        "Sol"
      ],
      "respuesta": "Fa",
      "explicacion": "La quinta línea de Mi-Sol-Si-Re-Fa es Fa."
    }
  ]
}$melodia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'melodia' and slug = 'melodia-lineas-y-espacios';

update public.techniques
set nombre = 'Un truco para no olvidar las 9 posiciones',
  descripcion = 'Arma una frase corta con esas 9 letras en orden: sirve cualquiera que te resulte fácil de recordar, no hace falta que sea una frase «oficial». Lo importante es el orden de las letras, no la frase en sí.',
  contenido = $melodia${
  "pasos": [
    "Líneas (Mi-Sol-Si-Re-Fa): prueba algo como «Mi Sobrina Siempre Repite Frases».",
    "Espacios (Fa-La-Do-Mi): prueba algo como «Fabio Lava Dos Manzanas».",
    "No son frases estándar ni las vas a encontrar en un libro: arma la tuya propia, la que más se te pegue.",
    "El objetivo es reconocer la posición de un vistazo, sin contar línea por línea cada vez."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 0,
      "titulo": "Mi · Sol · Si · Re · Fa",
      "etiquetas": "letra",
      "notas": [
        "Mi4",
        "Sol4",
        "Si4",
        "Re5",
        "Fa5"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "Fa · La · Do · Mi",
      "etiquetas": "letra",
      "notas": [
        "Fa4",
        "La4",
        "Do5",
        "Mi5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿qué es lo más importante de la frase que armes?",
      "opciones": [
        "Que sea una frase oficial de un libro",
        "El orden de las letras, no la frase exacta",
        "Que rime perfectamente",
        "Que use solo palabras musicales"
      ],
      "respuesta": "El orden de las letras, no la frase exacta",
      "explicacion": "Sirve cualquier frase fácil de recordar; lo que importa es el orden de las 9 letras."
    },
    {
      "pregunta": "¿Para qué sirve armar una frase con las letras de líneas y espacios?",
      "opciones": [
        "Para reconocer la posición de un vistazo, sin contar una por una",
        "Para memorizar la letra de una canción",
        "Para afinar un instrumento",
        "Para escribir partituras más rápido"
      ],
      "respuesta": "Para reconocer la posición de un vistazo, sin contar una por una",
      "explicacion": "Es el objetivo central: reconocimiento inmediato, no conteo línea por línea."
    },
    {
      "pregunta": "En el ejemplo «Mi Sobrina Siempre Repite Frases», ¿qué representa cada palabra?",
      "opciones": [
        "Las 5 líneas: Mi-Sol-Si-Re-Fa",
        "Los 4 espacios: Fa-La-Do-Mi",
        "Una escala de Do mayor",
        "Las notas de un acorde"
      ],
      "respuesta": "Las 5 líneas: Mi-Sol-Si-Re-Fa",
      "explicacion": "Es la frase de ejemplo para las líneas: las iniciales siguen Mi-Sol-Si-Re-Fa."
    }
  ]
}$melodia$::jsonb,
  orden = 2,
  requiere_pro = false
where problem_type = 'melodia' and slug = 'melodia-truco-lineas-espacios';

update public.techniques
set nombre = 'Sostenidos y bemoles: la misma tecla, dos nombres',
  descripcion = 'Un sostenido (♯) sube la nota medio tono y un bemol (♭) la baja medio tono. Do♯ y Re♭ son la misma tecla: se llaman distinto según de qué nota vengas, no porque suenen distinto (en un piano).',
  contenido = $melodia${
  "pasos": [
    "♯ (sostenido) = medio tono más arriba que la nota natural. ♭ (bemol) = medio tono más abajo.",
    "Do♯ y Re♭ suenan igual en un piano: es la misma tecla negra. Es un «enarmónico»: dos nombres para la misma altura.",
    "La alteración no mueve la posición en el pentagrama: la nota sigue en la misma línea o espacio, y solo se añade el símbolo a su izquierda.",
    "Simplificación: esta lección usa el afinado del piano (temperamento igual), donde Do♯ y Re♭ son idénticos. En instrumentos que pueden ajustar la afinación, como un violín o la voz, pueden diferir muy poco."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "La posición no cambia: solo el símbolo",
      "etiquetas": "nombre",
      "notas": [
        "Fa4",
        "Fa♯4",
        "Fa♭4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué hace un sostenido (♯) a una nota?",
      "opciones": [
        "La baja medio tono",
        "La sube un tono completo",
        "La sube medio tono",
        "No cambia nada, es decorativo"
      ],
      "respuesta": "La sube medio tono",
      "explicacion": "♯ sube medio tono; ♭ baja medio tono: son operaciones opuestas de la misma magnitud."
    },
    {
      "pregunta": "Do♯ y Re♭ son...",
      "opciones": [
        "Dos alturas distintas, separadas por un semitono",
        "La misma altura, con dos nombres distintos",
        "Notas que no existen en el mismo instrumento",
        "La misma nota con el mismo nombre"
      ],
      "respuesta": "La misma altura, con dos nombres distintos",
      "explicacion": "Es un enarmónico: mismo sonido en el piano, nombre distinto según de qué nota natural vengas."
    },
    {
      "pregunta": "¿Qué le pasa a la posición de una nota en el pentagrama cuando se le agrega una alteración (♯ o ♭)?",
      "opciones": [
        "No cambia: sigue en la misma línea o espacio",
        "Se mueve una línea hacia arriba",
        "Se mueve un espacio hacia abajo",
        "Cambia de clave"
      ],
      "respuesta": "No cambia: sigue en la misma línea o espacio",
      "explicacion": "La alteración solo agrega el símbolo al lado: la posición queda igual."
    }
  ]
}$melodia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'melodia' and slug = 'melodia-sostenidos-bemoles';

update public.techniques
set nombre = 'Cómo se arma cualquier tríada: fundamental, 3.ª y 5.ª',
  descripcion = 'Una tríada son 3 notas apiladas por terceras: la fundamental, la 3.ª (a 4 semitonos si es mayor, a 3 si es menor) y la 5.ª (a 7 semitonos de la fundamental en la mayoría de los casos). Con cambiar esos números cambia el tipo de tríada.',
  contenido = $melodia${
  "pasos": [
    "Fundamental: la nota base, a 0 semitonos.",
    "3.ª: 4 semitonos arriba (mayor) o 3 semitonos arriba (menor). Esa sola diferencia decide si el acorde suena mayor o menor.",
    "5.ª: 7 semitonos arriba de la fundamental en la mayoría de los casos (6 si es disminuida y 8 si es aumentada).",
    "Con esta fórmula armas cualquier tríada desde cualquier fundamental: no hace falta memorizar 12 tríadas mayores sueltas, es la misma receta 12 veces."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do mayor: 0, 4 y 7 semitonos",
      "escuchar": true,
      "acorde": {
        "fundamental": "Do4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do menor: 0, 3 y 7 semitonos",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "menor",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 3.ª de una tríada MAYOR?",
      "opciones": [
        "3",
        "7",
        "6",
        "4"
      ],
      "respuesta": "4",
      "explicacion": "4 semitonos da 3.ª mayor; 3 semitonos daría 3.ª menor."
    },
    {
      "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 5.ª de una tríada DISMINUIDA?",
      "opciones": [
        "7",
        "8",
        "6",
        "4"
      ],
      "respuesta": "6",
      "explicacion": "7 semitonos es la 5.ª «normal» (justa); 6 es la 5.ª disminuida y 8, la aumentada."
    },
    {
      "pregunta": "¿Qué decide si una tríada suena mayor o menor?",
      "opciones": [
        "La distancia de la 5.ª únicamente",
        "El instrumento con el que se toque",
        "El volumen con el que se toque",
        "La distancia de la 3.ª respecto de la fundamental (4 o 3 semitonos)"
      ],
      "respuesta": "La distancia de la 3.ª respecto de la fundamental (4 o 3 semitonos)",
      "explicacion": "Es el único número que cambia entre la fórmula mayor y la menor (con la 5.ª igual)."
    }
  ]
}$melodia$::jsonb,
  orden = 1,
  requiere_pro = false
where problem_type = 'melodia' and slug = 'melodia-triada-fundamental-3-5';

update public.techniques
set nombre = 'De tríada a séptima: una nota más arriba',
  descripcion = 'Una séptima es una tríada (fundamental, 3.ª, 5.ª) con una 4.ª nota arriba, a 10 u 11 semitonos de la fundamental según el tipo. No es un acorde nuevo desde cero, es la tríada de siempre con un agregado.',
  contenido = $melodia${
  "pasos": [
    "Empiezas con la tríada de siempre (fundamental, 3.ª y 5.ª).",
    "Le sumas una nota más, la 7.ª. Sobre una tríada mayor: a 11 semitonos de la fundamental da la séptima mayor (maj7) y a 10 semitonos, la séptima dominante (7).",
    "Sobre una tríada menor, la 7.ª a 10 semitonos da la séptima menor (m7).",
    "Piénsalo como «tríada + una nota», no como una forma nueva que hay que aprender desde cero."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do maj7: la 7.ª a 11 semitonos",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "maj7"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do 7: la 7.ª a 10 semitonos",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "dominante7",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 7.ª en un acorde de séptima MAYOR (maj7)?",
      "opciones": [
        "10",
        "7",
        "9",
        "11"
      ],
      "respuesta": "11",
      "explicacion": "11 semitonos arriba de la fundamental da la séptima mayor."
    },
    {
      "pregunta": "¿Cuántos semitonos hay entre la fundamental y la 7.ª en una séptima dominante (7)?",
      "opciones": [
        "10",
        "11",
        "9",
        "12"
      ],
      "respuesta": "10",
      "explicacion": "10 semitonos: la misma distancia que la séptima menor, pero sobre una tríada mayor."
    },
    {
      "pregunta": "Según esta técnica, ¿cómo conviene pensar un acorde de séptima?",
      "opciones": [
        "Como un acorde totalmente nuevo, sin relación con la tríada",
        "Como dos tríadas superpuestas",
        "Como una tríada de siempre con una nota más arriba",
        "Como una escala completa"
      ],
      "respuesta": "Como una tríada de siempre con una nota más arriba",
      "explicacion": "Es la idea central: «tríada + una nota», no una forma nueva."
    }
  ]
}$melodia$::jsonb,
  orden = 2,
  requiere_pro = false
where problem_type = 'melodia' and slug = 'melodia-de-triada-a-septima';

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('melodia-cifrado-americano', 'Cifrado americano: Do es C y sigue el abecedario',
  'El cifrado americano nombra las siete notas con letras: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B. Truco: las letras siguen el abecedario, pero la serie empieza en C (Do), no en A.',
  'melodia',
  $melodia${
  "pasos": [
    "Las siete notas naturales son Do, Re, Mi, Fa, Sol, La, Si. El cifrado americano las escribe con letras: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B.",
    "Truco de memoria: La es A, la primera letra del abecedario. Desde ahí todo sigue en orden: La = A, Si = B, Do = C, Re = D, Mi = E, Fa = F, Sol = G.",
    "Por eso la serie Do-Re-Mi-Fa-Sol-La-Si se lee C-D-E-F-G-A-B: empieza en C, no en A. Si te pierdes, ubica primero el La (A) y cuenta desde ahí.",
    "Los símbolos ♯ y ♭ se escriben igual detrás de la letra: Fa♯ = F♯ y Si♭ = B♭. Simplificación: en algunos países se usa el cifrado latino (Do, Re, Mi...) y en otros el americano (C, D, E...); son solo dos formas de nombrar las mismas notas."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "Cada nota con su letra",
      "cifrado": true,
      "nombres": "todas",
      "notas": [
        "Do4",
        "Re4",
        "Mi4",
        "Fa4",
        "Sol4",
        "La4",
        "Si4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el cifrado americano de la nota Sol?",
      "opciones": [
        "G",
        "F",
        "A",
        "S"
      ],
      "respuesta": "G",
      "explicacion": "Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B."
    },
    {
      "pregunta": "¿Qué nota corresponde a la letra A?",
      "opciones": [
        "Do",
        "Si",
        "Fa",
        "La"
      ],
      "respuesta": "La",
      "explicacion": "La es A: es la primera letra del abecedario y la serie sigue con B = Si, C = Do."
    },
    {
      "pregunta": "¿Con qué letra empieza la serie Do-Re-Mi-Fa-Sol-La-Si en cifrado americano?",
      "opciones": [
        "A",
        "B",
        "D",
        "C"
      ],
      "respuesta": "C",
      "explicacion": "Do es C, así que la serie se lee C-D-E-F-G-A-B (no empieza en A)."
    },
    {
      "pregunta": "¿Cómo se escribe Si♭ en cifrado americano?",
      "opciones": [
        "B♭",
        "S♭",
        "A♭",
        "C♭"
      ],
      "respuesta": "B♭",
      "explicacion": "Si = B; el bemol se escribe igual detrás de la letra: B♭."
    }
  ]
}$melodia$::jsonb,
  1,
  false),

('melodia-figuras-por-fraccion', 'Figuras rítmicas: cada una vale la mitad de la anterior',
  'Redonda, blanca, negra y corchea se distinguen por tres detalles: cabeza hueca o rellena, plica (el palito) y corchete (la banderita). Y cada una dura la mitad que la anterior: 4, 2, 1 y ½ pulsos.',
  'melodia',
  $melodia${
  "pasos": [
    "Mira la cabeza: hueca (vacía) es redonda o blanca; rellena es negra o corchea. La redonda no tiene plica (palito); las demás sí.",
    "Redonda: cabeza hueca y sin plica. Blanca: hueca con plica. Negra: rellena con plica. Corchea: rellena con plica y un corchete (una banderita).",
    "Cada figura dura la mitad que la anterior: redonda 4 pulsos, blanca 2, negra 1 y corchea ½. En un compás de 4/4 caben 1 redonda, 2 blancas, 4 negras u 8 corcheas.",
    "Simplificación: aquí el pulso es la negra (lo normal en 4/4); en otros compases el pulso puede ser otra figura. La duración real en segundos depende del tempo (la velocidad)."
  ],
  "visuales": [
    {
      "tipo": "melodia.ritmo",
      "despuesDePaso": 2,
      "titulo": "Cada figura, la mitad de la anterior",
      "figuras": [
        "redonda",
        "blanca",
        "negra",
        "corchea"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se llama la figura de cabeza hueca y sin plica?",
      "opciones": [
        "Redonda",
        "Blanca",
        "Negra",
        "Corchea"
      ],
      "respuesta": "Redonda",
      "explicacion": "La redonda es la única sin plica, y dura 4 pulsos."
    },
    {
      "pregunta": "¿Cuántos pulsos dura una blanca?",
      "opciones": [
        "2",
        "1",
        "4",
        "½"
      ],
      "respuesta": "2",
      "explicacion": "La blanca dura la mitad que la redonda: 2 pulsos."
    },
    {
      "pregunta": "¿Cuántas negras caben en una redonda?",
      "opciones": [
        "2",
        "8",
        "1",
        "4"
      ],
      "respuesta": "4",
      "explicacion": "Redonda = 4 pulsos y negra = 1 pulso, así que caben 4."
    },
    {
      "pregunta": "¿Qué figura es rellena, con plica y con corchete?",
      "opciones": [
        "Negra",
        "Blanca",
        "Corchea",
        "Redonda"
      ],
      "respuesta": "Corchea",
      "explicacion": "La corchea lleva el corchete y dura medio pulso."
    }
  ]
}$melodia$::jsonb,
  2,
  false),

('melodia-teclas-negras-para-ubicarse', 'Teclas negras: los grupos de 2 y 3 te dicen dónde estás',
  'En un piano las teclas negras van en grupos de 2 y de 3. Con eso ubicas las siete notas blancas sin contar: Do queda justo a la izquierda del grupo de 2 y Fa justo a la izquierda del grupo de 3.',
  'melodia',
  $melodia${
  "pasos": [
    "Las teclas negras se agrupan de a 2 y de a 3, y ese patrón se repite. Es el mapa que te dice dónde estás en el teclado.",
    "Do es la tecla blanca justo a la izquierda del grupo de 2. Re queda entre las dos negras de ese grupo y Mi, a la derecha de la segunda.",
    "Fa es la tecla blanca justo a la izquierda del grupo de 3. Después vienen Sol (entre la primera y la segunda negra), La (entre la segunda y la tercera) y Si (a la derecha de la tercera).",
    "Entre Mi y Fa, y entre Si y Do, no hay tecla negra: están pegadas. En las demás blancas, sí hay una negra en medio."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 1,
      "titulo": "Grupos de 2 y de 3 teclas negras",
      "grupos": true,
      "nombres": "todas",
      "notas": [
        "Do4",
        "Re4",
        "Mi4",
        "Fa4",
        "Sol4",
        "La4",
        "Si4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tecla blanca queda justo a la izquierda del grupo de dos teclas negras?",
      "opciones": [
        "Do",
        "Re",
        "Mi",
        "Fa"
      ],
      "respuesta": "Do",
      "explicacion": "Do está pegada a la izquierda del grupo de 2."
    },
    {
      "pregunta": "¿Qué tecla blanca está entre las dos negras del grupo de dos?",
      "opciones": [
        "Do",
        "Re",
        "Mi",
        "Sol"
      ],
      "respuesta": "Re",
      "explicacion": "Re queda en el medio de las dos negras del grupo de 2."
    },
    {
      "pregunta": "¿Qué tecla blanca queda justo a la izquierda del grupo de tres teclas negras?",
      "opciones": [
        "Mi",
        "Fa",
        "Sol",
        "Si"
      ],
      "respuesta": "Fa",
      "explicacion": "Fa está pegada a la izquierda del grupo de 3."
    },
    {
      "pregunta": "¿Qué tecla blanca queda entre la segunda y la tercera negra del grupo de tres?",
      "opciones": [
        "Sol",
        "La",
        "Si",
        "Fa"
      ],
      "respuesta": "La",
      "explicacion": "Fa, Sol y La rodean las negras del grupo de 3: La va entre la segunda y la tercera."
    }
  ]
}$melodia$::jsonb,
  3,
  false),

('melodia-notas-fuera-del-pentagrama', 'Fuera del pentagrama: sigue la alternancia línea, espacio, línea',
  'Las notas por encima y por debajo del pentagrama siguen la misma alternancia de línea y espacio. Apóyate en tres puntos fijos: Do4 en la primera línea adicional de abajo, Fa5 en la última línea y Do6 en la segunda adicional de arriba.',
  'melodia',
  $melodia${
  "pasos": [
    "Las líneas adicionales continúan el pentagrama: línea, espacio, línea, espacio... Cada paso hacia arriba es la nota siguiente del nombre (Fa5, Sol5, La5...) y cada paso hacia abajo, la anterior.",
    "Hacia abajo: Mi4 es la línea de más abajo; el espacio debajo es Re4; en la primera línea adicional está Do4 (el Do central). Después Si3 (espacio), La3 (2.ª línea adicional), Sol3 (espacio) y Fa3 (3.ª línea adicional).",
    "Hacia arriba: Fa5 es la línea de más arriba; el espacio encima es Sol5; en la primera línea adicional está La5, luego Si5 (espacio) y Do6 (2.ª línea adicional).",
    "El número de octava sube al llegar a Do: Si3 está justo debajo de Do4, y Si5 justo debajo de Do6. Comprueba siempre en qué octava estás además del nombre."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "Hacia abajo desde Do4",
      "etiquetas": "nombre",
      "notas": [
        "Do4",
        "Si3",
        "La3",
        "Sol3",
        "Fa3"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Hacia arriba desde Fa5",
      "etiquetas": "nombre",
      "notas": [
        "Fa5",
        "Sol5",
        "La5",
        "Si5",
        "Do6"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nota está en la primera línea adicional por debajo del pentagrama, en clave de sol?",
      "opciones": [
        "Re4",
        "Si3",
        "La3",
        "Do4"
      ],
      "respuesta": "Do4",
      "explicacion": "Do4, el Do central, se escribe en una línea adicional justo debajo de la línea Mi4."
    },
    {
      "pregunta": "¿Qué nota queda en el espacio inmediatamente encima de la línea de arriba (Fa5)?",
      "opciones": [
        "La5",
        "Mi5",
        "Sol5",
        "Fa6"
      ],
      "respuesta": "Sol5",
      "explicacion": "Después de Fa5 sigue Sol5, en el espacio de arriba."
    },
    {
      "pregunta": "¿Cuál está en la primera línea adicional por encima del pentagrama?",
      "opciones": [
        "La5",
        "Sol5",
        "Si5",
        "Do6"
      ],
      "respuesta": "La5",
      "explicacion": "Fa5 (línea), Sol5 (espacio), La5 (primera línea adicional)."
    },
    {
      "pregunta": "¿Qué nota está justo debajo de Do4 (en el espacio bajo la línea adicional)?",
      "opciones": [
        "Si4",
        "Si3",
        "Re4",
        "La3"
      ],
      "respuesta": "Si3",
      "explicacion": "El número baja a 3 porque pasamos de Do a Si, la nota anterior de la octava de abajo."
    }
  ]
}$melodia$::jsonb,
  3,
  false),

('melodia-semitonos-mi-fa-si-do', 'Mi-Fa y Si-Do: los dos semitonos sin tecla negra',
  'En el teclado, entre Mi y Fa y entre Si y Do no hay tecla negra: están a un semitono. Por eso Mi♯ suena igual que Fa, Si♯ igual que Do, Fa♭ igual que Mi y Do♭ igual que Si.',
  'melodia',
  $melodia${
  "pasos": [
    "Entre dos teclas blancas vecinas casi siempre hay una negra en medio (son dos semitonos, un tono). Solo en Mi-Fa y en Si-Do no la hay: esas parejas están a un solo semitono.",
    "Consecuencia: si subes Mi medio tono llegas a Fa, así que Mi♯ suena igual que Fa. Y Si♯ suena igual que Do (el Do de la octava siguiente).",
    "Lo mismo hacia abajo: Fa♭ suena igual que Mi, y Do♭ suena igual que Si (el Si de la octava anterior).",
    "En cambio, Do♯, Re♯, Fa♯, Sol♯ y La♯ (y sus bemoles Re♭, Mi♭, Sol♭, La♭ y Si♭) son las cinco teclas negras: ahí sí cambia de tecla."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 0,
      "titulo": "Mi-Fa y Si-Do: un solo semitono",
      "desde": "Do4",
      "hasta": "Do5",
      "nombres": "todas",
      "semitonosNaturales": true,
      "notas": [
        "Mi4",
        "Fa4",
        "Si4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Con qué nota suena igual Mi♯?",
      "opciones": [
        "Re",
        "Fa♯",
        "Mi♭",
        "Fa"
      ],
      "respuesta": "Fa",
      "explicacion": "Entre Mi y Fa no hay tecla negra: subir Mi medio tono da Fa."
    },
    {
      "pregunta": "¿Con qué nota suena igual Do♭?",
      "opciones": [
        "Re♭",
        "Do♯",
        "Si (de la octava anterior)",
        "La"
      ],
      "respuesta": "Si (de la octava anterior)",
      "explicacion": "Entre Si y Do no hay tecla negra: bajar Do medio tono da Si."
    },
    {
      "pregunta": "¿Entre cuáles teclas blancas vecinas NO hay tecla negra?",
      "opciones": [
        "Mi y Fa, y Si y Do",
        "Do y Re, y Fa y Sol",
        "Re y Mi, y La y Si",
        "Sol y La, y Do y Re"
      ],
      "respuesta": "Mi y Fa, y Si y Do",
      "explicacion": "Mi-Fa y Si-Do son los dos semitonos naturales de la escala."
    },
    {
      "pregunta": "¿Con qué nota suena igual Si♯?",
      "opciones": [
        "La♯",
        "Si",
        "Re",
        "Do (de la octava siguiente)"
      ],
      "respuesta": "Do (de la octava siguiente)",
      "explicacion": "Subir Si medio tono da Do, ya en la octava siguiente."
    }
  ]
}$melodia$::jsonb,
  2,
  false),

('melodia-enarmonia-lee-la-posicion', 'Enarmonía: primero la posición, después el símbolo',
  'Cuando una pregunta te ofrece dos nombres con el mismo sonido (como Do♯ y Re♭), el nombre correcto lo da la posición de la nota en el pentagrama: lee primero la letra y solo después aplica el ♯ o el ♭.',
  'melodia',
  $melodia${
  "pasos": [
    "En un pentagrama, la posición te da la letra. Una nota en la línea de Sol es Sol, con o sin alteración; la alteración solo la modifica.",
    "Por eso el orden de lectura es siempre el mismo: 1) ubica la posición y di la letra; 2) mira el símbolo; 3) júntalos. Una nota en la posición de Do con un ♯ delante es Do♯, nunca Re♭, aunque suenen igual.",
    "En la Práctica, algunas opciones de respuesta son el enarmónico de la correcta: el mismo sonido con otra letra. Son un truco para quien mira el sonido y no la posición; descártalas.",
    "También aparecen la nota natural (sin el símbolo) y la alteración contraria sobre la misma letra: revisa siempre que el símbolo de la opción sea el que ves dibujado."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "Suenan igual, pero se escriben en posiciones distintas",
      "etiquetas": "nombre",
      "notas": [
        "Do♯4",
        "Re♭4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 1,
      "titulo": "La misma tecla negra",
      "desde": "Do4",
      "hasta": "Mi4",
      "textos": [
        "Do♯ = Re♭"
      ],
      "notas": [
        "Do♯4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Una nota en la posición de Do con un sostenido delante es...",
      "opciones": [
        "Do",
        "Re♯",
        "Do♭",
        "Do♯"
      ],
      "respuesta": "Do♯",
      "explicacion": "La posición da la letra (Do); el símbolo la modifica: Do♯. Re♭ suena igual, pero se escribiría en la posición de Re."
    },
    {
      "pregunta": "¿Qué debes mirar primero para nombrar una nota alterada en el pentagrama?",
      "opciones": [
        "El símbolo, para saber la alteración",
        "La posición, para saber la letra",
        "El color de la nota",
        "Si tiene plica"
      ],
      "respuesta": "La posición, para saber la letra",
      "explicacion": "Primero la letra que da la posición y después el símbolo."
    },
    {
      "pregunta": "¿Por qué una opción con el mismo sonido pero otra letra no es la respuesta correcta?",
      "opciones": [
        "Porque suena distinto",
        "Porque no existe en el piano",
        "Porque siempre está mal escrita",
        "Porque el nombre lo da la posición dibujada, no solo el sonido"
      ],
      "respuesta": "Porque el nombre lo da la posición dibujada, no solo el sonido",
      "explicacion": "Do♯ y Re♭ suenan igual, pero solo una está escrita en esa posición."
    }
  ]
}$melodia$::jsonb,
  3,
  false),

('melodia-formula-escala-mayor', 'La escala mayor: T-T-S-T-T-T-S desde cualquier nota',
  'Toda escala mayor sigue la misma receta de saltos: tono, tono, semitono, tono, tono, tono, semitono. Aplica esa fórmula desde la nota que quieras y obtienes su escala mayor.',
  'melodia',
  $melodia${
  "pasos": [
    "La fórmula de la escala mayor es T-T-S-T-T-T-S (T = tono, 2 semitonos; S = semitono, 1). Suma 12 semitonos: llega a la octava.",
    "En Do mayor la fórmula cae justo sobre las teclas blancas: Do-Re-Mi-Fa-Sol-La-Si-Do. Los semitonos están donde no hay tecla negra: entre Mi-Fa (3.º-4.º grado) y Si-Do (7.º-8.º).",
    "Desde otra nota, la misma fórmula usa teclas negras. Sol mayor: Sol, La, Si, Do, Re, Mi, Fa♯, Sol. El Fa♯ aparece porque el 7.º grado tiene que quedar a un semitono de la octava.",
    "Simplificación: en la Práctica, las notas alteradas se escriben siempre con sostenidos o siempre con bemoles según el ejercicio. En una partitura real cada grado usa una letra distinta (Fa mayor lleva Si♭, no La♯); el sonido es el mismo."
  ],
  "visuales": [
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 1,
      "titulo": "Do mayor: T-T-S-T-T-T-S",
      "escuchar": true,
      "escala": {
        "fundamental": "Do4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 2,
      "titulo": "Sol mayor: el 7.º grado es Fa♯",
      "escala": {
        "fundamental": "Sol4",
        "tipo": "mayor"
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula de la escala mayor?",
      "opciones": [
        "T-S-T-T-S-T-T",
        "T-T-T-S-T-T-S",
        "T-T-S-T-T-T-S",
        "S-T-T-S-T-T-T"
      ],
      "respuesta": "T-T-S-T-T-T-S",
      "explicacion": "Tono, tono, semitono, tono, tono, tono, semitono."
    },
    {
      "pregunta": "En la escala mayor, ¿entre qué grados hay un semitono?",
      "opciones": [
        "Entre el 1.º y el 2.º, y entre el 5.º y el 6.º",
        "Entre el 2.º y el 3.º, y entre el 6.º y el 7.º",
        "Entre el 4.º y el 5.º únicamente",
        "Entre el 3.º y el 4.º, y entre el 7.º y el 8.º"
      ],
      "respuesta": "Entre el 3.º y el 4.º, y entre el 7.º y el 8.º",
      "explicacion": "La fórmula T-T-S-T-T-T-S pone los semitonos en el 3.º-4.º y el 7.º-8.º."
    },
    {
      "pregunta": "¿Cuál es la 7.ª nota de la escala de Sol mayor?",
      "opciones": [
        "Fa",
        "Sol",
        "Fa♯",
        "Mi♯"
      ],
      "respuesta": "Fa♯",
      "explicacion": "Sol-La-Si-Do-Re-Mi y el 7.º grado a un semitono de Sol: Fa♯."
    },
    {
      "pregunta": "¿Cuántos semitonos suma toda la escala mayor, de la nota de partida a su octava?",
      "opciones": [
        "12",
        "7",
        "10",
        "14"
      ],
      "respuesta": "12",
      "explicacion": "5 tonos y 2 semitonos: 10 + 2 = 12."
    }
  ]
}$melodia$::jsonb,
  1,
  false),

('melodia-menor-natural-desde-la-mayor', 'Menor natural: la escala mayor empezada en su 6.º grado',
  'La escala menor natural usa las mismas notas que una mayor, pero empezando en el 6.º grado: La menor son las notas de Do mayor tocadas desde La. Su fórmula es T-S-T-T-S-T-T.',
  'melodia',
  $melodia${
  "pasos": [
    "La escala menor natural sigue la fórmula T-S-T-T-S-T-T (2, 1, 2, 2, 1, 2, 2 semitonos).",
    "Atajo: cada escala mayor tiene una menor «relativa» con las mismas notas, que empieza en su 6.º grado. En Do mayor el 6.º grado es La: La menor son las notas de Do mayor tocadas de La a La.",
    "Ejemplos: La menor = La-Si-Do-Re-Mi-Fa-Sol; Mi menor = Mi-Fa♯-Sol-La-Si-Do-Re, que son las de Sol mayor empezando en su 6.º grado (Mi).",
    "Comparada con la mayor de la misma nota de partida, la menor natural tiene el 3.º, el 6.º y el 7.º grado más bajos (medio tono). Simplificación: hay otras escalas menores (armónica y melódica) que no se ven aquí."
  ],
  "visuales": [
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 1,
      "titulo": "La menor natural: las notas de Do mayor desde La",
      "escuchar": true,
      "escala": {
        "fundamental": "La3",
        "tipo": "menor_natural"
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula de la escala menor natural?",
      "opciones": [
        "T-T-S-T-T-T-S",
        "T-T-S-T-T-S-T",
        "S-T-T-S-T-T-T",
        "T-S-T-T-S-T-T"
      ],
      "respuesta": "T-S-T-T-S-T-T",
      "explicacion": "Tono, semitono, tono, tono, semitono, tono, tono."
    },
    {
      "pregunta": "¿Con qué escala mayor comparte sus notas La menor?",
      "opciones": [
        "Sol mayor",
        "La mayor",
        "Fa mayor",
        "Do mayor"
      ],
      "respuesta": "Do mayor",
      "explicacion": "La es el 6.º grado de Do mayor: La menor usa sus mismas notas."
    },
    {
      "pregunta": "¿En qué grado de una escala mayor empieza su menor relativa?",
      "opciones": [
        "En el 2.º grado",
        "En el 4.º grado",
        "En el 6.º grado",
        "En el 7.º grado"
      ],
      "respuesta": "En el 6.º grado",
      "explicacion": "La menor natural es la mayor tocada desde su 6.º grado (La en Do mayor)."
    },
    {
      "pregunta": "¿Cuál es la 2.ª nota de La menor natural?",
      "opciones": [
        "Si",
        "Do",
        "Si♭",
        "La♯"
      ],
      "respuesta": "Si",
      "explicacion": "La menor natural: La-Si-Do-Re-Mi-Fa-Sol."
    }
  ]
}$melodia$::jsonb,
  2,
  false),

('melodia-reconocer-escala-por-el-primer-salto', 'Reconoce la escala: cuenta las notas y mira el primer salto',
  'Para reconocer una escala escrita en la Práctica, cuenta las notas (8 son mayor o menor natural; 6 son pentatónica) y mide un salto: la 3.ª nota a 4 semitonos de la primera es mayor; a 3, menor.',
  'melodia',
  $melodia${
  "pasos": [
    "Cuenta las notas dibujadas (la última repite la primera, una octava arriba). Con 8 es una escala de siete sonidos: mayor o menor natural. Con 6 es una pentatónica (cinco sonidos).",
    "Si son 8: mide de la 1.ª a la 3.ª nota. 4 semitonos (3.ª mayor) es una escala mayor; 3 semitonos (3.ª menor) es una menor natural.",
    "Si son 6: mira el primer salto. Si es de un tono (2 semitonos) es una pentatónica mayor; si es de tono y medio (3 semitonos) es una pentatónica menor.",
    "Mide contando teclas del piano: de Do a Mi son 4 semitonos (Do, Do♯, Re, Re♯, Mi); de Do a Mi♭ son 3. La nota de partida siempre viene en el enunciado."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "8 notas, 3.ª a 4 semitonos: mayor",
      "etiquetas": "letra",
      "escala": {
        "fundamental": "Do4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "6 notas, primer salto de 3 semitonos: pentatónica menor",
      "etiquetas": "letra",
      "escala": {
        "fundamental": "Do4",
        "tipo": "pentatonica_menor",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "Una escala dibujada tiene 6 notas (la última repite la primera). ¿Qué tipo es?",
      "opciones": [
        "Pentatónica",
        "Mayor",
        "Menor natural",
        "Cromática"
      ],
      "respuesta": "Pentatónica",
      "explicacion": "5 sonidos más la octava son 6 notas dibujadas: pentatónica."
    },
    {
      "pregunta": "Una secuencia de 8 notas parte de Do y la 3.ª nota está a 4 semitonos de Do. ¿Qué escala es?",
      "opciones": [
        "Mayor",
        "Menor natural",
        "Pentatónica mayor",
        "Pentatónica menor"
      ],
      "respuesta": "Mayor",
      "explicacion": "Con 8 notas y 3.ª mayor (4 semitonos), es una escala mayor."
    },
    {
      "pregunta": "Una secuencia de 8 notas parte de La y la 3.ª nota está a 3 semitonos de La. ¿Qué escala es?",
      "opciones": [
        "Mayor",
        "Pentatónica menor",
        "Pentatónica mayor",
        "Menor natural"
      ],
      "respuesta": "Menor natural",
      "explicacion": "3.ª menor (3 semitonos) con 8 notas: menor natural."
    },
    {
      "pregunta": "En una pentatónica, el primer salto es de tono y medio (3 semitonos). ¿Cuál es?",
      "opciones": [
        "Pentatónica mayor",
        "Pentatónica menor",
        "Mayor",
        "Menor natural"
      ],
      "respuesta": "Pentatónica menor",
      "explicacion": "La pentatónica menor empieza con un salto de 3 semitonos."
    }
  ]
}$melodia$::jsonb,
  3,
  false),

('melodia-cuatro-triadas-por-terceras', 'Las cuatro tríadas: apila terceras de 4 y de 3 semitonos',
  'Cada tríada es una pila de dos terceras: mayor = 4 + 3, menor = 3 + 4, disminuida = 3 + 3, aumentada = 4 + 4. Mide los dos saltos entre las notas y sabes cuál es.',
  'melodia',
  $melodia${
  "pasos": [
    "Mide dos saltos en semitonos: de la fundamental a la 2.ª nota y de la 2.ª a la 3.ª. Los saltos solo pueden ser 3 (tercera menor) o 4 (tercera mayor).",
    "Mayor = 4 + 3 (0-4-7). Menor = 3 + 4 (0-3-7). Disminuida = 3 + 3 (0-3-6). Aumentada = 4 + 4 (0-4-8).",
    "Si el primer salto es 4, es mayor o aumentada; si es 3, es menor o disminuida. El segundo salto separa el par: mayor 3 (mayor) o 4 (aumentada); menor 4 (menor) o 3 (disminuida).",
    "Cuenta los semitonos sobre el teclado, mentalmente (Do a Mi: Do♯, Re, Re♯, Mi = 4), sin contar la nota de partida."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do disminuida: 3 + 3",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "disminuido",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do aumentada: 4 + 4",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "aumentado"
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué saltos, en semitonos, forman una tríada menor?",
      "opciones": [
        "3 + 4",
        "4 + 3",
        "3 + 3",
        "4 + 4"
      ],
      "respuesta": "3 + 4",
      "explicacion": "Menor: 3.ª menor abajo y 3.ª mayor arriba (0-3-7)."
    },
    {
      "pregunta": "¿Qué tríada tiene saltos de 3 + 3 semitonos?",
      "opciones": [
        "Menor",
        "Mayor",
        "Aumentada",
        "Disminuida"
      ],
      "respuesta": "Disminuida",
      "explicacion": "Dos terceras menores seguidas: 0-3-6."
    },
    {
      "pregunta": "¿Qué saltos forman una tríada aumentada?",
      "opciones": [
        "4 + 3",
        "3 + 4",
        "4 + 4",
        "3 + 3"
      ],
      "respuesta": "4 + 4",
      "explicacion": "Dos terceras mayores seguidas: 0-4-8."
    },
    {
      "pregunta": "Una tríada tiene sus notas a 0, 4 y 7 semitonos de la fundamental. ¿Cuál es?",
      "opciones": [
        "Menor",
        "Aumentada",
        "Mayor",
        "Disminuida"
      ],
      "respuesta": "Mayor",
      "explicacion": "4 + 3: es la tríada mayor."
    }
  ]
}$melodia$::jsonb,
  3,
  false),

('melodia-suspendidos-y-extendidos', 'Sus, add9 y los de 9, 11 y 13: qué nota cambia o se agrega',
  'Sus2 y sus4 cambian la 3.ª por una 2.ª o una 4.ª; add9 agrega una 9.ª a la tríada mayor; y los de 9, 11 y 13 son séptima dominante más una, dos o tres terceras más arriba.',
  'melodia',
  $melodia${
  "pasos": [
    "Suspendidos: no tienen 3.ª. Sus2 cambia la 3.ª por la 2.ª (0-2-7) y sus4 por la 4.ª (0-5-7). Sin 3.ª no suenan ni mayores ni menores.",
    "Add9: tríada mayor más la 9.ª, sin la séptima (0-4-7-14). 14 semitonos es la 2.ª pero una octava más arriba.",
    "9, 11 y 13 se construyen sobre la séptima dominante (0-4-7-10) y suman una tercera más cada vez: novena (9.ª, a 14 semitonos), oncena (más la 11.ª, a 17) y trecena (más la 13.ª, a 21).",
    "Para reconocerlos en la Práctica, cuenta las notas y mide desde la fundamental: 3 notas con la 2.ª nota a 2 o a 5 semitonos = sus2 o sus4; 4 notas con una nota a 14 semitonos (y sin 7.ª) = add9; 5, 6 o 7 notas = novena, oncena o trecena."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 0,
      "titulo": "Do sus4: 0, 5 y 7 semitonos",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "sus4"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do 9: la séptima dominante más la 9.ª",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "novena",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nota cambia un acorde sus2 respecto de la tríada mayor?",
      "opciones": [
        "La 5.ª por la 6.ª",
        "La fundamental por la 2.ª",
        "La 3.ª por la 4.ª",
        "La 3.ª por la 2.ª"
      ],
      "respuesta": "La 3.ª por la 2.ª",
      "explicacion": "Sus2 = 0-2-7: la 3.ª (4 semitonos) pasa a ser la 2.ª (2 semitonos)."
    },
    {
      "pregunta": "¿A cuántos semitonos de la fundamental está la 9.ª?",
      "opciones": [
        "9",
        "14",
        "12",
        "10"
      ],
      "respuesta": "14",
      "explicacion": "La 9.ª es la 2.ª más una octava: 2 + 12 = 14."
    },
    {
      "pregunta": "¿Sobre qué acorde se construyen los de 9, 11 y 13?",
      "opciones": [
        "La tríada menor",
        "La séptima dominante",
        "La tríada disminuida",
        "El acorde de sus4"
      ],
      "respuesta": "La séptima dominante",
      "explicacion": "0-4-7-10 más terceras encima: 14, 17 y 21."
    },
    {
      "pregunta": "Un acorde de 4 notas: fundamental, 3.ª mayor, 5.ª justa y 9.ª (sin séptima). ¿Cuál es?",
      "opciones": [
        "Novena (9)",
        "Add9",
        "Sus2",
        "Séptima mayor (maj7)"
      ],
      "respuesta": "Add9",
      "explicacion": "Add9 es la tríada mayor con la 9.ª añadida y sin 7.ª."
    }
  ]
}$melodia$::jsonb,
  4,
  false),

('melodia-oido-ancla-la-440', 'Ancla tu oído en una referencia: el La de 440 Hz',
  'Sin una referencia es muy difícil nombrar una nota de oído. Ancla tu oído en una nota que conozcas bien, como el La4 de 440 Hz (la de afinación), y compara: ¿más grave o más aguda?, ¿cuánto?',
  'melodia',
  $melodia${
  "pasos": [
    "En este modo escuchas una nota sintetizada (un tono electrónico, no un piano) y eliges cuál es. No te dan ninguna referencia: la construyes tú.",
    "Una ancla útil es el La4, de 440 Hz, la nota con la que se afinan los instrumentos. Si recuerdas cómo suena, compara: la nota que oyes ¿es más grave o más aguda que ese La? ¿Muy lejos o cerca?",
    "Empieza por el registro: ¿es grave o aguda? Eso te dice en qué octava está. Después decide el nombre entre las opciones.",
    "El mismo nombre en octavas distintas (La3, La4, La5) suena como «la misma nota» más grave o más aguda: al subir una octava, la frecuencia se duplica."
  ],
  "visuales": [
    {
      "tipo": "melodia.frecuencia",
      "despuesDePaso": 3,
      "titulo": "El La en tres octavas",
      "escuchar": true,
      "notas": [
        "La3",
        "La4",
        "La5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos hercios tiene el La4, la nota de afinación?",
      "opciones": [
        "440",
        "220",
        "261",
        "880"
      ],
      "respuesta": "440",
      "explicacion": "La4 = 440 Hz es la referencia de afinación más usada."
    },
    {
      "pregunta": "¿Qué pasa con la frecuencia al subir una octava?",
      "opciones": [
        "Aumenta 12 Hz",
        "Se duplica",
        "Se reduce a la mitad",
        "Se mantiene igual"
      ],
      "respuesta": "Se duplica",
      "explicacion": "La5 = 880 Hz, el doble de La4 (440 Hz)."
    },
    {
      "pregunta": "¿Por dónde conviene empezar al identificar una nota de oído?",
      "opciones": [
        "Adivinar al azar la primera vez",
        "Decidir si es grave o aguda y compararla con una referencia",
        "Mirar el volumen de la nota",
        "Contar los segundos que dura"
      ],
      "respuesta": "Decidir si es grave o aguda y compararla con una referencia",
      "explicacion": "Primero el registro y la comparación con una referencia; después el nombre."
    }
  ]
}$melodia$::jsonb,
  1,
  false),

('melodia-oido-ordena-las-opciones', 'Ordena las opciones de grave a aguda y compara',
  'En los primeros niveles las opciones están muy separadas. Ordénalas mentalmente de la más grave a la más aguda antes de escuchar, y en los niveles altos compara la nota con sus vecinas a un semitono.',
  'melodia',
  $melodia${
  "pasos": [
    "En los niveles más bajos las cuatro opciones son Do4, Fa4, Sol4 y Do5: muy separadas entre sí (una 4.ª, una 5.ª y una octava desde Do4). Ordénalas antes de escuchar, de la más grave a la más aguda.",
    "Cuando suena la nota, decide si es de las graves, de las medias o de las agudas. Con opciones tan separadas, eso suele bastar.",
    "En los niveles altos aparecen sostenidos: un sostenido está un semitono por encima de su nota natural (Do♯ queda justo encima de Do). Compara la nota que oyes con las dos vecinas más cercanas y decide si está más arriba o más abajo.",
    "Puedes repetir la nota las veces que quieras con el botón de escuchar. Si te cansas, para y vuelve más tarde: el oído rinde mejor en sesiones cortas."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 0,
      "titulo": "Las opciones más separadas: Do4, Fa4, Sol4 y Do5",
      "desde": "Do4",
      "hasta": "Do5",
      "nombres": "resaltadas",
      "saltos": true,
      "escuchar": true,
      "notas": [
        "Do4",
        "Fa4",
        "Sol4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué haces primero con las opciones en los niveles bajos?",
      "opciones": [
        "Ordenarlas de la más grave a la más aguda",
        "Elegir la del medio siempre",
        "Ignorarlas y adivinar",
        "Buscar la más larga"
      ],
      "respuesta": "Ordenarlas de la más grave a la más aguda",
      "explicacion": "Al ordenarlas sabes con qué comparar la nota que suena."
    },
    {
      "pregunta": "¿Qué es un sostenido respecto de su nota natural?",
      "opciones": [
        "Un semitono más grave",
        "Una octava más aguda",
        "La misma nota",
        "Un semitono más agudo"
      ],
      "respuesta": "Un semitono más agudo",
      "explicacion": "Do♯ suena justo encima de Do, a un semitono."
    },
    {
      "pregunta": "¿A cuántos semitonos está Do4 de Sol4?",
      "opciones": [
        "5",
        "4",
        "12",
        "7"
      ],
      "respuesta": "7",
      "explicacion": "Do4 a Sol4 es una 5.ª justa: 7 semitonos."
    }
  ]
}$melodia$::jsonb,
  2,
  false);

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('melodia-clase-sonido-y-nota', 'El sonido y la nota: altura, octava y nombre',
  'Qué es la altura de un sonido, cómo se convierte en una nota con nombre, por qué las notas se repiten cada octava y qué significa el número de Do4 o La4.',
  'melodia',
  $melodia${
  "pasos": [
    "Un sonido tiene cuatro cualidades: altura (qué tan grave o agudo es), duración, intensidad (qué tan fuerte suena) y timbre (lo que distingue a una flauta de un piano tocando la misma nota). La música con notas trabaja sobre todo con la altura.",
    "La altura depende de la frecuencia: cuántas vibraciones por segundo (hercios, Hz) tiene el sonido. Más frecuencia, más agudo; menos frecuencia, más grave. Una nota es el nombre que le damos a una altura concreta.",
    "Las notas naturales tienen siete nombres: Do, Re, Mi, Fa, Sol, La, Si. Después de Si vuelve a empezar la serie con otro Do, más agudo: esa distancia de un Do al siguiente es una octava. Entre un Do y el siguiente hay 12 semitonos (las 12 teclas, blancas y negras, de esa octava).",
    "Para distinguir un Do de otro se añade el número de octava: Do4, Do5... Se usa la convención científica: Do4 es el Do central del piano y La4 (el La justo encima) es la nota de afinación, de 440 Hz. El número sube al llegar a Do, no a La: Si3 y Do4 son vecinas.",
    "Cuando dos notas tienen el mismo nombre y distinta octava, como Do4 y Do5, suenan «la misma nota» en registros distintos. Eso es lo que hace que la escala se repita.",
    "Errores comunes: pensar que el número de octava cambia en La (cambia en Do); creer que Do4 y Do5 son notas distintas por nombre (son la misma nota en otra octava); y mezclar altura con volumen: una nota puede sonar suave y aguda, o fuerte y grave."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 3,
      "titulo": "Do4 y Do5: la misma nota, una octava aparte",
      "desde": "Do4",
      "hasta": "Do5",
      "nombres": "todas",
      "notas": [
        "Do4",
        "Do5"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 3,
      "titulo": "El número de octava sube al llegar a Do",
      "desde": "Sol3",
      "hasta": "Mi4",
      "nombres": "todas",
      "notas": [
        "Si3",
        "Do4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿De qué depende que un sonido sea grave o agudo?",
      "opciones": [
        "De su volumen",
        "De su frecuencia",
        "De su timbre",
        "De su duración"
      ],
      "respuesta": "De su frecuencia",
      "explicacion": "La altura la da la frecuencia: más vibraciones por segundo, más agudo."
    },
    {
      "pregunta": "¿Cuántos semitonos hay de un Do al siguiente Do (una octava)?",
      "opciones": [
        "12",
        "7",
        "8",
        "10"
      ],
      "respuesta": "12",
      "explicacion": "Una octava abarca 12 semitonos: las 12 teclas, blancas y negras, entre un Do y el siguiente."
    },
    {
      "pregunta": "En la convención científica, ¿qué nota es Do4?",
      "opciones": [
        "El Do más grave del piano",
        "El La de afinación",
        "El Do central del piano",
        "El Do más agudo del piano"
      ],
      "respuesta": "El Do central del piano",
      "explicacion": "Do4 es el Do central; La4, un poco más arriba, es el de 440 Hz."
    },
    {
      "pregunta": "¿Dónde cambia el número de octava?",
      "opciones": [
        "Al llegar a La",
        "Al llegar a Do",
        "Al llegar a Mi",
        "Al llegar a Si"
      ],
      "respuesta": "Al llegar a Do",
      "explicacion": "Si3 es la nota justo debajo de Do4: el número sube en Do."
    },
    {
      "pregunta": "Do4 y Do5 son...",
      "opciones": [
        "Dos notas con nombres distintos",
        "Notas que suenan igual de agudas",
        "La misma altura exacta",
        "La misma nota en octavas distintas"
      ],
      "respuesta": "La misma nota en octavas distintas",
      "explicacion": "Tienen el mismo nombre; Do5 es una octava más aguda que Do4."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-teclado-y-cifrado', 'Las siete notas en el teclado y el cifrado americano',
  'Cómo ubicar Do, Re, Mi, Fa, Sol, La y Si con los grupos de teclas negras, y cómo traducir entre los nombres en español y el cifrado americano (C, D, E, F, G, A, B).',
  'melodia',
  $melodia${
  "pasos": [
    "Las siete notas naturales son las teclas blancas del piano: Do, Re, Mi, Fa, Sol, La, Si. Las teclas negras son las notas alteradas (sostenidos y bemoles), que se estudian más adelante.",
    "Para ubicarte, usa los grupos de teclas negras. Do es la blanca a la izquierda del grupo de 2; Re queda entre esas dos negras; Mi es la siguiente. Fa es la blanca a la izquierda del grupo de 3; luego siguen Sol, La y Si.",
    "El cifrado americano da una letra a cada nota: Do = C, Re = D, Mi = E, Fa = F, Sol = G, La = A, Si = B. Las letras siguen el abecedario, pero la serie empieza en C (Do) y no en A, porque A corresponde a La.",
    "En la Práctica te preguntan en los dos sentidos: «¿cuál es el cifrado de Sol?» (G) y «¿qué nota es la letra B?» (Si). Conviene dominar ambos: la mitad de las veces hay que ir de la letra al nombre.",
    "Un truco: memoriza los extremos. Do = C (la primera de la serie) y La = A (la del principio del abecedario). El resto se cuenta desde uno de los dos.",
    "Errores comunes: creer que A es Do (es La); confundir B con Si♭ (B es Si natural; Si♭ se escribe B♭); y olvidar que en el cifrado latino (Do, Re, Mi...) y en el americano son dos maneras de nombrar exactamente las mismas notas."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 1,
      "titulo": "Las siete notas naturales",
      "grupos": true,
      "nombres": "todas",
      "notas": [
        "Do4",
        "Re4",
        "Mi4",
        "Fa4",
        "Sol4",
        "La4",
        "Si4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "Nombre en español y letra del cifrado",
      "cifrado": true,
      "nombres": "todas",
      "notas": [
        "Do4",
        "Re4",
        "Mi4",
        "Fa4",
        "Sol4",
        "La4",
        "Si4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué nota es la letra E en el cifrado americano?",
      "opciones": [
        "Mi",
        "Re",
        "Fa",
        "Si"
      ],
      "respuesta": "Mi",
      "explicacion": "C = Do, D = Re, E = Mi."
    },
    {
      "pregunta": "¿Cuál es el cifrado americano de La?",
      "opciones": [
        "A",
        "C",
        "G",
        "B"
      ],
      "respuesta": "A",
      "explicacion": "La es A, la primera letra del abecedario."
    },
    {
      "pregunta": "¿Dónde queda la nota Do en el teclado?",
      "opciones": [
        "Entre las dos negras del grupo de 2",
        "A la izquierda del grupo de 3 negras",
        "En la tecla blanca a la izquierda del grupo de 2 negras",
        "A la derecha del grupo de 3 negras"
      ],
      "respuesta": "En la tecla blanca a la izquierda del grupo de 2 negras",
      "explicacion": "Do es la blanca pegada a la izquierda del grupo de dos negras."
    },
    {
      "pregunta": "¿A qué letra corresponde Si?",
      "opciones": [
        "B",
        "A",
        "C",
        "S"
      ],
      "respuesta": "B",
      "explicacion": "La = A, Si = B, Do = C."
    },
    {
      "pregunta": "El cifrado latino (Do, Re, Mi...) y el americano (C, D, E...) son...",
      "opciones": [
        "Notas distintas",
        "Dos formas de nombrar las mismas notas",
        "Alturas separadas por un semitono",
        "Escalas distintas"
      ],
      "respuesta": "Dos formas de nombrar las mismas notas",
      "explicacion": "Do = C, Re = D, etc.: cambia el nombre, no el sonido."
    }
  ]
}$melodia$::jsonb,
  2,
  true),

('melodia-clase-figuras-y-compas', 'Figuras rítmicas, pulso y compás',
  'Cómo se escriben y qué duran la redonda, la blanca, la negra y la corchea, qué es el pulso y qué indica un compás como 4/4.',
  'melodia',
  $melodia${
  "pasos": [
    "El ritmo organiza el sonido en el tiempo. Una figura rítmica indica cuánto dura un sonido. Las cuatro básicas son redonda, blanca, negra y corchea.",
    "Cómo se dibujan: la redonda es una cabeza hueca sin plica; la blanca, cabeza hueca con plica; la negra, cabeza rellena con plica; la corchea, cabeza rellena con plica y un corchete. Cada figura tiene también un silencio de la misma duración.",
    "Sus duraciones son relativas: cada figura vale la mitad de la anterior. Tomando la negra como un pulso, la redonda dura 4, la blanca 2, la negra 1 y la corchea ½. Por eso 2 blancas = 1 redonda, 2 negras = 1 blanca y 2 corcheas = 1 negra.",
    "El pulso es el latido regular de la música, el que marcas con el pie. El compás agrupa los pulsos en bloques iguales, separados por líneas verticales (barras de compás). En 4/4, el 4 de arriba dice que hay 4 pulsos por compás y el 4 de abajo, que cada pulso vale una negra.",
    "En un compás de 4/4 caben, por ejemplo, 1 redonda, o 2 blancas, o 4 negras, u 8 corcheas, o cualquier mezcla que sume 4 pulsos: 1 blanca + 2 negras, 2 corcheas + 1 negra + 1 blanca...",
    "Errores comunes: pensar que una figura dura siempre lo mismo en segundos (depende del tempo); creer que la blanca dura menos que la negra por ser «blanca» (dura el doble); y confundir el nombre con la cantidad de pulsos. Simplificación: hay compases con otros pulsos (3/4, 6/8...) que no se estudian aquí."
  ],
  "visuales": [
    {
      "tipo": "melodia.ritmo",
      "despuesDePaso": 2,
      "titulo": "Duración de cada figura en un compás de 4/4",
      "figuras": [
        "redonda",
        "blanca",
        "negra",
        "corchea"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Si la negra dura 1 pulso, ¿cuánto dura la blanca?",
      "opciones": [
        "1 pulso",
        "4 pulsos",
        "2 pulsos",
        "medio pulso"
      ],
      "respuesta": "2 pulsos",
      "explicacion": "La blanca dura el doble que la negra."
    },
    {
      "pregunta": "¿Cuántas corcheas suman lo mismo que una negra?",
      "opciones": [
        "1",
        "2",
        "4",
        "8"
      ],
      "respuesta": "2",
      "explicacion": "La corchea vale medio pulso: 2 corcheas = 1 negra."
    },
    {
      "pregunta": "En un compás de 4/4, ¿cuántos pulsos hay en cada compás?",
      "opciones": [
        "4",
        "2",
        "3",
        "8"
      ],
      "respuesta": "4",
      "explicacion": "El número de arriba indica los pulsos por compás."
    },
    {
      "pregunta": "¿Cuál de estas combinaciones llena un compás de 4/4?",
      "opciones": [
        "1 blanca + 1 negra",
        "3 blancas",
        "2 negras + 1 redonda",
        "1 blanca + 2 negras"
      ],
      "respuesta": "1 blanca + 2 negras",
      "explicacion": "2 + 1 + 1 = 4 pulsos."
    },
    {
      "pregunta": "¿Qué figura tiene la cabeza hueca y plica?",
      "opciones": [
        "Redonda",
        "Negra",
        "Blanca",
        "Corchea"
      ],
      "respuesta": "Blanca",
      "explicacion": "Hueca sin plica es la redonda; hueca con plica, la blanca."
    }
  ]
}$melodia$::jsonb,
  3,
  true),

('melodia-clase-pentagrama-y-clave-de-sol', 'El pentagrama y la clave de sol',
  'Cómo está construido el pentagrama, qué le dice la clave de sol a cada línea y espacio y cómo leer las cinco líneas y los cuatro espacios sin contar.',
  'melodia',
  $melodia${
  "pasos": [
    "El pentagrama es un conjunto de cinco líneas horizontales y cuatro espacios entre ellas. Líneas y espacios se numeran de abajo hacia arriba: la primera línea es la de abajo. Cada posición representa una altura distinta.",
    "Para saber qué nota es cada posición hace falta una clave. La clave de sol tiene su espiral alrededor de la segunda línea y esa línea es Sol (Sol4). A partir de ahí queda fijado todo el pentagrama.",
    "Líneas, de abajo hacia arriba: Mi4, Sol4, Si4, Re5, Fa5. Espacios: Fa4, La4, Do5, Mi5. Fíjate en que el orden alterna: línea, espacio, línea... y cada posición es la nota siguiente en la serie Do-Re-Mi-Fa-Sol-La-Si.",
    "La cabeza de la nota decide la altura: solo importa dónde está sobre las líneas. Si toca una línea es una nota de línea; si queda entre dos, de espacio. La forma (hueca, rellena, con plica) informa de la duración, no de la altura.",
    "En la Práctica se pregunta el nombre y la octava de una nota escrita: por ejemplo «Sol4». Empieza siempre por ubicar la posición (línea o espacio y cuál), después su nombre y por último su octava.",
    "Errores comunes: contar las líneas desde arriba (se cuentan de abajo hacia arriba); confundir la línea de Sol con la de Fa (la clave de sol rodea la segunda línea desde abajo); y creer que la plica cambia el nombre de la nota (no lo hace). Simplificación: existen otras claves (fa, do) que asignan otras notas; aquí solo se usa la clave de sol."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Las 5 líneas",
      "etiquetas": "nombre",
      "notas": [
        "Mi4",
        "Sol4",
        "Si4",
        "Re5",
        "Fa5"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Los 4 espacios",
      "etiquetas": "nombre",
      "notas": [
        "Fa4",
        "La4",
        "Do5",
        "Mi5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué línea empieza la espiral de la clave de sol y qué nota es?",
      "opciones": [
        "En la segunda línea, Sol",
        "En la primera línea, Mi",
        "En la tercera línea, Si",
        "En la quinta línea, Fa"
      ],
      "respuesta": "En la segunda línea, Sol",
      "explicacion": "La clave de sol rodea la segunda línea desde abajo: esa línea es Sol."
    },
    {
      "pregunta": "¿Cómo se cuentan las líneas y los espacios del pentagrama?",
      "opciones": [
        "De arriba hacia abajo",
        "De izquierda a derecha",
        "Depende de la figura",
        "De abajo hacia arriba"
      ],
      "respuesta": "De abajo hacia arriba",
      "explicacion": "La primera línea es la de abajo, y se sigue hacia arriba."
    },
    {
      "pregunta": "En clave de sol, ¿qué nota es el espacio entre la 3.ª y la 4.ª línea?",
      "opciones": [
        "Re5",
        "La4",
        "Mi5",
        "Do5"
      ],
      "respuesta": "Do5",
      "explicacion": "Los espacios son Fa4, La4, Do5, Mi5: el tercero (entre la 3.ª y la 4.ª línea) es Do5."
    },
    {
      "pregunta": "¿Qué determina la altura de una nota sobre el pentagrama?",
      "opciones": [
        "Que tenga plica o no",
        "Que su cabeza esté rellena",
        "Su posición sobre las líneas y espacios",
        "El tamaño de la cabeza"
      ],
      "respuesta": "Su posición sobre las líneas y espacios",
      "explicacion": "La posición da la altura; la forma indica la duración."
    },
    {
      "pregunta": "¿Qué nota es la 4.ª línea del pentagrama en clave de sol?",
      "opciones": [
        "Si4",
        "Re5",
        "Fa5",
        "Do5"
      ],
      "respuesta": "Re5",
      "explicacion": "Líneas: Mi4, Sol4, Si4, Re5, Fa5: la cuarta es Re5."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-lineas-adicionales', 'Líneas adicionales: leer más allá de las cinco líneas',
  'Cómo se escriben las notas más graves y más agudas con líneas adicionales, cómo calcular su nombre desde una nota conocida y cuál es el rango que se practica (de Fa3 a Do6).',
  'melodia',
  $melodia${
  "pasos": [
    "El pentagrama solo alcanza de Mi4 a Fa5 (y sus espacios). Para notas más graves o más agudas se añaden líneas adicionales: trazos cortos, del ancho de la nota, que prolongan el pentagrama con la misma separación entre líneas.",
    "La lógica no cambia: sigue la alternancia de línea y espacio. Cada posición hacia arriba es la nota siguiente del nombre y cada posición hacia abajo, la anterior.",
    "Hacia abajo: desde la línea Mi4 baja el espacio Re4; luego, la primera línea adicional es Do4 (el Do central). Siguen Si3 (espacio), La3 (segunda adicional), Sol3 (espacio) y Fa3 (tercera adicional).",
    "Hacia arriba: desde la línea Fa5 sube el espacio Sol5; la primera línea adicional es La5. Siguen Si5 (espacio) y Do6 (segunda adicional).",
    "Estrategia: apóyate en puntos de referencia y cuenta desde ellos. Do4 (adicional de abajo), Mi4 (primera línea), Sol4 (segunda línea), Fa5 (última línea) y La5 y Do6 (las de arriba) son buenos anclajes; el resto se cuenta de a un paso.",
    "En la Práctica el rango llega de Fa3 a Do6 en los niveles altos: los primeros niveles usan solo las líneas y Do4; luego se suman Si3 y Sol5, después La3 y La5, y así hasta Fa3 y Do6. Errores comunes: olvidar contar la línea adicional como una posición más (una línea adicional es una nota); y confundir Do4 con Do5 (Do4 queda debajo del pentagrama, en una línea adicional; Do5 es el tercer espacio, entre la 3.ª y la 4.ª línea)."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Por debajo del pentagrama",
      "etiquetas": "nombre",
      "notas": [
        "Do4",
        "Si3",
        "La3",
        "Sol3",
        "Fa3"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 3,
      "titulo": "Por encima del pentagrama",
      "etiquetas": "nombre",
      "notas": [
        "Fa5",
        "Sol5",
        "La5",
        "Si5",
        "Do6"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué posición se escribe Do4 (el Do central) en clave de sol?",
      "opciones": [
        "En la primera línea del pentagrama",
        "En la primera línea adicional por debajo del pentagrama",
        "En el primer espacio",
        "En la segunda línea adicional por debajo"
      ],
      "respuesta": "En la primera línea adicional por debajo del pentagrama",
      "explicacion": "Do4 se apoya sobre una línea adicional corta justo debajo del pentagrama."
    },
    {
      "pregunta": "Contando hacia abajo desde Do4, ¿cuál es la nota siguiente?",
      "opciones": [
        "Re4",
        "Si4",
        "Si3",
        "La4"
      ],
      "respuesta": "Si3",
      "explicacion": "La nota anterior a Do es Si, y como se pasa a la octava de abajo, es Si3."
    },
    {
      "pregunta": "¿Qué nota se escribe en la primera línea adicional por encima del pentagrama?",
      "opciones": [
        "Sol5",
        "Si5",
        "La5",
        "Do6"
      ],
      "respuesta": "La5",
      "explicacion": "Fa5 (línea), Sol5 (espacio), La5 (primera adicional)."
    },
    {
      "pregunta": "¿Qué nota está en la segunda línea adicional por encima del pentagrama?",
      "opciones": [
        "Si5",
        "La5",
        "Re6",
        "Do6"
      ],
      "respuesta": "Do6",
      "explicacion": "La5 (1.ª adicional), Si5 (espacio), Do6 (2.ª adicional)."
    },
    {
      "pregunta": "¿Qué nota está en la tercera línea adicional por debajo del pentagrama?",
      "opciones": [
        "Sol3",
        "La3",
        "Fa3",
        "Mi3"
      ],
      "respuesta": "Fa3",
      "explicacion": "Do4 (1.ª), La3 (2.ª) y Fa3 (3.ª adicional), con Si3 y Sol3 en los espacios."
    }
  ]
}$melodia$::jsonb,
  2,
  true),

('melodia-clase-nombre-y-octava', 'El nombre completo de una nota: letra y octava',
  'Cómo pasar de una posición en el pentagrama a un nombre con octava (Sol4, Re5, Si3...), qué papel cumple el Do y cómo se relaciona con las teclas del piano.',
  'melodia',
  $melodia${
  "pasos": [
    "El nombre completo de una nota tiene dos partes: la letra (Do, Re, Mi...) y el número de octava. La posición en el pentagrama da las dos cosas a la vez: no basta con saber que es un Sol, hay que saber cuál Sol.",
    "Cómo saber la octava: el número sube cada vez que pasas de Si a Do. Con las notas de referencia del pentagrama: de Do4 a Si4 es la octava 4 (Do4, Re4, Mi4, Fa4, Sol4, La4, Si4); de Do5 a Si5, la 5; hacia abajo, Si3 es la última de la octava 3.",
    "Ejemplos: la segunda línea es Sol4; la línea de arriba, Fa5; el espacio entre la 3.ª y la 4.ª línea, Do5; una nota justo debajo de Do4 se llama Si3, no Si4.",
    "Para responder rápido: primero ubica la posición (línea o espacio), después la letra (con la frase de las 9 posiciones) y al final la octava (¿está por encima o por debajo de Do4? ¿cruzó un Do?).",
    "Errores comunes: dar la octava por «la más cercana» sin fijarse en Do (Si3 y Si4 están a una octava de distancia, y Si3 queda debajo de Do4); cambiar de octava en La en vez de en Do; y confundir el nombre de una nota con su posición en el teclado (una posición del pentagrama es una nota natural; las teclas negras se escriben con alteraciones)."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Sol4, Do5 y Fa5",
      "etiquetas": "nombre",
      "notas": [
        "Sol4",
        "Do5",
        "Fa5"
      ]
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 2,
      "titulo": "Si3, justo debajo de Do4",
      "etiquetas": "nombre",
      "notas": [
        "Si3",
        "Do4",
        "Re4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 3,
      "titulo": "En el teclado: Si3 y Do4 son vecinas",
      "desde": "Sol3",
      "hasta": "Mi4",
      "nombres": "todas",
      "notas": [
        "Si3",
        "Do4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En clave de sol, ¿qué nota es la segunda línea desde abajo?",
      "opciones": [
        "Sol5",
        "Sol4",
        "Si4",
        "Mi4"
      ],
      "respuesta": "Sol4",
      "explicacion": "La segunda línea es Sol y está en la octava 4."
    },
    {
      "pregunta": "¿Qué nota escrita justo debajo de Do4 tiene el número de octava correcto?",
      "opciones": [
        "Si4",
        "Si5",
        "Si3",
        "La4"
      ],
      "respuesta": "Si3",
      "explicacion": "El número de octava sube en Do: la nota anterior a Do4 es Si3."
    },
    {
      "pregunta": "¿Qué nota es la línea de más arriba del pentagrama en clave de sol?",
      "opciones": [
        "Fa5",
        "Fa4",
        "Mi5",
        "Sol5"
      ],
      "respuesta": "Fa5",
      "explicacion": "La quinta línea es Fa y está en la octava 5."
    },
    {
      "pregunta": "¿Cuál es el orden más útil para leer una nota del pentagrama?",
      "opciones": [
        "Octava, luego color, luego letra",
        "Posición, luego letra y luego octava",
        "Letra, luego forma, luego plica",
        "Duración, luego letra, luego octava"
      ],
      "respuesta": "Posición, luego letra y luego octava",
      "explicacion": "Primero ubicas dónde está, después su letra y por último la octava."
    },
    {
      "pregunta": "Una nota escrita justo debajo de Do4 es una Si. ¿Por qué se llama Si3 y no Si4?",
      "opciones": [
        "Porque Si siempre es de la octava 3",
        "Porque está en una línea adicional",
        "Porque es una nota alterada",
        "Porque el número de octava sube en Do: Si3 es la nota anterior a Do4"
      ],
      "respuesta": "Porque el número de octava sube en Do: Si3 es la nota anterior a Do4",
      "explicacion": "Si3 y Si4 están a una octava de distancia; la que queda pegada debajo de Do4 es Si3."
    }
  ]
}$melodia$::jsonb,
  3,
  true),

('melodia-clase-tonos-y-semitonos', 'Semitonos y tonos: la unidad de medida de la música',
  'Qué es un semitono y qué es un tono, cómo se cuentan sobre el teclado, cuáles son los saltos entre las notas naturales y por qué una octava suma 12 semitonos.',
  'melodia',
  $melodia${
  "pasos": [
    "El semitono es la distancia más pequeña de la música occidental: de una tecla del piano a la tecla vecina, sea blanca o negra. Un tono son dos semitonos: de una tecla a la segunda vecina.",
    "Una octava, de un Do al siguiente, tiene 12 semitonos: las 12 teclas (7 blancas y 5 negras) que van de un Do hasta antes del siguiente. Por eso todas las distancias musicales se pueden medir contando teclas.",
    "Entre las notas naturales, casi todas están a un tono: Do-Re, Re-Mi, Fa-Sol, Sol-La y La-Si. Solo dos parejas están a un semitono, porque no tienen tecla negra en medio: Mi-Fa y Si-Do.",
    "Recorriendo Do-Re-Mi-Fa-Sol-La-Si-Do: T, T, S, T, T, T, S (T = tono, S = semitono). Suma 5 tonos y 2 semitonos: 5 × 2 + 2 = 12 semitonos, una octava completa.",
    "Esta secuencia de saltos, T-T-S-T-T-T-S, es la que define la escala mayor. En la clase de escalas se aplica a cualquier nota de partida.",
    "Errores comunes: contar la nota de partida como un semitono (se cuentan los saltos, no las teclas donde empiezas); pensar que un tono es la distancia entre teclas blancas vecinas (Mi-Fa es un semitono, aunque sean blancas vecinas); y creer que el semitono es «media octava» (es un doceavo)."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 3,
      "titulo": "Tonos (T) y semitonos (S) entre las notas naturales",
      "desde": "Do4",
      "hasta": "Do5",
      "saltos": true,
      "nombres": "resaltadas",
      "notas": [
        "Do4",
        "Re4",
        "Mi4",
        "Fa4",
        "Sol4",
        "La4",
        "Si4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos semitonos tiene un tono?",
      "opciones": [
        "1",
        "3",
        "4",
        "2"
      ],
      "respuesta": "2",
      "explicacion": "Un tono equivale a dos semitonos."
    },
    {
      "pregunta": "¿Cuántos semitonos hay en una octava?",
      "opciones": [
        "7",
        "12",
        "8",
        "10"
      ],
      "respuesta": "12",
      "explicacion": "Las 12 teclas (7 blancas y 5 negras) de un Do al siguiente."
    },
    {
      "pregunta": "¿Entre cuáles notas naturales hay solo un semitono?",
      "opciones": [
        "Do-Re y Fa-Sol",
        "Mi-Fa y Si-Do",
        "Re-Mi y La-Si",
        "Sol-La y Do-Re"
      ],
      "respuesta": "Mi-Fa y Si-Do",
      "explicacion": "No hay tecla negra entre Mi y Fa, ni entre Si y Do."
    },
    {
      "pregunta": "¿Cuántos tonos y semitonos suman las notas naturales de Do a Do, de una octava?",
      "opciones": [
        "4 tonos y 3 semitonos",
        "5 tonos y 2 semitonos",
        "6 tonos y 1 semitono",
        "7 tonos"
      ],
      "respuesta": "5 tonos y 2 semitonos",
      "explicacion": "T, T, S, T, T, T, S: 5 tonos y 2 semitonos suman 12 semitonos."
    },
    {
      "pregunta": "¿Cuántos semitonos hay de Mi a Sol?",
      "opciones": [
        "2",
        "3",
        "4",
        "1"
      ],
      "respuesta": "3",
      "explicacion": "Mi-Fa es 1 semitono y Fa-Sol es 2 (un tono): 1 + 2 = 3."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-sostenido-bemol-becuadro', 'Sostenido, bemol y becuadro',
  'Qué hacen las tres alteraciones básicas, cómo se dibujan junto a la nota, y cómo se lee una nota alterada en el pentagrama.',
  'melodia',
  $melodia${
  "pasos": [
    "Las alteraciones modifican la altura de una nota sin cambiarle el nombre de letra. El sostenido (♯) la sube un semitono; el bemol (♭) la baja un semitono; el becuadro (♮) cancela una alteración anterior y devuelve la nota a su forma natural.",
    "En el pentagrama, el símbolo se escribe a la izquierda de la cabeza de la nota, a su misma altura. La nota no se mueve: Fa♯ se escribe en la misma posición que Fa, y Fa♭ también.",
    "En el teclado, los sostenidos y bemoles suelen caer en teclas negras: Do♯ es la negra entre Do y Re, y Re♭ es esa misma tecla vista desde Re. Los casos que no usan tecla negra (Mi♯, Si♯, Fa♭, Do♭) se ven en la clase de enarmonía.",
    "Las siete notas pueden llevar sostenido o bemol: Do♯, Re♯, Mi♯, Fa♯, Sol♯, La♯, Si♯ y Do♭, Re♭, Mi♭, Fa♭, Sol♭, La♭, Si♭. En la Práctica te muestran una de ellas y debes nombrarla con su octava (por ejemplo, Sol♯4).",
    "Regla de partitura: una alteración escrita durante un compás vale para esa nota (en esa posición) hasta la barra de compás, salvo que un becuadro la cancele antes. Las alteraciones de una armadura (las que se escriben al inicio) valen para toda la pieza. En esta clase solo se estudian las que van junto a la nota.",
    "Errores comunes: leer la alteración como si cambiara la letra (Fa♯ sigue siendo una nota Fa modificada); confundir ♯ con ♭ (♯ sube, ♭ baja); y olvidar que existen también el doble sostenido y el doble bemol, que aquí no se estudian."
  ],
  "visuales": [
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 1,
      "titulo": "La misma posición: natural, sostenido y bemol",
      "etiquetas": "nombre",
      "notas": [
        "Sol4",
        "Sol♯4",
        "Sol♭4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "Sol, Sol♯ y Sol♭ en el teclado",
      "desde": "Fa4",
      "hasta": "La4",
      "textos": [
        "Sol",
        "Sol♯",
        "Sol♭"
      ],
      "notas": [
        "Sol4",
        "Sol♯4",
        "Sol♭4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué hace un bemol (♭) a una nota?",
      "opciones": [
        "La baja un semitono",
        "La sube un semitono",
        "La baja un tono",
        "La cancela"
      ],
      "respuesta": "La baja un semitono",
      "explicacion": "Un bemol baja la nota medio tono (un semitono)."
    },
    {
      "pregunta": "¿Qué función tiene el becuadro (♮)?",
      "opciones": [
        "Sube la nota un tono",
        "Cancela una alteración anterior y devuelve la nota a su forma natural",
        "Baja la nota un tono",
        "Repite la nota"
      ],
      "respuesta": "Cancela una alteración anterior y devuelve la nota a su forma natural",
      "explicacion": "El becuadro deja la nota natural, sin sostenido ni bemol."
    },
    {
      "pregunta": "¿Dónde se escribe el símbolo de alteración respecto de la nota?",
      "opciones": [
        "A la derecha de la nota",
        "Encima de la plica",
        "A la izquierda de la cabeza de la nota",
        "Debajo del pentagrama"
      ],
      "respuesta": "A la izquierda de la cabeza de la nota",
      "explicacion": "La alteración va delante de la nota, a su misma altura."
    },
    {
      "pregunta": "¿La posición de Fa♯ en el pentagrama es distinta que la de Fa?",
      "opciones": [
        "Sí: está un espacio más arriba",
        "Sí: está una línea más abajo",
        "No: es la misma posición, con el símbolo delante",
        "Sí: cambia de clave"
      ],
      "respuesta": "No: es la misma posición, con el símbolo delante",
      "explicacion": "La alteración no mueve la nota: solo cambia su altura real."
    },
    {
      "pregunta": "¿Cuál de estas notas alteradas es válida (existe y se puede escribir)?",
      "opciones": [
        "Ninguna: Mi no admite alteraciones",
        "Mi♯",
        "Solo Do♯ y Fa♯ existen",
        "Solo los bemoles existen"
      ],
      "respuesta": "Mi♯",
      "explicacion": "Las siete notas pueden llevar ♯ o ♭; Mi♯ suena igual que Fa."
    }
  ]
}$melodia$::jsonb,
  2,
  true),

('melodia-clase-enarmonia', 'Enarmonía: un sonido, dos nombres',
  'Por qué cada tecla negra tiene dos nombres, cuáles son los cuatro casos en que una nota alterada suena como una tecla blanca (Mi♯, Si♯, Fa♭, Do♭) y cómo evitar la trampa del enarmónico en la Práctica.',
  'melodia',
  $melodia${
  "pasos": [
    "Dos notas son enarmónicas si suenan igual (en el piano, es la misma tecla) pero se escriben con nombres distintos. Cada tecla negra tiene dos nombres: Do♯ o Re♭, Re♯ o Mi♭, Fa♯ o Sol♭, Sol♯ o La♭, La♯ o Si♭.",
    "Cuál de los dos usar depende de la escala y de la letra que necesite la escritura: en Sol mayor aparece Fa♯ (no Sol♭) porque la escala usa una letra por grado. En una nota suelta se puede elegir, y por eso en la Práctica ves tanto sostenidos como bemoles.",
    "También hay enarmonías con teclas blancas, porque Mi-Fa y Si-Do están a un semitono: Mi♯ = Fa, Si♯ = Do (de la octava siguiente), Fa♭ = Mi y Do♭ = Si (de la octava anterior). Son raras en la práctica musical, pero son válidas y la Práctica las usa.",
    "Cómo evitar la trampa: cuando una pregunta te ofrece dos nombres que suenan igual, el correcto es el que corresponde a la posición dibujada. Una nota dibujada en la posición de Mi con ♯ delante es Mi♯, no Fa. Lee primero la letra por la posición.",
    "Simplificación: la equivalencia perfecta vale en el afinado del piano (temperamento igual). En teoría musical las notas enarmónicas se distinguen por su función dentro de la tonalidad, y algunos instrumentos las afinan con matices distintos.",
    "Errores comunes: creer que Do♯ y Re♭ son teclas distintas (en el piano son la misma); contestar por el sonido en vez de por la posición; y olvidar que Si♯ cae en la octava siguiente y Do♭ en la anterior (el número de octava cambia)."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 0,
      "titulo": "Cada tecla negra, dos nombres",
      "desde": "Do4",
      "hasta": "Si4",
      "textos": [
        "Do♯=Re♭",
        "Re♯=Mi♭",
        "Fa♯=Sol♭",
        "Sol♯=La♭",
        "La♯=Si♭"
      ],
      "notas": [
        "Do♯4",
        "Re♯4",
        "Fa♯4",
        "Sol♯4",
        "La♯4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "Mi♯ = Fa · Si♯ = Do",
      "desde": "Do4",
      "hasta": "Do5",
      "nombres": "todas",
      "textos": [
        "Mi=Fa♭",
        "Fa=Mi♯",
        "Si=Do♭",
        "Do=Si♯"
      ],
      "notas": [
        "Mi4",
        "Fa4",
        "Si4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se llaman las dos formas de nombrar la tecla negra entre La y Si?",
      "opciones": [
        "La♭ y Si♯",
        "La♯ y Si♭",
        "Sol♯ y La♭",
        "La♯ y Si♯"
      ],
      "respuesta": "La♯ y Si♭",
      "explicacion": "La♯ y Si♭ son enarmónicas."
    },
    {
      "pregunta": "¿Con qué nota suena igual Fa♭?",
      "opciones": [
        "Fa♯",
        "Sol♭",
        "Mi",
        "Re♯"
      ],
      "respuesta": "Mi",
      "explicacion": "Fa♭ baja Fa un semitono: es Mi."
    },
    {
      "pregunta": "Una nota dibujada en la posición de Mi con ♯ delante es...",
      "opciones": [
        "Fa",
        "Fa♯",
        "Re♯",
        "Mi♯"
      ],
      "respuesta": "Mi♯",
      "explicacion": "La posición da la letra: Mi♯ (suena igual que Fa, pero se nombra por la posición)."
    },
    {
      "pregunta": "¿En qué octava cae Si♯3?",
      "opciones": [
        "Suena como Do4, en la octava siguiente",
        "Suena como Do3, en la misma octava",
        "Suena como La♯3",
        "Suena como Si4"
      ],
      "respuesta": "Suena como Do4, en la octava siguiente",
      "explicacion": "Subir Si3 un semitono da Do4."
    },
    {
      "pregunta": "¿Por qué Do♯ y Re♭ son la misma tecla del piano?",
      "opciones": [
        "Porque Do y Re son la misma nota",
        "Porque las dos están una octava aparte",
        "Porque el bemol y el sostenido no cambian la altura",
        "Porque entre Do y Re hay una sola tecla negra, un semitono arriba de Do y uno abajo de Re"
      ],
      "respuesta": "Porque entre Do y Re hay una sola tecla negra, un semitono arriba de Do y uno abajo de Re",
      "explicacion": "Do♯ sube Do un semitono y Re♭ baja Re un semitono: llegan a la misma tecla."
    }
  ]
}$melodia$::jsonb,
  3,
  true),

('melodia-clase-escala-mayor', 'La escala mayor',
  'Qué es una escala, sus grados y su fórmula de tonos y semitonos, y cómo construir la escala mayor desde Do, Sol o Fa.',
  'melodia',
  $melodia${
  "pasos": [
    "Una escala es una serie de notas ordenadas por altura dentro de una octava, con una distribución fija de tonos y semitonos. La primera nota (la tónica) le da el nombre, y cada nota tiene un grado: 1.º, 2.º... 7.º y el 8.º, que repite la tónica una octava arriba.",
    "Recuerda: un tono son 2 semitonos y un semitono es la distancia entre teclas vecinas (blancas o negras). La escala mayor sigue siempre la fórmula T-T-S-T-T-T-S, es decir, 2-2-1-2-2-2-1 semitonos, que suma 12 (una octava).",
    "Do mayor cae sobre las teclas blancas: Do-Re-Mi-Fa-Sol-La-Si-Do. Los semitonos están en Mi-Fa y Si-Do.",
    "Sol mayor: Sol-La-Si-Do-Re-Mi-Fa♯-Sol. Hace falta el Fa♯ (una tecla negra) para que entre el 6.º y el 7.º haya un tono, y del 7.º a la octava, un semitono.",
    "Fa mayor: Fa-Sol-La-Si♭-Do-Re-Mi-Fa. Aquí hace falta el Si♭ para que entre el 3.º y el 4.º haya un semitono (La-Si♭).",
    "Errores comunes: contar mal los semitonos (se cuentan los saltos, no las teclas); olvidar las teclas negras; y creer que hay una sola grafía posible. Simplificación: en la Práctica, Fa mayor puede aparecer escrita con La♯ en lugar de Si♭ porque las alteradas se escriben siempre con sostenidos o siempre con bemoles; suena igual. En una partitura se usa una letra por grado."
  ],
  "visuales": [
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 2,
      "titulo": "Do mayor",
      "escuchar": true,
      "escala": {
        "fundamental": "Do4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 3,
      "titulo": "Sol mayor",
      "escala": {
        "fundamental": "Sol4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 4,
      "titulo": "Fa mayor",
      "escala": {
        "fundamental": "Fa4",
        "tipo": "mayor",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 3,
      "titulo": "Sol mayor en el pentagrama",
      "etiquetas": "letra",
      "escala": {
        "fundamental": "Sol4",
        "tipo": "mayor"
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos semitonos hay en total en la escala mayor, de la tónica a su octava?",
      "opciones": [
        "12",
        "7",
        "10",
        "14"
      ],
      "respuesta": "12",
      "explicacion": "2+2+1+2+2+2+1 = 12."
    },
    {
      "pregunta": "¿Qué fórmula de semitonos tiene la escala mayor?",
      "opciones": [
        "2-2-1-2-2-2-1",
        "2-1-2-2-1-2-2",
        "2-2-3-2-3",
        "1-2-2-1-2-2-2"
      ],
      "respuesta": "2-2-1-2-2-2-1",
      "explicacion": "Es la fórmula T-T-S-T-T-T-S."
    },
    {
      "pregunta": "¿Cuál es la escala de Sol mayor?",
      "opciones": [
        "Sol-La-Si-Do-Re-Mi-Fa♯-Sol",
        "Sol-La-Si-Do-Re-Mi-Fa-Sol",
        "Sol-La♭-Si♭-Do-Re-Mi♭-Fa-Sol",
        "Sol-La-Si♭-Do-Re-Mi-Fa♯-Sol"
      ],
      "respuesta": "Sol-La-Si-Do-Re-Mi-Fa♯-Sol",
      "explicacion": "Necesita Fa♯ para que el 7.º grado quede a un semitono de la octava."
    },
    {
      "pregunta": "¿Cuál es el 4.º grado de Fa mayor?",
      "opciones": [
        "Si",
        "Si♭",
        "La",
        "Do"
      ],
      "respuesta": "Si♭",
      "explicacion": "Fa-Sol-La-Si♭: entre La y Si♭ hay un semitono, como manda la fórmula."
    },
    {
      "pregunta": "¿Dónde están los semitonos de Do mayor?",
      "opciones": [
        "Entre Do-Re y Re-Mi",
        "Entre Fa-Sol y Sol-La",
        "Entre Mi-Fa y entre Si-Do",
        "Entre La-Si y Si-Do únicamente"
      ],
      "respuesta": "Entre Mi-Fa y entre Si-Do",
      "explicacion": "No hay tecla negra entre Mi y Fa, ni entre Si y Do."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-escala-menor-natural', 'La escala menor natural y las escalas relativas',
  'La fórmula de la escala menor natural, su relación con la mayor (relativas) y cómo construirla desde La, Mi o Re.',
  'melodia',
  $melodia${
  "pasos": [
    "La escala menor natural tiene la fórmula T-S-T-T-S-T-T, es decir, 2-1-2-2-1-2-2 semitonos (suma 12). Sus dos semitonos caen entre el 2.º y el 3.º grado, y entre el 5.º y el 6.º.",
    "Comparada con la mayor de la misma tónica, la menor natural tiene tres notas más bajas: el 3.º, el 6.º y el 7.º grado. Ese 3.º grado más bajo (3 semitonos sobre la tónica, en lugar de 4) es lo que da el carácter «menor».",
    "Relativas: cada mayor tiene una menor con sus mismas notas, que empieza en el 6.º grado de la mayor. La menor natural son las notas de esa mayor empezadas en su 6.º grado; La menor y Do mayor comparten todas sus notas.",
    "La menor: La-Si-Do-Re-Mi-Fa-Sol-La (solo teclas blancas). Mi menor: Mi-Fa♯-Sol-La-Si-Do-Re-Mi (mismas notas que Sol mayor). Re menor: Re-Mi-Fa-Sol-La-Si♭-Do-Re (mismas que Fa mayor).",
    "Errores comunes: creer que menor es simplemente «mayor con bemoles en todo» (solo bajan el 3.º, 6.º y 7.º); confundir una escala con su relativa (comparten notas, pero tienen distinta tónica); y olvidar que hay otras variantes menores. Simplificación: aquí se estudia solo la menor natural, no la armónica ni la melódica."
  ],
  "visuales": [
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 3,
      "titulo": "La menor natural",
      "escuchar": true,
      "escala": {
        "fundamental": "La3",
        "tipo": "menor_natural"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 3,
      "titulo": "Mi menor natural",
      "escala": {
        "fundamental": "Mi4",
        "tipo": "menor_natural"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 3,
      "titulo": "Re menor natural",
      "escala": {
        "fundamental": "Re4",
        "tipo": "menor_natural",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué fórmula de semitonos tiene la escala menor natural?",
      "opciones": [
        "2-2-1-2-2-2-1",
        "3-2-2-3-2",
        "2-2-3-2-3",
        "2-1-2-2-1-2-2"
      ],
      "respuesta": "2-1-2-2-1-2-2",
      "explicacion": "T-S-T-T-S-T-T."
    },
    {
      "pregunta": "¿Qué grados son más bajos en una menor natural que en la mayor de la misma tónica?",
      "opciones": [
        "El 2.º, el 4.º y el 5.º",
        "Solo el 3.º",
        "El 3.º, el 6.º y el 7.º",
        "El 1.º y el 8.º"
      ],
      "respuesta": "El 3.º, el 6.º y el 7.º",
      "explicacion": "Son las tres notas que bajan medio tono."
    },
    {
      "pregunta": "¿Con qué escala mayor comparte notas Mi menor?",
      "opciones": [
        "Mi mayor",
        "Sol mayor",
        "Re mayor",
        "Do mayor"
      ],
      "respuesta": "Sol mayor",
      "explicacion": "Mi es el 6.º grado de Sol mayor."
    },
    {
      "pregunta": "¿Cuál es la 3.ª nota de La menor natural?",
      "opciones": [
        "Do♯",
        "Do",
        "Si",
        "Re"
      ],
      "respuesta": "Do",
      "explicacion": "La-Si-Do: de La a Do hay 3 semitonos (3.ª menor)."
    },
    {
      "pregunta": "¿Qué es la escala relativa de una escala mayor?",
      "opciones": [
        "La menor que empieza en su 6.º grado y usa las mismas notas",
        "Una escala mayor a una octava de distancia",
        "La misma escala tocada al revés",
        "Una escala con todas las notas alteradas"
      ],
      "respuesta": "La menor que empieza en su 6.º grado y usa las mismas notas",
      "explicacion": "Ejemplo: La menor es la relativa de Do mayor."
    }
  ]
}$melodia$::jsonb,
  2,
  true),

('melodia-clase-pentatonicas', 'Las escalas pentatónicas mayor y menor',
  'Escalas de cinco notas: sus fórmulas, cómo salen de la mayor y de la menor natural quitando dos grados, y cómo reconocerlas.',
  'melodia',
  $melodia${
  "pasos": [
    "«Pentatónica» significa «cinco sonidos». Son escalas de cinco notas por octava, sin los grados que crean semitonos dentro de la escala, por eso suenan muy «abiertas» y se usan en muchas músicas del mundo.",
    "Pentatónica mayor: fórmula 2-2-3-2-3 semitonos (T-T-1½-T-1½). Sale de la escala mayor quitando el 4.º y el 7.º grado. Do pentatónica mayor: Do-Re-Mi-Sol-La (se quitan Fa y Si).",
    "Pentatónica menor: fórmula 3-2-2-3-2 semitonos. Sale de la menor natural quitando el 2.º y el 6.º grado. La pentatónica menor: La-Do-Re-Mi-Sol (se quitan Si y Fa).",
    "Las dos son relativas, como la mayor y la menor: La pentatónica menor tiene las mismas cinco notas que Do pentatónica mayor.",
    "Cómo reconocerlas en la Práctica: dibujadas son 6 notas (con la octava). Si el primer salto es de un tono, es pentatónica mayor; si es de tono y medio (3 semitonos), pentatónica menor. Los saltos de 3 semitonos son los que la distinguen de la mayor y de la menor natural.",
    "Errores comunes: contar la octava como si fuera una sexta nota distinta (repite la primera); confundir la pentatónica menor con la menor natural (la pentatónica tiene solo cinco notas); y suponer que su fórmula suma menos de una octava (2+2+3+2+3 = 12 y 3+2+2+3+2 = 12)."
  ],
  "visuales": [
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 1,
      "titulo": "Do pentatónica mayor",
      "escuchar": true,
      "escala": {
        "fundamental": "Do4",
        "tipo": "pentatonica_mayor"
      }
    },
    {
      "tipo": "melodia.escala",
      "despuesDePaso": 2,
      "titulo": "La pentatónica menor",
      "escala": {
        "fundamental": "La3",
        "tipo": "pentatonica_menor"
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas notas distintas tiene una escala pentatónica dentro de una octava?",
      "opciones": [
        "4",
        "5",
        "6",
        "7"
      ],
      "respuesta": "5",
      "explicacion": "«Penta» significa cinco."
    },
    {
      "pregunta": "¿Qué fórmula de semitonos tiene la pentatónica mayor?",
      "opciones": [
        "3-2-2-3-2",
        "2-2-1-2-2-2-1",
        "2-1-2-2-1-2-2",
        "2-2-3-2-3"
      ],
      "respuesta": "2-2-3-2-3",
      "explicacion": "Tono, tono, tono y medio, tono, tono y medio."
    },
    {
      "pregunta": "¿Qué grados se quitan de la escala mayor para obtener la pentatónica mayor?",
      "opciones": [
        "El 2.º y el 6.º",
        "El 3.º y el 7.º",
        "El 1.º y el 5.º",
        "El 4.º y el 7.º"
      ],
      "respuesta": "El 4.º y el 7.º",
      "explicacion": "En Do mayor se quitan Fa y Si: quedan Do-Re-Mi-Sol-La."
    },
    {
      "pregunta": "¿Cuál es la pentatónica menor de La?",
      "opciones": [
        "La-Si-Do♯-Mi-Fa♯",
        "La-Do-Re-Mi-Sol",
        "La-Si-Do-Re-Mi",
        "La-Do-Re♯-Mi-Sol"
      ],
      "respuesta": "La-Do-Re-Mi-Sol",
      "explicacion": "Sale de La menor natural quitando el 2.º (Si) y el 6.º (Fa)."
    },
    {
      "pregunta": "Una secuencia parte de Do, tiene 6 notas y su primer salto es de 3 semitonos. ¿Qué escala es?",
      "opciones": [
        "Pentatónica mayor",
        "Menor natural",
        "Pentatónica menor",
        "Mayor"
      ],
      "respuesta": "Pentatónica menor",
      "explicacion": "El salto inicial de tono y medio es la firma de la pentatónica menor."
    }
  ]
}$melodia$::jsonb,
  3,
  true),

('melodia-clase-intervalos-y-terceras', 'Intervalos: medir la distancia entre dos notas',
  'Qué es un intervalo, cómo se cuenta por semitonos, cuáles son las terceras y quintas que forman los acordes y por qué un acorde es una pila de terceras.',
  'melodia',
  $melodia${
  "pasos": [
    "Un intervalo es la distancia entre dos notas. Se puede medir en semitonos, contando teclas del piano de una a otra sin contar la de partida: de Do a Mi son 4 semitonos (Do♯, Re, Re♯, Mi).",
    "También se nombra por número de letras: de Do a Mi (Do, Re, Mi) es una 3.ª; de Do a Sol, una 5.ª; de Do a Si, una 7.ª. El nombre completo suma la calidad: mayor, menor, justa, aumentada o disminuida.",
    "Las terceras: 3.ª menor = 3 semitonos (Do-Mi♭); 3.ª mayor = 4 semitonos (Do-Mi). Las quintas: 5.ª justa = 7 semitonos (Do-Sol); 5.ª disminuida = 6 (Do-Sol♭); 5.ª aumentada = 8 (Do-Sol♯).",
    "Las séptimas: 7.ª menor = 10 semitonos (Do-Si♭); 7.ª mayor = 11 (Do-Si); 7.ª disminuida = 9 (se escribe con un doble bemol sobre Si y suena como La). Otras distancias que aparecen en los acordes: 2.ª mayor = 2, 4.ª justa = 5, y una octava más arriba, la 9.ª = 14, la 11.ª = 17 y la 13.ª = 21.",
    "Un acorde se arma apilando terceras sobre una nota fundamental: fundamental, 3.ª, 5.ª y, si sigue, 7.ª, 9.ª, 11.ª, 13.ª. En el pentagrama se ve como notas en líneas o espacios consecutivos (una sí, una no).",
    "Errores comunes: contar la nota de partida como un semitono (Do a Mi es 4, no 5); confundir el número con los semitonos (una 3.ª son 3 o 4 semitonos, no 3 siempre); y creer que todos los intervalos de un mismo nombre miden lo mismo (una 3.ª puede ser mayor o menor). Simplificación: se estudian solo los intervalos que usan los acordes."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "3.ª mayor: de Do a Mi, 4 semitonos",
      "desde": "Do4",
      "hasta": "Sol4",
      "saltos": true,
      "textos": [
        "Do",
        "Mi"
      ],
      "notas": [
        "Do4",
        "Mi4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "3.ª menor: de Do a Mi♭, 3 semitonos",
      "desde": "Do4",
      "hasta": "Sol4",
      "saltos": true,
      "textos": [
        "Do",
        "Mi♭"
      ],
      "notas": [
        "Do4",
        "Mi♭4"
      ]
    },
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "5.ª justa: de Do a Sol, 7 semitonos",
      "desde": "Do4",
      "hasta": "Sol4",
      "saltos": true,
      "textos": [
        "Do",
        "Sol"
      ],
      "notas": [
        "Do4",
        "Sol4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos semitonos hay entre Do y Mi?",
      "opciones": [
        "3",
        "5",
        "4",
        "2"
      ],
      "respuesta": "4",
      "explicacion": "Do♯, Re, Re♯, Mi: 4 semitonos (3.ª mayor)."
    },
    {
      "pregunta": "¿Cuántos semitonos mide una 5.ª justa?",
      "opciones": [
        "6",
        "7",
        "8",
        "5"
      ],
      "respuesta": "7",
      "explicacion": "Ejemplo: de Do a Sol hay 7 semitonos."
    },
    {
      "pregunta": "¿Cuántos semitonos mide una 3.ª menor?",
      "opciones": [
        "4",
        "2",
        "3",
        "5"
      ],
      "respuesta": "3",
      "explicacion": "Ejemplo: de Do a Mi♭ hay 3 semitonos."
    },
    {
      "pregunta": "¿Cómo se arma un acorde según esta clase?",
      "opciones": [
        "Sumando notas al azar",
        "Tocando una escala completa",
        "Apilando terceras sobre una fundamental",
        "Repitiendo la misma nota en distintas octavas"
      ],
      "respuesta": "Apilando terceras sobre una fundamental",
      "explicacion": "Fundamental, 3.ª, 5.ª, 7.ª..., cada una a una tercera de la anterior."
    },
    {
      "pregunta": "¿Cuántos semitonos mide una 7.ª mayor?",
      "opciones": [
        "10",
        "9",
        "11",
        "12"
      ],
      "respuesta": "11",
      "explicacion": "De Do a Si son 11 semitonos; a Si♭ serían 10 (7.ª menor)."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-triadas', 'Las cuatro tríadas: mayor, menor, disminuida y aumentada',
  'Cómo se forma cada tríada con sus semitonos (0-4-7, 0-3-7, 0-3-6, 0-4-8), cómo reconocerla en el pentagrama y en qué se diferencian.',
  'melodia',
  $melodia${
  "pasos": [
    "Una tríada es un acorde de tres notas: fundamental, 3.ª y 5.ª. Hay cuatro tipos según el tamaño de esas dos terceras.",
    "Mayor: 0-4-7 semitonos (3.ª mayor + 3.ª menor). Menor: 0-3-7 (3.ª menor + 3.ª mayor). Disminuida: 0-3-6 (dos terceras menores). Aumentada: 0-4-8 (dos terceras mayores).",
    "Do mayor: Do-Mi-Sol. Do menor: Do-Mi♭-Sol. Do disminuida: Do-Mi♭-Sol♭. Do aumentada: Do-Mi-Sol♯. Compara con la mayor: la menor baja la 3.ª; la disminuida baja también la 5.ª; la aumentada sube la 5.ª.",
    "En el pentagrama, una tríada escrita en forma normal son tres notas en líneas consecutivas o espacios consecutivos (una sí, una no). Fíjate en las alteraciones: es lo que distingue una tríada de otra, porque las letras son las mismas.",
    "Cómo suenan: la mayor suele describirse como estable y brillante, la menor como más oscura, la disminuida como tensa e inestable y la aumentada como suspendida y ambigua. Son descripciones generales, no reglas exactas.",
    "Errores comunes: confundir la aumentada con la mayor porque tienen la misma 3.ª (el que cambia es la 5.ª); contar mal los semitonos de la 5.ª (7 es justa, 6 disminuida, 8 aumentada); y creer que la tríada menor tiene 5.ª distinta (es igual que la mayor, 7 semitonos). Simplificación: en la Práctica, las alteradas se escriben con sostenidos o bemoles según el ejercicio; aquí se usa la grafía habitual."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do mayor",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "mayor"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do menor",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "menor",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do disminuida",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "disminuido",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do aumentada",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "aumentado"
      }
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 3,
      "titulo": "Do menor en el pentagrama",
      "etiquetas": "letra",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "menor",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué semitonos tiene una tríada menor?",
      "opciones": [
        "0-4-7",
        "0-3-7",
        "0-3-6",
        "0-4-8"
      ],
      "respuesta": "0-3-7",
      "explicacion": "Fundamental, 3.ª menor y 5.ª justa."
    },
    {
      "pregunta": "¿Qué tríada tiene la 3.ª mayor y la 5.ª aumentada?",
      "opciones": [
        "Mayor",
        "Aumentada",
        "Menor",
        "Disminuida"
      ],
      "respuesta": "Aumentada",
      "explicacion": "0-4-8: dos terceras mayores."
    },
    {
      "pregunta": "¿Qué notas forman Do disminuida?",
      "opciones": [
        "Do-Mi-Sol♭",
        "Do-Mi♭-Sol",
        "Do-Mi♭-Sol♭",
        "Do-Mi-Sol♯"
      ],
      "respuesta": "Do-Mi♭-Sol♭",
      "explicacion": "3.ª menor (Mi♭) y 5.ª disminuida (Sol♭): 0-3-6."
    },
    {
      "pregunta": "¿Qué diferencia a Do menor de Do mayor?",
      "opciones": [
        "La 5.ª es un semitono más baja",
        "La fundamental es distinta",
        "Tiene una nota más",
        "La 3.ª es un semitono más baja"
      ],
      "respuesta": "La 3.ª es un semitono más baja",
      "explicacion": "Do-Mi-Sol pasa a Do-Mi♭-Sol: solo baja la 3.ª."
    },
    {
      "pregunta": "En el pentagrama, ¿cómo se ve una tríada normal?",
      "opciones": [
        "Tres notas en la misma línea",
        "Tres notas en líneas consecutivas o en espacios consecutivos",
        "Tres notas en posiciones vecinas",
        "Una nota con tres alteraciones"
      ],
      "respuesta": "Tres notas en líneas consecutivas o en espacios consecutivos",
      "explicacion": "Las notas están a una tercera: una posición sí, otra no."
    }
  ]
}$melodia$::jsonb,
  2,
  true),

('melodia-clase-septimas', 'Acordes de séptima: maj7, 7, m7 y dim7',
  'Cómo se forman los cuatro acordes de séptima que evalúa la Práctica, sumando una 7.ª a una tríada: maj7, dominante (7), m7 y disminuida (dim7).',
  'melodia',
  $melodia${
  "pasos": [
    "Un acorde de séptima es una tríada con una cuarta nota, la 7.ª, apilada una tercera más arriba. Tiene cuatro notas: fundamental, 3.ª, 5.ª y 7.ª.",
    "Séptima mayor (maj7): tríada mayor + 7.ª mayor: 0-4-7-11 (Do-Mi-Sol-Si). Séptima dominante (7): tríada mayor + 7.ª menor: 0-4-7-10 (Do-Mi-Sol-Si♭). Séptima menor (m7): tríada menor + 7.ª menor: 0-3-7-10 (Do-Mi♭-Sol-Si♭).",
    "Séptima disminuida (dim7): tríada disminuida + 7.ª disminuida: 0-3-6-9 (Do-Mi♭-Sol♭ y una cuarta nota a 9 semitonos, que suena como La). Está hecha de tres terceras menores seguidas: 3 + 3 + 3.",
    "La 7.ª mayor está a 11 semitonos (un semitono debajo de la octava) y la menor a 10 (un tono debajo). La disminuida, a 9. Fíjate que la dominante 7 y la m7 comparten la misma 7.ª (10); lo que las diferencia es la 3.ª (4 o 3).",
    "Para reconocer el acorde en la Práctica, mide la 3.ª (4 = mayor, 3 = menor) y la 7.ª (11 = mayor, 10 = menor, 9 = disminuida): 3.ª mayor y 7.ª 11 = maj7; 3.ª mayor y 7.ª 10 = 7; 3.ª menor y 7.ª 10 = m7; 3.ª menor, 5.ª 6 y 7.ª 9 = dim7.",
    "Errores comunes: confundir maj7 (11 semitonos) con la dominante 7 (10); contar la 7.ª como 7 semitonos (es el número de la letra, no de semitonos); y creer que la 7 sin apellido es la mayor (7 es la dominante). Simplificación: la 7.ª de dim7 se escribe en teoría como Si con doble bemol, que suena como La; la Práctica y esta clase la muestran como La."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do maj7",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "maj7"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do 7 (dominante)",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "dominante7",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do m7",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "menor7",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do dim7: tres terceras menores",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "disminuido7",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué semitonos tiene un acorde de séptima dominante (7)?",
      "opciones": [
        "0-4-7-11",
        "0-4-7-10",
        "0-3-7-10",
        "0-3-6-9"
      ],
      "respuesta": "0-4-7-10",
      "explicacion": "Tríada mayor con 7.ª menor."
    },
    {
      "pregunta": "¿Qué semitonos tiene un acorde de séptima mayor (maj7)?",
      "opciones": [
        "0-4-7-10",
        "0-3-7-11",
        "0-3-7-10",
        "0-4-7-11"
      ],
      "respuesta": "0-4-7-11",
      "explicacion": "Tríada mayor con 7.ª mayor (11 semitonos)."
    },
    {
      "pregunta": "¿Qué acorde tiene 3.ª menor, 5.ª justa y 7.ª a 10 semitonos?",
      "opciones": [
        "Séptima dominante (7)",
        "Séptima menor (m7)",
        "Séptima mayor (maj7)",
        "Séptima disminuida (dim7)"
      ],
      "respuesta": "Séptima menor (m7)",
      "explicacion": "0-3-7-10: m7."
    },
    {
      "pregunta": "¿Qué forma tiene un acorde dim7 en semitonos?",
      "opciones": [
        "0-3-7-10",
        "0-3-6-9",
        "0-4-7-10",
        "0-4-8-11"
      ],
      "respuesta": "0-3-6-9",
      "explicacion": "Tres terceras menores seguidas: 3 + 3 + 3."
    },
    {
      "pregunta": "¿Qué diferencia a Do maj7 de Do 7?",
      "opciones": [
        "La 3.ª: 3 frente a 4",
        "La 7.ª: 11 semitonos frente a 10",
        "La 5.ª: 6 frente a 7",
        "La fundamental"
      ],
      "respuesta": "La 7.ª: 11 semitonos frente a 10",
      "explicacion": "Ambas tienen 3.ª mayor y 5.ª justa; cambia la séptima."
    }
  ]
}$melodia$::jsonb,
  3,
  true),

('melodia-clase-suspendidos-y-extendidos', 'Acordes suspendidos, add9 y extendidos (9, 11 y 13)',
  'Los acordes que aparecen en los niveles altos de la Práctica: sus2, sus4, add9 y los extendidos de novena, oncena y trecena, con sus semitonos y cómo reconocerlos.',
  'melodia',
  $melodia${
  "pasos": [
    "Suspendidos: sustituyen la 3.ª por otra nota, así que no suenan mayores ni menores. Sus2: 0-2-7 (Do-Re-Sol), con la 2.ª en lugar de la 3.ª. Sus4: 0-5-7 (Do-Fa-Sol), con la 4.ª en lugar de la 3.ª.",
    "Add9: la tríada mayor más la 9.ª, sin séptima: 0-4-7-14 (Do-Mi-Sol-Re, con el Re una octava más arriba). La 9.ª es la 2.ª subida una octava: 2 + 12 = 14 semitonos.",
    "Extendidos: se apilan terceras sobre la séptima dominante (0-4-7-10). Novena (9): más la 9.ª, a 14 semitonos: 0-4-7-10-14 (5 notas). Oncena (11): más la 11.ª, a 17: 0-4-7-10-14-17 (6 notas). Trecena (13): más la 13.ª, a 21: 0-4-7-10-14-17-21 (7 notas).",
    "Números de las notas añadidas: 9.ª = 2.ª más una octava; 11.ª = 4.ª más una octava (5 + 12 = 17); 13.ª = 6.ª más una octava (9 + 12 = 21). Por eso son las notas «de arriba» del acorde.",
    "Cómo reconocerlos: primero cuenta las notas (3: tríada o suspendido; 4: séptima o add9; 5, 6 o 7: novena, oncena o trecena). Con 3 notas, mide la 2.ª nota desde la fundamental: a 2 semitonos es sus2, a 5 es sus4 y a 3 o 4 es una tríada con 3.ª. Con 4 notas, el add9 es el que tiene una nota a 14 semitonos y ninguna a 9, 10 u 11.",
    "Errores comunes: confundir add9 con novena (la novena incluye la 7.ª, a 10 semitonos; add9 no); creer que sus2 y sus4 son menores o mayores (no tienen 3.ª); y no distinguir oncena de trecena (cuenta las notas: 6 y 7). Simplificación: en la música real, los acordes de 11 y 13 suelen omitir alguna nota (por ejemplo la 3.ª o la 5.ª); aquí se muestran completos, apilados por terceras, como los usa la Práctica."
  ],
  "visuales": [
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 0,
      "titulo": "Do sus2",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "sus2"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 0,
      "titulo": "Do sus4",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "sus4"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 1,
      "titulo": "Do add9",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "add9"
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do 9",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "novena",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do 11",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "oncena",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.acorde",
      "despuesDePaso": 2,
      "titulo": "Do 13",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "trecena",
        "bemoles": true
      }
    },
    {
      "tipo": "melodia.pentagrama",
      "despuesDePaso": 3,
      "titulo": "Do 9 en el pentagrama",
      "etiquetas": "letra",
      "acorde": {
        "fundamental": "Do4",
        "tipo": "novena",
        "bemoles": true
      }
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué semitonos tiene un acorde sus4?",
      "opciones": [
        "0-2-7",
        "0-4-7",
        "0-5-7",
        "0-3-7"
      ],
      "respuesta": "0-5-7",
      "explicacion": "La 4.ª (5 semitonos) sustituye a la 3.ª."
    },
    {
      "pregunta": "¿En qué se diferencia una novena (9) de un add9?",
      "opciones": [
        "La novena incluye la 7.ª menor; el add9 no",
        "El add9 tiene la 3.ª menor",
        "La novena no tiene 5.ª",
        "No se diferencian"
      ],
      "respuesta": "La novena incluye la 7.ª menor; el add9 no",
      "explicacion": "Novena: 0-4-7-10-14. Add9: 0-4-7-14."
    },
    {
      "pregunta": "¿A cuántos semitonos de la fundamental está la 13.ª?",
      "opciones": [
        "14",
        "17",
        "13",
        "21"
      ],
      "respuesta": "21",
      "explicacion": "9 (la 6.ª) + 12 = 21."
    },
    {
      "pregunta": "Un acorde tiene 6 notas apiladas por terceras sobre la séptima dominante. ¿Cuál es?",
      "opciones": [
        "Novena (9)",
        "Trecena (13)",
        "Oncena (11)",
        "Add9"
      ],
      "respuesta": "Oncena (11)",
      "explicacion": "Novena tiene 5 notas, oncena 6 y trecena 7."
    },
    {
      "pregunta": "¿Por qué sus2 y sus4 no suenan ni mayores ni menores?",
      "opciones": [
        "Porque no tienen 5.ª",
        "Porque tienen una 7.ª",
        "Porque no tienen 3.ª",
        "Porque están en otra octava"
      ],
      "respuesta": "Porque no tienen 3.ª",
      "explicacion": "La 3.ª define mayor o menor; en los suspendidos la reemplaza otra nota."
    }
  ]
}$melodia$::jsonb,
  4,
  true),

('melodia-clase-frecuencia-y-octava', 'Frecuencia, La = 440 Hz y la razón de octava',
  'Qué es la frecuencia de una nota, por qué el La4 vale 440 Hz, cómo se relacionan las octavas (2:1) y cuánto vale un semitono en el afinado del piano.',
  'melodia',
  $melodia${
  "pasos": [
    "La frecuencia de un sonido es el número de vibraciones por segundo y se mide en hercios (Hz). A mayor frecuencia, sonido más agudo. Cada nota corresponde a una frecuencia concreta.",
    "Por convención internacional, el La4 se afina a 440 Hz: es la referencia con la que se afinan diapasones, orquestas y pianos. Algunas orquestas barrocas afinan más bajo (por ejemplo, alrededor de 415 Hz); 440 es el estándar más extendido, no una ley de la naturaleza.",
    "Octava: subir una octava duplica la frecuencia, y bajarla la divide por dos. La3 = 220 Hz, La4 = 440 Hz, La5 = 880 Hz. Esa relación 2:1 es la razón por la que dos notas con el mismo nombre suenan «la misma nota» en registros distintos.",
    "El afinado de los pianos modernos, el temperamento igual, reparte la octava en 12 semitonos iguales. Cada semitono multiplica la frecuencia por 2^(1/12), aproximadamente 1,0595. Doce semitonos seguidos multiplican por 2: una octava.",
    "Ejemplo: Do4 (el Do central) ≈ 261,63 Hz y Do5 ≈ 523,25 Hz (el doble). De Do4 a Do♯4 la frecuencia sube por un factor 1,0595, unos 277,18 Hz. Por eso los semitonos «se sienten» igual de grandes en cualquier parte del teclado, aunque en Hz no lo sean.",
    "Errores comunes: creer que sumar 12 Hz da una octava (se multiplica por 2, no se suma); creer que cada nota está a la misma cantidad de Hz de la anterior (la distancia en Hz crece con la altura; lo que se mantiene igual es la razón); y pensar que 440 Hz es universal. Simplificación: se usa el temperamento igual de nivel colegio; hay otros sistemas de afinación con valores ligeramente distintos."
  ],
  "visuales": [
    {
      "tipo": "melodia.frecuencia",
      "despuesDePaso": 2,
      "titulo": "Cada octava duplica la frecuencia",
      "escuchar": true,
      "notas": [
        "La3",
        "La4",
        "La5"
      ]
    },
    {
      "tipo": "melodia.frecuencia",
      "despuesDePaso": 3,
      "titulo": "Un semitono: la frecuencia se multiplica por 1,0595",
      "escuchar": true,
      "notas": [
        "Do4",
        "Do♯4"
      ]
    },
    {
      "tipo": "melodia.frecuencia",
      "despuesDePaso": 4,
      "titulo": "Doce semitonos: una octava, el doble",
      "notas": [
        "Do4",
        "Do5"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué frecuencia tiene el La una octava por encima de La4 (440 Hz)?",
      "opciones": [
        "450 Hz",
        "660 Hz",
        "880 Hz",
        "452 Hz"
      ],
      "respuesta": "880 Hz",
      "explicacion": "Una octava arriba duplica la frecuencia: 2 × 440 = 880 Hz."
    },
    {
      "pregunta": "¿Por cuánto se multiplica la frecuencia al subir un semitono en el temperamento igual?",
      "opciones": [
        "Por 2",
        "Por 2^(1/12), aproximadamente 1,0595",
        "Por 1,5",
        "Se le suman 12 Hz"
      ],
      "respuesta": "Por 2^(1/12), aproximadamente 1,0595",
      "explicacion": "12 semitonos seguidos deben dar el doble: 2^(1/12) multiplicado 12 veces es 2."
    },
    {
      "pregunta": "¿A cuántos hercios se afina normalmente el La4?",
      "opciones": [
        "262 Hz",
        "220 Hz",
        "1 000 Hz",
        "440 Hz"
      ],
      "respuesta": "440 Hz",
      "explicacion": "El estándar de afinación más extendido es La4 = 440 Hz."
    },
    {
      "pregunta": "¿Qué relación tienen las frecuencias de dos notas con el mismo nombre a una octava de distancia?",
      "opciones": [
        "Se diferencian en 12 Hz",
        "Una es el doble de la otra",
        "Son iguales",
        "Una es el triple de la otra"
      ],
      "respuesta": "Una es el doble de la otra",
      "explicacion": "Relación 2:1: por eso suenan como la misma nota."
    },
    {
      "pregunta": "Aproximadamente, ¿cuántos hercios tiene el Do central (Do4)?",
      "opciones": [
        "440 Hz",
        "329,63 Hz",
        "523,25 Hz",
        "261,63 Hz"
      ],
      "respuesta": "261,63 Hz",
      "explicacion": "Do4 ≈ 261,63 Hz; su octava, Do5, ≈ 523,25 Hz."
    }
  ]
}$melodia$::jsonb,
  1,
  true),

('melodia-clase-oido-absoluto-y-relativo', 'Oído absoluto y oído relativo: qué son y cómo se entrena',
  'La diferencia entre reconocer una nota sin referencia (oído absoluto) y reconocerla comparándola con otra (oído relativo), y estrategias honestas para el modo de la Práctica.',
  'melodia',
  $melodia${
  "pasos": [
    "El oído absoluto es la capacidad de identificar o cantar una nota concreta sin ninguna referencia. Es poco frecuente, y hay debate científico sobre en qué medida se puede desarrollar en la adultez. Nada de lo que aparece en Prodigia promete conseguirlo.",
    "El oído relativo es reconocer una altura por su relación con otra: una distancia entre dos notas (un intervalo), o una nota respecto de una referencia. Es lo que usan casi todos los músicos y sí mejora con práctica.",
    "En el modo Oído absoluto de la Práctica escuchas una nota sintetizada y eliges su nombre entre cuatro opciones. En los niveles bajos las opciones están muy separadas (Do4, Fa4, Sol4, Do5); después se suman las siete naturales, dos octavas y, al final, sostenidos: semitonos vecinos que son la parte difícil.",
    "Estrategias: (1) fija una referencia que conozcas, como el La4 de 440 Hz; (2) decide primero el registro (grave o agudo) y luego el nombre; (3) ordena las opciones de grave a aguda; (4) en los niveles altos compara con las notas vecinas a un semitono.",
    "Practicar mejora tu reconocimiento dentro de este ejercicio (opciones cerradas, mismo timbre), y refuerza el oído relativo, sin garantizar que desarrolles oído absoluto. Lo más útil suele ser sesiones cortas y repetidas, con descansos.",
    "Errores comunes: confundir la octava (una nota una octava más aguda «se parece» mucho: fíjate en el registro); asociar cada nota con su timbre en vez de con su altura (aquí siempre suena el mismo timbre sintetizado); y esperar resultados inmediatos. Simplificación: el sonido es un tono electrónico afinado a temperamento igual; con un instrumento real el timbre y la afinación pueden cambiar."
  ],
  "visuales": [
    {
      "tipo": "melodia.teclado",
      "despuesDePaso": 2,
      "titulo": "Nivel bajo: las opciones más separadas",
      "desde": "Do4",
      "hasta": "Do5",
      "escuchar": true,
      "notas": [
        "Do4",
        "Fa4",
        "Sol4",
        "Do5"
      ]
    },
    {
      "tipo": "melodia.frecuencia",
      "despuesDePaso": 2,
      "titulo": "Nivel alto: notas a un semitono",
      "escuchar": true,
      "notas": [
        "Do4",
        "Do♯4"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué es el oído relativo?",
      "opciones": [
        "Nombrar cualquier nota sin referencia",
        "Reconocer una altura por su relación con otra o con una referencia",
        "Tener un oído más sensible al volumen",
        "Oír sonidos muy agudos"
      ],
      "respuesta": "Reconocer una altura por su relación con otra o con una referencia",
      "explicacion": "Compara distancias entre notas o contra una referencia."
    },
    {
      "pregunta": "¿Qué se puede afirmar con seguridad sobre el oído absoluto?",
      "opciones": [
        "Es poco frecuente y no hay consenso sobre cuánto puede desarrollarse de adulto",
        "Se consigue con 10 minutos al día",
        "Lo tienen todos los músicos",
        "No existe"
      ],
      "respuesta": "Es poco frecuente y no hay consenso sobre cuánto puede desarrollarse de adulto",
      "explicacion": "Es una capacidad real pero poco común; su desarrollo en la adultez está en debate."
    },
    {
      "pregunta": "En el modo Oído absoluto de la Práctica, ¿qué escuchas?",
      "opciones": [
        "Un instrumento distinto cada vez",
        "Una melodía completa",
        "El nombre de la nota dicho en voz alta",
        "Una nota sintetizada, siempre con el mismo timbre"
      ],
      "respuesta": "Una nota sintetizada, siempre con el mismo timbre",
      "explicacion": "Es un tono electrónico afinado por fórmula (La4 = 440 Hz)."
    },
    {
      "pregunta": "¿Qué estrategia ayuda al identificar una nota de oído?",
      "opciones": [
        "Contar el volumen",
        "Decidir primero si es grave o aguda y comparar con una referencia",
        "Elegir siempre la primera opción",
        "Ignorar la octava"
      ],
      "respuesta": "Decidir primero si es grave o aguda y comparar con una referencia",
      "explicacion": "Registro primero, luego el nombre; una referencia como el La de 440 Hz ayuda."
    },
    {
      "pregunta": "¿Qué es lo más difícil en los niveles altos de este modo?",
      "opciones": [
        "Distinguir Do4 de Do5",
        "Distinguir semitonos vecinos, como Do y Do♯",
        "Distinguir un piano de una guitarra",
        "Contar las notas"
      ],
      "respuesta": "Distinguir semitonos vecinos, como Do y Do♯",
      "explicacion": "Los sostenidos son notas a un semitono de sus vecinas: la diferencia es mínima."
    }
  ]
}$melodia$::jsonb,
  2,
  true);
