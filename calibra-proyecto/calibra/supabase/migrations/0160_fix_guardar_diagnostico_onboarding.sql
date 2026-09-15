-- Bug real (2026-09-15): "en Numeria, 'calculemos tu nivel antes de
-- empezar' tira un error" — DiagnosticoClient.tsx (el diagnóstico
-- COMPARTIDO que usa Numeria vía requireMundoNumeria, ver
-- src/lib/auth/guard.ts) escribe en skill_levels con un
-- supabase.from("skill_levels").upsert(...) DIRECTO desde el cliente.
--
-- Eso dependía de la policy "usuarios actualizan su propio nivel por
-- operacion" (FOR ALL, 0002_mecanica_v1.sql) — que 0120_cerrar_s0_s1.sql
-- DROPEÓ como parte del cierre de hallazgos S2 (ALTO: policies "for
-- all") y NUNCA reemplazó por nada. Desde 0120, todo lo demás que
-- escribe en skill_levels lo hace a través de insertar_intento()
-- (security definer, bypassea RLS) — este único camino directo del
-- diagnóstico de onboarding quedó huérfano: RLS habilitado + cero
-- policies de escritura = cualquier upsert directo falla siempre.
-- (La policy de SELECT, "usuarios ven su propio nivel por operacion",
-- nunca se tocó — por eso leer nivel_actual en otros lados seguía
-- andando, solo esto se rompió.)
--
-- Fix: mismo criterio que insertar_intento — un RPC security definer
-- nuevo en vez de reabrir la policy de escritura directa (que fue lo
-- que 0120 cerró a propósito). DiagnosticoClient.tsx pasa a llamar esto
-- en vez de upsert-ear la tabla directo.
create function public.guardar_diagnostico_numeria(
  p_suma smallint,
  p_resta smallint,
  p_multiplicacion smallint,
  p_division smallint
)
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
  if p_suma not between 1 and 10 or p_resta not between 1 and 10
     or p_multiplicacion not between 1 and 10 or p_division not between 1 and 10 then
    raise exception 'nivel invalido';
  end if;

  insert into public.skill_levels (user_id, problem_type, nivel, racha_actual, updated_at)
  values
    (v_user, 'suma', p_suma, 0, now()),
    (v_user, 'resta', p_resta, 0, now()),
    (v_user, 'multiplicacion', p_multiplicacion, 0, now()),
    (v_user, 'division', p_division, 0, now())
  on conflict (user_id, problem_type)
  do update set nivel = excluded.nivel, racha_actual = 0, updated_at = now();

  update public.profiles set onboarding_completado = true where id = v_user;
end;
$$;

grant execute on function public.guardar_diagnostico_numeria(smallint, smallint, smallint, smallint) to authenticated;
