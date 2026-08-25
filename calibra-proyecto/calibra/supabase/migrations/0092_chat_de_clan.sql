-- ============================================================
-- Prodigia — Fase 4: Chat de clan. Único lugar de texto libre nuevo en
-- la app además de problemas personalizados (0053) — mismas 3 redes de
-- seguridad OBLIGATORIAS, mismo criterio:
--   1. Filtro de palabras prohibidas (rechazo ANTES de guardar).
--   2. Reportable — mismo sistema de reportes (reportes_usuario),
--      extendido con una columna nueva.
--   3. Límite de frecuencia — 20 mensajes por minuto por usuario.
-- Visible solo para miembros del mismo clan (clan_membresias). Sin
-- scroll infinito: mensajes_de_clan() siempre devuelve como máximo los
-- últimos 100 (tope duro en la función, no solo un default).
-- Correr después de 0091_lecciones_melodia.sql.
-- ============================================================

-- ---------- Red de seguridad 1: filtro de palabras, ampliado ----------
-- Reemplaza la lista corta de 0053 (18 términos, pensada solo para
-- problemas personalizados) por una con variedad real — español
-- rioplatense, mexicano, colombiano, chileno y de España, insultos y
-- groserías comunes, no solo los más obvios. Al ser la MISMA función
-- que ya usa crear_problema_personalizado, esa red de seguridad
-- también queda más fuerte de paso — no es un efecto colateral no
-- deseado, un filtro más flojo ahí no tendría sentido.
create or replace function public.contiene_termino_prohibido(p_texto text)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1 from unnest(array[
      -- insultos generales
      'idiota', 'estupido', 'estúpido', 'imbecil', 'imbécil', 'tonto', 'tonta',
      'tarado', 'tarada', 'baboso', 'babosa', 'menso', 'mensa', 'subnormal',
      'retrasado', 'retrasada', 'retardado', 'mogolico', 'mogólico',
      -- rioplatense (AR/UY)
      'boludo', 'boluda', 'pelotudo', 'pelotuda', 'forro', 'forra', 'garca',
      'careta', 'sorete', 'choto', 'chota', 'cornudo', 'cornuda',
      -- mexicano / centroamericano
      'pendejo', 'pendeja', 'guevon', 'güevón', 'huevon', 'huevón', 'chingada',
      'chingado', 'chingar', 'pinche', 'culero', 'culera', 'naco', 'naca',
      -- colombiano / venezolano
      'gonorrea', 'malparido', 'malparida', 'hijueputa', 'guevo', 'marica',
      'malandro',
      -- chileno
      'weon', 'weón', 'ctm', 'qliao', 'culiao', 'culiada',
      -- españa
      'gilipollas', 'capullo', 'subnormal', 'gilipuertas',
      -- vulgar / general
      'mierda', 'carajo', 'coño', 'verga', 'joder', 'jodido', 'jodida',
      'concha de tu madre', 'conchudo', 'conchuda', 'csm', 'ptm', 'qlo',
      'cabron', 'cabrón', 'cabrona', 'gil',
      -- sexual / degradante
      'puta', 'puto', 'putos', 'putas', 'zorra', 'perra', 'maricon', 'maricón',
      'hijo de puta', 'hija de puta', 'hijo de re puta',
      -- discriminatorio (siempre rechazar, sin excepción)
      'sudaca', 'negro de mierda', 'gitano de mierda', 'indio de mierda',
      'muerto de hambre', 'basura humana', 'subhumano', 'subhumana'
    ]) as t
    where lower(p_texto) like '%' || t || '%'
  );
$$;

-- ---------- Esquema del chat ----------
create table public.clan_mensajes (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clanes(id) on delete cascade,
  autor_id uuid not null references public.profiles(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists clan_mensajes_clan_id_created_at on public.clan_mensajes (clan_id, created_at desc);

alter table public.clan_mensajes enable row level security;
-- A propósito SIN ninguna policy (ni de select): mismo criterio que
-- reportes_usuario — todo el acceso (leer y escribir) pasa por las
-- funciones de abajo, security definer, donde se valida membresía del
-- clan antes de devolver o insertar nada.

-- ---------- Red de seguridad 2: reportable ----------
alter table public.reportes_usuario add column if not exists mensaje_clan_id uuid references public.clan_mensajes(id) on delete cascade;

alter table public.reportes_usuario drop constraint if exists reportes_usuario_motivo_check;
alter table public.reportes_usuario add constraint reportes_usuario_motivo_check
  check (motivo in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'contenido_ofensivo', 'otro'));

create or replace function public.reportar_mensaje_clan(p_mensaje_id uuid, p_motivo text, p_detalle text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_autor_id uuid;
  v_clan_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'contenido_ofensivo', 'otro') then
    raise exception 'motivo invalido';
  end if;

  select autor_id, clan_id into v_autor_id, v_clan_id from public.clan_mensajes where id = p_mensaje_id;
  if v_autor_id is null then
    raise exception 'mensaje no encontrado';
  end if;
  if not exists (select 1 from public.clan_membresias where clan_id = v_clan_id and user_id = v_user) then
    raise exception 'no sos miembro de este clan';
  end if;
  if v_autor_id = v_user then
    raise exception 'no podes reportar tu propio mensaje';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, mensaje_clan_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_mensaje_id);
end;
$$;

grant execute on function public.reportar_mensaje_clan(uuid, text, text) to authenticated;

-- ---------- Enviar mensaje: redes de seguridad 1 y 3 + inserción ----------
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
  where autor_id = v_user and created_at >= now() - interval '1 minute';
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

-- ---------- Leer mensajes: solo miembros del clan, tope de 100 ----------
-- Sin paginación / scroll infinito a propósito — "un tope de mensajes
-- recientes alcanza para esta primera versión" (pedido explícito).
-- Devuelve el nombre/avatar del autor acá mismo porque profiles solo
-- deja leer la fila PROPIA por RLS (0040) — un join directo desde el
-- cliente no vería el nombre de nadie más, mismo motivo por el que
-- miembros_de_clan() ya funciona así.
create or replace function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
returns table (id uuid, autor_id uuid, autor_nombre text, autor_avatar_url text, texto text, created_at timestamptz)
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
  if not exists (select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = v_user) then
    raise exception 'no sos miembro de este clan';
  end if;

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url, m.texto, m.created_at
    from public.clan_mensajes m
    join public.profiles p on p.id = m.autor_id
    where m.clan_id = p_clan_id
    order by m.created_at desc
    limit least(coalesce(p_limite, 100), 100);
end;
$$;

grant execute on function public.mensajes_de_clan(uuid, integer) to authenticated;
