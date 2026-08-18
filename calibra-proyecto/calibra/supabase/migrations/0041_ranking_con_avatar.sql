-- ============================================================
-- Prodigia — ranking_semanal ahora también devuelve avatar_url (Fase R3)
-- Correr después de 0040_perfil_publico_y_reportes.sql
-- El podio necesita mostrar la foto de perfil del top 3, no solo el
-- nombre. Mismo cuerpo que 0006, se agrega la columna.
-- ============================================================

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
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  group by p.id, p.display_name, p.avatar_url
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

grant execute on function public.ranking_semanal() to authenticated;
