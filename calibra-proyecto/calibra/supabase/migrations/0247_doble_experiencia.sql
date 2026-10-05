-- ============================================================
-- 0247 — Evento "doble experiencia": cada día UN mundo da el doble de Exp.
--
-- Rota solo, por fecha (UTC), con la MISMA fórmula que
-- src/lib/eventos/dobleExperiencia.ts (la web y la app la usan para mostrar el
-- evento: en la app cae un paquete en paracaídas sobre esa ciudad):
--   índice = ((días desde 1970-01-01) * 7 + 3) % 13 sobre el orden de los mundos.
-- Quien decide la Exp es la base: insertar_intento e insertar_intento_logica
-- (redefinidas acá a partir de su versión vigente, 0131 y 0205, sin otro cambio)
-- duplican la Exp de cada acierto del mundo del día. Como registrar_xp_diario y
-- registrar_progreso_mundo suman la Exp real de los intentos, el doble llega solo
-- a la meta del día, a las Chispas y al nivel de mundo.
-- ============================================================

create or replace function public.mundo_doble_experiencia(p_fecha date default current_date)
returns text
language sql
immutable
as $$
  select (array['numeria','enigmia','geografia','quimia','anatomia','melodia','trigonometria','historia','calculia','circuitia','estadistica','naipia','codia'])[
    (((p_fecha - date '1970-01-01') * 7 + 3) % 13) + 1
  ];
$$;

grant execute on function public.mundo_doble_experiencia(date) to anon, authenticated;

-- Mundo de un problem_type de `attempts`: los 12 mundos usan el prefijo
-- "<mundo>_"; los temas de Numeria (suma, fracciones_…, algebra_…) no lo tienen.
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

  -- Doble experiencia: el mundo del día da el doble (mundo_doble_experiencia).
  if v_xp > 0 and public.mundo_doble_experiencia(current_date) = public.mundo_de_problem_type(p_problem_type) then
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

  -- Doble experiencia: el mundo del día da el doble (mundo_doble_experiencia).
  if v_xp > 0 and public.mundo_doble_experiencia(current_date) = 'enigmia' then
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
