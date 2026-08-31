-- ============================================================
-- Prodigia — Mundo nuevo: Historia (#A0522D, sepia/terracota). Mismo
-- criterio que 0108_mundo_trigonometria.sql: todo junto desde el día
-- uno (calibración + Aprender + world_progress + duelos), nada
-- diferido a una fase posterior.
--
-- 4 modos, los 4 de opción múltiple (contenido curado a mano, no
-- procedural — ver src/lib/practica/historia.ts): cronología (ordenar
-- eventos o identificar el siglo), personajes, causa y efecto, fechas
-- exactas. Contenido restringido a hechos de consenso histórico
-- amplio — nada de historia política del siglo XX-XXI ni de
-- interpretación disputada.
-- Correr después de 0108_mundo_trigonometria.sql.
-- ============================================================

-- ---------- 1) Onboarding: columna + grant ----------
alter table public.profiles add column if not exists onboarding_historia_completado boolean not null default false;

revoke update on public.profiles from authenticated;
grant update (
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  onboarding_anatomia_completado,
  onboarding_melodia_completado,
  onboarding_trigonometria_completado,
  onboarding_historia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

-- ---------- 2) Calibración (skill_levels / attempts) ----------
alter table public.skill_levels drop constraint skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas'
  ));

alter table public.attempts drop constraint attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas'
  ));

-- ---------- 3) Lecciones (mismo problem_type genérico = nombre del mundo) ----------
alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria', 'anatomia', 'melodia', 'trigonometria', 'historia'
  ));

-- ---------- 4) world_progress (nivel de mundo) ----------
alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'));

-- ---------- 5) registrar_puntos_mundo(): rama de dominio para Historia ----------
create or replace function public.registrar_puntos_mundo(p_world text, p_puntos integer)
returns table (world text, puntos_mundo integer, nivel_mundo integer, nivel_anterior integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
  v_nivel_anterior integer;
  v_temas_totales integer := 1;
  v_temas_en_10 integer := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_umbral_volumen constant integer := 50000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select w.nivel_mundo into v_nivel_anterior
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_nivel_anterior := coalesce(v_nivel_anterior, 1);

  if p_puntos > 0 then
    insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
    values (v_user, p_world, p_puntos, 1, now())
    on conflict (user_id, world) do update
      set puntos_mundo = public.world_progress.puntos_mundo + excluded.puntos_mundo,
          updated_at = now()
    returning public.world_progress.puntos_mundo into v_puntos;
  else
    select w.puntos_mundo into v_puntos from public.world_progress w where w.user_id = v_user and w.world = p_world;
    v_puntos := coalesce(v_puntos, 0);
  end if;

  if p_world = 'numeria' then
    v_temas_totales := 20;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in (
        'suma', 'resta', 'multiplicacion', 'division',
        'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
        'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
        'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
        'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
        'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas'
      );
  elsif p_world = 'geografia' then
    v_temas_totales := 1;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and problem_type = 'geografia' and nivel = 10;
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica');
  elsif p_world = 'enigmia' then
    v_temas_totales := 1;
    select count(*) into v_temas_en_10 from public.logic_skill_levels
      where user_id = v_user and nivel = 10;
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso');
  elsif p_world = 'melodia' then
    v_temas_totales := 6;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto');
  elsif p_world = 'trigonometria' then
    v_temas_totales := 4;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes');
  elsif p_world = 'historia' then
    v_temas_totales := 4;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas');
  end if;

  if p_world = 'enigmia' then
    select count(*) into v_lecciones_totales from public.logic_techniques;
    select count(*) into v_lecciones_completadas
      from public.logic_technique_progress ltp
      where ltp.user_id = v_user and ltp.dominado;
  elsif p_world = 'numeria' then
    select count(*) into v_lecciones_totales from public.techniques
      where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado
        and t.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria');
  else
    -- geografia / quimia / anatomia / melodia / trigonometria / historia:
    -- un solo problem_type de lección, igual al nombre del mundo.
    select count(*) into v_lecciones_totales from public.techniques where problem_type = p_world;
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado and t.problem_type = p_world;
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / v_umbral_volumen);
  v_frac_dominio := case when v_temas_totales > 0 then v_temas_en_10::numeric / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.3 * v_frac_volumen + 0.5 * v_frac_dominio + 0.2 * v_frac_lecciones))::integer));

  update public.world_progress set nivel_mundo = v_nivel where user_id = v_user and world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;

