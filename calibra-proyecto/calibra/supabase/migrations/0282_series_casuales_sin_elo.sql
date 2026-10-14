-- ============================================================
-- Prodigia — Series casuales sin ELO (0282).
--
-- Bug del 2026-10-13: un duelo casual «Aleatorio» (mejor de 3) cambiaba el ELO
-- de los dos y la pantalla final lo mostraba. finalizar_serie_si_corresponde
-- venía de 0073, de antes de los duelos casuales (0050) y nunca miró
-- `clasificatorio`. Ahora la serie casual se cierra igual (rondas, ganador y feed)
-- pero no toca elo_rating, no da títulos de rango y devuelve el ELO en null.
-- Las rondas sueltas ya lo hacían bien (registrar_resultado_duelo).
-- Base: la definición de 0073, con solo eso cambiado. Idempotente.
-- ============================================================

create or replace function public.finalizar_serie_si_corresponde(p_serie_id uuid)
returns table (
  finalizada boolean, gane boolean, empate boolean, elo_nuevo integer, elo_anterior integer,
  victorias_propias smallint, victorias_rival smallint, oponente_id uuid, oponente_nombre text,
  oponente_es_bot boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_primera record;
  v_otro_id uuid;
  v_otro_es_bot boolean;
  v_rondas record;
  v_victorias_mias smallint := 0;
  v_victorias_otro smallint := 0;
  v_rondas_completadas smallint := 0;
  v_ya_decidido boolean;
  v_mi_elo integer;
  v_otro_elo integer;
  v_actual numeric;
  v_esperado numeric;
  v_nuevo_elo_retador integer;
  v_nuevo_elo_retado integer;
  v_elo_retador integer;
  v_elo_retado integer;
  v_k_retador numeric;
  v_k_retado numeric;
  v_filas_actualizadas integer;
  v_mi_elo_anterior integer;
  v_gane boolean;
  v_empate boolean;
  v_ganador_serie_id uuid;
  v_perdedor_serie_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_primera from public.duels where serie_id = p_serie_id and ronda_numero = 1;
  if v_primera.id is null or (v_primera.retador_id <> v_user and v_primera.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  v_otro_id := case when v_primera.retador_id = v_user then v_primera.retado_id else v_primera.retador_id end;
  select es_bot into v_otro_es_bot from public.profiles where id = v_otro_id;

  for v_rondas in select estado, ganador_id from public.duels where serie_id = p_serie_id order by ronda_numero loop
    if v_rondas.estado = 'completado' then
      v_rondas_completadas := v_rondas_completadas + 1;
      if v_rondas.ganador_id = v_user then v_victorias_mias := v_victorias_mias + 1;
      elsif v_rondas.ganador_id = v_otro_id then v_victorias_otro := v_victorias_otro + 1;
      end if;
    end if;
  end loop;

  v_ya_decidido := v_victorias_mias >= 2 or v_victorias_otro >= 2 or v_rondas_completadas >= 3;

  if not v_ya_decidido then
    return query select false, false, false, null::integer, null::integer, v_victorias_mias, v_victorias_otro, v_otro_id,
      (select display_name from public.profiles where id = v_otro_id), v_otro_es_bot;
    return;
  end if;

  update public.duels set serie_finalizada = true
  where serie_id = p_serie_id and serie_finalizada = false;
  get diagnostics v_filas_actualizadas = row_count;

  if v_filas_actualizadas > 0 and coalesce(v_primera.clasificatorio, true) then
    select elo_rating into v_mi_elo from public.profiles where id = v_user;
    select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

    v_actual := case
      when v_victorias_mias > v_victorias_otro then 1
      when v_victorias_mias < v_victorias_otro then 0
      else 0.5
    end;
    v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));

    v_elo_retador := case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end;
    v_elo_retado := case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end;
    v_k_retador := public.k_factor_de_elo(v_elo_retador) * 1.5;
    v_k_retado := public.k_factor_de_elo(v_elo_retado) * 1.5;

    if v_user = v_primera.retador_id then
      v_nuevo_elo_retador := round(v_mi_elo + v_k_retador * (v_actual - v_esperado));
      v_nuevo_elo_retado := round(v_otro_elo + v_k_retado * ((1 - v_actual) - (1 - v_esperado)));
    else
      v_nuevo_elo_retado := round(v_mi_elo + v_k_retado * (v_actual - v_esperado));
      v_nuevo_elo_retador := round(v_otro_elo + v_k_retador * ((1 - v_actual) - (1 - v_esperado)));
    end if;

    update public.duels
      set serie_elo_retador_antes = case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end,
          serie_elo_retado_antes = case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end
      where serie_id = p_serie_id and ronda_numero = 1;

    update public.profiles set elo_rating = v_nuevo_elo_retador where id = v_primera.retador_id;
    update public.profiles set elo_rating = v_nuevo_elo_retado where id = v_primera.retado_id;

    -- Fase 3 (Clan de Bots): nunca una tarjeta de "resultado de duelo"
    -- en el Feed si el rival es del Clan de Bots. Las de "subida de
    -- rango" SÍ se mantienen tal cual (tu propio progreso real).
    if v_victorias_mias <> v_victorias_otro and not coalesce(v_otro_es_bot, false) then
      if (v_user = v_primera.retador_id) = (v_victorias_mias > v_victorias_otro) then
        v_ganador_serie_id := v_primera.retador_id;
        v_perdedor_serie_id := v_primera.retado_id;
      else
        v_ganador_serie_id := v_primera.retado_id;
        v_perdedor_serie_id := v_primera.retador_id;
      end if;
      insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
      values (
        v_ganador_serie_id, 'resultado_duelo', 'aleatorio',
        (select display_name from public.profiles where id = v_perdedor_serie_id),
        v_primera.id
      );
    end if;

    if public.rango_de_elo(v_nuevo_elo_retador) <> public.rango_de_elo(
      case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end
    ) then
      perform public.desbloquear_titulo(
        v_primera.retador_id, 'rango_' || public.rango_de_elo(v_nuevo_elo_retador),
        initcap(public.rango_de_elo(v_nuevo_elo_retador)), 'rango'
      );
      insert into public.feed_posts (user_id, tipo, rango_nuevo)
      values (v_primera.retador_id, 'subida_rango', public.rango_de_elo(v_nuevo_elo_retador));
    end if;
    if public.rango_de_elo(v_nuevo_elo_retado) <> public.rango_de_elo(
      case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end
    ) then
      perform public.desbloquear_titulo(
        v_primera.retado_id, 'rango_' || public.rango_de_elo(v_nuevo_elo_retado),
        initcap(public.rango_de_elo(v_nuevo_elo_retado)), 'rango'
      );
      insert into public.feed_posts (user_id, tipo, rango_nuevo)
      values (v_primera.retado_id, 'subida_rango', public.rango_de_elo(v_nuevo_elo_retado));
    end if;
  end if;

  select case when v_user = v_primera.retador_id then serie_elo_retador_antes else serie_elo_retado_antes end
  into v_mi_elo_anterior
  from public.duels where serie_id = p_serie_id and ronda_numero = 1;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  v_gane := v_victorias_mias > v_victorias_otro;
  v_empate := v_victorias_mias = v_victorias_otro;

  -- Casual: sin ELO en la respuesta (la pantalla no muestra el bloque de ELO).
  if not coalesce(v_primera.clasificatorio, true) then
    return query select true, v_gane, v_empate, null::integer, null::integer,
      v_victorias_mias, v_victorias_otro, v_otro_id,
      (select display_name from public.profiles where id = v_otro_id), v_otro_es_bot;
    return;
  end if;

  return query select true, v_gane, v_empate, v_mi_elo, v_mi_elo_anterior,
    v_victorias_mias, v_victorias_otro, v_otro_id,
    (select display_name from public.profiles where id = v_otro_id), v_otro_es_bot;
end;
$$;

grant execute on function public.finalizar_serie_si_corresponde(uuid) to authenticated;

notify pgrst, 'reload schema';
