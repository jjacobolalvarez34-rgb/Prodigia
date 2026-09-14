-- ====================================================================
-- PRODIGIA — "Ruleta Elemental" (nombre nuevo de la ex "ruleta casino"
-- de Trastienda): pedido explícito del propietario, apoyado en el fix
-- de 0136 (apostar_casino_elementos ya no tira 42702).
--
-- Antes solo se podía apostar UNA zona por giro (apostar_casino_elementos,
-- que queda intacta para compatibilidad). Esta migración agrega
-- apostar_casino_elementos_multi: varias fichas en distintas zonas
-- EN EL MISMO GIRO — como una ruleta de verdad, una sola bolita
-- (un solo elemento sorteado) evaluada contra cada ficha puesta.
--
-- Diseño:
--   - 1 a 5 zonas por giro (tope para no volar el límite diario de un
--     solo golpe — el propio front avisa el costo total antes de girar).
--   - Un solo sorteo (`order by random() limit 1` sobre los 118
--     elementos), evaluado contra cada zona.
--   - Cada ficha se registra como su propia fila en trastienda_casino
--     (mismo esquema de siempre, aparecen como líneas separadas en el
--     historial — es información real, no ruido: "aposté a X, gané/perdí"
--     por cada una). El costo de las N fichas cuenta N veces contra el
--     límite de 20/día (más zonas = más "tiradas" reales de la ruleta).
--   - El premio raro (~5%) se evalúa una sola vez por giro (no una vez
--     por zona), y solo si ganó al menos una ficha — mismo criterio que
--     la versión de una zona, solo que ahora "ganaste" es "ganaste algo
--     en este giro".
--   - Mismo patrón `update ... as pr set puntos_total = pr.puntos_total
--     ...` de 0136 desde el día uno, para no repetir el bug 42702 acá.
-- ====================================================================