-- ---------- 6) Ranking semanal por mundo (Global y Amigos) ----------
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
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
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
          ), 0)
          when p_mundo = 'melodia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
          ), 0)
          when p_mundo = 'trigonometria' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
          ), 0)
          when p_mundo = 'historia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
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

grant execute on function public.ranking_semanal_filtrado(text, boolean) to authenticated;

-- ---------- 7) lecciones_completadas_por_mundo(): rama historia ----------
create or replace function public.lecciones_completadas_por_mundo()
returns table (mundo text, completadas bigint, total bigint)
language sql
security definer
set search_path = public
as $$
  with totales as (
    select
      case
        when problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria') then 'numeria'
        when problem_type = 'geografia' then 'geografia'
        when problem_type = 'quimia' then 'quimia'
        when problem_type = 'anatomia' then 'anatomia'
        when problem_type = 'melodia' then 'melodia'
        when problem_type = 'trigonometria' then 'trigonometria'
        when problem_type = 'historia' then 'historia'
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia')
  )
  select t.mundo, count(tp.technique_id) filter (where tp.dominado), count(t.id)
  from totales t
  left join public.technique_progress tp on tp.technique_id = t.id and tp.user_id = auth.uid()
  where t.mundo is not null
  group by t.mundo
  union all
  select 'enigmia',
    (select count(*) from public.logic_technique_progress ltp where ltp.user_id = auth.uid() and ltp.dominado),
    (select count(*) from public.logic_techniques);
$$;

grant execute on function public.lecciones_completadas_por_mundo() to authenticated;

-- ---------- 8) Logros de Historia ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo', 'anatomia', 'melodia', 'trigonometria', 'historia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('historia-explorador', 'Explorador de Historia', 'Probaste los 4 modos de Historia — cronología, personajes, causa y efecto, y fechas exactas.', 'historia', '{"tipo": "historia_modos_variados", "valor": 4}'),
('historia-nivel-5', 'Cronista Novato', 'Alcanzaste nivel 5 de mundo en Historia.', 'historia', '{"tipo": "historia_nivel_mundo", "valor": 5}'),
('historia-100', 'Cien Hechos', 'Resolviste 100 problemas en Historia.', 'historia', '{"tipo": "historia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;

-- ---------- 9) 5 lecciones de Historia ("Aprender") ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('historia-anclaje-cronologico', 'Anclaje cronológico',
  'Usá una fecha que ya sabés de memoria como punto de referencia para ubicar otras fechas cercanas en el tiempo.',
  'historia',
  '{"pasos": [
    "Elegí una fecha que ya tengas bien memorizada (tu cumpleaños, un año importante para vos, un hito que ya sabés de memoria)",
    "Cuando aparezca una fecha nueva, calculá la distancia en años hacia ese ancla en vez de memorizarla suelta",
    "Ejemplo: si sabés que el año 2000 es tu ancla, un evento de 1969 es simplemente treinta y un años antes",
    "Con el tiempo acumulás varios anclas (uno por siglo o por tema) y cualquier fecha nueva se ubica rápido comparándola contra el ancla más cercana"
  ]}',
  1),
('historia-bloques-por-siglo', 'Agrupar por siglo o era, no por fecha suelta',
  'Pensar en bloques de tiempo grandes primero, y recién después afinar el año exacto adentro de ese bloque.',
  'historia',
  '{"pasos": [
    "Antes de aprender el año exacto de un evento, ubicá primero en qué siglo o era ocurrió",
    "Agrupá mentalmente los hechos que ya sabés en esos mismos bloques — antigüedad clásica, edad media, edad moderna, etc.",
    "Un bloque con pocos eventos adentro es mucho más fácil de repasar que una lista plana de 20 fechas sueltas",
    "Recién cuando el bloque está firme, agregale la precisión del año exacto — nunca al revés"
  ]}',
  2),
