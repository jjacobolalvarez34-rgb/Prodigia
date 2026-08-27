-- ============================================================
-- Prodigia — Fase 3: el reto diario pasa de 5 preguntas de solo
-- Numeria a 45 preguntas repartidas entre las ciudades que cada
-- usuario ya desbloqueó (ver src/lib/retoDiario.ts). Acá solo cambia
-- el tope de `correctos` (antes 0-5) y la fórmula de bonus — el
-- contenido en sí se sigue generando en el cliente/servidor, nunca se
-- guarda en la base (mismo criterio que 0024).
-- Correr después de 0094_serie_duelo_rival_puntaje.sql.
-- ============================================================

alter table public.retos_diarios_completados drop constraint retos_diarios_completados_correctos_check;
alter table public.retos_diarios_completados add constraint retos_diarios_completados_correctos_check
  check (correctos between 0 and 45);

create or replace function public.completar_reto_diario(p_fecha date, p_correctos smallint)
returns table (puntos_bonus integer, puntos_total integer, ya_completado boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bonus integer;
  v_existe boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_fecha <> current_date then
    raise exception 'fecha invalida';
  end if;

  select exists(
    select 1 from public.retos_diarios_completados where user_id = v_user and fecha = p_fecha
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  -- 5 Chispas por acierto, tope real en 45 — un reto de 45/45 paga 225
  -- (antes: 5/5 pagaba 75). Más preguntas, más recompensa, mismo
  -- criterio de "una sola vez por día" de siempre.
  v_bonus := greatest(0, least(45, p_correctos)) * 5;

  insert into public.retos_diarios_completados (user_id, fecha, correctos, puntos_bonus)
  values (v_user, p_fecha, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

grant execute on function public.completar_reto_diario(date, smallint) to authenticated;
