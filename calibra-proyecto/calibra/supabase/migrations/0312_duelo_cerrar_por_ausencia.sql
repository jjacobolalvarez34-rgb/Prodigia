-- 0312: reconexión en los duelos, como chess.com (pedido 2026-11-02).
--
-- La app ya guarda la ronda a medias en el teléfono: si se cae la conexión, al volver
-- sigues donde ibas y el reloj siguió corriendo. Lo que faltaba es el otro lado: si el
-- rival NO vuelve, el que sí terminó se quedaba esperando para siempre y el duelo
-- seguía «en curso». Ahora, pasado un tiempo de gracia desde que mandaste tu
-- resultado, puedes cerrar el duelo: al ausente le queda la ronda en 0 y se resuelve
-- igual que siempre (registrar_resultado_duelo de 0072: ELO, serie, feed), así que
-- gana quien jugó.
--
-- Gracia: 3 minutos desde tu resultado. La ronda dura a lo sumo ~90 s y los dos
-- empiezan juntos, así que a esa altura el otro ya tuvo su tiempo completo y margen
-- para reconectarse.

alter table public.duel_results
  add column if not exists registrado_at timestamptz not null default now();

create or replace function public.cerrar_duelo_por_ausencia(p_duel_id uuid)
returns table (
  resuelto boolean, elo_nuevo integer, elo_anterior integer, gane boolean, empate boolean,
  oponente_nombre text, oponente_id uuid, mundo text, modo text, ronda_numero smallint, ronda_total smallint,
  mi_puntaje integer, rival_puntaje integer, clasificatorio boolean, oponente_es_bot boolean,
  mi_precision numeric, mi_tiempo_promedio numeric, rival_precision numeric, rival_tiempo_promedio numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_duel record;
  v_mi record;
  v_otro_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select * into v_duel from public.duels where id = p_duel_id for update;
  if v_duel.id is null or (v_duel.retador_id <> v_user and v_duel.retado_id <> v_user) then
    raise exception 'no autorizado';
  end if;
  if v_duel.estado <> 'pendiente' then
    raise exception 'este duelo ya terminó';
  end if;

  select * into v_mi from public.duel_results where duel_id = p_duel_id and user_id = v_user;
  if v_mi.user_id is null then
    raise exception 'primero termina tu ronda';
  end if;
  if v_mi.registrado_at > now() - interval '3 minutes' then
    raise exception 'tu rival todavía puede reconectarse';
  end if;

  v_otro_id := case when v_duel.retador_id = v_user then v_duel.retado_id else v_duel.retador_id end;

  -- Si el otro alcanzó a mandar su resultado, no hay ausencia: se resuelve normal.
  insert into public.duel_results (duel_id, user_id, precision, tiempo_promedio, puntaje_final, respuestas)
  values (p_duel_id, v_otro_id, 0, 0, 0, '[]'::jsonb)
  on conflict (duel_id, user_id) do nothing;
  if found then
    update public.duels set abandonado_por = v_otro_id where id = p_duel_id;
  end if;

  -- Se vuelve a registrar el resultado propio (mismos valores): eso resuelve el duelo.
  return query
    select * from public.registrar_resultado_duelo(p_duel_id, v_mi.precision, v_mi.tiempo_promedio, v_mi.puntaje_final, v_mi.respuestas);
end;
$$;

grant execute on function public.cerrar_duelo_por_ausencia(uuid) to authenticated;
