-- ============================================================
-- Prodigia — Rankeds: Duelos Casuales (Fase 2 del rediseño de
-- Ranking/Social). Mismo matchmaking y mismo contenido graduado por
-- nivel que Clasificatoria, pero sin tocar el ELO y siempre en formato
-- simple (nunca "todas las ciudades"). "Clasificatorio" default TRUE
-- preserva el comportamiento actual de TODOS los duelos existentes
-- (matchmaking de Rankeds, reto a un amigo, invitación por link) — la
-- única forma de generar un duelo con clasificatorio=false es pasando
-- p_ranked=false explícitamente al matchmaking nuevo.
-- Correr después de 0049_ranking_amigos.sql
-- ============================================================

alter table public.duel_queue add column if not exists clasificatorio boolean not null default true;
alter table public.duels add column if not exists clasificatorio boolean not null default true;

drop function if exists public.buscar_rival_duelo(text, text);

create function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null, p_ranked boolean default true)
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
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  insert into public.duel_queue (user_id, operation_type, elo_rating, mundo, clasificatorio, entered_at)
  values (v_user, p_operation_type, v_mi_elo, p_mundo, p_ranked, now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type,
        elo_rating = excluded.elo_rating,
        mundo = excluded.mundo,
        clasificatorio = excluded.clasificatorio,
        entered_at = now()
    where public.duel_queue.mundo <> excluded.mundo
       or public.duel_queue.clasificatorio <> excluded.clasificatorio
       or coalesce(public.duel_queue.operation_type, '') <> coalesce(excluded.operation_type, '');

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);
  v_rango := least(300, 30 + (v_segundos / 10) * 30);

  -- Clasificatoria y Casual nunca se emparejan entre sí — si no, el
  -- perdedor de un duelo "sin ELO" para uno de los dos lados pero "con
  -- ELO" para el otro sería incoherente.
  select * into v_rival
  from public.duel_queue q
  where q.user_id <> v_user
    and q.mundo = p_mundo
    and q.clasificatorio = p_ranked
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
    -- p_ranked siempre true acá (guard de arriba) — sin cambios en esta rama.
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
        modo, serie_id, ronda_numero, ronda_total, nivel_numeria, nivel_enigmia, clasificatorio
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
        case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end,
        true
      );
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo, nivel_numeria, nivel_enigmia, clasificatorio
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
      case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;

-- registrar_resultado_duelo: si el duelo no es clasificatorio, se
-- resuelve igual (gana/empata, se guarda en el historial) pero el ELO
-- de los dos jugadores queda intacto — mismo criterio que ya usaba la
-- rama de mejor_de_3 (esa resuelve la ronda sin tocar ELO todavía).
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
  v_k constant integer := 13; -- Fase 3: K bajo para duelo de ciudad específica
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
    return query select true, v_mi_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio;
    return;
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
    perform public.desbloquear_titulo(
      v_user, 'rango_' || v_rango_nuevo,
      initcap(v_rango_nuevo), 'rango'
    );
  end if;

  return query
    select true, v_nuevo_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      v_mi.puntaje_final, v_otro.puntaje_final, v_duel.clasificatorio;
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb) to authenticated;

-- Estadística casual aparte — nunca genera rango propio, solo un
-- contador informativo (Mi competitivo).
create or replace function public.mis_stats_casual()
returns table (victorias integer, derrotas integer, empates integer)
language sql
security definer
set search_path = public
as $$
  select
    count(*) filter (where d.ganador_id = auth.uid())::integer,
    count(*) filter (where d.estado = 'completado' and d.ganador_id is not null and d.ganador_id <> auth.uid())::integer,
    count(*) filter (where d.estado = 'completado' and d.ganador_id is null)::integer
  from public.duels d
  where (d.retador_id = auth.uid() or d.retado_id = auth.uid())
    and d.estado = 'completado'
    and d.clasificatorio = false;
$$;

grant execute on function public.mis_stats_casual() to authenticated;

-- mi_historial_duelos: agrega clasificatorio para poder distinguir cada
-- fila del historial en la UI (Casual vs Clasificatoria).
drop function if exists public.mi_historial_duelos(integer);

create function public.mi_historial_duelos(p_limite integer default 20)
returns table (
  duel_id uuid,
  operation_type text,
  mundo text,
  sub_tipo text,
  modo text,
  clasificatorio boolean,
  creado_at timestamptz,
  rival_nombre text,
  rival_titulo_nombre text,
  mi_puntaje integer,
  rival_puntaje integer,
  gane boolean,
  empate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  return query
    select
      d.id,
      d.operation_type,
      d.mundo,
      d.sub_tipo,
      d.modo,
      d.clasificatorio,
      d.creado_at,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      public.titulo_nombre_de(case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      mi.puntaje_final,
      otro.puntaje_final,
      (d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null)
    from public.duels d
    join public.duel_results mi on mi.duel_id = d.id and mi.user_id = v_user
    join public.duel_results otro on otro.duel_id = d.id and otro.user_id <> v_user
    where (d.retador_id = v_user or d.retado_id = v_user) and d.estado = 'completado'
      and d.modo = 'simple'
    order by d.creado_at desc
    limit p_limite;
end;
$$;

grant execute on function public.mi_historial_duelos(integer) to authenticated;
