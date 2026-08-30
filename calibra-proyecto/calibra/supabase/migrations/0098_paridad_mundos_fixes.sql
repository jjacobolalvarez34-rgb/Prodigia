-- ============================================================
-- Auditoría de paridad Fase 1/2 (2026-08-27): fixes SQL encontrados por
-- los 5 sub-agentes de auditoría, todos de la misma clase de bug —
-- "se agregó un sub-tipo nuevo a un mundo (melodia_oido_absoluto,
-- quimia_nomenclatura/organica) y algún lugar que enumera sub-tipos a
-- mano nunca se actualizó". Acá van los que viven en funciones SQL
-- (los de TypeScript se arreglaron directo en el código):
--   1. registrar_puntos_mundo: la rama 'melodia' no contaba
--      melodia_oido_absoluto para "dominio" (nivel_mundo) — una
--      partida entera de Oído Absoluto no hacía subir el nivel de
--      mundo ni disparaba el hito de feed.
--   2. ranking_semanal_filtrado: la rama 'quimia' seguía con la lista
--      vieja de 3 sub-tipos (le faltaban nomenclatura/organica) y la
--      rama 'melodia' con la lista vieja de 5 (le faltaba
--      oido_absoluto) — el ranking semanal por mundo subcontaba XP
--      real en ambos casos.
--   3. modo_quimia_aleatorio_por_rango: el pool de sub-tipos para
--      matchmaking/duelos por rango seguía en solo 3 — nomenclatura y
--      organica (agregados en 0067) nunca podían salir en un duelo.
-- ============================================================

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
    -- FIX: 5 -> 6 temas, agregado melodia_oido_absoluto (Fase 7,
    -- 0096_melodia_oido_absoluto.sql) que nunca se propagó acá.
    v_temas_totales := 6;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto');
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
    -- geografia / quimia / anatomia / melodia: un solo problem_type de
    -- lección, igual al nombre del mundo.
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
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
              -- FIX: faltaban quimia_nomenclatura/quimia_organica (0067).
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
              -- FIX: faltaba melodia_oido_absoluto (0096).
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto')
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

-- ---------- modo_quimia_aleatorio_por_rango: suma nomenclatura/organica ----------
-- Mismo criterio que oido_absoluto en Melodía (0096): el sub-tipo más
-- nuevo/avanzado se reserva para el tramo de ELO más alto, no se suma a
-- todos los tramos de golpe.
create or replace function public.modo_quimia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['simbolos', 'formulas', 'tabla', 'nomenclatura', 'organica']; -- Prodigio
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['simbolos', 'formulas', 'tabla', 'nomenclatura']; -- Diamante
  elsif p_elo_promedio >= 900 then
    v_opciones := array['simbolos', 'formulas']; -- Plata, Oro y Platino
  else
    v_opciones := array['simbolos']; -- Bronce
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;