('historia-asociacion-memorable', 'Asociación memorable',
  'Conectar un evento con una imagen, frase o sonido que se pegue fácil es mucho más efectivo que repetir la fecha en voz alta.',
  'historia',
  '{"pasos": [
    "Para cada evento que te cueste recordar, inventate una imagen mental exagerada o una frase pegadiza que lo conecte con el dato clave",
    "Cuanto más rara o graciosa sea la asociación, mejor se queda — no hace falta que tenga sentido para otra persona, solo para vos",
    "Ejemplo: para una fecha con varios cuatros, podés imaginarte literalmente cuatro objetos relacionados con el evento",
    "Revisá la asociación una sola vez más al día siguiente — ese segundo repaso es el que la fija de verdad"
  ]}',
  3),
('historia-linea-de-tiempo-mental', 'Línea de tiempo mental',
  'Visualizar los eventos de un período como puntos ubicados en una línea imaginaria, no como una lista para recitar.',
  'historia',
  '{"pasos": [
    "Imaginate una línea recta que cruza el cuarto donde estás — un extremo es el pasado más lejano, el otro es hoy",
    "Ubicá cada evento nuevo como un punto físico en esa línea, cerca de los otros eventos que ya tenés ubicados",
    "Cuando te pregunten el orden de varios eventos, en vez de recordar una lista, \"caminá\" mentalmente por la línea de un extremo al otro",
    "Esta técnica es la que mejor funciona para el modo Cronología — ordenar se vuelve leer la línea, no calcular"
  ]}',
  4),
('historia-siglas-para-secuencias', 'Siglas para recordar secuencias cortas',
  'Cuando tenés que memorizar el orden exacto de 3 o 4 eventos, armá una sigla con la primera letra de cada uno.',
  'historia',
  '{"pasos": [
    "Tomá la primera letra (o sílaba) de cada evento, en el orden correcto",
    "Armá una palabra o frase corta con esas letras — no hace falta que sea una palabra real, alcanza con que te resulte fácil de pronunciar",
    "Repetila un par de veces en voz alta antes de responder — el sonido ayuda más que mirar la lista escrita",
    "Esta técnica funciona mejor combinada con la línea de tiempo mental (lección anterior): la sigla te da el ORDEN, la línea te da el CONTEXTO"
  ]}',
  5)
on conflict (slug) do nothing;

-- ---------- 10) Duelos: columna de nivel + constraints de mundo ----------
alter table public.duels add column if not exists nivel_historia smallint;

alter table public.duels drop constraint if exists duels_mundo_check;
alter table public.duels add constraint duels_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'));

alter table public.duel_queue drop constraint if exists duel_queue_mundo_check;
alter table public.duel_queue add constraint duel_queue_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'aleatorio'));

alter table public.duel_invites drop constraint if exists duel_invites_mundo_check;
alter table public.duel_invites add constraint duel_invites_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'));

alter table public.feed_posts drop constraint if exists feed_posts_mundo_check;
alter table public.feed_posts add constraint feed_posts_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'aleatorio'));

