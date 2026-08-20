-- ============================================================
-- Prodigia — Sección 10.2: invitar a alguien sin cuenta, queda
-- conectado como amigo automáticamente al registrarse
-- Correr después de 0062_lecciones_por_mundo_y_mundo_completado.sql
--
-- Mismo modelo de "friendships" que ya usa solicitar/responder
-- (api/amigos/solicitar, api/amigos/responder): UNA fila por relación
-- (user_id = quien la originó, friend_id = el otro), estado
-- 'pendiente' -> 'aceptada' al aceptar — nunca dos filas. Un link de
-- invitación personal ya implica intención mutua (el invitado eligió
-- entrar por el link de una persona puntual), así que esta función
-- inserta la fila directo en 'aceptada', sin el paso de pendiente.
-- ============================================================

create or replace function public.conectar_por_invitacion(p_inviter_id uuid)
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
  if p_inviter_id is null or p_inviter_id = v_user then
    return; -- invitación inválida o auto-invitación — no explota, solo no hace nada
  end if;
  if not exists (select 1 from public.profiles where id = p_inviter_id) then
    return; -- link viejo/inválido — mismo criterio, silencioso
  end if;

  insert into public.friendships (user_id, friend_id, estado)
  values (p_inviter_id, v_user, 'aceptada')
  on conflict (user_id, friend_id) do update set estado = 'aceptada';
end;
$$;

grant execute on function public.conectar_por_invitacion(uuid) to authenticated;
