-- ============================================================
-- Prodigia — Quimia: cuarto mundo jugable, completo
-- Correr después de 0055_grupos_delete_policy_confirmada.sql
--
-- Mismo patrón que Numeria/Enigmia/Geografía en todo lo que aplica:
-- reutiliza skill_levels/attempts/techniques/world_progress ampliando
-- checks (nada de tablas nuevas para contenido — los 21 elementos y 10
-- compuestos verificados viven en código, src/lib/practica/quimia.ts,
-- igual que los países de Geografía viven en src/lib/practica/geografia.ts),
-- suma un modo_quimia_aleatorio_por_rango + nivel_quimia_por_rango
-- análogos a categoria_aleatoria_por_rango/nivel_enigmia_por_rango, y
-- onboarding_quimia_completado análogo a onboarding_enigmia_completado.
-- ============================================================

alter table public.profiles add column if not exists onboarding_quimia_completado boolean not null default false;

-- 0035 restringió UPDATE de "profiles" a un GRANT de columna explícito
-- (revoke update on public.profiles from authenticated; grant update
-- (lista de columnas) ...), y 0054 la volvió a redefinir (sacó
-- display_name de la lista para forzar el rename pago por
-- cambiar_nombre_usuario(), sumó avatar_url y ocultar_doble_o_nada) —
-- esa es la lista vigente hoy, no la de 0035. onboarding_quimia_completado
-- quedó afuera al no existir todavía. Sin este re-grant, el guardado
-- del diagnóstico de Quimia (guardar() en DiagnosticoQuimiaClient, que
-- hace un update directo, mismo patrón que Enigmia) siempre falla con
-- 42501 "permission denied for table profiles" — la RLS policy no es
-- el problema, es el GRANT de columna. El síntoma real es que Quimia
-- queda inaccesible: requireMundoQuimia() redirige a /quimia/diagnostico
-- mientras onboarding_quimia_completado no quede en true, y como el
-- guardado nunca persiste, el usuario vuelve al diagnóstico cada vez
-- que "termina" — un loop, no un botón roto.
--
-- (Auditoría de RLS de esta misma tanda: una versión anterior de este
-- bloque reintrodujo por error display_name y se olvidó avatar_url/
-- ocultar_doble_o_nada, copiando la lista vieja de 0035 en vez de la de
-- 0054 — corregido acá antes de que nadie llegue a correrlo.)
revoke update on public.profiles from authenticated;
grant update (
  meta_xp_diaria,
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

-- ---------- ampliar checks existentes (mismo criterio que 0019/0022/0026/0032) ----------

alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla'
  ));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla'
  ));

alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia'));

alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia'));

alter table public.duel_queue drop constraint if exists duel_queue_mundo_check;
alter table public.duel_queue add constraint duel_queue_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'aleatorio'));

alter table public.duels drop constraint if exists duels_mundo_check;
alter table public.duels add constraint duels_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia'));

alter table public.feed_posts drop constraint if exists feed_posts_mundo_check;
alter table public.feed_posts add constraint feed_posts_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'aleatorio'));

-- ---------- escalera de dificultad por rango (mismo criterio que Enigmia) ----------
-- Bronce: Modo 1 (símbolos) con los elementos fáciles. Plata: + Modo 2
-- (fórmulas) cotidiano. Oro: Modo 1 completo (nivel más alto, no modo
-- nuevo). Platino: + Modo 2 completo. Diamante: + Modo 3 (tabla).
-- Prodigio: los 3 a máxima dificultad.
create or replace function public.modo_quimia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1500 then
    v_opciones := array['simbolos', 'formulas', 'tabla']; -- Diamante y Prodigio
  elsif p_elo_promedio >= 900 then
    v_opciones := array['simbolos', 'formulas']; -- Plata, Oro y Platino
  else
    v_opciones := array['simbolos']; -- Bronce
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.nivel_quimia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when p_elo_promedio >= 1700 then 10::smallint                        -- Prodigio: máxima dificultad
    when p_elo_promedio >= 1500 then (8 + floor(random() * 2))::smallint  -- Diamante: 8-9
    when p_elo_promedio >= 1300 then (6 + floor(random() * 2))::smallint  -- Platino: 6-7
    when p_elo_promedio >= 1100 then (4 + floor(random() * 2))::smallint  -- Oro: 4-5
    when p_elo_promedio >= 900  then (2 + floor(random() * 2))::smallint  -- Plata: 2-3
    else 1::smallint                                                       -- Bronce
  end;
$$;

alter table public.duels add column if not exists nivel_quimia smallint;

