-- ============================================================
-- Prodigia — Quimia: Aprender, tanda 2 de 2 del retrofit a Técnicas | Clases
-- (docs/PARIDAD_MUNDOS.md filas 22/23 y la sección "Quimia: Técnicas |
-- Clases (tanda 2)"). La tanda 1 (0209) sembró tabla, símbolos, fórmulas y
-- nomenclatura; esta migración agrega los dos grupos que quedaban:
--   - redox (estados de oxidación completos, reacciones redox, balanceo por
--     número de oxidación y por ion-electrón, serie de actividad, pilas y
--     electrólisis);
--   - orgánica (el carbono, fórmulas, alcanos, alquenos y alquinos, cíclicos
--     y aromáticos, grupos funcionales, isomería, reacciones, glucosa y
--     polímeros).
--
-- Solo INSERT de lecciones nuevas (ninguna de las filas de 0209 se toca, y los
-- slugs no chocan con los de 0209: techniques.slug es único). Las Clases se
-- agregan al final del curso (grupo redox y después orgánica), así que el
-- orden de desbloqueo de las 17 anteriores no cambia.
--
-- Todo dato químico sale de tablas de referencia con tests (src/lib/quimia/
-- {redox,organica,moleculas}.ts): números de oxidación calculados, ecuaciones
-- balanceadas en átomos y carga, semirreacciones por el algoritmo ion-electrón,
-- nombres IUPAC calculados y contrastados con una tabla curada y con el banco
-- de la práctica. Los visuales nuevos son "quimia.redox", "quimia.oxidacion",
-- "quimia.balanceo", "quimia.pila", "quimia.cadena", "quimia.grupos",
-- "quimia.isomeria" y "quimia.hibridacion" (esqueletos 2D esquemáticos).
--
-- Técnicas: 14 en total (redox 6, organica 8): 0 ya existían (se ACTUALIZAN) y 14 son nuevas.
-- Clases: 17 (redox 7, organica 10), requiere_pro = true.
--
-- Este archivo se GENERA desde src/lib/quimia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano.
-- Regenerar: QUIMIA_ESCRIBIR_SQL=1 npx vitest run src/lib/quimia/lecciones
-- ============================================================

-- 2) Técnicas nuevas (requiere_pro = false).
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('quimia-tecnica-redox-oxidar-reducir', 'Oxidar y reducir sin confundirse',
  'Oxidarse es perder electrones y reducirse es ganarlos: cómo recordarlo, cómo verlo en el número de oxidación y quién es el agente.',
  'quimia',
  $quimia${
  "pasos": [
    "Oxidarse es perder electrones y reducirse es ganarlos. Como los electrones tienen carga negativa, al perderlos el número de oxidación SUBE (se vuelve más positivo) y al ganarlos BAJA.",
    "Truco para recordarlo: «reducir» suena a bajar, y el número de oxidación baja cuando algo se reduce. Lo contrario, oxidarse, es subir.",
    "Nunca ocurre solo uno de los dos procesos: si algo pierde electrones, otra cosa los gana. Por eso se habla de reacciones redox (reducción y oxidación a la vez). Ejemplo: $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$ El zinc pasa de 0 a +2: sube, pierde 2 electrones y se oxida. El cobre pasa de +2 a 0: baja, gana 2 electrones y se reduce.",
    "El agente oxidante es la sustancia que se REDUCE: le quita electrones a la otra y por eso la oxida. El agente reductor es la sustancia que se OXIDA: le da electrones a la otra y por eso la reduce. Suena al revés; para no confundirte, mira siempre primero qué le pasa a esa sustancia.",
    "En el ejemplo, el $\\mathrm{Cu^{2+}}$ es el agente oxidante (se reduce) y el zinc es el agente reductor (se oxida)."
  ],
  "visuales": [
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 2,
      "ejemplo": "zn-cu"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Oxidación y reducción",
      "columnas": [
        "",
        "Oxidación",
        "Reducción"
      ],
      "filas": [
        [
          "Electrones",
          "se pierden",
          "se ganan"
        ],
        [
          "Número de oxidación",
          "sube",
          "baja"
        ],
        [
          "La sustancia",
          "se oxida",
          "se reduce"
        ],
        [
          "Se llama",
          "agente reductor",
          "agente oxidante"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En la semirreacción $\\mathrm{Zn} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{e^{-}}$, ¿qué le pasa al zinc?",
      "opciones": [
        "Se reduce: gana electrones y su número de oxidación baja",
        "Se oxida: gana electrones y su número de oxidación sube",
        "No cambia: solo pasa de sólido a ion",
        "Se oxida: pierde electrones y su número de oxidación sube"
      ],
      "respuesta": "Se oxida: pierde electrones y su número de oxidación sube",
      "explicacion": "El zinc pasa de 0 a +2: el número sube porque pierde 2 electrones, y perder electrones es oxidarse."
    },
    {
      "pregunta": "Un átomo de manganeso pasa de +7 a +2. ¿Qué ocurrió?",
      "opciones": [
        "Se oxidó: perdió 5 electrones",
        "Se redujo: perdió 5 electrones",
        "Se redujo: ganó 5 electrones",
        "Se oxidó: ganó 7 electrones"
      ],
      "respuesta": "Se redujo: ganó 5 electrones",
      "explicacion": "El número bajó de +7 a +2, o sea 5 unidades: cada átomo ganó 5 electrones, y ganar electrones es reducirse."
    },
    {
      "pregunta": "¿Qué es un agente oxidante?",
      "opciones": [
        "La sustancia que se oxida y hace que otra se reduzca",
        "Cualquier sustancia que contiene oxígeno",
        "El electrón que se transfiere",
        "La sustancia que se reduce y hace que otra se oxide"
      ],
      "respuesta": "La sustancia que se reduce y hace que otra se oxide",
      "explicacion": "El agente oxidante oxida a la otra sustancia quitándole electrones, y por eso él mismo se reduce."
    },
    {
      "pregunta": "En $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$ ¿cuál es el agente reductor?",
      "opciones": [
        "$\\mathrm{Cu^{2+}}$",
        "$\\mathrm{Zn}$",
        "$\\mathrm{Zn^{2+}}$",
        "$\\mathrm{Cu}$"
      ],
      "respuesta": "$\\mathrm{Zn}$",
      "explicacion": "El zinc es el que se oxida (cede los electrones), así que es el agente reductor."
    }
  ]
}$quimia$::jsonb,
  1,
  false),

('quimia-tecnica-redox-calcular-numero', 'Calcular un número de oxidación en tres pasos',
  'Anotar los números conocidos, plantear la suma y despejar la incógnita: el método para cualquier fórmula o ion.',
  'quimia',
  $quimia${
  "pasos": [
    "Paso 1: anota los números que ya conoces, en este orden de prioridad: el flúor es −1; los metales alcalinos son +1 y los alcalinotérreos +2; el oxígeno es −2 y el hidrógeno es +1. El oxígeno (peróxidos) y el hidrógeno (hidruros) tienen excepciones.",
    "Paso 2: plantea la suma. Cada número se multiplica por la cantidad de átomos de ese elemento, y el total tiene que dar la carga: 0 si la especie es neutra, o la carga del ion.",
    "Paso 3: despeja la incógnita. Manganeso en $\\mathrm{KMnO_4}$: (+1) + x + 4·(−2) = 0, así que x = +7.",
    "Con un ion se hace igual, pero la suma da la carga del ion. Cromo en $\\mathrm{Cr_2O_7^{2-}}$: 2x + 7·(−2) = −2, así que x = +6.",
    "Comprueba siempre volviendo a sumar. Si la incógnita no da un número entero, revisa: o hay un error de cuenta o es una excepción (como un peróxido)."
  ],
  "visuales": [
    {
      "tipo": "quimia.oxidacion",
      "despuesDePaso": 2,
      "formula": "KMnO4",
      "incognita": "Mn"
    },
    {
      "tipo": "quimia.oxidacion",
      "despuesDePaso": 3,
      "formula": "Cr2O7",
      "carga": -2,
      "incognita": "Cr"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué número de oxidación tiene el fósforo en $\\mathrm{H_3PO_4}$?",
      "opciones": [
        "+3",
        "−3",
        "+5",
        "+7"
      ],
      "respuesta": "+5",
      "explicacion": "3·(+1) + x + 4·(−2) = 0, así que x = +5."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el cloro en el ion $\\mathrm{ClO_3^{-}}$?",
      "opciones": [
        "+1",
        "+3",
        "+5",
        "+7"
      ],
      "respuesta": "+5",
      "explicacion": "x + 3·(−2) = −1, así que x = +5."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el manganeso en $\\mathrm{MnO_2}$?",
      "opciones": [
        "+2",
        "+4",
        "+6",
        "+7"
      ],
      "respuesta": "+4",
      "explicacion": "x + 2·(−2) = 0, así que x = +4."
    },
    {
      "pregunta": "En el ion $\\mathrm{SO_4^{2-}}$, la suma de los números de oxidación tiene que dar...",
      "opciones": [
        "0",
        "+6",
        "−2",
        "−8"
      ],
      "respuesta": "−2",
      "explicacion": "Cuando la especie es un ion, la suma de los números de oxidación es la carga del ion, no cero. Aquí: (+6) + 4·(−2) = −2."
    }
  ]
}$quimia$::jsonb,
  2,
  false),

('quimia-tecnica-redox-es-redox', '¿Es redox? Busca el cambio de número',
  'Una reacción es redox si el número de oxidación de algún elemento cambia: cómo comprobarlo rápido.',
  'quimia',
  $quimia${
  "pasos": [
    "Una reacción es redox cuando el número de oxidación de algún elemento cambia. Si todos los elementos conservan su número, no es redox.",
    "Pistas rápidas: si un elemento libre (Zn, O₂, Cl₂, H₂...) aparece o desaparece, es redox, porque un elemento libre siempre tiene número 0 y al combinarse cambia. Las neutralizaciones (ácido más base), las precipitaciones y los intercambios de iones no son redox.",
    "Para estar seguro, calcula los números de los elementos sospechosos a los dos lados. La tabla muestra seis reacciones ya analizadas.",
    "Las descomposiciones pueden ser o no redox: $\\mathrm{CaCO_3} \\rightarrow \\mathrm{CaO} + \\mathrm{CO_2}$ no lo es (ningún número cambia), pero $2\\,\\mathrm{H_2O} \\rightarrow 2\\,\\mathrm{H_2} + \\mathrm{O_2}$ sí (aparecen elementos libres)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Seis reacciones, analizadas",
      "columnas": [
        "Reacción",
        "Elementos que cambian",
        "¿Redox?"
      ],
      "filas": [
        [
          "$\\mathrm{HCl} + \\mathrm{NaOH} \\rightarrow \\mathrm{NaCl} + \\mathrm{H_2O}$",
          "ninguno",
          "no"
        ],
        [
          "$\\mathrm{AgNO_3} + \\mathrm{NaCl} \\rightarrow \\mathrm{AgCl} + \\mathrm{NaNO_3}$",
          "ninguno",
          "no"
        ],
        [
          "$\\mathrm{CaCO_3} \\rightarrow \\mathrm{CaO} + \\mathrm{CO_2}$",
          "ninguno",
          "no"
        ],
        [
          "$2\\,\\mathrm{H_2O} \\rightarrow 2\\,\\mathrm{H_2} + \\mathrm{O_2}$",
          "H, O",
          "sí"
        ],
        [
          "$\\mathrm{Zn} + 2\\,\\mathrm{HCl} \\rightarrow \\mathrm{ZnCl_2} + \\mathrm{H_2}$",
          "Zn, H",
          "sí"
        ],
        [
          "$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$",
          "C, O",
          "sí"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál de estas reacciones es redox?",
      "opciones": [
        "$\\mathrm{NaOH} + \\mathrm{HNO_3} \\rightarrow \\mathrm{NaNO_3} + \\mathrm{H_2O}$",
        "$\\mathrm{BaCl_2} + \\mathrm{Na_2SO_4} \\rightarrow \\mathrm{BaSO_4} + 2\\,\\mathrm{NaCl}$",
        "$\\mathrm{CaO} + \\mathrm{H_2O} \\rightarrow \\mathrm{Ca(OH)_2}$",
        "$\\mathrm{Mg} + 2\\,\\mathrm{HCl} \\rightarrow \\mathrm{MgCl_2} + \\mathrm{H_2}$"
      ],
      "respuesta": "$\\mathrm{Mg} + 2\\,\\mathrm{HCl} \\rightarrow \\mathrm{MgCl_2} + \\mathrm{H_2}$",
      "explicacion": "En $\\mathrm{Mg} + 2\\,\\mathrm{HCl} \\rightarrow \\mathrm{MgCl_2} + \\mathrm{H_2}$ cambian Mg y H: el magnesio pasa de 0 a +2 y el hidrógeno de +1 a 0. En las otras tres ningún número cambia."
    },
    {
      "pregunta": "En una reacción de neutralización (ácido más base), ¿cambian los números de oxidación?",
      "opciones": [
        "Sí: el hidrógeno siempre se reduce",
        "Sí: el oxígeno siempre se oxida",
        "No: es una reacción sin transferencia de electrones",
        "Depende del ácido, pero siempre cambia alguno"
      ],
      "respuesta": "No: es una reacción sin transferencia de electrones",
      "explicacion": "En $\\mathrm{HCl} + \\mathrm{NaOH} \\rightarrow \\mathrm{NaCl} + \\mathrm{H_2O}$ el hidrógeno sigue en +1, el cloro en −1, el sodio en +1 y el oxígeno en −2."
    },
    {
      "pregunta": "¿Es redox $\\mathrm{CaCO_3} \\rightarrow \\mathrm{CaO} + \\mathrm{CO_2}$?",
      "opciones": [
        "No: ningún número de oxidación cambia",
        "Sí: el carbono se reduce",
        "Sí: se libera CO₂",
        "No: porque no hay oxígeno libre y eso basta para descartarla siempre"
      ],
      "respuesta": "No: ningún número de oxidación cambia",
      "explicacion": "Calcio +2, carbono +4 y oxígeno −2 en los dos lados: no hay transferencia de electrones. Que se libere un gas no significa que sea redox."
    },
    {
      "pregunta": "¿Qué pista rápida indica que una reacción probablemente es redox?",
      "opciones": [
        "Hay un ácido entre los reactivos",
        "Se forma un precipitado",
        "Los reactivos son líquidos",
        "Aparece o desaparece un elemento libre (como Zn, O₂ o H₂)"
      ],
      "respuesta": "Aparece o desaparece un elemento libre (como Zn, O₂ o H₂)",
      "explicacion": "Un elemento libre tiene número de oxidación 0; si aparece como producto (o desaparece como reactivo) su número cambió."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-redox-balanceo-electrones', 'Balancear por electrones: el truco de la cruz',
  'Igualar los electrones que se pierden con los que se ganan y completar el resto por tanteo.',
  'quimia',
  $quimia${
  "pasos": [
    "En una reacción redox los electrones que se pierden son los mismos que se ganan. Balancear es hacer que esa cuenta cierre.",
    "Paso 1: calcula los números y anota cuánto cambia cada elemento. Ejemplo: $\\mathrm{Fe_2O_3} + \\mathrm{CO} \\rightarrow \\mathrm{Fe} + \\mathrm{CO_2}$. El hierro baja de +3 a 0: gana 3 electrones por átomo y hay 2 átomos, o sea 6 electrones por cada $\\mathrm{Fe_2O_3}$. El carbono sube de +2 a +4: pierde 2 electrones por átomo.",
    "Paso 2: la cruz. Los electrones totales tienen que ser iguales: 6 se ganan por cada $\\mathrm{Fe_2O_3}$ y 2 se pierden por cada CO. El mínimo común múltiplo es 6, así que hacen falta 3 CO por cada $\\mathrm{Fe_2O_3}$.",
    "Paso 3: completa los coeficientes que faltan por tanteo, en este orden: metales, no metales y, al final, hidrógeno y oxígeno. Resultado: $\\mathrm{Fe_2O_3} + 3\\,\\mathrm{CO} \\rightarrow 2\\,\\mathrm{Fe} + 3\\,\\mathrm{CO_2}$",
    "Paso 4: verifica que haya la misma cantidad de átomos de cada elemento a los dos lados (y la misma carga si hay iones). Si no cierra, revisa los coeficientes."
  ],
  "visuales": [
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 3,
      "ejemplo": "fe2o3-co"
    }
  ],
  "quiz": [
    {
      "pregunta": "En $\\mathrm{Fe_2O_3} + 3\\,\\mathrm{CO} \\rightarrow 2\\,\\mathrm{Fe} + 3\\,\\mathrm{CO_2}$ ¿cuántos electrones se transfieren por cada $\\mathrm{Fe_2O_3}$?",
      "opciones": [
        "2",
        "3",
        "6",
        "12"
      ],
      "respuesta": "6",
      "explicacion": "Los 2 hierros bajan de +3 a 0: 2 × 3 = 6 electrones ganados. Los 3 CO suben de +2 a +4: 3 × 2 = 6 electrones perdidos."
    },
    {
      "pregunta": "En la reacción del permanganato con el ácido clorhídrico, el manganeso pasa de +7 a +2. ¿Cuántos electrones gana cada átomo de manganeso?",
      "opciones": [
        "2",
        "5",
        "7",
        "9"
      ],
      "respuesta": "5",
      "explicacion": "El número baja de +7 a +2: 5 unidades, o sea 5 electrones por átomo."
    },
    {
      "pregunta": "Una sustancia A pierde 2 electrones por unidad y una sustancia B gana 3 electrones por unidad. ¿En qué proporción reaccionan para que los electrones coincidan?",
      "opciones": [
        "2 de A por cada 3 de B",
        "1 de A por cada 1 de B",
        "5 de A por cada 1 de B",
        "3 de A por cada 2 de B"
      ],
      "respuesta": "3 de A por cada 2 de B",
      "explicacion": "El mínimo común múltiplo de 2 y 3 es 6: 3 unidades de A pierden 6 electrones y 2 unidades de B ganan 6 electrones."
    },
    {
      "pregunta": "Al completar el balanceo por tanteo, ¿qué elementos conviene dejar para el final?",
      "opciones": [
        "Los metales",
        "Los que cambian de número de oxidación",
        "El hidrógeno y el oxígeno",
        "El elemento que aparece en más sustancias"
      ],
      "respuesta": "El hidrógeno y el oxígeno",
      "explicacion": "Los metales y los no metales se ajustan primero; el hidrógeno y el oxígeno suelen aparecer en varias sustancias (como el agua) y se ajustan al final."
    }
  ]
}$quimia$::jsonb,
  4,
  false),

('quimia-tecnica-redox-ion-electron-ohe', 'Ion-electrón: el orden O, H, e⁻',
  'Balancear una semirreacción en medio ácido siguiendo siempre el mismo orden: oxígenos, hidrógenos y cargas.',
  'quimia',
  $quimia${
  "pasos": [
    "El método ion-electrón divide la reacción en dos semirreacciones (una de oxidación y una de reducción) y balancea cada una por separado. Esta Técnica es para medio ácido.",
    "Recuerda el orden con las letras O, H, e: primero los Oxígenos con H₂O, después los Hidrógenos con H⁺ y al final las cargas con electrones (e⁻).",
    "Ejemplo: $\\mathrm{MnO_4^{-}}$ → $\\mathrm{Mn^{2+}}$. Oxígenos: hay 4 a la izquierda, así que se agregan 4 H₂O a la derecha. Hidrógenos: ahora hay 8 a la derecha, así que se agregan 8 H⁺ a la izquierda. Cargas: −1 + 8 = +7 a la izquierda y +2 a la derecha; los electrones van del lado con más carga positiva, o sea 5 e⁻ a la izquierda.",
    "Cuando las dos semirreacciones están listas, se multiplican para igualar los electrones, se suman y se simplifican. Con el $\\mathrm{Fe^{2+}}$ da: $\\mathrm{MnO_4^{-}} + 5\\,\\mathrm{Fe^{2+}} + 8\\,\\mathrm{H^{+}} \\rightarrow \\mathrm{Mn^{2+}} + 5\\,\\mathrm{Fe^{3+}} + 4\\,\\mathrm{H_2O}$"
  ],
  "visuales": [
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 3,
      "caso": "mno4-fe2"
    }
  ],
  "quiz": [
    {
      "pregunta": "Al balancear $\\mathrm{Cr_2O_7^{2-}}$ → $\\mathrm{Cr^{3+}}$ (con 2 Cr a la derecha) en medio ácido, ¿cuántos H₂O hacen falta?",
      "opciones": [
        "3",
        "5",
        "7",
        "14"
      ],
      "respuesta": "7",
      "explicacion": "Hay 7 oxígenos a la izquierda, así que se agregan 7 H₂O a la derecha."
    },
    {
      "pregunta": "En la misma semirreacción, ¿cuántos H⁺ hacen falta después de agregar el agua?",
      "opciones": [
        "7",
        "12",
        "14",
        "16"
      ],
      "respuesta": "14",
      "explicacion": "Los 7 H₂O aportan 14 hidrógenos a la derecha, así que se agregan 14 H⁺ a la izquierda."
    },
    {
      "pregunta": "¿Cuántos electrones tiene la semirreacción $\\mathrm{Cr_2O_7^{2-}}$ → 2$\\mathrm{Cr^{3+}}$ balanceada?",
      "opciones": [
        "3",
        "4",
        "6",
        "12"
      ],
      "respuesta": "6",
      "explicacion": "A la izquierda: −2 + 14 = +12; a la derecha: +6. Se agregan 6 e⁻ a la izquierda (el lado más positivo)."
    },
    {
      "pregunta": "Para $\\mathrm{NO_3^{-}}$ → NO en medio ácido, ¿qué se agrega?",
      "opciones": [
        "1 H₂O, 2 H⁺ y 1 e⁻",
        "3 H₂O, 6 H⁺ y 3 e⁻",
        "2 H₂O, 4 H⁺ y 3 e⁻",
        "2 H₂O, 2 H⁺ y 5 e⁻"
      ],
      "respuesta": "2 H₂O, 4 H⁺ y 3 e⁻",
      "explicacion": "Oxígenos: 3 a la izquierda y 1 a la derecha, así que 2 H₂O a la derecha. Hidrógenos: 4 H⁺ a la izquierda. Cargas: −1 + 4 = +3 contra 0, así que 3 e⁻ a la izquierda."
    }
  ]
}$quimia$::jsonb,
  5,
  false),

('quimia-tecnica-redox-serie-actividad', 'Serie de actividad: quién desplaza a quién',
  'Ordenar los metales por su facilidad para oxidarse y predecir si un metal desplaza a otro o reacciona con un ácido.',
  'quimia',
  $quimia${
  "pasos": [
    "Los metales se ordenan en una serie de actividad según su facilidad para oxidarse. Arriba están los más reactivos (K, Ca, Na, Mg, Al) y abajo los menos reactivos (Cu, Ag, Au). El hidrógeno se ubica en medio, como referencia.",
    "Regla del desplazamiento: un metal desplaza de una solución al catión de cualquier metal que esté DEBAJO de él en la serie. Zn + CuSO₄ sí reacciona (el zinc está arriba del cobre): $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$ En cambio, Cu + ZnSO₄ no reacciona.",
    "Regla de los ácidos: los metales que están arriba del hidrógeno reaccionan con los ácidos comunes (como el clorhídrico) y desprenden H₂: $\\mathrm{Zn} + 2\\,\\mathrm{H^{+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{H_2}$ Los que están debajo (Cu, Ag, Au) no reaccionan con estos ácidos.",
    "El orden exacto puede variar un poco entre libros (por ejemplo, entre el sodio y el calcio). Aquí se usa el que sale de los potenciales estándar de reducción, que se ven en la Clase de serie de actividad y potenciales."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 0,
      "titulo": "Serie de actividad (de más a menos reactivo)",
      "columnas": [
        "Lugar",
        "Elemento",
        "¿Reacciona con un ácido como el HCl?"
      ],
      "filas": [
        [
          "1",
          "Potasio (K)",
          "sí"
        ],
        [
          "2",
          "Calcio (Ca)",
          "sí"
        ],
        [
          "3",
          "Sodio (Na)",
          "sí"
        ],
        [
          "4",
          "Magnesio (Mg)",
          "sí"
        ],
        [
          "5",
          "Aluminio (Al)",
          "sí"
        ],
        [
          "6",
          "Zinc (Zn)",
          "sí"
        ],
        [
          "7",
          "Hierro (Fe)",
          "sí"
        ],
        [
          "8",
          "Estaño (Sn)",
          "sí"
        ],
        [
          "9",
          "Plomo (Pb)",
          "sí"
        ],
        [
          "10",
          "Hidrógeno (referencia)",
          "—"
        ],
        [
          "11",
          "Cobre (Cu)",
          "no"
        ],
        [
          "12",
          "Plata (Ag)",
          "no"
        ],
        [
          "13",
          "Oro (Au)",
          "no"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Reacciona el cobre con el ácido clorhídrico diluido?",
      "opciones": [
        "Sí: todos los metales reaccionan con los ácidos",
        "No: el cobre está debajo del hidrógeno en la serie",
        "Sí: desprende hidrógeno",
        "Solo si se calienta mucho"
      ],
      "respuesta": "No: el cobre está debajo del hidrógeno en la serie",
      "explicacion": "El cobre está debajo del hidrógeno en la serie, así que no lo desplaza de un ácido: no reacciona."
    },
    {
      "pregunta": "¿Cuál de estos metales desplaza al cobre de una solución de sulfato de cobre (II)?",
      "opciones": [
        "Plata",
        "Oro",
        "Ninguno",
        "Hierro"
      ],
      "respuesta": "Hierro",
      "explicacion": "El hierro está arriba del cobre en la serie, así que lo desplaza. La plata y el oro están debajo."
    },
    {
      "pregunta": "¿Cuál de estos metales es el más reactivo?",
      "opciones": [
        "Cobre",
        "Plata",
        "Zinc",
        "Magnesio"
      ],
      "respuesta": "Magnesio",
      "explicacion": "En la serie, el magnesio está más arriba que el zinc, el cobre y la plata: es el que se oxida con más facilidad."
    },
    {
      "pregunta": "¿Qué ocurre al poner un trozo de plata en una solución que contiene $\\mathrm{Cu^{2+}}$?",
      "opciones": [
        "No hay reacción: la plata está debajo del cobre",
        "La plata desplaza al cobre",
        "Se forma hidrógeno",
        "La solución se vuelve más ácida"
      ],
      "respuesta": "No hay reacción: la plata está debajo del cobre",
      "explicacion": "Solo desplaza el metal que está más arriba. La plata está debajo del cobre, así que no lo desplaza."
    }
  ]
}$quimia$::jsonb,
  6,
  false),

('quimia-tecnica-organica-cuatro-enlaces', 'El carbono siempre hace cuatro enlaces',
  'La regla más útil de la química orgánica: contar los enlaces de un carbono para saber cuántos hidrógenos tiene.',
  'quimia',
  $quimia${
  "pasos": [
    "El carbono forma siempre 4 enlaces. Es la regla más útil de la química orgánica: si sabes cuántos enlaces ya tiene un carbono, sabes cuántos hidrógenos le faltan.",
    "Cuenta cada enlace según su tipo: uno simple vale 1, uno doble vale 2 y uno triple vale 3. Los hidrógenos completan lo que falta hasta llegar a 4.",
    "Ejemplo con el but-1-eno: el primer carbono tiene un doble enlace (2), así que le faltan 2 hidrógenos; el segundo tiene un doble y uno simple (3), así que 1 hidrógeno; el tercero tiene dos simples (2), así que 2; y el cuarto tiene uno simple (1), así que 3. La fórmula condensada queda $\\mathrm{CH_{2}{=}CH{-}CH_{2}{-}CH_{3}}$.",
    "Comprueba al final: si un carbono suma más de 4 enlaces, hay un error en la fórmula. Y un triple enlace deja un solo hidrógeno: en el etino, $\\mathrm{CH{\\equiv}CH}$, cada carbono tiene 1 H."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 2,
      "molecula": "but-1-eno",
      "modo": "formulas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos hidrógenos tiene el carbono central del propeno, $\\mathrm{CH_{2}{=}CH{-}CH_{3}}$?",
      "opciones": [
        "2",
        "3",
        "1",
        "0"
      ],
      "respuesta": "1",
      "explicacion": "El carbono central tiene un doble enlace (2) y un enlace simple (1): suma 3, así que le falta 1 enlace, que es un hidrógeno."
    },
    {
      "pregunta": "En el grupo –CH₂– de una cadena, ¿con cuántos átomos distintos del hidrógeno está unido el carbono?",
      "opciones": [
        "1",
        "3",
        "2",
        "4"
      ],
      "respuesta": "2",
      "explicacion": "Tiene 2 hidrógenos, así que le quedan 2 enlaces: los que lo unen a sus dos vecinos de la cadena (uno a cada lado)."
    },
    {
      "pregunta": "En el etino, ¿cuántos hidrógenos tiene cada carbono?",
      "opciones": [
        "2",
        "0",
        "3",
        "1"
      ],
      "respuesta": "1",
      "explicacion": "Cada carbono tiene un triple enlace con el otro carbono (3) y 1 enlace más, que es con un hidrógeno."
    },
    {
      "pregunta": "¿Cuál de estas fórmulas condensadas es imposible?",
      "opciones": [
        "CH₃–CH₂–CH₃",
        "CH₃–CH₂=CH₂",
        "CH₂=CH–CH₃",
        "CH≡C–CH₃"
      ],
      "respuesta": "CH₃–CH₂=CH₂",
      "explicacion": "En CH₃–CH₂=CH₂, el carbono del medio tiene un doble enlace (2), un enlace simple (1) y dos hidrógenos (2): suma 5. Un carbono nunca puede tener más de 4 enlaces."
    }
  ]
}$quimia$::jsonb,
  1,
  false),

('quimia-tecnica-organica-esqueleto-a-formula', 'Del esqueleto a la fórmula molecular',
  'Leer un dibujo en zigzag, completar los hidrógenos y usar las fórmulas generales de hidrocarburos.',
  'quimia',
  $quimia${
  "pasos": [
    "En un esqueleto (el dibujo en zigzag) cada vértice y cada extremo es un carbono. Los hidrógenos no se dibujan: se completan hasta llegar a 4 enlaces por carbono.",
    "Para hallar la fórmula molecular, cuenta los carbonos, calcula los hidrógenos de cada uno y suma. Ejemplo: el 2-metilbutano tiene 5 carbonos y 12 hidrógenos, o sea $\\mathrm{C_5H_{12}}$.",
    "Atajo para los hidrocarburos: con solo enlaces simples y cadena abierta (alcano) la fórmula es CₙH₂ₙ₊₂; con un enlace doble (alqueno) es CₙH₂ₙ; con un triple (alquino) es CₙH₂ₙ₋₂. Un anillo simple (cicloalcano) también es CₙH₂ₙ.",
    "Cada doble enlace, triple enlace o anillo (una insaturación) quita 2 hidrógenos respecto del alcano. Para contar cuántas hay: (2n + 2 − H) / 2. El benceno, $\\mathrm{C_6H_6}$, da (2·6 + 2 − 6) / 2 = 4: tres dobles enlaces y un anillo."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 1,
      "molecula": "2-metilbutano",
      "modo": "formulas"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Fórmulas generales de los hidrocarburos",
      "columnas": [
        "Compuesto",
        "Tipo",
        "Fórmula general",
        "Fórmula molecular"
      ],
      "filas": [
        [
          "Etano",
          "alcano",
          "$\\mathrm{C_nH_{2n+2}}$, n = 2",
          "$\\mathrm{C_2H_6}$"
        ],
        [
          "Butano",
          "alcano",
          "$\\mathrm{C_nH_{2n+2}}$, n = 4",
          "$\\mathrm{C_4H_{10}}$"
        ],
        [
          "Propeno",
          "alqueno",
          "$\\mathrm{C_nH_{2n}}$, n = 3",
          "$\\mathrm{C_3H_6}$"
        ],
        [
          "But-1-eno",
          "alqueno",
          "$\\mathrm{C_nH_{2n}}$, n = 4",
          "$\\mathrm{C_4H_8}$"
        ],
        [
          "Etino",
          "alquino",
          "$\\mathrm{C_nH_{2n-2}}$, n = 2",
          "$\\mathrm{C_2H_2}$"
        ],
        [
          "Propino",
          "alquino",
          "$\\mathrm{C_nH_{2n-2}}$, n = 3",
          "$\\mathrm{C_3H_4}$"
        ],
        [
          "Ciclohexano",
          "cicloalcano",
          "$\\mathrm{C_nH_{2n}}$, n = 6",
          "$\\mathrm{C_6H_{12}}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula molecular del alcano de 7 carbonos?",
      "opciones": [
        "C₇H₁₄",
        "$\\mathrm{C_7H_{16}}$",
        "C₇H₁₈",
        "C₇H₁₂"
      ],
      "respuesta": "$\\mathrm{C_7H_{16}}$",
      "explicacion": "Un alcano es CₙH₂ₙ₊₂: con n = 7 son 2·7 + 2 = 16 hidrógenos, o sea C7H16."
    },
    {
      "pregunta": "¿Cuál es la fórmula de un alqueno de 5 carbonos con un solo doble enlace?",
      "opciones": [
        "C₅H₁₂",
        "C₅H₈",
        "C₅H₁₄",
        "C₅H₁₀"
      ],
      "respuesta": "C₅H₁₀",
      "explicacion": "Un alqueno es CₙH₂ₙ: con n = 5 son 10 hidrógenos, como en el pent-1-eno, C5H10."
    },
    {
      "pregunta": "La fórmula C₄H₆ corresponde a un hidrocarburo con...",
      "opciones": [
        "Solo enlaces simples y cadena abierta",
        "Dos insaturaciones (por ejemplo, un triple enlace, dos dobles, o un doble y un anillo)",
        "Un solo enlace doble y cadena abierta",
        "Ninguna estructura posible"
      ],
      "respuesta": "Dos insaturaciones (por ejemplo, un triple enlace, dos dobles, o un doble y un anillo)",
      "explicacion": "El alcano de 4 carbonos es C₄H₁₀; C₄H₆ tiene 4 hidrógenos menos, o sea 2 insaturaciones. Por ejemplo, el but-1-ino y el buta-1,3-dieno."
    },
    {
      "pregunta": "¿Cuál de estas fórmulas NO puede ser la de un alcano de cadena abierta?",
      "opciones": [
        "C₅H₁₀",
        "C₃H₈",
        "C₆H₁₄",
        "C₂H₆"
      ],
      "respuesta": "C₅H₁₀",
      "explicacion": "Los alcanos son CₙH₂ₙ₊₂: con 5 carbonos serían 12 hidrógenos. C₅H₁₀ tiene 2 menos, por lo que tiene un doble enlace o un anillo."
    }
  ]
}$quimia$::jsonb,
  2,
  false),

('quimia-tecnica-organica-prefijos', 'Los prefijos de la cadena',
  'De 1 a 10 carbonos: met, et, prop, but, pent, hex, hept, oct, non y dec.',
  'quimia',
  $quimia${
  "pasos": [
    "El nombre de un compuesto orgánico empieza con un prefijo que dice cuántos carbonos tiene la cadena principal.",
    "Los cuatro primeros hay que memorizarlos: met- (1 carbono), et- (2), prop- (3) y but- (4). Una frase para recordar el orden: «Mamá Es Pura Bondad» (Met, Et, Prop, But).",
    "Desde el 5 se usan los números griegos, los mismos de pentágono, hexágono, heptágono y octógono: pent- (5), hex- (6), hept- (7), oct- (8), non- (9) y dec- (10).",
    "La terminación dice la familia de hidrocarburos: -ano si todos los enlaces son simples (alcano), -eno si hay un doble (alqueno) y -ino si hay un triple (alquino). Así, metano, etano, propano y butano son alcanos."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Los diez primeros alcanos",
      "columnas": [
        "Carbonos",
        "Prefijo",
        "Alcano",
        "Fórmula"
      ],
      "filas": [
        [
          "1",
          "met-",
          "metano",
          "$\\mathrm{CH_4}$"
        ],
        [
          "2",
          "et-",
          "etano",
          "$\\mathrm{C_2H_6}$"
        ],
        [
          "3",
          "prop-",
          "propano",
          "$\\mathrm{C_3H_8}$"
        ],
        [
          "4",
          "but-",
          "butano",
          "$\\mathrm{C_4H_{10}}$"
        ],
        [
          "5",
          "pent-",
          "pentano",
          "$\\mathrm{C_5H_{12}}$"
        ],
        [
          "6",
          "hex-",
          "hexano",
          "$\\mathrm{C_6H_{14}}$"
        ],
        [
          "7",
          "hept-",
          "heptano",
          "$\\mathrm{C_7H_{16}}$"
        ],
        [
          "8",
          "oct-",
          "octano",
          "$\\mathrm{C_8H_{18}}$"
        ],
        [
          "9",
          "non-",
          "nonano",
          "$\\mathrm{C_9H_{20}}$"
        ],
        [
          "10",
          "dec-",
          "decano",
          "$\\mathrm{C_{10}H_{22}}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos carbonos tiene el heptano?",
      "opciones": [
        "6",
        "8",
        "7",
        "5"
      ],
      "respuesta": "7",
      "explicacion": "Hept- es 7, como en un heptágono (7 lados)."
    },
    {
      "pregunta": "¿Qué prefijo corresponde a 5 carbonos?",
      "opciones": [
        "pent-",
        "prop-",
        "hex-",
        "but-"
      ],
      "respuesta": "pent-",
      "explicacion": "Pent- es 5, como en pentágono. Prop- es 3, but- es 4 y hex- es 6."
    },
    {
      "pregunta": "¿Cuál es el alcano de 9 carbonos?",
      "opciones": [
        "nonano",
        "octano",
        "decano",
        "heptano"
      ],
      "respuesta": "nonano",
      "explicacion": "Non- es 9. Su fórmula es $\\mathrm{C_9H_{20}}$."
    },
    {
      "pregunta": "El prefijo «but-» de butano indica...",
      "opciones": [
        "3 carbonos en la cadena",
        "Un enlace doble",
        "La presencia de un alcohol",
        "4 carbonos en la cadena"
      ],
      "respuesta": "4 carbonos en la cadena",
      "explicacion": "But- significa 4 carbonos. El enlace doble se indica con la terminación -eno y el alcohol con -ol."
    }
  ]
}$quimia$::jsonb,
  3,
  false),

('quimia-tecnica-organica-terminaciones', 'La terminación dice la familia',
  '-ano, -eno, -ino, -ol, -al, -ona, -oico, -oato, -amina y -amida: qué familia indica cada una.',
  'quimia',
  $quimia${
  "pasos": [
    "Después del prefijo, la terminación dice a qué familia pertenece el compuesto. Con los mismos dos carbonos (et-) se pueden armar compuestos muy distintos solo cambiando la terminación.",
    "Las terminaciones más importantes: -ano, -eno, -ino (hidrocarburos), -ol (alcohol), -al (aldehído), -ona (cetona), -oico (ácido carboxílico), -oato de -ilo (éster), -amina (amina) y -amida (amida). Con dos carbonos: etano, eteno, etino, etanol, etanal, ácido etanoico, etanamina y etanamida.",
    "Si la molécula tiene un grupo funcional principal, él manda en la terminación; los demás grupos se nombran como prefijos (hidroxi-, amino-, cloro-...)."
  ],
  "visuales": [
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 1,
      "moleculas": [
        "etanol",
        "etanal",
        "propanona",
        "acido-etanoico",
        "etanoato-de-metilo",
        "etanamina",
        "etanamida"
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Terminaciones de la familia con 3 carbonos",
      "columnas": [
        "Terminación",
        "Familia",
        "Ejemplo"
      ],
      "filas": [
        [
          "-ano",
          "alcano",
          "propano"
        ],
        [
          "-eno",
          "alqueno",
          "propeno"
        ],
        [
          "-ino",
          "alquino",
          "propino"
        ],
        [
          "-ol",
          "alcohol",
          "propan-1-ol"
        ],
        [
          "-al",
          "aldehído",
          "propanal"
        ],
        [
          "-ona",
          "cetona",
          "propanona"
        ],
        [
          "-oico (ácido)",
          "ácido carboxílico",
          "ácido propanoico"
        ],
        [
          "-oato de -ilo",
          "éster",
          "propanoato de metilo"
        ],
        [
          "-amina",
          "amina",
          "propan-1-amina"
        ],
        [
          "-amida",
          "amida",
          "propanamida"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "El compuesto «propanona» pertenece a la familia de...",
      "opciones": [
        "Los aldehídos",
        "Los alcoholes",
        "Las cetonas",
        "Los alquenos"
      ],
      "respuesta": "Las cetonas",
      "explicacion": "La terminación -ona indica una cetona. Los aldehídos terminan en -al y los alcoholes en -ol."
    },
    {
      "pregunta": "¿Qué es el propanal?",
      "opciones": [
        "Un alcohol",
        "Una cetona",
        "Un aldehído",
        "Un ácido carboxílico"
      ],
      "respuesta": "Un aldehído",
      "explicacion": "-al es la terminación de los aldehídos."
    },
    {
      "pregunta": "¿Qué familia indica la terminación de «etanoato de metilo»?",
      "opciones": [
        "Éster",
        "Ácido carboxílico",
        "Éter",
        "Amida"
      ],
      "respuesta": "Éster",
      "explicacion": "-oato de -ilo es la terminación de los ésteres (derivados de un ácido y un alcohol)."
    },
    {
      "pregunta": "Los nombres «etanol» y «etanamina» tienen el mismo prefijo. ¿Qué indica que sean distintos?",
      "opciones": [
        "El número de carbonos",
        "El tipo de enlace entre carbonos",
        "El estado de agregación",
        "La terminación: -ol es alcohol y -amina es amina"
      ],
      "respuesta": "La terminación: -ol es alcohol y -amina es amina",
      "explicacion": "Los dos tienen 2 carbonos (et-); la terminación define el grupo funcional."
    }
  ]
}$quimia$::jsonb,
  4,
  false),

('quimia-tecnica-organica-nombrar-ramificado', 'Nombrar un ramificado en cuatro pasos',
  'Cadena principal, numeración, ramificaciones y armado del nombre.',
  'quimia',
  $quimia${
  "pasos": [
    "Paso 1: busca la cadena principal, la cadena continua de carbonos más larga (aunque el dibujo la presente doblada). Sus carbonos dan el prefijo y la terminación -ano.",
    "Paso 2: numera esa cadena por el extremo que le dé los números más bajos a las ramificaciones. Si la molécula tiene un grupo principal o un enlace doble o triple, esos tienen prioridad para recibir el número más bajo.",
    "Paso 3: nombra cada ramificación con su número (metil, etil, propil...). Si se repite, se usan di-, tri- o tetra- y se listan todos los números. Se ordenan alfabéticamente, sin contar di-, tri-.",
    "Paso 4: arma el nombre, con los números separados por comas, los números y las letras separados por guiones y todo pegado, en minúscula. Ejemplo: 2,4-dimetilhexano: la cadena tiene 6 carbonos, los dos metilos están en los carbonos 2 y 4 (si se numerara al revés, serían 3 y 5, que son números más altos)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 3,
      "molecula": "2,4-dimetilhexano"
    }
  ],
  "quiz": [
    {
      "pregunta": "Una cadena de 5 carbonos tiene un metilo en el carbono 2. ¿Cómo se llama?",
      "opciones": [
        "4-metilpentano",
        "2-metilhexano",
        "1-metilpentano",
        "2-metilpentano"
      ],
      "respuesta": "2-metilpentano",
      "explicacion": "Se numera desde el extremo más cercano a la ramificación: el metilo queda en el carbono 2. «4-metilpentano» sería numerar del lado equivocado."
    },
    {
      "pregunta": "¿Por qué no existe el nombre «1-metilpropano»?",
      "opciones": [
        "Porque la cadena más larga tendría 4 carbonos: es el butano",
        "Porque el metilo no puede estar en el extremo",
        "Porque el propano no admite ramificaciones",
        "Porque el número 1 no se usa nunca"
      ],
      "respuesta": "Porque la cadena más larga tendría 4 carbonos: es el butano",
      "explicacion": "Un metilo en el extremo de un propano alarga la cadena a 4 carbonos: es butano (y la ramificación no existe). Por eso el metilo de un ramificado nunca lleva el número 1."
    },
    {
      "pregunta": "Un hexano con dos metilos, uno en el carbono 2 y otro en el 4, se llama...",
      "opciones": [
        "2,4-dimetilhexano",
        "2-metil-4-metilhexano",
        "2,4-dimetil hexano",
        "2,4-metilhexano"
      ],
      "respuesta": "2,4-dimetilhexano",
      "explicacion": "Si el mismo radical se repite, se usa di-, se listan los números con comas y se escribe una sola vez: 2,4-dimetilhexano."
    },
    {
      "pregunta": "En un compuesto con un etilo y un metilo, ¿cuál se nombra primero?",
      "opciones": [
        "El etilo, por orden alfabético",
        "El metilo, porque es más chico",
        "El que tiene el número más alto",
        "Da lo mismo"
      ],
      "respuesta": "El etilo, por orden alfabético",
      "explicacion": "Se ordenan alfabéticamente: etil va antes que metil. Por ejemplo, 3-etil-5-metilheptano."
    }
  ]
}$quimia$::jsonb,
  5,
  false),

('quimia-tecnica-organica-grupo-funcional', 'Reconocer el grupo funcional',
  'Mirar qué átomos hay además de C y H, y cómo está unido el carbono del C=O.',
  'quimia',
  $quimia${
  "pasos": [
    "Un grupo funcional es un átomo o grupo de átomos que da a la molécula sus propiedades características. Para reconocerlo, busca los átomos que no son carbono ni hidrógeno y cómo están unidos.",
    "Pistas: –OH es un alcohol; C–O–C es un éter; un halógeno (F, Cl, Br, I) es un haluro; N es una amina o una amida; un doble enlace C=C es un alqueno y un triple C≡C, un alquino.",
    "Si aparece un C=O (carbonilo), mira a qué está unido ese carbono: a un hidrógeno (y un carbono, o ninguno) es un aldehído; a dos carbonos, una cetona; a un –OH, un ácido carboxílico; a un –O–C, un éster; y a un –N, una amida."
  ],
  "visuales": [
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 2,
      "moleculas": [
        "propan-1-ol",
        "metoxietano",
        "propanal",
        "propanona",
        "acido-propanoico",
        "propanoato-de-metilo",
        "propan-1-amina",
        "propanamida",
        "1-cloropropano"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}CO{-}CH_{3}}$?",
      "opciones": [
        "Cetona",
        "Aldehído",
        "Éter",
        "Alcohol"
      ],
      "respuesta": "Cetona",
      "explicacion": "El C=O está en el medio de la cadena, unido a dos carbonos: es una cetona."
    },
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}CH_{2}{-}CHO}$?",
      "opciones": [
        "Cetona",
        "Ácido carboxílico",
        "Éster",
        "Aldehído"
      ],
      "respuesta": "Aldehído",
      "explicacion": "El C=O está en el extremo, unido a un hidrógeno: es un aldehído."
    },
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{2}OCH_{3}{-}CH_{3}}$?",
      "opciones": [
        "Alcohol",
        "Éster",
        "Éter",
        "Cetona"
      ],
      "respuesta": "Éter",
      "explicacion": "Hay un oxígeno entre dos carbonos (C–O–C) y ningún C=O: es un éter."
    },
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}COO{-}CH_{3}}$?",
      "opciones": [
        "Ácido carboxílico",
        "Éster",
        "Éter",
        "Amida"
      ],
      "respuesta": "Éster",
      "explicacion": "El carbono del C=O está unido a un –O–C (un oxígeno que a su vez está unido a otro carbono): es un éster. Si estuviera unido a –OH sería un ácido."
    }
  ]
}$quimia$::jsonb,
  6,
  false),

