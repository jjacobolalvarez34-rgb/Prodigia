-- ============================================================
-- Prodigia — mundo Enigmia (lógica): calibración, técnicas, intentos
-- Correr después de 0014_plan_academico.sql
-- ============================================================

-- ---------- calibración de Enigmia ----------
-- Un solo nivel global (no por tipo de acertijo, a diferencia de
-- skill_levels que sí distingue suma/resta/etc.) — Enigmia mezcla los
-- 3 tipos de acertijo en la misma práctica, así que un solo nivel
-- alcanza y mantiene el sistema simple.
create table public.logic_skill_levels (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  nivel smallint not null default 1 check (nivel between 1 and 10),
  racha_actual smallint not null default 0,
  updated_at timestamptz not null default now()
);

create table public.logic_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  puzzle_id uuid not null references public.logic_puzzles(id) on delete cascade,
  correct boolean not null,
  time_ms integer not null,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);

create index logic_attempts_user_created_idx on public.logic_attempts (user_id, created_at desc);

-- ---------- técnicas/lecciones de Enigmia (equivalente a techniques) ----------
create table public.logic_techniques (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text,
  contenido jsonb not null, -- { pasos: string[], ejemplo: { enunciado, opciones, respuesta } }
  orden smallint not null default 0
);

create table public.logic_technique_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  technique_id uuid not null references public.logic_techniques(id) on delete cascade,
  dominado boolean not null default false,
  intentos integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, technique_id)
);

alter table public.logic_skill_levels enable row level security;
alter table public.logic_attempts enable row level security;
alter table public.logic_techniques enable row level security;
alter table public.logic_technique_progress enable row level security;

create policy "usuarios ven su propio nivel de logica"
  on public.logic_skill_levels for select using (auth.uid() = user_id);
create policy "usuarios escriben su propio nivel de logica"
  on public.logic_skill_levels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usuarios ven sus propios intentos de logica"
  on public.logic_attempts for select using (auth.uid() = user_id);
create policy "usuarios insertan sus propios intentos de logica"
  on public.logic_attempts for insert with check (auth.uid() = user_id);

create policy "cualquiera autenticado lee tecnicas de logica"
  on public.logic_techniques for select using (auth.role() = 'authenticated');

create policy "usuarios ven su progreso de tecnicas de logica"
  on public.logic_technique_progress for select using (auth.uid() = user_id);
create policy "usuarios escriben su progreso de tecnicas de logica"
  on public.logic_technique_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- capas del onboarding (Fase W) ----------
alter table public.profiles add column onboarding_enigmia_completado boolean not null default false;
alter table public.profiles add column interes_inicial text; -- 'suma'|'resta'|'multiplicacion'|'division'|'logica', sin FK, es solo preferencia declarada

