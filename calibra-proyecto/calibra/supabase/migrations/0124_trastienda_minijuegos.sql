-- 0124: Trastienda — Mecánica 5 (minijuegos) corte 2: La Calcu, Acertijos
-- de Enigmia y El Reloj. Sigue a 0123_trastienda_mecanicas_123.sql.
--
-- TRASTIENDA-ECONOMIA.md §5 (los tres que 0121 dejó PENDIENTE por requerir
-- sesión propia/validación server):
--   - La Calcu: el server GENERA el puzzle (4 números + meta), guarda la
--     solución, y valida la expresión que manda el cliente como AST JSON
--     (["+", num|exp, num|exp]) — sin eval de texto, sin inyección.
--     Costo 50 · salida 125 (×2.5) · bonus 200 si resuelve en ≤10s.
--   - Acertijos: el server genera la secuencia y la devuelve UNA vez (es el
--     juego de memoria: mostrarla es parte del juego); guarda la copia y
--     compara el orden que manda el cliente. Dificultad que sube con la
--     racha (3 seguidas → media, más → difícil). Costo 100 · salidas 60/100/170.
--   - El Reloj: 15 problemas de suma/resta, las respuestas viven SOLO en el
--     server (sesión sin grants ni policies). El cliente responde todo y el
--     server compara + aplica el reloj total (85s). Costo 60 · salidas 160/95/55.
--
-- Igual que en 0121: tablas de sesión SIN grants ni RLS (el secreto no se
-- expone nunca), escrituras solo por RPC security definer.

