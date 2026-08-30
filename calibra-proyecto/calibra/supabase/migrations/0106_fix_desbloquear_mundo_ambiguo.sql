-- ============================================================
-- URGENTE — bug real reportado en vivo: "no se pudo comprar" al
-- intentar desbloquear un mundo con Chispas (usuario con saldo de
-- sobra, ej. 7000 Chispas contra un costo de 3000).
--
-- Reproducido de verdad contra la base ya migrada (cuenta QA, saldo
-- 7000, quimia removida de mundos_desbloqueados, mismo escenario que
-- reportó el usuario) antes de tocar nada:
--   rpc("desbloquear_mundo", { p_mundo: "quimia" })
--   → 42702 "column reference \"puntos_total\" is ambiguous"
--
-- Mismo patrón exacto que ya rompió enviar_mensaje_clan()
-- (0100_fix_chat_clan_y_progreso_nivel.sql, "created_at" ambiguo):
-- `returns table (puntos_total integer, mundos_desbloqueados text[])`
-- crea variables OUT implícitas con esos nombres en el scope de la
-- función — el `select puntos_total, mundos_desbloqueados into
-- v_saldo, v_actuales from public.profiles where id = v_user;` de
-- adentro queda ambiguo entre esas variables OUT y las columnas
-- homónimas de profiles. Postgres no lo rechaza al crear la función
-- (nada de esto se valida hasta la primera ejecución real), así que
-- pasó cualquier `syntax check` superficial y solo se manifestó al
-- correrla — exactamente por qué "revisé el código, se ve bien" no
-- alcanza acá.
--
-- elegir_mundo_inicial (mismo archivo, 0097) tiene el mismo bug en la
-- misma forma (`select mundos_desbloqueados into v_actuales from
-- public.profiles where id = v_user;`) — reproducido también, aparte:
-- la RPC ni siquiera existe hoy contra la base real (PGRST202, "no
-- encontrada en el schema cache"), así que el paso de onboarding "elegí
-- tu mundo gratis" está roto de raíz para cualquier cuenta nueva, no
-- solo con el bug de ambigüedad — probablemente 0097 nunca se corrió
-- completa. Este `create or replace` la deja creada y arreglada de una,
-- sin depender de reconstruir qué pasó.
--
-- Fix: alias + calificar todas las referencias a columnas de profiles
-- dentro de las dos funciones (mismo criterio que ya se usó para
-- enviar_mensaje_clan). Ningún otro comportamiento cambia.
-- ============================================================

create or replace function public.elegir_mundo_inicial(p_mundo text)
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
    raise exception 'mundo invalido';
  end if;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  if cardinality(v_actuales) > 0 then
    raise exception 'ya elegiste tu mundo inicial';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = array[p_mundo]
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.elegir_mundo_inicial(text) to authenticated;

create or replace function public.desbloquear_mundo(p_mundo text)
returns table (puntos_total integer, mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_saldo integer;
  v_actuales text[];
  v_costo constant integer := 3000;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_mundo not in ('numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia') then
    raise exception 'mundo invalido';
  end if;

  select pr.puntos_total, pr.mundos_desbloqueados into v_saldo, v_actuales
  from public.profiles pr where pr.id = v_user;

  if p_mundo = any(v_actuales) then
    raise exception 'ya tenés ese mundo desbloqueado';
  end if;
  if v_saldo < v_costo then
    raise exception 'te faltan Chispas — % cuesta % Chispas', p_mundo, v_costo;
  end if;

  update public.profiles as pr
  set puntos_total = pr.puntos_total - v_costo,
      mundos_desbloqueados = array_append(pr.mundos_desbloqueados, p_mundo)
  where pr.id = v_user;

  return query
    select pr.puntos_total, pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

grant execute on function public.desbloquear_mundo(text) to authenticated;
