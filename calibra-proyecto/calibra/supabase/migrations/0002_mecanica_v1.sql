-- ============================================================
-- Calibra — mecánica v1: nivel por operación + racha diaria
-- Correr después de 0001_init.sql
-- ============================================================

-- ---------- nivel de calibración por operación ----------
-- Reemplaza la idea de un nivel global único: cada usuario tiene un nivel
-- de calibración independiente por cada tipo de problema.
create table public.skill_levels (
  user_id uuid not null references public.profiles(id) on delete cascade,
  problem_type text not null check (problem_type in ('suma','resta','multiplicacion','division')),
  nivel smallint not null default 1 check (nivel between 1 and 10),
  racha_actual smallint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_type)
);

alter table public.skill_levels enable row level security;

create policy "usuarios ven su propio nivel por operacion"
  on public.skill_levels for select
  using (auth.uid() = user_id);

create policy "usuarios actualizan su propio nivel por operacion"
  on public.skill_levels for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- XP total (para siempre, nunca baja) ----------
alter table public.profiles add column xp_total integer not null default 0;
alter table public.profiles add column meta_xp_diaria integer not null default 20;

-- ---------- racha diaria ----------
-- Un registro por usuario por día que practicó. La racha diaria se calcula
-- a partir de días consecutivos con xp_ganado >= meta del día, no de un
-- contador que se pueda desincronizar.
create table public.daily_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  fecha date not null default current_date,
  xp_ganado integer not null default 0,
  meta_alcanzada boolean not null default false,
  primary key (user_id, fecha)
);

alter table public.daily_progress enable row level security;

create policy "usuarios ven su propio progreso diario"
  on public.daily_progress for select
  using (auth.uid() = user_id);

create policy "usuarios actualizan su propio progreso diario"
  on public.daily_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index daily_progress_user_fecha_idx on public.daily_progress (user_id, fecha desc);
