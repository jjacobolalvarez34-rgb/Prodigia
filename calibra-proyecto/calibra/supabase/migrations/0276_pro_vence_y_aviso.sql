-- ============================================================
-- Prodigia — Pro se apaga solo al terminar y avisa (0276).
--
-- Decisión del 2026-10-10 (PLAN_ECONOMIA.md §5): Pro abre todos los mundos
-- mientras dure, «pero cuando se acabe la suscripción se deben apagar y debe
-- aparecer un letrero». Hasta ahora profiles.plan solo bajaba a 'free' cuando
-- llegaba el webhook de cancelación (aplicar_suscripcion, 0153): si ese aviso
-- no llegaba, Pro quedaba prendido para siempre.
--
-- Ahora:
--   - _suscripcion_vigente(): una suscripción cuenta si está 'active' o
--     'trialing' Y su período no terminó hace más de 2 días (margen para que
--     llegue la renovación).
--   - _apagar_pro(): plan → 'free' y deja el aviso pendiente. Lo comprado con
--     Chispas (mundos, cosméticos) se queda: lo que se apaga es lo que da Pro
--     (todos los mundos, Clases, estadísticas, sin anuncios).
--   - revisar_mi_pro(): la llaman la web (en cada página, solo si eres Pro) y
--     la app (al cargar tu perfil). Si tu Pro venció, lo apaga ahí mismo, y
--     devuelve si hay que mostrarte el aviso.
--   - marcar_aviso_pro_visto(): el aviso no vuelve a salir.
--   - vencer_pro_vencidos(): lo mismo para todas las cuentas; con pg_cron se
--     agenda cada hora.
--   - aplicar_suscripcion(): misma firma que 0153; ahora usa la misma regla y,
--     al bajar a 'free', también deja el aviso.
--
-- Pro dado a mano (sin ninguna fila en subscriptions, p. ej. cuentas de prueba)
-- no se toca: solo vence quien alguna vez tuvo una suscripción.
-- Requiere 0145 y 0153. Idempotente.
-- ============================================================

alter table public.profiles add column if not exists pro_termino_aviso boolean not null default false;
alter table public.profiles add column if not exists pro_termino_en timestamptz;

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
      and (sub.current_period_end is null or sub.current_period_end > now() - interval '2 days')
  );
$$;

create or replace function public._apagar_pro(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles as pr
  set plan = 'free',
      pro_termino_aviso = true,
      pro_termino_en = now()
  where pr.id = p_user_id and pr.plan = 'pro';
end;
$$;

revoke all on function public._suscripcion_vigente(uuid) from public, anon, authenticated;
revoke all on function public._apagar_pro(uuid) from public, anon, authenticated;

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

create or replace function public.marcar_aviso_pro_visto()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles as pr set pro_termino_aviso = false where pr.id = auth.uid();
$$;

grant execute on function public.revisar_mi_pro() to authenticated;
grant execute on function public.marcar_aviso_pro_visto() to authenticated;

create or replace function public.vencer_pro_vencidos()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_n integer := 0;
begin
  for v_id in
    select pr.id from public.profiles pr
    where pr.plan = 'pro'
      and exists (select 1 from public.subscriptions sub where sub.user_id = pr.id)
      and not public._suscripcion_vigente(pr.id)
  loop
    perform public._apagar_pro(v_id);
    v_n := v_n + 1;
  end loop;
  return v_n;
end;
$$;

revoke all on function public.vencer_pro_vencidos() from public, anon, authenticated;
grant execute on function public.vencer_pro_vencidos() to service_role;

-- Con pg_cron (Supabase lo trae; se activa en Database → Extensions) se revisa
-- cada hora. Sin él, igual se apaga al entrar (revisar_mi_pro).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('vencer-pro', '7 * * * *', 'select public.vencer_pro_vencidos()');
  end if;
end;
$$;

-- aplicar_suscripcion: misma firma y efectos que 0153, con la regla de vigencia
-- nueva y el aviso al bajar a 'free'.
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

  v_queda_pro := public._suscripcion_vigente(p_user_id);

  if v_queda_pro then
    update public.profiles as pr
    set plan = 'pro', pro_termino_aviso = false
    where pr.id = p_user_id;
  else
    perform public._apagar_pro(p_user_id);
  end if;

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
