-- ====================================================================
-- PRODIGIA — Normalización de español (ES/EN full pass): último resto
-- de voseo detectado por scripts/analizar-voseo-funciones.mjs en un
-- mensaje de error real (visible al usuario si manda mensajes muy
-- rápido en el chat de clan): "esperá un momento" (voseo) -> "espera
-- un momento" (neutro latinoamericano, tuteo), igual que el resto de
-- TERMINOLOGY.md.
--
-- CREATE OR REPLACE es seguro acá: misma firma, mismo returns table,
-- el único cambio es el texto del raise exception.
-- ====================================================================

create or replace function public.enviar_mensaje_clan(p_texto text)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan_id uuid;
  v_texto text := trim(p_texto);
  v_mensajes_ultimo_minuto integer;
  v_id uuid;
  v_created_at timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if char_length(v_texto) < 1 or char_length(v_texto) > 500 then
    raise exception 'el mensaje tiene que tener entre 1 y 500 caracteres';
  end if;

  select clan_id into v_clan_id from public.clan_membresias where user_id = v_user;
  if v_clan_id is null then
    raise exception 'no estás en ningún clan';
  end if;

  -- Red de seguridad 3: límite de frecuencia — 20/minuto alcanza para
  -- una conversación real y corta cualquier intento de flood/spam.
  select count(*) into v_mensajes_ultimo_minuto
  from public.clan_mensajes
  where autor_id = v_user and clan_mensajes.created_at >= now() - interval '1 minute';
  if v_mensajes_ultimo_minuto >= 20 then
    raise exception 'estás mandando mensajes muy rápido — espera un momento';
  end if;

  -- Red de seguridad 1: filtro de palabras — rechazo ANTES de guardar,
  -- nunca se llega a insertar el mensaje si matchea.
  if public.contiene_termino_prohibido(v_texto) then
    raise exception 'el mensaje contiene un término no permitido';
  end if;

  insert into public.clan_mensajes (clan_id, autor_id, texto)
  values (v_clan_id, v_user, v_texto)
  returning clan_mensajes.id, clan_mensajes.created_at into v_id, v_created_at;

  return query select v_id, v_created_at;
end;
$$;

grant execute on function public.enviar_mensaje_clan(text) to authenticated;

notify pgrst, 'reload schema';
