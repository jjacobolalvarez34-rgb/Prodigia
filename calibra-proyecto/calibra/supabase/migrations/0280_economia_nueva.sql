-- ============================================================
-- Prodigia — Economía nueva (0280). PLAN_ECONOMIA.md §4.1 y §4.2.
--
-- Pedido del 2026-10-13: «no conviertas los saldos. no hay tope diario de
-- chispas. y ps haz todo lo demás». Entonces:
--   - La Experiencia y las Chispas se separan. La Experiencia sigue igual
--     (insertar_intento, niveles, ligas, meta diaria, clan y Monedas de la
--     Trastienda no cambian). Las Chispas se ganan por partida:
--     1 por respuesta (hasta 10) + 1 por acierto (hasta 20); el doble en el
--     mundo de doble experiencia o en la Gran Alineación; ×1,5 con boost.
--   - Subir de nivel de cuenta: 100 Chispas por nivel y 25 Cometas cada 10.
--   - Misiones 20/25/30, cápsulas más chicas, calendario 20…60 y 10 Cometas el
--     día 7, constelación 120, reto diario hasta 40 y semanal hasta 150.
--   - Liga semanal: Oro (top 3) 30 Cometas, Plata (top 10) 15, Bronce (top 50) 5.
--   - Logros: de 10 a 50 Cometas según dificultad (solo los que la base puede
--     comprobar, para que no se puedan regalar desde la consola).
--   - Precios: mundo 2500 Chispas o 300 Cometas; hielo 60, +3 s 50, escudo
--     120, boost 150; cosméticos común 400, raro 1200, épico 3000; lo
--     legendario solo con Cometas (600).
--   - Los saldos que ya tiene la gente NO se tocan, y no hay tope diario.
--
-- Base de cada función: su definición vigente (0263, 0259, 0249, 0156, 0241,
-- 0113), con solo los números cambiados. Necesita 0279 (Cometas). Idempotente.
-- ============================================================

-- ---------- 1) Chispas por partida ----------
-- Hasta qué intento ya se pagaron Chispas. Arranca en "ahora": lo jugado antes
-- de esta migración ya se pagó con la regla vieja.
alter table public.profiles add column if not exists chispas_partida_hasta timestamptz not null default now();

create or replace function public.recompensa_nivel_cuenta(p_nivel integer)
returns integer
language sql
immutable
as $$
  select 100;
$$;

-- Cometas por llegar a un nivel múltiplo de 10.
create or replace function public.cometas_nivel_cuenta(p_nivel integer)
returns integer
language sql
immutable
as $$
  select case when coalesce(p_nivel, 0) > 0 and p_nivel % 10 = 0 then 25 else 0 end;
$$;

-- acreditar_chispas (base 0241): ahora acredita solo Experiencia (y las Monedas
-- de la Trastienda, que siguen a la Experiencia). Al subir de nivel paga 100
-- Chispas por cada nivel ganado y 25 Cometas por cada múltiplo de 10 cruzado.
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
  v_n integer;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'no autorizado';
  end if;

  update public.profiles
  set monedas_trastienda = monedas_trastienda + greatest(p_monto, 0)
  where id = p_user_id;

  if p_monto > 0 then
    select nivel_cuenta into v_nivel_anterior from public.profiles where id = p_user_id;

    update public.profiles set xp_historico_total = xp_historico_total + p_monto
      where id = p_user_id
      returning xp_historico_total into v_xp_nuevo;

    v_nivel_nuevo := public.nivel_desde_xp_cuenta(v_xp_nuevo);

    if v_nivel_nuevo > v_nivel_anterior then
      v_subio := true;
      for v_n in (v_nivel_anterior + 1)..v_nivel_nuevo loop
        v_bonus := v_bonus + public.recompensa_nivel_cuenta(v_n);
        if public.cometas_nivel_cuenta(v_n) > 0 then
          perform public._dar_cometas(p_user_id, public.cometas_nivel_cuenta(v_n), 'nivel', 'nivel:' || v_n);
        end if;
      end loop;
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
revoke execute on function public.acreditar_chispas(uuid, integer) from public, anon, authenticated;

-- registrar_xp_diario (base 0156): igual para la Experiencia del día, y además
-- paga las Chispas de lo jugado desde el último cierre (chispas_partida_hasta).
-- Devuelve dos columnas nuevas: chispas_partida y cometas_nivel.
drop function if exists public.registrar_xp_diario(integer);

