-- ============================================================
-- Prodigia — Corrección del mapeo de dificultad por rango en Rankeds.
--
-- El pedido original NO era restringir contenido — era que TODO el
-- contenido de cada mundo esté disponible, con temas/complejidad
-- desbloqueados progresivamente por rango. `categoria_aleatoria_por_rango`
-- (0043) usaba 3 umbrales de ELO sueltos que no coincidían con los 6
-- rangos reales de `rango_de_elo` (bronce/plata/oro/platino/diamante/
-- prodigio), y solo gateaba QUÉ categoría, nunca CUÁN compleja — dos
-- rivales de rango altísimo podían terminar con secuencias de Memoria
-- cortitas si su `logic_skill_levels` personal (progresión de práctica
-- solitaria, un sistema totalmente aparte del ELO) todavía era bajo.
--
-- Numeria queda AFUERA de esta migración a propósito: el mapeo pedido
-- (Bronce=Suma/Resta, Plata=+Mult/Div, Oro=+Fracciones, Platino=+Decimales,
-- Diamante=+Potencias, Prodigio=+Álgebra) requiere que fracciones,
-- decimales, potencias y álgebra puedan jugarse EN UN DUELO — hoy son
-- rutas de práctica 100% solitarias (/practica/fracciones, /decimales,
-- /potencias, /algebra), sin semilla compartida, sin sincronización, sin
-- integración a duelos en absoluto. Extender eso es un desarrollo grande
-- (generador con semilla + UI de duelo + ELO para 4 temas nuevos),
-- deliberadamente pospuesto a una tanda aparte — ver docs/PROGRESO.md.
-- Correr después de 0047_rechazar_duelo.sql
-- ============================================================

create or replace function public.categoria_aleatoria_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1500 then
    -- Diamante y Prodigio: las 4 categorías ya están desbloqueadas acá
    -- (la diferencia entre estos dos rangos es de COMPLEJIDAD, no de
    -- categoría — ver nivel_enigmia_por_rango).
    v_opciones := array['memoria', 'patrones', 'deduccion', 'computacional'];
  elsif p_elo_promedio >= 1300 then
    v_opciones := array['memoria', 'patrones', 'deduccion']; -- Platino: + Deducción
  elsif p_elo_promedio >= 900 then
    v_opciones := array['memoria', 'patrones']; -- Oro y Plata: Memoria + Patrones
  else
    v_opciones := array['patrones']; -- Bronce: solo Patrones
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- Complejidad (1-10, mismo parámetro "dificultad" que ya reciben los
-- generadores de src/lib/enigmia/generadores.ts — más alto = secuencias
-- más largas en Memoria, progresiones más difíciles en Patrones, más
-- pasos en Pensamiento computacional). Es lo que le faltaba al mapeo de
-- ayer: sin esto, Oro (secuencias más largas que Plata, según el pedido)
-- terminaba indistinguible de Plata.
create or replace function public.nivel_enigmia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when p_elo_promedio >= 1700 then 10::smallint                        -- Prodigio: máxima complejidad
    when p_elo_promedio >= 1500 then (8 + floor(random() * 2))::smallint  -- Diamante: 8-9
    when p_elo_promedio >= 1300 then (6 + floor(random() * 2))::smallint  -- Platino: 6-7
    when p_elo_promedio >= 1100 then (4 + floor(random() * 2))::smallint  -- Oro: 4-5, secuencias más largas que Plata
    when p_elo_promedio >= 900  then (2 + floor(random() * 2))::smallint  -- Plata: 2-3
    else 1::smallint                                                       -- Bronce: secuencias cortas
  end;
$$;

alter table public.duels add column if not exists nivel_enigmia smallint;

-- buscar_rival_duelo: setea nivel_enigmia al crear el duelo (mismo
-- criterio que nivel_numeria — decidido UNA vez, no recalculado en cada
-- fetch, porque nivel_enigmia_por_rango usa random()).
create or replace function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null)
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
        modo, serie_id, ronda_numero, ronda_total, nivel_numeria, nivel_enigmia
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
        case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end,
        case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end
      );
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo, nivel_numeria, nivel_enigmia
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
      case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end,
      case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text) to authenticated;

-- obtener_duelo: el campo genérico "nivel" ahora también sale de
-- nivel_enigmia cuando corresponde (antes solo tenía fallback para
-- Numeria; Enigmia ni siquiera lo leía del lado del cliente, así que
-- esto es aditivo, no rompe nada existente).
create or replace function public.obtener_duelo(p_duel_id uuid)
returns table (
  operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text,
  rival_nombre text, mi_elo integer, rival_elo integer,
  rival_ya_jugo boolean, rival_respuestas jsonb,
  mundo text, sub_tipo text, modo text, serie_id uuid, ronda_numero smallint, ronda_total smallint,
  mi_titulo_nombre text, rival_titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_rival_id uuid;
  v_mi_elo integer;
  v_rival_elo integer;
  v_promedio numeric;
  v_rival_resultado record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  v_rival_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;
  select elo_rating into v_rival_elo from public.profiles where id = v_rival_id;
  v_promedio := (v_mi_elo + v_rival_elo) / 2.0;

  select * into v_rival_resultado from public.duel_results where duel_id = p_duel_id and user_id = v_rival_id;

  return query
    select v_duel.operation_type,
      case
        when v_duel.mundo = 'numeria' then coalesce(v_duel.nivel_numeria, greatest(1, least(10, round(3 + (v_promedio - 1200) / 100)))::smallint)
        when v_duel.mundo = 'enigmia' then coalesce(v_duel.nivel_enigmia, 5::smallint)
        else null
      end,
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo,
      (v_rival_resultado.user_id is not null), v_rival_resultado.respuestas,
      v_duel.mundo, v_duel.sub_tipo, v_duel.modo, v_duel.serie_id, v_duel.ronda_numero, v_duel.ronda_total,
      public.titulo_nombre_de(v_user), public.titulo_nombre_de(v_rival_id);
end;
$$;

grant execute on function public.obtener_duelo(uuid) to authenticated;
