-- ============================================================
-- Prodigia — Cierre de 4 hallazgos IDOR de la auditoría de seguridad
-- de esta sesión (docs/audits/RECOVERY-CHANGELOG.md sección 10).
-- Código PRE-EXISTENTE (de antes del baseline, no de opencode).
-- ============================================================

-- ---------- 1) conectar_por_invitacion: el UUID del usuario no es un secreto ----------
-- buscar_usuarios(p_query) (0021_amigos.sql) permite resolver
-- display_name -> id de CUALQUIER usuario. conectar_por_invitacion
-- (0063) trataba "conocer el id" como prueba de haber recibido un link
-- de invitación real, e insertaba la amistad directo en 'aceptada' —
-- cualquiera podía forzarle a cualquier otro usuario una amistad
-- "aceptada" sin su consentimiento, solo buscándolo por nombre.
--
-- FIX: token de invitación propio, opaco, separado del id real.
alter table public.profiles add column if not exists token_invitacion uuid not null default gen_random_uuid();
create unique index if not exists profiles_token_invitacion_key on public.profiles (token_invitacion);

create or replace function public.conectar_por_invitacion(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_inviter_id uuid;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_token is null then
    return; -- invitación inválida — silencioso, mismo criterio que antes
  end if;

  select id into v_inviter_id from public.profiles where token_invitacion = p_token;

  if v_inviter_id is null or v_inviter_id = v_user then
    return; -- token viejo/inválido o auto-invitación — silencioso
  end if;

  insert into public.friendships (user_id, friend_id, estado)
  values (v_inviter_id, v_user, 'aceptada')
  on conflict (user_id, friend_id) do update set estado = 'aceptada';
end;
$$;

grant execute on function public.conectar_por_invitacion(uuid) to authenticated;

-- ---------- 2) es_miembro_de_grupo / es_profesor_del_grupo: oráculo de membresía ajena ----------
-- Se crearon como helper interno de 2 policies de RLS (0023), que las
-- llaman siempre como es_miembro_de_grupo(id, auth.uid()) — el segundo
-- parámetro SIEMPRE es auth.uid() en el único uso real. Pero como
-- tienen grant a authenticated, cualquier cliente podía invocarlas
-- directo con el id de OTRO usuario y confirmar su membresía/rol en
-- grupos ajenos (fuga de información, sin escritura).
--
-- FIX: ignoran el p_user_id que reciben y usan auth.uid() directo —
-- mismo comportamiento para las 2 policies que ya las llamaban con
-- auth.uid(), imposible de usar para consultar sobre un tercero.
create or replace function public.es_miembro_de_grupo(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = auth.uid()
  );
$$;

create or replace function public.es_profesor_del_grupo(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.groups g
    where g.id = p_group_id and g.profesor_id = auth.uid()
  );
$$;

-- ---------- 3) mision_actual_de_clan / asegurar_mision_semanal: sin chequeo de membresía ----------
-- El cliente siempre las llama con el clan propio, pero al ser RPCs
-- directas con grant a authenticated, nada impedía pasar el id de un
-- clan ajeno y leer (o disparar la creación de) su misión semanal.
create or replace function public.asegurar_mision_semanal(p_clan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lunes date := date_trunc('week', current_date)::date;
begin
  if not exists (
    select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = auth.uid()
  ) then
    raise exception 'no eres miembro de este clan';
  end if;

  insert into public.clan_misiones (clan_id, objetivo_tipo, objetivo_cantidad, recompensa_chispas, semana_inicio)
  values (p_clan_id, 'problemas_resueltos', 500, 150, v_lunes)
  on conflict (clan_id, semana_inicio) do nothing;
end;
$$;

create or replace function public.mision_actual_de_clan(p_clan_id uuid)
returns table (id uuid, objetivo_cantidad integer, progreso_actual integer, recompensa_chispas integer, completada boolean, semana_inicio date)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.clan_membresias where clan_id = p_clan_id and user_id = auth.uid()
  ) then
    raise exception 'no eres miembro de este clan';
  end if;

  return query
    select cm.id, cm.objetivo_cantidad, cm.progreso_actual, cm.recompensa_chispas, cm.completada, cm.semana_inicio
    from public.clan_misiones cm
    where cm.clan_id = p_clan_id
    order by cm.semana_inicio desc
    limit 1;
end;
$$;

-- ---------- 4) xp_real_por_mundo: helper interno, nunca debió tener grant a authenticated ----------
-- Solo lo llaman otras funciones security definer (registrar_progreso_mundo,
-- detalle_nivel_mundo) con un p_user_id ya resuelto server-side — nunca
-- el cliente directo (confirmado por grep en src/). Revocar el grant no
-- afecta esas llamadas internas (una función security definer siempre
-- puede llamar a otra sin importar los grants de rol).
revoke execute on function public.xp_real_por_mundo(uuid, text) from authenticated, public;

notify pgrst, 'reload schema';