create function public.registrar_xp_diario(p_xp integer)
returns table (
  xp_total integer,
  xp_ganado_hoy integer,
  meta_alcanzada boolean,
  meta_xp_diaria integer,
  nivel_cuenta_subio boolean,
  nivel_cuenta_nuevo integer,
  nivel_cuenta_bonus integer,
  chispas_partida integer,
  cometas_nivel integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_meta integer;
  v_xp_hoy integer;
  v_meta_alcanzada boolean;
  v_real_hoy integer;
  v_ya_hoy integer;
  v_por_acreditar integer;
  v_puntos_total integer;
  v_desde timestamptz := date_trunc('day', now());
  v_nivel_subio boolean := false;
  v_nivel_nuevo integer;
  v_nivel_antes integer;
  v_bonus_nivel integer := 0;
  v_marca timestamptz;
  v_boost numeric;
  v_respuestas integer;
  v_aciertos integer;
  v_ultima timestamptz;
  v_doble boolean;
  v_chispas integer := 0;
  v_cometas integer := 0;
  v_n integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.chispas_partida_hasta, pr.nivel_cuenta, coalesce(pr.boost_multiplicador_pendiente, 1)
    into v_marca, v_nivel_antes, v_boost
  from public.profiles pr where pr.id = v_user for update;

  -- Chispas de la partida: lo respondido desde el último cierre.
  with nuevos as (
    select a.created_at, a.xp, public.mundo_de_problem_type(a.problem_type) as mundo
    from public.attempts a where a.user_id = v_user and a.created_at > v_marca
    union all
    select la.created_at, la.xp, 'enigmia'
    from public.logic_attempts la where la.user_id = v_user and la.created_at > v_marca
  )
  select count(*)::integer, (count(*) filter (where n.xp > 0))::integer, max(n.created_at),
         coalesce(bool_or(n.mundo = public.mundo_doble_experiencia(current_date)), false)
    into v_respuestas, v_aciertos, v_ultima, v_doble
  from nuevos n;

  if v_respuestas > 0 then
    v_chispas := least(v_respuestas, 10) + least(v_aciertos, 20);
    if v_doble or public.en_gran_alineacion() then
      v_chispas := v_chispas * 2;
    end if;
    if v_boost > 1 then
      v_chispas := round(v_chispas * v_boost)::integer;
    end if;
    update public.profiles as pr
    set puntos_total = pr.puntos_total + v_chispas,
        chispas_partida_hasta = v_ultima
    where pr.id = v_user;
  end if;

  -- Experiencia del día (igual que 0156).
  v_real_hoy :=
    (select coalesce(sum(a.xp)::integer, 0) from public.attempts a
      where a.user_id = v_user and a.created_at >= v_desde)
    + (select coalesce(sum(la.xp)::integer, 0) from public.logic_attempts la
      where la.user_id = v_user and la.created_at >= v_desde);

  select coalesce(xp_ganado, 0) into v_ya_hoy
  from public.daily_progress where user_id = v_user and fecha = current_date;

  v_por_acreditar := greatest(0, v_real_hoy - coalesce(v_ya_hoy, 0));

  if v_por_acreditar > 0 then
    insert into public.daily_progress (user_id, fecha, xp_ganado)
    values (v_user, current_date, v_por_acreditar)
    on conflict (user_id, fecha)
    do update set xp_ganado = public.daily_progress.xp_ganado + excluded.xp_ganado
    returning public.daily_progress.xp_ganado into v_xp_hoy;

    select acc.nivel_subio, acc.nivel_nuevo, acc.bonus_nivel
      into v_nivel_subio, v_nivel_nuevo, v_bonus_nivel
      from public.acreditar_chispas(v_user, v_por_acreditar) acc;

    if v_nivel_subio then
      for v_n in (coalesce(v_nivel_antes, 1) + 1)..v_nivel_nuevo loop
        v_cometas := v_cometas + public.cometas_nivel_cuenta(v_n);
      end loop;
    end if;
  else
    select coalesce(xp_ganado, 0) into v_xp_hoy
    from public.daily_progress where user_id = v_user and fecha = current_date;
    v_xp_hoy := coalesce(v_xp_hoy, 0);
    select nivel_cuenta into v_nivel_nuevo from public.profiles where id = v_user;
  end if;

  select p.meta_xp_diaria into v_meta from public.profiles p where p.id = v_user;
  v_meta_alcanzada := v_xp_hoy >= v_meta;

  update public.daily_progress
  set meta_alcanzada = v_meta_alcanzada
  where user_id = v_user and fecha = current_date;

  select puntos_total into v_puntos_total from public.profiles where id = v_user;

  return query select v_puntos_total, v_xp_hoy, v_meta_alcanzada, v_meta,
    v_nivel_subio, coalesce(v_nivel_nuevo, 1), v_bonus_nivel, v_chispas, v_cometas;
end;
$$;

grant execute on function public.registrar_xp_diario(integer) to authenticated;

-- ---------- 2) Premios ----------
create or replace function public.contenido_capsula(p_tipo text)
returns table (premio text, peso integer, minimo integer, maximo integer)
language sql
immutable
as $$
  select t.premio, t.peso, t.minimo, t.maximo
  from (values
    ('diaria', 'chispas', 70, 15, 40),
    ('diaria', 'hielo', 10, 1, 1),
    ('diaria', 'tiempo_extra', 10, 1, 1),
    ('diaria', 'escudo', 10, 1, 1),
    ('misiones', 'chispas', 70, 15, 40),
    ('misiones', 'hielo', 10, 1, 1),
    ('misiones', 'tiempo_extra', 10, 1, 1),
    ('misiones', 'escudo', 10, 1, 1),
    ('racha', 'chispas', 60, 60, 160),
    ('racha', 'cosmetico_comun', 25, 1, 1),
    ('racha', 'cosmetico_raro', 15, 1, 1),
    ('nivel', 'chispas', 80, 20, 60),
    ('nivel', 'cosmetico_raro', 20, 1, 1),
    ('ciudad', 'coleccion', 100, 1, 1),
    ('liga', 'chispas', 100, 40, 100),
    ('liga_bronce', 'chispas', 60, 80, 200),
    ('liga_bronce', 'cosmetico_raro', 40, 1, 1),
    ('liga_plata', 'cosmetico_raro', 60, 1, 1),
    ('liga_plata', 'cosmetico_epico', 40, 1, 1),
    ('liga_oro', 'cosmetico_epico', 60, 1, 1),
    ('liga_oro', 'cosmetico_legendario', 40, 1, 1),
    ('coleccion', 'marco_coleccion', 100, 1, 1)
  ) as t(tipo, premio, peso, minimo, maximo)
  where t.tipo = p_tipo;
