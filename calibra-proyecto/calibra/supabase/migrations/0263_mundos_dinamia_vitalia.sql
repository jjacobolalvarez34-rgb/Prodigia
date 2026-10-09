-- ============================================================
-- Prodigia — Mundos 14 y 15: Dinamia (Física, #2563EB azul rey) y Vitalia
-- (Biología, #16A34A verde hoja). Plan aprobado el 2026-10-08:
-- docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md. Mundos NORMALES en todo, igual que
-- 0189/0190 con Estadística, Naipia y Codia.
--
--   Dinamia (6 modos, niveles 1-10 en cada uno): dinamia_cinematica,
--     _vectores, _newton, _energia, _termo, _fluidos.
--   Vitalia (6 modos, niveles 1-10): vitalia_celula, _procesos, _genetica,
--     _sistemas, _reinos, _ecologia.
--   sub_tipo del duelo = el nombre del modo sin el prefijo.
--
-- ⚠️ Regla de docs/PARIDAD_MUNDOS.md: cada función parte de la ÚLTIMA
-- migración que la redefine (se armó con un generador que lee esa versión
-- y solo agrega los dos mundos):
--   buscar_rival_duelo, obtener_duelo ............ 0244
--   comprar_item_tienda .......................... 0248
--   crear_invitacion_duelo, detalle_nivel_mundo,
--   ranking_semanal_filtrado, registrar_progreso_mundo,
--   xp_real_por_mundo, checks de skill_levels/attempts ... 0252
--   desbloquear_mundo, elegir_mundos_iniciales,
--   guardar_afinidad_banner ...................... 0190
--   estadisticas_pro_* ........................... 0207
--   mundo_doble_experiencia ...................... 0247
--   mundo_de_problem_type ........................ 0249
--   horas_dia_ciudad, mis_constelaciones,
--   revisar_recompensas .......................... 0259
--   check de marco_perfil ........................ 0258
--   check de fondo_perfil ........................ 0248
--   guardar_diagnostico_mundo .................... 0261
--   lecciones_completadas_por_mundo,
--   sincronizar_progreso_mundo, checks de techniques/world_progress/
--   duelos/feed/logros ........................... 0189
--
-- Cambios que se notan:
--  - El mundo con doble experiencia rota entre 15 (antes 13): cambia qué
--    mundo toca cada día (src/lib/eventos/dobleExperiencia.ts igual).
--  - Días de las ciudades nuevas: Dinamia 8 h, Vitalia 168 h (una semana).
--    Los dos dividen 672, así que la Gran Alineación sigue cayendo igual.
--  - El paquete de marcos de mundo pasa a 15 marcos: 27 000 Chispas
--    (15 × 2400 − 25 %) y pide nivel 40 en los 15 mundos.
-- Las lecciones (Técnicas y Clases) van en sus migraciones de contenido.
-- Idempotente.
-- ============================================================

-- ---------- 1) Onboarding ----------
alter table public.profiles add column if not exists onboarding_dinamia_completado boolean not null default false;
alter table public.profiles add column if not exists onboarding_vitalia_completado boolean not null default false;
grant update (onboarding_dinamia_completado, onboarding_vitalia_completado) on public.profiles to authenticated;

-- ---------- 2) calibración: skill_levels (base 0252) ----------
alter table public.skill_levels drop constraint if exists skill_levels_problem_type_check;
alter table public.skill_levels add constraint skill_levels_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto', 'melodia_tempo',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas',
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable',
    'circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo',
    'estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos',
    'naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero',
    'codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras',
    'dinamia_cinematica', 'dinamia_vectores', 'dinamia_newton', 'dinamia_energia', 'dinamia_termo', 'dinamia_fluidos',
    'vitalia_celula', 'vitalia_procesos', 'vitalia_genetica', 'vitalia_sistemas', 'vitalia_reinos', 'vitalia_ecologia'
  ));

-- ---------- 2) calibración: attempts (base 0252) ----------
alter table public.attempts drop constraint if exists attempts_problem_type_check;
alter table public.attempts add constraint attempts_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'logica', 'fracciones', 'geografia', 'decimales', 'potencias', 'algebra',
    'geografia_america', 'geografia_europa', 'geografia_africa', 'geografia_asia_oceania',
    'quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica',
    'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas',
    'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
    'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
    'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
    'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
    'anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso',
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto', 'melodia_tempo',
    'trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes',
    'historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas',
    'calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable',
    'circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo',
    'estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos',
    'naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero',
    'codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras',
    'dinamia_cinematica', 'dinamia_vectores', 'dinamia_newton', 'dinamia_energia', 'dinamia_termo', 'dinamia_fluidos',
    'vitalia_celula', 'vitalia_procesos', 'vitalia_genetica', 'vitalia_sistemas', 'vitalia_reinos', 'vitalia_ecologia'
  ));

-- ---------- 3) lecciones, nivel de mundo, duelos, feed y logros (base 0189) ----------
alter table public.techniques drop constraint if exists techniques_problem_type_check;
alter table public.techniques add constraint techniques_problem_type_check
  check (problem_type in (
    'suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'geografia', 'algebra', 'quimia',
    'geometria', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia',
    'dinamia', 'vitalia'
  ));

alter table public.world_progress drop constraint if exists world_progress_world_check;
alter table public.world_progress add constraint world_progress_world_check
  check (world in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'));

alter table public.duels add column if not exists nivel_dinamia smallint;
alter table public.duels add column if not exists nivel_vitalia smallint;
alter table public.duels drop constraint if exists duels_mundo_check;
alter table public.duels add constraint duels_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'));
alter table public.duel_queue drop constraint if exists duel_queue_mundo_check;
alter table public.duel_queue add constraint duel_queue_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'aleatorio'));
alter table public.duel_invites drop constraint if exists duel_invites_mundo_check;
alter table public.duel_invites add constraint duel_invites_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'));
alter table public.feed_posts drop constraint if exists feed_posts_mundo_check;
alter table public.feed_posts add constraint feed_posts_mundo_check
  check (mundo in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'aleatorio'));

