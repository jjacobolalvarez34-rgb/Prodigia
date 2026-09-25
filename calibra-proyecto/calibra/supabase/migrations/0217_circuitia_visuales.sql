-- ============================================================
-- Prodigia — Circuitia: visuales animados en Aprender (migración 0217).
--
-- Agrega `visuales` al `contenido` de las 12 lecciones de Aprender (5
-- Técnicas gratis y 7 Clases Pro, mismos slugs): esquemas de circuito con
-- símbolos estándar y corriente animada, resistencia equivalente armándose
-- en serie/paralelo y el triángulo V/I/R de la Ley de Ohm. Los datos de cada
-- visual son solo la topología, los ohmios y el voltaje de la fuente; todo
-- valor eléctrico que se muestra lo calcula el código (resolver.ts).
--
-- Es un merge (`contenido || ...`) que escribe `pasos` y `visuales`:
--  - `pasos`: tres Clases ganan pasos NUEVOS AL FINAL (Fundamentos: serie de
--    3 resistores; Razonamiento cualitativo 1 y 2: voltaje, reducir la
--    resistencia y el caso mixto), sin reordenar ni tocar los existentes; el
--    resto de las lecciones repite su texto (ya en español neutro, igual que
--    lo deja 0221).
--  - `quiz`: NO se toca (se valida por igualdad exacta en
--    /api/aprender/completar).
-- No cambian nombre, descripción, orden ni requiere_pro. Requiere 0167/0171
-- (las filas ya existen). Idempotente: volver a correrla deja el mismo resultado.
--
-- Este archivo se GENERA desde src/lib/circuitia/lecciones/ (fuente única) y
-- lecciones.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- CIRCUITIA_ESCRIBIR_SQL=1 npx vitest run src/lib/circuitia/lecciones
-- ============================================================

