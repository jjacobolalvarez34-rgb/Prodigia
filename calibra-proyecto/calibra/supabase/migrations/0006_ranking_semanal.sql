-- ============================================================
-- Calibra — ranking semanal
-- Correr después de 0005_modificadores_y_camino.sql
-- ============================================================

-- daily_progress tiene RLS por usuario (auth.uid() = user_id), así que una
-- consulta normal desde el cliente jamás podría agregar XP de todos los
-- usuarios para armar un ranking. Esta función es security definer a
-- propósito: agrega server-side y devuelve SOLO nombre + XP de la semana,
-- nunca email ni ninguna otra columna — el ranking no debilita el
-- aislamiento por RLS del resto de los datos de usuario.
create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana
  from public.profiles p
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  group by p.id, p.display_name
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

grant execute on function public.ranking_semanal() to authenticated;
