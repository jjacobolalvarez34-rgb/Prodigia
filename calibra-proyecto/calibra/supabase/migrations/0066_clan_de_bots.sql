-- ============================================================
-- Prodigia — Clanes, Fase 1-3: el "Clan de Bots" como primer miembro
-- del concepto. Resuelve Rankeds vacío en rangos bajos (Bronce/Plata/
-- Oro) sin usar identidades falsas indistinguibles para siempre (se
-- delatan honestamente después del duelo, ver Fase 3 más abajo) ni un
-- aviso de sistema que mate la inmersión durante el matchmaking/duelo.
-- Correr después de 0065_anuncios.sql
--
-- ⚠️ Esta migración inserta filas directo en auth.users (fuera de la
-- API de Auth/GoTrue) para poder darle a cada bot un id real que
-- funcione con todas las FK existentes (duels.retador_id/retado_id →
-- profiles.id → auth.users.id, ver 0001_init.sql). Esto NUNCA llama a
-- signUp ni a ningún endpoint de Auth — es un insert de SQL puro,
-- corriendo con los permisos con los que se ejecuta esta migración
-- (el rol del SQL editor de Supabase, con acceso completo al schema
-- auth) — así que NO dispara ningún email real, no toca la cuota de
-- SMTP del proyecto. Si esta sección de auth.users tira un error de
-- columna inexistente (los nombres exactos pueden variar un poco entre
-- versiones de GoTrue), el error te va a decir cuál — sacá esa columna
-- del insert (o ponela en null si es nullable) y volvé a correr. El
-- resto del archivo (todo lo que no es este insert puntual) no depende
-- de esto.
-- ============================================================

-- ---------- Fase 1: esquema ----------
alter table public.profiles add column if not exists es_bot boolean not null default false;

create table if not exists public.clanes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  tipo text not null check (tipo = 'bots'), -- único valor por ahora, a propósito
  creado_at timestamptz not null default now()
);

create table if not exists public.clan_miembros (
  perfil_id uuid primary key references public.profiles(id) on delete cascade,
  clan_id uuid not null references public.clanes(id) on delete cascade,
  velocidad_ms_min integer not null check (velocidad_ms_min > 0),
  velocidad_ms_max integer not null check (velocidad_ms_max >= velocidad_ms_min),
  tasa_acierto numeric(4,3) not null check (tasa_acierto between 0 and 1),
  creado_at timestamptz not null default now()
);

alter table public.clanes enable row level security;
alter table public.clan_miembros enable row level security;
-- Sin policies de select para "authenticated" a propósito — el cliente
-- nunca necesita leer estas 2 tablas directo. El nombre/ELO de un bot
-- rival ya llega por las mismas funciones que devuelven cualquier
-- rival humano (obtener_duelo, mi_historial_duelos...) vía el join a
-- profiles que ya existía; lo único nuevo que exponen esas funciones es
-- la bandera "es_bot" (ver más abajo), no las tablas de clanes en sí.

-- ---------- Fase 1: seed del Clan de Bots (idempotente) ----------
do $$
declare
  v_clan_id uuid;
  v_instance_id uuid;
  v_bot record;
  v_id uuid;
  v_velocidad_min integer;
  v_velocidad_max integer;
  v_tasa numeric;
