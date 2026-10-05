-- ============================================================
-- Prodigia — Recompensas que hacen volver, sin pase de batalla
-- (docs/economy/PROPUESTA_TIENDA_Y_RECOMPENSAS.md §1 y §3, aprobada el
-- 2026-10-05). Web y app a la vez (docs/PARIDAD_APP_WEB.md).
--
-- Reglas que la base hace cumplir:
--   - Las cápsulas NO se compran (ni con dinero ni con Chispas): solo se ganan
--     jugando. No hay ninguna función que cree una cápsula a cambio de algo.
--   - Probabilidades a la vista: contenido_capsula() es la MISMA tabla que usa
--     abrir_capsula() para sortear; la UI la muestra antes de abrir.
--   - Repetidos: un cosmético que ya tienes se convierte en Chispas (precio ÷ 3).
--   - Garantía: cada 10 cápsulas sin un cosmético raro o mejor, la siguiente
--     trae uno seguro (profiles.capsulas_sin_raro).
--   - El azar es del servidor (random() dentro de la transacción).
--
-- Cápsulas: diaria (primera partida del día), misiones (las 3 misiones del
-- día), racha (cada 7 días de racha y el día 7 del calendario), nivel (cada
-- nivel de cuenta), ciudad (niveles 10, 20, 30… de una ciudad y completar sus
-- Técnicas), liga (al cerrar la semana, según el puesto) y colección (al
-- completar las 6 piezas de una ciudad: trae su marco animado).
--
-- revisar_recompensas() las otorga (idempotente: cada cápsula tiene un
-- `origen` único por usuario). Se llama al terminar cada partida y al abrir la
-- pantalla de Recompensas.
--
-- Requiere 0248 (catálogo), 0246/0247 no. Idempotente.
-- ============================================================

-- Por si 0247 todavía no se aplicó: el mundo de un problem_type.
create or replace function public.mundo_de_problem_type(p_problem_type text)
returns text
language sql
immutable
as $$
  select case
    when split_part(p_problem_type, '_', 1) in ('geografia','quimia','anatomia','melodia','trigonometria','historia','calculia','circuitia','estadistica','naipia','codia')
      then split_part(p_problem_type, '_', 1)
    else 'numeria'
  end;
$$;

-- ---------- racha diaria (mismo cálculo que calcularRachaDiaria de la web) ----------
create or replace function public.racha_diaria_de(p_user uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_dia date := current_date;
  v_racha integer := 0;
begin
  if not exists (select 1 from public.daily_progress d where d.user_id = p_user and d.fecha = v_dia and (d.meta_alcanzada or d.congelado)) then
    v_dia := v_dia - 1;
  end if;
  while exists (select 1 from public.daily_progress d where d.user_id = p_user and d.fecha = v_dia and (d.meta_alcanzada or d.congelado)) loop
    v_racha := v_racha + 1;
    v_dia := v_dia - 1;
    exit when v_racha >= 3650;
  end loop;
  return v_racha;
end;
$$;

revoke execute on function public.racha_diaria_de(uuid) from public, anon, authenticated;

create or replace function public._jugo_hoy(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.attempts a where a.user_id = p_user and a.created_at >= current_date::timestamptz)
      or exists (select 1 from public.logic_attempts la where la.user_id = p_user and la.created_at >= current_date::timestamptz);
$$;

revoke execute on function public._jugo_hoy(uuid) from public, anon, authenticated;

create or replace function public._dar_chispas(p_user uuid, p_monto integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles as pr set puntos_total = pr.puntos_total + greatest(p_monto, 0) where pr.id = p_user;
$$;

revoke execute on function public._dar_chispas(uuid, integer) from public, anon, authenticated;

-- ============================================================
-- 1) CÁPSULAS
-- ============================================================
create table if not exists public.capsulas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('diaria', 'misiones', 'racha', 'nivel', 'ciudad', 'liga', 'liga_bronce', 'liga_plata', 'liga_oro', 'coleccion')),
  mundo text,
  origen text not null,
  detalle jsonb,
  creada_at timestamptz not null default now(),
  abierta_at timestamptz,
  premio jsonb,
  unique (user_id, origen)
);

create index if not exists capsulas_usuario_pendientes_idx on public.capsulas_usuario (user_id) where abierta_at is null;

