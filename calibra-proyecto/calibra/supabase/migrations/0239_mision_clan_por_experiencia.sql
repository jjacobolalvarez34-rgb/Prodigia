-- ============================================================
-- Prodigia — la misión semanal del clan pasa de "resolver 500 problemas" a
-- "sumar 3000 de Experiencia entre todo el clan", y paga 2000 Chispas a cada
-- miembro (pedido del usuario, 2026-09-25: "500 problemas … da muy pocas
-- chispas, mejor que sea 3000 exp conjunta y les dan 2000 chispas").
--
-- Cambios:
--   1) avanzar_mision_de_clan (0070): el progreso suma la Experiencia (`xp`)
--      de cada intento correcto en vez de +1 por intento. Si un intento
--      cruza la meta, el progreso se topa en el objetivo.
--   2) La recompensa son Chispas y solo Chispas: ya no se suma también a
--      xp_historico_total (0070 lo hacía). Con 2000 por miembro habría
--      inflado el nivel de cuenta y el ranking de experiencia con algo que
--      no se ganó practicando.
--   3) asegurar_mision_semanal (0133): las misiones nuevas nacen con
--      objetivo 3000 y recompensa 2000.
--   4) La misión de ESTA semana se convierte: objetivo 3000, recompensa 2000 y
--      progreso recalculado con la Experiencia de los miembros actuales desde
--      el lunes; si ya alcanza la meta se cumple y se paga en la migración
--      (detalle abajo). Cada semana la misión nueva empieza de cero y solo
--      cuenta la Experiencia de esa semana.
--
-- `objetivo_tipo` conserva el valor 'problemas_resueltos' (tiene un check);
-- ahora significa "unidades de objetivo", que son puntos de Experiencia.
-- ============================================================

create or replace function public.avanzar_mision_de_clan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_mision record;
  v_miembro uuid;
  v_progreso integer;
begin
  if new.correct is distinct from true or coalesce(new.xp, 0) <= 0 then
    return new;
  end if;

  select cmb.clan_id into v_clan_id from public.clan_membresias cmb where cmb.user_id = new.user_id;
  if v_clan_id is null then
    return new;
  end if;

  select * into v_mision from public.clan_misiones cm
  where cm.clan_id = v_clan_id and cm.semana_inicio = date_trunc('week', current_date)::date
  for update;

  if v_mision.id is null or v_mision.completada then
    return new;
  end if;

  v_progreso := least(v_mision.objetivo_cantidad, v_mision.progreso_actual + new.xp);

  update public.clan_misiones
    set progreso_actual = v_progreso,
        completada = v_progreso >= v_mision.objetivo_cantidad
    where id = v_mision.id;

  if v_progreso >= v_mision.objetivo_cantidad then
    for v_miembro in select cmb.user_id from public.clan_membresias cmb where cmb.clan_id = v_clan_id loop
      update public.profiles set puntos_total = puntos_total + v_mision.recompensa_chispas where id = v_miembro;
    end loop;
    update public.clan_misiones set recompensa_repartida = true where id = v_mision.id;
  end if;

  return new;
end;
$$;

create or replace function public.asegurar_mision_semanal(p_clan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lunes date := date_trunc('week', current_date)::date;
begin
  if not exists (
    select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = auth.uid()
  ) then
    raise exception 'no eres miembro de este clan';
  end if;

  insert into public.clan_misiones (clan_id, objetivo_tipo, objetivo_cantidad, recompensa_chispas, semana_inicio)
  values (p_clan_id, 'problemas_resueltos', 3000, 2000, v_lunes)
  on conflict (clan_id, semana_inicio) do nothing;
end;
$$;

-- Convierte la misión de ESTA semana con la Experiencia que el clan ya reunió desde el
-- lunes. Si con eso ya alcanza los 3000, se marca cumplida y se paga aquí mismo (no hay
-- que esperar a otro intento):
--   - misión abierta            -> se paga la recompensa nueva completa (2000);
--   - misión ya cumplida y paga -> se convirtió por la regla vieja (150 Chispas): si la
--                                  Experiencia alcanza, se paga solo la diferencia; si
--                                  no alcanza, se reabre para que el clan la termine.
do $$
declare
  v_m record;
  v_miembro uuid;
  v_exp integer;
  v_pago integer;
begin
  for v_m in
    select cm.id, cm.clan_id, cm.semana_inicio, cm.completada, cm.recompensa_repartida,
           cm.recompensa_chispas as recompensa_vieja
    from public.clan_misiones cm
    where cm.semana_inicio = date_trunc('week', current_date)::date
    for update
  loop
    select coalesce(sum(x.xp), 0)::integer into v_exp
    from public.clan_membresias cmb
    cross join lateral (
      select a.xp from public.attempts a
        where a.user_id = cmb.user_id and a.correct is true and a.created_at >= v_m.semana_inicio
      union all
      select la.xp from public.logic_attempts la
        where la.user_id = cmb.user_id and la.correct is true and la.created_at >= v_m.semana_inicio
    ) x
    where cmb.clan_id = v_m.clan_id and coalesce(x.xp, 0) > 0;

    if v_exp >= 3000 then
      v_pago := case when v_m.recompensa_repartida then greatest(0, 2000 - v_m.recompensa_vieja) else 2000 end;
      update public.clan_misiones
        set objetivo_cantidad = 3000, recompensa_chispas = 2000, progreso_actual = 3000,
            completada = true, recompensa_repartida = true
        where id = v_m.id;
      if v_pago > 0 then
        for v_miembro in select cmb.user_id from public.clan_membresias cmb where cmb.clan_id = v_m.clan_id loop
          update public.profiles set puntos_total = puntos_total + v_pago where id = v_miembro;
        end loop;
      end if;
    else
      update public.clan_misiones
        set objetivo_cantidad = 3000, recompensa_chispas = 2000, progreso_actual = v_exp,
            completada = false, recompensa_repartida = false
        where id = v_m.id;
    end if;
  end loop;
end;
$$;

notify pgrst, 'reload schema';
