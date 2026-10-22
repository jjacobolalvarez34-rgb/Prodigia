-- ============================================================
-- Prodigia — compartir el resultado de una partida (2026-10-21)
-- Correr después de 0295_digitos_de_pi.sql. Idempotente: se puede correr
-- más de una vez sin romper nada.
--
-- Pedido del usuario: «compartir la repetición de una partida, o el
-- resultado». La imagen se puede compartir sin esta migración; lo que agrega
-- es el ENLACE PÚBLICO de solo lectura (/partida/<id> en la web), con la
-- tarjeta del resultado.
--
-- Qué se publica: SOLO lo que el jugador decide compartir. Nada es público
-- por defecto: compartir crea una fila en partidas_compartidas, y la página
-- pública lee por el id de esa fila (un uuid al azar), nunca por el id del
-- duelo ni del jugador. Lo que devuelve partida_compartida es lo de la
-- tarjeta: mundo, nombre visible, aciertos, tiempos, Exp, y en un duelo el
-- nombre y el puntaje del rival (ya visibles en el ranking). Nunca ids de
-- usuario, correo, ELO ni nada de la cuenta.
--
-- Los números NO los manda el cliente:
--   - duelo: se leen en vivo de duels/duel_results (lo mismo que ya usa el
--     historial, 0066 mi_historial_duelos).
--   - partida sola: no existe una "sesión" guardada, solo las filas de
--     attempts (logic_attempts en Enigmia). compartir_sprint arma la foto
--     de la partida con las últimas p_cantidad respuestas del jugador en ese
--     mundo (de las últimas 6 h, y desde p_desde si viene), igual que
--     /api/practica/finish cierra el sprint con los attempts desde started_at.
--
-- Funciones nuevas (ninguna redefine algo existente):
--   compartir_duelo(uuid) ............ authenticated
--   compartir_sprint(text, int, tz) .. authenticated
--   partida_compartida(uuid) ......... anon + authenticated (solo lectura)
-- Usa mundo_de_problem_type (vigente: 0263).
-- ============================================================

create table if not exists public.partidas_compartidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  duel_id uuid references public.duels(id) on delete cascade,
  mundo text not null,
  -- Partida sola: id de la última respuesta (attempts o logic_attempts) —
  -- compartir dos veces la misma partida devuelve el mismo enlace.
  ultimo_intento bigint,
  correctos integer not null default 0,
  total integer not null default 0,
  tiempo_promedio_ms integer,
  experiencia integer not null default 0,
  racha_max integer not null default 0,
  respuestas jsonb,
  creado_at timestamptz not null default now()
);

create unique index if not exists partidas_compartidas_duelo_uidx
  on public.partidas_compartidas (user_id, duel_id) where duel_id is not null;
create unique index if not exists partidas_compartidas_sprint_uidx
  on public.partidas_compartidas (user_id, mundo, ultimo_intento) where duel_id is null;
create index if not exists partidas_compartidas_user_idx
  on public.partidas_compartidas (user_id, creado_at desc);

-- Sin políticas a propósito: nadie lee ni escribe la tabla directo, solo
-- por las funciones de abajo.
alter table public.partidas_compartidas enable row level security;
revoke all on public.partidas_compartidas from anon, authenticated;

-- Racha máxima de aciertos seguidos en un arreglo [{correct, timeMs}, ...].
create or replace function public._racha_max_respuestas(p_respuestas jsonb)
returns integer
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_actual integer := 0;
  v_max integer := 0;
begin
  if p_respuestas is null or jsonb_typeof(p_respuestas) <> 'array' then
    return 0;
  end if;
  for v_item in select value from jsonb_array_elements(p_respuestas)
  loop
    if coalesce((v_item ->> 'correct')::boolean, false) then
      v_actual := v_actual + 1;
      v_max := greatest(v_max, v_actual);
    else
      v_actual := 0;
    end if;
  end loop;
  return v_max;
end;
$$;

