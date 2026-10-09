-- ============================================================
-- Prodigia — Modo Zen (docs/PLAN_MODO_SIN_RELOJ.md).
--
-- Zen es práctica sin reloj: 10 preguntas con el tema y la dificultad que
-- elige el jugador. No guarda intentos ni da Chispas, XP o nivel (por eso no
-- pasa por attempts ni por el cierre normal de partida). Lo único que cuenta
-- es la RACHA del día (decisión del usuario, 2026-10-08): al terminar una
-- partida Zen se marca el día como cumplido en daily_progress, igual que la
-- meta diaria. Misiones, constelaciones y cápsulas no avanzan.
--
-- registrar_partida_zen(p_mundo, p_respondidas): exige la partida completa
-- (10 respuestas) y devuelve la racha actual. Idempotente.
-- ============================================================

create or replace function public.registrar_partida_zen(p_mundo text, p_respondidas integer)
returns table (racha integer)
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
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia', 'calculia', 'circuitia', 'estadistica', 'naipia', 'codia', 'dinamia', 'vitalia') then
    raise exception 'mundo invalido';
  end if;
  if coalesce(p_respondidas, 0) < 10 then
    raise exception 'la partida zen no esta completa';
  end if;

  insert into public.daily_progress (user_id, fecha, meta_alcanzada)
  values (v_user, current_date, true)
  on conflict (user_id, fecha) do update set meta_alcanzada = true;

  return query select public.racha_diaria_de(v_user);
end;
$$;

revoke execute on function public.registrar_partida_zen(text, integer) from public, anon;
grant execute on function public.registrar_partida_zen(text, integer) to authenticated;
