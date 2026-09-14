-- ====================================================================
-- PRODIGIA — FIX P0 (continuación de 0136): "El Oráculo del Ranking"
-- seguía tirando "Algo salió mal" después de 0136, porque tenía OTRA
-- columna ambigua distinta que 0136 no cubrió: 0136 solo persiguió el
-- patrón "puntos_total" (confirmado con las 13 funciones de esa
-- migración); acá el choque real es "semana_inicio" (y probablemente
-- "multiplier"/"ganancia_potencial" detrás, una vez resuelta la
-- primera — Postgres reporta solo la PRIMERA ambigüedad que encuentra
-- al compilar la función, no todas de una).
--
-- Confirmado en vivo (cuenta QA, llamada RPC directa):
--   ERROR: 42702 column reference "semana_inicio" is ambiguous
--
-- Mismo bug de siempre: `returns table (..., semana_inicio date, ...)`
-- crea una variable OUT con ese nombre exacto, y el `insert into
-- trastienda_predicciones_ranking (user_id, semana_inicio, ...)` la
-- referencia sin calificar en la LISTA DE COLUMNAS del insert — un
-- lugar que a simple vista no debería ser ambiguo (no es una
-- expresión, es solo el nombre del destino), pero el preprocesador de
-- variables de PL/pgSQL igual lo escanea (mismo hallazgo que
-- documentaba docs/PARIDAD_MUNDOS.md de sesiones anteriores).
--
-- FIX definitivo (no parcial): a diferencia de 0136 (que alcanzó con
-- alias `as pr` porque el choque era solo en UPDATEs), acá el choque
-- está en la LISTA DE COLUMNAS de un INSERT, que no admite alias de
-- tabla — la única forma robusta es renombrar las columnas de salida
-- que chocan. Confirmado que el contrato externo lo permite sin
-- romper nada: `src/app/api/trastienda/predicciones/route.ts` hace
-- `{ ok: true, ...fila }` (spread ciego) y el único campo que el
-- cliente lee por nombre de esa respuesta puntual es `puntos_total`
-- (`PrediccionRanking.tsx`: `onPuntos(r.puntos_total)`) — `semana`,
-- `multiplier` y `ganancia_potencial` que sí se muestran en pantalla
-- vienen de OTRA llamada (el GET, que lee directo de la tabla), no de
-- esta respuesta del POST. Se renombran los 3 columnas que realmente
-- chocan con la lista del insert; `prediccion_id` y `puntos_total`
-- quedan igual (no colisionan, y puntos_total sí se lee por nombre).
--
-- DROP + CREATE (no CREATE OR REPLACE): cambia el returns table, y la
-- función ya existe en producción desde 0136 con los nombres viejos —
-- mismo 42P13 que ya se vio antes en esta sesión si se usa REPLACE.
-- ====================================================================

drop function if exists public.apostar_prediccion_ranking(text, integer);

create function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio_out date,
  multiplier_out numeric,
  ganancia_potencial_out integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana date := date_trunc('week', current_date)::date;
  v_mult numeric;
  v_saldo integer;
  v_existe boolean;
  v_prediccion_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  v_mult := public.multiplier_prediccion(p_puesto);
  if v_mult is null then
    raise exception 'puesto invalido';
  end if;

  perform public.resolver_prediccion_ranking(v_semana - 7);

  if current_date > v_semana + 2 then
    raise exception 'ya cerró la ventana de apuesta de esta semana — la próxima abre el lunes';
  end if;

  select exists(
    select 1 from public.trastienda_predicciones_ranking
    where user_id = v_user and semana_inicio = v_semana
  ) into v_existe;
  if v_existe then
    raise exception 'ya tienes una predicción para esta semana (una por semana)';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa predicción';
  end if;

  update public.profiles as pr set puntos_total = pr.puntos_total - p_monto where pr.id = v_user;

  insert into public.trastienda_predicciones_ranking
    (user_id, semana_inicio, puesto_predicho, monto, multiplier, ganancia_potencial)
  values
    (v_user, v_semana, p_puesto, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_prediccion_id;

  return query select
    v_prediccion_id,
    v_semana,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_prediccion_ranking(text, integer) to authenticated;

notify pgrst, 'reload schema';
