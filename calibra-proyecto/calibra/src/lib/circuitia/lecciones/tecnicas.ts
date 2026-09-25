import type { LeccionCircuitia } from "./tipos";

// Las 5 Técnicas (gratis) de Circuitia, en el formato visual. FUENTE:
// pasos y quiz son EXACTAMENTE los sembrados por supabase/migrations/
// 0167_mundo_circuitia.sql (pasos) + 0179_circuitia_tecnicas_quiz.sql (quiz), con la notación LaTeX de
// 0195_latex_clases_calculia_circuitia.sql (la última migración que tocó
// este contenido) — lecciones.test.ts los compara byte a byte contra las
// migraciones. Los `visuales` son lo único nuevo de este retrofit: cada
// topología/valor sale de un ejemplo YA descrito en el paso correspondiente
// (o, si el paso no da números, de un ejemplo razonable con el mismo banco
// de valores que usa el generador de práctica), y visualesDatos.test.ts
// verifica cada resultado contra un cálculo independiente.

export const TECNICAS: LeccionCircuitia[] = [
{
  "slug": "circuitia-reconocer-serie-vs-paralelo",
  "orden": 1,
  "requierePro": false,
  "pasos": [
    "¿Los resistores forman un único camino, uno detrás del otro, sin bifurcaciones? Es serie — la corriente es la misma en todos.",
    "¿Cada resistor tiene sus dos extremos conectados a los mismos dos puntos (nodos)? Es paralelo — el voltaje es el mismo en todos.",
    "¿Hay una rama en serie que en algún tramo se abre en 2 o más caminos que después se vuelven a juntar? Es un circuito mixto — combina las dos reglas por partes.",
    "Un resistor solo, sin compañía, técnicamente es tanto serie como paralelo consigo mismo — no hace falta ninguna fórmula especial."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 0,
      "titulo": "Serie",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 10
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 20
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "ninguna",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "Paralelo",
      "topologia": {
        "tipo": "paralelo",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 10
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 20
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "ninguna",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 2,
      "titulo": "Mixto",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "Rs1",
            "ohmios": 10
          },
          {
            "tipo": "paralelo",
            "hijos": [
              {
                "tipo": "resistor",
                "id": "Rp1",
                "ohmios": 20
              },
              {
                "tipo": "resistor",
                "id": "Rp2",
                "ohmios": 20
              }
            ]
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "ninguna",
      "animarCorriente": true
    }
  ],
  "quiz": [
    {
      "pregunta": "Los resistores forman un único camino, uno detrás del otro, sin bifurcaciones. ¿Qué tipo de conexión es?",
      "opciones": [
        "Serie",
        "Paralelo",
        "Mixto",
        "Ninguna de las anteriores"
      ],
      "respuesta": "Serie",
      "explicacion": "Es la definición de serie: un solo camino, la corriente es la misma en todos los resistores."
    },
    {
      "pregunta": "Cada resistor tiene sus dos extremos conectados a los mismos dos puntos (nodos). ¿Qué tipo de conexión es?",
      "opciones": [
        "Paralelo",
        "Serie",
        "Mixto",
        "No se puede saber sin los valores de resistencia"
      ],
      "respuesta": "Paralelo",
      "explicacion": "Es la definición de paralelo: mismos dos nodos compartidos, el voltaje es el mismo en todos los resistores."
    },
    {
      "pregunta": "Una rama en serie que en algún tramo se abre en 2 o más caminos que después se vuelven a juntar, ¿qué tipo de circuito es?",
      "opciones": [
        "Mixto",
        "Serie puro",
        "Paralelo puro",
        "No es un circuito válido"
      ],
      "respuesta": "Mixto",
      "explicacion": "Combina las dos reglas por partes — el bloque que se abre y se vuelve a juntar es la parte en paralelo, el resto sigue las reglas de serie."
    }
  ]
},
{
  "slug": "circuitia-formula-resistencia-paralelo",
  "orden": 2,
  "requierePro": false,
  "pasos": [
    "En serie, las resistencias se suman directo: $R_{\\text{eq}} = R_{1} + R_{2} + R_{3}$ — mientras más resistores, más resistencia total.",
    "En paralelo, se suman los RECÍPROCOS: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\frac{1}{R_{3}}$, y al final inviertes el resultado — mientras más resistores, MENOS resistencia total.",
    "Caso especial fácil de recordar: dos resistores iguales R en paralelo dan $\\frac{R}{2}$ — la mitad, no el doble.",
    "Chequeo rápido de sensatez: si tu resultado de un cálculo en paralelo te dio MAYOR que el resistor más chico de la rama, algo salió mal — invertiste algo de más o de menos."
  ],
  "visuales": [
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 0,
      "modo": "serie",
      "ohmios": [
        8,
        8
      ]
    },
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 1,
      "modo": "paralelo",
      "ohmios": [
        8,
        8
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cómo se calcula la resistencia equivalente de resistores en SERIE?",
      "opciones": [
        "Se suman directo: $R_{\\text{eq}} = R_{1} + R_{2} + R_{3}$",
        "Se suman los recíprocos y se invierte",
        "Se promedian",
        "Se multiplican entre sí"
      ],
      "respuesta": "Se suman directo: $R_{\\text{eq}} = R_{1} + R_{2} + R_{3}$",
      "explicacion": "En serie, mientras más resistores agregues, más resistencia total — la suma es directa, sin recíprocos."
    },
    {
      "pregunta": "¿Cómo se calcula la resistencia equivalente de resistores en PARALELO?",
      "opciones": [
        "$\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\frac{1}{R_{3}}$, y al final se invierte el resultado",
        "Se suman directo, igual que en serie",
        "Se resta la más chica de la más grande",
        "Se toma solo la resistencia más chica del grupo"
      ],
      "respuesta": "$\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\frac{1}{R_{3}}$, y al final se invierte el resultado",
      "explicacion": "En paralelo se suman los RECÍPROCOS — mientras más resistores agregues, MENOS resistencia total, al revés que en serie."
    },
    {
      "pregunta": "Dos resistores iguales de valor R, conectados en paralelo, dan una resistencia equivalente de...",
      "opciones": [
        "$\\frac{R}{2}$",
        "2R",
        "R",
        "$R^{2}$"
      ],
      "respuesta": "$\\frac{R}{2}$",
      "explicacion": "Es el caso especial fácil de recordar: la mitad, no el doble — sirve como chequeo rápido de sensatez de cualquier cálculo en paralelo."
    }
  ]
},
{
  "slug": "circuitia-voltaje-vs-corriente-compartidos",
  "orden": 3,
  "requierePro": false,
  "pasos": [
    "En SERIE: la corriente es la misma para todos (no tiene otro camino por donde irse) — el voltaje SE REPARTE entre los resistores según su tamaño.",
    "En PARALELO: el voltaje es el mismo para todos (están conectados a los mismos 2 puntos) — la corriente SE REPARTE entre las ramas según su resistencia.",
    "Un resistor con más resistencia, en serie, se queda con MÁS voltaje ($V=IR$, misma I); en paralelo, se queda con MENOS corriente ($I=\\frac{V}{R}$, mismo V) — es la relación inversa en cada caso.",
    "Ley de Ohm $(V=IR)$ sirve siempre para UN resistor puntual — la pregunta de \"qué se comparte\" es sobre el GRUPO, no sobre un resistor solo."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 0,
      "titulo": "Serie: la corriente es la misma",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 10
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 20
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "corriente",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "Paralelo: el voltaje es el mismo",
      "topologia": {
        "tipo": "paralelo",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 10
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 20
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "voltaje",
      "animarCorriente": true
    }
  ],
  "quiz": [
    {
      "pregunta": "En un grupo de resistores conectados en SERIE, ¿qué es igual en todos ellos?",
      "opciones": [
        "La corriente",
        "El voltaje",
        "La resistencia",
        "La potencia"
      ],
      "respuesta": "La corriente",
      "explicacion": "En serie la corriente no tiene otro camino por donde irse — es la misma para todos; el voltaje se reparte según el tamaño de cada resistor."
    },
    {
      "pregunta": "En un grupo de resistores conectados en PARALELO, ¿qué es igual en todos ellos?",
      "opciones": [
        "El voltaje",
        "La corriente",
        "La resistencia",
        "La potencia"
      ],
      "respuesta": "El voltaje",
      "explicacion": "En paralelo todos están conectados a los mismos 2 puntos, así que el voltaje es el mismo — la corriente se reparte según la resistencia de cada rama."
    },
    {
      "pregunta": "En SERIE, un resistor con más resistencia que sus vecinos (misma corriente para todos) se queda con...",
      "opciones": [
        "Más voltaje",
        "Menos voltaje",
        "La misma corriente que los demás, pero cero voltaje",
        "Más corriente que los demás"
      ],
      "respuesta": "Más voltaje",
      "explicacion": "Por $V=IR$ con la misma I para todos, a mayor R le corresponde mayor V — es la relación inversa de lo que pasa en paralelo (ahí, a mayor R le corresponde MENOS corriente)."
    }
  ]
},
{
  "slug": "circuitia-leer-mixto-por-el-bloque-paralelo",
  "orden": 4,
  "requierePro": false,
  "pasos": [
    "Busca el grupo de resistores que comparten los mismos 2 nodos (el bloque en paralelo) — suele ser el tramo más chico o más anidado del dibujo.",
    "Calcula la resistencia equivalente de ESE bloque solo, con la fórmula de recíprocos — ahora tienes un resistor \"virtual\" único en su lugar.",
    "Con el bloque ya colapsado a un solo valor, el circuito completo queda como una serie simple — suma ese valor con los demás resistores en serie.",
    "Para hallar corriente/voltaje de un resistor específico DENTRO del bloque en paralelo, primero necesitas el voltaje que le llega a todo el bloque (paso anterior), y recién ahí repartirlo."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "El bloque en paralelo",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "Rs1",
            "ohmios": 10
          },
          {
            "tipo": "paralelo",
            "hijos": [
              {
                "tipo": "resistor",
                "id": "Rp1",
                "ohmios": 20
              },
              {
                "tipo": "resistor",
                "id": "Rp2",
                "ohmios": 20
              }
            ]
          }
        ]
      },
      "vFuente": 12,
      "resaltarId": "Rp1",
      "mostrarValores": "ninguna",
      "animarCorriente": false
    },
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 2,
      "modo": "paralelo",
      "ohmios": [
        20,
        20
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Al leer un circuito mixto, ¿qué se busca y se resuelve PRIMERO?",
      "opciones": [
        "El bloque de resistores en paralelo (colapsarlo a un solo valor equivalente)",
        "El resistor con el valor más grande",
        "La fuente de voltaje",
        "El resistor más cercano a la fuente, sin importar cómo esté conectado"
      ],
      "respuesta": "El bloque de resistores en paralelo (colapsarlo a un solo valor equivalente)",
      "explicacion": "Un circuito mixto se resuelve de adentro hacia afuera — el primer paso siempre es encontrar el grupo que comparte los mismos 2 nodos y calcular su resistencia equivalente."
    },
    {
      "pregunta": "Una vez que el bloque en paralelo ya está colapsado a un solo resistor \"virtual\", ¿cómo queda el circuito completo?",
      "opciones": [
        "Como una serie simple, sumando ese valor con los demás resistores en serie",
        "Como un nuevo bloque en paralelo",
        "Ya no se puede resolver más",
        "Igual que antes, sin cambios"
      ],
      "respuesta": "Como una serie simple, sumando ese valor con los demás resistores en serie",
      "explicacion": "Es el segundo paso de la técnica: con el bloque ya reducido a un número, el resto del circuito se trata con las reglas simples de serie."
    },
    {
      "pregunta": "Para hallar el voltaje de un resistor específico DENTRO del bloque en paralelo, ¿qué necesitas calcular primero?",
      "opciones": [
        "El voltaje que le llega a todo el bloque en paralelo",
        "La corriente de la fuente completa",
        "La resistencia de un resistor cualquiera fuera del bloque",
        "No hace falta ningún cálculo previo"
      ],
      "respuesta": "El voltaje que le llega a todo el bloque en paralelo",
      "explicacion": "Recién con el voltaje del bloque completo (que se reparte igual a todas sus ramas, por ser paralelo) se puede calcular la corriente de un resistor específico adentro."
    }
  ]
},
{
  "slug": "circuitia-estimar-sube-o-baja-sin-calcular",
  "orden": 5,
  "requierePro": false,
  "pasos": [
    "Si aumenta la resistencia de un tramo, la resistencia TOTAL del circuito aumenta (o se queda igual, nunca baja) — así que la corriente que entrega la fuente nunca sube.",
    "En una rama en PARALELO, cambiar la resistencia de UNA rama no afecta a las demás ramas hermanas — cada una sigue viendo el mismo voltaje de siempre, así que su propia corriente no cambia.",
    "En SERIE, cualquier cambio en un resistor SÍ afecta a todos los demás — la misma corriente (ahora distinta) atraviesa a todos por igual.",
    "Cuando la pregunta es sobre un resistor hermano en un bloque en paralelo conectado directo a la fuente, la respuesta más común y correcta es \"no cambia\" — no asumas que todo cambio en algún lado afecta a todo el circuito."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 0,
      "titulo": "Antes: R1 = 10Ω",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 10
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 10
          }
        ]
      },
      "vFuente": 20,
      "resaltarId": "R1",
      "mostrarValores": "corriente",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 0,
      "titulo": "Después: R1 se duplica a 20Ω",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 20
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 10
          }
        ]
      },
      "vFuente": 20,
      "resaltarId": "R1",
      "mostrarValores": "corriente",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "La rama hermana R3 no cambia",
      "topologia": {
        "tipo": "paralelo",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 4
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 6
          },
          {
            "tipo": "resistor",
            "id": "R3",
            "ohmios": 12
          }
        ]
      },
      "vFuente": 12,
      "resaltarId": "R3",
      "mostrarValores": "corriente",
      "animarCorriente": true
    }
  ],
  "quiz": [
    {
      "pregunta": "Si aumenta la resistencia de un tramo del circuito, ¿qué le pasa a la corriente TOTAL que entrega la fuente?",
      "opciones": [
        "Nunca sube (baja o queda igual)",
        "Siempre sube",
        "Se duplica siempre",
        "No depende de la resistencia total"
      ],
      "respuesta": "Nunca sube (baja o queda igual)",
      "explicacion": "Más resistencia total en el camino siempre frena más (o igual) la corriente que la fuente puede entregar — nunca la aumenta."
    },
    {
      "pregunta": "En un bloque en PARALELO conectado directo a la fuente, si cambia la resistencia de UNA rama, ¿qué le pasa a la corriente de una rama HERMANA?",
      "opciones": [
        "No cambia",
        "Siempre aumenta",
        "Siempre disminuye",
        "Se vuelve cero"
      ],
      "respuesta": "No cambia",
      "explicacion": "Cada rama en paralelo sigue viendo el mismo voltaje de siempre (compartido), así que su propia corriente ($I=\\frac{V}{R}$ con su propia R, sin cambios) no se ve afectada por lo que pase en una rama hermana."
    },
    {
      "pregunta": "En SERIE, si cambia la resistencia de un resistor, ¿qué le pasa a los demás resistores de esa misma rama?",
      "opciones": [
        "A todos los afecta — la misma corriente (ahora distinta) atraviesa a todos por igual",
        "No les pasa nada, cada uno es independiente",
        "Solo afecta al resistor inmediatamente siguiente",
        "Solo afecta a la fuente, nunca a otros resistores"
      ],
      "respuesta": "A todos los afecta — la misma corriente (ahora distinta) atraviesa a todos por igual",
      "explicacion": "En serie todos comparten la misma corriente — si esa corriente cambia (porque cambió la resistencia total), afecta a todos los resistores de la rama por igual, a diferencia de una rama en paralelo."
    }
  ]
}
];
