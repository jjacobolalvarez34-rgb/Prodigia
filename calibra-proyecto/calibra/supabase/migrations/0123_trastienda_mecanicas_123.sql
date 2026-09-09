-- 0123: Trastienda — Mecánica 1 (apuestas a duelos de otros), Mecánica 2
-- (predicción de puesto en el ranking semanal) y Mecánica 3 (títulos de
-- Trastienda). Siguen a 0122_arreglo_pizarra.sql.
--
-- TRASTIENDA-ECONOMIA.md §1-§3, server-authoritative:
--   - M1: tabla trastienda_apuestas + RPCs fetch_apuestas_disponibles /
--         apostar_partida / preview_apuesta_partida / resolver_apuesta_partida.
--         Resolución automática por trigger cuando un duelo se completa.
--         Alcance inicial: SOLO duelos (la única máquina de partidas de
--         OTROS auditada completa: duels + duel_results + profiles.elo_rating).
--         rankeds/reto_semanal quedan para un corte futuro (el tipo de la
--         tabla ya los contempla en ejemplos, ver nota en DECISIONS).
--   - M2: tabla trastienda_predicciones_ranking + RPC apostar_prediccion_
--         ranking / resolver_prediccion_ranking (+ ranking_semanal_de_semana,
--         variante historizable del ranking semanal). Self-heal: al apostar la
--         semana siguiente, se resuelve la predicción de la semana pasada.
--   - M3: los títulos viven en el catálogo TS (src/lib/titulos/*). Acá solo
--         se deja de usar el placeholder: el segmento 'titulo' de la ruleta
--         pasa a desbloquear un título de Trastienda real vía
--         desbloquear_titulo_propio (cuyo slug/nombre conoce el server).
--
-- Convenciones copiadas de 0121: security definer + search_path public,
-- CHECKs en tablas, políticas de select propias, grants acotados.

-- ---------- 1) Tablas ----------
-- IDEMPOTENTE: si 0123 se corrió a medias (re-ejecutable completo sin error).
-- Apuestas a partidas de OTROS jugadores (M1). El partida_id apunta a
-- duels.id mientras partida_tipo = 'duelo'. Eleccion: 'a' (retador) | 'b'
-- (retado) | 'empate'. El multiplier se lockea al apostar (server), nunca
-- se recalcula contra el cliente.
create table if not exists public.trastienda_apuestas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  partida_id uuid not null,
  partida_tipo text not null default 'duelo' check (partida_tipo in ('duelo')),
  jugador_a_id uuid,
  jugador_b_id uuid,
  eleccion text not null check (eleccion in ('a', 'b', 'empate')),
  monto integer not null check (monto in (25, 50, 100, 200)),
  multiplier numeric(5, 2) not null,
  ganancia_potencial integer not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'ganada', 'perdida', 'empate_devuelto')),
  resultado_final text check (resultado_final in ('a', 'b', 'empate')),
  payout integer not null default 0,
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz,
  constraint trastienda_apuestas_sin_autoapuesta check (user_id <> jugador_a_id and user_id <> jugador_b_id),
  constraint trastienda_apuestas_una_por_partida unique (user_id, partida_id)
);

-- Límites diarios de M1 (10 apuestas y 500 Chispas apostadas por día).
create table if not exists public.trastienda_limites_diarios (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  fecha date not null default current_date,
  apuestas_realizadas integer not null default 0 check (apuestas_realizadas >= 0),
  monto_total_apostado integer not null default 0 check (monto_total_apostado >= 0),
  perdida_total integer not null default 0 check (perdida_total >= 0)
);

-- Predicciones de ranking semanal (M2). Una por usuario y semana (unique).
create table if not exists public.trastienda_predicciones_ranking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  semana_inicio date not null,
  puesto_predicho text not null check (puesto_predicho in ('1', '2', '3', '4-5', '6-10', '11-20', '21+')),
  monto integer not null check (monto in (25, 50, 100, 200)),
  multiplier numeric(5, 2) not null,
  ganancia_potencial integer not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'ganada', 'parcial', 'perdida')),
  payout integer not null default 0,
  puesto_real integer,
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz,
  constraint trastienda_predicciones_una_por_semana unique (user_id, semana_inicio)
);

-- ---------- 2) RLS ----------
alter table public.trastienda_apuestas enable row level security;
alter table public.trastienda_limites_diarios enable row level security;
alter table public.trastienda_predicciones_ranking enable row level security;

drop policy if exists "trastienda_apuestas: lectura propia" on public.trastienda_apuestas;
create policy "trastienda_apuestas: lectura propia" on public.trastienda_apuestas
  for select using (auth.uid() = user_id);
drop policy if exists "trastienda_limites_diarios: lectura propia" on public.trastienda_limites_diarios;
create policy "trastienda_limites_diarios: lectura propia" on public.trastienda_limites_diarios
  for select using (auth.uid() = user_id);
drop policy if exists "trastienda_predicciones: lectura propia" on public.trastienda_predicciones_ranking;
create policy "trastienda_predicciones: lectura propia" on public.trastienda_predicciones_ranking
  for select using (auth.uid() = user_id);
-- Escrituras solo vía RPCs security definer (resuelven + pagan + deducen).

-- ---------- 3) Ranking semanal historizable (M2) ----------
-- Igual que ranking_semanal() (0006) pero para UNA semana pasada: el
-- ranking_semanal() existente siempre mira la semana ACTUAL, así que no
-- sirve para resolver la predicción de la semana que ya cerró.
create or replace function public.ranking_semanal_de_semana(p_semana date)
returns table (
  user_id uuid,
  posicion bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id as user_id,
         row_number() over (order by coalesce(sum(dp.xp_ganado), 0) desc, p.id) as posicion
  from public.profiles p
  left join public.daily_progress dp
    on dp.user_id = p.id
    and dp.fecha >= p_semana
    and dp.fecha < p_semana + 7
  group by p.id
  having coalesce(sum(dp.xp_ganado), 0) > 0
  order by posicion;
$$;

grant execute on function public.ranking_semanal_de_semana(date) to authenticated;

-- ---------- 4) M1 — multiplier lockeado por ΔELO (TRASTIENDA-ECONOMIA.md §1) ----------
-- Favorito = el de mayor ELO; underdog = el de menor. Si empatan, las tres
-- elecciones usan la columna de "favorito" (1.85/1.85/3.50).
create or replace function public.multiplier_apuesta_partida(p_elo_a integer, p_elo_b integer, p_eleccion text)
returns numeric
language plpgsql
stable
as $$
declare
  v_delta integer := abs(p_elo_a - p_elo_b);
  v_es_a_favorito boolean := p_elo_a >= p_elo_b;
begin
  if p_elo_a = p_elo_b then
    v_es_a_favorito := true;
  end if;
  if p_eleccion = 'empate' then
    if v_delta <= 50 then return 3.50;
    elsif v_delta <= 150 then return 4.00;
    elsif v_delta <= 300 then return 5.00;
    else return 6.00;
    end if;
  end if;
  -- eleccion 'a' o 'b': favorito si coincide con el mayor ELO.
  if (v_es_a_favorito and p_eleccion = 'a') or (not v_es_a_favorito and p_eleccion = 'b') then
    if v_delta <= 50 then return 1.85;
    elsif v_delta <= 150 then return 1.50;
    elsif v_delta <= 300 then return 1.30;
    else return 1.15;
    end if;
  end if;
  -- underdog
  if v_delta <= 50 then return 1.85;
  elsif v_delta <= 150 then return 2.30;
  elsif v_delta <= 300 then return 3.00;
  else return 4.00;
  end if;
end;
$$;

-- ---------- 5) M1 — feed de partidas disponibles ----------
-- Security definer a propósito: la RLS de duels esconde los duelos ajenos,
-- y este es el único canal (acotado) por el que el cliente los ve: solo
-- id, estado, operación, nombres de pila y ELO de duelos en curso o
-- esperando, en los que el usuario NO participa y a los que todavía NO
-- apostó. Máximo 20.
create or replace function public.fetch_apuestas_disponibles()
returns table (
  partida_id uuid,
  tipo text,
  estado text,
  operation_type text,
  jugador_a_id uuid,
  jugador_b_id uuid,
  nombre_a text,
  nombre_b text,
  elo_a integer,
  elo_b integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id as partida_id,
    'duelo'::text as tipo,
    d.estado,
    d.operation_type,
    d.retador_id as jugador_a_id,
    d.retado_id as jugador_b_id,
    pa.display_name as nombre_a,
    pb.display_name as nombre_b,
    pa.elo_rating as elo_a,
    pb.elo_rating as elo_b
  from public.duels d
  join public.profiles pa on pa.id = d.retador_id
  join public.profiles pb on pb.id = d.retado_id
  where d.estado in ('pendiente', 'en_curso')
    and auth.uid() not in (d.retador_id, d.retado_id)
    and not exists (
      select 1 from public.trastienda_apuestas a
      where a.user_id = auth.uid() and a.partida_id = d.id
    )
  order by d.creado_at desc
  limit 20;
$$;

grant execute on function public.fetch_apuestas_disponibles() to authenticated;

-- ---------- 6) M1 — preview de odds (para el modal de confirmación) ----------
-- No lockea nada: es el número que el cliente muestra ANTES de confirmar.
-- El lockeo real ocurre en apostar_partida, que recalculA el mismo
-- multiplier (una sola fuente: multiplier_apuesta_partida).
create or replace function public.preview_apuesta_partida(p_partida_id uuid, p_eleccion text, p_monto integer)
returns table (multiplier numeric, ganancia_potencial integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user uuid := auth.uid();
  v_duelo public.duels%rowtype;
  v_elo_a integer;
  v_elo_b integer;
  v_mult numeric;
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

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;

  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  return query select
    v_mult,
    floor(p_monto * v_mult)::int,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.preview_apuesta_partida(uuid, text, integer) to authenticated;

-- ---------- 7) M1 — apostar ----------
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
  -- Prohibir auto-apuestas: el apostador no puede ser participante.
  if v_user in (v_duelo.retador_id, v_duelo.retado_id) then
    raise exception 'no se puede apostar a una partida propia';
  end if;
  -- Una apuesta por partida (mensaje amigable; el unique de la tabla es el respaldo).
  if exists (
    select 1 from public.trastienda_apuestas
    where user_id = v_user and partida_id = p_partida_id
  ) then
    raise exception 'ya apostaste a esa partida';
  end if;

  -- Límites diarios (fila de hoy; si la fila es de otro día, se resetea).
  select * into v_fila_limite
  from public.trastienda_limites_diarios
  where user_id = v_user;
  if found and v_fila_limite.fecha = current_date then
    v_apuestas_hoy := v_fila_limite.apuestas_realizadas;
    v_monto_hoy := v_fila_limite.monto_total_apostado;
    v_perdida_hoy := v_fila_limite.perdida_total;
  end if;

  if v_apuestas_hoy >= 10 then
    raise exception 'ya apostaste las 10 veces de hoy — volvé mañana';
  end if;
  if v_monto_hoy + p_monto > 500 then
    raise exception 'superás el tope diario de 500 Chispas apostadas';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa apuesta';
  end if;

  select elo_rating into v_elo_a from public.profiles where id = v_duelo.retador_id;
  select elo_rating into v_elo_b from public.profiles where id = v_duelo.retado_id;
  v_mult := public.multiplier_apuesta_partida(v_elo_a, v_elo_b, p_eleccion);

  -- Deducción atómica + registro de la apuesta en una transacción.
  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

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

-- ---------- 8) M1 — resolución ----------
-- Gana quien tenga mayor puntaje_final en duel_results; empate si son
-- iguales. Demorado hasta que el duelo esté completado (lo garantiza el
-- trigger de abajo sobre duel_results).
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
      update public.profiles set puntos_total = puntos_total + v_payout where id = v_record.user_id;
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

-- Trigger: cuando un duelo se completa (ambos resultados + estado), se
-- resuelven las apuestas pendientes de esa partida automáticamente.
create or replace function public.delayed_resolver_apuestas_duelo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
  v_retador uuid;
  v_retado uuid;
begin
  select d.estado, d.retador_id, d.retado_id into v_estado, v_retador, v_retado
  from public.duels d where d.id = NEW.duel_id;
  if v_estado = 'completado' then
    perform public.resolver_apuesta_partida(NEW.duel_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trastienda_resolver_apuesta_duelo on public.duel_results;
create trigger trastienda_resolver_apuesta_duelo
  after insert or update on public.duel_results
  for each row execute function public.delayed_resolver_apuestas_duelo();

-- ---------- 9) M2 — multipliers de predicción (TRASTIENDA-ECONOMIA.md §2 ajustado) ----------
create or replace function public.multiplier_prediccion(p_puesto text)
returns numeric
language plpgsql
stable
as $$
begin
  return case p_puesto
    when '1' then 6.00
    when '2' then 4.00
    when '3' then 3.00
    when '4-5' then 2.20
    when '6-10' then 1.65
    when '11-20' then 1.30
    when '21+' then 1.12
    else null
  end;
end;
$$;

-- ---------- 10) M2 — apostar predicción (con self-heal de la semana pasada) ----------
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

  -- Self-heal: si quedó una predicción sin resolver de la semana pasada
  -- (no hay job semanal garantizado), se resuelve acá — una sola fuente de
  -- verdad para cerrar la semana anterior antes de abrir la nueva.
  perform public.resolver_prediccion_ranking(v_semana - 7);

  -- Ventana de apuesta: lunes a miércoles inclusive (spec: antes de que el
  -- ranking se asiente). La semana en la DB es la ISO (lunes 00:00 UTC).
  if current_date > v_semana + 2 then
    raise exception 'ya cerró la ventana de apuesta de esta semana — la próxima abre el lunes';
  end if;

  select exists(
    select 1 from public.trastienda_predicciones_ranking
    where user_id = v_user and semana_inicio = v_semana
  ) into v_existe;
  if v_existe then
    raise exception 'ya tenés una predicción para esta semana (una por semana)';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_monto then
    raise exception 'te faltan Chispas para esa predicción';
  end if;

  update public.profiles set puntos_total = puntos_total - p_monto where id = v_user;

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

-- ---------- 11) M2 — resolución de una semana (paga a filas propias) ----------
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
      update public.profiles set puntos_total = puntos_total + v_payout where id = v_record.user_id;
    end if;

    update public.trastienda_predicciones_ranking
    set estado = v_estado, payout = v_payout, puesto_real = v_posicion, resuelto_at = now()
    where id = v_record.id;
  end loop;
end;
$$;

-- Wrapper para que el cliente "cobre" sus predicciones pendientes de
-- semanas ya cerradas (self-heal del lado de lectura, sin job).
create or replace function public.cobrar_predicciones_pendientes()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_semana_hoy date := date_trunc('week', current_date)::date;
  v_semana_pendiente date;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  -- Cosecha todas mis semanas cerradas que sigan en 'pendiente' (no solo la
  -- última): cubre al usuario que vuelve después de varias semanas.
  for v_semana_pendiente in
    select distinct semana_inicio
    from public.trastienda_predicciones_ranking
    where user_id = v_user and estado = 'pendiente' and semana_inicio < v_semana_hoy
  loop
    perform public.resolver_prediccion_ranking(v_semana_pendiente);
  end loop;
end;
$$;

grant execute on function public.cobrar_predicciones_pendientes() to authenticated;

-- ---------- 12) M3 — la ruleta pasa de escudo-placeholder a títulos reales ----------
-- Sustituye el branch 'titulo' de girar_ruleta (0121): ahora desbloquea un
-- título de Trastienda no ganado todavía, vía desbloquear_titulo_propio
-- (idempotente, respeta el "un activo a la vez"). Slugs + nombres espejo de
-- src/lib/titulos/catalogo.ts (categoria "trastienda").
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

  update public.profiles set puntos_total = puntos_total - v_costo where id = v_user;

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
    -- Mecánica 3 real: título de Trastienda raro o menos que el usuario
    -- todavía no tenga. El dispenser elige del set base (tronado/farolero/
    -- uja/profeta-minor); los títulos más altos se dejan como meta de las
    -- Mecánicas 1/2 (ver catálogo en src/lib/titulos/catalogo.ts).
    select t.slug into v_titulo_slug
    from public.titulos_trastienda_base() t
    where t.slug not in (
      select tu.slug from public.titulos_usuario tu where tu.user_id = v_user
    )
    order by random()
    limit 1;
    if v_titulo_slug is null then
      -- Ya tiene toda la base: rescate en Chispas.
      v_chispas := 200;
      update public.profiles set puntos_total = puntos_total + v_chispas where id = v_user;
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

grant execute on function public.girar_ruleta() to authenticated;

-- ---------- 13) Helpers de la ruleta (M3) ----------
-- Set base de títulos que entrega el segmento 'titulo' (raros o menos).
create or replace function public.titulos_trastienda_base()
returns table (slug text)
language sql
stable
as $$
  select slug from (values
    ('tronado'),
    ('farolero'),
    ('uja'),
    ('profeta-minor')
  ) v(slug);
$$;

create or replace function public.nombre_titulo_trastienda(p_slug text)
returns text
language plpgsql
stable
as $$
begin
  return case p_slug
    when 'tronado' then 'Tronado'
    when 'farolero' then 'Farolero'
    when 'profeta-minor' then 'Profeta Menor'
    when 'uja' then 'Uja'
    else 'Título de Trastienda'
  end;
end;
$$;

-- ---------- 14) Grants de tablas (lectura propia vía RLS + select) ----------
grant select on public.trastienda_apuestas to authenticated;
grant select on public.trastienda_limites_diarios to authenticated;
grant select on public.trastienda_predicciones_ranking to authenticated;
-- No hay grants de INSERT/UPDATE: toda escritura va por RPC security definer.

-- ---------- 15) Recarga de PostgREST ----------
-- Imprescindible tras crear/reemplazar RPCs: sin esto PostgREST responde
-- 404/PGRST202 ("function not found in schema cache") y el cliente lo
-- traduce a "Algo salió mal". Aplica a TODOS los módulos (ruleta, dados/
-- volado, pizarra y los nuevos).
notify pgrst, 'reload schema';