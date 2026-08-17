-- ============================================================
-- Calibra — corrige ambigüedad de columnas en registrar_xp_diario
-- Correr después de 0003_practica_attempts_xp.sql
-- ============================================================

-- Bug: los nombres de columna de RETURNS TABLE (xp_total, meta_alcanzada,
-- meta_xp_diaria) quedan declarados como variables de salida dentro de la
-- función, y "xp_total"/"meta_alcanzada" también son columnas reales de
-- profiles/daily_progress. "set xp_total = xp_total + p_xp" era ambiguo
-- entre la variable de salida y la columna. Se soluciona con un alias
-- explícito de tabla.
create or replace function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer
)
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_xp_total integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  insert into public.daily_progress (user_id, fecha, xp_ganado)
  values (v_user, current_date, p_xp)
  on conflict (user_id, fecha)
  do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
  returning public.daily_progress.xp_ganado into v_xp_hoy;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  update public.profiles as pr
  set xp_total = pr.xp_total + p_xp
  where pr.id = v_user
  returning pr.xp_total into v_xp_total;

  return query select v_xp_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;
