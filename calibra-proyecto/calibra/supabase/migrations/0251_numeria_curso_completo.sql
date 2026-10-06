-- ============================================================
-- Prodigia — Numeria: curso completo de matemáticas (pedido del usuario,
-- 2026-10-06): fracciones con todos sus métodos (qué es, simplificar, mixtos,
-- mismo denominador, carita feliz, MCM de varias, multiplicar simplificando en
-- cruz, división en cruz y regla de la oreja), decimales y porcentajes,
-- potencias y raíces, álgebra básica y geometría básica. 36 Clases
-- (requiere_pro = true; la primera del camino sigue siendo la preview gratis).
--
-- Visuales nuevos (web y app): numeria.metodoFraccion, numeria.decimal,
-- numeria.porcentaje, numeria.exponentes, numeria.raiz, numeria.terminos,
-- numeria.distributiva, numeria.ecuacion y 5 modos nuevos de numeria.figura.
--
-- Este archivo se GENERA desde src/lib/numeria/lecciones/curso.ts y
-- curso.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- NUMERIA_CURSO_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/curso.test.ts
-- ============================================================

update public.techniques set orden = 5 where slug = 'numeria-clase-mcm';
update public.techniques set orden = 6 where slug = 'numeria-clase-fracciones-operaciones';

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('numeria-clase-fraccion-que-es', 'Qué es una fracción y fracciones equivalentes',
  'Partes iguales de un entero, y por qué 2/3 y 4/6 son la misma cantidad.',
  'fracciones',
  $numeria${
  "pasos": [
    "Una fracción $\\frac{a}{b}$ dice que partiste un entero en $b$ partes iguales y tomaste $a$ de ellas: el de abajo es el denominador y el de arriba el numerador.",
    "Si multiplicas arriba y abajo por el mismo número, las piezas se hacen más chicas pero tomas más: la cantidad no cambia. Eso se llama amplificar."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "amplificar",
      "fracciones": [
        [
          2,
          3
        ]
      ],
      "factor": 2,
      "despuesDePaso": 1,
      "titulo": "$\\frac{2}{3}$ y $\\frac{4}{6}$ miden lo mismo"
    }
  ],
  "quiz": [
    {
      "pregunta": "En $\\frac{3}{5}$, ¿qué indica el 5?",
      "opciones": [
        "En cuántas partes iguales se partió el entero",
        "Cuántas partes se tomaron",
        "El resultado de dividir"
      ],
      "respuesta": "En cuántas partes iguales se partió el entero",
      "explicacion": "El denominador (abajo) dice en cuántas partes iguales se partió el entero."
    },
    {
      "pregunta": "¿Cuál es equivalente a $\\frac{2}{3}$?",
      "opciones": [
        "$\\frac{4}{6}$",
        "$\\frac{4}{5}$",
        "$\\frac{3}{4}$"
      ],
      "respuesta": "$\\frac{4}{6}$",
      "explicacion": "Multiplicando arriba y abajo por 2: $\\frac{2 \\times 2}{3 \\times 2} = \\frac{4}{6}$."
    }
  ]
}$numeria$::jsonb,
  1, true),

('numeria-clase-fraccion-simplificar', 'Simplificar fracciones con el MCD',
  'Dividir arriba y abajo por el máximo común divisor para dejar la fracción irreducible.',
  'fracciones',
  $numeria${
  "pasos": [
    "Simplificar es lo contrario de amplificar: divides arriba y abajo por el mismo número.",
    "Para hacerlo en un solo paso, usa el máximo común divisor (MCD): el número más grande que divide exacto a los dos."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "simplificar",
      "fracciones": [
        [
          12,
          18
        ]
      ],
      "despuesDePaso": 1,
      "titulo": "Simplificar $\\frac{12}{18}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el MCD de 12 y 18?",
      "opciones": [
        "6",
        "3",
        "2"
      ],
      "respuesta": "6",
      "explicacion": "6 divide exacto a 12 y a 18, y no hay uno más grande que lo haga."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{12}{18}$ simplificada?",
      "opciones": [
        "$\\frac{2}{3}$",
        "$\\frac{4}{6}$",
        "$\\frac{6}{9}$"
      ],
      "respuesta": "$\\frac{2}{3}$",
      "explicacion": "Dividiendo entre 6: $\\frac{12 \\div 6}{18 \\div 6} = \\frac{2}{3}$."
    }
  ]
}$numeria$::jsonb,
  2, true),

('numeria-clase-fraccion-mixtos', 'Números mixtos y fracciones impropias',
  'Pasar de $\frac{11}{4}$ a $2\frac{3}{4}$ y de vuelta.',
  'fracciones',
  $numeria${
  "pasos": [
    "Cuando el numerador es más grande que el denominador, la fracción vale más de un entero: es impropia.",
    "Se escribe como número mixto dividiendo: el cociente son los enteros y el resto queda como fracción."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "mixto",
      "fracciones": [
        [
          11,
          4
        ]
      ],
      "despuesDePaso": 1,
      "titulo": "$\\frac{11}{4}$ como número mixto"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se escribe $\\frac{11}{4}$ como número mixto?",
      "opciones": [
        "$2\\frac{3}{4}$",
        "$3\\frac{1}{4}$",
        "$2\\frac{1}{4}$"
      ],
      "respuesta": "$2\\frac{3}{4}$",
      "explicacion": "11 ÷ 4 = 2 y sobran 3: dos enteros y $\\frac{3}{4}$."
    },
    {
      "pregunta": "¿Cuánto es $1\\frac{2}{5}$ como fracción?",
      "opciones": [
        "$\\frac{7}{5}$",
        "$\\frac{3}{5}$",
        "$\\frac{12}{5}$"
      ],
      "respuesta": "$\\frac{7}{5}$",
      "explicacion": "$\\frac{1 \\times 5 + 2}{5} = \\frac{7}{5}$."
    }
  ]
}$numeria$::jsonb,
  3, true),

