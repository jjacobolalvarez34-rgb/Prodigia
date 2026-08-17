-- ============================================================
-- Prodigia — feed social (contenido auto-generado, sin texto libre)
-- Correr después de 0012_amigos_y_duelos.sql
-- ============================================================

create table public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('logro', 'desafio')),
  -- tarjeta de logro: se autogenera, nunca la escribe el usuario
  achievement_id uuid references public.achievements(id) on delete cascade,
  -- tarjeta de desafío: solo opciones de dropdown, nunca texto libre
  operation_type text check (operation_type in ('suma', 'resta', 'multiplicacion', 'division')),
  nivel smallint check (nivel between 1 and 10),
  cantidad_problemas smallint check (cantidad_problemas between 5 and 20),
  duel_id uuid references public.duels(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (tipo = 'logro' and achievement_id is not null)
    or
    (tipo = 'desafio' and operation_type is not null and nivel is not null and cantidad_problemas is not null)
  )
);

create table public.feed_reactions (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.feed_posts enable row level security;
alter table public.feed_reactions enable row level security;

-- El feed es de lectura abierta entre usuarios autenticados (como
-- cualquier feed social) — no es dato privado, es contenido para
-- compartir. Solo se restringe quién puede escribir.
create policy "cualquiera autenticado lee el feed"
  on public.feed_posts for select
  using (auth.role() = 'authenticated');

create policy "usuarios publican sus propias tarjetas"
  on public.feed_posts for insert
  with check (auth.uid() = user_id);

create policy "cualquiera autenticado lee reacciones"
  on public.feed_reactions for select
  using (auth.role() = 'authenticated');

create policy "usuarios reaccionan por su cuenta"
  on public.feed_reactions for insert
  with check (auth.uid() = user_id);

create policy "usuarios sacan su propia reaccion"
  on public.feed_reactions for delete
  using (auth.uid() = user_id);
