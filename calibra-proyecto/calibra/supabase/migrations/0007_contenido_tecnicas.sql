-- ============================================================
-- Calibra — contenido definitivo de las técnicas + técnica nueva
-- Correr después de 0006_ranking_semanal.sql
-- ============================================================

-- Actualiza las 5 técnicas ya sembradas en 0005 con la explicación y el
-- ejemplo resuelto exactos (antes tenían pasos genéricos sin un ejemplo
-- numérico concreto).
update public.techniques set
  descripcion = 'Cuando sumes un número que casi llega a la decena, completá primero esa decena y sumá el resto.',
  contenido = '{"pasos": [
    "8 + 5: al 8 le faltan 2 para llegar a 10",
    "8 + 2 = 10",
    "Quedan 3 del 5 (ya usaste 2)",
    "10 + 3 = 13"
  ]}'
where slug = 'complemento-a-10';

update public.techniques set
  descripcion = 'Redondeá el número más difícil a la decena más cercana, sumá, y corregí el ajuste al final.',
  contenido = '{"pasos": [
    "47 + 38: redondeá 38 a 40",
    "47 + 40 = 87",
    "Pero sumaste 2 de más (40 en vez de 38)",
    "87 − 2 = 85"
  ]}'
where slug = 'redondear-decena';

update public.techniques set
  descripcion = 'Para restar, redondeá el número que restás a la decena y ajustá el resultado al final.',
  contenido = '{"pasos": [
    "82 − 47: redondeá 47 a 50",
    "82 − 50 = 32",
    "Pero restaste 3 de más (50 en vez de 47)",
    "32 + 3 = 35"
  ]}'
where slug = 'resta-compensacion';

update public.techniques set
  descripcion = 'Separá los dígitos del número, sumalos, y metés ese resultado en el medio (con acarreo si pasa de 9).',
  contenido = '{"pasos": [
    "37 × 11: separá los dígitos: 3 _ 7",
    "Sumá 3 + 7 = 10",
    "Como pasa de 9, llevás el 1: (3+1) 0 7",
    "37 × 11 = 407"
  ]}'
where slug = 'x11-segundo';

update public.techniques set
  descripcion = 'Multiplicar por 10 es agregar un cero. Multiplicar por 5 es hacer eso y dividir a la mitad.',
  contenido = '{"pasos": [
    "48 × 5: multiplicá por 10 primero",
    "48 × 10 = 480",
    "Dividí ese resultado a la mitad",
    "480 ÷ 2 = 240"
  ]}'
where slug = 'x5-mitad-de-x10';

-- Técnica nueva: sexta del camino, sigue a las otras dos de multiplicación.
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('cuadrado-terminado-en-5', 'Cuadrados de números terminados en 5',
  'Para elevar al cuadrado un número que termina en 5: tomá el dígito de las decenas, multiplicalo por sí mismo más uno, y pegale 25 al final.',
  'multiplicacion',
  '{"pasos": [
    "35²: el dígito de las decenas es 3",
    "Multiplicalo por sí mismo más uno: 3 × 4 = 12",
    "Pegale \"25\" al final",
    "35² = 1225"
  ]}',
  3);

-- Desbloquea el mismo modificador que ×11 (números grandes en
-- multiplicación) — no se justifica un modificador nuevo solo para este
-- patrón numérico puntual.
insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'cuadrado-terminado-en-5' and m.problem_type = 'multiplicacion' and m.slug = 'numeros_grandes';
