-- ============================================================
-- Prodigia — Rankeds: la Gran Alineación vale doble, reinicio suave de temporada,
-- bots en Platino y Diamante, y logros de rango en la escala nueva (0302).
--
-- Pedidos del usuario (2026-10-23):
-- 1) «En la Gran Alineación, x2 de ELO, /2 de pérdida, después se reinicia la
--    temporada; no puede ser tanto o desmotiva.» Durante las 3 horas de la
--    Alineación, lo que ganas de ELO se duplica y lo que pierdes se reduce a la
--    mitad (un disparador antes de guardar el ELO, sirve para cualquier función que
--    lo cambie). La temporada ahora termina al ACABAR la Alineación (no al empezar),
--    así esas 3 horas son el cierre. Al empezar la temporada nueva, el reinicio suave:
--    solo por encima de Oro (1400) se recorta un cuarto de lo que pasa de 1400
--    (Diamante 2000 → 1850; 2300 → 2075; Platino 1700 → 1625). Nadie baja de Oro.
-- 2) «Agrega bots también en Platino»: los bots ya no se cortan en Platino, y los
--    6 bots más altos pasan a Platino/Diamante para que haya con quién subir.
-- 3) «Me sale "llegaste a Diamante" y luego "llegaste a Prodigio"»: los logros de
--    rango seguían con la escala vieja (900…1700). Pasan a la nueva y Prodigio es
--    estar en el top 100 (con 2000 o más). Se quitan los que se dieron mal tras la
--    conversión del 22/10 y se descuentan sus Cometas.
-- Idempotente.
-- ============================================================

-- ---------- 3) Logros de rango en la escala nueva ----------
update public.achievements set criterio = '{"tipo": "elo_minimo", "valor": 1100}' where slug = 'rango-plata';
update public.achievements set criterio = '{"tipo": "elo_minimo", "valor": 1400}' where slug = 'rango-oro';
update public.achievements set criterio = '{"tipo": "elo_minimo", "valor": 1700}' where slug = 'rango-platino';
update public.achievements set criterio = '{"tipo": "elo_minimo", "valor": 2000}' where slug = 'rango-diamante';
update public.achievements set criterio = '{"tipo": "rango_prodigio"}', descripcion = 'Entraste al top 100 de Rankeds con 2000 de ELO o más.' where slug = 'rango-prodigio';

-- Los que se dieron después de la conversión sin cumplir el umbral nuevo: se quitan
-- y se descuentan las Cometas que dieron (una sola vez, por la referencia).
do $$
declare
  r record;
begin
  for r in
    select ua.user_id, ua.achievement_id, cm.cantidad
    from public.user_achievements ua
    join public.achievements a on a.id = ua.achievement_id
    join public.profiles pr on pr.id = ua.user_id
    left join public.cometas_movimientos cm on cm.user_id = ua.user_id and cm.referencia = 'logro:' || ua.achievement_id
    where a.slug in ('rango-plata', 'rango-oro', 'rango-platino', 'rango-diamante', 'rango-prodigio')
      and ua.desbloqueado_at >= timestamptz '2026-10-22 13:00:00+00'
      and pr.elo_rating < case a.slug when 'rango-plata' then 1100 when 'rango-oro' then 1400 when 'rango-platino' then 1700 else 2000 end
  loop
    delete from public.user_achievements ua where ua.user_id = r.user_id and ua.achievement_id = r.achievement_id;
    if coalesce(r.cantidad, 0) > 0 then
      perform public._dar_cometas(r.user_id, -r.cantidad, 'correccion', 'correccion:logro:' || r.achievement_id);
    end if;
  end loop;
end;
$$;

-- Prodigio: top 100 sin contar bots (base 0296).
create or replace function public.umbral_prodigio()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(2000, coalesce((select min(t.elo_rating) from (select pr.elo_rating from public.profiles pr where not coalesce(pr.es_bot, false) order by pr.elo_rating desc limit 100) t), 2000));
$$;
grant execute on function public.umbral_prodigio() to anon, authenticated;

