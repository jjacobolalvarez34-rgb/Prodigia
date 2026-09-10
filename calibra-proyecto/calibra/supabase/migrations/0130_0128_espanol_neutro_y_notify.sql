-- ====================================================================
-- PRODIGIA — RESTO DEL SPRINT (SOLO 0128 + NOTIFY)
-- Generado: 2026-09-09
--
-- ESTADO DE TU BASE: 0116→0119 aplicadas por ti; 0120→0127 aplicadas
-- (primera corrida de la 0129). Esta migracion cubre SOLO lo que falta:
-- el 0128 espanol neutro (crea o reemplaza 9 funciones RPC) + el
-- NOTIFY de recarga del schema.
--
-- NO re-ejecutar 0129 entera / 0120-0127: sus seeds en tablas SIN
-- primary key (trastienda_ruleta/minijuegos/pizarra/apuestas/
-- predicciones_ranking/calcu/acertijos/reloj/casino, id uuid default
-- gen_random_uuid()) se DUPLICARIAN.
--
-- 0128 es idempotente (create or replace function, sin grants y sin
-- seeds top-level): puede re-ejecutarse sin riesgo.
-- ====================================================================

-- 0128: Español neutro latinoamericano — mensajes de negocio (RPC) sin voseo.
-- Sigue a 0127_trastienda_ruleta_casino.sql.
--
-- Recrea funciones que todavía exponían rioplatense en sus raise exception,
-- únicamente cambiando esos mensajes a formas neutras ('tenés'→'tienes',
-- 'podés'→'puedes', 'no sos'→'no eres', 'elegí'→'elige', 'probá'→'prueba',
-- 'salí'→'sal', 'a vos'→'a ti'). NINGÚN cambio de lógica; mismas firmas y
-- grants (se recrean con create or replace function).
--
-- Orden de aplicación recomendado: 0123 → 0124 → 0125 → 0126 → 0127 → 0128.
-- Idempotente.

---------- function public.reportar_usuario ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'no podes reportarte a vos mismo  →  'no puedes reportarte a ti mismo
--    'motivo invalido  →  'motivo invalido
create or replace function public.reportar_usuario(p_reportado_id uuid, p_motivo text, p_detalle text default null)
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
  if p_reportado_id = v_user then
    raise exception 'no puedes reportarte a ti mismo';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro') then
    raise exception 'motivo invalido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle)
  values (v_user, p_reportado_id, p_motivo, p_detalle);
