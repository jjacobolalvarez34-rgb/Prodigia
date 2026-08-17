-- ============================================================
-- Prodigia — tienda ampliada (Fase G2): marcos de perfil, doble o
-- nada, base para el descuento rotativo (se calcula por código, no
-- necesita columna — ver src/lib/descuentoDiario.ts)
-- Correr después de 0024_reto_diario.sql
-- ============================================================

alter table public.profiles
  add column marco_perfil text not null default 'ninguno' check (marco_perfil in ('ninguno', 'plata', 'oro')),
  add column marcos_desbloqueados text[] not null default array['ninguno'],
  add column apuesta_monto integer not null default 0,
  add column apuesta_umbral numeric;

-- comprar_item_tienda vuelve a cambiar su forma de salida (agrega
-- marco_perfil/marcos_desbloqueados) — mismo motivo que en 0017, hay
-- que borrar antes de recrear.
drop function if exists public.comprar_item_tienda(text, integer);

create function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  colores_dial_desbloqueados text[],
  marcos_desbloqueados text[]
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

create function public.elegir_marco_perfil(p_marco text)
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
    select 1 from public.profiles where id = v_user and p_marco = any(marcos_desbloqueados)
  ) then
    raise exception 'marco no desbloqueado';
  end if;
  update public.profiles set marco_perfil = p_marco where id = v_user;
end;
$$;

grant execute on function public.elegir_marco_perfil(text) to authenticated;

-- ---------- doble o nada ----------
create function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuesta_previa integer;
  v_total bigint;
  v_correctos bigint;
  v_umbral numeric;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;

  select puntos_total, apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles where id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tenes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'puntos insuficientes';
  end if;

  select count(*), count(*) filter (where correct) into v_total, v_correctos
  from public.attempts where user_id = v_user;

  if v_total < 20 then
    raise exception 'jugá al menos 20 problemas antes de poder apostar';
  end if;

  v_umbral := v_correctos::numeric / v_total;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select puntos_total from public.profiles where id = v_user);
end;
$$;

grant execute on function public.apostar_doble_o_nada(integer) to authenticated;

-- Se llama al cerrar cualquier partida (Numeria/Fracciones/Geografía
-- comparten /api/practica/finish; Enigmia tiene el suyo) con la
-- precisión de ESA partida. Si no hay apuesta activa, no hace nada.
create function public.resolver_apuesta_si_activa(p_precision numeric)
returns table (resuelta boolean, gano boolean, monto integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_monto integer;
  v_umbral numeric;
  v_gano boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select apuesta_monto, apuesta_umbral into v_monto, v_umbral
  from public.profiles where id = v_user;

  if v_monto is null or v_monto = 0 then
    return query select false, false, 0, (select puntos_total from public.profiles where id = v_user);
    return;
  end if;

  v_gano := p_precision > coalesce(v_umbral, 1);

  update public.profiles as pr
  set puntos_total = pr.puntos_total + case when v_gano then v_monto * 2 else 0 end,
      apuesta_monto = 0,
      apuesta_umbral = null
  where pr.id = v_user;

  return query
    select true, v_gano, v_monto, (select puntos_total from public.profiles where id = v_user);
end;
$$;

grant execute on function public.resolver_apuesta_si_activa(numeric) to authenticated;
