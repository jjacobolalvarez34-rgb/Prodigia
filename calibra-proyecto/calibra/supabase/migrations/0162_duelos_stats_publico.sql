-- Pedido en vivo (2026-09-15): "cuando veo el perfil de alguien es solo
-- un recuadro con su nombre... quizá mostrar un poco más de información
-- no estaría mal, solo un poco" — el perfil público (/perfil/[userId])
-- ya tenía banner, ELO, clan, niveles por mundo, récords y logros; esto
-- suma un dato competitivo más liviano: duelos jugados/ganados/perdidos
-- (solo 'completado' — no cuenta pendientes/en curso/abandonados).
create function public.duelos_stats_publico(p_user_id uuid)
returns table (jugados integer, victorias integer, derrotas integer)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(*)::integer as jugados,
    count(*) filter (where d.ganador_id = p_user_id)::integer as victorias,
    count(*) filter (where d.ganador_id is not null and d.ganador_id <> p_user_id)::integer as derrotas
  from public.duels d
  where d.estado = 'completado'
    and (d.retador_id = p_user_id or d.retado_id = p_user_id);
$$;

grant execute on function public.duelos_stats_publico(uuid) to authenticated;
