-- ============================================================
-- Prodigia — ranking filtrable por mundo (Fase Y2)
-- Correr después de 0028_duelos_fantasma.sql
-- ranking_semanal() ya existe y cubre "Experiencia total" (todos los
-- mundos). Esta función cubre "Por mundo": Numeria y Geografía viven en
-- `attempts` (columna problem_type), Enigmia vive en `logic_attempts`
-- (tabla aparte, sin problem_type) — por eso son tres ramas separadas
-- en vez de una sola consulta con joins.
-- ============================================================

create function public.ranking_semanal_por_mundo(p_mundo text)
returns table (user_id uuid, display_name text, xp_semana bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_mundo = 'enigmia' then
    return query
      select p.id, p.display_name, coalesce(sum(la.xp), 0)::bigint
      from public.profiles p
      left join public.logic_attempts la
        on la.user_id = p.id and la.created_at >= date_trunc('week', current_date)
      group by p.id, p.display_name
      having coalesce(sum(la.xp), 0) > 0
      order by 3 desc;
  elsif p_mundo = 'geografia' then
    return query
      select p.id, p.display_name, coalesce(sum(a.xp), 0)::bigint
      from public.profiles p
      left join public.attempts a
        on a.user_id = p.id
        and a.created_at >= date_trunc('week', current_date)
        and a.problem_type = 'geografia'
      group by p.id, p.display_name
      having coalesce(sum(a.xp), 0) > 0
      order by 3 desc;
  elsif p_mundo = 'numeria' then
    return query
      select p.id, p.display_name, coalesce(sum(a.xp), 0)::bigint
      from public.profiles p
      left join public.attempts a
        on a.user_id = p.id
        and a.created_at >= date_trunc('week', current_date)
        and a.problem_type in ('suma', 'resta', 'multiplicacion', 'division', 'fracciones', 'decimales', 'potencias')
      group by p.id, p.display_name
      having coalesce(sum(a.xp), 0) > 0
      order by 3 desc;
  else
    raise exception 'mundo desconocido: %', p_mundo;
  end if;
end;
$$;

grant execute on function public.ranking_semanal_por_mundo(text) to authenticated;

