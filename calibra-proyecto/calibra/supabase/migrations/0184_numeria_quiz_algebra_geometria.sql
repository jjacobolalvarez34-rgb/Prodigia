-- ============================================================
-- Prodigia — Proceso 1 (docs/PLAN_REVISION_CONTENIDO.md): Numeria,
-- tercera y última tanda de quiz — las 3 técnicas de Álgebra básica
-- (0032) y las 4 de Geometría básica (0101). Mismos criterios que
-- 0182/0183: cada técnica se verificó contra src/lib/practica/
-- algebra.ts y geometria.ts (los generadores reales de /practica) y
-- contra el ejemplo numérico que ya trae cada lección — no se
-- encontró ningún error factual en ninguna de las 7 técnicas.
--
-- Contenido nuevo (no conversión de contenido viejo), así que ya usa
-- $...$ donde corresponde (ecuaciones de álgebra, π y fracciones de
-- geometría) — la conversión de los `pasos` viejos queda en la
-- migración separada 0185.
-- ============================================================

-- ---------- ÁLGEBRA ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta lección, ¿qué es una variable como x?",
    "opciones": ["Un número desconocido, pero con un valor fijo y único que se puede encontrar", "Un número que puede ser cualquier cosa a la vez", "Una letra que siempre representa 1", "Un símbolo sin ningún valor numérico"],
    "respuesta": "Un número desconocido, pero con un valor fijo y único que se puede encontrar",
    "explicacion": "x no es un misterio infinito: representa un número puntual que hace cierta la ecuación."
  },
  {
    "pregunta": "En $x + 5 = 12$, ¿cuántos valores de x hacen cierta la ecuación?",
    "opciones": ["Solo uno", "Ninguno", "Infinitos", "Exactamente dos"],
    "respuesta": "Solo uno",
    "explicacion": "Solo hay un número que hace que la cuenta cierre: x=7."
  },
  {
    "pregunta": "Resolver una ecuación significa…",
    "opciones": ["Encontrar el número que hace cierta la igualdad", "Inventar un nuevo número", "Cambiar el signo de la ecuación", "Sumar 1 a cada lado siempre"],
    "respuesta": "Encontrar el número que hace cierta la igualdad",
    "explicacion": "Es justo lo que dice la lección: despejar es encontrar ese número único."
  }
]}'::jsonb
where slug = 'que-es-una-variable';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "En $2x + 3 = 11$, ¿qué operación se le hizo a x primero y cuál después?",
    "opciones": ["Primero se multiplicó por 2, después se sumó 3", "Primero se sumó 3, después se multiplicó por 2", "Primero se dividió, después se restó", "Se hicieron las dos operaciones al mismo tiempo"],
    "respuesta": "Primero se multiplicó por 2, después se sumó 3",
    "explicacion": "Ese orden importa: a x primero se la multiplicó por 2 y después se le sumó 3."
  },
  {
    "pregunta": "Para despejar, ¿en qué orden se deshacen esas operaciones?",
    "opciones": ["En orden inverso: primero restar 3, después dividir por 2", "En el mismo orden en que se hicieron", "Dividiendo primero, restando después", "No importa el orden"],
    "respuesta": "En orden inverso: primero restar 3, después dividir por 2",
    "explicacion": "Lo último que se le hizo a x es lo primero que se deshace."
  },
  {
    "pregunta": "¿Cuánto vale x en $2x + 3 = 11$?",
    "opciones": ["4", "8", "5.5", "3"],
    "respuesta": "4",
    "explicacion": "Restando 3 en ambos lados: 2x=8; dividiendo por 2: x=4."
  }
]}'::jsonb
where slug = 'despejar-paso-a-paso';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Si despejaste x=4 en $2x+3=11$, ¿cómo verificás que está bien?",
    "opciones": ["Reemplazando x por 4 en la ecuación original", "Despejando x de nuevo desde cero", "Cambiando el signo de la ecuación", "Sumando 4 a los dos lados"],
    "respuesta": "Reemplazando x por 4 en la ecuación original",
    "explicacion": "Sustituir el valor encontrado en la ecuación original es la forma de comprobar el resultado."
  },
  {
    "pregunta": "Al sustituir x=4, ¿qué da $2(4)+3$?",
    "opciones": ["11", "8", "12", "14"],
    "respuesta": "11",
    "explicacion": "2×4=8, y 8+3=11 — coincide con el lado derecho de la ecuación original."
  },
  {
    "pregunta": "Si el resultado de sustituir NO coincide con el otro lado de la ecuación, ¿qué significa?",
    "opciones": ["Que hay que revisar el despeje, algo salió mal", "Que la ecuación no tiene solución", "Que x tiene dos valores posibles", "Que hay que sumar la diferencia a x"],
    "respuesta": "Que hay que revisar el despeje, algo salió mal",
    "explicacion": "Si no coincide, el valor de x encontrado no es correcto y hay que revisar los pasos del despeje."
  }
]}'::jsonb
where slug = 'verificar-sustituyendo';