-- ---------- 1) Sesiones ----------
-- La Calcu: puzzle generado por el server; numeros = los 4 dados al jugador.
create table public.trastienda_calcu (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  numeros integer[] not null,
  target integer not null,
  solucion jsonb not null,
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- Acertijos: secuencia generada por el server (la muestra una vez).
create table public.trastienda_acertijos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  secuencia integer[] not null,
  dificultad text not null check (dificultad in ('facil', 'media', 'dificil')),
  estado text not null default 'jugando' check (estado in ('jugando', 'ganado', 'perdido')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- El Reloj: problemas con respuesta incluida — la tabla NO se grantea, el
-- cliente recibe los problemas sin 'resp' desde iniciar_el_reloj.
create table public.trastienda_reloj (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minijuego_id uuid not null references public.trastienda_minijuegos(id),
  problemas jsonb not null,
  estado text not null default 'jugando' check (estado in ('jugando', 'terminado')),
  creado_at timestamptz not null default now(),
  resuelto_at timestamptz
);

-- ---------- 2) Helpers de evaluación de expressiones (La Calcu) ----------
-- Evaluador seguro: recorre el AST ["+", a, b] / ["-"] / ["*"] / ["/"].
-- Devuelve NULL si la estructura no es válida o divide por cero.
create or replace function public.eval_calcu(p_node jsonb)
returns numeric
language plpgsql
immutable
as $$
declare
  v_op text;
  v_a numeric;
  v_b numeric;
begin
  if jsonb_typeof(p_node) = 'number' then
    return (p_node)::numeric;
  end if;
  if jsonb_typeof(p_node) <> 'array' or jsonb_array_length(p_node) <> 3 then
    return null;
  end if;
  if jsonb_typeof(p_node->0) <> 'string' then
    return null;
  end if;
  v_op := p_node->>0;
  if v_op not in ('+', '-', '*', '/') then
    return null;
  end if;
  v_a := public.eval_calcu(p_node->1);
  v_b := public.eval_calcu(p_node->2);
  if v_a is null or v_b is null then
    return null;
  end if;
  if v_op = '+' then return v_a + v_b; end if;
  if v_op = '-' then return v_a - v_b; end if;
  if v_op = '*' then return v_a * v_b; end if;
  if v_b = 0 then return null; end if;
  return v_a / v_b;
end;
$$;

-- Hoja de números usados por la expresión (multiset, con recursión).
create or replace function public.hojas_calcu(p_node jsonb)
returns integer[]
language plpgsql
immutable
as $$
declare
  v_left integer[];
  v_right integer[];
begin
  if jsonb_typeof(p_node) = 'number' then
    return array[(p_node)::numeric::int];
  end if;
  if jsonb_typeof(p_node) <> 'array' or jsonb_array_length(p_node) <> 3 then
    return array[]::integer[];
  end if;
  v_left := public.hojas_calcu(p_node->1);
  v_right := public.hojas_calcu(p_node->2);
  return v_left || v_right;
end;
$$;

-- Genera un puzzle resoluble: arma un árbol escondido de 4 números con
-- + - * (enteros) y devuelve (numeros, target, solucion). El jugador puede
-- usar ÷ también; la meta alcanzable con + - * siempre lo es.
create or replace function public.generar_puzzle_calcu()
returns table (numeros integer[], target integer, solucion jsonb)
language plpgsql
as $$
declare
  v_numbers integer[];
  v_lhs numeric;
  v_rhs numeric;
  v_node jsonb;
  v_node2 jsonb;
  v_root jsonb;
  v_op text;
  v_op2 text;
  v_op3 text;
  v_val12 numeric;
  v_val2 numeric;
  v_target numeric;
begin
  -- 4 números 1-13 al azar.
  v_numbers := array[
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int,
    1 + floor(random() * 12)::int
  ];

-- Fusiones con forma fija izquierda: ((a op b) op c) op d. Las dos fusiones
-- internas pueden usar ÷ (el target no se vuelve entero hasta la última,
-- que es + - * — así la meta final siempre es entera, pero el jugador tiene
-- que navegar fracciones intermedias como en el "24 game").
  v_op := (array['+', '-', '*', '/'])[1 + floor(random() * 4)::int];
  v_lhs := v_numbers[1];
  v_rhs := v_numbers[2];
  if v_op = '-' and v_lhs < v_rhs then
    v_op := '+';
  end if; -- el rhs de la fusion 1 nunca es 0 (es un número 1-13): no hay div0.
  v_node := jsonb_build_array(v_op, to_jsonb(v_numbers[1]), to_jsonb(v_numbers[2]));
  v_val12 := case
    when v_op = '+' then v_lhs + v_rhs
    when v_op = '-' then v_lhs - v_rhs
    when v_op = '*' then v_lhs * v_rhs
    else v_lhs / v_rhs
  end;

  v_op2 := (array['+', '-', '*', '/'])[1 + floor(random() * 4)::int];
  v_lhs := v_val12;
  v_rhs := v_numbers[3]::numeric;
  if v_op2 = '-' and v_lhs < v_rhs then
    v_op2 := '+';
  end if; -- el rhs de la fusion 2 tampoco es 0 (número 1-13).
  v_node2 := jsonb_build_array(v_op2, v_node, to_jsonb(v_numbers[3]));
  v_val2 := case
    when v_op2 = '+' then v_lhs + v_rhs
    when v_op2 = '-' then v_lhs - v_rhs
    when v_op2 = '*' then v_lhs * v_rhs
    else v_lhs / v_rhs
  end;

  v_op3 := (array['+', '-', '*'])[1 + floor(random() * 3)::int];
  v_lhs := v_val2;
  v_rhs := v_numbers[4]::numeric;
  if v_op3 = '-' and v_lhs < v_rhs then
    v_op3 := '+';
  end if;
  v_root := jsonb_build_array(v_op3, v_node2, to_jsonb(v_numbers[4]));
  v_target := case v_op3 when '+' then v_lhs + v_rhs when '-' then v_lhs - v_rhs else v_lhs * v_rhs end;

  return query select v_numbers, v_target::int, v_root;
end;
$$;

-- ---------- 3) RPC La Calcu ----------
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

  update public.profiles set puntos_total = puntos_total - 50 where id = v_user;

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
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
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