update public.techniques
set contenido = contenido || $circuitia${
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
  ]
}$circuitia$::jsonb
where slug = 'circuitia-reconocer-serie-vs-paralelo' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
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
  ]
}$circuitia$::jsonb
where slug = 'circuitia-formula-resistencia-paralelo' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
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
  ]
}$circuitia$::jsonb
where slug = 'circuitia-voltaje-vs-corriente-compartidos' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
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
  ]
}$circuitia$::jsonb
where slug = 'circuitia-leer-mixto-por-el-bloque-paralelo' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
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
  ]
}$circuitia$::jsonb
where slug = 'circuitia-estimar-sube-o-baja-sin-calcular' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "Ley de Ohm: $V = I\\cdot R$. El voltaje sobre un resistor es directamente proporcional a la corriente que lo atraviesa, con la resistencia como factor de proporcionalidad — cuanto más grande R, más voltaje hace falta para la misma corriente.",
    "En un circuito en SERIE, los resistores están uno detrás de otro formando un único camino, sin bifurcaciones — la carga no tiene otro lugar por dónde irse, así que la MISMA corriente atraviesa a todos los resistores de la cadena.",
    "Ejemplo resuelto: un circuito en serie con $R_{1}=10\\,\\Omega$ y $R_{2}=20\\,\\Omega$, alimentado por una fuente de $12\\,\\text{V}$. Primero la resistencia equivalente: $R_{\\text{eq}} = R_{1} + R_{2} = 10 + 20 = 30\\,\\Omega$. Luego la corriente total con la Ley de Ohm: $I = \\frac{V}{R_{\\text{eq}}} = \\frac{12}{30} = 0.4\\,\\text{A}$ — esa es la corriente en TODO el circuito, en $R_{1}$ y en $R_{2}$ por igual.",
    "Con esa corriente, el voltaje de cada resistor sale de aplicar $V=IR$ a cada uno por separado: $V_{R_{1}} = 0.4\\cdot 10 = 4\\,\\text{V}$, $V_{R_{2}} = 0.4\\cdot 20 = 8\\,\\text{V}$.",
    "Verificación (siempre se puede chequear): la suma de los voltajes de cada resistor tiene que dar exactamente el voltaje de la fuente. $4\\,\\text{V} + 8\\,\\text{V} = 12\\,\\text{V}$ ✓ — coincide con la fuente, confirma que el reparto está bien.",
    "Error común a evitar: pensar que la corriente también se \"reparte\" entre los resistores como el voltaje — en serie es al revés: la corriente es la misma en todos, y es el VOLTAJE el que se reparte según el tamaño de cada resistor.",
    "La regla es la misma con más resistores. Ejemplo: $R_{1}=10\\,\\Omega$, $R_{2}=20\\,\\Omega$ y $R_{3}=30\\,\\Omega$ en serie, con una fuente de $12\\,\\text{V}$. La resistencia equivalente es $R_{\\text{eq}} = 10 + 20 + 30 = 60\\,\\Omega$ y la corriente total es $I = \\frac{12}{60} = 0.2\\,\\text{A}$, la misma en los tres resistores. Sus voltajes son $V_{R_{1}} = 0.2\\cdot 10 = 2\\,\\text{V}$, $V_{R_{2}} = 0.2\\cdot 20 = 4\\,\\text{V}$ y $V_{R_{3}} = 0.2\\cdot 30 = 6\\,\\text{V}$, y $2 + 4 + 6 = 12\\,\\text{V}$ ✓: la suma vuelve a dar el voltaje de la fuente."
  ],
  "visuales": [
    {
      "tipo": "circuitia.leyOhm",
      "despuesDePaso": 2,
      "v": 12,
      "r": 30
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 3,
      "titulo": "Voltaje de cada resistor",
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
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "Tres resistores en serie",
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
          },
          {
            "tipo": "resistor",
            "id": "R3",
            "ohmios": 30
          }
        ]
      },
      "vFuente": 12,
      "mostrarValores": "ambas",
      "animarCorriente": true
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-fundamentos-ohm-serie' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "En un circuito en PARALELO, dos o más resistores están conectados a los mismos dos puntos (nodos) — por eso el voltaje sobre cada uno de ellos es EXACTAMENTE el mismo, sin importar cuánta resistencia tenga cada rama.",
    "Es lo contrario de lo que pasa en serie: ahí la corriente era compartida y el voltaje se repartía; en paralelo es el VOLTAJE el que es compartido y la CORRIENTE la que se reparte entre las ramas.",
    "Ejemplo resuelto: $R_{1}=10\\,\\Omega$ y $R_{2}=20\\,\\Omega$ en paralelo, con una fuente de $12\\,\\text{V}$. Cada resistor ve el voltaje completo de la fuente: $12\\,\\text{V}$ sobre $R_{1}$ y $12\\,\\text{V}$ sobre $R_{2}$ también.",
    "Reparto de corriente (divisor de corriente): cada rama saca su propia corriente con Ley de Ohm usando SU resistencia: $I_{R_{1}} = \\frac{V}{R_{1}} = \\frac{12}{10} = 1.2\\,\\text{A}$. $I_{R_{2}} = \\frac{V}{R_{2}} = \\frac{12}{20} = 0.6\\,\\text{A}$.",
    "Verificación con la resistencia equivalente: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{10} + \\frac{1}{20} = 0.15$, entonces $R_{\\text{eq}} = 6.6667\\,\\Omega$, y la corriente total que entrega la fuente es $I_{\\text{total}} = \\frac{V}{R_{\\text{eq}}} = \\frac{12}{6.6667} = 1.8\\,\\text{A}$ — que coincide con $I_{R_{1}} + I_{R_{2}} = 1.2 + 0.6 = 1.8\\,\\text{A}$ ✓.",
    "Insight clave: el resistor con MENOS resistencia se lleva MÁS corriente (es el camino \"más fácil\") — es la relación inversa. Error común: pensar que más resistencia atrae más corriente, es exactamente al revés."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 3,
      "titulo": "Corriente por cada rama",
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
      "mostrarValores": "corriente",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 4,
      "modo": "paralelo",
      "ohmios": [
        10,
        20
      ]
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-paralelo-voltaje-corriente' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "En SERIE, la resistencia equivalente es la suma directa: $R_{\\text{eq}} = R_{1} + R_{2} + \\cdots$ — agregar resistores en serie SIEMPRE aumenta (o deja igual) la resistencia total.",
    "En PARALELO, se suman los recíprocos y se invierte al final: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_{1}} + \\frac{1}{R_{2}} + \\cdots$ — agregar resistores en paralelo SIEMPRE reduce (o deja igual) la resistencia total, porque se abren más caminos para la corriente.",
    "Ejemplo comparado: dos resistores de $8\\,\\Omega$ cada uno. En serie: $R_{\\text{eq}} = 8 + 8 = 16\\,\\Omega$.",
    "Esos mismos dos resistores de $8\\,\\Omega$, ahora en paralelo: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{8} + \\frac{1}{8} = \\frac{2}{8} = \\frac{1}{4}$, entonces $R_{\\text{eq}} = 4\\,\\Omega$ — el caso especial de dos resistores iguales en paralelo: la mitad de uno solo, nunca el doble.",
    "Con una fuente de $8\\,\\text{V}$ sobre cada configuración: en serie, $I = \\frac{8}{16} = 0.5\\,\\text{A}$ (la misma en ambos, y cada uno se queda con $4\\,\\text{V}$ ya que son iguales). En paralelo, $I_{\\text{total}} = \\frac{8}{4} = 2\\,\\text{A}$, repartida en partes iguales: $1\\,\\text{A}$ por cada resistor (porque tienen la misma resistencia y ven el mismo voltaje).",
    "Chequeo de sensatez rápido: el resultado en paralelo $(4\\,\\Omega)$ SIEMPRE tiene que ser menor o igual que el resistor más chico de la rama $(8\\,\\Omega)$ — si te da mayor, invertiste algo de más o de menos en la fórmula de recíprocos."
  ],
  "visuales": [
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 2,
      "modo": "serie",
      "ohmios": [
        8,
        8
      ]
    },
    {
      "tipo": "circuitia.resistenciaEquivalente",
      "despuesDePaso": 3,
      "modo": "paralelo",
      "ohmios": [
        8,
        8
      ]
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-resistencia-equivalente-comparacion' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "Un circuito mixto combina una rama en serie con un bloque en paralelo incrustado adentro — se resuelve de ADENTRO hacia AFUERA, nunca sumando todo de una sola vez.",
    "Cómo encontrar el bloque en paralelo de un vistazo: busca el grupo de resistores que comparten los mismos dos nodos — suele estar dibujado como el tramo más anidado o más chico del circuito, no en la línea principal.",
    "Ejemplo resuelto: un circuito en serie con $R_{s1}=10\\,\\Omega$ y un bloque en paralelo formado por $R_{p1}=20\\,\\Omega$ y $R_{p2}=20\\,\\Omega$.",
    "Paso 1 — colapsar el bloque en paralelo SOLO (en aislamiento, antes de tocar $R_{s1}$): $\\frac{1}{R_{\\text{bloque}}} = \\frac{1}{20} + \\frac{1}{20} = \\frac{1}{10}$, entonces $R_{\\text{bloque}} = 10\\,\\Omega$.",
    "Paso 2 — con el bloque ya colapsado a un único valor, el circuito completo queda como una serie simple de dos resistores: $R_{\\text{eq total}} = R_{s1} + R_{\\text{bloque}} = 10 + 10 = 20\\,\\Omega$.",
    "Error común a evitar: sumar $R_{s1} + R_{p1} + R_{p2}$ todos juntos como si los tres estuvieran en serie — $R_{p1}$ y $R_{p2}$ tienen que colapsarse a UN solo valor con la fórmula de recíprocos ANTES de poder sumarlos con el resto de la serie."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 2,
      "titulo": "El circuito completo",
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
      "despuesDePaso": 3,
      "modo": "paralelo",
      "ohmios": [
        20,
        20
      ]
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-mixtos-identificar-bloque' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "El algoritmo completo tiene dos pasadas: 1) de ABAJO hacia ARRIBA, se calcula la resistencia equivalente total y con eso la corriente total que entrega la fuente; 2) de ARRIBA hacia ABAJO, se reparte esa corriente/voltaje desde la fuente hasta cada resistor, respetando que en serie la corriente es compartida y en paralelo el voltaje es compartido.",
    "Ejemplo resuelto: $R_{s1}=5\\,\\Omega$ en serie con un bloque en paralelo ($R_{p1}=20\\,\\Omega$, $R_{p2}=20\\,\\Omega$) y luego $R_{s2}=5\\,\\Omega$, con una fuente de $20\\,\\text{V}$.",
    "Pasada 1 (abajo hacia arriba): primero el bloque, $\\frac{1}{R_{\\text{bloque}}} = \\frac{1}{20} + \\frac{1}{20} = \\frac{1}{10} \\to R_{\\text{bloque}} = 10\\,\\Omega$. Después la serie completa: $R_{\\text{eq total}} = R_{s1} + R_{\\text{bloque}} + R_{s2} = 5 + 10 + 5 = 20\\,\\Omega$. Y con eso, la corriente total: $I_{\\text{total}} = \\frac{V}{R_{\\text{eq}}} = \\frac{20}{20} = 1\\,\\text{A}$ — esta corriente atraviesa $R_{s1}$, el bloque (como conjunto) y $R_{s2}$, porque los tres están en serie entre sí.",
    "Pasada 2 (arriba hacia abajo, primer nivel): cada tramo en serie se queda con $V=I_{\\text{total}}\\times R_{\\text{tramo}}$. $V_{R_{s1}} = 1\\times 5 = 5\\,\\text{V}$. $V_{\\text{bloque}} = 1\\times 10 = 10\\,\\text{V}$. $V_{R_{s2}} = 1\\times 5 = 5\\,\\text{V}$. Verificación: $5+10+5 = 20\\,\\text{V}$, exactamente el voltaje de la fuente ✓.",
    "Pasada 2 (un nivel más adentro, dentro del bloque): ahora $R_{p1}$ y $R_{p2}$ comparten el voltaje del bloque que ya calculaste $(10\\,\\text{V})$ — cada uno saca su propia corriente con Ley de Ohm: $I_{R_{p1}} = \\frac{10}{20} = 0.5\\,\\text{A}$, $I_{R_{p2}} = \\frac{10}{20} = 0.5\\,\\text{A}$.",
    "Verificación final: toda la corriente que entra al bloque tiene que salir repartida entre sus ramas — $I_{R_{p1}} + I_{R_{p2}} = 0.5 + 0.5 = 1\\,\\text{A}$, que coincide exactamente con $I_{\\text{total}}$. Si esa suma no coincidiera, algo se calculó mal en algún paso anterior."
  ],
  "visuales": [
    {
      "tipo": "circuitia.leyOhm",
      "despuesDePaso": 2,
      "v": 20,
      "r": 20
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 4,
      "titulo": "Resultado completo",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "Rs1",
            "ohmios": 5
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
          },
          {
            "tipo": "resistor",
            "id": "Rs2",
            "ohmios": 5
          }
        ]
      },
      "vFuente": 20,
      "mostrarValores": "ambas",
      "animarCorriente": true
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-mixtos-resolver-paso-a-paso' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "Regla general: en un camino en serie único, aumentar la resistencia en cualquier punto SIEMPRE reduce (o deja igual) la corriente total; nunca la aumenta. Y al revés: reducir una resistencia siempre aumenta (o deja igual) la corriente.",
    "Circuito base: serie con $R_{1}=10\\,\\Omega$ y $R_{2}=10\\,\\Omega$, fuente de $20\\,\\text{V}$. $R_{\\text{eq}} = 20\\,\\Omega$, corriente base $I = \\frac{20}{20} = 1\\,\\text{A}$ — la misma en $R_{1}$ y en $R_{2}$, por estar en serie.",
    "Perturbación A — $R_{1}$ se duplica a $20\\,\\Omega$: nuevo $R_{\\text{eq}} = 20+10 = 30\\,\\Omega$, nueva corriente $I = \\frac{20}{30} \\approx 0.667\\,\\text{A}$. Resultado: DISMINUYE respecto de la base (de $1\\,\\text{A}$ a $\\approx 0.667\\,\\text{A}$), porque el camino ahora tiene más resistencia total.",
    "Perturbación B — en cambio, $R_{1}$ se reduce a la mitad, a $5\\,\\Omega$: nuevo $R_{\\text{eq}} = 5+10 = 15\\,\\Omega$, nueva corriente $I = \\frac{20}{15} \\approx 1.333\\,\\text{A}$. Resultado: AUMENTA respecto de la base (de $1\\,\\text{A}$ a $\\approx 1.333\\,\\text{A}$), porque el camino ahora tiene menos resistencia total.",
    "Por qué funciona sin resolver todo: en un camino en serie único, la corriente depende únicamente de la resistencia TOTAL de ese camino $(I=\\frac{V}{R_{\\text{eq}}})$ — si esa suma sube, la corriente baja (o queda igual); si esa suma baja, la corriente sube (o queda igual). Nunca al revés.",
    "Aplicación rápida: para estimar la DIRECCIÓN del cambio alcanza con preguntarse \"¿la resistencia total del camino subió o bajó?\" — no hace falta recalcular el circuito completo para eso, aunque para el VALOR exacto sí hay que resolverlo paso a paso.",
    "El voltaje también se puede anticipar. En el circuito base cada resistor tiene $10\\,\\text{V}$ (es $1\\,\\text{A}\\cdot 10\\,\\Omega$). Si $R_{1}$ se duplica a $20\\,\\Omega$, la corriente baja a $\\approx 0.67\\,\\text{A}$: $R_{1}$ pasa a $\\approx 13.33\\,\\text{V}$ y su vecino $R_{2}$ baja a $\\approx 6.67\\,\\text{V}$. Si $R_{1}$ se reduce a $5\\,\\Omega$, la corriente sube a $\\approx 1.33\\,\\text{A}$: $R_{1}$ pasa a $\\approx 6.67\\,\\text{V}$ y $R_{2}$ sube a $\\approx 13.33\\,\\text{V}$. El voltaje total sigue siendo $20\\,\\text{V}$: lo que gana un resistor en serie lo pierde el otro."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "Circuito base",
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
      "despuesDePaso": 2,
      "titulo": "R1 se duplica a 20Ω: la corriente baja",
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
      "despuesDePaso": 3,
      "titulo": "R1 se reduce a 5Ω: la corriente sube",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 5
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
      "despuesDePaso": 6,
      "titulo": "Base: 1 A y 10 V en cada resistor",
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
      "resaltarId": "R2",
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "R1 se duplica a 20Ω: R2 recibe menos corriente y menos voltaje",
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
      "resaltarId": "R2",
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "R1 se reduce a 5Ω: R2 recibe más corriente y más voltaje",
      "topologia": {
        "tipo": "serie",
        "hijos": [
          {
            "tipo": "resistor",
            "id": "R1",
            "ohmios": 5
          },
          {
            "tipo": "resistor",
            "id": "R2",
            "ohmios": 10
          }
        ]
      },
      "vFuente": 20,
      "resaltarId": "R2",
      "mostrarValores": "ambas",
      "animarCorriente": true
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-cualitativo-sube-o-baja' and problem_type = 'circuitia';

