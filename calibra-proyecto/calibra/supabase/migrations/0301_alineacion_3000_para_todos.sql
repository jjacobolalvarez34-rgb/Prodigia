-- ============================================================
-- Prodigia — Regalo de la Gran Alineación: 3000 Chispas para todos (0301).
--
-- Pedido del usuario (2026-10-22): «pon que la gran alineación dé 3000 chispas
-- para todos». Antes eran 300 Chispas y solo si la comunidad llegaba a la meta y
-- habías jugado durante las 3 horas. Ahora es un regalo para cada jugador: se
-- reclama desde que empieza una Alineación hasta que empieza la siguiente, una vez
-- por Alineación, sin meta ni partida. La meta de comunidad sigue contándose en la
-- base (estado_alineacion), pero ya no condiciona nada.
-- Base: reclamar_premio_comunidad_alineacion de 0290 (su última definición).
-- Idempotente.
-- ============================================================

create or replace function public.reclamar_premio_comunidad_alineacion()
returns table (chispas integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_num integer := public.numero_alineacion();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_num < 1 then
    raise exception 'la Gran Alineacion todavia no empieza';
  end if;
  perform 1 from public.profiles pr where pr.id = v_user for update;
  insert into public.alineacion_premio_comunidad (user_id, numero, chispas) values (v_user, v_num, 3000)
  on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste este premio';
  end if;
  perform public._dar_chispas(v_user, 3000);
  return query select 3000, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.reclamar_premio_comunidad_alineacion() from public, anon;
grant execute on function public.reclamar_premio_comunidad_alineacion() to authenticated;
