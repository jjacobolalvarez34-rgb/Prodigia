-- ============================================================
-- Prodigia — Amigos: la placa de perfil en la lista + quitar amigo
-- Correr después de 0196_naipia_lecciones_visuales.sql
--
-- Rediseño pedido en vivo (2026-09-22): la pestaña "Amigos" mostraba un
-- recuadro plano (nombre + ELO + botón "Retar a duelo") — ahora cada
-- amigo se ve como su "placa" de perfil (mismo lenguaje visual que
-- /perfil/[userId]: FondoPerfilCapa + AvatarConMarco + NombreConFuente +
-- RangoBadge, ver PlacaAmigo.tsx), para que la personalización de
-- perfil (fondo, marco, fuente, animación, color, título) también se
-- note en la lista de amigos, no solo entrando a cada perfil.
-- ============================================================

-- mis_amigos(): el cuerpo (join friendships<->profiles, filtro estado
-- 'aceptada', cualquiera de los dos lados) es el mismo vigente desde
-- 0021_amigos.sql — nunca redefinida desde entonces (confirmado por
-- grep en supabase/migrations antes de tocarla). Se le agregan las
-- columnas que la placa necesita, con el mismo criterio de
-- obtener_perfil_publico (0161_color_nombre_personalizable.sql): usa
-- titulo_nombre_de() para mandar el título YA resuelto a texto (nunca
-- se vuelve a buscar del lado del cliente), y deja afuera a propósito
-- color_nombre_desbloqueado — ese flag solo decide si el DUEÑO puede
-- seguir *editando* su propio color; no aporta nada al ver el perfil
-- de otra persona (obtener_perfil_publico tampoco lo expone).
-- RETURNS TABLE cambia -> hace falta drop, no alcanza con create or
-- replace (mismo criterio que 0161 con obtener_perfil_publico).
drop function if exists public.mis_amigos();

create function public.mis_amigos()
returns table (
  friend_id uuid,
  display_name text,
  elo_rating integer,
  avatar_url text,
  marco_perfil text,
  fondo_perfil text,
  fondo_perfil_url text,
  titulo_activo text,
  titulo_nombre text,
  color_nombre text,
  fuente_nombre text,
  animacion_nombre text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.elo_rating, p.avatar_url, p.marco_perfil,
    p.fondo_perfil, p.fondo_perfil_url, p.titulo_activo,
    public.titulo_nombre_de(p.id), p.color_nombre, p.fuente_nombre,
    p.animacion_nombre
  from public.friendships f
  join public.profiles p on p.id = (case when f.user_id = auth.uid() then f.friend_id else f.user_id end)
  where (f.user_id = auth.uid() or f.friend_id = auth.uid()) and f.estado = 'aceptada';
$$;

grant execute on function public.mis_amigos() to authenticated;

-- eliminar_amistad: no existía ningún RPC/endpoint para "quitar de
-- amigos" (confirmado por grep en toda la base) — lo único parecido
-- era responder() con aceptar=false, que solo borra una solicitud
-- TODAVÍA PENDIENTE, nunca una amistad ya aceptada. Borra la fila
-- 'aceptada' entre auth.uid() y p_friend_id sin importar quién mandó
-- la solicitud original (una vez aceptada, user_id/friend_id son
-- simétricos). Si no eran amigos (o ya se habían dejado de serlo), el
-- delete no afecta ninguna fila — no es un error, es un no-op
-- silencioso (misma idempotencia que responder() sobre una solicitud
-- que ya no está).
create function public.eliminar_amistad(p_friend_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borradas integer;
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  delete from public.friendships
  where estado = 'aceptada'
    and (
      (user_id = auth.uid() and friend_id = p_friend_id)
      or (user_id = p_friend_id and friend_id = auth.uid())
    );

  get diagnostics v_borradas = row_count;
  return v_borradas > 0;
end;
$$;

grant execute on function public.eliminar_amistad(uuid) to authenticated;

notify pgrst, 'reload schema';
