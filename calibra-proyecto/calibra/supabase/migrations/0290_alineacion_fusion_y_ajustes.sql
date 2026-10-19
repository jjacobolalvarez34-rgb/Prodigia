-- ============================================================
-- Prodigia — Gran Alineación completa, fusión de cápsulas y ajustes (0290).
-- Pedidos del 2026-10-18 (docs/PENDIENTES_2026-10-13.md, 66 a 72):
--
-- 1) Eventos con hora exacta de apertura: ningún evento abre durante una Gran
--    Alineación, abre cuando termina (src/lib/temas/calendario.ts inicioEventoMs).
--    Halloween 2026 abre el 25/10 a las 02:00 UTC (sábado 24, 21:00 de Colombia). Las
--    Fichas cuentan la Exp desde ese momento, día por día (UTC), hasta 12 por día.
-- 2) reclamar_calendario: bloquea a la persona mientras reclama (si se reclamaba a la
--    vez desde el teléfono y la web, los dos pedidos podían cobrar).
-- 3) Cápsulas: ninguna da menos de 100 Chispas (pedido del usuario). Tipos nuevos:
--    plata, oro y prisma (de la fusión) y alineacion (la de la Gran Alineación).
-- 4) Fusión de cápsulas (PLAN_ECONOMIA.md §4.2): 3 cápsulas del mismo nivel + Chispas
--    → 1 del nivel siguiente. Bronce (diaria, misiones, nivel, liga) → plata: 50;
--    plata (racha, liga_bronce, plata) → oro: 150; oro (liga_plata, oro) → prisma: 400.
-- 5) Gran Alineación (decisiones del 2026-10-18): por jugar al menos una partida (5
--    respuestas o más), un sello numerado para la Placa; por 3 partidas, la Cápsula de
--    la Alineación; y una meta de comunidad: si entre todos se llega a la meta de
--    respuestas, cada uno que jugó reclama 300 Chispas (hasta la próxima Alineación).
--    La meta se fija al empezar: 40 respuestas por cada jugador activo de la semana
--    (mínimo 500). Se puede cambiar a mano en alineacion_comunidad.meta.
-- 6) El anuncio de la primera Alineación, programado para el sábado 24.
--
-- Requiere 0249, 0259, 0280, 0283, 0286, 0287 y 0289. Idempotente.
-- ============================================================

-- ---------- 1) Eventos: hora exacta de apertura ----------
alter table public.eventos add column if not exists inicio timestamptz;
update public.eventos set inicio = '2026-10-25 02:00:00+00' where slug = 'halloween-2026';
update public.eventos set inicio = '2027-10-24 02:00:00+00' where slug = 'halloween-2027';
update public.eventos set inicio = desde::timestamp at time zone 'UTC' where inicio is null;

-- Fichas: 1 cada 40 de Exp ganada desde que abre el evento, día por día (UTC), hasta 12 por día.
create or replace function public._fichas_ganadas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(least(12, floor(d.xp / 40.0)::integer)), 0)::integer
  from (
    select (x.created_at at time zone 'UTC')::date as dia, sum(x.xp) as xp
    from public.eventos e
    cross join lateral (
      select a.created_at, a.xp from public.attempts a
      where a.user_id = p_user and a.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
      union all
      select la.created_at, la.xp from public.logic_attempts la
      where la.user_id = p_user and la.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
    ) x
    where e.slug = p_evento and (x.created_at at time zone 'UTC')::date <= e.hasta
    group by 1
  ) d;
$$;
revoke execute on function public._fichas_ganadas(uuid, text) from public, anon, authenticated;

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
  if now() < coalesce(v_e.inicio, v_e.desde::timestamp at time zone 'UTC') or current_date > v_e.cierre then
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

