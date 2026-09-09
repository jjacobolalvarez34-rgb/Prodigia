-- 0121: Trastienda — economía server (ruleta, volado, pizarra, historial)
-- + fix resiliente del "doble o nada" (este proyecto: 0120 era la última).
--
-- Implementa el primer corte de TRASTIENDA-ECONOMIA.md, server-authoritative:
--   - Mecánica 4 (ruleta): EV ~0.92, límite 5 giros/día, 1er giro 120 (descuento
--     20%), pity en 3 "sin premio" seguidos.
--   - Mecánica 5 cortada a los 2 minijuegos 100% validables en server SIN que el
--     cliente tenga que pasarle un resultado: Volado (RNG server-side, cara/cruz
--     cosmético sobre una tirada 50/50) y La Pizarra (el server guarda el número,
--     nunca se lo muestra al cliente — solo pistas mayor/menor).
--     La Calcu / Acertijos / El Reloj quedan como corte siguiente (PENDIENTE en
--     TECH-DEBT): requieren sessiones propias o validación server de la expresión.
--   - Historial reciente (últimas 8 interacciones).
--   - Mecánica 1 (apostar a partida de otro) y Mecánica 2 (predicción de ranking)
--     y Mecánica 3 (títulos de Trastienda): NO son parte de esta migración —
--     dependen de la máquina de estados de duels/rankeds y del job semanal de
--     ranking (ver DECISIONS.md 2026-09-09). El segmento 'titulo' de la ruleta
--     entrega un escudo (placeholder) hasta que exista esa mecánica.
--
-- FIX doble o nada (roots): apostar_doble_o_nada (0054) contaba actividad con
-- logic_attempts y duel_results. Si en prod esas tablas no existían al momento de
-- aplicar 0054 (o la migración no se aplicó completa), la función rompe con 42P01
-- (relación no existe) — un código != P0001, así que respuestaError la traduce al
-- genérico "Algo salió mal. Probá de nuevo." (lo que vio el PO). Se recrea acá
-- RESILIENTE: suma logic_attempts/duel_results solo si existen (to_regclass) y
-- garantiza las columnas apuesta_monto/apuesta_umbral.

-- ---------- 1) Garantías de columnas del doble o nada ----------
alter table public.profiles add column if not exists apuesta_monto integer not null default 0;
alter table public.profiles add column if not exists apuesta_umbral numeric;

-- ---------- 2) Tablas ----------
create table public.trastienda_ruleta (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  fecha date not null default current_date,
  segmento text not null,
  premio_tipo text,
  premio_detalle jsonb,
  giro_numero integer not null check (giro_numero between 1 and 5),
  pity_counter integer not null default 0,
  costo_aplicado integer not null check (costo_aplicado in (120, 150)),
  creado_at timestamptz not null default now(),
  constraint trastienda_ruleta_solo_propia check (user_id = auth.uid())
);

create table public.trastienda_minijuegos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  juego text not null,
  entrada integer not null,
  salida integer not null default 0,
  resultado jsonb,
  mejor_racha integer not null default 0,
  racha_actual integer not null default 0,
  creado_at timestamptz not null default now(),
  constraint trastienda_mini_solo_propia check (user_id = auth.uid())
);

-- La Pizarra guarda el secreto: NUNCA se le da SELECT al cliente ni a
-- authenticated. Solo las funciones security definer la tocan.
create table public.trastienda_pizarra (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  fecha date not null default current_date,
  secreto integer not null check (secreto between 1 and 100),
  intentos integer not null default 0,
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  resuelto_at timestamptz,
  creado_at timestamptz not null default now(),
  constraint trastienda_pizarra_solo_propia check (user_id = auth.uid())
);

-- ---------- 3) RLS: lectura propia en ruleta/minijuegos; pizarra cerrada ----------
alter table public.trastienda_ruleta enable row level security;
alter table public.trastienda_minijuegos enable row level security;
alter table public.trastienda_pizarra enable row level security;

create policy "trastienda_ruleta: lectura propia" on public.trastienda_ruleta
  for select using (auth.uid() = user_id);
create policy "trastienda_minijuegos: lectura propia" on public.trastienda_minijuegos
  for select using (auth.uid() = user_id);
-- public.trastienda_pizarra no tiene policies ni grants: invisible salvo por RPC.

