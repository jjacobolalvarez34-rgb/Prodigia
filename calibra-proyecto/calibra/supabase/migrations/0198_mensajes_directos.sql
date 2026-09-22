-- ============================================================
-- Prodigia — Mensajería directa entre amigos (mínima). Segundo lugar de
-- texto libre entre usuarios después del chat de clan (0092 + fix 0100
-- + fix 0135) — mismas 3 redes de seguridad, mismo patrón:
--   1. Filtro de palabras prohibidas (contiene_termino_prohibido, YA
--      EXISTE desde 0092 — se reutiliza tal cual, sin duplicar la lista).
--   2. Reportable — reportes_usuario, columna nueva mensaje_directo_id
--      (mismo patrón que mensaje_clan_id de 0092; el check de motivo ya
--      incluye 'contenido_ofensivo' desde esa misma migración, no hace
--      falta tocarlo de nuevo).
--   3. Límite de frecuencia — 20 mensajes por minuto, pero acá por
--      USUARIO TOTAL (todas sus conversaciones sumadas), no por par:
--      mismo umbral y mismo criterio que enviar_mensaje_clan, más
--      simple de mantener y evita que alguien esquive el límite
--      repartiendo el mismo volumen de flood entre varios amigos.
-- Solo entre amigos (friendships.estado = 'aceptada') — se valida DENTRO
-- de enviar_mensaje_directo() y mi_conversacion() con son_amigos(), no
-- en policies de RLS de INSERT directo desde el cliente: TODO el acceso
-- (leer y escribir) pasa por funciones security definer, igual que
-- clan_mensajes/reportes_usuario — más seguro y más fácil de mantener
-- consistente con las 3 redes de seguridad en un solo lugar que
-- repetir la lógica de amistad en varias policies.
--
-- IMPORTANTE (lección de 0100/0135, bug real ya encontrado en el chat
-- de clan): nunca referenciar sin calificar una columna que también
-- aparece en el RETURNS TABLE de la misma función — PL/pgSQL crea una
-- variable de salida implícita con ese nombre y Postgres no sabe
-- decidir cuál es cuál ("column reference is ambiguous"). Acá se
-- califica con el alias de tabla (md./p./f.) CADA columna compartida
-- (id, created_at, leido, texto, remitente_id, destinatario_id) en
-- todo el cuerpo de cada función, para no repetir ese bug.
--
-- Correr después de 0196_naipia_lecciones_visuales.sql (y de la
-- migración de "amigos" en 0197, si ya corrió antes — no depende de
-- ninguna columna nueva suya, solo de friendships/profiles, que ya
-- existen desde 0012/0001).
-- ============================================================

create table public.mensajes_directos (
  id uuid primary key default gen_random_uuid(),
  remitente_id uuid not null references public.profiles(id) on delete cascade,
  destinatario_id uuid not null references public.profiles(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  leido boolean not null default false,
  created_at timestamptz not null default now(),
  check (remitente_id <> destinatario_id)
);

-- Índice pensado para "traeme los últimos N mensajes de ESTA
-- conversación puntual" (mi_conversacion) — least/greatest normaliza el
-- par sin importar quién le escribió a quién primero, así un solo
-- índice sirve para los dos sentidos de la conversación.
create index mensajes_directos_conversacion_idx
  on public.mensajes_directos (least(remitente_id, destinatario_id), greatest(remitente_id, destinatario_id), created_at desc);

-- Para "marcar como leído" (mi_conversacion) y para el conteo de no
-- leídos por conversación (mis_conversaciones) — ambos filtran por
-- destinatario_id + leido = false.
create index mensajes_directos_destinatario_no_leido_idx
  on public.mensajes_directos (destinatario_id, remitente_id) where leido = false;

alter table public.mensajes_directos enable row level security;
-- A propósito SIN ninguna policy (ni de select): mismo criterio que
-- clan_mensajes (0092) y reportes_usuario (0040) — todo el acceso pasa
-- por las funciones de abajo, security definer, donde se valida
-- amistad antes de devolver o insertar nada.

-- ---------- Red de seguridad 2: reportable ----------
alter table public.reportes_usuario add column if not exists mensaje_directo_id uuid references public.mensajes_directos(id) on delete cascade;

create or replace function public.reportar_mensaje_directo(p_mensaje_id uuid, p_motivo text, p_detalle text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_remitente_id uuid;
  v_destinatario_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'contenido_ofensivo', 'otro') then
    raise exception 'motivo invalido';
  end if;

  select md.remitente_id, md.destinatario_id into v_remitente_id, v_destinatario_id
  from public.mensajes_directos md where md.id = p_mensaje_id;
  if v_remitente_id is null then
    raise exception 'mensaje no encontrado';
  end if;
  if v_user <> v_remitente_id and v_user <> v_destinatario_id then
    raise exception 'no participas de esta conversación';
  end if;
  if v_remitente_id = v_user then
    raise exception 'no podes reportar tu propio mensaje';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, mensaje_directo_id)
  values (v_user, v_remitente_id, p_motivo, p_detalle, p_mensaje_id);
end;
$$;

grant execute on function public.reportar_mensaje_directo(uuid, text, text) to authenticated;

-- ---------- Amistad: chequeo compartido por las funciones de abajo ----------
-- friendships.estado puede estar 'pendiente' (solicitud sin aceptar
-- todavía) o 'aceptada' — solo cuenta como amigos la segunda. La fila
-- puede estar guardada en cualquiera de los dos sentidos (quien mandó
-- la solicitud queda como user_id), por eso se chequean los dos.
create or replace function public.son_amigos(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where f.estado = 'aceptada'
      and ((f.user_id = p_a and f.friend_id = p_b) or (f.user_id = p_b and f.friend_id = p_a))
  );
$$;

