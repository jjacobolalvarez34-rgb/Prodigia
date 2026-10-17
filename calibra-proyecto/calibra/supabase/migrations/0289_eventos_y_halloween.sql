-- ============================================================
-- Prodigia — Eventos de las festividades y la colección de Halloween (0289).
--
-- docs/eventos/PLAN_FESTIVIDADES.md (capas 7 y 8) y economy/PLAN_ECONOMIA.md §7:
--   - Cada evento grande tiene su colección: se gana con las Fichas del evento o se
--     compra con Cometas, y no se vende en el Bazar de siempre.
--   - Fichas: 1 cada 40 de Exp ganada en los días del evento, hasta 12 por día. Las
--     calcula la base desde daily_progress (nadie puede inventarlas).
--   - Al cerrar, las Fichas que sobran se cambian por 30 Chispas cada una.
--   - Los anuncios con fecha futura quedan programados: se ven desde ese día.
--
-- Se GENERA desde src/lib/temas/colecciones.ts (eventos.test.ts comprueba que
-- coincida). No editar a mano. Requiere 0248, 0249, 0275, 0279 y 0288. Idempotente.
-- ============================================================

-- ---------- Piezas nuevas: valores permitidos y catálogo ----------
alter table public.profiles drop constraint if exists profiles_marco_perfil_check;
alter table public.profiles add constraint profiles_marco_perfil_check
  check (marco_perfil in ('ninguno', 'bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia', 'neon_violeta', 'neon_cian', 'neon_magenta', 'temporada_aurora', 'temporada_brasas', 'temporada_escarcha', 'temporada_cosmos', 'coleccion_numeria', 'coleccion_enigmia', 'coleccion_geografia', 'coleccion_quimia', 'coleccion_anatomia', 'coleccion_melodia', 'coleccion_trigonometria', 'coleccion_historia', 'coleccion_calculia', 'coleccion_circuitia', 'coleccion_estadistica', 'coleccion_naipia', 'coleccion_codia', 'coleccion_dinamia', 'coleccion_vitalia', 'pionero', 'estilo_artico', 'estilo_medianoche', 'estilo_menta', 'estilo_sakura', 'estilo_oceano', 'estilo_esmeralda', 'estilo_rubi', 'estilo_zafiro', 'estilo_amatista', 'estilo_atardecer', 'estilo_oro_rosa', 'estilo_fenix', 'estilo_lava', 'estilo_obsidiana', 'estilo_cyberpunk', 'estilo_galaxia', 'estilo_arcoiris', 'estilo_holograma', 'evento_calabaza', 'evento_esqueleto'));

alter table public.profiles drop constraint if exists profiles_fondo_perfil_check;
alter table public.profiles add constraint profiles_fondo_perfil_check
  check (fondo_perfil in ('ninguno', 'aurora', 'nebulosa', 'dorado', 'oceano', 'bosque', 'personalizado', 'prodigio', 'ciudad_numeria', 'ciudad_enigmia', 'ciudad_geografia', 'ciudad_quimia', 'ciudad_anatomia', 'ciudad_melodia', 'ciudad_trigonometria', 'ciudad_historia', 'ciudad_calculia', 'ciudad_circuitia', 'ciudad_estadistica', 'ciudad_naipia', 'ciudad_codia', 'ciudad_dinamia', 'ciudad_vitalia', 'artico', 'selva', 'desierto', 'medianoche', 'atardecer', 'sakura', 'lava', 'caramelo', 'tormenta', 'coral', 'galaxia', 'neon', 'evento_noche_luna'));

insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('emote_evento_buu', 'emote', 'evento_buu', '👻 ¡Buu!', 'comun', 400, false, false, null, null),
  ('estela_evento_murcielago', 'estela', 'evento_murcielago', 'Estela Murciélago', 'raro', 1200, false, false, null, null),
  ('efecto_evento_fuego_fatuo', 'efecto', 'evento_fuego_fatuo', 'Fuego fatuo', 'raro', 1200, false, false, null, null),
  ('fondo_evento_noche_luna', 'fondo', 'evento_noche_luna', 'Fondo Noche de luna', 'raro', 1200, false, false, null, null),
  ('titulo_evento_cazafantasmas', 'titulo', 'evento-cazafantasmas', 'Cazafantasmas', 'epico', 3000, false, false, null, null),
  ('marco_evento_calabaza', 'marco', 'evento_calabaza', 'Marco Calabaza', 'epico', 3000, false, false, null, null),
  ('marco_evento_esqueleto', 'marco', 'evento_esqueleto', 'Marco Esqueleto fosforescente', 'legendario', 6000, false, false, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

-- ---------- Eventos ----------
create table if not exists public.eventos (
  slug text primary key,
  tema text not null,
  desde date not null,
  hasta date not null,
  cierre date not null
);

create table if not exists public.eventos_piezas (
  evento text not null references public.eventos(slug) on delete cascade,
  item text not null references public.catalogo_cosmeticos(slug) on delete cascade,
  fichas integer not null check (fichas > 0),
  cometas integer not null check (cometas > 0),
  primary key (evento, item)
);

create table if not exists public.fichas_canjes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  item text not null,
  fichas integer not null default 0,
  cometas integer not null default 0,
  creado_at timestamptz not null default now()
);
create index if not exists fichas_canjes_user_idx on public.fichas_canjes (user_id, evento);

