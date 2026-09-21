-- ============================================================
-- Prodigia — contenido de Aprender del mundo 12 (Naipia).
--
-- Naipia es un deporte mental de memoria y conteo de cartas (atención,
-- memoria de trabajo y aritmética mental). Estas filas de `techniques`
-- (problem_type='naipia') alimentan las dos pestañas de Aprender:
--   - Técnicas (gratis): 5 filas, orden 1-5, requiere_pro=false.
--   - Clases (Pro): 8 filas, orden 6-13, requiere_pro=true — progresivas y
--     dependientes entre sí (por qué se cuentan valores, Hi-Lo,
--     cancelación y velocidad, KO, por qué existen distintos sistemas,
--     Hi-Opt II, Omega II, conteo verdadero). La primera clase (orden 6)
--     es preview gratis por la lógica de src/lib/aprender/clases.ts.
--
-- Cada fila lleva contenido = { pasos, quiz }: pasos con explicación y
-- ejemplo resuelto (notación $...$ vía MathText) y quiz de 2-3 preguntas
-- con explicación. Todo número de los ejemplos y las respuestas de los
-- quiz se calculó con un script independiente (tablas de valores y
-- redondeo por búsqueda exhaustiva) antes de escribir este archivo.
--
-- Requiere 0189 (check de techniques.problem_type con 'naipia') y la
-- columna techniques.requiere_pro de 0170. Idempotente por slug.
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values
('naipia-tecnica-pares', 'Agrupa cartas en pares que se cancelan',
  'En vez de sumar carta por carta, busca pares de valor opuesto: se anulan y solo cuentas lo que sobra.',
  'naipia',
  $naipia${
  "pasos": [
    "En un sistema como Hi-Lo, una carta baja vale $+1$ y una alta vale $-1$. Si ves una de cada una, juntas valen $0$: se cancelan y no tienes que actualizar el conteo.",
    "Truco: mientras miras la secuencia, marca mentalmente pares (una baja con una alta) y descártalos. El conteo final es solo lo que quedó sin pareja.",
    "Ejemplo resuelto con Hi-Lo: K♠ 3♥ 9♦ 5♣ A♠ 2♦ 7♥ Q♣. Pares que se cancelan: K♠ con 3♥, A♠ con 5♣, 2♦ con Q♣. Las cartas 9♦ y 7♥ valen $0$ y se ignoran. No sobra nada: el conteo es $0$.",
    "Verificación carta a carta (debe dar lo mismo): K♠ ($-1$) → $-1$; 3♥ ($+1$) → $0$; 9♦ ($0$) → $0$; 5♣ ($+1$) → $+1$; A♠ ($-1$) → $0$; 2♦ ($+1$) → $+1$; 7♥ ($0$) → $+1$; Q♣ ($-1$) → $0$.",
    "Los pares no tienen que estar juntos: puedes emparejar una carta con otra que salió varias cartas después. Lo importante es no usar la misma carta en dos pares."
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
}$naipia$::jsonb,
  1, false),

('naipia-tecnica-bloques', 'Cuenta por bloques',
  'Divide la secuencia en bloques de 3 o 4 cartas, resume cada bloque con un solo número y suma los resúmenes.',
  'naipia',
  $naipia${
  "pasos": [
    "Sumar una carta a la vez obliga a actualizar el conteo muchas veces, y cada actualización es una oportunidad de error. Con bloques, resumes tres o cuatro cartas de un vistazo y actualizas una sola vez.",
    "Regla práctica: mira un bloque, calcula su valor completo en silencio y recién ahí súmalo al conteo corriente. Los bloques de 3 cartas son un buen punto de partida.",
    "Ejemplo resuelto con Hi-Lo: 4♠ 6♥ 2♦ K♣ 8♠ A♥ 3♣ 10♦ 5♠. Bloque 1: 4♠ 6♥ 2♦ = $+3$. Bloque 2: K♣ 8♠ A♥ = $-2$. Bloque 3: 3♣ 10♦ 5♠ = $+1$.",
    "Conteo final: $+3 - 2 + 1 = +2$.",
    "Con práctica, el tamaño del bloque sube solo. Si empiezas a fallar, vuelve a bloques más chicos: la precisión importa más que la velocidad al principio."
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
}$naipia$::jsonb,
  2, false),

('naipia-tecnica-ritmo', 'Encuentra tu ritmo',
  'Contar rápido no es contar apurado: un ritmo parejo evita saltos y recuentos.',
  'naipia',
  $naipia${
  "pasos": [
    "La mayor causa de errores no es la aritmética sino el ritmo irregular: acelerar en las cartas fáciles y trabarse en las difíciles hace perder el hilo.",
    "Elige un ritmo que puedas sostener sin equivocarte y mantenlo carta tras carta. Es preferible una velocidad constante y algo más lenta que ráfagas seguidas de frenadas.",
    "Lleva SOLO el conteo corriente en la cabeza. No repitas la lista de cartas vistas: si te concentras en el número, tu memoria de trabajo queda libre.",
    "Si pierdes el hilo, no adivines: reinicia desde un punto que conozcas (por ejemplo, el conteo que tenías al inicio de la secuencia) y sigue con el mismo ritmo.",
    "Entrena en dos pasos: primero precisión (cero errores), después velocidad. Cuando ya no fallas, acorta el tiempo por carta de a poco."
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
}$naipia$::jsonb,
  3, false),

('naipia-tecnica-mazo-cero', 'Verificación: un mazo completo suma 0',
  'En un sistema balanceado, las 52 cartas de un mazo suman exactamente 0: úsalo para comprobar tu conteo.',
  'naipia',
  $naipia${
  "pasos": [
    "Un mazo tiene 52 cartas: 4 de cada rango. En Hi-Lo hay 20 cartas que valen $+1$ (2 al 6), 12 que valen $0$ (7, 8 y 9) y 20 que valen $-1$ (10, J, Q, K y As).",
    "Suma del mazo completo con Hi-Lo: $20 \\times (+1) + 12 \\times 0 + 20 \\times (-1) = 0$. Por eso a Hi-Lo se le llama sistema balanceado.",
    "Consecuencia útil: si contaste todas las cartas de un mazo completo y no obtuviste $0$, cometiste un error en algún punto. Es una forma gratuita de autocorregirte.",
    "Segunda consecuencia: si viste una parte del mazo con conteo $c$, las cartas que quedan suman exactamente $-c$.",
    "Ejemplo: viste 10 cartas de un mazo y el conteo Hi-Lo fue $+3$. Las 42 cartas que quedan suman $-3$."
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
}$naipia$::jsonb,
  4, false),

('naipia-tecnica-neutras', 'Las cartas neutras no se cuentan',
  'Cada sistema tiene cartas de valor 0: aprender cuáles son te ahorra trabajo y errores.',
  'naipia',
  $naipia${
  "pasos": [
    "En Hi-Lo, los 7, 8 y 9 valen $0$. Cuando aparecen no hay que hacer nada: el conteo se queda igual. No es necesario ni siquiera 'sumar cero'.",
    "Error frecuente: confundir una carta neutra con una baja o una alta y mover el conteo sin necesidad. Aprende de memoria el grupo de neutras de tu sistema.",
    "Ejemplo con Hi-Lo: 8♠ 9♥ 7♦ 4♣. Tres neutras (8, 9 y 7) y un 4 que vale $+1$. Conteo: $+1$.",
    "Atención: las neutras cambian de un sistema a otro. En KO solo el 8 y el 9 valen $0$ (el 7 pasa a $+1$); en Hi-Opt II son el 8, el 9 y el As."
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
}$naipia$::jsonb,
  5, false),

('naipia-clase-por-que-valores', 'Clase 1: Por qué se cuentan valores y no cartas',
  'La idea central del deporte: resumir lo que pasó en un solo número pequeño en vez de recordar cada carta.',
  'naipia',
  $naipia${
  "pasos": [
    "Un mazo de 52 cartas es demasiada información para recordarla completa: la memoria de trabajo aguanta unos pocos elementos a la vez. Si intentas memorizar cada carta vista, te saturas.",
    "La solución de todos los sistemas de conteo es la misma: asignar a cada rango un valor pequeño (positivo, negativo o cero) y llevar un único número, el conteo corriente, que se actualiza carta a carta.",
    "El conteo corriente resume cómo se desvió la composición de lo que ya salió: si salieron muchas cartas bajas, quedan proporcionalmente más altas en lo que falta, y el número sube; si salieron muchas altas, baja.",
    "Ejemplo resuelto (Hi-Lo, que veremos en la próxima clase): 3♠ K♥ 6♦ 2♣ 9♠. Valores: 3 → $+1$, K → $-1$, 6 → $+1$, 2 → $+1$, 9 → $0$. Conteo: $+1 - 1 + 1 + 1 + 0 = +2$.",
    "El orden en que salen las cartas no cambia el conteo final: solo importa cuántas de cada valor viste. Eso permite agrupar, cancelar y contar por bloques (lo vemos en la clase 3).",
    "Idea clave: entrenar conteo es entrenar atención sostenida y aritmética mental rápida, no memoria fotográfica."
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
}$naipia$::jsonb,
  6, true),

('naipia-clase-hilo', 'Clase 2: Hi-Lo, el sistema base',
  'Los valores de Hi-Lo, cómo llevar el conteo corriente y cómo verificar que tu conteo es coherente.',
  'naipia',
  $naipia${
  "pasos": [
    "Hi-Lo tiene solo tres valores. Cartas bajas (2, 3, 4, 5, 6) valen $+1$. Cartas neutras (7, 8, 9) valen $0$. Cartas altas (10, J, Q, K y As) valen $-1$.",
    "El conteo corriente empieza en $0$ con el mazo completo sin ver. Cada carta que sale mueve el conteo según su valor; las neutras lo dejan igual.",
    "Ejemplo resuelto paso a paso: 7♠ K♥ 3♦ 10♣ 2♠ 5♥ A♦ 9♣ 6♠ J♥. 7♠ ($0$) → $0$; K♥ ($-1$) → $-1$; 3♦ ($+1$) → $0$; 10♣ ($-1$) → $-1$; 2♠ ($+1$) → $0$; 5♥ ($+1$) → $+1$; A♦ ($-1$) → $0$; 9♣ ($0$) → $0$; 6♠ ($+1$) → $+1$; J♥ ($-1$) → $0$. Conteo final: $0$.",
    "Verificación: hay 20 cartas de $+1$, 12 de $0$ y 20 de $-1$ en un mazo de 52. La suma total es $0$: Hi-Lo es un sistema balanceado. Si contaste un mazo completo y no diste $0$, revisa.",
    "Errores típicos: contar el As como carta baja (en Hi-Lo vale $-1$) y contar el 7 como $+1$ (aquí es neutro; solo en KO vale $+1$)."
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
}$naipia$::jsonb,
  7, true),

('naipia-clase-cancelacion', 'Clase 3: Cancelación y velocidad',
  'Cómo combinar pares que se cancelan, cartas neutras y bloques para contar más rápido sin perder precisión.',
  'naipia',
  $naipia${
  "pasos": [
    "Con la idea de valor ya clara, la velocidad sale de tres hábitos: descartar las neutras sin mirarlas, cancelar pares de valor opuesto, y resumir por bloques.",
    "Ejemplo resuelto con Hi-Lo: Q♠ 4♥ 8♦ K♣ 6♠ 9♥ A♦ 2♣ 10♠ 3♦ 7♣ 5♥. Paso 1, descartar neutras: 8♦, 9♥ y 7♣ valen $0$. Quedan Q♠ 4♥ K♣ 6♠ A♦ 2♣ 10♠ 3♦ 5♥.",
    "Paso 2, cancelar pares: Q♠ con 4♥, K♣ con 6♠, A♦ con 2♣ y 10♠ con 3♦. Cada par suma $0$. Queda una carta sin pareja: 5♥, que vale $+1$.",
    "Conteo final: $+1$. Comprobación carta a carta: Q♠ ($-1$) → $-1$; 4♥ ($+1$) → $0$; 8♦ ($0$) → $0$; K♣ ($-1$) → $-1$; 6♠ ($+1$) → $0$; 9♥ ($0$) → $0$; A♦ ($-1$) → $-1$; 2♣ ($+1$) → $0$; 10♠ ($-1$) → $-1$; 3♦ ($+1$) → $0$; 7♣ ($0$) → $0$; 5♥ ($+1$) → $+1$.",
    "Cuando el orden es desfavorable (por ejemplo, muchas altas seguidas), el conteo se mueve mucho antes de recuperarse: no te asustes por las oscilaciones, cuenta con calma.",
    "Entrenamiento recomendado: aumenta primero el largo de la secuencia con el mismo tiempo, y solo después acorta el tiempo. La precisión sostenida es lo que se transfiere a secuencias largas."
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
}$naipia$::jsonb,
  8, true),

('naipia-clase-ko', 'Clase 4: KO, un sistema no balanceado',
  'El sistema KO valora el 7 como carta baja: es más simple de usar en conjuntos de varios mazos, pero su mazo completo no suma 0.',
  'naipia',
  $naipia${
  "pasos": [
    "KO usa los mismos grupos que Hi-Lo con una diferencia clave: el 7 también vale $+1$. Cartas bajas (2 al 7) valen $+1$; neutras (8 y 9) valen $0$; altas (10, J, Q, K y As) valen $-1$.",
    "Como hay 24 cartas de $+1$ y 20 de $-1$ en un mazo, un mazo completo suma $+4$ en KO. Por eso es un sistema NO balanceado: el conteo de un mazo completo no vuelve a $0$.",
    "Ejemplo resuelto: 7♠ K♥ 4♦ 9♣ 7♥ 2♠ A♦ 8♣ 6♠ 3♥. 7♠ ($+1$) → $+1$; K♥ ($-1$) → $0$; 4♦ ($+1$) → $+1$; 9♣ ($0$) → $+1$; 7♥ ($+1$) → $+2$; 2♠ ($+1$) → $+3$; A♦ ($-1$) → $+2$; 8♣ ($0$) → $+2$; 6♠ ($+1$) → $+3$; 3♥ ($+1$) → $+4$. Conteo final: $+4$. Con Hi-Lo la misma secuencia da $+2$: los 7 cambian el resultado.",
    "Cartas restantes: si viste esas 10 cartas de un mazo de 52, las 42 restantes suman $+4 - (+4) = 0$. Recuerda restar desde $+4$, no desde $0$.",
    "Por su simplicidad, KO se usa mucho en conjuntos de varios mazos: se cuenta igual que Hi-Lo, sin cambiar de hábito, solo sumando el 7 a las cartas bajas."
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
}$naipia$::jsonb,
  9, true),

('naipia-clase-sistemas', 'Clase 5: Por qué existen distintos sistemas',
  'Precisión contra velocidad: cada sistema elige cuántos valores distintos distinguir, y eso cambia el esfuerzo mental.',
  'naipia',
  $naipia${
  "pasos": [
    "Todos los sistemas resumen la secuencia en un número, pero difieren en cuántos valores distintos usan. Hi-Lo y KO usan tres ($+1$, $0$, $-1$); Hi-Opt II y Omega II usan hasta cinco ($+2$, $+1$, $0$, $-1$, $-2$).",
    "Más valores capturan más detalle de la composición de las cartas que quedan (por ejemplo, distinguir un 5 de un 2), así que el conteo es más preciso. El precio: cada carta exige una decisión mental más fina, y la velocidad y la tasa de errores empeoran.",
    "Menos valores son más rápidos y fáciles de sostener, pero dejan detalle sin capturar. No hay un sistema 'mejor': hay un equilibrio entre precisión y velocidad que cada persona elige según su entrenamiento.",
    "Ejemplo resuelto: la misma secuencia 6♠ K♥ 4♦ 9♣ 2♥ A♠ 5♦ 7♣ da resultados distintos según el sistema. Hi-Lo: $+2$; KO: $+3$; Hi-Opt II: $+5$; Omega II: $+5$.",
    "Por eso los conteos de sistemas distintos NO se comparan entre sí: cada uno tiene su propia escala. Un conteo de $+4$ en Hi-Lo no significa lo mismo que $+4$ en Hi-Opt II.",
    "Regla de entrenamiento: domina un sistema hasta que la precisión sea estable antes de pasar al siguiente, y cambia de sistema por curiosidad y desafío, no por apuro."
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
}$naipia$::jsonb,
  10, true),

('naipia-clase-hiopt2', 'Clase 6: Hi-Opt II',
  'Valores de $+2$ a $-2$: más precisión a cambio de más esfuerzo por carta.',
  'naipia',
  $naipia${
  "pasos": [
    "Hi-Opt II usa cinco valores. Los 4 y 5 valen $+2$. Los 2, 3, 6 y 7 valen $+1$. Los 8, 9 y el As valen $0$. Los 10, J, Q y K valen $-2$.",
    "Un mazo completo suma $0$: es un sistema balanceado. Hay 8 cartas de $+2$, 16 de $+1$, 12 de $0$ y 16 de $-2$: $16 + 16 - 32 = 0$.",
    "Diferencias con Hi-Lo que hay que grabar: el As es neutro (no $-1$), el 9 es neutro, el 7 vale $+1$, y las cartas de $+2$ y $-2$ mueven el conteo el doble.",
    "Ejemplo resuelto: 4♠ 10♥ 6♦ A♣ 3♠ K♦ 5♥ 8♣ 2♠. 4♠ ($+2$) → $+2$; 10♥ ($-2$) → $0$; 6♦ ($+1$) → $+1$; A♣ ($0$) → $+1$; 3♠ ($+1$) → $+2$; K♦ ($-2$) → $0$; 5♥ ($+2$) → $+2$; 8♣ ($0$) → $+2$; 2♠ ($+1$) → $+3$. Conteo final: $+3$.",
    "Cancelación: un $+2$ (4 o 5) se anula con un $-2$ (10, J, Q, K). Las cartas de $+1$ no tienen pareja de $-1$ en este sistema, así que se acumulan."
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
}$naipia$::jsonb,
  11, true),

('naipia-clase-omega2', 'Clase 7: Omega II',
  'Un sistema fino de valores múltiples en el que el 9 vale $-1$ y el As es neutro.',
  'naipia',
  $naipia${
  "pasos": [
    "Omega II también usa cinco valores. Los 4, 5 y 6 valen $+2$. Los 2, 3 y 7 valen $+1$. Los 8 y el As valen $0$. El 9 vale $-1$. Los 10, J, Q y K valen $-2$.",
    "Es un sistema balanceado: un mazo completo suma $12 \\times (+2) + 12 \\times (+1) + 4 \\times (-1) + 16 \\times (-2) = 24 + 12 - 4 - 32 = 0$.",
    "Diferencias con Hi-Opt II: aquí el 6 vale $+2$ (allá $+1$) y el 9 vale $-1$ (allá $0$). Son los dos rangos que más se confunden al cambiar de sistema.",
    "Ejemplo resuelto: 6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣. 6♠ ($+2$) → $+2$; 9♥ ($-1$) → $+1$; 2♦ ($+1$) → $+2$; K♣ ($-2$) → $0$; A♠ ($0$) → $0$; 7♦ ($+1$) → $+1$; 4♥ ($+2$) → $+3$; 10♠ ($-2$) → $+1$; 8♣ ($0$) → $+1$. Conteo final: $+1$.",
    "Cancelación: $+2$ con $-2$, y $+1$ con $-1$ (solo el 9 vale $-1$, así que los pares de $\\pm 1$ siempre llevan un 9)."
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
}$naipia$::jsonb,
  12, true),

('naipia-clase-conteo-verdadero', 'Clase 8: Conteo verdadero y estimación de cartas restantes',
  'Dividir el conteo corriente por los mazos restantes para comparar situaciones distintas, con la regla de redondeo siempre declarada.',
  'naipia',
  $naipia${
  "pasos": [
    "Un conteo corriente de $+6$ significa cosas distintas si quedan 6 mazos o si queda solo 1: en el segundo caso la desviación está mucho más concentrada. El conteo verdadero lo corrige dividiendo por los mazos restantes.",
    "Fórmula: $\\text{conteo verdadero} = \\dfrac{\\text{conteo corriente}}{\\text{mazos restantes}}$. Se usa con sistemas balanceados (por ejemplo, Hi-Lo).",
    "Paso 1, estimar los mazos restantes: cartas restantes $= 52 \\times (\\text{mazos del conjunto}) - (\\text{cartas que salieron})$; divide por 52 y redondea al medio mazo más cercano.",
    "Ejemplo resuelto: conjunto de 4 mazos y ya salieron 96 cartas. Cartas restantes: $208 - 96 = 112$. Mazos restantes: $112 / 52 \\approx 2.15$, que al medio mazo más cercano es $2$.",
    "Paso 2, dividir: con conteo corriente $+10$ y $2$ mazos, $10 / 2 = 5$. El conteo verdadero es $+5$.",
    "Paso 3, la regla de redondeo: el resultado casi nunca es entero, así que la regla se declara siempre. Hay tres habituales: al entero más cercano, truncando (descartar decimales, hacia cero) y hacia abajo (al entero menor).",
    "Con valores negativos las reglas difieren: conteo corriente $-7$ y $3$ mazos dan $-2.33$. Más cercano: $-2$. Truncando: $-2$. Hacia abajo: $-3$.",
    "Otro ejemplo: $11 / 2.5 = 4.4$. Más cercano: $4$; truncando: $4$."
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
}$naipia$::jsonb,
  13, true)
on conflict (slug) do nothing;
