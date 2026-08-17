-- ============================================================
-- Calibra — pantalla de práctica: XP por intento + registro atómico
-- Correr después de 0002_mecanica_v1.sql
-- ============================================================

-- ---------- XP ganado en cada intento ----------
-- Se calcula y guarda server-side (nunca confiamos en un valor que mande
-- el cliente). Sirve para auditar y para sumar el XP de un sprint completo
-- en /api/practica/finish sin tener que recalcular nada.
alter table public.attempts add column xp smallint not null default 0 check (xp >= 0);

-- ---------- registrar XP de un sprint (atómico) ----------
-- Suma XP a profiles.xp_total y a daily_progress del día de una sola vez,
-- para no tener condiciones de carrera con un leer-modificar-escribir
-- hecho desde el cliente. Corre con los privilegios de quien la llama
-- (security invoker, el default), así que las políticas de RLS de
-- profiles/daily_progress siguen aplicando normalmente.
create function public.registrar_xp_diario(p_xp integer)
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

  update public.profiles
  set xp_total = xp_total + p_xp
  where id = v_user
  returning profiles.xp_total into v_xp_total;

  return query select v_xp_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;
