-- ============================================================
-- Fase 7 (auditoría de estabilización, 2026-08-30) — BUG SQL real
-- confirmado: "column reference 'created_at' is ambiguous" al mandar
-- un mensaje de chat de clan.
--
-- Causa: enviar_mensaje_clan() (0092_chat_de_clan.sql) declara
-- `returns table (id uuid, created_at timestamptz)` — en PL/pgSQL eso
-- crea una variable de salida implícita llamada `created_at` en el
-- scope de toda la función. La consulta del límite de frecuencia
-- (20 mensajes/minuto) referencia `created_at` sin calificar de qué
-- tabla viene:
--   where autor_id = v_user and created_at >= now() - interval '1 minute'
-- Postgres no puede decidir si es la columna created_at de
-- clan_mensajes o la variable de salida del mismo nombre — de ahí el
-- error real. El propio RETURNING de más abajo (línea 165 del archivo
-- original) SÍ calificaba `clan_mensajes.created_at` — este WHERE fue
-- el único lugar que se pasó por alto.
--
-- De paso, esta migración también expone xp_acumulado_historico en
-- mi_clan() y habilita xp_requerido_nivel_clan() para el cliente —
-- necesario para el indicador de progreso de nivel de clan que pide
-- esta misma fase (hoy no había forma de calcularlo del lado del
-- cliente, solo se exponía nivel_clan ya calculado, sin el XP crudo
-- para compararlo contra el umbral del próximo nivel).
-- ============================================================

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
  -- FIX: created_at calificado — antes era ambiguo contra la variable
  -- de salida implícita del mismo nombre (ver comentario arriba).
  select count(*) into v_mensajes_ultimo_minuto
  from public.clan_mensajes
  where autor_id = v_user and clan_mensajes.created_at >= now() - interval '1 minute';
  if v_mensajes_ultimo_minuto >= 20 then
    raise exception 'estás mandando mensajes muy rápido — esperá un momento';
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

-- ---------- Fase 7: progreso de nivel de clan visible ----------
grant execute on function public.xp_requerido_nivel_clan(integer) to authenticated;

drop function if exists public.mi_clan();

create function public.mi_clan()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  rol text, cantidad_miembros bigint, nivel_clan integer, imagen_url text,
  xp_acumulado_historico bigint
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

  return query
    select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion, cm.rol,
      (select count(*) from public.clan_membresias cm2 where cm2.clan_id = c.id),
      public.nivel_clan(c.id), c.imagen_url, c.xp_acumulado_historico
    from public.clan_membresias cm
    join public.clanes c on c.id = cm.clan_id
    where cm.user_id = v_user;
end;
$$;

grant execute on function public.mi_clan() to authenticated;