grant execute on function public.son_amigos(uuid, uuid) to authenticated;

-- ---------- Enviar mensaje: amistad + redes de seguridad 1 y 3 + inserción ----------
create or replace function public.enviar_mensaje_directo(p_destinatario_id uuid, p_texto text)
returns table (id uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_texto text := trim(p_texto);
  v_mensajes_ultimo_minuto integer;
  v_id uuid;
  v_created_at timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_destinatario_id = v_user then
    raise exception 'no te podes mandar mensajes a vos mismo';
  end if;
  if char_length(v_texto) < 1 or char_length(v_texto) > 500 then
    raise exception 'el mensaje tiene que tener entre 1 y 500 caracteres';
  end if;
  if not public.son_amigos(v_user, p_destinatario_id) then
    raise exception 'solo podes mandar mensajes a tus amigos';
  end if;

  -- Red de seguridad 3: límite de frecuencia — 20/minuto por usuario en
  -- TOTAL, sumando todas sus conversaciones (ver nota arriba sobre por
  -- qué no es por par). created_at calificado a propósito (md.), mismo
  -- fix que 0100/0135 le tuvo que aplicar después al chat de clan.
  select count(*) into v_mensajes_ultimo_minuto
  from public.mensajes_directos md
  where md.remitente_id = v_user and md.created_at >= now() - interval '1 minute';
  if v_mensajes_ultimo_minuto >= 20 then
    raise exception 'estás mandando mensajes muy rápido — espera un momento';
  end if;

  -- Red de seguridad 1: filtro de palabras — rechazo ANTES de guardar,
  -- nunca se llega a insertar el mensaje si matchea.
  if public.contiene_termino_prohibido(v_texto) then
    raise exception 'el mensaje contiene un término no permitido';
  end if;

  insert into public.mensajes_directos (remitente_id, destinatario_id, texto)
  values (v_user, p_destinatario_id, v_texto)
  returning mensajes_directos.id, mensajes_directos.created_at into v_id, v_created_at;

  return query select v_id, v_created_at;
end;
$$;

grant execute on function public.enviar_mensaje_directo(uuid, text) to authenticated;

-- ---------- Leer una conversación: solo entre amigos, tope de 100 ----------
-- Mismo tope duro que mensajes_de_clan() — sin scroll infinito, alcanza
-- para esta primera versión. De paso marca como leídos los mensajes
-- recibidos no leídos de ESTA conversación puntual (nunca los de otras
-- conversaciones) — se hace acá y no en una función aparte porque el
-- momento natural de "leer" es exactamente cuando se abre el chat.
create or replace function public.mi_conversacion(p_amigo_id uuid)
returns table (id uuid, remitente_id uuid, destinatario_id uuid, texto text, leido boolean, created_at timestamptz)
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
  if not public.son_amigos(v_user, p_amigo_id) then
    raise exception 'no son amigos';
  end if;

  update public.mensajes_directos md
  set leido = true
  where md.destinatario_id = v_user and md.remitente_id = p_amigo_id and md.leido = false;

  return query
    select md.id, md.remitente_id, md.destinatario_id, md.texto, md.leido, md.created_at
    from public.mensajes_directos md
    where (md.remitente_id = v_user and md.destinatario_id = p_amigo_id)
       or (md.remitente_id = p_amigo_id and md.destinatario_id = v_user)
    order by md.created_at desc
    limit 100;
end;
$$;

grant execute on function public.mi_conversacion(uuid) to authenticated;

-- ---------- Listado de conversaciones (para un futuro inbox) ----------
-- Construida ahora para no dejar la migración coja aunque esta tanda de
-- UI todavía no la conecta a ninguna pantalla (no existe todavía una
-- lista de chats — solo se entra directo a /social/mensajes/[amigoId]
-- desde la tarjeta de un amigo puntual). Por cada amigo con el que hay
-- al menos un mensaje intercambiado: el último mensaje + cuántos no
-- leídos tengo de esa persona. Sin tope artificial de cantidad de
-- conversaciones — a diferencia de mensajes por conversación, acá cada
-- fila es liviana (un amigo real tiene un techo natural, no hay riesgo
-- de flood como con mensajes sueltos).
create or replace function public.mis_conversaciones()
returns table (
  amigo_id uuid,
  amigo_nombre text,
  amigo_avatar_url text,
  ultimo_texto text,
  ultimo_remitente_id uuid,
  ultimo_created_at timestamptz,
  no_leidos bigint
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
    with conversaciones as (
      select
        case when md.remitente_id = v_user then md.destinatario_id else md.remitente_id end as otro_id,
        md.texto as ultimo_texto_cte,
        md.remitente_id as ultimo_remitente_cte,
        md.created_at as ultimo_created_at_cte,
        row_number() over (
          partition by case when md.remitente_id = v_user then md.destinatario_id else md.remitente_id end
          order by md.created_at desc
        ) as orden
      from public.mensajes_directos md
      where md.remitente_id = v_user or md.destinatario_id = v_user
    ),
    conteo_no_leidos as (
      select md.remitente_id as otro_id, count(*) as cantidad
      from public.mensajes_directos md
      where md.destinatario_id = v_user and md.leido = false
      group by md.remitente_id
    )
    select
      c.otro_id,
      p.display_name,
      p.avatar_url,
      c.ultimo_texto_cte,
      c.ultimo_remitente_cte,
      c.ultimo_created_at_cte,
      coalesce(nl.cantidad, 0)
    from conversaciones c
    join public.profiles p on p.id = c.otro_id
    left join conteo_no_leidos nl on nl.otro_id = c.otro_id
    where c.orden = 1
    order by c.ultimo_created_at_cte desc;
end;
$$;

grant execute on function public.mis_conversaciones() to authenticated;

notify pgrst, 'reload schema';