-- cometas_de_logro desde su última versión (0280): escalones de ELO nuevos y Prodigio por top 100.
create or replace function public.cometas_de_logro(p_user uuid, p_criterio jsonb)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tipo text := p_criterio ->> 'tipo';
  v_valor numeric := coalesce((p_criterio ->> 'valor')::numeric, 0);
  v_actual numeric;
  v_mundo text;
begin
  if v_tipo = 'racha_dias' then
    v_actual := public.racha_diaria_de(p_user);
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 100 then 50 when v_valor >= 30 then 30 else 10 end;
  elsif v_tipo = 'problemas_totales' then
    select count(*) into v_actual from public.attempts a where a.user_id = p_user;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 1000 then 50 when v_valor >= 500 then 30 else 10 end;
  elsif v_tipo = 'logica_problemas_totales' then
    select count(*) into v_actual from public.logic_attempts la where la.user_id = p_user;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo like '%\_problemas\_totales' then
    v_mundo := replace(v_tipo, '_problemas_totales', '');
    select count(*) into v_actual from public.attempts a where a.user_id = p_user and public.mundo_de_problem_type(a.problem_type) = v_mundo;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo like '%\_nivel\_mundo' then
    v_mundo := replace(v_tipo, '_nivel_mundo', '');
    select coalesce(max(w.nivel_mundo), 0) into v_actual from public.world_progress w where w.user_id = p_user and w.world = v_mundo;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo = 'duelos_ganados' then
    select count(*) into v_actual from public.duels d where d.ganador_id = p_user and d.clasificatorio;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 20 then 30 when v_valor >= 5 then 20 else 10 end;
  elsif v_tipo = 'elo_minimo' then
    select pr.elo_rating into v_actual from public.profiles pr where pr.id = p_user;
    if coalesce(v_actual, 0) < v_valor then return 0; end if;
    return case when v_valor >= 2000 then 30 when v_valor >= 1700 then 20 else 10 end;
  elsif v_tipo = 'rango_prodigio' then
    select pr.elo_rating into v_actual from public.profiles pr where pr.id = p_user;
    return case when coalesce(v_actual, 0) >= public.umbral_prodigio() then 50 else 0 end;
  elsif v_tipo = 'reto_diario_total' then
    select count(*) into v_actual from public.retos_diarios_completados r where r.user_id = p_user;
    return case when v_actual >= v_valor then 20 else 0 end;
  elsif v_tipo = 'reto_semanal_total' then
    select count(*) into v_actual from public.retos_semanales_completados r where r.user_id = p_user;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 20 then 30 else 20 end;
  elsif v_tipo = 'tecnicas_dominadas' then
    select count(*) into v_actual from public.technique_progress tp where tp.user_id = p_user and tp.dominado;
    return case when v_actual >= v_valor then 20 else 0 end;
  end if;
  return 0;
end;
$$;

revoke execute on function public.cometas_de_logro(uuid, jsonb) from public, anon, authenticated;

-- ---------- 1) La temporada termina al acabar la Gran Alineación ----------
-- Antes terminaba al empezar (base 0296); ahora 3 horas después, así las horas de
-- la Alineación (que valen doble) son el cierre de la temporada.
create or replace function public.temporada_ranked_de(p_momento timestamptz)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(extract(epoch from (p_momento - (timestamptz '2026-10-25 02:00:00+00' - interval '28 days'))) / (28 * 86400))::integer + 1);
$$;

create or replace function public.fin_temporada_ranked(p_temporada integer)
returns timestamptz
language sql
immutable
as $$
  select timestamptz '2026-10-25 02:00:00+00' + (p_temporada - 1) * interval '28 days';
$$;
grant execute on function public.temporada_ranked_de(timestamptz) to anon, authenticated;
grant execute on function public.fin_temporada_ranked(integer) to anon, authenticated;