-- ---------- GEOMETRÍA ----------

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "¿Cuáles son las 3 ternas pitagóricas base para memorizar según esta técnica?",
    "opciones": ["3-4-5, 5-12-13 y 8-15-17", "1-2-3, 4-5-6 y 7-8-9", "3-4-5 solamente", "Cualquier terna de números consecutivos"],
    "respuesta": "3-4-5, 5-12-13 y 8-15-17",
    "explicacion": "Son las 3 ternas base que menciona la lección, más sus múltiplos."
  },
  {
    "pregunta": "Un triángulo rectángulo tiene catetos 6 y 8. ¿Qué terna base reconocés multiplicada por 2?",
    "opciones": ["3-4-5", "5-12-13", "8-15-17", "6-8-10 no es múltiplo de ninguna terna base"],
    "respuesta": "3-4-5",
    "explicacion": "6=2×3 y 8=2×4, así que es la terna 3-4-5 multiplicada por 2."
  },
  {
    "pregunta": "Con esta técnica, ¿cuánto mide la hipotenusa de un triángulo con catetos 6 y 8?",
    "opciones": ["10", "14", "12", "9"],
    "respuesta": "10",
    "explicacion": "Como es 3-4-5 multiplicada por 2, la hipotenusa es 2×5=10, sin calcular ninguna raíz."
  }
]}'::jsonb
where slug = 'geometria-ternas-pitagoricas';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Para calcular el área de una figura compuesta, esta técnica dice dividirla en…",
    "opciones": ["Partes simples (como rectángulos) y calcular cada una por separado", "Triángulos siempre, sin excepción", "Una sola forma sin importar la figura", "Círculos inscritos"],
    "respuesta": "Partes simples (como rectángulos) y calcular cada una por separado",
    "explicacion": "Una figura rara casi siempre es un rectángulo grande menos (o más) uno chico."
  },
  {
    "pregunta": "Un rectángulo de 10×8 tiene una esquina de 3×2 recortada. ¿Cuál es el área del rectángulo grande?",
    "opciones": ["80", "74", "6", "24"],
    "respuesta": "80",
    "explicacion": "10×8=80 es el área del rectángulo completo, antes de restar la esquina recortada."
  },
  {
    "pregunta": "¿Cuál es el área final de esa figura (10×8 con esquina de 3×2 recortada)?",
    "opciones": ["74", "80", "6", "86"],
    "respuesta": "74",
    "explicacion": "80 (rectángulo grande) − 6 (esquina recortada, 3×2) = 74."
  }
]}'::jsonb
where slug = 'geometria-area-compuestas';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Según esta técnica, ¿cuándo conviene usar $\\dfrac{22}{7}$ en vez de 3.14 para π?",
    "opciones": ["Cuando el radio es múltiplo de 7", "Siempre, es más preciso", "Cuando el radio es par", "Nunca, 3.14 siempre es mejor"],
    "respuesta": "Cuando el radio es múltiplo de 7",
    "explicacion": "Con radios múltiplos de 7, $\\dfrac{22}{7}$ cancela el 7 del radio al cuadrado y deja cuentas exactas."
  },
  {
    "pregunta": "Para un círculo de radio 7, ¿cuánto es el área usando $\\dfrac{22}{7}$?",
    "opciones": ["154", "150", "144", "161"],
    "respuesta": "154",
    "explicacion": "$\\dfrac{22}{7} \\times 49 = 22 \\times 7 = 154$, exacto sin decimales."
  },
  {
    "pregunta": "Para un círculo de radio 5 (no múltiplo de 7), ¿qué aproximación conviene usar?",
    "opciones": ["3.14", "22/7", "3.5", "Ninguna, hay que usar π exacto"],
    "respuesta": "3.14",
    "explicacion": "5 no es múltiplo de 7, así que 3.14 sigue siendo la mejor aproximación rápida para ese caso."
  }
]}'::jsonb
where slug = 'geometria-pi-fraccion';

update public.techniques
set contenido = contenido || '{"quiz": [
  {
    "pregunta": "Dos ángulos suplementarios suman…",
    "opciones": ["180°", "90°", "360°", "45°"],
    "respuesta": "180°",
    "explicacion": "Suplementarios suman 180°; complementarios suman 90°, según esta técnica."
  },
  {
    "pregunta": "Si un ángulo suplementario mide 125°, ¿cuánto mide el otro?",
    "opciones": ["55°", "65°", "125°", "35°"],
    "respuesta": "55°",
    "explicacion": "180−125=55, tal como muestra el ejemplo de la lección."
  },
  {
    "pregunta": "¿Qué operación conviene usar para hallar el ángulo complementario o suplementario faltante?",
    "opciones": ["Restar directo del total (90° o 180°), sin necesidad de una ecuación", "Plantear siempre una ecuación con x", "Dividir el ángulo dado por 2", "Multiplicar el ángulo dado por 2"],
    "respuesta": "Restar directo del total (90° o 180°), sin necesidad de una ecuación",
    "explicacion": "La técnica evita plantear una ecuación: alcanza con restar directo del total."
  }
]}'::jsonb
where slug = 'geometria-angulos-complementarios';