update public.techniques
set contenido = contenido || $circuitia${
  "pasos": [
    "En un bloque en paralelo conectado DIRECTO a la fuente, cada rama ve siempre el mismo voltaje (el de la fuente), sin importar qué pase en las ramas hermanas — y como la corriente de cada rama es $I=\\frac{V}{R_{\\text{propia}}}$, esa corriente TAMPOCO depende de las hermanas.",
    "Caso concreto, ya verificado en el kernel de resolución (resolver.test.ts): circuito en paralelo con $R_{1}=4\\,\\Omega$, $R_{2}=6\\,\\Omega$ y $R_{3}=12\\,\\Omega$, fuente de $12\\,\\text{V}$. Corrientes base: $I_{R_{1}} = \\frac{12}{4} = 3\\,\\text{A}$, $I_{R_{2}} = \\frac{12}{6} = 2\\,\\text{A}$, $I_{R_{3}} = \\frac{12}{12} = 1\\,\\text{A}$.",
    "Perturbación: $R_{2}$ se duplica a $12\\,\\Omega$. Nueva $I_{R_{2}} = \\frac{12}{12} = 1\\,\\text{A}$ — esa SÍ cambió (de $2\\,\\text{A}$ a $1\\,\\text{A}$), tiene sentido porque cambió SU PROPIA resistencia.",
    "Pero $I_{R_{3}}$ sigue siendo $\\frac{12}{12} = 1\\,\\text{A}$, exactamente igual que antes — NO CAMBIA, aunque $R_{2}$ (su \"hermana\" en el mismo bloque) haya cambiado. Por la misma razón, $I_{R_{1}}$ tampoco cambia (sigue en $3\\,\\text{A}$).",
    "Por qué no es un error de cálculo: el voltaje que ve $R_{3}$ es siempre el de la fuente ($12\\,\\text{V}$, fijo), porque $R_{3}$ está conectado directo a los mismos dos nodos que la fuente — la resistencia de $R_{2}$ no entra en ninguna cuenta de $I_{R_{3}}=\\frac{V}{R_{3}}$. Cambiar $R_{2}$ sí cambia cuánta corriente TOTAL entrega la fuente (de $6\\,\\text{A}$ a $5\\,\\text{A}$), pero esa diferencia la absorbe SOLO la rama que cambió, no las hermanas.",
    "Error común a evitar: asumir que \"cambiar algo en el circuito siempre afecta a todo el circuito\". En un bloque en paralelo puro conectado directo a la fuente, un cambio en una rama queda aislado en esa rama; solo se propagaría a las hermanas si hubiera algo en serie compartido entre el bloque y la fuente (como en las lecciones de circuitos mixtos).",
    "Lo mismo vale para el voltaje y para reducir una resistencia. Con $R_{1}=4\\,\\Omega$, $R_{2}=6\\,\\Omega$, $R_{3}=12\\,\\Omega$ y $12\\,\\text{V}$, cada rama tiene $12\\,\\text{V}$ y sus corrientes son $3\\,\\text{A}$, $2\\,\\text{A}$ y $1\\,\\text{A}$. Si $R_{2}$ se duplica a $12\\,\\Omega$, su corriente baja a $1\\,\\text{A}$; si se reduce a la mitad, a $3\\,\\Omega$, sube a $4\\,\\text{A}$. En los dos casos $R_{3}$ conserva $12\\,\\text{V}$ y $1\\,\\text{A}$, y $R_{1}$ conserva $12\\,\\text{V}$ y $3\\,\\text{A}$: cambió una rama hermana, no su voltaje ni su resistencia.",
    "En un circuito mixto la respuesta cambia, porque las ramas del bloque comparten un resistor en serie con la fuente. Con $R_{s1}=10\\,\\Omega$ en serie con el bloque $R_{p1}=20\\,\\Omega$ y $R_{p2}=20\\,\\Omega$, y una fuente de $12\\,\\text{V}$, $R_{s1}$ tiene $0.6\\,\\text{A}$ y $6\\,\\text{V}$, y cada rama del bloque tiene $0.3\\,\\text{A}$ y $6\\,\\text{V}$. Si $R_{p2}$ se duplica a $40\\,\\Omega$, el bloque ofrece más resistencia, la corriente total baja a $\\approx 0.51\\,\\text{A}$, $R_{s1}$ se queda con $\\approx 5.14\\,\\text{V}$ y al bloque le llegan $\\approx 6.86\\,\\text{V}$: $R_{p1}$ pasa a $\\approx 0.34\\,\\text{A}$, es decir AUMENTA, y $R_{p2}$ a $\\approx 0.17\\,\\text{A}$. Si $R_{p2}$ se reduce a $10\\,\\Omega$, el bloque ofrece menos resistencia, la corriente total sube a $0.72\\,\\text{A}$, $R_{s1}$ toma $7.2\\,\\text{V}$ y al bloque le quedan $4.8\\,\\text{V}$: $R_{p1}$ baja a $0.24\\,\\text{A}$, es decir DISMINUYE, y $R_{p2}$ sube a $0.48\\,\\text{A}$."
  ],
  "visuales": [
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 1,
      "titulo": "Antes: R2 = 6Ω",
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
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 3,
      "titulo": "Después: R2 se duplica a 12Ω — R3 no cambia",
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
            "ohmios": 12
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
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "Paralelo base: 12 V en cada rama",
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
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "R2 se duplica a 12Ω: R3 no cambia",
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
            "ohmios": 12
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
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 6,
      "titulo": "R2 se reduce a 3Ω: R3 no cambia",
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
            "ohmios": 3
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
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 7,
      "titulo": "Mixto base: 6 V y 0.3 A en Rp1",
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
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 7,
      "titulo": "Rp2 se duplica a 40Ω: Rp1 aumenta",
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
                "ohmios": 40
              }
            ]
          }
        ]
      },
      "vFuente": 12,
      "resaltarId": "Rp1",
      "mostrarValores": "ambas",
      "animarCorriente": true
    },
    {
      "tipo": "circuitia.circuito",
      "despuesDePaso": 7,
      "titulo": "Rp2 se reduce a 10Ω: Rp1 disminuye",
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
                "ohmios": 10
              }
            ]
          }
        ]
      },
      "vFuente": 12,
      "resaltarId": "Rp1",
      "mostrarValores": "ambas",
      "animarCorriente": true
    }
  ]
}$circuitia$::jsonb
where slug = 'circuitia-pro-cualitativo-cuando-no-cambia' and problem_type = 'circuitia';
