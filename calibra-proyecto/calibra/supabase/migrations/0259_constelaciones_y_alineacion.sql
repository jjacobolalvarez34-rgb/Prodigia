-- ============================================================
-- Prodigia — Constelaciones (en vez de cápsulas) y premios de la Gran Alineación
-- (aprobado por el usuario el 2026-10-07, docs/PLAN_PRIMERA_VEZ_APP.md §5 y §6).
--
-- CONSTELACIONES. Cada ciudad tiene una constelación de 7 estrellas en su cielo.
--   - Cada partida enciende estrellas en la ciudad donde se jugó: 1 por partida
--     (al menos 5 respuestas) y +1 si la precisión fue del 80 % o más. Lo cuenta la
--     base con los intentos reales (attempts / logic_attempts), no el cliente.
--   - Al llegar a 7 se completa y da su premio, que se ve desde antes:
--     300 Chispas + una pieza de la colección de esa ciudad que te falte (si ya
--     tienes todas, +150 Chispas). De noche en esa ciudad: +20 % de Chispas. Durante
--     la Gran Alineación: el doble.
--   - Estrella fugaz: 1 de cada 5 constelaciones trae un premio extra (hielo,
--     +3 segundos, pista o 200 Chispas). La probabilidad se muestra en la UI.
--   - Lo que antes daba cápsulas ahora da estrellas en tu ciudad favorita (la de
--     mayor nivel): primera partida del día → la partida misma; racha de 7 días → 2;
--     cada nivel de cuenta → 3; nivel 10, 20… de una ciudad → 3 en esa ciudad;
--     todas sus Técnicas → 3 en esa ciudad; liga → de 2 a 5 según el puesto; las 3
--     misiones del día → 2; día 7 del calendario → 3.
--   - La cápsula de colección (las 6 piezas → marco animado) se queda, y las
--     cápsulas que cada uno ya tenía se pueden abrir igual.
--
-- GRAN ALINEACIÓN (cada 28 días, 3 horas; misma cuenta que src/lib/ciudades/cicloDia.ts):
--   - Experiencia doble en todas las ciudades (insertar_intento e
--     insertar_intento_logica, redefinidas desde 0247 con ese único cambio).
--   - Constelaciones con premio doble.
--   - Logro «Testigo de la Alineación» por jugar durante el evento.
--
-- Requiere 0249 y 0258. Idempotente.
-- ============================================================

-- ---------- Reloj de las ciudades (espejo de cicloDia.ts) ----------
create or replace function public.horas_dia_ciudad(p_mundo text)
returns integer
language sql
immutable
as $$
  select case p_mundo
    when 'codia' then 12 when 'circuitia' then 14 when 'numeria' then 16 when 'enigmia' then 21
    when 'geografia' then 24 when 'trigonometria' then 28 when 'calculia' then 32 when 'estadistica' then 42
    when 'quimia' then 48 when 'melodia' then 56 when 'naipia' then 84 when 'anatomia' then 96
    when 'historia' then 112 else 24
  end;
$$;

-- Fase del día en [0, 1): 0 amanecer, 0,25 mediodía, 0,5 atardecer, 0,75 medianoche.
create or replace function public.fase_dia_ciudad(p_mundo text, p_ts timestamptz default now())
returns numeric
language sql
immutable
as $$
  select mod(mod(extract(epoch from (p_ts - timestamptz '2026-10-24 23:00:00+00'))::numeric, public.horas_dia_ciudad(p_mundo) * 3600)
             + public.horas_dia_ciudad(p_mundo) * 3600, public.horas_dia_ciudad(p_mundo) * 3600)
         / (public.horas_dia_ciudad(p_mundo) * 3600);
$$;