-- ---------- 2) Calendario ----------
create or replace function public.reclamar_calendario()
returns table (dia smallint, premio text, cantidad integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_estado record;
  v_premio record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  -- Un pedido a la vez por persona (teléfono y web al mismo tiempo): el segundo espera
  -- y ya ve el premio reclamado.
  perform 1 from public.profiles pr where pr.id = v_user for update;
  select * into v_estado from public.mi_calendario();
  if v_estado.reclamado_hoy then
    raise exception 'ya reclamaste el premio de hoy';
  end if;
  if not v_estado.puede_reclamar then
    raise exception 'juega una partida hoy para reclamar';
  end if;
  select * into v_premio from public.premios_calendario() p where p.dia = v_estado.dia;

  insert into public.calendario_usuario as c (user_id, dia, ultima_fecha)
  values (v_user, v_estado.dia, current_date)
  on conflict (user_id) do update set dia = excluded.dia, ultima_fecha = excluded.ultima_fecha;

  if v_premio.premio = 'chispas' then
    perform public._dar_chispas(v_user, v_premio.cantidad);
  elsif v_premio.premio = 'hielo' then
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'tiempo_extra' then
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'estrellas' then
    perform public._sumar_estrellas(v_user, public._ciudad_favorita(v_user), v_premio.cantidad, 'calendario:' || current_date);
  end if;
  -- El día 7 también da 10 Cometas (0280).
  if v_estado.dia = 7 then
    perform public._dar_cometas(v_user, 10, 'calendario', 'calendario:' || current_date);
  end if;

  return query select v_estado.dia, v_premio.premio, v_premio.cantidad, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
grant execute on function public.reclamar_calendario() to authenticated;

-- ---------- 3) Cápsulas: tipos nuevos y nunca menos de 100 Chispas ----------
alter table public.capsulas_usuario drop constraint if exists capsulas_usuario_tipo_check;
alter table public.capsulas_usuario add constraint capsulas_usuario_tipo_check
  check (tipo in ('diaria', 'misiones', 'racha', 'nivel', 'ciudad', 'liga', 'liga_bronce', 'liga_plata', 'liga_oro', 'coleccion', 'pro', 'estelar', 'supernova', 'plata', 'oro', 'prisma', 'alineacion'));

create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 100, 140),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 100, 140),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 120, 220),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 100, 160),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 100, 180),
    ('liga_bronce', 'chispas', 60, 150, 260),
    ('liga_bronce', 'cosmetico_raro', 40, 1, 1),
    ('liga_plata', 'cosmetico_raro', 60, 1, 1),
    ('liga_plata', 'cosmetico_epico', 40, 1, 1),
    ('liga_oro', 'cosmetico_epico', 60, 1, 1),
    ('liga_oro', 'cosmetico_legendario', 40, 1, 1),
    ('coleccion', 'marco_coleccion', 100, 1, 1),
    ('pro', 'cosmetico_epico', 55, 1, 1),
    ('pro', 'cosmetico_legendario', 30, 1, 1),
    ('pro', 'chispas', 15, 150, 300),
    ('estelar', 'cosmetico_raro', 50, 1, 1),
    ('estelar', 'cosmetico_epico', 40, 1, 1),
    ('estelar', 'cosmetico_legendario', 10, 1, 1),
    ('supernova', 'cosmetico_epico', 60, 1, 1),
    ('supernova', 'cosmetico_legendario', 40, 1, 1),
    ('plata', 'chispas', 40, 150, 260),
    ('plata', 'cosmetico_comun', 30, 1, 1),
    ('plata', 'cosmetico_raro', 30, 1, 1),
    ('oro', 'cosmetico_raro', 50, 1, 1),
    ('oro', 'cosmetico_epico', 35, 1, 1),
    ('oro', 'chispas', 15, 250, 400),
    ('prisma', 'cosmetico_epico', 60, 1, 1),
    ('prisma', 'cosmetico_legendario', 40, 1, 1),
    ('alineacion', 'cosmetico_epico', 70, 1, 1),
    ('alineacion', 'cosmetico_legendario', 30, 1, 1)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;
grant execute on function public.contenido_capsula(text) to anon, authenticated;