-- ---------- buscar_rival_duelo: suma Quimia al mundo aleatorio + duelos directos ----------
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

    -- Solo 3 rondas en una serie "todas las ciudades" (mejor de 3), pero
    -- v_mundos ahora tiene 4 elementos — se usan los primeros 3 después
    -- del shuffle, el mismo criterio que ya usaba el shuffle de 3.
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

-- ---------- obtener_duelo: suma nivel_quimia al cálculo de "nivel" genérico ----------
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
        when v_duel.mundo = 'quimia' then coalesce(v_duel.nivel_quimia, 5::smallint)
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

-- ---------- ranking_semanal_filtrado: suma Quimia como filtro "Por mundo" ----------
drop function if exists public.ranking_semanal_filtrado(text, boolean);

create function public.ranking_semanal_filtrado(p_mundo text default null, p_solo_amigos boolean default false)
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

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ---------- Aprender: 4 lecciones mnemotécnicas (problem_type='quimia') ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
(
  'agrupar-por-familia',
  'Agrupar por familia',
  'En vez de memorizar elementos sueltos, agruparlos por familia química.',
  'quimia',
  '{"pasos": [
    "No memorices los elementos sueltos, uno por uno — agrupalos por familia química: metales alcalinos (Li, Na, K...), halógenos (Cl...), gases nobles (He...).",
    "Cada familia comparte comportamiento — si sabés que el sodio (Na) es un metal alcalino muy reactivo, ya sabés algo real del litio (Li) y el potasio (K) sin memorizarlos aparte.",
    "Menos datos sueltos que recordar, más patrones que reconocer — así funciona la memoria a largo plazo."
  ]}'::jsonb,
  1
),
(
  'asociacion-color-uso',
  'Asociación por color o uso cotidiano',
  'Conectar el símbolo con algo visual conocido en vez de memorizar la letra sola.',
  'quimia',
  '{"pasos": [
    "Au es oro — pensá en el brillo dorado de una joya, no en la letra sola.",
    "Fe es hierro — pensá en el óxido rojizo (la herrumbre) que ves en un portón viejo.",
    "Cu es cobre — pensá en el tono anaranjado de un cable eléctrico pelado.",
    "Una imagen cotidiana pega más fuerte en la memoria que una letra abstracta."
  ]}'::jsonb,
  2
),
(
  'tabla-como-mapa',
  'Leer la tabla como un mapa, no como una lista',
  'Usar la posición (fila=período, columna=grupo) como coordenada para ubicar un elemento.',
  'quimia',
  '{"pasos": [
    "La tabla periódica no es una lista para memorizar de memoria — es un mapa con coordenadas: fila (período) y columna (grupo).",
    "Mismo truco que usás en Geografía con país-vecino: si sabés dónde está el sodio (Na, período 3, grupo 1), el magnesio (Mg) está justo al lado.",
    "Elementos del mismo grupo (misma columna) se parecen entre sí — usá esa cercanía como pista, no memorices cada casillero suelto."
  ]}'::jsonb,
  3
),
(
  'patrones-en-formulas',
  'Patrones en cómo se nombran los compuestos',
  'Reconocer patrones comunes en los nombres de compuestos en vez de memorizar cada uno suelto.',
  'quimia',
  '{"pasos": [
    "Muchos ácidos que contienen oxígeno terminan en \"-ico\" (sulfúrico, H2SO4) — los que no tienen oxígeno suelen empezar con \"ácido ... hídrico\" (clorhídrico, HCl).",
    "Un compuesto de dos elementos suele nombrarse \"[segundo elemento] de [primer elemento]\" — cloruro DE sodio (NaCl), óxido DE calcio.",
    "Reconocer el patrón te ahorra memorizar cada fórmula suelta — podés deducir varias a partir de una sola regla."
  ]}'::jsonb,
  4
)
on conflict (slug) do nothing;

-- ---------- Logros específicos de Quimia ----------
-- Los tipos de criterio nuevos (quimia_problemas_totales,
-- quimia_modos_variados, quimia_nivel_mundo) los evalúa
-- src/lib/logros/verificar.ts, mismo patrón que el resto de los logros.
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('quimia-explorador', 'Explorador de Quimia', 'Probaste los 3 modos de Quimia — símbolos, fórmulas y tabla periódica.', 'quimia', '{"tipo": "quimia_modos_variados", "valor": 3}'),
('quimia-nivel-5', 'A mitad de tabla', 'Alcanzaste nivel 5 de mundo en Quimia.', 'quimia', '{"tipo": "quimia_nivel_mundo", "valor": 5}'),
('quimia-100', 'Químico de cabecera', 'Resolviste 100 problemas en Quimia.', 'quimia', '{"tipo": "quimia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;