('numeria-clase-fraccion-igual-denominador', 'Sumar y restar con el mismo denominador',
  'Si las piezas son del mismo tamaño, solo se suman o restan los numeradores.',
  'fracciones',
  $numeria${
  "pasos": [
    "Si dos fracciones tienen el mismo denominador, hablan de piezas del mismo tamaño.",
    "Entonces sumas (o restas) solo los numeradores y el denominador queda igual. Al final, simplifica si se puede."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "igualDen",
      "fracciones": [
        [
          2,
          7
        ],
        [
          3,
          7
        ]
      ],
      "operacion": "suma",
      "despuesDePaso": 1,
      "titulo": "$\\frac{2}{7} + \\frac{3}{7}$"
    },
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "igualDen",
      "fracciones": [
        [
          5,
          8
        ],
        [
          1,
          8
        ]
      ],
      "operacion": "resta",
      "despuesDePaso": 1,
      "titulo": "$\\frac{5}{8} - \\frac{1}{8}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $\\frac{2}{7} + \\frac{3}{7}$?",
      "opciones": [
        "$\\frac{5}{7}$",
        "$\\frac{5}{14}$",
        "$\\frac{6}{7}$"
      ],
      "respuesta": "$\\frac{5}{7}$",
      "explicacion": "2 + 3 = 5 y el denominador queda en 7."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{5}{8} - \\frac{1}{8}$?",
      "opciones": [
        "$\\frac{1}{2}$",
        "$\\frac{4}{16}$",
        "$\\frac{6}{8}$"
      ],
      "respuesta": "$\\frac{1}{2}$",
      "explicacion": "5 − 1 = 4: $\\frac{4}{8}$, que simplificada es $\\frac{1}{2}$."
    }
  ]
}$numeria$::jsonb,
  4, true),

('numeria-clase-fraccion-carita-feliz', 'Método de la carita feliz',
  'Sumar y restar fracciones con distinto denominador dibujando ojos y sonrisa.',
  'fracciones',
  $numeria${
  "pasos": [
    "Para sumar o restar fracciones con distinto denominador hay un atajo: la carita feliz.",
    "Los ojos son los productos en cruz (numerador de una por denominador de la otra) y van arriba; la sonrisa es el producto de los denominadores y va abajo.",
    "Funciona siempre. A veces el resultado sale con números grandes: por eso al final se simplifica."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "carita",
      "fracciones": [
        [
          2,
          3
        ],
        [
          1,
          4
        ]
      ],
      "operacion": "suma",
      "despuesDePaso": 1,
      "titulo": "$\\frac{2}{3} + \\frac{1}{4}$ con la carita feliz"
    },
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "carita",
      "fracciones": [
        [
          5,
          6
        ],
        [
          1,
          4
        ]
      ],
      "operacion": "resta",
      "despuesDePaso": 2,
      "titulo": "$\\frac{5}{6} - \\frac{1}{4}$, simplificando al final"
    }
  ],
  "quiz": [
    {
      "pregunta": "En la carita feliz de $\\frac{2}{3} + \\frac{1}{4}$, ¿qué va abajo (la sonrisa)?",
      "opciones": [
        "$3 \\times 4 = 12$",
        "$2 \\times 4 = 8$",
        "$3 + 4 = 7$"
      ],
      "respuesta": "$3 \\times 4 = 12$",
      "explicacion": "La sonrisa multiplica los dos denominadores."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{2}{3} + \\frac{1}{4}$?",
      "opciones": [
        "$\\frac{11}{12}$",
        "$\\frac{3}{7}$",
        "$\\frac{3}{12}$"
      ],
      "respuesta": "$\\frac{11}{12}$",
      "explicacion": "Ojos: 2×4 = 8 y 3×1 = 3. Arriba 8 + 3 = 11, abajo 12."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{5}{6} - \\frac{1}{4}$?",
      "opciones": [
        "$\\frac{7}{12}$",
        "$\\frac{4}{2}$",
        "$\\frac{14}{24}$"
      ],
      "respuesta": "$\\frac{7}{12}$",
      "explicacion": "Ojos: 5×4 = 20 y 6×1 = 6. $\\frac{20 - 6}{24} = \\frac{14}{24} = \\frac{7}{12}$."
    }
  ]
}$numeria$::jsonb,
  7, true),

('numeria-clase-fraccion-mcm-varias', 'Sumar varias fracciones con el MCM',
  'Con tres o más fracciones, llevar todas al mismo denominador escalando cada una.',
  'fracciones',
  $numeria${
  "pasos": [
    "Con tres o más fracciones la carita se complica. Mejor: busca el MCM de todos los denominadores.",
    "Escala cada fracción (amplifícala) por lo que le falta para llegar a ese MCM. Después suma solo los numeradores."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "mcmVarias",
      "fracciones": [
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ]
      ],
      "operacion": "suma",
      "despuesDePaso": 1,
      "titulo": "$\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el MCM de 2, 3 y 4?",
      "opciones": [
        "12",
        "24",
        "9"
      ],
      "respuesta": "12",
      "explicacion": "12 es el primer número que está en las tablas del 2, del 3 y del 4."
    },
    {
      "pregunta": "¿Por cuánto se amplifica $\\frac{2}{3}$ para llegar a doceavos?",
      "opciones": [
        "Por 4",
        "Por 3",
        "Por 12"
      ],
      "respuesta": "Por 4",
      "explicacion": "3 × 4 = 12, así que $\\frac{2}{3} = \\frac{8}{12}$."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4}$?",
      "opciones": [
        "$\\frac{23}{12}$",
        "$\\frac{6}{9}$",
        "$\\frac{23}{24}$"
      ],
      "respuesta": "$\\frac{23}{12}$",
      "explicacion": "$\\frac{6}{12} + \\frac{8}{12} + \\frac{9}{12} = \\frac{23}{12}$."
    }
  ]
}$numeria$::jsonb,
  8, true),

('numeria-clase-fraccion-multiplicar', 'Multiplicar fracciones y simplificar en cruz',
  'Numerador por numerador, denominador por denominador, y cómo achicar los números antes.',
  'fracciones',
  $numeria${
  "pasos": [
    "Multiplicar fracciones es lo más directo: numerador por numerador y denominador por denominador.",
    "Truco: antes de multiplicar, simplifica en cruz (un numerador con el denominador de la otra). Los números quedan chicos y el resultado sale ya simplificado."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "multiplicar",
      "fracciones": [
        [
          4,
          9
        ],
        [
          3,
          8
        ]
      ],
      "despuesDePaso": 1,
      "titulo": "$\\frac{4}{9} \\times \\frac{3}{8}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $\\frac{2}{3} \\times \\frac{4}{5}$?",
      "opciones": [
        "$\\frac{8}{15}$",
        "$\\frac{6}{8}$",
        "$\\frac{10}{12}$"
      ],
      "respuesta": "$\\frac{8}{15}$",
      "explicacion": "2×4 = 8 arriba y 3×5 = 15 abajo."
    },
    {
      "pregunta": "En $\\frac{4}{9} \\times \\frac{3}{8}$, ¿qué se puede simplificar en cruz?",
      "opciones": [
        "4 con 8, y 3 con 9",
        "4 con 9",
        "3 con 8"
      ],
      "respuesta": "4 con 8, y 3 con 9",
      "explicacion": "4 y 8 se dividen entre 4; 3 y 9 entre 3."
    },
    {
      "pregunta": "¿Cuánto da $\\frac{4}{9} \\times \\frac{3}{8}$?",
      "opciones": [
        "$\\frac{1}{6}$",
        "$\\frac{12}{72}$",
        "$\\frac{7}{17}$"
      ],
      "respuesta": "$\\frac{1}{6}$",
      "explicacion": "Después de simplificar: $\\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6}$."
    }
  ]
}$numeria$::jsonb,
  9, true),