create or replace function public.abrir_capsula(p_id uuid)
returns table (premio text, slug text, nombre text, rareza text, cantidad integer, convertido boolean, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cap public.capsulas_usuario%rowtype;
  v_sin_raro smallint;
  v_total integer;
  v_r numeric;
  v_acum integer := 0;
  v_fila record;
  v_premio text;
  v_min integer := 0;
  v_max integer := 0;
  v_item public.catalogo_cosmeticos%rowtype;
  v_slug text;
  v_nombre text;
  v_rareza text;
  v_cantidad integer := 0;
  v_convertido boolean := false;
  v_nuevo_raro boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_cap from public.capsulas_usuario c where c.id = p_id and c.user_id = v_user for update;
  if not found then
    raise exception 'capsula no encontrada';
  end if;
  if v_cap.abierta_at is not null then
    raise exception 'esta capsula ya se abrio';
  end if;

  select pr.capsulas_sin_raro into v_sin_raro from public.profiles pr where pr.id = v_user for update;

  -- Sorteo con los pesos de contenido_capsula().
  select sum(cc.peso) into v_total from public.contenido_capsula(v_cap.tipo) cc;
  v_r := random() * v_total;
  for v_fila in select * from public.contenido_capsula(v_cap.tipo) loop
    v_acum := v_acum + v_fila.peso;
    if v_r < v_acum then
      v_premio := v_fila.premio;
      v_min := v_fila.minimo;
      v_max := v_fila.maximo;
      exit;
    end if;
  end loop;

  -- Garantía: 10 seguidas sin nada raro → la siguiente trae un cosmético raro.
  if coalesce(v_sin_raro, 0) >= 10 and v_premio not in ('cosmetico_raro', 'cosmetico_epico', 'cosmetico_legendario', 'coleccion', 'marco_coleccion') then
    v_premio := 'cosmetico_raro';
  end if;

  if v_premio = 'chispas' then
    v_cantidad := v_min + (floor(random() * (((v_max - v_min) / 5) + 1))::integer * 5);
    perform public._dar_chispas(v_user, v_cantidad);
  elsif v_premio = 'hielo' then
    v_cantidad := 1;
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'tiempo_extra' then
    v_cantidad := 1;
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'escudo' then
    v_cantidad := 1;
    update public.profiles as pr set escudos_extra_pendientes = pr.escudos_extra_pendientes + 1 where pr.id = v_user;
  elsif v_premio like 'cosmetico_%' then
    select * into v_item from public.catalogo_cosmeticos c
    where c.en_capsulas and c.rareza = replace(v_premio, 'cosmetico_', '')
    order by random() limit 1;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    if public._tiene_cosmetico(v_user, v_item.slug) then
      v_convertido := true;
      v_cantidad := greatest(100, v_item.precio / 3);
      perform public._dar_chispas(v_user, v_cantidad);
    else
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := v_item.rareza <> 'comun';
    end if;
  elsif v_premio = 'coleccion' then
    -- Una pieza de la colección de esa ciudad que todavía no tengas
    -- (estela y efecto pesan 40, el título 20). Si ya tienes todas: Chispas.
    select * into v_item from public.catalogo_cosmeticos c
    where c.mundo = v_cap.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) / (case c.categoria when 'titulo' then 20 else 40 end)
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := true;
    else
      v_premio := 'chispas';
      v_cantidad := 300 + (floor(random() * 61)::integer * 5);
      perform public._dar_chispas(v_user, v_cantidad);
    end if;
  elsif v_premio = 'marco_coleccion' then
    select * into v_item from public.catalogo_cosmeticos c where c.slug = 'marco_coleccion_' || v_cap.mundo;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    perform public._dar_cosmetico(v_user, v_item.slug);
    v_nuevo_raro := true;
  end if;

  update public.profiles as pr
  set capsulas_sin_raro = case when v_nuevo_raro then 0 else least(pr.capsulas_sin_raro + 1, 100) end
  where pr.id = v_user;

  update public.capsulas_usuario as c
  set abierta_at = now(),
      premio = jsonb_build_object('premio', v_premio, 'slug', v_slug, 'nombre', v_nombre, 'rareza', v_rareza, 'cantidad', v_cantidad, 'convertido', v_convertido)
  where c.id = p_id;

  return query select v_premio, v_slug, v_nombre, v_rareza, v_cantidad, v_convertido, pr.puntos_total
    from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.abrir_capsula(uuid) from public, anon;
grant execute on function public.abrir_capsula(uuid) to authenticated;