alter table public.capsulas_usuario enable row level security;
drop policy if exists "cada uno ve sus capsulas" on public.capsulas_usuario;
create policy "cada uno ve sus capsulas" on public.capsulas_usuario for select using (auth.uid() = user_id);
grant select on public.capsulas_usuario to authenticated;

-- Las cápsulas de ciudad por niveles YA alcanzados no se regalan de golpe:
-- quedan marcadas como abiertas (premio null) para que solo cuenten las nuevas.
insert into public.capsulas_usuario (user_id, tipo, mundo, origen, abierta_at)
select w.user_id, 'ciudad', w.world, 'ciudad:' || w.world || ':' || (k * 10), now()
from public.world_progress w
cross join lateral generate_series(1, greatest(w.nivel_mundo / 10, 0)) as k
where w.nivel_mundo >= 10
on conflict (user_id, origen) do nothing;

-- Qué puede salir de cada cápsula y con qué peso (la UI muestra peso / suma).
-- premio: chispas | hielo | tiempo_extra | escudo | cosmetico_<rareza> |
-- coleccion (una pieza de la ciudad que te falte) | marco_coleccion.
create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 20, 80),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 20, 80),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 150, 400),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 50, 150),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 100, 250),
    ('liga_bronce', 'chispas', 60, 200, 500),
    ('liga_bronce', 'cosmetico_raro', 40, 1, 1),
    ('liga_plata', 'cosmetico_raro', 60, 1, 1),
    ('liga_plata', 'cosmetico_epico', 40, 1, 1),
    ('liga_oro', 'cosmetico_epico', 60, 1, 1),
    ('liga_oro', 'cosmetico_legendario', 40, 1, 1),
    ('coleccion', 'marco_coleccion', 100, 1, 1)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;

grant execute on function public.contenido_capsula(text) to anon, authenticated;

