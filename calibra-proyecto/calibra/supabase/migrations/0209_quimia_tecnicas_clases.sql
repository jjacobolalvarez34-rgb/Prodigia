-- ============================================================
-- Prodigia — Quimia: Aprender pasa a Técnicas | Clases (tanda 1 de 2 del
-- retrofit de Quimia; docs/PARIDAD_MUNDOS.md filas 22/23 y la sección
-- "Quimia: Técnicas | Clases (tanda 1)").
--
-- Antes: 4 Técnicas mnemotécnicas (0056 + quiz de 0175), sin Clases y sin
-- visuales, en 3 grupos (símbolos, fórmulas, tabla). Ahora:
--   - las 4 Técnicas existentes se REESCRIBEN: español neutro sin voseo (el
--     texto que sembraron 0056 y 0175 usaba voseo rioplatense; en esos dos
--     archivos se corrigió además solo esa redacción, ya que esta migración
--     pisa el contenido), precisiones químicas (los
--     oxoácidos terminan en -ico O -oso; "ácido clorhídrico" es la solución
--     en agua) y visuales; "patrones-en-formulas" pasa del grupo fórmulas al
--     grupo nomenclatura, que es de lo que trata;
--   - Técnicas nuevas por grupo (tabla, símbolos, fórmulas, nomenclatura);
--   - Clases nuevas: el curso desde el átomo hasta la nomenclatura inorgánica
--     (los grupos redox y orgánica los agrega la tanda 2).
--
-- Todo dato químico de las lecciones sale de tablas de referencia con tests
-- (src/lib/quimia/{tabla,datos,formulas,nomenclatura,enlaces,valencia}.ts):
-- configuración electrónica contrastada para los 118 elementos, nombres en los
-- tres sistemas contrastados con reglas calculadas, masas molares sumadas desde
-- la tabla de masas atómicas. Las lecciones traen `contenido.visuales` con los
-- visuales "quimia.*" (tabla periódica animada, ficha de elemento, enlace,
-- cruce de cargas, cuadro de datos y llenado de subcapas) y el primitivo
-- genérico "cuadros".
--
-- Técnicas: 16 en total (tabla 5, simbolos 3, formulas 3, nomenclatura 5): 4 ya existían (se ACTUALIZAN) y 12 son nuevas.
-- Clases: 17 (tabla 4, simbolos 2, formulas 3, nomenclatura 8), requiere_pro = true.
--
-- Este archivo se GENERA desde src/lib/quimia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones
-- ============================================================

-- 1) Técnicas que ya existían: se actualizan por slug (texto en español neutro, quiz corregido, visuales).

update public.techniques
set nombre = 'Agrupar por familia',
  descripcion = 'En vez de memorizar elementos sueltos, agruparlos por familia química.',
  contenido = $quimia${
  "pasos": [
    "No memorices los elementos sueltos, uno por uno: agrúpalos por familia. Los metales alcalinos (Li, Na, K...), los halógenos (F, Cl, Br...) y los gases nobles (He, Ne, Ar...) son familias.",
    "Cada familia comparte comportamiento. Si sabes que el sodio (Na) es un metal alcalino muy reactivo, ya sabes algo real del litio (Li) y del potasio (K) sin memorizarlos aparte.",
    "Menos datos sueltos y más patrones que reconocer: así funciona la memoria a largo plazo."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 0,
      "pasos": [
        {
          "etiqueta": "La tabla periódica reúne a los elementos en familias; aquí cada familia tiene su color."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "alcalino"
          },
          "etiqueta": "Metales alcalinos (Li, Na, K...): metales blandos y muy reactivos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "halogeno"
          },
          "etiqueta": "Halógenos (F, Cl, Br, I...): no metales muy reactivos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "gasNoble"
          },
          "etiqueta": "Gases nobles (He, Ne, Ar...): casi no reaccionan con nada."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la ventaja principal de agrupar los elementos por familia química en vez de memorizarlos sueltos?",
      "opciones": [
        "Compartir comportamiento significa que conocer uno te da información sobre los demás",
        "Todos los elementos de una familia tienen el mismo número atómico",
        "Las familias químicas cambian según el compuesto",
        "Ya no hace falta aprender ningún elemento individual"
      ],
      "respuesta": "Compartir comportamiento significa que conocer uno te da información sobre los demás",
      "explicacion": "Es la idea central: si el sodio es un metal alcalino reactivo, ya sabes algo real de sus parientes de familia sin memorizarlos aparte."
    },
    {
      "pregunta": "¿Cuáles de estos tres elementos pertenecen a la misma familia (los metales alcalinos)?",
      "opciones": [
        "Cloro, flúor y bromo",
        "Helio, neón y argón",
        "Litio, sodio y potasio",
        "Hierro, cobre y oro"
      ],
      "respuesta": "Litio, sodio y potasio",
      "explicacion": "Li, Na y K son metales alcalinos, de la columna 1 de la tabla (cloro, flúor y bromo son halógenos; helio, neón y argón son gases nobles)."
    },
    {
      "pregunta": "Si sabes que el sodio (Na) es un metal alcalino muy reactivo, ¿qué puedes suponer del litio (Li) y del potasio (K) sin memorizarlos aparte?",
      "opciones": [
        "Que tienen el mismo número atómico que el sodio",
        "Que no reaccionan con nada",
        "Que son gases nobles",
        "Que también son metales alcalinos reactivos, por ser de la misma familia"
      ],
      "respuesta": "Que también son metales alcalinos reactivos, por ser de la misma familia",
      "explicacion": "Conocer una familia te da el comportamiento general de todos sus miembros: los alcalinos son metales blandos y reactivos."
    },
    {
      "pregunta": "¿Cuál de estos conjuntos es una familia de la tabla periódica?",
      "opciones": [
        "Sodio, cloro y hierro",
        "Flúor, cloro y bromo (los halógenos)",
        "Oxígeno, calcio y helio",
        "Carbono, plata y neón"
      ],
      "respuesta": "Flúor, cloro y bromo (los halógenos)",
      "explicacion": "Flúor, cloro y bromo son halógenos: no metales muy reactivos del grupo 17. Los otros conjuntos mezclan elementos de familias distintas."
    }
  ]
}$quimia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'agrupar-por-familia' and problem_type = 'quimia';

update public.techniques
set nombre = 'Leer la tabla como un mapa, no como una lista',
  descripcion = 'Usar la posición (fila = período, columna = grupo) como coordenada para ubicar un elemento.',
  contenido = $quimia${
  "pasos": [
    "La tabla periódica no es una lista para memorizar de memoria: es un mapa con coordenadas, la fila (período) y la columna (grupo).",
    "Es el mismo truco que usas en Geografía con país y vecino: si sabes dónde está el sodio (Na, período 3, grupo 1), el magnesio (Mg) está justo al lado: período 3, grupo 2.",
    "Los elementos de una misma columna se parecen entre sí. Usa esa cercanía como pista y no memorices cada casillero suelto."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Na"
            ]
          },
          "etiqueta": "El sodio (Na) está en el período 3 (fila 3) y en el grupo 1 (columna 1)."
        },
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Na",
              "Mg"
            ]
          },
          "etiqueta": "El magnesio (Mg) está justo a su derecha: período 3, grupo 2."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "alcalino"
          },
          "etiqueta": "En la misma columna que el sodio están el litio (Li) y el potasio (K): se comportan de forma parecida."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿qué dos coordenadas ubican a un elemento en la tabla periódica, igual que en un mapa?",
      "opciones": [
        "Número atómico y masa atómica",
        "Punto de fusión y punto de ebullición",
        "Color y estado de la materia",
        "Período (fila) y grupo (columna)"
      ],
      "respuesta": "Período (fila) y grupo (columna)",
      "explicacion": "Es la idea central: la tabla es un mapa con coordenadas de fila y de columna, no una lista para memorizar."
    },
    {
      "pregunta": "Si el sodio (Na) está en el período 3, grupo 1, ¿en qué período está el magnesio (Mg), que está justo al lado?",
      "opciones": [
        "Período 1",
        "Período 2",
        "Período 3",
        "Período 4"
      ],
      "respuesta": "Período 3",
      "explicacion": "El Mg está en el período 3, grupo 2: a la derecha del Na, en la misma fila."
    },
    {
      "pregunta": "Según esta técnica, ¿qué tienen en común los elementos de un mismo grupo (misma columna)?",
      "opciones": [
        "Tienen el mismo número atómico",
        "Están siempre en el mismo período",
        "No tienen ninguna relación entre sí",
        "Se parecen entre sí en su comportamiento químico"
      ],
      "respuesta": "Se parecen entre sí en su comportamiento químico",
      "explicacion": "La cercanía en columna indica parecido de comportamiento: por eso no hace falta memorizar cada casillero suelto."
    }
  ]
}$quimia$::jsonb,
  orden = 2,
  requiere_pro = false
where slug = 'tabla-como-mapa' and problem_type = 'quimia';

update public.techniques
set nombre = 'Asociación por color o uso cotidiano',
  descripcion = 'Conectar el símbolo con algo visual conocido en vez de memorizar la letra sola.',
  contenido = $quimia${
  "pasos": [
    "Au es oro: piensa en el brillo dorado de una joya, no en la letra sola (viene del latín aurum).",
    "Fe es hierro: piensa en el óxido rojizo, la herrumbre, que ves en un portón viejo.",
    "Cu es cobre: piensa en el tono anaranjado de un cable eléctrico pelado.",
    "Una imagen cotidiana se recuerda mejor que una letra abstracta. Ojo con los parecidos: Ag es plata (Au es oro) y Co es cobalto (Cu es cobre)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Símbolo",
        "Elemento",
        "Imagen que ayuda"
      ],
      "filas": [
        [
          "Au",
          "oro",
          "el brillo dorado de una joya"
        ],
        [
          "Fe",
          "hierro",
          "la herrumbre rojiza de un portón viejo"
        ],
        [
          "Cu",
          "cobre",
          "un cable eléctrico pelado, anaranjado"
        ],
        [
          "Ag",
          "plata",
          "los cubiertos y las monedas plateados"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿qué elemento es \"Au\"?",
      "opciones": [
        "Plata",
        "Aluminio",
        "Oro",
        "Argón"
      ],
      "respuesta": "Oro",
      "explicacion": "Au es oro: piensa en el brillo dorado de una joya, no en la letra sola (la plata es Ag, no Au)."
    },
    {
      "pregunta": "¿Qué imagen cotidiana ayuda a recordar que Fe es hierro, según esta técnica?",
      "opciones": [
        "El óxido rojizo (herrumbre) de un portón viejo",
        "El brillo dorado de una joya",
        "El tono anaranjado de un cable pelado",
        "El color plateado de una moneda"
      ],
      "respuesta": "El óxido rojizo (herrumbre) de un portón viejo",
      "explicacion": "La herrumbre es el óxido del hierro: es la imagen que conecta Fe con hierro."
    },
    {
      "pregunta": "¿Cuál es el símbolo químico del cobre, según el ejemplo de esta técnica?",
      "opciones": [
        "Co",
        "C",
        "Cu",
        "Ca"
      ],
      "respuesta": "Cu",
      "explicacion": "Cu es cobre: piensa en el tono anaranjado de un cable eléctrico pelado (Co es cobalto, un elemento distinto)."
    },
    {
      "pregunta": "¿Cuál es el símbolo de la plata?",
      "opciones": [
        "Au",
        "Pt",
        "Ag",
        "Al"
      ],
      "respuesta": "Ag",
      "explicacion": "Ag viene del latín argentum, plata. Au es el oro (aurum)."
    }
  ]
}$quimia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'asociacion-color-uso' and problem_type = 'quimia';

update public.techniques
set nombre = 'Patrones en cómo se nombran los compuestos',
  descripcion = 'Reconocer patrones comunes en los nombres de compuestos en vez de memorizar cada uno suelto.',
  contenido = $quimia${
  "pasos": [
    "Muchos ácidos que contienen oxígeno terminan en «-ico» o en «-oso»: sulfúrico ($\\mathrm{H_2SO_4}$), sulfuroso ($\\mathrm{H_2SO_3}$). Los que no tienen oxígeno se nombran «ácido … hídrico»: clorhídrico ($\\mathrm{HCl}$).",
    "Un compuesto de dos elementos suele nombrarse «[segundo elemento]-uro de [primer elemento]»: cloruro de sodio ($\\mathrm{NaCl}$). Con el oxígeno el nombre es «óxido de»: óxido de calcio ($\\mathrm{CaO}$).",
    "Reconocer el patrón te ahorra memorizar cada fórmula suelta: puedes deducir varias a partir de una sola regla."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Fórmula",
        "Nombre",
        "Pista"
      ],
      "filas": [
        [
          "$\\mathrm{NaCl}$",
          "cloruro de sodio",
          "dos elementos: -uro"
        ],
        [
          "$\\mathrm{CaO}$",
          "óxido de calcio",
          "con oxígeno: óxido"
        ],
        [
          "$\\mathrm{HCl}$",
          "ácido clorhídrico",
          "ácido sin oxígeno: hídrico"
        ],
        [
          "$\\mathrm{H_2SO_4}$",
          "ácido sulfúrico",
          "ácido con oxígeno: -ico"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Según esta técnica, ¿cómo suelen terminar los ácidos que contienen oxígeno?",
      "opciones": [
        "En «-ico» o «-oso» (como el sulfúrico, H₂SO₄)",
        "En «-uro» (como el cloruro de sodio)",
        "Siempre con la palabra «óxido»",
        "Nunca llevan la palabra «ácido»"
      ],
      "respuesta": "En «-ico» o «-oso» (como el sulfúrico, H₂SO₄)",
      "explicacion": "Los oxoácidos terminan en -ico (sulfúrico, H₂SO₄) o en -oso (sulfuroso, H₂SO₃), según cuánto oxígeno tengan."
    },
    {
      "pregunta": "¿Cómo se nombra un compuesto de dos elementos, según el patrón «[segundo elemento]-uro de [primer elemento]»?",
      "opciones": [
        "Sodio de cloruro (ClNa)",
        "Cloro-sodio (NaCl)",
        "Sal de mesa (NaCl)",
        "Cloruro de sodio (NaCl)"
      ],
      "respuesta": "Cloruro de sodio (NaCl)",
      "explicacion": "Cloruro DE sodio sigue el patrón: primero se nombra el elemento más electronegativo (con -uro) y después «de» y el otro elemento."
    },
    {
      "pregunta": "Un ácido que NO contiene oxígeno, como el HCl disuelto en agua, ¿cómo se nombra según esta técnica?",
      "opciones": [
        "Ácido clórico (terminación «-ico»)",
        "Óxido de cloro",
        "Ácido clorhídrico (terminación «-hídrico»)",
        "Clorito de hidrógeno"
      ],
      "respuesta": "Ácido clorhídrico (terminación «-hídrico»)",
      "explicacion": "Los ácidos sin oxígeno se nombran «ácido … hídrico»: clorhídrico. (El HCl gaseoso puro se llama cloruro de hidrógeno.)"
    }
  ]
}$quimia$::jsonb,
  orden = 1,
  requiere_pro = false
where slug = 'patrones-en-formulas' and problem_type = 'quimia';

-- 2) Técnicas nuevas (requiere_pro = false).
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('quimia-tecnica-gases-nobles-hitos', 'Los gases nobles como hitos',
  'Encontrar el período y el grupo de un elemento mirando cuál gas noble tiene cerca.',
  'quimia',
  $quimia${
  "pasos": [
    "Los gases nobles cierran cada período de la tabla. Sus números atómicos son 2 (He), 10 (Ne), 18 (Ar), 36 (Kr), 54 (Xe), 86 (Rn) y 118 (Og). Apréndelos como hitos, como los mojones de una ruta.",
    "Para hallar el período de un elemento, mira entre qué dos gases nobles cae su número atómico Z. El hierro tiene Z = 26: está después del argón (18) y antes del kriptón (36), así que es del período 4.",
    "Para los grupos principales, cuenta cuántos lugares faltan para el gas noble que sigue y réstalos de 18. El cloro (Z = 17) está a un lugar del argón (18): grupo 18 − 1 = 17. El oxígeno (Z = 8) está a dos lugares del neón (10): grupo 18 − 2 = 16.",
    "Si el elemento viene justo después de un gas noble, el grupo es cuántos lugares avanzó: el sodio (Z = 11) está un lugar después del neón (10), grupo 1; el calcio (Z = 20), dos lugares después del argón (18), grupo 2. Ojo: esta cuenta sirve para los grupos 1, 2 y 13 a 18; los metales de transición (grupos 3 a 12) quedan en el medio y no la cumplen."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "seleccion": {
            "por": "familia",
            "familia": "gasNoble"
          },
          "etiqueta": "Los gases nobles cierran cada período: He (2), Ne (10), Ar (18), Kr (36), Xe (54), Rn (86) y Og (118)."
        },
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Ar",
              "Fe",
              "Kr"
            ]
          },
          "etiqueta": "El hierro (Fe, Z = 26) está entre el Ar (18) y el Kr (36): período 4."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 2,
      "pasos": [
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Cl",
              "Ar"
            ]
          },
          "etiqueta": "El cloro (Cl) está un lugar antes del argón (Ar): grupo 17, período 3."
        },
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "O",
              "Ne"
            ]
          },
          "etiqueta": "El oxígeno (O) está dos lugares antes del neón (Ne): grupo 16, período 2."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿En qué período está el hierro (Fe), cuyo número atómico es 26?",
      "opciones": [
        "Período 3",
        "Período 4",
        "Período 5",
        "Período 6"
      ],
      "respuesta": "Período 4",
      "explicacion": "El Z = 26 está entre el argón (18) y el kriptón (36): son los 18 elementos del período 4."
    },
    {
      "pregunta": "¿Qué gas noble cierra el período 3?",
      "opciones": [
        "Neón (Ne)",
        "Kriptón (Kr)",
        "Xenón (Xe)",
        "Argón (Ar)"
      ],
      "respuesta": "Argón (Ar)",
      "explicacion": "El período 3 va del sodio (11) al argón (18): el neón cierra el 2 y el kriptón el 4."
    },
    {
      "pregunta": "Un elemento del bloque p está dos lugares antes de un gas noble. ¿En qué grupo está?",
      "opciones": [
        "Grupo 14",
        "Grupo 15",
        "Grupo 16",
        "Grupo 17"
      ],
      "respuesta": "Grupo 16",
      "explicacion": "Al gas noble (grupo 18) se le restan los lugares que faltan: 18 − 2 = 16. Es el caso del oxígeno, dos lugares antes del neón."
    },
    {
      "pregunta": "El cloro tiene Z = 17. ¿Cuál es su grupo y su período?",
      "opciones": [
        "Grupo 7, período 2",
        "Grupo 17, período 2",
        "Grupo 17, período 3",
        "Grupo 18, período 3"
      ],
      "respuesta": "Grupo 17, período 3",
      "explicacion": "Está un lugar antes del argón (18), así que es del grupo 18 − 1 = 17, y como está entre el neón (10) y el argón (18), del período 3."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-escalera-metaloides', 'La escalera de los metaloides',
  'Distinguir metales, metaloides y no metales por su posición respecto de una escalera diagonal.',
  'quimia',
  $quimia${
  "pasos": [
    "Imagina una escalera que baja en diagonal desde el boro (B), del lado derecho de la tabla. A la izquierda y abajo de la escalera están los metales; arriba y a la derecha, los no metales.",
    "Los metaloides están justo sobre los escalones y tienen propiedades intermedias: boro (B), silicio (Si), germanio (Ge), arsénico (As), antimonio (Sb) y telurio (Te). Son seis. Algunos libros suman el polonio y el astato.",
    "La gran mayoría de los elementos son metales: brillan, conducen bien el calor y la electricidad y son sólidos a temperatura ambiente, salvo el mercurio (Hg), que es líquido.",
    "El hidrógeno (H) es la excepción: está en la columna 1, arriba a la izquierda, pero es un no metal."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "metaloide"
          },
          "etiqueta": "Metaloides: B, Si, Ge, As, Sb y Te, sobre los escalones de la diagonal."
        },
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "metal"
          },
          "etiqueta": "Metales: a la izquierda y abajo de la escalera (y en el centro de la tabla)."
        },
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "nometal"
          },
          "etiqueta": "No metales: arriba y a la derecha de la escalera, más el hidrógeno."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos elementos es un metaloide?",
      "opciones": [
        "Sodio (Na)",
        "Cloro (Cl)",
        "Silicio (Si)",
        "Hierro (Fe)"
      ],
      "respuesta": "Silicio (Si)",
      "explicacion": "El silicio está sobre la escalera de la tabla, junto con B, Ge, As, Sb y Te."
    },
    {
      "pregunta": "El hidrógeno está en la columna 1. ¿Es un metal?",
      "opciones": [
        "Sí, porque está con los metales alcalinos",
        "Sí, pero es líquido",
        "No, es un no metal aunque esté en el grupo 1",
        "Es un metaloide"
      ],
      "respuesta": "No, es un no metal aunque esté en el grupo 1",
      "explicacion": "El hidrógeno es la excepción: está arriba a la izquierda, pero es un no metal (un gas a temperatura ambiente)."
    },
    {
      "pregunta": "¿Dónde están los metales en la tabla periódica?",
      "opciones": [
        "Arriba a la derecha",
        "A la izquierda y en el centro, y abajo de la escalera",
        "Solo en la columna 1",
        "Solo en la fila de abajo"
      ],
      "respuesta": "A la izquierda y en el centro, y abajo de la escalera",
      "explicacion": "Los metales son la gran mayoría: ocupan la izquierda, el centro y la parte de abajo, del lado izquierdo de la escalera."
    },
    {
      "pregunta": "¿Cuál de estos metales es líquido a temperatura ambiente?",
      "opciones": [
        "Hierro (Fe)",
        "Mercurio (Hg)",
        "Sodio (Na)",
        "Cobre (Cu)"
      ],
      "respuesta": "Mercurio (Hg)",
      "explicacion": "El mercurio (Hg) es el único metal común que es líquido a 25 °C."
    }
  ]
}$quimia$::jsonb,
  4,
  false),

('quimia-tecnica-electronegatividad-fluor', 'La electronegatividad crece hacia el flúor',
  'Comparar dos elementos sin datos: la electronegatividad aumenta hacia arriba y hacia la derecha.',
  'quimia',
  $quimia${
  "pasos": [
    "La electronegatividad mide cuánto atrae un átomo los electrones de un enlace. La regla: crece hacia arriba y hacia la derecha de la tabla, apuntando al flúor.",
    "En un período aumenta de izquierda a derecha: en el período 2 va de 0,98 (Li) a 3,98 (F). En un grupo aumenta de abajo hacia arriba: en los halógenos, F 3,98 > Cl 3,16 > Br 2,96 > I 2,66.",
    "El flúor es el más electronegativo de todos (3,98) y el oxígeno le sigue entre los comunes (3,44). En el otro extremo están los metales de la izquierda, como el sodio (0,93) y el potasio (0,82).",
    "Para comparar dos elementos, ubícalos en la tabla: gana el que está más arriba y más a la derecha. El cloro (período 3, grupo 17) es más electronegativo que el sodio (período 3, grupo 1); el oxígeno es más que el azufre porque está arriba en el mismo grupo.",
    "Los gases nobles quedan fuera de esta regla: casi no forman enlaces y, a este nivel, no se les asigna un valor."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "flecha": "derecha",
          "etiqueta": "De izquierda a derecha en un período: la electronegatividad aumenta."
        },
        {
          "flecha": "arriba",
          "etiqueta": "De abajo hacia arriba en un grupo: la electronegatividad aumenta."
        },
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "F"
            ]
          },
          "etiqueta": "Arriba a la derecha está el flúor: el más electronegativo (3,98)."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el elemento más electronegativo de la tabla periódica?",
      "opciones": [
        "Flúor (F)",
        "Oxígeno (O)",
        "Cloro (Cl)",
        "Francio (Fr)"
      ],
      "respuesta": "Flúor (F)",
      "explicacion": "El flúor, arriba a la derecha (sin contar los gases nobles), tiene el valor más alto: 3,98."
    },
    {
      "pregunta": "Entre el sodio (Na) y el cloro (Cl), ambos del período 3, ¿cuál es más electronegativo?",
      "opciones": [
        "El sodio",
        "Los dos por igual",
        "El cloro",
        "Ninguno tiene electronegatividad"
      ],
      "respuesta": "El cloro",
      "explicacion": "El cloro está más a la derecha en el mismo período: 3,16 contra 0,93."
    },
    {
      "pregunta": "El oxígeno y el azufre son del grupo 16. ¿Cuál es más electronegativo?",
      "opciones": [
        "El oxígeno, porque está más arriba",
        "El azufre, porque tiene más electrones",
        "Los dos por igual",
        "Depende del compuesto"
      ],
      "respuesta": "El oxígeno, porque está más arriba",
      "explicacion": "Dentro de un grupo la electronegatividad aumenta hacia arriba: O 3,44 y S 2,58."
    },
    {
      "pregunta": "Al bajar por un grupo, la electronegatividad...",
      "opciones": [
        "aumenta",
        "no cambia",
        "disminuye",
        "se hace cero"
      ],
      "respuesta": "disminuye",
      "explicacion": "El átomo tiene más capas y el núcleo atrae menos a los electrones externos: en los halógenos va de 3,98 (F) a 2,66 (I)."
    }
  ]
}$quimia$::jsonb,
  5,
  false),

