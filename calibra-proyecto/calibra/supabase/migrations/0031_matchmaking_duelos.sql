-- ============================================================
-- Prodigia — matchmaking competitivo para duelos (Fase R2)
-- Correr después de 0030_fix_memoria_secuencia.sql
-- Cola simple: te anotás, el propio polling del cliente llama a
-- buscar_rival_duelo() cada pocos segundos hasta encontrar un rival con
-- ELO cercano (rango que se ensancha con el tiempo esperando) o hasta
-- que el cliente decida abandonar. `for update skip locked` evita que
-- dos búsquedas concurrentes emparejen al mismo rival dos veces.
-- ============================================================

create table public.duel_queue (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  operation_type text not null check (operation_type in ('suma', 'resta', 'multiplicacion', 'division')),
  elo_rating integer not null,
  entered_at timestamptz not null default now()
);

alter table public.duel_queue enable row level security;

create policy "usuarios ven su propia cola de matchmaking"
  on public.duel_queue for select
  using (auth.uid() = user_id);

create policy "usuarios manejan su propia cola de matchmaking"
  on public.duel_queue for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Se llama repetidas veces desde el cliente (polling) mientras dura la
-- búsqueda. Primera llamada: te anota en la cola. Llamadas siguientes:
-- reintenta el match con un rango de ELO cada vez más amplio.
create function public.buscar_rival_duelo(p_operation_type text)
returns table (duel_id uuid, encontrado boolean, rango_actual integer, segundos_esperando integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_elo integer;
  v_entered timestamptz;
  v_rango integer;
  v_segundos integer;
  v_rival record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  insert into public.duel_queue (user_id, operation_type, elo_rating, entered_at)
  values (v_user, p_operation_type, v_mi_elo, now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type, elo_rating = excluded.elo_rating, entered_at = now()
    where public.duel_queue.operation_type <> excluded.operation_type;

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);

  -- ±15 al empezar, +15 cada 8 segundos esperando, tope en ±120.
  v_rango := least(120, 15 + (v_segundos / 8) * 15);

  select * into v_rival
  from public.duel_queue q
  where q.user_id <> v_user
    and q.operation_type = p_operation_type
    and abs(q.elo_rating - v_mi_elo) <= v_rango
  order by abs(q.elo_rating - v_mi_elo) asc
  for update skip locked
  limit 1;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  insert into public.duels (retador_id, retado_id, semilla_problemas, operation_type)
  values (v_user, v_rival.user_id, floor(random() * 1000000000)::bigint, p_operation_type)
  returning id into v_duel_id;

  return query select v_duel_id, true, v_rango, v_segundos;
end;
$$;

grant execute on function public.buscar_rival_duelo(text) to authenticated;

create function public.cancelar_busqueda_duelo()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.duel_queue where user_id = auth.uid();
$$;

grant execute on function public.cancelar_busqueda_duelo() to authenticated;

-- Historial de duelos completados del usuario, con nombre del rival
-- (profiles tiene RLS que solo deja ver tu propia fila, así que esto
-- necesita security definer igual que obtener_duelo).
create function public.mi_historial_duelos(p_limite integer default 20)
returns table (
  duel_id uuid,
  operation_type text,
  creado_at timestamptz,
  rival_nombre text,
  mi_puntaje integer,
  rival_puntaje integer,
  gane boolean,
  empate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  return query
    select
      d.id,
      d.operation_type,
      d.creado_at,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      mi.puntaje_final,
      otro.puntaje_final,
      (d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null)
    from public.duels d
    join public.duel_results mi on mi.duel_id = d.id and mi.user_id = v_user
    join public.duel_results otro on otro.duel_id = d.id and otro.user_id <> v_user
    where (d.retador_id = v_user or d.retado_id = v_user) and d.estado = 'completado'
    order by d.creado_at desc
    limit p_limite;
end;
$$;

grant execute on function public.mi_historial_duelos(integer) to authenticated;
