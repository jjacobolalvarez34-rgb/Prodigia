-- ============================================================
-- Prodigia — el ranking general del perfil pasa de Chispas a EXPERIENCIA
-- histórica acumulada (pedido del usuario, 2026-09-25: "en el perfil no
-- debería salir ranking de chispas, sino ranking de experiencia histórico").
--
-- Las Chispas son una moneda que se gasta (tienda, apuestas, marcos): el
-- saldo `puntos_total` baja y sube, así que ordenar a la gente por ese saldo
-- premiaba a quien no gastaba, no a quien más practicó. La experiencia
-- histórica (`xp_historico_total`, 0070/0118) solo se incrementa con lo que
-- se gana practicando y nunca baja: es el número justo para un ranking
-- permanente.
--
-- Mismo filtro que posicion_ranking_puntos (0119): solo cuentas permanentes
-- (no anónimas, no bots, con nombre y correo confirmado). Desempata por
-- antigüedad de la cuenta. posicion_ranking_puntos NO se borra (ya no lo
-- llama la app, pero no rompe nada dejarla).
-- ============================================================

create or replace function public.posicion_ranking_experiencia_historica()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.xp_historico_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false
      and not p.es_bot
      and p.display_name is not null
      and btrim(p.display_name) <> ''
      and u.email_confirmed_at is not null
  ),
  ranking as (
    select id, row_number() over (order by xp_historico_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

revoke execute on function public.posicion_ranking_experiencia_historica() from public, anon;
grant execute on function public.posicion_ranking_experiencia_historica() to authenticated;

notify pgrst, 'reload schema';