-- Reinicio suave: solo por encima de Oro, se recorta un cuarto de lo que pasa de 1400.
create or replace function public._elo_tras_reinicio(p_elo integer)
returns integer
language sql
immutable
as $$
  select case when p_elo > 1400 then round(1400 + (p_elo - 1400) * 0.75)::integer else p_elo end;
$$;

-- En qué temporada ya se le aplicó el reinicio a cada jugador. Todos arrancan en la
-- temporada actual (sin reinicio ahora: el primero llega al cerrar la temporada 1).
alter table public.profiles add column if not exists temporada_reinicio integer;
update public.profiles as pr set temporada_reinicio = public.temporada_ranked_de(now()) where pr.temporada_reinicio is null;
alter table public.profiles alter column temporada_reinicio set default 0;

-- ---------- Antes de guardar cada cambio de ELO ----------
-- a) Si el jugador todavía no tuvo el reinicio de esta temporada, se aplica primero.
-- b) En la Gran Alineación, lo ganado vale el doble y lo perdido la mitad.
-- Los ajustes internos (el propio reinicio) marcan prodigia.elo_directo = '1' y pasan
-- sin tocar.
create or replace function public._ajustar_elo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t integer := public.temporada_ranked_de(now());
  v_base integer := old.elo_rating;
  v_delta integer;
begin
  if new.elo_rating is not distinct from old.elo_rating then
    return new;
  end if;
  if coalesce(current_setting('prodigia.elo_directo', true), '') = '1' then
    return new;
  end if;
  if coalesce(old.temporada_reinicio, 0) < v_t then
    v_base := public._elo_tras_reinicio(old.elo_rating);
    new.temporada_reinicio := v_t;
  end if;
  v_delta := new.elo_rating - old.elo_rating;
  if public.en_gran_alineacion() then
    v_delta := case when v_delta > 0 then v_delta * 2 else round(v_delta / 2.0)::integer end;
  end if;
  new.elo_rating := greatest(0, v_base + v_delta);
  return new;
end;
$$;
drop trigger if exists profiles_ajustar_elo on public.profiles;
create trigger profiles_ajustar_elo before update of elo_rating on public.profiles
  for each row execute function public._ajustar_elo();

-- El registro de la temporada (base 0296): no cuenta los ajustes internos, y el
-- máximo es el ELO nuevo (el viejo puede ser de la temporada anterior).
create or replace function public._registrar_elo_temporada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t integer := public.temporada_ranked_de(now());
begin
  if coalesce(current_setting('prodigia.elo_directo', true), '') = '1' then
    return new;
  end if;
  if new.elo_rating is distinct from old.elo_rating then
    insert into public.ranked_temporadas_jugador as r (user_id, temporada, elo_max, elo_final, partidas)
    values (new.id, v_t, new.elo_rating, new.elo_rating, 1)
    on conflict (user_id, temporada) do update
      set elo_max = greatest(r.elo_max, excluded.elo_max), elo_final = excluded.elo_final, partidas = r.partidas + 1;
  end if;
  return new;
end;
$$;

-- El reinicio para todos los que no lo tienen (lo corre pg_cron cada hora si está, y
-- la app al abrir con aplicar_mi_reinicio_temporada; las dos son idempotentes).
create or replace function public.reiniciar_temporada_ranked()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t integer := public.temporada_ranked_de(now());
  v_n integer;
begin
  perform set_config('prodigia.elo_directo', '1', true);
  update public.profiles as pr
    set elo_rating = public._elo_tras_reinicio(pr.elo_rating), temporada_reinicio = v_t
    where coalesce(pr.temporada_reinicio, 0) < v_t;
  get diagnostics v_n = row_count;
  perform set_config('prodigia.elo_directo', '0', true);
  return v_n;
end;
$$;
revoke execute on function public.reiniciar_temporada_ranked() from public, anon, authenticated;

