-- ============================================================
-- Prodigia — Cierre de huecos de seguridad Fase 5 (auditoría de
-- 2026-09-07, docs/audits/MASTER-AUDIT.md). Correr después de
-- 0114_push_notifications.sql.
--
-- Tres fixes de bajo riesgo (ceros cambios de comportamiento para el
-- flujo legítimo) + los hallazgos CRÍTICOS de economía quedan
-- DOCUMENTADOS con severidad, no tocados acá (requieren reproducción
-- contra una base real antes de cambiar el contrato — ver
-- MASTER-AUDIT.md sección "RLS y seguridad").
--
-- 1. handle_new_user (0112) volvió a quedar `security definer` SIN
--    `set search_path = public` — la misma regresión que 0060 ya había
--    arreglado para la versión anterior. Redefinir agregando la línea:
--    defensa en profundidad, sin cambio de comportamiento.
-- 2. friendships.estado: la policy de INSERT solo exigía
--    `auth.uid() = user_id`, así que un cliente podía insertar filas
--    directo con estado `aceptada` (amistad inmediata sin que el otro
--    acepte). Se pide `estado = 'pendiente'`. `conectar_por_invitacion`
--    (0063) inserta en `aceptada` pero es security definer → bypasea
--    RLS por diseño, no se rompe.
-- 3. acreditar_chispas (0070, S10): funcionaba como security definer
--    con grant a authenticated y aceptaba `p_user_id` de CUALQUIER
--    usuario sin validar `auth.uid()` → un cliente podía acreditarse
--    Chispas ilimitadas (p_monto arbitrario, + nivel/xp_historico/
--    clan) o restar Chispas a un tercero con p_monto negativo. La app NUNCA la
--    llama desde el cliente (grep: solo referencia en comentario); la
--    usan internamente registrar_xp_diario y completar_reto_diario,
--    ambas pasándole auth.uid(). Se agrega el guard y se revoca el
--    grant del cliente: el uso interno (mismo dueño) sigue intacto.
-- ============================================================

-- ---------- 1) handle_new_user: security definer con search_path fijo ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.is_anonymous then
    insert into public.profiles (id, display_name, nombre_generado)
    values (new.id, 'Invitado' || upper(substr(replace(new.id::text, '-', ''), 1, 6)), true);
  else
    insert into public.profiles (id, display_name)
    values (new.id, new.raw_user_meta_data->>'name');
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------- 2) friendships: solo se puede insertar una solicitud en 'pendiente' ----------
drop policy if exists "usuarios crean solicitudes propias" on public.friendships;
create policy "usuarios crean solicitudes propias"
  on public.friendships for insert
  with check (auth.uid() = user_id and estado = 'pendiente');

-- ---------- 3) acreditar_chispas: solo para el usuario autenticado ----------
create or replace function public.acreditar_chispas(p_user_id uuid, p_monto integer)
returns table (nivel_subio boolean, nivel_nuevo integer, bonus_nivel integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clan_id uuid;
  v_nivel_anterior integer;
  v_xp_nuevo bigint;
  v_nivel_nuevo integer;
  v_bonus integer := 0;
  v_subio boolean := false;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'no autorizado';
  end if;

  update public.profiles set puntos_total = puntos_total + p_monto where id = p_user_id;

  if p_monto > 0 then
    select nivel_cuenta into v_nivel_anterior from public.profiles where id = p_user_id;

    update public.profiles set xp_historico_total = xp_historico_total + p_monto
      where id = p_user_id
      returning xp_historico_total into v_xp_nuevo;

    v_nivel_nuevo := public.nivel_desde_xp_cuenta(v_xp_nuevo);

    if v_nivel_nuevo > v_nivel_anterior then
      v_subio := true;
      v_bonus := 50 * v_nivel_nuevo;
      update public.profiles set nivel_cuenta = v_nivel_nuevo, puntos_total = puntos_total + v_bonus
        where id = p_user_id;
    end if;

    select clan_id into v_clan_id from public.clan_membresias where user_id = p_user_id;
    if v_clan_id is not null then
      update public.clan_membresias set xp_aportado = xp_aportado + p_monto where user_id = p_user_id;
      update public.clanes set xp_acumulado_historico = xp_acumulado_historico + p_monto where id = v_clan_id;
    end if;
  end if;

  return query select v_subio, coalesce(v_nivel_nuevo, v_nivel_anterior), v_bonus;
end;
$$;

revoke execute on function public.acreditar_chispas(uuid, integer) from public, authenticated;