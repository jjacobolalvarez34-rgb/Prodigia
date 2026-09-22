-- ============================================================
-- Prodigia — Numeria: apartado visual para las 39 Técnicas rápidas
-- (pedido explícito del usuario 2026-09-22, tras probar las Clases con
-- tablero animado: "revisa TODAS [las técnicas] y colócales su apartado
-- visual" — a diferencia de las 5 Clases de 0199, que ya nacieron con
-- visuales, estas técnicas eran solo texto desde 0007/0018/0019/0026/
-- 0032/0079/0101). Reescribe `pasos` (introducción corta, en español
-- neutro) y agrega `visuales` (el truco EN ACCIÓN con un ejemplo real);
-- `quiz` (agregado en 0182/0183/0184) y el resto de la fila (nombre,
-- descripcion, orden, requiere_pro) NO se tocan — jsonb_set reemplaza
-- solo esas dos claves de `contenido`, mismo patrón que 0185.
--
-- Reusa los primitivos ya existentes de Numeria (numeria.columnas/
-- multiplicacion/division/mcm/fraccion) donde el truco calza con ese
-- algoritmo, y agrega 4 primitivos nuevos para lo que no tenía uno:
-- numeria.recta (Decimales, recta numérica), numeria.potencia
-- (Potencias, cadena de multiplicación o cuadrícula de área),
-- numeria.balanza (Álgebra, ecuación de un paso) y numeria.figura
-- (Geometría, triángulo/rectángulo compuesto/círculo/ángulos) — ver
-- src/components/numeria/visuales/. El resto usa el primitivo genérico
-- `cuadros` para razonamientos numéricos paso a paso puntuales.
--
-- Este archivo se GENERA desde src/lib/numeria/lecciones/tecnicas.ts
-- (fuente única; todo número sale de src/lib/numeria/visualesDatos.ts) y
-- tecnicas.test.ts comprueba que coincida. No editar a mano. Regenerar:
-- NUMERIA_TECNICAS_ESCRIBIR_SQL=1 npx vitest run src/lib/numeria/lecciones/tecnicas.test.ts
-- ============================================================

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Cuando un sumando está a poca distancia de una decena, completa esa decena primero y suma el resto después.",
  "Con $8 + 5$: al $8$ le faltan $2$ para llegar a $10$. Ese $2$ sale del $5$, así que quedan $3$ por sumar."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "$8 + 5$: al $8$ le faltan $2$ para llegar a $10$"
      },
      {
        "formula": "8 + 2 = 10"
      },
      {
        "texto": "Quedan $3$ del $5$ (ya usaste $2$)"
      },
      {
        "formula": "10 + 3 = 13",
        "resaltar": "8 + 5 = 13"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'complemento-a-10';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Redondea el número más difícil a la decena más cercana, suma, y corrige el ajuste al final.",
  "Con $47 + 38$: redondea $38$ a $40$, suma, y después resta lo que sobró de más."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "$47 + 38$: redondea $38$ a $40$"
      },
      {
        "formula": "47 + 40 = 87"
      },
      {
        "texto": "Se sumó $2$ de más ($40$ en vez de $38$)"
      },
      {
        "formula": "87 - 2 = 85",
        "resaltar": "47 + 38 = 85"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'redondear-decena';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Suma de mayor a menor posición (centenas, decenas, unidades) en vez de empezar por las unidades.",
  "Con $456 + 327$: primero las centenas, después las decenas, y las unidades al final."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Suma las centenas: 4 + 3 = 7 → 700"
      },
      {
        "texto": "Suma las decenas: 5 + 2 = 7 → 700 + 70 = 770"
      },
      {
        "texto": "Suma las unidades: 6 + 7 = 13",
        "resaltar": "770 + 13 = 783"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'sumar-por-la-izquierda';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para dos números casi iguales, duplica el más chico y ajusta por la diferencia.",
  "Con $48 + 51$: duplica el más chico ($48$) y suma la diferencia con el otro."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "48 + 48 = 96"
      },
      {
        "texto": "La diferencia entre $51$ y $48$ es $3$"
      },
      {
        "formula": "96 + 3 = 99",
        "resaltar": "48 + 51 = 99"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'duplicar-y-ajustar';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Con 4 o 5 dígitos, sumar todo junto de una se presta a errores — separar por posición lo hace manejable.",
  "Es la misma idea del complemento a 10, columna por columna, solo que con números más largos."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.columnas",
    "operacion": "suma",
    "a": 4827,
    "b": 3956,
    "despuesDePaso": 1,
    "titulo": "4827 + 3956, posición por posición"
  }
]$numeria$::jsonb
)
where slug = 'sumar-por-posicion-numeros-grandes';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Una estimación rápida avisa si hay un error antes de confiar en el resultado exacto.",
  "Redondea cada número a su posición más alta, suma esos redondeos, y compara con el resultado real."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Redondea cada número: $4827$ → $5000$, y $3956$ → $4000$"
      },
      {
        "formula": "5000 + 4000 = 9000",
        "resaltar": "Estimación: 9000"
      },
      {
        "texto": "Ahora suma los números reales, posición por posición: $4827 + 3956 = 8783$"
      },
      {
        "resaltar": "Resultado real: 8783 (cerca de la estimación de 9000)"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'estimar-antes-de-sumar-grande';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para restar, redondea el número que se resta a la decena y ajusta el resultado al final.",
  "Con $82 - 47$: redondea $47$ a $50$, resta, y devuelve el ajuste."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "$82 - 47$: redondea $47$ a $50$"
      },
      {
        "formula": "82 - 50 = 32"
      },
      {
        "texto": "Se restó $3$ de más ($50$ en vez de $47$)"
      },
      {
        "formula": "32 + 3 = 35",
        "resaltar": "82 - 47 = 35"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'resta-compensacion';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para restar de un número redondo como 100, cada dígito se resta de 9 excepto el último, que se resta de 10.",
  "Con $100 - 63$: el primer dígito se resta de $9$ y el último de $10$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Resta cada dígito de 9, excepto el último, que se resta de 10"
      },
      {
        "formula": "9 - 6 = 3"
      },
      {
        "formula": "10 - 3 = 7",
        "resaltar": "100 - 63 = 37"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'complemento-a-100';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "La misma idea de \"pedir prestado\" de restas chicas, encadenada a través de varias posiciones.",
  "Se resta de derecha a izquierda, y el préstamo puede encadenarse varias veces seguidas."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.columnas",
    "operacion": "resta",
    "a": 8241,
    "b": 3956,
    "despuesDePaso": 1,
    "titulo": "8241 - 3956, pidiendo prestado"
  }
]$numeria$::jsonb
)
where slug = 'restar-por-posicion-numeros-grandes';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para números grandes, a veces es más rápido \"completar\" hasta el redondo más cercano que restar directo.",
  "El paso que más se olvida es el ajuste final — sin él, el resultado queda desviado exactamente por esa diferencia."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Para $9241 - 6850$, usa el redondo más cercano a $6850$: $7000$"
      },
      {
        "formula": "9241 - 7000 = 2241"
      },
      {
        "texto": "Ajusta sumando la diferencia entre $7000$ y $6850$: $7000 - 6850 = 150$"
      },
      {
        "formula": "2241 + 150 = 2391",
        "resaltar": "9241 - 6850 = 2391"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'restar-completando-al-redondo-mas-cercano';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Separa los dígitos del número, súmalos, y coloca ese resultado en el medio (con acarreo si pasa de 9).",
  "Con $37 \\times 11$: separa los dígitos $3$ y $7$, y súmalos."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "$37 \\times 11$: separa los dígitos: $3$ _ $7$"
      },
      {
        "formula": "3 + 7 = 10"
      },
      {
        "texto": "Como pasa de 9, se lleva el 1: $(3+1)\\ 0\\ 7$"
      },
      {
        "formula": "37 \\times 11 = 407",
        "resaltar": "37 × 11 = 407"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'x11-segundo';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Multiplicar por 10 es agregar un cero. Multiplicar por 5 es hacer eso y dividir a la mitad.",
  "Con $48 \\times 5$: multiplica por $10$ primero y divide el resultado a la mitad."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "48 \\times 10 = 480"
      },
      {
        "texto": "Divide ese resultado a la mitad"
      },
      {
        "formula": "480 \\div 2 = 240",
        "resaltar": "48 × 5 = 240"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'x5-mitad-de-x10';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para elevar al cuadrado un número que termina en 5: toma el dígito de las decenas, multiplícalo por sí mismo más uno, y agrega 25 al final."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 0,
    "cuadros": [
      {
        "texto": "$35^2$: el dígito de las decenas es $3$"
      },
      {
        "formula": "3 \\times 4 = 12"
      },
      {
        "texto": "Agrega \"25\" al final"
      },
      {
        "formula": "35^2 = 1225",
        "resaltar": "35² = 1225"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'cuadrado-terminado-en-5';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Multiplicar por 9 es multiplicar por 10 y restarle el número original.",
  "Con $47 \\times 9$: multiplica por $10$ y resta $47$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "47 \\times 10 = 470"
      },
      {
        "formula": "470 - 47 = 423",
        "resaltar": "47 × 9 = 423"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'x9-es-x10-menos-el-numero';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Método de bases: usa cuánto le falta a cada número para llegar a 100.",
  "Con $98 \\times 97$: los complementos son $2$ y $3$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Complemento a 100: $98 \\to 2$, $97 \\to 3$"
      },
      {
        "formula": "98 - 3 = 95"
      },
      {
        "formula": "2 \\times 3 = 6"
      },
      {
        "resaltar": "98 × 97 = 9506 = 9506"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'numeros-cercanos-a-100';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Multiplicar por 4 es duplicar el número y volver a duplicar el resultado.",
  "Con $37 \\times 4$: duplica dos veces seguidas."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "37 \\times 2 = 74"
      },
      {
        "formula": "74 \\times 2 = 148",
        "resaltar": "37 × 4 = 148"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'x4-duplicar-dos-veces';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Separar un factor en centenas + decenas + unidades convierte una multiplicación grande en varias chicas.",
  "Con $234 \\times 6$: separa $234$ en $200 + 30 + 4$ y multiplica cada parte."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "200 \\times 6 = 1200"
      },
      {
        "formula": "30 \\times 6 = 180"
      },
      {
        "formula": "4 \\times 6 = 24"
      },
      {
        "formula": "1200 + 180 + 24 = 1404",
        "resaltar": "234 × 6 = 1404"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'multiplicar-por-partes';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Redondear un factor, multiplicar, y ajustar después suele ser más rápido que multiplicar el número real de una.",
  "Con $98 \\times 47$: redondea $98$ a $100$ y ajusta la diferencia."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "100 \\times 47 = 4700"
      },
      {
        "texto": "Te pasaste por $2$ veces $47$"
      },
      {
        "formula": "2 \\times 47 = 94"
      },
      {
        "formula": "4700 - 94 = 4606",
        "resaltar": "98 × 47 = 4606"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'multiplicar-redondeando-primero';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Suma los dígitos del número; si esa suma es múltiplo de 3, el número original también lo es.",
  "Con $471$: la suma de los dígitos es $12$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "4 + 7 + 1 = 12"
      },
      {
        "texto": "Si esa suma es múltiplo de 3, el número original también lo es"
      },
      {
        "resaltar": "12 es múltiplo de 3 → 471 es divisible por 3"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'divisibilidad-por-3';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Dividir por 5 es multiplicar por 2 y correr el punto decimal un lugar.",
  "Con $84 \\div 5$: multiplica por $2$ y corre el punto."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "84 \\times 2 = 168"
      },
      {
        "texto": "Corre el punto decimal un lugar a la izquierda (divide por 10)"
      },
      {
        "formula": "168 \\div 10 = 16.8",
        "resaltar": "84 ÷ 5 = 16.8"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'dividir-por-5';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Separar el dividendo en un múltiplo cómodo del divisor más un resto simplifica divisiones grandes.",
  "Con $288 \\div 12$: busca el múltiplo cómodo más grande y divide lo que sobra."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "12 \\times 20 = 240"
      },
      {
        "formula": "288 - 240 = 48"
      },
      {
        "formula": "48 \\div 12 = 4"
      },
      {
        "formula": "20 + 4 = 24",
        "resaltar": "288 ÷ 12 = 24"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'dividir-numeros-grandes-por-partes';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Saber más o menos cuántas cifras va a tener el resultado evita errores grandes al dividir.",
  "Una estimación rápida con el número redondeado da una referencia antes de dividir de verdad."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "Redondea el dividendo: $8916 \\to 9000$"
      },
      {
        "formula": "9000 \\div 4 = 2250",
        "resaltar": "Estimación: 2250"
      },
      {
        "formula": "8916 \\div 4 = 2229",
        "resaltar": "Resultado real: 2229 (cerca de la estimación)"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'estimar-el-cociente-grande';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Cuando dos fracciones tienen el mismo denominador, suma los numeradores y deja el denominador igual."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.fraccion",
    "operacion": "suma",
    "num1": 1,
    "den1": 5,
    "num2": 2,
    "den2": 5,
    "despuesDePaso": 0,
    "titulo": "1/5 + 2/5"
  }
]$numeria$::jsonb
)
where slug = 'sumar-fracciones-igual-denominador';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Encuentra el número más grande que divide exacto al numerador y al denominador, y divide ambos por él.",
  "Con $\\dfrac{8}{12}$: el máximo común divisor es $4$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "\\text{MCD}(8,12) = 4"
      },
      {
        "formula": "8 \\div 4 = 2"
      },
      {
        "formula": "12 \\div 4 = 3",
        "resaltar": "\\dfrac{8}{12} = \\dfrac{2}{3}"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'simplificar-con-mcd';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para sumar fracciones con denominadores distintos, primero se convierten a un denominador común.",
  "Con $\\dfrac{1}{4} + \\dfrac{1}{6}$: el mínimo común múltiplo de los denominadores es $12$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.mcm",
    "a": 4,
    "b": 6,
    "despuesDePaso": 1,
    "titulo": "MCM de 4 y 6"
  },
  {
    "tipo": "numeria.fraccion",
    "operacion": "suma",
    "num1": 1,
    "den1": 4,
    "num2": 1,
    "den2": 6,
    "despuesDePaso": 1,
    "titulo": "1/4 + 1/6 con denominador común"
  }
]$numeria$::jsonb
)
where slug = 'minimo-comun-denominador';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para saber cuál fracción es más grande sin buscar denominador común, se multiplica en cruz.",
  "Con $\\dfrac{3}{4}$ y $\\dfrac{4}{5}$: multiplica cada numerador por el denominador de la otra."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "formula": "3 \\times 5 = 15"
      },
      {
        "formula": "4 \\times 4 = 16"
      },
      {
        "resaltar": "15 < 16 → \\dfrac{3}{4} < \\dfrac{4}{5}"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'comparar-con-producto-cruzado';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Un decimal no es más que el resultado de dividir el numerador por el denominador.",
  "$\\dfrac{3}{4}$ dividido da $0.75$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.recta",
    "despuesDePaso": 1,
    "min": 0,
    "max": 1,
    "marcas": [
      {
        "valor": 0.75,
        "etiqueta": "$\\dfrac{3}{4} = 0.75$"
      }
    ],
    "titulo": "3/4 en la recta numérica"
  }
]$numeria$::jsonb
)
where slug = 'convertir-fraccion-decimal';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para calcular X% de un número, convierte el porcentaje a decimal (÷100) y multiplica.",
  "El $15\\%$ de $200$ es $0.15 \\times 200 = 30$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.recta",
    "despuesDePaso": 1,
    "min": 0,
    "max": 1,
    "marcas": [
      {
        "valor": 0.15,
        "etiqueta": "$15\\% = 0.15$"
      }
    ],
    "titulo": "15% de 200 = 30"
  }
]$numeria$::jsonb
)
where slug = 'porcentaje-como-decimal';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para redondear a N lugares, mira el dígito que sigue: 5 o más, sube; menos de 5, se queda igual.",
  "Redondeando $3.14159$ a $2$ decimales: el tercer decimal es $1$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.recta",
    "despuesDePaso": 1,
    "min": 3.1,
    "max": 3.2,
    "marcas": [
      {
        "valor": 3.14159,
        "etiqueta": "3.14159"
      },
      {
        "valor": 3.14,
        "etiqueta": "3.14 (redondeado)"
      }
    ],
    "titulo": "3.14159 redondeado a 2 decimales"
  }
]$numeria$::jsonb
)
where slug = 'redondear-decimales';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "$a^n$ significa multiplicar \"a\" por sí mismo \"n\" veces.",
  "$2^4$ significa $2$ multiplicado por sí mismo $4$ veces."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.potencia",
    "modo": "cadena",
    "base": 2,
    "exponente": 4,
    "despuesDePaso": 1,
    "titulo": "$2^4 = 16$"
  }
]$numeria$::jsonb
)
where slug = 'potencia-como-multiplicacion-repetida';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para estimar una raíz cuadrada, busca qué número al cuadrado se acerca más.",
  "Para $\\sqrt{49}$: $7 \\times 7 = 49$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.potencia",
    "modo": "cuadricula",
    "base": 7,
    "exponente": 2,
    "despuesDePaso": 1,
    "titulo": "$\\sqrt{49} = 7$"
  }
]$numeria$::jsonb
)
where slug = 'raiz-cuadrada-por-tanteo';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Un número grande en notación científica es un dígito × 10 elevado a la cantidad de lugares que se corrió la coma.",
  "Se cuentan los ceros (o lugares) para saber el exponente."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "cuadros",
    "despuesDePaso": 1,
    "cuadros": [
      {
        "texto": "$3.000$ se escribe como $3 \\times 10^3$"
      },
      {
        "texto": "$45.000$ se escribe como $4.5 \\times 10^4$"
      }
    ]
  }
]$numeria$::jsonb
)
where slug = 'notacion-cientifica-basica';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "x no es un misterio: es un número que todavía no se conoce, con un valor fijo que se puede encontrar.",
  "En $x + 5 = 12$, solo hay un número que hace que la cuenta cierre: $x = 7$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.balanza",
    "modo": "despejar",
    "coefX": 1,
    "constante": 5,
    "resultado": 12,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'que-es-una-variable';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Para encontrar x, deshace las operaciones en orden inverso — lo último que se le hizo a x es lo primero que se deshace.",
  "Con $2x + 3 = 11$: primero resta $3$ de los dos lados, y después divide por $2$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.balanza",
    "modo": "despejar",
    "coefX": 2,
    "constante": 3,
    "resultado": 11,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'despejar-paso-a-paso';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Una vez despejada x, siempre se puede comprobar si está bien reemplazándola de nuevo en la ecuación original.",
  "Con $x = 4$ en $2x + 3 = 11$: $2(4) + 3 = 11$, coincide."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.balanza",
    "modo": "verificar",
    "coefX": 2,
    "constante": 3,
    "resultado": 11,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'verificar-sustituyendo';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Memorizar 3-4-5, 5-12-13 y 8-15-17 (y sus múltiplos) permite saber el tercer lado de un triángulo rectángulo sin calcular ninguna raíz.",
  "Un triángulo rectángulo con catetos $8$ y $6$: es la terna $3$-$4$-$5$ multiplicada por $2$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.figura",
    "modo": "triangulo",
    "cateto1": 8,
    "cateto2": 6,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'geometria-ternas-pitagoricas';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Una figura rara casi siempre es un rectángulo grande menos (o más) uno chico. Calcula cada parte por separado y suma o resta al final.",
  "Un rectángulo de $10 \\times 8$ con una esquina de $3 \\times 2$ recortada."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.figura",
    "modo": "areaCompuesta",
    "anchoGrande": 10,
    "altoGrande": 8,
    "anchoRecorte": 3,
    "altoRecorte": 2,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'geometria-area-compuestas';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Con radios múltiplos de 7, usar 22/7 en vez de 3.14 deja cuentas exactas sin decimales. Con cualquier otro radio, 3.14 sigue siendo la mejor aproximación rápida.",
  "Círculo de radio $7$: área $= \\pi \\times 7^2$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.figura",
    "modo": "circulo",
    "radio": 7,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'geometria-pi-fraccion';

update public.techniques
set contenido = jsonb_set(
  jsonb_set(contenido, '{pasos}', $numeria$[
  "Complementarios suman 90°, suplementarios suman 180°. Se resta directo del total — no hace falta plantear una ecuación para esto.",
  "Dos ángulos suplementarios, uno mide $125°$: el otro mide $55°$."
]$numeria$::jsonb),
  '{visuales}', $numeria$[
  {
    "tipo": "numeria.figura",
    "modo": "angulos",
    "tipoAngulo": "suplementario",
    "conocido": 125,
    "despuesDePaso": 1
  }
]$numeria$::jsonb
)
where slug = 'geometria-angulos-complementarios';
