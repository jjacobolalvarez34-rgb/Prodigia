-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Numeria,
-- el mundo más grande de la revisión pedagógica de Aprender (39
-- técnicas repartidas en 9 sub-temas, sembradas en 8 migraciones
-- distintas — 0005, 0007, 0018, 0019, 0026, 0032, 0079, 0101).
--
-- Esta primera tanda cubre las 22 técnicas de aritmética básica (suma,
-- resta, multiplicación, división — incluidas las 8 técnicas
-- "avanzadas" de números grandes de 0101, orden >= 100). Cada dato
-- numérico citado en las preguntas se verificó de nuevo a mano contra
-- el ejemplo real de cada lección (ej. 37×11=407, 98×97=9506,
-- 100−63=37) — no se encontró NINGÚN error factual en ninguna de las
-- 22 técnicas de este grupo.
--
-- Nunca se editan las migraciones viejas (0005/0007/0018/0101): el
-- quiz se agrega encima con un update por slug, igual que en
-- 0172-0179. Sin notación LaTeX en este archivo (aritmética básica es
-- casi toda texto plano) — la única excepción real,
-- 'cuadrado-terminado-en-5' (tiene "35²" real), sí usa $...$ en su
-- quiz porque es contenido NUEVO (no una conversión de contenido
-- viejo, que es lo que separa la migración de notación 0185).
-- ============================================================

