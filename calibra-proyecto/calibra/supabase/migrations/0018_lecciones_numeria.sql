-- ============================================================
-- Prodigia — 8 técnicas nuevas de Numeria (Fase JJ)
-- Correr después de 0017_economia_y_ranking.sql
-- orden continúa la secuencia existente por familia: suma {1,2}->{3,4},
-- resta {1}->{2}, multiplicacion {1,2,3}->{4,5,6}, division {}->{1,2}
-- (división recién ahora tiene contenido real, deja de estar vacía).
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'sumar-por-la-izquierda',
  'Sumar por la izquierda',
  'Sumás de mayor a menor posición (centenas, decenas, unidades) en vez de empezar por las unidades.',
  'suma',
  '{"pasos": [
    "Sumá primero las centenas: 4+3=7 → 700",
    "Sumá las decenas: 5+2=7 → 770",
    "Sumá las unidades: 6+7=13 → 770+13=783"
  ]}',
  3
),
(
  'duplicar-y-ajustar',
  'Duplicar y ajustar',
  'Para números casi iguales, duplicás el más chico y ajustás por la diferencia.',
  'suma',
  '{"pasos": [
    "Elegí el número más chico y duplicalo: 48+48=96",
    "La diferencia entre 51 y 48 es 3",
    "Sumale esa diferencia: 96+3=99"
  ]}',
  4
),
(
  'complemento-a-100',
  'Complemento a 100',
  'Para restar de un número redondo como 100, cada dígito se resta de 9 excepto el último, que se resta de 10.',
  'resta',
  '{"pasos": [
    "Restá cada dígito de 9, excepto el último dígito que se resta de 10",
    "9−6=3 (primer dígito)",
    "10−3=7 (último dígito) → 100−63=37"
  ]}',
  2
),
(
  'x9-es-x10-menos-el-numero',
  '×9 = ×10 menos el número',
  'Multiplicar por 9 es multiplicar por 10 y restarle el número original.',
  'multiplicacion',
  '{"pasos": [
    "Multiplicá por 10: 47×10=470",
    "Restale el número original: 470−47=423"
  ]}',
  4
),
(
  'numeros-cercanos-a-100',
  'Números cercanos a 100',
  'Método de bases: usás cuánto le falta a cada número para llegar a 100.',
  'multiplicacion',
  '{"pasos": [
    "Hallá cuánto le falta a cada número para llegar a 100: 98→2, 97→3",
    "Restale el complemento de uno al otro número: 98−3=95 (van las primeras dos cifras)",
    "Multiplicá los complementos entre sí: 2×3=06 (van las últimas dos cifras) → 9506"
  ]}',
  5
),
(
  'x4-duplicar-dos-veces',
  '×4 = duplicar dos veces',
  'Multiplicar por 4 es duplicar el número y volver a duplicar el resultado.',
  'multiplicacion',
  '{"pasos": [
    "Duplicá el número: 37×2=74",
    "Duplicalo de nuevo: 74×2=148"
  ]}',
  6
),
(
  'divisibilidad-por-3',
  'Reglas de divisibilidad por 3',
  'Sumás los dígitos del número; si esa suma es múltiplo de 3, el número original también lo es.',
  'division',
  '{"pasos": [
    "Sumá todos los dígitos del número: 4+7+1=12",
    "Si esa suma es múltiplo de 3, el número original también lo es",
    "12 es múltiplo de 3 → 471 es divisible por 3"
  ]}',
  1
),
(
  'dividir-por-5',
  '÷5 = ×2 y correr el punto',
  'Dividir por 5 es multiplicar por 2 y correr el punto decimal un lugar.',
  'division',
  '{"pasos": [
    "Multiplicá el número por 2: 84×2=168",
    "Corré el punto decimal un lugar a la izquierda (dividí por 10): 16.8"
  ]}',
  2
);
