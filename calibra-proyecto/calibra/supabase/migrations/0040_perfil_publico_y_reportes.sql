-- ============================================================
-- Prodigia — ver perfil de otros usuarios + reportar (Fase Q3)
-- Correr después de 0039_avatares.sql
-- ============================================================

create table public.reportes_usuario (
  id uuid primary key default gen_random_uuid(),
  reportante_id uuid not null references public.profiles(id) on delete cascade,
  reportado_id uuid not null references public.profiles(id) on delete cascade,
  motivo text not null check (motivo in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro')),
  detalle text,
  created_at timestamptz not null default now()
);

alter table public.reportes_usuario enable row level security;

-- A propósito sin ninguna policy de SELECT: ni siquiera el propio
-- reportante puede releer sus reportes desde el cliente. Son para
-- revisión manual tuya, directo desde el Table Editor de Supabase —
-- "no hace falta un sistema de moderación automática todavía", como
-- pedía la fase. INSERT tampoco tiene policy propia: pasa únicamente
-- por la función de abajo (security definer).

create function public.reportar_usuario(p_reportado_id uuid, p_motivo text, p_detalle text default null)
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
  if p_reportado_id = v_user then
    raise exception 'no podes reportarte a vos mismo';
  end if;
  if p_motivo not in ('trampa', 'imagen_inapropiada', 'nombre_inapropiado', 'otro') then
    raise exception 'motivo invalido';
  end if;

  insert into public.reportes_usuario (reportante_id, reportado_id, motivo, detalle)
  values (v_user, p_reportado_id, p_motivo, p_detalle);
end;
$$;

grant execute on function public.reportar_usuario(uuid, text, text) to authenticated;

-- Perfil público de OTRO usuario: profiles solo deja leer la fila
-- propia por RLS (0001_init.sql) — mismo problema ya encontrado y
-- resuelto igual en 0038 para mis_duelos_pendientes. Devuelve
-- únicamente columnas seguras de mostrar (nunca email, plan, saldo de
-- tienda, apuesta activa, etc.).
create function public.obtener_perfil_publico(p_user_id uuid)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  marco_perfil text,
  color_dial text,
  elo_rating integer,
  puntos_total integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  return query
    select p.id, p.display_name, p.avatar_url, p.marco_perfil, p.color_dial,
      p.elo_rating, p.puntos_total, p.created_at
    from public.profiles p
    where p.id = p_user_id;
end;
$$;

grant execute on function public.obtener_perfil_publico(uuid) to authenticated;

-- ------------------------------------------------------------
-- Q3 también pide poder ver el perfil desde "el resultado de un
-- duelo" — registrar_resultado_duelo (última definición: 0028) ya
-- devuelve oponente_nombre pero nunca su id, así que no había forma de
-- armar el link /perfil/<id> desde esa pantalla. Se agrega oponente_id
-- al resultado, mismo cuerpo que ya tenía.
-- ------------------------------------------------------------

drop function if exists public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb);

create function public.registrar_resultado_duelo(
  p_duel_id uuid,
  p_precision numeric,
  p_tiempo_promedio numeric,
  p_puntaje integer,
  p_respuestas jsonb default null
)
returns table (resuelto boolean, elo_nuevo integer, elo_anterior integer, gane boolean, empate boolean, oponente_nombre text, oponente_id uuid)
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

  insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
  values (p_duel_id, v_user, p_precision, p_tiempo_promedio, p_puntaje, p_respuestas)
  on conflict (duel_id, user_id) do update
    set precision = excluded.precision,
        tiempo_promedio = excluded.tiempo_promedio,
        puntaje_final = excluded.puntaje_final,
        respuestas = excluded.respuestas;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  select * into v_otro from public.duel_results where duel_id = p_duel_id and user_id = v_otro_id;

  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  if v_otro.user_id is null then
    -- todavía falta que el rival juegue su parte del duelo
    return query select false, v_mi_elo, v_mi_elo, false, false, null::text, v_otro_id;
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
      (select display_name from public.profiles where id = v_otro_id), v_otro_id;
end;
$$;

grant execute on function public.registrar_resultado_duelo(uuid, numeric, numeric, integer, jsonb) to authenticated;
