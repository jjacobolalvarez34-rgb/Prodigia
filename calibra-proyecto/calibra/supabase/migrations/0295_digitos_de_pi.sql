-- ============================================================
-- Prodigia — Minievento del Día de π: «Dígitos de π» (0295).
--
-- Pedido del usuario (2026-10-19): quien escriba más dígitos de π en 1 minuto gana.
-- Se juega siempre (como práctica); el 14 de marzo es el evento: la tabla del día y el
-- título «Irracional» para quien pase de 31 dígitos ese día. La partida se valida en el
-- cliente con los decimales de src/lib/pi.ts; acá se guarda la mejor marca del día
-- (con un tope razonable para 60 segundos).
-- Idempotente.
-- ============================================================

create table if not exists public.pi_marcas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia date not null default ((now() at time zone 'UTC')::date),
  digitos integer not null check (digitos between 0 and 400),
  creado_at timestamptz not null default now(),
  primary key (user_id, dia)
);
create index if not exists pi_marcas_dia_idx on public.pi_marcas (dia, digitos desc);
alter table public.pi_marcas enable row level security;
drop policy if exists "pi marcas visibles" on public.pi_marcas;
create policy "pi marcas visibles" on public.pi_marcas for select using (true);

create or replace function public.guardar_digitos_pi(p_digitos integer)
returns table (mejor integer, titulo boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_dia date := (now() at time zone 'UTC')::date;
  v_titulo boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_digitos is null or p_digitos < 0 then
    raise exception 'marca invalida';
  end if;
  insert into public.pi_marcas (user_id, dia, digitos) values (v_user, v_dia, least(400, p_digitos))
  on conflict (user_id, dia) do update set digitos = greatest(public.pi_marcas.digitos, excluded.digitos), creado_at = now();
  -- Día de π: el título «Irracional» desde 31 dígitos.
  if extract(month from v_dia) = 3 and extract(day from v_dia) = 14 and p_digitos >= 31 then
    perform public.desbloquear_titulo(v_user, 'irracional', 'Irracional', 'evento');
    v_titulo := true;
  end if;
  return query select pm.digitos, v_titulo from public.pi_marcas pm where pm.user_id = v_user and pm.dia = v_dia;
end;
$$;
revoke execute on function public.guardar_digitos_pi(integer) from public, anon;
grant execute on function public.guardar_digitos_pi(integer) to authenticated;

create or replace function public.tabla_pi_hoy()
returns table (nombre text, digitos integer, yo boolean)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(pr.display_name, 'Jugador'), pm.digitos, pm.user_id = auth.uid()
  from public.pi_marcas pm
  join public.profiles pr on pr.id = pm.user_id
  where pm.dia = (now() at time zone 'UTC')::date
  order by pm.digitos desc, pm.creado_at asc
  limit 20;
$$;
grant execute on function public.tabla_pi_hoy() to authenticated;