-- ---------- SUMA ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Usando complemento a 10, para sumar 8 + 5, ¿cuánto le falta al 8 para llegar a 10?",
    "opciones": ["2", "3", "5", "8"],
    "respuesta": "2",
    "explicacion": "8 está a 2 de 10 (8+2=10)."
  },
  {
    "pregunta": "Después de completar la decena, ¿qué queda por sumar en 8 + 5?",
    "opciones": ["3", "2", "5", "10"],
    "respuesta": "3",
    "explicacion": "Del 5 ya usaste 2 para completar la decena; quedan 5−2=3."
  },
  {
    "pregunta": "Aplicando complemento a 10, ¿cuánto es 8 + 5?",
    "opciones": ["13", "12", "15", "10"],
    "respuesta": "13",
    "explicacion": "10 + 3 = 13, el mismo resultado que sumar directo."
  }
]}'::jsonb
where slug = 'complemento-a-10';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para sumar 47 + 38 redondeando a la decena, ¿a qué número redondeás 38?",
    "opciones": ["40", "30", "50", "38"],
    "respuesta": "40",
    "explicacion": "38 está más cerca de 40 que de 30, así que se redondea a 40."
  },
  {
    "pregunta": "Si redondeaste 38 a 40, ¿cuánto sumaste de más?",
    "opciones": ["2", "3", "8", "40"],
    "respuesta": "2",
    "explicacion": "40 − 38 = 2: eso es lo que hay que restar al final para compensar."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 47 + 38?",
    "opciones": ["85", "87", "83", "89"],
    "respuesta": "85",
    "explicacion": "47+40=87, y como sumaste 2 de más, 87−2=85."
  }
]}'::jsonb
where slug = 'redondear-decena';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Sumando por la izquierda, ¿qué posición sumás primero?",
    "opciones": ["Las centenas (la más grande)", "Las unidades (la más chica)", "Las decenas primero, siempre", "Cualquiera, no importa el orden"],
    "respuesta": "Las centenas (la más grande)",
    "explicacion": "La técnica suma de mayor a menor posición: centenas, luego decenas, luego unidades."
  },
  {
    "pregunta": "Para 456 + 327, ¿cuánto da la suma de las centenas (4+3)?",
    "opciones": ["700", "70", "7", "800"],
    "respuesta": "700",
    "explicacion": "4 centenas + 3 centenas = 7 centenas = 700, tal como muestra la lección."
  },
  {
    "pregunta": "Siguiendo el ejemplo de la lección (456 + 327), ¿cuál es el resultado final?",
    "opciones": ["783", "770", "790", "813"],
    "respuesta": "783",
    "explicacion": "700 (centenas) + 70 (decenas) + 13 (unidades) = 783."
  }
]}'::jsonb
where slug = 'sumar-por-la-izquierda';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para sumar 48 + 51 con esta técnica, ¿qué número duplicás?",
    "opciones": ["48 (el más chico)", "51 (el más grande)", "El promedio de los dos", "99 (el resultado)"],
    "respuesta": "48 (el más chico)",
    "explicacion": "La técnica dice: elegí el número más chico y duplicalo."
  },
  {
    "pregunta": "¿Cuál es la diferencia entre 51 y 48 que hay que ajustar?",
    "opciones": ["3", "2", "48", "51"],
    "respuesta": "3",
    "explicacion": "51 − 48 = 3, esa es la diferencia que se le suma al doble."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 48 + 51?",
    "opciones": ["99", "96", "102", "93"],
    "respuesta": "99",
    "explicacion": "48+48=96, y sumando la diferencia de 3, 96+3=99."
  }
]}'::jsonb
where slug = 'duplicar-y-ajustar';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Esta técnica extiende, ¿qué idea a números de 4 o 5 dígitos?",
    "opciones": ["Separar por posición y sumar cada una por separado, igual que el complemento a 10 pero en columnas", "Redondear siempre a la centena más cercana", "Multiplicar en vez de sumar", "Ignorar las unidades si el número es muy grande"],
    "respuesta": "Separar por posición y sumar cada una por separado, igual que el complemento a 10 pero en columnas",
    "explicacion": "Es la misma lógica de sumar por columnas, aplicada ahora a miles, centenas, decenas y unidades."
  },
  {
    "pregunta": "Si al sumar una posición el resultado da 10 o más, ¿qué pasa?",
    "opciones": ["Esa parte se \"lleva\" a la posición siguiente", "Se descarta el excedente", "Hay que empezar de nuevo desde las unidades", "El resultado queda mal automáticamente"],
    "respuesta": "Esa parte se \"lleva\" a la posición siguiente",
    "explicacion": "El acarreo pasa a la posición siguiente, la misma idea del complemento a 10 pero en cadena."
  }
]}'::jsonb
where slug = 'sumar-por-posicion-numeros-grandes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para estimar antes de sumar 4827 con otro número, ¿a qué se redondea primero 4827?",
    "opciones": ["5000 (a su posición más alta)", "4800", "4830", "5827"],
    "respuesta": "5000 (a su posición más alta)",
    "explicacion": "Se redondea a la posición más alta del número: 4827 redondea a 5000 (miles)."
  },
  {
    "pregunta": "¿Para qué sirve la estimación en esta técnica?",
    "opciones": ["Para detectar si el resultado exacto está muy lejos de lo esperado y avisar de un error", "Para reemplazar el cálculo exacto siempre", "Para redondear el resultado final", "Para evitar sumar las unidades"],
    "respuesta": "Para detectar si el resultado exacto está muy lejos de lo esperado y avisar de un error",
    "explicacion": "Es un chequeo rápido: si el resultado real está muy lejos de la estimación, probablemente hubo un error en algún paso."
  }
]}'::jsonb
where slug = 'estimar-antes-de-sumar-grande';