alter table public.achievements drop constraint if exists achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'));
insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('dinamia-explorador', 'Explorador de Dinamia', 'Probaste los 6 modos de Dinamia: cinemática, vectores, leyes de Newton, energía, termodinámica y fluidos.', 'dinamia', '{"tipo": "dinamia_modos_variados", "valor": 6}'),
('dinamia-nivel-5', 'En Movimiento', 'Alcanzaste nivel 5 de mundo en Dinamia.', 'dinamia', '{"tipo": "dinamia_nivel_mundo", "valor": 5}'),
('dinamia-100', 'Cien Fuerzas', 'Resolviste 100 problemas en Dinamia.', 'dinamia', '{"tipo": "dinamia_problemas_totales", "valor": 100}'),
('vitalia-explorador', 'Explorador de Vitalia', 'Probaste los 6 modos de Vitalia: la célula, procesos celulares, genética, sistemas del cuerpo, reinos y ecología.', 'vitalia', '{"tipo": "vitalia_modos_variados", "valor": 6}'),
('vitalia-nivel-5', 'Raíces Profundas', 'Alcanzaste nivel 5 de mundo en Vitalia.', 'vitalia', '{"tipo": "vitalia_nivel_mundo", "valor": 5}'),
('vitalia-100', 'Cien Células', 'Resolviste 100 problemas en Vitalia.', 'vitalia', '{"tipo": "vitalia_problemas_totales", "valor": 100}')
on conflict (slug) do nothing;

-- ---------- 4) marcos (base 0258) y fondos de perfil (base 0248) ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in (
    'ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio',
    'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia',
    'neon_violeta', 'neon_cian', 'neon_magenta',
    'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos',
    'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia',
    'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia',
    'pionero'
  ));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in (
    'ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio',
    'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia',
    'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia', 'ciudad_dinamia', 'ciudad_vitalia'
  ));

-- Catálogo de cada ciudad (mismas 8 piezas que 0248).
insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada)
select x.slug, x.categoria, x.valor, x.nombre, x.rareza, x.precio, x.vendible, x.en_capsulas, x.mundo, null
from (
  select 'marco_' || m.slug as slug, 'marco' as categoria, m.slug as valor, 'Marco ' || m.nombre as nombre, 'epico' as rareza, 2400 as precio, true as vendible, false as en_capsulas, m.slug as mundo from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'fondo_ciudad_' || m.slug, 'fondo', 'ciudad_' || m.slug, 'Fondo ' || m.nombre, 'raro', 1600, true, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'emote_ciudad_' || m.slug, 'emote', 'ciudad_' || m.slug, '¡Viva ' || m.nombre || '!', 'comun', 700, true, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'estela_ciudad_' || m.slug, 'estela', 'ciudad_' || m.slug, 'Estela de ' || m.nombre, 'raro', 1600, false, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'efecto_ciudad_' || m.slug, 'efecto', 'ciudad_' || m.slug, 'Destellos de ' || m.nombre, 'raro', 1600, false, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'titulo_ciudad_' || m.slug, 'titulo', 'habitante-' || m.slug, 'Habitante de ' || m.nombre, 'epico', 3000, false, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'marco_coleccion_' || m.slug, 'marco', 'coleccion_' || m.slug, 'Marco de colección ' || m.nombre, 'legendario', 9000, false, false, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
  union all
  select 'ciudad_placa_' || m.slug, 'ciudad_placa', m.slug, 'Ciudad de ' || m.nombre || ' en tu Placa', 'raro', 2000, true, true, m.slug from (values ('dinamia', 'Dinamia'), ('vitalia', 'Vitalia')) as m(slug, nombre)
) x
on conflict (slug) do update set
  categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza,
  precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas,
  mundo = excluded.mundo, temporada = excluded.temporada;

-- ---------- 5) funciones que enumeran los mundos ----------
create or replace function public.xp_real_por_mundo(p_user_id uuid, p_world text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select case p_world
    when 'enigmia' then (
      select coalesce(sum(la.xp), 0) from public.logic_attempts la where la.user_id = p_user_id
    )
    when 'geografia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type like 'geografia%'
    )
    when 'quimia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla', 'quimia_nomenclatura', 'quimia_organica')
    )
    when 'anatomia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('anatomia_oseo', 'anatomia_muscular', 'anatomia_organos', 'anatomia_nervioso')
    )
    when 'melodia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto', 'melodia_tempo')
    )
    when 'trigonometria' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('trigonometria_razones', 'trigonometria_circulo', 'trigonometria_identidades', 'trigonometria_leyes')
    )
    when 'historia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('historia_cronologia', 'historia_personajes', 'historia_causaefecto', 'historia_fechas')
    )
    when 'calculia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable')
    )
    when 'circuitia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo')
    )
    when 'estadistica' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos')
    )
    when 'naipia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero')
    )
    when 'codia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras')
    )
    when 'dinamia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('dinamia_cinematica', 'dinamia_vectores', 'dinamia_newton', 'dinamia_energia', 'dinamia_termo', 'dinamia_fluidos')
    )
    when 'vitalia' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('vitalia_celula', 'vitalia_procesos', 'vitalia_genetica', 'vitalia_sistemas', 'vitalia_reinos', 'vitalia_ecologia')
    )
    when 'numeria' then (
      select coalesce(sum(a.xp), 0) from public.attempts a
      where a.user_id = p_user_id and a.problem_type in
        ('suma', 'resta', 'multiplicacion', 'division',
         'fracciones_simplificar', 'fracciones_comparar', 'fracciones_sumar',
         'decimales_convertir', 'decimales_porcentaje', 'decimales_redondear',
         'potencias_potencia', 'potencias_raiz', 'potencias_notacion',
         'algebra_evaluar', 'algebra_un-paso', 'algebra_dos-pasos',
         'geometria_perimetro', 'geometria_area', 'geometria_angulos', 'geometria_ternas')
    )
    else 0::bigint
  end;
$$;

