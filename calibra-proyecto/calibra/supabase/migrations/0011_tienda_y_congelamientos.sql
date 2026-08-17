-- ============================================================
-- Prodigia — tienda de Puntos: escudo extra y congelar racha
-- Correr después de 0010_logros.sql
-- ============================================================

alter table public.profiles
  add column escudos_extra_pendientes smallint not null default 0,
  add column congelamientos_disponibles smallint not null default 0;

-- Un día "congelado" cuenta como si hubiera cumplido la meta a los
-- efectos de la racha, aunque xp_ganado siga en 0 ese día.
alter table public.daily_progress
  add column congelado boolean not null default false;

-- Compra atómica: descuenta Puntos y suma el ítem comprado en un solo
-- paso, para no tener condición de carrera entre leer el saldo y
-- escribirlo.
create function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (puntos_total integer, escudos_extra_pendientes smallint, congelamientos_disponibles smallint)
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item not in ('escudo', 'congelamiento') then
    raise exception 'item invalido';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'puntos insuficientes';
  end if;

  if p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  end if;

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;