$$;

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
      ('aciertos', 30, 20),
      ('aciertos_mundo', 15, 25),
      ('experiencia', 400, 25),
      ('duelo', 1, 30),
      ('leccion', 1, 25),
      ('mundos', 3, 25),
      ('rapidas', 10, 25),
      ('reto_diario', 1, 20)
    ) as p(tipo, meta, recompensa)
    order by md5(p_user::text || p_fecha::text || p.tipo)
    limit 3;
end;
$$;

create or replace function public.premios_calendario()
returns table (dia smallint, premio text, cantidad integer)
language sql
immutable
as $$
  select t.dia::smallint, t.premio, t.cantidad
  from (values (1, 'chispas', 20), (2, 'chispas', 30), (3, 'hielo', 1), (4, 'chispas', 40), (5, 'tiempo_extra', 1), (6, 'chispas', 60), (7, 'estrellas', 3)) as t(dia, premio, cantidad);
$$;

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
  -- El día 7 también da 10 Cometas (0280).
  if v_estado.dia = 7 then
    perform public._dar_cometas(v_user, 10, 'calendario', 'calendario:' || current_date);
  end if;

  return query select v_estado.dia, v_premio.premio, v_premio.cantidad, pr.puntos_total from public.profiles pr where pr.id = v_user;
end;
$$;

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
  v_chispas := 120;

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
    v_chispas := v_chispas + 60;
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
      perform public._dar_chispas(p_user, 80);
      v_fugaz := jsonb_build_object('premio', 'chispas', 'cantidad', 80);
    end if;
  end if;

  insert into public.constelaciones_completadas (user_id, mundo, numero, premio, de_noche, alineacion)
  values (p_user, p_mundo, p_numero, jsonb_build_object('chispas', v_chispas, 'pieza', v_pieza, 'fugaz', v_fugaz), v_noche, v_alin);
