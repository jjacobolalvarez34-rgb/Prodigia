-- ============================================================
-- Prodigia — Fase 3 de la tanda "Rankeds/Clanes: bugs y ranking
-- visible": imagen personalizada de clan, mismo mecanismo que
-- SubirAvatar.tsx (Supabase Storage, ver 0039_avatares.sql) — un
-- bucket nuevo en vez de reusar "avatares" porque el dueño del
-- archivo acá es el CLAN, no un usuario, y la policy de acceso es
-- distinta (solo el fundador puede subir/reemplazar).
--
-- Solo el fundador puede cambiarla (RPC actualizar_imagen_clan,
-- security definer, valida el rol). Si no se sube ninguna, el
-- estandarte generado por nivel sigue siendo el default —
-- EstandarteClan.tsx ya solo usa la imagen cuando imagen_url no es
-- null.
-- ============================================================

alter table public.clanes add column if not exists imagen_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clanes', 'clanes', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Path esperado: clanes/<clan_id>/estandarte.<ext> — solo el fundador
-- del clan puede subir/reemplazar/borrar dentro de esa carpeta.
create policy "el fundador sube la imagen de su clan"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'clanes'
    and exists (
      select 1 from public.clan_membresias cm
      where cm.clan_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.rol = 'fundador'
    )
  );

create policy "el fundador reemplaza la imagen de su clan"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'clanes'
    and exists (
      select 1 from public.clan_membresias cm
      where cm.clan_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.rol = 'fundador'
    )
  );

create policy "el fundador borra la imagen de su clan"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'clanes'
    and exists (
      select 1 from public.clan_membresias cm
      where cm.clan_id::text = (storage.foldername(name))[1]
        and cm.user_id = auth.uid()
        and cm.rol = 'fundador'
    )
  );

create policy "cualquiera lee imagenes de clan (bucket publico)"
  on storage.objects for select
  using (bucket_id = 'clanes');

-- clanes.imagen_url no es una columna de escritura directa (mismo
-- criterio que el resto de la tabla) — pasa por esta función, que
-- valida que quien llama sea el fundador del clan antes de guardar.
create or replace function public.actualizar_imagen_clan(p_clan_id uuid, p_url text)
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
  if not exists (
    select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = v_user and rol = 'fundador'
  ) then
    raise exception 'solo el fundador puede cambiar la imagen del clan';
  end if;

  update public.clanes set imagen_url = p_url where id = p_clan_id;
end;
$$;

grant execute on function public.actualizar_imagen_clan(uuid, text) to authenticated;

-- ---------- sumar imagen_url a las funciones de lectura de clan ----------
drop function if exists public.mi_clan();

create function public.mi_clan()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  rol text, cantidad_miembros bigint, nivel_clan integer, imagen_url text
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
      public.nivel_clan(c.id), c.imagen_url
    from public.clan_membresias cm
    join public.clanes c on c.id = cm.clan_id
    where cm.user_id = v_user;
end;
$$;

grant execute on function public.mi_clan() to authenticated;

drop function if exists public.mapa_clanes();

create or replace function public.mapa_clanes()
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text,
  nivel_clan integer, cantidad_miembros integer, capacidad integer, creado_at timestamptz, imagen_url text
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte,
    public.nivel_clan(c.id),
    (select count(*)::integer from public.clan_membresias cm where cm.clan_id = c.id),
    public.capacidad_clan(public.nivel_clan(c.id)),
    c.creado_at, c.imagen_url
  from public.clanes c
  where c.tipo = 'jugadores'
  order by c.creado_at asc;
$$;

grant execute on function public.mapa_clanes() to authenticated;

drop function if exists public.ver_clan_publico(uuid);

create or replace function public.ver_clan_publico(p_clan_id uuid)
returns table (
  clan_id uuid, nombre text, tag text, color_estandarte text, descripcion text,
  nivel_clan integer, cantidad_miembros integer, capacidad integer, guerras_ganadas integer, creado_at timestamptz, imagen_url text
)
language sql
security definer
set search_path = public
as $$
  select c.id, c.nombre, c.tag, c.color_estandarte, c.descripcion,
    public.nivel_clan(c.id),
    (select count(*)::integer from public.clan_membresias cm where cm.clan_id = c.id),
    public.capacidad_clan(public.nivel_clan(c.id)),
    c.guerras_ganadas,
    c.creado_at, c.imagen_url
  from public.clanes c
  where c.id = p_clan_id and c.tipo = 'jugadores';
$$;

grant execute on function public.ver_clan_publico(uuid) to authenticated;
