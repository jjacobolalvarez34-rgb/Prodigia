-- ============================================================
-- Prodigia — la recompensa de la misión semanal del clan se RECLAMA con un botón
-- (pedido del usuario, 2026-09-25: "agrega un botón para reclamar").
--
-- Requiere 0239 (la misión pasa a 3000 Exp y el trigger deja de pagar solo).
--
--   - clan_mision_reclamos: quién ya cobró cada misión (una fila por miembro y
--     misión). Sin policies: solo la tocan las funciones de abajo.
--   - reclamar_mision_clan(): si la misión de esta semana de tu clan está
--     cumplida y no la cobraste, te acredita las Chispas de la recompensa. No
--     suma a la Experiencia (son Chispas, no se ganaron practicando). Aunque el
--     trigger no haya marcado la misión como cumplida (p. ej. la migración 0239
--     dejó el progreso en la meta), aquí se comprueba el progreso y se marca.
--   - mision_actual_de_clan(): devuelve además `reclamada` (si TÚ ya cobraste).
-- ============================================================

create table if not exists public.clan_mision_reclamos (
  mision_id uuid not null references public.clan_misiones(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reclamado_at timestamptz not null default now(),
  primary key (mision_id, user_id)
);

alter table public.clan_mision_reclamos enable row level security;

create or replace function public.reclamar_mision_clan()
returns table (out_chispas integer, out_puntos_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_clan_id uuid;
  v_mision record;
  v_puntos integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select cmb.clan_id into v_clan_id from public.clan_membresias cmb where cmb.user_id = v_user;
  if v_clan_id is null then
    raise exception 'no perteneces a un clan';
  end if;

  select * into v_mision from public.clan_misiones cm
  where cm.clan_id = v_clan_id and cm.semana_inicio = date_trunc('week', current_date)::date
  for update;

  if v_mision.id is null then
    raise exception 'tu clan no tiene misión esta semana';
  end if;
  if v_mision.progreso_actual < v_mision.objetivo_cantidad then
    raise exception 'la misión todavía no está cumplida';
  end if;

  if not v_mision.completada then
    update public.clan_misiones set completada = true where id = v_mision.id;
  end if;

  insert into public.clan_mision_reclamos (mision_id, user_id)
  values (v_mision.id, v_user)
  on conflict do nothing;
  if not found then
    raise exception 'ya reclamaste esta recompensa';
  end if;

  update public.profiles pr set puntos_total = pr.puntos_total + v_mision.recompensa_chispas
    where pr.id = v_user
    returning pr.puntos_total into v_puntos;

  return query select v_mision.recompensa_chispas, v_puntos;
end;
$$;

revoke execute on function public.reclamar_mision_clan() from public, anon;
grant execute on function public.reclamar_mision_clan() to authenticated;

drop function if exists public.mision_actual_de_clan(uuid);

create function public.mision_actual_de_clan(p_clan_id uuid)
returns table (
  id uuid, objetivo_cantidad integer, progreso_actual integer, recompensa_chispas integer,
  completada boolean, semana_inicio date, reclamada boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.clan_membresias cmb where cmb.clan_id = p_clan_id and cmb.user_id = auth.uid()
  ) then
    raise exception 'no eres miembro de este clan';
  end if;

  return query
    select cm.id, cm.objetivo_cantidad, cm.progreso_actual, cm.recompensa_chispas, cm.completada, cm.semana_inicio,
      exists (select 1 from public.clan_mision_reclamos r where r.mision_id = cm.id and r.user_id = auth.uid())
    from public.clan_misiones cm
    where cm.clan_id = p_clan_id
    order by cm.semana_inicio desc
    limit 1;
end;
$$;

revoke execute on function public.mision_actual_de_clan(uuid) from public, anon;
grant execute on function public.mision_actual_de_clan(uuid) to authenticated;

notify pgrst, 'reload schema';
