-- ============================================================
-- Prodigia — pantalla de amigos (Fase PP)
-- Correr después de 0020_enigmia_categorias.sql
-- ============================================================

-- Faltaba la policy de DELETE en friendships (para rechazar una
-- solicitud o eliminar una amistad) — 0012 dejó la tabla sin ella.
create policy "usuarios borran amistades donde participan"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- RLS en profiles solo deja ver el propio perfil — buscar gente por
-- nombre necesita una grieta deliberada como las de reporting/grupos:
-- devuelve solo id+nombre, nada sensible, y nunca al propio usuario.
create function public.buscar_usuarios(p_query text)
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name
  from public.profiles p
  where p.display_name ilike '%' || p_query || '%'
    and p.id <> auth.uid()
    and p.display_name is not null
  order by p.display_name asc
  limit 15;
$$;

grant execute on function public.buscar_usuarios(text) to authenticated;

create function public.mis_solicitudes_pendientes()
returns table (user_id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select f.user_id, p.display_name
  from public.friendships f
  join public.profiles p on p.id = f.user_id
  where f.friend_id = auth.uid() and f.estado = 'pendiente';
$$;

grant execute on function public.mis_solicitudes_pendientes() to authenticated;

create function public.mis_amigos()
returns table (friend_id uuid, display_name text, elo_rating integer)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.elo_rating
  from public.friendships f
  join public.profiles p on p.id = (case when f.user_id = auth.uid() then f.friend_id else f.user_id end)
  where (f.user_id = auth.uid() or f.friend_id = auth.uid()) and f.estado = 'aceptada';
$$;

grant execute on function public.mis_amigos() to authenticated;
