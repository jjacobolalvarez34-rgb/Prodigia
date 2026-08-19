-- ============================================================
-- Prodigia — Rankeds: el segundo jugador en cerrar una serie mejor-de-3
-- también tiene que ver el cambio de ELO animado y la celebración de
-- rango, no solo el primero
-- Correr después de 0044_titulo_junto_al_nombre.sql
--
-- Diagnóstico real del bug: finalizar_serie_si_corresponde aplicaba el
-- ELO una sola vez (correcto, con guard atómico), pero el "elo_anterior"
-- que devolvía SIEMPRE se leía en el momento de la llamada — para quien
-- disparó la finalización eso es el valor viejo de verdad, pero para el
-- otro jugador (que pregunta DESPUÉS, cuando su polling nota
-- serie_finalizada=true), su propio elo_rating YA estaba actualizado
-- para ese momento — así que "anterior" y "nuevo" le llegaban iguales,
-- y CountUp (que necesita from<>value para animar algo) no tenía nada
-- que contar. El número final le salía bien igual, pero sin animación
-- ni, si correspondía, la celebración de "subiste de rango" (esa
-- comparación también usaba el mismo par anterior=nuevo).
--
-- Fix: se guarda el ELO "antes" de LOS DOS jugadores en la fila de la
-- ronda 1 en el momento exacto en que se aplica el cambio — así,
-- cualquiera de los dos que pregunte después (inmediatamente o más
-- tarde) puede leer SU PROPIO "antes" real, sin importar si fue quien
-- disparó la finalización o no. De paso, el desbloqueo de título por
-- cruzar de rango también se revisa para LOS DOS lados en el momento de
-- aplicar el ELO (antes solo se revisaba el lado de quien llamaba en
-- ese momento — el mismo patrón de bug, aplicado a títulos en vez de a
-- la animación).
-- ============================================================

alter table public.duels add column if not exists serie_elo_retador_antes integer;
alter table public.duels add column if not exists serie_elo_retado_antes integer;

