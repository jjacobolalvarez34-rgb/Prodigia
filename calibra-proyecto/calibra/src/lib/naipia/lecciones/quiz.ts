import type { PreguntaLeccion } from "./tipos";

// Quiz de las 13 lecciones de Naipia. Es una copia LITERAL del quiz de
// supabase/migrations/0192_naipia_contenido.sql (el contrato de
// /api/aprender/completar valida por igualdad exacta: no se toca);
// lecciones.test.ts verifica que siga siendo idéntico al de 0192.
export const QUIZ_NAIPIA: Record<string, PreguntaLeccion[]> = {
  "naipia-tecnica-pares": [
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
  ],
  "naipia-tecnica-bloques": [
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
  ],
  "naipia-tecnica-ritmo": [
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
  ],
  "naipia-tecnica-mazo-cero": [
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
  ],
  "naipia-tecnica-neutras": [
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
  ],
  "naipia-clase-por-que-valores": [
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
  ],
  "naipia-clase-hilo": [
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
  ],
  "naipia-clase-cancelacion": [
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
  ],
  "naipia-clase-ko": [
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
  ],
  "naipia-clase-sistemas": [
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
  ],
  "naipia-clase-hiopt2": [
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
  ],
  "naipia-clase-omega2": [
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
  ],
  "naipia-clase-conteo-verdadero": [
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
};
