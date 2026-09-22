-- ============================================================
-- Prodigia — Naipia (mundo 12): lecciones en formato VISUAL.
--
-- Reescribe el `contenido` de las 13 lecciones de Aprender (5 Técnicas y
-- 8 Clases, mismos slugs, orden y requiere_pro que 0192): `pasos` pasa a ser
-- una introducción corta y la explicación real son los `visuales`
-- animados (tabla de valores, conteo corriente, pares que se cancelan,
-- mazo completo, sistemas comparados, conteo verdadero y cuadros). El
-- `quiz` es IDÉNTICO al de 0192 (el contrato de /api/aprender/completar
-- valida por igualdad exacta).
--
-- Este archivo se GENERA desde src/lib/naipia/lecciones/ (fuente única;
-- todo número sale de TABLA_SISTEMAS) y lecciones.test.ts comprueba que
-- coincida. No editar a mano. Regenerar: NAIPIA_ESCRIBIR_SQL=1 npx vitest
-- run src/lib/naipia/lecciones. Requiere 0192 (las filas ya existen).
-- ============================================================

update public.techniques set contenido =
$naipia${
  "pasos": [
    "En Hi-Lo, una carta baja vale $+1$ y una alta vale $-1$. Si ves una de cada una, se cancelan: juntas valen $0$.",
    "Mira la secuencia de abajo: primero se apartan las neutras y luego se buscan los pares. Solo cuenta lo que queda sin pareja: aquí el conteo es $0$.",
    "Los pares no tienen que estar juntos, pero no uses la misma carta en dos pares."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "hilo",
      "despuesDePaso": 0,
      "titulo": "Bajas, neutras y altas en Hi-Lo"
    },
    {
      "tipo": "naipia.cancelacion",
      "sistema": "hilo",
      "cartas": [
        "K♠",
        "3♥",
        "9♦",
        "5♣",
        "A♠",
        "2♦",
        "7♥",
        "Q♣"
      ],
      "despuesDePaso": 1,
      "titulo": "Los pares se tocan y desaparecen"
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿cuánto suman juntas un 4 y una reina?",
      "opciones": [
        "0",
        "+2",
        "-2",
        "+1"
      ],
      "respuesta": "0",
      "explicacion": "El 4 vale +1 y la reina vale -1: se cancelan y suman 0."
    },
    {
      "pregunta": "Con Hi-Lo, ¿cuál es el conteo de 5♠ K♦ 2♥ J♣ 8♠?",
      "opciones": [
        "1",
        "0",
        "-1",
        "2"
      ],
      "respuesta": "0",
      "explicacion": "5 y K se cancelan, 2 y J se cancelan, y el 8 vale 0: el conteo es 0."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-tecnica-pares' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Sumar carta por carta obliga a actualizar el conteo muchas veces, y cada actualización es una oportunidad de error. Con bloques resumes tres cartas de un vistazo y actualizas una sola vez.",
    "Mira un bloque, calcula su valor completo y recién ahí súmalo al conteo corriente. Aquí los bloques valen $+3$, $-2$ y $+1$, y el conteo final es $+2$.",
    "Con práctica el bloque crece solo. Si empiezas a fallar, vuelve a bloques más chicos: la precisión importa más que la velocidad al principio."
  ],
  "visuales": [
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "4♠",
        "6♥",
        "2♦",
        "K♣",
        "8♠",
        "A♥",
        "3♣",
        "10♦",
        "5♠"
      ],
      "bloque": 3,
      "velocidad": 2200,
      "despuesDePaso": 1,
      "titulo": "Un bloque de 3 cartas, una sola actualización"
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿cuánto vale el bloque 3♠ 9♥ Q♦?",
      "opciones": [
        "1",
        "-1",
        "0",
        "2"
      ],
      "respuesta": "0",
      "explicacion": "El 3 vale +1, el 9 vale 0 y la reina vale -1: 1 + 0 - 1 = 0."
    },
    {
      "pregunta": "Con Hi-Lo, si el conteo corriente era +3 y llega el bloque 2♠ 4♥ K♦, ¿cuál es el nuevo conteo?",
      "opciones": [
        "3",
        "5",
        "1",
        "4"
      ],
      "respuesta": "4",
      "explicacion": "El bloque vale +1 +1 -1 = +1, así que 3 + 1 = 4."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-tecnica-bloques' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "La mayor causa de errores no es la aritmética sino el ritmo irregular: acelerar en las cartas fáciles y trabarse en las difíciles hace perder el hilo.",
    "Elige un ritmo que puedas sostener y mantenlo carta tras carta. Lleva solo el conteo corriente en la cabeza, sin repetir la lista de cartas.",
    "Si pierdes el hilo, no adivines: vuelve a un conteo que conozcas y sigue con el mismo ritmo."
  ],
  "visuales": [
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "5♠",
        "K♥",
        "2♦",
        "8♣",
        "Q♠",
        "4♥",
        "9♦",
        "6♣",
        "A♠",
        "3♥",
        "10♦",
        "7♠"
      ],
      "velocidad": 1100,
      "despuesDePaso": 1,
      "titulo": "Una carta cada cierto tiempo, siempre igual"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "Cómo entrenar el ritmo",
      "cuadros": [
        {
          "texto": "Primero, precisión: cuenta sin apuro hasta que no falles.",
          "resaltar": "0 errores"
        },
        {
          "texto": "Cuando ya no fallas, acorta el tiempo por carta de a poco."
        },
        {
          "texto": "Si vuelves a fallar, retrocede un paso: el ritmo parejo se construye, no se fuerza."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué conviene priorizar al empezar a entrenar?",
      "opciones": [
        "Precisión primero, velocidad después",
        "Velocidad primero, precisión después",
        "Recordar cada palo",
        "Contar en voz alta cada carta"
      ],
      "respuesta": "Precisión primero, velocidad después",
      "explicacion": "Un ritmo parejo y sin errores se construye primero; la velocidad viene después de dominar la precisión."
    },
    {
      "pregunta": "¿Qué debes llevar en la cabeza mientras cuentas?",
      "opciones": [
        "La lista completa de cartas vistas",
        "Solo el conteo corriente",
        "El palo de cada carta",
        "Cuántos reyes salieron"
      ],
      "respuesta": "Solo el conteo corriente",
      "explicacion": "Llevar un único número deja libre la memoria de trabajo."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-tecnica-ritmo' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Un mazo tiene 52 cartas, 4 de cada rango. En Hi-Lo, sumadas todas, dan exactamente $0$: por eso es un sistema balanceado.",
    "Sirve para comprobar tu conteo: si contaste un mazo entero y no te dio $0$, hubo un error.",
    "Y sirve al revés: lo que queda del mazo suma lo opuesto de lo que ya viste."
  ],
  "visuales": [
    {
      "tipo": "naipia.mazo",
      "sistema": "hilo",
      "despuesDePaso": 0,
      "titulo": "La suma de un mazo completo"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "Lo que queda del mazo",
      "cuadros": [
        {
          "texto": "Viste 10 cartas de un mazo: 2♠ 3♥ 4♦ 9♣ K♠ 5♥ 7♦ 6♣ Q♥ 8♠."
        },
        {
          "texto": "Su conteo con Hi-Lo:",
          "formula": "1 + 1 + 1 + 0 - 1 + 1 + 0 + 1 - 1 + 0 = 3",
          "resaltar": "$+3$"
        },
        {
          "texto": "El mazo completo suma $0$, así que las 42 cartas que quedan suman:",
          "formula": "0 - (+3) = -3",
          "resaltar": "$-3$"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿cuánto suma un mazo completo de 52 cartas?",
      "opciones": [
        "4",
        "-4",
        "0",
        "52"
      ],
      "respuesta": "0",
      "explicacion": "Hay 20 cartas de +1, 20 de -1 y 12 de 0: la suma es 0."
    },
    {
      "pregunta": "Viste parte de un mazo con Hi-Lo y el conteo fue +5. ¿Cuánto suman las cartas que quedan en ese mazo?",
      "opciones": [
        "5",
        "0",
        "-52",
        "-5"
      ],
      "respuesta": "-5",
      "explicacion": "El mazo completo suma 0, así que lo que queda suma lo opuesto de lo visto: -5."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-tecnica-mazo-cero' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "En Hi-Lo, los 7, 8 y 9 valen $0$: cuando salen no hay que hacer nada, el conteo se queda igual.",
    "Ejemplo: 8♠ 9♥ 7♦ 4♣ son tres neutras y un 4 que vale $+1$. El conteo es $+1$.",
    "Ojo: las neutras cambian de un sistema a otro. En KO el 7 pasa a valer $+1$, y en Hi-Opt II el As vale $0$."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "hilo",
      "enfatizar": 0,
      "despuesDePaso": 0,
      "titulo": "Las neutras de Hi-Lo"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "8♠",
        "9♥",
        "7♦",
        "4♣"
      ],
      "velocidad": 1500,
      "despuesDePaso": 1,
      "titulo": "Las neutras no mueven el conteo"
    },
    {
      "tipo": "naipia.comparar",
      "sistemas": [
        "hilo",
        "ko",
        "hiopt2",
        "omega2"
      ],
      "cartas": [
        "7♠",
        "8♥",
        "9♦",
        "A♣"
      ],
      "despuesDePaso": 2,
      "titulo": "Las neutras cambian según el sistema"
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿qué cartas valen 0?",
      "opciones": [
        "7, 8 y 9",
        "2, 3 y 4",
        "10, J y Q",
        "Solo el 8"
      ],
      "respuesta": "7, 8 y 9",
      "explicacion": "En Hi-Lo las cartas del 7 al 9 son neutras."
    },
    {
      "pregunta": "Con Hi-Lo, ¿cuál es el conteo de 7♠ 8♥ 9♦?",
      "opciones": [
        "1",
        "0",
        "-1",
        "3"
      ],
      "respuesta": "0",
      "explicacion": "Las tres son neutras: el conteo no se mueve."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-tecnica-neutras' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Un mazo de 52 cartas es demasiada información para recordarla completa. Los sistemas de conteo la resumen en un solo número pequeño: el conteo corriente.",
    "Míralo con cinco cartas: cada una mueve el conteo según su valor. Con Hi-Lo, 3♠ K♥ 6♦ 2♣ 9♠ termina en $+2$.",
    "El orden en que salen las cartas no cambia el conteo final: solo importa cuántas de cada valor viste.",
    "Entrenar conteo es entrenar atención sostenida y aritmética mental rápida, no memoria fotográfica."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "De 52 cartas a un solo número",
      "cuadros": [
        {
          "texto": "Recordar cada carta vista es demasiado: la memoria de trabajo aguanta pocos elementos a la vez."
        },
        {
          "texto": "En cambio, cada carta suma un valor pequeño: las bajas $+1$, las neutras $0$ y las altas $-1$ (ejemplo: Hi-Lo)."
        },
        {
          "texto": "Solo llevas un número, el conteo corriente, que sube o baja carta a carta."
        },
        {
          "texto": "Si salieron muchas cartas bajas, quedan más altas en lo que falta, y el número sube."
        }
      ]
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "3♠",
        "K♥",
        "6♦",
        "2♣",
        "9♠"
      ],
      "velocidad": 1500,
      "despuesDePaso": 1,
      "titulo": "Cada carta mueve el conteo"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 2,
      "titulo": "El orden no importa",
      "cuadros": [
        {
          "texto": "Las mismas cartas en otro orden: 9♠ 2♣ K♥ 6♦ 3♠."
        },
        {
          "texto": "Los mismos valores, sumados en otro orden:",
          "formula": "0 + 1 - 1 + 1 + 1 = 2",
          "resaltar": "$+2$"
        },
        {
          "texto": "Mismo conteo final: una suma no depende del orden de los sumandos."
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Qué se lleva en la cabeza al contar cartas?",
      "opciones": [
        "La lista completa de cartas vistas",
        "Solo el palo de cada carta",
        "Un único número que se actualiza carta a carta",
        "Cuántas cartas quedan de cada palo"
      ],
      "respuesta": "Un único número que se actualiza carta a carta",
      "explicacion": "Todos los sistemas resumen lo visto en un solo número: el conteo corriente."
    },
    {
      "pregunta": "¿El orden en que salen las cartas cambia el conteo corriente final?",
      "opciones": [
        "Sí, siempre cambia",
        "Solo si hay figuras",
        "Solo si se repite un palo",
        "No, solo importan los valores vistos"
      ],
      "respuesta": "No, solo importan los valores vistos",
      "explicacion": "El conteo final es la suma de valores; la suma no depende del orden."
    },
    {
      "pregunta": "Con Hi-Lo (2 al 6 = +1, 7 al 9 = 0, 10 al As = -1), ¿cuál es el conteo de 4♠ 4♥ Q♦ A♣ 5♠?",
      "opciones": [
        "1",
        "3",
        "-1",
        "0"
      ],
      "respuesta": "1",
      "explicacion": "4 y 4 dan +2, Q y As dan -2 y el 5 da +1: en total +1."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-por-que-valores' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Hi-Lo tiene solo tres valores: las bajas valen $+1$, las neutras $0$ y las altas $-1$. El conteo empieza en $0$.",
    "Cada carta que sale mueve el conteo según su valor; las neutras lo dejan igual. Esta secuencia termina en $0$.",
    "Comprobación: un mazo completo suma $0$. Si contaste un mazo entero y no diste $0$, revisa.",
    "Errores típicos: contar el As como carta baja (aquí es una carta alta y vale $-1$) y contar el 7 como $+1$ (en Hi-Lo es neutro; solo en KO vale $+1$)."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "hilo",
      "despuesDePaso": 0,
      "titulo": "Los valores de Hi-Lo"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "7♠",
        "K♥",
        "3♦",
        "10♣",
        "2♠",
        "5♥",
        "A♦",
        "9♣",
        "6♠",
        "J♥"
      ],
      "velocidad": 1100,
      "despuesDePaso": 1,
      "titulo": "Conteo corriente paso a paso"
    },
    {
      "tipo": "naipia.mazo",
      "sistema": "hilo",
      "despuesDePaso": 2,
      "titulo": "Por qué Hi-Lo es balanceado"
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿cuál es el conteo de 2♠ 3♥ 4♦ 5♣?",
      "opciones": [
        "2",
        "4",
        "0",
        "-4"
      ],
      "respuesta": "4",
      "explicacion": "Cuatro cartas bajas: +1 cada una, en total +4."
    },
    {
      "pregunta": "Con Hi-Lo, ¿cuál es el conteo de 7♠ K♥ 3♦ 10♣ 2♠ 5♥?",
      "opciones": [
        "2",
        "0",
        "1",
        "3"
      ],
      "respuesta": "1",
      "explicacion": "Paso a paso: 7♠ (0) → 0; K♥ (-1) → -1; 3♦ (+1) → 0; 10♣ (-1) → -1; 2♠ (+1) → 0; 5♥ (+1) → +1."
    },
    {
      "pregunta": "¿Cuánto vale el As en Hi-Lo?",
      "opciones": [
        "+1",
        "0",
        "-2",
        "-1"
      ],
      "respuesta": "-1",
      "explicacion": "En Hi-Lo el As se cuenta como carta alta: -1."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-hilo' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "La velocidad sale de tres hábitos: descartar las neutras sin mirarlas, cancelar pares de valor opuesto y resumir por bloques.",
    "Primero se apartan las neutras y luego se cancelan los pares. Lo que queda sin pareja es el conteo: aquí $+1$.",
    "El mismo conteo por bloques de 4 cartas: una sola actualización por bloque.",
    "Si el orden es desfavorable, el conteo se mueve mucho antes de recuperarse: no te asustes, cuenta con calma. Entrena primero el largo de la secuencia y solo después acorta el tiempo."
  ],
  "visuales": [
    {
      "tipo": "naipia.cancelacion",
      "sistema": "hilo",
      "cartas": [
        "Q♠",
        "4♥",
        "8♦",
        "K♣",
        "6♠",
        "9♥",
        "A♦",
        "2♣",
        "10♠",
        "3♦",
        "7♣",
        "5♥"
      ],
      "despuesDePaso": 1,
      "titulo": "Descartar neutras y cancelar pares"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "hilo",
      "cartas": [
        "Q♠",
        "4♥",
        "8♦",
        "K♣",
        "6♠",
        "9♥",
        "A♦",
        "2♣",
        "10♠",
        "3♦",
        "7♣",
        "5♥"
      ],
      "bloque": 4,
      "velocidad": 2400,
      "despuesDePaso": 2,
      "titulo": "Por bloques de 4"
    }
  ],
  "quiz": [
    {
      "pregunta": "Con Hi-Lo, ¿qué conteo queda al cancelar pares en J♠ 2♥ 9♦ 3♣ 5♠?",
      "opciones": [
        "2",
        "0",
        "-1",
        "3"
      ],
      "respuesta": "2",
      "explicacion": "J con 2 se cancelan; el 9 es neutro; sobran 3 y 5 (+1 y +1): el conteo es +2. Ojo con los pares: no uses una carta dos veces."
    },
    {
      "pregunta": "Con Hi-Lo, ¿cuál es el conteo de Q♠ 4♥ 8♦ K♣ 6♠ 9♥ A♦ 2♣?",
      "opciones": [
        "1",
        "0",
        "-1",
        "2"
      ],
      "respuesta": "0",
      "explicacion": "Paso a paso: Q♠ (-1) → -1; 4♥ (+1) → 0; 8♦ (0) → 0; K♣ (-1) → -1; 6♠ (+1) → 0; 9♥ (0) → 0; A♦ (-1) → -1; 2♣ (+1) → 0."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-cancelacion' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "KO usa los mismos grupos que Hi-Lo con una diferencia: el 7 también vale $+1$.",
    "Como hay más cartas de $+1$ que de $-1$, un mazo completo suma $+4$, no $0$: KO es un sistema no balanceado.",
    "Cuenta esta secuencia con KO: da $+4$. Con Hi-Lo la misma secuencia da $+2$: los 7 cambian el resultado.",
    "Como el mazo completo suma $+4$, lo que queda se calcula restando desde $+4$, no desde $0$."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "ko",
      "despuesDePaso": 0,
      "titulo": "Los valores de KO"
    },
    {
      "tipo": "naipia.mazo",
      "sistema": "ko",
      "despuesDePaso": 1,
      "titulo": "El mazo completo no vuelve a 0"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "ko",
      "cartas": [
        "7♠",
        "K♥",
        "4♦",
        "9♣",
        "7♥",
        "2♠",
        "A♦",
        "8♣",
        "6♠",
        "3♥"
      ],
      "velocidad": 1100,
      "despuesDePaso": 2,
      "titulo": "Conteo con KO"
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Lo que queda del mazo con KO",
      "cuadros": [
        {
          "texto": "Viste las 10 cartas 7♠ K♥ 4♦ 9♣ 7♥ 2♠ A♦ 8♣ 6♠ 3♥ y el conteo KO fue $+4$."
        },
        {
          "texto": "Las 42 cartas que quedan suman el total del mazo menos lo visto:",
          "formula": "4 - (4) = 0",
          "resaltar": "$0$"
        }
      ]
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto suma un mazo completo de 52 cartas con KO?",
      "opciones": [
        "0",
        "-4",
        "4",
        "24"
      ],
      "respuesta": "4",
      "explicacion": "Hay 24 cartas de +1 (2 al 7) y 20 de -1: 24 - 20 = 4."
    },
    {
      "pregunta": "Con KO, ¿cuál es el conteo de 7♠ 7♥ K♦?",
      "opciones": [
        "-1",
        "0",
        "3",
        "1"
      ],
      "respuesta": "1",
      "explicacion": "Cada 7 vale +1 y el rey vale -1: 1 + 1 - 1 = 1."
    },
    {
      "pregunta": "Viste 7♠ K♥ 4♦ 9♣ 7♥ 2♠ de un mazo con KO. ¿Cuánto suman las cartas que quedan?",
      "opciones": [
        "1",
        "-3",
        "3",
        "7"
      ],
      "respuesta": "1",
      "explicacion": "Lo visto suma +3; el mazo completo suma +4; lo que queda es 4 - (+3) = 1."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-ko' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Todos los sistemas resumen la secuencia en un número, pero difieren en cuántos valores distinguen: Hi-Lo y KO usan tres; Hi-Opt II y Omega II usan hasta cinco.",
    "Mira la misma secuencia con los cuatro sistemas: Hi-Lo da $+2$, KO $+3$, Hi-Opt II $+5$ y Omega II $+5$.",
    "Más valores capturan más detalle de las cartas que quedan, pero cada carta exige una decisión más fina y la velocidad baja. No hay un sistema mejor: es un equilibrio entre precisión y velocidad.",
    "Por eso los conteos de sistemas distintos no se comparan: cada uno tiene su propia escala. Domina uno antes de pasar al siguiente."
  ],
  "visuales": [
    {
      "tipo": "naipia.comparar",
      "sistemas": [
        "hilo",
        "ko",
        "hiopt2",
        "omega2"
      ],
      "cartas": [
        "6♠",
        "K♥",
        "4♦",
        "9♣",
        "2♥",
        "A♠",
        "5♦",
        "7♣"
      ],
      "despuesDePaso": 1,
      "titulo": "La misma secuencia, cuatro sistemas"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Por qué Hi-Opt II suele ser más preciso que Hi-Lo?",
      "opciones": [
        "Usa menos valores",
        "Distingue más valores, aunque exige más esfuerzo mental",
        "No requiere memoria",
        "Siempre suma 0 en cada carta"
      ],
      "respuesta": "Distingue más valores, aunque exige más esfuerzo mental",
      "explicacion": "Más valores distintos capturan más detalle, a costa de velocidad y esfuerzo."
    },
    {
      "pregunta": "Con la secuencia 6♠ K♥ 4♦ 9♣ 2♥ A♠ 5♦ 7♣, ¿qué conteo da Hi-Opt II?",
      "opciones": [
        "6",
        "4",
        "5",
        "7"
      ],
      "respuesta": "5",
      "explicacion": "Con Hi-Opt II: 6♠ (+1) → +1; K♥ (-2) → -1; 4♦ (+2) → +1; 9♣ (0) → +1; 2♥ (+1) → +2; A♠ (0) → +2; 5♦ (+2) → +4; 7♣ (+1) → +5."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-sistemas' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Hi-Opt II usa cinco valores, de $+2$ a $-2$: más precisión a cambio de más esfuerzo por carta.",
    "Es balanceado: un mazo completo suma $0$.",
    "Diferencias con Hi-Lo que hay que grabar: el As y el 9 son neutros, el 7 vale $+1$ y las cartas de $+2$ y $-2$ mueven el conteo el doble. Esta secuencia termina en $+3$.",
    "Cancelación: un $+2$ (4 o 5) se anula con un $-2$ (10, J, Q, K). Las cartas de $+1$ no tienen pareja de $-1$ en este sistema, así que se acumulan."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "hiopt2",
      "despuesDePaso": 0,
      "titulo": "Los valores de Hi-Opt II"
    },
    {
      "tipo": "naipia.mazo",
      "sistema": "hiopt2",
      "despuesDePaso": 1,
      "titulo": "Un mazo completo suma 0"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "hiopt2",
      "cartas": [
        "4♠",
        "10♥",
        "6♦",
        "A♣",
        "3♠",
        "K♦",
        "5♥",
        "8♣",
        "2♠"
      ],
      "velocidad": 1100,
      "despuesDePaso": 2,
      "titulo": "Conteo con Hi-Opt II"
    },
    {
      "tipo": "naipia.cancelacion",
      "sistema": "hiopt2",
      "cartas": [
        "5♠",
        "Q♦",
        "4♥",
        "J♣",
        "6♠",
        "3♦",
        "8♥",
        "7♣"
      ],
      "despuesDePaso": 3,
      "titulo": "Los +2 y los -2 se cancelan; los +1 se acumulan"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale el As en Hi-Opt II?",
      "opciones": [
        "-1",
        "-2",
        "+1",
        "0"
      ],
      "respuesta": "0",
      "explicacion": "En Hi-Opt II el As es neutro."
    },
    {
      "pregunta": "Con Hi-Opt II, ¿cuál es el conteo de 5♠ 4♥ Q♦?",
      "opciones": [
        "2",
        "1",
        "-2",
        "4"
      ],
      "respuesta": "2",
      "explicacion": "5 y 4 valen +2 cada uno y la reina -2: 2 + 2 - 2 = 2."
    },
    {
      "pregunta": "Con Hi-Opt II, ¿cuál es el conteo de 4♠ 10♥ 6♦ A♣ 3♠ K♦ 5♥ 8♣ 2♠?",
      "opciones": [
        "4",
        "3",
        "2",
        "5"
      ],
      "respuesta": "3",
      "explicacion": "Paso a paso: 4♠ (+2) → +2; 10♥ (-2) → 0; 6♦ (+1) → +1; A♣ (0) → +1; 3♠ (+1) → +2; K♦ (-2) → 0; 5♥ (+2) → +2; 8♣ (0) → +2; 2♠ (+1) → +3."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-hiopt2' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Omega II también usa cinco valores. El 9 vale $-1$ y el As es neutro ($0$).",
    "Es un sistema balanceado: un mazo completo suma $0$.",
    "Diferencias con Hi-Opt II: aquí el 6 vale $+2$ (allá $+1$) y el 9 vale $-1$ (allá $0$). Son los dos rangos que más se confunden al cambiar de sistema.",
    "Ejemplo: 6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣ termina en $+1$. En la cancelación, un $+1$ solo se anula con un $-1$, y el único $-1$ es el 9."
  ],
  "visuales": [
    {
      "tipo": "naipia.valores",
      "sistema": "omega2",
      "despuesDePaso": 0,
      "titulo": "Los valores de Omega II"
    },
    {
      "tipo": "naipia.mazo",
      "sistema": "omega2",
      "despuesDePaso": 1,
      "titulo": "Un mazo completo suma 0"
    },
    {
      "tipo": "naipia.comparar",
      "sistemas": [
        "hiopt2",
        "omega2"
      ],
      "cartas": [
        "6♠",
        "9♥",
        "A♦",
        "7♣"
      ],
      "despuesDePaso": 2,
      "titulo": "Omega II frente a Hi-Opt II"
    },
    {
      "tipo": "naipia.conteo",
      "sistema": "omega2",
      "cartas": [
        "6♠",
        "9♥",
        "2♦",
        "K♣",
        "A♠",
        "7♦",
        "4♥",
        "10♠",
        "8♣"
      ],
      "velocidad": 1100,
      "despuesDePaso": 3,
      "titulo": "Conteo con Omega II"
    }
  ],
  "quiz": [
    {
      "pregunta": "¿Cuánto vale el 9 en Omega II?",
      "opciones": [
        "0",
        "+1",
        "-1",
        "-2"
      ],
      "respuesta": "-1",
      "explicacion": "En Omega II el 9 vale -1."
    },
    {
      "pregunta": "Con Omega II, ¿cuál es el conteo de 6♠ 9♥ K♦?",
      "opciones": [
        "1",
        "-3",
        "2",
        "-1"
      ],
      "respuesta": "-1",
      "explicacion": "El 6 vale +2, el 9 vale -1 y el rey vale -2: 2 - 1 - 2 = -1."
    },
    {
      "pregunta": "Con Omega II, ¿cuál es el conteo de 6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣?",
      "opciones": [
        "1",
        "2",
        "0",
        "3"
      ],
      "respuesta": "1",
      "explicacion": "Paso a paso: 6♠ (+2) → +2; 9♥ (-1) → +1; 2♦ (+1) → +2; K♣ (-2) → 0; A♠ (0) → 0; 7♦ (+1) → +1; 4♥ (+2) → +3; 10♠ (-2) → +1; 8♣ (0) → +1."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-omega2' and problem_type = 'naipia';

update public.techniques set contenido =
$naipia${
  "pasos": [
    "Un conteo corriente de $+6$ significa cosas distintas si quedan 6 mazos o si queda solo 1. El conteo verdadero lo corrige dividiendo por los mazos restantes.",
    "Ejemplo: en un conjunto de 4 mazos salieron 96 cartas. Quedan 112 cartas, es decir 2,15 mazos: al medio mazo más cercano, 2. Con conteo corriente $+10$: 10 ÷ 2 = 5.",
    "El resultado casi nunca es entero, así que la regla de redondeo se declara siempre. Con valores negativos las reglas difieren: -7 ÷ 3 = -2,33. Más cercano: -2; truncando: -2; hacia abajo: -3.",
    "Otro ejemplo: 11 ÷ 2,5 = 4,4. Más cercano: 4; truncando: 4."
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "La idea en una fórmula",
      "cuadros": [
        {
          "texto": "El conteo verdadero divide el conteo corriente por los mazos que quedan (se usa con sistemas balanceados, como Hi-Lo):",
          "formula": "\\text{conteo verdadero} = \\dfrac{\\text{conteo corriente}}{\\text{mazos restantes}}"
        },
        {
          "texto": "Con muchos mazos, el mismo conteo corriente pesa poco; con pocos mazos, pesa mucho."
        }
      ]
    },
    {
      "tipo": "naipia.verdadero",
      "conteo": 10,
      "mazosTotales": 4,
      "cartasJugadas": 96,
      "regla": "cercano",
      "despuesDePaso": 1,
      "titulo": "Estimar los mazos, dividir y redondear"
    },
    {
      "tipo": "naipia.verdadero",
      "conteo": -7,
      "mazosRestantes": 3,
      "regla": "abajo",
      "despuesDePaso": 2,
      "titulo": "Con negativos, la regla importa"
    },
    {
      "tipo": "naipia.verdadero",
      "conteo": 11,
      "mazosRestantes": 2.5,
      "regla": "cercano",
      "despuesDePaso": 3,
      "titulo": "Con medio mazo"
    }
  ],
  "quiz": [
    {
      "pregunta": "Conteo corriente +13, quedan 3 mazos. ¿Conteo verdadero redondeando hacia abajo (al entero menor)?",
      "opciones": [
        "5",
        "4",
        "3",
        "13"
      ],
      "respuesta": "4",
      "explicacion": "13 / 3 = 4.33; hacia abajo es 4."
    },
    {
      "pregunta": "Conteo corriente -7, quedan 3 mazos. ¿Conteo verdadero descartando los decimales (truncando hacia cero)?",
      "opciones": [
        "-3",
        "2",
        "-2",
        "-7"
      ],
      "respuesta": "-2",
      "explicacion": "-7 / 3 = -2.33; al truncar hacia cero queda -2. Redondeando hacia abajo habría sido -3."
    },
    {
      "pregunta": "En un conjunto de 6 mazos ya salieron 130 cartas. ¿Cuántos mazos quedan, al medio mazo más cercano?",
      "opciones": [
        "4",
        "3",
        "2,5",
        "3,5"
      ],
      "respuesta": "3,5",
      "explicacion": "Quedan 312 - 130 = 182 cartas; 182 / 52 = 3,5 mazos exactos."
    }
  ]
}$naipia$::jsonb
where slug = 'naipia-clase-conteo-verdadero' and problem_type = 'naipia';
