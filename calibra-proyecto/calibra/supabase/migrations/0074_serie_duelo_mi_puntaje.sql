-- ============================================================
-- Prodigia — Fase 3/5 de "Duelos: llevar el progreso en vivo...":
-- en un "todas las ciudades", cada ronda navega directo a
-- /rankeds/serie/[serieId] apenas termina tu parte (nunca pasa por
-- ResultadoDueloBlock, que ya mostraba tu puntaje mientras esperás
-- al rival desde 0071) — estado_serie_duelo() no devolvía tu propio
-- puntaje de esa ronda, así que SerieDueloClient no tenía forma de
-- mostrarlo en el "Esperando al rival…" de FilaRondaResumen.
-- Cambia el shape de RETURNS TABLE (columna nueva) → drop + create.
-- ============================================================

drop function if exists public.estado_serie_duelo(uuid);

create function public.estado_serie_duelo(p_serie_id uuid)
returns table (
  duel_id uuid, ronda_numero smallint, mundo text, sub_tipo text, operation_type text,
  estado text, yo_jugue boolean, rival_jugo boolean, gane_ronda boolean, empate_ronda boolean,
  oponente_id uuid, oponente_nombre text, serie_finalizada boolean, oponente_es_bot boolean,
  mi_puntaje integer
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

  if not exists (
    select 1 from public.duels where serie_id = p_serie_id and (retador_id = v_user or retado_id = v_user)
  ) then
    raise exception 'no autorizado';
  end if;

  return query
    select
      d.id, d.ronda_numero, d.mundo, d.sub_tipo, d.operation_type, d.estado,
      exists(select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user),
      exists(select 1 from public.duel_results r where r.duel_id = d.id and r.user_id <> v_user),
      (d.estado = 'completado' and d.ganador_id = v_user),
      (d.estado = 'completado' and d.ganador_id is null),
      case when d.retador_id = v_user then d.retado_id else d.retador_id end,
      (select display_name from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      d.serie_finalizada,
      (select es_bot from public.profiles where id = case when d.retador_id = v_user then d.retado_id else d.retador_id end),
      (select r.puntaje_final from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    from public.duels d
    where d.serie_id = p_serie_id
    order by d.ronda_numero;
end;
$$;

grant execute on function public.estado_serie_duelo(uuid) to authenticated;