('quimia-tecnica-organica-isomeros', 'Isómeros: misma fórmula, distinta estructura',
  'Cómo reconocer isómeros y de qué tipo son (cadena, posición, función).',
  'quimia',
  $quimia${
  "pasos": [
    "Los isómeros son compuestos con la misma fórmula molecular pero distinta estructura (los átomos están unidos de otra manera). Tienen propiedades distintas.",
    "Para reconocerlos: calcula la fórmula molecular de cada uno. Si coincide y las estructuras son distintas, son isómeros. Por ejemplo, el butano y el 2-metilpropano son C4H10.",
    "Hay tres tipos principales. De cadena: cambia el esqueleto de carbonos (lineal o ramificado). De posición: cambia dónde está el grupo o el enlace múltiple. De función: cambia el grupo funcional, o sea, la familia.",
    "Cuantos más carbonos, más isómeros de cadena: los alcanos de 4, 5 y 6 carbonos tienen 2, 3 y 5 isómeros respectivamente."
  ],
  "visuales": [
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 1,
      "moleculas": [
        "butano",
        "2-metilpropano"
      ],
      "isomeria": "cadena"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tipo de isómeros son el etanol y el metoximetano?",
      "opciones": [
        "De función",
        "De cadena",
        "De posición",
        "No son isómeros"
      ],
      "respuesta": "De función",
      "explicacion": "Los dos son C2H6O, pero uno es un alcohol y el otro un éter: cambia el grupo funcional."
    },
    {
      "pregunta": "¿Qué tipo de isómeros son el propan-1-ol y el propan-2-ol?",
      "opciones": [
        "De posición",
        "De cadena",
        "De función",
        "Son el mismo compuesto"
      ],
      "respuesta": "De posición",
      "explicacion": "Los dos son alcoholes de 3 carbonos, con el –OH en distinto carbono: isomería de posición."
    },
    {
      "pregunta": "¿Cuántos isómeros de cadena tiene el pentano, C₅H₁₂ (contando el pentano mismo)?",
      "opciones": [
        "2",
        "5",
        "3",
        "4"
      ],
      "respuesta": "3",
      "explicacion": "Son el pentano, el 2-metilbutano y el 2,2-dimetilpropano."
    },
    {
      "pregunta": "Dos compuestos con fórmulas moleculares C₃H₈O y C₃H₆O, ¿son isómeros?",
      "opciones": [
        "No: no tienen la misma fórmula molecular",
        "Sí: los dos tienen 3 carbonos",
        "Sí: los dos tienen oxígeno",
        "Solo si están en el mismo estado"
      ],
      "respuesta": "No: no tienen la misma fórmula molecular",
      "explicacion": "Para ser isómeros deben tener exactamente la misma fórmula molecular (los mismos átomos en la misma cantidad)."
    }
  ]
}$quimia$::jsonb,
  7,
  false),

