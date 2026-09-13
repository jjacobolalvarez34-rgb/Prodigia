-- ====================================================================
-- PRODIGIA — FIX: "Experiencia diaria" aparece null/500 la primera
-- vez que se juega en el día.
--
-- CAUSA: registrar_xp_diario (0120) hace:
--   select coalesce(xp_ganado, 0) into v_ya_hoy
--   from public.daily_progress where user_id = v_user and fecha = current_date;
--   v_por_acreditar := greatest(0, v_real_hoy - v_ya_hoy);
-- Si todavía NO existe fila de daily_progress para hoy (primer sprint
-- del día), el SELECT no matchea ninguna fila y v_ya_hoy queda en NULL
-- — el coalesce(xp_ganado, 0) solo protege contra una fila que EXISTE
-- con xp_ganado nulo, no contra la ausencia total de la fila. Con
-- v_ya_hoy = NULL, "v_real_hoy - v_ya_hoy" da NULL (aritmética con
-- NULL), y greatest(0, NULL) = 0 (greatest ignora NULLs) — el XP real
-- del día queda sin acreditar la primera vez, y como tampoco se creó
-- la fila (la rama que inserta nunca se ejecuta), el SELECT del bloque
-- ELSE tampoco encuentra nada: v_xp_hoy y meta_alcanzada quedan NULL,
-- que es exactamente el "null/500" que se ve en pantalla.
--
-- FIX: coalesce ANTES de restar, no solo al leer la columna.
-- ====================================================================

create or replace function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_real_hoy integer;
  v_ya_hoy integer;
  v_por_acreditar integer;
  v_puntos_total integer;
  v_desde timestamptz := date_trunc('day', now());
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_real_hoy :=
    (select coalesce(sum(a.xp)::integer, 0) from public.attempts a
      where a.user_id = v_user and a.created_at >= v_desde)
    + (select coalesce(sum(la.xp)::integer, 0) from public.logic_attempts la
      where la.user_id = v_user and la.created_at >= v_desde);

  select coalesce(xp_ganado, 0) into v_ya_hoy
  from public.daily_progress where user_id = v_user and fecha = current_date;

  -- FIX: si no existe fila todavía, el select de arriba no matchea
  -- nada y v_ya_hoy queda en NULL (el coalesce de la columna no cubre
  -- "fila ausente") — sin este coalesce extra, v_por_acreditar daba 0
  -- en vez del XP real la primera vez del día.
  v_por_acreditar := greatest(0, v_real_hoy - coalesce(v_ya_hoy, 0));

  if v_por_acreditar > 0 then
    insert into public.daily_progress (user_id, fecha, xp_ganado)
    values (v_user, current_date, v_por_acreditar)
    on conflict (user_id, fecha)
    do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
    returning public.daily_progress.xp_ganado into v_xp_hoy;

    perform public.acreditar_chispas(v_user, v_por_acreditar);
  else
    select coalesce(xp_ganado, 0) into v_xp_hoy
    from public.daily_progress where user_id = v_user and fecha = current_date;
    -- Mismo caso borde: si tampoco hay fila (nunca jugó hoy y esta
    -- llamada puntual no tenía nada nuevo que acreditar), que quede en
    -- 0, no en NULL.
    v_xp_hoy := coalesce(v_xp_hoy, 0);
  end if;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

notify pgrst, 'reload schema';
