-- ============================================================
-- Prodigia — Borrar mensajes y retos de duelo que se pueden aceptar
-- en vivo (pedido del usuario, 2026-10-06).
--
-- 1) Borrar mensajes (directos y del clan) SIN perderlos: cada quien puede
--    borrar sus propios mensajes; la fila NO se elimina, solo se marca
--    (borrado_en, borrado_por). Las funciones que leen el chat devuelven
--    «Mensaje eliminado» en su lugar, también cuando aparece citado en una
--    respuesta. El texto original queda en la base como respaldo ante una
--    denuncia (reportes_usuario sigue apuntando a la fila).
-- 2) Retos de duelo: los duelos son en vivo. Quien reta espera en la sala hasta
--    2 minutos (a los 30 s se le pregunta si sigue esperando); si nadie llega,
--    el reto se cancela. Antes la invitación se borraba a los 60 segundos
--    (0051), menos de lo que dura la espera; ahora dura 2 minutos.
--    mis_duelos_pendientes devuelve también sub_tipo y expira_at para que la
--    web y la app muestren cuánto falta.
-- Requiere 0245. Solo agrega columnas y redefine funciones; no borra datos.
-- ============================================================

alter table public.mensajes_directos add column if not exists borrado_en timestamptz;
alter table public.mensajes_directos add column if not exists borrado_por uuid references public.profiles(id) on delete set null;
alter table public.clan_mensajes add column if not exists borrado_en timestamptz;
alter table public.clan_mensajes add column if not exists borrado_por uuid references public.profiles(id) on delete set null;

-- ---------- Borrar un mensaje propio (se marca, no se elimina) ----------
create or replace function public.borrar_mensaje_directo(p_mensaje_id uuid)
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
  update public.mensajes_directos md
  set borrado_en = now(), borrado_por = v_user
  where md.id = p_mensaje_id and md.remitente_id = v_user and md.borrado_en is null;
  if not found and not exists (select 1 from public.mensajes_directos md where md.id = p_mensaje_id and md.remitente_id = v_user) then
    raise exception 'solo puedes borrar tus propios mensajes';
  end if;
end;
$$;
grant execute on function public.borrar_mensaje_directo(uuid) to authenticated;

create or replace function public.borrar_mensaje_clan(p_mensaje_id uuid)
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
  update public.clan_mensajes m
  set borrado_en = now(), borrado_por = v_user
  where m.id = p_mensaje_id and m.autor_id = v_user and m.borrado_en is null;
  if not found and not exists (select 1 from public.clan_mensajes m where m.id = p_mensaje_id and m.autor_id = v_user) then
    raise exception 'solo puedes borrar tus propios mensajes';
  end if;
end;
$$;
grant execute on function public.borrar_mensaje_clan(uuid) to authenticated;

