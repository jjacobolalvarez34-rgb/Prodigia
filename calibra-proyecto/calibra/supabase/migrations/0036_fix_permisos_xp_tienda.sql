-- ============================================================
-- Prodigia — hotfix urgente de 0035: registrar_xp_diario y
-- comprar_item_tienda quedaron rotas
-- Correr después de 0035_auditoria_lanzamiento_rls.sql
--
-- 0035 le sacó a "authenticated" el permiso de UPDATE genérico sobre
-- profiles (correcto, cerraba una vulnerabilidad real) y solo agregó
-- security definer a elegir_color_dial/elegir_marco_perfil. Pero el
-- propio informe de auditoría ya había marcado que registrar_xp_diario
-- Y comprar_item_tienda TAMPOCO son security definer — se me pasaron
-- esas dos. Sin security definer, corren con los permisos del usuario
-- que llama, así que ahora chocan con el mismo GRANT restrictivo:
-- "permission denied for table profiles" al cerrar cualquier partida
-- (registrar_xp_diario) o al comprar algo en la tienda
-- (comprar_item_tienda). Se agrega security definer a las dos, mismo
-- cuerpo que ya tenían — no cambia ninguna lógica de negocio.
-- ============================================================

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

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  colores_dial_desbloqueados text[],
  marcos_desbloqueados text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_item not in (
    'escudo', 'congelamiento', 'boost',
    'color_esmeralda', 'color_coral', 'color_dorado',
    'marco_plata', 'marco_oro'
  ) then
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
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  else
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
      pr.boost_multiplicador_pendiente, pr.colores_dial_desbloqueados, pr.marcos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_item_tienda(text, integer) to authenticated;
