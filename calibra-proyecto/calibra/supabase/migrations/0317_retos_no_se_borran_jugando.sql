-- 0317: un reto entre amigos ya aceptado no se borra mientras se juega (2026-11-06).
-- Síntoma: al terminar un duelo con un amigo salía «No se pudo cerrar la partida:
-- no autorizado». Causa: mis_duelos_pendientes() (0256) borra todo duelo simple
-- 'pendiente' de más de 2 minutos, y un reto aceptado SIGUE en 'pendiente' hasta
-- que se juega entero (la base no marca la aceptación). Reto enviado + espera + VS +
-- la ronda pasan de 2 minutos; cualquiera de los dos abría Social o Rankeds (o la
-- app consultaba los retos) y el duelo desaparecía en plena partida. Al mandar el
-- resultado, registrar_resultado_duelo ya no lo encontraba → «no autorizado».
--
-- Ahora: el reto sigue durando 2 minutos para ACEPTARLO (la lista solo muestra los
-- vigentes y el chat lo marca «vencida» igual, ver _estado_reto_chat de 0298), pero
-- la fila solo se borra cuando ya no puede estar jugándose: sin ningún resultado y
-- 20 minutos después de vencida la invitación. Base: 0256. Idempotente.

create or replace function public.mis_duelos_pendientes()
returns table (
  duel_id uuid, operation_type text, mundo text, creado_at timestamptz,
  retador_nombre text, retador_elo integer, retador_titulo_nombre text,
  sub_tipo text, expira_at timestamptz
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

  -- Invitaciones abandonadas: nadie jugó y ya pasó de sobra lo que dura un duelo.
  delete from public.duels d
  where d.estado = 'pendiente'
    and d.modo = 'simple'
    and d.creado_at < now() - public.vigencia_invitacion_duelo(d.retador_id, d.retado_id) - interval '20 minutes'
    and not exists (select 1 from public.duel_results r where r.duel_id = d.id)
    and (d.retador_id = v_user or d.retado_id = v_user);

  return query
    select d.id, d.operation_type, d.mundo, d.creado_at,
      (select display_name from public.profiles where id = d.retador_id),
      (select elo_rating from public.profiles where id = d.retador_id),
      public.titulo_nombre_de(d.retador_id),
      d.sub_tipo,
      d.creado_at + public.vigencia_invitacion_duelo(d.retador_id, d.retado_id)
    from public.duels d
    where d.retado_id = v_user
      and d.estado = 'pendiente'
      -- Para aceptar, el reto sigue durando 2 minutos.
      and (d.modo <> 'simple' or d.creado_at + public.vigencia_invitacion_duelo(d.retador_id, d.retado_id) > now())
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;
grant execute on function public.mis_duelos_pendientes() to authenticated;