-- Freno anti-abuso: hasta 200 enlaces por jugador por día.
create or replace function public._puede_compartir_partida(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select count(*) < 200
  from public.partidas_compartidas
  where user_id = p_user and creado_at > now() - interval '1 day';
$$;

revoke all on function public._puede_compartir_partida(uuid) from public, anon, authenticated;

-- ---------- compartir un duelo (propio) ----------
create or replace function public.compartir_duelo(p_duel_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select id, mundo, retador_id, retado_id into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  if not exists (select 1 from public.duel_results where duel_id = p_duel_id and user_id = v_user) then
    raise exception 'todavía no jugaste este duelo';
  end if;

  select id into v_id from public.partidas_compartidas where user_id = v_user and duel_id = p_duel_id;
  if v_id is not null then
    return v_id;
  end if;

  if not public._puede_compartir_partida(v_user) then
    raise exception 'demasiados enlaces por hoy';
  end if;

  insert into public.partidas_compartidas (user_id, duel_id, mundo)
  values (v_user, p_duel_id, v_duel.mundo)
  on conflict (user_id, duel_id) where duel_id is not null do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.partidas_compartidas where user_id = v_user and duel_id = p_duel_id;
  end if;
  return v_id;
end;
$$;

revoke all on function public.compartir_duelo(uuid) from public, anon;
grant execute on function public.compartir_duelo(uuid) to authenticated;

-- ---------- compartir una partida sola (la recién jugada) ----------
create or replace function public.compartir_sprint(p_mundo text, p_cantidad integer default 10, p_desde timestamptz default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_n integer := greatest(1, least(coalesce(p_cantidad, 10), 60));
  v_ultimo bigint;
  v_correctos integer;
  v_total integer;
  v_tiempo integer;
  v_xp integer;
  v_respuestas jsonb;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  if p_mundo is null or p_mundo not in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo inválido';
  end if;

  if p_mundo = 'enigmia' then
    select max(t.id), count(*) filter (where t.correct), count(*), round(avg(t.time_ms))::integer, coalesce(sum(t.xp), 0)::integer,
           jsonb_agg(jsonb_build_object('correct', t.correct, 'timeMs', t.time_ms) order by t.created_at, t.id)
      into v_ultimo, v_correctos, v_total, v_tiempo, v_xp, v_respuestas
    from (
      select la.id, la.correct, la.time_ms, la.xp, la.created_at
      from public.logic_attempts la
      where la.user_id = v_user
        and la.created_at > now() - interval '6 hours'
        and (p_desde is null or la.created_at >= p_desde - interval '5 seconds')
      order by la.created_at desc, la.id desc
      limit v_n
    ) t;
  else
    select max(t.id), count(*) filter (where t.correct), count(*), round(avg(t.time_ms))::integer, coalesce(sum(t.xp), 0)::integer,
           jsonb_agg(jsonb_build_object('correct', t.correct, 'timeMs', t.time_ms) order by t.created_at, t.id)
      into v_ultimo, v_correctos, v_total, v_tiempo, v_xp, v_respuestas
    from (
      select a.id, a.correct, a.time_ms, a.xp, a.created_at
      from public.attempts a
      where a.user_id = v_user
        and a.created_at > now() - interval '6 hours'
        and (p_desde is null or a.created_at >= p_desde - interval '5 seconds')
        and public.mundo_de_problem_type(a.problem_type) = p_mundo
      order by a.created_at desc, a.id desc
      limit v_n
    ) t;
  end if;

  if v_ultimo is null then
    return null;
  end if;

  select id into v_id from public.partidas_compartidas
  where user_id = v_user and duel_id is null and mundo = p_mundo and ultimo_intento = v_ultimo;
  if v_id is not null then
    return v_id;
  end if;

  if not public._puede_compartir_partida(v_user) then
    raise exception 'demasiados enlaces por hoy';
  end if;

  insert into public.partidas_compartidas (user_id, mundo, ultimo_intento, correctos, total, tiempo_promedio_ms, experiencia, racha_max, respuestas)
  values (v_user, p_mundo, v_ultimo, v_correctos, greatest(v_total, least(coalesce(p_cantidad, v_total), 60)), v_tiempo, v_xp, public._racha_max_respuestas(v_respuestas), v_respuestas)
  on conflict (user_id, mundo, ultimo_intento) where duel_id is null do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.partidas_compartidas
    where user_id = v_user and duel_id is null and mundo = p_mundo and ultimo_intento = v_ultimo;
  end if;
  return v_id;
end;
$$;

revoke all on function public.compartir_sprint(text, integer, timestamptz) from public, anon;
grant execute on function public.compartir_sprint(text, integer, timestamptz) to authenticated;

-- ---------- lectura pública de una partida compartida ----------
-- correctos/total del duelo salen de las respuestas guardadas; si ese lado
-- no las guardó (duelos viejos o jugados en la web antes de 0300), quedan en
-- null y se muestra la precisión.
drop function if exists public.partida_compartida(uuid);

create function public.partida_compartida(p_id uuid)
returns table (
  tipo text,
  mundo text,
  sub_tipo text,
  operation_type text,
  clasificatorio boolean,
  creado_at timestamptz,
  jugador_nombre text,
  correctos integer,
  total integer,
  precision_partida numeric,
  tiempo_promedio_ms integer,
  experiencia integer,
  racha_max integer,
  respuestas jsonb,
  rival_nombre text,
  rival_es_bot boolean,
  rival_correctos integer,
  rival_total integer,
  rival_precision numeric,
  rival_tiempo_promedio_ms integer,
  rival_puntaje integer,
  rival_respuestas jsonb,
  resultado text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_fila public.partidas_compartidas%rowtype;
  v_duel record;
  v_rival uuid;
  v_mi record;
  v_otro record;
begin
  select * into v_fila from public.partidas_compartidas where id = p_id;
  if v_fila.id is null then
    return;
  end if;

  if v_fila.duel_id is null then
    return query
      select 'sprint'::text, v_fila.mundo, null::text, null::text, null::boolean, v_fila.creado_at,
        (select p.display_name from public.profiles p where p.id = v_fila.user_id),
        v_fila.correctos, v_fila.total,
        case when v_fila.total > 0 then round(v_fila.correctos::numeric / v_fila.total, 4) else null end,
        v_fila.tiempo_promedio_ms, v_fila.experiencia, v_fila.racha_max, v_fila.respuestas,
        null::text, null::boolean, null::integer, null::integer, null::numeric, null::integer, null::integer, null::jsonb,
        null::text;
    return;
  end if;

  select d.id, d.mundo, d.sub_tipo, d.operation_type, d.clasificatorio, d.creado_at, d.estado, d.ganador_id, d.retador_id, d.retado_id
    into v_duel
  from public.duels d where d.id = v_fila.duel_id;
  if v_duel.id is null then
    return;
  end if;

  v_rival := case when v_duel.retador_id = v_fila.user_id then v_duel.retado_id else v_duel.retador_id end;
  select * into v_mi from public.duel_results where duel_id = v_duel.id and user_id = v_fila.user_id;
  select * into v_otro from public.duel_results where duel_id = v_duel.id and user_id = v_rival;

  return query
    select 'duelo'::text, v_duel.mundo, v_duel.sub_tipo, v_duel.operation_type, v_duel.clasificatorio, v_duel.creado_at,
      (select p.display_name from public.profiles p where p.id = v_fila.user_id),
      case when jsonb_typeof(v_mi.respuestas) = 'array'
        then (select count(*)::integer from jsonb_array_elements(v_mi.respuestas) e where coalesce((e.value ->> 'correct')::boolean, false))
        else null end,
      case when jsonb_typeof(v_mi.respuestas) = 'array' then jsonb_array_length(v_mi.respuestas) else null end,
      v_mi.precision,
      round(v_mi.tiempo_promedio)::integer,
      v_mi.puntaje_final,
      public._racha_max_respuestas(v_mi.respuestas),
      case when jsonb_typeof(v_mi.respuestas) = 'array' then v_mi.respuestas else null end,
      (select p.display_name from public.profiles p where p.id = v_rival),
      (select coalesce(p.es_bot, false) from public.profiles p where p.id = v_rival),
      case when jsonb_typeof(v_otro.respuestas) = 'array'
        then (select count(*)::integer from jsonb_array_elements(v_otro.respuestas) e where coalesce((e.value ->> 'correct')::boolean, false))
        else null end,
      case when jsonb_typeof(v_otro.respuestas) = 'array' then jsonb_array_length(v_otro.respuestas) else null end,
      v_otro.precision,
      round(v_otro.tiempo_promedio)::integer,
      v_otro.puntaje_final,
      case when jsonb_typeof(v_otro.respuestas) = 'array' then v_otro.respuestas else null end,
      case
        when v_duel.estado not in ('completado', 'abandonado') then 'pendiente'
        when v_duel.ganador_id is null then 'empate'
        when v_duel.ganador_id = v_fila.user_id then 'victoria'
        else 'derrota'
      end;
end;
$$;

revoke all on function public.partida_compartida(uuid) from public;
grant execute on function public.partida_compartida(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
