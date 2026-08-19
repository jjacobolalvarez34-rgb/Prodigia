-- ============================================================
-- Prodigia — Fase 5: diversificar el feed más allá de "desafío creado".
-- 'logro' y 'desafio' ya existían. Se suman 3 tipos auto-generados
-- nuevos: 'resultado_duelo', 'subida_rango', 'nivel_mundo'. El cuarto
-- disparador pedido ("hito de racha 7/30/100 días") YA estaba cubierto
-- sin código nuevo — son exactamente los achievements racha-7/racha-30/
-- racha-100 (0010_logros.sql), y desbloquear un achievement YA genera
-- su propia tarjeta de feed (tipo='logro', ver src/lib/logros/verificar.ts)
-- desde antes de esta fase.
--
-- Todo lo nuevo se guarda DENORMALIZADO (rival_nombre como texto, no un
-- id que habría que resolver con un join a `duels`) a propósito: RLS en
-- `duels` solo deja leer a los participantes, así que un texto plano
-- generado server-side es la única forma de que el feed (de lectura
-- abierta entre autenticados) muestre esta info sin abrir esa tabla.
-- Correr después de 0051_invitaciones_temporales.sql
-- ============================================================

alter table public.feed_posts drop constraint if exists feed_posts_tipo_check;
alter table public.feed_posts add constraint feed_posts_tipo_check
  check (tipo in ('logro', 'desafio', 'resultado_duelo', 'subida_rango', 'nivel_mundo', 'desafio_personalizado'));

-- 'aleatorio' incluido: el resultado de una serie "todas las ciudades"
-- (mejor de 3) también genera esta tarjeta, y no es de una sola ciudad.
alter table public.feed_posts add column if not exists mundo text check (mundo in ('numeria', 'geografia', 'enigmia', 'aleatorio'));
alter table public.feed_posts add column if not exists rival_nombre text;
alter table public.feed_posts add column if not exists rango_nuevo text
  check (rango_nuevo in ('bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio'));
alter table public.feed_posts add column if not exists nivel_mundo_valor smallint;

alter table public.feed_posts drop constraint if exists feed_posts_check;
alter table public.feed_posts add constraint feed_posts_check check (
  (tipo = 'logro' and achievement_id is not null)
  or
  (tipo = 'desafio' and operation_type is not null and nivel is not null and cantidad_problemas is not null)
  or
  (tipo = 'resultado_duelo' and mundo is not null and rival_nombre is not null)
  or
  (tipo = 'subida_rango' and rango_nuevo is not null)
  or
  (tipo = 'nivel_mundo' and mundo is not null and nivel_mundo_valor is not null)
  -- desafio_personalizado (Fase 6) valida sus propias columnas en su
  -- propia migración, que agrega la FK a problemas_personalizados.
);

-- ---------- registrar_resultado_duelo: + tarjeta de "subida de rango" ----------
drop function if exists public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb);

