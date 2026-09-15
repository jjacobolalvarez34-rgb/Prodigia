-- ====================================================================
-- Prodigia — animación de "subiste de nivel" (cuenta), pedido en vivo
-- (2026-09-15): "se diseñó que cuando subiera de nivel se dieran unas
-- chispas y tuviera una animación... como una cápsula de chispas".
--
-- Ya existía un spec completo de esto (docs/audits/LEVEL-UP-ANIMACION-
-- 2026-09-08.md) de una sesión anterior — el hueco real que documentaba
-- sigue exactamente igual: acreditar_chispas() (0070) YA calcula
-- nivel_subio/nivel_nuevo/bonus_nivel cada vez que se acredita XP, pero
-- registrar_xp_diario() lo llama con `perform` (descarta el resultado)
-- y nunca lo expone. Hubo un intento previo de esto que se revirtió
-- por completo (ROLLBACK F6, 2026-09-09) — pero la causa real de ESE
-- incidente, según el propio informe (`docs/FINAL-SPRINT-REPORT.md`),
-- fue que la migración 0120 no estaba aplicada en la base en ese
-- momento (RPC vieja corriendo), no un bug en la lógica de nivel de
-- cuenta en sí — documentado acá para no repetir la sospecha equivocada
-- si algo raro pasa: primero confirmar que TODAS las migraciones hasta
-- esta estén aplicadas antes de sospechar de este código.
--
-- Cambia `select ... into` en vez de `perform` + agrega 3 columnas de
-- salida — la función cambia de "shape" de salida, va con drop + create.
-- ====================================================================

drop function if exists public.registrar_xp_diario(integer);

create function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer,
  nivel_cuenta_subio boolean,
  nivel_cuenta_nuevo integer,
  nivel_cuenta_bonus integer
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
  v_bonus_nivel integer := 0;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

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

    -- Antes: `perform public.acreditar_chispas(...)` — tiraba el
    -- resultado, que es justo donde vive nivel_subio/nivel_nuevo/
    -- bonus_nivel. Ahora se captura.
    select acc.nivel_subio, acc.nivel_nuevo, acc.bonus_nivel
      into v_nivel_subio, v_nivel_nuevo, v_bonus_nivel
      from public.acreditar_chispas(v_user, v_por_acreditar) acc;
  else
    select coalesce(xp_ganado, 0) into v_xp_hoy
    from public.daily_progress where user_id = v_user and fecha = current_date;
    v_xp_hoy := coalesce(v_xp_hoy, 0);
    -- No hubo nada nuevo que acreditar (0 XP esta llamada) — no hay
    -- "subida" que anunciar, pero igual se informa el nivel actual.
    select nivel_cuenta into v_nivel_nuevo from public.profiles where id = v_user;
  end if;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta,
    v_nivel_subio, coalesce(v_nivel_nuevo, 1), v_bonus_nivel;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

notify pgrst, 'reload schema';