create or replace function public.mis_capsulas()
returns table (id uuid, tipo text, mundo text, detalle jsonb, creada_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.tipo, c.mundo, c.detalle, c.creada_at
  from public.capsulas_usuario c
  where c.user_id = auth.uid() and c.abierta_at is null
  order by c.creada_at;
$$;

revoke execute on function public.mis_capsulas() from public, anon;
grant execute on function public.mis_capsulas() to authenticated;

create or replace function public.abrir_capsula(p_id uuid)
returns table (premio text, slug text, nombre text, rareza text, cantidad integer, convertido boolean, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cap public.capsulas_usuario%rowtype;
  v_sin_raro smallint;
  v_total integer;
  v_r numeric;
  v_acum integer := 0;
  v_fila record;
  v_premio text;
  v_min integer := 0;
  v_max integer := 0;
  v_item public.catalogo_cosmeticos%rowtype;
  v_slug text;
  v_nombre text;
  v_rareza text;
  v_cantidad integer := 0;
  v_convertido boolean := false;
  v_nuevo_raro boolean := false;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_cap from public.capsulas_usuario c where c.id = p_id and c.user_id = v_user for update;
  if not found then
    raise exception 'capsula no encontrada';
  end if;
  if v_cap.abierta_at is not null then
    raise exception 'esta capsula ya se abrio';
  end if;

  select pr.capsulas_sin_raro into v_sin_raro from public.profiles pr where pr.id = v_user for update;

  -- Sorteo con los pesos de contenido_capsula().
  select sum(cc.peso) into v_total from public.contenido_capsula(v_cap.tipo) cc;
  v_r := random() * v_total;
  for v_fila in select * from public.contenido_capsula(v_cap.tipo) loop
    v_acum := v_acum + v_fila.peso;
    if v_r < v_acum then
      v_premio := v_fila.premio;
      v_min := v_fila.minimo;
      v_max := v_fila.maximo;
      exit;
    end if;
  end loop;

  -- Garantía: 10 seguidas sin nada raro → la siguiente trae un cosmético raro.
  if coalesce(v_sin_raro, 0) >= 10 and v_premio not in ('cosmetico_raro', 'cosmetico_epico', 'cosmetico_legendario', 'coleccion', 'marco_coleccion') then
    v_premio := 'cosmetico_raro';
  end if;

  if v_premio = 'chispas' then
    v_cantidad := v_min + (floor(random() * (((v_max - v_min) / 5) + 1))::integer * 5);
    perform public._dar_chispas(v_user, v_cantidad);
  elsif v_premio = 'hielo' then
    v_cantidad := 1;
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'tiempo_extra' then
    v_cantidad := 1;
    update public.profiles as pr set tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1 where pr.id = v_user;
  elsif v_premio = 'escudo' then
    v_cantidad := 1;
    update public.profiles as pr set escudos_extra_pendientes = pr.escudos_extra_pendientes + 1 where pr.id = v_user;
  elsif v_premio like 'cosmetico_%' then
    select * into v_item from public.catalogo_cosmeticos c
    where c.en_capsulas and c.rareza = replace(v_premio, 'cosmetico_', '')
    order by random() limit 1;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    if public._tiene_cosmetico(v_user, v_item.slug) then
      v_convertido := true;
      v_cantidad := v_item.precio / 3;
      perform public._dar_chispas(v_user, v_cantidad);
    else
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := v_item.rareza <> 'comun';
    end if;
  elsif v_premio = 'coleccion' then
    -- Una pieza de la colección de esa ciudad que todavía no tengas
    -- (estela y efecto pesan 40, el título 20). Si ya tienes todas: Chispas.
    select * into v_item from public.catalogo_cosmeticos c
    where c.mundo = v_cap.mundo and not c.vendible and c.en_capsulas and not public._tiene_cosmetico(v_user, c.slug)
    order by -ln(1 - random()) / (case c.categoria when 'titulo' then 20 else 40 end)
    limit 1;
    if found then
      v_slug := v_item.slug;
      v_nombre := v_item.nombre;
      v_rareza := v_item.rareza;
      perform public._dar_cosmetico(v_user, v_item.slug);
      v_nuevo_raro := true;
    else
      v_premio := 'chispas';
      v_cantidad := 300 + (floor(random() * 61)::integer * 5);
      perform public._dar_chispas(v_user, v_cantidad);
    end if;
  elsif v_premio = 'marco_coleccion' then
    select * into v_item from public.catalogo_cosmeticos c where c.slug = 'marco_coleccion_' || v_cap.mundo;
    v_slug := v_item.slug;
    v_nombre := v_item.nombre;
    v_rareza := v_item.rareza;
    perform public._dar_cosmetico(v_user, v_item.slug);
    v_nuevo_raro := true;
  end if;

  update public.profiles as pr
  set capsulas_sin_raro = case when v_nuevo_raro then 0 else least(pr.capsulas_sin_raro + 1, 100) end
  where pr.id = v_user;

  update public.capsulas_usuario as c
  set abierta_at = now(),
      premio = jsonb_build_object('premio', v_premio, 'slug', v_slug, 'nombre', v_nombre, 'rareza', v_rareza, 'cantidad', v_cantidad, 'convertido', v_convertido)
  where c.id = p_id;

  return query select v_premio, v_slug, v_nombre, v_rareza, v_cantidad, v_convertido, pr.puntos_total
    from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.abrir_capsula(uuid) from public, anon;
grant execute on function public.abrir_capsula(uuid) to authenticated;

-- ============================================================
-- 2) MISIONES DIARIAS (3 por día, distintas para cada persona)
-- ============================================================
create table if not exists public.misiones_reclamadas (
  user_id uuid not null references public.profiles(id) on delete cascade,
  fecha date not null,
  tipo text not null,
  recompensa integer not null,
  reclamada_at timestamptz not null default now(),
  primary key (user_id, fecha, tipo)
);

alter table public.misiones_reclamadas enable row level security;
drop policy if exists "cada uno ve sus misiones" on public.misiones_reclamadas;
create policy "cada uno ve sus misiones" on public.misiones_reclamadas for select using (auth.uid() = user_id);

-- Las 3 misiones de un día: un sorteo fijo por (persona, fecha) sobre la lista.
create or replace function public._misiones_de(p_user uuid, p_fecha date)
returns table (tipo text, mundo text, meta integer, recompensa integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_mundos text[];
  v_mundo text;
begin
  select pr.mundos_desbloqueados into v_mundos from public.profiles pr where pr.id = p_user;
  if v_mundos is null or cardinality(v_mundos) = 0 then
    v_mundos := array['numeria'];
  end if;
  v_mundo := v_mundos[1 + (abs(hashtext(p_user::text || p_fecha::text || 'mundo')) % cardinality(v_mundos))];
  return query
    select p.tipo, case when p.tipo = 'aciertos_mundo' then v_mundo else null end, p.meta, p.recompensa
    from (values
      ('aciertos', 30, 40),
      ('aciertos_mundo', 15, 50),
      ('experiencia', 400, 50),
      ('duelo', 1, 60),
      ('leccion', 1, 50),
      ('mundos', 3, 50),
      ('rapidas', 10, 50),
      ('reto_diario', 1, 40)
    ) as p(tipo, meta, recompensa)
    order by md5(p_user::text || p_fecha::text || p.tipo)
    limit 3;
end;
$$;

revoke execute on function public._misiones_de(uuid, date) from public, anon, authenticated;

create or replace function public._progreso_mision(p_user uuid, p_tipo text, p_mundo text, p_fecha date)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_desde timestamptz := p_fecha::timestamptz;
  v_hasta timestamptz := (p_fecha + 1)::timestamptz;
begin
  if p_tipo = 'aciertos' then
    return (select count(*) from public.attempts a where a.user_id = p_user and a.correct and a.created_at >= v_desde and a.created_at < v_hasta)
         + (select count(*) from public.logic_attempts la where la.user_id = p_user and la.correct and la.created_at >= v_desde and la.created_at < v_hasta);
  elsif p_tipo = 'aciertos_mundo' then
    if p_mundo = 'enigmia' then
      return (select count(*) from public.logic_attempts la where la.user_id = p_user and la.correct and la.created_at >= v_desde and la.created_at < v_hasta);
    end if;
    return (select count(*) from public.attempts a where a.user_id = p_user and a.correct and a.created_at >= v_desde and a.created_at < v_hasta
            and public.mundo_de_problem_type(a.problem_type) = p_mundo);
  elsif p_tipo = 'experiencia' then
    return coalesce((select d.xp_ganado from public.daily_progress d where d.user_id = p_user and d.fecha = p_fecha), 0);
  elsif p_tipo = 'duelo' then
    return (select count(*) from public.duels d
            join public.duel_results mio on mio.duel_id = d.id and mio.user_id = p_user
            join public.duel_results otro on otro.duel_id = d.id and otro.user_id <> p_user
            where d.creado_at >= v_desde and d.creado_at < v_hasta and mio.puntaje_final > otro.puntaje_final);
  elsif p_tipo = 'leccion' then
    return (select count(*) from public.technique_progress tp where tp.user_id = p_user and tp.dominado and tp.updated_at >= v_desde and tp.updated_at < v_hasta)
         + (select count(*) from public.logic_technique_progress tp where tp.user_id = p_user and tp.dominado and tp.updated_at >= v_desde and tp.updated_at < v_hasta);
  elsif p_tipo = 'mundos' then
    return (select count(distinct public.mundo_de_problem_type(a.problem_type)) from public.attempts a where a.user_id = p_user and a.created_at >= v_desde and a.created_at < v_hasta)
         + (case when exists (select 1 from public.logic_attempts la where la.user_id = p_user and la.created_at >= v_desde and la.created_at < v_hasta) then 1 else 0 end);
  elsif p_tipo = 'rapidas' then
    return (select count(*) from public.attempts a where a.user_id = p_user and a.correct and a.time_ms < 3000 and a.created_at >= v_desde and a.created_at < v_hasta)
         + (select count(*) from public.logic_attempts la where la.user_id = p_user and la.correct and la.time_ms < 3000 and la.created_at >= v_desde and la.created_at < v_hasta);
  elsif p_tipo = 'reto_diario' then
    return (case when exists (select 1 from public.retos_diarios_completados r where r.user_id = p_user and r.fecha = p_fecha) then 1 else 0 end);
  end if;
  return 0;
end;
$$;

revoke execute on function public._progreso_mision(uuid, text, text, date) from public, anon, authenticated;

create or replace function public.mis_misiones()
returns table (tipo text, mundo text, meta integer, progreso integer, recompensa integer, reclamada boolean)
language plpgsql
stable
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
    select m.tipo, m.mundo, m.meta,
      least(public._progreso_mision(v_user, m.tipo, m.mundo, current_date), m.meta),
      m.recompensa,
      exists (select 1 from public.misiones_reclamadas r where r.user_id = v_user and r.fecha = current_date and r.tipo = m.tipo)
    from public._misiones_de(v_user, current_date) m;
end;
$$;

revoke execute on function public.mis_misiones() from public, anon;
grant execute on function public.mis_misiones() to authenticated;

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
  v_capsula boolean := false;
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
    insert into public.capsulas_usuario (user_id, tipo, origen)
    values (v_user, 'misiones', 'misiones:' || current_date)
    on conflict (user_id, origen) do nothing;
    v_capsula := found;
  end if;

  return query select pr.puntos_total, v_completas, v_capsula from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.reclamar_mision(text) from public, anon;
grant execute on function public.reclamar_mision(text) to authenticated;

-- ============================================================
-- 3) CALENDARIO DE 7 DÍAS
-- ============================================================
create table if not exists public.calendario_usuario (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  dia smallint not null default 0 check (dia between 0 and 7),
  ultima_fecha date
);

alter table public.calendario_usuario enable row level security;
drop policy if exists "cada uno ve su calendario" on public.calendario_usuario;
create policy "cada uno ve su calendario" on public.calendario_usuario for select using (auth.uid() = user_id);

-- Premio de cada día (el 7 es una cápsula de racha).
create or replace function public.premios_calendario()
returns table (dia smallint, premio text, cantidad integer)
language sql
immutable
as $$
  select t.dia::smallint, t.premio, t.cantidad
  from (values (1, 'chispas', 50), (2, 'chispas', 75), (3, 'hielo', 1), (4, 'chispas', 100), (5, 'tiempo_extra', 1), (6, 'chispas', 150), (7, 'capsula', 1)) as t(dia, premio, cantidad);
$$;

grant execute on function public.premios_calendario() to anon, authenticated;

-- ¿Sigue el calendario? Si ayer reclamaste, o si los días que faltaste están
-- cubiertos por un congelamiento de racha.
create or replace function public._calendario_sigue(p_user uuid, p_ultima date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_ultima is not null and (
    p_ultima >= current_date - 1
    or not exists (
      select 1 from generate_series(p_ultima + 1, current_date - 1, interval '1 day') as g(dia)
      where not exists (select 1 from public.daily_progress d where d.user_id = p_user and d.fecha = g.dia::date and d.congelado)
    )
  );
$$;

revoke execute on function public._calendario_sigue(uuid, date) from public, anon, authenticated;

create or replace function public.mi_calendario()
returns table (dia smallint, reclamado_hoy boolean, puede_reclamar boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cal public.calendario_usuario%rowtype;
  v_dia smallint;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_cal from public.calendario_usuario c where c.user_id = v_user;
  if found and v_cal.ultima_fecha = current_date then
    return query select v_cal.dia, true, false;
    return;
  end if;
  if found and public._calendario_sigue(v_user, v_cal.ultima_fecha) and v_cal.dia < 7 then
    v_dia := v_cal.dia + 1;
  else
    v_dia := 1;
  end if;
  return query select v_dia, false, public._jugo_hoy(v_user);
end;
$$;

revoke execute on function public.mi_calendario() from public, anon;
grant execute on function public.mi_calendario() to authenticated;

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
  elsif v_premio.premio = 'capsula' then
    insert into public.capsulas_usuario (user_id, tipo, origen)
    values (v_user, 'racha', 'calendario:' || current_date)
    on conflict (user_id, origen) do nothing;
  end if;

  return query select v_estado.dia, v_premio.premio, v_premio.cantidad, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

revoke execute on function public.reclamar_calendario() from public, anon;
grant execute on function public.reclamar_calendario() to authenticated;

-- ============================================================
-- 4) COLECCIONES POR CIUDAD (6 piezas) — progreso
-- ============================================================
create or replace function public.mis_colecciones()
returns table (mundo text, slug text, categoria text, nombre text, rareza text, vendible boolean, tengo boolean)
language sql
stable
security definer
set search_path = public
as $$
  select c.mundo, c.slug, c.categoria, c.nombre, c.rareza, c.vendible, public._tiene_cosmetico(auth.uid(), c.slug)
  from public.catalogo_cosmeticos c
  where c.mundo is not null and c.categoria <> 'ciudad_placa' and c.slug not like 'marco_coleccion_%'
  order by c.mundo, case c.categoria when 'marco' then 1 when 'fondo' then 2 when 'estela' then 3 when 'efecto' then 4 when 'emote' then 5 else 6 end;
$$;

revoke execute on function public.mis_colecciones() from public, anon;
grant execute on function public.mis_colecciones() to authenticated;

-- ============================================================
-- 5) REGALOS ENTRE AMIGOS (1 por día; hielo o escudo; nunca Chispas)
-- ============================================================
create table if not exists public.regalos_amigos (
  id uuid primary key default gen_random_uuid(),
  de uuid not null references public.profiles(id) on delete cascade,
  para uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('hielo', 'escudo')),
  fecha date not null default current_date,
  creado_at timestamptz not null default now(),
  recibido_at timestamptz,
  unique (de, fecha),
  check (de <> para)
);

