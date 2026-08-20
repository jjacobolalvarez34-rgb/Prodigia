-- ============================================================
-- Prodigia — fix: matchmaking fantasma (Sección 1, arrastrado de
-- sesiones anteriores)
-- Correr después de 0057_fix_grant_onboarding_quimia.sql
--
-- Causa raíz confirmada con una prueba real (dos invitados via
-- supabase-js, sin pasar por la UI): duel_queue nunca tuvo una señal
-- de "sigo acá" separada de entered_at. entered_at es la hora en que
-- ARRANCÓ la búsqueda (se usa para ir ensanchando el rango de ELO con
-- el tiempo) — no se actualiza en cada poll si los parámetros de
-- búsqueda no cambiaron, así que tampoco sirve como heartbeat. Si un
-- usuario cierra la pestaña, pierde la conexión, o el cliente crashea
-- a mitad de búsqueda, su fila en duel_queue queda ahí para siempre
-- (nadie más la borra), y cualquier otro usuario que busque
-- después puede matchear contra ella. El duelo se crea igual, pero el
-- rival nunca va a responder — el "fantasma" reportado.
--
-- Confirmado en vivo: usuario B entra a la cola una vez y no vuelve a
-- llamar la función (simula cerrar la pestaña, sin cancelar). 12
-- segundos después (más de 5 ciclos de poll de 2.2s), el usuario A
-- busca con los mismos parámetros y matchea contra B — se crea un
-- duelo real con un rival que ya se fue.
--
-- Fix: last_seen_at, un heartbeat aparte de entered_at, que se
-- actualiza en TODOS los polls (no solo cuando cambian los
-- parámetros). buscar_rival_duelo ahora exige que el rival tenga
-- last_seen_at reciente antes de matchear, y de paso limpia filas
-- viejas en cada llamada — sin esto ninguna limpieza del lado
-- cliente (ni siquiera un handler de cierre de pestaña) sería
-- confiable, porque un beforeunload/pagehide puede no llegar a
-- disparar la llamada a tiempo. La verificación tiene que ser del
-- lado del servidor, en el momento de matchear.
-- ============================================================

alter table public.duel_queue add column if not exists last_seen_at timestamptz not null default now();

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
  v_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia'];
  v_i int;
  v_j int;
  v_tmp text;
  v_mundo_encontrado text;
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

  -- Limpieza oportunista: filas sin heartbeat hace más de 2 minutos son
  -- abandonos seguros (el cliente hace poll cada 2.2s, y el propio
  -- timeout de 60s del front ya cancela las búsquedas normales bastante
  -- antes de eso). Barata: la cola nunca es grande.
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
    -- Presencia real: un rival sin heartbeat reciente ya no está del
    -- otro lado esperando, aunque su fila siga en la tabla.
    and q.last_seen_at >= now() - interval '10 seconds'
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
    for v_i in reverse 4..2 loop
      v_j := 1 + floor(random() * v_i)::int;
      v_tmp := v_mundos[v_i];
      v_mundos[v_i] := v_mundos[v_j];
      v_mundos[v_j] := v_tmp;
    end loop;

    for v_i in 1..3 loop
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
        case when v_mundos[v_i] = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end,
        case when v_mundos[v_i] = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end,
        case when v_mundos[v_i] = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end,
        true
      );
    end loop;

    select id, mundo into v_duel_id, v_mundo_encontrado from public.duels where serie_id = v_serie_id and ronda_numero = 1;
  else
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
      case when p_mundo = 'numeria' then public.nivel_numeria_por_rango(v_elo_promedio) else null end,
      case when p_mundo = 'enigmia' then public.nivel_enigmia_por_rango(v_elo_promedio) else null end,
      case when p_mundo = 'quimia' then public.nivel_quimia_por_rango(v_elo_promedio) else null end,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;
  end if;

  return query select v_duel_id, true, v_rango, v_segundos, v_mundo_encontrado;
end;
$$;

grant execute on function public.buscar_rival_duelo(text, text, boolean) to authenticated;
