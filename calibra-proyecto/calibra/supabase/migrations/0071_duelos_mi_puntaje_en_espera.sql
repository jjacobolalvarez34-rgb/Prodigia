-- ============================================================
-- Prodigia — Fase 3 de "Duelos: llevar el progreso en vivo...":
-- cuando terminás tu parte de un duelo antes que tu rival,
-- registrar_resultado_duelo() ya devolvía tu precisión y tiempo
-- promedio (mi_precision/mi_tiempo_promedio, vía p_precision/
-- p_tiempo_promedio) en la rama "todavía no resuelto" — pero
-- mi_puntaje quedaba hardcodeado en null::integer pese a que el
-- puntaje ya se había insertado en duel_results un par de líneas
-- antes (p_puntaje). Sin esto, la pantalla de "esperando al
-- rival" no podía mostrar tu propio puntaje ya calculado.
-- Firma de RETURNS TABLE sin cambios — alcanza con create or replace.
-- ============================================================

create or replace function public.registrar_resultado_duelo(
  p_duel_id uuid,
  p_precision numeric,
  p_tiempo_promedio numeric,
  p_puntaje integer,
  p_respuestas jsonb default null
)
returns table (
  resuelto boolean, elo_nuevo integer, elo_anterior integer, gane boolean, empate boolean,
  oponente_nombre text, oponente_id uuid, mundo text, modo text, ronda_numero smallint, ronda_total smallint,
  mi_puntaje integer, rival_puntaje integer, clasificatorio boolean, oponente_es_bot boolean,
  mi_precision numeric, mi_tiempo_promedio numeric, rival_precision numeric, rival_tiempo_promedio numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_otro_id uuid;
  v_otro_es_bot boolean;
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
  select es_bot into v_otro_es_bot from public.profiles where id = v_otro_id;

  select * into v_otro from public.duel_results where duel_id = p_duel_id and user_id = v_otro_id;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if v_otro.user_id is null then
    -- Fase 3: mi_puntaje ya está disponible (p_puntaje, recién
    -- insertado arriba) aunque el rival no haya terminado todavía.
    return query select false, v_mi_elo, v_mi_elo, false, false, null::text, v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      p_puntaje, null::integer, v_duel.clasificatorio, v_otro_es_bot,
      p_precision, p_tiempo_promedio, null::numeric, null::numeric;
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
    return query select true, v_mi_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio, v_otro_es_bot,
      v_mi.precision, v_mi.tiempo_promedio, v_otro.precision, v_otro.tiempo_promedio;
    return;
  end if;

  if v_actual = 1 and not coalesce(v_otro_es_bot, false) then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_user, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_otro_id), p_duel_id);
  elsif v_actual = 0 and not coalesce(v_otro_es_bot, false) then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_otro_id, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_user), p_duel_id);
  end if;

  if not v_duel.clasificatorio then
    return query select true, v_mi_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio, v_otro_es_bot,
      v_mi.precision, v_mi.tiempo_promedio, v_otro.precision, v_otro.tiempo_promedio;
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
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio, v_otro_es_bot,
      v_mi.precision, v_mi.tiempo_promedio, v_otro.precision, v_otro.tiempo_promedio;
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb) to authenticated;
