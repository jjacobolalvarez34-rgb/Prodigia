-- 0306 · Guerra de clanes visible (2026-10-29)
--
-- La guerra semanal (0070) funciona: ranking_clanes_semanal suma la Exp de la
-- semana (lunes a domingo, UTC) y procesar_cierre_semana_clanes, al abrir Clanes
-- (web o app) ya en la semana siguiente, le da +1 guerra ganada al clan jugador
-- con más Exp (en la base real ya hay 11 semanas cerradas). Pero el cierre no
-- guardaba QUIÉN ganó, así que no había forma de contarlo: nadie veía un resultado.
--
-- Esta migración:
--   1. Guarda en clan_semanas_procesadas el clan ganador y su Exp de esa semana.
--   2. Rellena las semanas ya cerradas con el mismo criterio del cierre.
--   3. procesar_cierre_semana_clanes (misma lógica que 0070) anota el ganador.
--   4. ultima_guerra_clanes(): el resultado de la última semana cerrada, para el
--      cartel «Guerra de la semana pasada» en Clanes (web y app).
--
-- Idempotente. El código funciona sin ella (sin cartel de la semana pasada).

alter table public.clan_semanas_procesadas
  add column if not exists ganador_clan_id uuid references public.clanes(id) on delete set null;
alter table public.clan_semanas_procesadas
  add column if not exists xp_ganador bigint;

-- Ganador de una semana (mismo criterio que el cierre de 0070).
create or replace function public._ganador_guerra_clanes(p_semana date)
returns table (clan_id uuid, xp_semana bigint)
language sql
stable
security definer
set search_path = public
as $$
  select cm.clan_id, sum(dp.xp_ganado)::bigint
  from public.clan_membresias cm
  join public.daily_progress dp on dp.user_id = cm.user_id
    and dp.fecha >= p_semana and dp.fecha < p_semana + 7
  join public.clanes c on c.id = cm.clan_id and c.tipo = 'jugadores'
  group by cm.clan_id
  having sum(dp.xp_ganado) > 0
  order by sum(dp.xp_ganado) desc
  limit 1;
$$;

revoke all on function public._ganador_guerra_clanes(date) from public, anon, authenticated;

-- Relleno de las semanas ya cerradas (solo las que no tienen ganador anotado).
-- Aproximado: usa los miembros de HOY (el cierre original usaba los de ese momento).
update public.clan_semanas_procesadas s
set ganador_clan_id = g.clan_id, xp_ganador = g.xp_semana
from public.clan_semanas_procesadas s2
cross join lateral public._ganador_guerra_clanes(s2.semana_inicio) g
where s.semana_inicio = s2.semana_inicio and s.ganador_clan_id is null;

create or replace function public.procesar_cierre_semana_clanes()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_semana_pasada date := (date_trunc('week', current_date)::date - interval '7 days')::date;
  v_ganador uuid;
  v_xp bigint;
begin
  insert into public.clan_semanas_procesadas (semana_inicio) values (v_semana_pasada)
  on conflict do nothing;
  if not found then
    return; -- ya se procesó esta semana (por otra visita)
  end if;

  select g.clan_id, g.xp_semana into v_ganador, v_xp
  from public._ganador_guerra_clanes(v_semana_pasada) g;

  if v_ganador is not null then
    update public.clanes set guerras_ganadas = guerras_ganadas + 1 where id = v_ganador;
    update public.clan_semanas_procesadas
    set ganador_clan_id = v_ganador, xp_ganador = v_xp
    where semana_inicio = v_semana_pasada;
  end if;
end;
$$;

grant execute on function public.procesar_cierre_semana_clanes() to authenticated;

-- Resultado de la última guerra cerrada (con ganador).
create or replace function public.ultima_guerra_clanes()
returns table (semana_inicio date, clan_id uuid, nombre text, tag text, color_estandarte text, xp_semana bigint)
language sql
stable
security definer
set search_path = public
as $$
  select s.semana_inicio, c.id, c.nombre, c.tag, c.color_estandarte, coalesce(s.xp_ganador, 0)::bigint
  from public.clan_semanas_procesadas s
  join public.clanes c on c.id = s.ganador_clan_id
  where s.semana_inicio = (date_trunc('week', current_date)::date - interval '7 days')::date
  limit 1;
$$;

grant execute on function public.ultima_guerra_clanes() to authenticated;