-- De noche: del anochecer (0,55) a la madrugada (0,95). Igual que esDeNoche() en cicloDia.ts.
create or replace function public.ciudad_de_noche(p_mundo text, p_ts timestamptz default now())
returns boolean
language sql
immutable
as $$
  select public.fase_dia_ciudad(p_mundo, p_ts) >= 0.55 and public.fase_dia_ciudad(p_mundo, p_ts) < 0.95;
$$;

-- Las 3 horas de la Gran Alineación (cada 672 h desde la primera).
create or replace function public.en_gran_alineacion(p_ts timestamptz default now())
returns boolean
language sql
immutable
as $$
  select p_ts >= timestamptz '2026-10-24 23:00:00+00'
     and mod(extract(epoch from (p_ts - timestamptz '2026-10-24 23:00:00+00'))::numeric, 672 * 3600) < 3 * 3600;
$$;

grant execute on function public.horas_dia_ciudad(text) to anon, authenticated;
grant execute on function public.fase_dia_ciudad(text, timestamptz) to anon, authenticated;
grant execute on function public.ciudad_de_noche(text, timestamptz) to anon, authenticated;
grant execute on function public.en_gran_alineacion(timestamptz) to anon, authenticated;

-- ---------- Tablas ----------
create table if not exists public.constelaciones_usuario (
  user_id uuid not null references public.profiles(id) on delete cascade,
  mundo text not null,
  estrellas smallint not null default 0 check (estrellas between 0 and 6),
  completadas integer not null default 0,
  -- Hasta dónde ya se contaron partidas en esta ciudad.
  ultima_partida_at timestamptz,
  primary key (user_id, mundo)
);
alter table public.constelaciones_usuario enable row level security;
drop policy if exists "cada uno ve sus constelaciones" on public.constelaciones_usuario;
create policy "cada uno ve sus constelaciones" on public.constelaciones_usuario for select using (auth.uid() = user_id);

create table if not exists public.constelaciones_completadas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mundo text not null,
  numero integer not null,
  premio jsonb not null,
  de_noche boolean not null default false,
  alineacion boolean not null default false,
  creada_at timestamptz not null default now(),
  -- La animación de "se dibuja en el cielo" se muestra una vez.
  vista_at timestamptz
);
create index if not exists constelaciones_completadas_por_ver_idx on public.constelaciones_completadas (user_id) where vista_at is null;
alter table public.constelaciones_completadas enable row level security;
drop policy if exists "cada uno ve sus constelaciones completadas" on public.constelaciones_completadas;
create policy "cada uno ve sus constelaciones completadas" on public.constelaciones_completadas for select using (auth.uid() = user_id);

-- Estrellas que reemplazan a las cápsulas: una vez por origen (como capsulas_usuario.origen).
create table if not exists public.estrellas_otorgadas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  origen text not null,
  mundo text not null,
  cantidad smallint not null,
  creada_at timestamptz not null default now(),
  primary key (user_id, origen)
);
alter table public.estrellas_otorgadas enable row level security;
drop policy if exists "cada uno ve sus estrellas" on public.estrellas_otorgadas;
create policy "cada uno ve sus estrellas" on public.estrellas_otorgadas for select using (auth.uid() = user_id);

-- ---------- Ciudad favorita: la de mayor nivel ----------
create or replace function public._ciudad_favorita(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select w.world from public.world_progress w where w.user_id = p_user order by w.nivel_mundo desc, w.world limit 1),
    (select pr.mundos_desbloqueados[1] from public.profiles pr where pr.id = p_user),
    'numeria'
  );
$$;
revoke execute on function public._ciudad_favorita(uuid) from public, anon, authenticated;