create table if not exists public.fichas_cierres (
  user_id uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  chispas integer not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, evento)
);

alter table public.eventos enable row level security;
alter table public.eventos_piezas enable row level security;
alter table public.fichas_canjes enable row level security;
alter table public.fichas_cierres enable row level security;
drop policy if exists "eventos visibles" on public.eventos;
create policy "eventos visibles" on public.eventos for select using (true);
drop policy if exists "piezas visibles" on public.eventos_piezas;
create policy "piezas visibles" on public.eventos_piezas for select using (true);
drop policy if exists "mis canjes" on public.fichas_canjes;
create policy "mis canjes" on public.fichas_canjes for select using (auth.uid() = user_id);
drop policy if exists "mis cierres" on public.fichas_cierres;
create policy "mis cierres" on public.fichas_cierres for select using (auth.uid() = user_id);
grant select on public.eventos, public.eventos_piezas to anon, authenticated;
grant select on public.fichas_canjes, public.fichas_cierres to authenticated;

insert into public.eventos (slug, tema, desde, hasta, cierre) values
  ('halloween-2026', 'halloween', '2026-10-24', '2026-10-31', '2026-11-01'),
  ('halloween-2027', 'halloween', '2027-10-24', '2027-10-31', '2027-11-01')
on conflict (slug) do update set tema = excluded.tema, desde = excluded.desde, hasta = excluded.hasta, cierre = excluded.cierre;

insert into public.eventos_piezas (evento, item, fichas, cometas) values
  ('halloween-2026', 'emote_evento_buu', 8, 60),
  ('halloween-2026', 'estela_evento_murcielago', 16, 120),
  ('halloween-2026', 'efecto_evento_fuego_fatuo', 16, 120),
  ('halloween-2026', 'fondo_evento_noche_luna', 18, 140),
  ('halloween-2026', 'titulo_evento_cazafantasmas', 24, 220),
  ('halloween-2026', 'marco_evento_calabaza', 30, 300),
  ('halloween-2026', 'marco_evento_esqueleto', 45, 600),
  ('halloween-2027', 'emote_evento_buu', 8, 60),
  ('halloween-2027', 'estela_evento_murcielago', 16, 120),
  ('halloween-2027', 'efecto_evento_fuego_fatuo', 16, 120),
  ('halloween-2027', 'fondo_evento_noche_luna', 18, 140),
  ('halloween-2027', 'titulo_evento_cazafantasmas', 24, 220),
  ('halloween-2027', 'marco_evento_calabaza', 30, 300),
  ('halloween-2027', 'marco_evento_esqueleto', 45, 600)
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;

-- Fichas ganadas: 1 cada 40 de Exp por día del evento, hasta 12 por día.
create or replace function public._fichas_ganadas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(least(12, floor(dp.xp_ganado / 40.0)::integer)), 0)::integer
  from public.daily_progress dp
  join public.eventos e on e.slug = p_evento
  where dp.user_id = p_user and dp.fecha between e.desde and e.hasta;
$$;
revoke execute on function public._fichas_ganadas(uuid, text) from public, anon, authenticated;

create or replace function public.estado_evento(p_evento text)
returns table (ganadas integer, gastadas integer, saldo integer, cerrado boolean, chispas_cierre integer, piezas text[])
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_ganadas integer;
  v_gastadas integer;
begin
  if v_user is null then
    return;
  end if;
  v_ganadas := public._fichas_ganadas(v_user, p_evento);
  select coalesce(sum(c.fichas), 0)::integer into v_gastadas from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento;
  return query select v_ganadas, v_gastadas, greatest(0, v_ganadas - v_gastadas),
    exists (select 1 from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento),
    coalesce((select fc.chispas from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento), 0),
    coalesce((select array_agg(ep.item) from public.eventos_piezas ep where ep.evento = p_evento and public._tiene_cosmetico(v_user, ep.item)), array[]::text[]);