end;
$$;

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

  -- 20 Chispas por acierto, tope 100 (antes: 5/acierto, tope 225 con
  -- las 45 preguntas viejas) — un reto más corto, pero mejor pagado por
  -- pregunta.
  v_bonus := greatest(0, least(5, p_correctos)) * 8;

  insert into public.retos_diarios_completados (user_id, fecha, correctos, puntos_bonus)
  values (v_user, p_fecha, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

create or replace function public.completar_reto_semanal(p_semana date, p_correctos smallint)
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
  if p_semana <> date_trunc('week', current_date)::date then
    raise exception 'semana invalida';
  end if;

  select exists(
    select 1 from public.retos_semanales_completados where user_id = v_user and semana_inicio = p_semana
  ) into v_existe;

  if v_existe then
    return query select 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user), true;
    return;
  end if;

  -- 10 Chispas por acierto, tope 450 — bastante más que el diario (100
  -- tope), acorde a que es un compromiso semanal de 45 preguntas.
  v_bonus := round(greatest(0, least(45, p_correctos)) * 150 / 45.0)::integer;

  insert into public.retos_semanales_completados (user_id, semana_inicio, correctos, puntos_bonus)
  values (v_user, p_semana, p_correctos, v_bonus);

  update public.profiles as pr set puntos_total = pr.puntos_total + v_bonus where pr.id = v_user;

  return query select v_bonus, (select pr.puntos_total from public.profiles pr where pr.id = v_user), false;
end;
$$;

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
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
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
      -- Y en Cometas (0280): Oro (top 3) 30, Plata (top 10) 15, Bronce (top 50) 5.
      if v_puesto <= 50 then
        perform public._dar_cometas(v_user, case when v_puesto <= 3 then 30 when v_puesto <= 10 then 15 else 5 end, 'liga', 'liga:' || v_prev);
      end if;
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

-- Logros → Cometas. Solo los que la base puede comprobar ella misma: cualquiera
-- puede insertar en user_achievements desde su sesión (0060), así que un logro
-- que no se puede verificar acá no da Cometas.
create or replace function public.cometas_de_logro(p_user uuid, p_criterio jsonb)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tipo text := p_criterio ->> 'tipo';
  v_valor numeric := coalesce((p_criterio ->> 'valor')::numeric, 0);
  v_actual numeric;
  v_mundo text;
begin
  if v_tipo = 'racha_dias' then
    v_actual := public.racha_diaria_de(p_user);
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 100 then 50 when v_valor >= 30 then 30 else 10 end;
  elsif v_tipo = 'problemas_totales' then
    select count(*) into v_actual from public.attempts a where a.user_id = p_user;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 1000 then 50 when v_valor >= 500 then 30 else 10 end;
  elsif v_tipo = 'logica_problemas_totales' then
    select count(*) into v_actual from public.logic_attempts la where la.user_id = p_user;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo like '%\_problemas\_totales' then
    v_mundo := replace(v_tipo, '_problemas_totales', '');
    select count(*) into v_actual from public.attempts a where a.user_id = p_user and public.mundo_de_problem_type(a.problem_type) = v_mundo;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo like '%\_nivel\_mundo' then
    v_mundo := replace(v_tipo, '_nivel_mundo', '');
    select coalesce(max(w.nivel_mundo), 0) into v_actual from public.world_progress w where w.user_id = p_user and w.world = v_mundo;
    return case when v_actual >= v_valor then 10 else 0 end;
  elsif v_tipo = 'duelos_ganados' then
    select count(*) into v_actual from public.duels d where d.ganador_id = p_user and d.clasificatorio;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 20 then 30 when v_valor >= 5 then 20 else 10 end;
  elsif v_tipo = 'elo_minimo' then
    select pr.elo_rating into v_actual from public.profiles pr where pr.id = p_user;
    if coalesce(v_actual, 0) < v_valor then return 0; end if;
    return case when v_valor >= 1700 then 50 when v_valor >= 1500 then 30 when v_valor >= 1300 then 20 else 10 end;
  elsif v_tipo = 'reto_diario_total' then
    select count(*) into v_actual from public.retos_diarios_completados r where r.user_id = p_user;
    return case when v_actual >= v_valor then 20 else 0 end;
  elsif v_tipo = 'reto_semanal_total' then
    select count(*) into v_actual from public.retos_semanales_completados r where r.user_id = p_user;
    if v_actual < v_valor then return 0; end if;
    return case when v_valor >= 20 then 30 else 20 end;
  elsif v_tipo = 'tecnicas_dominadas' then
    select count(*) into v_actual from public.technique_progress tp where tp.user_id = p_user and tp.dominado;
    return case when v_actual >= v_valor then 20 else 0 end;
  end if;
  return 0;