-- ---------- 4) Ruleta ----------
-- ORDEN DE SEGMENTOS (probabilidades acumuladas) — espejo del cliente en
-- src/lib/trastienda/ruleta.ts (mismo orden para que la aguja aterrice bien).
-- Probabilidades (non-pity) según TRASTIENDA-ECONOMIA.md §4 (EV 138.5/150 = 0.923):
--   boost 5 | escudo 8 | congelamiento 6 | 50ch 12 | 25ch 20 | 100ch 3
--   fuente 2 | marco 1.5 | titulo 0.5 | nada 42   = 100
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
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select count(*) into v_giros_hoy
  from public.trastienda_ruleta
  where user_id = v_user and fecha = current_date;

  if v_giros_hoy >= 5 then
    raise exception 'ya giraste las 5 veces de hoy — volvé mañana';
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
    -- Pity: 3 sin premio seguidos -> premio menor garantizado (25+, 50+ o escudo).
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

  -- Costo: se descuenta siempre.
  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

  if v_segmento = 'boost' then
    update public.profiles set boost_multiplicador_pendiente = 1.5 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'boost');
  elsif v_segmento in ('escudo', 'titulo') then
    -- 'titulo' es placeholder: sin Mecánica 3 los títulos no se pueden otorgar
    -- con criterio real, así que entrega un escudo (decisión en DECISIONS.md).
    update public.profiles set escudos_extra_pendientes = escudos_extra_pendientes + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'escudo');
  elsif v_segmento = 'congelamiento' then
    update public.profiles set congelamientos_disponibles = congelamientos_disponibles + 1 where id = v_user;
    v_premio_tipo := 'item';
    v_premio_detalle := jsonb_build_object('item', 'congelamiento');
  elsif v_segmento in ('chispas_25', 'chispas_50', 'chispas_100') then
    v_chispas := (string_to_array(v_segmento, '_'))[2]::int;
    update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
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
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
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
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
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

-- ---------- 5) Volado ----------
-- Ronda 1: entrada 30 -> 55 (×1.83) · Ronda 2: 60 -> 110 · Ronda 3: 120 -> 220.
-- EV por ronda 0.5 × 1.83 = 0.915. Sin carryover de pozo entre rondas (corte
-- seguro): cada ronda es una apuesta independiente con la misma proporción.
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

  update public.profiles
  set puntos_total = puntos_total - v_entrada + case when v_ganaste then v_salida else 0 end
  where id = v_user;

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

-- ---------- 6) La Pizarra ----------
-- Entrada 30; cada pregunta 10; máx 7 intentos. Pago 170 (1-3), 100 (4-5),
-- 50 (6-7). EV ≈ 0.96 según TRASTIENDA-ECONOMIA.md §5. Límite 3 sesiones/día.
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
  v_del_dia integer;
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
    raise exception 'ya jugaste las 3 partidas de hoy — volvé mañana';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 30 then
    raise exception 'te faltan Chispas para entrar a la pizarra';
  end if;

  -- Una pizarra sin terminar queda cerrada como perdida al entrar a otra.
  update public.trastienda_pizarra
  set estado = 'perdido', resuelto_at = now()
  where user_id = v_user and estado = 'jugando';

  v_numero := 1 + floor(random() * 100)::int;

  update public.profiles set puntos_total = puntos_total - 30 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'la_pizarra', 30)
  returning id into v_minijuego_id;

  insert into public.trastienda_pizarra (user_id, minijuego_id, secreto)
  values (v_user, v_minijuego_id, v_numero)
  returning id into v_del_dia; -- reusar como variable temporal (el id de la sesión)

  return query select
    v_del_dia,
    30,
    v_partidas_hoy + 1,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

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

  update public.profiles set puntos_total = puntos_total - 10 where id = v_user;

  v_fila.intentos := v_fila.intentos + 1;

  if p_numero = v_fila.secreto then
    v_ganaste := true;
    v_terminado := true;
    v_payout := case when v_fila.intentos <= 3 then 170 when v_fila.intentos <= 5 then 100 else 50 end;
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
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

