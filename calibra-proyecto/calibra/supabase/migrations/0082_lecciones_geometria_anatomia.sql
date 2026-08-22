-- ============================================================
-- Prodigia — lecciones_completadas_por_mundo() no sabía de las
-- lecciones nuevas de Geometría (problem_type='geometria', agrupa
-- dentro de "numeria" igual que fracciones/decimales/potencias/
-- algebra) ni de Anatomía (problem_type='anatomia', mundo propio,
-- mismo criterio que Quimia). Sin esto, /perfil mostraría el bloque
-- "Aprender" con esas lecciones invisibles (ni contadas ni con nombre).
-- Correr después de 0081_mundo_anatomia.sql.
-- ============================================================

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
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria', 'geografia', 'quimia', 'anatomia')
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
