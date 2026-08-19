-- ============================================================
-- Prodigia — mostrar el título elegido (Fase 2) junto al rango, en
-- duelos y en el ranking
-- Correr después de 0043_rankeds_rangos_titulos_multimundo.sql
--
-- Hasta acá solo se mostraba el RANGO (RangoBadge) en esos lugares —
-- el título elegido a mano (titulos_usuario + profiles.titulo_activo)
-- nunca viajaba junto con el resto de los datos del usuario. Un solo
-- helper reusado en todas las funciones que ya devuelven nombre+ELO de
-- alguien, en vez de repetir el join a mano en cada una.
-- ============================================================

create or replace function public.titulo_nombre_de(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select t.nombre
  from public.profiles p
  join public.titulos_usuario t on t.user_id = p.id and t.slug = p.titulo_activo
  where p.id = p_user_id;
$$;

grant execute on function public.titulo_nombre_de(uuid) to authenticated;

-- ---------- Ranking semanal ----------
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url,
    p.elo_rating,
    p.titulo_activo,
    public.titulo_nombre_de(p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

grant execute on function public.ranking_semanal() to authenticated;

-- ---------- Perfil público de otro usuario ----------
-- drop primero (no alcanza con "or replace"): se agrega una columna
-- nueva al resultado, y Postgres no deja cambiar el tipo de fila de una
-- función existente sin dropearla antes — es EXACTAMENTE el error real
-- que diste ("cannot change return type of existing function").
drop function if exists public.obtener_perfil_publico(uuid);

create function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  color_dial text,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz,
  titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, p.marco_perfil, p.color_dial,
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id)
    from public.profiles p
    where p.id = p_user_id;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ---------- Duelos pendientes (quién te retó) ----------
drop function if exists public.mis_duelos_pendientes();

create function public.mis_duelos_pendientes()
returns table (
  duel_id uuid, operation_type text, mundo text, creado_at timestamptz,
  retador_nombre text, retador_elo integer, retador_titulo_nombre text
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
    select d.id, d.operation_type, d.mundo, d.creado_at,
      (select display_name from public.profiles where id = d.retador_id),
      (select elo_rating from public.profiles where id = d.retador_id),
      public.titulo_nombre_de(d.retador_id)
    from public.duels d
    where d.retado_id = v_user
      and d.estado = 'pendiente'
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;

grant execute on function public.mis_duelos_pendientes() to authenticated;

-- ---------- Historial de duelos (título del rival) ----------
drop function if exists public.mi_historial_duelos(integer);

create function public.mi_historial_duelos(p_limite integer default 20)
returns table (
  duel_id uuid,
  operation_type text,
  mundo text,
  sub_tipo text,
  modo text,
  creado_at timestamptz,
  rival_nombre text,
  rival_titulo_nombre text,
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
      d.mundo,
      d.sub_tipo,
      d.modo,
      d.creado_at,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      public.titulo_nombre_de(case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      mi.puntaje_final,
      otro.puntaje_final,
      (d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null)
    from public.duels d
    join public.duel_results mi on mi.duel_id = d.id and mi.user_id = v_user
    join public.duel_results otro on otro.duel_id = d.id and otro.user_id <> v_user
    where (d.retador_id = v_user or d.retado_id = v_user) and d.estado = 'completado'
      and d.modo = 'simple'
    order by d.creado_at desc
    limit p_limite;
end;
$$;

grant execute on function public.mi_historial_duelos(integer) to authenticated;

-- ---------- Sala de duelo (mi título + el del rival) ----------
drop function if exists public.obtener_duelo(uuid);

create function public.obtener_duelo(p_duel_id uuid)
returns table (
  operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text,
  rival_nombre text, mi_elo integer, rival_elo integer,
  rival_ya_jugo boolean, rival_respuestas jsonb,
  mundo text, sub_tipo text, modo text, serie_id uuid, ronda_numero smallint, ronda_total smallint,
  mi_titulo_nombre text, rival_titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_rival_id uuid;
  v_mi_elo integer;
  v_rival_elo integer;
  v_promedio numeric;
  v_rival_resultado record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  v_rival_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;
  select elo_rating into v_rival_elo from public.profiles where id = v_rival_id;
  v_promedio := (v_mi_elo + v_rival_elo) / 2.0;

  select * into v_rival_resultado from public.duel_results where duel_id = p_duel_id and user_id = v_rival_id;

  return query
    select v_duel.operation_type,
      coalesce(v_duel.nivel_numeria, greatest(1, least(10, round(3 + (v_promedio - 1200) / 100)))::smallint),
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo,
      (v_rival_resultado.user_id is not null), v_rival_resultado.respuestas,
      v_duel.mundo, v_duel.sub_tipo, v_duel.modo, v_duel.serie_id, v_duel.ronda_numero, v_duel.ronda_total,
      public.titulo_nombre_de(v_user), public.titulo_nombre_de(v_rival_id);
end;
$$;

grant execute on function public.obtener_duelo(uuid) to authenticated;
