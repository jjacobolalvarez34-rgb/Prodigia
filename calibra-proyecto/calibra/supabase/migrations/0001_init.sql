-- ============================================================
-- Calibra — esquema inicial
-- Correr esto en el SQL Editor de Supabase, o vía `supabase db push`
-- ============================================================

-- ---------- perfiles ----------
-- Extiende auth.users (que maneja Supabase) con datos propios del dominio.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  nivel_actual smallint not null default 1 check (nivel_actual between 1 and 10),
  streak_dias integer not null default 0,
  ultima_practica date,
  plan text not null default 'free' check (plan in ('free', 'pro', 'colegio')),
  created_at timestamptz not null default now()
);

-- ---------- intentos ----------
-- Cada respuesta que da un usuario en un sprint. Esta tabla crece rápido:
-- de acá salen todas las estadísticas de velocidad/precisión/progreso.
create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_type text not null check (problem_type in ('suma','resta','multiplicacion','division','logica')),
  level smallint not null check (level between 1 and 10),
  correct boolean not null,
  time_ms integer not null,
  created_at timestamptz not null default now()
);

-- Índices para las consultas que más se van a hacer: progreso de un usuario
-- en el tiempo, y agregados por tipo de problema.
create index attempts_user_created_idx on public.attempts (user_id, created_at desc);
create index attempts_user_type_idx on public.attempts (user_id, problem_type);

-- ---------- técnicas (lecciones de cálculo mental) ----------
create table public.techniques (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text,
  contenido jsonb not null,      -- pasos de la lección, en formato flexible
  orden smallint not null default 0
);

create table public.technique_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  technique_id uuid not null references public.techniques(id) on delete cascade,
  dominado boolean not null default false,
  intentos integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, technique_id)
);

-- ---------- acertijos de lógica ----------
create table public.logic_puzzles (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('secuencia','patron','deduccion')),
  dificultad smallint not null check (dificultad between 1 and 10),
  contenido jsonb not null,      -- el enunciado + opciones, formato flexible
  respuesta text not null
);

-- ============================================================
-- Row Level Security: cada usuario solo puede ver y escribir sus propios
-- datos. Sin esto, con la anon key cualquiera podría leer la tabla entera
-- de attempts de todos los usuarios.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.technique_progress enable row level security;

create policy "usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "usuarios ven sus propios intentos"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "usuarios insertan sus propios intentos"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create policy "usuarios ven su propio progreso de técnicas"
  on public.technique_progress for select
  using (auth.uid() = user_id);

create policy "usuarios actualizan su propio progreso de técnicas"
  on public.technique_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- techniques y logic_puzzles son de lectura pública (contenido del producto,
-- no datos del usuario), sin RLS restrictivo — cualquiera autenticado lee.
alter table public.techniques enable row level security;
alter table public.logic_puzzles enable row level security;

create policy "cualquiera autenticado lee técnicas"
  on public.techniques for select
  using (auth.role() = 'authenticated');

create policy "cualquiera autenticado lee acertijos"
  on public.logic_puzzles for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- Trigger: crear el profile automáticamente cuando alguien se registra
-- ============================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
