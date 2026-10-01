-- ============================================================
-- 0244 — Duelos amistosos sin ELO y casuales contra cualquiera
-- ============================================================
-- Bug (reportado 2026-10-01): duels.clasificatorio tiene default TRUE
-- (0050_duelos_casuales.sql), y solo buscar_rival_duelo lo setea a mano.
-- Todo duelo creado por otro camino quedaba como Ranked y movía el ELO:
--   - retar a un amigo (/api/amigos/retar y la app, insert directo),
--   - retar desde el feed (/api/feed/retar, insert directo),
--   - unirse a un enlace de invitación (unirse_invitacion_duelo, 0130).
--
-- Arreglo en dos capas:
--   1) El default pasa a FALSE: un duelo es amistoso salvo que el
--      matchmaking diga lo contrario (buscar_rival_duelo ya manda el valor
--      explícito en sus dos inserts, ver 0189).
--   2) Trigger: un INSERT hecho directo por un cliente (rol authenticated,
--      no una función security definer) siempre queda amistoso. Así nadie
--      puede crear un "ranked" contra un amigo para inflarse el ELO.
-- Además se corrigen los duelos de amigos que hoy siguen pendientes.
--
-- Y (pedido 2026-10-01) el duelo CASUAL ya no busca a alguien de tu rango:
-- toma a cualquiera que esté buscando casual en esa ciudad, al azar.
-- buscar_rival_duelo se redefine desde su versión vigente (0189), cambiando
-- solo la elección del rival (y del bot de respaldo) cuando p_ranked = false.
-- ============================================================

alter table public.duels alter column clasificatorio set default false;

create or replace function public.duelo_directo_es_amistoso()
returns trigger
language plpgsql
as $$
begin
  -- Dentro de una función security definer (matchmaking) current_user es
  -- el dueño de la función, no "authenticated": ahí se respeta el valor.
  if current_user = 'authenticated' then
    new.clasificatorio := false;
  end if;
  return new;
end;
$$;

drop trigger if exists duelo_directo_es_amistoso on public.duels;
create trigger duelo_directo_es_amistoso
  before insert on public.duels
  for each row execute function public.duelo_directo_es_amistoso();

-- Duelos de amigos o de invitación todavía pendientes: buscar_rival_duelo
-- siempre guarda el nivel de la ciudad del duelo (nivel_<mundo>, 0189); un
-- insert directo no guarda ninguno. Geografía no tiene columna de nivel (usa
-- el continente), así que se deja afuera para no tocar un ranked real.
update public.duels
set clasificatorio = false
where estado = 'pendiente'
  and clasificatorio
  and serie_id is null
  and mundo <> 'geografia'
  and coalesce(nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia,
               nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia) is null;

