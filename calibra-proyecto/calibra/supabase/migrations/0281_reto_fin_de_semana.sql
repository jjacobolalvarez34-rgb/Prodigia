-- ============================================================
-- Prodigia — Reto de fin de semana (0281).
--
-- Pedido del 2026-10-13: «3 ciudades al azar, la misma dificultad para todos,
-- 5 a 10 preguntas, dos intentos; gana el mejor puntaje y, si empatan, el más
-- rápido; que el premio haga que valga la pena».
--   - Sábado y domingo (UTC, current_date). 10 preguntas iguales para todos,
--     de 3 ciudades sorteadas entre las 15 (src/lib/retoDiario.ts,
--     generarRetoFinde).
--   - Dos intentos. El tiempo lo mide la base (iniciar → terminar), no el
--     teléfono. Cuenta el mejor intento: más aciertos y, si empatan, menos tiempo.
--   - Terminar el primer intento: 30 Chispas + 3 por acierto (hasta 60).
--   - Puesto final (se cobra desde el lunes, premio_reto_finde): 1.º 50 Cometas,
--     2.º y 3.º 30, 4.º a 10.º 15, 11.º a 50.º 5. Hace falta acertar 5 o más.
--   - Los aciertos NO los manda el cliente (revisión 2026-10-14): la web corrige las
--     respuestas con la misma semilla (/api/reto-finde/terminar) y registra el
--     resultado con la clave de servicio (registrar_reto_finde). Los invitados no
--     pueden jugarlo.
-- Requiere 0279 (Cometas). Mismos números en src/lib/retoFinde.ts. Idempotente.
-- ============================================================

create table if not exists public.retos_finde_intentos (
  user_id uuid not null references public.profiles(id) on delete cascade,
  sabado date not null,
  intento smallint not null check (intento between 1 and 2),
  iniciado_at timestamptz not null default now(),
  terminado_at timestamptz,
  correctos smallint check (correctos between 0 and 10),
  tiempo_ms integer,
  primary key (user_id, sabado, intento)
);

alter table public.retos_finde_intentos enable row level security;
drop policy if exists "cada uno ve sus intentos del finde" on public.retos_finde_intentos;
create policy "cada uno ve sus intentos del finde" on public.retos_finde_intentos for select using (auth.uid() = user_id);
grant select on public.retos_finde_intentos to authenticated;

-- El sábado del fin de semana en curso, o null de lunes a viernes.
create or replace function public.sabado_finde_actual()
returns date
language sql
stable
as $$
  select case extract(isodow from current_date)::integer
    when 6 then current_date
    when 7 then current_date - 1
    else null
  end;
$$;
grant execute on function public.sabado_finde_actual() to anon, authenticated;

-- El último fin de semana que ya terminó.
create or replace function public.sabado_finde_anterior()
returns date
language sql
stable
as $$
  select date_trunc('week', current_date)::date - 2;
$$;
grant execute on function public.sabado_finde_anterior() to anon, authenticated;

-- Mejor intento de cada uno en un fin de semana, con su puesto.
create or replace function public._ranking_finde(p_sabado date)
returns table (user_id uuid, correctos smallint, tiempo_ms integer, puesto integer)
language sql
stable
security definer
set search_path = public
as $$
  with mejores as (
    select distinct on (i.user_id) i.user_id, i.correctos, i.tiempo_ms
    from public.retos_finde_intentos i
    where i.sabado = p_sabado and i.terminado_at is not null
    order by i.user_id, i.correctos desc, i.tiempo_ms asc
  )
  select m.user_id, m.correctos, m.tiempo_ms, (row_number() over (order by m.correctos desc, m.tiempo_ms asc))::integer
  from mejores m;
$$;
revoke execute on function public._ranking_finde(date) from public, anon, authenticated;

create or replace function public.ranking_reto_finde(p_sabado date)
returns table (user_id uuid, display_name text, avatar_url text, correctos smallint, tiempo_ms integer, puesto integer)
language sql
stable
security definer
set search_path = public
as $$
  select r.user_id, p.display_name, p.avatar_url, r.correctos, r.tiempo_ms, r.puesto
  from public._ranking_finde(p_sabado) r
  join public.profiles p on p.id = r.user_id
  order by r.puesto
  limit 100;
$$;
grant execute on function public.ranking_reto_finde(date) to authenticated;