alter table public.regalos_amigos enable row level security;
drop policy if exists "ven sus regalos" on public.regalos_amigos;
create policy "ven sus regalos" on public.regalos_amigos for select using (auth.uid() = de or auth.uid() = para);

create or replace function public.regalar_a_amigo(p_amigo uuid, p_tipo text)
returns void
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
  if p_tipo not in ('hielo', 'escudo') then
    raise exception 'regalo invalido';
  end if;
  if not exists (
    select 1 from public.friendships f
    where f.estado = 'aceptada'
      and ((f.user_id = v_user and f.friend_id = p_amigo) or (f.user_id = p_amigo and f.friend_id = v_user))
  ) then
    raise exception 'solo puedes regalar a tus amigos';
  end if;
  insert into public.regalos_amigos (de, para, tipo) values (v_user, p_amigo, p_tipo)
  on conflict (de, fecha) do nothing;
  if not found then
    raise exception 'ya mandaste tu regalo de hoy';
  end if;
end;
$$;

revoke execute on function public.regalar_a_amigo(uuid, text) from public, anon;
grant execute on function public.regalar_a_amigo(uuid, text) to authenticated;

create or replace function public.mis_regalos()
returns table (id uuid, de uuid, nombre text, avatar_url text, tipo text, creado_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.de, p.display_name, p.avatar_url, r.tipo, r.creado_at
  from public.regalos_amigos r
  join public.profiles p on p.id = r.de
  where r.para = auth.uid() and r.recibido_at is null
  order by r.creado_at;
$$;

revoke execute on function public.mis_regalos() from public, anon;
grant execute on function public.mis_regalos() to authenticated;

-- A quién le regalé hoy (null si todavía no).
create or replace function public.a_quien_regale_hoy()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select r.para from public.regalos_amigos r where r.de = auth.uid() and r.fecha = current_date;
$$;

revoke execute on function public.a_quien_regale_hoy() from public, anon;
grant execute on function public.a_quien_regale_hoy() to authenticated;

create or replace function public.recibir_regalo(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tipo text;
begin
  update public.regalos_amigos r set recibido_at = now()
  where r.id = p_id and r.para = v_user and r.recibido_at is null
  returning r.tipo into v_tipo;
  if v_tipo is null then
    raise exception 'regalo no encontrado';
  end if;
  if v_tipo = 'hielo' then
    update public.profiles as pr set hielos_disponibles = pr.hielos_disponibles + 1 where pr.id = v_user;
  else
    update public.profiles as pr set escudos_extra_pendientes = pr.escudos_extra_pendientes + 1 where pr.id = v_user;
  end if;
end;
$$;

revoke execute on function public.recibir_regalo(uuid) from public, anon;
grant execute on function public.recibir_regalo(uuid) to authenticated;

-- ============================================================
-- 6) OTORGAR LO QUE CORRESPONDA (al terminar una partida y al abrir Recompensas)
-- ============================================================
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
  v_tipo text;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select count(*) into v_antes from public.capsulas_usuario c where c.user_id = v_user;

  -- Diaria: la primera partida del día.
  if public._jugo_hoy(v_user) then
    insert into public.capsulas_usuario (user_id, tipo, origen) values (v_user, 'diaria', 'diaria:' || current_date)
    on conflict (user_id, origen) do nothing;
  end if;

  -- De racha: cada 7 días seguidos (con la meta de hoy cumplida).
  if exists (select 1 from public.daily_progress d where d.user_id = v_user and d.fecha = current_date and d.meta_alcanzada) then
    v_racha := public.racha_diaria_de(v_user);
    if v_racha > 0 and v_racha % 7 = 0 then
      insert into public.capsulas_usuario (user_id, tipo, origen, detalle)
      values (v_user, 'racha', 'racha:' || current_date, jsonb_build_object('dias', v_racha))
      on conflict (user_id, origen) do nothing;
    end if;
  end if;

  -- De nivel de cuenta (como mucho las últimas 5, por si subió muchos de golpe).
  select pr.nivel_cuenta, pr.capsulas_nivel_base into v_nivel, v_base from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_nivel, 1) > coalesce(v_base, 1) then
    for v_n in greatest(v_base + 1, v_nivel - 4)..v_nivel loop
      insert into public.capsulas_usuario (user_id, tipo, origen, detalle)
      values (v_user, 'nivel', 'nivel:' || v_n, jsonb_build_object('nivel', v_n))
      on conflict (user_id, origen) do nothing;
    end loop;
    update public.profiles set capsulas_nivel_base = v_nivel where id = v_user;
  end if;

  -- De ciudad: niveles 10, 20, 30… de cada mundo.
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
  select v_user, 'ciudad', w.world, 'ciudad:' || w.world || ':' || (k * 10), jsonb_build_object('nivel', k * 10)
  from public.world_progress w
  cross join lateral generate_series(1, greatest(w.nivel_mundo / 10, 0)) as k
  where w.user_id = v_user and w.nivel_mundo >= 10
  on conflict (user_id, origen) do nothing;

  -- Dominio: todas las Técnicas (gratis) de una ciudad completadas.
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen, detalle)
  select v_user, 'ciudad', x.mundo, 'dominio:' || x.mundo, jsonb_build_object('dominio', true)
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
  on conflict (user_id, origen) do nothing;

  -- De liga: la semana pasada, según el puesto por Experiencia.
  if not exists (select 1 from public.capsulas_usuario c where c.user_id = v_user and c.origen = 'liga:' || v_prev) then
    select sum(d.xp_ganado) into v_mi_xp from public.daily_progress d where d.user_id = v_user and d.fecha >= v_prev and d.fecha < v_lunes;
    if coalesce(v_mi_xp, 0) > 0 then
      select count(*) + 1 into v_puesto
      from (select d.user_id, sum(d.xp_ganado) as total from public.daily_progress d where d.fecha >= v_prev and d.fecha < v_lunes group by d.user_id) x
      where x.total > v_mi_xp;
      v_tipo := case when v_puesto <= 3 then 'liga_oro' when v_puesto <= 10 then 'liga_plata' when v_puesto <= 50 then 'liga_bronce' else 'liga' end;
      insert into public.capsulas_usuario (user_id, tipo, origen, detalle)
      values (v_user, v_tipo, 'liga:' || v_prev, jsonb_build_object('puesto', v_puesto, 'semana', v_prev))
      on conflict (user_id, origen) do nothing;
    end if;
  end if;

  -- Colección completa: las 6 piezas de una ciudad → cápsula con su marco animado.
  insert into public.capsulas_usuario (user_id, tipo, mundo, origen)
  select v_user, 'coleccion', m, 'coleccion:' || m
  from unnest(v_mundos) as m
  where not exists (
    select 1 from unnest(array['marco_' || m, 'fondo_ciudad_' || m, 'estela_ciudad_' || m, 'efecto_ciudad_' || m, 'emote_ciudad_' || m, 'titulo_ciudad_' || m]) as s
    where not public._tiene_cosmetico(v_user, s)
  )
  on conflict (user_id, origen) do nothing;

  return query
    select (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user) - v_antes,
           (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user and c.abierta_at is null);
end;
$$;

revoke execute on function public.revisar_recompensas() from public, anon;
grant execute on function public.revisar_recompensas() to authenticated;

-- Resumen para el inicio: cuántas cosas hay para reclamar.
create or replace function public.recompensas_pendientes()
returns table (capsulas integer, misiones integer, calendario boolean, regalos integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cal record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_cal from public.mi_calendario();
  return query select
    (select count(*)::integer from public.capsulas_usuario c where c.user_id = v_user and c.abierta_at is null),
    (select count(*)::integer from public.mis_misiones() m where not m.reclamada and m.progreso >= m.meta),
    (not v_cal.reclamado_hoy and v_cal.puede_reclamar),
    (select count(*)::integer from public.regalos_amigos r where r.para = v_user and r.recibido_at is null);
end;
$$;

revoke execute on function public.recompensas_pendientes() from public, anon;
grant execute on function public.recompensas_pendientes() to authenticated;

notify pgrst, 'reload schema';