end;
$$;
revoke execute on function public.estado_evento(text) from public, anon;
grant execute on function public.estado_evento(text) to authenticated;

-- Canjear una pieza: con Fichas (mientras dura el evento y el día de cierre) o con Cometas.
create or replace function public.canjear_pieza_evento(p_evento text, p_item text, p_con_cometas boolean)
returns table (saldo integer, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_p public.eventos_piezas%rowtype;
  v_saldo integer;
  v_cometas integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = p_evento;
  if not found then
    raise exception 'evento invalido';
  end if;
  if current_date < v_e.desde or current_date > v_e.cierre then
    raise exception 'el evento no esta abierto';
  end if;
  select * into v_p from public.eventos_piezas ep where ep.evento = p_evento and ep.item = p_item;
  if not found then
    raise exception 'pieza invalida';
  end if;
  if public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes esta pieza';
  end if;
  select pr.cometas into v_cometas from public.profiles pr where pr.id = v_user for update;
  if p_con_cometas then
    if coalesce(v_cometas, 0) < v_p.cometas then
      raise exception 'te faltan Cometas para esta pieza';
    end if;
    insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia) values (v_user, -v_p.cometas, 'evento', 'evento:' || p_evento || ':' || p_item);
    update public.profiles as pr set cometas = pr.cometas - v_p.cometas where pr.id = v_user;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, 0, v_p.cometas);
  else
    v_saldo := public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0);
    if v_saldo < v_p.fichas then
      raise exception 'te faltan fichas para esta pieza';
    end if;
    insert into public.fichas_canjes (user_id, evento, item, fichas, cometas) values (v_user, p_evento, p_item, v_p.fichas, 0);
  end if;
  perform public._dar_cosmetico(v_user, p_item);
  return query select greatest(0, public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0))::integer,
    pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.canjear_pieza_evento(text, text, boolean) from public, anon;
grant execute on function public.canjear_pieza_evento(text, text, boolean) to authenticated;

-- Después del evento: las Fichas que sobran pasan a Chispas (una vez).
create or replace function public.cerrar_fichas_evento(p_evento text)
returns table (chispas integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_e public.eventos%rowtype;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_e from public.eventos e where e.slug = p_evento;
  if not found then
    raise exception 'evento invalido';
  end if;
  if current_date <= v_e.hasta then
    raise exception 'el evento sigue abierto';
  end if;
  if exists (select 1 from public.fichas_cierres fc where fc.user_id = v_user and fc.evento = p_evento) then
    raise exception 'ya cambiaste tus fichas';
  end if;
  v_saldo := greatest(0, public._fichas_ganadas(v_user, p_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = p_evento), 0));
  insert into public.fichas_cierres (user_id, evento, chispas) values (v_user, p_evento, v_saldo * 30);
  perform public._dar_chispas(v_user, v_saldo * 30);
  return query select v_saldo * 30, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.cerrar_fichas_evento(text) from public, anon;
grant execute on function public.cerrar_fichas_evento(text) to authenticated;

-- ---------- Anuncios programados: con fecha futura, se ven desde ese día ----------
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
    and a.fecha <= current_date
    and a.fecha >= (select u.created_at::date from auth.users u where u.id = auth.uid()) - 30
  order by a.fecha desc, a.creado_at desc
  limit least(greatest(coalesce(p_limite, 20), 1), 50);
$$;
revoke execute on function public.anuncios_recientes(integer) from public, anon;
grant execute on function public.anuncios_recientes(integer) to authenticated;

-- El anuncio de cada evento, programado para el día que empieza (una vez por evento).
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Noche de los esqueletos', '¡Noche de los esqueletos! Truco o trato. Juega en cualquier mundo para ganar Caramelos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 31/10.', '2026-10-24'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Noche de los esqueletos' and a.fecha = '2026-10-24');
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'Evento: Noche de los esqueletos', '¡Noche de los esqueletos! Truco o trato. Juega en cualquier mundo para ganar Caramelos y elige qué piezas de la colección llevarte (también se pueden comprar con Cometas). Hasta el 31/10.', '2027-10-24'
where not exists (select 1 from public.anuncios a where a.titulo = 'Evento: Noche de los esqueletos' and a.fecha = '2027-10-24');

notify pgrst, 'reload schema';
