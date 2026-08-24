-- ============================================================
-- Prodigia — Fase 1 ("nuevo mundo Melodía"): teoría musical generada
-- por fórmula (pentagrama, alteraciones, escalas, acordes — todo
-- construido desde intervalos reales, no contenido curado a mano).
-- Mismo patrón que Quimia (0056/0057) y Anatomía (0081/0087), aplicado
-- desde el día uno con la checklist completa de docs/ESPECIFICACION.md
-- ("Checklist de mundo nuevo"), salvo los puntos 8-10 (Rankeds/retar-
-- amigo/invitar-por-link): MelodiaSprintRunner/MelodiaPracticaClient
-- no soportan duelos en tiempo real todavía (mismo motivo documentado
-- en 0087 para Anatomía) — se agregan en la Fase 2 de esta misma
-- tanda, junto con el soporte de duelos para Anatomía.
--
-- La lista de columnas del GRANT es la vigente de 0086 (la última que
-- tocó este grant) más onboarding_melodia_completado.
-- Correr después de 0088_rendirse_duelo.sql.
-- ============================================================

alter table public.profiles add column if not exists onboarding_melodia_completado boolean not null default false;

revoke update on public.profiles from authenticated;
grant update (
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  onboarding_quimia_completado,
  onboarding_anatomia_completado,
  onboarding_melodia_completado,
  interes_inicial,
  avatar_url,
  ocultar_doble_o_nada
) on public.profiles to authenticated;

-- ---------- Calibración (skill_levels / attempts) ----------
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
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes'
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
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes'
  ));

-- ---------- Lecciones (mismo problem_type genérico = nombre del mundo) ----------
alter table public.techniques drop constraint techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria', 'anatomia', 'melodia'
  ));

-- ---------- world_progress (nivel de mundo) ----------
alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia'));

-- ---------- registrar_puntos_mundo(): rama de dominio para Melodía ----------
drop function if exists public.registrar_puntos_mundo(text, integer);

create function public.registrar_puntos_mundo(p_world text, p_puntos integer)
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
    v_temas_totales := 5;
    select count(*) into v_temas_en_10 from public.skill_levels
      where user_id = v_user and nivel = 10 and problem_type in
        ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes');
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

grant execute on function public.registrar_puntos_mundo(text, integer) to authenticated;

-- ---------- Ranking por mundo (Global y Amigos) ----------
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
              and a.problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla')
          ), 0)
          when p_mundo = 'anatomia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
          ), 0)
          when p_mundo = 'melodia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes')
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

-- ---------- Logros de Melodía (mismo patrón que Quimia/Anatomía) ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo', 'anatomia', 'melodia'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('melodia-explorador', 'Explorador de Melodía', 'Probaste los 5 modos de Melodía — fundamentos, lectura, alteraciones, escalas y acordes.', 'melodia', '{"tipo": "melodia_modos_variados", "valor": 5}'),
('melodia-nivel-5', 'Oído Entrenado', 'Alcanzaste nivel 5 de mundo en Melodía.', 'melodia', '{"tipo": "melodia_nivel_mundo", "valor": 5}'),
('melodia-100', 'Primera Sinfonía', 'Resolviste 100 problemas en Melodía.', 'melodia', '{"tipo": "melodia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;

-- ---------- 5 lecciones de Melodía ("Aprender") ----------
insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden) values
('melodia-lineas-y-espacios', 'Leé el pentagrama por posición, no nota por nota',
  'El pentagrama tiene 5 líneas y 4 espacios (de abajo hacia arriba). En clave de sol, cada línea y cada espacio es SIEMPRE la misma nota — memorizá la posición, no cada nota suelta cada vez que aparece.',
  'melodia',
  '{"pasos": [
    "Las 5 líneas (de abajo hacia arriba) son: Mi, Sol, Si, Re, Fa",
    "Los 4 espacios (de abajo hacia arriba) son: Fa, La, Do, Mi",
    "Una vez que sabés las 9 posiciones fijas, cualquier nota del pentagrama es una de esas 9 — no hay que adivinar de nuevo cada vez",
    "Las notas que quedan arriba o abajo de las 5 líneas usan líneas adicionales cortas (ledger lines) — siguen la misma lógica, solo que fuera del pentagrama"
  ]}',
  1),
('melodia-truco-lineas-espacios', 'Un truco para no olvidarte de las 9 posiciones',
  'Armá una frase corta con esas 9 letras en orden — cualquier frase que te resulte fácil de recordar sirve, no hace falta que sea una frase "oficial". Lo importante es el ORDEN de las letras, no la frase en sí.',
  'melodia',
  '{"pasos": [
    "Líneas (Mi-Sol-Si-Re-Fa): probá algo tipo \"Mi Sobrina Siempre Repite Frases\"",
    "Espacios (Fa-La-Do-Mi): probá algo tipo \"Fabio Lava Dos Manzanas\"",
    "No son frases estándar ni las vas a encontrar en un libro — armá la tuya propia, la que más se te pegue a vos",
    "El objetivo es reconocer la posición de un vistazo, sin contar línea por línea cada vez"
  ]}',
  2),
('melodia-triada-fundamental-3-5', 'Cómo se arma cualquier tríada: fundamental, 3ra, 5ta',
  'Una tríada son 3 notas apiladas en intervalos de tercera — la fundamental, la 3ra (4 semitonos arriba si es mayor, 3 si es menor) y la 5ta (7 semitonos arriba de la fundamental, casi siempre). Cambiando esos 2 números cambia el tipo de tríada.',
  'melodia',
  '{"pasos": [
    "Fundamental: la nota base, semitono 0",
    "3ra: 4 semitonos arriba (mayor) o 3 semitonos arriba (menor) — esa sola diferencia decide si suena mayor o menor",
    "5ta: 7 semitonos arriba de la fundamental en la mayoría de los casos (6 si es disminuida, 8 si es aumentada)",
    "Con esta fórmula servís CUALQUIER fundamental — no hace falta memorizar 12 tríadas mayores sueltas, es la misma receta 12 veces"
  ]}',
  3),
('melodia-de-triada-a-septima', 'De tríada a séptima: una nota más arriba',
  'Una séptima es una tríada (fundamental-3ra-5ta) con una 4ta nota arriba — 10 u 11 semitonos sobre la fundamental según el tipo. No es un acorde distinto de cero, es la tríada de siempre con un agregado.',
  'melodia',
  '{"pasos": [
    "Arrancás con la tríada de siempre (fundamental-3ra-5ta)",
    "Le sumás una nota más: 11 semitonos arriba de la fundamental da séptima mayor (maj7), 10 semitonos da séptima dominante (7)",
    "Sobre una tríada menor, 10 semitonos arriba da séptima menor (m7)",
    "Pensalo como \"tríada + una nota\", no como una forma nueva que hay que aprender desde cero"
  ]}',
  4),
('melodia-sostenidos-bemoles', 'Sostenidos y bemoles: la misma tecla, dos nombres',
  'Un sostenido (♯) sube la nota medio tono, un bemol (♭) la baja medio tono. Do♯ y Re♭ son la MISMA altura — se llaman distinto según de qué nota vengas, no porque suenen distinto.',
  'melodia',
  '{"pasos": [
    "♯ = medio tono más arriba de la nota natural",
    "♭ = medio tono más abajo de la nota natural",
    "Do♯ y Re♭ sueltan exactamente el mismo sonido — es un \"enarmónico\", dos nombres para la misma altura",
    "La alteración no mueve la posición en el pentagrama (sigue siendo la misma línea o espacio) — solo agrega el símbolo al lado"
  ]}',
  5)
on conflict (slug) do nothing;
