-- ============================================================
-- Prodigia — Sección 9: lecciones completadas por mundo en /perfil +
-- logro real "Mundo completado" (con efecto retroactivo)
-- Correr después de 0061_tienda_precios_piso.sql
-- ============================================================

-- ---------- lecciones_completadas_por_mundo(): para /perfil ----------
-- Mismo criterio que afinidad_por_mundo() ya usaba: una función propia
-- en vez de que la página arme 8 queries sueltas. Enigmia vive en
-- logic_techniques/logic_technique_progress (tablas aparte, no
-- techniques/technique_progress como el resto) — se resuelve acá con
-- un union en vez de forzar el mismo esquema.
create or replace function public.lecciones_completadas_por_mundo()
returns table (mundo text, completadas bigint, total bigint)
language sql
security definer
set search_path = public
as $$
  with totales as (
    select
      case
        when problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra') then 'numeria'
        when problem_type = 'geografia' then 'geografia'
        when problem_type = 'quimia' then 'quimia'
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geografia', 'quimia')
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

-- ---------- logro real "Mundo completado" ----------
alter table public.achievements drop constraint achievements_categoria_check;
alter table public.achievements add constraint achievements_categoria_check
  check (categoria in ('racha', 'volumen', 'precision', 'dominio', 'duelos', 'enigmia', 'quimia', 'mundo'));

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('mundo-completado-numeria', 'Mundo completado: Numeria', 'Alcanzaste nivel 10 de calibración en todos los temas de Numeria.', 'mundo', '{"tipo": "mundo_completado_numeria", "valor": 10}'),
('mundo-completado-geografia', 'Mundo completado: Geografía', 'Alcanzaste nivel 10 de calibración en Geografía.', 'mundo', '{"tipo": "mundo_completado_geografia", "valor": 10}'),
('mundo-completado-enigmia', 'Mundo completado: Enigmia', 'Alcanzaste nivel 10 de calibración en Enigmia.', 'mundo', '{"tipo": "mundo_completado_enigmia", "valor": 10}'),
('mundo-completado-quimia', 'Mundo completado: Quimia', 'Alcanzaste nivel 10 de calibración en los 3 modos de Quimia.', 'mundo', '{"tipo": "mundo_completado_quimia", "valor": 10}')
on conflict (slug) do nothing;

-- ---------- efecto retroactivo: otorgar a quien ya cumple hoy ----------
-- Corre una sola vez, en el momento en que esta migración se aplica —
-- revisa TODOS los usuarios reales (no invitados) contra el mismo
-- criterio que de acá en más van a evaluar verificarLogros/
-- verificarTitulos en cada evento nuevo. Si nadie califica todavía, no
-- hace nada — no es un error, es el resultado esperado la primera vez
-- que se corre esto en un proyecto todavía joven.
do $$
declare
  v_user record;
  v_completo boolean;
  v_achievement_id uuid;
begin
  for v_user in select id from public.profiles loop
    -- Numeria: 8 temas, todos en nivel 10.
    select (count(*) filter (where nivel >= 10) = 8) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra');
    if v_completo then
      select id into v_achievement_id from public.achievements where slug = 'mundo-completado-numeria';
      insert into public.user_achievements (user_id, achievement_id) values (v_user.id, v_achievement_id) on conflict do nothing;
      perform public.desbloquear_titulo(v_user.id, 'maestro-numeria', 'Maestro de Numeria', 'mundo');
    end if;

    -- Geografía y Quimia: mismo chequeo con sus propios tipos.
    select (nivel >= 10) into v_completo from public.skill_levels where user_id = v_user.id and problem_type = 'geografia';
    if coalesce(v_completo, false) then
      select id into v_achievement_id from public.achievements where slug = 'mundo-completado-geografia';
      insert into public.user_achievements (user_id, achievement_id) values (v_user.id, v_achievement_id) on conflict do nothing;
      perform public.desbloquear_titulo(v_user.id, 'maestro-geografia', 'Maestro de Geografía', 'mundo');
    end if;

    select (count(*) filter (where nivel >= 10) = 3) into v_completo
    from public.skill_levels
    where user_id = v_user.id and problem_type in ('quimia_simbolos', 'quimia_formulas', 'quimia_tabla');
    if v_completo then
      select id into v_achievement_id from public.achievements where slug = 'mundo-completado-quimia';
      insert into public.user_achievements (user_id, achievement_id) values (v_user.id, v_achievement_id) on conflict do nothing;
      perform public.desbloquear_titulo(v_user.id, 'maestro-quimia', 'Maestro de Quimia', 'mundo');
    end if;

    -- Enigmia: un solo nivel de mundo (logic_skill_levels), no por tema.
    select (nivel >= 10) into v_completo from public.logic_skill_levels where user_id = v_user.id;
    if coalesce(v_completo, false) then
      select id into v_achievement_id from public.achievements where slug = 'mundo-completado-enigmia';
      insert into public.user_achievements (user_id, achievement_id) values (v_user.id, v_achievement_id) on conflict do nothing;
      perform public.desbloquear_titulo(v_user.id, 'maestro-enigmia', 'Maestro de Enigmia', 'mundo');
    end if;
  end loop;
end $$;