-- ---------- Completar una constelación: da su premio ----------
create or replace function public._completar_constelacion(p_user uuid, p_mundo text, p_numero integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_noche boolean := public.ciudad_de_noche(p_mundo);
  v_alin boolean := public.en_gran_alineacion();
  v_mult numeric;
  v_chispas integer;
  v_item public.catalogo_cosmeticos%rowtype;
  v_pieza jsonb := null;
  v_fugaz jsonb := null;
  v_r numeric;
begin
  v_mult := (case when v_alin then 2 else 1 end) * (case when v_noche then 1.2 else 1 end);
  v_chispas := 300;

  -- Una pieza de la colección de esa ciudad que te falte (misma regla que la
  -- cápsula de ciudad de 0249). Con la colección completa: +150 Chispas.
  select * into v_item from public.catalogo_cosmeticos c
  where c.mundo = p_mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(p_user, c.slug)
  order by -ln(1 - random()) / (case c.categoria when 'titulo' then 20 else 40 end)
  limit 1;
  if found then
    perform public._dar_cosmetico(p_user, v_item.slug);
    v_pieza := jsonb_build_object('slug', v_item.slug, 'nombre', v_item.nombre, 'rareza', v_item.rareza);
  else
    v_chispas := v_chispas + 150;
  end if;
  v_chispas := round(v_chispas * v_mult)::integer;
  perform public._dar_chispas(p_user, v_chispas);

  -- Estrella fugaz: 1 de cada 5.
  if random() < 0.2 then
    v_r := random();
    if v_r < 0.25 then
      update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = p_user;
      v_fugaz := jsonb_build_object('premio', 'hielo', 'cantidad', 1);
    elsif v_r < 0.5 then
      update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = p_user;
      v_fugaz := jsonb_build_object('premio', 'tiempo_extra', 'cantidad', 1);
    elsif v_r < 0.75 then
      update public.profiles as pr set pistas_disponibles = pr.pistas_disponibles + 1 where pr.id = p_user;
      v_fugaz := jsonb_build_object('premio', 'pista', 'cantidad', 1);
    else
      perform public._dar_chispas(p_user, 200);
      v_fugaz := jsonb_build_object('premio', 'chispas', 'cantidad', 200);
    end if;
  end if;

  insert into public.constelaciones_completadas (user_id, mundo, numero, premio, de_noche, alineacion)
  values (p_user, p_mundo, p_numero, jsonb_build_object('chispas', v_chispas, 'pieza', v_pieza, 'fugaz', v_fugaz), v_noche, v_alin);
end;
$$;
revoke execute on function public._completar_constelacion(uuid, text, integer) from public, anon, authenticated;

-- ---------- Sumar estrellas (con origen = una sola vez) ----------
create or replace function public._sumar_estrellas(p_user uuid, p_mundo text, p_cantidad integer, p_origen text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estrellas integer;
  v_completadas integer;
  v_nuevas integer := 0;
begin
  if p_cantidad <= 0 then
    return 0;
  end if;
  if p_origen is not null then
    -- Lo que ya dio una cápsula antes de esta migración no vuelve a dar estrellas.
    if exists (select 1 from public.capsulas_usuario c where c.user_id = p_user and c.origen = p_origen) then
      return 0;
    end if;
    insert into public.estrellas_otorgadas (user_id, origen, mundo, cantidad)
    values (p_user, p_origen, p_mundo, p_cantidad)
    on conflict (user_id, origen) do nothing;
    if not found then
      return 0;
    end if;
  end if;

  insert into public.constelaciones_usuario (user_id, mundo) values (p_user, p_mundo)
  on conflict (user_id, mundo) do nothing;
  select cu.estrellas, cu.completadas into v_estrellas, v_completadas
  from public.constelaciones_usuario cu where cu.user_id = p_user and cu.mundo = p_mundo for update;

  v_estrellas := v_estrellas + p_cantidad;
  while v_estrellas >= 7 loop
    v_estrellas := v_estrellas - 7;
    v_nuevas := v_nuevas + 1;
    perform public._completar_constelacion(p_user, p_mundo, v_completadas + v_nuevas);
  end loop;

  update public.constelaciones_usuario as cu
  set estrellas = v_estrellas, completadas = cu.completadas + v_nuevas
  where cu.user_id = p_user and cu.mundo = p_mundo;
  return v_nuevas;
end;
$$;
revoke execute on function public._sumar_estrellas(uuid, text, integer, text) from public, anon, authenticated;

-- ---------- Partidas nuevas → estrellas ----------
-- Una "partida" = las respuestas de esa ciudad desde la última vez que se contó
-- (al menos 5). La primera vez solo mira las últimas 2 horas.
create or replace function public._encender_por_partidas(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_x record;
begin
  for v_x in
    select x.mundo, count(*) as n, count(*) filter (where x.correct) as c, max(x.created_at) as ultima
    from (
      select public.mundo_de_problem_type(a.problem_type) as mundo, a.correct, a.created_at
      from public.attempts a
      where a.user_id = p_user and a.created_at > now() - interval '1 day'
      union all
      select 'enigmia', la.correct, la.created_at
      from public.logic_attempts la
      where la.user_id = p_user and la.created_at > now() - interval '1 day'
    ) x
    left join public.constelaciones_usuario cu on cu.user_id = p_user and cu.mundo = x.mundo
    where x.created_at > coalesce(cu.ultima_partida_at, now() - interval '2 hours')
    group by x.mundo
  loop
    if v_x.n >= 5 then
      perform public._sumar_estrellas(p_user, v_x.mundo, 1 + (case when v_x.c * 5 >= v_x.n * 4 then 1 else 0 end));
      update public.constelaciones_usuario as cu set ultima_partida_at = v_x.ultima
      where cu.user_id = p_user and cu.mundo = v_x.mundo;
    end if;
  end loop;
end;
$$;
revoke execute on function public._encender_por_partidas(uuid) from public, anon, authenticated;

-- ---------- Logro «Testigo de la Alineación» ----------
-- Criterio "servidor": verificarLogros() de la web no lo reconoce, así que solo lo da la base.
insert into public.achievements (slug, nombre, descripcion, categoria, criterio)
values ('testigo-alineacion', 'Testigo de la Alineación', 'Jugaste durante la Gran Alineación, cuando las 13 ciudades amanecen juntas.', 'mundo', '{"tipo": "servidor"}')
on conflict (slug) do nothing;

-- ---------- revisar_recompensas: 0249 con estrellas en vez de cápsulas ----------
create or replace function public.revisar_recompensas()
returns table (nuevas integer, pendientes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_antes integer;
  v_nivel integer;
  v_base integer;
  v_n integer;
  v_racha integer;
  v_lunes date := date_trunc('week', current_date)::date;
  v_prev date := date_trunc('week', current_date)::date - 7;
  v_mi_xp integer;
  v_puesto integer;
  v_fav text;
  v_x record;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select count(*) into v_antes from public.capsulas_usuario c where c.user_id = v_user;
  v_fav := public._ciudad_favorita(v_user);

  -- Las partidas encienden estrellas en su ciudad (reemplaza a la cápsula diaria).
  perform public._encender_por_partidas(v_user);

  -- Racha: cada 7 días seguidos → 2 estrellas.
  if exists (select 1 from public.daily_progress d where d.user_id = v_user and d.fecha = current_date and d.meta_alcanzada) then
    v_racha := public.racha_diaria_de(v_user);
    if v_racha > 0 and v_racha % 7 = 0 then
      perform public._sumar_estrellas(v_user, v_fav, 2, 'racha:' || current_date);
    end if;
  end if;

  -- Nivel de cuenta: 3 estrellas por nivel (como mucho los últimos 5).
  select pr.nivel_cuenta, pr.capsulas_nivel_base into v_nivel, v_base from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_nivel, 1) > coalesce(v_base, 1) then
    for v_n in greatest(v_base + 1, v_nivel - 4)..v_nivel loop
      perform public._sumar_estrellas(v_user, v_fav, 3, 'nivel:' || v_n);
    end loop;
    update public.profiles set capsulas_nivel_base = v_nivel where id = v_user;
  end if;

  -- Ciudad: niveles 10, 20, 30… → 3 estrellas en esa ciudad.
  for v_x in
    select w.world, k * 10 as nivel
    from public.world_progress w
    cross join lateral generate_series(1, greatest(w.nivel_mundo / 10, 0)) as k
    where w.user_id = v_user and w.nivel_mundo >= 10
  loop
    perform public._sumar_estrellas(v_user, v_x.world, 3, 'ciudad:' || v_x.world || ':' || v_x.nivel);
  end loop;

  -- Dominio: todas las Técnicas (gratis) de una ciudad → 3 estrellas en esa ciudad.
  for v_x in
    select x.mundo
    from (
      select public.mundo_de_problem_type(t.problem_type) as mundo, count(*) as total, count(tp.technique_id) filter (where tp.dominado) as hechas
      from public.techniques t
      left join public.technique_progress tp on tp.technique_id = t.id and tp.user_id = v_user
      where not t.requiere_pro
      group by 1
      union all
      select 'enigmia', count(*), count(tp.technique_id) filter (where tp.dominado)
      from public.logic_techniques t
      left join public.logic_technique_progress tp on tp.technique_id = t.id and tp.user_id = v_user
      where not t.requiere_pro
    ) x
    where x.total > 0 and x.hechas = x.total
  loop
    perform public._sumar_estrellas(v_user, v_x.mundo, 3, 'dominio:' || v_x.mundo);
  end loop;

  -- Liga de la semana pasada: de 2 a 5 estrellas según el puesto.
  if not exists (select 1 from public.estrellas_otorgadas e where e.user_id = v_user and e.origen = 'liga:' || v_prev)
     and not exists (select 1 from public.capsulas_usuario c where c.user_id = v_user and c.origen = 'liga:' || v_prev) then
    select sum(d.xp_ganado) into v_mi_xp from public.daily_progress d where d.user_id = v_user and d.fecha >= v_prev and d.fecha < v_lunes;
    if coalesce(v_mi_xp, 0) > 0 then
      select count(*) + 1 into v_puesto
      from (select d.user_id, sum(d.xp_ganado) as total from public.daily_progress d where d.fecha >= v_prev and d.fecha < v_lunes group by d.user_id) x
      where x.total > v_mi_xp;
      perform public._sumar_estrellas(v_user, v_fav, case when v_puesto <= 3 then 5 when v_puesto <= 10 then 4 when v_puesto <= 50 then 3 else 2 end, 'liga:' || v_prev);
    end if;
  end if;

  -- Colección completa: las 6 piezas de una ciudad → cápsula con su marco animado (igual que 0249).
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen)
  select v_user, 'coleccion', m, 'coleccion:' || m
  from unnest(v_mundos) as m
  where not exists (
    select 1 from unnest(array['marco_' || m, 'fondo_ciudad_' || m, 'estela_ciudad_' || m, 'efecto_ciudad_' || m, 'emote_ciudad_' || m, 'titulo_ciudad_' || m]) as s
    where not public._tiene_cosmetico(v_user, s)
  )
  on conflict (user_id, origen) do nothing;

  -- Gran Alineación: jugar durante el evento da el logro.
  if exists (
    select 1 from public.attempts a
    where a.user_id = v_user and a.created_at > now() - interval '1 day' and public.en_gran_alineacion(a.created_at)
  ) or exists (
    select 1 from public.logic_attempts la
    where la.user_id = v_user and la.created_at > now() - interval '1 day' and public.en_gran_alineacion(la.created_at)
  ) then
    insert into public.user_achievements (user_id, achievement_id)
    select v_user, a.id from public.achievements a where a.slug = 'testigo-alineacion'
    on conflict do nothing;
  end if;

  return query
    select (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user) - v_antes,
           (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user and c.abierta_at is null);
end;
$$;

revoke execute on function public.revisar_recompensas() from public, anon;
grant execute on function public.revisar_recompensas() to authenticated;

-- ---------- Misiones: las 3 del día → 2 estrellas (antes, cápsula) ----------
-- La columna sigue llamándose `capsula` para no romper a los clientes: ahora
-- significa "ganaste el premio de las 3".
create or replace function public.reclamar_mision(p_tipo text)
returns table (puntos_total integer, completas boolean, capsula boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_m record;
  v_completas boolean;
  v_premio boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_m from public._misiones_de(v_user, current_date) m where m.tipo = p_tipo;
  if not found then
    raise exception 'esa mision no es de hoy';
  end if;
  if public._progreso_mision(v_user, v_m.tipo, v_m.mundo, current_date) < v_m.meta then
    raise exception 'todavia no completaste esta mision';
  end if;
  insert into public.misiones_reclamadas (user_id, fecha, tipo, recompensa)
  values (v_user, current_date, p_tipo, v_m.recompensa)
  on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste esta mision';
  end if;
  perform public._dar_chispas(v_user, v_m.recompensa);

  select count(*) = 3 into v_completas from public.misiones_reclamadas r where r.user_id = v_user and r.fecha = current_date;
  if v_completas then
    perform public._sumar_estrellas(v_user, public._ciudad_favorita(v_user), 2, 'misiones:' || current_date);
    v_premio := true;
  end if;

  return query select pr.puntos_total, v_completas, v_premio from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.reclamar_mision(text) from public, anon;
grant execute on function public.reclamar_mision(text) to authenticated;

-- ---------- Calendario: el día 7 da 3 estrellas (antes, cápsula) ----------
create or replace function public.premios_calendario()
returns table (dia smallint, premio text, cantidad integer)
language sql
immutable
as $$
  select t.dia::smallint, t.premio, t.cantidad
  from (values (1, 'chispas', 50), (2, 'chispas', 75), (3, 'hielo', 1), (4, 'chispas', 100), (5, 'tiempo_extra', 1), (6, 'chispas', 150), (7, 'estrellas', 3)) as t(dia, premio, cantidad);
$$;

grant execute on function public.premios_calendario() to anon, authenticated;

create or replace function public.reclamar_calendario()
returns table (dia smallint, premio text, cantidad integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_estado record;
  v_premio record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_estado from public.mi_calendario();
  if v_estado.reclamado_hoy then
    raise exception 'ya reclamaste el premio de hoy';
  end if;
  if not v_estado.puede_reclamar then
    raise exception 'juega una partida hoy para reclamar';
  end if;
  select * into v_premio from public.premios_calendario() p where p.dia = v_estado.dia;

  insert into public.calendario_usuario as c (user_id, dia, ultima_fecha)
  values (v_user, v_estado.dia, current_date)
  on conflict (user_id) do update set dia = excluded.dia, ultima_fecha = excluded.ultima_fecha;

  if v_premio.premio = 'chispas' then
    perform public._dar_chispas(v_user, v_premio.cantidad);
  elsif v_premio.premio = 'hielo' then
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'tiempo_extra' then
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio.premio = 'estrellas' then
    perform public._sumar_estrellas(v_user, public._ciudad_favorita(v_user), v_premio.cantidad, 'calendario:' || current_date);
  end if;

  return query select v_estado.dia, v_premio.premio, v_premio.cantidad, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.reclamar_calendario() from public, anon;
grant execute on function public.reclamar_calendario() to authenticated;

-- ---------- Gran Alineación: experiencia doble (0247 con ese único cambio) ----------
create or replace function public.insertar_intento(
  p_problem_type text,
  p_level integer,
  p_correct boolean,
  p_time_ms integer,
  p_protegido boolean default false,
  p_calibrar boolean default false
)
returns table (
  xp integer,
  sospechoso boolean,
  nivel smallint,
  racha_actual smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_esperado integer;
  v_piso numeric;
  v_sospechoso boolean;
  v_mult numeric;
  v_factor numeric;
  v_bonus numeric;
  v_boost numeric;
  v_xp integer;
  v_nivel smallint;
  v_racha smallint;
  v_actual record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_esperado := 6000 - (p_level - 1) * 350;
  v_piso := greatest(150, v_esperado * 0.12);
  v_sospechoso := p_time_ms < v_piso;

  v_mult := 1 + (p_level - 1) * 0.15;
  v_factor := 1.5 - 0.5 * (p_time_ms::numeric / v_esperado::numeric);
  v_bonus := greatest(1.0, least(1.5, v_factor));

  select coalesce(b.boost_multiplicador_pendiente, 1) into v_boost
  from public.profiles b where b.id = v_user;

  v_xp := case
    when p_correct and not v_sospechoso then round(round(10 * v_mult * v_bonus) * v_boost)::integer
    else 0
  end;

  -- Doble experiencia: el mundo del día da el doble (mundo_doble_experiencia), y
  -- durante la Gran Alineación todos los mundos (sin acumular: como mucho ×2).
  if v_xp > 0 and (public.en_gran_alineacion() or public.mundo_doble_experiencia(current_date) = public.mundo_de_problem_type(p_problem_type)) then
    v_xp := v_xp * 2;
  end if;

  insert into public.attempts (user_id, problem_type, level, correct, time_ms, xp)
  values (v_user, p_problem_type, p_level, p_correct, p_time_ms, v_xp);

  v_nivel := null;
  v_racha := null;
  if p_calibrar and not v_sospechoso then
    select sl.nivel, sl.racha_actual into v_actual
    from public.skill_levels sl where sl.user_id = v_user and sl.problem_type = p_problem_type;
    v_nivel := coalesce(v_actual.nivel, 1);
    v_racha := coalesce(v_actual.racha_actual, 0);

    if p_correct then
      v_racha := v_racha + 1;
      if v_racha >= 3 then
        v_nivel := least(10, v_nivel + 1);
        v_racha := 0;
      end if;
    else
      v_racha := 0;
      if not p_protegido then
        v_nivel := greatest(1, v_nivel - 1);
      end if;
    end if;

    insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
    values (v_user, p_problem_type, v_nivel, v_racha, now())
    on conflict (user_id, problem_type)
    do update set nivel = excluded.nivel, racha_actual = excluded.racha_actual, updated_at = now();
  end if;

  return query select v_xp, v_sospechoso, v_nivel, v_racha;
end;
$$;

create or replace function public.insertar_intento_logica(
  p_puzzle_id text,
  p_dificultad integer,
  p_correct boolean,
  p_time_ms integer,
  p_categoria text,
  p_protegido boolean default false
)
returns table (
  xp integer,
  sospechoso boolean,
  nivel smallint,
  racha_actual smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_esperado integer;
  v_piso numeric;
  v_sospechoso boolean;
  v_mult numeric;
  v_factor numeric;
  v_bonus numeric;
  v_boost numeric;
  v_xp integer;
  v_nivel smallint;
  v_racha smallint;
  v_actual record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  v_esperado := 6000 - (p_dificultad - 1) * 350;
  v_piso := greatest(150, v_esperado * 0.12);
  v_sospechoso := p_time_ms < v_piso;

  v_mult := 1 + (p_dificultad - 1) * 0.15;
  v_factor := 1.5 - 0.5 * (p_time_ms::numeric / v_esperado::numeric);
  v_bonus := greatest(1.0, least(1.5, v_factor));

  select coalesce(b.boost_multiplicador_pendiente, 1) into v_boost
  from public.profiles b where b.id = v_user;

  v_xp := case
    when p_correct and not v_sospechoso then round(round(10 * v_mult * v_bonus) * v_boost)::integer
    else 0
  end;

  -- Doble experiencia: el mundo del día da el doble (mundo_doble_experiencia), y
  -- durante la Gran Alineación todos los mundos (sin acumular: como mucho ×2).
  if v_xp > 0 and (public.en_gran_alineacion() or public.mundo_doble_experiencia(current_date) = 'enigmia') then
    v_xp := v_xp * 2;
  end if;

  insert into public.logic_attempts (user_id, puzzle_id, correct, time_ms, xp)
  values (v_user, p_puzzle_id, p_correct, p_time_ms, v_xp);

  v_nivel := null;
  v_racha := null;
  if not v_sospechoso then
    select sl.nivel, sl.racha_actual into v_actual
    from public.logic_skill_levels sl where sl.user_id = v_user and sl.categoria = p_categoria;
    v_nivel := coalesce(v_actual.nivel, 1);
    v_racha := coalesce(v_actual.racha_actual, 0);

    if p_correct then
      v_racha := v_racha + 1;
      if v_racha >= 3 then
        v_nivel := least(10, v_nivel + 1);
        v_racha := 0;
      end if;
    else
      v_racha := 0;
      if not p_protegido then
        v_nivel := greatest(1, v_nivel - 1);
      end if;
    end if;

    insert into public.logic_skill_levels (user_id, categoria, nivel, racha_actual, updated_at)
    values (v_user, p_categoria, v_nivel, v_racha, now())
    on conflict (user_id, categoria)
    do update set nivel = excluded.nivel, racha_actual = excluded.racha_actual, updated_at = now();
  end if;

  return query select v_xp, v_sospechoso, v_nivel, v_racha;
end;
$$;

-- ---------- Lo que ven los clientes ----------
-- Las 13 constelaciones con su avance y el premio que darían ahora.
create or replace function public.mis_constelaciones()
returns table (mundo text, estrellas integer, completadas integer, de_noche boolean, alineacion boolean, chispas_premio integer, falta_pieza boolean, favorita boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fav text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  v_fav := public._ciudad_favorita(v_user);
  return query
    select m.mundo,
           coalesce(cu.estrellas, 0)::integer,
           coalesce(cu.completadas, 0)::integer,
           public.ciudad_de_noche(m.mundo),
           public.en_gran_alineacion(),
           round((case when x.falta then 300 else 450 end)
                 * (case when public.en_gran_alineacion() then 2 else 1 end)
                 * (case when public.ciudad_de_noche(m.mundo) then 1.2 else 1 end))::integer,
           x.falta,
           m.mundo = v_fav
    from unnest(array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia']) with ordinality as m(mundo, orden)
    left join public.constelaciones_usuario cu on cu.user_id = v_user and cu.mundo = m.mundo
    cross join lateral (
      select exists (
        select 1 from public.catalogo_cosmeticos c
        where c.mundo = m.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
      ) as falta
    ) x
    order by m.orden;
end;
$$;

revoke execute on function public.mis_constelaciones() from public, anon;
grant execute on function public.mis_constelaciones() to authenticated;

-- Las completadas que todavía no se celebraron (para la animación, una vez).
create or replace function public.constelaciones_por_ver()
returns table (id uuid, mundo text, numero integer, premio jsonb, de_noche boolean, alineacion boolean)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.mundo, c.numero, c.premio, c.de_noche, c.alineacion
  from public.constelaciones_completadas c
  where c.user_id = auth.uid() and c.vista_at is null
  order by c.creada_at;
$$;

revoke execute on function public.constelaciones_por_ver() from public, anon;
grant execute on function public.constelaciones_por_ver() to authenticated;

create or replace function public.marcar_constelaciones_vistas()
returns void
language sql
security definer
set search_path = public
as $$
  update public.constelaciones_completadas set vista_at = now() where user_id = auth.uid() and vista_at is null;
$$;

revoke execute on function public.marcar_constelaciones_vistas() from public, anon;
grant execute on function public.marcar_constelaciones_vistas() to authenticated;

notify pgrst, 'reload schema';