('quimia-tecnica-nombres-latinos', 'Nombres latinos: cuando el símbolo no se parece',
  'Recordar los símbolos que salen del nombre en latín (Na, K, Fe, Cu, Ag, Au, Sn, Pb, Hg).',
  'quimia',
  $quimia${
  "pasos": [
    "Algunos símbolos no se parecen al nombre en español porque salen del nombre en latín: Na es el sodio (natrium) y K es el potasio (kalium).",
    "Lo mismo pasa con metales conocidos desde la antigüedad: Fe es el hierro (ferrum), Cu el cobre (cuprum), Ag la plata (argentum), Au el oro (aurum), Sn el estaño (stannum) y Pb el plomo (plumbum).",
    "Usa palabras parecidas como ancla: la ferretería trabaja con hierro (ferrum, Fe); el plomero, con plomo (plumbum, Pb); Argentina lleva el nombre de la plata (argentum, Ag); y áureo significa dorado (aurum, Au).",
    "El mercurio es Hg por hydrargyrum, que quiere decir «plata líquida». No lo confundas con Mg, que es el magnesio."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "columnas": [
        "Símbolo",
        "Nombre en latín",
        "Elemento",
        "Ancla"
      ],
      "filas": [
        [
          "Na",
          "natrium",
          "sodio",
          "—"
        ],
        [
          "K",
          "kalium",
          "potasio",
          "—"
        ],
        [
          "Fe",
          "ferrum",
          "hierro",
          "ferretería"
        ],
        [
          "Cu",
          "cuprum",
          "cobre",
          "—"
        ],
        [
          "Ag",
          "argentum",
          "plata",
          "Argentina"
        ],
        [
          "Au",
          "aurum",
          "oro",
          "áureo"
        ],
        [
          "Sn",
          "stannum",
          "estaño",
          "—"
        ],
        [
          "Pb",
          "plumbum",
          "plomo",
          "plomero"
        ],
        [
          "Hg",
          "hydrargyrum",
          "mercurio",
          "plata líquida"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué el símbolo del sodio es Na?",
      "opciones": [
        "Porque su nombre en inglés empieza con N",
        "Porque viene de natrium, su nombre en latín",
        "Porque tiene número atómico 1",
        "Porque es un gas noble"
      ],
      "respuesta": "Porque viene de natrium, su nombre en latín",
      "explicacion": "Na viene del latín natrium. Es un símbolo que no se parece al nombre en español."
    },
    {
      "pregunta": "¿Qué elemento tiene el símbolo Pb?",
      "opciones": [
        "Fósforo",
        "Plata",
        "Plomo",
        "Platino"
      ],
      "respuesta": "Plomo",
      "explicacion": "Pb viene del latín plumbum, plomo (de ahí «plomero»). El fósforo es P y la plata es Ag."
    },
    {
      "pregunta": "¿Cuál es el símbolo del mercurio?",
      "opciones": [
        "Mg",
        "Hg",
        "Me",
        "Mc"
      ],
      "respuesta": "Hg",
      "explicacion": "Hg viene de hydrargyrum, «plata líquida». Mg es el magnesio."
    },
    {
      "pregunta": "Argentum es el nombre en latín de...",
      "opciones": [
        "el oro",
        "el aluminio",
        "la plata",
        "el argón"
      ],
      "respuesta": "la plata",
      "explicacion": "Argentum es la plata (símbolo Ag); el oro es aurum (Au)."
    }
  ]
}$quimia$::jsonb,
  2,
  false),

('quimia-tecnica-mayuscula-minuscula', 'Una mayúscula abre un elemento',
  'Leer un símbolo o una fórmula sin confundir elementos con compuestos, contando las mayúsculas.',
  'quimia',
  $quimia${
  "pasos": [
    "Un símbolo químico tiene una o dos letras: la primera siempre en mayúscula y la segunda, si existe, siempre en minúscula. Cl es el cloro; CL, cl o cL no existen.",
    "La mayúscula es una señal: cada mayúscula abre un elemento nuevo. Por eso Co (una mayúscula) es un elemento, el cobalto, y CO (dos mayúsculas) es un compuesto: carbono (C) con oxígeno (O), el monóxido de carbono.",
    "Cuenta las mayúsculas para saber cuántos elementos distintos hay en una fórmula: $\\mathrm{NaCl}$ tiene 2 (Na y Cl) y $\\mathrm{H_2SO_4}$ tiene 3 (H, S y O).",
    "Los números pequeños que vienen después de un símbolo o de un paréntesis son subíndices: dicen cuántos átomos hay. En $\\mathrm{H_2O}$ hay 2 átomos de H y 1 de O."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "columnas": [
        "Se escribe",
        "Qué es"
      ],
      "filas": [
        [
          "Co",
          "cobalto: un solo elemento"
        ],
        [
          "CO",
          "monóxido de carbono: C y O"
        ],
        [
          "Hf",
          "hafnio: un solo elemento"
        ],
        [
          "HF",
          "fluoruro de hidrógeno: H y F"
        ],
        [
          "No",
          "nobelio: un solo elemento"
        ],
        [
          "NO",
          "monóxido de nitrógeno: N y O"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "«Co» y «CO» significan cosas distintas. ¿Cuál de las dos es un compuesto?",
      "opciones": [
        "Co",
        "Las dos",
        "Ninguna",
        "CO"
      ],
      "respuesta": "CO",
      "explicacion": "CO tiene dos mayúsculas: dos elementos (carbono y oxígeno), o sea un compuesto. Co es el elemento cobalto."
    },
    {
      "pregunta": "¿Cuántos elementos distintos hay en $\\mathrm{H_2SO_4}$?",
      "opciones": [
        "2",
        "3",
        "4",
        "7"
      ],
      "respuesta": "3",
      "explicacion": "Tres mayúsculas: H, S y O. Los números son subíndices y no cuentan como elementos."
    },
    {
      "pregunta": "¿Cómo se escribe correctamente el símbolo del cloro?",
      "opciones": [
        "CL",
        "cl",
        "Cl",
        "cL"
      ],
      "respuesta": "Cl",
      "explicacion": "La primera letra va en mayúscula y la segunda en minúscula: Cl."
    },
    {
      "pregunta": "¿Qué significa «No» (con una N mayúscula y una o minúscula)?",
      "opciones": [
        "Un compuesto de nitrógeno y oxígeno",
        "La palabra «no», sin sentido químico",
        "El elemento nobelio",
        "El elemento nitrógeno"
      ],
      "respuesta": "El elemento nobelio",
      "explicacion": "No es el nobelio. El compuesto de nitrógeno y oxígeno se escribe NO, con dos mayúsculas."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-valencia-por-grupo', 'La carga sale del grupo',
  'Deducir la carga típica de un elemento con solo mirar su grupo en la tabla.',
  'quimia',
  $quimia${
  "pasos": [
    "El número del grupo te dice la carga típica de un elemento en sus compuestos, sin memorizar cada uno.",
    "Metales de los grupos 1, 2 y 13: pierden electrones y quedan con carga positiva igual al número de grupo (el 13 cuenta como 3). Grupo 1: +1, como $\\mathrm{Na^{+}}$. Grupo 2: +2, como $\\mathrm{Mg^{2+}}$. Grupo 13: +3, como $\\mathrm{Al^{3+}}$.",
    "No metales de los grupos 15, 16 y 17: ganan electrones y quedan con carga negativa igual al número de grupo menos 18. Grupo 15: −3, como $\\mathrm{N^{3-}}$. Grupo 16: −2, como $\\mathrm{O^{2-}}$. Grupo 17: −1, como $\\mathrm{Cl^{-}}$.",
    "El grupo 18 (gases nobles) no forma iones. El grupo 14 (C, Si) suele ser +4 o −4. Y los metales de transición (grupos 3 a 12) tienen varias cargas posibles: el hierro, por ejemplo, puede ser +2 o +3. Con ellos no alcanza con mirar el grupo."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "seleccion": {
            "por": "grupo",
            "n": 1
          },
          "etiqueta": "Grupo 1 (Li, Na, K...): carga +1."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 2
          },
          "etiqueta": "Grupo 2 (Be, Mg, Ca...): carga +2."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 13
          },
          "etiqueta": "Grupo 13 (B, Al, Ga...): carga +3."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 2,
      "pasos": [
        {
          "seleccion": {
            "por": "grupo",
            "n": 15
          },
          "etiqueta": "Grupo 15 (N, P, As...): carga −3."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 16
          },
          "etiqueta": "Grupo 16 (O, S, Se...): carga −2."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 17
          },
          "etiqueta": "Grupo 17 (F, Cl, Br...): carga −1."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué carga típica tiene el aluminio (Al), del grupo 13?",
      "opciones": [
        "$\\mathrm{Al^{+}}$",
        "$\\mathrm{Al^{2+}}$",
        "$\\mathrm{Al^{3+}}$",
        "$\\mathrm{Al^{3-}}$"
      ],
      "respuesta": "$\\mathrm{Al^{3+}}$",
      "explicacion": "El grupo 13 cuenta como 3: el aluminio pierde 3 electrones y forma Al³⁺."
    },
    {
      "pregunta": "¿Qué carga típica tiene el oxígeno (O), del grupo 16?",
      "opciones": [
        "$\\mathrm{O^{2-}}$",
        "$\\mathrm{O^{2+}}$",
        "$\\mathrm{O^{-}}$",
        "$\\mathrm{O^{6-}}$"
      ],
      "respuesta": "$\\mathrm{O^{2-}}$",
      "explicacion": "Grupo 16: 16 − 18 = −2. El oxígeno gana 2 electrones y forma O²⁻."
    },
    {
      "pregunta": "¿Qué carga típica tiene el cloro (Cl), del grupo 17?",
      "opciones": [
        "$\\mathrm{Cl^{+}}$",
        "$\\mathrm{Cl^{-}}$",
        "$\\mathrm{Cl^{2-}}$",
        "$\\mathrm{Cl^{7+}}$"
      ],
      "respuesta": "$\\mathrm{Cl^{-}}$",
      "explicacion": "Grupo 17: 17 − 18 = −1. El cloro gana 1 electrón y forma Cl⁻."
    },
    {
      "pregunta": "¿Qué carga típica tiene el magnesio (Mg), del grupo 2?",
      "opciones": [
        "$\\mathrm{Mg^{2+}}$",
        "$\\mathrm{Mg^{2-}}$",
        "$\\mathrm{Mg^{+}}$",
        "$\\mathrm{Mg^{3+}}$"
      ],
      "respuesta": "$\\mathrm{Mg^{2+}}$",
      "explicacion": "Grupo 2: pierde 2 electrones y forma Mg²⁺."
    },
    {
      "pregunta": "¿Sirve esta regla para el hierro (Fe, grupo 8)?",
      "opciones": [
        "Sí: siempre es +8",
        "No: los metales de transición tienen varias cargas (Fe²⁺ y Fe³⁺)",
        "Sí: siempre es −8",
        "Sí: siempre es +1"
      ],
      "respuesta": "No: los metales de transición tienen varias cargas (Fe²⁺ y Fe³⁺)",
      "explicacion": "La regla es para los grupos principales. El hierro es de transición y puede ser +2 o +3, por eso en su nombre se indica cuál (hierro (II), hierro (III))."
    }
  ]
}$quimia$::jsonb,
  1,
  false),

('quimia-tecnica-cruzar-cargas', 'Cruzar las cargas',
  'Armar la fórmula de un compuesto iónico cruzando las cargas del catión y del anión.',
  'quimia',
  $quimia${
  "pasos": [
    "Para armar la fórmula de un compuesto iónico, escribe el catión (el metal, con carga positiva) y el anión (el no metal, con carga negativa) con sus cargas.",
    "Cruza los números: la carga de cada ion, sin el signo, pasa a ser el subíndice del otro. Con $\\mathrm{Al^{3+}}$ y $\\mathrm{O^{2-}}$ queda $\\mathrm{Al_2O_3}$: el 3 del aluminio baja al oxígeno y el 2 del oxígeno baja al aluminio.",
    "Si los dos subíndices se pueden dividir por un mismo número, simplifica. $\\mathrm{Ca^{2+}}$ y $\\mathrm{O^{2-}}$ dan primero $\\mathrm{Ca_2O_2}$, que se simplifica a $\\mathrm{CaO}$.",
    "Si el ion tiene varios átomos (como $\\mathrm{OH^{-}}$ o $\\mathrm{SO_4^{2-}}$) y su subíndice es mayor que 1, va entre paréntesis: $\\mathrm{Ca(OH)_2}$. Y comprueba siempre que las cargas sumen cero."
  ],
  "visuales": [
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 1,
      "cation": "Al3+",
      "anion": "O2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 2,
      "cation": "Ca2+",
      "anion": "O2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 3,
      "cation": "Ca2+",
      "anion": "OH-"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del compuesto de aluminio (Al³⁺) y oxígeno (O²⁻)?",
      "opciones": [
        "$\\mathrm{Al_2O_3}$",
        "$\\mathrm{Al_3O_2}$",
        "$\\mathrm{AlO}$",
        "$\\mathrm{Al_3O}$"
      ],
      "respuesta": "$\\mathrm{Al_2O_3}$",
      "explicacion": "Al cruzar, el 3 del aluminio pasa al oxígeno y el 2 del oxígeno pasa al aluminio: Al₂O₃. Comprobación: 2 × (+3) + 3 × (−2) = 0."
    },
    {
      "pregunta": "¿Cuál es la fórmula del óxido de calcio (Ca²⁺ y O²⁻)?",
      "opciones": [
        "$\\mathrm{Ca_2O_2}$",
        "$\\mathrm{CaO}$",
        "$\\mathrm{Ca_2O}$",
        "$\\mathrm{CaO_2}$"
      ],
      "respuesta": "$\\mathrm{CaO}$",
      "explicacion": "Al cruzar sale Ca₂O₂, pero los dos subíndices se pueden dividir por 2: queda CaO."
    },
    {
      "pregunta": "¿Cuál es la fórmula del compuesto de sodio (Na⁺) y sulfato (SO₄²⁻)?",
      "opciones": [
        "$\\mathrm{NaSO_4}$",
        "$\\mathrm{Na(SO_4)_2}$",
        "$\\mathrm{Na_2S_4O}$",
        "$\\mathrm{Na_2SO_4}$"
      ],
      "respuesta": "$\\mathrm{Na_2SO_4}$",
      "explicacion": "El 2 de la carga del sulfato pasa al sodio: Na₂SO₄. El sulfato lleva subíndice 1 (1 no se escribe), por eso no necesita paréntesis."
    },
    {
      "pregunta": "¿Cuál es la fórmula del hidróxido de calcio (Ca²⁺ y OH⁻)?",
      "opciones": [
        "$\\mathrm{Ca(OH)_2}$",
        "$\\mathrm{CaOH_2}$",
        "$\\mathrm{CaOH}$",
        "$\\mathrm{Ca_2OH}$"
      ],
      "respuesta": "$\\mathrm{Ca(OH)_2}$",
      "explicacion": "El OH necesita subíndice 2 y, como es un grupo de átomos, va entre paréntesis: Ca(OH)₂."
    }
  ]
}$quimia$::jsonb,
  2,
  false),

('quimia-tecnica-contar-atomos', 'Subíndice y coeficiente: cuenta los átomos',
  'Distinguir el subíndice del coeficiente y contar cuántos átomos hay en una fórmula.',
  'quimia',
  $quimia${
  "pasos": [
    "En una fórmula hay dos tipos de números. El subíndice (pequeño y bajo) multiplica solo al símbolo, o al paréntesis, que tiene delante: en $\\mathrm{H_2O}$ hay 2 H y 1 O.",
    "El coeficiente (grande y al principio) multiplica toda la fórmula: $3\\,\\mathrm{H_2O}$ son 3 moléculas de agua, o sea 6 H y 3 O.",
    "Un paréntesis con subíndice multiplica todo lo que encierra: $\\mathrm{Ca(OH)_2}$ tiene 1 Ca, 2 O y 2 H. $\\mathrm{Al_2(SO_4)_3}$ tiene 2 Al, 3 S y 12 O (3 × 4 = 12 oxígenos).",
    "Regla de oro: el subíndice define QUÉ sustancia es ($\\mathrm{H_2O}$ es agua y $\\mathrm{H_2O_2}$ es agua oxigenada); el coeficiente solo dice CUÁNTA hay. Por eso, para cambiar una cantidad se cambia el coeficiente, nunca el subíndice."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Expresión",
        "Coeficiente",
        "Átomos"
      ],
      "filas": [
        [
          "$\\mathrm{H_2O}$",
          "1",
          "2 H y 1 O"
        ],
        [
          "$3\\,\\mathrm{H_2O}$",
          "3",
          "6 H y 3 O"
        ],
        [
          "$\\mathrm{Ca(OH)_2}$",
          "1",
          "1 Ca, 2 O y 2 H"
        ],
        [
          "$\\mathrm{Al_2(SO_4)_3}$",
          "1",
          "2 Al, 3 S y 12 O"
        ],
        [
          "$2\\,\\mathrm{Al_2(SO_4)_3}$",
          "2",
          "4 Al, 6 S y 24 O"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos átomos de oxígeno hay en $\\mathrm{Ca(OH)_2}$?",
      "opciones": [
        "1",
        "2",
        "3",
        "4"
      ],
      "respuesta": "2",
      "explicacion": "El subíndice 2 del paréntesis multiplica al O y al H: hay 1 Ca, 2 O y 2 H."
    },
    {
      "pregunta": "¿Cuántos átomos de hidrógeno hay en $3\\,\\mathrm{H_2O}$?",
      "opciones": [
        "3",
        "5",
        "6",
        "9"
      ],
      "respuesta": "6",
      "explicacion": "3 moléculas × 2 átomos de H cada una = 6 átomos de hidrógeno."
    },
    {
      "pregunta": "¿Cuántos átomos de oxígeno hay en $\\mathrm{Al_2(SO_4)_3}$?",
      "opciones": [
        "4",
        "12",
        "7",
        "3"
      ],
      "respuesta": "12",
      "explicacion": "El paréntesis (SO₄)₃ tiene 4 O cada uno y se repite 3 veces: 3 × 4 = 12."
    },
    {
      "pregunta": "Para tener más moléculas de agua sin cambiar la sustancia, ¿qué número se modifica?",
      "opciones": [
        "El subíndice",
        "El coeficiente",
        "Cualquiera de los dos",
        "Ninguno"
      ],
      "respuesta": "El coeficiente",
      "explicacion": "El coeficiente dice cuántas moléculas hay. Cambiar un subíndice cambiaría la sustancia (H₂O pasaría a H₂O₂, agua oxigenada)."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-uro-ato-ito', 'hídrico-uro, ico-ato, oso-ito',
  'Pasar del nombre de un ácido al de su sal con tres reglas de cambio de terminación.',
  'quimia',
  $quimia${
  "pasos": [
    "Cuando un ácido pierde su hidrógeno para formar una sal, su nombre cambia de terminación siguiendo tres reglas fijas: «hídrico» se vuelve «-uro», «-ico» se vuelve «-ato» y «-oso» se vuelve «-ito».",
    "Un truco para no confundirte: repite en voz alta «ico-ato, oso-ito». Ejemplos: ácido clorhídrico da cloruro; ácido sulfúrico da sulfato; ácido sulfuroso da sulfito.",
    "Lo mismo con el nitrógeno: ácido nítrico da nitrato y ácido nitroso da nitrito. Y con el carbono: ácido carbónico da carbonato.",
    "Con los prefijos pasa igual: se conservan. El ácido hipocloroso da hipoclorito, y el ácido perclórico da perclorato."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Ácido",
        "Termina en",
        "Sal → nombre",
        "Ejemplo"
      ],
      "filas": [
        [
          "$\\mathrm{HCl}$ ácido clorhídrico",
          "-hídrico",
          "-uro",
          "$\\mathrm{NaCl}$ cloruro de sodio"
        ],
        [
          "$\\mathrm{H_2SO_4}$ ácido sulfúrico",
          "-ico",
          "-ato",
          "$\\mathrm{Na_2SO_4}$ sulfato de sodio"
        ],
        [
          "$\\mathrm{H_2SO_3}$ ácido sulfuroso",
          "-oso",
          "-ito",
          "$\\mathrm{Na_2SO_3}$ sulfito de sodio"
        ],
        [
          "$\\mathrm{HNO_3}$ ácido nítrico",
          "-ico",
          "-ato",
          "$\\mathrm{KNO_3}$ nitrato de potasio"
        ],
        [
          "$\\mathrm{HNO_2}$ ácido nitroso",
          "-oso",
          "-ito",
          "$\\mathrm{NaNO_2}$ nitrito de sodio"
        ],
        [
          "$\\mathrm{H_2CO_3}$ ácido carbónico",
          "-ico",
          "-ato",
          "$\\mathrm{CaCO_3}$ carbonato de calcio"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Si el ácido es el nítrico ($\\mathrm{HNO_3}$), ¿cómo se llama su sal de sodio ($\\mathrm{NaNO_3}$)?",
      "opciones": [
        "Nitrito de sodio",
        "Nitruro de sodio",
        "Nitrato de sodio",
        "Nítrico de sodio"
      ],
      "respuesta": "Nitrato de sodio",
      "explicacion": "-ico pasa a -ato: ácido nítrico → nitrato."
    },
    {
      "pregunta": "El ácido sulfuroso ($\\mathrm{H_2SO_3}$) termina en «-oso». ¿Cómo se llama la sal $\\mathrm{Na_2SO_3}$?",
      "opciones": [
        "Sulfato de sodio",
        "Sulfito de sodio",
        "Sulfuro de sodio",
        "Sulfoso de sodio"
      ],
      "respuesta": "Sulfito de sodio",
      "explicacion": "-oso pasa a -ito: ácido sulfuroso → sulfito de sodio."
    },
    {
      "pregunta": "El ácido clorhídrico ($\\mathrm{HCl}$) da sales con la terminación...",
      "opciones": [
        "-ato",
        "-ito",
        "-uro",
        "-ico"
      ],
      "respuesta": "-uro",
      "explicacion": "El ácido sin oxígeno «-hídrico» da la terminación «-uro»: cloruro."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{Na_2SO_4}$?",
      "opciones": [
        "Sulfito de sodio",
        "Sulfuro de sodio",
        "Sulfuro ácido de sodio",
        "Sulfato de sodio"
      ],
      "respuesta": "Sulfato de sodio",
      "explicacion": "Viene del ácido sulfúrico (-ico), y -ico pasa a -ato: sulfato de sodio."
    }
  ]
}$quimia$::jsonb,
  2,
  false),

('quimia-tecnica-prefijos-numericos', 'Los prefijos cuentan los átomos',
  'Nombrar y escribir compuestos con los prefijos mono-, di-, tri-... que indican los subíndices.',
  'quimia',
  $quimia${
  "pasos": [
    "En la nomenclatura sistemática, un prefijo dice cuántos átomos hay de cada elemento, o sea, repite el subíndice: mono- (1), di- (2), tri- (3), tetra- (4), penta- (5), hexa- (6), hepta- (7).",
    "Lee los subíndices y pon los prefijos: $\\mathrm{N_2O_5}$ tiene 2 N y 5 O, así que es pentaóxido de dinitrógeno. $\\mathrm{Cl_2O_7}$ es heptaóxido de dicloro.",
    "El prefijo «mono» se omite en el primer elemento: $\\mathrm{CO_2}$ es dióxido de carbono (no «monocarbono»), pero se conserva en el segundo cuando hace falta: $\\mathrm{CO}$ es monóxido de carbono.",
    "Para escribir la fórmula haz el camino inverso: cada prefijo es un subíndice. «Trióxido de azufre» es un azufre (sin prefijo) y tres oxígenos."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "columnas": [
        "Prefijo",
        "Número",
        "Ejemplo"
      ],
      "filas": [
        [
          "mono-",
          "1",
          "$\\mathrm{CO}$ monóxido de carbono"
        ],
        [
          "di-",
          "2",
          "$\\mathrm{CO_2}$ dióxido de carbono"
        ],
        [
          "tri-",
          "3",
          "$\\mathrm{SO_3}$ trióxido de azufre"
        ],
        [
          "tetra-",
          "4",
          "$\\mathrm{CCl_4}$ tetracloruro de carbono"
        ],
        [
          "penta-",
          "5",
          "$\\mathrm{N_2O_5}$ pentaóxido de dinitrógeno"
        ],
        [
          "hexa-",
          "6",
          "$\\mathrm{SF_6}$ hexafluoruro de azufre"
        ],
        [
          "hepta-",
          "7",
          "$\\mathrm{Cl_2O_7}$ heptaóxido de dicloro"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el nombre sistemático de $\\mathrm{SO_3}$?",
      "opciones": [
        "Óxido de azufre",
        "Trióxido de azufre",
        "Dióxido de azufre",
        "Trióxido de azufre (VI)"
      ],
      "respuesta": "Trióxido de azufre",
      "explicacion": "Tres oxígenos: trióxido. El azufre es uno solo, por eso no lleva prefijo."
    },
    {
      "pregunta": "¿Cuál es la fórmula del heptaóxido de dicloro?",
      "opciones": [
        "$\\mathrm{ClO_7}$",
        "$\\mathrm{Cl_7O_2}$",
        "$\\mathrm{Cl_2O_7}$",
        "$\\mathrm{Cl_2O}$"
      ],
      "respuesta": "$\\mathrm{Cl_2O_7}$",
      "explicacion": "«di» = 2 cloros y «hepta» = 7 oxígenos: Cl₂O₇."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CO}$?",
      "opciones": [
        "Dióxido de carbono",
        "Carbono monóxido",
        "Óxido de carbonito",
        "Monóxido de carbono"
      ],
      "respuesta": "Monóxido de carbono",
      "explicacion": "Un carbono y un oxígeno: monóxido de carbono. El CO₂ es el dióxido."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{CCl_4}$?",
      "opciones": [
        "Cloruro de carbono",
        "Carbono tetracloro",
        "Tetracarburo de cloro",
        "Tetracloruro de carbono"
      ],
      "respuesta": "Tetracloruro de carbono",
      "explicacion": "Cuatro cloros: tetracloruro de carbono. El elemento con -uro (cloro) se nombra primero."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-oxacidos-por-oxigenos', 'Los oxácidos del cloro se ordenan por sus oxígenos',
  'Nombrar los oxoácidos de los halógenos contando oxígenos: hipo-oso, oso, ico, per-ico.',
  'quimia',
  $quimia${
  "pasos": [
    "Los oxoácidos del cloro (y del bromo y el yodo) forman una escalera según cuántos oxígenos tienen: 1 oxígeno, ácido hipocloroso ($\\mathrm{HClO}$); 2, ácido cloroso ($\\mathrm{HClO_2}$); 3, ácido clórico ($\\mathrm{HClO_3}$); 4, ácido perclórico ($\\mathrm{HClO_4}$).",
    "El orden de los nombres es siempre el mismo: hipo…oso (el que menos oxígeno tiene), …oso, …ico y per…ico (el que más tiene). El «ico» sin prefijo es el tercero.",
    "La escalera sigue el número de oxidación del cloro, que sube de a 2: +1, +3, +5 y +7. Para calcularlo: 2 × (oxígenos) − (hidrógenos). En $\\mathrm{HClO_3}$: 2 × 3 − 1 = +5.",
    "Con un solo par pasa igual: más oxígeno, más alto el número de oxidación. El azufre tiene ácido sulfuroso ($\\mathrm{H_2SO_3}$, +4) y ácido sulfúrico ($\\mathrm{H_2SO_4}$, +6): el de más oxígeno termina en «-ico»."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Ácido",
        "Oxígenos",
        "N.º de oxidación del Cl",
        "Nombre"
      ],
      "filas": [
        [
          "$\\mathrm{HClO}$",
          "1",
          "+1",
          "ácido hipocloroso"
        ],
        [
          "$\\mathrm{HClO_2}$",
          "2",
          "+3",
          "ácido cloroso"
        ],
        [
          "$\\mathrm{HClO_3}$",
          "3",
          "+5",
          "ácido clórico"
        ],
        [
          "$\\mathrm{HClO_4}$",
          "4",
          "+7",
          "ácido perclórico"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se llama $\\mathrm{HClO_4}$, el oxoácido del cloro con más oxígenos?",
      "opciones": [
        "Ácido hipocloroso",
        "Ácido clórico",
        "Ácido perclórico",
        "Ácido cloroso"
      ],
      "respuesta": "Ácido perclórico",
      "explicacion": "Con 4 oxígenos y número de oxidación +7 es el ácido perclórico."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{HClO_2}$?",
      "opciones": [
        "Ácido hipocloroso",
        "Ácido clórico",
        "Ácido clorhídrico",
        "Ácido cloroso"
      ],
      "respuesta": "Ácido cloroso",
      "explicacion": "Dos oxígenos, número de oxidación +3: ácido cloroso."
    },
    {
      "pregunta": "Entre $\\mathrm{H_2SO_3}$ y $\\mathrm{H_2SO_4}$, ¿cuál termina en «-ico»?",
      "opciones": [
        "$\\mathrm{H_2SO_3}$",
        "Los dos",
        "Ninguno",
        "$\\mathrm{H_2SO_4}$"
      ],
      "respuesta": "$\\mathrm{H_2SO_4}$",
      "explicacion": "El que tiene más oxígeno termina en -ico: H₂SO₄ es el ácido sulfúrico; H₂SO₃ es el sulfuroso."
    },
    {
      "pregunta": "¿Cuántos oxígenos tiene el ácido hipocloroso ($\\mathrm{HClO}$)?",
      "opciones": [
        "1",
        "2",
        "3",
        "4"
      ],
      "respuesta": "1",
      "explicacion": "Hipocloroso es el que menos oxígeno tiene: 1, con número de oxidación +1."
    }
  ]
}$quimia$::jsonb,
  4,
  false),

('quimia-tecnica-stock-romano', 'El número romano es la carga del metal',
  'Usar el número romano del nombre Stock para escribir la fórmula (y viceversa).',
  'quimia',
  $quimia${
  "pasos": [
    "En la nomenclatura Stock, el número romano entre paréntesis es la carga del metal. En «óxido de hierro (III)», el (III) significa que el hierro es $\\mathrm{Fe^{3+}}$.",
    "Con esa carga y la del oxígeno ($\\mathrm{O^{2-}}$) cruzas los números y obtienes la fórmula: $\\mathrm{Fe_2O_3}$.",
    "Si el romano cambia, cambia la fórmula: «óxido de hierro (II)» es $\\mathrm{Fe^{2+}}$ con $\\mathrm{O^{2-}}$, y se simplifica a $\\mathrm{FeO}$.",
    "Para pasar a la nomenclatura tradicional: la carga menor lleva «-oso» y la mayor «-ico». Hierro (II) es ferroso (óxido ferroso) y hierro (III) es férrico (óxido férrico)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 1,
      "cation": "Fe3+",
      "anion": "O2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 2,
      "cation": "Fe2+",
      "anion": "O2-"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del óxido de cobre (II)?",
      "opciones": [
        "$\\mathrm{CuO}$",
        "$\\mathrm{Cu_2O}$",
        "$\\mathrm{Cu_2O_3}$",
        "$\\mathrm{CuO_2}$"
      ],
      "respuesta": "$\\mathrm{CuO}$",
      "explicacion": "Cobre (II) es Cu²⁺; con O²⁻ los subíndices quedan iguales y se simplifican: CuO."
    },
    {
      "pregunta": "En «óxido de hierro (III)», ¿qué carga tiene el hierro?",
      "opciones": [
        "$\\mathrm{Fe^{2+}}$",
        "$\\mathrm{Fe^{6+}}$",
        "$\\mathrm{Fe^{3-}}$",
        "$\\mathrm{Fe^{3+}}$"
      ],
      "respuesta": "$\\mathrm{Fe^{3+}}$",
      "explicacion": "El número romano (III) es la carga del hierro: Fe³⁺."
    },
    {
      "pregunta": "El óxido cuproso, ¿con qué nombre Stock equivale?",
      "opciones": [
        "Óxido de cobre (I)",
        "Óxido de cobre (II)",
        "Óxido de cobre (III)",
        "Óxido de cobre"
      ],
      "respuesta": "Óxido de cobre (I)",
      "explicacion": "Cobre tiene dos cargas: Cu⁺ (la menor) es cuproso y Cu²⁺ (la mayor) es cúprico. Cuproso = cobre (I)."
    },
    {
      "pregunta": "En $\\mathrm{FeCl_2}$, ¿qué número romano lleva el hierro en su nombre Stock?",
      "opciones": [
        "I",
        "II",
        "III",
        "IV"
      ],
      "respuesta": "II",
      "explicacion": "Hay dos Cl⁻ (carga total −2), así que el hierro es Fe²⁺: cloruro de hierro (II)."
    }
  ]
}$quimia$::jsonb,
  5,
  false);

-- 3) Clases (requiere_pro = true): un curso lineal en orden de curso; la primera es preview gratis.
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('quimia-clase-atomo-particulas', 'Materia, átomo y partículas',
  'De qué está hecha la materia, cómo es un átomo, qué son el número atómico, los isótopos y los iones.',
  'quimia',
  $quimia${
  "pasos": [
    "La materia es todo lo que tiene masa y ocupa un lugar en el espacio, y está formada por átomos. Una sustancia con un solo tipo de átomo es un elemento (oxígeno, hierro, oro). Una sustancia con átomos de distintos elementos unidos en proporciones fijas es un compuesto (agua, sal común).",
    "Un átomo tiene un núcleo diminuto en el centro y electrones que lo rodean. En el núcleo hay protones (carga positiva, +1) y neutrones (sin carga). Los electrones tienen carga negativa (−1) y una masa unas 1800 veces menor que la de un protón, así que casi toda la masa del átomo está en el núcleo.",
    "El número atómico (Z) es la cantidad de protones del núcleo. Es lo que define al elemento: todos los átomos con Z = 8 son de oxígeno. En un átomo neutro, los electrones son tantos como los protones (Z), porque las cargas positivas y negativas se compensan.",
    "El número másico (A) es la suma de protones y neutrones: A = Z + N. De ahí sale el número de neutrones: N = A − Z. Se escribe con A arriba y Z abajo del símbolo.",
    "Ejemplo resuelto. El carbono-12 $^{12}_{6}\\mathrm{C}$ tiene 6 protones (Z = 6), 6 electrones y 12 − 6 = 6 neutrones. El sodio-23 $^{23}_{11}\\mathrm{Na}$ tiene 11 protones, 11 electrones y 23 − 11 = 12 neutrones.",
    "Los isótopos son átomos del mismo elemento (mismo Z) con distinta cantidad de neutrones, y por lo tanto distinto A. Se comportan casi igual en química. Por eso la masa atómica que figura en la tabla es un promedio de los isótopos naturales: la del cloro, 35,45 u, sale de una mezcla de cloro-35 y cloro-37.",
    "Un ion es un átomo (o un grupo de átomos) con carga eléctrica, porque ganó o perdió electrones. Los protones NO cambian. Si pierde electrones queda con carga positiva y se llama catión: $\\mathrm{Na^{+}}$ perdió 1 electrón. Si gana electrones queda con carga negativa y se llama anión: $\\mathrm{Cl^{-}}$ ganó 1 electrón.",
    "La carga del ion es (protones − electrones). El ion $\\mathrm{Mg^{2+}}$ tiene Z = 12 y perdió 2 electrones: 12 protones y 10 electrones. El ion $\\mathrm{O^{2-}}$ tiene Z = 8 y ganó 2 electrones: 8 protones y 10 electrones.",
    "Error común: para formar un catión no se pierden protones (eso convertiría al átomo en otro elemento), solo se pierden o se ganan electrones. Otro error frecuente es confundir el número atómico (Z) con el másico (A): el Z es chico y define al elemento; el A siempre es mayor o igual."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "titulo": "Las tres partículas del átomo",
      "columnas": [
        "Partícula",
        "Carga",
        "Masa",
        "Dónde está"
      ],
      "filas": [
        [
          "Protón",
          "+1",
          "1 u",
          "núcleo"
        ],
        [
          "Neutrón",
          "0",
          "1 u (casi igual que el protón)",
          "núcleo"
        ],
        [
          "Electrón",
          "−1",
          "casi 0 (unas 1800 veces menos que un protón)",
          "alrededor del núcleo, en capas"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Isótopos: mismo Z, distinto A",
      "columnas": [
        "Isótopo",
        "Notación",
        "Protones (Z)",
        "Neutrones",
        "A"
      ],
      "filas": [
        [
          "Protio",
          "$^{1}_{1}\\mathrm{H}$",
          "1",
          "0",
          "1"
        ],
        [
          "Deuterio",
          "$^{2}_{1}\\mathrm{H}$",
          "1",
          "1",
          "2"
        ],
        [
          "Tritio",
          "$^{3}_{1}\\mathrm{H}$",
          "1",
          "2",
          "3"
        ],
        [
          "Cloro-35",
          "$^{35}_{17}\\mathrm{Cl}$",
          "17",
          "18",
          "35"
        ],
        [
          "Cloro-37",
          "$^{37}_{17}\\mathrm{Cl}$",
          "17",
          "20",
          "37"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos neutrones tiene un átomo con Z = 17 y A = 35?",
      "opciones": [
        "17",
        "18",
        "35",
        "52"
      ],
      "respuesta": "18",
      "explicacion": "N = A − Z = 35 − 17 = 18."
    },
    {
      "pregunta": "¿Qué determina que un átomo sea de un elemento y no de otro?",
      "opciones": [
        "Su número de neutrones",
        "Su número de electrones libres",
        "Su número de protones",
        "Su masa en gramos"
      ],
      "respuesta": "Su número de protones",
      "explicacion": "El número atómico Z (la cantidad de protones) identifica al elemento. Los neutrones pueden variar (isótopos) y los electrones también (iones)."
    },
    {
      "pregunta": "Los isótopos de un mismo elemento tienen...",
      "opciones": [
        "distinto número de protones y el mismo de neutrones",
        "distinto número de electrones y de protones",
        "el mismo número de protones y distinto número de neutrones",
        "la misma masa siempre"
      ],
      "respuesta": "el mismo número de protones y distinto número de neutrones",
      "explicacion": "Mismo Z (mismos protones) y distinto A por tener distinta cantidad de neutrones: por ejemplo, protio, deuterio y tritio."
    },
    {
      "pregunta": "El ion $\\mathrm{Ca^{2+}}$ viene del calcio, cuyo Z es 20. ¿Cuántos electrones tiene?",
      "opciones": [
        "20",
        "18",
        "22",
        "2"
      ],
      "respuesta": "18",
      "explicacion": "El átomo neutro tiene 20 electrones; el ion 2+ perdió 2, así que le quedan 18. Sus protones siguen siendo 20."
    },
    {
      "pregunta": "¿Qué partícula tiene carga negativa?",
      "opciones": [
        "Protón",
        "Electrón",
        "Neutrón",
        "El núcleo"
      ],
      "respuesta": "Electrón",
      "explicacion": "El electrón tiene carga −1. El protón es +1 y el neutrón no tiene carga."
    },
    {
      "pregunta": "Un átomo neutro tiene Z = 13 y A = 27. ¿Cuántos protones, neutrones y electrones tiene?",
      "opciones": [
        "13, 13 y 14",
        "14, 13 y 14",
        "27, 13 y 13",
        "13, 14 y 13"
      ],
      "respuesta": "13, 14 y 13",
      "explicacion": "Protones = Z = 13; electrones = 13 (es neutro); neutrones = 27 − 13 = 14. Es el aluminio-27."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-organizacion-tabla', 'Cómo se organiza la tabla periódica',
  'Períodos, grupos, bloques, familias, y metales, no metales y metaloides.',
  'quimia',
  $quimia${
  "pasos": [
    "La tabla periódica ordena los elementos por número atómico creciente (Z) y los acomoda de modo que los de propiedades parecidas queden en la misma columna. La propuso Mendeléyev en 1869 ordenando por masa atómica; hoy se ordena por Z.",
    "Los períodos son las 7 filas horizontales. El número de período indica cuántas capas de electrones tiene el átomo. El período 1 tiene solo 2 elementos (H y He); los períodos 2 y 3 tienen 8; los períodos 4 y 5, 18; y los períodos 6 y 7, 32 (contando las dos filas que se dibujan aparte, debajo).",
    "Los grupos son las 18 columnas verticales, numeradas de 1 a 18. Los elementos de un mismo grupo tienen propiedades parecidas porque, en los grupos principales, tienen los mismos electrones de valencia. Los grupos 1, 2 y 13 a 18 son los grupos principales; los grupos 3 a 12 son los metales de transición. En libros antiguos los principales se llaman IA a VIIIA (IA es el grupo 1, IIA el 2, IIIA el 13... VIIIA el 18): es la misma información con otra etiqueta.",
    "Los bloques (s, p, d y f) indican cuál subcapa recibe los últimos electrones. El bloque s son los grupos 1 y 2 (más el helio); el bloque p, los grupos 13 a 18; el bloque d, los grupos 3 a 12; y el bloque f, los lantánidos y actínidos de las filas de abajo.",
    "Las familias son grupos de elementos con nombre propio. Los metales alcalinos (Li, Na, K, Rb, Cs, Fr) son blandos y muy reactivos: reaccionan con el agua. Los alcalinotérreos (Be, Mg, Ca, Sr, Ba, Ra) son algo menos reactivos. Los metales de transición (Fe, Cu, Zn, Ag, Au...) son duros, buenos conductores y con varios estados de oxidación. Los halógenos (F, Cl, Br, I, At) son no metales muy reactivos que forman sales con los metales. Los gases nobles (He, Ne, Ar, Kr, Xe, Rn) casi no reaccionan. Los lantánidos y los actínidos completan la tabla por debajo.",
    "En el colegio también se usan los nombres de los otros grupos: térreos (grupo 13: B, Al...), carbonoideos (grupo 14: C, Si...), nitrogenoideos (grupo 15: N, P...) y anfígenos o calcógenos (grupo 16: O, S...).",
    "Los metales son la gran mayoría de los elementos, están a la izquierda y en el centro; brillan, conducen el calor y la electricidad, se pueden estirar y aplastar, y son sólidos salvo el mercurio, que es líquido. Los no metales están arriba a la derecha, más el hidrógeno: no conducen bien, son quebradizos si son sólidos y muchos son gases. Los metaloides (B, Si, Ge, As, Sb y Te) tienen propiedades intermedias; el silicio, por ejemplo, es un semiconductor.",
    "Cómo leer una posición. El cloro está en el período 3 y en el grupo 17: tiene 3 capas y 7 electrones de valencia, y es un halógeno. El calcio está en el período 4 y en el grupo 2: tiene 4 capas y 2 electrones de valencia, y es un alcalinotérreo.",
    "Nota de nivel colegio: los lantánidos (Z 57 a 71) y los actínidos (Z 89 a 103) se dibujan debajo para que la tabla no sea demasiado ancha, pero pertenecen a los períodos 6 y 7. Los libros no coinciden del todo en cómo asignan el grupo 3, y a este nivel no hace falta entrar en esa discusión."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "seleccion": {
            "por": "periodo",
            "n": 1
          },
          "etiqueta": "Período 1: solo H y He."
        },
        {
          "seleccion": {
            "por": "periodo",
            "n": 2
          },
          "etiqueta": "Período 2: de Li a Ne (8 elementos)."
        },
        {
          "seleccion": {
            "por": "periodo",
            "n": 3
          },
          "etiqueta": "Período 3: de Na a Ar (8 elementos)."
        },
        {
          "seleccion": {
            "por": "periodo",
            "n": 4
          },
          "etiqueta": "Período 4: de K a Kr (18 elementos)."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 2,
      "pasos": [
        {
          "seleccion": {
            "por": "grupo",
            "n": 1
          },
          "etiqueta": "Grupo 1: H, Li, Na, K, Rb, Cs y Fr."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 2
          },
          "etiqueta": "Grupo 2: Be, Mg, Ca, Sr, Ba y Ra."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 17
          },
          "etiqueta": "Grupo 17: los halógenos."
        },
        {
          "seleccion": {
            "por": "grupo",
            "n": 18
          },
          "etiqueta": "Grupo 18: los gases nobles."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 3,
      "pasos": [
        {
          "seleccion": {
            "por": "bloque",
            "bloque": "s"
          },
          "etiqueta": "Bloque s: grupos 1 y 2, más el helio."
        },
        {
          "seleccion": {
            "por": "bloque",
            "bloque": "p"
          },
          "etiqueta": "Bloque p: grupos 13 a 18."
        },
        {
          "seleccion": {
            "por": "bloque",
            "bloque": "d"
          },
          "etiqueta": "Bloque d: grupos 3 a 12."
        },
        {
          "seleccion": {
            "por": "bloque",
            "bloque": "f"
          },
          "etiqueta": "Bloque f: lantánidos y actínidos."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 4,
      "pasos": [
        {
          "seleccion": {
            "por": "familia",
            "familia": "alcalino"
          },
          "etiqueta": "Metales alcalinos: blandos y muy reactivos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "alcalinoterreo"
          },
          "etiqueta": "Metales alcalinotérreos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "transicion"
          },
          "etiqueta": "Metales de transición."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "halogeno"
          },
          "etiqueta": "Halógenos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "gasNoble"
          },
          "etiqueta": "Gases nobles."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "lantanido"
          },
          "etiqueta": "Lantánidos."
        },
        {
          "seleccion": {
            "por": "familia",
            "familia": "actinido"
          },
          "etiqueta": "Actínidos."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 6,
      "pasos": [
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "metal"
          },
          "etiqueta": "Metales: izquierda, centro y abajo."
        },
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "metaloide"
          },
          "etiqueta": "Metaloides: B, Si, Ge, As, Sb y Te."
        },
        {
          "seleccion": {
            "por": "tipo",
            "tipo": "nometal"
          },
          "etiqueta": "No metales: arriba a la derecha, más el hidrógeno."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 7,
      "pasos": [
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Cl"
            ]
          },
          "etiqueta": "Cloro: período 3, grupo 17 (halógeno)."
        },
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Ca"
            ]
          },
          "etiqueta": "Calcio: período 4, grupo 2 (alcalinotérreo)."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "El número de período de un elemento indica...",
      "opciones": [
        "cuántos electrones de valencia tiene",
        "cuántos neutrones tiene",
        "su masa atómica",
        "cuántas capas de electrones tiene"
      ],
      "respuesta": "cuántas capas de electrones tiene",
      "explicacion": "El período es la fila: coincide con la cantidad de capas del átomo. El grupo (columna) es lo que indica los electrones de valencia."
    },
    {
      "pregunta": "¿Cuál de estos elementos es un halógeno?",
      "opciones": [
        "Sodio (Na)",
        "Argón (Ar)",
        "Hierro (Fe)",
        "Bromo (Br)"
      ],
      "respuesta": "Bromo (Br)",
      "explicacion": "El bromo está en el grupo 17. El sodio es alcalino, el argón es un gas noble y el hierro es un metal de transición."
    },
    {
      "pregunta": "El calcio (Ca) está en el grupo 2. ¿A qué familia pertenece?",
      "opciones": [
        "Metales alcalinos",
        "Halógenos",
        "Metales alcalinotérreos",
        "Gases nobles"
      ],
      "respuesta": "Metales alcalinotérreos",
      "explicacion": "El grupo 2 son los alcalinotérreos: Be, Mg, Ca, Sr, Ba y Ra."
    },
    {
      "pregunta": "¿A qué bloque pertenece el hierro (Fe)?",
      "opciones": [
        "Bloque d",
        "Bloque s",
        "Bloque p",
        "Bloque f"
      ],
      "respuesta": "Bloque d",
      "explicacion": "El hierro está en el grupo 8, entre los grupos 3 a 12: bloque d."
    },
    {
      "pregunta": "¿Cuál de estas listas contiene solo metaloides?",
      "opciones": [
        "Na, Mg y Al",
        "O, S y Se",
        "B, Si y Ge",
        "Fe, Cu y Zn"
      ],
      "respuesta": "B, Si y Ge",
      "explicacion": "Los metaloides son B, Si, Ge, As, Sb y Te."
    },
    {
      "pregunta": "El hidrógeno está en el grupo 1. ¿Es un metal alcalino?",
      "opciones": [
        "Sí, como el litio y el sodio",
        "No: es un no metal",
        "Sí, pero es un gas",
        "Es un metaloide"
      ],
      "respuesta": "No: es un no metal",
      "explicacion": "El hidrógeno es un no metal. Se ubica arriba del grupo 1 por su configuración electrónica, pero no es alcalino."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-configuracion-electronica', 'Configuración electrónica y electrones de valencia',
  'Cómo se reparten los electrones en capas y subcapas, la regla de Aufbau, los electrones de valencia y por qué el grupo determina la valencia.',
  'quimia',
  $quimia${
  "pasos": [
    "Los electrones se ubican en capas o niveles de energía (n = 1, 2, 3...) y, dentro de cada capa, en subcapas: s, p, d y f. Cada subcapa admite un máximo de electrones: s, 2; p, 6; d, 10; f, 14. La capa n = 1 solo tiene la subcapa 1s; la n = 2 tiene 2s y 2p; la n = 3 tiene 3s, 3p y 3d; desde la n = 4 aparece también la 4f.",
    "La regla de Aufbau (de construcción) dice que los electrones ocupan primero las subcapas de menor energía. El orden lo da el diagrama de Moeller: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p, 6s, 4f, 5d, 6p, 7s, 5f, 6d, 7p. Fíjate que la 4s se llena antes que la 3d. Truco: se llenan de menor a mayor suma n + l (con s = 0, p = 1, d = 2, f = 3), y a igual suma, primero la de menor n.",
    "Ejemplos que puedes verificar sumando los exponentes. Hidrógeno (Z = 1): $\\mathrm{1s^{1}}$. Oxígeno (Z = 8): $\\mathrm{1s^{2}\\,2s^{2}\\,2p^{4}}$, 8 electrones. Sodio (Z = 11): $\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{1}}$. Cloro (Z = 17): $\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{2}\\,3p^{5}}$. Hierro (Z = 26): $\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{2}\\,3p^{6}\\,4s^{2}\\,3d^{6}}$: 2 + 2 + 6 + 2 + 6 + 2 + 6 = 26.",
    "La configuración abreviada reemplaza la parte igual a la del gas noble anterior por su símbolo entre corchetes. Sodio: $\\mathrm{[Ne]\\,3s^{1}}$. Cloro: $\\mathrm{[Ne]\\,3s^{2}\\,3p^{5}}$. Hierro: $\\mathrm{[Ar]\\,4s^{2}\\,3d^{6}}$.",
    "Hay excepciones a la regla. El cromo (Z = 24) es $\\mathrm{[Ar]\\,4s^{1}\\,3d^{5}}$ y el cobre (Z = 29) es $\\mathrm{[Ar]\\,4s^{1}\\,3d^{10}}$, y no $\\mathrm{[Ar]\\,4s^{2}\\,3d^{4}}$ ni $\\mathrm{[Ar]\\,4s^{2}\\,3d^{9}}$: una subcapa d llena o semillena es especialmente estable. Hay más excepciones en los períodos 5 y 6 (plata, oro, paladio...). A este nivel se aceptan como excepciones conocidas.",
    "Los electrones de valencia son los de la capa más externa (la de mayor n). En los grupos principales coinciden con el número de grupo (grupos 1 y 2) o con el número de grupo menos 10 (grupos 13 a 18). Por eso cada columna de la tabla se comporta de manera parecida: sus elementos tienen la misma cantidad de electrones de valencia.",
    "Los átomos tienden a quedar con 8 electrones en la capa externa (2 en el caso del hidrógeno y el helio), como el gas noble más cercano: es la regla del octeto. Los elementos de los grupos 1, 2 y 13 lo logran perdiendo electrones, y los de los grupos 15, 16 y 17, ganándolos. Por eso el grupo determina la valencia: el sodio (1 electrón de valencia) pierde 1 y queda con carga +1; el cloro (7) gana 1 y queda con carga −1.",
    "Cómo se ve en la tabla: el período es el número de la última capa (la n más alta) y el bloque indica cuál subcapa recibió el último electrón. El hierro termina en 3d (bloque d) y su capa más alta es la 4 (período 4)."
  ],
  "visuales": [
    {
      "tipo": "quimia.orbitales",
      "despuesDePaso": 2,
      "z": 8
    },
    {
      "tipo": "quimia.orbitales",
      "despuesDePaso": 2,
      "z": 26
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Período 3: los electrones de valencia siguen al grupo",
      "columnas": [
        "Elemento",
        "Z",
        "Configuración",
        "e⁻ de valencia",
        "Grupo"
      ],
      "filas": [
        [
          "Na",
          "11",
          "$\\mathrm{[Ne]\\,3s^{1}}$",
          "1",
          "1"
        ],
        [
          "Mg",
          "12",
          "$\\mathrm{[Ne]\\,3s^{2}}$",
          "2",
          "2"
        ],
        [
          "Al",
          "13",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{1}}$",
          "3",
          "13"
        ],
        [
          "Si",
          "14",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{2}}$",
          "4",
          "14"
        ],
        [
          "P",
          "15",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{3}}$",
          "5",
          "15"
        ],
        [
          "S",
          "16",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{4}}$",
          "6",
          "16"
        ],
        [
          "Cl",
          "17",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{5}}$",
          "7",
          "17"
        ],
        [
          "Ar",
          "18",
          "$\\mathrm{[Ne]\\,3s^{2}\\,3p^{6}}$",
          "8",
          "18"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos electrones caben como máximo en una subcapa p?",
      "opciones": [
        "2",
        "6",
        "10",
        "14"
      ],
      "respuesta": "6",
      "explicacion": "s admite 2, p admite 6, d admite 10 y f admite 14."
    },
    {
      "pregunta": "¿Cuál es la configuración electrónica del sodio (Z = 11)?",
      "opciones": [
        "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{7}}$",
        "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{2}}$",
        "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{1}}$",
        "$\\mathrm{1s^{1}\\,2s^{2}\\,2p^{6}\\,3s^{2}}$"
      ],
      "respuesta": "$\\mathrm{1s^{2}\\,2s^{2}\\,2p^{6}\\,3s^{1}}$",
      "explicacion": "1s² 2s² 2p⁶ 3s¹: suma 2 + 2 + 6 + 1 = 11. El único electrón de la capa 3 es su electrón de valencia."
    },
    {
      "pregunta": "El azufre (S) está en el grupo 16. ¿Cuántos electrones de valencia tiene?",
      "opciones": [
        "2",
        "4",
        "6",
        "16"
      ],
      "respuesta": "6",
      "explicacion": "Grupo 16 menos 10 = 6 electrones de valencia."
    },
    {
      "pregunta": "Según la regla de Aufbau, ¿qué subcapa se llena justo después de la 3p?",
      "opciones": [
        "3d",
        "4p",
        "4s",
        "2p"
      ],
      "respuesta": "4s",
      "explicacion": "El orden es ... 3s, 3p, 4s, 3d: la 4s tiene menor energía que la 3d y se llena antes."
    },
    {
      "pregunta": "¿Cuál es la configuración electrónica abreviada real del cobre (Cu, Z = 29)?",
      "opciones": [
        "$\\mathrm{[Ar]\\,4s^{2}\\,3d^{6}}$",
        "$\\mathrm{[Ar]\\,4s^{1}\\,3d^{10}}$",
        "$\\mathrm{[Ar]\\,4s^{2}\\,3d^{9}}$",
        "$\\mathrm{[Ne]\\,3s^{1}}$"
      ],
      "respuesta": "$\\mathrm{[Ar]\\,4s^{1}\\,3d^{10}}$",
      "explicacion": "El cobre es una excepción: [Ar] 4s¹ 3d¹⁰, porque la subcapa d llena es más estable que 4s² 3d⁹."
    },
    {
      "pregunta": "El hierro (Fe, Z = 26) tiene la configuración 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶. ¿Cuántos electrones hay en la capa n = 4?",
      "opciones": [
        "0",
        "2",
        "6",
        "8"
      ],
      "respuesta": "2",
      "explicacion": "En la capa 4 solo está la subcapa 4s con 2 electrones (los 6 de la 3d pertenecen a la capa 3)."
    }
  ]
}$quimia$::jsonb,
  3,
  true),

('quimia-clase-propiedades-periodicas', 'Propiedades periódicas',
  'Radio atómico, energía de ionización, afinidad electrónica y electronegatividad: cómo cambian por período y por grupo, y por qué.',
  'quimia',
  $quimia${
  "pasos": [
    "Las propiedades periódicas son propiedades de los átomos que cambian de forma regular al recorrer la tabla. Las cuatro principales son el radio atómico, la energía de ionización, la afinidad electrónica y la electronegatividad. Todas dependen de dos cosas: cuántas capas tiene el átomo y cuánta carga positiva del núcleo siente el electrón externo.",
    "El radio atómico es el tamaño del átomo. En un grupo aumenta hacia abajo, porque hay más capas. En un período disminuye hacia la derecha: el núcleo tiene más protones y atrae con más fuerza a las mismas capas. Además, un catión es más chico que su átomo (perdió electrones) y un anión es más grande (ganó electrones).",
    "La energía de ionización es la energía necesaria para arrancarle un electrón a un átomo gaseoso neutro. Cuanto más fuerte lo retiene el núcleo, más energía hace falta. Aumenta hacia la derecha en un período y hacia arriba en un grupo (al revés que el radio): es más difícil arrancar un electrón de un átomo chico. El helio tiene la más alta de todas. Hay pequeñas irregularidades (entre Be y B, o entre N y O) que a este nivel no se estudian.",
    "La afinidad electrónica es la energía que se libera, en general, cuando un átomo gaseoso neutro gana un electrón. Cuanto mayor es, más «quiere» el átomo ese electrón. Tiende a aumentar hacia la derecha y hacia arriba: los halógenos tienen valores muy altos y los gases nobles, casi nulos. Tiene excepciones conocidas: el cloro tiene más afinidad electrónica que el flúor.",
    "La electronegatividad mide cuánto atrae un átomo los electrones cuando está unido a otro. No es una energía medida directamente, sino una escala (la de Pauling, de aproximadamente 0,7 a 4,0). Aumenta hacia la derecha y hacia arriba. El flúor (3,98) es el más electronegativo; los metales alcalinos y alcalinotérreos están por debajo de 1,6. Los gases nobles casi no forman enlaces y a este nivel no se les asigna valor.",
    "Regla para recordar: todo lo que tiene que ver con atraer electrones (energía de ionización, afinidad electrónica y electronegatividad) crece hacia arriba y hacia la derecha, hacia el flúor. El radio atómico hace lo contrario: crece hacia abajo y hacia la izquierda, hacia el francio. Con eso puedes comparar dos elementos cualesquiera.",
    "Ejemplos resueltos. ¿Quién tiene mayor radio, el Na o el Mg? Los dos son del período 3 y el Na está más a la izquierda: el Na. ¿Quién tiene mayor energía de ionización, el K o el Li? Los dos son del grupo 1 y el Li está más arriba: el Li. ¿Quién es más electronegativo, el S o el Cl? Los dos son del período 3 y el Cl está más a la derecha: el Cl.",
    "El carácter metálico (qué tan metal es un elemento) sigue el camino del radio: aumenta hacia abajo y hacia la izquierda. Por eso los metales más reactivos están abajo a la izquierda (Cs, Fr) y los no metales más reactivos, arriba a la derecha (F, O, Cl)."
  ],
  "visuales": [
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 1,
      "pasos": [
        {
          "flecha": "abajo",
          "etiqueta": "Radio atómico: aumenta hacia abajo en un grupo (más capas)."
        },
        {
          "flecha": "izquierda",
          "etiqueta": "Radio atómico: aumenta hacia la izquierda en un período (menos protones que atraen)."
        }
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 2,
      "pasos": [
        {
          "flecha": "derecha",
          "etiqueta": "Energía de ionización: aumenta hacia la derecha en un período."
        },
        {
          "flecha": "arriba",
          "etiqueta": "Energía de ionización: aumenta hacia arriba en un grupo."
        }
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "La electronegatividad sube hacia el flúor",
      "columnas": [
        "Período 2",
        "Electronegatividad",
        "Grupo 17",
        "Electronegatividad"
      ],
      "filas": [
        [
          "Li",
          "0,98",
          "F",
          "3,98"
        ],
        [
          "Be",
          "1,57",
          "Cl",
          "3,16"
        ],
        [
          "B",
          "2,04",
          "Br",
          "2,96"
        ],
        [
          "C",
          "2,55",
          "I",
          "2,66"
        ],
        [
          "N",
          "3,04",
          "",
          ""
        ],
        [
          "O",
          "3,44",
          "",
          ""
        ],
        [
          "F",
          "3,98",
          "",
          ""
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Resumen de tendencias",
      "columnas": [
        "Propiedad",
        "En un período (→)",
        "En un grupo (↓)"
      ],
      "filas": [
        [
          "Radio atómico",
          "disminuye",
          "aumenta"
        ],
        [
          "Energía de ionización",
          "aumenta",
          "disminuye"
        ],
        [
          "Afinidad electrónica",
          "aumenta (con excepciones)",
          "disminuye (con excepciones)"
        ],
        [
          "Electronegatividad",
          "aumenta",
          "disminuye"
        ],
        [
          "Carácter metálico",
          "disminuye",
          "aumenta"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo cambia el radio atómico al bajar por un grupo?",
      "opciones": [
        "Aumenta",
        "Disminuye",
        "No cambia",
        "Se hace cero"
      ],
      "respuesta": "Aumenta",
      "explicacion": "Al bajar hay más capas de electrones, así que el átomo es más grande."
    },
    {
      "pregunta": "¿Cuál de estos átomos tiene mayor radio?",
      "opciones": [
        "Sodio (Na)",
        "Litio (Li)",
        "Cloro (Cl)",
        "Flúor (F)"
      ],
      "respuesta": "Sodio (Na)",
      "explicacion": "El sodio (período 3, grupo 1) está más abajo que el litio y más a la izquierda que el cloro: es el más grande de los cuatro."
    },
    {
      "pregunta": "¿Cuál de estos elementos tiene mayor energía de ionización?",
      "opciones": [
        "Sodio (Na)",
        "Potasio (K)",
        "Calcio (Ca)",
        "Neón (Ne)"
      ],
      "respuesta": "Neón (Ne)",
      "explicacion": "El neón está arriba y a la derecha: retiene muy fuerte sus electrones y cuesta mucho arrancarle uno."
    },
    {
      "pregunta": "Entre el azufre (S) y el cloro (Cl), ¿cuál es más electronegativo?",
      "opciones": [
        "El azufre",
        "El cloro",
        "Los dos por igual",
        "Ninguno"
      ],
      "respuesta": "El cloro",
      "explicacion": "El cloro está más a la derecha en el período 3: 3,16 contra 2,58."
    },
    {
      "pregunta": "Un catión, comparado con su átomo neutro, es...",
      "opciones": [
        "más grande",
        "igual",
        "depende del elemento",
        "más chico"
      ],
      "respuesta": "más chico",
      "explicacion": "Al perder electrones, los que quedan son atraídos con más fuerza por el núcleo: el ion positivo es más chico."
    },
    {
      "pregunta": "¿Hacia dónde crecen la energía de ionización, la afinidad electrónica y la electronegatividad?",
      "opciones": [
        "Hacia abajo y a la izquierda",
        "Hacia abajo y a la derecha",
        "Hacia arriba y a la izquierda",
        "Hacia arriba y a la derecha"
      ],
      "respuesta": "Hacia arriba y a la derecha",
      "explicacion": "Crecen hacia el flúor, arriba a la derecha. El radio atómico es lo contrario."
    }
  ]
}$quimia$::jsonb,
  4,
  true),

('quimia-clase-ficha-elemento', 'Cómo leer la ficha de un elemento',
  'Qué es y para qué sirve cada dato de un casillero de la tabla periódica.',
  'quimia',
  $quimia${
  "pasos": [
    "Cada casillero de la tabla periódica es una ficha con los datos de un elemento. Según el libro, la ficha trae más o menos información, pero casi siempre incluye el número atómico, el símbolo, el nombre y la masa atómica, y muchas veces también los estados de oxidación, la electronegatividad, la configuración electrónica y el estado de agregación.",
    "Mira la ficha del hierro (Fe) y detente en cada dato: el visual te explica qué es y para qué sirve.",
    "Número atómico (Z = 26): dice cuántos protones tiene el núcleo y, en un átomo neutro, cuántos electrones. Es lo que identifica al elemento: no hay dos elementos con el mismo Z.",
    "Masa atómica (55,85 u): es la masa promedio de un átomo del elemento, en unidades de masa atómica. Redondeada, da una idea del número másico del isótopo más abundante: 56 − 26 = 30 neutrones, porque el hierro-56 domina. Ojo: eso solo funciona cuando un isótopo domina; en el cloro (35,45 u) no, porque hay una mezcla de cloro-35 y cloro-37. Además, la masa atómica en u es el mismo número que la masa molar en g/mol: 55,85 g de hierro contienen 1 mol de átomos.",
    "Configuración electrónica ($\\mathrm{[Ar]\\,4s^{2}\\,3d^{6}}$): dice cómo se reparten los electrones. De ahí salen los electrones de valencia y la ubicación en la tabla: la capa más alta es la 4 (período 4) y el último electrón entra en una subcapa d (bloque d).",
    "Electronegatividad (1,83): dice cuánto atrae el átomo los electrones de un enlace. Al comparar dos elementos, la diferencia sirve para decidir el tipo de enlace: mayor que 1,7, iónico; entre 0,4 y 1,7, covalente polar; menor que 0,4, covalente apolar (o casi).",
    "Estados de oxidación (+2, +3): son las cargas que el átomo puede tener, o parecer tener, en sus compuestos. Un elemento puede tener varios: por eso en los nombres aparece «hierro (II)» o «hierro (III)». El signo indica si el átomo cede electrones (+) o los atrae (−). Los que trae la ficha son los más comunes.",
    "Estado de agregación (sólido): indica si el elemento es sólido, líquido o gas a 25 °C y 1 atmósfera. Solo dos elementos son líquidos en esas condiciones: el bromo (Br) y el mercurio (Hg). Hay once gases: H, He, N, O, F, Ne, Cl, Ar, Kr, Xe y Rn.",
    "Ahora lee la ficha del cloro (Cl). Su número atómico es 17, su masa atómica 35,45 u, su configuración $\\mathrm{[Ne]\\,3s^{2}\\,3p^{5}}$ (7 electrones de valencia), su electronegatividad 3,16, es un gas del grupo 17 (un halógeno) y sus estados de oxidación son −1, +1, +3, +5, +7.",
    "Estados de oxidación que conviene reconocer sin mirar la tabla: los metales alcalinos, +1; los alcalinotérreos, +2; el aluminio, +3; el oxígeno, −2 (salvo en los peróxidos, donde es −1); el hidrógeno, +1 (salvo en los hidruros metálicos, donde es −1); y los halógenos, −1 (el flúor, siempre). Los vas a usar mucho al armar fórmulas y al nombrar compuestos."
  ],
  "visuales": [
    {
      "tipo": "quimia.elemento",
      "despuesDePaso": 1,
      "simbolo": "Fe",
      "campos": [
        "numeroAtomico",
        "simbolo",
        "nombre",
        "masa",
        "configuracion",
        "electronegatividad",
        "oxidacion",
        "estado",
        "posicion",
        "familia"
      ]
    },
    {
      "tipo": "quimia.elemento",
      "despuesDePaso": 8,
      "simbolo": "Cl",
      "campos": [
        "numeroAtomico",
        "masa",
        "configuracion",
        "electronegatividad",
        "oxidacion",
        "estado",
        "posicion",
        "familia"
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 9,
      "titulo": "Resumen: cada dato de la ficha y para qué sirve",
      "columnas": [
        "Dato",
        "Qué te dice",
        "Para qué sirve"
      ],
      "filas": [
        [
          "Número atómico (Z)",
          "protones del núcleo",
          "identificar el elemento y contar electrones"
        ],
        [
          "Símbolo y nombre",
          "cómo se escribe y se nombra",
          "escribir fórmulas y nombres"
        ],
        [
          "Masa atómica",
          "masa promedio de un átomo (u)",
          "calcular masas molares (g/mol)"
        ],
        [
          "Configuración electrónica",
          "reparto de los electrones",
          "hallar los electrones de valencia"
        ],
        [
          "Electronegatividad",
          "atracción por los electrones de un enlace",
          "decidir el tipo de enlace"
        ],
        [
          "Estados de oxidación",
          "cargas posibles en los compuestos",
          "armar fórmulas y nombrar"
        ],
        [
          "Estado de agregación",
          "sólido, líquido o gas a 25 °C",
          "conocer la sustancia en condiciones normales"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué indica el número atómico (Z) de un elemento?",
      "opciones": [
        "La cantidad de protones del núcleo",
        "La cantidad de neutrones",
        "La masa del átomo en gramos",
        "La cantidad de capas"
      ],
      "respuesta": "La cantidad de protones del núcleo",
      "explicacion": "Z es la cantidad de protones: es el dato que identifica al elemento."
    },
    {
      "pregunta": "La masa atómica del hierro es 55,85 u y su isótopo más abundante es el hierro-56. ¿Cuántos neutrones tiene ese isótopo? (Z = 26)",
      "opciones": [
        "26",
        "30",
        "56",
        "82"
      ],
      "respuesta": "30",
      "explicacion": "Neutrones = A − Z = 56 − 26 = 30."
    },
    {
      "pregunta": "¿Qué dato de la ficha se usa para decidir si el enlace entre dos elementos es iónico o covalente?",
      "opciones": [
        "La electronegatividad",
        "El número atómico",
        "La masa atómica",
        "El estado de agregación"
      ],
      "respuesta": "La electronegatividad",
      "explicacion": "La diferencia de electronegatividad entre los dos elementos indica cuán desigualmente se reparten los electrones."
    },
    {
      "pregunta": "¿Cuál de estos elementos es líquido a 25 °C y 1 atmósfera?",
      "opciones": [
        "Cloro (Cl)",
        "Bromo (Br)",
        "Yodo (I)",
        "Flúor (F)"
      ],
      "respuesta": "Bromo (Br)",
      "explicacion": "El bromo es un líquido rojizo. El cloro y el flúor son gases y el yodo es un sólido."
    },
    {
      "pregunta": "En la ficha del hierro aparecen los estados de oxidación +2 y +3. ¿Qué significa?",
      "opciones": [
        "Que el hierro tiene dos isótopos",
        "Que tiene 2 o 3 electrones",
        "Que pertenece a los grupos 2 y 3",
        "Que puede formar iones con carga +2 y con carga +3"
      ],
      "respuesta": "Que puede formar iones con carga +2 y con carga +3",
      "explicacion": "Por eso el hierro necesita un número romano en su nombre: hierro (II) o hierro (III)."
    },
    {
      "pregunta": "El cloro tiene la configuración $\\mathrm{[Ne]\\,3s^{2}\\,3p^{5}}$. ¿Cuántos electrones de valencia tiene?",
      "opciones": [
        "1",
        "5",
        "7",
        "17"
      ],
      "respuesta": "7",
      "explicacion": "Los electrones de la capa 3 son 2 + 5 = 7: es un halógeno, del grupo 17."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-simbolos-elementos-comunes', 'Símbolos y elementos comunes',
  'Cómo se forman los símbolos, los nombres latinos, los elementos más importantes y los que forman moléculas de dos átomos.',
  'quimia',
  $quimia${
  "pasos": [
    "Un símbolo químico tiene una o dos letras: la primera en mayúscula y la segunda, si hace falta, en minúscula. Suele salir de la primera letra del nombre y se agrega otra minúscula para distinguir elementos que empiezan igual: C (carbono), Ca (calcio), Cl (cloro), Co (cobalto), Cu (cobre).",
    "Los símbolos pueden venir del nombre en español o en inglés, del nombre en latín, o de lugares y personas: Am (americio, por América), Fr (francio, por Francia), Po (polonio, por Polonia), Cf (californio) y Es (einstenio, por Einstein).",
    "Los que vienen del latín son los que más confunden porque no se parecen al nombre: por ejemplo Na es el sodio (natrium) y Pb es el plomo (plumbum). Esta tabla reúne los más importantes.",
    "Los símbolos de los elementos con nombre latino están repartidos por toda la tabla: por eso conviene asociarlos con una palabra conocida (ferretería, plomero, Argentina).",
    "Otras confusiones frecuentes son símbolos que empiezan con la misma letra. Fíjate bien en la segunda letra: Ca calcio, Cu cobre, Co cobalto, C carbono, Cl cloro, Cr cromo, Cs cesio. Y no mezcles Mg (magnesio), Mn (manganeso) y Hg (mercurio), ni P (fósforo), Pb (plomo) y Pt (platino).",
    "Algunos elementos son muy importantes en la vida diaria. Casi el 96 % de la masa del cuerpo humano son cuatro elementos: oxígeno (O), carbono (C), hidrógeno (H) y nitrógeno (N). El aire es, sobre todo, nitrógeno (cerca del 78 %) y oxígeno (cerca del 21 %). En la corteza terrestre el oxígeno es casi la mitad de la masa y el silicio (Si), más de la cuarta parte.",
    "Algunos elementos, cuando están solos, no forman átomos sueltos sino moléculas de dos átomos. Son siete: hidrógeno, nitrógeno, oxígeno, flúor, cloro, bromo y yodo. Se recuerdan con «HOFBrINCl» (H, O, F, Br, I, N, Cl). Por eso el oxígeno que respiramos es O₂ y no O, y el cloro gaseoso es Cl₂.",
    "Los gases nobles (He, Ne, Ar...) son monoatómicos, y los metales se escriben con su símbolo (Fe, Cu, Au). Un mismo elemento puede presentarse de formas distintas, llamadas alótropos: el oxígeno como O₂ o como ozono (O₃); el carbono como grafito o como diamante.",
    "Error común: confundir la fórmula de una molécula con átomos sueltos. O₂ es una molécula de oxígeno; «2 O» son dos átomos sueltos. Y recuerda que Cl no se escribe CL ni cl."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Símbolos que vienen del latín",
      "columnas": [
        "Símbolo",
        "Nombre en latín",
        "Elemento"
      ],
      "filas": [
        [
          "Na",
          "natrium",
          "sodio"
        ],
        [
          "K",
          "kalium",
          "potasio"
        ],
        [
          "Fe",
          "ferrum",
          "hierro"
        ],
        [
          "Cu",
          "cuprum",
          "cobre"
        ],
        [
          "Ag",
          "argentum",
          "plata"
        ],
        [
          "Au",
          "aurum",
          "oro"
        ],
        [
          "Sn",
          "stannum",
          "estaño"
        ],
        [
          "Pb",
          "plumbum",
          "plomo"
        ],
        [
          "Hg",
          "hydrargyrum",
          "mercurio"
        ],
        [
          "Sb",
          "stibium",
          "antimonio"
        ],
        [
          "W",
          "wolframium (del alemán Wolfram)",
          "wolframio"
        ]
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 3,
      "pasos": [
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "Na",
              "K",
              "Fe",
              "Cu",
              "Ag",
              "Au",
              "Sn",
              "Sb",
              "W",
              "Hg",
              "Pb"
            ]
          },
          "etiqueta": "Los elementos con símbolo de origen latino están repartidos por toda la tabla."
        }
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "Símbolos que se confunden",
      "columnas": [
        "Símbolo",
        "Elemento",
        "Símbolo",
        "Elemento"
      ],
      "filas": [
        [
          "Ca",
          "calcio",
          "Mg",
          "magnesio"
        ],
        [
          "Cu",
          "cobre",
          "Mn",
          "manganeso"
        ],
        [
          "Co",
          "cobalto",
          "Hg",
          "mercurio"
        ],
        [
          "C",
          "carbono",
          "P",
          "fósforo"
        ],
        [
          "Cl",
          "cloro",
          "Pb",
          "plomo"
        ],
        [
          "Cr",
          "cromo",
          "Pt",
          "platino"
        ],
        [
          "Cs",
          "cesio",
          "K",
          "potasio"
        ]
      ]
    },
    {
      "tipo": "quimia.tabla",
      "despuesDePaso": 6,
      "pasos": [
        {
          "seleccion": {
            "por": "elementos",
            "simbolos": [
              "H",
              "O",
              "F",
              "Br",
              "I",
              "N",
              "Cl"
            ]
          },
          "etiqueta": "Los siete elementos que forman moléculas de dos átomos: H₂, O₂, F₂, Br₂, I₂, N₂ y Cl₂."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estos elementos existe como molécula de dos átomos cuando está solo?",
      "opciones": [
        "Neón (Ne)",
        "Hierro (Fe)",
        "Helio (He)",
        "Cloro (Cl)"
      ],
      "respuesta": "Cloro (Cl)",
      "explicacion": "El cloro es uno de los siete diatómicos (HOFBrINCl): se escribe Cl₂."
    },
    {
      "pregunta": "¿Cuál es el símbolo del potasio?",
      "opciones": [
        "P",
        "Po",
        "K",
        "Pt"
      ],
      "respuesta": "K",
      "explicacion": "K viene del latín kalium. El fósforo es P, el polonio Po y el platino Pt."
    },
    {
      "pregunta": "¿Qué elemento tiene el símbolo Hg?",
      "opciones": [
        "Magnesio",
        "Manganeso",
        "Hidrógeno",
        "Mercurio"
      ],
      "respuesta": "Mercurio",
      "explicacion": "Hg viene de hydrargyrum, «plata líquida»: es el mercurio."
    },
    {
      "pregunta": "¿Cuál es el elemento más abundante (en masa) de la corteza terrestre?",
      "opciones": [
        "Hierro",
        "Silicio",
        "Aluminio",
        "Oxígeno"
      ],
      "respuesta": "Oxígeno",
      "explicacion": "El oxígeno es casi la mitad de la masa de la corteza, sobre todo formando óxidos y silicatos."
    },
    {
      "pregunta": "¿Cómo se escribe el oxígeno gaseoso que respiramos?",
      "opciones": [
        "$\\mathrm{O}$",
        "$\\mathrm{O_3}$",
        "2O",
        "$\\mathrm{O_2}$"
      ],
      "respuesta": "$\\mathrm{O_2}$",
      "explicacion": "Es una molécula de dos átomos: O₂. O₃ es el ozono, otra forma del mismo elemento."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-enlace-quimico', 'Enlace químico: iónico, covalente y metálico',
  'Por qué se unen los átomos, la regla del octeto, los tres tipos de enlace y las estructuras de Lewis básicas.',
  'quimia',
  $quimia${
  "pasos": [
    "Los átomos se unen para alcanzar una configuración más estable, casi siempre con 8 electrones en la capa externa (regla del octeto; el hidrógeno se conforma con 2). Un enlace químico es esa unión. Según cómo se comporten los electrones de valencia hay tres tipos: iónico, covalente y metálico.",
    "La regla del octeto es una guía, no una ley: el hidrógeno completa con 2, el berilio y el boro se quedan con menos de 8, y elementos desde el tercer período pueden tener más de 8 (el azufre en $\\mathrm{SF_6}$, el fósforo en $\\mathrm{PCl_5}$). En el colegio se usa como regla general.",
    "Enlace iónico: un átomo transfiere electrones a otro. Se da entre un metal, que pierde electrones, y un no metal, que los gana, con una diferencia de electronegatividad grande (como convención, mayor que 1,7). Se forman iones y las cargas opuestas se atraen. Ejemplo: en el $\\mathrm{NaCl}$ la diferencia es 3,16 − 0,93 = 2,23.",
    "El sodio tiene 1 electrón de valencia y el cloro necesita 1 para completar 8: el sodio cede su electrón y quedan $\\mathrm{Na^{+}}$ y $\\mathrm{Cl^{-}}$. En el $\\mathrm{MgO}$ pasan 2 electrones, del magnesio al oxígeno: $\\mathrm{Mg^{2+}}$ y $\\mathrm{O^{2-}}$.",
    "Los compuestos iónicos no forman moléculas sino redes cristalinas de iones: la fórmula (NaCl) solo indica la proporción entre iones (1 a 1). Son sólidos duros, de alto punto de fusión y quebradizos, y conducen la electricidad cuando están fundidos o disueltos, no en estado sólido.",
    "Enlace covalente: los átomos comparten pares de electrones. Se da entre no metales. Cada par compartido es un enlace: simple si es 1 par, doble si son 2 y triple si son 3. Cuantos más pares comparten dos átomos, más corto y más fuerte es el enlace. Los átomos comparten para que cada uno cuente esos electrones como propios y complete su capa.",
    "Hidrógeno ($\\mathrm{H_2}$): un enlace simple. Oxígeno ($\\mathrm{O_2}$): cada O tiene 6 electrones de valencia y comparte 2 pares (enlace doble). Nitrógeno ($\\mathrm{N_2}$): cada N tiene 5 y comparte 3 pares (enlace triple).",
    "El enlace covalente puede ser apolar o polar. Si los dos átomos tienen igual electronegatividad ($\\mathrm{H_2}$, $\\mathrm{O_2}$, $\\mathrm{N_2}$, $\\mathrm{Cl_2}$), el par se comparte por igual: apolar. Si difieren (diferencia entre 0,4 y 1,7), el par se desplaza hacia el más electronegativo, que queda con una carga parcial negativa (δ−): polar. En el $\\mathrm{HCl}$, 3,16 − 2,20 = 0,96: polar, con el Cl δ−. En el agua, 3,44 − 2,20 = 1,24: también polar.",
    "Ojo: una molécula puede tener enlaces polares y ser apolar en conjunto si su forma es simétrica, como el $\\mathrm{CO_2}$, que es lineal. La polaridad de una molécula depende también de su forma.",
    "Estructuras de Lewis. Sirven para mostrar cómo se reparten los electrones de valencia en una molécula. Pasos: 1) suma los electrones de valencia de todos los átomos; 2) pon al átomo menos electronegativo en el centro (el hidrógeno nunca es central); 3) únelos con enlaces simples (cada uno son 2 electrones); 4) completa el octeto de los átomos de afuera con pares libres; 5) si sobran o faltan electrones, ajusta con enlaces dobles o triples hasta que todos tengan 8 (el H, 2).",
    "Ejemplo resuelto, el agua: los electrones de valencia son 2 × 1 + 6 = 8. El O va en el centro con 2 enlaces simples con los H (4 electrones); los otros 4 quedan como 2 pares libres sobre el O. Así el O tiene 8 y cada H tiene 2. El dióxido de carbono: 4 + 2 × 6 = 16; con dos enlaces dobles C=O y 2 pares libres en cada O, todos completan 8.",
    "Enlace metálico: se da entre átomos de metales. Cada átomo libera sus electrones de valencia y queda como catión; los electrones liberados forman un «mar de electrones» que se mueve libremente entre los cationes y los mantiene unidos. Por eso los metales conducen la electricidad y el calor, brillan y se pueden deformar sin romperse.",
    "Cómo decidir el tipo de enlace: metal con no metal, iónico; no metal con no metal, covalente (polar o apolar según la diferencia de electronegatividad); solo metales, metálico. En química avanzada hay casos intermedios; a este nivel esta regla alcanza."
  ],
  "visuales": [
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 3,
      "enlace": "ionico",
      "ejemplo": "NaCl"
    },
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 3,
      "enlace": "ionico",
      "ejemplo": "MgO"
    },
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 6,
      "enlace": "covalente",
      "ejemplo": "O2"
    },
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 6,
      "enlace": "covalente",
      "ejemplo": "N2"
    },
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 7,
      "enlace": "covalente",
      "ejemplo": "HCl"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 10,
      "titulo": "Estructuras de Lewis: el conteo de electrones",
      "columnas": [
        "Molécula",
        "e⁻ de valencia",
        "Enlaces",
        "Pares libres"
      ],
      "filas": [
        [
          "$\\mathrm{H_2O}$",
          "8",
          "2 enlaces simples",
          "2 en el O"
        ],
        [
          "$\\mathrm{NH_3}$",
          "8",
          "3 enlaces simples",
          "1 en el N"
        ],
        [
          "$\\mathrm{CH_4}$",
          "8",
          "4 enlaces simples",
          "ninguno"
        ],
        [
          "$\\mathrm{CO_2}$",
          "16",
          "2 enlaces dobles",
          "2 en cada O"
        ],
        [
          "$\\mathrm{N_2}$",
          "10",
          "1 enlace triple",
          "1 en cada N"
        ],
        [
          "$\\mathrm{HCl}$",
          "8",
          "1 enlace simple",
          "3 en el Cl"
        ]
      ]
    },
    {
      "tipo": "quimia.enlace",
      "despuesDePaso": 11,
      "enlace": "metalico",
      "ejemplo": "Na"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 12,
      "titulo": "Comparación de los tres tipos de enlace",
      "columnas": [
        "Tipo",
        "Entre",
        "Electrones",
        "Ejemplo"
      ],
      "filas": [
        [
          "Iónico",
          "metal + no metal",
          "se transfieren",
          "$\\mathrm{NaCl}$"
        ],
        [
          "Covalente",
          "no metal + no metal",
          "se comparten",
          "$\\mathrm{H_2O}$"
        ],
        [
          "Metálico",
          "metal + metal",
          "forman un mar",
          "Fe, Cu"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tipo de enlace hay en el $\\mathrm{NaCl}$?",
      "opciones": [
        "Iónico",
        "Covalente apolar",
        "Covalente polar",
        "Metálico"
      ],
      "respuesta": "Iónico",
      "explicacion": "Es un metal (Na) con un no metal (Cl) y la diferencia de electronegatividad es grande (2,23): hay transferencia de un electrón y se forman iones."
    },
    {
      "pregunta": "¿Cuántos pares de electrones se comparten en el enlace del $\\mathrm{O_2}$?",
      "opciones": [
        "1",
        "2",
        "3",
        "4"
      ],
      "respuesta": "2",
      "explicacion": "Cada oxígeno tiene 6 electrones de valencia y necesita 2 más para llegar a 8: comparten 2 pares (enlace doble)."
    },
    {
      "pregunta": "Los átomos de $\\mathrm{N_2}$ están unidos por...",
      "opciones": [
        "un enlace simple",
        "un enlace triple",
        "un enlace doble",
        "un enlace iónico"
      ],
      "respuesta": "un enlace triple",
      "explicacion": "Cada nitrógeno tiene 5 electrones de valencia y necesita 3 más: comparten 3 pares."
    },
    {
      "pregunta": "¿Cuál de estas descripciones corresponde al enlace metálico?",
      "opciones": [
        "Transferencia de electrones de un metal a un no metal",
        "Cationes unidos por un mar de electrones libres",
        "Pares de electrones compartidos entre dos no metales",
        "Atracción entre moléculas polares"
      ],
      "respuesta": "Cationes unidos por un mar de electrones libres",
      "explicacion": "En el enlace metálico los electrones de valencia se mueven libres entre los cationes, lo que explica la conducción eléctrica."
    },
    {
      "pregunta": "En la molécula de $\\mathrm{HCl}$, ¿cuál átomo tiene la carga parcial negativa?",
      "opciones": [
        "El cloro",
        "El hidrógeno",
        "Ninguno: es un enlace apolar",
        "Los dos por igual"
      ],
      "respuesta": "El cloro",
      "explicacion": "El cloro es más electronegativo (3,16 contra 2,20) y atrae más el par compartido."
    },
    {
      "pregunta": "¿Cuántos electrones de valencia hay en total en una molécula de $\\mathrm{CO_2}$?",
      "opciones": [
        "12",
        "14",
        "16",
        "18"
      ],
      "respuesta": "16",
      "explicacion": "4 del carbono + 2 × 6 de los oxígenos = 16."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-formulas-masa-molar', 'Fórmulas químicas y masa molar',
  'Fórmula molecular, empírica y estructural; subíndice y coeficiente; y cómo calcular la masa molar de un compuesto.',
  'quimia',
  $quimia${
  "pasos": [
    "Una fórmula química representa una sustancia con símbolos y subíndices. La fórmula molecular indica la cantidad real de átomos de cada elemento en una molécula ($\\mathrm{H_2O_2}$, $\\mathrm{C_6H_{12}O_6}$). La fórmula empírica indica la proporción mínima entera: la de la glucosa es $\\mathrm{CH_2O}$ y la del agua oxigenada es $\\mathrm{HO}$. La fórmula estructural muestra cómo están unidos los átomos (H–O–H).",
    "En los compuestos iónicos solo existe la fórmula empírica (la unidad fórmula): $\\mathrm{NaCl}$ indica la proporción 1 a 1 entre iones en la red cristalina. No existe una «molécula de NaCl».",
    "Subíndice y coeficiente son cosas distintas. El subíndice está dentro de la fórmula y define la sustancia: $\\mathrm{H_2O}$ es agua y $\\mathrm{H_2O_2}$ es agua oxigenada. El coeficiente va delante y dice cuántas unidades hay: $3\\,\\mathrm{H_2O}$ son 3 moléculas de agua. Un paréntesis con subíndice multiplica todo lo que encierra: $\\mathrm{Ca(OH)_2}$ tiene 1 Ca, 2 O y 2 H.",
    "Error común: para «tener más» de una sustancia se cambia el coeficiente, nunca el subíndice. Cambiar un subíndice es cambiar de sustancia.",
    "La masa molecular relativa es la suma de las masas atómicas de todos los átomos de la fórmula, en u. La masa molar es ese mismo número expresado en g/mol: es la masa de 1 mol de la sustancia. Un mol contiene 6,02 × 10²³ entidades (átomos, moléculas o pares de iones): es el número de Avogadro.",
    "Ejemplo resuelto: el agua. $\\mathrm{H_2O}$ tiene 2 H y 1 O. Masa molar = 2 × 1,01 + 16,00 = 18,02, que se redondea a 18,0 g/mol.",
    "Ejemplo con paréntesis: el carbonato de calcio. $\\mathrm{CaCO_3}$ tiene 1 Ca, 1 C y 3 O: 40,08 + 12,01 + 3 × 16,00 = 100,09, o sea 100,1 g/mol.",
    "Otro con subíndices grandes: $\\mathrm{Al_2(SO_4)_3}$ tiene 2 Al, 3 S y 12 O: 2 × 26,98 + 3 × 32,06 + 12 × 16,00 = 342,14, o sea 342,1 g/mol.",
    "La composición porcentual sale de dividir la masa de cada elemento por la masa molar. En el agua, el oxígeno aporta 16,00 de 18,02: 88,8 % de oxígeno y 11,2 % de hidrógeno (suman 100 %).",
    "Errores comunes: olvidar que el subíndice de un paréntesis multiplica a todos los átomos que encierra; sumar los símbolos en vez de sus masas; y confundir u (masa de un átomo) con g/mol (masa de un mol). Con las masas atómicas de la tabla, redondea al final, no en cada paso."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "columnas": [
        "Expresión",
        "Qué significa",
        "Átomos"
      ],
      "filas": [
        [
          "$\\mathrm{H_2O}$",
          "1 molécula de agua",
          "2 H y 1 O"
        ],
        [
          "$2\\,\\mathrm{H_2O}$",
          "2 moléculas de agua",
          "4 H y 2 O"
        ],
        [
          "$3\\,\\mathrm{Ca(OH)_2}$",
          "3 unidades de hidróxido de calcio",
          "3 Ca, 6 O y 6 H"
        ],
        [
          "$\\mathrm{Al_2(SO_4)_3}$",
          "1 unidad de sulfato de aluminio",
          "2 Al, 3 S y 12 O"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Masas molares (con las masas atómicas de la tabla, redondeadas a 1 decimal)",
      "columnas": [
        "Compuesto",
        "Fórmula",
        "Masa molar (g/mol)"
      ],
      "filas": [
        [
          "agua",
          "$\\mathrm{H_2O}$",
          "18,0"
        ],
        [
          "dióxido de carbono",
          "$\\mathrm{CO_2}$",
          "44,0"
        ],
        [
          "cloruro de sodio",
          "$\\mathrm{NaCl}$",
          "58,4"
        ],
        [
          "ácido sulfúrico",
          "$\\mathrm{H_2SO_4}$",
          "98,1"
        ],
        [
          "hidróxido de calcio",
          "$\\mathrm{Ca(OH)_2}$",
          "74,1"
        ],
        [
          "carbonato de calcio",
          "$\\mathrm{CaCO_3}$",
          "100,1"
        ],
        [
          "glucosa",
          "$\\mathrm{C_6H_{12}O_6}$",
          "180,2"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la masa molar del dióxido de carbono ($\\mathrm{CO_2}$)?",
      "opciones": [
        "28,0 g/mol",
        "88,0 g/mol",
        "16,0 g/mol",
        "44,0 g/mol"
      ],
      "respuesta": "44,0 g/mol",
      "explicacion": "12,01 + 2 × 16,00 = 44,01, que se redondea a 44,0 g/mol."
    },
    {
      "pregunta": "¿Cuántos átomos de hidrógeno hay en $2\\,\\mathrm{Ca(OH)_2}$?",
      "opciones": [
        "2",
        "4",
        "6",
        "8"
      ],
      "respuesta": "4",
      "explicacion": "Cada Ca(OH)₂ tiene 2 H y hay 2 unidades: 2 × 2 = 4."
    },
    {
      "pregunta": "¿Cuál es la fórmula empírica de la glucosa, $\\mathrm{C_6H_{12}O_6}$?",
      "opciones": [
        "$\\mathrm{C_6H_{12}O_6}$",
        "$\\mathrm{C_2H_4O_2}$",
        "$\\mathrm{CH_2O}$",
        "$\\mathrm{CHO}$"
      ],
      "respuesta": "$\\mathrm{CH_2O}$",
      "explicacion": "Se divide por el máximo común divisor (6): C₁H₂O₁ se escribe CH₂O."
    },
    {
      "pregunta": "¿Cuál es la masa molar del cloruro de sodio ($\\mathrm{NaCl}$)?",
      "opciones": [
        "35,5 g/mol",
        "23,0 g/mol",
        "58,4 g/mol",
        "12,0 g/mol"
      ],
      "respuesta": "58,4 g/mol",
      "explicacion": "22,99 + 35,45 = 58,44, o sea 58,4 g/mol."
    },
    {
      "pregunta": "Un mol de una sustancia contiene...",
      "opciones": [
        "1 gramo de sustancia",
        "1 litro de gas",
        "100 partículas",
        "6,02 × 10²³ entidades (moléculas, átomos o unidades fórmula)"
      ],
      "respuesta": "6,02 × 10²³ entidades (moléculas, átomos o unidades fórmula)",
      "explicacion": "Es el número de Avogadro. La masa de ese mol, en gramos, es la masa molar."
    },
    {
      "pregunta": "¿Cuál es la masa molar del ácido sulfúrico ($\\mathrm{H_2SO_4}$)?",
      "opciones": [
        "98,1 g/mol",
        "49,0 g/mol",
        "64,1 g/mol",
        "34,1 g/mol"
      ],
      "respuesta": "98,1 g/mol",
      "explicacion": "2 × 1,01 + 32,06 + 4 × 16,00 = 98,08, o sea 98,1 g/mol."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-valencia-oxidacion-cruce', 'Valencia, número de oxidación y cómo armar fórmulas',
  'Reglas básicas del número de oxidación, cargas típicas por grupo y el método de cruzar las cargas.',
  'quimia',
  $quimia${
  "pasos": [
    "La valencia es la capacidad de combinación de un átomo. El número de oxidación es la carga que tendría el átomo si todos sus enlaces fueran iónicos: los electrones compartidos se le asignan al átomo más electronegativo. Se escribe con signo sobre el símbolo, como $\\overset{+3}{\\mathrm{Fe}}$, distinto de la carga de un ion, que se escribe con el signo después del número, como $\\mathrm{Fe^{3+}}$. En los iones simples los dos coinciden.",
    "Reglas básicas: 1) un elemento solo (Fe, O₂, H₂, Cl₂) tiene número de oxidación 0; 2) un ion monoatómico tiene como número de oxidación su carga (Na⁺ es +1, Cl⁻ es −1); 3) el hidrógeno es +1, salvo en los hidruros metálicos (NaH, CaH₂), donde es −1; 4) el oxígeno es −2, salvo en los peróxidos, donde es −1; 5) el flúor es siempre −1; 6) los metales alcalinos son +1, los alcalinotérreos +2 y el aluminio +3; 7) la suma de los números de oxidación de un compuesto neutro es 0, y en un ion es igual a su carga.",
    "Ejemplo resuelto 1: ¿cuál es el número de oxidación del azufre en $\\mathrm{H_2SO_4}$? Se plantea 2 × (+1) + x + 4 × (−2) = 0, que da x = +6. En el ion $\\mathrm{SO_4^{2-}}$: x + 4 × (−2) = −2, que da lo mismo: +6.",
    "Ejemplo resuelto 2: el nitrógeno en $\\mathrm{HNO_3}$: (+1) + x + 3 × (−2) = 0, o sea x = +5. En el ion amonio $\\mathrm{NH_4^{+}}$: x + 4 × (+1) = +1, o sea x = −3. El hierro en $\\mathrm{Fe_2O_3}$: 2x + 3 × (−2) = 0, o sea x = +3.",
    "Ejemplo resuelto 3: el manganeso en $\\mathrm{KMnO_4}$: (+1) + x + 4 × (−2) = 0, o sea x = +7. El cromo en $\\mathrm{K_2Cr_2O_7}$: 2 × (+1) + 2x + 7 × (−2) = 0, o sea x = +6. Estos números también se usan en las reacciones de oxidación y reducción.",
    "Cargas típicas de los grupos principales: grupo 1, +1; grupo 2, +2; grupo 13, +3; grupo 14, +4 (también −4); grupo 15, −3 (el nitrógeno y el fósforo también tienen +3 y +5); grupo 16, −2 (el azufre también +4 y +6); grupo 17, −1 (el cloro, el bromo y el yodo también +1, +3, +5 y +7; el flúor, solo −1). Los metales de transición pueden tener varios: hierro (+2 y +3), cobre (+1 y +2), estaño (+2 y +4), plomo (+2 y +4), oro (+1 y +3), cobalto (+2 y +3).",
    "Cómo armar una fórmula cruzando las cargas: 1) escribe el catión y el anión con sus cargas; 2) el número de la carga de cada uno (sin signo) pasa a ser el subíndice del otro; 3) simplifica si hay divisor común; 4) pon entre paréntesis los iones de varios átomos cuando su subíndice es mayor que 1; 5) verifica que la suma de las cargas sea cero. Ejemplos: $\\mathrm{Al^{3+}}$ con $\\mathrm{O^{2-}}$ da $\\mathrm{Al_2O_3}$; $\\mathrm{Ca^{2+}}$ con $\\mathrm{OH^{-}}$ da $\\mathrm{Ca(OH)_2}$; $\\mathrm{Fe^{3+}}$ con $\\mathrm{SO_4^{2-}}$ da $\\mathrm{Fe_2(SO_4)_3}$; $\\mathrm{NH_4^{+}}$ con $\\mathrm{PO_4^{3-}}$ da $\\mathrm{(NH_4)_3PO_4}$.",
    "Errores comunes: olvidar simplificar (CaO, no Ca₂O₂); olvidar el paréntesis (Ca(OH)₂, no CaOH₂); cambiar el subíndice dentro de un ion (el sulfato es siempre SO₄, y si hacen falta dos se escribe (SO₄)₂ entre paréntesis); y escribir la carga como subíndice. Para comprobar una fórmula, suma las cargas: debe dar 0.",
    "Verificación final: en $\\mathrm{Al_2O_3}$, 2 × (+3) + 3 × (−2) = 0. En $\\mathrm{Fe_2(SO_4)_3}$, 2 × (+3) + 3 × (−2) = 0. En $\\mathrm{Ca_3(PO_4)_2}$, 3 × (+2) + 2 × (−3) = 0."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "titulo": "Reglas básicas del número de oxidación",
      "columnas": [
        "Regla",
        "Ejemplo"
      ],
      "filas": [
        [
          "Elemento solo: 0",
          "$\\mathrm{O_2}$: $\\overset{0}{\\mathrm{O}}$"
        ],
        [
          "Ion monoatómico: su carga",
          "$\\mathrm{Cl^{-}}$: $\\overset{-1}{\\mathrm{Cl}}$"
        ],
        [
          "Hidrógeno: +1 (en hidruros metálicos, −1)",
          "$\\mathrm{H_2O}$: $\\overset{+1}{\\mathrm{H}}$; $\\mathrm{NaH}$: $\\overset{-1}{\\mathrm{H}}$"
        ],
        [
          "Oxígeno: −2 (en peróxidos, −1)",
          "$\\mathrm{H_2O}$: $\\overset{-2}{\\mathrm{O}}$; $\\mathrm{H_2O_2}$: $\\overset{-1}{\\mathrm{O}}$"
        ],
        [
          "Flúor: siempre −1",
          "$\\mathrm{HF}$: $\\overset{-1}{\\mathrm{F}}$"
        ],
        [
          "Alcalinos +1, alcalinotérreos +2, Al +3",
          "$\\mathrm{NaCl}$: $\\overset{+1}{\\mathrm{Na}}$; $\\mathrm{CaO}$: $\\overset{+2}{\\mathrm{Ca}}$"
        ],
        [
          "La suma es 0 (neutro) o la carga (ion)",
          "$\\mathrm{H_2SO_4}$: 2(+1) + (+6) + 4(−2) = 0"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Números de oxidación típicos por grupo",
      "columnas": [
        "Grupo",
        "Número de oxidación típico",
        "Ejemplos"
      ],
      "filas": [
        [
          "1",
          "+1",
          "Na, K"
        ],
        [
          "2",
          "+2",
          "Mg, Ca"
        ],
        [
          "13",
          "+3",
          "Al"
        ],
        [
          "14",
          "+4 (y −4)",
          "C, Si"
        ],
        [
          "15",
          "−3 (también +3, +5)",
          "N, P"
        ],
        [
          "16",
          "−2 (el S también +4, +6)",
          "O, S"
        ],
        [
          "17",
          "−1 (Cl, Br, I también +1, +3, +5, +7)",
          "F, Cl"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Metales con más de una valencia",
      "columnas": [
        "Metal",
        "Cargas posibles"
      ],
      "filas": [
        [
          "Hierro (Fe)",
          "+2 y +3"
        ],
        [
          "Cobre (Cu)",
          "+1 y +2"
        ],
        [
          "Estaño (Sn)",
          "+2 y +4"
        ],
        [
          "Plomo (Pb)",
          "+2 y +4"
        ],
        [
          "Oro (Au)",
          "+1 y +3"
        ],
        [
          "Cobalto (Co)",
          "+2 y +3"
        ]
      ]
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 6,
      "cation": "Al3+",
      "anion": "O2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 6,
      "cation": "Ca2+",
      "anion": "OH-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 6,
      "cation": "Fe3+",
      "anion": "SO4^2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 6,
      "cation": "NH4+",
      "anion": "PO4^3-"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el número de oxidación del azufre en $\\mathrm{H_2SO_4}$?",
      "opciones": [
        "+2",
        "+6",
        "+4",
        "−2"
      ],
      "respuesta": "+6",
      "explicacion": "2 × (+1) + x + 4 × (−2) = 0, entonces x = +6."
    },
    {
      "pregunta": "¿Cuál es el número de oxidación del nitrógeno en $\\mathrm{HNO_3}$?",
      "opciones": [
        "+1",
        "+3",
        "+5",
        "−3"
      ],
      "respuesta": "+5",
      "explicacion": "(+1) + x + 3 × (−2) = 0, entonces x = +5."
    },
    {
      "pregunta": "¿Cuál es el número de oxidación del manganeso en $\\mathrm{KMnO_4}$?",
      "opciones": [
        "+2",
        "+4",
        "+6",
        "+7"
      ],
      "respuesta": "+7",
      "explicacion": "(+1) + x + 4 × (−2) = 0, entonces x = +7."
    },
    {
      "pregunta": "¿Cuál es la fórmula del fosfato de calcio ($\\mathrm{Ca^{2+}}$ y $\\mathrm{PO_4^{3-}}$)?",
      "opciones": [
        "$\\mathrm{CaPO_4}$",
        "$\\mathrm{Ca_2(PO_4)_3}$",
        "$\\mathrm{Ca_3PO_4}$",
        "$\\mathrm{Ca_3(PO_4)_2}$"
      ],
      "respuesta": "$\\mathrm{Ca_3(PO_4)_2}$",
      "explicacion": "Se cruzan las cargas: el 2 del calcio va al fosfato y el 3 del fosfato va al calcio. El fosfato lleva paréntesis porque su subíndice es 2: Ca₃(PO₄)₂."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el oxígeno en el peróxido de hidrógeno, $\\mathrm{H_2O_2}$?",
      "opciones": [
        "−2",
        "−1",
        "0",
        "+1"
      ],
      "respuesta": "−1",
      "explicacion": "En los peróxidos el oxígeno es −1: 2 × (+1) + 2 × x = 0, entonces x = −1."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el hidrógeno en el hidruro de sodio, $\\mathrm{NaH}$?",
      "opciones": [
        "+1",
        "0",
        "−2",
        "−1"
      ],
      "respuesta": "−1",
      "explicacion": "El sodio es +1, así que el hidrógeno tiene que ser −1 para que la suma sea 0. Es uno de los pocos casos en que el H es negativo."
    }
  ]
}$quimia$::jsonb,
  3,
  true),

('quimia-clase-nomenclatura-vision-general', 'Nomenclatura inorgánica: visión general',
  'Los tres sistemas de nomenclatura, cuándo se usa cada uno y cómo se escriben los nombres y las fórmulas.',
  'quimia',
  $quimia${
  "pasos": [
    "La nomenclatura es el conjunto de reglas para darle nombre a los compuestos y escribir sus fórmulas. En el colegio se enseñan tres sistemas: el tradicional (o clásico), el de Stock y el sistemático (con prefijos, llamado también de atomicidad). La IUPAC, que es la entidad que fija las normas internacionales, recomienda los dos últimos; el tradicional ya no se recomienda, pero sigue en muchos libros, etiquetas y exámenes, así que se aprende igual.",
    "Un mismo compuesto tiene un nombre en cada sistema. Observa cómo cambia el nombre del mismo óxido de hierro según el sistema.",
    "Sistema tradicional. Distingue las valencias de un elemento con terminaciones: si tiene una sola, se dice «de» y el nombre (óxido de sodio); si tiene dos, la menor lleva «-oso» y la mayor «-ico» (óxido ferroso y óxido férrico). Los halógenos (que tienen cuatro estados de oxidación positivos) usan además los prefijos «hipo-» (el menor) y «per-» (el mayor): hipo…oso, …oso, …ico, per…ico.",
    "Sistema de Stock. Indica el número de oxidación del elemento con un número romano entre paréntesis, pegado al nombre: óxido de hierro (II) y óxido de hierro (III). Si el elemento tiene una sola valencia, no se pone el número: óxido de sodio.",
    "Sistema sistemático (de atomicidad). Indica con prefijos cuántos átomos hay de cada elemento: mono-, di-, tri-, tetra-, penta-, hexa-, hepta-. $\\mathrm{Fe_2O_3}$ es trióxido de dihierro. El prefijo «mono» se omite en el primer elemento.",
    "Cómo se escriben las FÓRMULAS: 1) primero el elemento menos electronegativo (el metal o el catión) y después el más electronegativo: $\\mathrm{NaCl}$, $\\mathrm{Al_2O_3}$. Las excepciones son históricas: el hidrógeno de los ácidos va primero ($\\mathrm{HCl}$, $\\mathrm{H_2SO_4}$) y se mantienen NH₃ y CH₄. 2) El subíndice 1 no se escribe. 3) Se usan paréntesis cuando un grupo de átomos se repite: $\\mathrm{Ca(OH)_2}$, $\\mathrm{Al_2(SO_4)_3}$; nunca con subíndice 1: $\\mathrm{NaOH}$, no Na(OH). 4) Cada símbolo empieza con mayúscula y la segunda letra, si hay, va en minúscula.",
    "Cómo se escriben los NOMBRES: 1) se nombra primero el anión (el más electronegativo) y después «de» y el catión: $\\mathrm{NaCl}$ es cloruro de sodio, o sea, se lee al revés que la fórmula. 2) Se escriben en minúscula (salvo al empezar una oración): «cloruro de sodio», no «Cloruro De Sodio». 3) Llevan tilde óxido, peróxido, hidróxido y anhídrido, y también los ácidos como sulfúrico, nítrico, clórico o carbónico; en cambio sulfato, nitrato o cloruro no. 4) El número romano va entre paréntesis pegado al nombre del metal: hierro (III); los textos de la IUPAC lo escriben sin espacio, «hierro(III)», y en el colegio suele verse con espacio: las dos formas se entienden. 5) Los prefijos se pegan a la palabra, sin espacio ni guion: trióxido de dihierro.",
    "¿Cuál sistema conviene? El tradicional es el de los ácidos y las sales comunes (ácido sulfúrico, sulfato de sodio, carbonato de calcio). El de Stock es el más práctico cuando el metal tiene varias valencias (óxido de hierro (III)). El sistemático es el más claro para óxidos y compuestos de no metales (dióxido de carbono, pentacloruro de fósforo), porque el nombre dice la fórmula. Los tres son válidos: tu docente o tu libro indican cuál usar.",
    "Mapa de lo que sigue en el curso: los compuestos inorgánicos se ordenan en familias según los elementos que los forman. Cada una tiene su fórmula general y su forma de nombrar; las siguientes clases recorren una por una."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "titulo": "Un mismo compuesto, tres nombres",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{FeO}$",
          "óxido ferroso",
          "óxido de hierro (II)",
          "monóxido de hierro"
        ],
        [
          "$\\mathrm{Fe_2O_3}$",
          "óxido férrico",
          "óxido de hierro (III)",
          "trióxido de dihierro"
        ],
        [
          "$\\mathrm{CuO}$",
          "óxido cúprico",
          "óxido de cobre (II)",
          "monóxido de cobre"
        ],
        [
          "$\\mathrm{SO_3}$",
          "anhídrido sulfúrico",
          "óxido de azufre (VI)",
          "trióxido de azufre"
        ],
        [
          "$\\mathrm{CO_2}$",
          "anhídrido carbónico",
          "óxido de carbono (IV)",
          "dióxido de carbono"
        ],
        [
          "$\\mathrm{FeCl_3}$",
          "cloruro férrico",
          "cloruro de hierro (III)",
          "tricloruro de hierro"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Cómo se escribe: bien y mal",
      "columnas": [
        "Regla",
        "Bien",
        "Mal"
      ],
      "filas": [
        [
          "Subíndice 1",
          "$\\mathrm{NaCl}$",
          "Na₁Cl₁"
        ],
        [
          "Paréntesis solo si el grupo se repite",
          "$\\mathrm{NaOH}$ y $\\mathrm{Ca(OH)_2}$",
          "Na(OH) y CaOH₂"
        ],
        [
          "Nombre en minúscula",
          "cloruro de sodio",
          "Cloruro De Sodio"
        ],
        [
          "Romano entre paréntesis",
          "óxido de hierro (III)",
          "óxido de hierro III"
        ],
        [
          "Prefijos pegados",
          "trióxido de dihierro",
          "tri óxido de di hierro"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Mapa de los compuestos inorgánicos",
      "columnas": [
        "Tipo de compuesto",
        "Fórmula general",
        "Ejemplo",
        "Nombre"
      ],
      "filas": [
        [
          "Óxido básico",
          "metal + O",
          "$\\mathrm{Na_2O}$",
          "óxido de sodio"
        ],
        [
          "Óxido ácido (anhídrido)",
          "no metal + O",
          "$\\mathrm{SO_3}$",
          "anhídrido sulfúrico / trióxido de azufre"
        ],
        [
          "Hidruro metálico",
          "metal + H",
          "$\\mathrm{CaH_2}$",
          "hidruro de calcio"
        ],
        [
          "Peróxido",
          "metal + $\\mathrm{O_2}$",
          "$\\mathrm{Na_2O_2}$",
          "peróxido de sodio"
        ],
        [
          "Hidróxido",
          "metal + OH",
          "$\\mathrm{Ca(OH)_2}$",
          "hidróxido de calcio"
        ],
        [
          "Hidrácido",
          "H + no metal",
          "$\\mathrm{HCl}$",
          "ácido clorhídrico"
        ],
        [
          "Oxoácido",
          "H + no metal + O",
          "$\\mathrm{H_2SO_4}$",
          "ácido sulfúrico"
        ],
        [
          "Sal binaria",
          "metal + no metal",
          "$\\mathrm{NaCl}$",
          "cloruro de sodio"
        ],
        [
          "Oxisal",
          "metal + no metal + O",
          "$\\mathrm{Na_2SO_4}$",
          "sulfato de sodio"
        ],
        [
          "Sal ácida",
          "como una oxisal, con H",
          "$\\mathrm{NaHCO_3}$",
          "hidrogenocarbonato de sodio"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el nombre en nomenclatura Stock de $\\mathrm{FeCl_3}$?",
      "opciones": [
        "Cloruro de hierro (III)",
        "Cloruro férrico",
        "Tricloruro de hierro",
        "Cloruro de hierro (II)"
      ],
      "respuesta": "Cloruro de hierro (III)",
      "explicacion": "En Stock el número romano es la carga del hierro: hay tres Cl⁻, así que Fe³⁺ y el nombre es cloruro de hierro (III). «Cloruro férrico» es el nombre tradicional y «tricloruro de hierro» el sistemático."
    },
    {
      "pregunta": "¿Cuál es el nombre sistemático de $\\mathrm{Fe_2O_3}$?",
      "opciones": [
        "Monóxido de hierro",
        "Óxido de hierro (III)",
        "Trióxido de dihierro",
        "Dióxido de hierro"
      ],
      "respuesta": "Trióxido de dihierro",
      "explicacion": "Dos hierros (di) y tres oxígenos (tri): trióxido de dihierro."
    },
    {
      "pregunta": "¿Cuál es el nombre tradicional de $\\mathrm{FeO}$?",
      "opciones": [
        "Óxido ferroso",
        "Óxido férrico",
        "Óxido de hierro (II)",
        "Óxido de hierro"
      ],
      "respuesta": "Óxido ferroso",
      "explicacion": "El hierro tiene dos valencias: la menor (+2) lleva -oso. FeO es óxido ferroso y Fe₂O₃ (+3) es óxido férrico."
    },
    {
      "pregunta": "¿Cuál de estas escrituras es la correcta?",
      "opciones": [
        "cloruro de sodio",
        "Cloruro De Sodio",
        "Cloruro de Sodio",
        "CLORURO DE SODIO"
      ],
      "respuesta": "cloruro de sodio",
      "explicacion": "Los nombres de compuestos se escriben en minúscula (salvo al empezar una oración)."
    },
    {
      "pregunta": "En $\\mathrm{Ca(OH)_2}$, ¿por qué el OH va entre paréntesis?",
      "opciones": [
        "Porque es un ácido",
        "Porque el grupo OH se repite 2 veces",
        "Porque el calcio es un metal",
        "No hace falta: es opcional"
      ],
      "respuesta": "Porque el grupo OH se repite 2 veces",
      "explicacion": "El paréntesis indica que el subíndice 2 multiplica a todo el grupo OH: 1 Ca, 2 O y 2 H."
    },
    {
      "pregunta": "¿Qué sistema indica el número de oxidación con un número romano entre paréntesis?",
      "opciones": [
        "El tradicional",
        "El de Stock",
        "El sistemático",
        "Ninguno"
      ],
      "respuesta": "El de Stock",
      "explicacion": "El sistema Stock: óxido de hierro (III), cloruro de cobre (II)."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-oxidos', 'Óxidos básicos y óxidos ácidos',
  'Cómo se forman, se nombran (en los tres sistemas) y se escriben los óxidos de metales y de no metales.',
  'quimia',
  $quimia${
  "pasos": [
    "Un óxido es un compuesto binario de un elemento con oxígeno, donde el oxígeno tiene número de oxidación −2. Se forman cuando un elemento reacciona con el oxígeno: $\\mathrm{4Fe + 3O_2}\\rightarrow\\mathrm{2Fe_2O_3}$ $\\mathrm{2Mg + O_2}\\rightarrow\\mathrm{2MgO}$ $\\mathrm{S + O_2}\\rightarrow\\mathrm{SO_2}$ $\\mathrm{C + O_2}\\rightarrow\\mathrm{CO_2}$",
    "Óxidos básicos (metal + oxígeno). Se llaman básicos porque al reaccionar con agua dan hidróxidos, que son bases: $\\mathrm{Na_2O + H_2O}\\rightarrow\\mathrm{2NaOH}$ $\\mathrm{CaO + H_2O}\\rightarrow\\mathrm{Ca(OH)_2}$",
    "Cómo se escribe la fórmula de un óxido básico: cruzando las cargas del metal con la del oxígeno ($\\mathrm{O^{2-}}$). Con $\\mathrm{Al^{3+}}$ da $\\mathrm{Al_2O_3}$; con $\\mathrm{Ca^{2+}}$ da $\\mathrm{CaO}$ (se simplifica); con $\\mathrm{Na^{+}}$ da $\\mathrm{Na_2O}$.",
    "Cómo se nombran: en el sistema tradicional, «óxido de» + el metal si tiene una sola valencia, u «óxido» + el metal con -oso o -ico si tiene dos (óxido ferroso, óxido férrico). En Stock, «óxido de» + el metal con su número romano si hace falta. En el sistemático se agregan prefijos. La tabla muestra varios casos.",
    "Los metales con dos valencias son un punto de error frecuente. Para hallar la valencia del metal en un óxido: los subíndices cruzados la delatan. En Fe₂O₃ hay 3 oxígenos (carga −6 en total) repartidos entre 2 hierros: cada uno es +3. En FeO hay 1 oxígeno (−2) para 1 hierro: es +2.",
    "Óxidos ácidos o anhídridos (no metal + oxígeno). Se llaman ácidos porque al reaccionar con agua dan oxoácidos: $\\mathrm{SO_3 + H_2O}\\rightarrow\\mathrm{H_2SO_4}$ $\\mathrm{CO_2 + H_2O}\\rightarrow\\mathrm{H_2CO_3}$ $\\mathrm{N_2O_5 + H_2O}\\rightarrow\\mathrm{2HNO_3}$ $\\mathrm{Cl_2O_7 + H_2O}\\rightarrow\\mathrm{2HClO_4}$",
    "Nomenclatura tradicional de los anhídridos: la palabra «anhídrido» + el no metal con la terminación según su número de oxidación. Los halógenos (Cl, Br, I) usan cuatro: +1 hipo…oso, +3 …oso, +5 …ico y +7 per…ico. El azufre, el selenio y el telurio usan dos: +4 …oso y +6 …ico. El nitrógeno, el fósforo y el arsénico también dos: +3 …oso y +5 …ico. El carbono y el silicio, uno solo: +4 …ico. Con Stock: «óxido de» + el no metal con su número romano; con el sistemático, los prefijos.",
    "Cómo escribir la fórmula de un óxido no metálico a partir del número de oxidación n del no metal: si n es impar, la fórmula es E₂Oₙ; si n es par, se simplifica a EO(n/2). El nitrógeno con +5 da $\\mathrm{N_2O_5}$; el azufre con +6 da $\\mathrm{SO_3}$; el carbono con +4 da $\\mathrm{CO_2}$; el cloro con +7 da $\\mathrm{Cl_2O_7}$. Comprobación: en $\\mathrm{N_2O_5}$, 2 × (+5) + 5 × (−2) = 0.",
    "Casos especiales. El monóxido de carbono ($\\mathrm{CO}$, óxido de carbono (II)) es distinto del dióxido de carbono ($\\mathrm{CO_2}$). El $\\mathrm{NO}$ es el monóxido de nitrógeno y el $\\mathrm{NO_2}$, el dióxido de nitrógeno: a estos óxidos no se les aplica bien el nombre tradicional. El $\\mathrm{N_2O}$ se conoce como óxido nitroso (nombre común) o monóxido de dinitrógeno. Y el agua, $\\mathrm{H_2O}$, es en rigor el óxido de hidrógeno, pero conserva su nombre común.",
    "Errores frecuentes: confundir monóxido y dióxido de carbono (uno es venenoso y el otro es el gas que exhalamos); escribir prefijos donde no corresponde en el sistema Stock; y olvidar simplificar (SO₂ y no S₂O₄ para el azufre +4)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Óxidos básicos en los tres sistemas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{Na_2O}$",
          "óxido de sodio",
          "óxido de sodio",
          "monóxido de disodio"
        ],
        [
          "$\\mathrm{CaO}$",
          "óxido de calcio",
          "óxido de calcio",
          "monóxido de calcio"
        ],
        [
          "$\\mathrm{Al_2O_3}$",
          "óxido de aluminio",
          "óxido de aluminio",
          "trióxido de dialuminio"
        ],
        [
          "$\\mathrm{FeO}$",
          "óxido ferroso",
          "óxido de hierro (II)",
          "monóxido de hierro"
        ],
        [
          "$\\mathrm{Fe_2O_3}$",
          "óxido férrico",
          "óxido de hierro (III)",
          "trióxido de dihierro"
        ],
        [
          "$\\mathrm{Cu_2O}$",
          "óxido cuproso",
          "óxido de cobre (I)",
          "monóxido de dicobre"
        ],
        [
          "$\\mathrm{CuO}$",
          "óxido cúprico",
          "óxido de cobre (II)",
          "monóxido de cobre"
        ],
        [
          "$\\mathrm{SnO_2}$",
          "óxido estánnico",
          "óxido de estaño (IV)",
          "dióxido de estaño"
        ],
        [
          "$\\mathrm{PbO_2}$",
          "óxido plúmbico",
          "óxido de plomo (IV)",
          "dióxido de plomo"
        ],
        [
          "$\\mathrm{Au_2O_3}$",
          "óxido áurico",
          "óxido de oro (III)",
          "trióxido de dioro"
        ]
      ]
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 2,
      "cation": "Al3+",
      "anion": "O2-"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Óxidos ácidos (anhídridos) en los tres sistemas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{Cl_2O}$",
          "anhídrido hipocloroso",
          "óxido de cloro (I)",
          "monóxido de dicloro"
        ],
        [
          "$\\mathrm{Cl_2O_3}$",
          "anhídrido cloroso",
          "óxido de cloro (III)",
          "trióxido de dicloro"
        ],
        [
          "$\\mathrm{Cl_2O_5}$",
          "anhídrido clórico",
          "óxido de cloro (V)",
          "pentaóxido de dicloro"
        ],
        [
          "$\\mathrm{Cl_2O_7}$",
          "anhídrido perclórico",
          "óxido de cloro (VII)",
          "heptaóxido de dicloro"
        ],
        [
          "$\\mathrm{SO_2}$",
          "anhídrido sulfuroso",
          "óxido de azufre (IV)",
          "dióxido de azufre"
        ],
        [
          "$\\mathrm{SO_3}$",
          "anhídrido sulfúrico",
          "óxido de azufre (VI)",
          "trióxido de azufre"
        ],
        [
          "$\\mathrm{N_2O_3}$",
          "anhídrido nitroso",
          "óxido de nitrógeno (III)",
          "trióxido de dinitrógeno"
        ],
        [
          "$\\mathrm{N_2O_5}$",
          "anhídrido nítrico",
          "óxido de nitrógeno (V)",
          "pentaóxido de dinitrógeno"
        ],
        [
          "$\\mathrm{CO_2}$",
          "anhídrido carbónico",
          "óxido de carbono (IV)",
          "dióxido de carbono"
        ],
        [
          "$\\mathrm{P_2O_5}$",
          "anhídrido fosfórico",
          "óxido de fósforo (V)",
          "pentaóxido de difósforo"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del óxido de aluminio?",
      "opciones": [
        "$\\mathrm{AlO}$",
        "$\\mathrm{Al_3O_2}$",
        "$\\mathrm{Al_2O_3}$",
        "$\\mathrm{AlO_3}$"
      ],
      "respuesta": "$\\mathrm{Al_2O_3}$",
      "explicacion": "Se cruzan las cargas Al³⁺ y O²⁻: el 3 va al oxígeno y el 2 al aluminio: Al₂O₃."
    },
    {
      "pregunta": "¿Cuál es el nombre tradicional de $\\mathrm{Fe_2O_3}$?",
      "opciones": [
        "Óxido ferroso",
        "Óxido de hierro (III)",
        "Anhídrido férrico",
        "Óxido férrico"
      ],
      "respuesta": "Óxido férrico",
      "explicacion": "El hierro tiene +3, la valencia mayor: -ico. Es óxido férrico (óxido de hierro (III) en Stock)."
    },
    {
      "pregunta": "¿Cuál es el nombre tradicional de $\\mathrm{SO_3}$?",
      "opciones": [
        "Anhídrido sulfuroso",
        "Trióxido de azufre",
        "Anhídrido sulfúrico",
        "Óxido sulfúrico"
      ],
      "respuesta": "Anhídrido sulfúrico",
      "explicacion": "Es un óxido de un no metal (anhídrido) y el azufre tiene +6: el más alto lleva -ico. Anhídrido sulfúrico."
    },
    {
      "pregunta": "¿Cuál es la fórmula del anhídrido nítrico (nitrógeno +5)?",
      "opciones": [
        "$\\mathrm{NO_2}$",
        "$\\mathrm{N_2O_3}$",
        "$\\mathrm{N_2O_5}$",
        "$\\mathrm{NO_5}$"
      ],
      "respuesta": "$\\mathrm{N_2O_5}$",
      "explicacion": "Con un número de oxidación impar (+5), la fórmula es E₂Oₙ: N₂O₅."
    },
    {
      "pregunta": "¿Cuál es el nombre sistemático de $\\mathrm{Cl_2O_7}$?",
      "opciones": [
        "Heptaóxido de dicloro",
        "Monóxido de dicloro",
        "Óxido de cloro (VII)",
        "Dióxido de cloro"
      ],
      "respuesta": "Heptaóxido de dicloro",
      "explicacion": "Dos cloros y siete oxígenos: heptaóxido de dicloro."
    },
    {
      "pregunta": "¿Qué se obtiene cuando un óxido básico reacciona con agua?",
      "opciones": [
        "Un ácido",
        "Una sal",
        "Un hidróxido",
        "Un hidruro"
      ],
      "respuesta": "Un hidróxido",
      "explicacion": "Óxido básico + agua da un hidróxido (una base): CaO + H₂O → Ca(OH)₂."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-hidruros-peroxidos', 'Hidruros y peróxidos',
  'Hidruros metálicos y no metálicos, con sus nombres comunes, y peróxidos: fórmula y nomenclatura.',
  'quimia',
  $quimia${
  "pasos": [
    "Un hidruro es un compuesto de hidrógeno con otro elemento. El número de oxidación del hidrógeno depende de con quién se une: si el otro elemento es menos electronegativo (un metal), el hidrógeno es −1; si es más electronegativo, el hidrógeno es +1. Por ejemplo, el sodio (0,93) es menos electronegativo que el hidrógeno (2,20), pero el nitrógeno (3,04) es más.",
    "Hidruros metálicos (metal + hidrógeno, con H = −1). Se forman así: $\\mathrm{2Na + H_2}\\rightarrow\\mathrm{2NaH}$ $\\mathrm{Ca + H_2}\\rightarrow\\mathrm{CaH_2}$ La fórmula sale de cruzar las cargas del metal con la del $\\mathrm{H^{-}}$: $\\mathrm{NaH}$, $\\mathrm{CaH_2}$, $\\mathrm{AlH_3}$.",
    "Nombres de los hidruros metálicos: «hidruro de» + el metal (con -oso o -ico o número romano si tiene varias valencias) y, en el sistemático, con prefijos. La tabla los muestra.",
    "Hidruros no metálicos (con el hidrógeno en +1). Los de los grupos 13, 14 y 15 tienen nombres comunes que son los que se usan: el metano (CH₄), el amoníaco (NH₃), la fosfina (PH₃), el silano (SiH₄) y el diborano (B₂H₆). No se nombran con las reglas de sales. Los de los grupos 16 y 17 son el agua y los hidrácidos (HCl, H₂S...), que se ven en la clase de ácidos.",
    "Se forman a partir de los elementos: $\\mathrm{N_2 + 3H_2}\\rightarrow\\mathrm{2NH_3}$ $\\mathrm{2H_2 + O_2}\\rightarrow\\mathrm{2H_2O}$ $\\mathrm{C + 2H_2}\\rightarrow\\mathrm{CH_4}$",
    "Peróxidos. Contienen el ion peróxido $\\mathrm{O_2^{2-}}$, dos oxígenos unidos, en el que cada oxígeno tiene número de oxidación −1 (en los óxidos es −2). Se nombran «peróxido de» + el metal: $\\mathrm{Na_2O_2}$ es peróxido de sodio, $\\mathrm{BaO_2}$ es peróxido de bario, $\\mathrm{CaO_2}$ es peróxido de calcio. El más conocido es el $\\mathrm{H_2O_2}$, el peróxido de hidrógeno (agua oxigenada).",
    "Cuidado con no simplificar mal: el peróxido de sodio es $\\mathrm{Na_2O_2}$ y no NaO, porque los dos oxígenos van juntos. Al cruzar las cargas de $\\mathrm{Na^{+}}$ y $\\mathrm{O_2^{2-}}$ da $\\mathrm{Na_2O_2}$. Los de metales con carga +2 (como Ca) se simplifican y quedan $\\mathrm{CaO_2}$.",
    "Se forman al reaccionar algunos metales muy activos con exceso de oxígeno, y se descomponen liberando oxígeno: $\\mathrm{2Na + O_2}\\rightarrow\\mathrm{Na_2O_2}$ $\\mathrm{2H_2O_2}\\rightarrow\\mathrm{2H_2O + O_2}$ Por eso el agua oxigenada burbujea en una herida.",
    "Error frecuente: confundir óxido con peróxido. El óxido de calcio (CaO) tiene O²⁻ y el peróxido de calcio (CaO₂) tiene O₂²⁻. También se confunde el hidruro (H es −1) con los compuestos donde el H es +1, como el agua o el amoníaco."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Hidruros metálicos en los tres sistemas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{NaH}$",
          "hidruro de sodio",
          "hidruro de sodio",
          "monohidruro de sodio"
        ],
        [
          "$\\mathrm{CaH_2}$",
          "hidruro de calcio",
          "hidruro de calcio",
          "dihidruro de calcio"
        ],
        [
          "$\\mathrm{AlH_3}$",
          "hidruro de aluminio",
          "hidruro de aluminio",
          "trihidruro de aluminio"
        ],
        [
          "$\\mathrm{FeH_2}$",
          "hidruro ferroso",
          "hidruro de hierro (II)",
          "dihidruro de hierro"
        ],
        [
          "$\\mathrm{FeH_3}$",
          "hidruro férrico",
          "hidruro de hierro (III)",
          "trihidruro de hierro"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Hidruros no metálicos: nombres comunes",
      "columnas": [
        "Fórmula",
        "Nombre",
        "Grupo del no metal"
      ],
      "filas": [
        [
          "$\\mathrm{B_2H_6}$",
          "diborano",
          "13"
        ],
        [
          "$\\mathrm{CH_4}$",
          "metano",
          "14"
        ],
        [
          "$\\mathrm{SiH_4}$",
          "silano",
          "14"
        ],
        [
          "$\\mathrm{NH_3}$",
          "amoníaco",
          "15"
        ],
        [
          "$\\mathrm{PH_3}$",
          "fosfina",
          "15"
        ],
        [
          "$\\mathrm{H_2O}$",
          "agua",
          "16"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Peróxidos",
      "columnas": [
        "Fórmula",
        "Nombre",
        "N.º de oxidación del oxígeno"
      ],
      "filas": [
        [
          "$\\mathrm{Na_2O_2}$",
          "peróxido de sodio",
          "$\\overset{-1}{\\mathrm{O}}$"
        ],
        [
          "$\\mathrm{CaO_2}$",
          "peróxido de calcio",
          "$\\overset{-1}{\\mathrm{O}}$"
        ],
        [
          "$\\mathrm{BaO_2}$",
          "peróxido de bario",
          "$\\overset{-1}{\\mathrm{O}}$"
        ],
        [
          "$\\mathrm{H_2O_2}$",
          "peróxido de hidrógeno",
          "$\\overset{-1}{\\mathrm{O}}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué número de oxidación tiene el hidrógeno en $\\mathrm{CaH_2}$?",
      "opciones": [
        "+1",
        "0",
        "−1",
        "+2"
      ],
      "respuesta": "−1",
      "explicacion": "El calcio es un metal (menos electronegativo que el H), así que el hidrógeno es −1: es un hidruro metálico."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{NaH}$?",
      "opciones": [
        "Peróxido de sodio",
        "Hidróxido de sodio",
        "Hidruro de sodio",
        "Sodio de hidrógeno"
      ],
      "respuesta": "Hidruro de sodio",
      "explicacion": "Es un hidruro metálico: hidruro de sodio."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{Na_2O_2}$?",
      "opciones": [
        "Óxido de sodio",
        "Dióxido de sodio",
        "Óxido de sodio (II)",
        "Peróxido de sodio"
      ],
      "respuesta": "Peróxido de sodio",
      "explicacion": "Contiene el ion peróxido O₂²⁻: peróxido de sodio."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el oxígeno en un peróxido?",
      "opciones": [
        "−2",
        "−1",
        "0",
        "+1"
      ],
      "respuesta": "−1",
      "explicacion": "En el ion peróxido, O₂²⁻, cada oxígeno tiene −1."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{H_2O_2}$?",
      "opciones": [
        "Óxido de hidrógeno",
        "Peróxido de hidrógeno (agua oxigenada)",
        "Hidruro de oxígeno",
        "Ácido peróxico"
      ],
      "respuesta": "Peróxido de hidrógeno (agua oxigenada)",
      "explicacion": "Es el peróxido de hidrógeno, conocido como agua oxigenada."
    },
    {
      "pregunta": "¿Cómo se llama el $\\mathrm{NH_3}$ en el uso corriente?",
      "opciones": [
        "Amoníaco",
        "Amonio",
        "Nitruro de hidrógeno",
        "Hidróxido de nitrógeno"
      ],
      "respuesta": "Amoníaco",
      "explicacion": "Su nombre común (y aceptado) es amoníaco. No confundir con el ion amonio, NH₄⁺."
    }
  ]
}$quimia$::jsonb,
  3,
  true),

('quimia-clase-hidroxidos', 'Hidróxidos (bases)',
  'Qué son, cómo se forman, se escriben y se nombran los hidróxidos, y ejemplos de la vida diaria.',
  'quimia',
  $quimia${
  "pasos": [
    "Un hidróxido, o base, tiene el ion hidróxido $\\mathrm{OH^{-}}$ unido a un metal (o al ion amonio). Su fórmula general es M(OH)ₙ, donde n es la carga del metal. Al disolverse en agua liberan iones OH⁻, tienen tacto jabonoso y son corrosivos (nunca se prueban ni se tocan sin protección), viran la fenolftaleína a rosado intenso y el papel tornasol rojo a azul.",
    "Se forman de dos maneras. Un óxido básico con agua: $\\mathrm{Na_2O + H_2O}\\rightarrow\\mathrm{2NaOH}$ $\\mathrm{CaO + H_2O}\\rightarrow\\mathrm{Ca(OH)_2}$ $\\mathrm{Fe_2O_3 + 3H_2O}\\rightarrow\\mathrm{2Fe(OH)_3}$ O un metal muy activo con agua, que además libera hidrógeno: $\\mathrm{2Na + 2H_2O}\\rightarrow\\mathrm{2NaOH + H_2}$",
    "Cómo se escribe la fórmula: se cruzan las cargas del metal con la del OH ($\\mathrm{OH^{-}}$). $\\mathrm{Na^{+}}$ da $\\mathrm{NaOH}$; $\\mathrm{Ca^{2+}}$ da $\\mathrm{Ca(OH)_2}$; $\\mathrm{Al^{3+}}$ da $\\mathrm{Al(OH)_3}$. El OH va entre paréntesis solo cuando el subíndice es mayor que 1.",
    "Cómo se nombra: tradicional, «hidróxido de» + el metal (o «hidróxido ferroso», «hidróxido férrico» si tiene dos valencias); Stock, «hidróxido de» + el metal con su número romano; sistemático, con prefijos delante de «hidróxido» (dihidróxido de calcio).",
    "Ejemplo resuelto: $\\mathrm{Fe(OH)_3}$. Hay 3 OH⁻ (carga −3), así que el hierro es +3. Tradicional: hidróxido férrico; Stock: hidróxido de hierro (III); sistemático: trihidróxido de hierro. Y $\\mathrm{Fe(OH)_2}$ tiene 2 OH⁻: hierro +2, hidróxido de hierro (II).",
    "El hidróxido de amonio, $\\mathrm{NH_4OH}$, es el nombre que se usa en el colegio y en las etiquetas para la solución de amoníaco en agua. En rigor, ese compuesto no existe aislado: lo que hay es amoníaco disuelto, que en parte se convierte en iones: $\\mathrm{NH_3 + H_2O \\rightleftharpoons NH_4^+ + OH^-}$.",
    "Hidróxidos de uso cotidiano: la soda cáustica (NaOH) destapa cañerías y se usa para fabricar jabón; la cal apagada (Ca(OH)₂) se usa en la construcción; la leche de magnesia (Mg(OH)₂) es un antiácido; y el hidróxido de aluminio (Al(OH)₃) también se usa en antiácidos.",
    "Errores frecuentes: escribir CaOH₂ en lugar de Ca(OH)₂; escribir Na(OH) con un paréntesis innecesario; y confundir el ion hidróxido, OH⁻, con el agua, H₂O. Para saber la carga del metal, mira el número romano del nombre o cuenta los OH de la fórmula."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Hidróxidos en los tres sistemas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{NaOH}$",
          "hidróxido de sodio",
          "hidróxido de sodio",
          "monohidróxido de sodio"
        ],
        [
          "$\\mathrm{KOH}$",
          "hidróxido de potasio",
          "hidróxido de potasio",
          "monohidróxido de potasio"
        ],
        [
          "$\\mathrm{Ca(OH)_2}$",
          "hidróxido de calcio",
          "hidróxido de calcio",
          "dihidróxido de calcio"
        ],
        [
          "$\\mathrm{Mg(OH)_2}$",
          "hidróxido de magnesio",
          "hidróxido de magnesio",
          "dihidróxido de magnesio"
        ],
        [
          "$\\mathrm{Al(OH)_3}$",
          "hidróxido de aluminio",
          "hidróxido de aluminio",
          "trihidróxido de aluminio"
        ],
        [
          "$\\mathrm{Zn(OH)_2}$",
          "hidróxido de zinc",
          "hidróxido de zinc",
          "dihidróxido de zinc"
        ],
        [
          "$\\mathrm{Fe(OH)_2}$",
          "hidróxido ferroso",
          "hidróxido de hierro (II)",
          "dihidróxido de hierro"
        ],
        [
          "$\\mathrm{Fe(OH)_3}$",
          "hidróxido férrico",
          "hidróxido de hierro (III)",
          "trihidróxido de hierro"
        ],
        [
          "$\\mathrm{Cu(OH)_2}$",
          "hidróxido cúprico",
          "hidróxido de cobre (II)",
          "dihidróxido de cobre"
        ]
      ]
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 2,
      "cation": "Al3+",
      "anion": "OH-"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Hidróxidos de la vida diaria",
      "columnas": [
        "Fórmula",
        "Nombre",
        "Nombre común"
      ],
      "filas": [
        [
          "$\\mathrm{NaOH}$",
          "hidróxido de sodio",
          "soda cáustica"
        ],
        [
          "$\\mathrm{KOH}$",
          "hidróxido de potasio",
          "potasa cáustica"
        ],
        [
          "$\\mathrm{Ca(OH)_2}$",
          "hidróxido de calcio",
          "cal apagada"
        ],
        [
          "$\\mathrm{Mg(OH)_2}$",
          "hidróxido de magnesio",
          "leche de magnesia"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del hidróxido de calcio?",
      "opciones": [
        "$\\mathrm{Ca(OH)_2}$",
        "$\\mathrm{CaOH}$",
        "$\\mathrm{CaOH_2}$",
        "$\\mathrm{Ca_2OH}$"
      ],
      "respuesta": "$\\mathrm{Ca(OH)_2}$",
      "explicacion": "El calcio es +2 y el OH es −1: se necesitan dos OH, que van entre paréntesis: Ca(OH)₂."
    },
    {
      "pregunta": "¿Cuál es el nombre Stock de $\\mathrm{Fe(OH)_3}$?",
      "opciones": [
        "Hidróxido de hierro (II)",
        "Hidróxido de hierro (III)",
        "Hidróxido férrico",
        "Trihidróxido de hierro"
      ],
      "respuesta": "Hidróxido de hierro (III)",
      "explicacion": "Tres OH⁻ suman −3, así que el hierro es +3: hidróxido de hierro (III)."
    },
    {
      "pregunta": "¿Cuál es el nombre tradicional de $\\mathrm{Cu(OH)_2}$?",
      "opciones": [
        "Hidróxido cuproso",
        "Hidróxido de cobre (II)",
        "Hidróxido de cobre",
        "Hidróxido cúprico"
      ],
      "respuesta": "Hidróxido cúprico",
      "explicacion": "El Cu(OH)₂ tiene cobre +2, la valencia mayor: -ico. Es hidróxido cúprico (y el CuOH, con cobre +1, sería el cuproso)."
    },
    {
      "pregunta": "¿Qué se obtiene al mezclar el óxido de calcio ($\\mathrm{CaO}$) con agua?",
      "opciones": [
        "$\\mathrm{Ca(OH)_2}$",
        "$\\mathrm{CaH_2}$",
        "$\\mathrm{CaCO_3}$",
        "$\\mathrm{Ca_2O_2}$"
      ],
      "respuesta": "$\\mathrm{Ca(OH)_2}$",
      "explicacion": "Óxido básico + agua da hidróxido: CaO + H₂O → Ca(OH)₂ (cal viva + agua = cal apagada)."
    },
    {
      "pregunta": "¿Cómo se comporta una base frente a la fenolftaleína?",
      "opciones": [
        "Queda incolora",
        "Vira a rosado intenso",
        "Vira a amarillo",
        "Se vuelve verde"
      ],
      "respuesta": "Vira a rosado intenso",
      "explicacion": "Las bases viran la fenolftaleína a rosado o fucsia; en un ácido queda incolora."
    }
  ]
}$quimia$::jsonb,
  4,
  true),

('quimia-clase-acidos', 'Ácidos: hidrácidos y oxoácidos',
  'Cómo se forman, se escriben y se nombran los ácidos sin oxígeno y con oxígeno, y qué aniones producen.',
  'quimia',
  $quimia${
  "pasos": [
    "Un ácido es una sustancia que, disuelta en agua, libera iones hidrógeno (H⁺). Tienen sabor agrio (no se prueban), viran el papel tornasol azul a rojo y reaccionan con muchos metales liberando hidrógeno. Hay dos tipos: los hidrácidos (hidrógeno + un no metal, sin oxígeno) y los oxoácidos u oxácidos (hidrógeno + un no metal + oxígeno).",
    "Hidrácidos. Su fórmula es HₙX, donde X es un halógeno (F, Cl, Br, I) o un elemento del grupo 16 (S, Se, Te). Se forman a partir de los elementos y se disuelven en agua: $\\mathrm{H_2 + Cl_2}\\rightarrow\\mathrm{2HCl}$ $\\mathrm{H_2 + S}\\rightarrow\\mathrm{H_2S}$ Con el grupo 17 (carga −1) hay 1 H; con el grupo 16 (carga −2) hay 2 H.",
    "Nombres de los hidrácidos: disueltos en agua se llaman «ácido» + la raíz del no metal + «hídrico»: ácido clorhídrico. Como gas puro se usa el nombre de la sal: cloruro de hidrógeno. Ojo: $\\mathrm{HCl}$ es el gas y «ácido clorhídrico» es su solución en agua.",
    "Oxoácidos. Su fórmula general es H_aX_bO_c. Se forman cuando un óxido ácido (anhídrido) reacciona con agua, así que una forma práctica de escribirlos es sumar el anhídrido y una molécula de agua y simplificar: $\\mathrm{SO_3 + H_2O}\\rightarrow\\mathrm{H_2SO_4}$ $\\mathrm{CO_2 + H_2O}\\rightarrow\\mathrm{H_2CO_3}$ $\\mathrm{N_2O_5 + H_2O}\\rightarrow\\mathrm{2HNO_3}$ $\\mathrm{Cl_2O + H_2O}\\rightarrow\\mathrm{2HClO}$",
    "Nomenclatura tradicional: «ácido» + el nombre del anhídrido con la misma terminación. Los halógenos dan cuatro ácidos, de menos a más oxígeno: hipo…oso (HClO), …oso (HClO₂), …ico (HClO₃) y per…ico (HClO₄). El azufre da dos: sulfuroso (H₂SO₃) y sulfúrico (H₂SO₄). El nitrógeno también dos: nitroso (HNO₂) y nítrico (HNO₃). El carbono da el carbónico (H₂CO₃).",
    "Una regla para escribir la fórmula sin memorizar: si el número de oxidación del no metal es impar, el ácido es HXO((n+1)/2); si es par, es H₂XO((n+2)/2). Así, cloro +5 da HClO₃, azufre +6 da H₂SO₄ y azufre +4 da H₂SO₃. Esta regla da el ácido más simple; el fósforo y el boro forman otros más hidratados: el más común del fósforo (+5) es el H₃PO₄, el ácido fosfórico (u ortofosfórico), y el del boro, el H₃BO₃.",
    "También existen nombres sistemáticos y Stock de los oxoácidos (por ejemplo, «tetraoxosulfato (VI) de hidrógeno» para el H₂SO₄), pero se usan poco: el nombre tradicional es el que se emplea en la práctica y es el que la IUPAC mantiene como aceptado para los ácidos más comunes.",
    "Cuando un ácido pierde sus H⁺ queda un anión, y esos aniones forman las sales. La terminación cambia: «-hídrico» pasa a «-uro», «-ico» pasa a «-ato» y «-oso» pasa a «-ito», y los prefijos hipo- y per- se conservan. La carga del anión es negativa e igual a la cantidad de H⁺ perdidos: el ácido nítrico (1 H) da NO₃⁻; el sulfúrico (2 H), SO₄²⁻; el fosfórico (3 H), PO₄³⁻.",
    "Errores frecuentes: confundir ácido clorhídrico (HCl, sin oxígeno) con ácido clórico (HClO₃, con oxígeno); escribir el H al final de la fórmula; y olvidar que el gas HCl y su solución tienen nombres distintos. El «ácido muriático» que se vende para limpiar es una solución diluida e impura de HCl."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Hidrácidos",
      "columnas": [
        "Fórmula",
        "Disuelto en agua",
        "Gas puro"
      ],
      "filas": [
        [
          "$\\mathrm{HF}$",
          "ácido fluorhídrico",
          "fluoruro de hidrógeno"
        ],
        [
          "$\\mathrm{HCl}$",
          "ácido clorhídrico",
          "cloruro de hidrógeno"
        ],
        [
          "$\\mathrm{HBr}$",
          "ácido bromhídrico",
          "bromuro de hidrógeno"
        ],
        [
          "$\\mathrm{HI}$",
          "ácido yodhídrico",
          "yoduro de hidrógeno"
        ],
        [
          "$\\mathrm{H_2S}$",
          "ácido sulfhídrico",
          "sulfuro de hidrógeno"
        ],
        [
          "$\\mathrm{H_2Se}$",
          "ácido selenhídrico",
          "seleniuro de hidrógeno"
        ],
        [
          "$\\mathrm{H_2Te}$",
          "ácido telurhídrico",
          "telururo de hidrógeno"
        ],
        [
          "$\\mathrm{HCN}$",
          "ácido cianhídrico",
          "cianuro de hidrógeno"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "Oxoácidos",
      "columnas": [
        "Fórmula",
        "N.º de oxidación del no metal",
        "Nombre",
        "Anhídrido"
      ],
      "filas": [
        [
          "$\\mathrm{HClO}$",
          "+1",
          "ácido hipocloroso",
          "$\\mathrm{Cl_2O}$"
        ],
        [
          "$\\mathrm{HClO_2}$",
          "+3",
          "ácido cloroso",
          "$\\mathrm{Cl_2O_3}$"
        ],
        [
          "$\\mathrm{HClO_3}$",
          "+5",
          "ácido clórico",
          "$\\mathrm{Cl_2O_5}$"
        ],
        [
          "$\\mathrm{HClO_4}$",
          "+7",
          "ácido perclórico",
          "$\\mathrm{Cl_2O_7}$"
        ],
        [
          "$\\mathrm{H_2SO_3}$",
          "+4",
          "ácido sulfuroso",
          "$\\mathrm{SO_2}$"
        ],
        [
          "$\\mathrm{H_2SO_4}$",
          "+6",
          "ácido sulfúrico",
          "$\\mathrm{SO_3}$"
        ],
        [
          "$\\mathrm{HNO_2}$",
          "+3",
          "ácido nitroso",
          "$\\mathrm{N_2O_3}$"
        ],
        [
          "$\\mathrm{HNO_3}$",
          "+5",
          "ácido nítrico",
          "$\\mathrm{N_2O_5}$"
        ],
        [
          "$\\mathrm{H_2CO_3}$",
          "+4",
          "ácido carbónico",
          "$\\mathrm{CO_2}$"
        ],
        [
          "$\\mathrm{H_3PO_4}$",
          "+5",
          "ácido fosfórico",
          "$\\mathrm{P_2O_5}$"
        ],
        [
          "$\\mathrm{H_2SiO_3}$",
          "+4",
          "ácido silícico",
          "$\\mathrm{SiO_2}$"
        ],
        [
          "$\\mathrm{H_3BO_3}$",
          "+3",
          "ácido bórico",
          "$\\mathrm{B_2O_3}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "De ácido a anión",
      "columnas": [
        "Ácido",
        "Anión",
        "Carga"
      ],
      "filas": [
        [
          "$\\mathrm{HClO}$ ácido hipocloroso",
          "hipoclorito",
          "$\\mathrm{ClO^{-}}$"
        ],
        [
          "$\\mathrm{HClO_3}$ ácido clórico",
          "clorato",
          "$\\mathrm{ClO_3^{-}}$"
        ],
        [
          "$\\mathrm{HClO_4}$ ácido perclórico",
          "perclorato",
          "$\\mathrm{ClO_4^{-}}$"
        ],
        [
          "$\\mathrm{H_2SO_3}$ ácido sulfuroso",
          "sulfito",
          "$\\mathrm{SO_3^{2-}}$"
        ],
        [
          "$\\mathrm{H_2SO_4}$ ácido sulfúrico",
          "sulfato",
          "$\\mathrm{SO_4^{2-}}$"
        ],
        [
          "$\\mathrm{HNO_2}$ ácido nitroso",
          "nitrito",
          "$\\mathrm{NO_2^{-}}$"
        ],
        [
          "$\\mathrm{HNO_3}$ ácido nítrico",
          "nitrato",
          "$\\mathrm{NO_3^{-}}$"
        ],
        [
          "$\\mathrm{H_2CO_3}$ ácido carbónico",
          "carbonato",
          "$\\mathrm{CO_3^{2-}}$"
        ],
        [
          "$\\mathrm{H_3PO_4}$ ácido fosfórico",
          "fosfato",
          "$\\mathrm{PO_4^{3-}}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se llama el $\\mathrm{HCl}$ disuelto en agua?",
      "opciones": [
        "Ácido clórico",
        "Ácido clorhídrico",
        "Ácido hipocloroso",
        "Cloruro de hidrógeno"
      ],
      "respuesta": "Ácido clorhídrico",
      "explicacion": "Los hidrácidos disueltos en agua se llaman «ácido …hídrico»: ácido clorhídrico. El gas puro es el cloruro de hidrógeno."
    },
    {
      "pregunta": "¿Cuál es la fórmula del ácido sulfúrico?",
      "opciones": [
        "$\\mathrm{H_2SO_3}$",
        "$\\mathrm{HSO_4}$",
        "$\\mathrm{H_2S}$",
        "$\\mathrm{H_2SO_4}$"
      ],
      "respuesta": "$\\mathrm{H_2SO_4}$",
      "explicacion": "Se forma con SO₃ + H₂O: H₂SO₄. El H₂SO₃ es el sulfuroso y el H₂S es el sulfhídrico."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{HNO_3}$?",
      "opciones": [
        "Ácido nítrico",
        "Ácido nitroso",
        "Ácido hiponitroso",
        "Nitrato de hidrógeno"
      ],
      "respuesta": "Ácido nítrico",
      "explicacion": "El nitrógeno tiene +5 (el más alto): terminación -ico. Es el ácido nítrico."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{HClO_4}$?",
      "opciones": [
        "Ácido hipocloroso",
        "Ácido perclórico",
        "Ácido clórico",
        "Ácido cloroso"
      ],
      "respuesta": "Ácido perclórico",
      "explicacion": "Con el cloro en +7 (el más alto) y 4 oxígenos: ácido perclórico."
    },
    {
      "pregunta": "¿Qué anión resulta cuando el ácido sulfúrico pierde sus dos H⁺?",
      "opciones": [
        "Sulfito",
        "Sulfato",
        "Sulfuro",
        "Hidrógeno sulfato"
      ],
      "respuesta": "Sulfato",
      "explicacion": "El ácido termina en -ico, así que el anión termina en -ato: sulfato, SO₄²⁻."
    },
    {
      "pregunta": "¿Cuál es la fórmula del ácido fosfórico?",
      "opciones": [
        "$\\mathrm{HPO_4}$",
        "$\\mathrm{H_2PO_3}$",
        "$\\mathrm{H_3PO_4}$",
        "$\\mathrm{H_3P}$"
      ],
      "respuesta": "$\\mathrm{H_3PO_4}$",
      "explicacion": "El fosfórico es el ácido del fósforo +5 en su forma más común: H₃PO₄."
    }
  ]
}$quimia$::jsonb,
  5,
  true),

('quimia-clase-sales-binarias-oxisales', 'Sales binarias y oxisales',
  'Sales de ácidos con y sin oxígeno: cómo se forman, se escriben y se nombran, y cómo deducir la carga del metal.',
  'quimia',
  $quimia${
  "pasos": [
    "Una sal es un compuesto iónico que resulta de reemplazar los H⁺ de un ácido por un catión metálico (o por el amonio). Se obtienen por neutralización, la reacción entre un ácido y un hidróxido, que forma la sal y agua: $\\mathrm{HCl + NaOH}\\rightarrow\\mathrm{NaCl + H_2O}$ $\\mathrm{H_2SO_4 + Ca(OH)_2}\\rightarrow\\mathrm{CaSO_4 + 2H_2O}$ $\\mathrm{2HNO_3 + Mg(OH)_2}\\rightarrow\\mathrm{Mg(NO_3)_2 + 2H_2O}$",
    "Sales binarias (sin oxígeno). Vienen de los hidrácidos: metal + no metal. El no metal lleva la terminación «-uro»: cloruro, bromuro, yoduro, fluoruro, sulfuro. Se nombran «[no metal]uro de [metal]» y, si el metal tiene varias valencias, con -oso/-ico o número romano.",
    "Fórmula: se cruzan las cargas del metal con las del no metal. $\\mathrm{Mg^{2+}}$ con $\\mathrm{Cl^{-}}$ da $\\mathrm{MgCl_2}$; $\\mathrm{Al^{3+}}$ con $\\mathrm{Cl^{-}}$ da $\\mathrm{AlCl_3}$; $\\mathrm{Fe^{3+}}$ con $\\mathrm{S^{2-}}$ da $\\mathrm{Fe_2S_3}$.",
    "Compuestos binarios de dos no metales (moleculares) se nombran con el sistema de prefijos: el elemento más electronegativo va al final con «-uro» y se nombra primero, y el otro va después de «de». Por ejemplo, el CCl₄ es el tetracloruro de carbono, y el PCl₅ el pentacloruro de fósforo.",
    "Oxisales u oxosales (ternarias: metal + no metal + oxígeno). Vienen de los oxoácidos. El anión cambia su terminación: ácido «-ico» da «-ato» y ácido «-oso» da «-ito», con hipo- y per- conservados. Se nombran «[anión] de [metal]». Por ejemplo, $\\mathrm{H_2SO_4}$ da sulfato, $\\mathrm{HNO_2}$ da nitrito, $\\mathrm{HClO}$ da hipoclorito y $\\mathrm{HClO_4}$ da perclorato.",
    "Fórmula: se cruzan las cargas del metal con la del anión poliatómico, y el anión va entre paréntesis si su subíndice es mayor que 1. $\\mathrm{Al^{3+}}$ con $\\mathrm{SO_4^{2-}}$ da $\\mathrm{Al_2(SO_4)_3}$; $\\mathrm{Ca^{2+}}$ con $\\mathrm{PO_4^{3-}}$ da $\\mathrm{Ca_3(PO_4)_2}$; $\\mathrm{Cu^{2+}}$ con $\\mathrm{NO_3^{-}}$ da $\\mathrm{Cu(NO_3)_2}$.",
    "Cómo deducir la carga de un metal con varias valencias a partir de la fórmula. En $\\mathrm{FeSO_4}$ hay un sulfato (−2), así que el hierro es +2: sulfato de hierro (II) o sulfato ferroso. En $\\mathrm{Fe_2(SO_4)_3}$ hay tres sulfatos (−6) repartidos entre 2 hierros: cada uno es +3: sulfato de hierro (III) o sulfato férrico. En $\\mathrm{Cu(NO_3)_2}$ hay dos nitratos (−2) para un cobre: +2, nitrato de cobre (II).",
    "El proceso inverso, de nombre a fórmula: para el «sulfato de hierro (III)», el romano dice que el hierro es +3 y el sulfato es SO₄²⁻; al cruzar sale $\\mathrm{Fe_2(SO_4)_3}$. Y para «fosfato de calcio», calcio es +2 y fosfato es PO₄³⁻: $\\mathrm{Ca_3(PO_4)_2}$.",
    "Sales que se usan a diario: la sal común (cloruro de sodio, NaCl), la piedra caliza y el mármol (carbonato de calcio, CaCO₃), la lavandina (una solución de hipoclorito de sodio, NaClO) y los fertilizantes (nitrato de amonio, NH₄NO₃; fosfato de calcio).",
    "Errores frecuentes: confundir -ato con -ito (el sulfato SO₄²⁻ tiene un oxígeno más que el sulfito SO₃²⁻); olvidar el paréntesis en Ca₃(PO₄)₂; confundir cloruro (Cl⁻, sin oxígeno) con clorato (ClO₃⁻, con oxígeno); y olvidar que el número romano del metal se deduce de la fórmula."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Sales binarias en los tres sistemas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock",
        "Sistemática"
      ],
      "filas": [
        [
          "$\\mathrm{NaCl}$",
          "cloruro de sodio",
          "cloruro de sodio",
          "monocloruro de sodio"
        ],
        [
          "$\\mathrm{KBr}$",
          "bromuro de potasio",
          "bromuro de potasio",
          "monobromuro de potasio"
        ],
        [
          "$\\mathrm{CaF_2}$",
          "fluoruro de calcio",
          "fluoruro de calcio",
          "difluoruro de calcio"
        ],
        [
          "$\\mathrm{AlCl_3}$",
          "cloruro de aluminio",
          "cloruro de aluminio",
          "tricloruro de aluminio"
        ],
        [
          "$\\mathrm{FeCl_2}$",
          "cloruro ferroso",
          "cloruro de hierro (II)",
          "dicloruro de hierro"
        ],
        [
          "$\\mathrm{FeCl_3}$",
          "cloruro férrico",
          "cloruro de hierro (III)",
          "tricloruro de hierro"
        ],
        [
          "$\\mathrm{CuCl_2}$",
          "cloruro cúprico",
          "cloruro de cobre (II)",
          "dicloruro de cobre"
        ],
        [
          "$\\mathrm{Na_2S}$",
          "sulfuro de sodio",
          "sulfuro de sodio",
          "monosulfuro de disodio"
        ],
        [
          "$\\mathrm{Fe_2S_3}$",
          "sulfuro férrico",
          "sulfuro de hierro (III)",
          "trisulfuro de dihierro"
        ],
        [
          "$\\mathrm{Mg_3N_2}$",
          "nitruro de magnesio",
          "nitruro de magnesio",
          "dinitruro de trimagnesio"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Compuestos binarios de dos no metales",
      "columnas": [
        "Fórmula",
        "Nombre"
      ],
      "filas": [
        [
          "$\\mathrm{CCl_4}$",
          "tetracloruro de carbono"
        ],
        [
          "$\\mathrm{PCl_3}$",
          "tricloruro de fósforo"
        ],
        [
          "$\\mathrm{PCl_5}$",
          "pentacloruro de fósforo"
        ],
        [
          "$\\mathrm{CS_2}$",
          "disulfuro de carbono"
        ],
        [
          "$\\mathrm{SF_6}$",
          "hexafluoruro de azufre"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "Oxisales: -ato, -ito, hipo-, per-",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock"
      ],
      "filas": [
        [
          "$\\mathrm{Na_2SO_4}$",
          "sulfato de sodio",
          "sulfato de sodio"
        ],
        [
          "$\\mathrm{Na_2SO_3}$",
          "sulfito de sodio",
          "sulfito de sodio"
        ],
        [
          "$\\mathrm{KNO_3}$",
          "nitrato de potasio",
          "nitrato de potasio"
        ],
        [
          "$\\mathrm{NaNO_2}$",
          "nitrito de sodio",
          "nitrito de sodio"
        ],
        [
          "$\\mathrm{Na_3PO_4}$",
          "fosfato de sodio",
          "fosfato de sodio"
        ],
        [
          "$\\mathrm{NaClO}$",
          "hipoclorito de sodio",
          "hipoclorito de sodio"
        ],
        [
          "$\\mathrm{NaClO_2}$",
          "clorito de sodio",
          "clorito de sodio"
        ],
        [
          "$\\mathrm{KClO_3}$",
          "clorato de potasio",
          "clorato de potasio"
        ],
        [
          "$\\mathrm{KClO_4}$",
          "perclorato de potasio",
          "perclorato de potasio"
        ],
        [
          "$\\mathrm{KMnO_4}$",
          "permanganato de potasio",
          "permanganato de potasio"
        ],
        [
          "$\\mathrm{CaCO_3}$",
          "carbonato de calcio",
          "carbonato de calcio"
        ]
      ]
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 5,
      "cation": "Al3+",
      "anion": "SO4^2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 5,
      "cation": "Ca2+",
      "anion": "PO4^3-"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Deducir la carga del metal",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "Stock"
      ],
      "filas": [
        [
          "$\\mathrm{FeSO_4}$",
          "sulfato ferroso",
          "sulfato de hierro (II)"
        ],
        [
          "$\\mathrm{Fe_2(SO_4)_3}$",
          "sulfato férrico",
          "sulfato de hierro (III)"
        ],
        [
          "$\\mathrm{CuSO_4}$",
          "sulfato cúprico",
          "sulfato de cobre (II)"
        ],
        [
          "$\\mathrm{Cu(NO_3)_2}$",
          "nitrato cúprico",
          "nitrato de cobre (II)"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del sulfato de aluminio?",
      "opciones": [
        "$\\mathrm{AlSO_4}$",
        "$\\mathrm{Al_2SO_4}$",
        "$\\mathrm{Al_3(SO_4)_2}$",
        "$\\mathrm{Al_2(SO_4)_3}$"
      ],
      "respuesta": "$\\mathrm{Al_2(SO_4)_3}$",
      "explicacion": "Al³⁺ y SO₄²⁻: el 3 va al sulfato y el 2 al aluminio; el sulfato lleva paréntesis porque su subíndice es 3: Al₂(SO₄)₃."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{Na_2SO_3}$?",
      "opciones": [
        "Sulfato de sodio",
        "Sulfito de sodio",
        "Sulfuro de sodio",
        "Sulfato ácido de sodio"
      ],
      "respuesta": "Sulfito de sodio",
      "explicacion": "Viene del ácido sulfuroso (-oso), y -oso pasa a -ito: sulfito de sodio."
    },
    {
      "pregunta": "¿Cuál es el nombre Stock de $\\mathrm{Cu(NO_3)_2}$?",
      "opciones": [
        "Nitrato de cobre (I)",
        "Nitrato de cobre (II)",
        "Nitrito de cobre (II)",
        "Nitruro de cobre (II)"
      ],
      "respuesta": "Nitrato de cobre (II)",
      "explicacion": "Dos nitratos (−2) para un cobre: el cobre es +2. Nitrato de cobre (II)."
    },
    {
      "pregunta": "¿Cuál es la fórmula del hipoclorito de sodio?",
      "opciones": [
        "$\\mathrm{NaClO_2}$",
        "$\\mathrm{NaClO_3}$",
        "$\\mathrm{NaCl}$",
        "$\\mathrm{NaClO}$"
      ],
      "respuesta": "$\\mathrm{NaClO}$",
      "explicacion": "Hipoclorito viene del ácido hipocloroso (HClO), el de menos oxígeno: ClO⁻. Con Na⁺ da NaClO (la lavandina)."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{FeCl_3}$ en el sistema tradicional?",
      "opciones": [
        "Cloruro ferroso",
        "Cloruro de hierro (III)",
        "Clorato férrico",
        "Cloruro férrico"
      ],
      "respuesta": "Cloruro férrico",
      "explicacion": "Hierro +3 (la valencia mayor) lleva -ico: cloruro férrico."
    },
    {
      "pregunta": "¿Cuál es la fórmula del nitrato de plata?",
      "opciones": [
        "$\\mathrm{AgNO_3}$",
        "$\\mathrm{Ag_2NO_3}$",
        "$\\mathrm{AgNO_2}$",
        "$\\mathrm{Ag(NO_3)_2}$"
      ],
      "respuesta": "$\\mathrm{AgNO_3}$",
      "explicacion": "Ag⁺ y NO₃⁻ tienen cargas iguales y opuestas: AgNO₃."
    }
  ]
}$quimia$::jsonb,
  6,
  true),

('quimia-clase-sales-acidas-basicas-iones', 'Sales ácidas, sales básicas e iones comunes',
  'Sales con hidrógeno o con hidroxilo, y las tablas de cationes y aniones más usados.',
  'quimia',
  $quimia${
  "pasos": [
    "Sales ácidas. Si un ácido con más de un hidrógeno se neutraliza solo en parte, queda una sal que conserva algún H unido al anión: $\\mathrm{H_2CO_3 + NaOH}\\rightarrow\\mathrm{NaHCO_3 + H_2O}$ $\\mathrm{H_2SO_4 + NaOH}\\rightarrow\\mathrm{NaHSO_4 + H_2O}$ El anión resultante tiene una carga menos negativa: el carbonato $\\mathrm{CO_3^{2-}}$ pasa a $\\mathrm{HCO_3^{-}}$. La carga es siempre −(cantidad de H⁺ perdidos).",
    "Nombres de las sales ácidas: en el sistema tradicional se agrega «ácido» (o «monoácido», «diácido» si hay más de un H) después del anión: «carbonato ácido de sodio». En el sistema IUPAC se antepone «hidrogeno» (o «dihidrogeno») al anión: «hidrogenocarbonato de sodio». Y hay un nombre común muy difundido: «bicarbonato de sodio». El prefijo «bi-» del uso común no significa «dos carbonatos»: es solo una costumbre histórica.",
    "Con más H: el ácido fosfórico ($\\mathrm{H_3PO_4}$) da tres aniones: $\\mathrm{H_2PO_4^{-}}$ (dihidrogenofosfato, «fosfato diácido»), $\\mathrm{HPO_4^{2-}}$ (hidrogenofosfato, «fosfato monoácido») y $\\mathrm{PO_4^{3-}}$ (fosfato).",
    "Sales básicas. Son sales que conservan algún ion hidróxido, OH⁻, porque un hidróxido con más de un OH se neutralizó solo en parte: $\\mathrm{Ca(OH)_2 + HCl}\\rightarrow\\mathrm{Ca(OH)Cl + H_2O}$ En el sistema tradicional se llaman «cloruro básico de calcio»; en la nomenclatura IUPAC los aniones se ordenan alfabéticamente: «cloruro hidróxido de calcio». Otro ejemplo es el carbonato básico de cobre (II), $\\mathrm{Cu_2(OH)_2CO_3}$, el mineral malaquita. A este nivel se ven solo de forma introductoria.",
    "Sales hidratadas: algunas sales cristalizan con moléculas de agua unidas. Se nombran agregando «hidratado» con un prefijo: el $\\mathrm{CuSO_4 \\cdot 5H_2O}$ es el sulfato de cobre (II) pentahidratado (el «vitriolo azul»).",
    "Iones poliatómicos comunes. Conviene aprender esta lista, porque aparecen en casi todas las sales. Una forma de ordenarla es por el ácido de origen: los que terminan en -ato vienen de un ácido -ico y los que terminan en -ito, de un ácido -oso. Y las cargas crecen con la cantidad de H del ácido: nitrato (−1, del HNO₃), sulfato (−2, del H₂SO₄) y fosfato (−3, del H₃PO₄).",
    "Cationes con más de una valencia. El hierro, el cobre, el estaño, el plomo, el oro y el cobalto forman dos cationes distintos. En el sistema tradicional el de menor carga lleva -oso y el de mayor -ico, con la raíz latina: ferroso y férrico (hierro), cuproso y cúprico (cobre), estannoso y estánnico (estaño), plumboso y plúmbico (plomo), auroso y áurico (oro), cobaltoso y cobáltico (cobalto). En Stock, el número romano es la carga.",
    "El ion amonio, $\\mathrm{NH_4^{+}}$, es un catión poliatómico que se comporta como un metal alcalino: forma sales como el nitrato de amonio ($\\mathrm{NH_4NO_3}$), el sulfato de amonio ($\\mathrm{(NH_4)_2SO_4}$) y el cloruro de amonio ($\\mathrm{NH_4Cl}$). En la fórmula del sulfato de amonio va entre paréntesis porque se repite dos veces.",
    "Errores frecuentes: escribir mal la carga del hidrogenocarbonato (es −1, no −2); olvidar el paréntesis con NH₄ ((NH₄)₂SO₄, no NH₄₂SO₄); y confundir los cationes -oso con -ico (el de menor carga es -oso)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Sales ácidas",
      "columnas": [
        "Fórmula",
        "Tradicional",
        "IUPAC / Stock",
        "Nombre común"
      ],
      "filas": [
        [
          "$\\mathrm{NaHCO_3}$",
          "carbonato ácido de sodio",
          "hidrogenocarbonato de sodio",
          "bicarbonato de sodio"
        ],
        [
          "$\\mathrm{Ca(HCO_3)_2}$",
          "carbonato ácido de calcio",
          "hidrogenocarbonato de calcio",
          "bicarbonato de calcio"
        ],
        [
          "$\\mathrm{NaHSO_4}$",
          "sulfato ácido de sodio",
          "hidrogenosulfato de sodio",
          "bisulfato de sodio"
        ],
        [
          "$\\mathrm{NaHSO_3}$",
          "sulfito ácido de sodio",
          "hidrogenosulfito de sodio",
          "bisulfito de sodio"
        ],
        [
          "$\\mathrm{NaHS}$",
          "sulfuro ácido de sodio",
          "hidrogenosulfuro de sodio",
          "bisulfuro de sodio"
        ],
        [
          "$\\mathrm{NaH_2PO_4}$",
          "fosfato diácido de sodio",
          "dihidrogenofosfato de sodio",
          "—"
        ],
        [
          "$\\mathrm{Na_2HPO_4}$",
          "fosfato monoácido de sodio",
          "hidrogenofosfato de sodio",
          "—"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Iones poliatómicos comunes (aniones)",
      "columnas": [
        "Anión",
        "Fórmula y carga",
        "Anión",
        "Fórmula y carga"
      ],
      "filas": [
        [
          "nitrato",
          "$\\mathrm{NO_3^{-}}$",
          "nitrito",
          "$\\mathrm{NO_2^{-}}$"
        ],
        [
          "sulfato",
          "$\\mathrm{SO_4^{2-}}$",
          "sulfito",
          "$\\mathrm{SO_3^{2-}}$"
        ],
        [
          "carbonato",
          "$\\mathrm{CO_3^{2-}}$",
          "hidrogenocarbonato",
          "$\\mathrm{HCO_3^{-}}$"
        ],
        [
          "fosfato",
          "$\\mathrm{PO_4^{3-}}$",
          "dihidrogenofosfato",
          "$\\mathrm{H_2PO_4^{-}}$"
        ],
        [
          "hipoclorito",
          "$\\mathrm{ClO^{-}}$",
          "clorito",
          "$\\mathrm{ClO_2^{-}}$"
        ],
        [
          "clorato",
          "$\\mathrm{ClO_3^{-}}$",
          "perclorato",
          "$\\mathrm{ClO_4^{-}}$"
        ],
        [
          "permanganato",
          "$\\mathrm{MnO_4^{-}}$",
          "cromato",
          "$\\mathrm{CrO_4^{2-}}$"
        ],
        [
          "dicromato",
          "$\\mathrm{Cr_2O_7^{2-}}$",
          "hidróxido",
          "$\\mathrm{OH^{-}}$"
        ],
        [
          "cianuro",
          "$\\mathrm{CN^{-}}$",
          "peróxido",
          "$\\mathrm{O_2^{2-}}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Cationes con dos valencias",
      "columnas": [
        "Ion",
        "Stock",
        "Tradicional"
      ],
      "filas": [
        [
          "$\\mathrm{Fe^{2+}}$",
          "hierro (II)",
          "ferroso"
        ],
        [
          "$\\mathrm{Fe^{3+}}$",
          "hierro (III)",
          "férrico"
        ],
        [
          "$\\mathrm{Cu^{+}}$",
          "cobre (I)",
          "cuproso"
        ],
        [
          "$\\mathrm{Cu^{2+}}$",
          "cobre (II)",
          "cúprico"
        ],
        [
          "$\\mathrm{Sn^{2+}}$",
          "estaño (II)",
          "estannoso"
        ],
        [
          "$\\mathrm{Sn^{4+}}$",
          "estaño (IV)",
          "estánnico"
        ],
        [
          "$\\mathrm{Pb^{2+}}$",
          "plomo (II)",
          "plumboso"
        ],
        [
          "$\\mathrm{Pb^{4+}}$",
          "plomo (IV)",
          "plúmbico"
        ],
        [
          "$\\mathrm{Au^{+}}$",
          "oro (I)",
          "auroso"
        ],
        [
          "$\\mathrm{Au^{3+}}$",
          "oro (III)",
          "áurico"
        ],
        [
          "$\\mathrm{Co^{2+}}$",
          "cobalto (II)",
          "cobaltoso"
        ],
        [
          "$\\mathrm{Co^{3+}}$",
          "cobalto (III)",
          "cobáltico"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula del hidrogenocarbonato de sodio (bicarbonato de sodio)?",
      "opciones": [
        "$\\mathrm{Na_2CO_3}$",
        "$\\mathrm{NaCO_3}$",
        "$\\mathrm{Na(HCO_3)_2}$",
        "$\\mathrm{NaHCO_3}$"
      ],
      "respuesta": "$\\mathrm{NaHCO_3}$",
      "explicacion": "Es una sal ácida: Na⁺ con HCO₃⁻ (carga −1): NaHCO₃."
    },
    {
      "pregunta": "¿Cuál es la carga del ion hidrogenosulfato, $\\mathrm{HSO_4}$?",
      "opciones": [
        "−2",
        "−1",
        "+1",
        "0"
      ],
      "respuesta": "−1",
      "explicacion": "El ácido sulfúrico perdió un solo H⁺: la carga es −1."
    },
    {
      "pregunta": "¿Cómo se llama el $\\mathrm{NO_2^{-}}$?",
      "opciones": [
        "Nitrato",
        "Nitrito",
        "Nitruro",
        "Nitrógeno"
      ],
      "respuesta": "Nitrito",
      "explicacion": "Viene del ácido nitroso (-oso): nitrito. El nitrato, NO₃⁻, viene del ácido nítrico."
    },
    {
      "pregunta": "¿Cuál de estos iones es el amonio?",
      "opciones": [
        "$\\mathrm{NO_3^{-}}$",
        "$\\mathrm{OH^{-}}$",
        "$\\mathrm{NH_2^{-}}$",
        "$\\mathrm{NH_4^{+}}$"
      ],
      "respuesta": "$\\mathrm{NH_4^{+}}$",
      "explicacion": "El amonio es NH₄⁺, un catión poliatómico."
    },
    {
      "pregunta": "¿Qué significa «sulfato cúprico» en el sistema Stock?",
      "opciones": [
        "Sulfato de cobre (I)",
        "Sulfato de cobre (II)",
        "Sulfato de cobre (III)",
        "Sulfato de cobalto (II)"
      ],
      "respuesta": "Sulfato de cobre (II)",
      "explicacion": "Cúprico es la valencia mayor del cobre, +2: sulfato de cobre (II)."
    },
    {
      "pregunta": "¿Cuál es la fórmula del sulfato de amonio?",
      "opciones": [
        "$\\mathrm{NH_4SO_4}$",
        "$\\mathrm{NH_4(SO_4)_2}$",
        "$\\mathrm{(NH_4)_2SO_4}$",
        "$\\mathrm{(NH_3)_2SO_4}$"
      ],
      "respuesta": "$\\mathrm{(NH_4)_2SO_4}$",
      "explicacion": "Dos NH₄⁺ (carga +2) para un SO₄²⁻: (NH₄)₂SO₄, con paréntesis en el amonio."
    }
  ]
}$quimia$::jsonb,
  7,
  true),

('quimia-clase-metodo-nombrar', 'Método para nombrar cualquier compuesto',
  'Un diagrama de decisión, el paso a paso y práctica guiada para pasar de la fórmula al nombre y del nombre a la fórmula.',
  'quimia',
  $quimia${
  "pasos": [
    "Para nombrar un compuesto inorgánico hay que responder unas pocas preguntas, en orden. Este es el diagrama de decisión que reúne todo lo aprendido.",
    "Método en cuatro pasos: 1) identifica la clase de compuesto con el diagrama; 2) identifica el metal (o el no metal central) y calcula su número de oxidación, sabiendo que la suma de los números de oxidación es 0; 3) nombra el anión o el grupo característico (óxido, hidróxido, -uro, -ato, -ito); 4) escribe el nombre en el sistema que pidan, con el orden y las mayúsculas correctos.",
    "Práctica 1: $\\mathrm{Fe_2O_3}$. Tiene dos elementos y uno es oxígeno: es un óxido; el otro es un metal, un óxido básico. Tres oxígenos suman −6; los dos hierros aportan +6, y cada uno es +3. Nombres: óxido de hierro (III) (Stock), óxido férrico (tradicional) y trióxido de dihierro (sistemático).",
    "Práctica 2: $\\mathrm{H_2SO_3}$. Empieza con H y tiene oxígeno: es un oxoácido. El azufre: 2 × (+1) + x + 3 × (−2) = 0, entonces x = +4; con +4 (el menor de los dos) lleva -oso. Es el ácido sulfuroso.",
    "Práctica 3: $\\mathrm{Cu(NO_3)_2}$. Tiene un metal, un no metal y oxígeno, y el grupo NO₃ entre paréntesis: es una oxisal. El nitrato es NO₃⁻ y hay dos: el cobre es +2. Nombres: nitrato de cobre (II) o nitrato cúprico.",
    "Práctica 4: $\\mathrm{NaHCO_3}$. Tiene un H dentro del anión: es una sal ácida. Nombres: hidrogenocarbonato de sodio (IUPAC), carbonato ácido de sodio (tradicional) y bicarbonato de sodio (uso común).",
    "Práctica 5: $\\mathrm{PCl_5}$. Dos no metales, sin oxígeno ni hidrógeno: un compuesto molecular binario. Sistema de prefijos: pentacloruro de fósforo. Y $\\mathrm{CaH_2}$: un hidruro metálico, hidruro de calcio. Y $\\mathrm{HBr}$: un hidrácido, ácido bromhídrico disuelto en agua (bromuro de hidrógeno como gas).",
    "Del nombre a la fórmula: 1) escribe los símbolos de cada parte (el anión por el nombre y el catión por el «de…»); 2) escribe las cargas (el romano da la del metal); 3) cruza las cargas y simplifica; 4) pon paréntesis a los iones poliatómicos con subíndice mayor que 1; 5) verifica que la suma sea cero. Por ejemplo: «sulfato de aluminio» es $\\mathrm{Al^{3+}}$ con $\\mathrm{SO_4^{2-}}$, que da $\\mathrm{Al_2(SO_4)_3}$.",
    "Otro ejemplo: «hidróxido de hierro (II)» es $\\mathrm{Fe^{2+}}$ con $\\mathrm{OH^{-}}$, o sea $\\mathrm{Fe(OH)_2}$. Y «pentaóxido de difósforo»: los prefijos son los subíndices (2 fósforos, 5 oxígenos), o sea $\\mathrm{P_2O_5}$.",
    "Muchos compuestos tienen también un nombre común, y conviene conocerlo: es el que aparece en los envases y en la vida diaria. La tabla reúne los más frecuentes con su nombre químico.",
    "Lista de control antes de dar una respuesta: ¿las cargas suman cero?; ¿pusiste paréntesis solo donde el grupo se repite?; ¿el nombre va en minúscula y en el orden anión-«de»-catión?; ¿pusiste las tildes (óxido, hidróxido, sulfúrico) y no las pusiste donde no van (sulfato, nitrato)?; ¿el número romano coincide con la carga del metal?"
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 0,
      "titulo": "Diagrama de decisión para nombrar un compuesto",
      "columnas": [
        "Pregunta sobre la fórmula",
        "Si la respuesta es sí",
        "Ejemplo"
      ],
      "filas": [
        [
          "¿Empieza con H y tiene oxígeno?",
          "Oxoácido (ácido …ico / …oso)",
          "$\\mathrm{H_2SO_4}$: ácido sulfúrico"
        ],
        [
          "¿Empieza con H y no tiene oxígeno?",
          "Hidrácido (ácido …hídrico) o hidruro no metálico",
          "$\\mathrm{HCl}$: ácido clorhídrico"
        ],
        [
          "¿Tiene un metal unido a OH?",
          "Hidróxido",
          "$\\mathrm{Ca(OH)_2}$: hidróxido de calcio"
        ],
        [
          "¿Tiene solo dos elementos y uno es O (con O₂ si es peróxido)?",
          "Óxido (metal: básico; no metal: ácido) o peróxido",
          "$\\mathrm{Al_2O_3}$: óxido de aluminio"
        ],
        [
          "¿Tiene solo dos elementos y uno es H, y el otro es un metal?",
          "Hidruro metálico",
          "$\\mathrm{CaH_2}$: hidruro de calcio"
        ],
        [
          "¿Tiene solo un metal y un no metal, sin O ni H?",
          "Sal binaria (…uro)",
          "$\\mathrm{FeCl_3}$: cloruro de hierro (III)"
        ],
        [
          "¿Tiene metal, no metal y oxígeno?",
          "Oxisal (…ato / …ito)",
          "$\\mathrm{Na_2SO_4}$: sulfato de sodio"
        ],
        [
          "¿Tiene además un H unido al anión?",
          "Sal ácida (hidrogeno…)",
          "$\\mathrm{NaHCO_3}$: hidrogenocarbonato de sodio"
        ],
        [
          "¿Tiene dos no metales, sin O ni H?",
          "Compuesto molecular (prefijos)",
          "$\\mathrm{PCl_5}$: pentacloruro de fósforo"
        ]
      ]
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 7,
      "cation": "Al3+",
      "anion": "SO4^2-"
    },
    {
      "tipo": "quimia.cruce",
      "despuesDePaso": 8,
      "cation": "Fe2+",
      "anion": "OH-"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 9,
      "titulo": "Nombres comunes de compuestos cotidianos",
      "columnas": [
        "Fórmula",
        "Nombre químico",
        "Nombre común"
      ],
      "filas": [
        [
          "$\\mathrm{H_2O}$",
          "agua",
          "agua"
        ],
        [
          "$\\mathrm{NaCl}$",
          "cloruro de sodio",
          "sal común"
        ],
        [
          "$\\mathrm{NaClO}$",
          "hipoclorito de sodio",
          "lavandina / lejía"
        ],
        [
          "$\\mathrm{NaOH}$",
          "hidróxido de sodio",
          "soda cáustica"
        ],
        [
          "$\\mathrm{CaO}$",
          "óxido de calcio",
          "cal viva"
        ],
        [
          "$\\mathrm{Ca(OH)_2}$",
          "hidróxido de calcio",
          "cal apagada"
        ],
        [
          "$\\mathrm{NaHCO_3}$",
          "hidrogenocarbonato de sodio",
          "bicarbonato de sodio"
        ],
        [
          "$\\mathrm{CaCO_3}$",
          "carbonato de calcio",
          "piedra caliza / mármol"
        ],
        [
          "$\\mathrm{H_2O_2}$",
          "peróxido de hidrógeno",
          "agua oxigenada"
        ],
        [
          "$\\mathrm{NH_3}$",
          "amoníaco",
          "amoníaco"
        ],
        [
          "$\\mathrm{HCl}$",
          "ácido clorhídrico",
          "en solución impura y diluida, «ácido muriático»"
        ],
        [
          "$\\mathrm{Mg(OH)_2}$",
          "hidróxido de magnesio",
          "leche de magnesia"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué clase de compuesto corresponde $\\mathrm{Na_2SO_4}$?",
      "opciones": [
        "Oxoácido",
        "Sal binaria",
        "Hidróxido",
        "Oxisal"
      ],
      "respuesta": "Oxisal",
      "explicacion": "Tiene un metal (Na), un no metal (S) y oxígeno: es una oxisal. Su nombre es sulfato de sodio."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{Cu(NO_3)_2}$ en el sistema Stock?",
      "opciones": [
        "Nitrato de cobre (I)",
        "Nitrato de cobre (II)",
        "Nitruro de cobre (II)",
        "Nitrato cúprico"
      ],
      "respuesta": "Nitrato de cobre (II)",
      "explicacion": "Hay dos nitratos (−2) para un cobre, así que el cobre es +2: nitrato de cobre (II)."
    },
    {
      "pregunta": "¿Cuál es el nombre de $\\mathrm{PCl_5}$?",
      "opciones": [
        "Tricloruro de fósforo",
        "Pentacloruro de fósforo",
        "Cloruro de fósforo (V)",
        "Pentacloruro de difósforo"
      ],
      "respuesta": "Pentacloruro de fósforo",
      "explicacion": "Son dos no metales: se usan prefijos, uno por átomo de cloro: pentacloruro de fósforo (sin prefijo en el fósforo, que es uno solo)."
    },
    {
      "pregunta": "¿Cuál es la fórmula del hidróxido de hierro (II)?",
      "opciones": [
        "$\\mathrm{Fe(OH)_3}$",
        "$\\mathrm{FeOH_2}$",
        "$\\mathrm{Fe_2OH}$",
        "$\\mathrm{Fe(OH)_2}$"
      ],
      "respuesta": "$\\mathrm{Fe(OH)_2}$",
      "explicacion": "El romano (II) dice que el hierro es +2; con OH⁻ (−1) se necesitan 2: Fe(OH)₂."
    },
    {
      "pregunta": "Según la lista de nombres comunes, ¿qué compuesto es la soda cáustica?",
      "opciones": [
        "$\\mathrm{NaOH}$",
        "$\\mathrm{NaCl}$",
        "$\\mathrm{CaO}$",
        "$\\mathrm{NaHCO_3}$"
      ],
      "respuesta": "$\\mathrm{NaOH}$",
      "explicacion": "La soda cáustica es el hidróxido de sodio, NaOH."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{H_2SO_3}$ en el sistema tradicional?",
      "opciones": [
        "Ácido sulfúrico",
        "Ácido sulfhídrico",
        "Ácido sulfuroso",
        "Ácido hiposulfuroso"
      ],
      "respuesta": "Ácido sulfuroso",
      "explicacion": "El azufre tiene +4 (el menor de sus dos estados): -oso. Es el ácido sulfuroso."
    }
  ]
}$quimia$::jsonb,
  8,
  true);
