-- ============================================================
-- Prodigia — Fondos de chat (migración 0262, pedido del usuario 2026-10-08).
--
-- «Que se le pueda poner fondo a los chats, que aparezca en ambos chats, pero
-- que eso cueste Chispas.»
--
--  - profiles.fondos_chat_desbloqueados: los fondos que compró cada uno.
--  - fondos_chat_conversacion: el fondo puesto en cada conversación (un par de
--    usuarios, guardado en orden para que sea una sola fila). Lo ven los dos.
--  - comprar_fondo_chat(p_fondo): descuenta las Chispas y lo desbloquea.
--  - poner_fondo_chat(p_amigo, p_fondo): cualquiera de los dos pone uno de SUS
--    fondos (o 'ninguno' para sacarlo).
--  - fondo_chat(p_amigo): el fondo de esa conversación.
-- Los precios son el espejo de src/lib/mensajes/fondosChat.ts (un test los
-- compara). Sin GRANT UPDATE: todo pasa por las funciones. Idempotente.
-- ============================================================

alter table public.profiles
  add column if not exists fondos_chat_desbloqueados text[] not null default '{}';

create table if not exists public.fondos_chat_conversacion (
  usuario_a uuid not null references public.profiles (id) on delete cascade,
  usuario_b uuid not null references public.profiles (id) on delete cascade,
  fondo text not null,
  puesto_por uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (usuario_a, usuario_b),
  check (usuario_a < usuario_b)
);

alter table public.fondos_chat_conversacion enable row level security;
drop policy if exists "los dos ven el fondo de su chat" on public.fondos_chat_conversacion;
create policy "los dos ven el fondo de su chat" on public.fondos_chat_conversacion
  for select using (auth.uid() = usuario_a or auth.uid() = usuario_b);
grant select on public.fondos_chat_conversacion to authenticated;

create or replace function public._precio_fondo_chat(p_fondo text)
returns integer
language sql
immutable
as $$
  select case p_fondo
    when 'cuadriculado' then 300
    when 'estrellas' then 300
    when 'oceano' then 400
    when 'bosque' then 400
    when 'atardecer' then 500
    when 'aurora' then 500
    when 'neon' then 700
    when 'galaxia' then 900
  end;
$$;

create or replace function public.comprar_fondo_chat(p_fondo text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_precio integer := public._precio_fondo_chat(p_fondo);
  v_saldo integer;
  v_tiene text[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_precio is null then
    raise exception 'fondo inexistente';
  end if;
  select pr.puntos_total, pr.fondos_chat_desbloqueados into v_saldo, v_tiene
  from public.profiles pr where pr.id = v_user for update;
  if p_fondo = any(v_tiene) then
    raise exception 'ya tienes ese fondo';
  end if;
  if coalesce(v_saldo, 0) < v_precio then
    raise exception 'chispas insuficientes';
  end if;
  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_precio,
      fondos_chat_desbloqueados = array_append(pr.fondos_chat_desbloqueados, p_fondo)
  where pr.id = v_user
  returning pr.puntos_total into v_saldo;
  return v_saldo;
end;
$$;

create or replace function public.poner_fondo_chat(p_amigo uuid, p_fondo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_a uuid;
  v_b uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_amigo is null or p_amigo = v_user or not exists (select 1 from public.profiles pr where pr.id = p_amigo) then
    raise exception 'conversacion invalida';
  end if;
  v_a := least(v_user, p_amigo);
  v_b := greatest(v_user, p_amigo);
  if p_fondo = 'ninguno' then
    delete from public.fondos_chat_conversacion where usuario_a = v_a and usuario_b = v_b;
    return;
  end if;
  if not exists (select 1 from public.profiles pr where pr.id = v_user and p_fondo = any(pr.fondos_chat_desbloqueados)) then
    raise exception 'fondo no desbloqueado';
  end if;
  insert into public.fondos_chat_conversacion (usuario_a, usuario_b, fondo, puesto_por, updated_at)
  values (v_a, v_b, p_fondo, v_user, now())
  on conflict (usuario_a, usuario_b) do update set fondo = excluded.fondo, puesto_por = excluded.puesto_por, updated_at = now();
end;
$$;

create or replace function public.fondo_chat(p_amigo uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select f.fondo from public.fondos_chat_conversacion f
  where f.usuario_a = least(auth.uid(), p_amigo) and f.usuario_b = greatest(auth.uid(), p_amigo);
$$;

revoke all on function public.comprar_fondo_chat(text) from public, anon;
revoke all on function public.poner_fondo_chat(uuid, text) from public, anon;
revoke all on function public.fondo_chat(uuid) from public, anon;
grant execute on function public.comprar_fondo_chat(text) to authenticated;
grant execute on function public.poner_fondo_chat(uuid, text) to authenticated;
grant execute on function public.fondo_chat(uuid) to authenticated;
