-- ============================================================
-- Prodigia — recalibrar meta diaria, ampliar la tienda, ranking en perfil
-- Correr después de 0016_duelos_elo.sql
-- ============================================================

-- ---------- Fase BB: la meta diaria estaba clavada en 20 desde antes de
-- que existieran los multiplicadores de nivel/velocidad del XP real.
-- Con la fórmula actual (10 base × hasta 2.35x nivel × hasta 1.5x
-- velocidad), una partida de 10 problemas con ~80% de precisión ronda
-- los 150 Puntos. 400 equivale a 2.5-3 partidas típicas por día.
alter table public.profiles alter column meta_xp_diaria set default 400;
update public.profiles set meta_xp_diaria = 400 where meta_xp_diaria = 20;

-- ---------- nuevos ítems de tienda ----------
alter table public.profiles
  add column boost_multiplicador_pendiente numeric not null default 1,
  add column color_dial text not null default 'violeta' check (color_dial in ('violeta', 'esmeralda', 'coral', 'dorado')),
  add column colores_dial_desbloqueados text[] not null default array['violeta'];

-- comprar_item_tienda cambia sus columnas de salida respecto a la versión
-- de 0011 (agrega boost/colores) — CREATE OR REPLACE no permite eso
-- cuando la forma de RETURNS TABLE difiere, hay que borrarla primero.
drop function if exists public.comprar_item_tienda(text, integer);

create function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  colores_dial_desbloqueados text[]
)
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item not in ('escudo', 'congelamiento', 'boost', 'color_esmeralda', 'color_coral', 'color_dorado') then
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
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  else
    -- ítems de color_dial: cosmético permanente, se agrega a la lista de
    -- desbloqueados si todavía no estaba.
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        colores_dial_desbloqueados = case
          when (replace(p_item, 'color_', '')) = any(pr.colores_dial_desbloqueados)
            then pr.colores_dial_desbloqueados
          else array_append(pr.colores_dial_desbloqueados, replace(p_item, 'color_', ''))
        end
    where pr.id = v_user;
  end if;

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.colores_dial_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;

create function public.elegir_color_dial(p_color text)
returns void
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (
    select 1 from public.profiles where id = v_user and p_color = any(colores_dial_desbloqueados)
  ) then
    raise exception 'color no desbloqueado';
  end if;
  update public.profiles set color_dial = p_color where id = v_user;
end;
$$;

grant execute on function public.elegir_color_dial(text) to authenticated;

-- ---------- Fase DD: posición del usuario en el ranking general de Puntos ----------
create function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from public.profiles
  )
  select r.posicion, (select count(*) from public.profiles) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

grant execute on function public.posicion_ranking_puntos() to authenticated;
