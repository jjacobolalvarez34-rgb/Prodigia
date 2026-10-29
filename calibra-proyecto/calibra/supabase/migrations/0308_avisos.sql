-- ============================================================
-- Prodigia — Avisos a la hora de cada jugador (2026-10-29, pedido «agregar y
-- mejorar las notificaciones»; calibra/docs/avance/NOTIFICACIONES.md).
--
-- 1) device_push_tokens.zona_horaria: la zona IANA del teléfono (p. ej.
--    'America/Bogota', 'Europe/Madrid'). La app la manda al registrar el token y
--    la Edge Function racha-en-riesgo la usa para avisar a la hora local de cada
--    uno (nunca de 21:00 a 08:00) y no a la de Colombia para todo el mundo.
-- 2) actualizar_zona_push(p_token, p_zona): igual que actualizar_categorias_push
--    (0243), solo el dueño del token puede cambiarla.
--
-- Sin esta migración todo sigue andando: la app ignora el error de la función y
-- racha-en-riesgo usa la zona por defecto (secret ZONA_HORARIA).
-- Requiere 0114 (device_push_tokens) y 0243. Idempotente.
-- ============================================================

alter table public.device_push_tokens
  add column if not exists zona_horaria text;

create or replace function public.actualizar_zona_push(p_token text, p_zona text)
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
  -- Solo nombres IANA razonables ('Area/Ciudad', 'UTC'); si no, se guarda null.
  if p_zona is not null and (char_length(p_zona) > 64 or p_zona !~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$') then
    p_zona := null;
  end if;
  -- Que Postgres la conozca (si no, la Edge Function caería en la de por defecto).
  if p_zona is not null and not exists (select 1 from pg_timezone_names where name = p_zona) then
    p_zona := null;
  end if;

  update public.device_push_tokens dpt
  set zona_horaria = p_zona,
      updated_at = now()
  where dpt.token = p_token and dpt.user_id = v_user;
end;
$$;

revoke execute on function public.actualizar_zona_push(text, text) from public, anon;
grant execute on function public.actualizar_zona_push(text, text) to authenticated;

notify pgrst, 'reload schema';