-- ---------- RESTA ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para restar 82 − 47 con esta técnica, ¿a qué redondeás 47?",
    "opciones": ["50", "40", "45", "82"],
    "respuesta": "50",
    "explicacion": "47 se redondea al 50 más cercano para simplificar la resta."
  },
  {
    "pregunta": "Si redondeaste 47 a 50, ¿restaste de más o de menos, y cuánto?",
    "opciones": ["De más, por 3", "De menos, por 3", "De más, por 7", "Ni de más ni de menos"],
    "respuesta": "De más, por 3",
    "explicacion": "50 es 3 más que 47, así que restaste 3 de más y hay que devolver esos 3 al resultado."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 82 − 47?",
    "opciones": ["35", "32", "38", "29"],
    "respuesta": "35",
    "explicacion": "82−50=32, y como restaste 3 de más, 32+3=35."
  }
]}'::jsonb
where slug = 'resta-compensacion';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para restar 100 − 63 con complemento a 100, ¿de qué número se resta el primer dígito (6)?",
    "opciones": ["De 9", "De 10", "De 6", "De 3"],
    "respuesta": "De 9",
    "explicacion": "Todos los dígitos se restan de 9, excepto el último, que se resta de 10."
  },
  {
    "pregunta": "¿De qué número se resta el último dígito (3)?",
    "opciones": ["De 10", "De 9", "De 100", "De 3"],
    "respuesta": "De 10",
    "explicacion": "El último dígito es la única excepción: se resta de 10, no de 9."
  },
  {
    "pregunta": "Aplicando la técnica, ¿cuánto es 100 − 63?",
    "opciones": ["37", "33", "47", "27"],
    "respuesta": "37",
    "explicacion": "9−6=3 (primer dígito) y 10−3=7 (último dígito) → 37."
  }
]}'::jsonb
where slug = 'complemento-a-100';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "En esta técnica, si el dígito de arriba es más chico que el de abajo en una posición, ¿qué se hace?",
    "opciones": ["Se \"pide prestado\" 1 a la posición siguiente", "Se resta al revés (abajo menos arriba)", "Se pone un 0 en esa posición", "Se redondea todo el número"],
    "respuesta": "Se \"pide prestado\" 1 a la posición siguiente",
    "explicacion": "Es la misma idea de pedir prestado de las restas chicas, ahora encadenada entre varias posiciones."
  },
  {
    "pregunta": "¿Puede la técnica de pedir prestado encadenarse varias veces seguidas?",
    "opciones": ["Sí, si varias posiciones seguidas lo necesitan", "No, solo puede pasar una vez por resta", "No, eso significa que la resta está mal planteada", "Solo si el número tiene menos de 3 dígitos"],
    "respuesta": "Sí, si varias posiciones seguidas lo necesitan",
    "explicacion": "El préstamo puede encadenarse posición tras posición, tal como describe la lección."
  }
]}'::jsonb
where slug = 'restar-por-posicion-numeros-grandes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para restar usando 6850, esta técnica sugiere pensar en qué número redondo?",
    "opciones": ["7000", "6800", "6900", "6000"],
    "respuesta": "7000",
    "explicacion": "Es el ejemplo de la lección: 6850 se completa hasta el redondo más cercano, 7000."
  },
  {
    "pregunta": "Si usás 7000 en vez de 6850, ¿qué ajuste final hay que hacer?",
    "opciones": ["Sumar 150 de vuelta al resultado", "Restar 150 del resultado", "No hace falta ajustar nada", "Multiplicar el resultado por 150"],
    "respuesta": "Sumar 150 de vuelta al resultado",
    "explicacion": "7000 − 6850 = 150; como restaste de más usando el número redondo, hay que sumar esa diferencia de vuelta."
  }
]}'::jsonb
where slug = 'restar-completando-al-redondo-mas-cercano';

