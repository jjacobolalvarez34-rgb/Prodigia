-- ============================================================
-- Prodigia — rating ELO para duelos (Fase CC)
-- Correr después de 0015_mundo_enigmia.sql
-- ============================================================

alter table public.profiles add column elo_rating integer not null default 1200;
alter table public.duels add column ganador_id uuid references public.profiles(id);

-- Registra el resultado de UN participante en un duelo. Cuando ya están
-- los resultados de los dos, resuelve el duelo: calcula el ELO nuevo de
-- ambos con la fórmula estándar (K=32) y marca ganador_id (null si
-- empatan en puntaje_final). Se puede llamar de nuevo con el mismo
-- duelo antes de que el rival responda — no pasa nada, solo actualiza
-- tu propia fila hasta que el duelo se resuelva.
create function public.registrar_resultado_duelo(
  p_duel_id uuid,
  p_precision numeric,
  p_tiempo_promedio numeric,
  p_puntaje integer
)
returns table (resuelto boolean, elo_nuevo integer, elo_anterior integer, gane boolean, empate boolean, oponente_nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_otro_id uuid;
  v_mi record;
  v_otro record;
  v_mi_elo integer;
  v_otro_elo integer;
  v_actual numeric;
  v_esperado numeric;
  v_nuevo_elo integer;
  v_k constant integer := 32;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final)
  values (p_duel_id, v_user, p_precision, p_tiempo_promedio, p_puntaje)
  on conflict (duel_id, user_id) do update
    set precision = excluded.precision,
        tiempo_promedio = excluded.tiempo_promedio,
        puntaje_final = excluded.puntaje_final;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select * into v_otro from public.duel_results where duel_id = p_duel_id and user_id = v_otro_id;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if v_otro.user_id is null then
    -- todavía falta que el rival juegue su parte del duelo
    return query select false, v_mi_elo, v_mi_elo, false, false, null::text;
    return;
  end if;

  select * into v_mi from public.duel_results where duel_id = p_duel_id and user_id = v_user;
  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;

  v_actual := case
    when v_mi.puntaje_final > v_otro.puntaje_final then 1
    when v_mi.puntaje_final < v_otro.puntaje_final then 0
    else 0.5
  end;
  v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));
  v_nuevo_elo := round(v_mi_elo + v_k * (v_actual - v_esperado));

  update public.profiles set elo_rating = v_nuevo_elo where id = v_user;
  update public.profiles
    set elo_rating = round(v_otro_elo + v_k * ((1 - v_actual) - (1 - v_esperado)))
    where id = v_otro_id;

  update public.duels
    set estado = 'completado',
        ganador_id = case when v_actual = 0.5 then null
                          when v_actual = 1 then v_user
                          else v_otro_id end
    where id = p_duel_id;

  return query
    select true, v_nuevo_elo, v_mi_elo, (v_actual = 1), (v_actual = 0.5),
      (select display_name from public.profiles where id = v_otro_id);
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer) to authenticated;

insert into public.achievements (slug, nombre, descripcion, categoria, criterio) values
('duelos-5', 'Retador', 'Ganaste 5 duelos.', 'duelos', '{"tipo": "duelos_ganados", "valor": 5}'),
('duelos-20', 'Gladiador', 'Ganaste 20 duelos.', 'duelos', '{"tipo": "duelos_ganados", "valor": 20}');

-- Un participante necesita saber con qué nivel de dificultad jugar su
-- lado del duelo, derivado del ELO promedio de ambos — pero RLS le
-- esconde el perfil (y por lo tanto el elo_rating) del rival. Esta
-- función security definer resuelve justo ese dato sin exponer nada más.
create function public.obtener_duelo(p_duel_id uuid)
returns table (operation_type text, nivel smallint, retador_id uuid, retado_id uuid, estado text, rival_nombre text, mi_elo integer, rival_elo integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_rival_id uuid;
  v_mi_elo integer;
  v_rival_elo integer;
  v_promedio numeric;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;

  v_rival_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;
  select elo_rating into v_rival_elo from public.profiles where id = v_rival_id;
  v_promedio := (v_mi_elo + v_rival_elo) / 2.0;

  return query
    select v_duel.operation_type, greatest(1, least(10, round(3 + (v_promedio - 1200) / 100)))::smallint,
      v_duel.retador_id, v_duel.retado_id, v_duel.estado,
      (select display_name from public.profiles where id = v_rival_id), v_mi_elo, v_rival_elo;
end;
$$;

grant execute on function public.obtener_duelo(uuid) to authenticated;