-- ---------- 4) Fusión de cápsulas ----------
-- Nivel de cada tipo para fusionar (null = no se fusiona: ciudad, colección, Pro,
-- las de Cometas, prisma, liga_oro y la de la Alineación).
create or replace function public.nivel_fusion_capsula(p_tipo text)
returns integer
language sql
immutable
as $$
  select case
    when p_tipo in ('diaria', 'misiones', 'nivel', 'liga') then 1
    when p_tipo in ('racha', 'liga_bronce', 'plata') then 2
    when p_tipo in ('liga_plata', 'oro') then 3
    else null
  end;
$$;
grant execute on function public.nivel_fusion_capsula(text) to anon, authenticated;

create or replace function public.fusionar_capsulas(p_ids uuid[])
returns table (id uuid, tipo text, costo integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cuantas integer;
  v_min integer;
  v_max integer;
  v_costo integer;
  v_destino text;
  v_puntos integer;
  v_nueva uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if coalesce(array_length(p_ids, 1), 0) <> 3 or (select count(distinct x) from unnest(p_ids) x) <> 3 then
    raise exception 'elige 3 capsulas';
  end if;
  perform 1 from public.profiles pr where pr.id = v_user for update;
  perform 1 from public.capsulas_usuario c where c.id = any(p_ids) and c.user_id = v_user for update;
  select count(*)::integer, min(public.nivel_fusion_capsula(c.tipo)), max(public.nivel_fusion_capsula(c.tipo))
    into v_cuantas, v_min, v_max
  from public.capsulas_usuario c
  where c.id = any(p_ids) and c.user_id = v_user and c.abierta_at is null;
  if v_cuantas <> 3 then
    raise exception 'esa capsula ya no esta disponible';
  end if;
  if v_min is null or v_min <> v_max then
    raise exception 'las 3 capsulas deben ser del mismo nivel';
  end if;
  v_costo := case v_min when 1 then 50 when 2 then 150 else 400 end;
  v_destino := case v_min when 1 then 'plata' when 2 then 'oro' else 'prisma' end;
  select pr.puntos_total into v_puntos from public.profiles pr where pr.id = v_user;
  if coalesce(v_puntos, 0) < v_costo then
    raise exception 'te faltan Chispas para fusionar';
  end if;
  update public.profiles as pr set puntos_total = pr.puntos_total - v_costo where pr.id = v_user;
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
  values (v_user, v_destino, null, 'fusion:' || gen_random_uuid(), jsonb_build_object('fusion', to_jsonb(p_ids)))
  returning capsulas_usuario.id into v_nueva;
  update public.capsulas_usuario as c
  set abierta_at = now(), premio = jsonb_build_object('premio', 'fusion', 'destino', v_nueva)
  where c.id = any(p_ids);
  return query select v_nueva, v_destino, v_costo, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.fusionar_capsulas(uuid[]) from public, anon;
grant execute on function public.fusionar_capsulas(uuid[]) to authenticated;

-- ---------- 5) Gran Alineación ----------
-- Número de la última Alineación que ya empezó (1 = la del 24/10/2026; 0 = ninguna).
create or replace function public.numero_alineacion(p_ts timestamptz default now())
returns integer
language sql
immutable
as $$
  select case when p_ts < timestamptz '2026-10-24 23:00:00+00' then 0
    else floor(extract(epoch from (p_ts - timestamptz '2026-10-24 23:00:00+00')) / (672 * 3600))::integer + 1 end;
$$;
grant execute on function public.numero_alineacion(timestamptz) to anon, authenticated;

create table if not exists public.alineacion_jugadores (
  user_id uuid not null references public.profiles(id) on delete cascade,
  numero integer not null,
  partidas integer not null default 0,
  respuestas integer not null default 0,
  xp integer not null default 0,
  chispas integer not null default 0,
  primera_at timestamptz not null default now(),
  primary key (user_id, numero)
);

create table if not exists public.alineacion_comunidad (
  numero integer primary key,
  respuestas bigint not null default 0,
  meta integer not null,
  lograda_at timestamptz
);

create table if not exists public.alineacion_sellos (
  user_id uuid not null references public.profiles(id) on delete cascade,
  numero integer not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, numero)
);

create table if not exists public.alineacion_premio_comunidad (
  user_id uuid not null references public.profiles(id) on delete cascade,
  numero integer not null,
  chispas integer not null,
  creado_at timestamptz not null default now(),
  primary key (user_id, numero)
);

