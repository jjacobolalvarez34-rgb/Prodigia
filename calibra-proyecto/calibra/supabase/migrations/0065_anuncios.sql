-- ============================================================
-- Prodigia — Fase 12: sistema de anuncios/novedades ("qué hay de
-- nuevo"), con panel de administración mínimo para el dueño del
-- proyecto.
-- Correr después de 0064_racha_en_riesgo.sql
--
-- Mismo criterio que el resto del proyecto: nada de insert/update
-- directo desde el cliente sobre "anuncios"/"anuncios_leidos" — todo
-- pasa por funciones security definer. El admin panel (Fase 12) es la
-- única vía para crear anuncios nuevos; se protege con la columna
-- "es_admin" de profiles, no con RLS de tabla (mismo patrón que
-- "es_profesor").
-- ============================================================

alter table public.profiles add column if not exists es_admin boolean not null default false;

-- Te doy admin a vos (el único usuario que va a crear anuncios en esta
-- primera versión) por email, ya que no tengo forma de conocer tu user
-- id desde acá. Si tu cuenta todavía no existe cuando se corre esto, no
-- hace nada — no es un error.
update public.profiles set es_admin = true
where id = (select id from auth.users where email = 'solirinaalmacen@gmail.com');

create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('actualizacion', 'arreglo', 'evento')),
  titulo text not null,
  descripcion text not null,
  fecha date not null default current_date,
  activo boolean not null default true,
  creado_at timestamptz not null default now()
);

create table if not exists public.anuncios_leidos (
  user_id uuid not null references public.profiles(id) on delete cascade,
  anuncio_id uuid not null references public.anuncios(id) on delete cascade,
  leido_at timestamptz not null default now(),
  primary key (user_id, anuncio_id)
);

alter table public.anuncios enable row level security;
alter table public.anuncios_leidos enable row level security;
-- Sin policies de select/insert/update para "authenticated" a propósito
-- — todo el acceso (lectura incluida) pasa por las funciones de abajo,
-- así "anuncios_pendientes()" puede filtrar los ya leídos sin que el
-- cliente pueda leer la tabla completa (incluidos los inactivos/viejos)
-- directo.

-- ---------- lectura: solo lo activo y no leído por mí, en orden ----------
create or replace function public.anuncios_pendientes()
returns table (id uuid, tipo text, titulo text, descripcion text, fecha date)
language sql
security definer
set search_path = public
as $$
  select a.id, a.tipo, a.titulo, a.descripcion, a.fecha
  from public.anuncios a
  where a.activo = true
    and auth.uid() is not null
    and not exists (
      select 1 from public.anuncios_leidos l
      where l.anuncio_id = a.id and l.user_id = auth.uid()
    )
  order by a.fecha asc, a.creado_at asc;
$$;

grant execute on function public.anuncios_pendientes() to authenticated;

-- ---------- marcar como leído: no vuelve a aparecer nunca más ----------
create or replace function public.marcar_anuncio_leido(p_anuncio_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  insert into public.anuncios_leidos (user_id, anuncio_id)
  values (auth.uid(), p_anuncio_id)
  on conflict (user_id, anuncio_id) do nothing;
end;
$$;

grant execute on function public.marcar_anuncio_leido(uuid) to authenticated;

-- ---------- admin: crear / listar / activar-desactivar ----------
create or replace function public.crear_anuncio(p_tipo text, p_titulo text, p_descripcion text, p_fecha date default current_date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;
  if p_tipo not in ('actualizacion', 'arreglo', 'evento') then
    raise exception 'tipo invalido';
  end if;

  insert into public.anuncios (tipo, titulo, descripcion, fecha)
  values (p_tipo, p_titulo, p_descripcion, p_fecha)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.listar_anuncios_admin()
returns table (id uuid, tipo text, titulo text, descripcion text, fecha date, activo boolean, creado_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;

  return query
    select a.id, a.tipo, a.titulo, a.descripcion, a.fecha, a.activo, a.creado_at
    from public.anuncios a
    order by a.creado_at desc;
end;
$$;

create or replace function public.alternar_anuncio_activo(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and es_admin) then
    raise exception 'no autorizado';
  end if;

  update public.anuncios set activo = not activo where id = p_id;
end;
$$;

grant execute on function public.crear_anuncio(text, text, text, date) to authenticated;
grant execute on function public.listar_anuncios_admin() to authenticated;
grant execute on function public.alternar_anuncio_activo(uuid) to authenticated;
