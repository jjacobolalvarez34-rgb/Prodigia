-- ====================================================================
-- Prodigia — Galería de fondos animados, pedido en vivo (2026-09-15):
-- "si esta feo los colores... uno dice océano y se imagina UN OCÉANO
-- animado... no un color azul x. de más puedo subir en una carpeta
-- algunos gifs para venderlos allí como fondos de perfil". Los 5
-- degradés CSS existentes se quedan (ahora rebautizados como colores
-- lisos en las traducciones, sin prometer una escena real) — esto es
-- un catálogo APARTE y ampliable sin tocar código: vos subís un gif o
-- imagen a Storage (bucket "fondos-perfil", carpeta "galeria/") y
-- agregás una fila acá con la URL pública — aparece solo en la Tienda,
-- sin deploy.
--
-- Reusa 100% el mecanismo de "personalizado" que ya existía
-- (profiles.fondo_perfil_url + fondo_perfil='personalizado'): elegir un
-- ítem de la galería simplemente apunta esa misma URL a la imagen
-- elegida — cero cambios en FondoPerfilCapa.tsx ni en el resto del
-- render. Lo nuevo es solo el catálogo + qué ítems compró cada quién.
-- ====================================================================

create table public.fondos_galeria (
  slug text primary key,
  nombre text not null,
  url text not null,
  costo integer not null check (costo >= 0),
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.fondos_galeria enable row level security;

-- Catálogo público de solo lectura (cualquiera puede ver qué hay para
-- comprar, incluso sin sesión — mismo criterio que el resto de la
-- vidriera de la Tienda). Nada de insert/update/delete desde el
-- cliente: el dueño administra el catálogo directo por SQL.
create policy "leer_fondos_galeria_activos"
  on public.fondos_galeria for select
  to anon, authenticated
  using (activo);

create table public.fondos_galeria_desbloqueados (
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null references public.fondos_galeria(slug) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.fondos_galeria_desbloqueados enable row level security;

create policy "leer_mis_fondos_galeria"
  on public.fondos_galeria_desbloqueados for select
  to authenticated
  using (auth.uid() = user_id);

-- comprar_fondo_galeria: security definer, re-deriva auth.uid(), y
-- SIEMPRE cobra el costo que diga la tabla ahora mismo (nunca uno que
-- mande el cliente) — mismo criterio anti-manipulación que
-- comprar_item_tienda.
create or replace function public.comprar_fondo_galeria(p_slug text)
returns table (puntos_total integer, slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_costo integer;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select fg.costo into v_costo from public.fondos_galeria fg where fg.slug = p_slug and fg.activo;
  if v_costo is null then
    raise exception 'fondo invalido';
  end if;

  if exists (select 1 from public.fondos_galeria_desbloqueados where user_id = v_user and fondos_galeria_desbloqueados.slug = p_slug) then
    raise exception 'ya tenes este fondo';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  update public.profiles as pr set puntos_total = pr.puntos_total - v_costo where pr.id = v_user;
  insert into public.fondos_galeria_desbloqueados (user_id, slug) values (v_user, p_slug)
    on conflict (user_id, slug) do nothing;

  return query select pr.puntos_total, p_slug from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.comprar_fondo_galeria(text) to authenticated;

-- elegir_fondo_galeria: verifica que YA lo compraste, y ahí sí reusa
-- fondo_perfil/fondo_perfil_url existentes.
create or replace function public.elegir_fondo_galeria(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_url text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select fg.url into v_url
  from public.fondos_galeria fg
  join public.fondos_galeria_desbloqueados d on d.slug = fg.slug
  where fg.slug = p_slug and d.user_id = v_user;

  if v_url is null then
    raise exception 'no desbloqueaste este fondo';
  end if;

  update public.profiles set fondo_perfil = 'personalizado', fondo_perfil_url = v_url where id = v_user;
end;
$$;

grant execute on function public.elegir_fondo_galeria(text) to authenticated;

notify pgrst, 'reload schema';