('numeria-clase-fraccion-division-cruz', 'Dividir fracciones en cruz',
  'Una X entre las dos fracciones: los productos cruzados dan el resultado.',
  'fracciones',
  $numeria${
  "pasos": [
    "Para dividir fracciones puedes multiplicar por la segunda dada vuelta, o usar la cruz, que es lo mismo pero más rápido.",
    "Numerador de la primera por denominador de la segunda: va arriba. Denominador de la primera por numerador de la segunda: va abajo."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "cruz",
      "fracciones": [
        [
          3,
          4
        ],
        [
          5,
          6
        ]
      ],
      "despuesDePaso": 1,
      "titulo": "$\\frac{3}{4} \\div \\frac{5}{6}$ en cruz"
    }
  ],
  "quiz": [
    {
      "pregunta": "En $\\frac{3}{4} \\div \\frac{5}{6}$, ¿qué va arriba?",
      "opciones": [
        "$3 \\times 6 = 18$",
        "$3 \\times 5 = 15$",
        "$4 \\times 5 = 20$"
      ],
      "respuesta": "$3 \\times 6 = 18$",
      "explicacion": "Arriba: numerador de la primera por denominador de la segunda."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{3}{4} \\div \\frac{5}{6}$?",
      "opciones": [
        "$\\frac{9}{10}$",
        "$\\frac{15}{24}$",
        "$\\frac{5}{8}$"
      ],
      "respuesta": "$\\frac{9}{10}$",
      "explicacion": "$\\frac{18}{20}$, que simplificada es $\\frac{9}{10}$."
    }
  ]
}$numeria$::jsonb,
  10, true),

('numeria-clase-fraccion-regla-oreja', 'La regla de la oreja (extremos y medios)',
  'Cuando una fracción está encima de otra: extremos arriba, medios abajo.',
  'fracciones',
  $numeria${
  "pasos": [
    "A veces la división aparece como una fracción encima de otra (una fracción compuesta).",
    "La oreja grande une los extremos (el número de más arriba y el de más abajo) y va arriba; la oreja chica une los medios (los dos del centro) y va abajo."
  ],
  "visuales": [
    {
      "tipo": "numeria.metodoFraccion",
      "modo": "oreja",
      "fracciones": [
        [
          2,
          3
        ],
        [
          4,
          5
        ]
      ],
      "despuesDePaso": 1,
      "titulo": "$\\dfrac{2/3}{4/5}$ con la regla de la oreja"
    }
  ],
  "quiz": [
    {
      "pregunta": "En la regla de la oreja, ¿qué números son los extremos?",
      "opciones": [
        "El de más arriba y el de más abajo",
        "Los dos del centro",
        "Los dos numeradores"
      ],
      "respuesta": "El de más arriba y el de más abajo",
      "explicacion": "Extremos: los de las puntas. Medios: los del centro."
    },
    {
      "pregunta": "¿Cuánto es $\\dfrac{2/3}{4/5}$?",
      "opciones": [
        "$\\frac{5}{6}$",
        "$\\frac{8}{15}$",
        "$\\frac{12}{10}$"
      ],
      "respuesta": "$\\frac{5}{6}$",
      "explicacion": "Extremos 2×5 = 10, medios 3×4 = 12: $\\frac{10}{12} = \\frac{5}{6}$."
    }
  ]
}$numeria$::jsonb,
  11, true),

('numeria-clase-decimal-posicional', 'Valor posicional de los decimales',
  'Décimos, centésimos y milésimos: qué vale cada lugar después de la coma.',
  'decimales',
  $numeria${
  "pasos": [
    "Después de la coma, cada lugar vale diez veces menos que el anterior: décimos, centésimos, milésimos.",
    "Así, 3,472 es 3 unidades más 4 décimos, 7 centésimos y 2 milésimos."
  ],
  "visuales": [
    {
      "tipo": "numeria.decimal",
      "modo": "posicional",
      "a": "3.472",
      "despuesDePaso": 1,
      "titulo": "Lugar por lugar: 3,472"
    }
  ],
  "quiz": [
    {
      "pregunta": "En 3,472, ¿qué vale el 7?",
      "opciones": [
        "7 centésimos (0,07)",
        "7 décimos (0,7)",
        "7 unidades"
      ],
      "respuesta": "7 centésimos (0,07)",
      "explicacion": "Es el segundo lugar después de la coma: centésimos."
    },
    {
      "pregunta": "¿Cuál es más grande: 0,5 o 0,45?",
      "opciones": [
        "0,5",
        "0,45",
        "Son iguales"
      ],
      "respuesta": "0,5",
      "explicacion": "0,5 = 0,50, que es más que 0,45: se compara lugar por lugar."
    }
  ]
}$numeria$::jsonb,
  1, true),

('numeria-clase-decimal-suma-resta', 'Sumar y restar decimales',
  'Alinear las comas, completar con ceros y operar como enteros.',
  'decimales',
  $numeria${
  "pasos": [
    "La regla de oro: coma debajo de coma. Así sumas décimos con décimos y centésimos con centésimos.",
    "Si uno tiene menos decimales, complétalo con ceros. Después opera como siempre y baja la coma en el mismo lugar."
  ],
  "visuales": [
    {
      "tipo": "numeria.decimal",
      "modo": "sumaResta",
      "a": "12.5",
      "b": "3.75",
      "operacion": "suma",
      "despuesDePaso": 1,
      "titulo": "12,5 + 3,75"
    },
    {
      "tipo": "numeria.decimal",
      "modo": "sumaResta",
      "a": "8.3",
      "b": "2.47",
      "operacion": "resta",
      "despuesDePaso": 1,
      "titulo": "8,3 − 2,47"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es 12,5 + 3,75?",
      "opciones": [
        "$16,25$",
        "$15,80$",
        "$4,00$"
      ],
      "respuesta": "$16,25$",
      "explicacion": "12,50 + 3,75 = 16,25 con las comas alineadas."
    },
    {
      "pregunta": "¿Cuánto es 8,3 − 2,47?",
      "opciones": [
        "$5,83$",
        "$6,17$",
        "$6,43$"
      ],
      "respuesta": "$5,83$",
      "explicacion": "8,30 − 2,47 = 5,83."
    }
  ]
}$numeria$::jsonb,
  2, true),

