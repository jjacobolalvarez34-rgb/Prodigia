-- ============================================================
-- Prodigia — Cometas, la moneda premium (0279).
--
-- Decidido el 2026-10-10 (PLAN_ECONOMIA.md §3) y pedido el 2026-10-13:
--   - Se compran con dinero (Paddle en la web; Google Play más adelante) y se
--     ganan pocas gratis (niveles, liga, logros, reto de fin de semana; ver 0280).
--   - Se cambian por Chispas: 1 Cometa = 10 Chispas, en un solo sentido.
--   - Los saldos de Chispas que ya tiene la gente NO se tocan.
--
-- Todo movimiento queda en cometas_movimientos; una referencia repetida no se
-- acredita dos veces (pagos, premios). Nadie escribe profiles.cometas desde el
-- cliente: solo estas funciones. Idempotente.
-- ============================================================

alter table public.profiles add column if not exists cometas integer not null default 0;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cometas_no_negativas') then
    alter table public.profiles add constraint profiles_cometas_no_negativas check (cometas >= 0);
  end if;
end $$;

create table if not exists public.cometas_movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cantidad integer not null,
  motivo text not null,
  referencia text,
  creado_at timestamptz not null default now()
);
create unique index if not exists cometas_movimientos_referencia_idx on public.cometas_movimientos (user_id, referencia) where referencia is not null;
create index if not exists cometas_movimientos_user_idx on public.cometas_movimientos (user_id, creado_at desc);

alter table public.cometas_movimientos enable row level security;
drop policy if exists "cada uno ve sus cometas" on public.cometas_movimientos;
create policy "cada uno ve sus cometas" on public.cometas_movimientos for select using (auth.uid() = user_id);
grant select on public.cometas_movimientos to authenticated;

-- Interna: suma (o resta) Cometas con su motivo. Con referencia, es idempotente:
-- devuelve false si ese movimiento ya se había hecho.
create or replace function public._dar_cometas(p_user uuid, p_cantidad integer, p_motivo text, p_referencia text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_cantidad = 0 then
    return false;
  end if;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (p_user, p_cantidad, p_motivo, p_referencia)
  on conflict do nothing
  returning id into v_id;
  if v_id is null then
    return false;
  end if;
  update public.profiles as pr set cometas = pr.cometas + p_cantidad where pr.id = p_user;
  return true;
end;
$$;
revoke execute on function public._dar_cometas(uuid, integer, text, text) from public, anon, authenticated;

-- Compra con dinero (la llama el webhook de pagos con la clave de servicio).
-- La referencia es el id de la transacción: un webhook repetido no acredita dos veces.
create or replace function public.acreditar_cometas_compradas(
  p_user_id uuid,
  p_provider text,
  p_provider_transaction_id text,
  p_monto_cometas integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
begin
  if p_monto_cometas <= 0 then
    raise exception 'monto invalido';
  end if;
  perform public._dar_cometas(p_user_id, p_monto_cometas, 'compra', p_provider || ':' || p_provider_transaction_id);
  select pr.cometas into v_saldo from public.profiles pr where pr.id = p_user_id;
  return v_saldo;
end;
$$;
revoke execute on function public.acreditar_cometas_compradas(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.acreditar_cometas_compradas(uuid, text, text, integer) to service_role;

-- Canje: 1 Cometa = 10 Chispas, en un solo sentido.
create or replace function public.canjear_cometas(p_cometas integer)
returns table (cometas integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_cometas is null or p_cometas < 1 or p_cometas > 100000 then
    raise exception 'cantidad invalida';
  end if;
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_saldo, 0) < p_cometas then
    raise exception 'te faltan Cometas: tienes %', coalesce(v_saldo, 0);
  end if;
  insert into public.cometas_movimientos (user_id, cantidad, motivo) values (v_user, -p_cometas, 'canje_chispas');
  update public.profiles as pr
  set cometas = pr.cometas - p_cometas,
      puntos_total = pr.puntos_total + p_cometas * 10
  where pr.id = v_user;
  return query select pr.cometas, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;
grant execute on function public.canjear_cometas(integer) to authenticated;

notify pgrst, 'reload schema';
