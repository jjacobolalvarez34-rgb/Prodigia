-- ============================================================
-- Prodigia — separar Puntos (permanentes) de Experiencia (semanal)
-- Correr después de 0008_onboarding_diagnostico.sql
-- ============================================================

-- "Puntos" reemplaza el nombre "xp_total": es la moneda permanente, para
-- siempre, que va a alimentar logros (Fase L) y la tienda (Fase M).
-- "Experiencia" sigue siendo daily_progress.xp_ganado (sin cambios de
-- esquema ahí) — es la que cuenta SOLO para el ranking semanal.
alter table public.profiles rename column xp_total to puntos_total;

-- registrar_xp_diario referenciaba la columna vieja por nombre en el
-- update; hay que recrearla apuntando a puntos_total. Mismo cuerpo que
-- 0004, solo cambia esa columna.
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
  v_puntos_total integer;
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
  set puntos_total = pr.puntos_total + p_xp
  where pr.id = v_user
  returning pr.puntos_total into v_puntos_total;

  -- El nombre de la columna de salida queda "xp_total" por compatibilidad
  -- de forma con el resto de la función (RETURNS TABLE no se puede
  -- renombrar sin recrear la función desde cero); el código de la app ya
  -- lo lee como "puntos totales", el nombre interno de la columna acá no
  -- es lo que se le muestra al usuario.
  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;