-- ---------- 7) Historial reciente ----------
create or replace function public.fetch_trastienda_historial()
returns table (
  tipo text,
  titulo text,
  detalle jsonb,
  monto integer,
  creado_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  return query
    with r as (
      select 'ruleta'::text as tipo, r.segmento as titulo, r.premio_detalle as detalle,
        coalesce((r.premio_detalle->>'chispas')::integer, 0) as monto, r.creado_at
      from public.trastienda_ruleta r
      where r.user_id = v_user
    ),
    m as (
      select 'minijuego'::text as tipo, m.juego as titulo, m.resultado as detalle,
        m.salida as monto, m.creado_at
      from public.trastienda_minijuegos m
      where m.user_id = v_user
    ),
    p as (
      select 'pizarra'::text as tipo, 'la_pizarra'::text as titulo,
        jsonb_build_object('estado', p.estado, 'intentos', p.intentos) as detalle,
        case when p.estado = 'ganado'
          then case when p.intentos <= 3 then 170 when p.intentos <= 5 then 100 else 50 end
          else 0 end as monto,
        p.creado_at
      from public.trastienda_pizarra p
      where p.user_id = v_user
    )
    select * from r
    union all select * from m
    union all select * from p
    order by creado_at desc
    limit 8;
end;
$$;

-- ---------- 8) FIX doble o nada resiliente ----------
-- Recrea apostar_doble_o_nada con la lógica de 0054 pero sin depender de que
-- logic_attempts/duel_results existan: si no están, se ignora su aporte de
-- actividad (sin 42P01 -> el cliente ya no ve "Algo salió mal" genérico).
create or replace function public.apostar_doble_o_nada(p_monto integer)
returns table (umbral numeric, puntos_total integer)
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
  v_tiene_logic boolean;
  v_tiene_duelos boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_monto <= 0 then
    raise exception 'monto invalido';
  end if;
  if p_monto > v_apuesta_maxima then
    raise exception 'la apuesta máxima es % Chispas', v_apuesta_maxima;
  end if;

  select pr.puntos_total, pr.apuesta_monto into v_saldo, v_apuesta_previa
  from public.profiles pr where pr.id = v_user;

  if v_apuesta_previa > 0 then
    raise exception 'ya tenes una apuesta activa';
  end if;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
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
    raise exception 'jugá un poco más antes de poder apostar';
  end if;

  if v_total_simple >= 5 then
    v_umbral := v_correctos_simple::numeric / v_total_simple;
  elsif v_tiene_duelos and v_duelos > 0 then
    select avg(precision) into v_umbral from public.duel_results where user_id = v_user;
  else
    v_umbral := 0.7;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - p_monto,
      apuesta_monto = p_monto,
      apuesta_umbral = v_umbral
  where pr.id = v_user;

  return query select v_umbral, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- Se recrea también para garantizar presencia en prod (si 0025 no se aplicó,
-- /api/practica/finish y /api/enigmia/finish la llaman y hoy ni existiría).
create or replace function public.resolver_apuesta_si_activa(p_precision numeric)
returns table (resuelta boolean, gano boolean, monto integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_monto integer;
  v_umbral numeric;
  v_gano boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.apuesta_monto, pr.apuesta_umbral into v_monto, v_umbral
  from public.profiles pr where pr.id = v_user;

  if v_monto is null or v_monto = 0 then
    return query select false, false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_gano := p_precision > coalesce(v_umbral, 1);

  update public.profiles as pr
  set puntos_total = pr.puntos_total + case when v_gano then v_monto * 2 else 0 end,
      apuesta_monto = 0,
      apuesta_umbral = null
  where pr.id = v_user;

  return query
    select true, v_gano, v_monto, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

-- ---------- 9) Grants ----------
grant execute on function public.girar_ruleta() to authenticated;
grant execute on function public.tirar_volado(integer, boolean) to authenticated;
grant execute on function public.iniciar_la_pizarra() to authenticated;
grant execute on function public.adivinar_la_pizarra(uuid, integer) to authenticated;
grant execute on function public.fetch_trastienda_historial() to authenticated;
grant execute on function public.apostar_doble_o_nada(integer) to authenticated;
grant execute on function public.resolver_apuesta_si_activa(numeric) to authenticated;

grant select on public.trastienda_ruleta to authenticated;
grant select on public.trastienda_minijuegos to authenticated;
-- public.trastienda_pizarra: sin grants (el secreto no se expone nunca).