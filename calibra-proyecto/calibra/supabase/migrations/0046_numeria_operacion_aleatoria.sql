-- ============================================================
-- Prodigia — Rankeds: en Numeria la operación (suma/resta/multiplicación/
-- división) pasa a elegirse al azar en cada duelo, igual que ya pasa con
-- el continente de Geografía y la categoría de Enigmia — deja de ser una
-- elección manual del jugador en "Buscar partida", mismo criterio en los
-- 3 mundos. Como consecuencia, el matchmaking ya no empareja por
-- operación en la cola de Numeria (no tendría sentido: nadie elige más
-- una operación puntual para esperar).
-- Correr después de 0045_serie_elo_simetrico.sql
--
-- p_operation_type se deja en la firma para no romper al cliente viejo
-- que todavía pueda estar mandando algo ahí — simplemente se ignora para
-- decidir la operación real, que ahora siempre sale de
-- ARITHMETIC_OPS_ALEATORIA acá abajo (ronda simple) o del sorteo que ya
-- existía para el modo "todas las ciudades" (sin cambios en esa rama).
-- ============================================================

drop function if exists public.buscar_rival_duelo(text, text);

create function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null)
returns table (duel_id uuid, encontrado boolean, rango_actual integer, segundos_esperando integer, mundo_encontrado text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mi_elo integer;
  v_entered timestamptz;
  v_rango integer;
  v_segundos integer;
  v_rival record;
  v_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  insert into public.duel_queue (user_id, operation_type, elo_rating, mundo, entered_at)
  values (v_user, p_operation_type, v_mi_elo, p_mundo, now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type,
        elo_rating = excluded.elo_rating,
        mundo = excluded.mundo,
        entered_at = now()
    where public.duel_queue.mundo <> excluded.mundo
       or coalesce(public.duel_queue.operation_type, '') <> coalesce(excluded.operation_type, '');

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);
  v_rango := least(300, 30 + (v_segundos / 10) * 30);

  -- Ya no filtra por operation_type: la operación de Numeria se sortea
  -- recién al crear el duelo, no es más un criterio de emparejamiento.
  select * into v_rival
  from public.duel_queue q
  where q.user_id <> v_user
    and q.mundo = p_mundo
    and abs(q.elo_rating - v_mi_elo) <= v_rango
  order by abs(q.elo_rating - v_mi_elo) asc
  for update skip locked
  limit 1;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos, null::text;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  v_elo_promedio := (v_mi_elo + v_rival.elo_rating) / 2.0;

  if p_mundo = 'aleatorio' then
    -- Fase 5: mejor de 3, una ronda por cada una de las 3 ciudades, en
    -- orden al azar (Fisher-Yates de un array de 3 — "sin repetir
    -- mientras haya mundos disponibles" queda cumplido automáticamente
    -- porque son exactamente 3 rondas para 3 mundos, cada uno una vez).
    v_serie_id := gen_random_uuid();
    for v_i in reverse 3..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    for v_i in 1..3 loop
      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total, nivel_numeria
      ) values (
        v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
        case when v_mundos[v_i] = 'numeria'
          then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
          else null end,
        v_mundos[v_i],
        case
          when v_mundos[v_i] = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end
      );
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo, nivel_numeria
    ) values (
      v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
      case when p_mundo = 'numeria'
        then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
        else null end,
      p_mundo,
      case
        when p_mundo = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
        else null
      end,
      'simple',
      case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text) to authenticated;