-- ---------- 11) Pools por rango: Historia ----------
create or replace function public.modo_historia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['cronologia', 'personajes', 'causaefecto', 'fechas'];
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['cronologia', 'personajes', 'causaefecto'];
  elsif p_elo_promedio >= 900 then
    v_opciones := array['cronologia', 'personajes'];
  else
    v_opciones := array['cronologia'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.nivel_historia_por_rango(p_elo_promedio numeric)
returns smallint
language sql
as $$
  select case
    when p_elo_promedio >= 1700 then 10::smallint
    when p_elo_promedio >= 1500 then (8 + floor(random() * 2))::smallint
    when p_elo_promedio >= 1300 then (6 + floor(random() * 2))::smallint
    when p_elo_promedio >= 1100 then (4 + floor(random() * 2))::smallint
    when p_elo_promedio >= 900  then (2 + floor(random() * 2))::smallint
    else 1::smallint
  end;
$$;

-- ---------- 12) buscar_rival_duelo(): + historia ----------
drop function if exists public.buscar_rival_duelo(text, text, boolean);

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
  v_es_bot boolean := false;
  v_velocidad_min_bot integer;
  v_velocidad_max_bot integer;
  v_tasa_bot numeric;
  v_duel_id uuid;
  v_this_duel_id uuid;
  v_elo_promedio numeric;
  v_serie_id uuid;
  v_mundos text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
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
  v_nivel_ronda smallint;
  v_sim record;
  v_bot_id uuid;
  v_bot_elo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'aleatorio') then
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

      insert into public.duels (
        retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo,
        modo, serie_id, ronda_numero, ronda_total,
        nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, clasificatorio
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
          else null
        end,
        'mejor_de_3', v_serie_id, v_i, 3,
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist,
        true
      )
      returning id into v_this_duel_id;

      if v_es_bot then
        v_nivel_ronda := coalesce(
          v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist,
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

    insert into public.duels (
      retador_id, retado_id, semilla_problemas, operation_type, mundo, sub_tipo, modo,
      nivel_numeria, nivel_enigmia, nivel_quimia, nivel_anatomia, nivel_melodia, nivel_trigonometria, nivel_historia, clasificatorio
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
        else null
      end,
      'simple',
      v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist,
      p_ranked
    )
    returning id into v_duel_id;
    v_mundo_encontrado := p_mundo;

    if v_es_bot then
      v_nivel_ronda := coalesce(
        v_nivel_num, v_nivel_enig, v_nivel_quim, v_nivel_anat, v_nivel_melo, v_nivel_trig, v_nivel_hist,
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

-- ---------- 13) obtener_duelo(): + historia ----------
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

-- ---------- 14) crear_invitacion_duelo(): + historia ----------
-- Mismo aviso que 0108: la validación de Quimia se deja tal cual está
-- hoy (bug preexistente, fuera de alcance de esta tanda).
drop function if exists public.crear_invitacion_duelo(text, text, text);

create function public.crear_invitacion_duelo(p_mundo text default 'numeria', p_operation_type text default null, p_sub_tipo text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;
  if p_mundo = 'numeria' then
    if p_operation_type not in ('suma', 'resta', 'multiplicacion', 'division') then
      raise exception 'operacion invalida';
    end if;
  elsif p_mundo = 'geografia' then
    if p_sub_tipo not in ('america', 'europa', 'africa', 'asia_oceania') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'enigmia' then
    if p_sub_tipo not in ('memoria', 'patrones', 'deduccion', 'computacional') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'quimia' then
    if p_sub_tipo not in ('simbolos', 'formulas', 'tabla') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'anatomia' then
    if p_sub_tipo not in ('oseo', 'muscular', 'organos', 'nervioso') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'melodia' then
    if p_sub_tipo not in ('fundamentos', 'lectura', 'alteraciones', 'escalas', 'acordes', 'oido_absoluto') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'trigonometria' then
    if p_sub_tipo not in ('razones', 'circulo', 'identidades', 'leyes') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'historia' then
    if p_sub_tipo not in ('cronologia', 'personajes', 'causaefecto', 'fechas') then
      raise exception 'opcion invalida';
    end if;
  end if;

  update public.duel_invites set estado = 'cancelada'
  where creador_id = v_user and estado = 'esperando';

  insert into public.duel_invites (creador_id, mundo, operation_type, sub_tipo)
  values (v_user, p_mundo, case when p_mundo = 'numeria' then p_operation_type else null end, case when p_mundo = 'numeria' then null else p_sub_tipo end)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.crear_invitacion_duelo(text, text, text) to authenticated;
