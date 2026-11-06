-- 0316: el aviso de «Novedades» ya no muestra eventos que terminaron (2026-11-06).
-- Una cuenta que volvía después de unos días veía «Evento: Noche de los esqueletos …
-- Hasta el 31/10» en noviembre. Ahora el anuncio de un evento solo sale los 4 días
-- siguientes a su fecha (el cartel del evento en el Inicio sigue avisando mientras
-- dura). Las demás novedades siguen igual (hasta 21 días). Base: 0289.

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
      and a.fecha <= current_date
      and a.fecha >= (select u.created_at::date from auth.users u where u.id = auth.uid())
      and a.fecha >= current_date - case when a.tipo = 'evento' then 4 else 21 end
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
