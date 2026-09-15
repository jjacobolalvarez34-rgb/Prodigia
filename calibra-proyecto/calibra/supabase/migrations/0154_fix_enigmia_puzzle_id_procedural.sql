-- ====================================================================
-- Prodigia — LA causa real del conteo roto de Enigmia (reportado en vivo
-- varias veces: "10/10 correctas, apareció 3/10", "se cuenta al revés").
-- No era la carrera del intervalo (fix real, pero secundario) ni el
-- reloj del navegador (fix real, pero secundario) — es esto:
--
-- logic_attempts.puzzle_id es `uuid not null references
-- logic_puzzles(id)` desde el día 1 (0015). Pero desde la Fase A2
-- ("generadores por código para Memoria, Patrones y Pensamiento
-- computacional"), el 75% de los acertijos de una partida (
-- PROBABILIDAD_PROCEDURAL en EnigmiaSprintRunner.tsx) son PROCEDURALES
-- — generados en el cliente, con un id FALSO tipo
-- "memoria-1735689600000-483921" (ver idFalso() en
-- src/lib/enigmia/generadores.ts), que nunca existió en logic_puzzles
-- ni tiene forma de UUID real.
--
-- Cuando el cliente manda ese id a insertar_intento_logica(p_puzzle_id
-- uuid, ...), PostgREST intenta convertirlo a uuid ANTES de ejecutar la
-- función — falla con 22P02 (invalid input syntax for type uuid) — la
-- fila NUNCA se inserta en logic_attempts. El cliente (handleResponder
-- en EnigmiaSprintRunner.tsx) nunca revisaba res.ok, así que la partida
-- seguía como si nada — el conteo local (correctosRef) seguía subiendo
-- normal, pero la base de datos se quedaba con ~25% de los intentos
-- reales (solo los de Deducción, que SÍ vienen del banco con UUID
-- real). Por eso "10/10 correctas" terminaba mostrando "~3/10" al
-- cerrar la partida: 3 es, justamente, ~25% de 10.
--
-- Arreglo: puzzle_id deja de ser un UUID con FK real — pasa a ser TEXT
-- simple, sin relación con logic_puzzles (que de todos modos nunca
-- tuvo filas para el 75% de los acertijos que existen desde Fase A2).
-- Ya no hace falta relajar el NOT NULL: tanto los ids reales (UUID de
-- logic_puzzles, siguen viniendo del cliente) como los falsos entran
-- perfecto en un TEXT.
--
-- Nota arqueológica (por qué esto sigue pasando después de "ya se
-- había arreglado"): 0099_fix_logic_attempts_puzzle_id.sql (2026-08-30)
-- ya había diagnosticado ESTE MISMO bug y cambió la COLUMNA a text —
-- pero nunca tocó la FUNCIÓN, que seguía (y sigue, hasta esta
-- migración) declarando `p_puzzle_id uuid`. PostgREST castea el
-- argumento de la llamada RPC contra el tipo del PARÁMETRO de la
-- función, no contra el tipo real de la columna donde termina
-- guardándose — así que el fix de 0099 nunca alcanzó a la causa real.
-- Peor: 0120/0129/0131 (todas posteriores) volvieron a hacer `create or
-- replace function insertar_intento_logica(p_puzzle_id uuid, ...)` cada
-- vez que tocaban algo no relacionado de esa función (copiando una
-- versión de referencia vieja), reafirmando el tipo roto 3 veces más.
-- Esta migración es la primera que corrige LOS DOS lados a la vez
-- (columna Y parámetro) — la lección para el futuro: cualquier `create
-- or replace function` de acá en más tiene que preservar `text`, nunca
-- volver a `uuid`.
-- ====================================================================

alter table public.logic_attempts drop constraint if exists logic_attempts_puzzle_id_fkey;
alter table public.logic_attempts alter column puzzle_id type text using puzzle_id::text;

drop function if exists public.insertar_intento_logica(uuid, integer, boolean, integer, boolean);

create function public.insertar_intento_logica(
  p_puzzle_id text,
  p_dificultad integer,
  p_correct boolean,
  p_time_ms integer,
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

  insert into public.logic_attempts (user_id, puzzle_id, correct, time_ms, xp)
  values (v_user, p_puzzle_id, p_correct, p_time_ms, v_xp);

  v_nivel := null;
  v_racha := null;
  if not v_sospechoso then
    select sl.nivel, sl.racha_actual into v_actual
    from public.logic_skill_levels sl where sl.user_id = v_user;
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

    insert into public.logic_skill_levels (user_id, nivel, racha_actual, updated_at)
    values (v_user, v_nivel, v_racha, now())
    on conflict (user_id)
    do update set nivel = excluded.nivel, racha_actual = excluded.racha_actual, updated_at = now();
  end if;

  return query select v_xp, v_sospechoso, v_nivel, v_racha;
end;
$$;

grant execute on function public.insertar_intento_logica(text, integer, boolean, integer, boolean) to authenticated;

notify pgrst, 'reload schema';