('numeria-clase-decimal-multiplicar', 'Multiplicar decimales',
  'Multiplicar como enteros y contar los decimales para poner la coma.',
  'decimales',
  $numeria${
  "pasos": [
    "Para multiplicar decimales no hace falta alinear comas: multiplicas como si fueran enteros.",
    "Después cuentas cuántos decimales tienen los dos factores juntos, y el resultado lleva esa cantidad de decimales."
  ],
  "visuales": [
    {
      "tipo": "numeria.decimal",
      "modo": "multiplicar",
      "a": "2.5",
      "b": "1.3",
      "despuesDePaso": 1,
      "titulo": "2,5 × 1,3"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es 2,5 × 1,3?",
      "opciones": [
        "$3,25$",
        "$32,5$",
        "$0,325$"
      ],
      "respuesta": "$3,25$",
      "explicacion": "25 × 13 = 325 y hay 2 decimales en total: 3,25."
    },
    {
      "pregunta": "¿Cuántos decimales tiene el resultado de 0,2 × 0,03?",
      "opciones": [
        "3",
        "2",
        "1"
      ],
      "respuesta": "3",
      "explicacion": "1 decimal + 2 decimales = 3: 0,2 × 0,03 = 0,006."
    }
  ]
}$numeria$::jsonb,
  3, true),

('numeria-clase-decimal-fraccion', 'De fracción a decimal',
  'La raya de fracción es una división: decimales exactos y periódicos.',
  'decimales',
  $numeria${
  "pasos": [
    "Toda fracción es una división: $\\frac{3}{8}$ es $3 \\div 8$.",
    "Si el resto llega a cero, el decimal es exacto. Si un resto se repite, los decimales se repiten para siempre: es periódico."
  ],
  "visuales": [
    {
      "tipo": "numeria.decimal",
      "modo": "fraccionADecimal",
      "num": 3,
      "den": 8,
      "despuesDePaso": 1,
      "titulo": "$\\frac{3}{8}$ como decimal"
    },
    {
      "tipo": "numeria.decimal",
      "modo": "fraccionADecimal",
      "num": 1,
      "den": 3,
      "despuesDePaso": 1,
      "titulo": "$\\frac{1}{3}$: un decimal que no termina"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $\\frac{3}{8}$ como decimal?",
      "opciones": [
        "$0,375$",
        "$0,38$",
        "$2,666$"
      ],
      "respuesta": "$0,375$",
      "explicacion": "3 ÷ 8 = 0,375: el resto llega a cero."
    },
    {
      "pregunta": "¿Cómo es el decimal de $\\frac{1}{3}$?",
      "opciones": [
        "Periódico: 0,333…",
        "Exacto: 0,3",
        "Exacto: 0,33"
      ],
      "respuesta": "Periódico: 0,333…",
      "explicacion": "El resto 1 se repite siempre: el 3 no termina nunca."
    }
  ]
}$numeria$::jsonb,
  4, true),

('numeria-clase-porcentaje-que-es', 'Qué es un porcentaje',
  'De cada 100: porcentaje, fracción y decimal son lo mismo.',
  'decimales',
  $numeria${
  "pasos": [
    "\"Por ciento\" quiere decir \"de cada 100\": 35 % es 35 de cada 100.",
    "Por eso un porcentaje es una fracción con denominador 100, y también un decimal (divides entre 100)."
  ],
  "visuales": [
    {
      "tipo": "numeria.porcentaje",
      "modo": "cuadricula",
      "porcentaje": 35,
      "despuesDePaso": 1,
      "titulo": "35 % en una cuadrícula de 100"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es 35 % como decimal?",
      "opciones": [
        "$0,35$",
        "$3,5$",
        "$35$"
      ],
      "respuesta": "$0,35$",
      "explicacion": "35 ÷ 100 = 0,35."
    },
    {
      "pregunta": "¿Qué porcentaje es $\\frac{1}{4}$?",
      "opciones": [
        "25 %",
        "14 %",
        "40 %"
      ],
      "respuesta": "25 %",
      "explicacion": "$\\frac{1}{4} = \\frac{25}{100}$ = 25 %."
    }
  ]
}$numeria$::jsonb,
  5, true),

('numeria-clase-porcentaje-de', 'Calcular el porcentaje de un número',
  'El truco del 10 % y el 1 %, y la cuenta directa.',
  'decimales',
  $numeria${
  "pasos": [
    "El 10 % de un número es dividirlo entre 10, y el 1 % es dividirlo entre 100.",
    "Cualquier porcentaje se arma con esos dos: 35 % son 3 veces el 10 % más 5 veces el 1 %. O directo: número × porcentaje ÷ 100."
  ],
  "visuales": [
    {
      "tipo": "numeria.porcentaje",
      "modo": "de",
      "porcentaje": 35,
      "base": 80,
      "despuesDePaso": 1,
      "titulo": "35 % de 80"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es el 10 % de 80?",
      "opciones": [
        "$8$",
        "$0,8$",
        "$10$"
      ],
      "respuesta": "$8$",
      "explicacion": "80 ÷ 10 = 8."
    },
    {
      "pregunta": "¿Cuánto es el 35 % de 80?",
      "opciones": [
        "$28$",
        "$35$",
        "$24$"
      ],
      "respuesta": "$28$",
      "explicacion": "3 × 8 + 5 × 0,8 = 24 + 4 = 28."
    }
  ]
}$numeria$::jsonb,
  6, true),

('numeria-clase-porcentaje-aumentos', 'Aumentos y descuentos',
  'Sumar o restar un porcentaje, y el atajo de multiplicar.',
  'decimales',
  $numeria${
  "pasos": [
    "Un aumento suma una parte del precio; un descuento la resta. Primero calcula esa parte.",
    "Atajo: con 15 % de aumento pagas el 115 %, o sea × 1,15. Con 25 % de descuento pagas el 75 %: × 0,75."
  ],
  "visuales": [
    {
      "tipo": "numeria.porcentaje",
      "modo": "cambio",
      "porcentaje": 15,
      "base": 200,
      "tipoCambio": "aumento",
      "despuesDePaso": 1,
      "titulo": "200 con 15 % de aumento"
    },
    {
      "tipo": "numeria.porcentaje",
      "modo": "cambio",
      "porcentaje": 25,
      "base": 80,
      "tipoCambio": "descuento",
      "despuesDePaso": 1,
      "titulo": "80 con 25 % de descuento"
    }
  ],
  "quiz": [
    {
      "pregunta": "Un precio de 200 sube 15 %. ¿Cuánto queda?",
      "opciones": [
        "$230$",
        "$215$",
        "$170$"
      ],
      "respuesta": "$230$",
      "explicacion": "15 % de 200 = 30, y 200 + 30 = 230."
    },
    {
      "pregunta": "Algo cuesta 80 con 25 % de descuento. ¿Cuánto pagas?",
      "opciones": [
        "$60$",
        "$55$",
        "$20$"
      ],
      "respuesta": "$60$",
      "explicacion": "25 % de 80 = 20, y 80 − 20 = 60."
    }
  ]
}$numeria$::jsonb,
  7, true),

