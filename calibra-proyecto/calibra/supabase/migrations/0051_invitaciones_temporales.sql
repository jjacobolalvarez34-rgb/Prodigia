-- ============================================================
-- Prodigia — Fase 4: invitaciones a duelo (estado 'pendiente', modo
-- 'simple') expiran solas al minuto si nadie las acepta. No hay cron
-- job en este proyecto, así que el cierre real es "lazy": cada vez que
-- alguien consulta mis_duelos_pendientes() (la retado_id revisando su
-- barra lateral/Rankeds, o el retador_id volviendo a mirar), se borran
-- de una las invitaciones propias ya vencidas — así, aunque nadie mire
-- a tiempo, la invitación deja de estar jugable pasado el minuto sin
-- depender de que un cliente en particular siga abierto. Las rondas de
-- una serie "todas las ciudades" (modo mejor_de_3) quedan afuera a
-- propósito: no son "una invitación que alguien puede ignorar", son un
-- duelo ya en curso entre rondas.
-- Correr después de 0050_duelos_casuales.sql
-- ============================================================

drop function if exists public.mis_duelos_pendientes();

create function public.mis_duelos_pendientes()
returns table (
  duel_id uuid, operation_type text, mundo text, creado_at timestamptz,
  retador_nombre text, retador_elo integer, retador_titulo_nombre text
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

  delete from public.duels
  where estado = 'pendiente'
    and modo = 'simple'
    and creado_at < now() - interval '60 seconds'
    and (retador_id = v_user or retado_id = v_user);

  return query
    select d.id, d.operation_type, d.mundo, d.creado_at,
      (select display_name from public.profiles where id = d.retador_id),
      (select elo_rating from public.profiles where id = d.retador_id),
      public.titulo_nombre_de(d.retador_id)
    from public.duels d
    where d.retado_id = v_user
      and d.estado = 'pendiente'
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;

grant execute on function public.mis_duelos_pendientes() to authenticated;