create or replace function public.registrar_progreso_mundo(p_world text, p_puntos integer)
returns table (mundo_out text, puntos_mundo_out integer, nivel_mundo_out integer, nivel_anterior integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_puntos integer;
  v_nivel integer;
  v_nivel_anterior integer;
  v_real_mundo integer;
  v_ya integer;
  v_por_acreditar integer;
  v_temas_totales integer := 1;
  v_suma_dominio numeric := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_umbral_volumen constant integer := 25000;
  v_rec record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select w.nivel_mundo into v_nivel_anterior
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_nivel_anterior := coalesce(v_nivel_anterior, 1);

  v_real_mundo := public.xp_real_por_mundo(v_user, p_world)::integer;
  select coalesce(w.puntos_mundo, 0) into v_ya
  from public.world_progress w where w.user_id = v_user and w.world = p_world;
  v_por_acreditar := greatest(0, v_real_mundo - v_ya);

  if v_por_acreditar > 0 then
    insert into public.world_progress (user_id, world, puntos_mundo, nivel_mundo, updated_at)
    values (v_user, p_world, v_por_acreditar, 1, now())
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
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('suma'), ('resta'), ('multiplicacion'), ('division'),
        ('fracciones_simplificar'), ('fracciones_comparar'), ('fracciones_sumar'),
        ('decimales_convertir'), ('decimales_porcentaje'), ('decimales_redondear'),
        ('potencias_potencia'), ('potencias_raiz'), ('potencias_notacion'),
        ('algebra_evaluar'), ('algebra_un-paso'), ('algebra_dos-pasos'),
        ('geometria_perimetro'), ('geometria_area'), ('geometria_angulos'), ('geometria_ternas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'geografia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('geografia_america'), ('geografia_europa'), ('geografia_africa'), ('geografia_asia_oceania')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('quimia_simbolos'), ('quimia_formulas'), ('quimia_tabla'),
        ('quimia_nomenclatura'), ('quimia_organica')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'enigmia' then
    v_temas_totales := 4;
    for v_rec in
      select cat as categoria, coalesce(sl.nivel, 1) as nivel
      from (values ('memoria'), ('patrones'), ('deduccion'), ('computacional')) as t(cat)
      left join public.logic_skill_levels sl
        on sl.user_id = v_user and sl.categoria = t.cat
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('anatomia_oseo'), ('anatomia_muscular'), ('anatomia_organos'), ('anatomia_nervioso')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'melodia' then
    v_temas_totales := 7;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('melodia_fundamentos'), ('melodia_lectura'), ('melodia_alteraciones'),
        ('melodia_escalas'), ('melodia_acordes'), ('melodia_oido_absoluto'), ('melodia_tempo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'trigonometria' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('trigonometria_razones'), ('trigonometria_circulo'),
        ('trigonometria_identidades'), ('trigonometria_leyes')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'historia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('historia_cronologia'), ('historia_personajes'),
        ('historia_causaefecto'), ('historia_fechas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'calculia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('calculia_derivadas'), ('calculia_integrales'),
        ('calculia_series'), ('calculia_multivariable')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'circuitia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('circuitia_serie'), ('circuitia_paralelo'),
        ('circuitia_mixto'), ('circuitia_cualitativo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'estadistica' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('estadistica_central'), ('estadistica_dispersion'), ('estadistica_probabilidad'),
        ('estadistica_datos'), ('estadistica_graficos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'naipia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('naipia_hilo'), ('naipia_ko'), ('naipia_hiopt2'),
        ('naipia_omega2'), ('naipia_verdadero')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'codia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('codia_sintaxis'), ('codia_salida'), ('codia_error'),
        ('codia_estructuras')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'dinamia' then
    v_temas_totales := 6;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('dinamia_cinematica'), ('dinamia_vectores'), ('dinamia_newton'), ('dinamia_energia'), ('dinamia_termo'), ('dinamia_fluidos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'vitalia' then
    v_temas_totales := 6;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('vitalia_celula'), ('vitalia_procesos'), ('vitalia_genetica'), ('vitalia_sistemas'), ('vitalia_reinos'), ('vitalia_ecologia')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = v_user and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  else
    v_temas_totales := 1;
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
    select count(*) into v_lecciones_totales from public.techniques where problem_type = p_world;
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = v_user and tp.dominado and t.problem_type = p_world;
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / v_umbral_volumen);
  v_frac_dominio := case when v_temas_totales > 0 then v_suma_dominio / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.34 * v_frac_volumen + 0.45 * v_frac_dominio + 0.21 * v_frac_lecciones))::integer));

  update public.world_progress as wp
  set nivel_mundo = v_nivel
  where wp.user_id = v_user and wp.world = p_world;

  return query select p_world, v_puntos, v_nivel, v_nivel_anterior;
end;
$$;

create or replace function public.detalle_nivel_mundo(p_user_id uuid, p_world text)
returns table (
  puntos_mundo integer,
  nivel_mundo integer,
  frac_volumen numeric,
  frac_dominio numeric,
  frac_lecciones numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_puntos integer;
  v_nivel integer;
  v_temas_totales integer := 1;
  v_suma_dominio numeric := 0;
  v_lecciones_totales integer := 0;
  v_lecciones_completadas integer := 0;
  v_frac_volumen numeric;
  v_frac_dominio numeric;
  v_frac_lecciones numeric;
  v_es_pro boolean;
  v_rec record;
begin
  v_puntos := coalesce(public.xp_real_por_mundo(p_user_id, p_world)::integer, 0);
  select coalesce(pr.plan = 'pro', false) into v_es_pro from public.profiles pr where pr.id = p_user_id;
  v_es_pro := coalesce(v_es_pro, false);

  if p_world = 'numeria' then
    v_temas_totales := 20;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('suma'), ('resta'), ('multiplicacion'), ('division'),
        ('fracciones_simplificar'), ('fracciones_comparar'), ('fracciones_sumar'),
        ('decimales_convertir'), ('decimales_porcentaje'), ('decimales_redondear'),
        ('potencias_potencia'), ('potencias_raiz'), ('potencias_notacion'),
        ('algebra_evaluar'), ('algebra_un-paso'), ('algebra_dos-pasos'),
        ('geometria_perimetro'), ('geometria_area'), ('geometria_angulos'), ('geometria_ternas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'geografia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('geografia_america'), ('geografia_europa'), ('geografia_africa'), ('geografia_asia_oceania')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'quimia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('quimia_simbolos'), ('quimia_formulas'), ('quimia_tabla'),
        ('quimia_nomenclatura'), ('quimia_organica')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'enigmia' then
    v_temas_totales := 4;
    for v_rec in
      select cat as categoria, coalesce(sl.nivel, 1) as nivel
      from (values ('memoria'), ('patrones'), ('deduccion'), ('computacional')) as t(cat)
      left join public.logic_skill_levels sl
        on sl.user_id = p_user_id and sl.categoria = t.cat
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'anatomia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('anatomia_oseo'), ('anatomia_muscular'), ('anatomia_organos'), ('anatomia_nervioso')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'melodia' then
    v_temas_totales := 7;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('melodia_fundamentos'), ('melodia_lectura'), ('melodia_alteraciones'),
        ('melodia_escalas'), ('melodia_acordes'), ('melodia_oido_absoluto'), ('melodia_tempo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'trigonometria' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('trigonometria_razones'), ('trigonometria_circulo'),
        ('trigonometria_identidades'), ('trigonometria_leyes')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'historia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('historia_cronologia'), ('historia_personajes'),
        ('historia_causaefecto'), ('historia_fechas')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'calculia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('calculia_derivadas'), ('calculia_integrales'),
        ('calculia_series'), ('calculia_multivariable')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'circuitia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('circuitia_serie'), ('circuitia_paralelo'),
        ('circuitia_mixto'), ('circuitia_cualitativo')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'estadistica' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('estadistica_central'), ('estadistica_dispersion'), ('estadistica_probabilidad'),
        ('estadistica_datos'), ('estadistica_graficos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'naipia' then
    v_temas_totales := 5;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('naipia_hilo'), ('naipia_ko'), ('naipia_hiopt2'),
        ('naipia_omega2'), ('naipia_verdadero')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'codia' then
    v_temas_totales := 4;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('codia_sintaxis'), ('codia_salida'), ('codia_error'),
        ('codia_estructuras')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'dinamia' then
    v_temas_totales := 6;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('dinamia_cinematica'), ('dinamia_vectores'), ('dinamia_newton'), ('dinamia_energia'), ('dinamia_termo'), ('dinamia_fluidos')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  elsif p_world = 'vitalia' then
    v_temas_totales := 6;
    for v_rec in
      select st as problem_type, coalesce(sl.nivel, 1) as nivel
      from (values
        ('vitalia_celula'), ('vitalia_procesos'), ('vitalia_genetica'), ('vitalia_sistemas'), ('vitalia_reinos'), ('vitalia_ecologia')
      ) as t(st)
      left join public.skill_levels sl
        on sl.user_id = p_user_id and sl.problem_type = t.st
    loop
      v_suma_dominio := v_suma_dominio + greatest(0.0, least(1.0, (v_rec.nivel - 4)::numeric / 6));
    end loop;
  else
    v_temas_totales := 1;
  end if;

  -- Aprender = Técnicas (gratis) + Clases (Pro). Una cuenta gratuita no puede
  -- completar las Clases, así que NO cuentan en su denominador: antes, al crecer
  -- Aprender (decenas de Clases por mundo), una cuenta gratuita quedaba topada
  -- lejos del 100 % de "Aprender" por lecciones que no puede abrir. Una cuenta
  -- Pro cuenta todo. `requiere_pro` existe en techniques desde 0170; logic_techniques
  -- (Enigmia) no tiene Clases Pro y cuenta completo.
  if p_world = 'enigmia' then
    select count(*) into v_lecciones_totales from public.logic_techniques;
    select count(*) into v_lecciones_completadas
      from public.logic_technique_progress ltp
      where ltp.user_id = p_user_id and ltp.dominado;
  elsif p_world = 'numeria' then
    select count(*) into v_lecciones_totales from public.techniques t
      where t.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria')
        and (v_es_pro or not t.requiere_pro);
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = p_user_id and tp.dominado
        and t.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria')
        and (v_es_pro or not t.requiere_pro);
  else
    select count(*) into v_lecciones_totales from public.techniques t
      where t.problem_type = p_world and (v_es_pro or not t.requiere_pro);
    select count(*) into v_lecciones_completadas
      from public.technique_progress tp
      join public.techniques t on t.id = tp.technique_id
      where tp.user_id = p_user_id and tp.dominado and t.problem_type = p_world
        and (v_es_pro or not t.requiere_pro);
  end if;

  v_frac_volumen := least(1.0, v_puntos::numeric / 25000);
  v_frac_dominio := case when v_temas_totales > 0 then v_suma_dominio / v_temas_totales else 0 end;
  v_frac_lecciones := case when v_lecciones_totales > 0 then v_lecciones_completadas::numeric / v_lecciones_totales else 1 end;

  v_nivel := greatest(1, least(100, round(100 * (0.34 * v_frac_volumen + 0.45 * v_frac_dominio + 0.21 * v_frac_lecciones))::integer));

  return query select v_puntos, v_nivel, v_frac_volumen, v_frac_dominio, v_frac_lecciones;
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
  fuente_nombre text,
  animacion_nombre text
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
  if p_mundo is not null and p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
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
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date) and a.problem_type like 'geografia%'
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
              and a.problem_type in ('melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto', 'melodia_tempo')
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
          when p_mundo = 'calculia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('calculia_derivadas', 'calculia_integrales', 'calculia_series', 'calculia_multivariable')
          ), 0)
          when p_mundo = 'circuitia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('circuitia_serie', 'circuitia_paralelo', 'circuitia_mixto', 'circuitia_cualitativo')
          ), 0)
          when p_mundo = 'estadistica' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('estadistica_central', 'estadistica_dispersion', 'estadistica_probabilidad', 'estadistica_datos', 'estadistica_graficos')
          ), 0)
          when p_mundo = 'naipia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('naipia_hilo', 'naipia_ko', 'naipia_hiopt2', 'naipia_omega2', 'naipia_verdadero')
          ), 0)
          when p_mundo = 'codia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('codia_sintaxis', 'codia_salida', 'codia_error', 'codia_estructuras')
          ), 0)
          when p_mundo = 'dinamia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('dinamia_cinematica', 'dinamia_vectores', 'dinamia_newton', 'dinamia_energia', 'dinamia_termo', 'dinamia_fluidos')
          ), 0)
          when p_mundo = 'vitalia' then coalesce((
            select sum(a.xp) from public.attempts a
            where a.user_id = p.id and a.created_at >= date_trunc('week', current_date)
              and a.problem_type in ('vitalia_celula', 'vitalia_procesos', 'vitalia_genetica', 'vitalia_sistemas', 'vitalia_reinos', 'vitalia_ecologia')
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
        p.fuente_nombre as fn,
        p.animacion_nombre as an
      from public.profiles p
      join auth.users u on u.id = p.id
      where coalesce(u.is_anonymous, false) = false
        and not p.es_bot
        and p.display_name is not null
        and btrim(p.display_name) <> ''
        and u.email_confirmed_at is not null
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
    select d.uid, d.dn, d.xp, d.av, d.elo, d.ta, public.titulo_nombre_de(d.uid), d.fn, d.an
    from datos d
    where d.xp > 0
    order by d.xp desc;
end;
$$;

create or replace function public.estadisticas_pro_perfil()
returns table (mundo text, intentos bigint, correctos bigint, precision_pct numeric, tiempo_ms bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  return query
    with base as (
      select
        (case
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division') then 'numeria'
          when a.problem_type like 'fracciones_%' then 'numeria'
          when a.problem_type like 'decimales_%' then 'numeria'
          when a.problem_type like 'potencias_%' then 'numeria'
          when a.problem_type like 'algebra_%' then 'numeria'
          when a.problem_type like 'geometria_%' then 'numeria'
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
          when a.problem_type like 'dinamia_%' then 'dinamia'
          when a.problem_type like 'vitalia_%' then 'vitalia'
          else null
        end) as m,
        a.correct,
        a.time_ms
      from public.attempts a
      where a.user_id = v_user
      union all
      select 'enigmia' as m, la.correct, la.time_ms
      from public.logic_attempts la
      where la.user_id = v_user
    )
    select b.m, count(*)::bigint, count(*) filter (where b.correct)::bigint,
      round(count(*) filter (where b.correct)::numeric / count(*), 4),
      coalesce(sum(b.time_ms), 0)::bigint
    from base b
    where b.m is not null
    group by b.m
    order by count(*) desc;
end;
$$;

create or replace function public.estadisticas_pro_subtemas()
returns table (mundo text, problem_type text, intentos bigint, correctos bigint, precision_pct numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_plan text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
  if v_plan is distinct from 'pro' then
    raise exception 'estadisticas avanzadas exclusivas de Prodigia Pro';
  end if;

  return query
    with base as (
      select
        a.problem_type,
        (case
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division') then 'numeria'
          when a.problem_type like 'fracciones_%' then 'numeria'
          when a.problem_type like 'decimales_%' then 'numeria'
          when a.problem_type like 'potencias_%' then 'numeria'
          when a.problem_type like 'algebra_%' then 'numeria'
          when a.problem_type like 'geometria_%' then 'numeria'
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
          when a.problem_type like 'dinamia_%' then 'dinamia'
          when a.problem_type like 'vitalia_%' then 'vitalia'
          else null
        end) as m,
        a.correct
      from public.attempts a
      where a.user_id = v_user
    )
    select b.m, b.problem_type, count(*)::bigint, count(*) filter (where b.correct)::bigint,
      round(count(*) filter (where b.correct)::numeric / count(*), 4)
    from base b
    where b.m is not null
    group by b.m, b.problem_type
    having count(*) >= 5
    order by b.m, round(count(*) filter (where b.correct)::numeric / count(*), 4) asc;
end;
$$;

create or replace function public.estadisticas_pro_subtemas_grupo(p_group_id uuid)
returns table (
  user_id uuid,
  mundo text,
  problem_type text,
  intentos bigint,
  correctos bigint,
  precision_pct numeric,
  estancado boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.groups g where g.id = p_group_id and g.profesor_id = auth.uid()
  ) then
    raise exception 'no autorizado';
  end if;

  return query
    with base as (
      select
        a.user_id,
        a.problem_type,
        (case
          when a.problem_type in ('suma', 'resta', 'multiplicacion', 'division') then 'numeria'
          when a.problem_type like 'fracciones_%' then 'numeria'
          when a.problem_type like 'decimales_%' then 'numeria'
          when a.problem_type like 'potencias_%' then 'numeria'
          when a.problem_type like 'algebra_%' then 'numeria'
          when a.problem_type like 'geometria_%' then 'numeria'
          when a.problem_type like 'geografia%' then 'geografia'
          when a.problem_type like 'quimia_%' then 'quimia'
          when a.problem_type like 'anatomia_%' then 'anatomia'
          when a.problem_type like 'melodia_%' then 'melodia'
          when a.problem_type like 'trigonometria_%' then 'trigonometria'
          when a.problem_type like 'historia_%' then 'historia'
          when a.problem_type like 'calculia_%' then 'calculia'
          when a.problem_type like 'circuitia_%' then 'circuitia'
          when a.problem_type like 'estadistica_%' then 'estadistica'
          when a.problem_type like 'naipia_%' then 'naipia'
          when a.problem_type like 'codia_%' then 'codia'
          when a.problem_type like 'dinamia_%' then 'dinamia'
          when a.problem_type like 'vitalia_%' then 'vitalia'
          else null
        end) as m,
        a.correct,
        a.created_at,
        a.id::bigint as attempt_id
      from public.attempts a
      join public.group_members gm on gm.user_id = a.user_id and gm.group_id = p_group_id
      union all
      select
        la.user_id,
        'enigmia'::text as problem_type,
        'enigmia'::text as m,
        la.correct,
        la.created_at,
        la.id::bigint as attempt_id
      from public.logic_attempts la
      join public.group_members gm on gm.user_id = la.user_id and gm.group_id = p_group_id
    ),
    ranked as (
      select
        b.*,
        row_number() over (partition by b.user_id, b.problem_type order by b.created_at desc, b.attempt_id desc) as rn
      from base b
      where b.m is not null
    ),
    agg as (
      select
        r.user_id,
        r.m,
        r.problem_type,
        count(*)::bigint as intentos,
        count(*) filter (where r.correct)::bigint as correctos,
        round(count(*) filter (where r.correct)::numeric / count(*), 4) as precision_pct
      from ranked r
      group by r.user_id, r.m, r.problem_type
      having count(*) >= 5
    ),
    stagnation as (
      select
        r.user_id,
        r.problem_type,
        count(*) as n_total,
        count(*) filter (where r.rn <= 10) as n_reciente,
        count(*) filter (where r.rn <= 10 and r.correct) as c_reciente,
        count(*) filter (where r.rn > 10 and r.rn <= 20) as n_anterior,
        count(*) filter (where r.rn > 10 and r.rn <= 20 and r.correct) as c_anterior
      from ranked r
      group by r.user_id, r.problem_type
    )
    select
      agg.user_id,
      agg.m as mundo,
      agg.problem_type,
      agg.intentos,
      agg.correctos,
      agg.precision_pct,
      (case
        when s.n_total >= 20 and s.n_reciente = 10 and s.n_anterior = 10 then
          (s.c_reciente::numeric / s.n_reciente) <= (s.c_anterior::numeric / s.n_anterior)
        else null
      end) as estancado
    from agg
    join stagnation s on s.user_id = agg.user_id and s.problem_type = agg.problem_type
    order by agg.user_id, agg.precision_pct asc;
end;
$$;

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
        when problem_type = 'calculia' then 'calculia'
        when problem_type = 'circuitia' then 'circuitia'
        when problem_type = 'estadistica' then 'estadistica'
        when problem_type = 'naipia' then 'naipia'
        when problem_type = 'codia' then 'codia'
        when problem_type = 'dinamia' then 'dinamia'
        when problem_type = 'vitalia' then 'vitalia'
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia')
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

create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 3000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tienes ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elige exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elige 2 mundos distintos';
  end if;
  foreach v_mundo in array p_mundos loop
    if not (v_mundo = any(v_validos)) then
      raise exception 'mundo invalido';
    end if;
  end loop;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  -- >= 2 = ya pasó por el flujo de 2 mundos. 1 = estado heredado de la
  -- fase antigua (1 mundo gratis) → se reemplaza abajo con la elección.
  if cardinality(v_actuales) >= 2 then
    raise exception 'ya elegiste tus mundos iniciales';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = p_mundos
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

create or replace function public.guardar_afinidad_banner(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_arr jsonb := coalesce(p_items, '[]'::jsonb);
  v_item record;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_arr is null or jsonb_typeof(v_arr) <> 'array' then
    raise exception 'formato invalido';
  end if;
  if jsonb_array_length(v_arr) > 13 then
    raise exception 'demasiados items';
  end if;
  for v_item in select value as v from jsonb_array_elements(v_arr) loop
    if jsonb_typeof(v_item.v) <> 'object'
       or not (v_item.v->>'ref' = any(v_mundos))
       or v_item.v->>'nombre' is null or btrim(v_item.v->>'nombre') = ''
       or length(v_item.v->>'nombre') > 60
    then
      raise exception 'item invalido';
    end if;
  end loop;
  update public.profiles set afinidad_banner = v_arr where id = v_user;
  return v_arr;
end;
$$;

create or replace function public.sincronizar_progreso_mundo(p_world text)
returns table (
  puntos_mundo integer,
  nivel_mundo integer,
  frac_volumen numeric,
  frac_dominio numeric,
  frac_lecciones numeric
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
  if p_world not in ('numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo desconocido';
  end if;
  perform public.recalcular_progreso_mundo(v_user, p_world);
  return query
    select d.puntos_mundo, d.nivel_mundo, d.frac_volumen, d.frac_dominio, d.frac_lecciones
    from public.detalle_nivel_mundo(v_user, p_world) d;
end;
$$;

create or replace function public.mundo_de_problem_type(p_problem_type text)
returns text
language sql
immutable
as $$
  select case
    when split_part(p_problem_type, '_', 1) in ('geografia','quimia','anatomia','melodia','trigonometria','historia','calculia','circuitia','estadistica','naipia','codia', 'dinamia', 'vitalia')
      then split_part(p_problem_type, '_', 1)
    else 'numeria'
  end;
$$;

create or replace function public.mis_constelaciones()
returns table (mundo text, estrellas integer, completadas integer, de_noche boolean, alineacion boolean, chispas_premio integer, falta_pieza boolean, favorita boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fav text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  v_fav := public._ciudad_favorita(v_user);
  return query
    select m.mundo,
           coalesce(cu.estrellas, 0)::integer,
           coalesce(cu.completadas, 0)::integer,
           public.ciudad_de_noche(m.mundo),
           public.en_gran_alineacion(),
           round((case when x.falta then 300 else 450 end)
                 * (case when public.en_gran_alineacion() then 2 else 1 end)
                 * (case when public.ciudad_de_noche(m.mundo) then 1.2 else 1 end))::integer,
           x.falta,
           m.mundo = v_fav
    from unnest(array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia']) with ordinality as m(mundo, orden)
    left join public.constelaciones_usuario cu on cu.user_id = v_user and cu.mundo = m.mundo
    cross join lateral (
      select exists (
        select 1 from public.catalogo_cosmeticos c
        where c.mundo = m.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
      ) as falta
    ) x
    order by m.orden;
end;
$$;

create or replace function public.revisar_recompensas()
returns table (nuevas integer, pendientes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_antes integer;
  v_nivel integer;
  v_base integer;
  v_n integer;
  v_racha integer;
  v_lunes date := date_trunc('week', current_date)::date;
  v_prev date := date_trunc('week', current_date)::date - 7;
  v_mi_xp integer;
  v_puesto integer;
  v_fav text;
  v_x record;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select count(*) into v_antes from public.capsulas_usuario c where c.user_id = v_user;
  v_fav := public._ciudad_favorita(v_user);

  -- Las partidas encienden estrellas en su ciudad (reemplaza a la cápsula diaria).
  perform public._encender_por_partidas(v_user);

  -- Racha: cada 7 días seguidos → 2 estrellas.
  if exists (select 1 from public.daily_progress d where d.user_id = v_user and d.fecha = current_date and d.meta_alcanzada) then
    v_racha := public.racha_diaria_de(v_user);
    if v_racha > 0 and v_racha % 7 = 0 then
      perform public._sumar_estrellas(v_user, v_fav, 2, 'racha:' || current_date);
    end if;
  end if;

  -- Nivel de cuenta: 3 estrellas por nivel (como mucho los últimos 5).
  select pr.nivel_cuenta, pr.capsulas_nivel_base into v_nivel, v_base from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_nivel, 1) > coalesce(v_base, 1) then
    for v_n in greatest(v_base + 1, v_nivel - 4)..v_nivel loop
      perform public._sumar_estrellas(v_user, v_fav, 3, 'nivel:' || v_n);
    end loop;
    update public.profiles set capsulas_nivel_base = v_nivel where id = v_user;
  end if;

  -- Ciudad: niveles 10, 20, 30… → 3 estrellas en esa ciudad.
  for v_x in
    select w.world, k * 10 as nivel
    from public.world_progress w
    cross join lateral generate_series(1, greatest(w.nivel_mundo / 10, 0)) as k
    where w.user_id = v_user and w.nivel_mundo >= 10
  loop
    perform public._sumar_estrellas(v_user, v_x.world, 3, 'ciudad:' || v_x.world || ':' || v_x.nivel);
  end loop;

  -- Dominio: todas las Técnicas (gratis) de una ciudad → 3 estrellas en esa ciudad.
  for v_x in
    select x.mundo
    from (
      select public.mundo_de_problem_type(t.problem_type) as mundo, count(*) as total, count(tp.technique_id) filter (where tp.dominado) as hechas
      from public.techniques t
      left join public.technique_progress tp on tp.technique_id = t.id and tp.user_id = v_user
      where not t.requiere_pro
      group by 1
      union all
      select 'enigmia', count(*), count(tp.technique_id) filter (where tp.dominado)
      from public.logic_techniques t
      left join public.logic_technique_progress tp on tp.technique_id = t.id and tp.user_id = v_user
      where not t.requiere_pro
    ) x
    where x.total > 0 and x.hechas = x.total
  loop
    perform public._sumar_estrellas(v_user, v_x.mundo, 3, 'dominio:' || v_x.mundo);
  end loop;

  -- Liga de la semana pasada: de 2 a 5 estrellas según el puesto.
  if not exists (select 1 from public.estrellas_otorgadas e where e.user_id = v_user and e.origen = 'liga:' || v_prev)
     and not exists (select 1 from public.capsulas_usuario c where c.user_id = v_user and c.origen = 'liga:' || v_prev) then
    select sum(d.xp_ganado) into v_mi_xp from public.daily_progress d where d.user_id = v_user and d.fecha >= v_prev and d.fecha < v_lunes;
    if coalesce(v_mi_xp, 0) > 0 then
      select count(*) + 1 into v_puesto
      from (select d.user_id, sum(d.xp_ganado) as total from public.daily_progress d where d.fecha >= v_prev and d.fecha < v_lunes group by d.user_id) x
      where x.total > v_mi_xp;
      perform public._sumar_estrellas(v_user, v_fav, case when v_puesto <= 3 then 5 when v_puesto <= 10 then 4 when v_puesto <= 50 then 3 else 2 end, 'liga:' || v_prev);
    end if;
  end if;

  -- Colección completa: las 6 piezas de una ciudad → cápsula con su marco animado (igual que 0249).
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen)
  select v_user, 'coleccion', m, 'coleccion:' || m
  from unnest(v_mundos) as m
  where not exists (
    select 1 from unnest(array['marco_' || m, 'fondo_ciudad_' || m, 'estela_ciudad_' || m, 'efecto_ciudad_' || m, 'emote_ciudad_' || m, 'titulo_ciudad_' || m]) as s
    where not public._tiene_cosmetico(v_user, s)
  )
  on conflict (user_id, origen) do nothing;

  -- Gran Alineación: jugar durante el evento da el logro.
  if exists (
    select 1 from public.attempts a
    where a.user_id = v_user and a.created_at > now() - interval '1 day' and public.en_gran_alineacion(a.created_at)
  ) or exists (
    select 1 from public.logic_attempts la
    where la.user_id = v_user and la.created_at > now() - interval '1 day' and public.en_gran_alineacion(la.created_at)
  ) then
    insert into public.user_achievements (user_id, achievement_id)
    select v_user, a.id from public.achievements a where a.slug = 'testigo-alineacion'
    on conflict do nothing;
  end if;

  return query
    select (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user) - v_antes,
           (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user and c.abierta_at is null);
end;
$$;

create or replace function public.mundo_doble_experiencia(p_fecha date default current_date)
returns text
language sql
immutable
as $$
  select (array['numeria','enigmia','geografia','quimia','anatomia','melodia','trigonometria','historia','calculia','circuitia','estadistica','naipia','codia', 'dinamia', 'vitalia'])[
    (((p_fecha - date '1970-01-01') * 7 + 3) % 15) + 1
  ];
$$;

create or replace function public.horas_dia_ciudad(p_mundo text)
returns integer
language sql
immutable
as $$
  select case p_mundo
    when 'dinamia' then 8 when 'codia' then 12 when 'circuitia' then 14 when 'numeria' then 16 when 'enigmia' then 21
    when 'geografia' then 24 when 'trigonometria' then 28 when 'calculia' then 32 when 'estadistica' then 42
    when 'quimia' then 48 when 'melodia' then 56 when 'naipia' then 84 when 'anatomia' then 96
    when 'historia' then 112 when 'vitalia' then 168 else 24
  end;
$$;

create or replace function public.guardar_diagnostico_mundo(p_problem_type text, p_nivel smallint)
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
  if p_nivel is null or p_nivel not between 1 and 10 then
    raise exception 'nivel invalido';
  end if;
  if p_problem_type not in (
    'quimia_simbolos', 'anatomia_oseo', 'melodia_fundamentos', 'trigonometria_razones',
    'historia_cronologia', 'calculia_derivadas', 'circuitia_serie', 'estadistica_central',
    'naipia_hilo', 'codia_salida', 'dinamia_cinematica', 'vitalia_celula'
  ) then
    raise exception 'tema sin diagnostico';
  end if;

  insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
  values (v_user, p_problem_type, p_nivel, 0, now())
  on conflict (user_id, problem_type) do nothing;
end;
$$;

create or replace function public.crear_invitacion_duelo(p_mundo text default 'numeria', p_operation_type text default null, p_sub_tipo text default null)
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
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
    if p_sub_tipo not in ('simbolos', 'formulas', 'tabla', 'nomenclatura', 'organica') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'anatomia' then
    if p_sub_tipo not in ('oseo', 'muscular', 'organos', 'nervioso') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'melodia' then
    if p_sub_tipo not in ('fundamentos', 'lectura', 'alteraciones', 'escalas', 'acordes', 'oido_absoluto', 'tempo') then
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
  elsif p_mundo = 'calculia' then
    if p_sub_tipo not in ('derivadas', 'integrales', 'series', 'multivariable') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'circuitia' then
    if p_sub_tipo not in ('serie', 'paralelo', 'mixto', 'cualitativo') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'estadistica' then
    if p_sub_tipo not in ('central', 'dispersion', 'probabilidad', 'datos', 'graficos') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'naipia' then
    if p_sub_tipo not in ('hilo', 'ko', 'hiopt2', 'omega2', 'verdadero') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'codia' then
    if p_sub_tipo not in ('sintaxis', 'salida', 'error', 'estructuras') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'dinamia' then
    if p_sub_tipo not in ('cinematica', 'vectores', 'newton', 'energia', 'termo', 'fluidos') then
      raise exception 'opcion invalida';
    end if;
  elsif p_mundo = 'vitalia' then
    if p_sub_tipo not in ('celula', 'procesos', 'genetica', 'sistemas', 'reinos', 'ecologia') then
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

create or replace function public.modo_dinamia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia', 'termo', 'fluidos'];
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia', 'termo'];
  elsif p_elo_promedio >= 1300 then
    v_opciones := array['cinematica', 'vectores', 'newton', 'energia'];
  elsif p_elo_promedio >= 1100 then
    v_opciones := array['cinematica', 'vectores', 'newton'];
  elsif p_elo_promedio >= 900 then
    v_opciones := array['cinematica', 'vectores'];
  else
    v_opciones := array['cinematica'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.nivel_dinamia_por_rango(p_elo_promedio numeric)
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

create or replace function public.modo_vitalia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas', 'reinos', 'ecologia'];
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas', 'reinos'];
  elsif p_elo_promedio >= 1300 then
    v_opciones := array['celula', 'procesos', 'genetica', 'sistemas'];
  elsif p_elo_promedio >= 1100 then
    v_opciones := array['celula', 'procesos', 'genetica'];
  elsif p_elo_promedio >= 900 then
    v_opciones := array['celula', 'procesos'];
  else
    v_opciones := array['celula'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

create or replace function public.nivel_vitalia_por_rango(p_elo_promedio numeric)
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

-- Ya existe (0244): se borra y se vuelve a crear con las columnas de los dos mundos.
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
        when v_duel.mundo = 'dinamia' then coalesce(v_duel.nivel_dinamia, 5::smallint)
        when v_duel.mundo = 'vitalia' then coalesce(v_duel.nivel_vitalia, 5::smallint)
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

create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[],
  hielos_disponibles smallint,
  tiempos_extra_disponibles smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo_base integer;
  v_mundo text;
  v_nivel_mundo integer;
  v_plan text;
  v_categoria text;
  v_catalogo public.catalogo_cosmeticos%rowtype;
  v_paquete public.paquetes_tienda%rowtype;
  v_es_catalogo boolean := false;
  v_es_paquete boolean := false;
  v_item_paquete text;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
  v_items_pro constant text[] := array['animacion_prisma', 'fondo_prodigio'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_costo_base := case p_item
    when 'escudo' then 350
    when 'congelamiento' then 450
    when 'boost' then 600
    when 'hielo' then 300
    when 'tiempo_extra' then 250
    when 'pista' then 300
    when 'segunda_oportunidad' then 500
    when 'cofre_hielos' then 800
    when 'fuente_mono' then 1000
    when 'fuente_serif' then 1400
    when 'fuente_manuscrita' then 5000
    when 'fuente_impacto' then 1200
    when 'fuente_script' then 1800
    when 'fuente_futurista' then 2500
    when 'fuente_urbana' then 1200
    when 'fuente_elegante' then 1800
    when 'marco_bronce' then 1000
    when 'marco_plata' then 1300
    when 'marco_oro' then 1700
    when 'marco_platino' then 2200
    when 'marco_diamante' then 3200
    when 'marco_prodigio' then 5000
    when 'marco_neon_violeta' then 6000
    when 'marco_neon_cian' then 6000
    when 'marco_neon_magenta' then 6000
    when 'marco_numeria' then 2400
    when 'marco_enigmia' then 2400
    when 'marco_geografia' then 2400
    when 'marco_quimia' then 2400
    when 'marco_anatomia' then 2400
    when 'marco_melodia' then 2400
    when 'marco_trigonometria' then 2400
    when 'marco_historia' then 2400
    when 'marco_calculia' then 2400
    when 'marco_circuitia' then 2400
    when 'marco_estadistica' then 2400
    when 'marco_naipia' then 2400
    when 'marco_codia' then 2400
    when 'marco_dinamia' then 2400
    when 'marco_vitalia' then 2400
    when 'paquete_marcos_mundo' then 27000
    when 'animacion_ondulante' then 1200
    when 'animacion_brillo' then 1400
    when 'animacion_arcoiris' then 1800
    when 'animacion_neon' then 2200
    when 'animacion_glitch' then 2000
    when 'animacion_glitch_intenso' then 2600
    when 'animacion_deconstruccion' then 2400
    when 'animacion_shuffle' then 2800
    when 'animacion_decrypted' then 2800
    when 'fondo_oceano' then 1600
    when 'fondo_bosque' then 1600
    when 'fondo_aurora' then 1600
    when 'fondo_dorado' then 1800
    when 'fondo_nebulosa' then 2000
    when 'fondo_personalizado' then 4000
    when 'color_nombre_personalizado' then 1800
    when 'animacion_prisma' then 3000
    when 'fondo_prodigio' then 3000
    else null
  end;

  -- Lo nuevo (0248): precio del catálogo o del paquete.
  if v_costo_base is null then
    select * into v_catalogo from public.catalogo_cosmeticos c where c.slug = p_item and c.vendible;
    if found then
      v_es_catalogo := true;
      v_costo_base := v_catalogo.precio;
      if v_catalogo.temporada is not null and v_catalogo.temporada <> public.temporada_actual() then
        raise exception 'este marco de temporada no esta a la venta este mes';
      end if;
    else
      select * into v_paquete from public.paquetes_tienda pq where pq.slug = p_item;
      if found then
        v_es_paquete := true;
        v_costo_base := v_paquete.precio;
      end if;
    end if;
  end if;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  if p_item = any(v_items_pro) then
    select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
    if v_plan is distinct from 'pro' then
      raise exception 'este cosmetico es exclusivo de Prodigia Pro';
    end if;
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia', 'marco_calculia', 'marco_circuitia', 'marco_estadistica', 'marco_naipia', 'marco_codia', 'marco_dinamia', 'marco_vitalia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  elsif p_item = 'paquete_marcos_mundo' then
    if exists (
      select 1 from unnest(v_mundos) m
      where coalesce((select w.nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = m), 0) < 40
    ) then
      raise exception 'todavia no alcanzaste nivel 40 en los 15 mundos';
    end if;
  end if;

  if v_es_catalogo and public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes este articulo';
  end if;
  if v_es_paquete and not exists (select 1 from unnest(v_paquete.items) i where not public._tiene_cosmetico(v_user, i)) then
    raise exception 'ya tienes todo lo de este paquete';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if v_es_catalogo then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    perform public._dar_cosmetico(v_user, p_item);
  elsif v_es_paquete then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    foreach v_item_paquete in array v_paquete.items loop
      perform public._dar_cosmetico(v_user, v_item_paquete);
    end loop;
  elsif p_item = 'pista' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        pistas_disponibles = pr.pistas_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'segunda_oportunidad' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        segundas_oportunidades_disponibles = pr.segundas_oportunidades_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'cofre_hielos' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 3
    where pr.id = v_user;
  elsif p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  elsif p_item = 'hielo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'tiempo_extra' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'paquete_marcos_mundo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = (select array(select distinct u from unnest(pr.marcos_desbloqueados || v_mundos) as u))
    where pr.id = v_user;
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'animacion_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        animaciones_desbloqueadas = case
          when (replace(p_item, 'animacion_', '')) = any(pr.animaciones_desbloqueadas)
            then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, replace(p_item, 'animacion_', ''))
        end
    where pr.id = v_user;
  elsif p_item = 'color_nombre_personalizado' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        color_nombre_desbloqueado = true
    where pr.id = v_user;
  elsif p_item like 'fondo_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fondos_desbloqueados = case
          when (replace(p_item, 'fondo_', '')) = any(pr.fondos_desbloqueados)
            then pr.fondos_desbloqueados
          else array_append(pr.fondos_desbloqueados, replace(p_item, 'fondo_', ''))
        end
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fuentes_desbloqueadas = case
          when (replace(p_item, 'fuente_', '')) = any(pr.fuentes_desbloqueadas)
            then pr.fuentes_desbloqueadas
          else array_append(pr.fuentes_desbloqueadas, replace(p_item, 'fuente_', ''))
        end
    where pr.id = v_user;
  end if;

  -- tienda_compras.categoria solo admite estas 5 (0159): lo nuevo cae en la más cercana.
  v_categoria := case
    when v_es_catalogo and v_catalogo.categoria in ('fuente', 'marco', 'animacion', 'fondo') then v_catalogo.categoria
    when v_es_catalogo or v_es_paquete then 'consumible'
    when p_item like 'fuente_%' then 'fuente'
    when p_item like 'marco_%' or p_item = 'paquete_marcos_mundo' then 'marco'
    when p_item like 'animacion_%' then 'animacion'
    when p_item like 'fondo_%' then 'fondo'
    else 'consumible'
  end;

  insert into public.tienda_compras (user_id, item_slug, categoria, costo)
  values (v_user, p_item, v_categoria, p_costo);

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados, pr.hielos_disponibles, pr.tiempos_extra_disponibles
    from public.profiles pr where pr.id = v_user;
end;
$$;