('numeria-clase-potencia-que-es', 'Qué es una potencia',
  'Base y exponente: multiplicar un número por sí mismo varias veces.',
  'potencias',
  $numeria${
  "pasos": [
    "Una potencia es una multiplicación repetida: $3^4$ es $3 \\times 3 \\times 3 \\times 3$.",
    "El número de abajo es la base (lo que se multiplica) y el chiquito de arriba es el exponente (cuántas veces)."
  ],
  "visuales": [
    {
      "tipo": "numeria.potencia",
      "base": 3,
      "exponente": 4,
      "modo": "cadena",
      "despuesDePaso": 1,
      "titulo": "$3^4$ paso a paso"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $3^4$?",
      "opciones": [
        "81",
        "12",
        "64"
      ],
      "respuesta": "81",
      "explicacion": "3 × 3 × 3 × 3 = 81."
    },
    {
      "pregunta": "En $5^2$, ¿cuál es la base?",
      "opciones": [
        "5",
        "2",
        "25"
      ],
      "respuesta": "5",
      "explicacion": "La base es el número que se multiplica: 5."
    }
  ]
}$numeria$::jsonb,
  1, true),

('numeria-clase-potencia-producto', 'Multiplicar potencias de igual base',
  'Los exponentes se suman: $2^3 \cdot 2^4 = 2^7$.',
  'potencias',
  $numeria${
  "pasos": [
    "Si multiplicas potencias con la misma base, juntas todos los factores en una sola fila.",
    "Por eso los exponentes se suman. Ojo: solo funciona si la base es la misma."
  ],
  "visuales": [
    {
      "tipo": "numeria.exponentes",
      "ley": "producto",
      "base": 2,
      "m": 3,
      "n": 4,
      "despuesDePaso": 1,
      "titulo": "$2^3 \\cdot 2^4$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $2^3 \\cdot 2^4$ como potencia?",
      "opciones": [
        "$2^{7}$",
        "$2^{12}$",
        "$4^7$"
      ],
      "respuesta": "$2^{7}$",
      "explicacion": "3 + 4 = 7 factores en total."
    },
    {
      "pregunta": "¿Se pueden sumar los exponentes de $2^3 \\cdot 5^2$?",
      "opciones": [
        "No, las bases son distintas",
        "Sí, da $10^5$",
        "Sí, da $7^5$"
      ],
      "respuesta": "No, las bases son distintas",
      "explicacion": "La regla solo vale con la misma base."
    }
  ]
}$numeria$::jsonb,
  2, true),

('numeria-clase-potencia-cociente', 'Dividir potencias de igual base',
  'Los factores se tachan y los exponentes se restan.',
  'potencias',
  $numeria${
  "pasos": [
    "Al dividir potencias con la misma base, cada factor de abajo se tacha con uno de arriba.",
    "Quedan los que sobran: los exponentes se restan."
  ],
  "visuales": [
    {
      "tipo": "numeria.exponentes",
      "ley": "cociente",
      "base": 5,
      "m": 6,
      "n": 2,
      "despuesDePaso": 1,
      "titulo": "$\\frac{5^6}{5^2}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $\\frac{5^6}{5^2}$?",
      "opciones": [
        "$5^{4}$",
        "$5^3$",
        "$1^4$"
      ],
      "respuesta": "$5^{4}$",
      "explicacion": "6 − 2 = 4."
    },
    {
      "pregunta": "¿Cuánto es $\\frac{10^5}{10^3}$?",
      "opciones": [
        "$100$",
        "$10^8$",
        "$2$"
      ],
      "respuesta": "$100$",
      "explicacion": "$10^{5-3} = 10^2 = 100$."
    }
  ]
}$numeria$::jsonb,
  3, true),

('numeria-clase-potencia-potencia-cero', 'Potencia de una potencia y exponente cero',
  '$(3^2)^3 = 3^6$ y por qué $7^0 = 1$.',
  'potencias',
  $numeria${
  "pasos": [
    "Una potencia elevada a otra son varios grupos iguales: los exponentes se multiplican.",
    "Y cualquier número (menos el 0) elevado a 0 vale 1: es una potencia dividida por sí misma."
  ],
  "visuales": [
    {
      "tipo": "numeria.exponentes",
      "ley": "potencia",
      "base": 3,
      "m": 2,
      "n": 3,
      "despuesDePaso": 0,
      "titulo": "$(3^2)^3$"
    },
    {
      "tipo": "numeria.exponentes",
      "ley": "cero",
      "base": 7,
      "m": 3,
      "n": 3,
      "despuesDePaso": 1,
      "titulo": "Por qué $7^0 = 1$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $(3^2)^3$ como potencia?",
      "opciones": [
        "$3^{6}$",
        "$3^5$",
        "$9^5$"
      ],
      "respuesta": "$3^{6}$",
      "explicacion": "2 × 3 = 6."
    },
    {
      "pregunta": "¿Cuánto vale $125^0$?",
      "opciones": [
        "1",
        "0",
        "125"
      ],
      "respuesta": "1",
      "explicacion": "Toda base distinta de 0 elevada a 0 da 1."
    }
  ]
}$numeria$::jsonb,
  4, true),

('numeria-clase-raiz-cuadrada', 'La raíz cuadrada',
  'El lado de un cuadrado: la operación inversa de elevar al cuadrado.',
  'potencias',
  $numeria${
  "pasos": [
    "Elevar al cuadrado es armar un cuadrado: $7^2 = 49$ cuadritos.",
    "La raíz cuadrada hace lo contrario: si tienes 49 cuadritos en un cuadrado, ¿cuánto mide el lado? $\\sqrt{49} = 7$."
  ],
  "visuales": [
    {
      "tipo": "numeria.raiz",
      "n": 49,
      "despuesDePaso": 1,
      "titulo": "$\\sqrt{49}$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $\\sqrt{49}$?",
      "opciones": [
        "7",
        "24,5",
        "9"
      ],
      "respuesta": "7",
      "explicacion": "7 × 7 = 49."
    },
    {
      "pregunta": "¿Cuánto es $\\sqrt{144}$?",
      "opciones": [
        "12",
        "14",
        "72"
      ],
      "respuesta": "12",
      "explicacion": "12 × 12 = 144."
    }
  ]
}$numeria$::jsonb,
  5, true),

