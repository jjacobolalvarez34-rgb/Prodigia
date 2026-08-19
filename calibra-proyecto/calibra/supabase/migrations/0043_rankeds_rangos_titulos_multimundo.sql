-- ============================================================
-- Prodigia — Rankeds: rangos, títulos, matchmaking multi-mundo,
-- mejor-de-3 y contenido según rango (Fases 1-5 de la tanda de Rankeds)
-- Correr después de 0042_ranking_excluye_invitados.sql
--
-- Alcance decidido y documentado en docs/PROGRESO.md: Numeria conserva
-- el duelo en tiempo real completo (SalaDuelo). Geografía y Enigmia se
-- suman a Rankeds con el patrón asincrónico que ya existía en el
-- proyecto (cada uno juega su ronda cuando puede, se compara puntaje al
-- resolverse) — no se construye Realtime + rng sembrado nuevo para esas
-- dos ciudades en esta tanda.
-- ============================================================

-- ⚠️ Todo este archivo está escrito para poder correrse más de una vez
-- sin romper (create or replace, add column ... if not exists, drop
-- policy/constraint if exists antes de crearlas de nuevo) — pensado
-- para el caso real de que se corra fuera de orden o se repita sin
-- querer. La ÚNICA excepción real es la línea de acá abajo: si esto ya
-- se corrió una vez y la gente ya jugó duelos de Rankeds de verdad, NO
-- la vuelvas a correr — resetearía el ELO ganado de nuevo a 800. Es
-- segura de repetir solo mientras nadie jugó todavía.
-- ---------- Fase 1: reset de ELO ----------
update public.profiles set elo_rating = 800;
-- El default de la columna seguía en 1200 (0016_duelos_elo.sql) — con
-- los umbrales nuevos eso pondría a cualquier cuenta CREADA DESPUÉS de
-- este reset directo en rango Oro, mientras que todo el mundo que ya
-- estaba arrancó de nuevo en Bronce. No lo pediste explícito, pero
-- dejar el default viejo sería inconsistente con el reset que sí
-- pediste — lo alineo a 800 también.
alter table public.profiles alter column elo_rating set default 800;

-- ---------- Fase 2: títulos ----------
alter table public.profiles add column if not exists titulo_activo text;

