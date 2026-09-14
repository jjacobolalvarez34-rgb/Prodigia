-- ====================================================================
-- PRODIGIA — FIX P0: "ningún juego de la Trastienda funciona, aparece
-- 'Algo salió mal'" (reportado en vivo por el propietario).
--
-- CAUSA RAÍZ (confirmada en vivo contra producción, cuenta QA):
--   girar_ruleta, iniciar_la_calcu e iniciar_la_pizarra devuelven
--   42702 "column reference puntos_total is ambiguous" apenas se
--   los llama. Mismo bug recurrente de esta sesión: cuando una
--   función declara `returns table (..., puntos_total integer, ...)`,
--   Postgres crea una variable OUT implícita llamada exactamente
--   "puntos_total", con alcance en toda la función. Cualquier
--   referencia SUELTA (sin alias) a "puntos_total" dentro de un
--   `update public.profiles set puntos_total = puntos_total ± X`
--   queda ambigua entre esa variable y la columna real de la tabla —
--   pero solo lanza el error en tiempo de EJECUCIÓN, nunca al crear
--   la función, así que quedó invisible hasta que alguien la usó.
--
-- ALCANCE REAL (no son solo esas 3): audité las 16 funciones de
-- Trastienda/apuestas/minijuegos que declaran `puntos_total` en su
-- `returns table` y grepeé cuáles además tienen el patrón ambiguo en
-- el cuerpo. 13 funciones tienen el bug real (confirmado cruzando
-- ambas condiciones, no solo el texto): girar_ruleta, tirar_volado,
-- iniciar_la_pizarra, adivinar_la_pizarra, apostar_partida,
-- apostar_prediccion_ranking, iniciar_la_calcu, resolver_la_calcu,
-- iniciar_acertijos, responder_acertijos, iniciar_el_reloj,
-- finalizar_el_reloj, apostar_casino_elementos.
--
-- RETIRADAS DE ESTA MIGRACIÓN (2026-09-13, primer intento de correrla
-- falló entero): iniciar_acertijos, responder_acertijos,
-- iniciar_el_reloj y finalizar_el_reloj referencian
-- public.trastienda_acertijos / public.trastienda_reloj, que NO
-- existen en producción (esos 2 minijuegos nunca llegaron a tener UI
-- ni migración de tabla aplicada — código huérfano de 0129). Como
-- Postgres compila el cuerpo de la función al crearla, `create or
-- replace function responder_acertijos` tiraba 42P01 "relation
-- trastienda_acertijos does not exist" — y como el script completo
-- corre como una sola transacción, ESE error hacía rollback de TODO
-- el archivo, incluidas las 9 funciones que sí estaban bien (por eso
-- el "fix" no arregló nada la primera vez). Se sacaron esas 4 de acá
-- — no tienen ruta de API ni componente, arreglarlas es agregar una
-- tabla nueva, fuera de alcance de un fix de regresión P0. Quedan 9
-- funciones reales en esta migración: girar_ruleta, tirar_volado,
-- iniciar_la_pizarra, adivinar_la_pizarra, apostar_partida,
-- apostar_prediccion_ranking, iniciar_la_calcu, resolver_la_calcu,
-- apostar_casino_elementos — todas confirmadas en vivo (los 42702 de
-- antes) como referenciando tablas que SÍ existen.
--
-- Las que coinciden en el texto "set puntos_total = puntos_total"
-- pero NO tienen el bug (porque su `returns` no declara una columna
-- "puntos_total" que choque) se dejan intactas a propósito:
-- resolver_apuesta_partida y
-- resolver_prediccion_ranking (`returns void`, sin OUT), crear_clan
-- (`returns uuid`, sin OUT). apostar_doble_o_nada,
-- resolver_apuesta_si_activa, preview_apuesta_partida y
-- desbloquear_mundo YA estaban bien escritas (usan `update ... as pr
-- set col = pr.col ...`) — ese es exactamente el patrón que este fix
-- aplica al resto, por consistencia con el propio estilo del proyecto.
--
-- FIX: alias la tabla en cada UPDATE ambiguo (`update public.profiles
-- as pr set puntos_total = pr.puntos_total ± X where pr.id = ...`) en
-- vez de renombrar las columnas de salida — así ningún cliente
-- (rutas API ni componentes) necesita cambios, el contrato externo de
-- cada función queda idéntico. `create or replace` alcanza: ninguna
-- firma ni tipo de retorno cambia, solo el cuerpo.
-- ====================================================================