-- ---------- contenido: banco de acertijos ----------
-- Antes de esta migración logic_puzzles existía pero nunca se llenó.
-- Sembramos 10 acertijos por tipo, uno por cada nivel de dificultad
-- 1-10, para que la práctica y el diagnóstico de Enigmia tengan con
-- qué trabajar desde el día uno.
insert into public.logic_puzzles (tipo, dificultad, contenido, respuesta) values
('secuencia', 1, '{"enunciado": "2, 4, 6, 8, ?", "opciones": ["9", "10", "11", "12"]}', '10'),
('secuencia', 2, '{"enunciado": "5, 10, 15, 20, ?", "opciones": ["22", "24", "25", "30"]}', '25'),
('secuencia', 3, '{"enunciado": "1, 4, 7, 10, ?", "opciones": ["11", "12", "13", "14"]}', '13'),
('secuencia', 4, '{"enunciado": "3, 6, 12, 24, ?", "opciones": ["30", "36", "42", "48"]}', '48'),
('secuencia', 5, '{"enunciado": "1, 1, 2, 3, 5, 8, ?", "opciones": ["10", "11", "12", "13"]}', '13'),
('secuencia', 6, '{"enunciado": "A, C, E, G, ?", "opciones": ["F", "H", "I", "J"]}', 'I'),
('secuencia', 7, '{"enunciado": "2, 6, 18, 54, ?", "opciones": ["108", "150", "162", "172"]}', '162'),
('secuencia', 8, '{"enunciado": "1, 4, 9, 16, 25, ?", "opciones": ["30", "32", "36", "49"]}', '36'),
('secuencia', 9, '{"enunciado": "100, 90, 81, 73, ?", "opciones": ["64", "65", "66", "67"]}', '66'),
('secuencia', 10, '{"enunciado": "2, 3, 5, 8, 13, 21, ?", "opciones": ["30", "33", "34", "36"]}', '34'),
('patron', 1, '{"enunciado": "¿Cuál no pertenece al grupo? Perro, Gato, Silla, León", "opciones": ["Perro", "Gato", "Silla", "León"]}', 'Silla'),
('patron', 2, '{"enunciado": "¿Cuál no pertenece al grupo? Rojo, Azul, Grande, Verde", "opciones": ["Rojo", "Azul", "Grande", "Verde"]}', 'Grande'),
('patron', 3, '{"enunciado": "¿Cuál no pertenece al grupo? Manzana, Banana, Zanahoria, Naranja", "opciones": ["Manzana", "Banana", "Zanahoria", "Naranja"]}', 'Zanahoria'),
('patron', 4, '{"enunciado": "Círculo es a Esfera como Cuadrado es a ___", "opciones": ["Rectángulo", "Cubo", "Triángulo", "Línea"]}', 'Cubo'),
('patron', 5, '{"enunciado": "Dedo es a Mano como Hoja es a ___", "opciones": ["Árbol", "Rama", "Raíz", "Flor"]}', 'Árbol'),
('patron', 6, '{"enunciado": "¿Cuál no pertenece al grupo? Guitarra, Piano, Batería, Pincel", "opciones": ["Guitarra", "Piano", "Batería", "Pincel"]}', 'Pincel'),
('patron', 7, '{"enunciado": "Médico es a Hospital como Maestro es a ___", "opciones": ["Libro", "Escuela", "Alumno", "Pizarrón"]}', 'Escuela'),
('patron', 8, '{"enunciado": "¿Cuál no pertenece al grupo? 4, 9, 16, 20, 25", "opciones": ["4", "9", "20", "25"]}', '20'),
('patron', 9, '{"enunciado": "¿Cuál no pertenece al grupo? Águila, Pingüino, Gorrión, Cóndor", "opciones": ["Águila", "Pingüino", "Gorrión", "Cóndor"]}', 'Pingüino'),
('patron', 10, '{"enunciado": "Autor es a Libro como Compositor es a ___", "opciones": ["Concierto", "Canción", "Orquesta", "Instrumento"]}', 'Canción'),
('deduccion', 1, '{"enunciado": "Todos los perros ladran. Rex es un perro. ¿Rex ladra?", "opciones": ["Sí", "No", "No se sabe", "A veces"]}', 'Sí'),
('deduccion', 2, '{"enunciado": "Ana es más alta que Beto. Beto es más alto que Caro. ¿Quién es el más bajo?", "opciones": ["Ana", "Beto", "Caro", "No se sabe"]}', 'Caro'),
('deduccion', 3, '{"enunciado": "Si llueve, el piso se moja. El piso está mojado. ¿Llovió seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe'),
('deduccion', 4, '{"enunciado": "Todos los Bloops son Razzies. Todos los Razzies son Lazzies. ¿Todos los Bloops son Lazzies?", "opciones": ["Sí", "No", "No se sabe", "Solo algunos"]}', 'Sí'),
('deduccion', 5, '{"enunciado": "Juan llega antes que María. María llega antes que Pedro. Pedro llega antes que Sol. ¿Quién llega último?", "opciones": ["Juan", "María", "Pedro", "Sol"]}', 'Sol'),
('deduccion', 6, '{"enunciado": "Ningún reptil tiene pelo. Las serpientes son reptiles. ¿Las serpientes tienen pelo?", "opciones": ["Sí", "No", "A veces", "No se sabe"]}', 'No'),
('deduccion', 7, '{"enunciado": "Hay 3 cajas: roja, azul y verde. La roja no está primera. La verde está después de la azul. ¿Cuál va primera?", "opciones": ["Roja", "Azul", "Verde", "No se sabe"]}', 'Azul'),
('deduccion', 8, '{"enunciado": "Si apruebo el examen, voy a la fiesta. No fui a la fiesta. ¿Aprobé el examen?", "opciones": ["Sí", "No", "No se sabe", "Tal vez"]}', 'No'),
('deduccion', 9, '{"enunciado": "En una fila de 3, Tomás está a la izquierda de Lucía, y Lucía a la izquierda de Nico. ¿Quién está en el medio?", "opciones": ["Tomás", "Lucía", "Nico", "No se sabe"]}', 'Lucía'),
('deduccion', 10, '{"enunciado": "Todos los que estudian aprueban. Marcos aprobó. ¿Marcos estudió seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"]}', 'No se sabe');

