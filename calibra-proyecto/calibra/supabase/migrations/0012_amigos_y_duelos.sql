-- ============================================================
-- Prodigia — esquema de amigos y duelos (sin UI todavía, es la base
-- para el feed social de la Fase O)
-- Correr después de 0011_tienda_y_congelamientos.sql
-- ============================================================

create table public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptada')),
  creado_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- Un duelo reutiliza el motor de sprint existente: ambos participantes
-- resuelven los mismos problemas porque se generan a partir de la misma
-- semilla + operación (mismo generarProblema, mismo PRNG con seed).
create table public.duels (
  id uuid primary key default gen_random_uuid(),
  retador_id uuid not null references public.profiles(id) on delete cascade,
  retado_id uuid not null references public.profiles(id) on delete cascade,
  semilla_problemas bigint not null,
  operation_type text not null check (operation_type in ('suma', 'resta', 'multiplicacion', 'division')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'completado')),
  creado_at timestamptz not null default now(),
  check (retador_id <> retado_id)
);

create table public.duel_results (
  duel_id uuid not null references public.duels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  precision numeric not null check (precision between 0 and 1),
  tiempo_promedio numeric not null,
  puntaje_final integer not null,
  primary key (duel_id, user_id)
);

alter table public.friendships enable row level security;
alter table public.duels enable row level security;
alter table public.duel_results enable row level security;

create policy "usuarios ven sus amistades"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "usuarios crean solicitudes propias"
  on public.friendships for insert
  with check (auth.uid() = user_id);

create policy "usuarios actualizan amistades donde participan"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "participantes ven sus duelos"
  on public.duels for select
  using (auth.uid() = retador_id or auth.uid() = retado_id);

create policy "usuarios crean duelos como retador"
  on public.duels for insert
  with check (auth.uid() = retador_id);

create policy "participantes actualizan el estado del duelo"
  on public.duels for update
  using (auth.uid() = retador_id or auth.uid() = retado_id);

create policy "participantes ven resultados de sus duelos"
  on public.duel_results for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.duels d
      where d.id = duel_results.duel_id
        and (d.retador_id = auth.uid() or d.retado_id = auth.uid())
    )
  );

create policy "usuarios insertan su propio resultado de duelo"
  on public.duel_results for insert
  with check (auth.uid() = user_id);