-- ---------- 4) RPC Acertijos ----------
-- Dificultad por racha (spec: 3 seguidas suben a media; más racha → difícil).
create or replace function public.iniciar_acertijos()
returns table (
  acertijo_id uuid,
  secuencia integer[],
  dificultad text,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_racha integer := 0;
  v_dificultad text;
  v_len integer;
  v_secuencia integer[];
  v_minijuego_id uuid;
  v_ultimo boolean;
  v_usados boolean[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 100 then
    raise exception 'te faltan Chispas para los acertijos';
  end if;

  -- Racha de victorias consecutivas en acertijos.
  for v_ultimo in
    select m.salida > 0
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'acertijos'
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;

  v_dificultad := case
    when v_racha >= 6 then 'dificil'
    when v_racha >= 3 then 'media'
    else 'facil'
  end;
  v_len := case v_dificultad when 'facil' then 4 when 'media' then 5 else 6 end;

  -- Secuencia de símbolos (1-8) TODOS distintos (un patrón bien legible).
  v_secuencia := array[]::integer[];
  v_usados := array_fill(false, array[8]);
  while cardinality(v_secuencia) < v_len loop
    declare
      v_sym integer := 1 + floor(random() * 8)::int;
    begin
      if not v_usados[v_sym] then
        v_secuencia := v_secuencia || v_sym;
        v_usados[v_sym] := true;
      end if;
    end;
  end loop;

  update public.profiles set puntos_total = puntos_total - 100 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'acertijos', 100)
  returning id into v_minijuego_id;

  insert into public.trastienda_acertijos (user_id, minijuego_id, secuencia, dificultad)
  values (v_user, v_minijuego_id, v_secuencia, v_dificultad);

  return query select
    a.id,
    v_secuencia,
    v_dificultad,
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_acertijos a
  where a.user_id = v_user and a.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_acertijos() to authenticated;

create or replace function public.responder_acertijos(p_acertijo_id uuid, p_secuencia integer[])
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
  v_fila public.trastienda_acertijos%rowtype;
  v_payout integer := 0;
  v_ganado boolean := false;
  v_ok boolean;
  v_racha integer;
  v_ultimo boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_acertijos
  where id = p_acertijo_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'ese acertijo ya terminó';
  end if;

  if now() - v_fila.creado_at > interval '30 seconds' then
    update public.trastienda_acertijos
    set estado = 'perdido', resuelto_at = now()
    where id = p_acertijo_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('ganaste', false, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select false, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  v_ok := cardinality(p_secuencia) = cardinality(v_fila.secuencia)
      and p_secuencia @> v_fila.secuencia
      and v_fila.secuencia @> p_secuencia;

  if v_ok then
    v_ganado := true;
    v_payout := case v_fila.dificultad
      when 'facil' then 60
      when 'media' then 100
      else 170
    end;
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
  end if;

  update public.trastienda_acertijos
  set estado = case when v_ganado then 'ganado' else 'perdido' end, resuelto_at = now()
  where id = p_acertijo_id;

  -- Racha previa: victorias consecutivas hasta la última derrota (mismo
  -- criterio que iniciar_acertijos para asignar dificultad).
  v_racha := 0;
  for v_ultimo in
    select (m.salida > 0)
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'acertijos'
      and m.id <> v_fila.minijuego_id
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;
  if v_ganado then v_racha := v_racha + 1; else v_racha := 0; end if;

  update public.trastienda_minijuegos
  set salida = v_payout,
      racha_actual = v_racha,
      mejor_racha = greatest(mejor_racha, v_racha),
      resultado = jsonb_build_object('ganaste', v_ganado, 'dificultad', v_fila.dificultad, 'secuencia', p_secuencia)
  where id = v_fila.minijuego_id;

  return query select v_ganado, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.responder_acertijos(uuid, integer[]) to authenticated;

-- ---------- 5) RPC El Reloj ----------
create or replace function public.iniciar_el_reloj()
returns table (
  reloj_id uuid,
  problemas jsonb,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_i integer;
  v_a integer;
  v_b integer;
  v_op text;
  v_resp integer;
  v_problemas jsonb := '[]'::jsonb;
  v_minijuego_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select pr.puntos_total into v_saldo from public.profiles pr where pr.id = v_user;
  if v_saldo < 60 then
    raise exception 'te faltan Chispas para el reloj';
  end if;

  for v_i in 1..15 loop
    v_a := 10 + floor(random() * 90)::int;
    v_b := 10 + floor(random() * 90)::int;
    v_op := (array['suma', 'resta'])[1 + floor(random() * 2)::int];
    if v_op = 'resta' and v_a < v_b then
      v_a := v_a + v_b;
      v_b := v_a - v_b;
      v_a := v_a - v_b;
    end if;
    v_resp := case when v_op = 'suma' then v_a + v_b else v_a - v_b end;
    v_problemas := v_problemas || jsonb_build_object(
      'idx', v_i,
      'a', v_a,
      'b', v_b,
      'op', v_op,
      'resp', v_resp
    );
  end loop;

  update public.profiles set puntos_total = puntos_total - 60 where id = v_user;

  insert into public.trastienda_minijuegos (user_id, juego, entrada)
  values (v_user, 'el_reloj', 60)
  returning id into v_minijuego_id;

  insert into public.trastienda_reloj (user_id, minijuego_id, problemas)
  values (v_user, v_minijuego_id, v_problemas);

  -- El cliente ve los problemas SIN la respuesta.
  return query select
    r.id,
    (select jsonb_agg(jsonb_build_object('idx', (p->>'idx')::int, 'a', (p->>'a')::int, 'b', (p->>'b')::int, 'op', p->>'op'))
     from jsonb_array_elements(v_problemas) p),
    (select pr.puntos_total from public.profiles pr where pr.id = v_user)
  from public.trastienda_reloj r
  where r.user_id = v_user and r.minijuego_id = v_minijuego_id;
end;
$$;

grant execute on function public.iniciar_el_reloj() to authenticated;

create or replace function public.finalizar_el_reloj(p_reloj_id uuid, p_respuestas integer[])
returns table (
  correctas integer,
  chispas_ganadas integer,
  puntos_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_fila public.trastienda_reloj%rowtype;
  v_correctas integer := 0;
  v_payout integer := 0;
  v_esperada integer;
  v_i integer := 0;
  v_racha integer := 0;
  v_ultimo boolean;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_fila
  from public.trastienda_reloj
  where id = p_reloj_id and user_id = v_user;

  if not found or v_fila.estado <> 'jugando' then
    raise exception 'esa sesión ya terminó';
  end if;

  -- Reloj total de 85s (spec: 75s de juego + margen).
  if now() - v_fila.creado_at > interval '85 seconds' then
    update public.trastienda_reloj set estado = 'terminado', resuelto_at = now() where id = p_reloj_id;
    update public.trastienda_minijuegos
    set salida = 0, resultado = jsonb_build_object('correctas', 0, 'tiempo_agotado', true)
    where id = v_fila.minijuego_id;
    return query select 0, 0, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
    return;
  end if;

  for v_esperada in
    select ((p.value->>'resp')::int)
    from jsonb_array_elements(v_fila.problemas) p
    order by (p.value->>'idx')::int
  loop
    v_i := v_i + 1;
    if v_i <= cardinality(p_respuestas) and p_respuestas[v_i] = v_esperada then
      v_correctas := v_correctas + 1;
    end if;
  end loop;

  if v_correctas >= 15 then v_payout := 160;
  elsif v_correctas >= 12 then v_payout := 95;
  elsif v_correctas >= 9 then v_payout := 55;
  else v_payout := 0;
  end if;

  if v_payout > 0 then
    update public.profiles set puntos_total = puntos_total + v_payout where id = v_user;
  end if;

  update public.trastienda_reloj set estado = 'terminado', resuelto_at = now() where id = p_reloj_id;

  -- Racha de relojes completos (15/15) consecutivos.
  for v_ultimo in
    select (m.salida > 0)
    from public.trastienda_minijuegos m
    where m.user_id = v_user and m.juego = 'el_reloj'
      and m.id <> v_fila.minijuego_id
    order by m.creado_at desc
    limit 20
  loop
    if v_ultimo then
      v_racha := v_racha + 1;
    else
      exit;
    end if;
  end loop;
  if v_correctas >= 15 then v_racha := v_racha + 1; else v_racha := 0; end if;

  update public.trastienda_minijuegos
  set salida = v_payout,
      racha_actual = v_racha,
      mejor_racha = greatest(mejor_racha, v_racha),
      resultado = jsonb_build_object('correctas', v_correctas, 'total', 15)
  where id = v_fila.minijuego_id;

  return query select v_correctas, v_payout, (select pr.puntos_total from public.profiles pr where pr.id = v_user);
end;
$$;

grant execute on function public.finalizar_el_reloj(uuid, integer[]) to authenticated;

-- ---------- 6) Historial: los 3 juegos entran solos vía trastienda_minijuegos ----------
-- (el union 'm' de fetch_trastienda_historial ya listaba todas las filas de
-- trastienda_minijuegos con su juego y salida; no hace falta tocarlo).

-- ---------- 7) Sin grants en las tablas de sesión ----------
-- trastienda_calcu / trastienda_acertijos / trastienda_reloj: sin RLS y sin
-- grants — el cliente solo las ve por RPC. (Si se habilitara RLS + policy de
-- select propio, el secreto de estas filas quedaría expuesto; por eso NO.)