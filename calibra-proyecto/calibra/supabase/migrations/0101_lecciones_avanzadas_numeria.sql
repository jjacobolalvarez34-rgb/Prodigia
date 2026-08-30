-- ============================================================
-- Fase 8, segunda mitad (auditoría de estabilización, 2026-08-30):
-- contenido avanzado faltante para números grandes.
--
-- La calibración de Numeria (Sección 2, src/lib/practica/problems.ts)
-- ya escala la banda más alta (nivel 9-10) a sumas/restas de 4-5
-- dígitos (hasta 99999) y multiplicación/división de hasta ~3×3 dígitos
-- (factores hasta 300×150) — pero el camino de Aprender nunca tuvo
-- ninguna técnica pensada para esa magnitud, solo las técnicas
-- originales (pensadas para números de 1-2 dígitos). Se agregan 2
-- lecciones "avanzadas" por operación (suma/resta/multiplicación/
-- división — las 4 que escalan a números grandes en nivel 9-10) con
-- `orden >= 100` a propósito: es la marca que usa obtenerCamino()
-- (src/lib/aprender/path.ts) para separar el tramo básico del avanzado
-- como dos unidades visuales distintas dentro del mismo camino, en vez
-- de mezclarlas en una sola lista continua.
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values

-- ---------- Suma avanzada ----------
('sumar-por-posicion-numeros-grandes', 'Sumar números grandes, posición por posición',
  'Con 4 o 5 dígitos, sumar todo junto de una se presta a errores — separar por posición lo hace manejable.',
  'suma',
  '{"pasos": [
    "Separá cada número en miles, centenas, decenas y unidades — igual que ya hacías con el complemento a 10, ahora en números más largos.",
    "Sumá cada posición por separado: unidades con unidades, decenas con decenas, centenas con centenas.",
    "Si una posición da 10 o más, esa parte se \"lleva\" a la posición siguiente — es la misma idea del complemento a 10, columna por columna.",
    "Sumá lo que te quedó en cada posición (ya con lo que se llevó) para armar el resultado final."
  ]}',
  100),
('estimar-antes-de-sumar-grande', 'Estimá antes de sumar números grandes',
  'Una estimación rápida te avisa si te equivocaste antes de confiar en el resultado exacto.',
  'suma',
  '{"pasos": [
    "Redondeá cada número a su posición más alta antes de sumar en detalle — por ejemplo, 4827 se redondea a 5000.",
    "Sumá esos redondeos: te da un resultado aproximado, no el exacto.",
    "Ahora sumá los números de verdad, posición por posición.",
    "Comparalo con tu estimación — si están muy lejos uno del otro, probablemente te equivocaste en algún paso y vale la pena revisar."
  ]}',
  101),

-- ---------- Resta avanzada ----------
('restar-por-posicion-numeros-grandes', 'Restar números grandes, pidiendo prestado a lo grande',
  'La misma idea de "pedir prestado" de restas chicas, encadenada a través de varias posiciones.',
  'resta',
  '{"pasos": [
    "Separá los dos números en miles, centenas, decenas y unidades, alineados por posición.",
    "Restá de derecha a izquierda, posición por posición, igual que siempre.",
    "Si en una posición el de arriba es más chico que el de abajo, \"pedís prestado\" 1 a la posición siguiente (esa posición baja en 1, esta gana 10) — puede encadenarse varias veces seguidas si varias posiciones lo necesitan.",
    "Seguí así hasta la última posición para armar el resultado completo."
  ]}',
  100),
('restar-completando-al-redondo-mas-cercano', 'Restar completando hasta el redondo más cercano',
  'Para números grandes, a veces es más rápido "completar" que restar directo.',
  'resta',
  '{"pasos": [
    "Elegí el número más redondo cercano al que estás restando (por ejemplo, para restar 6850, pensá en 7000).",
    "Restá usando ese número redondo en vez del real — suele ser una cuenta más simple.",
    "Ajustá el resultado sumando o restando la diferencia entre el número redondo y el real (7000 − 6850 = 150, así que le sumás 150 de vuelta al resultado).",
    "Este ajuste final es el paso que más se olvida — sin él, el resultado queda desviado exactamente por esa diferencia."
  ]}',
  101),

-- ---------- Multiplicación avanzada ----------
('multiplicar-por-partes', 'Multiplicación por partes (distributiva)',
  'Separar un factor en centenas + decenas + unidades convierte una multiplicación grande en varias chicas.',
  'multiplicacion',
  '{"pasos": [
    "Separá el factor de más dígitos en centenas, decenas y unidades — por ejemplo, 234 = 200 + 30 + 4.",
    "Multiplicá el otro factor por cada parte por separado: por 200, por 30, y por 4.",
    "Cada una de esas multiplicaciones es mucho más simple que la original (multiplicar por un número redondo es más fácil).",
    "Sumá los 3 resultados parciales — esa suma es el resultado de la multiplicación completa."
  ]}',
  100),
('multiplicar-redondeando-primero', 'Multiplicar redondeando primero',
  'Redondear un factor, multiplicar, y ajustar después suele ser más rápido que multiplicar el número real de una.',
  'multiplicacion',
  '{"pasos": [
    "Redondeá uno de los factores al número redondo más cercano (por ejemplo, 98 → 100).",
    "Multiplicá usando ese número redondo — es una cuenta mucho más simple.",
    "Calculá cuánto te pasaste o te quedaste corto: si redondeaste 98 a 100, te pasaste por 2 veces el otro factor.",
    "Ajustá el resultado restando (o sumando) esa diferencia para llegar al resultado real."
  ]}',
  101),

-- ---------- División avanzada ----------
('dividir-numeros-grandes-por-partes', 'Dividir números grandes, por partes',
  'Separar el dividendo en un múltiplo cómodo del divisor más un resto simplifica divisiones grandes.',
  'division',
  '{"pasos": [
    "Buscá el múltiplo del divisor más grande y más fácil de calcular que sea menor o igual al dividendo (por ejemplo, para satisfacer 288 ÷ 12, pensá en 12×20 = 240).",
    "Restá ese múltiplo del dividendo para ver cuánto queda (288 − 240 = 48).",
    "Dividí lo que quedó por el mismo divisor — suele ser una cuenta mucho más chica y fácil (48 ÷ 12 = 4).",
    "Sumá los dos cocientes parciales (20 + 4 = 24) para armar el resultado completo."
  ]}',
  100),
('estimar-el-cociente-grande', 'Estimar el cociente antes de dividir',
  'Saber más o menos cuántas cifras va a tener el resultado evita errores grandes al dividir.',
  'division',
  '{"pasos": [
    "Fijate cuántas veces \"entra\" el divisor en la primera parte del dividendo, para tener una idea del orden de magnitud del resultado.",
    "Con esa referencia, probá un cociente aproximado y multiplicalo por el divisor.",
    "Compará ese resultado con el dividendo real — si te pasaste, bajá el cociente probado; si te quedaste corto, subilo.",
    "Ajustá hasta que la multiplicación del cociente por el divisor caiga justo en el dividendo (o lo más cerca posible, si sobra resto)."
  ]}',
  101)

on conflict (slug) do nothing;
