-- ============================================================
-- Calibra — esquema para lecciones y desbloqueos (camino de /aprender)
-- Correr después de 0004_fix_registrar_xp_diario.sql
-- ============================================================

-- techniques (0001) no tenía problem_type: lo necesitamos para agrupar el
-- camino en unidades por operación (Suma, Resta, Multiplicación, División).
-- La tabla está vacía hasta este seed, así que no hace falta default.
alter table public.techniques
  add column problem_type text not null
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division'));

-- ---------- variantes de problema que se desbloquean con técnicas ----------
create table public.modifiers (
  id uuid primary key default gen_random_uuid(),
  problem_type text not null check (problem_type in ('suma', 'resta', 'multiplicacion', 'division')),
  slug text not null,
  nombre text not null,
  descripcion text,
  unique (problem_type, slug)
);

-- qué técnica desbloquea qué modificador (una técnica puede desbloquear
-- más de uno; un modificador puede depender de más de una técnica)
create table public.technique_modifiers (
  technique_id uuid not null references public.techniques(id) on delete cascade,
  modifier_id uuid not null references public.modifiers(id) on delete cascade,
  primary key (technique_id, modifier_id)
);

-- qué modificador desbloqueó cada usuario
create table public.unlocked_modifiers (
  user_id uuid not null references public.profiles(id) on delete cascade,
  modifier_id uuid not null references public.modifiers(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, modifier_id)
);

alter table public.modifiers enable row level security;
alter table public.technique_modifiers enable row level security;
alter table public.unlocked_modifiers enable row level security;

-- modifiers y technique_modifiers son contenido del producto (como
-- techniques/logic_puzzles): cualquier autenticado los lee.
create policy "cualquiera autenticado lee modificadores"
  on public.modifiers for select
  using (auth.role() = 'authenticated');

create policy "cualquiera autenticado lee relacion tecnica-modificador"
  on public.technique_modifiers for select
  using (auth.role() = 'authenticated');

-- unlocked_modifiers sí es dato de usuario: mismo patrón que el resto.
create policy "usuarios ven sus modificadores desbloqueados"
  on public.unlocked_modifiers for select
  using (auth.uid() = user_id);

create policy "usuarios desbloquean sus propios modificadores"
  on public.unlocked_modifiers for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Contenido inicial: 5 técnicas, en el orden del camino.
-- División todavía no tiene técnicas a propósito (queda "Próximamente"
-- en la UI, no es un error ni una fila vacía rota).
-- ============================================================
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('complemento-a-10', 'Complemento a 10',
  'Sumá rápido buscando la parte que le falta a un número para llegar a 10.',
  'suma',
  '{"pasos": ["Mirá cuánto le falta al número más chico para llegar a 10", "Sumá esa parte primero", "Sumá lo que sobra después"]}',
  1),
('redondear-decena', 'Sumar redondeando a la decena',
  'Redondeá el número más difícil a la decena más cercana y ajustá al final.',
  'suma',
  '{"pasos": ["Redondeá el número más difícil a la decena más cercana", "Sumá con el número ya redondeado", "Restá la diferencia que redondeaste de más"]}',
  2),
('resta-compensacion', 'Resta por compensación',
  'Redondeás los dos números la misma cantidad y el resultado no cambia.',
  'resta',
  '{"pasos": ["Redondeá el número que restás a la decena más cercana", "Ajustá el otro número exactamente la misma cantidad", "Restá los números ya redondeados"]}',
  1),
('x11-segundo', '×11 en un segundo',
  'Separá los dígitos, sumalos, y acarreá si hace falta.',
  'multiplicacion',
  '{"pasos": ["Separá los dígitos: 3 _ 7", "Sumá 3 + 7 = 10", "Llevás el 1: 3(+1) _ 0 _ 7", "Resultado: 37 × 11 = 407"]}',
  1),
('x5-mitad-de-x10', '×5 = la mitad de ×10',
  'Multiplicar por 5 es multiplicar por 10 y dividir el resultado por 2.',
  'multiplicacion',
  '{"pasos": ["Multiplicá el número por 10 (agregale un cero)", "Dividí ese resultado por 2", "Ese es el resultado de multiplicar por 5"]}',
  2);

insert into public.modifiers (problem_type, slug, nombre, descripcion) values
('suma', 'numeros_grandes', 'Números grandes', 'Sumas con operandos más grandes que el nivel normal.'),
('resta', 'negativos', 'Negativos', 'Restas donde el resultado puede dar negativo.'),
('multiplicacion', 'numeros_grandes', 'Números grandes', 'Multiplicaciones con factores más grandes que el nivel normal.'),
('multiplicacion', 'inverso', 'Inverso', 'Dado el resultado y un operando, hallar el operando que falta.');

insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'complemento-a-10' and m.problem_type = 'suma' and m.slug = 'numeros_grandes';

insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'redondear-decena' and m.problem_type = 'suma' and m.slug = 'numeros_grandes';

insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'resta-compensacion' and m.problem_type = 'resta' and m.slug = 'negativos';

insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'x11-segundo' and m.problem_type = 'multiplicacion' and m.slug = 'numeros_grandes';

insert into public.technique_modifiers (technique_id, modifier_id)
select t.id, m.id from public.techniques t, public.modifiers m
where t.slug = 'x5-mitad-de-x10' and m.problem_type = 'multiplicacion' and m.slug = 'inverso';