create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  chispas_ganadas integer,
  puntos_total integer,
  giros_hoy integer,
  pity_activo boolean,
  costo_aplicado integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_giros_hoy integer;
  v_costo integer;
  v_pity_prev integer := 0;
  v_r numeric;
  v_segmento text;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_chispas integer := 0;
  v_pity_new integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — vuelve mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas para girar';
  end if;

  select coalesce(r.pity_counter, 0) into v_pity_prev
  from public.trastienda_ruleta r
  where r.user_id = v_user
  order by r.creado_at desc
  limit 1;

  if v_pity_prev >= 3 then
    v_segmento := (array['chispas_25', 'chispas_50', 'escudo'])[1 + floor(random() * 3)::int];
  else
    v_r := random() * 100;
    if v_r < 5 then
      v_segmento := 'boost';
    elsif v_r < 13 then
      v_segmento := 'escudo';
    elsif v_r < 19 then
      v_segmento := 'congelamiento';
    elsif v_r < 31 then
      v_segmento := 'chispas_50';
    elsif v_r < 51 then
      v_segmento := 'chispas_25';
    elsif v_r < 54 then
      v_segmento := 'chispas_100';
    elsif v_r < 56 then
      v_segmento := 'fuente';
    elsif v_r < 57.5 then
      v_segmento := 'marco';
    elsif v_r < 58 then
      v_segmento := 'titulo';
    else
      v_segmento := 'nada';
    end if;
  end if;

  update public.profiles as pr set puntos_total = pr.puntos_total - v_costo where pr.id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento = 'escudo' then
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento = 'titulo' then
    select t.slug into v_titulo_slug
    from public.titulos_trastienda_base() t
    where t.slug not in (
      select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
    )
    order by random()
    limit 1;
    if v_titulo_slug is null then
      v_chispas := 200;
      update public.profiles as pr set puntos_total = pr.puntos_total + v_chispas where pr.id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
      perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
      v_premio_tipo := 'titulo';
      v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
    end if;
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles as pr set puntos_total = pr.puntos_total + v_chispas where pr.id = v_user;
    v_premio_tipo := 'chispas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles as pr set puntos_total = pr.puntos_total + v_chispas where pr.id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'fuente';
      v_premio_detalle := jsonb_build_object('fuente', v_elegido);
    end if;
  elsif v_segmento = 'marco' then
    select coalesce(array_agg(m), array[]::text[]) into v_disponibles
    from unnest(v_marcos) t(m)
    where not (
      m = any (coalesce((select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 300;
      update public.profiles as pr set puntos_total = pr.puntos_total + v_chispas where pr.id = v_user;
      v_premio_tipo := 'chispas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_elegido := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
      update public.profiles
      set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido]
      where id = v_user;
      v_premio_tipo := 'marco';
      v_premio_detalle := jsonb_build_object('marco', v_elegido);
    end if;
  end if;

  v_pity_new := case when v_segmento = 'nada' then v_pity_prev + 1 else 0 end;

  insert into public.trastienda_ruleta
    (user_id, segmento, premio_tipo, premio_detalle, giro_numero, pity_counter, costo_aplicado)
  values
    (v_user, v_segmento, v_premio_tipo, v_premio_detalle, v_giros_hoy + 1, v_pity_new, v_costo);

  return query select
    v_segmento,
    v_premio_tipo,
    v_premio_detalle,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

grant execute on function public.girar_ruleta() to authenticated;

create or replace function public.tirar_volado(p_ronda integer, p_eleccion boolean)
returns table (
  cara boolean,
  ganaste boolean,
  entrada integer,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_entrada integer;
  v_salida integer;
  v_cara boolean;
  v_ganaste boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_ronda not between 1 and 3 then
    raise exception 'ronda invalida';
  end if;

  v_entrada := case p_ronda when 1 then 30 when 2 then 60 else 120 end;
  v_salida := case p_ronda when 1 then 55 when 2 then 110 else 220 end;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_entrada then
    raise exception 'te faltan Chispas para esa ronda';
  end if;

  v_cara := random() < 0.5;
  v_ganaste := v_cara = p_eleccion;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_entrada + case when v_ganaste then v_salida else 0 end
  where pr.id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada, salida, resultado)
  values (
    v_user, 'volado', v_entrada,
    case when v_ganaste then v_salida else 0 end,
    jsonb_build_object('ronda', p_ronda, 'cara', v_cara, 'ganaste', v_ganaste)
  );

  return query select
    v_cara,
    v_ganaste,
    v_entrada,
    case when v_ganaste then v_salida else 0 end,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.tirar_volado(integer, boolean) to authenticated;

create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_del_dia uuid;
  v_partidas_hoy integer;
  v_numero integer;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles as pr set puntos_total = pr.puntos_total - 30 where pr.id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_del_dia;

  return query select
    v_del_dia,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.iniciar_la_pizarra() to authenticated;

create or replace function public.adivinar_la_pizarra(p_pizarra_id uuid, p_numero integer)
returns table (
  ganaste boolean,
  terminado boolean,
  intentos integer,
  pista text,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_pizarra%rowtype;
  v_saldo integer;
  v_payout integer;
  v_pista text := null;
  v_ganaste boolean := false;
  v_terminado boolean := false;
  v_chispas integer := 0;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_numero not between 1 and 100 then
    raise exception 'número del 1 al 100';
  end if;

  select * into v_fila
  from public.trastienda_pizarra
  where id = p_pizarra_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa pizarra ya terminó';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 10 then
    raise exception 'te faltan Chispas para esa pregunta';
  end if;

  update public.profiles as pr set puntos_total = pr.puntos_total - 10 where pr.id = v_user;

  v_fila.intentos := v_fila.intentos + 1;

  if p_numero = v_fila.secreto then
    v_ganaste := true;
    v_terminado := true;
    v_payout := case when v_fila.intentos <= 3 then 170 when v_fila.intentos <= 5 then 100 else 50 end;
    update public.profiles as pr set puntos_total = pr.puntos_total + v_payout where pr.id = v_user;
    update public.trastienda_pizarra
    set intentos = v_fila.intentos, estado = 'ganado', resuelto_at = now()
    where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set salida = v_payout,
        resultado = jsonb_build_object('intentos', v_fila.intentos, 'ganaste', true)
    where id = v_fila.minijuego_id;
    v_chispas := v_payout;
  elsif v_fila.intentos >= 7 then
    v_terminado := true;
    update public.trastienda_pizarra
    set intentos = v_fila.intentos, estado = 'perdido', resuelto_at = now()
    where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set salida = 0,
        resultado = jsonb_build_object('intentos', v_fila.intentos, 'ganaste', false)
    where id = v_fila.minijuego_id;
  else
    v_pista := case when p_numero < v_fila.secreto then 'mayor' else 'menor' end;
    update public.trastienda_pizarra set intentos = v_fila.intentos where id = p_pizarra_id;
    update public.trastienda_minijuegos
    set resultado = jsonb_build_object('intentos', v_fila.intentos)
    where id = v_fila.minijuego_id;
  end if;

  return query select
    v_ganaste,
    v_terminado,
    v_fila.intentos,
    v_pista,
    v_chispas,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.adivinar_la_pizarra(uuid, integer) to authenticated;

create or replace function public.apostar_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (
  apuesta_id uuid,
  multiplier numeric,
  ganancia_potencial integer,
  puntos_total integer,
  apuestas_hoy integer,
  monto_apostado_hoy integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
  v_saldo integer;
  v_apuestas_hoy integer := 0;
  v_monto_hoy integer := 0;
  v_perdida_hoy integer := 0;
  v_fila_limite public.trastienda_limites_diarios%rowtype;
  v_apuesta_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_eleccion not in ('a', 'b', 'empate') then
    raise exception 'eleccion invalida';
  end if;
  if p_monto not in (25, 50, 100, 200) then
    raise exception 'monto invalido';
  end if;

  select * into v_duelo from public.duels where id = p_partida_id;
  if not found then
    raise exception 'esa partida no existe';
  end if;
  if v_duelo.estado not in ('pendiente', 'en_curso') then
    raise exception 'esa partida ya cerró';
  end if;
  if v_user in (v_duelo.retador_id, v_duelo.retado_id) then
    raise exception 'no se puede apostar a una partida propia';
  end if;
  if exists (
    select 1 from public.trastienda_apuestas
    where user_id = v_user and partida_id = p_partida_id
  ) then
    raise exception 'ya apostaste a esa partida';
  end if;

  select * into v_fila_limite
  from public.trastienda_limites_diarios
  where user_id = v_user;
  if found and v_fila_limite.fecha = current_date then
    v_apuestas_hoy := v_fila_limite.apuestas_realizadas;
    v_monto_hoy := v_fila_limite.monto_total_apostado;
    v_perdida_hoy := v_fila_limite.perdida_total;
  end if;

  if v_apuestas_hoy >= 10 then
    raise exception 'ya apostaste las 10 veces de hoy — vuelve mañana';
  end if;
  if v_monto_hoy + p_monto > 500 then
    raise exception 'superas el tope diario de 500 Chispas apostadas';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  update public.profiles as pr set puntos_total = pr.puntos_total - p_monto where pr.id = v_user;

  insert into public.trastienda_apuestas
    (user_id, partida_id, partida_tipo, jugador_a_id, jugador_b_id, eleccion, monto, multiplier, ganancia_potencial)
  values
    (v_user, p_partida_id, 'duelo', v_duelo.retador_id, v_duelo.retado_id,
     p_eleccion, p_monto, v_mult, floor(p_monto * v_mult)::int)
  returning id into v_apuesta_id;

  insert into public.trastienda_limites_diarios
    (user_id, fecha, apuestas_realizadas, monto_total_apostado, perdida_total)
  values (v_user, current_date, v_apuestas_hoy + 1, v_monto_hoy + p_monto, v_perdida_hoy)
  on conflict (user_id) do update set
    fecha = current_date,
    apuestas_realizadas = public.trastienda_limites_diarios.apuestas_realizadas + 1,
    monto_total_apostado = public.trastienda_limites_diarios.monto_total_apostado + p_monto;

  return query select
    v_apuesta_id,
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user),
    v_apuestas_hoy + 1,
    v_monto_hoy + p_monto;
end;
$$;

grant execute on function public.apostar_partida(uuid, text, integer) to authenticated;

create or replace function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio date,
  multiplier numeric,
  ganancia_potencial integer,
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

create or replace function public.iniciar_la_calcu()
returns table (
  calcu_id uuid,
  numeros integer[],
  target integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_puzzle record;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 50 then
    raise exception 'te faltan Chispas para la calculadora';
  end if;

  select * into v_puzzle from public.generar_puzzle_calcu() p;

  update public.profiles as pr set puntos_total = pr.puntos_total - 50 where pr.id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_calcu', 50)
  returning id into v_minijuego_id;

  insert into public.trastienda_calcu (user_id, minijuego_id, numeros, target, solucion)
  values (v_user, v_minijuego_id, v_puzzle.numeros, v_puzzle.target, v_puzzle.solucion);
  -- nota: el id se devuelve abajo desde la fila recién creada por el CTE del return query.

  return query select
    c.id,
    v_puzzle.numeros,
    v_puzzle.target,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_calcu c
  where c.user_id = v_user and c.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_la_calcu() to authenticated;

create or replace function public.resolver_la_calcu(p_calcu_id uuid, p_expresion jsonb)
returns table (
  ganaste boolean,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_calcu%rowtype;
  v_resultado numeric;
  v_hojas integer[];
  v_payout integer := 0;
  v_bonus integer := 0;
  v_resolvio boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_calcu
  where id = p_calcu_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa partida ya terminó';
  end if;

  -- Ventana de 30 segundos según la spec de La Calcu.
  if now() - v_fila.creado_at > interval '30 seconds' then
    update public.trastienda_calcu
    set estado = 'perdido', resuelto_at = now()
    where id = p_calcu_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('ganaste', false, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_resultado := public.eval_calcu(p_expresion);
  v_hojas := public.hojas_calcu(p_expresion);

  -- Solución válida: resultado exacto == target Y usa exactamente los
  -- mismos 4 números (misma multiset), cada uno una vez.
  if v_resultado is not null
     and v_resultado = v_fila.target::numeric
     and cardinality(v_hojas) = cardinality(v_fila.numeros)
     and v_hojas @> v_fila.numeros
     and v_fila.numeros @> v_hojas then
    v_resolvio := true;
    v_bonus := case when now() - v_fila.creado_at <= interval '10 seconds' then 1 else 0 end;
    v_payout := case when v_bonus = 1 then 200 else 125 end;
    update public.profiles as pr set puntos_total = pr.puntos_total + v_payout where pr.id = v_user;
  end if;

  update public.trastienda_calcu
  set estado = case when v_resolvio then 'ganado' else 'perdido' end, resuelto_at = now()
  where id = p_calcu_id;

  update public.trastienda_minijuegos
  set salida = v_payout,
      resultado = jsonb_build_object('ganaste', v_resolvio, 'bonus', v_bonus = 1, 'expresion', p_expresion)
  where id = v_fila.minijuego_id;

  return query select v_resolvio, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.resolver_la_calcu(uuid, jsonb) to authenticated;

create or replace function public.apostar_casino_elementos(p_zona text, p_monto integer)
returns table (
  zona text,
  monto integer,
  elegido text,
  elegido_nombre text,
  ganaste boolean,
  multiplier numeric,
  chispas_ganadas integer,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuestas_hoy integer;
  v_n integer;
  v_elegido text;
  v_elegido_nombre text;
  v_ganaste boolean := false;
  v_mult numeric := 0;
  v_pago integer := 0;
  v_premio_tipo text := null;
  v_premio_detalle jsonb := null;
  v_premio_idx integer;
  v_fuentes constant text[] := array['mono', 'serif', 'manuscrita', 'impacto', 'script', 'futurista'];
  v_marcos constant text[] := array['bronce', 'plata', 'oro', 'platino', 'diamante', 'prodigio', 'numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_disponibles text[];
  v_elegido_item text;
  v_titulo_slug text;
  v_titulo_nombre text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto not in (100, 250, 500, 1000) then
    raise exception 'monto de ficha invalido';
  end if;

  select count(*) into v_apuestas_hoy
  from public.trastienda_casino
  where user_id = v_user and fecha = current_date;

  if v_apuestas_hoy >= 20 then
    raise exception 'ya apostaste las 20 veces de hoy — vuelve mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa ficha';
  end if;

  select count(*) into v_n from public.casino_elementos_en_zona(p_zona);
  if v_n is null or v_n = 0 then
    raise exception 'zona invalida';
  end if;

  -- El croupier elige un elemento al azar entre los 118 (fair).
  select e.simbolo, e.nombre into v_elegido, v_elegido_nombre
  from public.trastienda_casino_elementos e
  order by random()
  limit 1;

  select exists (
    select 1 from public.casino_elementos_en_zona(p_zona) m where m.simbolo = v_elegido
  ) into v_ganaste;

  -- Se descuenta la ficha siempre.
  update public.profiles as pr set puntos_total = pr.puntos_total - p_monto where pr.id = v_user;

  if v_ganaste then
    -- payout_total = monto × (118/n) × 0.88 → EV de casa ≈ 0.92.
    v_mult := round((118.0 / v_n) * 0.88, 2);
    v_pago := greatest(round(p_monto * v_mult::numeric), 1);
    update public.profiles as pr set puntos_total = pr.puntos_total + v_pago where pr.id = v_user;

    -- Ganancia rara (~5%): un premio de la rueda vieja, por ENCIMA de las Chispas.
    if random() < 0.05 then
      v_premio_idx := 1 + floor(random() * 6)::int;
      if v_premio_idx = 1 then
        update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'boost');
      elsif v_premio_idx = 2 then
        update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'escudo');
      elsif v_premio_idx = 3 then
        update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
        v_premio_tipo := 'item';
        v_premio_detalle := jsonb_build_object('item', 'congelamiento');
      elsif v_premio_idx = 4 then
        select coalesce(array_agg(f), array[]::text[]) into v_disponibles
        from unnest(v_fuentes) t(f)
        where not (f = any (coalesce(
          (select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles as pr set puntos_total = pr.puntos_total + 200 where pr.id = v_user;
          v_pago := v_pago + 200;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set fuentes_desbloqueadas = coalesce(fuentes_desbloqueadas, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'fuente';
          v_premio_detalle := jsonb_build_object('fuente', v_elegido_item);
        end if;
      elsif v_premio_idx = 5 then
        select coalesce(array_agg(m), array[]::text[]) into v_disponibles
        from unnest(v_marcos) t(m)
        where not (m = any (coalesce(
          (select pr.marcos_desbloqueados from public.profiles pr where pr.id = v_user),
          array[]::text[]
        )));
        if cardinality(v_disponibles) = 0 then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 300, 'fallback', true);
          update public.profiles as pr set puntos_total = pr.puntos_total + 300 where pr.id = v_user;
          v_pago := v_pago + 300;
        else
          v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
          update public.profiles
          set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido_item]
          where id = v_user;
          v_premio_tipo := 'marco';
          v_premio_detalle := jsonb_build_object('marco', v_elegido_item);
        end if;
      else
        -- título: de la base de Trastienda que el usuario todavía no tenga.
        select t.slug into v_titulo_slug
        from public.titulos_trastienda_base() t
        where t.slug not in (
          select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
        )
        order by random()
        limit 1;
        if v_titulo_slug is null then
          v_premio_tipo := 'chispas';
          v_premio_detalle := jsonb_build_object('chispas', 200, 'fallback', true);
          update public.profiles as pr set puntos_total = pr.puntos_total + 200 where pr.id = v_user;
          v_pago := v_pago + 200;
        else
          v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
          perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
          v_premio_tipo := 'titulo';
          v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
        end if;
      end if;
    end if;
  end if;

  insert into public.trastienda_casino
    (user_id, zona, apuesta_numero, monto, elegido, ganaste, pago, premio_tipo, premio_detalle)
  values
    (v_user, p_zona, v_apuestas_hoy + 1, p_monto, v_elegido, v_ganaste, v_pago, v_premio_tipo, v_premio_detalle);

  return query select
    p_zona,
    p_monto,
    v_elegido,
    v_elegido_nombre,
    v_ganaste,
    v_mult,
    v_pago,
    v_premio_tipo,
    v_premio_detalle,
    v_apuestas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.apostar_casino_elementos(text, integer) to authenticated;

notify pgrst, 'reload schema';
