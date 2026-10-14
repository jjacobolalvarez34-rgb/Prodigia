-- ============================================================
-- Prodigia — Pro nuevo: +25 % de Chispas al jugar en vez de 10 000 por pago (0286).
--
-- Decidido el 2026-10-14 (PLAN_ECONOMIA.md §5): con la economía nueva, 10 000
-- Chispas por pago eran 4 mundos y Pro competía contra sus propias compras. Ahora
-- Pro da +25 % de Chispas en cada partida (la Experiencia no cambia) y 300 Cometas
-- al mes (0283). Lo que ya se acreditó no se toca.
-- Base: aplicar_suscripcion de 0276 y registrar_xp_diario de 0280, con solo eso
-- cambiado. Requiere 0280. Idempotente.
-- ============================================================

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
  -- 0286: Pro ya no regala Chispas por pago (da +25 % al jugar y 300 Cometas al mes).
  v_chispas_pro constant integer := 0;
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
         coalesce(bool_or(n.mundo = public.mundo_doble_experiencia(current_date)), false)
    into v_respuestas, v_aciertos, v_ultima, v_doble
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

notify pgrst, 'reload schema';