('numeria-clase-raiz-estimar', 'Estimar raíces que no son exactas',
  'Encerrar la raíz entre dos cuadrados perfectos.',
  'potencias',
  $numeria${
  "pasos": [
    "Si el número no es un cuadrado perfecto, busca los dos cuadrados perfectos entre los que está.",
    "La raíz queda entre sus lados, y más cerca del cuadrado al que el número se acerca más."
  ],
  "visuales": [
    {
      "tipo": "numeria.raiz",
      "n": 50,
      "despuesDePaso": 1,
      "titulo": "$\\sqrt{50}$: entre 7 y 8"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Entre qué números está $\\sqrt{50}$?",
      "opciones": [
        "Entre 7 y 8",
        "Entre 5 y 6",
        "Entre 24 y 26"
      ],
      "respuesta": "Entre 7 y 8",
      "explicacion": "$7^2 = 49$ y $8^2 = 64$."
    },
    {
      "pregunta": "¿$\\sqrt{50}$ está más cerca de 7 o de 8?",
      "opciones": [
        "De 7",
        "De 8",
        "Justo en el medio"
      ],
      "respuesta": "De 7",
      "explicacion": "50 está a 1 de 49 y a 14 de 64."
    }
  ]
}$numeria$::jsonb,
  6, true),

('numeria-clase-algebra-variables', 'Variables y expresiones',
  'Una letra que guarda un número, y cómo evaluar una expresión.',
  'algebra',
  $numeria${
  "pasos": [
    "Una variable es una letra que representa un número que todavía no conocemos (o que puede cambiar). $3x$ quiere decir $3 \\times x$.",
    "Evaluar es reemplazar la letra por un número y hacer la cuenta: si $x = 5$, entonces $3x + 2 = 3 \\cdot 5 + 2 = 17$."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Evaluar $3x + 2$ cuando $x = 5$",
      "cuadros": [
        {
          "texto": "La expresión tiene una letra:",
          "formula": "3x + 2"
        },
        {
          "texto": "Reemplaza la x por 5:",
          "formula": "3 \\cdot 5 + 2"
        },
        {
          "texto": "Primero la multiplicación, después la suma:",
          "formula": "15 + 2",
          "resaltar": "$= 17$"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué quiere decir $4x$?",
      "opciones": [
        "$4 \\times x$",
        "$4 + x$",
        "40 y algo"
      ],
      "respuesta": "$4 \\times x$",
      "explicacion": "Un número pegado a una letra se multiplica."
    },
    {
      "pregunta": "Si $x = 3$, ¿cuánto vale $2x + 5$?",
      "opciones": [
        "11",
        "28",
        "10"
      ],
      "respuesta": "11",
      "explicacion": "2 · 3 + 5 = 11."
    }
  ]
}$numeria$::jsonb,
  1, true),

('numeria-clase-algebra-terminos', 'Términos semejantes',
  'Juntar lo que tiene la misma letra para simplificar una expresión.',
  'algebra',
  $numeria${
  "pasos": [
    "Términos semejantes son los que tienen la misma letra (o ninguna): $3x$ y $-x$ son semejantes; $2$ y $5$ también.",
    "Para simplificar, se suman los coeficientes de cada grupo. $x$ con $x$, números con números: nunca se mezclan."
  ],
  "visuales": [
    {
      "tipo": "numeria.terminos",
      "terminos": [
        {
          "coef": 3,
          "var": "x"
        },
        {
          "coef": 2,
          "var": ""
        },
        {
          "coef": -1,
          "var": "x"
        },
        {
          "coef": 5,
          "var": ""
        }
      ],
      "despuesDePaso": 1,
      "titulo": "$3x + 2 - x + 5$"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo queda $3x + 2 - x + 5$?",
      "opciones": [
        "$2x + 7$",
        "$9x$",
        "$4x + 7$"
      ],
      "respuesta": "$2x + 7$",
      "explicacion": "3x − x = 2x y 2 + 5 = 7."
    },
    {
      "pregunta": "¿Se pueden juntar $4x$ y $3$?",
      "opciones": [
        "No, no son semejantes",
        "Sí, da $7x$",
        "Sí, da $12x$"
      ],
      "respuesta": "No, no son semejantes",
      "explicacion": "Uno tiene x y el otro no."
    }
  ]
}$numeria$::jsonb,
  2, true),

('numeria-clase-algebra-distributiva', 'La propiedad distributiva',
  'Repartir la multiplicación: $3(x + 4) = 3x + 12$.',
  'algebra',
  $numeria${
  "pasos": [
    "Un número delante de un paréntesis multiplica a todo lo que hay adentro.",
    "Se ve con un rectángulo: alto 3 y ancho $x + 4$. Su área son dos pedazos: $3x$ y $12$."
  ],
  "visuales": [
    {
      "tipo": "numeria.distributiva",
      "factor": 3,
      "sumandos": [
        {
          "coef": 1,
          "var": "x"
        },
        {
          "coef": 4,
          "var": ""
        }
      ],
      "despuesDePaso": 1,
      "titulo": "$3(x + 4)$ como área"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto es $3(x + 4)$?",
      "opciones": [
        "$3x + 12$",
        "$3x + 4$",
        "$7x$"
      ],
      "respuesta": "$3x + 12$",
      "explicacion": "3 · x = 3x y 3 · 4 = 12."
    },
    {
      "pregunta": "¿Cuánto es $2(5 - x)$?",
      "opciones": [
        "$10 - 2x$",
        "$10 - x$",
        "$7 - x$"
      ],
      "respuesta": "$10 - 2x$",
      "explicacion": "2 · 5 = 10 y 2 · (−x) = −2x."
    }
  ]
}$numeria$::jsonb,
  3, true),

('numeria-clase-algebra-un-paso', 'Ecuaciones de un paso',
  'Una ecuación es una balanza: lo que haces de un lado lo haces del otro.',
  'algebra',
  $numeria${
  "pasos": [
    "Una ecuación es como una balanza en equilibrio: los dos lados valen lo mismo.",
    "Para despejar x, haz la operación contraria de los dos lados: si suma, resta; si multiplica, divide."
  ],
  "visuales": [
    {
      "tipo": "numeria.balanza",
      "coefX": 1,
      "constante": 5,
      "resultado": 12,
      "modo": "despejar",
      "despuesDePaso": 1,
      "titulo": "$x + 5 = 12$"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si $x + 5 = 12$, ¿cuánto vale x?",
      "opciones": [
        "7",
        "17",
        "60"
      ],
      "respuesta": "7",
      "explicacion": "Restando 5 de los dos lados: x = 7."
    },
    {
      "pregunta": "Si $4x = 20$, ¿cuánto vale x?",
      "opciones": [
        "5",
        "16",
        "80"
      ],
      "respuesta": "5",
      "explicacion": "Dividiendo los dos lados entre 4: x = 5."
    }
  ]
}$numeria$::jsonb,
  4, true),

('numeria-clase-algebra-dos-pasos', 'Ecuaciones de dos pasos',
  'Primero se va el número suelto, después el que multiplica.',
  'algebra',
  $numeria${
  "pasos": [
    "En $3x + 4 = 19$ hay dos cosas encima de la x: un + 4 y un × 3.",
    "Se deshacen en orden inverso: primero el + 4 (restando), después el × 3 (dividiendo). Al final, verifica reemplazando."
  ],
  "visuales": [
    {
      "tipo": "numeria.balanza",
      "coefX": 3,
      "constante": 4,
      "resultado": 19,
      "modo": "despejar",
      "despuesDePaso": 1,
      "titulo": "$3x + 4 = 19$"
    },
    {
      "tipo": "numeria.balanza",
      "coefX": 3,
      "constante": 4,
      "resultado": 19,
      "modo": "verificar",
      "despuesDePaso": 1,
      "titulo": "Verificar: x = 5"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si $3x + 4 = 19$, ¿cuánto vale x?",
      "opciones": [
        "5",
        "7",
        "23"
      ],
      "respuesta": "5",
      "explicacion": "19 − 4 = 15 y 15 ÷ 3 = 5."
    },
    {
      "pregunta": "Si $2x - 6 = 10$, ¿cuánto vale x?",
      "opciones": [
        "8",
        "2",
        "16"
      ],
      "respuesta": "8",
      "explicacion": "10 + 6 = 16 y 16 ÷ 2 = 8."
    }
  ]
}$numeria$::jsonb,
  5, true),

('numeria-clase-algebra-dos-lados', 'Ecuaciones con x en los dos lados',
  'Juntar las x de un lado y los números del otro.',
  'algebra',
  $numeria${
  "pasos": [
    "Si hay x en los dos lados, primero quita las x de un lado (restando) para que queden todas juntas.",
    "Después es una ecuación de dos pasos como las anteriores."
  ],
  "visuales": [
    {
      "tipo": "numeria.ecuacion",
      "a": 5,
      "b": 3,
      "c": 2,
      "d": 15,
      "despuesDePaso": 1,
      "titulo": "$5x + 3 = 2x + 15$"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si $5x + 3 = 2x + 15$, ¿cuánto vale x?",
      "opciones": [
        "4",
        "6",
        "2"
      ],
      "respuesta": "4",
      "explicacion": "Restando 2x: 3x + 3 = 15. Restando 3: 3x = 12. Entonces x = 4."
    },
    {
      "pregunta": "En $7x = 3x + 20$, ¿qué conviene hacer primero?",
      "opciones": [
        "Restar 3x de los dos lados",
        "Restar 20",
        "Dividir entre 7"
      ],
      "respuesta": "Restar 3x de los dos lados",
      "explicacion": "Así las x quedan de un solo lado: 4x = 20."
    }
  ]
}$numeria$::jsonb,
  6, true),

('numeria-clase-geometria-angulos', 'Ángulos complementarios y suplementarios',
  'Los que juntos forman 90° y los que forman 180°.',
  'geometria',
  $numeria${
  "pasos": [
    "Un ángulo recto mide 90° (una esquina) y un ángulo llano mide 180° (una recta).",
    "Dos ángulos son complementarios si suman 90° y suplementarios si suman 180°."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "angulos",
      "tipoAngulo": "complementario",
      "conocido": 35,
      "despuesDePaso": 1,
      "titulo": "El complemento de 35°"
    },
    {
      "tipo": "numeria.figura",
      "modo": "angulos",
      "tipoAngulo": "suplementario",
      "conocido": 120,
      "despuesDePaso": 1,
      "titulo": "El suplemento de 120°"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el complemento de 35°?",
      "opciones": [
        "55°",
        "145°",
        "35°"
      ],
      "respuesta": "55°",
      "explicacion": "90° − 35° = 55°."
    },
    {
      "pregunta": "¿Cuál es el suplemento de 120°?",
      "opciones": [
        "60°",
        "30°",
        "240°"
      ],
      "respuesta": "60°",
      "explicacion": "180° − 120° = 60°."
    }
  ]
}$numeria$::jsonb,
  1, true),

