-- ============================================================
-- Prodigia — Fase 3 ("Rankeds: reemplazar 'cancelar por click afuera'
-- con Rendirse"). Hoy no existe ningún camino para abandonar un duelo
-- con consecuencia real: navegar afuera (el Header, cerrar la pestaña)
-- deja el duelo huérfano en 'pendiente'/'en_curso' para siempre, sin
-- ELO aplicado a nadie — ni siquiera al rival que sí jugó. Tampoco hay
-- policy de UPDATE directa sobre "duels" (se sacó a propósito en
-- 0035_auditoria_lanzamiento_rls.sql), así que esto tiene que pasar
-- por una función security definer nueva, igual que
-- registrar_resultado_duelo.
--
-- Dos funciones, no una: quién se rinde y quién gana no siempre son la
-- misma persona que llama.
--   - rendirse_duelo: el que llama SE rinde (botón "Rendirse" + confirmación).
--   - reclamar_victoria_por_abandono: el que llama gana porque el rival
--     dejó de responder al Presence de Realtime por más de 1 minuto — lo
--     dispara el cliente, no hay forma de verificar la desconexión desde
--     SQL (Realtime Presence vive fuera de Postgres); mismo nivel de
--     confianza que ya existe hoy en el resto del sistema de duelos
--     (el cliente ya reporta precisión/puntaje sin verificación server-
--     side más allá de "sos vos el que llama y sos parte de este duelo").
-- ============================================================

alter table public.duels drop constraint duels_estado_check;
alter table public.duels add constraint duels_estado_check
  check (estado in ('pendiente', 'en_curso', 'completado', 'abandonado'));

alter table public.duels add column if not exists abandonado_por uuid references public.profiles(id);

-- ---------- rendirse_duelo: el que llama se rinde ----------
create or replace function public.rendirse_duelo(p_duel_id uuid)
returns table (
  elo_nuevo integer, elo_anterior integer,
  oponente_nombre text, oponente_id uuid, mundo text, modo text, clasificatorio boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_otro_id uuid;
  v_mi_elo integer;
  v_otro_elo integer;
  v_esperado numeric;
  v_nuevo_mi_elo integer;
  v_nuevo_otro_elo integer;
  v_k_mi numeric;
  v_k_otro numeric;
  v_rango_anterior text;
  v_rango_nuevo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  if v_duel.estado in ('completado', 'abandonado') then
    raise exception 'este duelo ya terminó';
  end if;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;
  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  -- Una ronda de "todas las ciudades" (mejor_de_3) se marca 'completado'
  -- con ganador_id del rival — igual que hace registrar_resultado_duelo
  -- con una ronda jugada — para que finalizar_serie_si_corresponde siga
  -- contando victorias por ronda sin cambios. Un duelo simple queda en
  -- el estado nuevo 'abandonado', distinto de 'completado' a propósito
  -- (para poder distinguir "lo jugó y perdió" de "se rindió" en el
  -- historial más adelante).
  update public.duels
    set estado = case when v_duel.modo = 'mejor_de_3' then 'completado' else 'abandonado' end,
        ganador_id = v_otro_id,
        abandonado_por = v_user
    where id = p_duel_id;

  -- El ELO de una serie lo aplica finalizar_serie_si_corresponde recién
  -- cuando la serie se cierra (2 de 3) — acá solo se marca la ronda
  -- como perdida. Casual: nunca toca ELO, tampoco en un abandono.
  if v_duel.modo = 'mejor_de_3' or not v_duel.clasificatorio then
    return query select v_mi_elo, v_mi_elo,
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.clasificatorio;
    return;
  end if;

  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;
  v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));
  v_k_mi := public.k_factor_de_elo(v_mi_elo);
  v_k_otro := public.k_factor_de_elo(v_otro_elo);
  -- Derrota real: v_actual = 0 para el que se rinde, 1 para el rival —
  -- misma fórmula que registrar_resultado_duelo, sin el paso de
  -- comparar puntaje_final (acá el resultado ya está decidido).
  v_nuevo_mi_elo := round(v_mi_elo + v_k_mi * (0 - v_esperado));
  v_nuevo_otro_elo := round(v_otro_elo + v_k_otro * (1 - (1 - v_esperado)));
  v_rango_anterior := public.rango_de_elo(v_otro_elo);
  v_rango_nuevo := public.rango_de_elo(v_nuevo_otro_elo);

  update public.profiles set elo_rating = v_nuevo_mi_elo where id = v_user;
  update public.profiles set elo_rating = v_nuevo_otro_elo where id = v_otro_id;

  if not (select es_bot from public.profiles where id = v_otro_id) then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_otro_id, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_user), p_duel_id);
  end if;

  -- El que se rinde nunca sube de rango (v_actual=0 siempre es peor o
  -- igual a lo esperado) — solo hace falta chequear al rival, que sí
  -- puede subir con esta victoria.
  if v_rango_nuevo <> v_rango_anterior then
    perform public.desbloquear_titulo(v_otro_id, 'rango_' || v_rango_nuevo, initcap(v_rango_nuevo), 'rango');
    insert into public.feed_posts (user_id, tipo, rango_nuevo) values (v_otro_id, 'subida_rango', v_rango_nuevo);
  end if;

  return query select v_nuevo_mi_elo, v_mi_elo,
    (select display_name from public.profiles where id = v_otro_id), v_otro_id,
    v_duel.mundo, v_duel.modo, v_duel.clasificatorio;