create table if not exists public.titulos_usuario (
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  nombre text not null,
  origen text not null default 'rango',
  desbloqueado_at timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.titulos_usuario enable row level security;

drop policy if exists "usuarios ven sus propios titulos" on public.titulos_usuario;
create policy "usuarios ven sus propios titulos"
  on public.titulos_usuario for select
  using (auth.uid() = user_id);

-- Única vía de escritura (nunca insert/update directo del cliente,
-- mismo patrón que el resto del proyecto). Idempotente. Si es el
-- PRIMER título que desbloquea, se activa solo — así se nota apenas
-- pasa, sin que el usuario tenga que ir a elegirlo a mano la primera
-- vez. Reusable desde cualquier origen futuro, no solo rango.
create or replace function public.desbloquear_titulo(p_user_id uuid, p_slug text, p_nombre text, p_origen text default 'rango')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ya_tenia_alguno boolean;
begin
  select exists(select 1 from public.titulos_usuario where user_id = p_user_id) into v_ya_tenia_alguno;

  insert into public.titulos_usuario (user_id, slug, nombre, origen)
  values (p_user_id, p_slug, p_nombre, p_origen)
  on conflict (user_id, slug) do nothing;

  if not v_ya_tenia_alguno then
    update public.profiles set titulo_activo = p_slug where id = p_user_id;
  end if;
end;
$$;

create or replace function public.elegir_titulo_activo(p_slug text)
returns void
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

  if p_slug is not null and not exists (
    select 1 from public.titulos_usuario where user_id = v_user and slug = p_slug
  ) then
    raise exception 'titulo no desbloqueado';
  end if;

  update public.profiles set titulo_activo = p_slug where id = v_user;
end;
$$;

create or replace function public.mis_titulos()
returns table (slug text, nombre text, origen text, desbloqueado_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select slug, nombre, origen, desbloqueado_at
  from public.titulos_usuario
  where user_id = auth.uid()
  order by desbloqueado_at asc;
$$;

grant execute on function public.desbloquear_titulo(uuid, text, text, text) to authenticated;
grant execute on function public.elegir_titulo_activo(text) to authenticated;
grant execute on function public.mis_titulos() to authenticated;

-- ---------- Rango a partir de ELO (espejo en SQL de rangoDeElo en database.ts) ----------
create or replace function public.rango_de_elo(p_elo integer)
returns text
language sql
immutable
as $$
  select case
    when p_elo >= 1700 then 'prodigio'
    when p_elo >= 1500 then 'diamante'
    when p_elo >= 1300 then 'platino'
    when p_elo >= 1100 then 'oro'
    when p_elo >= 900 then 'plata'
    else 'bronce'
  end;
$$;

-- ---------- Fase 4: contenido elegible por rango, evaluado sobre el ELO
-- promedio de los dos duelistas (mismo criterio que ya usaba
-- obtener_duelo para el nivel de Numeria). No son immutable: usan
-- random() a propósito.
create or replace function public.nivel_numeria_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when p_elo_promedio >= 1500 then (8 + floor(random() * 3))::smallint
    when p_elo_promedio >= 1100 then (5 + floor(random() * 4))::smallint
    else (1 + floor(random() * 5))::smallint
  end;
$$;

create or replace function public.continente_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1500 then
    v_opciones := array['america', 'europa', 'africa', 'asia_oceania'];
  elsif p_elo_promedio >= 1100 then
    v_opciones := array['america', 'europa'];
  else
    v_opciones := array['america'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.categoria_aleatoria_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1500 then
    v_opciones := array['memoria', 'patrones', 'deduccion', 'computacional'];
  elsif p_elo_promedio >= 1100 then
    v_opciones := array['memoria', 'patrones', 'deduccion'];
  else
    v_opciones := array['memoria', 'patrones'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- ---------- Fase 3+5: esquema multi-mundo de duel_queue y duels ----------
-- operation_type deja de ser obligatorio (solo aplica a Numeria).
alter table public.duel_queue alter column operation_type drop not null;
alter table public.duel_queue drop constraint if exists duel_queue_operation_type_check;
alter table public.duel_queue add constraint duel_queue_operation_type_check
  check (operation_type is null or operation_type in ('suma', 'resta', 'multiplicacion', 'division'));
alter table public.duel_queue add column if not exists mundo text not null default 'numeria'
  check (mundo in ('numeria', 'geografia', 'enigmia', 'aleatorio'));

alter table public.duels alter column operation_type drop not null;
alter table public.duels drop constraint if exists duels_operation_type_check;
alter table public.duels add constraint duels_operation_type_check
  check (operation_type is null or operation_type in ('suma', 'resta', 'multiplicacion', 'division'));
alter table public.duels add column if not exists mundo text not null default 'numeria'
  check (mundo in ('numeria', 'geografia', 'enigmia'));
-- continente (geografía) o categoría (enigmia) — null en numeria.
alter table public.duels add column if not exists sub_tipo text;
alter table public.duels add column if not exists modo text not null default 'simple'
  check (modo in ('simple', 'mejor_de_3'));
-- agrupa las 3 filas (rondas) de un duelo "todas las ciudades".
alter table public.duels add column if not exists serie_id uuid;
alter table public.duels add column if not exists ronda_numero smallint not null default 1;
alter table public.duels add column if not exists ronda_total smallint not null default 1;
-- evita aplicar el ELO de una serie más de una vez (dos rondas
-- terminando casi al mismo tiempo no deberían poder disparar la
-- finalización dos veces).
alter table public.duels add column if not exists serie_finalizada boolean not null default false;
-- Fase 4: nivel de Numeria elegido según el rango de los dos duelistas,
-- decidido UNA vez al crear el duelo (no recalculado en cada
-- obtener_duelo — nivel_numeria_por_rango usa random(), recomputarlo en
-- cada fetch le cambiaría el nivel a mitad de duelo). Null en duelos
-- que no pasaron por matchmaking de Rankeds (retos de amigos/link, que
-- siguen con la fórmula continua vieja centrada en 1200 — no es parte
-- de esta fase, no se tocan).
alter table public.duels add column if not exists nivel_numeria smallint;

create index if not exists duels_serie_id_idx on public.duels (serie_id) where serie_id is not null;

-- ---------- Matchmaking multi-mundo (reemplaza la versión numeria-only) ----------
drop function if exists public.buscar_rival_duelo(text);

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
  if p_mundo = 'numeria' and p_operation_type is null then
    raise exception 'falta operation_type para numeria';
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
    and (p_mundo <> 'numeria' or q.operation_type = p_operation_type)
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
      case when p_mundo = 'numeria' then p_operation_type else null end,
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

-- ---------- registrar_resultado_duelo: K variable + títulos + sin ELO
-- por ronda en mejor_de_3 (eso lo hace finalizar_serie_si_corresponde) ----------
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
  mi_puntaje integer, rival_puntaje integer
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
      null::integer, null::integer;
    return;
  end if;

  select * into v_mi from public.duel_results where duel_id = p_duel_id and user_id = v_user;
  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

  v_actual := case
    when v_mi.puntaje_final > v_otro.puntaje_final then 1
    when v_mi.puntaje_final < v_otro.puntaje_final then 0
    else 0.5
  end;

  -- Esta RONDA queda resuelta (gana quien sacó más puntaje) siempre —
  -- pero el ELO solo se aplica acá mismo cuando el duelo es "simple".
  -- Si es "mejor_de_3", el ganador de la ronda se marca igual (para
  -- poder mostrar el resultado ronda por ronda, Fase 5), pero el ELO
  -- lo aplica finalizar_serie_si_corresponde una sola vez al final.
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
      v_mi.puntaje_final, v_otro.puntaje_final;
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
      v_mi.puntaje_final, v_otro.puntaje_final;
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb) to authenticated;

-- ---------- Fase 5: cierre de la serie mejor-de-3 (aplica ELO UNA vez) ----------
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
  v_nuevo_elo integer;
  v_k constant integer := 20; -- Fase 3: K alto para el modo aleatorio
  v_rango_anterior text;
  v_rango_nuevo text;
  v_filas_actualizadas integer;
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

  -- Marca las 3 filas como finalizadas de forma atómica — si ya estaba
  -- marcada (dos rondas resolviéndose casi juntas, o el cliente
  -- reintentando), no vuelve a tocar el ELO.
  update public.duels set serie_finalizada = true
  where serie_id = p_serie_id and serie_finalizada = false;
  get diagnostics v_filas_actualizadas = row_count;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;
  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

  if v_filas_actualizadas = 0 then
    -- Ya se había finalizado antes (por el otro lado, o un reintento) —
    -- se devuelve el resultado de todos modos, sin tocar ELO de nuevo.
    return query select true, (v_victorias_mias > v_victorias_otro), (v_victorias_mias = v_victorias_otro),
      v_mi_elo, v_mi_elo, v_victorias_mias, v_victorias_otro, v_otro_id,
      (select display_name from public.profiles where id = v_otro_id);
    return;
  end if;

  v_actual := case
    when v_victorias_mias > v_victorias_otro then 1
    when v_victorias_mias < v_victorias_otro then 0
    else 0.5
  end;
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
  end if;

  return query select true, (v_actual = 1), (v_actual = 0.5), v_nuevo_elo, v_mi_elo,
    v_victorias_mias, v_victorias_otro, v_otro_id,
    (select display_name from public.profiles where id = v_otro_id);
end;
$$;

grant execute on function public.finalizar_serie_si_corresponde(uuid) to authenticated;

-- Estado de las 3 rondas de una serie "todas las ciudades" — usado por
-- /rankeds/serie/[serieId] para mostrar el progreso ronda por ronda
-- (Fase 5: "mostrá el resultado ronda por ronda") y decidir qué botón
-- ofrecer ("jugar ronda 2", "ver resultado final", etc.).
create or replace function public.estado_serie_duelo(p_serie_id uuid)
returns table (
  duel_id uuid, ronda_numero smallint, mundo text, sub_tipo text, operation_type text,
  estado text, yo_jugue boolean, rival_jugo boolean, gane_ronda boolean, empate_ronda boolean,
  oponente_id uuid, oponente_nombre text, serie_finalizada boolean
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
      d.serie_finalizada
    from public.duels d
    where d.serie_id = p_serie_id
    order by d.ronda_numero;
end;
$$;

grant execute on function public.estado_serie_duelo(uuid) to authenticated;

-- ---------- obtener_duelo: agrega mundo/sub_tipo/serie/ronda ----------
drop function if exists public.obtener_duelo(uuid);

create function public.obtener_duelo(p_duel_id uuid)
returns table (
  operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text,
  rival_nombre text, mi_elo integer, rival_elo integer,
  rival_ya_jugo boolean, rival_respuestas jsonb,
  mundo text, sub_tipo text, modo text, serie_id uuid, ronda_numero smallint, ronda_total smallint
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
      coalesce(v_duel.nivel_numeria, greatest(1, least(10, round(3 + (v_promedio - 1200) / 100)))::smallint),
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo,
      (v_rival_resultado.user_id is not null), v_rival_resultado.respuestas,
      v_duel.mundo, v_duel.sub_tipo, v_duel.modo, v_duel.serie_id, v_duel.ronda_numero, v_duel.ronda_total;
end;
$$;

grant execute on function public.obtener_duelo(uuid) to authenticated;

-- ---------- mi_historial_duelos: agrega mundo/sub_tipo ----------
drop function if exists public.mi_historial_duelos(integer);

create function public.mi_historial_duelos(p_limite integer default 20)
returns table (
  duel_id uuid,
  operation_type text,
  mundo text,
  sub_tipo text,
  modo text,
  creado_at timestamptz,
  rival_nombre text,
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
      d.creado_at,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      mi.puntaje_final,
      otro.puntaje_final,
      (d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null)
    from public.duels d
    join public.duel_results mi on mi.duel_id = d.id and mi.user_id = v_user
    join public.duel_results otro on otro.duel_id = d.id and otro.user_id <> v_user
    where (d.retador_id = v_user or d.retado_id = v_user) and d.estado = 'completado'
      and d.modo = 'simple' -- las rondas de mejor_de_3 se listan aparte por ahora, agrupadas por serie
    order by d.creado_at desc
    limit p_limite;
end;
$$;

grant execute on function public.mi_historial_duelos(integer) to authenticated;

-- ---------- mis_duelos_pendientes: agrega mundo (para el link correcto) ----------
drop function if exists public.mis_duelos_pendientes();

create function public.mis_duelos_pendientes()
returns table (duel_id uuid, operation_type text, mundo text, creado_at timestamptz, retador_nombre text, retador_elo integer)
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
    select d.id, d.operation_type, d.mundo, d.creado_at,
      (select display_name from public.profiles where id = d.retador_id),
      (select elo_rating from public.profiles where id = d.retador_id)
    from public.duels d
    where d.retado_id = v_user
      and d.estado = 'pendiente'
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;

grant execute on function public.mis_duelos_pendientes() to authenticated;

-- ---------- Fase 9: rango visible en el Ranking semanal ----------
-- Agrega elo_rating (y de paso titulo_activo, para mostrar el título
-- elegido junto al nombre en /leaderboard igual que en duelos/perfil).
drop function if exists public.ranking_semanal();

create function public.ranking_semanal()
returns table (
  user_id uuid,
  display_name text,
  xp_semana bigint,
  avatar_url text,
  elo_rating integer,
  titulo_activo text
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
    p.titulo_activo
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= date_trunc('week', current_date)::date
    and dp.fecha <= current_date
  where coalesce(u.is_anonymous, false) = false
  group by p.id, p.display_name, p.avatar_url, p.elo_rating, p.titulo_activo
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by xp_semana desc;
$$;

grant execute on function public.ranking_semanal() to authenticated;

-- ---------- Fase 10: afinidad por mundo (solo informativo — NO crea un
-- ELO separado por mundo, NO afecta matchmaking ni el rango general) ----------
create or replace function public.afinidad_por_mundo()
returns table (mundo text, duelos_jugados integer, victorias integer, derrotas integer, empates integer, precision_promedio numeric)
language sql
security definer
set search_path = public
as $$
  select
    d.mundo,
    count(*)::integer as duelos_jugados,
    count(*) filter (where d.ganador_id = auth.uid())::integer as victorias,
    count(*) filter (where d.ganador_id is not null and d.ganador_id <> auth.uid())::integer as derrotas,
    count(*) filter (where d.ganador_id is null)::integer as empates,
    round(avg(r.precision) * 100, 1) as precision_promedio
  from public.duels d
  join public.duel_results r on r.duel_id = d.id and r.user_id = auth.uid()
  where (d.retador_id = auth.uid() or d.retado_id = auth.uid())
    and d.estado = 'completado'
  group by d.mundo
  order by duelos_jugados desc;
$$;

grant execute on function public.afinidad_por_mundo() to authenticated;

-- ---------- Fase 12: logros nuevos basados en rango y duelos ----------
-- "elo_minimo" y "racha_duelos_ganados" son tipos de criterio nuevos —
-- verificarLogros (código, no SQL) es quien los evalúa, mismo patrón que
-- el resto de los logros del proyecto.
insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('rango-plata', 'Llegaste a Plata', 'Alcanzaste el rango Plata en Rankeds.', 'duelos', '{"tipo": "elo_minimo", "valor": 900}'),
('rango-oro', 'Llegaste a Oro', 'Alcanzaste el rango Oro en Rankeds.', 'duelos', '{"tipo": "elo_minimo", "valor": 1100}'),
('rango-platino', 'Llegaste a Platino', 'Alcanzaste el rango Platino en Rankeds.', 'duelos', '{"tipo": "elo_minimo", "valor": 1300}'),
('rango-diamante', 'Llegaste a Diamante', 'Alcanzaste el rango Diamante en Rankeds.', 'duelos', '{"tipo": "elo_minimo", "valor": 1500}'),
('rango-prodigio', 'Alcanzaste Prodigio', 'El rango más alto de Rankeds — quedan pocos ahí arriba.', 'duelos', '{"tipo": "elo_minimo", "valor": 1700}'),
('duelos-1', 'Primera sangre', 'Ganaste tu primer duelo en Rankeds.', 'duelos', '{"tipo": "duelos_ganados", "valor": 1}'),
('duelos-racha-3', 'En racha', 'Ganaste 3 duelos seguidos.', 'duelos', '{"tipo": "racha_duelos_ganados", "valor": 3}')
on conflict (slug) do nothing;