create or replace function public.aplicar_mi_reinicio_temporada()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_t integer := public.temporada_ranked_de(now());
  v_elo integer;
begin
  if v_user is null then
    return null;
  end if;
  perform set_config('prodigia.elo_directo', '1', true);
  update public.profiles as pr
    set elo_rating = public._elo_tras_reinicio(pr.elo_rating), temporada_reinicio = v_t
    where pr.id = v_user and coalesce(pr.temporada_reinicio, 0) < v_t;
  perform set_config('prodigia.elo_directo', '0', true);
  select pr.elo_rating into v_elo from public.profiles pr where pr.id = v_user;
  return v_elo;
end;
$$;
revoke execute on function public.aplicar_mi_reinicio_temporada() from public, anon;
grant execute on function public.aplicar_mi_reinicio_temporada() to authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('reinicio-temporada-ranked', '11 * * * *', 'select public.reiniciar_temporada_ranked()');
  end if;
end;
$$;

-- ---------- 2) Bots en Platino y Diamante ----------
-- Los 6 bots más altos pasan a Platino/Diamante (una sola vez).
do $$
declare
  r record;
  v_i integer := 0;
  v_elos integer[] := array[2240, 2110, 1990, 1880, 1790, 1720];
begin
  if not exists (select 1 from public.migraciones_de_datos where clave = 'bots_platino_diamante') then
    perform set_config('prodigia.elo_directo', '1', true);
    for r in select pr.id from public.profiles pr where pr.es_bot order by pr.elo_rating desc limit 6 loop
      v_i := v_i + 1;
      update public.profiles as pr set elo_rating = v_elos[v_i] where pr.id = r.id;
    end loop;
    perform set_config('prodigia.elo_directo', '0', true);
    insert into public.migraciones_de_datos (clave) values ('bots_platino_diamante');
  end if;
end;
$$;

-- buscar_rival_duelo desde su última versión (0296): el bot aparece a los 30 s de
-- espera en cualquier rango (antes, solo por debajo de Platino).
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
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
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
  v_nivel_dina smallint;
  v_nivel_vita smallint;
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if p_ranked and p_mundo <> 'aleatorio' and v_mi_elo >= 1700 then
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
  v_rango := least(450, 45 + (v_segundos / 10) * 45);

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

  if v_rival.user_id is null and v_segundos >= 30 then
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
      v_nivel_dina := case when v_mundos[v_i] = 'dinamia' then public.nivel_dinamia_por_rango(v_elo_promedio) else null end;
      v_nivel_vita := case when v_mundos[v_i] = 'vitalia' then public.nivel_vitalia_por_rango(v_elo_promedio) else null end;

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total,
        nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, nivel_dinamia, nivel_vitalia, clasificatorio
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
          when v_mundos[v_i] = 'dinamia' then public.modo_dinamia_aleatorio_por_rango(v_elo_promedio)
          when v_mundos[v_i] = 'vitalia' then public.modo_vitalia_aleatorio_por_rango(v_elo_promedio)
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(
          v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
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
    v_nivel_dina := case when p_mundo = 'dinamia' then public.nivel_dinamia_por_rango(v_elo_promedio) else null end;
    v_nivel_vita := case when p_mundo = 'vitalia' then public.nivel_vitalia_por_rango(v_elo_promedio) else null end;

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo,
      nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, nivel_calculia, nivel_circuitia, nivel_estadistica, nivel_naipia, nivel_codia, nivel_dinamia, nivel_vitalia, clasificatorio
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
        when p_mundo = 'dinamia' then public.modo_dinamia_aleatorio_por_rango(v_elo_promedio)
        when p_mundo = 'vitalia' then public.modo_vitalia_aleatorio_por_rango(v_elo_promedio)
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist, v_nivel_calc, v_nivel_circ, v_nivel_esta, v_nivel_naip, v_nivel_codi, v_nivel_dina, v_nivel_vita,
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

