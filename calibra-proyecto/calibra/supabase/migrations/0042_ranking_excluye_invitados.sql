-- ============================================================
-- Prodigia — invitados (auth.signInAnonymously) fuera de TODO ranking
-- Correr después de 0041_ranking_con_avatar.sql
-- Bug confirmado: cuentas anónimas aparecían en el ranking general de
-- Experiencia, en el ranking por mundo y en el ranking general de
-- Puntos, ocupando posiciones reales — el frontend nunca las filtraba
-- porque el problema es del lado del backend: ninguna de estas 3
-- funciones excluía is_anonymous. Se corrige acá, no en la UI, así que
-- no depende de que cada pantalla se acuerde de filtrar.
-- ============================================================

-- ---------- Ranking general de Experiencia (leaderboard semanal) ----------
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
  group by p.id, p.display_name, p.avatar_url
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

grant execute on function public.ranking_semanal() to authenticated;

-- ---------- Ranking por mundo ----------
create or replace function public.ranking_semanal_por_mundo(p_mundo text)
returns table (user_id uuid, display_name text, xp_semana bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_mundo = 'enigmia' then
    return query
      select p.id, p.display_name, coalesce(sum(la.xp), 0)::bigint
      from public.profiles p
      join auth.users u on u.id = p.id
      left join public.logic_attempts la
        on la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
      where coalesce(u.is_anonymous, false) = false
      group by p.id, p.display_name
      having coalesce(sum(la.xp), 0) > 0
      order by 3 desc;
  elsif p_mundo = 'geografia' then
    return query
      select p.id, p.display_name, coalesce(sum(a.xp), 0)::bigint
      from public.profiles p
      join auth.users u on u.id = p.id
      left join public.attempts a
        on a.user_id = p.id
        and a.created_at >= date_trunc('week', current_date)
        and a.problem_type = 'geografia'
      where coalesce(u.is_anonymous, false) = false
      group by p.id, p.display_name
      having coalesce(sum(a.xp), 0) > 0
      order by 3 desc;
  elsif p_mundo = 'numeria' then
    return query
      select p.id, p.display_name, coalesce(sum(a.xp), 0)::bigint
      from public.profiles p
      join auth.users u on u.id = p.id
      left join public.attempts a
        on a.user_id = p.id
        and a.created_at >= date_trunc('week', current_date)
        and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias')
      where coalesce(u.is_anonymous, false) = false
      group by p.id, p.display_name
      having coalesce(sum(a.xp), 0) > 0
      order by 3 desc;
  else
    raise exception 'mundo desconocido: %', p_mundo;
  end if;
end;
$$;

-- ---------- Ranking general de Puntos (posición propia) ----------
create or replace function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.puntos_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
  ),
  ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

-- Nota sobre "ranking de Rankeds" (matchmaking por ELO): ya está
-- cubierto sin necesidad de tocar SQL — /rankeds llama a
-- bloquearInvitado(user, "rankeds") en la propia página (guard.ts), así
-- que una cuenta anónima nunca llega a encolarse en duel_queue ni puede
-- ser emparejada como rival. No hay un listado público de ELO en el
-- proyecto hoy (Rankeds solo muestra el propio ELO + historial), así
-- que no hay una tercera query de "ranking visible" que arreglar acá.