('quimia-tecnica-organica-combustion', 'Combustión de un hidrocarburo en tres pasos',
  'Balancear la combustión completa: CO₂ igual a los carbonos, H₂O igual a la mitad de los hidrógenos y O₂ al final.',
  'quimia',
  $quimia${
  "pasos": [
    "En la combustión completa un hidrocarburo reacciona con oxígeno (O₂) y produce dióxido de carbono (CO₂) y agua (H₂O). Se balancea en tres pasos, siempre en el mismo orden.",
    "Paso 1: el coeficiente del CO₂ es el número de carbonos. Paso 2: el coeficiente del H₂O es la mitad del número de hidrógenos. Paso 3: cuenta los oxígenos de la derecha y divide por 2 para obtener el O₂. Si da un número con «medio», multiplica toda la ecuación por 2.",
    "Ejemplo con el propano ($\\mathrm{C_3H_8}$): 3 CO₂, 4 H₂O, y 3·2 + 4 = 10 oxígenos, o sea 5 O₂. $\\mathrm{C_3H_8} + 5\\,\\mathrm{O_2} \\rightarrow 3\\,\\mathrm{CO_2} + 4\\,\\mathrm{H_2O}$",
    "Ejemplo con fracción, el etano ($\\mathrm{C_2H_6}$): 2 CO₂, 3 H₂O y 2·2 + 3 = 7 oxígenos, o sea 7/2 de O₂ (tres moléculas y media). Como sale un medio, se duplica todo: $2\\,\\mathrm{C_2H_6} + 7\\,\\mathrm{O_2} \\rightarrow 4\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O}$"
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Combustión completa de seis hidrocarburos",
      "columnas": [
        "Hidrocarburo",
        "Combustión completa"
      ],
      "filas": [
        [
          "metano",
          "$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$"
        ],
        [
          "etano",
          "$2\\,\\mathrm{C_2H_6} + 7\\,\\mathrm{O_2} \\rightarrow 4\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O}$"
        ],
        [
          "propano",
          "$\\mathrm{C_3H_8} + 5\\,\\mathrm{O_2} \\rightarrow 3\\,\\mathrm{CO_2} + 4\\,\\mathrm{H_2O}$"
        ],
        [
          "butano",
          "$2\\,\\mathrm{C_4H_{10}} + 13\\,\\mathrm{O_2} \\rightarrow 8\\,\\mathrm{CO_2} + 10\\,\\mathrm{H_2O}$"
        ],
        [
          "eteno",
          "$\\mathrm{C_2H_4} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$"
        ],
        [
          "etino",
          "$2\\,\\mathrm{C_2H_2} + 5\\,\\mathrm{O_2} \\rightarrow 4\\,\\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En la combustión completa del propano, ¿cuántos O₂ se necesitan por cada C₃H₈?",
      "opciones": [
        "3",
        "5",
        "4",
        "10"
      ],
      "respuesta": "5",
      "explicacion": "$\\mathrm{C_3H_8} + 5\\,\\mathrm{O_2} \\rightarrow 3\\,\\mathrm{CO_2} + 4\\,\\mathrm{H_2O}$ Los oxígenos de la derecha son 3·2 + 4 = 10, o sea 5 moléculas de O₂."
    },
    {
      "pregunta": "En la combustión completa del metano, ¿cuántos H₂O se forman por cada CH₄?",
      "opciones": [
        "2",
        "1",
        "4",
        "3"
      ],
      "respuesta": "2",
      "explicacion": "$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$ Los 4 hidrógenos forman 4/2 = 2 moléculas de agua."
    },
    {
      "pregunta": "Al balancear la combustión del butano, $\\mathrm{C_4H_{10}}$, ¿cuántos O₂ se necesitan si se escriben 2 moléculas de butano?",
      "opciones": [
        "13",
        "6",
        "7",
        "26"
      ],
      "respuesta": "13",
      "explicacion": "$2\\,\\mathrm{C_4H_{10}} + 13\\,\\mathrm{O_2} \\rightarrow 8\\,\\mathrm{CO_2} + 10\\,\\mathrm{H_2O}$ Con 2 C₄H₁₀ se forman 8 CO₂ y 10 H₂O: 16 + 10 = 26 oxígenos, o sea 13 O₂."
    },
    {
      "pregunta": "¿Por qué a veces hay que duplicar todos los coeficientes en una combustión?",
      "opciones": [
        "Porque siempre se necesitan dos moléculas de hidrocarburo",
        "Porque el O₂ puede dar un «medio», y los coeficientes deben ser enteros",
        "Porque el CO₂ tiene 2 oxígenos",
        "No hay que duplicar nunca"
      ],
      "respuesta": "Porque el O₂ puede dar un «medio», y los coeficientes deben ser enteros",
      "explicacion": "Cuando el número de hidrógenos no es múltiplo de 4, el O₂ da un número con «medio» (como 7/2). Se multiplica todo por 2 para que los coeficientes sean enteros."
    }
  ]
}$quimia$::jsonb,
  8,
  false);

-- 3) Clases (requiere_pro = true): un curso lineal en orden de curso; la primera es preview gratis.
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values