-- ---------- Casual: rival al azar ----------
create or replace function public.buscar_rival_duelo(p_mundo text, p_operation_type text default null, p_ranked boolean default true)
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
  v_es_bot boolean := false;
  v_velocidad_min_bot integer;
  v_velocidad_max_bot integer;
  v_tasa_bot numeric;
  v_duel_id uuid;
  v_this_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
  v_nivel_num smallint;
  v_nivel_enig smallint;
  v_nivel_quim smallint;
  v_nivel_anat smallint;
  v_nivel_melo smallint;
  v_nivel_trig smallint;
  v_nivel_hist smallint;
  v_nivel_calc smallint;
  v_nivel_circ smallint;
  v_nivel_esta smallint;
  v_nivel_naip smallint;
  v_nivel_codi smallint;
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if p_ranked and p_mundo <> 'aleatorio' and v_mi_elo >= 1300 then
    raise exception 'desde Platino solo se puede jugar "Todas las ciudades" en clasificatoria';
  end if;

  delete from public.duel_queue where last_seen_at < now() - interval '2 minutes';

  insert into public.duel_queue (user_id, operation_type, elo_rating, mundo, clasificatorio, entered_at, last_seen_at)
  values (v_user, p_operation_type, v_mi_elo, p_mundo, p_ranked, now(), now())
  on conflict (user_id) do update
    set operation_type = excluded.operation_type,
        elo_rating = excluded.elo_rating,
        mundo = excluded.mundo,
        clasificatorio = excluded.clasificatorio,
        entered_at = case
          when public.duel_queue.mundo <> excluded.mundo
            or public.duel_queue.clasificatorio <> excluded.clasificatorio
            or coalesce(public.duel_queue.operation_type, '') <> coalesce(excluded.operation_type, '')
          then now()
          else public.duel_queue.entered_at
        end,
        last_seen_at = now();

  select entered_at into v_entered from public.duel_queue where user_id = v_user;
  v_segundos := greatest(0, extract(epoch from (now() - v_entered))::integer);
  v_rango := least(300, 30 + (v_segundos / 10) * 30);

  -- Ranked: rival del rango más parecido (el margen crece con la espera).
  -- Casual (0244): cualquiera que esté buscando en esa ciudad, al azar, sin
  -- mirar el ELO — es para jugar con alguien, no para medirse.
  if p_ranked then
    select * into v_rival
    from public.duel_queue q
    where q.user_id <> v_user
      and q.mundo = p_mundo
      and q.clasificatorio = p_ranked
      and abs(q.elo_rating - v_mi_elo) <= v_rango
      and q.last_seen_at >= now() - interval '10 seconds'
    order by abs(q.elo_rating - v_mi_elo) asc
    for update skip locked
    limit 1;
  else
    select * into v_rival
    from public.duel_queue q
    where q.user_id <> v_user
      and q.mundo = p_mundo
      and q.clasificatorio = false
      and q.last_seen_at >= now() - interval '10 seconds'
    order by random()
    for update skip locked
    limit 1;
  end if;

  if v_rival.user_id is null and v_mi_elo < 1300 and v_segundos >= 30 then
    select p.id, p.elo_rating, m.velocidad_ms_min, m.velocidad_ms_max, m.tasa_acierto
      into v_bot_id, v_bot_elo, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot
    from public.clan_miembros m
    join public.profiles p on p.id = m.perfil_id
    order by case when p_ranked then abs(p.elo_rating - v_mi_elo) else random() * 100000 end asc
    limit 1;
    if v_bot_id is not null then
      v_rival.user_id := v_bot_id;
      v_rival.elo_rating := v_bot_elo;
      v_es_bot := true;
    end if;
  end if;

  if v_rival.user_id is null then
    return query select null::uuid, false, v_rango, v_segundos, null::text;
    return;
  end if;

  delete from public.duel_queue where user_id in (v_user, v_rival.user_id);

  v_elo_promedio := (v_mi_elo + v_rival.elo_rating) / 2.0;

  if p_mundo = 'aleatorio' then
    v_serie_id := gen_random_uuid();
    for v_i in reverse array_length(v_mundos, 1)..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    -- "Mejor de 3": siempre 3 rondas aunque v_mundos tenga más
    -- elementos después del shuffle.
    for v_i in 1..3 loop
      v_nivel_num := case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
      v_nivel_enig := case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
      v_nivel_quim := case when v_mundos[v_i] = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
      v_nivel_anat := case when v_mundos[v_i] = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
      v_nivel_melo := case when v_mundos[v_i] = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
      v_nivel_trig := case when v_mundos[v_i] = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
      v_nivel_hist := case when v_mundos[v_i] = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
      v_nivel_calc := case when v_mundos[v_i] = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;
      v_nivel_circ := case when v_mundos[v_i] = 'circuitia' then public.nivel_circuitia_por_rango(v_elo_promedio) else null end;
      v_nivel_esta := case when v_mundos[v_i] = 'estadistica' then public.nivel_estadistica_por_rango(v_elo_promedio) else null end;
      v_nivel_naip := case when v_mundos[v_i] = 'naipia' then public.nivel_naipia_por_rango(v_elo_promedio) else null end;
      v_nivel_codi := case when v_mundos[v_i] = 'codia' then public.nivel_codia_por_rango(v_elo_promedio) else null end;

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total,
        nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, clasificatorio
      ) values (
        v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
        case when v_mundos[v_i] = 'numeria'
          then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
          else null end,
        v_mundos[v_i],
        case
          when v_mundos[v_i] = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'circuitia' then public.modo_circuitia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'estadistica' then public.modo_estadistica_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'naipia' then public.modo_naipia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'codia' then public.modo_codia_aleatorio_por_rango(v_elo_promedio)
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(
          v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi,
          greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
        );
        select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
        insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
        values (v_this_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
      end if;
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
    v_nivel_num := case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
    v_nivel_enig := case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
    v_nivel_quim := case when p_mundo = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;
    v_nivel_anat := case when p_mundo = 'anatomia' then public.nivel_anatomia_por_rango(v_elo_promedio) else null end;
    v_nivel_melo := case when p_mundo = 'melodia' then public.nivel_melodia_por_rango(v_elo_promedio) else null end;
    v_nivel_trig := case when p_mundo = 'trigonometria' then public.nivel_trigonometria_por_rango(v_elo_promedio) else null end;
    v_nivel_hist := case when p_mundo = 'historia' then public.nivel_historia_por_rango(v_elo_promedio) else null end;
    v_nivel_calc := case when p_mundo = 'calculia' then public.nivel_calculia_por_rango(v_elo_promedio) else null end;
    v_nivel_circ := case when p_mundo = 'circuitia' then public.nivel_circuitia_por_rango(v_elo_promedio) else null end;
    v_nivel_esta := case when p_mundo = 'estadistica' then public.nivel_estadistica_por_rango(v_elo_promedio) else null end;
    v_nivel_naip := case when p_mundo = 'naipia' then public.nivel_naipia_por_rango(v_elo_promedio) else null end;
    v_nivel_codi := case when p_mundo = 'codia' then public.nivel_codia_por_rango(v_elo_promedio) else null end;

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo,
      nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, clasificatorio
    ) values (
      v_user, v_rival.user_id, floor(random() * 1000000000)::bigint,
      case when p_mundo = 'numeria'
        then (array['suma', 'resta', 'multiplicacion', 'division'])[1 + floor(random() * 4)::int]
        else null end,
      p_mundo,
      case
        when p_mundo = 'geografia' then public.continente_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'enigmia' then public.categoria_aleatoria_por_rango(v_elo_promedio)
        when p_mundo = 'quimia' then public.modo_quimia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'anatomia' then public.modo_anatomia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'melodia' then public.modo_melodia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'trigonometria' then public.modo_trigonometria_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'historia' then public.modo_historia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'calculia' then public.modo_calculia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'circuitia' then public.modo_circuitia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'estadistica' then public.modo_estadistica_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'naipia' then public.modo_naipia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'codia' then public.modo_codia_aleatorio_por_rango(v_elo_promedio)
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi,
        greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint
      );
      select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
      insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
      values (v_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
    end if;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;
grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;

-- ---------- 15) obtener_duelo(): + estadistica/naipia/codia (base real: 0167) ----------
drop function if exists public.obtener_duelo(uuid);

create function public.obtener_duelo(p_duel_id uuid)
returns table (
  operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text,
  rival_nombre text, mi_elo integer, rival_elo integer,
  rival_ya_jugo boolean, rival_respuestas jsonb,
  mundo text, sub_tipo text, modo text, serie_id uuid, ronda_numero smallint, ronda_total smallint,
  mi_titulo_nombre text, rival_titulo_nombre text, rival_es_bot boolean
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
        when v_duel.mundo = 'quimia' then coalesce(v_duel.nivel_quimia, 5::smallint)
        when v_duel.mundo = 'anatomia' then coalesce(v_duel.nivel_anatomia, 5::smallint)
        when v_duel.mundo = 'melodia' then coalesce(v_duel.nivel_melodia, 5::smallint)
        when v_duel.mundo = 'trigonometria' then coalesce(v_duel.nivel_trigonometria, 5::smallint)
        when v_duel.mundo = 'historia' then coalesce(v_duel.nivel_historia, 5::smallint)
        when v_duel.mundo = 'calculia' then coalesce(v_duel.nivel_calculia, 5::smallint)
        when v_duel.mundo = 'circuitia' then coalesce(v_duel.nivel_circuitia, 5::smallint)
        when v_duel.mundo = 'estadistica' then coalesce(v_duel.nivel_estadistica, 5::smallint)
        when v_duel.mundo = 'naipia' then coalesce(v_duel.nivel_naipia, 5::smallint)
        when v_duel.mundo = 'codia' then coalesce(v_duel.nivel_codia, 5::smallint)
        else null
      end,
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo,
      (v_rival_resultado.user_id is not null), v_rival_resultado.respuestas,
      v_duel.mundo, v_duel.sub_tipo, v_duel.modo, v_duel.serie_id, v_duel.ronda_numero, v_duel.ronda_total,
      public.titulo_nombre_de(v_user), public.titulo_nombre_de(v_rival_id),
      (select es_bot from public.profiles where id = v_rival_id);
end;
$$;


grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;

notify pgrst, 'reload schema';