('numeria-clase-geometria-triangulo-angulos', 'Los ángulos de un triángulo suman 180°',
  'Si cortas las tres esquinas y las juntas, forman una recta.',
  'geometria',
  $numeria${
  "pasos": [
    "En cualquier triángulo, los tres ángulos juntos suman 180°: si los pones uno al lado del otro, forman una recta.",
    "Por eso, si conoces dos ángulos, el tercero es lo que falta para 180°."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "sumaAngulos",
      "a": 50,
      "b": 60,
      "despuesDePaso": 1,
      "titulo": "Un triángulo con 50° y 60°"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si un triángulo tiene ángulos de 50° y 60°, ¿cuánto mide el tercero?",
      "opciones": [
        "70°",
        "90°",
        "110°"
      ],
      "respuesta": "70°",
      "explicacion": "180° − 50° − 60° = 70°."
    },
    {
      "pregunta": "¿Puede un triángulo tener dos ángulos de 100°?",
      "opciones": [
        "No, ya se pasan de 180°",
        "Sí",
        "Solo si es grande"
      ],
      "respuesta": "No, ya se pasan de 180°",
      "explicacion": "100° + 100° = 200° > 180°."
    }
  ]
}$numeria$::jsonb,
  2, true),

('numeria-clase-geometria-rectangulo', 'Perímetro y área del rectángulo',
  'El borde y la superficie: lo que se mide con una cinta y lo que se cubre con baldosas.',
  'geometria',
  $numeria${
  "pasos": [
    "El perímetro es el largo del borde: sumas los cuatro lados, $P = 2 \\times (\\text{base} + \\text{altura})$.",
    "El área es cuántos cuadritos de 1 × 1 caben adentro: $A = \\text{base} \\times \\text{altura}$."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "rectangulo",
      "ancho": 6,
      "alto": 4,
      "despuesDePaso": 1,
      "titulo": "Un rectángulo de 6 × 4"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el perímetro de un rectángulo de 6 × 4?",
      "opciones": [
        "20",
        "24",
        "10"
      ],
      "respuesta": "20",
      "explicacion": "6 + 4 + 6 + 4 = 20."
    },
    {
      "pregunta": "¿Cuál es su área?",
      "opciones": [
        "24",
        "20",
        "10"
      ],
      "respuesta": "24",
      "explicacion": "6 × 4 = 24 cuadritos."
    }
  ]
}$numeria$::jsonb,
  3, true),

