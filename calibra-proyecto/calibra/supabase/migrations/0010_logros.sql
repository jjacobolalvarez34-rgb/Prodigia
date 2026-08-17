-- ============================================================
-- Prodigia — logros / medallas
-- Correr después de 0009_puntos_vs_experiencia.sql
-- ============================================================

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text not null,
  categoria text not null check (categoria in ('racha', 'volumen', 'precision', 'dominio')),
  -- criterio flexible: {"tipo": "racha_dias", "valor": 7} | "problemas_totales" |
  -- "precision_semana" (valor 0-1) | "tecnicas_dominadas"
  criterio jsonb not null
);

create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  desbloqueado_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "cualquiera autenticado lee logros"
  on public.achievements for select
  using (auth.role() = 'authenticated');

create policy "usuarios ven sus logros desbloqueados"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "usuarios desbloquean sus propios logros"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('racha-7', 'Una semana entera', '7 días seguidos cumpliendo tu meta diaria.', 'racha', '{"tipo": "racha_dias", "valor": 7}'),
('racha-30', 'Hábito de verdad', '30 días seguidos cumpliendo tu meta diaria.', 'racha', '{"tipo": "racha_dias", "valor": 30}'),
('racha-100', 'Imparable', '100 días seguidos cumpliendo tu meta diaria.', 'racha', '{"tipo": "racha_dias", "valor": 100}'),
('volumen-100', 'Entrando en calor', '100 problemas resueltos en total.', 'volumen', '{"tipo": "problemas_totales", "valor": 100}'),
('volumen-500', 'Kilómetros de números', '500 problemas resueltos en total.', 'volumen', '{"tipo": "problemas_totales", "valor": 500}'),
('volumen-1000', 'Mil problemas', '1000 problemas resueltos en total.', 'volumen', '{"tipo": "problemas_totales", "valor": 1000}'),
('precision-semana-90', 'Semana afilada', 'Más de 90% de precisión en una semana completa.', 'precision', '{"tipo": "precision_semana", "valor": 0.9}'),
('dominio-5-tecnicas', 'Cinco trucos bajo la manga', 'Dominaste 5 técnicas de cálculo mental.', 'dominio', '{"tipo": "tecnicas_dominadas", "valor": 5}');
