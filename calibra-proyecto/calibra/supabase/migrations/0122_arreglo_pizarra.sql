-- 0122: Fix "Algo salió mal" de La Pizarra (0121).
--
-- En iniciar_la_pizarra (0121) la variable v_del_dia se declaró integer y
-- recibe el id (uuid) de la sesión insertada. PL/pgSQL falla en runtime con
-- un error no-P0001 (uuid -> integer no tiene cast) — y respuestaError lo
-- traduce al genérico "Algo salió mal. Probá de nuevo." que vio el PO en
-- todos los minijuegos.
--
-- Causa del resto de módulos (ruleta/volado/historial) confirmada por
-- diagnóstico: si apostar_doble_o_nada funciona, las RPCs y tablas existen;
-- si esos 3 fallaban y 0121 aplicó completa, era caché de PostgREST
-- (NOTIFY pgrst, 'reload schema' lo resuelve). Este archivo además
-- re-emite el reload por las dudas.

create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
  v_pizarra_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — volvé mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  -- Una pizarra sin terminar queda cerrada como perdida al entrar a otra.
  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_pizarra_id;

  return query select
    v_pizarra_id,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.iniciar_la_pizarra() to authenticated;

-- Recarga de PostgREST: garantiza que las funciones de 0121/0122 estén en
-- el caché de schema (evita PGRST202 "function not found in schema cache").
notify pgrst, 'reload schema';