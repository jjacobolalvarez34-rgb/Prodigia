-- ============================================================
-- Prodigia — Notificaciones de la app móvil: categorías por dispositivo,
-- límite anti-spam y centro de avisos (pedido del usuario, 2026-09-27:
-- "notificaciones de mensajes o eventos o publicidad de las cosas en general").
--
-- Reglas de docs/app-nativa/04-BUCLE-DE-ENGANCHE.md §5 (público de 8-15 años):
--   - Mensajes (directos y de clan): agrupados, no más de 1 cada 30 min por
--     conversación.
--   - Tope global de 2 notificaciones de retención por día (racha y novedades;
--     duelos y mensajes no cuentan).
--   - Cada persona elige qué categorías recibe.
--
-- 1) device_push_tokens.categorias: qué avisos acepta ESE dispositivo
--    ('mensajes', 'duelos', 'racha', 'novedades'). Por defecto, todos. La app
--    los cambia con actualizar_categorias_push(); las Edge Functions filtran
--    por esta columna.
-- 2) push_throttle: último envío por (usuario, clave). Lo usan solo las Edge
--    Functions con la service role (RLS activo y sin policies ni grants: el
--    cliente no la ve ni la toca).
-- 3) anuncios_recientes(): los últimos anuncios activos con la marca de si YA
--    los leí, para el centro de avisos de la app (anuncios_pendientes() de 0065
--    solo devuelve los no leídos, y una vez leídos desaparecen).
--
-- Requiere 0065 (anuncios) y 0114 (device_push_tokens). Idempotente.
-- ============================================================

alter table public.device_push_tokens
  add column if not exists categorias text[] not null default array['mensajes', 'duelos', 'racha', 'novedades'];

create or replace function public.actualizar_categorias_push(p_token text, p_categorias text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_validas constant text[] := array['mensajes', 'duelos', 'racha', 'novedades'];
  v_cat text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  foreach v_cat in array coalesce(p_categorias, array[]::text[]) loop
    if not (v_cat = any(v_validas)) then
      raise exception 'categoria invalida';
    end if;
  end loop;

  update public.device_push_tokens dpt
  set categorias = coalesce(p_categorias, array[]::text[]),
      updated_at = now()
  where dpt.token = p_token and dpt.user_id = v_user;
end;
$$;

revoke execute on function public.actualizar_categorias_push(text, text[]) from public, anon;
grant execute on function public.actualizar_categorias_push(text, text[]) to authenticated;

create table if not exists public.push_throttle (
  user_id uuid not null references public.profiles(id) on delete cascade,
  clave text not null,
  ultimo_envio timestamptz not null default now(),
  envios_hoy integer not null default 0,
  fecha date not null default current_date,
  primary key (user_id, clave)
);

alter table public.push_throttle enable row level security;

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
  order by a.fecha desc, a.creado_at desc
  limit least(greatest(coalesce(p_limite, 20), 1), 50);
$$;

revoke execute on function public.anuncios_recientes(integer) from public, anon;
grant execute on function public.anuncios_recientes(integer) to authenticated;

notify pgrst, 'reload schema';