end;
$$;

grant execute on function public.rendirse_duelo(uuid) to authenticated;

-- ---------- reclamar_victoria_por_abandono: el rival se desconectó ----------
create or replace function public.reclamar_victoria_por_abandono(p_duel_id uuid)
returns table (
  elo_nuevo integer, elo_anterior integer,
  oponente_nombre text, oponente_id uuid, mundo text, modo text, clasificatorio boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_otro_id uuid;
  v_mi_elo integer;
  v_otro_elo integer;
  v_esperado numeric;
  v_nuevo_mi_elo integer;
  v_nuevo_otro_elo integer;
  v_k_mi numeric;
  v_k_otro numeric;
  v_rango_anterior text;
  v_rango_nuevo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  if v_duel.estado in ('completado', 'abandonado') then
    raise exception 'este duelo ya terminó';
  end if;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;
  select elo_rating into v_mi_elo from public.profiles where id = v_user;

  update public.duels
    set estado = case when v_duel.modo = 'mejor_de_3' then 'completado' else 'abandonado' end,
        ganador_id = v_user,
        abandonado_por = v_otro_id
    where id = p_duel_id;

  if v_duel.modo = 'mejor_de_3' or not v_duel.clasificatorio then
    return query select v_mi_elo, v_mi_elo,
      (select display_name from public.profiles where id = v_otro_id), v_otro_id,
      v_duel.mundo, v_duel.modo, v_duel.clasificatorio;
    return;
  end if;

  select elo_rating into v_otro_elo from public.profiles where id = v_otro_id;
  v_esperado := 1.0 / (1.0 + power(10, (v_otro_elo - v_mi_elo) / 400.0));
  v_k_mi := public.k_factor_de_elo(v_mi_elo);
  v_k_otro := public.k_factor_de_elo(v_otro_elo);
  v_nuevo_mi_elo := round(v_mi_elo + v_k_mi * (1 - v_esperado));
  v_nuevo_otro_elo := round(v_otro_elo + v_k_otro * (0 - (1 - v_esperado)));
  v_rango_anterior := public.rango_de_elo(v_mi_elo);
  v_rango_nuevo := public.rango_de_elo(v_nuevo_mi_elo);

  update public.profiles set elo_rating = v_nuevo_mi_elo where id = v_user;
  update public.profiles set elo_rating = v_nuevo_otro_elo where id = v_otro_id;

  if not (select es_bot from public.profiles where id = v_otro_id) then
    insert into public.feed_posts (user_id, tipo, mundo, rival_nombre, duel_id)
    values (v_user, 'resultado_duelo', v_duel.mundo, (select display_name from public.profiles where id = v_otro_id), p_duel_id);
  end if;

  if v_rango_nuevo <> v_rango_anterior then
    perform public.desbloquear_titulo(v_user, 'rango_' || v_rango_nuevo, initcap(v_rango_nuevo), 'rango');
    insert into public.feed_posts (user_id, tipo, rango_nuevo) values (v_user, 'subida_rango', v_rango_nuevo);
  end if;

  return query select v_nuevo_mi_elo, v_mi_elo,
    (select display_name from public.profiles where id = v_otro_id), v_otro_id,
    v_duel.mundo, v_duel.modo, v_duel.clasificatorio;
end;
$$;

grant execute on function public.reclamar_victoria_por_abandono(uuid) to authenticated;