-- ---------- MULTIPLICACIÓN ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar 37 × 11 con esta técnica, ¿qué se hace primero con los dígitos de 37?",
    "opciones": ["Separarlos: 3 y 7, dejando un espacio en el medio", "Sumarlos y multiplicarlos por 11", "Multiplicarlos entre sí", "Restarlos"],
    "respuesta": "Separarlos: 3 y 7, dejando un espacio en el medio",
    "explicacion": "El truco separa los dígitos del número (3_7) y usa el espacio del medio para el resultado de la suma."
  },
  {
    "pregunta": "¿Qué se coloca en el espacio del medio?",
    "opciones": ["La suma de los dos dígitos (3+7=10)", "La resta de los dos dígitos", "El dígito más grande", "Un cero siempre"],
    "respuesta": "La suma de los dos dígitos (3+7=10)",
    "explicacion": "3+7=10 va en el medio; como pasa de 9, se acarrea el 1 al primer dígito."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 37 × 11?",
    "opciones": ["407", "370", "417", "307"],
    "respuesta": "407",
    "explicacion": "3+7=10, se lleva el 1 al primer dígito (3+1=4), queda 4_0_7 = 407."
  }
]}'::jsonb
where slug = 'x11-segundo';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar 48 × 5, esta técnica dice multiplicar primero por…",
    "opciones": ["10", "2", "5", "100"],
    "respuesta": "10",
    "explicacion": "×5 se calcula como ×10 y después dividiendo el resultado a la mitad."
  },
  {
    "pregunta": "Después de 48 × 10 = 480, ¿qué operación falta?",
    "opciones": ["Dividir 480 por 2", "Multiplicar 480 por 2", "Restarle 10 a 480", "Sumarle 5 a 480"],
    "respuesta": "Dividir 480 por 2",
    "explicacion": "Dividir a la mitad el resultado de ×10 da el resultado de ×5."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 48 × 5?",
    "opciones": ["240", "480", "96", "24"],
    "respuesta": "240",
    "explicacion": "48×10=480, y 480÷2=240."
  }
]}'::jsonb
where slug = 'x5-mitad-de-x10';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para calcular $35^2$ con esta técnica, ¿qué se hace con el dígito de las decenas (3)?",
    "opciones": ["Multiplicarlo por sí mismo más uno: $3 \\times 4$", "Multiplicarlo por 5", "Sumarle 25", "Elevarlo al cuadrado directamente"],
    "respuesta": "Multiplicarlo por sí mismo más uno: $3 \\times 4$",
    "explicacion": "El dígito de las decenas se multiplica por el siguiente número: $3 \\times 4 = 12$."
  },
  {
    "pregunta": "¿Qué se le pega al final del resultado de esa multiplicación?",
    "opciones": ["\"25\"", "\"05\"", "El mismo número original", "Nada, ya está completo"],
    "respuesta": "\"25\"",
    "explicacion": "Todo cuadrado de un número terminado en 5 termina en 25 — se le pega \"25\" al resultado de $3\\times4$."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es $35^2$?",
    "opciones": ["1225", "1025", "1250", "925"],
    "respuesta": "1225",
    "explicacion": "$3\\times4=12$, pegale \"25\" → $35^2=1225$."
  }
]}'::jsonb
where slug = 'cuadrado-terminado-en-5';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar 47 × 9, esta técnica dice multiplicar primero por…",
    "opciones": ["10", "9", "8", "11"],
    "respuesta": "10",
    "explicacion": "×9 se calcula como ×10 y después restando el número original."
  },
  {
    "pregunta": "Después de 47 × 10 = 470, ¿qué se resta?",
    "opciones": ["El número original, 47", "9", "10", "470"],
    "respuesta": "El número original, 47",
    "explicacion": "×9 = ×10 menos el número, así que se resta el 47 original."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 47 × 9?",
    "opciones": ["423", "470", "433", "413"],
    "respuesta": "423",
    "explicacion": "47×10=470, y 470−47=423."
  }
]}'::jsonb
where slug = 'x9-es-x10-menos-el-numero';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar 98 × 97 con el método de bases, ¿qué se calcula primero?",
    "opciones": ["Cuánto le falta a cada número para llegar a 100 (2 y 3)", "El promedio de los dos números", "La suma de los dos números", "El cuadrado de cada número"],
    "respuesta": "Cuánto le falta a cada número para llegar a 100 (2 y 3)",
    "explicacion": "98 le falta 2 para 100, y 97 le falta 3 — esos complementos son la base del método."
  },
  {
    "pregunta": "¿Cómo se obtienen las últimas dos cifras del resultado?",
    "opciones": ["Multiplicando los complementos entre sí (2×3=06)", "Sumando los complementos", "Restando los complementos", "Multiplicando los números originales"],
    "respuesta": "Multiplicando los complementos entre sí (2×3=06)",
    "explicacion": "2×3=06 son las dos últimas cifras del resultado final."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 98 × 97?",
    "opciones": ["9506", "9406", "9606", "8506"],
    "respuesta": "9506",
    "explicacion": "98−3=95 (primeras cifras) y 2×3=06 (últimas cifras) → 9506."
  }
]}'::jsonb
where slug = 'numeros-cercanos-a-100';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar 37 × 4 con esta técnica, ¿qué operación se repite?",
    "opciones": ["Duplicar (multiplicar por 2), dos veces", "Multiplicar por 4 directamente", "Dividir por 2, dos veces", "Sumar 4 al número"],
    "respuesta": "Duplicar (multiplicar por 2), dos veces",
    "explicacion": "×4 es duplicar el número y volver a duplicar el resultado."
  },
  {
    "pregunta": "Si duplicás 37 una vez, ¿qué te da?",
    "opciones": ["74", "148", "37", "111"],
    "respuesta": "74",
    "explicacion": "37×2=74 — el primer duplicado, antes de volver a duplicar."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 37 × 4?",
    "opciones": ["148", "144", "152", "111"],
    "respuesta": "148",
    "explicacion": "37×2=74, y 74×2=148."
  }
]}'::jsonb
where slug = 'x4-duplicar-dos-veces';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para multiplicar por partes, ¿cómo se separa un factor como 234?",
    "opciones": ["En centenas + decenas + unidades: 200+30+4", "En 2+3+4", "En par e impar", "En su mitad y su doble"],
    "respuesta": "En centenas + decenas + unidades: 200+30+4",
    "explicacion": "234 = 200 + 30 + 4, la propiedad distributiva aplicada a cada parte."
  },
  {
    "pregunta": "Después de separar el factor, ¿qué se hace con el otro factor?",
    "opciones": ["Multiplicarlo por cada parte por separado y sumar los resultados", "Sumarlo a cada parte", "Ignorarlo", "Dividirlo entre las partes"],
    "respuesta": "Multiplicarlo por cada parte por separado y sumar los resultados",
    "explicacion": "Cada multiplicación parcial (por 200, por 30, por 4) es más simple, y se suman al final."
  }
]}'::jsonb
where slug = 'multiplicar-por-partes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Si uno de los factores es 98, ¿a qué se redondea con esta técnica?",
    "opciones": ["100", "90", "95", "98"],
    "respuesta": "100",
    "explicacion": "98 se redondea al número redondo más cercano, 100, para simplificar la cuenta."
  },
  {
    "pregunta": "Si redondeaste 98 a 100, ¿te pasaste o te quedaste corto, y por cuánto (en veces del otro factor)?",
    "opciones": ["Te pasaste, por 2 veces el otro factor", "Te quedaste corto, por 2 veces el otro factor", "Te pasaste, por 100 veces el otro factor", "No hay diferencia"],
    "respuesta": "Te pasaste, por 2 veces el otro factor",
    "explicacion": "100 es 2 más que 98, así que el resultado con 100 queda 2 veces el otro factor por encima del real."
  }
]}'::jsonb
where slug = 'multiplicar-redondeando-primero';