alter table public.alineacion_jugadores enable row level security;
alter table public.alineacion_comunidad enable row level security;
alter table public.alineacion_sellos enable row level security;
alter table public.alineacion_premio_comunidad enable row level security;
drop policy if exists "mi alineacion" on public.alineacion_jugadores;
create policy "mi alineacion" on public.alineacion_jugadores for select using (auth.uid() = user_id);
drop policy if exists "comunidad visible" on public.alineacion_comunidad;
create policy "comunidad visible" on public.alineacion_comunidad for select using (true);
drop policy if exists "sellos visibles" on public.alineacion_sellos;
create policy "sellos visibles" on public.alineacion_sellos for select using (true);
drop policy if exists "mi premio comunidad" on public.alineacion_premio_comunidad;
create policy "mi premio comunidad" on public.alineacion_premio_comunidad for select using (auth.uid() = user_id);
grant select on public.alineacion_comunidad, public.alineacion_sellos to anon, authenticated;
grant select on public.alineacion_jugadores, public.alineacion_premio_comunidad to authenticated;

-- Meta de comunidad: 40 respuestas por cada jugador activo de la última semana (mínimo 500).
create or replace function public._meta_comunidad_alineacion()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(500, 40 * (select count(distinct d.user_id) from public.daily_progress d where d.fecha >= current_date - 7))::integer;
$$;
revoke execute on function public._meta_comunidad_alineacion() from public, anon, authenticated;