begin
  select id into v_clan_id from public.clanes where tipo = 'bots' limit 1;
  if v_clan_id is not null then
    return; -- ya sembrado en una corrida anterior — no duplicar
  end if;

  insert into public.clanes (nombre, descripcion, tipo)
  values (
    'Clan de Bots',
    'Rivales de práctica de Rankeds — entran al matchmaking solo cuando no hay humanos disponibles en tu rango.',
    'bots'
  )
  returning id into v_clan_id;

  select instance_id into v_instance_id from auth.users limit 1;
  v_instance_id := coalesce(v_instance_id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- 18 nombres con identidad propia (no "Bot1", tampoco nombres de
  -- persona al azar) y su ELO — repartidos a mano entre Bronce (7),
  -- Plata (6) y Oro (5) para que el matchmaking tenga con quién
  -- emparejar en cualquier punto de esos 3 rangos.
  for v_bot in
    select * from (values
      ('Nix Cero', 680),
      ('Vela.exe', 720),
      ('Runa Prima', 760),
      ('Ohm Cintia', 800),
      ('Doble Hélix', 830),
      ('Cuanto Gris', 860),
      ('Vector Rho', 890),
      ('Pixel Tau', 920),
      ('Kappa Once', 950),
      ('Delta Lumen', 980),
      ('Sigma Vela', 1010),
      ('Neón Fractal', 1040),
      ('Ion Pulso', 1070),
      ('Bit Aurora', 1100),
      ('Lambda Cruz', 1140),
      ('Flux Nébula', 1180),
      ('Zeta Andina', 1220),
      ('Radián Nova', 1270)
    ) as t(nombre, elo)
  loop
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_anonymous, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      v_instance_id, v_id, 'authenticated', 'authenticated',
      'bot-' || v_id || '@clandebots.prodigia.internal',
      '!sin-acceso-' || md5(random()::text || clock_timestamp()::text),
      now(), '{"provider": "bot", "providers": ["bot"]}'::jsonb,
      jsonb_build_object('name', v_bot.nombre),
      false, now(), now(),
      '', '', '', ''
    );

    -- El trigger on_auth_user_created (handle_new_user, ver
    -- 0060_auditoria_rls_2.sql) ya insertó la fila en profiles con
    -- display_name = v_bot.nombre a partir de raw_user_meta_data — acá
    -- se completa con el resto.
    v_velocidad_min := round(4200 - (v_bot.elo - 650) * 2.6)::integer; -- ELO alto = responde más rápido
    v_velocidad_max := v_velocidad_min + 1100;
    v_tasa := round((0.5 + (v_bot.elo - 650) / 950.0 * 0.4)::numeric, 3); -- ELO alto = acierta más (≈0.50 a ≈0.76 en este rango)

    update public.profiles
      set elo_rating = v_bot.elo,
          es_bot = true,
          onboarding_completado = true,
          onboarding_enigmia_completado = true,
          onboarding_quimia_completado = true
      where id = v_id;

    insert into public.clan_miembros (perfil_id, clan_id, velocidad_ms_min, velocidad_ms_max, tasa_acierto)
    values (v_id, v_clan_id, v_velocidad_min, v_velocidad_max, v_tasa);
  end loop;
end $$;

-- ---------- defensa en profundidad: nunca amigo de un bot ----------
-- No hay ninguna pantalla que exponga el id de un bot como para
-- mandarlo a este insert hoy (buscar_usuarios ya los excluye, ver
-- abajo), pero un cliente insistente podría igual armar el insert a
-- mano contra friendships (la RLS de esa tabla solo exige
-- auth.uid()=user_id, no valida nada sobre friend_id) — este trigger
-- lo bloquea del lado del server sin importar por dónde se intente.
create or replace function public.bloquear_amistad_con_bot()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.profiles where id in (new.user_id, new.friend_id) and es_bot) then
    raise exception 'no se puede agregar a un miembro del Clan de Bots como amigo';
  end if;
  return new;
end;
$$;

drop trigger if exists bloquear_amistad_con_bot on public.friendships;
create trigger bloquear_amistad_con_bot
  before insert on public.friendships
  for each row execute function public.bloquear_amistad_con_bot();

-- ---------- Fase 1: fuera de búsqueda de amigos, ranking general y perfil público ----------
create or replace function public.buscar_usuarios(p_query text)
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name
  from public.profiles p
  where p.display_name ilike '%' || p_query || '%'
    and p.id <> auth.uid()
    and p.display_name is not null
    and not p.es_bot
  order by p.display_name asc
  limit 15;
$$;

create or replace function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  fuente_nombre text,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz,
  titulo_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, p.marco_perfil, p.fuente_nombre,
      p.elo_rating, p.puntos_total, p.created_at, public.titulo_nombre_de(p.id)
    from public.profiles p
    where p.id = p_user_id and not p.es_bot;
end;
$$;

create or replace function public.posicion_ranking_puntos()
returns table (posicion bigint, total_jugadores bigint)
language sql
security definer
set search_path = public
as $$
  with reales as (
    select p.id, p.puntos_total, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where coalesce(u.is_anonymous, false) = false and not p.es_bot
  ),
  ranking as (
    select id, row_number() over (order by puntos_total desc, created_at asc) as posicion
    from reales
  )
  select r.posicion, (select count(*) from reales) as total_jugadores
  from ranking r
  where r.id = auth.uid();
$$;

drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(dp.xp_ganado), 0) as xp_semana,
    p.avatar_url,
    p.elo_rating,
    p.titulo_activo,
    public.titulo_nombre_de(p.id)
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false and not p.es_bot
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