end;
$$;
revoke execute on function public.cometas_de_logro(uuid, jsonb) from public, anon, authenticated;

create or replace function public._cometas_por_logro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_criterio jsonb;
  v_cometas integer;
begin
  select a.criterio into v_criterio from public.achievements a where a.id = new.achievement_id;
  v_cometas := public.cometas_de_logro(new.user_id, v_criterio);
  if v_cometas > 0 then
    perform public._dar_cometas(new.user_id, v_cometas, 'logro', 'logro:' || new.achievement_id);
  end if;
  return new;
end;
$$;

drop trigger if exists cometas_por_logro on public.user_achievements;
create trigger cometas_por_logro after insert on public.user_achievements
  for each row execute function public._cometas_por_logro();

-- ---------- 3) Precios ----------
-- Cosméticos por rareza (común 400, raro 1200, épico 3000). Lo legendario se
-- compra solo con Cometas (600); su `precio` queda como referencia para
-- convertir un repetido de cápsula en Chispas (precio ÷ 3).
create or replace function public.precio_chispas_rareza(p_rareza text)
returns integer
language sql
immutable
as $$
  select case p_rareza when 'comun' then 400 when 'raro' then 1200 when 'epico' then 3000 else 6000 end;
$$;
grant execute on function public.precio_chispas_rareza(text) to anon, authenticated;

alter table public.catalogo_cosmeticos add column if not exists precio_cometas integer check (precio_cometas is null or precio_cometas > 0);

update public.catalogo_cosmeticos c
set precio = public.precio_chispas_rareza(c.rareza),
    precio_cometas = case when c.rareza = 'legendario' and c.vendible then 600 else null end
where c.slug not like 'marco\_coleccion\_%';

-- Paquetes: la suma de lo que traen con −25 % (mismo criterio que 0248).
update public.paquetes_tienda pq
set precio = floor((select sum(c.precio) from public.catalogo_cosmeticos c where c.slug = any(pq.items)) * 0.75)::integer;

