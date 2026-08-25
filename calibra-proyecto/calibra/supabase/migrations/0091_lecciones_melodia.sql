-- ============================================================
-- Prodigia — Fase 1 (bug: "Melodía no aparece en el catálogo de la
-- home"): esa causa raíz ya se corrigió en TypeScript (WorldCard
-- faltante en src/app/[locale]/page.tsx), pero la auditoría completa
-- contra el checklist de docs/ESPECIFICACION.md encontró un segundo
-- hueco real, sin relación con el bug reportado: lecciones_completadas_
-- por_mundo() nunca se actualizó para reconocer problem_type='melodia'
-- (0089_mundo_melodia.sql insertó las 5 lecciones y el constraint que
-- las permite, pero no tocó esta función) — mismo patrón exacto que ya
-- pasó con Geometría/Anatomía en 0082. Sin esto, /perfil nunca muestra
-- la tarjeta de "Aprender" de Melodía (la fila queda con mundo=null y
-- se descarta por el `where t.mundo is not null`).
-- Correr después de 0090_duelos_anatomia_melodia.sql.
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
        when problem_type = 'melodia' then 'melodia'
      end as mundo,
      id
    from public.techniques
    where problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias', 'algebra', 'geometria', 'geografia', 'quimia', 'anatomia', 'melodia')
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
