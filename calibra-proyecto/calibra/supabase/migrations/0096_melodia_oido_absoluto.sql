-- ============================================================
-- Prodigia — Fase 7: 6to modo de Melodía, "Oído absoluto"
-- (melodia_oido_absoluto) — reservado a las dificultades más altas
-- (ver src/lib/practica/melodia.ts, POOL_OIDO_POR_BANDA). Mismo
-- patrón que sumar cualquier sub-tema nuevo a un mundo existente
-- (0067_quimia_nomenclatura_organica.sql): solo tocan los 2 checks de
-- calibración, no hace falta guard de onboarding nuevo ni entrada en
-- world_progress (ya existen para "melodia" en general).
-- Correr después de 0095_reto_diario_45_multi_mundo.sql.
-- ============================================================

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
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto'
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
    'melodia_fundamentos', 'melodia_lectura', 'melodia_alteraciones', 'melodia_escalas', 'melodia_acordes', 'melodia_oido_absoluto'
  ));

-- "Explorador de Melodía" contaba "los 5 modos" (0089) — ahora son 6.
update public.achievements
  set criterio = '{"tipo": "melodia_modos_variados", "valor": 6}'::jsonb,
      descripcion = 'Probaste los 6 modos de Melodía — fundamentos, lectura, alteraciones, escalas, acordes y oído absoluto.'
  where slug = 'melodia-explorador';

-- Duelos "todas las ciudades": oído absoluto se suma SOLO al pool más
-- alto (Prodigio, elo>=1700) — el resto de rangos se queda con los 5
-- modos de siempre, coherente con "reservado a las dificultades más
-- altas" también en duelos, no solo en práctica libre.
create or replace function public.modo_melodia_aleatorio_por_rango(p_elo_promedio numeric)
returns text
language plpgsql
as $$
declare
  v_opciones text[];
begin
  if p_elo_promedio >= 1700 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones', 'escalas', 'acordes', 'oido_absoluto'];
  elsif p_elo_promedio >= 1500 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones', 'escalas'];
  elsif p_elo_promedio >= 1300 then
    v_opciones := array['fundamentos', 'lectura', 'alteraciones'];
  elsif p_elo_promedio >= 900 then
    v_opciones := array['fundamentos', 'lectura'];
  else
    v_opciones := array['fundamentos'];
  end if;
  return v_opciones[1 + floor(random() * array_length(v_opciones, 1))::int];
end;
$$;

-- Invitar por link / retar a un amigo a Melodía: "oído absoluto" pasa
-- a ser una opción elegible a mano (a diferencia del matchmaking
-- aleatorio de arriba, retar a mano no tiene por qué respetar el
-- filtro por rango — quien reta elige el modo a propósito).
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
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