create or replace function public.finalizar_serie_si_corresponde(p_serie_id uuid)
returns table (
  finalizada boolean, gane boolean, empate boolean, elo_nuevo integer, elo_anterior integer,
  victorias_propias smallint, victorias_rival smallint, oponente_id uuid, oponente_nombre text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_primera record;
  v_otro_id uuid;
  v_rondas record;
  v_victorias_mias smallint := 0;
  v_victorias_otro smallint := 0;
  v_rondas_completadas smallint := 0;
  v_ya_decidido boolean;
  v_mi_elo integer;
  v_otro_elo integer;
  v_actual numeric;
  v_esperado numeric;
  v_nuevo_elo_retador integer;
  v_nuevo_elo_retado integer;
  v_k constant integer := 20; -- Fase 3: K alto para el modo aleatorio
  v_filas_actualizadas integer;
  v_mi_elo_anterior integer;
  v_gane boolean;
  v_empate boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_primera from public.duels where serie_id = p_serie_id and ronda_numero = 1;
  if v_primera.id is null or (v_primera.retador_id <> v_user and v_primera.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  v_otro_id := case when v_primera.retador_id = v_user then v_primera.retado_id else v_primera.retador_id end;

  for v_rondas in select estado, ganador_id from public.duels where serie_id = p_serie_id order by ronda_numero loop
    if v_rondas.estado = 'completado' then
      v_rondas_completadas := v_rondas_completadas + 1;
      if v_rondas.ganador_id = v_user then v_victorias_mias := v_victorias_mias + 1;
      elsif v_rondas.ganador_id = v_otro_id then v_victorias_otro := v_victorias_otro + 1;
      end if;
    end if;
  end loop;

  v_ya_decidido := v_victorias_mias >= 2 or v_victorias_otro >= 2 or v_rondas_completadas >= 3;

  if not v_ya_decidido then
    return query select false, false, false, null::integer, null::integer, v_victorias_mias, v_victorias_otro, v_otro_id,
      (select display_name from public.profiles where id = v_otro_id);
    return;
  end if;

  -- Marca las 3 filas como finalizadas de forma atómica — si ya estaba
  -- marcada (dos rondas resolviéndose casi juntas, o el cliente
  -- reintentando, o el otro jugador preguntando después), no vuelve a
  -- tocar el ELO ni a pisar el "antes" ya guardado.
  update public.duels set serie_finalizada = true
  where serie_id = p_serie_id and serie_finalizada = false;
  get diagnostics v_filas_actualizadas = row_count;

  if v_filas_actualizadas > 0 then
    select elo_rating into v_mi_elo from public.profiles where id = v_user;
    select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

    v_actual := case
      when v_victorias_mias > v_victorias_otro then 1
      when v_victorias_mias < v_victorias_otro then 0
      else 0.5
    end;
    v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));

    if v_user = v_primera.retador_id then
      v_nuevo_elo_retador := round(v_mi_elo + v_k * (v_actual - v_esperado));
      v_nuevo_elo_retado := round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)));
    else
      v_nuevo_elo_retado := round(v_mi_elo + v_k * (v_actual - v_esperado));
      v_nuevo_elo_retador := round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)));
    end if;

    -- El "antes" de LOS DOS queda guardado acá, sin importar quién
    -- dispara esto — es lo que le permite al segundo jugador animar su
    -- propio cambio real más tarde.
    update public.duels
      set serie_elo_retador_antes = case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end,
          serie_elo_retado_antes = case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end
      where serie_id = p_serie_id and ronda_numero = 1;

    update public.profiles set elo_rating = v_nuevo_elo_retador where id = v_primera.retador_id;
    update public.profiles set elo_rating = v_nuevo_elo_retado where id = v_primera.retado_id;

    -- Título de rango para LOS DOS lados si corresponde, no solo para
    -- quien disparó la finalización — mismo bug, aplicado a títulos.
    if public.rango_de_elo(v_nuevo_elo_retador) <> public.rango_de_elo(
      case when v_user = v_primera.retador_id then v_mi_elo else v_otro_elo end
    ) then
      perform public.desbloquear_titulo(
        v_primera.retador_id, 'rango_' || public.rango_de_elo(v_nuevo_elo_retador),
        initcap(public.rango_de_elo(v_nuevo_elo_retador)), 'rango'
      );
    end if;
    if public.rango_de_elo(v_nuevo_elo_retado) <> public.rango_de_elo(
      case when v_user = v_primera.retador_id then v_otro_elo else v_mi_elo end
    ) then
      perform public.desbloquear_titulo(
        v_primera.retado_id, 'rango_' || public.rango_de_elo(v_nuevo_elo_retado),
        initcap(public.rango_de_elo(v_nuevo_elo_retado)), 'rango'
      );
    end if;
  end if;

  -- A esta altura la serie YA está finalizada (recién ahora o antes) —
  -- se lee el "antes" real guardado en la fila (nunca recalculado), y
  -- el "después" en vivo desde profiles (ya está al día en cualquiera
  -- de los dos casos, sea la primera vez que se pregunta o la décima).
  select case when v_user = v_primera.retador_id then serie_elo_retador_antes else serie_elo_retado_antes end
  into v_mi_elo_anterior
  from public.duels where serie_id = p_serie_id and ronda_numero = 1;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  v_gane := v_victorias_mias > v_victorias_otro;
  v_empate := v_victorias_mias = v_victorias_otro;

  return query select true, v_gane, v_empate, v_mi_elo, v_mi_elo_anterior,
    v_victorias_mias, v_victorias_otro, v_otro_id,
    (select display_name from public.profiles where id = v_otro_id);
end;
$$;

grant execute on function public.finalizar_serie_si_corresponde(uuid) to authenticated;
