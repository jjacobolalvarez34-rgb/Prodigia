-- ============================================================
-- Prodigia — Guardar el diagnóstico de todos los mundos (migración 0261).
--
-- Bug reportado el 2026-10-08: al terminar el diagnóstico de varios mundos
-- la app decía «No se pudo guardar: new row violates row-level security
-- policy for table "skill_levels"».
--
-- Causa: 0120 cerró la escritura directa en skill_levels y logic_skill_levels
-- (hallazgo S2: el cliente podía ponerse el nivel que quisiera) y 0160 abrió
-- un camino seguro SOLO para Numeria (guardar_diagnostico_numeria). Los otros
-- diagnósticos seguían haciendo upsert directo: en la app fallaba con el
-- error de arriba y en la web el error se ignoraba (el diagnóstico quedaba
-- "hecho" pero el nivel se quedaba en 1).
--
-- Fix: dos funciones security definer, con el mismo criterio que 0160:
--  - guardar_diagnostico_mundo: solo los temas que diagnostica cada mundo
--    (lista cerrada), nivel 1 a 10.
--  - guardar_diagnostico_enigmia: las 4 categorías, la diagnosticada con su
--    nivel y el resto en 1 (lo mismo que hacía filasDiagnostico).
-- Si el tema ya tiene nivel (porque ya se jugó), no se toca: el diagnóstico
-- solo pone el punto de partida y no sirve para subirse el nivel a mano.
-- Idempotente.
-- ============================================================

create or replace function public.guardar_diagnostico_mundo(p_problem_type text, p_nivel smallint)
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
  if p_nivel is null or p_nivel not between 1 and 10 then
    raise exception 'nivel invalido';
  end if;
  if p_problem_type not in (
    'quimia_simbolos', 'anatomia_oseo', 'melodia_fundamentos', 'trigonometria_razones',
    'historia_cronologia', 'calculia_derivadas', 'circuitia_serie', 'estadistica_central',
    'naipia_hilo', 'codia_salida'
  ) then
    raise exception 'tema sin diagnostico';
  end if;

  insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
  values (v_user, p_problem_type, p_nivel, 0, now())
  on conflict (user_id, problem_type) do nothing;
end;
$$;

revoke all on function public.guardar_diagnostico_mundo(text, smallint) from public;
grant execute on function public.guardar_diagnostico_mundo(text, smallint) to authenticated;

create or replace function public.guardar_diagnostico_enigmia(p_categoria text, p_nivel smallint)
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
  if p_nivel is null or p_nivel not between 1 and 10 then
    raise exception 'nivel invalido';
  end if;
  if p_categoria not in ('memoria', 'patrones', 'deduccion', 'computacional') then
    raise exception 'categoria invalida';
  end if;

  insert into public.logic_skill_levels (user_id, categoria, nivel, racha_actual, updated_at)
  select v_user, c, case when c = p_categoria then p_nivel else 1 end, 0, now()
  from unnest(array['memoria', 'patrones', 'deduccion', 'computacional']) as c
  on conflict (user_id, categoria) do nothing;
end;
$$;

revoke all on function public.guardar_diagnostico_enigmia(text, smallint) from public;
grant execute on function public.guardar_diagnostico_enigmia(text, smallint) to authenticated;