-- ---------- DIVISIÓN ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para saber si 471 es divisible por 3, ¿qué se calcula primero?",
    "opciones": ["La suma de sus dígitos: 4+7+1", "El resto de dividir por 3", "La mitad de 471", "El cuadrado de 471"],
    "respuesta": "La suma de sus dígitos: 4+7+1",
    "explicacion": "La regla de divisibilidad por 3 se basa en sumar los dígitos del número."
  },
  {
    "pregunta": "Si esa suma de dígitos es múltiplo de 3, ¿qué se concluye?",
    "opciones": ["Que el número original también es divisible por 3", "Que el número original es par", "Que el número original es primo", "Nada, hay que dividir igual para confirmar"],
    "respuesta": "Que el número original también es divisible por 3",
    "explicacion": "Es la regla completa: si la suma de dígitos es múltiplo de 3, el número original lo es también, sin necesidad de dividir."
  },
  {
    "pregunta": "Según esta regla, ¿471 es divisible por 3?",
    "opciones": ["Sí, porque 4+7+1=12 es múltiplo de 3", "No, porque 471 es impar", "Sí, porque 471 termina en 1", "No, porque 12 no es múltiplo de 3"],
    "respuesta": "Sí, porque 4+7+1=12 es múltiplo de 3",
    "explicacion": "4+7+1=12, y 12 es múltiplo de 3, así que 471 también lo es (471÷3=157)."
  }
]}'::jsonb
where slug = 'divisibilidad-por-3';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para dividir 84 ÷ 5 con esta técnica, ¿qué se hace primero?",
    "opciones": ["Multiplicar 84 por 2", "Dividir 84 por 2", "Multiplicar 84 por 10", "Sumarle 5 a 84"],
    "respuesta": "Multiplicar 84 por 2",
    "explicacion": "÷5 es ×2 y correr el punto: primero se multiplica por 2."
  },
  {
    "pregunta": "Después de 84 × 2 = 168, ¿qué se hace para terminar?",
    "opciones": ["Correr el punto decimal un lugar a la izquierda (dividir por 10)", "Correr el punto decimal un lugar a la derecha", "Dividir por 5 de nuevo", "Restarle 2"],
    "respuesta": "Correr el punto decimal un lugar a la izquierda (dividir por 10)",
    "explicacion": "168 dividido por 10 (corriendo el punto) da 16.8, el resultado final."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 84 ÷ 5?",
    "opciones": ["16.8", "33.6", "8.4", "42"],
    "respuesta": "16.8",
    "explicacion": "84×2=168, y corriendo el punto un lugar: 16.8."
  }
]}'::jsonb
where slug = 'dividir-por-5';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para dividir 288 ÷ 12 por partes, ¿qué se busca primero?",
    "opciones": ["El múltiplo de 12 más grande y fácil que sea menor o igual a 288 (por ejemplo 12×20=240)", "El resto de la división directamente", "La mitad de 288", "Un número cualquiera para restar"],
    "respuesta": "El múltiplo de 12 más grande y fácil que sea menor o igual a 288 (por ejemplo 12×20=240)",
    "explicacion": "Se busca un múltiplo cómodo del divisor, como 12×20=240, para simplificar la cuenta."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto es 288 ÷ 12?",
    "opciones": ["24", "20", "28", "22"],
    "respuesta": "24",
    "explicacion": "288−240=48, y 48÷12=4; sumando los cocientes parciales: 20+4=24."
  }
]}'::jsonb
where slug = 'dividir-numeros-grandes-por-partes';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Para qué sirve estimar el cociente antes de dividir un número grande?",
    "opciones": ["Para tener una idea del orden de magnitud del resultado y evitar errores grandes", "Para reemplazar la división exacta siempre", "Para redondear el divisor", "Para saber si el número es par o impar"],
    "respuesta": "Para tener una idea del orden de magnitud del resultado y evitar errores grandes",
    "explicacion": "Saber más o menos cuántas cifras tendrá el resultado ayuda a detectar errores grandes antes de terminar."
  },
  {
    "pregunta": "Si al probar un cociente, la multiplicación por el divisor se pasa del dividendo, ¿qué hay que hacer?",
    "opciones": ["Bajar el cociente probado", "Subir el cociente probado", "Cambiar el divisor", "Empezar de nuevo con otro dividendo"],
    "respuesta": "Bajar el cociente probado",
    "explicacion": "Si te pasaste del dividendo, el cociente probado es demasiado alto — hay que bajarlo y probar de nuevo."
  }
]}'::jsonb
where slug = 'estimar-el-cociente-grande';