create function public.registrar_resultado_duelo(
  p_duel_id uuid,
  p_precision numeric,
  p_tiempo_promedio numeric,
  p_puntaje integer,
  p_respuestas jsonb default null
)
returns table (
  resuelto boolean, elo_nuevo integer, elo_anterior integer, gane boolean, empate boolean,
  oponente_nombre text, oponente_id uuid, mundo text, modo text, ronda_numero smallint, ronda_total smallint,
  mi_puntaje integer, rival_puntaje integer, clasificatorio boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_otro_id uuid;
  v_mi record;
  v_otro record;
  v_mi_elo integer;
  v_otro_elo integer;
  v_actual numeric;
  v_esperado numeric;
  v_nuevo_elo integer;
  v_k constant integer := 13;
  v_rango_anterior text;
  v_rango_nuevo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
  values (p_duel_id, v_user, p_precision, p_tiempo_promedio, p_puntaje, p_respuestas)
  on conflict (duel_id, user_id) do update
    set precision = excluded.precision,
        tiempo_promedio = excluded.tiempo_promedio,
        puntaje_final = excluded.puntaje_final,
        respuestas = excluded.respuestas;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select * into v_otro from public.duel_results where duel_id = p_duel_id and user_id = v_otro_id;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if v_otro.user_id is null then
    return query select false, v_mi_elo, v_mi_elo, false, false, null::text, v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      null::integer, null::integer, v_duel.clasificatorio;
    return;
  end if;

  select * into v_mi from public.duel_results where duel_id = p_duel_id and user_id = v_user;
  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

  v_actual := case
    when v_mi.puntaje_final > v_otro.puntaje_final then 1
    when v_mi.puntaje_final < v_otro.puntaje_final then 0
    else 0.5
  end;

  update public.duels
    set estado = 'completado',
        ganador_id = case when v_actual = 0.5 then null
                          when v_actual = 1 then v_user
                          else v_otro_id end
    where id = p_duel_id;

  if v_duel.modo = 'mejor_de_3' then
    -- Ninguna tarjeta de "resultado de duelo" acá — esto es UNA ronda de
    -- una serie de 3, no el resultado final. Esa tarjeta la genera
    -- finalizar_serie_si_corresponde, una sola vez, cuando la serie
    -- entera ya está decidida.
    return query select true, v_mi_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio;
    return;
  end if;

  -- Fase 5: tarjeta de "resultado de duelo" para quien ganó — se genera
  -- acá (no en la API en TypeScript) porque es el único lugar que ya
  -- sabe con certeza que el duelo se acaba de resolver de verdad, sin
  -- volver a derivar esa lógica en otro lado. Nunca para empates.
  if v_actual = 1 then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_user, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_otro_id), p_duel_id);
  elsif v_actual = 0 then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_otro_id, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_user), p_duel_id);
  end if;

  if not v_duel.clasificatorio then
    return query select true, v_mi_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio;
    return;
  end if;

  v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));
  v_nuevo_elo := round(v_mi_elo + v_k * (v_actual - v_esperado));
  v_rango_anterior := public.rango_de_elo(v_mi_elo);
  v_rango_nuevo := public.rango_de_elo(v_nuevo_elo);

  update public.profiles set elo_rating = v_nuevo_elo where id = v_user;
  update public.profiles
    set elo_rating = round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)))
    where id = v_otro_id;

  if v_rango_nuevo <> v_rango_anterior then
    perform public.desbloquear_titulo(v_user, 'rango_' || v_rango_nuevo, initcap(v_rango_nuevo), 'rango');
    insert into public.feed_posts (user_id, tipo, rango_nuevo) values (v_user, 'subida_rango', v_rango_nuevo);
  end if;

  return query
    select true, v_nuevo_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio;
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb) to authenticated;

-- ---------- finalizar_serie_si_corresponde: + tarjetas de resultado/rango ----------
create or replace function public.finalizar_serie_si_corresponde(p_serie_id uuid)
returns table (
  finalizada boolean, gane boolean, empate boolean, elo_nuevo integer, elo_anterior integer,
  victorias_propias smallint, victorias_rival smallint, oponente_id uuid, oponente_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_primera record;
  v_otro_id uuid;
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
  v_k constant integer := 20;
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
      (select display_name from public.profiles where id = v_otro_id);
    return;
  end if;

  update public.duels set serie_finalizada = true
  where serie_id = p_serie_id and serie_finalizada = false;
  get diagnostics v_filas_actualizadas = row_count;

  if v_filas_actualizadas > 0 then
    select elo_rating into v_mi_elo from public.profiles where id = v_user;
    select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

    v_actual := case
      when v_victorias_mias > v_victorias_otro then 1
      when v_victorias_mias < v_victorias_otro then 0
      else 0.5
    end;
    v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));

    if v_user = v_primera.retador_id then
      v_nuevo_elo_retador := round(v_mi_elo + v_k * (v_actual - v_esperado));
      v_nuevo_elo_retado := round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)));
    else
      v_nuevo_elo_retado := round(v_mi_elo + v_k * (v_actual - v_esperado));
      v_nuevo_elo_retador := round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)));
    end if;

    update public.duels
      set serie_elo_retador_antes = case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end,
          serie_elo_retado_antes = case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end
      where serie_id = p_serie_id and ronda_numero = 1;

    update public.profiles set elo_rating = v_nuevo_elo_retador where id = v_primera.retador_id;
    update public.profiles set elo_rating = v_nuevo_elo_retado where id = v_primera.retado_id;

    -- Fase 5: resultado de la serie, para quien ganó 2-1/2-0 — este
    -- bloque corre una sola vez por serie (adentro del guard atómico de
    -- filas_actualizadas > 0), sin importar cuál de los dos disparó la
    -- finalización. victorias_mias/otro ya están en términos de
    -- retador/retado (contadas desde el arranque de la función, no
    -- desde v_actual), así que se resuelven directo, sin depender de
    -- quién llamó.
    if v_victorias_mias <> v_victorias_otro then
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

  return query select true, v_gane, v_empate, v_mi_elo, v_mi_elo_anterior,
    v_victorias_mias, v_victorias_otro, v_otro_id,
    (select display_name from public.profiles where id = v_otro_id);
end;
$$;

grant execute on function public.finalizar_serie_si_corresponde(uuid) to authenticated;
