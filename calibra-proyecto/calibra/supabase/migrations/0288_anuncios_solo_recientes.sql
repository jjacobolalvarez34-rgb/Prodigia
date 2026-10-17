-- ============================================================
-- Prodigia — Anuncios: solo lo nuevo para cada cuenta (0288).
--
-- Pedido del 2026-10-16: «una persona que entra apenas ve como los 12 anuncios que
-- hemos hecho». anuncios_pendientes() devolvía TODOS los activos que la cuenta no
-- había leído, desde el primero que se publicó. Ahora:
--   - solo los publicados desde que se creó la cuenta (una cuenta nueva no hereda
--     la historia: la conoce jugando);
--   - como mucho los 3 más recientes de las últimas 3 semanas.
-- anuncios_recientes() (el centro de avisos de la app) muestra lo publicado desde un
-- mes antes de crear la cuenta, no toda la historia.
-- Requiere 0065 y 0243. Idempotente.
-- ============================================================

create or replace function public.anuncios_pendientes()
returns table (id uuid, tipo text, titulo text, descripcion text, fecha date)
language sql
stable
security definer
set search_path = public
as $$
  with mios as (
    select a.id, a.tipo, a.titulo, a.descripcion, a.fecha, a.creado_at
    from public.anuncios a
    where a.activo = true
      and auth.uid() is not null
      and a.creado_at >= (select u.created_at from auth.users u where u.id = auth.uid())
      and a.fecha >= current_date - 21
      and not exists (
        select 1 from public.anuncios_leidos l
        where l.anuncio_id = a.id and l.user_id = auth.uid()
      )
    order by a.fecha desc, a.creado_at desc
    limit 3
  )
  select m.id, m.tipo, m.titulo, m.descripcion, m.fecha
  from mios m
  order by m.fecha asc, m.creado_at asc;
$$;

grant execute on function public.anuncios_pendientes() to authenticated;

create or replace function public.anuncios_recientes(p_limite integer default 20)
returns table (out_id uuid, out_tipo text, out_titulo text, out_descripcion text, out_fecha date, out_leido boolean)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.tipo, a.titulo, a.descripcion, a.fecha,
    exists (select 1 from public.anuncios_leidos l where l.anuncio_id = a.id and l.user_id = auth.uid())
  from public.anuncios a
  where a.activo = true
    and auth.uid() is not null
    and a.creado_at >= (select u.created_at from auth.users u where u.id = auth.uid()) - interval '30 days'
  order by a.fecha desc, a.creado_at desc
  limit least(greatest(coalesce(p_limite, 20), 1), 50);
$$;

revoke execute on function public.anuncios_recientes(integer) from public, anon;
grant execute on function public.anuncios_recientes(integer) to authenticated;

notify pgrst, 'reload schema';
