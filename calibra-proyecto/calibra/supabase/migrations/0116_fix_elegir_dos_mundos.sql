-- 0116: Fix "elegir 2 mundos iniciales" trabado
--
-- Contexto: el onboarding nuevo (0112) elige 2 mundos gratis con
-- elegir_mundos_iniciales. El guard viejo rechazaba cualquier cuenta con
-- `cardinality(mundos_desbloqueados) > 0`, pero la fase vieja de UN solo
-- mundo gratis dejaba a muchas cuentas en `['numeria']` (1 elemento) —
-- estados heredados que el flujo nuevo no sabía reparar:
--   - elegir_mundos_iniciales lanzaba "ya elegiste tus mundos iniciales"
--     aunque el onboarding nunca se completó (cardinalidad = 1);
--   - el cliente mostraba el error y se quedaba trabado sin salida;
--   - al recargar, la home mostraba solo "numeria" como desbloqueado.
-- Fix: cardinalidad 1 ahora se AUTO-REPARA reemplazando el estado heredado
-- con los 2 mundos elegidos; solo se bloquea el re-uso si ya hay 2+ (esa
-- cuenta ya completó el flujo). Sin cambio de comportamiento legítimo:
-- cuentas nuevas (0) y completas (2+) se comportan igual que antes.

create or replace function public.elegir_mundos_iniciales(p_mundos text[])
returns table (mundos_desbloqueados text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_actuales text[];
  v_validos constant text[] := array['numeria', 'geografia', 'enigmia', 'quimia', 'anatomia', 'melodia', 'trigonometria', 'historia'];
  v_mundo text;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if cardinality(p_mundos) <> 2 then
    raise exception 'elegí exactamente 2 mundos';
  end if;
  if p_mundos[1] = p_mundos[2] then
    raise exception 'elegí 2 mundos distintos';
  end if;
  foreach v_mundo in array p_mundos loop
    if not (v_mundo = any(v_validos)) then
      raise exception 'mundo invalido';
    end if;
  end loop;

  select pr.mundos_desbloqueados into v_actuales from public.profiles pr where pr.id = v_user;

  -- >= 2 = ya pasó por el flujo de 2 mundos. 1 = estado heredado de la
  -- fase antigua (1 mundo gratis) → se reemplaza abajo con la elección.
  if cardinality(v_actuales) >= 2 then
    raise exception 'ya elegiste tus mundos iniciales';
  end if;

  update public.profiles as pr
  set mundos_desbloqueados = p_mundos
  where pr.id = v_user;

  return query
    select pr.mundos_desbloqueados
    from public.profiles pr where pr.id = v_user;
end;
$$;

-- RPC legacy singular de 1 mundo (F-M1 del AUDIT-MAPA-2026-09-07): la app
-- solo llama elegir_mundos_iniciales (plural). Se revoca para que ningún
-- cliente pueda volver a dejar la cuenta en el estado heredado de 1 mundo.
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'elegir_mundo_inicial'
      and pg_get_function_identity_arguments(p.oid) = 'text'
  ) then
    revoke execute on function public.elegir_mundo_inicial(text) from public, authenticated;
  end if;
end $$;