create or replace function public.apostar_casino_elementos_multi(p_zonas text[], p_montos integer[])
returns table (
  elegido text,
  elegido_nombre text,
  apuestas jsonb,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuestas_hoy integer;
  v_cantidad integer;
  v_costo_total integer := 0;
  v_i integer;
  v_zona text;
  v_monto integer;
  v_n integer;
  v_elegido text;
  v_elegido_nombre text;
  v_gano_alguna boolean := false;
  v_pago_total integer := 0;
  v_apuestas_json jsonb := '[]'::jsonb;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_premio_idx integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido_item text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_cantidad := coalesce(array_length(p_zonas, 1), 0);
  if v_cantidad < 1 or v_cantidad > 5 then
    raise exception 'elegí entre 1 y 5 zonas por giro';
  end if;
  if coalesce(array_length(p_montos, 1), 0) <> v_cantidad then
    raise exception 'cada zona necesita su ficha';
  end if;

  for v_i in 1..v_cantidad loop
    if p_montos[v_i] not in (100, 250, 500, 1000) then
      raise exception 'monto de ficha invalido';
    end if;
    if not exists (select 1 from public.casino_elementos_en_zona(p_zonas[v_i])) then
      raise exception 'zona invalida';
    end if;
    v_costo_total := v_costo_total + p_montos[v_i];
  end loop;

  select count(*) into v_apuestas_hoy
  from public.trastienda_casino
  where user_id = v_user and fecha = current_date;

  if v_apuestas_hoy + v_cantidad > 20 then
    raise exception 'te quedan % fichas hoy — bajá zonas o esperá a mañana', greatest(20 - v_apuestas_hoy, 0);
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo_total then
    raise exception 'te faltan Chispas para esas fichas';
  end if;

  -- Un solo giro real: el croupier elige UN elemento entre los 118, y
  -- todas las fichas de esta tirada se evalúan contra ese mismo resultado.
  select e.simbolo, e.nombre into v_elegido, v_elegido_nombre
  from public.trastienda_casino_elementos e
  order by random()
  limit 1;

  update public.profiles as pr set puntos_total = pr.puntos_total - v_costo_total where pr.id = v_user;

  for v_i in 1..v_cantidad loop
    v_zona := p_zonas[v_i];
    v_monto := p_montos[v_i];

    select count(*) into v_n from public.casino_elementos_en_zona(v_zona);

    declare
      v_gano boolean;
      v_mult numeric;
      v_pago_zona integer := 0;
    begin
      select exists (
        select 1 from public.casino_elementos_en_zona(v_zona) m where m.simbolo = v_elegido
      ) into v_gano;

      v_mult := round((118.0 / greatest(v_n, 1)) * 0.88, 2);

      if v_gano then
        v_pago_zona := greatest(round(v_monto * v_mult::numeric), 1);
        v_pago_total := v_pago_total + v_pago_zona;
        v_gano_alguna := true;
      end if;

      insert into public.trastienda_casino
        (user_id, zona, apuesta_numero, monto, elegido, ganaste, pago)
      values
        (v_user, v_zona, v_apuestas_hoy + v_i, v_monto, v_elegido, v_gano, v_pago_zona);

      v_apuestas_json := v_apuestas_json || jsonb_build_object(
        'zona', v_zona,
        'monto', v_monto,
        'ganaste', v_gano,
        'multiplier', v_mult,
        'chispas_ganadas', v_pago_zona
      );
    end;
  end loop;

  if v_pago_total > 0 then
    update public.profiles as pr set puntos_total = pr.puntos_total + v_pago_total where pr.id = v_user;
  end if;

  -- Ganancia rara (~5%, una sola vez por giro, solo si ganó al menos una ficha).
  if v_gano_alguna and random() < 0.05 then
    v_premio_idx := 1 + floor(random() * 6)::int;
    if v_premio_idx = 1 then
      update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
      v_premio_tipo := 'item';
      v_premio_detalle := jsonb_build_object('item', 'boost');
    elsif v_premio_idx = 2 then
      update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
      v_premio_tipo := 'item';
      v_premio_detalle := jsonb_build_object('item', 'escudo');
    elsif v_premio_idx = 3 then
      update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
      v_premio_tipo := 'item';
      v_premio_detalle := jsonb_build_object('item', 'congelamiento');
    elsif v_premio_idx = 4 then
      select coalesce(array_agg(f), array[]::text[]) into v_disponibles
      from unnest(v_fuentes) t(f)
      where not (f = any (coalesce(
        (select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user),
        array[]::text[]
      )));
      if cardinality(v_disponibles) = 0 then
        v_premio_tipo := 'chispas';
        v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
        update public.profiles as pr set puntos_total = pr.puntos_total + 200 where pr.id = v_user;
      else
        v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
        update public.profiles
        set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido_item]
        where id = v_user;
        v_premio_tipo := 'fuente';
        v_premio_detalle := jsonb_build_object('fuente', v_elegido_item);
      end if;
    elsif v_premio_idx = 5 then
      select coalesce(array_agg(m), array[]::text[]) into v_disponibles
      from unnest(v_marcos) t(m)
      where not (m = any (coalesce(
        (select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user),
        array[]::text[]
      )));
      if cardinality(v_disponibles) = 0 then
        v_premio_tipo := 'chispas';
        v_premio_detalle := jsonb_build_object('chispas', 300, 'fallback', true);
        update public.profiles as pr set puntos_total = pr.puntos_total + 300 where pr.id = v_user;
      else
        v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
        update public.profiles
        set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido_item]
        where id = v_user;
        v_premio_tipo := 'marco';
        v_premio_detalle := jsonb_build_object('marco', v_elegido_item);
      end if;
    else
      select t.slug into v_titulo_slug
      from public.titulos_trastienda_base() t
      where t.slug not in (
        select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
      )
      order by random()
      limit 1;
      if v_titulo_slug is null then
        v_premio_tipo := 'chispas';
        v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
        update public.profiles as pr set puntos_total = pr.puntos_total + 200 where pr.id = v_user;
      else
        v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
        perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
        v_premio_tipo := 'titulo';
        v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
      end if;
    end if;
  end if;

  return query select
    v_elegido,
    v_elegido_nombre,
    v_apuestas_json,
    v_premio_tipo,
    v_premio_detalle,
    v_apuestas_hoy + v_cantidad,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_casino_elementos_multi(text[], integer[]) to authenticated;

notify pgrst, 'reload schema';