-- Lo llama registrar_xp_diario al cerrar cada partida durante la Alineación.
create or replace function public._partida_en_alineacion(p_user uuid, p_respuestas integer, p_xp integer, p_chispas integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer := public.numero_alineacion();
  v_partidas integer;
  v_total bigint;
  v_meta integer;
begin
  if v_num < 1 or coalesce(p_respuestas, 0) <= 0 then
    return;
  end if;
  insert into public.alineacion_jugadores as j (user_id, numero, partidas, respuestas, xp, chispas)
  values (p_user, v_num, case when p_respuestas >= 5 then 1 else 0 end, p_respuestas, coalesce(p_xp, 0), coalesce(p_chispas, 0))
  on conflict (user_id, numero) do update
    set partidas = j.partidas + case when p_respuestas >= 5 then 1 else 0 end,
        respuestas = j.respuestas + p_respuestas,
        xp = j.xp + coalesce(p_xp, 0),
        chispas = j.chispas + coalesce(p_chispas, 0)
  returning j.partidas into v_partidas;

  insert into public.alineacion_comunidad (numero, meta) values (v_num, public._meta_comunidad_alineacion())
  on conflict (numero) do nothing;
  update public.alineacion_comunidad as c set respuestas = c.respuestas + p_respuestas
  where c.numero = v_num
  returning c.respuestas, c.meta into v_total, v_meta;
  if v_total >= v_meta then
    update public.alineacion_comunidad as c set lograda_at = now() where c.numero = v_num and c.lograda_at is null;
  end if;

  if v_partidas >= 1 then
    insert into public.alineacion_sellos (user_id, numero) values (p_user, v_num) on conflict do nothing;
  end if;
  if v_partidas >= 3 then
    insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
    values (p_user, 'alineacion', null, 'alineacion:' || v_num, jsonb_build_object('numero', v_num))
    on conflict (user_id, origen) do nothing;
  end if;
end;
$$;
revoke execute on function public._partida_en_alineacion(uuid, integer, integer, integer) from public, anon, authenticated;

create or replace function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer,
  nivel_cuenta_subio boolean,
  nivel_cuenta_nuevo integer,
  nivel_cuenta_bonus integer,
  chispas_partida integer,
  cometas_nivel integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_real_hoy integer;
  v_ya_hoy integer;
  v_por_acreditar integer;
  v_puntos_total integer;
  v_desde timestamptz := date_trunc('day', now());
  v_nivel_subio boolean := false;
  v_nivel_nuevo integer;
  v_nivel_antes integer;
  v_bonus_nivel integer := 0;
  v_marca timestamptz;
  v_boost numeric;
  v_respuestas integer;
  v_aciertos integer;
  v_ultima timestamptz;
  v_doble boolean;
  v_chispas integer := 0;
  v_cometas integer := 0;
  v_n integer;
  v_xp_partida integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.chispas_partida_hasta, pr.nivel_cuenta, coalesce(pr.boost_multiplicador_pendiente, 1)
    into v_marca, v_nivel_antes, v_boost
  from public.profiles pr where pr.id = v_user for update;

  -- Chispas de la partida: lo respondido desde el último cierre.
  with nuevos as (
    select a.created_at, a.xp, public.mundo_de_problem_type(a.problem_type) as mundo
    from public.attempts a where a.user_id = v_user and a.created_at > v_marca
    union all
    select la.created_at, la.xp, 'enigmia'
    from public.logic_attempts la where la.user_id = v_user and la.created_at > v_marca
  )
  select count(*)::integer, (count(*) filter (where n.xp > 0))::integer, max(n.created_at),
         coalesce(bool_or(n.mundo = public.mundo_doble_experiencia(current_date)), false),
         coalesce(sum(n.xp), 0)::integer
    into v_respuestas, v_aciertos, v_ultima, v_doble, v_xp_partida
  from nuevos n;

  if v_respuestas > 0 then
    v_chispas := least(v_respuestas, 10) + least(v_aciertos, 20);
    if v_doble or public.en_gran_alineacion() then
      v_chispas := v_chispas * 2;
    end if;
    if v_boost > 1 then
      v_chispas := round(v_chispas * v_boost)::integer;
    end if;
    -- Pro: +25 % de Chispas al jugar (0286). La Experiencia no cambia (no da ventaja
    -- en ligas ni rankings).
    if exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro') then
      v_chispas := round(v_chispas * 1.25)::integer;
    end if;
    update public.profiles as pr
    set puntos_total = pr.puntos_total + v_chispas,
        chispas_partida_hasta = v_ultima
    where pr.id = v_user;
    -- Gran Alineación (0290): cuenta la partida, el sello, la cápsula y la meta de comunidad.
    if public.en_gran_alineacion() then
      perform public._partida_en_alineacion(v_user, v_respuestas, v_xp_partida, v_chispas);
    end if;
  end if;

  -- Experiencia del día (igual que 0156).
  v_real_hoy :=
    (select coalesce(sum(a.xp)::integer, 0) from public.attempts a
      where a.user_id = v_user and a.created_at >= v_desde)
    + (select coalesce(sum(la.xp)::integer, 0) from public.logic_attempts la
      where la.user_id = v_user and la.created_at >= v_desde);

  select coalesce(xp_ganado, 0) into v_ya_hoy
  from public.daily_progress where user_id = v_user and fecha = current_date;

  v_por_acreditar := greatest(0, v_real_hoy - coalesce(v_ya_hoy, 0));

  if v_por_acreditar > 0 then
    insert into public.daily_progress (user_id, fecha, xp_ganado)
    values (v_user, current_date, v_por_acreditar)
    on conflict (user_id, fecha)
    do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
    returning public.daily_progress.xp_ganado into v_xp_hoy;

    select acc.nivel_subio, acc.nivel_nuevo, acc.bonus_nivel
      into v_nivel_subio, v_nivel_nuevo, v_bonus_nivel
      from public.acreditar_chispas(v_user, v_por_acreditar) acc;

    if v_nivel_subio then
      for v_n in (coalesce(v_nivel_antes, 1) + 1)..v_nivel_nuevo loop
        v_cometas := v_cometas + public.cometas_nivel_cuenta(v_n);
      end loop;
    end if;
  else
    select coalesce(xp_ganado, 0) into v_xp_hoy
    from public.daily_progress where user_id = v_user and fecha = current_date;
    v_xp_hoy := coalesce(v_xp_hoy, 0);
    select nivel_cuenta into v_nivel_nuevo from public.profiles where id = v_user;
  end if;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta,
    v_nivel_subio, coalesce(v_nivel_nuevo, 1), v_bonus_nivel, v_chispas, v_cometas;
end;
$$;
grant execute on function public.registrar_xp_diario(integer) to authenticated;

-- Estado para la web y la app: la Alineación en curso (o la última / la próxima), lo
-- que jugaste en ella, tus premios y la meta de comunidad.
create or replace function public.estado_alineacion()
returns table (
  numero integer,
  en_curso boolean,
  inicio timestamptz,
  fin timestamptz,
  partidas integer,
  respuestas integer,
  xp integer,
  chispas integer,
  sello boolean,
  capsula boolean,
  comunidad_respuestas bigint,
  comunidad_meta integer,
  comunidad_lograda boolean,
  premio_comunidad boolean,
  sellos integer[]
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_num integer := greatest(1, public.numero_alineacion());
  v_inicio timestamptz := timestamptz '2026-10-24 23:00:00+00' + (v_num - 1) * interval '672 hours';
  v_j public.alineacion_jugadores%rowtype;
  v_c public.alineacion_comunidad%rowtype;
begin
  select * into v_j from public.alineacion_jugadores j where j.user_id = v_user and j.numero = v_num;
  select * into v_c from public.alineacion_comunidad c where c.numero = v_num;
  return query select
    v_num,
    public.en_gran_alineacion(),
    v_inicio,
    v_inicio + interval '3 hours',
    coalesce(v_j.partidas, 0),
    coalesce(v_j.respuestas, 0),
    coalesce(v_j.xp, 0),
    coalesce(v_j.chispas, 0),
    exists (select 1 from public.alineacion_sellos s where s.user_id = v_user and s.numero = v_num),
    exists (select 1 from public.capsulas_usuario cu where cu.user_id = v_user and cu.origen = 'alineacion:' || v_num),
    coalesce(v_c.respuestas, 0),
    coalesce(v_c.meta, public._meta_comunidad_alineacion()),
    coalesce(v_c.respuestas >= v_c.meta, false),
    exists (select 1 from public.alineacion_premio_comunidad p where p.user_id = v_user and p.numero = v_num),
    coalesce((select array_agg(s.numero order by s.numero) from public.alineacion_sellos s where s.user_id = v_user), array[]::integer[]);
end;
$$;
revoke execute on function public.estado_alineacion() from public, anon;
grant execute on function public.estado_alineacion() to authenticated;

-- Premio de la meta de comunidad: 300 Chispas a cada uno que jugó al menos una partida,
-- una vez, hasta que empiece la Alineación siguiente.
create or replace function public.reclamar_premio_comunidad_alineacion()
returns table (chispas integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_num integer := public.numero_alineacion();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  perform 1 from public.profiles pr where pr.id = v_user for update;
  if not exists (select 1 from public.alineacion_comunidad c where c.numero = v_num and c.respuestas >= c.meta) then
    raise exception 'la meta de comunidad no se cumplio';
  end if;
  if not exists (select 1 from public.alineacion_jugadores j where j.user_id = v_user and j.numero = v_num and j.partidas >= 1) then
    raise exception 'juega una partida durante la Alineacion';
  end if;
  insert into public.alineacion_premio_comunidad (user_id, numero, chispas) values (v_user, v_num, 300)
  on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste este premio';
  end if;
  perform public._dar_chispas(v_user, 300);
  return query select 300, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.reclamar_premio_comunidad_alineacion() from public, anon;
grant execute on function public.reclamar_premio_comunidad_alineacion() to authenticated;

-- Sellos de cualquier jugador (para su Placa).
create or replace function public.sellos_alineacion_de(p_user uuid)
returns integer[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(s.numero order by s.numero), array[]::integer[]) from public.alineacion_sellos s where s.user_id = p_user;
$$;
grant execute on function public.sellos_alineacion_de(uuid) to anon, authenticated;

-- ---------- 6) Anuncio de la primera Alineación ----------
insert into public.anuncios (tipo, titulo, descripcion, fecha)
select 'evento', 'La Gran Alineación', 'Hoy, de 18:00 a 21:00 (hora de Colombia), las 15 ciudades amanecen juntas. Exp ×2, Chispas ×2 y constelaciones ×2. Juega una partida para ganar el sello «Testigo de la Alineación #1», tres para la Cápsula de la Alineación, y entre todos llenen la meta de comunidad: 300 Chispas para cada uno que jugó.', '2026-10-24'
where not exists (select 1 from public.anuncios a where a.titulo = 'La Gran Alineación' and a.fecha = '2026-10-24');

notify pgrst, 'reload schema';