create or replace function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text,
  titulo_nombre text,
  fuente_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia') then
    raise exception 'mundo invalido';
  end if;

  return query
    with datos as (
      select
        p.id as uid,
        p.display_name as dn,
        (case
          when p_mundo is null then coalesce((
            select sum(dp.xp_ganado) from public.daily_progress dp
            where dp.user_id = p.id and dp.fecha >= date_trunc('week', current_date)::date and dp.fecha <= current_date
          ), 0)
          when p_mundo = 'enigmia' then coalesce((
            select sum(la.xp) from public.logic_attempts la
            where la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
          ), 0)
          when p_mundo = 'geografia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type = 'geografia'
          ), 0)
          when p_mundo = 'quimia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla')
          ), 0)
          else coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra')
          ), 0)
        end)::bigint as xp,
        p.avatar_url as av,
        p.elo_rating as elo,
        p.titulo_activo as ta,
        p.fuente_nombre as fn
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and not p.es_bot
        and (
          not p_solo_amigos
          or p.id = v_caller
          or exists (
            select 1 from public.friendships f
            where f.estado = 'aceptada'
              and ((f.user_id = v_caller and f.friend_id = p.id) or (f.friend_id = v_caller and f.user_id = p.id))
          )
        )
    )
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

-- ---------- Fase 1: simulación de un resultado de bot ----------
-- Réplica en SQL de la fórmula real de XP (src/lib/practica/formulas.ts,
-- calcularXp): 10 base × multiplicador_de_nivel × bonus_de_velocidad si
-- acierta, 0 si no. 10 "problemas" simulados por ronda (mismo
-- TOTAL_PROBLEMAS/TOTAL_PREGUNTAS que usa cada sprint real). No hace
-- falta security definer — no toca ninguna tabla, es cálculo puro.
create or replace function public.simular_resultado_bot(p_nivel smallint, p_velocidad_min integer, p_velocidad_max integer, p_tasa_acierto numeric)
returns table (puntaje integer, acierto numeric, tiempo_promedio numeric, respuestas jsonb)
language plpgsql
as $$
declare
  v_nivel smallint := coalesce(p_nivel, 5);
  v_esperado numeric := 6000 - (v_nivel - 1) * 350;
  v_i int;
  v_time numeric;
  v_correcto boolean;
  v_xp integer;
  v_puntaje integer := 0;
  v_correctos integer := 0;
  v_suma_tiempo numeric := 0;
  v_factor numeric;
  v_respuestas jsonb := '[]'::jsonb;
begin
  for v_i in 1..10 loop
    v_time := p_velocidad_min + random() * greatest(p_velocidad_max - p_velocidad_min, 1);
    v_correcto := random() < p_tasa_acierto;
    v_suma_tiempo := v_suma_tiempo + v_time;
    v_respuestas := v_respuestas || jsonb_build_object('correct', v_correcto, 'timeMs', round(v_time));

    if v_correcto then
      v_correctos := v_correctos + 1;
      v_factor := least(1.5, greatest(1.0, 1.5 - 0.5 * (v_time / v_esperado)));
      v_xp := round(10 * (1 + (v_nivel - 1) * 0.15) * v_factor);
      v_puntaje := v_puntaje + v_xp;
    end if;
  end loop;

  return query select v_puntaje, round(v_correctos::numeric / 10, 2), round(v_suma_tiempo / 10, 0), v_respuestas;
end;
$$;

-- ---------- Fase 2: matchmaking — cae al Clan de Bots si no hay
-- humanos, solo en Bronce/Plata/Oro (elo < 1300), solo después de ~30s
-- de búsqueda real (el timeout total del cliente es 60s, ver
-- MAX_SEGUNDOS_BUSQUEDA en RankedsClient.tsx — este umbral cae bastante
-- antes que eso, así casi nunca se llega a "no hay contrincantes"). El
-- duelo se crea exactamente igual que contra un rival humano — mismo
-- código de creación de ahí para abajo, nada especial en la
-- presentación (Fase 2: "sin ningún aviso de sistema"). El resultado
-- del bot se simula e inserta ACÁ MISMO, en el momento del match, así
-- que para cuando el humano termina su parte (sea el modo en vivo de
-- Numeria o el asincrónico del resto) el duelo se resuelve al toque,
-- como si el rival ya hubiera jugado — nunca queda "esperando a que
-- responda" un bot que en realidad no va a volver.
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
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
  v_nivel_num smallint;
  v_nivel_enig smallint;
  v_nivel_quim smallint;
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'aleatorio') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'aleatorio' and not p_ranked then
    raise exception 'casual no admite todas las ciudades — siempre es duelo simple';
  end if;

  delete from public.duel_queue where last_seen_at < now() - interval '2 minutes';

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

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

  if v_rival.user_id is null and v_mi_elo < 1300 and v_segundos >= 30 then
    select p.id, p.elo_rating, m.velocidad_ms_min, m.velocidad_ms_max, m.tasa_acierto
      into v_bot_id, v_bot_elo, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot
    from public.clan_miembros m
    join public.profiles p on p.id = m.perfil_id
    order by abs(p.elo_rating - v_mi_elo) asc
    limit 1;
    if v_bot_id is not null then
      -- v_rival ya tiene la forma de duel_queue (de la consulta de
      -- arriba, aunque haya devuelto 0 filas) — se reasignan a mano solo
      -- los 2 campos que el resto de la función necesita (user_id,
      -- elo_rating), en vez de un segundo SELECT INTO de forma distinta.
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
    for v_i in reverse 4..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    for v_i in 1..3 loop
      v_nivel_num := case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end;
      v_nivel_enig := case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end;
      v_nivel_quim := case when v_mundos[v_i] = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end;

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total, nivel_numeria, nivel_enigmia, nivel_quimia, clasificatorio
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
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(v_nivel_num, v_nivel_enig, v_nivel_quim, greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint);
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

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo, nivel_numeria, nivel_enigmia, nivel_quimia, clasificatorio
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
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(v_nivel_num, v_nivel_enig, v_nivel_quim, greatest(1, least(10, round(3 + (v_elo_promedio - 1200) / 100)))::smallint);
      select * into v_sim from public.simular_resultado_bot(v_nivel_ronda, v_velocidad_min_bot, v_velocidad_max_bot, v_tasa_bot);
      insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
      values (v_duel_id, v_rival.user_id, v_sim.acierto, v_sim.tiempo_promedio, v_sim.puntaje, v_sim.respuestas);
    end if;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;