create or replace function public.comprar_item_tienda(p_item text, p_costo integer)
returns table (
  puntos_total integer,
  escudos_extra_pendientes smallint,
  congelamientos_disponibles smallint,
  boost_multiplicador_pendiente numeric,
  fuentes_desbloqueadas text[],
  marcos_desbloqueados text[],
  animaciones_desbloqueadas text[],
  fondos_desbloqueados text[],
  hielos_disponibles smallint,
  tiempos_extra_disponibles smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_costo_base integer;
  v_mundo text;
  v_nivel_mundo integer;
  v_plan text;
  v_categoria text;
  v_catalogo public.catalogo_cosmeticos%rowtype;
  v_paquete public.paquetes_tienda%rowtype;
  v_es_catalogo boolean := false;
  v_es_paquete boolean := false;
  v_item_paquete text;
  v_mundos constant text[] := array['numeria', 'enigmia', 'geografia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia'];
  v_items_pro constant text[] := array['animacion_prisma', 'fondo_prodigio'];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  -- Precios de 0280 (PLAN_ECONOMIA.md §4.2). Los cosméticos ya no están acá: salen
  -- de su rareza en catalogo_cosmeticos (ver precio_chispas_rareza).
  v_costo_base := case p_item
    when 'escudo' then 120
    when 'congelamiento' then 150
    when 'boost' then 150
    when 'hielo' then 60
    when 'tiempo_extra' then 50
    when 'pista' then 60
    when 'segunda_oportunidad' then 100
    when 'cofre_hielos' then 150
    when 'paquete_marcos_mundo' then 33750
    when 'fondo_personalizado' then 3000
    when 'color_nombre_personalizado' then 1200
    when 'animacion_prisma' then 3000
    when 'fondo_prodigio' then 3000
    else null
  end;

  -- Lo nuevo (0248): precio del catálogo o del paquete.
  if v_costo_base is null then
    select * into v_catalogo from public.catalogo_cosmeticos c where c.slug = p_item and c.vendible;
    if found then
      if v_catalogo.rareza = 'legendario' then
        raise exception 'lo legendario se compra con Cometas';
      end if;
      v_es_catalogo := true;
      v_costo_base := v_catalogo.precio;
      if v_catalogo.temporada is not null and v_catalogo.temporada <> public.temporada_actual() then
        raise exception 'este marco de temporada no esta a la venta este mes';
      end if;
    else
      select * into v_paquete from public.paquetes_tienda pq where pq.slug = p_item;
      if found then
        v_es_paquete := true;
        v_costo_base := v_paquete.precio;
      end if;
    end if;
  end if;

  if v_costo_base is null then
    raise exception 'item invalido';
  end if;
  if p_costo < ceil(v_costo_base * 0.5) then
    raise exception 'precio invalido';
  end if;

  if p_item = any(v_items_pro) then
    select pr.plan into v_plan from public.profiles pr where pr.id = v_user;
    if v_plan is distinct from 'pro' then
      raise exception 'este cosmetico es exclusivo de Prodigia Pro';
    end if;
  end if;

  if p_item in ('marco_numeria', 'marco_enigmia', 'marco_geografia', 'marco_quimia', 'marco_anatomia', 'marco_melodia', 'marco_trigonometria', 'marco_historia', 'marco_calculia', 'marco_circuitia', 'marco_estadistica', 'marco_naipia', 'marco_codia', 'marco_dinamia', 'marco_vitalia') then
    v_mundo := replace(p_item, 'marco_', '');
    select w.nivel_mundo into v_nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = v_mundo;
    if coalesce(v_nivel_mundo, 0) < 40 then
      raise exception 'todavia no alcanzaste suficiente nivel en % para desbloquear este marco', v_mundo;
    end if;
  elsif p_item = 'paquete_marcos_mundo' then
    if exists (
      select 1 from unnest(v_mundos) m
      where coalesce((select w.nivel_mundo from public.world_progress w where w.user_id = v_user and w.world = m), 0) < 40
    ) then
      raise exception 'todavia no alcanzaste nivel 40 en los 15 mundos';
    end if;
  end if;

  if v_es_catalogo and public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes este articulo';
  end if;
  if v_es_paquete and not exists (select 1 from unnest(v_paquete.items) i where not public._tiene_cosmetico(v_user, i)) then
    raise exception 'ya tienes todo lo de este paquete';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < p_costo then
    raise exception 'te faltan Chispas para comprar esto';
  end if;

  if v_es_catalogo then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    perform public._dar_cosmetico(v_user, p_item);
  elsif v_es_paquete then
    update public.profiles as pr set puntos_total = pr.puntos_total - p_costo where pr.id = v_user;
    foreach v_item_paquete in array v_paquete.items loop
      perform public._dar_cosmetico(v_user, v_item_paquete);
    end loop;
  elsif p_item = 'pista' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        pistas_disponibles = pr.pistas_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'segunda_oportunidad' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        segundas_oportunidades_disponibles = pr.segundas_oportunidades_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'cofre_hielos' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 3
    where pr.id = v_user;
  elsif p_item = 'escudo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        escudos_extra_pendientes = pr.escudos_extra_pendientes + 1
    where pr.id = v_user;
  elsif p_item = 'congelamiento' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        congelamientos_disponibles = pr.congelamientos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'boost' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        boost_multiplicador_pendiente = 1.5
    where pr.id = v_user;
  elsif p_item = 'hielo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        hielos_disponibles = pr.hielos_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'tiempo_extra' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        tiempos_extra_disponibles = pr.tiempos_extra_disponibles + 1
    where pr.id = v_user;
  elsif p_item = 'paquete_marcos_mundo' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = (select array(select distinct u from unnest(pr.marcos_desbloqueados || v_mundos) as u))
    where pr.id = v_user;
  elsif p_item like 'marco_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        marcos_desbloqueados = case
          when (replace(p_item, 'marco_', '')) = any(pr.marcos_desbloqueados)
            then pr.marcos_desbloqueados
          else array_append(pr.marcos_desbloqueados, replace(p_item, 'marco_', ''))
        end
    where pr.id = v_user;
  elsif p_item like 'animacion_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        animaciones_desbloqueadas = case
          when (replace(p_item, 'animacion_', '')) = any(pr.animaciones_desbloqueadas)
            then pr.animaciones_desbloqueadas
          else array_append(pr.animaciones_desbloqueadas, replace(p_item, 'animacion_', ''))
        end
    where pr.id = v_user;
  elsif p_item = 'color_nombre_personalizado' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        color_nombre_desbloqueado = true
    where pr.id = v_user;
  elsif p_item like 'fondo_%' then
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fondos_desbloqueados = case
          when (replace(p_item, 'fondo_', '')) = any(pr.fondos_desbloqueados)
            then pr.fondos_desbloqueados
          else array_append(pr.fondos_desbloqueados, replace(p_item, 'fondo_', ''))
        end
    where pr.id = v_user;
  else
    update public.profiles as pr
    set puntos_total = pr.puntos_total - p_costo,
        fuentes_desbloqueadas = case
          when (replace(p_item, 'fuente_', '')) = any(pr.fuentes_desbloqueadas)
            then pr.fuentes_desbloqueadas
          else array_append(pr.fuentes_desbloqueadas, replace(p_item, 'fuente_', ''))
        end
    where pr.id = v_user;
  end if;

  -- tienda_compras.categoria solo admite estas 5 (0159): lo nuevo cae en la más cercana.
  v_categoria := case
    when v_es_catalogo and v_catalogo.categoria in ('fuente', 'marco', 'animacion', 'fondo') then v_catalogo.categoria
    when v_es_catalogo or v_es_paquete then 'consumible'
    when p_item like 'fuente_%' then 'fuente'
    when p_item like 'marco_%' or p_item = 'paquete_marcos_mundo' then 'marco'
    when p_item like 'animacion_%' then 'animacion'
    when p_item like 'fondo_%' then 'fondo'
    else 'consumible'
  end;

  insert into public.tienda_compras (user_id, item_slug, categoria, costo)
  values (v_user, p_item, v_categoria, p_costo);

  return query
    select pr.puntos_total, pr.escudos_extra_pendientes, pr.congelamientos_disponibles,
      pr.boost_multiplicador_pendiente, pr.fuentes_desbloqueadas, pr.marcos_desbloqueados,
      pr.animaciones_desbloqueadas, pr.fondos_desbloqueados, pr.hielos_disponibles, pr.tiempos_extra_disponibles
    from public.profiles pr where pr.id = v_user;
end;
$$;

-- Comprar con Cometas: lo legendario del catálogo.
create or replace function public.comprar_con_cometas(p_item text)
returns table (cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_item public.catalogo_cosmeticos%rowtype;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  select * into v_item from public.catalogo_cosmeticos c where c.slug = p_item and c.vendible and c.precio_cometas is not null;
  if not found then
    raise exception 'esto no se vende con Cometas';
  end if;
  if v_item.temporada is not null and v_item.temporada <> public.temporada_actual() then
    raise exception 'este marco de temporada no esta a la venta este mes';
  end if;
  if public._tiene_cosmetico(v_user, p_item) then
    raise exception 'ya tienes este articulo';
  end if;
  select pr.cometas into v_saldo from public.profiles pr where pr.id = v_user for update;
  if coalesce(v_saldo, 0) < v_item.precio_cometas then
    raise exception 'te faltan Cometas para comprar esto';
  end if;
  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_item.precio_cometas, 'compra', 'compra:' || p_item);
  update public.profiles as pr set cometas = pr.cometas - v_item.precio_cometas where pr.id = v_user;
  perform public._dar_cosmetico(v_user, p_item);
  return query select pr.cometas from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.comprar_con_cometas(text) from public, anon;
grant execute on function public.comprar_con_cometas(text) to authenticated;

-- Mundo nuevo: 2500 Chispas (antes 3000).
create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 2500;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tienes ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

-- …o 300 Cometas.
create or replace function public.desbloquear_mundo_con_cometas(p_mundo text)
returns table (cometas integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 300;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo invalido';
  end if;

  select pr.cometas, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user for update;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tienes ese mundo desbloqueado';
  end if;
  if coalesce(v_saldo, 0) < v_costo then
    raise exception 'te faltan Cometas — % cuesta % Cometas', p_mundo, v_costo;
  end if;

  insert into public.cometas_movimientos (user_id, cantidad, motivo, referencia)
  values (v_user, -v_costo, 'mundo', 'mundo:' || p_mundo);
  update public.profiles as pr
  set cometas = pr.cometas - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.cometas, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.desbloquear_mundo_con_cometas(text) from public, anon;
grant execute on function public.desbloquear_mundo_con_cometas(text) to authenticated;

notify pgrst, 'reload schema';
