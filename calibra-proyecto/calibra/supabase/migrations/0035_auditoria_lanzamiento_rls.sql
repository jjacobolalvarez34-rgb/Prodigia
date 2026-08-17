-- ============================================================
-- Prodigia — cierre de hallazgos de la auditoría pre-lanzamiento
-- Correr después de 0034_nivel_mundo_anterior.sql
--
-- Hallazgo alto #1: la policy de UPDATE de "profiles" no tiene
-- with check, así que en Postgres reutiliza el using — que solo exige
-- ser dueño de la fila, sin restringir NINGUNA columna. Cualquier
-- usuario autenticado podía, con supabase-js directo desde la consola
-- del navegador (sin pasar por ninguna función de negocio), escribirse
-- a sí mismo puntos_total, elo_rating, plan, escudos_extra_pendientes,
-- congelamientos_disponibles, boost_multiplicador_pendiente,
-- color_dial/marco_perfil (sin comprarlos) o apuesta_monto/umbral a
-- cualquier valor. El fix: en vez de reescribir la policy (rompería
-- "auth.uid() = id" que sí está bien), se restringe por GRANT de
-- columna — Postgres exige que la columna esté en el GRANT ademas de
-- pasar la policy, y esto no se puede saltear ni siquiera con la
-- policy más laxa. Las columnas "peligrosas" ya no son escribibles
-- directo — o tienen una función security definer propia (el patrón
-- ya usado en todo el resto del proyecto) o ya la tenían y solo le
-- faltaba el security definer.
-- ============================================================

revoke update on public.profiles from authenticated;
grant update (
  display_name,
  meta_xp_diaria,
  es_profesor,
  onboarding_completado,
  onboarding_enigmia_completado,
  interes_inicial
) on public.profiles to authenticated;

-- elegir_color_dial / elegir_marco_perfil ya validaban que el ítem
-- esté desbloqueado, pero al no ser security definer, ese chequeo era
-- decorativo: un usuario podía saltear la función entera y escribir
-- color_dial/marco_perfil directo (ahora tampoco puede, por el GRANT
-- de arriba, pero además se corrige acá para que la función en sí sea
-- la vía correcta, igual que el resto de las funciones del proyecto).
drop function if exists public.elegir_color_dial(text);

create function public.elegir_color_dial(p_color text)
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
  if not exists (
    select 1 from public.profiles where id = v_user and p_color = any(colores_dial_desbloqueados)
  ) then
    raise exception 'color no desbloqueado';
  end if;
  update public.profiles set color_dial = p_color where id = v_user;
end;
$$;

grant execute on function public.elegir_color_dial(text) to authenticated;

drop function if exists public.elegir_marco_perfil(text);

create function public.elegir_marco_perfil(p_marco text)
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
  if not exists (
    select 1 from public.profiles where id = v_user and p_marco = any(marcos_desbloqueados)
  ) then
    raise exception 'marco no desbloqueado';
  end if;
  update public.profiles set marco_perfil = p_marco where id = v_user;
end;
$$;

grant execute on function public.elegir_marco_perfil(text) to authenticated;

-- Tres columnas más quedaban sin vía de escritura directa segura:
-- escudos_extra_pendientes, boost_multiplicador_pendiente y
-- congelamientos_disponibles. El cliente solo necesitaba "consumir"
-- estos valores (resetear a 0/1 después de usarlos) — nunca setearlos
-- a un valor arbitrario — así que ahora son funciones chicas en vez de
-- un update de columna abierto.

create function public.consumir_boost_pendiente()
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
  update public.profiles set boost_multiplicador_pendiente = 1 where id = v_user;
end;
$$;

grant execute on function public.consumir_boost_pendiente() to authenticated;

create function public.consumir_escudos_pendientes()
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
  update public.profiles set escudos_extra_pendientes = 0 where id = v_user;
end;
$$;

grant execute on function public.consumir_escudos_pendientes() to authenticated;

-- Reemplaza la lógica que antes vivía en
-- src/lib/practica/congelamientos.ts (leer perfil + decidir + dos
-- updates desde el server, todavía con la sesión del usuario — ahora
-- todo el flujo queda atómico y detrás de security definer).
create function public.aplicar_congelamiento_si_hace_falta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_ayer date := (current_date - interval '1 day')::date;
  v_fila record;
  v_disponibles smallint;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select meta_alcanzada, congelado into v_fila
  from public.daily_progress
  where user_id = v_user and fecha = v_ayer;

  if v_fila.meta_alcanzada or v_fila.congelado then
    return;
  end if;

  select congelamientos_disponibles into v_disponibles
  from public.profiles where id = v_user;

  if v_disponibles is null or v_disponibles <= 0 then
    return;
  end if;

  insert into public.daily_progress (user_id, fecha, congelado)
  values (v_user, v_ayer, true)
  on conflict (user_id, fecha) do update set congelado = true;

  update public.profiles set congelamientos_disponibles = v_disponibles - 1 where id = v_user;
end;
$$;

grant execute on function public.aplicar_congelamiento_si_hace_falta() to authenticated;

-- ============================================================
-- Hallazgo alto #2: "duels" tenía una policy de UPDATE
-- (auth.uid() = retador_id or auth.uid() = retado_id) sin with check
-- — mismo problema que profiles: sin restricción de columna, un
-- participante podía reescribir semilla_problemas, estado o
-- ganador_id directo, saltando registrar_resultado_duelo por
-- completo. El cliente nunca actualiza "duels" directo (todo pasa por
-- funciones security definer: buscar_rival_duelo, registrar_resultado_
-- duelo) así que la policy de UPDATE no le hace falta a nadie — se
-- elimina en vez de intentar acotarla.
-- ============================================================

drop policy if exists "participantes actualizan el estado del duelo" on public.duels;

-- ============================================================
-- Hallazgo medio #1: "duel_results" permitía insertar un resultado
-- para cualquier duel_id ajeno (el with check solo miraba
-- user_id = auth.uid(), nunca si ese usuario participa del duelo).
-- ============================================================

drop policy if exists "usuarios insertan su propio resultado de duelo" on public.duel_results;

create policy "usuarios insertan su propio resultado de duelo"
  on public.duel_results for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.duels d
      where d.id = duel_results.duel_id
        and (d.retador_id = auth.uid() or d.retado_id = auth.uid())
    )
  );

-- ============================================================
-- Hallazgo medio #2: "friendships" UPDATE sin with check permitía,
-- en teoría, reescribir user_id/friend_id de la fila (mientras uno de
-- los dos siguiera siendo auth.uid()). En la práctica solo el
-- receptor de una solicitud pendiente la acepta — se acota el
-- with check a eso exactamente.
-- ============================================================

drop policy if exists "usuarios actualizan amistades donde participan" on public.friendships;

create policy "el receptor acepta una solicitud de amistad"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id)
  with check (auth.uid() = friend_id);