-- ---------- Fase 3: transparencia post-duelo — "es_bot" en cada lugar
-- donde ya se muestra el nombre/resultado de un rival ----------
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

grant execute on function public.obtener_duelo(uuid) to authenticated;

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
  empate boolean,
  rival_es_bot boolean
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
      (d.estado = 'completado' and d.ganador_id is null),
      (select es_bot from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end)
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

drop function if exists public.estado_serie_duelo(uuid);

create function public.estado_serie_duelo(p_serie_id uuid)
returns table (
  duel_id uuid, ronda_numero smallint, mundo text, sub_tipo text, operation_type text,
  estado text, yo_jugue boolean, rival_jugo boolean, gane_ronda boolean, empate_ronda boolean,
  oponente_id uuid, oponente_nombre text, serie_finalizada boolean, oponente_es_bot boolean
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

  if not exists (
    select 1 from public.duels where serie_id = p_serie_id and (retador_id = v_user or retado_id = v_user)
  ) then
    raise exception 'no autorizado';
  end if;

  return query
    select
      d.id, d.ronda_numero, d.mundo, d.sub_tipo, d.operation_type, d.estado,
      exists(select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user),
      exists(select 1 from public.duel_results r where r.duel_id = d.id and r.user_id <> v_user),
      (d.estado = 'completado' and d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null),
      case when d.retador_id = v_user then d.retado_id else d.retador_id end,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      d.serie_finalizada,
      (select es_bot from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end)
    from public.duels d
    where d.serie_id = p_serie_id
    order by d.ronda_numero;
end;
$$;

grant execute on function public.estado_serie_duelo(uuid) to authenticated;

drop function if exists public.finalizar_serie_si_corresponde(uuid);

create function public.finalizar_serie_si_corresponde(p_serie_id uuid)
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

    -- Fase 3: mismo criterio que registrar_resultado_duelo — nunca una
    -- tarjeta de "resultado de duelo" en el Feed si el rival es del
    -- Clan de Bots. Las de "subida de rango" SÍ se mantienen tal cual
    -- (tu propio progreso real, ver comentario en 0066).
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

  return query select true, v_gane, v_empate, v_mi_elo, v_mi_elo_anterior,
    v_victorias_mias, v_victorias_otro, v_otro_id,
    (select display_name from public.profiles where id = v_otro_id), v_otro_es_bot;
end;
$$;

grant execute on function public.finalizar_serie_si_corresponde(uuid) to authenticated;

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
  mi_puntaje integer, rival_puntaje integer, clasificatorio boolean, oponente_es_bot boolean,
  -- Sección "Rankeds visual" (tanda nocturna): desglose completo para
  -- la pantalla de resultado tipo tetr.io — ya vivía en duel_results,
  -- solo faltaba devolverlo.
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
    return query select false, v_mi_elo, v_mi_elo, false, false, null::text, v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.ronda_numero, v_duel.ronda_total,
      null::integer, null::integer, v_duel.clasificatorio, v_otro_es_bot,
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

  -- Fase 3: nunca una tarjeta de "resultado de duelo" en el Feed cuando
  -- el rival es del Clan de Bots — "no generan tarjetas en el Feed" es
  -- literal, aunque la tarjeta sea sobre TU victoria/derrota, nombra al
  -- bot como si fuera cualquier otro jugador consultable.
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
