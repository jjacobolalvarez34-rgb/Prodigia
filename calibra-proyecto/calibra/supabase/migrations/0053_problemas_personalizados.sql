-- ============================================================
-- Prodigia — Fase 6: problemas personalizados (pregunta + respuesta,
-- texto libre) — ÚNICA excepción a la regla del feed de "nunca texto
-- libre del usuario". Por eso lleva 3 redes de seguridad OBLIGATORIAS,
-- no opcionales:
--   1. Filtro de palabras básico (rechazo automático, ver
--      contiene_termino_prohibido más abajo).
--   2. Reportable con el mismo sistema de reportes ya existente (Fase
--      Q3) — reportar_post() nuevo, hermano de reportar_usuario().
--   3. Límite de frecuencia: 1 por día por usuario.
--
-- Desbloqueo: nivel 10 en al menos un mundo (world_progress) — "se
-- gana", no está disponible desde el día 1 de la cuenta. Nivel 10 en la
-- curva no lineal de 0033_nivel_de_mundo.sql (50×N×(N-1)) pide 4500
-- puntos acumulados en ESE mundo — varias semanas de juego real, no un
-- par de partidas.
-- Correr después de 0052_feed_diversificado.sql
-- ============================================================

create table public.problemas_personalizados (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.profiles(id) on delete cascade,
  pregunta text not null check (char_length(pregunta) between 3 and 200),
  respuesta text not null check (char_length(respuesta) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.problemas_personalizados enable row level security;

-- Lectura abierta entre autenticados (igual que feed_posts — es
-- contenido para compartir, ya pasó el filtro al crearse). Ni INSERT ni
-- DELETE tienen policy propia: pasan únicamente por las funciones de
-- abajo (security definer), donde se aplican las 3 redes de seguridad.
create policy "cualquiera autenticado lee problemas personalizados"
  on public.problemas_personalizados for select
  using (auth.role() = 'authenticated');

alter table public.feed_posts add column if not exists problema_personalizado_id uuid references public.problemas_personalizados(id) on delete cascade;

alter table public.feed_posts drop constraint if exists feed_posts_check;
alter table public.feed_posts add constraint feed_posts_check check (
  (tipo = 'logro' and achievement_id is not null)
  or
  (tipo = 'desafio' and operation_type is not null and nivel is not null and cantidad_problemas is not null)
  or
  (tipo = 'resultado_duelo' and mundo is not null and rival_nombre is not null)
  or
  (tipo = 'subida_rango' and rango_nuevo is not null)
  or
  (tipo = 'nivel_mundo' and mundo is not null and nivel_mundo_valor is not null)
  or
  (tipo = 'desafio_personalizado' and problema_personalizado_id is not null)
);

-- Red de seguridad 1: filtro de palabras básico. Lista corta y a
-- propósito conservadora (insultos/términos obviamente inapropiados en
-- español) — cualquier coincidencia (pregunta O respuesta) rechaza el
-- problema entero antes de guardarlo. No es moderación con IA ni nada
-- sofisticado: es exactamente lo que pedía la fase, "lista de términos
-- prohibidos, rechazo automático".
create or replace function public.contiene_termino_prohibido(p_texto text)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1 from unnest(array[
      'puta', 'puto', 'mierda', 'pelotudo', 'boludo', 'idiota', 'imbecil',
      'imbécil', 'estupido', 'estúpido', 'gil', 'forro', 'cornudo',
      'negro de mierda', 'sudaca', 'maricon', 'maricón', 'zorra', 'perra'
    ]) as t
    where lower(p_texto) like '%' || t || '%'
  );
$$;

-- Red de seguridad 3 (límite de frecuencia) + desbloqueo por nivel +
-- creación real. Todo en una función atómica: evita el race condition
-- de "chequeo cuántos hay hoy" en una llamada y "creo el nuevo" en
-- otra, donde dos clics rápidos podrían colarse los dos.
create function public.crear_problema_personalizado(p_pregunta text, p_respuesta text)
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
    raise exception 'todavia no desbloqueaste los problemas personalizados — llegá a nivel 10 en algún mundo';
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
    raise exception 'ya compartiste tu problema personalizado de hoy — probá mañana';
  end if;

  insert into public.problemas_personalizados (autor_id, pregunta, respuesta)
  values (v_user, v_pregunta, v_respuesta)
  returning id into v_problema_id;

  insert into public.feed_posts (user_id, tipo, problema_personalizado_id)
  values (v_user, 'desafio_personalizado', v_problema_id);

  return v_problema_id;
end;
$$;

grant execute on function public.crear_problema_personalizado(text, text) to authenticated;

-- Responder inline (Fase 6 no integra esto a duelos/ELO — es un
-- intercambio social simple, correcto/incorrecto). No guarda quién
-- respondió qué ni impide reintentar — no hace falta para el alcance
-- pedido, y agregar esa contabilidad sería una funcionalidad nueva no
-- pedida.
create or replace function public.responder_problema_personalizado(p_post_id uuid, p_respuesta text)
returns table (correcto boolean, respuesta_correcta text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_problema record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pp.* into v_problema
  from public.feed_posts fp
  join public.problemas_personalizados pp on pp.id = fp.problema_personalizado_id
  where fp.id = p_post_id and fp.tipo = 'desafio_personalizado';

  if v_problema.id is null then
    raise exception 'problema no encontrado';
  end if;

  return query select
    lower(trim(p_respuesta)) = lower(v_problema.respuesta),
    v_problema.respuesta;
end;
$$;

grant execute on function public.responder_problema_personalizado(uuid, text) to authenticated;

-- Red de seguridad 2: reportar un problema personalizado específico,
-- no solo perfiles de usuario. Mismo mecanismo que reportar_usuario
-- (0040) — se guarda quién lo reportó, motivo, y detalle, para revisión
-- manual (sin moderación automática, mismo criterio de la Fase Q3
-- original). reportado_id se resuelve al autor del problema, no hace
-- falta que el cliente lo sepa de antemano.
alter table public.reportes_usuario add column if not exists post_id uuid references public.feed_posts(id) on delete cascade;

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
    raise exception 'no podes reportar tu propio contenido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle, post_id)
  values (v_user, v_autor_id, p_motivo, p_detalle, p_post_id);
end;
$$;

grant execute on function public.reportar_post(uuid, text, text) to authenticated;
