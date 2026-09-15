-- ====================================================================
-- Prodigia — Infraestructura de pagos, Fase 1 (Fundación): 3 tablas +
-- 3 funciones, sin ningún proveedor real conectado todavía. Payment
-- Service (src/lib/pagos/) llama a estas funciones SOLO desde rutas de
-- webhook server-to-server, usando el cliente admin (service_role) —
-- por eso ninguna de las 3 se otorga a `authenticated`/`anon`, solo a
-- `service_role`. Ver docs del plan en el mensaje de diseño: nunca se
-- confía en el navegador para confirmar un pago, todo webhook es
-- idempotente.
--
-- Convención de columna ambigua (0132/0134/0136/0138/0141): estas 3
-- funciones son plpgsql con `returns table`/`returns boolean`/
-- `returns integer` — cualquier referencia sin calificar a un nombre
-- que coincida con una columna de salida rompe en tiempo de ejecución,
-- nunca en el CREATE. Todo acá va calificado con el alias de su tabla
-- desde el vamos (pr./s./cp./pe.), mismo criterio que el resto del
-- proyecto.
-- ====================================================================

-- ---------- 1) payment_events: ledger de idempotencia de webhooks ----------
-- Sin política de RLS de lectura a propósito (puede traer datos crudos
-- del proveedor) — nadie más que service_role/postgres la lee.
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mercadopago', 'paddle')),
  event_id text not null,
  event_type text not null,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

alter table public.payment_events enable row level security;

-- ---------- 2) subscriptions: única fuente de verdad de "¿está vigente el Pro?" ----------
-- profiles.plan (existe desde 0001, nunca aplicado hasta ahora) queda
-- como caché barata — solo aplicar_suscripcion() la escribe.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('mercadopago', 'paddle')),
  provider_subscription_id text not null,
  provider_customer_id text,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  plan_interval text not null check (plan_interval in ('mensual', 'anual')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

alter table public.subscriptions enable row level security;

create policy "cada quien ve sus propias suscripciones"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ---------- 3) chispas_purchases: ledger de topes de Chispas con dinero real ----------
-- Separado del catálogo de gameplay (COSTOS/comprar_item_tienda) — esto
-- es plata real entrando, no Chispas gastándose.
create table public.chispas_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('mercadopago', 'paddle')),
  provider_transaction_id text not null,
  monto_chispas integer not null check (monto_chispas > 0),
  monto_pagado_centavos integer not null check (monto_pagado_centavos > 0),
  moneda text not null,
  status text not null default 'completado' check (status in ('completado', 'reembolsado')),
  created_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);

alter table public.chispas_purchases enable row level security;

create policy "cada quien ve sus propias compras de chispas"
  on public.chispas_purchases for select
  using (auth.uid() = user_id);

create index chispas_purchases_user_id_idx on public.chispas_purchases(user_id);

