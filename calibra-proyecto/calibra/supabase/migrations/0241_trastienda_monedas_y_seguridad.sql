-- ============================================================
-- Prodigia — Trastienda: Monedas propias (no comprables) + seguridad (0241).
--
-- Contexto: docs/audits/REVISION-GENERAL-2026-09-26.md (sesión de otra
-- máquina) marcó dos hallazgos sobre la Trastienda (casino/ruleta/volado/
-- pizarra/La Calcu/doble o nada/apuestas):
--
--   SEG-02 (CRÍTICO): resolver_apuesta_si_activa confiaba en la precisión
--   que mandaba el cliente — llamando la RPC directo (sin pasar por
--   /api/practica/finish) con p_precision = 2 se ganaba SIEMPRE, sin tope
--   diario. Ver el bloque "SEG-02" más abajo.
--
--   PROD-01 (ALTO): las Chispas (compradas con dinero real vía Paddle) se
--   apuestan en juegos de azar simulado, con público de 8-15 años
--   documentado — exactamente lo que prohíbe la política de Familias de
--   Google Play y lo que regulan las leyes de loot boxes.
--
-- SOLUCIÓN a PROD-01 (pedido del usuario, 2026-09-27: "podría ser una
-- moneda propia de la trastienda?"): se crea profiles.monedas_trastienda,
-- una moneda separada, NO comprable — se gana 1:1 con la Experiencia real
-- de práctica (acreditar_chispas, ver abajo) y solo sirve para jugar acá.
-- A partir de esta migración, TODOS los juegos de la Trastienda cobran la
-- entrada y pagan premios en Monedas, nunca en Chispas: comprar Chispas ya
-- no compra, ni indirectamente, una ventaja en estos juegos. Los premios
-- que NO son moneda (boost, escudo, congelamiento, fuente, marco, título)
-- no cambian — son ítems, no dinero.
--
-- SEG-03 (respuesta a "se le pide la edad... no es suficiente"): el gate de
-- edad (<14) vivía SOLO en trastienda/page.tsx y encima trataba
-- edad_ingresada = null (quien nunca contestó) como adulto. Ninguna RPC lo
-- verificaba. Ahora puede_usar_trastienda(auth.uid()) se llama al principio
-- de cada función de la Trastienda; null queda BLOQUEADO, no permitido.
--
-- Migración de datos: los jugadores ya activos hoy tienen 0 Monedas recién
-- creada la columna, lo que los dejaría sin poder jugar de un día para el
-- otro. Se les da un saldo inicial en base a su Experiencia histórica REAL
-- (nunca comprada), topado en 3000, una sola vez.
-- ============================================================

alter table public.profiles add column if not exists monedas_trastienda integer not null default 0 check (monedas_trastienda >= 0);

-- puede_usar_trastienda: SEG-03. Hasta ahora el gate de edad (<14) vivía
-- SOLO en trastienda/page.tsx, y encima trataba edad_ingresada = null (quien
-- nunca contestó) como adulto. Ninguna RPC lo verificaba: un menor podía
-- llamar cualquier función de la Trastienda directo con su sesión. Acá se
-- exige haber contestado Y ser mayor — null queda bloqueado, no permitido.
-- El 14 debe coincidir con EDAD_MINIMA_TRASTIENDA en trastienda/page.tsx.
create or replace function public.puede_usar_trastienda(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select edad_ingresada >= 14 from public.profiles where id = p_user),
    false
  );
$$;

revoke execute on function public.puede_usar_trastienda(uuid) from public, anon;
grant execute on function public.puede_usar_trastienda(uuid) to authenticated;

