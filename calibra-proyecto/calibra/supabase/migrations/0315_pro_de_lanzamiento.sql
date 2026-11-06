-- 0315: 7 días de Pro de regalo para las cuentas nuevas del lanzamiento (decidido el
-- 2026-11-06, antes del directo que muestra Prodigia: que la gente nueva pruebe todo
-- mientras los pagos reales no están listos).
--
-- Quién: toda cuenta con correo (no invitada) creada desde el 6 de noviembre de 2026
-- (hora de Colombia) hasta el 30 de noviembre, que nunca tuvo Pro ni suscripción.
-- Cómo: revisar_mi_pro() —que la web y la app ya llaman al cargar la sesión de toda
-- cuenta con correo— la entrega la primera vez. Queda como una suscripción
-- 'lanzamiento' en estado 'trialing' que termina 7 días después, así que vence sola
-- con el mismo camino de siempre (0276: revisar_mi_pro y vencer_pro_vencidos) y deja
-- el aviso «tu Pro terminó». Sin margen de 2 días: ese margen es para que llegue la
-- renovación de un pago real.
-- Si un invitado crea su cuenta después, cuenta desde que su perfil existe (también
-- es una cuenta nueva).
-- Además, activar_pro_tester(): mientras los pagos estén en prueba, el botón de compra
-- muestra «todavía no tenemos los pagos verificados: eres tester, ten Pro gratis», y
-- cualquier cuenta con correo que nunca tuvo Pro (también las de antes del 6) puede
-- activar sus 7 días ahí. Requiere 0145 y 0276. Idempotente.

alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('mercadopago', 'paddle', 'lanzamiento'));

create or replace function public._suscripcion_vigente(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions sub
    where sub.user_id = p_user_id
      and sub.status in ('active', 'trialing')
      and (
        sub.current_period_end is null
        or sub.current_period_end > now() - case when sub.provider = 'lanzamiento' then interval '0 days' else interval '2 days' end
      )
  );
$$;
revoke all on function public._suscripcion_vigente(uuid) from public, anon, authenticated;

-- Entrega el regalo si corresponde; devuelve si lo entregó ahora.
drop function if exists public._dar_pro_lanzamiento(uuid);
create or replace function public._dar_pro_lanzamiento(p_user_id uuid, p_solo_nuevas boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creado timestamptz;
  v_plan text;
begin
  if now() >= timestamptz '2026-12-01 00:00:00-05' then
    return false;
  end if;
  if exists (select 1 from auth.users u where u.id = p_user_id and coalesce(u.is_anonymous, false)) then
    return false;
  end if;
  select pr.created_at, pr.plan into v_creado, v_plan from public.profiles pr where pr.id = p_user_id;
  if v_creado is null or (p_solo_nuevas and v_creado < timestamptz '2026-11-06 00:00:00-05') or v_plan = 'pro' then
    return false;
  end if;
  if exists (select 1 from public.subscriptions sub where sub.user_id = p_user_id) then
    return false;
  end if;

  insert into public.subscriptions (user_id, provider, provider_subscription_id, status, plan_interval, current_period_end, cancel_at_period_end)
  values (p_user_id, 'lanzamiento', 'lanzamiento-' || p_user_id::text, 'trialing', 'mensual', now() + interval '7 days', true)
  on conflict (provider, provider_subscription_id) do nothing;

  update public.profiles as pr
  set plan = 'pro', pro_termino_aviso = false
  where pr.id = p_user_id;
  return true;
end;
$$;
revoke all on function public._dar_pro_lanzamiento(uuid, boolean) from public, anon, authenticated;

-- Base: 0276. Único cambio: antes de revisar, entrega el Pro de lanzamiento.
create or replace function public.revisar_mi_pro()
returns table (plan text, aviso boolean, termino_en timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return;
  end if;

  perform public._dar_pro_lanzamiento(v_user);

  if exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro')
     and exists (select 1 from public.subscriptions sub where sub.user_id = v_user)
     and not public._suscripcion_vigente(v_user) then
    perform public._apagar_pro(v_user);
  end if;

  return query
    select pr.plan, pr.pro_termino_aviso, pr.pro_termino_en
    from public.profiles pr
    where pr.id = v_user;
end;
$$;
grant execute on function public.revisar_mi_pro() to authenticated;

-- Para mostrarle al jugador cuánto le queda del regalo (web y app).
create or replace function public.mi_pro_lanzamiento()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select sub.current_period_end
  from public.subscriptions sub
  where sub.user_id = auth.uid() and sub.provider = 'lanzamiento' and sub.status = 'trialing'
    and sub.current_period_end > now()
  limit 1;
$$;
grant execute on function public.mi_pro_lanzamiento() to authenticated;

-- El botón «Activar mi Pro de tester» (AvisoPagosEnPrueba.tsx).
create or replace function public.activar_pro_tester()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null or exists (select 1 from auth.users u where u.id = v_user and coalesce(u.is_anonymous, false)) then
    return 'invitado';
  end if;
  if now() >= timestamptz '2026-12-01 00:00:00-05' then
    return 'terminado';
  end if;
  if exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro') then
    return 'ya_pro';
  end if;
  if exists (select 1 from public.subscriptions sub where sub.user_id = v_user) then
    return 'ya_usado';
  end if;
  if public._dar_pro_lanzamiento(v_user, false) then
    return 'activado';
  end if;
  return 'ya_usado';
end;
$$;
grant execute on function public.activar_pro_tester() to authenticated;
