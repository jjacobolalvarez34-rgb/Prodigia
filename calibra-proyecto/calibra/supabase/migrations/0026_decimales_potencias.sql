-- ============================================================
-- Prodigia — activar Decimales/porcentajes y Potencias/raíces (Fase ZZ)
-- Correr después de 0025_tienda_ampliada.sql
-- Mismo criterio que 0019 (fracciones): reutiliza skill_levels/attempts/
-- techniques ampliando los check constraints, sin tablas nuevas.
-- ============================================================

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias'));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias'));

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias'));

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'convertir-fraccion-decimal',
  'De fracción a decimal, dividiendo',
  'Un decimal no es más que el resultado de dividir el numerador por el denominador.',
  'decimales',
  '{"pasos": [
    "Tomá la fracción 3/4: dividí el numerador por el denominador",
    "3 ÷ 4 = 0.75",
    "Ese es el decimal equivalente: 3/4 = 0.75"
  ]}',
  1
),
(
  'porcentaje-como-decimal',
  'Un porcentaje es un decimal corrido dos lugares',
  'Para calcular X% de un número, convertís el porcentaje a decimal (÷100) y multiplicás.',
  'decimales',
  '{"pasos": [
    "Para calcular 15% de 200: convertí 15% a decimal → 15÷100=0.15",
    "Multiplicá: 0.15 × 200 = 30",
    "15% de 200 es 30"
  ]}',
  2
),
(
  'redondear-decimales',
  'Redondear mirando el dígito siguiente',
  'Para redondear a N lugares, mirás el dígito que sigue: 5 o más, subís; menos de 5, dejás igual.',
  'decimales',
  '{"pasos": [
    "Redondeá 3.14159 a 2 decimales: mirá el tercer decimal (1)",
    "Como 1 < 5, el segundo decimal se queda igual",
    "3.14159 redondeado a 2 decimales es 3.14"
  ]}',
  3
),
(
  'potencia-como-multiplicacion-repetida',
  'Una potencia es multiplicar el número por sí mismo',
  'aⁿ significa multiplicar "a" por sí mismo "n" veces.',
  'potencias',
  '{"pasos": [
    "2⁴ significa 2 multiplicado por sí mismo 4 veces",
    "2×2=4, 4×2=8, 8×2=16",
    "2⁴ = 16"
  ]}',
  1
),
(
  'raiz-cuadrada-por-tanteo',
  'Raíz cuadrada probando cuadrados cercanos',
  'Para estimar una raíz cuadrada, buscá qué número al cuadrado se acerca más.',
  'potencias',
  '{"pasos": [
    "Para √49: pensá qué número al cuadrado da 49",
    "7×7=49",
    "√49 = 7"
  ]}',
  2
),
(
  'notacion-cientifica-basica',
  'Notación: contar los ceros',
  'Un número grande en notación científica es un dígito × 10 elevado a la cantidad de lugares que se corrió la coma.',
  'potencias',
  '{"pasos": [
    "3.000 se escribe como 3 × 10³ (corriste la coma 3 lugares)",
    "45.000 se escribe como 4.5 × 10⁴",
    "Contás los ceros (o lugares) para saber el exponente"
  ]}',
  3
);