-- ---------- 4) registrar_evento_pago: la puerta de idempotencia ----------
-- Todo webhook llama esto PRIMERO. Si ya existía (mismo provider+
-- event_id), devuelve false y la ruta corta ahí sin acreditar nada de
-- nuevo — así procesar el mismo webhook 2, 10 o 1000 veces es inofensivo.
create or replace function public.registrar_evento_pago(p_provider text, p_event_id text, p_event_type text, p_raw_payload jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_insertado_id uuid;
begin
  insert into public.payment_events (provider, event_id, event_type, raw_payload, processed_at)
  values (p_provider, p_event_id, p_event_type, p_raw_payload, now())
  on conflict (provider, event_id) do nothing
  returning id into v_insertado_id;

  return v_insertado_id is not null;
end;
$$;

grant execute on function public.registrar_evento_pago(text, text, text, jsonb) to service_role;

-- ---------- 5) aplicar_suscripcion: upsert de subscriptions + profiles.plan + Chispas de Pro ----------
-- p_motivo decide si esta llamada acredita las +10.000 Chispas de Pro:
-- 'activacion' (primer período) y 'renovacion' SÍ acreditan; 'actualizacion'
-- (ej. cambio de método de pago) y 'cancelacion' NO.
create or replace function public.aplicar_suscripcion(
  p_user_id uuid,
  p_provider text,
  p_provider_subscription_id text,
  p_provider_customer_id text,
  p_status text,
  p_plan_interval text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_motivo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_queda_pro boolean;
  v_chispas_pro constant integer := 10000;
begin
  if p_motivo not in ('activacion', 'renovacion', 'actualizacion', 'cancelacion') then
    raise exception 'motivo invalido';
  end if;

  insert into public.subscriptions as s (
    user_id, provider, provider_subscription_id, provider_customer_id,
    status, plan_interval, current_period_end, cancel_at_period_end, updated_at
  )
  values (
    p_user_id, p_provider, p_provider_subscription_id, p_provider_customer_id,
    p_status, p_plan_interval, p_current_period_end, p_cancel_at_period_end, now()
  )
  on conflict (provider, provider_subscription_id) do update
    set status = p_status,
        provider_customer_id = coalesce(p_provider_customer_id, s.provider_customer_id),
        plan_interval = p_plan_interval,
        current_period_end = p_current_period_end,
        cancel_at_period_end = p_cancel_at_period_end,
        updated_at = now();

  -- profiles.plan = 'pro' si el usuario tiene AL MENOS una suscripción
  -- vigente (en cualquier proveedor) — nunca se resetea a 'colegio' acá.
  select exists (
    select 1 from public.subscriptions sub
    where sub.user_id = p_user_id and sub.status in ('active', 'trialing')
  ) into v_queda_pro;

  update public.profiles as pr
  set plan = case
    when v_queda_pro then 'pro'
    when pr.plan = 'pro' then 'free'
    else pr.plan
  end
  where pr.id = p_user_id;

  if p_motivo in ('activacion', 'renovacion') then
    update public.profiles as pr
    set puntos_total = pr.puntos_total + v_chispas_pro
    where pr.id = p_user_id;
  end if;
end;
$$;

grant execute on function public.aplicar_suscripcion(uuid, text, text, text, text, text, timestamptz, boolean, text) to service_role;

-- ---------- 6) acreditar_chispas_compradas: dinero real -> puntos_total ----------
-- Doble idempotencia a propósito (además de payment_events): el unique
-- (provider, provider_transaction_id) de chispas_purchases hace que
-- acreditar dos veces la MISMA transacción sea imposible, incluso si
-- por lo que sea se la llamara fuera del flujo normal de webhook.
create or replace function public.acreditar_chispas_compradas(
  p_user_id uuid,
  p_provider text,
  p_provider_transaction_id text,
  p_monto_chispas integer,
  p_monto_pagado_centavos integer,
  p_moneda text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_insertado_id uuid;
  v_nuevo_saldo integer;
begin
  if p_monto_chispas <= 0 or p_monto_pagado_centavos <= 0 then
    raise exception 'monto invalido';
  end if;

  insert into public.chispas_purchases (
    user_id, provider, provider_transaction_id, monto_chispas, monto_pagado_centavos, moneda
  )
  values (p_user_id, p_provider, p_provider_transaction_id, p_monto_chispas, p_monto_pagado_centavos, p_moneda)
  on conflict (provider, provider_transaction_id) do nothing
  returning id into v_insertado_id;

  if v_insertado_id is null then
    select pr.puntos_total into v_nuevo_saldo from public.profiles pr where pr.id = p_user_id;
    return v_nuevo_saldo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total + p_monto_chispas
  where pr.id = p_user_id
  returning pr.puntos_total into v_nuevo_saldo;

  return v_nuevo_saldo;
end;
$$;

grant execute on function public.acreditar_chispas_compradas(uuid, text, text, integer, integer, text) to service_role;

notify pgrst, 'reload schema';