('quimia-clase-redox-numero-oxidacion-herramienta', 'El número de oxidación como herramienta',
  'Reglas ordenadas, casos especiales, compuestos covalentes y los estados de oxidación más comunes de la tabla.',
  'quimia',
  $quimia${
  "pasos": [
    "El número de oxidación (o estado de oxidación) es la carga que tendría un átomo si los electrones de cada enlace se le asignaran al átomo más electronegativo. Es una herramienta contable: en los compuestos covalentes no es una carga real, pero permite seguir a los electrones en una reacción, decidir quién se oxida y quién se reduce, balancear ecuaciones y armar nombres. Las reglas básicas ya aparecen en la Clase «Valencia, número de oxidación y cómo armar fórmulas»; aquí se ordenan, se completan con los casos especiales y se usan para calcular.",
    "Cuando dos reglas parecen chocar, gana la que está más arriba en esta lista. 1) La suma de los números de oxidación es la carga de la especie: 0 si es neutra y la carga si es un ion. 2) Un elemento libre (Fe, $\\mathrm{O_2}$, $\\mathrm{S_8}$, $\\mathrm{Cl_2}$) vale 0. 3) El flúor es siempre −1. 4) Los metales alcalinos son +1, los alcalinotérreos +2 y el aluminio +3 (el zinc +2 y la plata +1 también son casi fijos). 5) El hidrógeno es +1, salvo unido a un metal, donde es −1. 6) El oxígeno es −2, salvo en los peróxidos (−1) y en $\\mathrm{OF_2}$ (+2). El número de los demás elementos se calcula con la suma.",
    "Los casos especiales son los que más se preguntan. En los hidruros metálicos el hidrógeno es −1, porque el metal es menos electronegativo que él: $\\mathrm{NaH}$, $\\mathrm{CaH_2}$. En los peróxidos el oxígeno es −1, porque cada oxígeno comparte un enlace con el otro oxígeno (esos electrones se reparten por igual): $\\mathrm{H_2O_2}$, $\\mathrm{Na_2O_2}$. Y en $\\mathrm{OF_2}$ el oxígeno es +2, porque el flúor (3,98) es más electronegativo que el oxígeno (3,44). La tabla muestra cada caso con su cuenta.",
    "Ejemplos resueltos. En $\\mathrm{NH_4^{+}}$: x + 4·(+1) = +1, así que el nitrógeno es −3. En $\\mathrm{K_2Cr_2O_7}$: 2·(+1) + 2x + 7·(−2) = 0, así que el cromo es +6. En $\\mathrm{ClO_4^{-}}$: x + 4·(−2) = −1, así que el cloro es +7. En cada caso se suma como en la Técnica de tres pasos: números conocidos, suma igual a la carga y despeje.",
    "A veces el resultado no es un número entero. En $\\mathrm{Fe_3O_4}$: 3x + 4·(−2) = 0 da x = 8/3. Un número fraccionario indica que hay átomos del mismo elemento con números distintos: en el $\\mathrm{Fe_3O_4}$ hay un hierro con +2 y dos hierros con +3 (1·2 + 2·3 = 8 = 3 × 8/3). En el colegio se trabaja con el promedio o se evita.",
    "Los compuestos covalentes también tienen números de oxidación: se reparten los electrones de cada enlace según la electronegatividad. El carbono es un buen ejemplo, porque en sus compuestos toma casi todos los valores entre −4 y +4: $\\mathrm{CH_4}$ (−4), $\\mathrm{CH_3OH}$ (−2), $\\mathrm{CH_2O}$ (0), $\\mathrm{HCOOH}$ (+2) y $\\mathrm{CO_2}$ (+4). Cada paso es una oxidación de 2 unidades. Esto se retoma en química orgánica, con la oxidación de los alcoholes.",
    "Cada elemento también tiene un estado de oxidación «más común», el que suelen dar las tablas escolares. En los grupos principales sale, casi siempre, de la regla por grupo: todos los del grupo 1 son +1, todos los del 2 son +2 y todos los del 17 son −1; en el 13 es +3 (salvo el talio, +1); en el 16 es −2 (salvo el polonio, +4); en el 14 es +4 (salvo el plomo, +2); y en el 15 el nitrógeno es −3, el fósforo +5 y los demás +3. Es un criterio de tabla: casi todos los elementos tienen más de un estado (el hierro tiene +2 y +3, el azufre −2, +4 y +6), así que «el más común» no es «el único». Las tres tablas siguientes reúnen los valores de todos los elementos hasta el 103 (los posteriores no tienen un estado de oxidación establecido).",
    "Los metales de transición siguen menos la regla por grupo: cada grupo trae un valor distinto según el elemento. Conviene recordar las familias más habituales: Sc e Y son +3; Ti, Zr y Hf, +4; V, Nb y Ta, +5; el cromo es +3 y el molibdeno y el wolframio, +6; el manganeso es +2; el hierro, +3; el cobalto y el níquel, +2; el cobre, +2; el zinc, el cadmio y el mercurio, +2; la plata, +1. Los lantánidos son casi todos +3, y los actínidos varían (el uranio es +6, el torio +4).",
    "Los números de oxidación de los ejemplos de colegio van de −4 (el carbono en el metano) a +7 (el manganeso en el permanganato y el cloro en el perclorato). Los valores positivos altos aparecen cuando el elemento está unido a oxígeno o flúor, que son muy electronegativos; los negativos, cuando está unido a hidrógeno o a metales.",
    "Errores frecuentes: confundir la carga de un ion ($\\mathrm{Fe^{3+}}$, con el signo después del número) con el número de oxidación ($\\overset{+3}{\\mathrm{Fe}}$, con el signo antes); olvidar multiplicar por el subíndice; dar por hecho que el oxígeno es siempre −2 o el hidrógeno siempre +1; y creer que en un compuesto covalente el número de oxidación es una carga real."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Casos especiales",
      "columnas": [
        "Sustancia",
        "Elemento",
        "Número",
        "Motivo"
      ],
      "filas": [
        [
          "$\\mathrm{NaH}$",
          "H",
          "−1",
          "está unido a un metal (menos electronegativo)"
        ],
        [
          "$\\mathrm{CaH_2}$",
          "H",
          "−1",
          "hidruro metálico"
        ],
        [
          "$\\mathrm{H_2O_2}$",
          "O",
          "−1",
          "peróxido: enlace O–O"
        ],
        [
          "$\\mathrm{Na_2O_2}$",
          "O",
          "−1",
          "peróxido: enlace O–O"
        ],
        [
          "$\\mathrm{OF_2}$",
          "O",
          "+2",
          "el flúor es más electronegativo"
        ],
        [
          "$\\mathrm{O_2}$",
          "O",
          "0",
          "elemento libre"
        ]
      ]
    },
    {
      "tipo": "quimia.oxidacion",
      "despuesDePaso": 3,
      "formula": "NH4",
      "carga": 1,
      "incognita": "N"
    },
    {
      "tipo": "quimia.oxidacion",
      "despuesDePaso": 3,
      "formula": "K2Cr2O7",
      "incognita": "Cr"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "El carbono, de −4 a +4",
      "columnas": [
        "Sustancia",
        "Número del carbono",
        "Nombre"
      ],
      "filas": [
        [
          "$\\mathrm{CH_4}$",
          "−4",
          "metano"
        ],
        [
          "$\\mathrm{CH_3OH}$",
          "−2",
          "metanol"
        ],
        [
          "$\\mathrm{CH_2O}$",
          "0",
          "metanal"
        ],
        [
          "$\\mathrm{HCOOH}$",
          "+2",
          "ácido metanoico"
        ],
        [
          "$\\mathrm{CO_2}$",
          "+4",
          "dióxido de carbono"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Estados de oxidación más comunes: grupos principales",
      "columnas": [
        "Grupos principales",
        "Estado de oxidación más común"
      ],
      "filas": [
        [
          "Grupo 1",
          "H, Li, Na, K, Rb, Cs, Fr: +1"
        ],
        [
          "Grupo 2",
          "Be, Mg, Ca, Sr, Ba, Ra: +2"
        ],
        [
          "Grupo 13",
          "B, Al, Ga, In: +3; Tl: +1"
        ],
        [
          "Grupo 14",
          "C, Si, Ge, Sn: +4; Pb: +2"
        ],
        [
          "Grupo 15",
          "N: −3; P: +5; As, Sb, Bi: +3"
        ],
        [
          "Grupo 16",
          "O, S, Se, Te: −2; Po: +4"
        ],
        [
          "Grupo 17",
          "F, Cl, Br, I, At: −1"
        ],
        [
          "Grupo 18",
          "He, Ne, Ar, Kr, Xe, Rn: 0"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Estados de oxidación más comunes: metales de transición",
      "columnas": [
        "Metales de transición",
        "Estado de oxidación más común"
      ],
      "filas": [
        [
          "Grupo 3",
          "Sc, Y: +3"
        ],
        [
          "Grupo 4",
          "Ti, Zr, Hf: +4"
        ],
        [
          "Grupo 5",
          "V, Nb, Ta: +5"
        ],
        [
          "Grupo 6",
          "Cr: +3; Mo, W: +6"
        ],
        [
          "Grupo 7",
          "Mn: +2; Tc: +7; Re: +4"
        ],
        [
          "Grupo 8",
          "Fe, Ru: +3; Os: +4"
        ],
        [
          "Grupo 9",
          "Co: +2; Rh, Ir: +3"
        ],
        [
          "Grupo 10",
          "Ni, Pd, Pt: +2"
        ],
        [
          "Grupo 11",
          "Cu: +2; Ag: +1; Au: +3"
        ],
        [
          "Grupo 12",
          "Zn, Cd, Hg: +2"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Estados de oxidación más comunes: lantánidos y actínidos",
      "columnas": [
        "Bloque f",
        "Estado de oxidación más común"
      ],
      "filas": [
        [
          "Lantánidos (La a Lu)",
          "La, Ce, Pr, Nd, Pm, Sm, Eu, Gd, Tb, Dy, Ho, Er, Tm, Yb, Lu: +3"
        ],
        [
          "Actínidos (Ac a Lr)",
          "Ac, Am, Cm, Bk, Cf, Es, Fm, Md, Lr: +3; Th, Pu: +4; Pa, Np: +5; U: +6; No: +2"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué número de oxidación tiene el nitrógeno en el ion amonio, $\\mathrm{NH_4^{+}}$?",
      "opciones": [
        "+3",
        "+5",
        "+1",
        "−3"
      ],
      "respuesta": "−3",
      "explicacion": "x + 4·(+1) = +1, así que x = −3. Es uno de los pocos casos en que el nitrógeno es negativo con hidrógeno."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el oxígeno en el peróxido de sodio, $\\mathrm{Na_2O_2}$?",
      "opciones": [
        "−2",
        "0",
        "+1",
        "−1"
      ],
      "respuesta": "−1",
      "explicacion": "El sodio es +1: 2·(+1) + 2x = 0, así que x = −1. En los peróxidos el oxígeno es −1, no −2."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el hidrógeno en el hidruro de calcio, $\\mathrm{CaH_2}$?",
      "opciones": [
        "−1",
        "+1",
        "0",
        "+2"
      ],
      "respuesta": "−1",
      "explicacion": "El calcio es +2: (+2) + 2x = 0, así que x = −1. Unido a un metal, el hidrógeno es −1."
    },
    {
      "pregunta": "¿Qué número de oxidación tiene el carbono en el metanol, $\\mathrm{CH_3OH}$?",
      "opciones": [
        "0",
        "−2",
        "−4",
        "+2"
      ],
      "respuesta": "−2",
      "explicacion": "x + 4·(+1) + (−2) = 0, así que x = −2. Está entre el metano (−4) y el metanal (0)."
    },
    {
      "pregunta": "En el $\\mathrm{Fe_3O_4}$ el número de oxidación promedio del hierro es 8/3. ¿Qué significa?",
      "opciones": [
        "El hierro tiene una carga fraccionaria real",
        "Hay átomos de hierro con +2 y otros con +3",
        "Hay un error: el número de oxidación siempre es entero",
        "Todos los hierros están en +2"
      ],
      "respuesta": "Hay átomos de hierro con +2 y otros con +3",
      "explicacion": "Un promedio no entero indica que hay átomos del mismo elemento con números distintos. En este óxido, uno con +2 y dos con +3."
    },
    {
      "pregunta": "Según la tabla de estados de oxidación más comunes, ¿cuál se asigna al nitrógeno?",
      "opciones": [
        "+3",
        "+5",
        "0",
        "−3"
      ],
      "respuesta": "−3",
      "explicacion": "El nitrógeno es del grupo 15, cuyo valor por grupo es −3 (aunque también tiene +1, +2, +3, +4 y +5 en distintos compuestos)."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-redox-oxidacion-reduccion-agentes', 'Oxidación, reducción y agentes',
  'Qué es oxidarse y reducirse, semirreacciones, agentes oxidante y reductor, tipos de reacciones redox y ejemplos clásicos.',
  'quimia',
  $quimia${
  "pasos": [
    "Oxidación y reducción son procesos con electrones. Históricamente «oxidar» era combinarse con oxígeno (de ahí el nombre) y «reducir» era quitarle el oxígeno a un óxido, como se hace en la metalurgia. Hoy se definen por los electrones: oxidarse es perder electrones y reducirse es ganarlos, haya o no oxígeno. En los dos casos cambia el número de oxidación: sube al oxidarse y baja al reducirse.",
    "Toda reacción redox se puede separar en dos semirreacciones. En la oxidación los electrones aparecen a la derecha (se liberan): $\\mathrm{Zn} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{e^{-}}$ En la reducción aparecen a la izquierda (se captan): $\\mathrm{Cu^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Cu}$ Al sumar las dos, los electrones se cancelan y queda la reacción completa: $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$",
    "Mira la reacción entre el zinc y los iones cobre (II) paso a paso: los números de oxidación, quién sube, quién baja, los electrones y los agentes.",
    "El agente oxidante es la sustancia que se reduce (le quita electrones a otra y por eso la oxida); el agente reductor es la que se oxida (le da electrones a otra y por eso la reduce). Un buen agente oxidante es una sustancia que se reduce con facilidad (O₂, Cl₂, KMnO₄, HNO₃, K₂Cr₂O₇). Un buen agente reductor se oxida con facilidad (los metales como Na, Zn o Mg, el H₂, el C, el CO).",
    "Ejemplo clásico 1: la combustión. $\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$ El carbono pasa de −4 a +4: pierde 8 electrones y se oxida. Los 4 átomos de oxígeno de los $\\mathrm{O_2}$ pasan de 0 a −2: ganan 8 electrones y se reducen. El oxígeno es el agente oxidante y el metano el reductor. Toda combustión completa es una reacción redox, desde una vela hasta un motor.",
    "Ejemplo clásico 2: la síntesis a partir de elementos. $2\\,\\mathrm{Mg} + \\mathrm{O_2} \\rightarrow 2\\,\\mathrm{MgO}$ Cada magnesio pasa de 0 a +2 (pierde 2 electrones, y son 2 átomos: 4) y cada oxígeno pasa de 0 a −2 (gana 2, y son 2 átomos: 4). Lo mismo pasa con $2\\,\\mathrm{Na} + \\mathrm{Cl_2} \\rightarrow 2\\,\\mathrm{NaCl}$ Aquí no hay oxígeno y también es una oxidación del sodio y una reducción del cloro.",
    "Ejemplo clásico 3: el desplazamiento de un metal por otro. En forma molecular: $\\mathrm{Zn} + \\mathrm{CuSO_4} \\rightarrow \\mathrm{ZnSO_4} + \\mathrm{Cu}$ El ion sulfato aparece igual a los dos lados: es un ion espectador y no participa (por eso la ecuación iónica neta es solo $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$).",
    "Ejemplo clásico 4: la reducción de un óxido. En los altos hornos, el monóxido de carbono le quita el oxígeno al óxido de hierro (III) y libera hierro: $\\mathrm{Fe_2O_3} + 3\\,\\mathrm{CO} \\rightarrow 2\\,\\mathrm{Fe} + 3\\,\\mathrm{CO_2}$ El hierro baja de +3 a 0 (se reduce, el Fe₂O₃ es el oxidante) y el carbono sube de +2 a +4 (se oxida, el CO es el reductor).",
    "Agentes oxidantes y reductores comunes, con el cambio que suelen tener. Los oxidantes fuertes (KMnO₄, K₂Cr₂O₇, HNO₃) contienen un elemento en un número muy alto que baja mucho al reducirse; los reductores suelen ser metales o especies con el elemento en un número bajo.",
    "La dismutación (o desproporción) es un caso especial: una misma sustancia se oxida y se reduce a la vez. El agua oxigenada lo hace: $2\\,\\mathrm{H_2O_2} \\rightarrow 2\\,\\mathrm{H_2O} + \\mathrm{O_2}$ Cada oxígeno del $\\mathrm{H_2O_2}$ tiene −1; una parte sube a 0 (en el $\\mathrm{O_2}$) y otra baja a −2 (en el agua). Otro caso clásico es el cloro en una base: $\\mathrm{Cl_2} + 2\\,\\mathrm{OH^{-}} \\rightarrow \\mathrm{Cl^{-}} + \\mathrm{ClO^{-}} + \\mathrm{H_2O}$ El cloro pasa de 0 a −1 y a +1.",
    "La vida cotidiana está llena de reacciones redox. La respiración celular quema la glucosa con oxígeno: $\\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2} \\rightarrow 6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O}$ El carbono de la glucosa tiene un promedio de 0 y pasa a +4. Y la oxidación del hierro (la herrumbre) empieza con $4\\,\\mathrm{Fe} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{Fe_2O_3}$ (en la realidad el óxido es hidratado y necesita agua). El hierro pasa de 0 a +3.",
    "Errores frecuentes: confundir el proceso con el agente (el agente oxidante es el que se reduce); creer que oxidar siempre necesita oxígeno (el sodio se oxida con cloro); pensar que solo se pierden electrones (siempre hay alguien que los gana); y olvidar que en la ecuación balanceada los electrones perdidos y ganados son iguales."
  ],
  "visuales": [
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 2,
      "ejemplo": "zn-cu"
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 4,
      "ejemplo": "ch4-o2"
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 5,
      "ejemplo": "mg-o2"
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 7,
      "ejemplo": "fe2o3-co"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Agentes oxidantes comunes",
      "columnas": [
        "Agente oxidante",
        "Elemento que se reduce",
        "Cambio"
      ],
      "filas": [
        [
          "$\\mathrm{KMnO_4}$",
          "Mn",
          "+7 → +2 (medio ácido)"
        ],
        [
          "$\\mathrm{K_2Cr_2O_7}$",
          "Cr",
          "+6 → +3"
        ],
        [
          "$\\mathrm{HNO_3}$",
          "N",
          "+5 → +2 (diluido)"
        ],
        [
          "$\\mathrm{O_2}$",
          "O",
          "0 → −2"
        ],
        [
          "$\\mathrm{Cl_2}$",
          "Cl",
          "0 → −1"
        ],
        [
          "$\\mathrm{H_2O_2}$",
          "O",
          "−1 → −2"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Agentes reductores comunes",
      "columnas": [
        "Agente reductor",
        "Elemento que se oxida",
        "Cambio"
      ],
      "filas": [
        [
          "$\\mathrm{Zn}$",
          "Zn",
          "0 → +2"
        ],
        [
          "$\\mathrm{Na}$",
          "Na",
          "0 → +1"
        ],
        [
          "$\\mathrm{H_2}$",
          "H",
          "0 → +1"
        ],
        [
          "$\\mathrm{CO}$",
          "C",
          "+2 → +4"
        ],
        [
          "$\\mathrm{Fe^{2+}}$",
          "Fe",
          "+2 → +3"
        ],
        [
          "$\\mathrm{I^{-}}$",
          "I",
          "−1 → 0"
        ]
      ]
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 9,
      "ejemplo": "h2o2"
    }
  ],
  "quiz": [
    {
      "pregunta": "En $\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$ ¿qué elemento se oxida?",
      "opciones": [
        "El oxígeno",
        "El carbono",
        "El hidrógeno",
        "Ninguno: es una combustión, no una reacción redox"
      ],
      "respuesta": "El carbono",
      "explicacion": "El carbono pasa de −4 a +4: su número sube, así que se oxida. El hidrógeno se mantiene en +1 y el oxígeno baja de 0 a −2."
    },
    {
      "pregunta": "En esa misma combustión, ¿cuál es el agente oxidante?",
      "opciones": [
        "$\\mathrm{CH_4}$",
        "$\\mathrm{CO_2}$",
        "$\\mathrm{H_2O}$",
        "$\\mathrm{O_2}$"
      ],
      "respuesta": "$\\mathrm{O_2}$",
      "explicacion": "El agente oxidante es el que se reduce: el oxígeno (0 → −2). El metano es el agente reductor."
    },
    {
      "pregunta": "En $2\\,\\mathrm{Mg} + \\mathrm{O_2} \\rightarrow 2\\,\\mathrm{MgO}$ ¿cuántos electrones pierde cada átomo de magnesio?",
      "opciones": [
        "4",
        "2",
        "1",
        "8"
      ],
      "respuesta": "2",
      "explicacion": "Cada magnesio pasa de 0 a +2: pierde 2 electrones. Los 2 átomos pierden 4 en total, que son los 4 que ganan los 2 átomos de oxígeno."
    },
    {
      "pregunta": "¿Qué es una dismutación?",
      "opciones": [
        "Una reacción en la que una misma sustancia se oxida y se reduce a la vez",
        "Una reacción en la que no cambia ningún número de oxidación",
        "Una reacción en la que dos sustancias intercambian iones",
        "Una reacción que solo ocurre en medio básico"
      ],
      "respuesta": "Una reacción en la que una misma sustancia se oxida y se reduce a la vez",
      "explicacion": "Por ejemplo, el agua oxigenada: el oxígeno pasa de −1 a 0 (en el O₂) y a −2 (en el H₂O)."
    },
    {
      "pregunta": "¿Cuál de estas afirmaciones es correcta?",
      "opciones": [
        "Oxidarse significa siempre ganar oxígeno y ganar electrones",
        "Un elemento puede oxidarse sin que haya oxígeno en la reacción",
        "El agente reductor es el que se reduce",
        "En una reacción redox pueden perderse más electrones de los que se ganan"
      ],
      "respuesta": "Un elemento puede oxidarse sin que haya oxígeno en la reacción",
      "explicacion": "En la reacción del sodio con el cloro, el sodio se oxida (0 → +1) sin que haya oxígeno. Los electrones perdidos y ganados siempre son iguales."
    },
    {
      "pregunta": "En $\\mathrm{Zn} + \\mathrm{CuSO_4} \\rightarrow \\mathrm{ZnSO_4} + \\mathrm{Cu}$ ¿qué papel tiene el ion sulfato?",
      "opciones": [
        "Es un ion espectador: no cambia y no participa",
        "Es el agente oxidante",
        "Es el agente reductor",
        "Se reduce a azufre"
      ],
      "respuesta": "Es un ion espectador: no cambia y no participa",
      "explicacion": "El azufre sigue en +6 a los dos lados: el ion sulfato no gana ni pierde electrones."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-redox-balanceo-numero-oxidacion', 'Balanceo por cambio del número de oxidación',
  'El método paso a paso: cambios de número, mínimo común múltiplo de los electrones y tanteo, con cuatro ejemplos resueltos.',
  'quimia',
  $quimia${
  "pasos": [
    "El método del cambio del número de oxidación se basa en una sola idea: los electrones que pierde un elemento son los que gana otro. Sirve para ecuaciones moleculares, escritas con las fórmulas completas.",
    "Los pasos son cinco. 1) Escribe la ecuación sin balancear. 2) Calcula el número de oxidación de cada elemento y detecta los que cambian. 3) Anota cuántos electrones gana o pierde cada átomo y multiplica por la cantidad de átomos. 4) Iguala los electrones (con el mínimo común múltiplo) y coloca esos coeficientes. 5) Completa el resto por tanteo, en este orden: metales, no metales, hidrógeno y, al final, oxígeno. Después, verifica.",
    "Ejemplo 1: el hierro con el oxígeno, $\\mathrm{Fe} + \\mathrm{O_2} \\rightarrow \\mathrm{Fe_2O_3}$. El hierro sube de 0 a +3: pierde 3 electrones por átomo. Cada átomo de oxígeno baja de 0 a −2: gana 2, o sea 4 por cada $\\mathrm{O_2}$. El mínimo común múltiplo de 3 y 4 es 12: 4 átomos de hierro pierden 12 electrones y 3 moléculas de $\\mathrm{O_2}$ ganan 12. Resultado: $4\\,\\mathrm{Fe} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{Fe_2O_3}$",
    "Ejemplo 2: el cobre con el ácido nítrico diluido, $\\mathrm{Cu} + \\mathrm{HNO_3} \\rightarrow \\mathrm{Cu(NO_3)_2} + \\mathrm{NO} + \\mathrm{H_2O}$. El cobre sube de 0 a +2 (pierde 2). El nitrógeno baja de +5 a +2 (gana 3). El mínimo común múltiplo es 6: 3 Cu y 2 N. Se colocan 3 Cu y 2 NO. Falta el nitrógeno que queda como nitrato: 3 $\\mathrm{Cu(NO_3)_2}$ llevan 6 nitratos, en total 2 + 6 = 8 HNO₃; el hidrógeno da 4 $\\mathrm{H_2O}$. $3\\,\\mathrm{Cu} + 8\\,\\mathrm{HNO_3} \\rightarrow 3\\,\\mathrm{Cu(NO_3)_2} + 2\\,\\mathrm{NO} + 4\\,\\mathrm{H_2O}$",
    "Fíjate que en el ejemplo 2 el ácido nítrico cumple dos funciones: 2 de sus 8 moléculas se reducen (el nitrógeno pasa de +5 a +2) y las otras 6 solo aportan los nitratos que acompañan al cobre (el nitrógeno queda en +5). Por eso el coeficiente del HNO₃ no sale de la cuenta de electrones, sino del tanteo posterior.",
    "Ejemplo 3: el permanganato con el ácido clorhídrico, $\\mathrm{KMnO_4} + \\mathrm{HCl} \\rightarrow \\mathrm{KCl} + \\mathrm{MnCl_2} + \\mathrm{Cl_2} + \\mathrm{H_2O}$. El manganeso baja de +7 a +2 (gana 5). Parte del cloro sube de −1 a 0 (pierde 1 por átomo, o 2 por cada $\\mathrm{Cl_2}$). El mínimo común múltiplo es 10: 2 Mn ganan 10 y 10 Cl pierden 10 (5 $\\mathrm{Cl_2}$). Después se completa: 2 KCl, 2 $\\mathrm{MnCl_2}$, y el cloro total de la derecha (2 + 4 + 10 = 16) fija 16 HCl y 8 $\\mathrm{H_2O}$. $2\\,\\mathrm{KMnO_4} + 16\\,\\mathrm{HCl} \\rightarrow 2\\,\\mathrm{KCl} + 2\\,\\mathrm{MnCl_2} + 5\\,\\mathrm{Cl_2} + 8\\,\\mathrm{H_2O}$",
    "En el ejemplo 3, de los 16 HCl solo 10 actúan como agente reductor (el cloro pasa a $\\mathrm{Cl_2}$); los otros 6 quedan como cloruro en KCl y $\\mathrm{MnCl_2}$. Verificación de átomos: 2 K, 2 Mn, 8 O, 16 H, 16 Cl a la izquierda y 2 K, 16 Cl, 2 Mn, 16 H, 8 O a la derecha.",
    "Consejos para no perderse. Trabaja primero con los elementos que cambian y deja el hidrógeno y el oxígeno para el final. Si un elemento cambia en una sustancia pero aparece en otras sin cambiar (como el nitrógeno del nitrato), su coeficiente total sale del tanteo. Si todos los coeficientes tienen un divisor común, simplifícalos. Y verifica siempre al terminar: mismos átomos de cada elemento y, si hay iones, la misma carga.",
    "¿Cuándo conviene este método? Cuando la ecuación está en forma molecular y no hay un medio (ácido o básico) que importe. Si hay iones en solución y el medio es parte de la reacción, es más ordenado el método ion-electrón, que se ve en las dos Clases siguientes.",
    "Errores frecuentes: olvidar multiplicar el cambio del número por la cantidad de átomos (por ejemplo, contar 2 y no 4 electrones para el O₂); usar el mínimo común múltiplo del cambio y olvidar volver a los coeficientes; dejar de tantear el hidrógeno y el oxígeno; y no verificar al final."
  ],
  "visuales": [
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 2,
      "ejemplo": "fe-o2"
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 3,
      "ejemplo": "cu-hno3"
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 5,
      "ejemplo": "kmno4-hcl"
    }
  ],
  "quiz": [
    {
      "pregunta": "En $4\\,\\mathrm{Fe} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{Fe_2O_3}$ ¿cuántos electrones pasan del hierro al oxígeno en total?",
      "opciones": [
        "3",
        "6",
        "12",
        "24"
      ],
      "respuesta": "12",
      "explicacion": "4 átomos de hierro pierden 3 cada uno: 12 electrones. Los 6 átomos de oxígeno ganan 2 cada uno: 12."
    },
    {
      "pregunta": "En $3\\,\\mathrm{Cu} + 8\\,\\mathrm{HNO_3} \\rightarrow 3\\,\\mathrm{Cu(NO_3)_2} + 2\\,\\mathrm{NO} + 4\\,\\mathrm{H_2O}$ ¿cuántas moléculas de HNO₃ se reducen (pasan a NO)?",
      "opciones": [
        "8",
        "2",
        "6",
        "3"
      ],
      "respuesta": "2",
      "explicacion": "Solo las que forman NO: 2 moléculas. Las otras 6 quedan como nitrato en el $\\mathrm{Cu(NO_3)_2}$."
    },
    {
      "pregunta": "En la reacción del permanganato con el HCl, ¿cuántos HCl actúan como agente reductor (el cloro pasa a $\\mathrm{Cl_2}$)?",
      "opciones": [
        "16",
        "5",
        "10",
        "6"
      ],
      "respuesta": "10",
      "explicacion": "Se forman 5 $\\mathrm{Cl_2}$, o sea 10 átomos de cloro que suben de −1 a 0: 10 HCl. Los otros 6 quedan como cloruro."
    },
    {
      "pregunta": "Para igualar los electrones, una especie pierde 3 y otra gana 2 por unidad. ¿Cuántos electrones se transfieren en total al equilibrar?",
      "opciones": [
        "5",
        "3",
        "6",
        "2"
      ],
      "respuesta": "6",
      "explicacion": "El mínimo común múltiplo de 3 y 2 es 6: 2 unidades de la primera pierden 6 electrones y 3 de la segunda ganan 6."
    },
    {
      "pregunta": "En $2\\,\\mathrm{KMnO_4} + 16\\,\\mathrm{HCl} \\rightarrow 2\\,\\mathrm{KCl} + 2\\,\\mathrm{MnCl_2} + 5\\,\\mathrm{Cl_2} + 8\\,\\mathrm{H_2O}$ ¿cuántos electrones gana cada átomo de manganeso?",
      "opciones": [
        "2",
        "5",
        "7",
        "10"
      ],
      "respuesta": "5",
      "explicacion": "Baja de +7 a +2: gana 5 electrones. Los 2 manganesos ganan 10 en total."
    },
    {
      "pregunta": "¿En qué orden conviene completar el tanteo después de igualar los electrones?",
      "opciones": [
        "Oxígeno primero y después todo lo demás",
        "Hidrógeno y oxígeno primero, porque aparecen en más sustancias",
        "Metales, no metales, hidrógeno y, al final, oxígeno",
        "El orden no importa nunca"
      ],
      "respuesta": "Metales, no metales, hidrógeno y, al final, oxígeno",
      "explicacion": "Los elementos que aparecen en una sola sustancia por lado se ajustan primero; el hidrógeno y el oxígeno suelen estar en varias (como el agua) y se dejan para el final, además el oxígeno sirve de verificación."
    }
  ]
}$quimia$::jsonb,
  3,
  true),

('quimia-clase-redox-ion-electron-acido', 'Método ion-electrón en medio ácido',
  'Semirreacciones balanceadas con H₂O, H⁺ y e⁻ en medio ácido: cinco ejemplos y el paso de la ecuación iónica a la molecular.',
  'quimia',
  $quimia${
  "pasos": [
    "Muchas reacciones redox ocurren en solución acuosa y entre iones (MnO₄⁻, Cr₂O₇²⁻, NO₃⁻...). Para ellas se usa el método ion-electrón: se divide la reacción en dos semirreacciones, se balancea cada una por separado, se igualan los electrones y se suman. En medio ácido hay H⁺ y agua disponibles para completar la cuenta.",
    "El orden dentro de cada semirreacción es siempre el mismo (O, H, e⁻). 1) Escribe la semirreacción con el elemento principal ya igualado (por ejemplo, 2 Cr a cada lado). 2) Iguala los oxígenos agregando $\\mathrm{H_2O}$ del lado que falta. 3) Iguala los hidrógenos agregando $\\mathrm{H^{+}}$ del lado que falta. 4) Iguala las cargas agregando electrones del lado con más carga positiva. 5) Multiplica cada semirreacción para que los electrones sean iguales, suma y simplifica. 6) Verifica átomos y carga.",
    "Ejemplo 1: el permanganato oxida al hierro (II). Reducción: $\\mathrm{MnO_4^{-}} + 8\\,\\mathrm{H^{+}} + 5\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Mn^{2+}} + 4\\,\\mathrm{H_2O}$ Oxidación: $\\mathrm{Fe^{2+}} \\rightarrow \\mathrm{Fe^{3+}} + \\mathrm{e^{-}}$ Se multiplica la oxidación por 5 para llegar a 5 electrones, y al sumar: $5\\,\\mathrm{Fe^{2+}} + \\mathrm{MnO_4^{-}} + 8\\,\\mathrm{H^{+}} \\rightarrow 5\\,\\mathrm{Fe^{3+}} + \\mathrm{Mn^{2+}} + 4\\,\\mathrm{H_2O}$",
    "Ejemplo 2: el dicromato oxida al hierro (II). El cromo se escribe con 2 átomos a cada lado (2 Cr). Reducción: $\\mathrm{Cr_2O_7^{2-}} + 14\\,\\mathrm{H^{+}} + 6\\,\\mathrm{e^{-}} \\rightarrow 2\\,\\mathrm{Cr^{3+}} + 7\\,\\mathrm{H_2O}$ Como esa semirreacción tiene 6 electrones y la del hierro 1, esta última se multiplica por 6. Resultado: $6\\,\\mathrm{Fe^{2+}} + \\mathrm{Cr_2O_7^{2-}} + 14\\,\\mathrm{H^{+}} \\rightarrow 6\\,\\mathrm{Fe^{3+}} + 2\\,\\mathrm{Cr^{3+}} + 7\\,\\mathrm{H_2O}$",
    "Ejemplo 3: el cobre con el ion nitrato en medio ácido. Reducción: $\\mathrm{NO_3^{-}} + 4\\,\\mathrm{H^{+}} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{NO} + 2\\,\\mathrm{H_2O}$ Oxidación: $\\mathrm{Cu} \\rightarrow \\mathrm{Cu^{2+}} + 2\\,\\mathrm{e^{-}}$ Los electrones (3 y 2) se igualan en 6: la reducción se multiplica por 2 y la oxidación por 3. Resultado: $3\\,\\mathrm{Cu} + 2\\,\\mathrm{NO_3^{-}} + 8\\,\\mathrm{H^{+}} \\rightarrow 3\\,\\mathrm{Cu^{2+}} + 2\\,\\mathrm{NO} + 4\\,\\mathrm{H_2O}$ Es la ecuación iónica de la reacción del cobre con el ácido nítrico diluido de la Clase anterior.",
    "Ejemplo 4: un elemento que forma una molécula. El permanganato con el ion cloruro produce cloro: al escribir la oxidación se pone 2 $\\mathrm{Cl^{-}}$ para tener el $\\mathrm{Cl_2}$. Oxidación: $2\\,\\mathrm{Cl^{-}} \\rightarrow \\mathrm{Cl_2} + 2\\,\\mathrm{e^{-}}$ Resultado: $10\\,\\mathrm{Cl^{-}} + 2\\,\\mathrm{MnO_4^{-}} + 16\\,\\mathrm{H^{+}} \\rightarrow 5\\,\\mathrm{Cl_2} + 2\\,\\mathrm{Mn^{2+}} + 8\\,\\mathrm{H_2O}$",
    "Ejemplo 5: el agua oxigenada como agente reductor. Frente a un oxidante fuerte como el permanganato, el $\\mathrm{H_2O_2}$ se oxida a oxígeno (de −1 a 0). Oxidación: $\\mathrm{H_2O_2} \\rightarrow \\mathrm{O_2} + 2\\,\\mathrm{H^{+}} + 2\\,\\mathrm{e^{-}}$ Resultado: $5\\,\\mathrm{H_2O_2} + 2\\,\\mathrm{MnO_4^{-}} + 6\\,\\mathrm{H^{+}} \\rightarrow 5\\,\\mathrm{O_2} + 2\\,\\mathrm{Mn^{2+}} + 8\\,\\mathrm{H_2O}$",
    "De la ecuación iónica a la molecular. Los iones que no cambian (los espectadores) se agregan al final, con los coeficientes que hagan falta. Para el ejemplo 1 con sulfato de hierro (II) en ácido sulfúrico: $2\\,\\mathrm{KMnO_4} + 10\\,\\mathrm{FeSO_4} + 8\\,\\mathrm{H_2SO_4} \\rightarrow \\mathrm{K_2SO_4} + 2\\,\\mathrm{MnSO_4} + 5\\,\\mathrm{Fe_2(SO_4)_3} + 8\\,\\mathrm{H_2O}$ Se verifica contando átomos de cada elemento, incluidos K, S y O.",
    "Errores frecuentes: no multiplicar las dos semirreacciones hasta igualar los electrones; poner los electrones del lado equivocado (en la reducción van a la izquierda y en la oxidación a la derecha); olvidar que el H⁺ y el H₂O que sobran a los dos lados se simplifican; y no verificar la carga al final (la suma de cargas a la izquierda debe ser igual a la de la derecha)."
  ],
  "visuales": [
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 2,
      "caso": "mno4-fe2"
    },
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 3,
      "caso": "cr2o7-fe2"
    },
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 4,
      "caso": "cu-no3"
    },
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 5,
      "caso": "mno4-cl"
    },
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 6,
      "caso": "mno4-h2o2"
    }
  ],
  "quiz": [
    {
      "pregunta": "En la ecuación iónica de $\\mathrm{MnO_4^{-}}$ con $\\mathrm{Fe^{2+}}$ en medio ácido, ¿cuántos $\\mathrm{Fe^{2+}}$ reaccionan por cada $\\mathrm{MnO_4^{-}}$?",
      "opciones": [
        "1",
        "2",
        "5",
        "8"
      ],
      "respuesta": "5",
      "explicacion": "La reducción del Mn tiene 5 electrones y cada Fe²⁺ pierde 1, así que hacen falta 5 Fe²⁺."
    },
    {
      "pregunta": "En la reacción de $\\mathrm{MnO_4^{-}}$ con $\\mathrm{Cl^{-}}$, ¿cuántos electrones se transfieren en total (en la ecuación neta)?",
      "opciones": [
        "5",
        "10",
        "16",
        "2"
      ],
      "respuesta": "10",
      "explicacion": "2 $\\mathrm{MnO_4^{-}}$ ganan 5 cada uno y 10 $\\mathrm{Cl^{-}}$ pierden 1 cada uno: 10 electrones."
    },
    {
      "pregunta": "¿Cuántos $\\mathrm{H^{+}}$ se consumen en la ecuación $6\\,\\mathrm{Fe^{2+}} + \\mathrm{Cr_2O_7^{2-}} + 14\\,\\mathrm{H^{+}} \\rightarrow 6\\,\\mathrm{Fe^{3+}} + 2\\,\\mathrm{Cr^{3+}} + 7\\,\\mathrm{H_2O}$ ?",
      "opciones": [
        "6",
        "7",
        "12",
        "14"
      ],
      "respuesta": "14",
      "explicacion": "Se necesitan 14 H⁺ por cada $\\mathrm{Cr_2O_7^{2-}}$, y aparecen 7 H₂O."
    },
    {
      "pregunta": "En una reducción, ¿de qué lado de la semirreacción aparecen los electrones?",
      "opciones": [
        "A la derecha, con los productos",
        "A la izquierda, con los reactivos",
        "Depende de la carga del ion",
        "No aparecen: se cancelan antes"
      ],
      "respuesta": "A la izquierda, con los reactivos",
      "explicacion": "Reducirse es ganar electrones: se consumen, y los reactivos incluyen los electrones. En la oxidación aparecen a la derecha, como productos."
    },
    {
      "pregunta": "En $\\mathrm{H_2O_2} \\rightarrow \\mathrm{O_2} + 2\\,\\mathrm{H^{+}} + 2\\,\\mathrm{e^{-}}$ ¿qué le pasa al agua oxigenada?",
      "opciones": [
        "Se reduce: el oxígeno pasa de −1 a −2",
        "Se oxida: el oxígeno pasa de −1 a 0",
        "No cambia",
        "Se dismuta en agua y oxígeno"
      ],
      "respuesta": "Se oxida: el oxígeno pasa de −1 a 0",
      "explicacion": "El oxígeno pasa de −1 a 0 en el O₂: sube, así que se oxida. Frente al permanganato, actúa como reductor."
    },
    {
      "pregunta": "Al balancear en medio ácido, ¿qué se usa para igualar los hidrógenos?",
      "opciones": [
        "OH⁻",
        "H₂O",
        "Electrones",
        "H⁺"
      ],
      "respuesta": "H⁺",
      "explicacion": "Los oxígenos se igualan con H₂O y después los hidrógenos con H⁺. Los OH⁻ se usan solo en medio básico."
    }
  ]
}$quimia$::jsonb,
  4,
  true),

('quimia-clase-redox-ion-electron-basico', 'Método ion-electrón en medio básico',
  'Cómo pasar de medio ácido a básico con OH⁻, y qué productos da el permanganato según el medio.',
  'quimia',
  $quimia${
  "pasos": [
    "En medio básico (con NaOH o KOH, por ejemplo) no hay H⁺ libres: lo que abunda es el OH⁻. El método es el mismo que en medio ácido, con un paso más al final para eliminar los H⁺ y reemplazarlos por OH⁻.",
    "El método en medio básico. 1) Balancea la semirreacción como si fuera medio ácido (O con $\\mathrm{H_2O}$, H con $\\mathrm{H^{+}}$, cargas con electrones). 2) Por cada $\\mathrm{H^{+}}$ que aparezca, suma un $\\mathrm{OH^{-}}$ a los DOS lados. 3) En el lado donde estaba el $\\mathrm{H^{+}}$, cada $\\mathrm{H^{+}}$ con un $\\mathrm{OH^{-}}$ forma un $\\mathrm{H_2O}$. 4) Simplifica el agua que quede a los dos lados. 5) Iguala los electrones, suma y verifica: en la ecuación final no debe quedar ningún $\\mathrm{H^{+}}$.",
    "Ejemplo 1: el permanganato oxida al yoduro y se forma dióxido de manganeso, $\\mathrm{MnO_4^{-}}$ + $\\mathrm{I^{-}}$ → $\\mathrm{MnO_2}$ + $\\mathrm{I_2}$. Reducción en medio ácido: $\\mathrm{MnO_4^{-}} + 4\\,\\mathrm{H^{+}} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{MnO_2} + 2\\,\\mathrm{H_2O}$ Se suman 4 $\\mathrm{OH^{-}}$ a los dos lados; los 4 $\\mathrm{H^{+}}$ se transforman en agua y se simplifica. Reducción en medio básico: $\\mathrm{MnO_4^{-}} + 2\\,\\mathrm{H_2O} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{MnO_2} + 4\\,\\mathrm{OH^{-}}$",
    "La oxidación es $2\\,\\mathrm{I^{-}} \\rightarrow \\mathrm{I_2} + 2\\,\\mathrm{e^{-}}$ (se escribe 2 $\\mathrm{I^{-}}$ para obtener el $\\mathrm{I_2}$). La reducción tiene 3 electrones y la oxidación 2: se multiplican por 2 y 3. Resultado: $6\\,\\mathrm{I^{-}} + 2\\,\\mathrm{MnO_4^{-}} + 4\\,\\mathrm{H_2O} \\rightarrow 3\\,\\mathrm{I_2} + 2\\,\\mathrm{MnO_2} + 8\\,\\mathrm{OH^{-}}$",
    "Ejemplo 2: el hidróxido de cromo (III) se oxida a cromato con hipoclorito, $\\mathrm{Cr(OH)_3}$ + $\\mathrm{ClO^{-}}$ → $\\mathrm{CrO_4^{2-}}$ + $\\mathrm{Cl^{-}}$. Reducción: $\\mathrm{ClO^{-}} + \\mathrm{H_2O} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Cl^{-}} + 2\\,\\mathrm{OH^{-}}$ Oxidación: $\\mathrm{Cr(OH)_3} + 5\\,\\mathrm{OH^{-}} \\rightarrow \\mathrm{CrO_4^{2-}} + 4\\,\\mathrm{H_2O} + 3\\,\\mathrm{e^{-}}$ Los electrones (2 y 3) se igualan en 6, y queda: $2\\,\\mathrm{Cr(OH)_3} + 4\\,\\mathrm{OH^{-}} + 3\\,\\mathrm{ClO^{-}} \\rightarrow 2\\,\\mathrm{CrO_4^{2-}} + 5\\,\\mathrm{H_2O} + 3\\,\\mathrm{Cl^{-}}$",
    "Comparación. En medio ácido, la ecuación final tiene H⁺ y H₂O; en medio básico, OH⁻ y H₂O; y en los dos, ningún electrón. Una forma de verificar es que la ecuación básica no tenga H⁺ y que la ácida no tenga OH⁻.",
    "El medio importa: una misma especie da productos distintos. El permanganato es un buen ejemplo. En medio ácido se reduce a $\\mathrm{Mn^{2+}}$ ($\\overset{+2}{\\mathrm{Mn}}$); en medio neutro o débilmente básico, a $\\mathrm{MnO_2}$ ($\\overset{+4}{\\mathrm{Mn}}$); y en un medio fuertemente básico, a $\\mathrm{MnO_4^{2-}}$ ($\\overset{+6}{\\mathrm{Mn}}$).",
    "Errores frecuentes: sumar los OH⁻ solo de un lado; olvidarse de simplificar el agua que queda a los dos lados; dejar H⁺ en la ecuación final de un medio básico; y balancear la carga sin haber igualado antes los oxígenos y los hidrógenos."
  ],
  "visuales": [
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 3,
      "caso": "mno4-i"
    },
    {
      "tipo": "quimia.balanceo",
      "despuesDePaso": 4,
      "caso": "cr-oh3-clo"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "El permanganato según el medio",
      "columnas": [
        "Medio",
        "Producto del MnO₄⁻",
        "Número del Mn"
      ],
      "filas": [
        [
          "Ácido",
          "$\\mathrm{Mn^{2+}}$",
          "+2"
        ],
        [
          "Neutro o débilmente básico",
          "$\\mathrm{MnO_2}$",
          "+4"
        ],
        [
          "Fuertemente básico",
          "$\\mathrm{MnO_4^{2-}}$",
          "+6"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En medio básico, ¿qué se hace con los $\\mathrm{H^{+}}$ que aparecen al balancear como si fuera medio ácido?",
      "opciones": [
        "Se dejan en la ecuación final",
        "Se restan de un solo lado",
        "Se suma un OH⁻ por cada H⁺ a los dos lados y se forma agua",
        "Se reemplazan por electrones"
      ],
      "respuesta": "Se suma un OH⁻ por cada H⁺ a los dos lados y se forma agua",
      "explicacion": "Cada H⁺ más un OH⁻ da H₂O. Se suman los OH⁻ a los dos lados para no romper el balance, y el agua sobrante se simplifica."
    },
    {
      "pregunta": "En $\\mathrm{MnO_4^{-}} + 2\\,\\mathrm{H_2O} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{MnO_2} + 4\\,\\mathrm{OH^{-}}$ ¿cuántos $\\mathrm{OH^{-}}$ aparecen a la derecha?",
      "opciones": [
        "2",
        "3",
        "4",
        "8"
      ],
      "respuesta": "4",
      "explicacion": "Se agregaron 4 OH⁻ a los dos lados y todos quedaron a la derecha, porque los H⁺ estaban a la izquierda."
    },
    {
      "pregunta": "En la ecuación iónica neta del permanganato con el yoduro en medio básico, ¿cuántos $\\mathrm{OH^{-}}$ hay a la derecha?",
      "opciones": [
        "4",
        "6",
        "8",
        "12"
      ],
      "respuesta": "8",
      "explicacion": "$6\\,\\mathrm{I^{-}} + 2\\,\\mathrm{MnO_4^{-}} + 4\\,\\mathrm{H_2O} \\rightarrow 3\\,\\mathrm{I_2} + 2\\,\\mathrm{MnO_2} + 8\\,\\mathrm{OH^{-}}$ Salen 8 OH⁻."
    },
    {
      "pregunta": "¿Cuál de estas ecuaciones finales no puede ser de un medio básico?",
      "opciones": [
        "La que tiene OH⁻ entre los productos",
        "La que tiene H₂O entre los reactivos",
        "La que no tiene electrones",
        "La que tiene H⁺ entre los reactivos"
      ],
      "respuesta": "La que tiene H⁺ entre los reactivos",
      "explicacion": "En medio básico no hay H⁺ libres: si la ecuación final tiene H⁺, quedó a medias."
    },
    {
      "pregunta": "Cuando el permanganato se reduce a $\\mathrm{MnO_2}$, ¿cuántos electrones gana cada manganeso?",
      "opciones": [
        "1",
        "3",
        "5",
        "7"
      ],
      "respuesta": "3",
      "explicacion": "Pasa de +7 a +4: baja 3 unidades."
    }
  ]
}$quimia$::jsonb,
  5,
  true),

('quimia-clase-redox-serie-actividad-potenciales', 'Serie de actividad y potenciales',
  'El potencial estándar de reducción, la serie de actividad de los metales y cómo predecir si una reacción ocurre.',
  'quimia',
  $quimia${
  "pasos": [
    "Cada semirreacción de reducción tiene un potencial estándar de reducción, E°, que se mide en voltios (V). Se compara con la del hidrógeno, $\\mathrm{H_2}$/$\\mathrm{H^{+}}$, a la que se le asigna 0,00 V por convención. «Estándar» quiere decir a 25 °C, con soluciones 1 mol/L y gases a 1 atm. Cuanto MÁS POSITIVO es E°, más fuerte es la tendencia del catión a reducirse (mejor agente oxidante); cuanto más NEGATIVO, más fácil es que el metal se oxide (mejor agente reductor).",
    "La tabla muestra los potenciales de reducción de los metales más comunes, del más negativo al más positivo. Como son valores de referencia, no se calculan: se consultan.",
    "Si se ordenan de menor a mayor E°, se obtiene la serie de actividad: K > Ca > Na > Mg > Al > Zn > Fe > Sn > Pb > H > Cu > Ag > Au (de más a menos reactivo; el H se ubica por su potencial). El orden exacto de algunos metales puede variar entre libros (por ejemplo, el sodio y el calcio), porque la reactividad práctica depende también de la velocidad de la reacción. Aquí se usa el orden que sale de los potenciales estándar.",
    "Desplazamiento de un metal. Un metal reacciona con el catión de otro cuando el potencial de reducción del catión es MAYOR que el del metal: es lo mismo que decir que el metal está arriba del otro en la serie. Zinc con $\\mathrm{Cu^{2+}}$: 0,34 − (−0,76) = 1,10 V, positivo, así que ocurre: $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$ Cobre con $\\mathrm{Zn^{2+}}$: la cuenta da −1,10 V, negativo, no ocurre.",
    "Otro ejemplo: el cobre desplaza a la plata. $\\mathrm{Cu} + 2\\,\\mathrm{Ag^{+}} \\rightarrow \\mathrm{Cu^{2+}} + 2\\,\\mathrm{Ag}$ E° = 0,80 − 0,34 = 0,46 V. Fíjate que el coeficiente 2 no cambia el potencial: E° no depende de cuántas veces se escriba la reacción.",
    "Reacción con ácidos. El $\\mathrm{H^{+}}$ de un ácido actúa como oxidante y su potencial es 0,00 V. Los metales con E° negativo lo reducen y desprenden hidrógeno: $\\mathrm{Fe} + 2\\,\\mathrm{H^{+}} \\rightarrow \\mathrm{Fe^{2+}} + \\mathrm{H_2}$ Los de E° positivo (Cu, Ag, Au) no lo hacen con ácidos como el clorhídrico. El cobre y la plata sí los ataca un ácido oxidante como el nítrico, pero entonces el que se reduce es el ion nitrato, no el H⁺: es lo que se vio en la reacción del cobre con el ácido nítrico. El oro resiste incluso al nítrico (solo se disuelve en agua regia, una mezcla de ácidos).",
    "Regla general de espontaneidad: para una reacción redox, E°(reacción) = E°(reducción) − E°(oxidación), o sea E°(cátodo) − E°(ánodo). Si es positivo, la reacción es espontánea en condiciones estándar; si es negativo, no lo es (ocurriría al revés). La tabla muestra cinco reacciones con su potencial, calculado de la tabla de arriba.",
    "Aplicación: proteger al hierro de la corrosión. Un metal más reactivo que el hierro (el zinc o el magnesio) se oxida antes que él; por eso se galvaniza el hierro (se lo recubre con zinc) o se atornillan bloques de magnesio a los cascos de los barcos: se llaman ánodos de sacrificio. El metal protector se gasta en lugar del hierro.",
    "Límites de esta herramienta. Los potenciales son estándar: cambian con la concentración y la temperatura (la ecuación de Nernst, que queda fuera del colegio). Y que una reacción sea posible no dice que sea rápida: el aluminio tiene un potencial muy negativo pero parece inerte, porque se cubre de una fina capa de óxido que lo protege. La tabla es una guía, no una garantía."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "titulo": "Potenciales estándar de reducción (25 °C, 1 mol/L)",
      "columnas": [
        "Metal",
        "Semirreacción de reducción",
        "E° (V)"
      ],
      "filas": [
        [
          "Potasio (K)",
          "$\\mathrm{K^{+}} + \\mathrm{e^{-}} \\rightarrow \\mathrm{K}$",
          "−2,93"
        ],
        [
          "Calcio (Ca)",
          "$\\mathrm{Ca^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Ca}$",
          "−2,87"
        ],
        [
          "Sodio (Na)",
          "$\\mathrm{Na^{+}} + \\mathrm{e^{-}} \\rightarrow \\mathrm{Na}$",
          "−2,71"
        ],
        [
          "Magnesio (Mg)",
          "$\\mathrm{Mg^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Mg}$",
          "−2,37"
        ],
        [
          "Aluminio (Al)",
          "$\\mathrm{Al^{3+}} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Al}$",
          "−1,66"
        ],
        [
          "Zinc (Zn)",
          "$\\mathrm{Zn^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Zn}$",
          "−0,76"
        ],
        [
          "Hierro (Fe)",
          "$\\mathrm{Fe^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Fe}$",
          "−0,44"
        ],
        [
          "Estaño (Sn)",
          "$\\mathrm{Sn^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Sn}$",
          "−0,14"
        ],
        [
          "Plomo (Pb)",
          "$\\mathrm{Pb^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Pb}$",
          "−0,13"
        ],
        [
          "Cobre (Cu)",
          "$\\mathrm{Cu^{2+}} + 2\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Cu}$",
          "0,34"
        ],
        [
          "Plata (Ag)",
          "$\\mathrm{Ag^{+}} + \\mathrm{e^{-}} \\rightarrow \\mathrm{Ag}$",
          "0,80"
        ],
        [
          "Oro (Au)",
          "$\\mathrm{Au^{3+}} + 3\\,\\mathrm{e^{-}} \\rightarrow \\mathrm{Au}$",
          "1,50"
        ]
      ]
    },
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 3,
      "ejemplo": "zn-cu"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Reacciones espontáneas y su potencial",
      "columnas": [
        "Reacción",
        "E° de la reacción (V)",
        "¿Espontánea?"
      ],
      "filas": [
        [
          "$\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$",
          "1,10",
          "sí"
        ],
        [
          "$\\mathrm{Fe} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Fe^{2+}} + \\mathrm{Cu}$",
          "0,78",
          "sí"
        ],
        [
          "$\\mathrm{Cu} + 2\\,\\mathrm{Ag^{+}} \\rightarrow \\mathrm{Cu^{2+}} + 2\\,\\mathrm{Ag}$",
          "0,46",
          "sí"
        ],
        [
          "$\\mathrm{Mg} + \\mathrm{Zn^{2+}} \\rightarrow \\mathrm{Mg^{2+}} + \\mathrm{Zn}$",
          "1,61",
          "sí"
        ],
        [
          "$\\mathrm{Zn} + 2\\,\\mathrm{Ag^{+}} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{Ag}$",
          "1,56",
          "sí"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es el potencial estándar de la reacción $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$?",
      "opciones": [
        "0,34 V",
        "1,10 V",
        "−0,76 V",
        "−1,10 V"
      ],
      "respuesta": "1,10 V",
      "explicacion": "E° = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) = 0,34 − (−0,76) = 1,10 V."
    },
    {
      "pregunta": "Un metal con un potencial de reducción muy negativo es...",
      "opciones": [
        "Un buen agente oxidante",
        "Un metal noble que no reacciona",
        "Un buen agente reductor: se oxida con facilidad",
        "Un metal que se reduce con facilidad"
      ],
      "respuesta": "Un buen agente reductor: se oxida con facilidad",
      "explicacion": "El catión de ese metal se reduce con dificultad, y por lo tanto el metal se oxida con facilidad: es un buen reductor."
    },
    {
      "pregunta": "¿Cuál de estos metales desprende hidrógeno al ponerlo en ácido clorhídrico diluido?",
      "opciones": [
        "Cobre",
        "Plata",
        "Hierro",
        "Oro"
      ],
      "respuesta": "Hierro",
      "explicacion": "El hierro (−0,44 V) tiene un potencial menor que el del hidrógeno (0,00 V), así que lo reduce. El cobre, la plata y el oro tienen potenciales positivos."
    },
    {
      "pregunta": "Si el E° calculado de una reacción es −1,10 V (como el del cobre con $\\mathrm{Zn^{2+}}$), ¿qué se concluye?",
      "opciones": [
        "Es espontánea pero lenta",
        "Es espontánea y rápida",
        "Es una reacción sin transferencia de electrones",
        "No es espontánea en condiciones estándar"
      ],
      "respuesta": "No es espontánea en condiciones estándar",
      "explicacion": "Un potencial negativo indica que la reacción no es espontánea en esas condiciones (sí lo es la inversa)."
    },
    {
      "pregunta": "¿Por qué se atornillan bloques de magnesio a un casco de acero?",
      "opciones": [
        "Porque el magnesio se oxida antes que el hierro y lo protege",
        "Porque el magnesio es más pesado que el hierro",
        "Porque el magnesio es un metal noble",
        "Porque reduce el óxido de hierro ya formado y lo elimina"
      ],
      "respuesta": "Porque el magnesio se oxida antes que el hierro y lo protege",
      "explicacion": "El magnesio está más arriba que el hierro en la serie: se oxida en lugar del hierro (ánodo de sacrificio)."
    }
  ]
}$quimia$::jsonb,
  6,
  true),

('quimia-clase-redox-pilas-electrolisis', 'Pilas y electrólisis',
  'Cómo una reacción redox espontánea produce corriente (pila) y cómo la corriente fuerza una reacción que no ocurre sola (electrólisis).',
  'quimia',
  $quimia${
  "pasos": [
    "Como una reacción redox transfiere electrones, se puede aprovechar esa transferencia. Si la reacción es espontánea, se puede obligar a los electrones a pasar por un cable y obtener corriente eléctrica: es una pila (celda galvánica). Si la reacción NO es espontánea, se puede forzar con una fuente de corriente externa: es una electrólisis.",
    "Una pila tiene dos semiceldas, cada una con un electrodo metálico sumergido en una solución de sus propios iones. Los electrodos se conectan con un cable (por ahí circulan los electrones) y las soluciones, con un puente salino, un tubo con una solución de una sal inerte (por ahí circulan los iones y se cierra el circuito).",
    "En una pila, el ÁNODO es el electrodo donde ocurre la oxidación y el CÁTODO donde ocurre la reducción. Regla para recordarlo: vocal con vocal (Ánodo–Oxidación) y consonante con consonante (Cátodo–Reducción). Los electrones viajan siempre del ánodo al cátodo por el cable, y en la pila el ánodo es el polo negativo y el cátodo el positivo. Mira cómo funciona la pila de Daniell, de zinc y cobre.",
    "El potencial de la pila es E°(pila) = E°(cátodo) − E°(ánodo). Para la pila de Daniell: 0,34 − (−0,76) = 1,10 V. El ánodo siempre es el metal con el menor potencial de reducción (el más reactivo). En una pila, la reacción global es la suma de las dos semirreacciones: $\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$",
    "Se acostumbra escribir la pila con una notación abreviada: el ánodo a la izquierda, el cátodo a la derecha y el puente salino como una doble barra. Para la pila de Daniell: $\\mathrm{Zn(s)\\,|\\,Zn^{2+}(aq)\\;\\|\\;Cu^{2+}(aq)\\,|\\,Cu(s)}$. Cada barra simple separa fases distintas (el metal y su solución).",
    "Cuando los iones tienen cargas distintas, hay que igualar los electrones. En la pila de zinc y plata, el zinc pierde 2 electrones y cada $\\mathrm{Ag^{+}}$ gana 1, así que reaccionan 2 $\\mathrm{Ag^{+}}$ por cada Zn: $\\mathrm{Zn} + 2\\,\\mathrm{Ag^{+}} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{Ag}$ E°(pila) = 0,80 − (−0,76) = 1,56 V. El potencial no se duplica por escribir 2 $\\mathrm{Ag^{+}}$.",
    "La electrólisis hace lo contrario. Con una fuente de corriente se obliga a ocurrir una reacción que no es espontánea. Sigue valiendo que en el cátodo hay reducción y en el ánodo oxidación, pero los signos se invierten respecto de la pila: en la electrólisis el cátodo es el polo negativo y el ánodo el positivo (la fuente externa los conecta así). Ejemplos: la electrólisis del agua (con un poco de ácido), $2\\,\\mathrm{H_2O} \\rightarrow \\mathrm{O_2} + 2\\,\\mathrm{H_2}$ donde en el cátodo se obtiene el doble de volumen de gas ($\\mathrm{H_2}$) que en el ánodo ($\\mathrm{O_2}$); y la del cloruro de sodio fundido, $2\\,\\mathrm{Cl^{-}} + 2\\,\\mathrm{Na^{+}} \\rightarrow \\mathrm{Cl_2} + 2\\,\\mathrm{Na}$ que produce sodio metálico en el cátodo y cloro gaseoso en el ánodo.",
    "Las semirreacciones de la electrólisis del agua son $4\\,\\mathrm{H^{+}} + 4\\,\\mathrm{e^{-}} \\rightarrow 2\\,\\mathrm{H_2}$ en el cátodo y $2\\,\\mathrm{H_2O} \\rightarrow \\mathrm{O_2} + 4\\,\\mathrm{H^{+}} + 4\\,\\mathrm{e^{-}}$ en el ánodo. En solución acuosa de cloruro de sodio el resultado es otro (se forman hidrógeno, cloro e hidróxido de sodio), porque el agua también participa.",
    "La tabla siguiente resume las diferencias entre una pila y una electrólisis.",
    "Aplicaciones. Las pilas de uso diario funcionan con el mismo principio: la pila seca clásica usa un envase de zinc como ánodo, y las baterías recargables (como las de ion litio) actúan como pila cuando se descargan y como electrólisis cuando se recargan. La electrólisis sirve para obtener metales muy reactivos (como el sodio o el aluminio, a partir de sus compuestos fundidos), para recubrir objetos con una capa de otro metal (niquelado, cromado) y para producir gases como el hidrógeno.",
    "Limitaciones. Los potenciales de una pila son estándar: al gastarse los reactivos y cambiar las concentraciones, el voltaje real baja hasta que la pila deja de funcionar (cuando se llega al equilibrio, el potencial es 0). Y en las electrólisis reales aparecen otros efectos (sobrepotenciales, reacciones del agua) que este nivel no incluye."
  ],
  "visuales": [
    {
      "tipo": "quimia.pila",
      "despuesDePaso": 2,
      "anodo": "Zn",
      "catodo": "Cu"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 3,
      "titulo": "Cinco pilas de metales",
      "columnas": [
        "Pila (ánodo / cátodo)",
        "Reacción global",
        "E° (V)"
      ],
      "filas": [
        [
          "Zn / Cu",
          "$\\mathrm{Zn} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Zn^{2+}} + \\mathrm{Cu}$",
          "1,10"
        ],
        [
          "Zn / Ag",
          "$\\mathrm{Zn} + 2\\,\\mathrm{Ag^{+}} \\rightarrow \\mathrm{Zn^{2+}} + 2\\,\\mathrm{Ag}$",
          "1,56"
        ],
        [
          "Fe / Cu",
          "$\\mathrm{Fe} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Fe^{2+}} + \\mathrm{Cu}$",
          "0,78"
        ],
        [
          "Mg / Cu",
          "$\\mathrm{Mg} + \\mathrm{Cu^{2+}} \\rightarrow \\mathrm{Mg^{2+}} + \\mathrm{Cu}$",
          "2,71"
        ],
        [
          "Al / Cu",
          "$2\\,\\mathrm{Al} + 3\\,\\mathrm{Cu^{2+}} \\rightarrow 2\\,\\mathrm{Al^{3+}} + 3\\,\\mathrm{Cu}$",
          "2,00"
        ]
      ]
    },
    {
      "tipo": "quimia.pila",
      "despuesDePaso": 5,
      "anodo": "Zn",
      "catodo": "Ag"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Pila y electrólisis",
      "columnas": [
        "",
        "Pila",
        "Electrólisis"
      ],
      "filas": [
        [
          "¿La reacción es espontánea?",
          "sí",
          "no: se fuerza"
        ],
        [
          "Energía",
          "la reacción produce corriente",
          "la corriente produce la reacción"
        ],
        [
          "Ánodo",
          "oxidación, polo negativo",
          "oxidación, polo positivo"
        ],
        [
          "Cátodo",
          "reducción, polo positivo",
          "reducción, polo negativo"
        ],
        [
          "Sentido de los electrones",
          "del ánodo al cátodo",
          "del ánodo al cátodo"
        ],
        [
          "Ejemplo",
          "pila de Daniell",
          "electrólisis del agua"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En una pila, ¿en qué electrodo ocurre la oxidación?",
      "opciones": [
        "En el cátodo",
        "En el puente salino",
        "En el ánodo",
        "En los dos"
      ],
      "respuesta": "En el ánodo",
      "explicacion": "Vocal con vocal: Ánodo–Oxidación. El cátodo es donde ocurre la reducción."
    },
    {
      "pregunta": "En la pila de Daniell (zinc y cobre), ¿cuál es el potencial estándar y cuál es el ánodo?",
      "opciones": [
        "1,10 V y el ánodo es el cobre",
        "1,10 V y el ánodo es el zinc",
        "0,34 V y el ánodo es el zinc",
        "2,20 V y el ánodo es el cobre"
      ],
      "respuesta": "1,10 V y el ánodo es el zinc",
      "explicacion": "E° = 0,34 − (−0,76) = 1,10 V. El zinc es el de menor potencial de reducción, por eso se oxida y es el ánodo."
    },
    {
      "pregunta": "¿Por dónde viajan los electrones en una pila?",
      "opciones": [
        "Por el puente salino, del cátodo al ánodo",
        "Por la solución, del cátodo al ánodo",
        "Por el cable, del ánodo al cátodo",
        "Por el cable, del cátodo al ánodo"
      ],
      "respuesta": "Por el cable, del ánodo al cátodo",
      "explicacion": "Los electrones salen del ánodo (donde se liberan por la oxidación) y llegan al cátodo (donde se consumen por la reducción). Los iones, en cambio, circulan por el puente salino."
    },
    {
      "pregunta": "¿Para qué sirve el puente salino?",
      "opciones": [
        "Provee los electrones de la pila",
        "Es el electrodo donde ocurre la reducción",
        "Aumenta el potencial de la pila",
        "Cierra el circuito y mantiene neutras las dos soluciones"
      ],
      "respuesta": "Cierra el circuito y mantiene neutras las dos soluciones",
      "explicacion": "Por el puente se mueven iones: los aniones hacia el ánodo y los cationes hacia el cátodo, y así las soluciones no acumulan carga."
    },
    {
      "pregunta": "¿Qué diferencia una electrólisis de una pila?",
      "opciones": [
        "En la electrólisis no hay oxidación ni reducción",
        "La electrólisis usa corriente externa para forzar una reacción no espontánea",
        "En la electrólisis los electrones van del cátodo al ánodo por el cable",
        "La electrólisis produce energía y la pila la consume"
      ],
      "respuesta": "La electrólisis usa corriente externa para forzar una reacción no espontánea",
      "explicacion": "En la pila una reacción espontánea produce corriente; en la electrólisis la corriente produce una reacción que no ocurriría sola."
    },
    {
      "pregunta": "En la electrólisis del agua, $2\\,\\mathrm{H_2O} \\rightarrow \\mathrm{O_2} + 2\\,\\mathrm{H_2}$ ¿qué volumen relativo de gases se obtiene en cada electrodo?",
      "opciones": [
        "El doble de O₂ (ánodo) que de H₂ (cátodo)",
        "Iguales",
        "El doble de H₂ (cátodo) que de O₂ (ánodo)",
        "Solo se obtiene O₂"
      ],
      "respuesta": "El doble de H₂ (cátodo) que de O₂ (ánodo)",
      "explicacion": "Por cada 2 H₂O se forman 2 H₂ y 1 O₂: la relación de volúmenes de gases, en las mismas condiciones, es 2 a 1."
    }
  ]
}$quimia$::jsonb,
  7,
  true),

('quimia-clase-organica-carbono', 'El carbono y sus enlaces',
  'Por qué el carbono forma tantos compuestos: tetravalencia, enlaces simples, dobles y triples, hibridación sp³, sp² y sp, y tipos de carbono.',
  'quimia',
  $quimia${
  "pasos": [
    "La química orgánica estudia los compuestos del carbono. Casi todas las sustancias de los seres vivos (azúcares, grasas, proteínas, ADN) son orgánicas, y también los combustibles, los plásticos, los medicamentos y las fibras textiles. Además del carbono, casi siempre tienen hidrógeno, y muchas veces oxígeno, nitrógeno, azufre, fósforo o halógenos. Por tradición, unos pocos compuestos del carbono se estudian como inorgánicos: los óxidos (CO, CO₂), los carbonatos (CaCO₃) y los cianuros.",
    "¿Por qué el carbono? Tiene 4 electrones de valencia (su configuración es $\\mathrm{1s^{2}\\,2s^{2}\\,2p^{2}}$), una electronegatividad intermedia (2,55, ni muy baja ni muy alta) y un tamaño pequeño. Eso le permite formar 4 enlaces covalentes fuertes con otros átomos, incluso con otros carbonos, y por eso arma cadenas y anillos casi ilimitados (esta propiedad se llama concatenación).",
    "Tetravalencia: en casi todos sus compuestos, el carbono forma 4 enlaces (cada enlace covalente comparte un par de electrones). Pueden ser cuatro enlaces simples, dos simples y uno doble, uno simple y uno triple, o dos dobles; la suma siempre da 4. En el propano, $\\mathrm{CH_{3}{-}CH_{2}{-}CH_{3}}$, cada carbono tiene sus 4 enlaces: los carbonos de los extremos se unen a un carbono y a 3 hidrógenos, y el del medio a dos carbonos y a 2 hidrógenos.",
    "Entre dos carbonos puede haber un enlace simple (C–C), doble (C=C) o triple (C≡C). Cuantos más enlaces, más corto y más fuerte es el conjunto: aproximadamente 154 pm el simple, 134 pm el doble y 120 pm el triple (1 pm es $10^{-12}$ m). Pero los enlaces múltiples son más reactivos, como se verá enseguida.",
    "Un enlace doble o triple no es solo «más de lo mismo»: tiene un enlace σ (sigma), que se forma por solapamiento frontal de orbitales y une los dos átomos, y uno (doble) o dos (triple) enlaces π (pi), que se forman por solapamiento lateral. Los enlaces π son más débiles y más accesibles, y por eso los dobles y triples reaccionan con más facilidad que los simples.",
    "Hibridación (un modelo de nivel colegio). El carbono tiene un orbital s y tres p, pero forma 4 enlaces iguales: para explicarlo se dice que mezcla sus orbitales. Con 4 enlaces σ el carbono es sp³ (mezcla 1 s y 3 p), con geometría tetraédrica y ángulos de 109,5°. Ejemplo: el metano, $\\mathrm{CH_4}$: 4 enlaces σ y 0 π, hibridación $\\mathrm{sp^{3}}$. El dibujo es plano: la cuña indica un enlace que sale hacia adelante y la línea punteada, uno que va hacia atrás.",
    "Con 3 enlaces σ (y 1 π) el carbono es sp² (mezcla 1 s y 2 p): geometría trigonal plana, ángulos de ≈ 120°. Ejemplo: el eteno, $\\mathrm{C_2H_4}$: cada carbono tiene 3 enlaces σ y 1 π, hibridación $\\mathrm{sp^{2}}$, y los seis átomos están en un mismo plano. También son sp² los carbonos del benceno y el carbono de un grupo C=O.",
    "Con 2 enlaces σ (y 2 π) el carbono es sp (mezcla 1 s y 1 p): geometría lineal, ángulo de 180°. Ejemplo: el etino, $\\mathrm{C_2H_2}$: cada carbono tiene 2 enlaces σ y 2 π, hibridación $\\mathrm{sp}$, y los cuatro átomos quedan en línea.",
    "Resumen, calculado de la conectividad de cada molécula: el número de enlaces σ del carbono (contando los de hidrógeno) determina la hibridación.",
    "Tipos de carbono según a cuántos carbonos está unido: primario (1), secundario (2), terciario (3) y cuaternario (4). En el 2,2,4-trimetilpentano ($\\mathrm{CH_{3}{-}C(CH_{3})_{2}{-}CH_{2}{-}CH(CH_{3}){-}CH_{3}}$) hay 5 carbonos primarios, 1 secundario, 1 terciario y 1 cuaternario. Además, las cadenas pueden ser lineales, ramificadas o cíclicas, y saturadas (solo enlaces simples) o insaturadas (con dobles o triples).",
    "Errores frecuentes: creer que el carbono puede tener más de 4 enlaces (al contar, un doble vale 2 y un triple 3); confundir la hibridación con la forma de la molécula entera (la hibridación es de cada carbono); pensar que los dibujos planos son la forma real de la molécula; y olvidar que CO₂ y los carbonatos se estudian como inorgánicos."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 2,
      "molecula": "propano",
      "modo": "formulas"
    },
    {
      "tipo": "quimia.hibridacion",
      "despuesDePaso": 5,
      "molecula": "metano"
    },
    {
      "tipo": "quimia.hibridacion",
      "despuesDePaso": 6,
      "molecula": "eteno"
    },
    {
      "tipo": "quimia.hibridacion",
      "despuesDePaso": 7,
      "molecula": "etino"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Hibridación del carbono",
      "columnas": [
        "Molécula",
        "Enlaces σ del carbono",
        "Enlaces π",
        "Hibridación",
        "Ángulo",
        "Geometría"
      ],
      "filas": [
        [
          "Metano ($\\mathrm{CH_4}$)",
          "4",
          "0",
          "$\\mathrm{sp^{3}}$",
          "109,5°",
          "tetraédrica"
        ],
        [
          "Eteno ($\\mathrm{C_2H_4}$)",
          "3",
          "1",
          "$\\mathrm{sp^{2}}$",
          "≈ 120°",
          "trigonal plana"
        ],
        [
          "Etino ($\\mathrm{C_2H_2}$)",
          "2",
          "2",
          "$\\mathrm{sp}$",
          "180°",
          "lineal"
        ],
        [
          "Benceno ($\\mathrm{C_6H_6}$)",
          "3",
          "1",
          "$\\mathrm{sp^{2}}$",
          "≈ 120°",
          "trigonal plana"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántos enlaces forma el carbono en casi todos sus compuestos?",
      "opciones": [
        "4",
        "2",
        "3",
        "6"
      ],
      "respuesta": "4",
      "explicacion": "El carbono es tetravalente: forma 4 enlaces. Un doble enlace cuenta como 2 y un triple como 3."
    },
    {
      "pregunta": "¿Qué hibridación tienen los carbonos del eteno?",
      "opciones": [
        "sp³",
        "sp",
        "sp²",
        "No tienen hibridación"
      ],
      "respuesta": "sp²",
      "explicacion": "Cada carbono tiene 3 enlaces σ (2 con hidrógeno y 1 con el otro carbono) y 1 π: es sp², con geometría trigonal plana."
    },
    {
      "pregunta": "¿Cuántos enlaces σ y π tiene un enlace triple entre dos carbonos?",
      "opciones": [
        "2 σ y 1 π",
        "3 σ",
        "1 σ y 2 π",
        "3 π"
      ],
      "respuesta": "1 σ y 2 π",
      "explicacion": "Todo enlace múltiple tiene un solo σ (el que une los átomos); los demás son π. El triple es 1 σ y 2 π."
    },
    {
      "pregunta": "¿Cuál es el ángulo entre los enlaces de un carbono sp³, como en el metano?",
      "opciones": [
        "120°",
        "180°",
        "109,5°",
        "90°"
      ],
      "respuesta": "109,5°",
      "explicacion": "Los cuatro enlaces se reparten en un tetraedro: 109,5°. El sp² tiene ≈120° y el sp, 180°."
    },
    {
      "pregunta": "En $\\mathrm{CH_{3}{-}CH(CH_{3}){-}CH_{3}}$, ¿qué tipo de carbono es el carbono central?",
      "opciones": [
        "Terciario",
        "Primario",
        "Secundario",
        "Cuaternario"
      ],
      "respuesta": "Terciario",
      "explicacion": "El carbono central está unido a 3 carbonos (los tres metilos): es terciario."
    },
    {
      "pregunta": "¿Cuál de estas sustancias se estudia tradicionalmente como inorgánica, aunque tiene carbono?",
      "opciones": [
        "El dióxido de carbono, CO₂",
        "El metano, CH₄",
        "El etanol, C₂H₅OH",
        "El benceno, C₆H₆"
      ],
      "respuesta": "El dióxido de carbono, CO₂",
      "explicacion": "El CO₂, los carbonatos y los cianuros son las excepciones tradicionales: contienen carbono pero se estudian con la química inorgánica."
    }
  ]
}$quimia$::jsonb,
  1,
  true),

('quimia-clase-organica-formulas', 'Formas de escribir una molécula orgánica',
  'Fórmula molecular, empírica, desarrollada, semidesarrollada (condensada) y de esqueleto, y cómo pasar de una a otra.',
  'quimia',
  $quimia${
  "pasos": [
    "Una misma molécula se puede describir con distintas fórmulas, según cuánta información se quiera dar: molecular, empírica, desarrollada, semidesarrollada (o condensada) y de esqueleto. Los libros no siempre usan los mismos nombres para las dos últimas; en la práctica de Prodigia, por ejemplo, se muestra la fórmula estructural condensada (como CH₃–CH₂–OH).",
    "La fórmula molecular dice cuántos átomos de cada elemento hay: el etanol es $\\mathrm{C_2H_6O}$. No dice cómo están unidos, y por eso puede corresponder a más de un compuesto: el metoximetano (éter dimetílico) también es $\\mathrm{C_2H_6O}$.",
    "La fórmula empírica (o mínima) es la proporción más simple de átomos: se divide la molecular por su máximo común divisor. Sirve para comparar compuestos, pero no dice la molécula real: el etano es $\\mathrm{C_2H_6}$ y su fórmula empírica es $\\mathrm{CH_3}$, que no existe como molécula estable.",
    "La fórmula desarrollada muestra todos los átomos y todos los enlaces (una línea por enlace). El etanol tiene 8 enlaces: 2 entre átomos que no son hidrógeno (C–C y C–O) y 6 con hidrógeno (5 C–H y 1 O–H). Es completa pero larga, por eso casi siempre se usa una versión abreviada.",
    "La fórmula semidesarrollada (o condensada) agrupa cada carbono con sus hidrógenos y deja los enlaces entre carbonos. Las ramificaciones se escriben entre paréntesis. Es la que más se usa para nombrar compuestos.",
    "La fórmula de esqueleto (o «de líneas») es el dibujo en zigzag: cada vértice y cada extremo es un carbono, cada línea es un enlace, los hidrógenos unidos a carbono no se dibujan y los demás átomos (O, N, halógenos) sí. Es muy práctica, pero hay que completar mentalmente los hidrógenos hasta 4 enlaces por carbono. Es un esquema plano de la conectividad, no la forma real de la molécula.",
    "Para pasar de una a otra, sigue el orden: esqueleto, condensada y molecular. Ejemplo con el 2-metilbutano: en el esqueleto hay 5 vértices (5 carbonos); completando los hidrógenos queda $\\mathrm{CH_{3}{-}CH(CH_{3}){-}CH_{2}{-}CH_{3}}$; y al sumar los hidrógenos, $\\mathrm{C_5H_{12}}$.",
    "¿Cuál conviene? La molecular sirve para contar átomos y calcular masas. La condensada, para nombrar y reconocer grupos. El esqueleto, para dibujar rápido moléculas grandes. La desarrollada, para ver cada enlace. Y la empírica, para comparar composiciones.",
    "Errores frecuentes: creer que una fórmula molecular identifica un solo compuesto (los isómeros comparten la molecular); confundir la empírica con la molecular (el benceno es C₆H₆, no CH); olvidar los hidrógenos al leer un esqueleto; y no cerrar los paréntesis de las ramificaciones al escribir la condensada."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "De la fórmula molecular a la empírica",
      "columnas": [
        "Compuesto",
        "Fórmula molecular",
        "Fórmula empírica"
      ],
      "filas": [
        [
          "Etano",
          "$\\mathrm{C_2H_6}$",
          "$\\mathrm{CH_3}$"
        ],
        [
          "Eteno",
          "$\\mathrm{C_2H_4}$",
          "$\\mathrm{CH_2}$"
        ],
        [
          "Etino",
          "$\\mathrm{C_2H_2}$",
          "$\\mathrm{CH}$"
        ],
        [
          "Benceno",
          "$\\mathrm{C_6H_6}$",
          "$\\mathrm{CH}$"
        ],
        [
          "Butano",
          "$\\mathrm{C_4H_{10}}$",
          "$\\mathrm{C_2H_5}$"
        ],
        [
          "Ácido etanoico (ácido acético)",
          "$\\mathrm{C_2H_4O_2}$",
          "$\\mathrm{CH_2O}$"
        ],
        [
          "Glucosa",
          "$\\mathrm{C_6H_{12}O_6}$",
          "$\\mathrm{CH_2O}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "Fórmulas condensadas",
      "columnas": [
        "Compuesto",
        "Fórmula semidesarrollada"
      ],
      "filas": [
        [
          "Etanol",
          "$\\mathrm{CH_{3}{-}CH_{2}OH}$"
        ],
        [
          "Propan-2-ol",
          "$\\mathrm{CH_{3}{-}CH(OH){-}CH_{3}}$"
        ],
        [
          "2-metilbutano",
          "$\\mathrm{CH_{3}{-}CH(CH_{3}){-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "Propanona",
          "$\\mathrm{CH_{3}{-}CO{-}CH_{3}}$"
        ],
        [
          "Ácido etanoico",
          "$\\mathrm{CH_{3}{-}COOH}$"
        ],
        [
          "Etanoato de etilo",
          "$\\mathrm{CH_{3}{-}COO{-}CH_{2}{-}CH_{3}}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 5,
      "molecula": "propan-2-ol",
      "modo": "formulas"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 6,
      "molecula": "2-metilbutano",
      "modo": "formulas"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Las cinco formas",
      "columnas": [
        "Fórmula",
        "Qué muestra",
        "Ejemplo: etanol"
      ],
      "filas": [
        [
          "Molecular",
          "cuántos átomos de cada elemento",
          "$\\mathrm{C_2H_6O}$"
        ],
        [
          "Empírica",
          "la proporción más simple",
          "$\\mathrm{C_2H_6O}$"
        ],
        [
          "Desarrollada",
          "todos los átomos y todos los enlaces",
          "8 enlaces"
        ],
        [
          "Semidesarrollada",
          "cada carbono con sus hidrógenos",
          "$\\mathrm{CH_{3}{-}CH_{2}OH}$"
        ],
        [
          "Esqueleto",
          "solo el esqueleto de carbonos",
          "zigzag de 2 vértices y OH"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula empírica de la glucosa, $\\mathrm{C_6H_{12}O_6}$?",
      "opciones": [
        "$\\mathrm{CHO}$",
        "$\\mathrm{C_2H_4O_2}$",
        "$\\mathrm{CH_2O}$",
        "$\\mathrm{C_3H_6O_3}$"
      ],
      "respuesta": "$\\mathrm{CH_2O}$",
      "explicacion": "Se divide por el máximo común divisor (6): C₁H₂O₁ se escribe CH₂O. También es la empírica del ácido etanoico."
    },
    {
      "pregunta": "¿Cuántos hidrógenos tiene $\\mathrm{CH_{3}{-}CH(CH_{3}){-}CH_{2}{-}CH_{3}}$?",
      "opciones": [
        "12",
        "10",
        "14",
        "8"
      ],
      "respuesta": "12",
      "explicacion": "Los tres metilos aportan 9, el CH₂ aporta 2 y el CH aporta 1: C5H12."
    },
    {
      "pregunta": "La fórmula molecular $\\mathrm{C_2H_6O}$ corresponde a...",
      "opciones": [
        "Al menos dos compuestos distintos: el etanol y el metoximetano",
        "Solo al etanol",
        "Solo al metoximetano",
        "A un alcano"
      ],
      "respuesta": "Al menos dos compuestos distintos: el etanol y el metoximetano",
      "explicacion": "La molecular no dice cómo están unidos los átomos: el etanol (un alcohol) y el metoximetano (un éter) son isómeros con la misma fórmula."
    },
    {
      "pregunta": "En una fórmula de esqueleto, ¿qué representa cada vértice y cada extremo?",
      "opciones": [
        "Un átomo de hidrógeno",
        "Un átomo de carbono",
        "Un enlace doble",
        "Un grupo funcional"
      ],
      "respuesta": "Un átomo de carbono",
      "explicacion": "Cada vértice y cada extremo es un carbono; los hidrógenos unidos a carbono no se dibujan."
    },
    {
      "pregunta": "¿Cuál es la fórmula empírica del benceno, $\\mathrm{C_6H_6}$?",
      "opciones": [
        "$\\mathrm{CH}$",
        "$\\mathrm{C_6H_6}$",
        "$\\mathrm{C_2H_2}$",
        "$\\mathrm{C_3H_3}$"
      ],
      "respuesta": "$\\mathrm{CH}$",
      "explicacion": "Se divide por 6: C₁H₁ se escribe CH. La molecular sigue siendo C₆H₆."
    }
  ]
}$quimia$::jsonb,
  2,
  true),

('quimia-clase-organica-alcanos', 'Alcanos y su nomenclatura',
  'Los hidrocarburos saturados, sus propiedades, los radicales alquilo y las reglas IUPAC para nombrar cadenas ramificadas.',
  'quimia',
  $quimia${
  "pasos": [
    "Los alcanos son hidrocarburos saturados: solo tienen carbono e hidrógeno y todos sus enlaces son simples. Su fórmula general es $\\mathrm{C_nH_{2n+2}}$ (cadena abierta). El más simple, el metano ($\\mathrm{CH_4}$), es el componente principal del gas natural.",
    "Los alcanos forman una serie homóloga: cada uno se diferencia del anterior en un grupo –CH₂–. Los nombres de los diez primeros combinan el prefijo de carbonos con la terminación -ano.",
    "Propiedades a este nivel. Los primeros cuatro (metano, etano, propano y butano) son gases a temperatura ambiente; a partir del pentano y hasta unos 15 carbonos son líquidos; con más carbonos son sólidos, como la parafina. Son insolubles en agua y menos densos que ella (flotan). Sus puntos de ebullición aumentan con el largo de la cadena y bajan con las ramificaciones. Son poco reactivos, salvo para la combustión.",
    "Usos. El metano es el gas natural; el propano y el butano forman el gas envasado en garrafas; la mezcla de alcanos de 5 a 12 carbonos es la nafta; y los de cadena más larga forman el gasoil y las parafinas. Su reacción más importante es la combustión, que se estudia más adelante.",
    "Radicales alquilo. Si a un alcano se le quita un hidrógeno se obtiene un grupo que puede colgar de otra cadena: el radical. Se nombra cambiando -ano por -il, y su fórmula general es $\\mathrm{C_nH_{2n+1}}$. Hay dos con nombre propio que se derivan del propano y del butano: el isopropil, $\\mathrm{CH_3{-}CH(CH_3){-}}$, y el terc-butil, $\\mathrm{(CH_3)_3C{-}}$.",
    "Isomería de cadena. Desde el butano, un mismo número de carbonos se puede ordenar de más de una manera: el butano tiene 2 isómeros de cadena, el pentano 3 y el hexano 5. Son compuestos distintos, con propiedades distintas.",
    "Reglas de la IUPAC para nombrar un alcano ramificado. 1) Se elige la cadena principal: la cadena continua de carbonos más larga, aunque el dibujo la presente doblada. 2) Se numera desde el extremo que da los números más bajos a las ramificaciones (si hay empate, se compara la lista completa). 3) Se nombran las ramificaciones con su número; si se repiten, se usa di-, tri-, tetra-. 4) Se ordenan alfabéticamente (sin contar di-, tri-) y se pega todo con el nombre de la cadena.",
    "Ejemplo 1: 2-metilbutano. La cadena más larga tiene 4 carbonos (butano) y hay un metilo. Numerando de un extremo, el metilo queda en el carbono 2; del otro, en el 3. Se elige el número más bajo: 2.",
    "Ejemplo 2: 2,4-dimetilhexano. La cadena tiene 6 carbonos y dos metilos. Numerando de izquierda a derecha, quedan en 2 y 4; de derecha a izquierda, en 3 y 5. Se elige {2, 4}, porque 2 es menor que 3 en el primer punto de diferencia. Como el radical se repite, se usa «di».",
    "Ejemplo 3: 3-etil-5-metilheptano. La cadena tiene 7 carbonos, un etilo y un metilo. De los dos lados los números son 3 y 5 (empate). Se le da el número más bajo al radical que se cita primero en orden alfabético: etil antes que metil, así que el etilo queda en el 3.",
    "Cómo se escribe el nombre: los números se separan con comas, los números de las letras con guiones, y todo se pega y va en minúscula. Alfabetización: etil, metil y propil se ordenan por su inicial; isopropil va en la «i» y terc-butil en la «b» (no cuenta «terc»). Los prefijos di-, tri- y tetra- no cuentan: «etil» va antes que «dimetil».",
    "Errores frecuentes: elegir la cadena «recta» del dibujo en lugar de la más larga; numerar por el extremo equivocado; poner «1-metil» o «2-etil» (el metilo del extremo alargaría la cadena, y un etilo en el carbono 2 también: 3-metilpentano, no «2-etilbutano»); olvidar el guion o la coma; y no repetir el número de cada radical repetido (2,4-dimetilhexano, no 2-4-dimetil)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 1,
      "titulo": "Los diez primeros alcanos",
      "columnas": [
        "Carbonos",
        "Nombre",
        "Fórmula molecular",
        "Fórmula condensada"
      ],
      "filas": [
        [
          "1",
          "Metano",
          "$\\mathrm{CH_4}$",
          "$\\mathrm{CH_{4}}$"
        ],
        [
          "2",
          "Etano",
          "$\\mathrm{C_2H_6}$",
          "$\\mathrm{CH_{3}{-}CH_{3}}$"
        ],
        [
          "3",
          "Propano",
          "$\\mathrm{C_3H_8}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "4",
          "Butano",
          "$\\mathrm{C_4H_{10}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "5",
          "Pentano",
          "$\\mathrm{C_5H_{12}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "6",
          "Hexano",
          "$\\mathrm{C_6H_{14}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "7",
          "Heptano",
          "$\\mathrm{C_7H_{16}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "8",
          "Octano",
          "$\\mathrm{C_8H_{18}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "9",
          "Nonano",
          "$\\mathrm{C_9H_{20}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "10",
          "Decano",
          "$\\mathrm{C_{10}H_{22}}$",
          "$\\mathrm{CH_{3}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{2}{-}CH_{3}}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 1,
      "molecula": "etano",
      "modo": "formulas"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 4,
      "titulo": "Radicales alquilo (CₙH₂ₙ₊₁)",
      "columnas": [
        "Radical",
        "Se obtiene de",
        "Fórmula"
      ],
      "filas": [
        [
          "metil",
          "metano",
          "$\\mathrm{C_1H_3}$"
        ],
        [
          "etil",
          "etano",
          "$\\mathrm{C_2H_5}$"
        ],
        [
          "propil",
          "propano",
          "$\\mathrm{C_3H_7}$"
        ],
        [
          "butil",
          "butano",
          "$\\mathrm{C_4H_9}$"
        ]
      ]
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 5,
      "moleculas": [
        "butano",
        "2-metilpropano"
      ],
      "isomeria": "cadena"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 5,
      "moleculas": [
        "pentano",
        "2-metilbutano",
        "2,2-dimetilpropano"
      ],
      "isomeria": "cadena"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 7,
      "molecula": "2-metilbutano"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 8,
      "molecula": "2,4-dimetilhexano"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 9,
      "molecula": "3-etil-5-metilheptano"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula molecular del decano?",
      "opciones": [
        "C10H22",
        "C₁₀H₂₀",
        "C₁₀H₂₄",
        "C₁₀H₁₈"
      ],
      "respuesta": "C10H22",
      "explicacion": "Un alcano es CₙH₂ₙ₊₂: con n = 10 son 22 hidrógenos."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CH_{3}{-}CH(CH_{3}){-}CH_{2}{-}CH(CH_{3}){-}CH_{2}{-}CH_{3}}$?",
      "opciones": [
        "2,4-dimetilhexano",
        "3,5-dimetilhexano",
        "2,4-metilhexano",
        "2-metil-4-metilhexano"
      ],
      "respuesta": "2,4-dimetilhexano",
      "explicacion": "La cadena principal es de 6 carbonos y numerando por el extremo correcto los metilos quedan en 2 y 4 (por el otro serían 3 y 5). Se usa di- porque el radical se repite."
    },
    {
      "pregunta": "Un alcano tiene un etilo y un metilo colgando de una cadena de 7 carbonos, ambos en posiciones que dan el mismo conjunto de números por los dos lados (3 y 5). ¿Cuál lleva el número 3?",
      "opciones": [
        "El etilo, por orden alfabético",
        "El metilo, porque es más chico",
        "El que está más cerca del extremo derecho",
        "Da lo mismo"
      ],
      "respuesta": "El etilo, por orden alfabético",
      "explicacion": "Cuando hay empate, el radical que se cita primero alfabéticamente recibe el número más bajo: 3-etil-5-metilheptano."
    },
    {
      "pregunta": "¿Por qué «2-etilbutano» no es un nombre correcto?",
      "opciones": [
        "Porque el etilo no puede estar en el carbono 2",
        "Porque la cadena más larga tiene 5 carbonos: es 3-metilpentano",
        "Porque falta un guion",
        "Porque el butano no admite ramificaciones"
      ],
      "respuesta": "Porque la cadena más larga tiene 5 carbonos: es 3-metilpentano",
      "explicacion": "Con un etilo en el carbono 2 de un butano, la cadena continua más larga tiene 5 carbonos. El compuesto es el 3-metilpentano."
    },
    {
      "pregunta": "¿Qué tienen en común el butano y el 2-metilpropano?",
      "opciones": [
        "Tienen la misma estructura",
        "Tienen distinto número de carbonos",
        "Tienen la misma fórmula molecular, C₄H₁₀, y distinta estructura",
        "Los dos tienen un enlace doble"
      ],
      "respuesta": "Tienen la misma fórmula molecular, C₄H₁₀, y distinta estructura",
      "explicacion": "Son isómeros de cadena: ambos son C4H10. Sus puntos de ebullición son distintos (−1 °C y −12 °C)."
    },
    {
      "pregunta": "En los alcanos, ¿qué fórmula general se cumple (cadena abierta)?",
      "opciones": [
        "$\\mathrm{C_nH_{2n}}$",
        "$\\mathrm{C_nH_{2n+2}}$",
        "$\\mathrm{C_nH_{2n-2}}$",
        "$\\mathrm{C_nH_n}$"
      ],
      "respuesta": "$\\mathrm{C_nH_{2n+2}}$",
      "explicacion": "Un alcano tiene 2 hidrógenos más que el doble de sus carbonos: CₙH₂ₙ₊₂."
    }
  ]
}$quimia$::jsonb,
  3,
  true),

('quimia-clase-organica-alquenos-alquinos', 'Alquenos y alquinos',
  'Hidrocarburos con enlaces dobles y triples: fórmula, nomenclatura, dienos y propiedades.',
  'quimia',
  $quimia${
  "pasos": [
    "Los alquenos tienen al menos un enlace doble C=C y los alquinos, al menos un triple C≡C. Como tienen menos hidrógenos que los alcanos con los mismos carbonos, se llaman insaturados. Con un solo enlace doble la fórmula general es $\\mathrm{C_nH_{2n}}$ y con un solo triple, $\\mathrm{C_nH_{2n-2}}$. Los más simples son el eteno ($\\mathrm{C_2H_4}$), también llamado etileno, y el etino ($\\mathrm{C_2H_2}$), llamado acetileno.",
    "Nomenclatura. Se cambia la terminación -ano del alcano por -eno (doble) o -ino (triple), y se indica con un número la posición: el del primer carbono del enlace múltiple. La cadena se numera por el extremo que da el número más bajo al enlace múltiple. En eteno, etino y propeno se omite el número porque no hay ambigüedad.",
    "Ejemplos: eteno, propeno, but-1-eno, pent-2-eno, etino, propino, but-1-ino, but-2-ino. El número es la posición del primer carbono del enlace: en but-1-eno el doble está entre los carbonos 1 y 2; en but-2-eno, entre el 2 y el 3.",
    "La cadena principal debe contener el enlace múltiple, aunque no sea la más larga. Ejemplo: 3-metilbut-1-eno. Se numera para que el doble enlace reciba el número más bajo (no las ramificaciones). Aviso de nivel: en las recomendaciones de 2013 de la IUPAC pasó a priorizarse la cadena más larga; en el colegio se enseña esta regla anterior, que es la que se usa aquí.",
    "Si hay dos enlaces dobles, la molécula es un dieno y se usa el prefijo di-: se agrega una «a» delante (buta-1,3-dieno) y se dan los dos números. El buta-1,3-dieno es una materia prima para fabricar caucho sintético.",
    "Isomería. Los alquenos pueden tener isomería de posición (but-1-eno y but-2-eno, con el doble enlace en otro lugar de la misma cadena) y también geométrica: cuando cada carbono del doble enlace tiene dos sustituyentes distintos, no puede girar libremente y los sustituyentes pueden quedar del mismo lado (cis) o de lados opuestos (trans). Son compuestos distintos, con propiedades distintas.",
    "Propiedades y reacciones. Los alquenos y los alquinos son más reactivos que los alcanos, porque el enlace π es más débil y accesible. Su reacción típica es la adición: se rompe el π y se unen nuevos átomos (por ejemplo, hidrógeno o bromo). Se ven en la Clase de reacciones. El eteno es una hormona vegetal que acelera la maduración de los frutos y la materia prima del polietileno; el etino se usa en soldadura, porque con oxígeno da una llama muy caliente.",
    "Errores frecuentes: numerar desde el extremo equivocado (el enlace múltiple manda sobre las ramificaciones); olvidar el número en but-1-eno o but-2-eno; escribir «buteno» sin el número; y creer que cualquier alqueno tiene isomería cis-trans (necesita dos sustituyentes distintos en cada carbono del doble enlace)."
  ],
  "visuales": [
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 0,
      "moleculas": [
        "eteno",
        "etino"
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 2,
      "titulo": "Alquenos y alquinos",
      "columnas": [
        "Nombre",
        "Nombre común",
        "Fórmula molecular",
        "Fórmula condensada"
      ],
      "filas": [
        [
          "Eteno",
          "etileno",
          "$\\mathrm{C_2H_4}$",
          "$\\mathrm{CH_{2}{=}CH_{2}}$"
        ],
        [
          "Propeno",
          "propileno",
          "$\\mathrm{C_3H_6}$",
          "$\\mathrm{CH_{2}{=}CH{-}CH_{3}}$"
        ],
        [
          "But-1-eno",
          "—",
          "$\\mathrm{C_4H_8}$",
          "$\\mathrm{CH_{2}{=}CH{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "Pent-2-eno",
          "—",
          "$\\mathrm{C_5H_{10}}$",
          "$\\mathrm{CH_{3}{-}CH{=}CH{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "Etino",
          "acetileno",
          "$\\mathrm{C_2H_2}$",
          "$\\mathrm{CH{\\equiv}CH}$"
        ],
        [
          "Propino",
          "—",
          "$\\mathrm{C_3H_4}$",
          "$\\mathrm{CH{\\equiv}C{-}CH_{3}}$"
        ],
        [
          "But-1-ino",
          "—",
          "$\\mathrm{C_4H_6}$",
          "$\\mathrm{CH{\\equiv}C{-}CH_{2}{-}CH_{3}}$"
        ],
        [
          "But-2-ino",
          "—",
          "$\\mathrm{C_4H_6}$",
          "$\\mathrm{CH_{3}{-}C{\\equiv}C{-}CH_{3}}$"
        ]
      ]
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 3,
      "molecula": "3-metilbut-1-eno"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 4,
      "molecula": "buta-1,3-dieno"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 5,
      "moleculas": [
        "cis-but-2-eno",
        "trans-but-2-eno"
      ],
      "isomeria": "geometrica"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 5,
      "moleculas": [
        "but-1-eno",
        "cis-but-2-eno"
      ],
      "isomeria": "posicion"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula molecular del but-1-eno?",
      "opciones": [
        "C₄H₁₀",
        "C₄H₆",
        "C4H8",
        "C₄H₄"
      ],
      "respuesta": "C4H8",
      "explicacion": "Un alqueno con un enlace doble es CₙH₂ₙ: con n = 4, C₄H₈."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CH_{3}{-}CH{=}CH{-}CH_{2}{-}CH_{3}}$?",
      "opciones": [
        "pent-3-eno",
        "2-penteno-1",
        "pentano-2-eno",
        "pent-2-eno"
      ],
      "respuesta": "pent-2-eno",
      "explicacion": "El doble enlace está entre los carbonos 2 y 3; se numera por el extremo que le da el número más bajo (2)."
    },
    {
      "pregunta": "¿Qué terminación indica un enlace triple?",
      "opciones": [
        "-eno",
        "-ano",
        "-ino",
        "-ona"
      ],
      "respuesta": "-ino",
      "explicacion": "-ino es la terminación de los alquinos; -eno la de los alquenos y -ano la de los alcanos."
    },
    {
      "pregunta": "¿Qué condición debe cumplirse para que un alqueno tenga isomería geométrica (cis-trans)?",
      "opciones": [
        "Que cada carbono del doble enlace tenga dos sustituyentes distintos",
        "Que tenga más de cuatro carbonos",
        "Que el doble enlace esté en el extremo",
        "Que sea un dieno"
      ],
      "respuesta": "Que cada carbono del doble enlace tenga dos sustituyentes distintos",
      "explicacion": "Por ejemplo, el but-2-eno la tiene (cada carbono tiene un H y un CH₃); el but-1-eno, no (un carbono tiene dos H)."
    },
    {
      "pregunta": "¿Por qué los alquenos son más reactivos que los alcanos?",
      "opciones": [
        "Porque el enlace π es más débil y accesible que el σ",
        "Porque tienen más carbonos",
        "Porque tienen oxígeno",
        "Porque son gases"
      ],
      "respuesta": "Porque el enlace π es más débil y accesible que el σ",
      "explicacion": "El enlace π se forma por solapamiento lateral, es más débil y queda expuesto: permite las reacciones de adición."
    }
  ]
}$quimia$::jsonb,
  4,
  true),

('quimia-clase-organica-ciclicos-aromaticos', 'Cicloalcanos y compuestos aromáticos',
  'Hidrocarburos cíclicos, el benceno y sus derivados, y por qué los aromáticos se comportan distinto de los alquenos.',
  'quimia',
  $quimia${
  "pasos": [
    "Algunos hidrocarburos tienen la cadena cerrada en un anillo. Los cicloalcanos tienen solo enlaces simples y fórmula general $\\mathrm{C_nH_{2n}}$ (dos hidrógenos menos que el alcano de cadena abierta, porque los extremos se unen). Se nombran con el prefijo «ciclo» delante del nombre del alcano: ciclopropano, ciclobutano, ciclopentano y ciclohexano.",
    "Se dibujan como polígonos: cada vértice es un carbono. El ciclohexano es un hexágono, $\\mathrm{C_6H_{12}}$. Con un doble enlace, la terminación cambia: ciclohexeno, $\\mathrm{C_6H_{10}}$. Si el anillo lleva un sustituyente, no se numera: metilciclohexano. Los dibujos de esta Clase son esquemas planos de la conectividad.",
    "El benceno, $\\mathrm{C_6H_6}$, es el compuesto aromático más importante: un anillo de seis carbonos, plano, con enlaces dobles alternados en la estructura de Kekulé. En realidad los electrones de los enlaces π están repartidos (deslocalizados) por todo el anillo, y los seis enlaces C–C son iguales, de una longitud intermedia entre un simple y un doble. Cada carbono es sp² (3 enlaces σ y 1 π).",
    "Por esa deslocalización el benceno es mucho más estable que un alqueno: no da fácilmente reacciones de adición, sino de sustitución (un hidrógeno se reemplaza por otro grupo y el anillo se conserva). Por eso los compuestos «aromáticos» (nombre histórico, por sus olores) se estudian aparte de los alquenos.",
    "Derivados del benceno. Con un sustituyente: metilbenceno (tolueno), clorobenceno, y fenol (con un –OH, que no es un alcohol común). Con dos, se numeran los carbonos del anillo: 1,2-dimetilbenceno, 1,3-dimetilbenceno y 1,4-dimetilbenceno. Son los tres isómeros de posición (en nombres antiguos: orto, meta y para).",
    "El benceno es tóxico y cancerígeno (está clasificado por la Agencia Internacional para la Investigación sobre el Cáncer en el grupo 1), por lo que su uso como disolvente está muy restringido. Muchos otros aromáticos, como el tolueno, son materia prima de plásticos, colorantes y medicamentos.",
    "En la práctica de Quimia el benceno aparece dibujado como un hexágono con enlaces dobles alternados: es la misma estructura de Kekulé de esta Clase.",
    "Errores frecuentes: creer que el benceno tiene tres enlaces dobles «fijos» (los electrones están repartidos); confundir «aromático» con «que huele bien» (varios aromáticos son tóxicos); numerar los sustituyentes del anillo con los números más altos en lugar de los más bajos; y pensar que un cicloalcano es lo mismo que el alqueno de igual fórmula (por ejemplo, el ciclobutano y el but-1-eno son isómeros distintos)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 1,
      "molecula": "ciclohexano"
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 2,
      "molecula": "benceno"
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 3,
      "moleculas": [
        "benceno",
        "metilbenceno",
        "fenol"
      ]
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 4,
      "moleculas": [
        "1,2-dimetilbenceno",
        "1,3-dimetilbenceno",
        "1,4-dimetilbenceno"
      ],
      "isomeria": "posicion"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula molecular del ciclopentano?",
      "opciones": [
        "C₅H₁₂",
        "C5H10",
        "C₅H₈",
        "C₅H₁₄"
      ],
      "respuesta": "C5H10",
      "explicacion": "Un cicloalcano es CₙH₂ₙ: con n = 5, C₅H₁₀ (2 hidrógenos menos que el pentano, porque se cierra el anillo)."
    },
    {
      "pregunta": "¿Qué hibridación tiene cada carbono del benceno?",
      "opciones": [
        "sp³",
        "sp",
        "Depende del carbono",
        "sp²"
      ],
      "respuesta": "sp²",
      "explicacion": "Cada carbono tiene 3 enlaces σ y 1 π (deslocalizado): es sp², y el anillo es plano."
    },
    {
      "pregunta": "¿Por qué el benceno no se comporta como un alqueno común?",
      "opciones": [
        "Porque no tiene carbono",
        "Porque sus electrones π están deslocalizados y el anillo es muy estable",
        "Porque no tiene hidrógeno",
        "Porque es un gas"
      ],
      "respuesta": "Porque sus electrones π están deslocalizados y el anillo es muy estable",
      "explicacion": "La deslocalización de los electrones π estabiliza el anillo: prefiere reemplazar hidrógenos (sustitución) antes que romper el anillo (adición)."
    },
    {
      "pregunta": "¿Cómo se llama el benceno con un metilo?",
      "opciones": [
        "metilciclohexano",
        "bencenometano",
        "metilbenceno",
        "1-metilbenceno-2"
      ],
      "respuesta": "metilbenceno",
      "explicacion": "Se nombra con el sustituyente delante: metilbenceno (tolueno). Con un solo sustituyente no se numera."
    },
    {
      "pregunta": "¿Cuántos isómeros de posición tiene el dimetilbenceno?",
      "opciones": [
        "3",
        "2",
        "4",
        "1"
      ],
      "respuesta": "3",
      "explicacion": "Los metilos pueden estar en las posiciones 1 y 2 (1,2-dimetilbenceno), 1 y 3, o 1 y 4: tres isómeros."
    }
  ]
}$quimia$::jsonb,
  5,
  true),

('quimia-clase-organica-oxigenados', 'Alcoholes, éteres, aldehídos y cetonas',
  'Los grupos funcionales oxigenados, cómo se nombran, la prioridad entre grupos y el caso de la glucosa.',
  'quimia',
  $quimia${
  "pasos": [
    "Un grupo funcional es un átomo o grupo de átomos que da a una familia de compuestos sus propiedades químicas características. Escribiendo R para el resto de la cadena de carbonos, un alcohol es R–OH, un éter R–O–R′, un aldehído R–CHO y una cetona R–CO–R′. Mismo esqueleto, distinto grupo: comportamientos muy distintos.",
    "Alcoholes: tienen un grupo hidroxilo –OH unido a un carbono saturado. Terminación -ol, con el número del carbono del –OH si hace falta: metanol, etanol, propan-1-ol, propan-2-ol. Se clasifican por los carbonos unidos al carbono del –OH: primario (propan-1-ol), secundario (propan-2-ol) y terciario (2-metilpropan-2-ol). Con varios –OH: etano-1,2-diol (etilenglicol) y propano-1,2,3-triol (glicerina).",
    "Los alcoholes tienen puntos de ebullición altos para su tamaño, porque las moléculas se unen entre sí por puentes de hidrógeno (el H del –OH con el O de otra molécula). Ejemplo: el etanol hierve a 78 °C, mientras que su isómero, el metoximetano, que no tiene –OH, hierve a −25 °C. El etanol es el alcohol de las bebidas y un disolvente muy usado; el metanol es tóxico.",
    "Éteres: un oxígeno entre dos carbonos, R–O–R′. Se nombran como un alcano con un sustituyente «alcoxi»: metoximetano, metoxietano y etoxietano (éter etílico, que se usó como anestésico). Son poco reactivos y son isómeros de función de los alcoholes con la misma fórmula (por ejemplo, $\\mathrm{C_2H_6O}$).",
    "Aldehídos: un grupo carbonilo C=O en el extremo de la cadena, unido a un hidrógeno (R–CHO). Terminación -al: metanal (en solución acuosa se llama formol) y etanal. El carbono del –CHO es siempre el número 1, por eso no lleva número en el nombre.",
    "Cetonas: un carbonilo C=O en el interior de la cadena, unido a dos carbonos (R–CO–R′). Terminación -ona, con número si hace falta: propanona (acetona, un disolvente), butanona, pentan-2-ona y pentan-3-ona.",
    "Aldehído y cetona con los mismos átomos son isómeros de función: el propanal y la propanona son C3H6O. La diferencia es dónde está el C=O: en el extremo (aldehído) o en el medio (cetona).",
    "Prioridad entre grupos. Si una molécula tiene más de un grupo, uno solo define la terminación (el principal) y los demás se nombran como prefijos. El orden de prioridad de los grupos que se ven en esta Clase y la siguiente es: ácido carboxílico > éster > amida > aldehído > cetona > alcohol > amina. Ejemplos: 2-hidroxipropanal (el aldehído gana al alcohol), 1-hidroxipropan-2-ona (la cetona gana al alcohol) y ácido 3-oxobutanoico (el ácido gana a la cetona, que pasa a «oxo»).",
    "La glucosa es un buen ejemplo de una molécula con varios grupos. En su forma de cadena abierta tiene un aldehído y cinco alcoholes: se nombra 2,3,4,5,6-pentahidroxihexanal ($\\mathrm{C_6H_{12}O_6}$). Como el aldehído es el grupo principal, recibe el carbono 1 y los cinco alcoholes son prefijos «hidroxi». Sus muchos –OH forman puentes de hidrógeno con el agua, por eso es muy soluble. En agua, casi toda la glucosa está en forma de anillo, pero la cadena abierta es la representación más simple.",
    "Errores frecuentes: confundir aldehído y cetona (el C=O en el extremo o en el medio); confundir alcohol con éter; olvidar el número del –OH (propan-1-ol y propan-2-ol son compuestos distintos); y creer que en una molécula con dos grupos se nombran los dos como sufijo (solo el principal lleva terminación)."
  ],
  "visuales": [
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 1,
      "moleculas": [
        "metanol",
        "etanol",
        "propan-1-ol",
        "propan-2-ol",
        "2-metilpropan-2-ol",
        "etano-1,2-diol"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 3,
      "moleculas": [
        "metoximetano",
        "metoxietano",
        "etoxietano"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 4,
      "moleculas": [
        "metanal",
        "etanal",
        "propanal"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 5,
      "moleculas": [
        "propanona",
        "butanona",
        "pentan-2-ona",
        "pentan-3-ona"
      ]
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 6,
      "moleculas": [
        "propanal",
        "propanona"
      ],
      "isomeria": "funcion"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 7,
      "titulo": "Orden de prioridad de los grupos",
      "columnas": [
        "Prioridad",
        "Grupo",
        "Como sufijo (principal)",
        "Como prefijo"
      ],
      "filas": [
        [
          "1",
          "ácido carboxílico",
          "-oico",
          "carboxi-"
        ],
        [
          "2",
          "éster",
          "-oato de -ilo",
          "—"
        ],
        [
          "3",
          "amida",
          "-amida",
          "carbamoil-"
        ],
        [
          "4",
          "aldehído",
          "-al",
          "oxo- (formil-)"
        ],
        [
          "5",
          "cetona",
          "-ona",
          "oxo-"
        ],
        [
          "6",
          "alcohol",
          "-ol",
          "hidroxi-"
        ],
        [
          "7",
          "amina",
          "-amina",
          "amino-"
        ]
      ]
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 8,
      "molecula": "glucosa-abierta"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}CH(OH){-}CH_{3}}$?",
      "opciones": [
        "Alcohol (primario)",
        "Éter",
        "Cetona",
        "Alcohol (secundario)"
      ],
      "respuesta": "Alcohol (secundario)",
      "explicacion": "El –OH está en un carbono unido a dos carbonos: alcohol secundario. El propan-1-ol es primario."
    },
    {
      "pregunta": "¿Qué diferencia hay entre un aldehído y una cetona?",
      "opciones": [
        "El C=O está en el extremo (aldehído) o en el interior de la cadena (cetona)",
        "El aldehído tiene oxígeno y la cetona no",
        "La cetona es un alcohol",
        "El aldehído tiene doble enlace C=C"
      ],
      "respuesta": "El C=O está en el extremo (aldehído) o en el interior de la cadena (cetona)",
      "explicacion": "Los dos tienen un C=O. En el propanal está en el extremo (unido a un H); en la propanona, en el medio."
    },
    {
      "pregunta": "¿Por qué el etanol hierve a mayor temperatura que su isómero, el metoximetano?",
      "opciones": [
        "Porque tiene más átomos",
        "Porque el etanol forma puentes de hidrógeno entre sus moléculas",
        "Porque tiene distinta fórmula molecular",
        "Porque es un gas"
      ],
      "respuesta": "Porque el etanol forma puentes de hidrógeno entre sus moléculas",
      "explicacion": "El –OH del etanol forma puentes de hidrógeno; el éter no. El etanol hierve a 78 °C y el éter a −25 °C."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CH_{2}OCH_{3}{-}CH_{3}}$?",
      "opciones": [
        "etoximetano",
        "dietil éter",
        "metanol etilado",
        "metoxietano"
      ],
      "respuesta": "metoxietano",
      "explicacion": "Se nombra como un alcano (el de la cadena más larga, etano) con un sustituyente alcoxi (metoxi)."
    },
    {
      "pregunta": "En la 2,3,4,5,6-pentahidroxihexanal (cadena abierta), ¿qué grupos funcionales hay?",
      "opciones": [
        "Una cetona y cinco alcoholes",
        "Un aldehído y cinco alcoholes",
        "Un ácido y cinco éteres",
        "Un alcohol solamente"
      ],
      "respuesta": "Un aldehído y cinco alcoholes",
      "explicacion": "El carbono 1 es un aldehído (–CHO) y los carbonos 2 a 6 tienen un –OH cada uno."
    },
    {
      "pregunta": "Si una molécula tiene un aldehído y un alcohol, ¿cuál define la terminación?",
      "opciones": [
        "El alcohol, porque es más pequeño",
        "El aldehído: el alcohol pasa a «hidroxi-»",
        "Los dos, con -al-ol",
        "Ninguno: se nombra como alcano"
      ],
      "respuesta": "El aldehído: el alcohol pasa a «hidroxi-»",
      "explicacion": "El aldehído tiene mayor prioridad que el alcohol. Por ejemplo, 2-hidroxipropanal."
    }
  ]
}$quimia$::jsonb,
  6,
  true),

('quimia-clase-organica-acidos-esteres-nitrogenados', 'Ácidos carboxílicos, ésteres, aminas, amidas y haluros',
  'Los demás grupos funcionales: cómo se reconocen y se nombran, con una tabla resumen de todos los grupos.',
  'quimia',
  $quimia${
  "pasos": [
    "Ácidos carboxílicos: tienen el grupo carboxilo, –COOH (un carbonilo con un –OH en el mismo carbono). Se nombran «ácido» + la cadena + terminación -oico: ácido metanoico, ácido etanoico, ácido propanoico. El carbono del –COOH es siempre el 1. Son ácidos débiles. Tienen nombres comunes muy usados, que la práctica de Quimia también usa: el ácido fórmico (presente en las hormigas, del latín formica) y el ácido acético (el del vinagre).",
    "Ésteres: son derivados de un ácido carboxílico y un alcohol, y tienen el grupo –COO– (R–COO–R′). Se nombran con la terminación -oato del ácido, «de» y el radical del alcohol con terminación -ilo: etanoato de metilo, etanoato de etilo y propanoato de metilo. Muchos ésteres tienen olores agradables de frutas y flores y se usan como aromatizantes.",
    "Cómo se nombra un éster: 1) se mira la parte del ácido (la que tiene el C=O): el etanoato de etilo viene de un ácido de 2 carbonos (ácido etanoico), y esa parte se nombra «etanoato»; 2) la otra parte, unida al oxígeno, viene de un alcohol de 2 carbonos (etanol) y se nombra «de etilo». El nombre empieza por la parte del ácido (la que tiene el C=O) y sigue con la del alcohol (la que está unida al oxígeno).",
    "Aminas: se pueden ver como derivadas del amoníaco, NH₃, con hidrógenos reemplazados por radicales. La más simple es R–NH₂ (amina primaria). Se nombran con la terminación -amina: metanamina, etanamina, propan-1-amina y propan-2-amina. Son bases débiles y muchas tienen olor fuerte, como el del pescado en descomposición.",
    "Amidas: un carbonilo unido a un nitrógeno, R–CONH₂. Terminación -amida: etanamida, propanamida. Son importantes porque el enlace que une los aminoácidos en las proteínas es un enlace amida (enlace peptídico). Un aminoácido tiene una amina y un ácido en la misma molécula: la glicina es el ácido 2-aminoetanoico ($\\mathrm{C_2H_5NO_2}$), donde el ácido manda y la amina pasa a prefijo «amino».",
    "Haluros de alquilo: un halógeno (F, Cl, Br, I) unido a un carbono, R–X. Se nombran como un alcano con un prefijo (fluoro-, cloro-, bromo-, yodo-): clorometano, cloroetano, 1-cloropropano, 2-cloropropano, 1,2-dicloroetano y triclorometano (cloroformo, que se usó como anestésico y hoy está muy restringido por su toxicidad).",
    "La tabla resume todos los grupos funcionales vistos, con su fórmula general y su terminación o prefijo.",
    "Errores frecuentes: confundir éster con éter (el éster tiene un C=O); confundir amida con amina (la amida tiene el C=O); confundir cuál es la parte del ácido (la que tiene el C=O) y cuál la del alcohol al armar el nombre del éster; y nombrar el ácido como «alcohol» por el –OH (el –OH del carboxilo no es un alcohol)."
  ],
  "visuales": [
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 0,
      "moleculas": [
        "acido-metanoico",
        "acido-etanoico",
        "acido-propanoico"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 1,
      "moleculas": [
        "etanoato-de-metilo",
        "etanoato-de-etilo",
        "propanoato-de-metilo"
      ]
    },
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 2,
      "molecula": "etanoato-de-etilo"
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 3,
      "moleculas": [
        "metanamina",
        "etanamina",
        "propan-2-amina"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 4,
      "moleculas": [
        "etanamida",
        "acido-2-aminoetanoico"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 5,
      "moleculas": [
        "clorometano",
        "1,2-dicloroetano",
        "triclorometano"
      ]
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 6,
      "titulo": "Los grupos funcionales de esta Clase y las anteriores",
      "columnas": [
        "Grupo",
        "Fórmula general",
        "Terminación o prefijo",
        "Ejemplo"
      ],
      "filas": [
        [
          "alcohol",
          "$\\mathrm{R{-}OH}$",
          "-ol",
          "propan-1-ol"
        ],
        [
          "éter",
          "$\\mathrm{R{-}O{-}R'}$",
          "alcoxi-",
          "metoxietano"
        ],
        [
          "aldehído",
          "$\\mathrm{R{-}CHO}$",
          "-al",
          "propanal"
        ],
        [
          "cetona",
          "$\\mathrm{R{-}CO{-}R'}$",
          "-ona",
          "propanona"
        ],
        [
          "ácido carboxílico",
          "$\\mathrm{R{-}COOH}$",
          "-oico",
          "ácido propanoico"
        ],
        [
          "éster",
          "$\\mathrm{R{-}COO{-}R'}$",
          "-oato de -ilo",
          "etanoato de etilo"
        ],
        [
          "amina",
          "$\\mathrm{R{-}NH_2}$",
          "-amina",
          "propan-1-amina"
        ],
        [
          "amida",
          "$\\mathrm{R{-}CONH_2}$",
          "-amida",
          "propanamida"
        ],
        [
          "haluro",
          "$\\mathrm{R{-}X}$",
          "halo-",
          "1-cloropropano"
        ],
        [
          "alqueno",
          "$\\mathrm{C{=}C}$",
          "-eno",
          "propeno"
        ],
        [
          "alquino",
          "$\\mathrm{C{\\equiv}C}$",
          "-ino",
          "propino"
        ],
        [
          "aromático",
          "$\\mathrm{C_6H_5{-}}$",
          "benceno",
          "metilbenceno"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}COOH}$?",
      "opciones": [
        "Alcohol",
        "Éster",
        "Cetona",
        "Ácido carboxílico"
      ],
      "respuesta": "Ácido carboxílico",
      "explicacion": "Tiene el grupo –COOH (un carbono con un C=O y un –OH). Se llama ácido etanoico o, en su nombre común, ácido acético."
    },
    {
      "pregunta": "¿A qué familia pertenece $\\mathrm{CH_{3}{-}COO{-}CH_{2}{-}CH_{3}}$?",
      "opciones": [
        "Éster",
        "Éter",
        "Ácido carboxílico",
        "Cetona"
      ],
      "respuesta": "Éster",
      "explicacion": "El grupo –COO– (un C=O con un oxígeno unido a otro carbono) es un éster."
    },
    {
      "pregunta": "Un éster se forma a partir de...",
      "opciones": [
        "Dos alcoholes",
        "Un aldehído y una amina",
        "Un ácido carboxílico y un alcohol",
        "Un éter y agua"
      ],
      "respuesta": "Un ácido carboxílico y un alcohol",
      "explicacion": "R–COOH + R′–OH forman el éster R–COO–R′ y agua."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CH_{3}{-}CONH_{2}}$?",
      "opciones": [
        "etanamina",
        "ácido etanoico",
        "etanamida",
        "etanoato de amonio"
      ],
      "respuesta": "etanamida",
      "explicacion": "El carbonilo unido al nitrógeno es una amida: terminación -amida. La amina, sin C=O, se llamaría etanamina."
    },
    {
      "pregunta": "¿Cómo se llama $\\mathrm{CH_{3}{-}CH(Cl){-}CH_{3}}$?",
      "opciones": [
        "1-cloropropano",
        "cloruro de propilo",
        "2-cloropropano",
        "propanol cloro"
      ],
      "respuesta": "2-cloropropano",
      "explicacion": "El cloro es un prefijo sobre la cadena de 3 carbonos, en el carbono 2."
    },
    {
      "pregunta": "En la glicina, ácido 2-aminoetanoico, ¿por qué el nombre termina en -oico y no en -amina?",
      "opciones": [
        "Porque la amina no puede ser prefijo",
        "Porque el ácido carboxílico tiene más prioridad que la amina",
        "Porque tiene 2 carbonos",
        "Porque el nitrógeno no es un grupo funcional"
      ],
      "respuesta": "Porque el ácido carboxílico tiene más prioridad que la amina",
      "explicacion": "Cuando una molécula tiene un ácido y una amina, el ácido define la terminación y la amina pasa a prefijo «amino»."
    }
  ]
}$quimia$::jsonb,
  7,
  true),

('quimia-clase-organica-isomeria', 'Isomería',
  'Isómeros de cadena, de posición, de función y geométricos (cis-trans), y por qué tienen propiedades distintas.',
  'quimia',
  $quimia${
  "pasos": [
    "Los isómeros son compuestos con la misma fórmula molecular y distinta estructura: los mismos átomos, unidos de otra manera. Como la estructura decide las propiedades, los isómeros son sustancias diferentes. Para reconocerlos: primero se calcula la fórmula molecular de cada uno, y si coincide, se compara la estructura.",
    "Isomería de cadena: cambia el esqueleto de carbonos (lineal o ramificado) con la misma fórmula. Los alcanos de 4, 5 y 6 carbonos tienen 2, 3 y 5 isómeros respectivamente, y la cantidad crece rápido: el de 10 carbonos tiene 75. Los de 5 carbonos son pentano, 2-metilbutano y 2,2-dimetilpropano.",
    "Isomería de posición: el mismo esqueleto y el mismo grupo o enlace múltiple, pero en otro carbono. Por ejemplo, propan-1-ol y propan-2-ol, o but-1-eno y but-2-eno.",
    "Isomería de función: la misma fórmula, pero con grupos funcionales distintos, o sea familias distintas. Ejemplos: etanol (alcohol) y metoximetano (éter), ambos C2H6O; propanal (aldehído) y propanona (cetona), ambos C3H6O; y ácido propanoico (ácido) con etanoato de metilo (éster), ambos C3H6O2.",
    "Isomería geométrica (cis-trans): se da en los alquenos cuando cada carbono del doble enlace tiene dos sustituyentes distintos. Como el doble enlace no gira, los sustituyentes pueden quedar del mismo lado (cis) o de lados opuestos (trans). Ejemplo: cis-but-2-eno y trans-but-2-eno. También aparece en los cicloalcanos sustituidos.",
    "Los isómeros tienen propiedades distintas. Los de cadena: el butano hierve a −1 °C y el 2-metilpropano a −12 °C: la ramificación baja el punto de ebullición porque hace la molécula más compacta. Los de función: el etanol hierve a 78 °C y el metoximetano a −25 °C, porque solo el alcohol forma puentes de hidrógeno.",
    "Hay otro tipo de isomería, la óptica (moléculas que son imágenes especulares no superponibles, que aparecen cuando un carbono tiene cuatro sustituyentes distintos), que queda fuera de este nivel.",
    "Errores frecuentes: creer que basta con que tengan los mismos elementos (tienen que tener los mismos átomos en la misma cantidad); llamar isómeros a compuestos con el mismo número de carbonos pero distinta cantidad de hidrógenos (como propano y propeno); y confundir el isómero de posición con el mismo compuesto numerado de otro lado (el propan-1-ol y el propan-3-ol son el mismo: se numera desde el lado que da el número más bajo)."
  ],
  "visuales": [
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 1,
      "moleculas": [
        "pentano",
        "2-metilbutano",
        "2,2-dimetilpropano"
      ],
      "isomeria": "cadena"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 2,
      "moleculas": [
        "propan-1-ol",
        "propan-2-ol"
      ],
      "isomeria": "posicion"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 3,
      "moleculas": [
        "etanol",
        "metoximetano"
      ],
      "isomeria": "funcion"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 3,
      "moleculas": [
        "acido-propanoico",
        "etanoato-de-metilo",
        "metanoato-de-etilo"
      ],
      "isomeria": "funcion"
    },
    {
      "tipo": "quimia.isomeria",
      "despuesDePaso": 4,
      "moleculas": [
        "cis-but-2-eno",
        "trans-but-2-eno"
      ],
      "isomeria": "geometrica"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 5,
      "titulo": "Isómeros con propiedades distintas",
      "columnas": [
        "Isómeros",
        "Tipo",
        "Punto de ebullición (°C)"
      ],
      "filas": [
        [
          "Butano y 2-metilpropano",
          "de cadena",
          "−1 y −12"
        ],
        [
          "Etanol y metoximetano",
          "de función",
          "78 y −25"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué tipo de isomería hay entre el propanal y la propanona?",
      "opciones": [
        "De función",
        "De cadena",
        "De posición",
        "Geométrica"
      ],
      "respuesta": "De función",
      "explicacion": "Los dos son C3H6O, pero uno es un aldehído y el otro una cetona: cambia la familia."
    },
    {
      "pregunta": "¿Qué tipo de isomería hay entre el propan-1-ol y el propan-2-ol?",
      "opciones": [
        "De cadena",
        "De función",
        "De posición",
        "Óptica"
      ],
      "respuesta": "De posición",
      "explicacion": "El esqueleto y el grupo son los mismos (–OH), pero el –OH está en un carbono distinto."
    },
    {
      "pregunta": "¿Cuántos isómeros de cadena tiene el hexano, C6H14, contando el hexano mismo?",
      "opciones": [
        "3",
        "4",
        "5",
        "9"
      ],
      "respuesta": "5",
      "explicacion": "Son 5: hexano, 2-metilpentano, 3-metilpentano, 2,2-dimetilbutano y 2,3-dimetilbutano."
    },
    {
      "pregunta": "¿Qué necesita un alqueno para tener isomería geométrica?",
      "opciones": [
        "Más de 4 carbonos",
        "Dos sustituyentes distintos en cada carbono del doble enlace",
        "Un triple enlace",
        "Un grupo –OH"
      ],
      "respuesta": "Dos sustituyentes distintos en cada carbono del doble enlace",
      "explicacion": "El but-2-eno la tiene (cada carbono tiene H y CH₃); el but-1-eno, no."
    },
    {
      "pregunta": "¿Por qué el 2-metilpropano hierve a menor temperatura que el butano?",
      "opciones": [
        "Porque tiene menos carbonos",
        "La ramificación hace la molécula más compacta y las fuerzas entre moléculas son menores",
        "Porque tiene otra fórmula molecular",
        "Porque tiene un enlace doble"
      ],
      "respuesta": "La ramificación hace la molécula más compacta y las fuerzas entre moléculas son menores",
      "explicacion": "Los dos son C4H10. El ramificado hierve a −12 °C y el lineal a −1 °C."
    }
  ]
}$quimia$::jsonb,
  8,
  true),

('quimia-clase-organica-reacciones', 'Reacciones orgánicas básicas',
  'Combustión, sustitución, adición, esterificación, oxidación de alcoholes y fermentación, con ecuaciones balanceadas.',
  'quimia',
  $quimia${
  "pasos": [
    "Una reacción orgánica rompe y forma enlaces alrededor de los grupos funcionales. A este nivel se ven cinco tipos: combustión, sustitución, adición, esterificación (una condensación) y oxidación. En los ejemplos, las ecuaciones están balanceadas y verificadas.",
    "Combustión. Es la reacción con oxígeno y libera energía. Si el oxígeno alcanza, es completa y produce CO₂ y H₂O: $\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$ $\\mathrm{C_2H_5OH} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{CO_2} + 3\\,\\mathrm{H_2O}$ Si el oxígeno falta, es incompleta y se forma monóxido de carbono (CO), que es un gas tóxico, o carbono (hollín): $2\\,\\mathrm{CH_4} + 3\\,\\mathrm{O_2} \\rightarrow 2\\,\\mathrm{CO} + 4\\,\\mathrm{H_2O}$ Por eso hay que ventilar los ambientes donde se queman combustibles. La combustión es una reacción redox: el carbono se oxida (por ejemplo, de −4 a +4).",
    "Sustitución. Un átomo (un hidrógeno) se reemplaza por otro. Los alcanos, poco reactivos, reaccionan con los halógenos en presencia de luz: $\\mathrm{CH_4} + \\mathrm{Cl_2} \\rightarrow \\mathrm{CH_3Cl} + \\mathrm{HCl}$ Se forma clorometano. También es típica de los compuestos aromáticos: el benceno reemplaza hidrógenos sin perder el anillo.",
    "Adición. Se rompe el enlace π de un doble o triple enlace y se agregan átomos, sin perder ninguno. Con hidrógeno (hidrogenación): $\\mathrm{C_2H_4} + \\mathrm{H_2} \\rightarrow \\mathrm{C_2H_6}$ el eteno pasa a etano. Con bromo: $\\mathrm{C_2H_4} + \\mathrm{Br_2} \\rightarrow \\mathrm{C_2H_4Br_2}$ se forma el 1,2-dibromoetano; como el bromo se decolora, sirve para reconocer un enlace múltiple. Con agua: $\\mathrm{C_2H_4} + \\mathrm{H_2O} \\rightarrow \\mathrm{C_2H_5OH}$ se forma etanol. Con HCl: $\\mathrm{C_2H_4} + \\mathrm{HCl} \\rightarrow \\mathrm{C_2H_5Cl}$ se forma cloroetano.",
    "Si el alqueno es asimétrico, la adición de HX sigue la regla de Markovnikov: el hidrógeno se une al carbono del doble enlace que ya tiene más hidrógenos. Con propeno: $\\mathrm{C_3H_6} + \\mathrm{HCl} \\rightarrow \\mathrm{C_3H_7Cl}$ el producto principal es el 2-cloropropano y no el 1-cloropropano. Muchos alquenos también se unen entre sí (polimerización), como se verá con el polietileno.",
    "Esterificación. Un ácido carboxílico y un alcohol forman un éster y agua, con un ácido fuerte como catalizador. Es reversible: $\\mathrm{CH_3COOH} + \\mathrm{C_2H_5OH} \\rightleftharpoons \\mathrm{CH_3COOC_2H_5} + \\mathrm{H_2O}$ Se forma el etanoato de etilo a partir del ácido etanoico y del etanol. Se comprobó con oxígeno marcado que el agua sale del –OH del ácido y del H del alcohol. La reacción inversa (con agua) se llama hidrólisis.",
    "Oxidación de alcoholes (redox en orgánica). Con un agente oxidante como el dicromato de potasio o el permanganato, un alcohol primario se oxida a aldehído y después a ácido carboxílico; uno secundario, a cetona; y uno terciario no se oxida en condiciones suaves. Si O es el oxígeno que aporta el oxidante: $\\mathrm{C_2H_5OH} + \\mathrm{O} \\rightarrow \\mathrm{CH_3CHO} + \\mathrm{H_2O}$ $\\mathrm{CH_3CHO} + \\mathrm{O} \\rightarrow \\mathrm{CH_3COOH}$ $\\mathrm{CH_3CH(OH)CH_3} + \\mathrm{O} \\rightarrow \\mathrm{CH_3COCH_3} + \\mathrm{H_2O}$ En cada paso el carbono se oxida: su número de oxidación promedio pasa de −2 en el etanol a −1 en el etanal y a 0 en el ácido etanoico.",
    "Fermentación. Algunos microorganismos (las levaduras) transforman la glucosa en etanol y CO₂ sin oxígeno: $\\mathrm{C_6H_{12}O_6} \\rightarrow 2\\,\\mathrm{C_2H_5OH} + 2\\,\\mathrm{CO_2}$ Es la base de la elaboración de vino y cerveza, y el CO₂ es el que hace crecer el pan.",
    "La tabla resume los cinco tipos de reacción con un ejemplo de cada uno.",
    "Errores frecuentes: confundir sustitución con adición (en la sustitución sale un producto más, como el HCl; en la adición no sale nada); olvidar balancear el oxígeno al final en la combustión; creer que la combustión incompleta forma solo CO₂; y aplicar Markovnikov al revés (el H va al carbono con más H)."
  ],
  "visuales": [
    {
      "tipo": "quimia.redox",
      "despuesDePaso": 1,
      "ejemplo": "ch4-o2"
    },
    {
      "tipo": "quimia.cuadro",
      "despuesDePaso": 8,
      "titulo": "Cinco tipos de reacción",
      "columnas": [
        "Tipo",
        "Qué ocurre",
        "Ejemplo"
      ],
      "filas": [
        [
          "Combustión",
          "reacciona con O₂ y libera energía",
          "$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$"
        ],
        [
          "Sustitución",
          "un átomo reemplaza a otro",
          "$\\mathrm{CH_4} + \\mathrm{Cl_2} \\rightarrow \\mathrm{CH_3Cl} + \\mathrm{HCl}$"
        ],
        [
          "Adición",
          "se rompe un enlace π y se agregan átomos",
          "$\\mathrm{C_2H_4} + \\mathrm{H_2} \\rightarrow \\mathrm{C_2H_6}$"
        ],
        [
          "Esterificación",
          "ácido + alcohol → éster + agua",
          "$\\mathrm{CH_3COOH} + \\mathrm{C_2H_5OH} \\rightleftharpoons \\mathrm{CH_3COOC_2H_5} + \\mathrm{H_2O}$"
        ],
        [
          "Oxidación",
          "un alcohol pasa a aldehído, cetona o ácido",
          "$\\mathrm{C_2H_5OH} + \\mathrm{O} \\rightarrow \\mathrm{CH_3CHO} + \\mathrm{H_2O}$"
        ]
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "En la combustión completa del metano, ¿qué productos se forman?",
      "opciones": [
        "CO y H₂",
        "C y H₂O",
        "CH₃OH y O₂",
        "CO₂ y H₂O"
      ],
      "respuesta": "CO₂ y H₂O",
      "explicacion": "La combustión completa de un hidrocarburo da dióxido de carbono y agua. Si falta oxígeno se forma CO (incompleta)."
    },
    {
      "pregunta": "¿Qué tipo de reacción es $\\mathrm{C_2H_4} + \\mathrm{H_2} \\rightarrow \\mathrm{C_2H_6}$ ?",
      "opciones": [
        "Sustitución",
        "Adición",
        "Combustión",
        "Esterificación"
      ],
      "respuesta": "Adición",
      "explicacion": "Se rompe el enlace π del eteno y se agregan dos hidrógenos, sin que salga ningún producto adicional: es una adición (hidrogenación)."
    },
    {
      "pregunta": "¿Qué tipo de reacción es $\\mathrm{CH_4} + \\mathrm{Cl_2} \\rightarrow \\mathrm{CH_3Cl} + \\mathrm{HCl}$ ?",
      "opciones": [
        "Adición",
        "Sustitución",
        "Esterificación",
        "Polimerización"
      ],
      "respuesta": "Sustitución",
      "explicacion": "Un hidrógeno del metano se reemplaza por un cloro y sale HCl: es una sustitución."
    },
    {
      "pregunta": "¿Qué se forma al reaccionar un ácido carboxílico con un alcohol?",
      "opciones": [
        "Un éster y agua",
        "Un aldehído y agua",
        "Una amida y agua",
        "Un éter y CO₂"
      ],
      "respuesta": "Un éster y agua",
      "explicacion": "La esterificación produce un éster y agua, y es reversible."
    },
    {
      "pregunta": "Al oxidar suavemente el propan-2-ol (alcohol secundario), se obtiene...",
      "opciones": [
        "propanona",
        "propanal",
        "ácido propanoico",
        "no se oxida"
      ],
      "respuesta": "propanona",
      "explicacion": "Un alcohol secundario se oxida a una cetona; el primario, a aldehído y después a ácido; el terciario no se oxida en condiciones suaves."
    },
    {
      "pregunta": "Según la regla de Markovnikov, en la adición de HCl al propeno, ¿a qué carbono del doble enlace se une el hidrógeno?",
      "opciones": [
        "Al que tiene menos hidrógenos",
        "A cualquiera, en partes iguales",
        "Al que ya tiene más hidrógenos",
        "Al carbono del metilo"
      ],
      "respuesta": "Al que ya tiene más hidrógenos",
      "explicacion": "El H se une al carbono con más H (el CH₂ terminal), y el Cl queda en el carbono del medio: se forma sobre todo 2-cloropropano."
    }
  ]
}$quimia$::jsonb,
  9,
  true),

('quimia-clase-organica-glucosa-polimeros', 'Glucosa y polímeros',
  'De la molécula pequeña a la grande: la glucosa y los carbohidratos, el eteno y el polietileno, y los polímeros naturales.',
  'quimia',
  $quimia${
  "pasos": [
    "Los carbohidratos (o hidratos de carbono) son compuestos orgánicos cuyas fórmulas son del tipo $\\mathrm{C_n(H_2O)_n}$, de ahí su nombre. La glucosa, $\\mathrm{C_6H_{12}O_6}$, es el más importante: es la principal fuente de energía de las células. Su fórmula empírica es $\\mathrm{CH_2O}$, que es la misma del ácido etanoico, aunque son moléculas muy distintas.",
    "Estructura. En su forma de cadena abierta la glucosa tiene 6 carbonos, un aldehído en el primero y un –OH en cada uno de los otros cinco: 2,3,4,5,6-pentahidroxihexanal. Por eso es un polialcohol con un grupo aldehído, muy soluble en agua (los –OH forman puentes de hidrógeno). En agua, casi toda la glucosa se cierra en un anillo, pero la cadena abierta es la representación más simple.",
    "La glucosa es el punto de partida y de llegada de dos procesos biológicos que son reacciones redox. En la respiración celular se oxida con oxígeno: $\\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2} \\rightarrow 6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O}$ y en la fotosíntesis se forma a partir de CO₂ y agua con energía de la luz: $6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} \\rightarrow \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2}$ El carbono pasa de +4 en el CO₂ a un promedio de 0 en la glucosa (reducción).",
    "Polímeros. Un polímero es una molécula muy grande formada por la repetición de unidades pequeñas, los monómeros. Ejemplo: el polietileno se forma al unirse muchas moléculas de eteno. La reacción es una polimerización por adición: $n\\,\\mathrm{CH_2{=}CH_2} \\rightarrow \\mathrm{(CH_2{-}CH_2)_n}$, donde cada unidad conserva sus átomos ($\\mathrm{C_2H_4}$). Es la base de muchos plásticos.",
    "Polímeros naturales. Los polisacáridos (almidón, celulosa, glucógeno) son polímeros de la glucosa: se unen con pérdida de agua. Para una cadena de n unidades: $n\\,\\mathrm{C_6H_{12}O_6} \\rightarrow \\mathrm{H(C_6H_{10}O_5)_nOH} + (n-1)\\,\\mathrm{H_2O}$ (cada unión libera una molécula de agua, y los extremos de la cadena completan H y OH). El almidón es la reserva de energía de las plantas, el glucógeno la de los animales, y la celulosa forma las paredes de las células vegetales.",
    "Las proteínas son polímeros de aminoácidos. Cada aminoácido tiene una amina y un ácido carboxílico (como la glicina, ácido 2-aminoetanoico), y se unen con enlaces amida (enlaces peptídicos) que liberan agua, igual que los polisacáridos.",
    "Comparación: en un polímero de adición (polietileno) las unidades se suman sin perder átomos; en uno de condensación (polisacáridos, proteínas) cada unión libera una molécula pequeña, como el agua. Las moléculas pequeñas se llaman monómeros y la molécula grande, polímero.",
    "Errores frecuentes: creer que la glucosa y el ácido acético son la misma sustancia porque tienen igual fórmula empírica (CH₂O); confundir monómero con polímero; olvidar que en los polisacáridos se pierde agua en cada enlace; y creer que la cadena abierta es la única forma de la glucosa (en solución es un anillo)."
  ],
  "visuales": [
    {
      "tipo": "quimia.cadena",
      "despuesDePaso": 1,
      "molecula": "glucosa-abierta"
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 1,
      "moleculas": [
        "glucosa-abierta"
      ]
    },
    {
      "tipo": "quimia.grupos",
      "despuesDePaso": 5,
      "moleculas": [
        "acido-2-aminoetanoico"
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuál es la fórmula molecular de la glucosa?",
      "opciones": [
        "C₆H₁₂O₅",
        "C₆H₆O₆",
        "C₁₂H₂₂O₁₁",
        "C6H12O6"
      ],
      "respuesta": "C6H12O6",
      "explicacion": "La glucosa es C₆H₁₂O₆, o sea C₆(H₂O)₆: de ahí el nombre «hidrato de carbono»."
    },
    {
      "pregunta": "¿Qué grupos funcionales hay en la glucosa de cadena abierta?",
      "opciones": [
        "Un aldehído y cinco alcoholes",
        "Una cetona y cinco éteres",
        "Un ácido y un alcohol",
        "Solo alcoholes"
      ],
      "respuesta": "Un aldehído y cinco alcoholes",
      "explicacion": "2,3,4,5,6-pentahidroxihexanal: el aldehído es el carbono 1 y los carbonos 2 a 6 tienen un –OH cada uno."
    },
    {
      "pregunta": "¿Qué es la reacción $6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} \\rightarrow \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2}$ ?",
      "opciones": [
        "La respiración celular, en la que el carbono se oxida",
        "La fotosíntesis, en la que el carbono se reduce",
        "Una combustión de la glucosa",
        "Una fermentación"
      ],
      "respuesta": "La fotosíntesis, en la que el carbono se reduce",
      "explicacion": "Es la fotosíntesis: el carbono baja de +4 en el CO₂ a un promedio de 0 en la glucosa. La respiración es la reacción inversa."
    },
    {
      "pregunta": "¿Qué polímero se forma con muchas moléculas de eteno?",
      "opciones": [
        "El polietileno",
        "El almidón",
        "La celulosa",
        "Una proteína"
      ],
      "respuesta": "El polietileno",
      "explicacion": "El eteno (etileno) es el monómero del polietileno, por polimerización por adición."
    },
    {
      "pregunta": "Cuando n moléculas de glucosa se unen para formar almidón, ¿qué más se forma?",
      "opciones": [
        "n moléculas de CO₂",
        "Una molécula de oxígeno",
        "Nada más",
        "n − 1 moléculas de agua"
      ],
      "respuesta": "n − 1 moléculas de agua",
      "explicacion": "Cada unión entre dos unidades libera una molécula de agua; para unir n unidades hacen falta n − 1 uniones."
    }
  ]
}$quimia$::jsonb,
  10,
  true);