-- ---------- Lecturas del chat: ocultan lo borrado ----------
drop function if exists public.mi_conversacion(uuid);
create function public.mi_conversacion(p_amigo_id uuid)
returns table (
  id uuid,
  remitente_id uuid,
  destinatario_id uuid,
  texto text,
  leido boolean,
  created_at timestamptz,
  responde_a uuid,
  responde_a_texto text,
  responde_a_remitente_id uuid,
  borrado boolean
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
  if not public.son_amigos(v_user, p_amigo_id) then
    raise exception 'no son amigos';
  end if;

  update public.mensajes_directos md
  set leido = true
  where md.destinatario_id = v_user and md.remitente_id = p_amigo_id and md.leido = false;

  return query
    select md.id, md.remitente_id, md.destinatario_id,
      case when md.borrado_en is not null then 'Mensaje eliminado' else md.texto end,
      md.leido, md.created_at,
      md.responde_a,
      case when o.borrado_en is not null then 'Mensaje eliminado' else left(o.texto, 140) end,
      o.remitente_id,
      md.borrado_en is not null
    from public.mensajes_directos md
    left join public.mensajes_directos o on o.id = md.responde_a
    where (md.remitente_id = v_user and md.destinatario_id = p_amigo_id)
       or (md.remitente_id = p_amigo_id and md.destinatario_id = v_user)
    order by md.created_at desc
    limit 100;
end;
$$;
grant execute on function public.mi_conversacion(uuid) to authenticated;

drop function if exists public.mensajes_de_clan(uuid, integer);
create function public.mensajes_de_clan(p_clan_id uuid, p_limite integer default 100)
returns table (
  id uuid,
  autor_id uuid,
  autor_nombre text,
  autor_avatar_url text,
  texto text,
  created_at timestamptz,
  autor_fuente_nombre text,
  autor_animacion_nombre text,
  responde_a uuid,
  responde_a_texto text,
  responde_a_autor_id uuid,
  responde_a_autor_nombre text,
  borrado boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_menor boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not exists (select 1 from public.clan_membresias cm where cm.clan_id = p_clan_id and cm.user_id = v_user) then
    raise exception 'no eres miembro de este clan';
  end if;
  v_menor := public.es_menor_13(v_user);

  return query
    select m.id, m.autor_id, p.display_name, p.avatar_url,
      case when m.borrado_en is not null then 'Mensaje eliminado' when v_menor and not public.es_frase_rapida(m.texto) then 'Mensaje oculto' else m.texto end,
      m.created_at,
      p.fuente_nombre, p.animacion_nombre,
      m.responde_a,
      case when o.borrado_en is not null then 'Mensaje eliminado' when o.id is not null and v_menor and not public.es_frase_rapida(o.texto) then 'Mensaje oculto' else left(o.texto, 140) end,
      o.autor_id, po.display_name,
      m.borrado_en is not null
    from public.clan_mensajes m
    join public.profiles p on p.id = m.autor_id
    left join public.clan_mensajes o on o.id = m.responde_a
    left join public.profiles po on po.id = o.autor_id
    where m.clan_id = p_clan_id
    order by m.created_at desc
    limit least(coalesce(p_limite, 100), 100);
end;
$$;
grant execute on function public.mensajes_de_clan(uuid, integer) to authenticated;

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
        case when md.borrado_en is not null then 'Mensaje eliminado' else md.texto end as ultimo_texto_cte,
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
      where md.destinatario_id = v_user and md.leido = false and md.borrado_en is null
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

create or replace function public.clan_chat_resumen()
returns table (out_clan_id uuid, out_clan_nombre text, out_no_leidos bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan uuid;
  v_nombre text;
  v_hasta timestamptz;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select cm.clan_id, c.nombre into v_clan, v_nombre
  from public.clan_membresias cm
  join public.clanes c on c.id = cm.clan_id
  where cm.user_id = v_user;
  if v_clan is null then
    return;
  end if;

  select l.leido_hasta into v_hasta
  from public.clan_chat_lectura l
  where l.user_id = v_user and l.clan_id = v_clan;

  if v_hasta is null then
    -- Primera consulta (o cambió de clan): punto de partida = ahora.
    insert into public.clan_chat_lectura (user_id, clan_id, leido_hasta)
    values (v_user, v_clan, now())
    on conflict (user_id) do update set clan_id = excluded.clan_id, leido_hasta = excluded.leido_hasta;
    return query select v_clan, v_nombre, 0::bigint;
    return;
  end if;

  return query
    select v_clan, v_nombre, count(*)::bigint
    from public.clan_mensajes m
    where m.clan_id = v_clan and m.autor_id <> v_user and m.created_at > v_hasta and m.borrado_en is null;
end;
$$;
grant execute on function public.clan_chat_resumen() to authenticated;

-- ---------- Retos: 2 minutos para aceptarlos (duelo en vivo) ----------
-- Recibe los dos jugadores para poder distinguir casos en el futuro; hoy todo
-- reto dura lo mismo que la espera en la sala.
create or replace function public.vigencia_invitacion_duelo(p_retador uuid, p_retado uuid)
returns interval
language sql
immutable
as $$
  select interval '2 minutes';
$$;
grant execute on function public.vigencia_invitacion_duelo(uuid, uuid) to authenticated;

drop function if exists public.mis_duelos_pendientes();
create function public.mis_duelos_pendientes()
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

  -- Invitaciones vencidas: un reto dura 2 minutos (los duelos son en vivo;
  -- quien reta espera en la sala y, si nadie llega, se cancela).
  delete from public.duels d
  where d.estado = 'pendiente'
    and d.modo = 'simple'
    and d.creado_at < now() - public.vigencia_invitacion_duelo(d.retador_id, d.retado_id)
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
      and not exists (select 1 from public.duel_results r where r.duel_id = d.id and r.user_id = v_user)
    order by d.creado_at desc;
end;
$$;
grant execute on function public.mis_duelos_pendientes() to authenticated;

notify pgrst, 'reload schema';
