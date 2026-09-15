-- ====================================================================
-- Prodigia — pedido en vivo (2026-09-15): "me parece correcto que el
-- arcoiris se coloque automáticamente cuando pago premium, como que se
-- 'desbloquee', pero ps me lo puedo cambiar". aplicar_suscripcion()
-- (0145) ya acredita +10.000 Chispas en 'activacion'/'renovacion' — acá
-- se suma, SOLO en 'activacion' (la primera vez que alguien se hace
-- Pro, no en cada renovación mensual, para no pisarle una animación
-- que ya haya elegido a mano después), desbloquear Y equipar 'arcoiris'
-- si todavía tiene la animación por default ('ninguna') — un regalo de
-- bienvenida que no fuerza nada si ya la había personalizado.
-- Mismo signature que 0145, así que va con create or replace.
-- ====================================================================

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

  if p_motivo = 'activacion' then
    update public.profiles as pr
    set animaciones_desbloqueadas = case
          when 'arcoiris' = any(pr.animaciones_desbloqueadas) then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, 'arcoiris')
        end,
        animacion_nombre = case when pr.animacion_nombre = 'ninguna' then 'arcoiris' else pr.animacion_nombre end
    where pr.id = p_user_id;
  end if;
end;
$$;

grant execute on function public.aplicar_suscripcion(uuid, text, text, text, text, text, timestamptz, boolean, text) to service_role;

notify pgrst, 'reload schema';