('numeria-clase-geometria-area-triangulo', 'Área del triángulo',
  'Un triángulo es la mitad de un rectángulo.',
  'geometria',
  $numeria${
  "pasos": [
    "Todo triángulo cabe en un rectángulo con la misma base y la misma altura, y ocupa justo la mitad.",
    "Por eso $A = \\frac{\\text{base} \\times \\text{altura}}{2}$. La altura siempre se mide derecha, perpendicular a la base."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "areaTriangulo",
      "base": 8,
      "altura": 5,
      "despuesDePaso": 1,
      "titulo": "Base 8, altura 5"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el área de un triángulo de base 8 y altura 5?",
      "opciones": [
        "20",
        "40",
        "13"
      ],
      "respuesta": "20",
      "explicacion": "8 × 5 = 40 y la mitad es 20."
    },
    {
      "pregunta": "¿Por qué se divide entre 2?",
      "opciones": [
        "Porque es la mitad del rectángulo",
        "Porque tiene 2 lados iguales",
        "Porque son 2 medidas"
      ],
      "respuesta": "Porque es la mitad del rectángulo",
      "explicacion": "El triángulo ocupa la mitad del rectángulo que lo encierra."
    }
  ]
}$numeria$::jsonb,
  4, true),

('numeria-clase-geometria-circulo', 'El círculo: área',
  'Radio, diámetro y la fórmula $A = \pi r^2$.',
  'geometria',
  $numeria${
  "pasos": [
    "El radio va del centro al borde; el diámetro cruza todo el círculo y mide el doble.",
    "El área es $\\pi \\times r^2$, con $\\pi \\approx 3,14$ (o $\\frac{22}{7}$ si el radio es múltiplo de 7)."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "circulo",
      "radio": 7,
      "despuesDePaso": 1,
      "titulo": "Un círculo de radio 7"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si el radio es 7, ¿cuánto mide el diámetro?",
      "opciones": [
        "14",
        "7",
        "49"
      ],
      "respuesta": "14",
      "explicacion": "El diámetro es el doble del radio."
    },
    {
      "pregunta": "¿Cuál es el área con radio 7 (usando $\\frac{22}{7}$)?",
      "opciones": [
        "154",
        "44",
        "21,98"
      ],
      "respuesta": "154",
      "explicacion": "$\\frac{22}{7} \\times 49 = 154$."
    }
  ]
}$numeria$::jsonb,
  5, true),

('numeria-clase-geometria-pitagoras', 'El teorema de Pitágoras',
  'En un triángulo rectángulo, los cuadrados de los catetos suman el de la hipotenusa.',
  'geometria',
  $numeria${
  "pasos": [
    "En un triángulo rectángulo, el lado más largo (frente al ángulo recto) es la hipotenusa; los otros dos son los catetos.",
    "Si dibujas un cuadrado sobre cada lado, los dos chicos juntos tienen la misma área que el grande: $a^2 + b^2 = c^2$."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "pitagoras",
      "cateto1": 3,
      "cateto2": 4,
      "despuesDePaso": 1,
      "titulo": "Catetos 3 y 4"
    },
    {
      "tipo": "numeria.figura",
      "modo": "triangulo",
      "cateto1": 6,
      "cateto2": 8,
      "despuesDePaso": 1,
      "titulo": "Catetos 6 y 8"
    }
  ],
  "quiz": [
    {
      "pregunta": "Si los catetos miden 3 y 4, ¿cuánto mide la hipotenusa?",
      "opciones": [
        "5",
        "7",
        "12"
      ],
      "respuesta": "5",
      "explicacion": "9 + 16 = 25 y $\\sqrt{25} = 5$."
    },
    {
      "pregunta": "Si los catetos miden 6 y 8, ¿cuánto mide la hipotenusa?",
      "opciones": [
        "10",
        "14",
        "48"
      ],
      "respuesta": "10",
      "explicacion": "36 + 64 = 100 y $\\sqrt{100} = 10$."
    }
  ]
}$numeria$::jsonb,
  6, true),

('numeria-clase-geometria-areas-compuestas', 'Áreas de figuras compuestas',
  'Partir en rectángulos, o calcular el grande y restar el hueco.',
  'geometria',
  $numeria${
  "pasos": [
    "Una figura con forma rara casi siempre se arma con rectángulos.",
    "Un camino fácil: calcula el rectángulo grande y réstale el pedazo que falta."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "areaCompuesta",
      "anchoGrande": 10,
      "altoGrande": 6,
      "anchoRecorte": 4,
      "altoRecorte": 3,
      "despuesDePaso": 1,
      "titulo": "Un rectángulo de 10 × 6 con un recorte de 4 × 3"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el área de un 10 × 6 con un recorte de 4 × 3?",
      "opciones": [
        "48",
        "60",
        "72"
      ],
      "respuesta": "48",
      "explicacion": "60 − 12 = 48."
    },
    {
      "pregunta": "¿Qué otra forma hay de calcularla?",
      "opciones": [
        "Partirla en rectángulos y sumarlos",
        "Multiplicar todos los lados",
        "Sumar todos los lados"
      ],
      "respuesta": "Partirla en rectángulos y sumarlos",
      "explicacion": "Sumar las partes o restar el hueco da lo mismo."
    }
  ]
}$numeria$::jsonb,
  7, true),

('numeria-clase-geometria-volumen', 'Volumen de una caja (prisma)',
  'Cuántos cubitos caben: capas de largo × ancho, apiladas.',
  'geometria',
  $numeria${
  "pasos": [
    "El volumen es cuántos cubitos de 1 × 1 × 1 caben adentro.",
    "Una capa tiene largo × ancho cubitos, y hay tantas capas como la altura: $V = \\text{largo} \\times \\text{ancho} \\times \\text{alto}$."
  ],
  "visuales": [
    {
      "tipo": "numeria.figura",
      "modo": "volumen",
      "largo": 4,
      "ancho": 3,
      "alto": 2,
      "despuesDePaso": 1,
      "titulo": "Una caja de 4 × 3 × 2"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el volumen de una caja de 4 × 3 × 2?",
      "opciones": [
        "24",
        "9",
        "12"
      ],
      "respuesta": "24",
      "explicacion": "Una capa tiene 12 cubitos y hay 2 capas: 24."
    },
    {
      "pregunta": "Un cubo de lado 3, ¿cuántos cubitos tiene?",
      "opciones": [
        "27",
        "9",
        "12"
      ],
      "respuesta": "27",
      "explicacion": "3 × 3 × 3 = 27."
    }
  ]
}$numeria$::jsonb,
  8, true)
on conflict (slug) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  problem_type = excluded.problem_type,
  contenido = excluded.contenido,
  orden = excluded.orden,
  requiere_pro = excluded.requiere_pro;