-- ---------- contenido: lecciones de Enigmia ----------
insert into public.logic_techniques (slug, nombre, descripcion, orden, contenido) values
(
  'patron-numerico',
  'Buscar el patrón numérico',
  'La mayoría de las secuencias se resuelven mirando qué cambia entre un término y el siguiente.',
  1,
  '{
    "pasos": [
      "Restá cada término menos el anterior: ¿la diferencia es siempre la misma?",
      "Si no es siempre la misma diferencia, probá si cada término es el anterior multiplicado por algo.",
      "Con el patrón identificado, aplicalo al último término para hallar el que sigue."
    ],
    "ejemplo": { "enunciado": "1, 4, 7, 10, ?", "opciones": ["11", "12", "13", "14"], "respuesta": "13" }
  }'
),
(
  'encontrar-intruso',
  'Encontrar el intruso',
  'Cuando te dan una lista, buscá qué categoría comparten la mayoría — el que no encaja es la respuesta.',
  2,
  '{
    "pasos": [
      "Agrupá los elementos por una característica común (color, categoría, forma).",
      "Fijate cuál de los elementos NO comparte esa característica con los demás.",
      "Ese es el intruso — no hace falta que sepas por qué está ahí, solo que no encaja."
    ],
    "ejemplo": { "enunciado": "¿Cuál no pertenece al grupo? Manzana, Banana, Zanahoria, Naranja", "opciones": ["Manzana", "Banana", "Zanahoria", "Naranja"], "respuesta": "Zanahoria" }
  }'
),
(
  'analogias',
  'Analogías: A es a B como C es a ___',
  'Una analogía pide encontrar la MISMA relación entre un segundo par de palabras.',
  3,
  '{
    "pasos": [
      "Identificá la relación entre las dos primeras palabras (¿es parte de?, ¿es un tipo de?, ¿lo usa para?).",
      "Aplicá esa misma relación a la tercera palabra.",
      "De las opciones, elegí la que completa esa relación exacta — no una relación parecida."
    ],
    "ejemplo": { "enunciado": "Círculo es a Esfera como Cuadrado es a ___", "opciones": ["Rectángulo", "Cubo", "Triángulo", "Línea"], "respuesta": "Cubo" }
  }'
),
(
  'condicional-si-entonces',
  'Deducción con "si... entonces"',
  'El error más común en lógica es confundir "si A entonces B" con "si B entonces A" — no son lo mismo.',
  4,
  '{
    "pasos": [
      "Separá la condición (el \"si...\") de la conclusión (el \"entonces...\").",
      "Que se cumpla la conclusión NO prueba que se cumplió la condición — puede haber otras causas.",
      "Solo podés concluir con certeza en dos casos: se cumple la condición (entonces sí vale la conclusión), o NO se cumple la conclusión (entonces seguro no se cumplió la condición)."
    ],
    "ejemplo": { "enunciado": "Si llueve, el piso se moja. El piso está mojado. ¿Llovió seguro?", "opciones": ["Sí", "No", "No se sabe", "Siempre"], "respuesta": "No se sabe" }
  }'
);

-- ---------- logros propios de Enigmia y de duelos ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('enigmia-volumen-50', 'Mente afilada', '50 acertijos resueltos en Enigmia.', 'enigmia', '{"tipo": "logica_problemas_totales", "valor": 50}'),
('enigmia-tecnicas-todas', 'Razonador', 'Dominaste las 4 técnicas de Enigmia.', 'enigmia', '{"tipo": "logica_tecnicas_dominadas", "valor": 4}');
