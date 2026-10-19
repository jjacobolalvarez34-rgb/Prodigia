-- ============================================================
-- Prodigia — Que el evento se sienta en toda la app (0292).
--
-- Diseño aprobado el 2026-10-19 (PLAN_FESTIVIDADES.md §6, PARIDAD_EVENTOS.md,
-- src/lib/temas/celebracion.ts). Lo que necesita la base:
--   1) Día especial del evento: en Halloween, el 31 («La noche del esqueleto») la
--      experiencia de Anatomía cuenta doble para las fichas y el tope del día es 24.
--      Genérico: eventos.dia_doble + eventos.mundo_doble.
--   2) Rankeds: cada ranked ganada durante el evento da 3 fichas (cuentan hasta 5
--      por día). Se calcula de los duelos ya guardados; no cambia el duelo.
--   3) Amigos: dar_dulce(p_amigo), una vez al día, a un amigo: los dos ganan 1 ficha
--      (de los recibidos cuentan hasta 5 por día).
--   4) Emote exclusivo «Baile de esqueletos» (animado), 8.ª pieza de Halloween: se usa
--      en las Rankeds y en los duelos.
--   _fichas_ganadas suma todo; estado_evento y el canje ya la usan.
-- Requiere 0289 y 0290. Idempotente.
-- ============================================================

-- ---------- 1) Día especial ----------
alter table public.eventos add column if not exists dia_doble date;
alter table public.eventos add column if not exists mundo_doble text;
update public.eventos set dia_doble = hasta, mundo_doble = 'anatomia' where tema = 'halloween';

-- ---------- 3) Dulces entre amigos ----------
create table if not exists public.dulces_amigos (
  de uuid not null references public.profiles(id) on delete cascade,
  para uuid not null references public.profiles(id) on delete cascade,
  evento text not null references public.eventos(slug) on delete cascade,
  dia date not null default ((now() at time zone 'UTC')::date),
  creado_at timestamptz not null default now(),
  primary key (de, evento, dia),
  check (de <> para)
);
create index if not exists dulces_amigos_para_idx on public.dulces_amigos (para, evento, dia);
alter table public.dulces_amigos enable row level security;
drop policy if exists "ves tus dulces" on public.dulces_amigos;
create policy "ves tus dulces" on public.dulces_amigos for select using (de = auth.uid() or para = auth.uid());

-- ---------- 2) Rankeds ganadas durante el evento ----------
-- Una serie cuenta si ganaste más de la mitad de sus rondas; un duelo suelto, si lo
-- ganaste. Hasta 5 por día.
create or replace function public._ranked_ganadas_evento(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with e as (select * from public.eventos where slug = p_evento),
  rondas as (
    select coalesce(d.serie_id, d.id) as k, (d.creado_at at time zone 'UTC')::date as dia, d.ronda_total as rt, (d.ganador_id = p_user)::integer as g
    from public.duels d, e
    where d.clasificatorio
      and d.estado = 'completado'
      and (d.retador_id = p_user or d.retado_id = p_user)
      and d.creado_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
      and (d.creado_at at time zone 'UTC')::date <= e.hasta
  ),
  ganadas as (
    select r.k, min(r.dia) as dia from rondas r group by r.k having sum(r.g) * 2 > max(r.rt)
  )
  select coalesce(sum(least(5, t.n)), 0)::integer from (select count(*) as n from ganadas group by dia) t;
$$;
revoke execute on function public._ranked_ganadas_evento(uuid, text) from public, anon, authenticated;

-- ---------- Fichas: todo junto ----------
create or replace function public._fichas_ganadas(p_user uuid, p_evento text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with e as (select * from public.eventos where slug = p_evento),
  x as (
    select a.created_at, a.xp, a.problem_type as tipo from public.attempts a, e
    where a.user_id = p_user and a.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
    union all
    select la.created_at, la.xp, 'enigmia' as tipo from public.logic_attempts la, e
    where la.user_id = p_user and la.created_at >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC')
  ),
  dias as (
    select (x.created_at at time zone 'UTC')::date as dia,
      sum(x.xp * case when (x.created_at at time zone 'UTC')::date = e.dia_doble and x.tipo like e.mundo_doble || '%' then 2 else 1 end) as xp
    from x, e
    where (x.created_at at time zone 'UTC')::date <= e.hasta
    group by 1
  )
  select coalesce((
    select coalesce((select sum(least(case when d.dia = e2.dia_doble then 24 else 12 end, floor(d.xp / 40.0)::integer)) from dias d, e e2), 0)
      + 3 * public._ranked_ganadas_evento(p_user, p_evento)
      + coalesce((select count(*) from public.dulces_amigos da where da.de = p_user and da.evento = p_evento), 0)
      + coalesce((select sum(least(5, r.n)) from (select count(*) as n from public.dulces_amigos da where da.para = p_user and da.evento = p_evento group by da.dia) r), 0)
    from e
  ), 0)::integer;
$$;
revoke execute on function public._fichas_ganadas(uuid, text) from public, anon, authenticated;

-- Da un dulce a un amigo: una vez al día; los dos ganan 1 ficha del evento abierto.
create or replace function public.dar_dulce(p_amigo uuid)
returns table (evento text, saldo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_evento text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select e.slug into v_evento from public.eventos e
  where now() >= coalesce(e.inicio, e.desde::timestamp at time zone 'UTC') and (now() at time zone 'UTC')::date <= e.hasta
  order by e.desde desc
  limit 1;
  if v_evento is null then
    raise exception 'no hay un evento abierto';
  end if;
  if not exists (
    select 1 from public.friendships f
    where f.estado = 'aceptada'
      and ((f.user_id = v_user and f.friend_id = p_amigo) or (f.user_id = p_amigo and f.friend_id = v_user))
  ) then
    raise exception 'solo puedes darle un dulce a un amigo';
  end if;
  insert into public.dulces_amigos (de, para, evento) values (v_user, p_amigo, v_evento) on conflict do nothing;
  if not found then
    raise exception 'ya diste tu dulce de hoy';
  end if;
  return query select v_evento,
    greatest(0, public._fichas_ganadas(v_user, v_evento) - coalesce((select sum(c.fichas) from public.fichas_canjes c where c.user_id = v_user and c.evento = v_evento), 0))::integer;
end;
$$;
revoke execute on function public.dar_dulce(uuid) from public, anon;
grant execute on function public.dar_dulce(uuid) to authenticated;

-- ---------- 4) Emote exclusivo «Baile de esqueletos» ----------
insert into public.catalogo_cosmeticos (slug, categoria, valor, nombre, rareza, precio, vendible, en_capsulas, mundo, temporada) values
  ('emote_evento_esqueletos', 'emote', 'evento_esqueletos', 'Baile de esqueletos', 'epico', 3000, false, false, null, null)
on conflict (slug) do update set categoria = excluded.categoria, valor = excluded.valor, nombre = excluded.nombre, rareza = excluded.rareza, precio = excluded.precio, vendible = excluded.vendible, en_capsulas = excluded.en_capsulas;

insert into public.eventos_piezas (evento, item, fichas, cometas)
select e.slug, 'emote_evento_esqueletos', 30, 300 from public.eventos e where e.tema = 'halloween'
on conflict (evento, item) do update set fichas = excluded.fichas, cometas = excluded.cometas;