-- Empieza un intento (o devuelve el que quedó abierto: el reloj no se reinicia).
create or replace function public.iniciar_reto_finde()
returns table (sabado date, intento smallint, iniciado_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_sab date := public.sabado_finde_actual();
  v_n integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'crea tu cuenta para jugar el reto del finde';
  end if;
  if v_sab is null then
    raise exception 'el reto del finde se juega sabado y domingo';
  end if;
  return query
    select i.sabado, i.intento, i.iniciado_at from public.retos_finde_intentos i
    where i.user_id = v_user and i.sabado = v_sab and i.terminado_at is null;
  if found then
    return;
  end if;
  select count(*) into v_n from public.retos_finde_intentos i where i.user_id = v_user and i.sabado = v_sab;
  if v_n >= 2 then
    raise exception 'ya usaste tus dos intentos de este finde';
  end if;
  return query
    insert into public.retos_finde_intentos as i (user_id, sabado, intento)
    values (v_user, v_sab, (v_n + 1)::smallint)
    returning i.sabado, i.intento, i.iniciado_at;
end;
$$;
revoke execute on function public.iniciar_reto_finde() from public, anon;
grant execute on function public.iniciar_reto_finde() to authenticated;

-- Termina el intento abierto de p_user con los aciertos que contó el servidor de la
-- web (nunca el cliente). El tiempo es el de la base; menos de 8 s para 10 preguntas
-- no es posible jugando, así que cuenta como 0 aciertos. Solo clave de servicio.
drop function if exists public.terminar_reto_finde(smallint);
create or replace function public.registrar_reto_finde(p_user uuid, p_correctos smallint)
returns table (intento smallint, correctos smallint, tiempo_ms integer, chispas integer, mejor_correctos smallint, mejor_tiempo_ms integer, puesto integer, puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := p_user;
  v_sab date := public.sabado_finde_actual();
  v_fila public.retos_finde_intentos%rowtype;
  v_tiempo integer;
  v_correctos smallint;
  v_chispas integer := 0;
  v_rank record;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if v_sab is null then
    raise exception 'el reto del finde ya termino';
  end if;
  select * into v_fila from public.retos_finde_intentos i
  where i.user_id = v_user and i.sabado = v_sab and i.terminado_at is null
  for update;
  if not found then
    raise exception 'no hay un intento en curso';
  end if;

  v_tiempo := (extract(epoch from (now() - v_fila.iniciado_at)) * 1000)::integer;
  v_correctos := greatest(0, least(10, coalesce(p_correctos, 0)))::smallint;
  if v_tiempo < 8000 then
    v_correctos := 0;
  end if;

  update public.retos_finde_intentos as i
  set terminado_at = now(), correctos = v_correctos, tiempo_ms = v_tiempo
  where i.user_id = v_user and i.sabado = v_sab and i.intento = v_fila.intento;

  -- Chispas solo por el primer intento terminado.
  if v_fila.intento = 1 then
    v_chispas := 30 + 3 * v_correctos;
    update public.profiles as pr set puntos_total = pr.puntos_total + v_chispas where pr.id = v_user;
  end if;

  select * into v_rank from public._ranking_finde(v_sab) r where r.user_id = v_user;

  return query
    select v_fila.intento, v_correctos, v_tiempo, v_chispas, v_rank.correctos, v_rank.tiempo_ms, v_rank.puesto, pr.puntos_total
    from public.profiles pr where pr.id = v_user;
end;
$$;
revoke execute on function public.registrar_reto_finde(uuid, smallint) from public, anon, authenticated;
grant execute on function public.registrar_reto_finde(uuid, smallint) to service_role;

-- Premio del último fin de semana en Cometas. Se puede llamar cuantas veces
-- se quiera: paga una sola vez (referencia 'finde:<sábado>'). Devuelve una
-- fila solo cuando acaba de pagar.
create or replace function public.premio_reto_finde()
returns table (sabado date, puesto integer, cometas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_sab date := public.sabado_finde_anterior();
  v_rank record;
  v_cometas integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if exists (select 1 from public.cometas_movimientos cm where cm.user_id = v_user and cm.referencia = 'finde:' || v_sab) then
    return;
  end if;
  if not exists (select 1 from public.retos_finde_intentos i where i.user_id = v_user and i.sabado = v_sab and i.terminado_at is not null) then
    return;
  end if;
  select * into v_rank from public._ranking_finde(v_sab) r where r.user_id = v_user;
  if v_rank.correctos < 5 then
    return;
  end if;
  v_cometas := case when v_rank.puesto <= 1 then 50 when v_rank.puesto <= 3 then 30 when v_rank.puesto <= 10 then 15 when v_rank.puesto <= 50 then 5 else 0 end;
  if v_cometas > 0 and public._dar_cometas(v_user, v_cometas, 'reto_finde', 'finde:' || v_sab) then
    return query select v_sab, v_rank.puesto, v_cometas;
  end if;
end;
$$;
revoke execute on function public.premio_reto_finde() from public, anon;
grant execute on function public.premio_reto_finde() to authenticated;

notify pgrst, 'reload schema';