-- acreditar_chispas: además de Chispas (puntos_total) y experiencia, ahora
-- también acredita Monedas de Trastienda 1:1 — la moneda separada, no
-- comprable, que reemplaza a las Chispas para jugar en la Trastienda
-- (PROD-01: "juego de azar simulado + moneda comprable con dinero real +
-- público infantil" — ver docs/audits/REVISION-GENERAL-2026-09-26.md).
-- Esta función SOLO la alimenta práctica real (registrar_xp_diario,
-- completar_reto_diario): acreditar_chispas_compradas (Paddle, 0145) es una
-- función DISTINTA y esta no la toca, así que comprar Chispas nunca da
-- Monedas.
create or replace function public.acreditar_chispas(p_user_id uuid, p_monto integer)
returns table (nivel_subio boolean, nivel_nuevo integer, bonus_nivel integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_nivel_anterior integer;
  v_xp_nuevo bigint;
  v_nivel_nuevo integer;
  v_bonus integer := 0;
  v_subio boolean := false;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'no autorizado';
  end if;

  update public.profiles
  set puntos_total = puntos_total + p_monto,
      monedas_trastienda = monedas_trastienda + greatest(p_monto, 0)
  where id = p_user_id;

  if p_monto > 0 then
    select nivel_cuenta into v_nivel_anterior from public.profiles where id = p_user_id;

    update public.profiles set xp_historico_total = xp_historico_total + p_monto
      where id = p_user_id
      returning xp_historico_total into v_xp_nuevo;

    v_nivel_nuevo := public.nivel_desde_xp_cuenta(v_xp_nuevo);

    if v_nivel_nuevo > v_nivel_anterior then
      v_subio := true;
      v_bonus := public.recompensa_nivel_cuenta(v_nivel_nuevo);
      update public.profiles set nivel_cuenta = v_nivel_nuevo, puntos_total = puntos_total + v_bonus
        where id = p_user_id;
    end if;

    select clan_id into v_clan_id from public.clan_membresias where user_id = p_user_id;
    if v_clan_id is not null then
      update public.clan_membresias set xp_aportado = xp_aportado + p_monto where user_id = p_user_id;
      update public.clanes set xp_acumulado_historico = xp_acumulado_historico + p_monto where id = v_clan_id;
    end if;
  end if;

  return query select v_subio, coalesce(v_nivel_nuevo, v_nivel_anterior), v_bonus;
end;
$$;

-- ---------- SEG-02: "doble o nada" farmeable ----------
-- apostar_doble_o_nada / resolver_apuesta_si_activa (0121/0129) llevaban 240
-- migraciones sin corregirse: resolver_apuesta_si_activa confiaba en
-- `p_precision` tal cual lo mandaba el cliente. Las rutas /api/practica/finish
-- y /api/enigmia/finish SÍ calculaban esa precisión a partir de intentos
-- reales en la base — pero cualquiera podía saltarse esas rutas y llamar la
-- RPC directo (supabase.rpc en la consola del navegador, con la sesión ya
-- autenticada) pasando p_precision = 2: como `p_precision > umbral` (un
-- cociente, siempre ≤ 1), esa llamada ganaba SIEMPRE, sin tope.
--
-- Fix: resolver_apuesta_si_activa ya no recibe ningún parámetro. Calcula la
-- precisión ELLA MISMA, adentro, contando attempts/logic_attempts reales
-- del usuario desde el momento en que se hizo la apuesta
-- (apuesta_creada_at, columna nueva) — cero información del cliente entra
-- en el cálculo. Si todavía no hay ningún intento desde la apuesta, no
-- resuelve nada (la apuesta sigue activa). Las rutas finish ahora llaman
-- resolver_apuesta_si_activa() sin argumentos.
--
-- Se agrega además un tope diario de ciclos (apuesta_ciclos_hoy/fecha):
-- máximo 10 apuestas por día, para que ni siquiera "ganar siempre" (con
-- data real) permita vaciar la banca del juego a fuerza de repetir.
alter table public.profiles add column if not exists apuesta_creada_at timestamptz;
alter table public.profiles add column if not exists apuesta_ciclos_hoy integer not null default 0;
alter table public.profiles add column if not exists apuesta_ciclos_fecha date;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.apostar_doble_o_nada(integer);
create or replace function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, monedas_trastienda integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuesta_previa integer;
  v_total_simple bigint := 0;
  v_correctos_simple bigint := 0;
  v_duelos bigint := 0;
  v_actividad bigint;
  v_umbral numeric;
  v_apuesta_maxima constant integer := 200;
  v_ciclos_hoy_previos integer;
  v_ciclos_fecha date;
  v_tiene_logic boolean;
  v_tiene_duelos boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;
  if p_monto > v_apuesta_maxima then
    raise exception 'la apuesta máxima es % Monedas', v_apuesta_maxima;
  end if;

  select pr.monedas_trastienda, pr.apuesta_monto, pr.apuesta_ciclos_hoy, pr.apuesta_ciclos_fecha
    into v_saldo, v_apuesta_previa, v_ciclos_hoy_previos, v_ciclos_fecha
  from public.profiles pr where pr.id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tienes una apuesta activa';
  end if;
  if v_ciclos_fecha is distinct from current_date then
    v_ciclos_hoy_previos := 0;
  end if;
  if v_ciclos_hoy_previos >= 10 then
    raise exception 'ya usaste las 10 apuestas de doble o nada de hoy — vuelve mañana';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Monedas para esa apuesta';
  end if;

  select count(*), count(*) filter (where correct) into v_total_simple, v_correctos_simple
  from public.attempts where user_id = v_user;

  v_tiene_logic := to_regclass('public.logic_attempts') is not null;
  if v_tiene_logic then
    select v_total_simple + count(*), v_correctos_simple + count(*) filter (where correct)
      into v_total_simple, v_correctos_simple
    from public.logic_attempts where user_id = v_user;
  end if;

  v_tiene_duelos := to_regclass('public.duel_results') is not null;
  if v_tiene_duelos then
    select count(*) into v_duelos from public.duel_results where user_id = v_user;
  end if;

  v_actividad := v_total_simple + v_duelos * 10;

  if v_actividad < 20 then
    raise exception 'juega un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_tiene_duelos and v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set monedas_trastienda = pr.monedas_trastienda - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral,
      apuesta_creada_at = now(),
      apuesta_ciclos_hoy = v_ciclos_hoy_previos + 1,
      apuesta_ciclos_fecha = current_date
  where pr.id = v_user;

  return query select v_umbral, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

drop function if exists public.resolver_apuesta_si_activa(numeric);

create function public.resolver_apuesta_si_activa()
returns table (resuelta boolean, gano boolean, monto integer, monedas_trastienda integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_monto integer;
  v_umbral numeric;
  v_desde timestamptz;
  v_total bigint := 0;
  v_correctos bigint := 0;
  v_precision numeric;
  v_gano boolean;
  v_tiene_logic boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.apuesta_monto, pr.apuesta_umbral, pr.apuesta_creada_at
    into v_monto, v_umbral, v_desde
  from public.profiles pr where pr.id = v_user;

  if v_monto is null or v_monto = 0 then
    return query select false, false, 0, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
    return;
  end if;

  -- Precisión calculada ACÁ, solo con intentos reales desde que se hizo la
  -- apuesta (v_desde) — nunca con un valor que mande el cliente.
  select count(*), count(*) filter (where correct) into v_total, v_correctos
  from public.attempts where user_id = v_user and created_at >= v_desde;

  v_tiene_logic := to_regclass('public.logic_attempts') is not null;
  if v_tiene_logic then
    select v_total + count(*), v_correctos + count(*) filter (where correct)
      into v_total, v_correctos
    from public.logic_attempts where user_id = v_user and created_at >= v_desde;
  end if;

  if v_total = 0 then
    -- Todavía no practicó nada desde que apostó: la apuesta sigue activa,
    -- se resuelve en un próximo finish (o la deja abierta indefinidamente).
    return query select false, false, 0, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_precision := v_correctos::numeric / v_total;
  v_gano := v_precision > coalesce(v_umbral, 1);

  update public.profiles as pr
  set monedas_trastienda = pr.monedas_trastienda + case when v_gano then v_monto * 2 else 0 end,
      apuesta_monto = 0,
      apuesta_umbral = null,
      apuesta_creada_at = null
  where pr.id = v_user;

  return query
    select true, v_gano, v_monto, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.resolver_apuesta_si_activa() to authenticated;


-- ---------- El resto de los juegos de la Trastienda: Monedas + gate de edad ----------

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.girar_ruleta();
create or replace function public.girar_ruleta()
returns table (
  segmento text,
  premio_tipo text,
  premio_detalle jsonb,
  monedas_ganadas integer,
  monedas_trastienda integer,
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — vuelve mañana';
  end if;

  v_costo := case when v_giros_hoy = 0 then 120 else 150 end;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo then
    raise exception 'te faltan Monedas para girar';
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

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - v_costo where pr.id = v_user;

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
      update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_chispas where pr.id = v_user;
      v_premio_tipo := 'monedas';
      v_premio_detalle := jsonb_build_object('chispas', v_chispas, 'fallback', true);
    else
      v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
      perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
      v_premio_tipo := 'titulo';
      v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
    end if;
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_chispas where pr.id = v_user;
    v_premio_tipo := 'monedas';
    v_premio_detalle := jsonb_build_object('chispas', v_chispas);
  elsif v_segmento = 'fuente' then
    select coalesce(array_agg(f), array[]::text[]) into v_disponibles
    from unnest(v_fuentes) t(f)
    where not (
      f = any (coalesce((select pr.fuentes_desbloqueadas from public.profiles pr where pr.id = v_user), array[]::text[]))
    );
    if cardinality(v_disponibles) = 0 then
      v_chispas := 200;
      update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_chispas where pr.id = v_user;
      v_premio_tipo := 'monedas';
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
      update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_chispas where pr.id = v_user;
      v_premio_tipo := 'monedas';
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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user),
    v_giros_hoy + 1,
    v_pity_new >= 3,
    v_costo;
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.tirar_volado(integer, boolean);
create or replace function public.tirar_volado(p_ronda integer, p_eleccion boolean)
returns table (
  cara boolean,
  ganaste boolean,
  entrada integer,
  monedas_ganadas integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;
  if p_ronda not between 1 and 3 then
    raise exception 'ronda invalida';
  end if;

  v_entrada := case p_ronda when 1 then 30 when 2 then 60 else 120 end;
  v_salida := case p_ronda when 1 then 55 when 2 then 110 else 220 end;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_entrada then
    raise exception 'te faltan Monedas para esa ronda';
  end if;

  v_cara := random() < 0.5;
  v_ganaste := v_cara = p_eleccion;

  update public.profiles as pr
  set monedas_trastienda = pr.monedas_trastienda - v_entrada + case when v_ganaste then v_salida else 0 end
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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.iniciar_la_pizarra();
create or replace function public.iniciar_la_pizarra()
returns table (
  pizarra_id uuid,
  entrada integer,
  partidas_hoy integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;

  select count(*) into v_partidas_hoy
  from public.trastienda_pizarra where user_id = v_user and fecha = current_date;

  if v_partidas_hoy >= 3 then
    raise exception 'ya jugaste las 3 partidas de hoy — vuelve mañana';
  end if;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Monedas para entrar a la pizarra';
  end if;

  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - 30 where pr.id = v_user;

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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.adivinar_la_pizarra(uuid, integer);
create or replace function public.adivinar_la_pizarra(p_pizarra_id uuid, p_numero integer)
returns table (
  ganaste boolean,
  terminado boolean,
  intentos integer,
  pista text,
  monedas_ganadas integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
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

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 10 then
    raise exception 'te faltan Monedas para esa pregunta';
  end if;

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - 10 where pr.id = v_user;

  v_fila.intentos := v_fila.intentos + 1;

  if p_numero = v_fila.secreto then
    v_ganaste := true;
    v_terminado := true;
    v_payout := case when v_fila.intentos <= 3 then 170 when v_fila.intentos <= 5 then 100 else 50 end;
    update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_payout where pr.id = v_user;
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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.apostar_partida(uuid, text, integer);
create or replace function public.apostar_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (
  apuesta_id uuid,
  multiplier numeric,
  ganancia_potencial integer,
  monedas_trastienda integer,
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
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
    raise exception 'superas el tope diario de 500 Monedas apostadas';
  end if;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Monedas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - p_monto where pr.id = v_user;

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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user),
    v_apuestas_hoy + 1,
    v_monto_hoy + p_monto;
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.apostar_prediccion_ranking(text, integer);
create function public.apostar_prediccion_ranking(p_puesto text, p_monto integer)
returns table (
  prediccion_id uuid,
  semana_inicio_out date,
  multiplier_out numeric,
  ganancia_potencial_out integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
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

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Monedas para esa predicción';
  end if;

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - p_monto where pr.id = v_user;

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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.iniciar_la_calcu();
create or replace function public.iniciar_la_calcu()
returns table (
  calcu_id uuid,
  numeros integer[],
  target integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 50 then
    raise exception 'te faltan Monedas para la calculadora';
  end if;

  select * into v_puzzle from public.generar_puzzle_calcu() p;

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - 50 where pr.id = v_user;

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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user)
  from public.trastienda_calcu c
  where c.user_id = v_user and c.minijuego_id = v_minijuego_id;
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.resolver_la_calcu(uuid, jsonb);
create or replace function public.resolver_la_calcu(p_calcu_id uuid, p_expresion jsonb)
returns table (
  ganaste boolean,
  monedas_ganadas integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
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
    return query select false, 0, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
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
    update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_payout where pr.id = v_user;
  end if;

  update public.trastienda_calcu
  set estado = case when v_resolvio then 'ganado' else 'perdido' end, resuelto_at = now()
  where id = p_calcu_id;

  update public.trastienda_minijuegos
  set salida = v_payout,
      resultado = jsonb_build_object('ganaste', v_resolvio, 'bonus', v_bonus = 1, 'expresion', p_expresion)
  where id = v_fila.minijuego_id;

  return query select v_resolvio, v_payout, (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.apostar_casino_elementos(text, integer);
create or replace function public.apostar_casino_elementos(p_zona text, p_monto integer)
returns table (
  zona text,
  monto integer,
  elegido text,
  elegido_nombre text,
  ganaste boolean,
  multiplier numeric,
  monedas_ganadas integer,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  monedas_trastienda integer
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
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

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Monedas para esa ficha';
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
  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - p_monto where pr.id = v_user;

  if v_ganaste then
    -- payout_total = monto × (118/n) × 0.88 → EV de casa ≈ 0.92.
    v_mult := round((118.0 / v_n) * 0.88, 2);
    v_pago := greatest(round(p_monto * v_mult::numeric), 1);
    update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_pago where pr.id = v_user;

    -- Ganancia rara (~5%): un premio de la rueda vieja, por ENCIMA de las Monedas.
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
          v_premio_tipo := 'monedas';
          v_premio_detalle := jsonb_build_object('monedas', 200, 'fallback', true);
          update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 200 where pr.id = v_user;
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
          v_premio_tipo := 'monedas';
          v_premio_detalle := jsonb_build_object('monedas', 300, 'fallback', true);
          update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 300 where pr.id = v_user;
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
          v_premio_tipo := 'monedas';
          v_premio_detalle := jsonb_build_object('monedas', 200, 'fallback', true);
          update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 200 where pr.id = v_user;
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
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

-- CREATE OR REPLACE no puede renombrar columnas de salida cuando hay más de una (puntos_total/chispas_ganadas -> monedas_*): hace falta DROP primero.
drop function if exists public.apostar_casino_elementos_multi(text[], integer[]);
create or replace function public.apostar_casino_elementos_multi(p_zonas text[], p_montos integer[])
returns table (
  elegido text,
  elegido_nombre text,
  apuestas jsonb,
  premio_tipo text,
  premio_detalle jsonb,
  apuestas_hoy integer,
  monedas_trastienda integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_apuestas_hoy integer;
  v_cantidad integer;
  v_costo_total integer := 0;
  v_i integer;
  v_zona text;
  v_monto integer;
  v_n integer;
  v_elegido text;
  v_elegido_nombre text;
  v_gano_alguna boolean := false;
  v_pago_total integer := 0;
  v_apuestas_json jsonb := '[]'::jsonb;
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
  if not public.puede_usar_trastienda(v_user) then
    raise exception 'esta sección de la Trastienda pide confirmar que tienes 14 años o más';
  end if;

  v_cantidad := coalesce(array_length(p_zonas, 1), 0);
  if v_cantidad < 1 or v_cantidad > 5 then
    raise exception 'elegí entre 1 y 5 zonas por giro';
  end if;
  if coalesce(array_length(p_montos, 1), 0) <> v_cantidad then
    raise exception 'cada zona necesita su ficha';
  end if;

  for v_i in 1..v_cantidad loop
    if p_montos[v_i] not in (100, 250, 500, 1000) then
      raise exception 'monto de ficha invalido';
    end if;
    if not exists (select 1 from public.casino_elementos_en_zona(p_zonas[v_i])) then
      raise exception 'zona invalida';
    end if;
    v_costo_total := v_costo_total + p_montos[v_i];
  end loop;

  select count(*) into v_apuestas_hoy
  from public.trastienda_casino
  where user_id = v_user and fecha = current_date;

  if v_apuestas_hoy + v_cantidad > 20 then
    raise exception 'te quedan % fichas hoy — bajá zonas o esperá a mañana', greatest(20 - v_apuestas_hoy, 0);
  end if;

  select pr.monedas_trastienda into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < v_costo_total then
    raise exception 'te faltan Monedas para esas fichas';
  end if;

  -- Un solo giro real: el croupier elige UN elemento entre los 118, y
  -- todas las fichas de esta tirada se evalúan contra ese mismo resultado.
  select e.simbolo, e.nombre into v_elegido, v_elegido_nombre
  from public.trastienda_casino_elementos e
  order by random()
  limit 1;

  update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda - v_costo_total where pr.id = v_user;

  for v_i in 1..v_cantidad loop
    v_zona := p_zonas[v_i];
    v_monto := p_montos[v_i];

    select count(*) into v_n from public.casino_elementos_en_zona(v_zona);

    declare
      v_gano boolean;
      v_mult numeric;
      v_pago_zona integer := 0;
    begin
      select exists (
        select 1 from public.casino_elementos_en_zona(v_zona) m where m.simbolo = v_elegido
      ) into v_gano;

      v_mult := round((118.0 / greatest(v_n, 1)) * 0.88, 2);

      if v_gano then
        v_pago_zona := greatest(round(v_monto * v_mult::numeric), 1);
        v_pago_total := v_pago_total + v_pago_zona;
        v_gano_alguna := true;
      end if;

      insert into public.trastienda_casino
        (user_id, zona, apuesta_numero, monto, elegido, ganaste, pago)
      values
        (v_user, v_zona, v_apuestas_hoy + v_i, v_monto, v_elegido, v_gano, v_pago_zona);

      v_apuestas_json := v_apuestas_json || jsonb_build_object(
        'zona', v_zona,
        'monto', v_monto,
        'ganaste', v_gano,
        'multiplier', v_mult,
        'monedas_ganadas', v_pago_zona
      );
    end;
  end loop;

  if v_pago_total > 0 then
    update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + v_pago_total where pr.id = v_user;
  end if;

  -- Ganancia rara (~5%, una sola vez por giro, solo si ganó al menos una ficha).
  if v_gano_alguna and random() < 0.05 then
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
        v_premio_tipo := 'monedas';
        v_premio_detalle := jsonb_build_object('monedas', 200, 'fallback', true);
        update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 200 where pr.id = v_user;
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
        v_premio_tipo := 'monedas';
        v_premio_detalle := jsonb_build_object('monedas', 300, 'fallback', true);
        update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 300 where pr.id = v_user;
      else
        v_elegido_item := v_disponibles[1 + floor(random() * cardinality(v_disponibles))::int];
        update public.profiles
        set marcos_desbloqueados = coalesce(marcos_desbloqueados, array[]::text[]) || array[v_elegido_item]
        where id = v_user;
        v_premio_tipo := 'marco';
        v_premio_detalle := jsonb_build_object('marco', v_elegido_item);
      end if;
    else
      select t.slug into v_titulo_slug
      from public.titulos_trastienda_base() t
      where t.slug not in (
        select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
      )
      order by random()
      limit 1;
      if v_titulo_slug is null then
        v_premio_tipo := 'monedas';
        v_premio_detalle := jsonb_build_object('monedas', 200, 'fallback', true);
        update public.profiles as pr set monedas_trastienda = pr.monedas_trastienda + 200 where pr.id = v_user;
      else
        v_titulo_nombre := public.nombre_titulo_trastienda(v_titulo_slug);
        perform public.desbloquear_titulo_propio(v_titulo_slug, v_titulo_nombre, 'trastienda');
        v_premio_tipo := 'titulo';
        v_premio_detalle := jsonb_build_object('titulo', v_titulo_slug, 'nombre', v_titulo_nombre);
      end if;
    end if;
  end if;

  return query select
    v_elegido,
    v_elegido_nombre,
    v_apuestas_json,
    v_premio_tipo,
    v_premio_detalle,
    v_apuestas_hoy + v_cantidad,
    (select pr.monedas_trastienda from public.profiles pr where pr.id = v_user);
end;
$$;

create or replace function public.resolver_apuesta_partida(p_partida_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_duelo public.duels%rowtype;
  v_puntaje_a integer;
  v_puntaje_b integer;
  v_resultado text;
  v_monto integer;
  v_mult numeric;
  v_estado text;
  v_payout integer;
  v_record record;
begin
  select * into v_duelo from public.duels where id = p_partida_id;
  if not found or v_duelo.estado <> 'completado' then
    return;
  end if;

  select puntaje_final into v_puntaje_a
  from public.duel_results where duel_id = p_partida_id and user_id = v_duelo.retador_id;
  select puntaje_final into v_puntaje_b
  from public.duel_results where duel_id = p_partida_id and user_id = v_duelo.retado_id;

  if v_puntaje_a is null or v_puntaje_b is null then
    return;
  end if;

  if v_puntaje_a > v_puntaje_b then
    v_resultado := 'a';
  elsif v_puntaje_b > v_puntaje_a then
    v_resultado := 'b';
  else
    v_resultado := 'empate';
  end if;

  for v_record in
    select a.id as apuesta_id, a.user_id, a.eleccion, a.monto, a.multiplier, a.ganancia_potencial
    from public.trastienda_apuestas a
    where a.partida_id = p_partida_id and a.partida_tipo = 'duelo' and a.estado = 'pendiente'
  loop
    if v_record.eleccion = v_resultado then
      v_estado := 'ganada';
      v_payout := v_record.ganancia_potencial;
    elsif v_resultado = 'empate' then
      v_estado := 'empate_devuelto';
      v_payout := v_record.monto;
    else
      v_estado := 'perdida';
      v_payout := 0;
    end if;

    if v_payout > 0 then
      update public.profiles set monedas_trastienda = monedas_trastienda + v_payout where id = v_record.user_id;
    end if;

    update public.trastienda_apuestas
    set estado = v_estado, resultado_final = v_resultado, payout = v_payout, resuelto_at = now()
    where id = v_record.apuesta_id;

    if v_estado = 'perdida' then
      insert into public.trastienda_limites_diarios (user_id, fecha, perdida_total)
      values (v_record.user_id, current_date, v_record.monto)
      on conflict (user_id) do update set
        fecha = current_date,
        perdida_total = public.trastienda_limites_diarios.perdida_total + v_record.monto;
    end if;
  end loop;
end;
$$;

create or replace function public.resolver_prediccion_ranking(p_semana date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record record;
  v_posicion bigint;
  v_puesto_rank text;
  v_estado text;
  v_payout integer;
  v_centro numeric;
  v_distancia numeric;
begin
  for v_record in
    select id, user_id, puesto_predicho, monto, multiplier, ganancia_potencial
    from public.trastienda_predicciones_ranking
    where semana_inicio = p_semana and estado = 'pendiente'
  loop
    select r.posicion into v_posicion
    from public.ranking_semanal_de_semana(p_semana) r
    where r.user_id = v_record.user_id;

    -- Ausente (cero XP esa semana): se ubica peor que el puesto 20.
    if v_posicion is null then
      v_posicion := 99;
    end if;

    v_puesto_rank := case
      when v_posicion = 1 then '1'
      when v_posicion = 2 then '2'
      when v_posicion = 3 then '3'
      when v_posicion between 4 and 5 then '4-5'
      when v_posicion between 6 and 10 then '6-10'
      when v_posicion between 11 and 20 then '11-20'
      else '21+'
    end;

    if v_puesto_rank = v_record.puesto_predicho then
      v_estado := 'ganada';
      v_payout := v_record.ganancia_potencial;
    else
      -- ±2 posiciones alrededor del centro del rango predicho → parcial 50%.
      v_centro := case v_record.puesto_predicho
        when '1' then 1.0
        when '2' then 2.0
        when '3' then 3.0
        when '4-5' then 4.5
        when '6-10' then 8.0
        when '11-20' then 15.5
        else 25.0
      end;
      v_distancia := abs(v_posicion - v_centro);
      if v_distancia <= 2 then
        v_estado := 'parcial';
        v_payout := floor(v_record.ganancia_potencial * 0.5);
      else
        v_estado := 'perdida';
        v_payout := 0;
      end if;
    end if;

    if v_payout > 0 then
      update public.profiles set monedas_trastienda = monedas_trastienda + v_payout where id = v_record.user_id;
    end if;

    update public.trastienda_predicciones_ranking
    set estado = v_estado, payout = v_payout, puesto_real = v_posicion, resuelto_at = now()
    where id = v_record.id;
  end loop;
end;
$$;

-- El DROP FUNCTION de cada función de arriba (necesario para renombrar
-- columnas de salida) borra también sus permisos — hay que volver a
-- otorgarlos, si no ningún usuario podría llamarlas más.
grant execute on function public.apostar_doble_o_nada(integer) to authenticated;
grant execute on function public.girar_ruleta() to authenticated;
grant execute on function public.tirar_volado(integer, boolean) to authenticated;
grant execute on function public.iniciar_la_pizarra() to authenticated;
grant execute on function public.adivinar_la_pizarra(uuid, integer) to authenticated;
grant execute on function public.apostar_partida(uuid, text, integer) to authenticated;
grant execute on function public.apostar_prediccion_ranking(text, integer) to authenticated;
grant execute on function public.iniciar_la_calcu() to authenticated;
grant execute on function public.resolver_la_calcu(uuid, jsonb) to authenticated;
grant execute on function public.apostar_casino_elementos(text, integer) to authenticated;
grant execute on function public.apostar_casino_elementos_multi(text[], integer[]) to authenticated;

-- Saldo inicial único para cuentas que ya jugaban antes de que existiera
-- esta columna: su Experiencia histórica real, topada en 3000. No se
-- vuelve a correr (solo toca filas todavía en 0); no usa Chispas actuales
-- porque esas pueden incluir compras.
update public.profiles set monedas_trastienda = least(xp_historico_total, 3000)
where monedas_trastienda = 0 and xp_historico_total > 0;

notify pgrst, 'reload schema';