end;
$$;
---------- function public.crear_problema_personalizado ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'la pregunta tiene que tener entre 3 y 200 caracteres  →  'la pregunta tiene que tener entre 3 y 200 caracteres
--    'la respuesta tiene que tener entre 1 y 100 caracteres  →  'la respuesta tiene que tener entre 1 y 100 caracteres
--    'todavia no desbloqueaste los problemas personalizados — llegá a nivel 10 en algún mundo  →  'todavia no desbloqueaste los problemas personalizados — llega a nivel 10 en algún mundo
--    'el problema contiene un término no permitido  →  'el problema contiene un término no permitido
--    'ya compartiste tu problema personalizado de hoy — probá mañana  →  'ya compartiste tu problema personalizado de hoy — prueba mañana
create or replace function public.crear_problema_personalizado(p_pregunta text, p_respuesta text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_nivel_maximo integer;
  v_creados_hoy integer;
  v_pregunta text := trim(p_pregunta);
  v_respuesta text := trim(p_respuesta);
  v_problema_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if char_length(v_pregunta) < 3 or char_length(v_pregunta) > 200 then
    raise exception 'la pregunta tiene que tener entre 3 y 200 caracteres';
  end if;
  if char_length(v_respuesta) < 1 or char_length(v_respuesta) > 100 then
    raise exception 'la respuesta tiene que tener entre 1 y 100 caracteres';
  end if;

  -- Desbloqueo: nivel 10 en al menos un mundo.
  select max(nivel_mundo) into v_nivel_maximo from public.world_progress where user_id = v_user;
  if coalesce(v_nivel_maximo, 0) < 10 then
    raise exception 'todavia no desbloqueaste los problemas personalizados — llega a nivel 10 en algún mundo';
  end if;

  -- Red de seguridad 1: filtro de palabras, pregunta Y respuesta.
  if public.contiene_termino_prohibido(v_pregunta) or public.contiene_termino_prohibido(v_respuesta) then
    raise exception 'el problema contiene un término no permitido';
  end if;

  -- Red de seguridad 3: máximo 1 por día por usuario (día calendario,
  -- no "últimas 24 horas" — más fácil de entender para quien lo mande).
  select count(*) into v_creados_hoy
  from public.problemas_personalizados
  where autor_id = v_user and created_at >= date_trunc('day', now());
  if v_creados_hoy >= 1 then
    raise exception 'ya compartiste tu problema personalizado de hoy — prueba mañana';
  end if;

  insert into public.problemas_personalizados (autor_id, pregunta, respuesta)
  values (v_user, v_pregunta, v_respuesta)
  returning id into v_problema_id;

  insert into public.feed_posts (user_id, tipo, problema_personalizado_id)
  values (v_user, 'desafio_personalizado', v_problema_id);

  return v_problema_id;
end;
$$;
---------- function public.reportar_post ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'motivo invalido  →  'motivo invalido
--    'post no encontrado  →  'post no encontrado
--    'no podes reportar tu propio contenido  →  'no puedes reportar tu propio contenido
create or replace function public.reportar_post(p_post_id uuid, p_motivo text, p_detalle text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_autor_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro') then
    raise exception 'motivo invalido';
  end if;

  select user_id into v_autor_id from public.feed_posts where id = p_post_id;
  if v_autor_id is null then
    raise exception 'post no encontrado';
  end if;
  if v_autor_id = v_user then
    raise exception 'no puedes reportar tu propio contenido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, post_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_post_id);
end;
$$;
---------- function public.unirse_invitacion_duelo ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'invitacion no encontrada  →  'invitacion no encontrada
--    'invitacion ya usada  →  'invitacion ya usada
--    'invitacion no disponible  →  'invitacion no disponible
--    'no podes unirte a tu propia invitacion  →  'no puedes unirte a tu propia invitacion
create or replace function public.unirse_invitacion_duelo(p_invite_id uuid)
returns table (duel_id uuid, mundo text, operation_type text, sub_tipo text, ya_unido boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_invite record;
  v_duel_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_invite from public.duel_invites where id = p_invite_id for update;
  if v_invite.id is null then
    raise exception 'invitacion no encontrada';
  end if;

  if v_invite.estado = 'usada' then
    -- Quien creó el duelo (o el propio invitado) recarga la página
    -- después de unirse — se le devuelve el mismo duelo en vez de
    -- fallar con un error confuso.
    if v_invite.duel_id is not null and (v_invite.creador_id = v_user or exists (
      select 1 from public.duels d where d.id = v_invite.duel_id and (d.retador_id = v_user or d.retado_id = v_user)
    )) then
      return query select v_invite.duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, true;
      return;
    end if;
    raise exception 'invitacion ya usada';
  end if;

  if v_invite.estado <> 'esperando' then
    raise exception 'invitacion no disponible';
  end if;

  if v_invite.creador_id = v_user then
    raise exception 'no puedes unirte a tu propia invitacion';
  end if;

  insert into public.duels (retador_id, retado_id, semilla_problemas, mundo, operation_type, sub_tipo)
  values (v_invite.creador_id, v_user, floor(random() * 1000000000)::bigint, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo)
  returning id into v_duel_id;

  update public.duel_invites set estado = 'usada', duel_id = v_duel_id where id = p_invite_id;

  return query select v_duel_id, v_invite.mundo, v_invite.operation_type, v_invite.sub_tipo, false;
end;
$$;
---------- function public.crear_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'ya estás en un clan — salí del actual antes de crear uno nuevo  →  'ya estás en un clan — sal del actual antes de crear uno nuevo
--    'el nombre del clan necesita al menos 3 caracteres  →  'el nombre del clan necesita al menos 3 caracteres
--    'te faltan Chispas: crear un clan cuesta % (tenés %)  →  'te faltan Chispas: crear un clan cuesta % (tienes %)
create or replace function public.crear_clan(p_nombre text, p_tag text, p_color text, p_descripcion text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_saldo integer;
  v_costo constant integer := 5000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.clan_membresias where user_id = v_user) then
    raise exception 'ya estás en un clan — sal del actual antes de crear uno nuevo';
  end if;
  if length(trim(p_nombre)) < 3 then
    raise exception 'el nombre del clan necesita al menos 3 caracteres';
  end if;

  select puntos_total into v_saldo from public.profiles where id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas: crear un clan cuesta % (tienes %)', v_costo, v_saldo;
  end if;

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  insert into public.clanes (nombre, descripcion, tipo, owner_id, tag, color_estandarte)
  values (trim(p_nombre), coalesce(nullif(trim(p_descripcion), ''), 'Sin descripción todavía.'), 'jugadores', v_user, nullif(trim(p_tag), ''), coalesce(p_color, '#6C4CF1'))
  returning id into v_id;

  insert into public.clan_membresias (clan_id, user_id, rol) values (v_id, v_user, 'fundador');

  return v_id;
end;
$$;
---------- function public.reportar_mensaje_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'motivo invalido  →  'motivo invalido
--    'mensaje no encontrado  →  'mensaje no encontrado
--    'no sos miembro de este clan  →  'no eres miembro de este clan
--    'no podes reportar tu propio mensaje  →  'no puedes reportar tu propio mensaje
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
    raise exception 'no eres miembro de este clan';
  end if;
  if v_autor_id = v_user then
    raise exception 'no puedes reportar tu propio mensaje';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, mensaje_clan_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_mensaje_id);
end;
$$;
---------- function public.mensajes_de_clan ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'no sos miembro de este clan  →  'no eres miembro de este clan
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
    raise exception 'no eres miembro de este clan';
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
---------- function public.desbloquear_mundo ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'mundo invalido  →  'mundo invalido
--    'ya tenés ese mundo desbloqueado  →  'ya tienes ese mundo desbloqueado
--    'te faltan Chispas — % cuesta % Chispas  →  'te faltan Chispas — % cuesta % Chispas
create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 3000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tienes ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;
---------- function public.elegir_mundos_iniciales ----------
-- Mensajes cambiados:
--    'no autenticado  →  'no autenticado
--    'elegí exactamente 2 mundos  →  'elige exactamente 2 mundos
--    'elegí 2 mundos distintos  →  'elige 2 mundos distintos
--    'mundo invalido  →  'mundo invalido
--    'ya elegiste tus mundos iniciales  →  'ya elegiste tus mundos iniciales
create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elige exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elige 2 mundos distintos';
  end if;
  foreach v_mundo in array p_mundos loop
    if not (v_mundo = any(v_validos)) then
      raise exception 'mundo invalido';
    end if;
  end loop;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  -- >= 2 = ya pasó por el flujo de 2 mundos. 1 = estado heredado de la
  -- fase antigua (1 mundo gratis) → se reemplaza abajo con la elección.
  if cardinality(v_actuales) >= 2 then
    raise exception 'ya elegiste tus mundos iniciales';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = p_mundos
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;
NOTIFY pgrst, 'reload schema';