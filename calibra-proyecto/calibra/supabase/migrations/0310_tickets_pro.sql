-- ============================================================
-- 0310 — Prueba gratis de Pro con tickets (docs/avance/TICKETS_PRO.md).
--
-- Cada jugador empieza con 3 tickets (profiles.tickets_pro, también los que ya
-- existen). Abrir una Clase Pro (techniques/logic_techniques con requiere_pro)
-- sin ser Pro gasta 1 ticket y la deja abierta para ese jugador para siempre
-- (clases_con_ticket). Cuando se acaban, la clase pide hacerse Pro.
--
--   1. columna profiles.tickets_pro (3 por defecto, nunca negativa). No se da
--      permiso de UPDATE sobre ella: solo la cambia usar_ticket_clase.
--   2. tabla clases_con_ticket (el jugador solo puede leer las suyas; no hay
--      INSERT para authenticated: solo entra por la función).
--   3. usar_ticket_clase(p_tecnica): descuenta 1 y desbloquea, una sola vez por
--      clase; si ya estaba abierta, si el jugador es Pro o si la lección no es
--      Pro, no gasta nada.
--   4. completar_leccion (última definición: 0246) acepta también las clases
--      abiertas con ticket. /api/aprender/completar y
--      /api/enigmia/completar-leccion hacen lo mismo en la web.
-- Idempotente: se puede correr más de una vez.
-- ============================================================

alter table public.profiles
  add column if not exists tickets_pro integer not null default 3 check (tickets_pro >= 0);

create table if not exists public.clases_con_ticket (
  user_id uuid not null references auth.users (id) on delete cascade,
  tecnica_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tecnica_id)
);

alter table public.clases_con_ticket enable row level security;

drop policy if exists "clases_con_ticket: leer las propias" on public.clases_con_ticket;
create policy "clases_con_ticket: leer las propias"
  on public.clases_con_ticket for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.clases_con_ticket from anon, authenticated;
grant select on public.clases_con_ticket to authenticated;

create or replace function public.usar_ticket_clase(p_tecnica uuid)
returns table (desbloqueada boolean, restantes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_requiere_pro boolean;
  v_plan text;
  v_tickets integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select coalesce(t.requiere_pro, false) into v_requiere_pro from public.techniques t where t.id = p_tecnica;
  if v_requiere_pro is null then
    select coalesce(t.requiere_pro, false) into v_requiere_pro from public.logic_techniques t where t.id = p_tecnica;
  end if;
  if v_requiere_pro is null then
    raise exception 'lección no encontrada';
  end if;

  -- Bloquea la fila del jugador: dos toques seguidos no gastan dos tickets.
  select pr.plan, pr.tickets_pro into v_plan, v_tickets
  from public.profiles pr where pr.id = v_user
  for update;
  if v_tickets is null then
    raise exception 'perfil no encontrado';
  end if;

  if not v_requiere_pro or v_plan = 'pro'
     or exists (select 1 from public.clases_con_ticket c where c.user_id = v_user and c.tecnica_id = p_tecnica) then
    return query select true, v_tickets;
    return;
  end if;

  if v_tickets <= 0 then
    return query select false, 0;
    return;
  end if;

  update public.profiles set tickets_pro = tickets_pro - 1 where id = v_user;
  insert into public.clases_con_ticket (user_id, tecnica_id) values (v_user, p_tecnica)
  on conflict do nothing;

  return query select true, v_tickets - 1;
end;
$$;

revoke all on function public.usar_ticket_clase(uuid) from public, anon;
grant execute on function public.usar_ticket_clase(uuid) to authenticated;

create or replace function public.completar_leccion(p_tabla text, p_technique_id uuid, p_respuestas text[] default null)
returns table (aprobado boolean, incorrectas integer[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_contenido jsonb;
  v_contenido_en jsonb;
  v_requiere_pro boolean;
  v_quiz jsonb;
  v_quiz_en jsonb;
  v_total integer;
  v_malas integer[] := '{}';
  v_resp text;
  i integer;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  if p_tabla = 'techniques' then
    select t.contenido, t.contenido_en, coalesce(t.requiere_pro, false)
      into v_contenido, v_contenido_en, v_requiere_pro
    from public.techniques t where t.id = p_technique_id;
  elsif p_tabla = 'logic_techniques' then
    select t.contenido, t.contenido_en, coalesce(t.requiere_pro, false)
      into v_contenido, v_contenido_en, v_requiere_pro
    from public.logic_techniques t where t.id = p_technique_id;
  else
    raise exception 'tabla de lecciones inválida';
  end if;

  if v_contenido is null then
    raise exception 'lección no encontrada';
  end if;

  v_quiz := coalesce(v_contenido->'quiz', '[]'::jsonb);
  v_quiz_en := v_contenido_en->'quiz';
  if jsonb_typeof(v_quiz) <> 'array' then
    v_quiz := '[]'::jsonb;
  end if;
  v_total := jsonb_array_length(v_quiz);

  if v_total > 0 then
    -- 0310: una clase abierta con ticket vale como Pro.
    if v_requiere_pro
       and not exists (select 1 from public.profiles pr where pr.id = v_user and pr.plan = 'pro')
       and not exists (select 1 from public.clases_con_ticket c where c.user_id = v_user and c.tecnica_id = p_technique_id) then
      raise exception 'esta lección requiere plan Pro';
    end if;

    for i in 0 .. v_total - 1 loop
      v_resp := case when p_respuestas is not null and array_length(p_respuestas, 1) >= i + 1 then p_respuestas[i + 1] else null end;
      if v_resp is null
        or not (
          v_resp = (v_quiz->i->>'respuesta')
          or (v_quiz_en is not null and jsonb_typeof(v_quiz_en) = 'array' and v_resp = (v_quiz_en->i->>'respuesta'))
        ) then
        v_malas := array_append(v_malas, i);
      end if;
    end loop;

    if coalesce(array_length(p_respuestas, 1), 0) <> v_total or array_length(v_malas, 1) > 0 then
      return query select false, v_malas;
      return;
    end if;
  end if;

  if p_tabla = 'techniques' then
    insert into public.technique_progress as tp (user_id, technique_id, dominado, intentos, updated_at)
    values (v_user, p_technique_id, true, 1, now())
    on conflict (user_id, technique_id)
    do update set dominado = true, intentos = tp.intentos + 1, updated_at = now();

    insert into public.unlocked_modifiers (user_id, modifier_id)
    select v_user, tm.modifier_id
    from public.technique_modifiers tm
    where tm.technique_id = p_technique_id
    on conflict do nothing;
  else
    insert into public.logic_technique_progress as tp (user_id, technique_id, dominado, intentos, updated_at)
    values (v_user, p_technique_id, true, 1, now())
    on conflict (user_id, technique_id)
    do update set dominado = true, intentos = tp.intentos + 1, updated_at = now();
  end if;

  return query select true, '{}'::integer[];
end;
$$;

grant execute on function public.completar_leccion(text, uuid, text[]) to authenticated;
